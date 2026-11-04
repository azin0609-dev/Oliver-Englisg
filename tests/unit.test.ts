import { describe, it, expect } from 'vitest';
import {
  allMaterials,
  dialogueLines,
  dialogues,
  materialById,
  sentences,
  tasks,
  words,
} from '../src/data';
import { categories } from '../src/data/categories';
import {
  exportBackup,
  freshData,
  parseBackup,
  recordPractice,
  validateData,
  weeklySummary,
} from '../src/lib/storage';
import { dailyPlan, planIds, searchMaterials } from '../src/lib/recommendations';
import { localDate, weekStart } from '../src/lib/dates';
const now = new Date(2026, 10, 4, 12);
describe('real, structured teaching content', () => {
  it('includes 126 words, 112 sentences, 30 conversations and 20 physical activities', () => {
    expect(words.length).toBe(126);
    expect(sentences.length).toBe(112);
    expect(dialogues.length).toBe(30);
    expect(tasks.length).toBe(20);
    expect(new Set(words.map((w) => w.english.toLowerCase())).size).toBe(words.length);
    expect(new Set(sentences.map((s) => s.english.toLowerCase())).size).toBe(sentences.length);
  });
  it('gives every item a unique ID and meaningful required fields', () => {
    const items = [...allMaterials, ...dialogueLines];
    expect(new Set(items.map((m) => m.id)).size).toBe(items.length);
    for (const item of items) {
      for (const field of [
        'id',
        'english',
        'traditionalChinese',
        'parentTip',
        'suggestedReply',
      ] as const)
        expect(item[field].length, `${item.id}.${field}`).toBeGreaterThan(0);
      expect(categories.some((c) => c.id === item.category)).toBe(true);
      expect([1, 2, 3]).toContain(item.difficulty);
      expect(item.tags.length).toBeGreaterThan(0);
    }
  });
  it('covers all ten contexts with ten sentences, three 6-turn conversations and two tasks', () => {
    for (const c of categories) {
      expect(sentences.filter((s) => s.category === c.id)).toHaveLength(
        c.id === 'toys'
          ? 18
          : c.id === 'friends'
            ? 12
            : c.id === 'feelings' || c.id === 'tidy'
              ? 11
              : 10,
      );
      expect(dialogues.filter((s) => s.category === c.id)).toHaveLength(3);
      expect(tasks.filter((s) => s.category === c.id)).toHaveLength(2);
    }
    for (const d of dialogues) {
      expect(d.turns).toHaveLength(6);
      expect(d.turns.map((t) => t.role)).toEqual([
        'parent',
        'child',
        'parent',
        'child',
        'parent',
        'child',
      ]);
    }
    expect(words.find((w) => w.traditionalChinese === '收銀機')?.english).toBe('cash register');
  });
  it.each([
    '快去刷牙',
    '不要丟玩具',
    '你想吃什麼',
    '把恐龍放回盒子',
    'Are you hungry?',
    'DINOSAUR',
    'cash register',
  ])('searches the real phrase %s', (q) => {
    expect(searchMaterials(q).length).toBeGreaterThan(0);
  });
  it('does not fabricate translations for unknown searches', () => {
    expect(searchMaterials('xyzzynotincatalog')).toEqual([]);
    expect(searchMaterials(' ? ')).toEqual([]);
  });
});
describe('device data, observations and backup validation', () => {
  it('exports and imports settings, favorites, progress and history without losing information', () => {
    let data = recordPractice(freshData(), sentences[0].id, 2, now);
    data.records[sentences[0].id].favorite = true;
    data.settings.nickname = '小冒險家';
    expect(parseBackup(exportBackup(data))).toEqual(data);
  });
  it('counts repeated practice but deduplicates the weekly sentence total', () => {
    let data = freshData();
    for (let i = 0; i < 4; i++) data = recordPractice(data, sentences[0].id, 1, now);
    data = recordPractice(data, sentences[0].id, 3, now);
    data = recordPractice(data, sentences[1].id, 2, now);
    data = recordPractice(data, sentences[2].id, 0, now);
    data = recordPractice(data, words[0].id, undefined, now);
    expect(data.records[sentences[0].id].practiceCount).toBe(5);
    expect(data.history).toHaveLength(4);
    expect(weeklySummary(data, now)).toMatchObject({ total: 3, counts: [1, 0, 1, 1] });
  });
  it('tracks each conversation line independently and excludes whole-conversation titles from sentence totals', () => {
    let data = recordPractice(freshData(), dialogues[0].id, 2, now);
    data = recordPractice(data, dialogueLines[0].id, 1, now);
    expect(weeklySummary(data, now)).toMatchObject({ total: 1, counts: [0, 1, 0, 0] });
  });
  it('uses the local calendar and a Monday week boundary', () => {
    expect(localDate(now)).toBe('2026-11-04');
    expect(weekStart(now)).toBe('2026-11-02');
    expect(weekStart(new Date(2026, 10, 8, 23))).toBe('2026-11-02');
    const data = recordPractice(freshData(), sentences[0].id, 1, new Date(2026, 10, 1));
    expect(weeklySummary(data, now).total).toBe(0);
  });
  it.each([
    null,
    {},
    { app: 'other', version: 1 },
    { app: 'olivers-english-adventure', version: 2 },
  ])('rejects unsupported backup envelopes', (value) => {
    expect(() => parseBackup(JSON.stringify(value))).toThrow();
  });
  it('rejects malformed JSON and oversized backups', () => {
    expect(() => parseBackup('{bad')).toThrow('JSON');
    expect(() => parseBackup('x'.repeat(2 * 1024 * 1024 + 1))).toThrow('2 MB');
  });
  it('rejects corrupt nested states, impossible dates, unknown IDs and prototype injection', () => {
    const invalid = freshData();
    invalid.settings.classDays = [8];
    expect(() => validateData(invalid)).toThrow();
    invalid.settings.classDays = [3, 3];
    expect(() => validateData(invalid)).toThrow();
    invalid.settings.classDays = [3, 5];
    invalid.history = [{ id: sentences[0].id, date: '2026-02-30' }];
    expect(() => validateData(invalid)).toThrow();
    invalid.history = [];
    invalid.records['unknown-id'] = {
      mastery: 0,
      favorite: false,
      practiceCount: 0,
      lastPracticed: null,
    };
    expect(() => validateData(invalid)).toThrow();
    const payload = exportBackup(freshData()).replace(
      '"records": {}',
      '"records": {"__proto__":{"mastery":0,"favorite":true,"practiceCount":1,"lastPracticed":null}}',
    );
    expect(() => parseBackup(payload)).toThrow();
    expect(Object.prototype).not.toHaveProperty('favorite');
  });
});
describe('gentle daily recommendations', () => {
  it('is deterministic and contains exactly 3 words, 2 sentences, a dialogue and an action', () => {
    const data = freshData();
    data.daily.date = localDate(now);
    const plan = dailyPlan(data, now);
    expect(plan).toEqual(dailyPlan(data, now));
    expect(plan.words).toHaveLength(3);
    expect(plan.sentences).toHaveLength(2);
    expect(new Set(planIds(plan)).size).toBe(7);
    expect(planIds(plan).every((id) => materialById[id])).toBe(true);
    expect(plan.classroom).toBe(true);
    expect(plan.theme).toBe('toys');
  });
  it('keeps the saved plan stable after observations and a full reload', () => {
    let data = freshData();
    data.daily.date = localDate(now);
    const original = dailyPlan(data, now);
    data.daily.selection = planIds(original);
    expect(dailyPlan(data, now).theme).toBe(original.theme);
    data = recordPractice(data, data.daily.selection[0], 3, now);
    expect(planIds(dailyPlan(parseBackup(exportBackup(data)), now))).toEqual(data.daily.selection);
  });
  it('provides a different group when parents replace it and honors custom class days', () => {
    const data = freshData();
    data.daily.date = localDate(now);
    const first = planIds(dailyPlan(data, now));
    data.daily.seed++;
    expect(planIds(dailyPlan(data, now))).not.toEqual(first);
    data.settings.classDays = [];
    expect(dailyPlan(data, now).classroom).toBe(false);
  });
  it('allocates five familiar slots and two new slots when every pool has enough familiar material', () => {
    const data = freshData();
    data.daily.date = localDate(now);
    data.settings.difficulty = 2;
    for (const pool of [words, sentences, dialogues, tasks])
      for (const item of pool.filter((m) => m.difficulty <= 2).filter((_, i) => i % 2 === 0))
        data.records[item.id] = {
          mastery: 1,
          favorite: false,
          practiceCount: 1,
          lastPracticed: '2026-10-15T12:00:00.000Z',
        };
    const ids = planIds(dailyPlan(data, now));
    expect(ids.filter((id) => data.records[id]?.mastery > 0)).toHaveLength(5);
  });
  it('selects mostly listening and response material for an initial Level 2 learner', () => {
    const data = freshData();
    data.daily.date = localDate(now);
    const items = planIds(dailyPlan(data, now)).map((id) => materialById[id]);
    expect(items.filter((i) => i.difficulty <= 2).length).toBeGreaterThanOrEqual(5);
  });
});
