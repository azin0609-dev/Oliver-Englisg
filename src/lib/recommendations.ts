import type { AppData, Material } from '../types';
import { words, sentences, dialogues, tasks } from '../data';
import { categories } from '../data/categories';
import { localDate } from './dates';
function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function dailyPlan(data: AppData, now = new Date()) {
  const date = localDate(now);
  const seed = data.daily.date === date ? data.daily.seed : 0;
  const key = `${date}:${seed}`;
  const classroom = data.settings.classDays.includes(now.getDay());
  const theme = classroom
    ? 'toys'
    : categories[
        (Math.floor(new Date(`${date}T12:00:00`).getTime() / 86400000) + seed) % categories.length
      ].id;
  const selection = data.daily.date === date ? data.daily.selection : [];
  if (selection?.length === 7) {
    const savedWords = selection.slice(0, 3).map((id) => words.find((w) => w.id === id));
    const savedSentences = selection.slice(3, 5).map((id) => sentences.find((s) => s.id === id));
    const savedDialogue = dialogues.find((d) => d.id === selection[5]);
    const savedTask = tasks.find((t) => t.id === selection[6]);
    if (savedWords.every(Boolean) && savedSentences.every(Boolean) && savedDialogue && savedTask) {
      return {
        date,
        theme,
        classroom,
        words: savedWords as typeof words,
        sentences: savedSentences as typeof sentences,
        dialogue: savedDialogue,
        task: savedTask,
      };
    }
  }
  let familiarBudget = 5; // 5 of the 7 items ≈ 70%, when enough familiar items are available.
  function choose<T extends Material>(pool: T[], n: number): T[] {
    const selected: T[] = [];
    for (let slot = 0; slot < n; slot++) {
      const available = pool.filter((m) => !selected.some((s) => s.id === m.id));
      const familiar = available.filter(
        (m) => (data.records[m.id]?.mastery ?? 0) > 0 && m.difficulty <= data.settings.difficulty,
      );
      const fresh = available.filter(
        (m) =>
          !data.records[m.id]?.mastery && m.difficulty <= Math.min(3, data.settings.difficulty + 1),
      );
      const candidates =
        familiarBudget > 0 && familiar.length ? familiar : fresh.length ? fresh : available;
      const ranked = [...candidates].sort(
        (a, b) => score(b) - score(a) || a.id.localeCompare(b.id),
      );
      const choice = ranked[0];
      if (!choice) break;
      selected.push(choice);
      if ((data.records[choice.id]?.mastery ?? 0) > 0) familiarBudget--;
    }
    return selected;
  }
  function score(m: Material) {
    const r = data.records[m.id];
    const age = r?.lastPracticed ? (now.getTime() - Date.parse(r.lastPracticed)) / 86400000 : 14;
    // Recent practice is intentionally downweighted. The date/seed keeps the selection reproducible.
    return (
      (m.category === theme ? 30 : 0) +
      (m.category === 'toys' ? 9 : 0) +
      (m.tags.includes('英文課') && classroom ? 12 : 0) +
      (m.difficulty === data.settings.difficulty
        ? 12
        : m.difficulty < data.settings.difficulty
          ? 9
          : -12) +
      Math.min(14, Math.max(0, age)) * 2 +
      (hash(`${key}:${m.id}`) % 35)
    );
  }
  return {
    date,
    theme,
    classroom,
    words: choose(words, 3),
    sentences: choose(sentences, 2),
    dialogue: choose(dialogues, 1)[0],
    task: choose(tasks, 1)[0],
  };
}
export function searchMaterials(query: string) {
  const normalized = query
    .toLocaleLowerCase()
    .trim()
    .replace(/[?!？！，。.,'’]/g, '');
  if (!normalized) return [];
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return [...sentences, ...words, ...dialogues, ...tasks]
    .filter((m) => {
      const haystack = [m.english, m.traditionalChinese, m.suggestedReply, ...m.tags]
        .join(' ')
        .toLocaleLowerCase()
        .replace(/[?!？！，。.,'’]/g, '');
      return haystack.includes(normalized) || tokens.every((t) => haystack.includes(t));
    })
    .sort(
      (a, b) =>
        Number(b.english.toLowerCase() === query.trim().toLowerCase()) -
        Number(a.english.toLowerCase() === query.trim().toLowerCase()),
    );
}

export function planIds(plan: ReturnType<typeof dailyPlan>): string[] {
  return [
    ...plan.words.map((w) => w.id),
    ...plan.sentences.map((s) => s.id),
    plan.dialogue.id,
    plan.task.id,
  ];
}
