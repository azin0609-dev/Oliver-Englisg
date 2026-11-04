import type { AppData, LearningRecord, Mastery, Settings } from '../types';
import { materialById, trackableSentences } from '../data';
import { isDate, localDate, weekStart } from './dates';
export const STORAGE_KEY = 'oliver-adventure-v1';
export const blankRecord: LearningRecord = {
  mastery: 0,
  favorite: false,
  lastPracticed: null,
  practiceCount: 0,
};
export function freshData(): AppData {
  return {
    version: 1,
    settings: { nickname: 'Oliver', difficulty: 2, voiceURI: '', classDays: [3, 5] },
    records: {},
    history: [],
    daily: { date: localDate(), seed: 0, completed: [], selection: [], skipped: false },
  };
}
function obj(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function integer(n: unknown, max = 1000000): n is number {
  return Number.isInteger(n) && (n as number) >= 0 && (n as number) <= max;
}
function validId(id: string) {
  return Object.hasOwn(materialById, id);
}
function fail(): never {
  throw new Error(
    '備份格式不正確或含有不支援的資料。請選擇由本 App 匯出的 JSON 備份；目前的資料未變更。',
  );
}
export function validateData(value: unknown): AppData {
  if (
    !obj(value) ||
    value.version !== 1 ||
    !obj(value.settings) ||
    !obj(value.records) ||
    !Array.isArray(value.history) ||
    !obj(value.daily)
  )
    return fail();
  const s = value.settings;
  if (
    typeof s.nickname !== 'string' ||
    !s.nickname.trim() ||
    s.nickname.length > 32 ||
    ![1, 2, 3].includes(s.difficulty as number) ||
    typeof s.voiceURI !== 'string' ||
    s.voiceURI.length > 512 ||
    !Array.isArray(s.classDays) ||
    s.classDays.length > 7 ||
    !s.classDays.every((d) => integer(d, 6)) ||
    new Set(s.classDays).size !== s.classDays.length
  )
    return fail();
  const records: Record<string, LearningRecord> = {};
  if (Object.keys(value.records).length > Object.keys(materialById).length) return fail();
  for (const [id, r] of Object.entries(value.records)) {
    if (
      !validId(id) ||
      !obj(r) ||
      !integer(r.mastery, 3) ||
      typeof r.favorite !== 'boolean' ||
      !integer(r.practiceCount) ||
      !(
        r.lastPracticed === null ||
        (typeof r.lastPracticed === 'string' &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.lastPracticed) &&
          !Number.isNaN(Date.parse(r.lastPracticed)) &&
          new Date(r.lastPracticed).toISOString() === r.lastPracticed)
      )
    )
      return fail();
    records[id] = {
      mastery: r.mastery as Mastery,
      favorite: r.favorite,
      practiceCount: r.practiceCount,
      lastPracticed: r.lastPracticed as string | null,
    };
  }
  if (
    value.history.length > 50000 ||
    !value.history.every(
      (e) => obj(e) && typeof e.id === 'string' && validId(e.id) && isDate(e.date),
    )
  )
    return fail();
  const d = value.daily;
  const selection = d.selection ?? [];
  if (
    !Array.isArray(selection) ||
    ![0, 7].includes(selection.length) ||
    !selection.every((id) => typeof id === 'string' && validId(id)) ||
    new Set(selection).size !== selection.length
  )
    return fail();
  if (
    !isDate(d.date) ||
    !integer(d.seed) ||
    typeof d.skipped !== 'boolean' ||
    !Array.isArray(d.completed) ||
    d.completed.length > 7 ||
    !d.completed.every((id) => typeof id === 'string' && validId(id)) ||
    new Set(d.completed).size !== d.completed.length
  )
    return fail();
  return {
    version: 1,
    settings: {
      nickname: s.nickname.trim(),
      difficulty: s.difficulty as Settings['difficulty'],
      voiceURI: s.voiceURI,
      classDays: [...s.classDays] as number[],
    },
    records,
    history: value.history.map((e) => ({ id: e.id, date: e.date })),
    daily: {
      date: d.date,
      seed: d.seed,
      completed: [...d.completed] as string[],
      selection: [...selection] as string[],
      skipped: d.skipped,
    },
  };
}
export function readData(): { data: AppData; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { data: raw ? validateData(JSON.parse(raw)) : freshData(), warning: '' };
  } catch {
    return {
      data: freshData(),
      warning:
        '無法讀取本機紀錄。可能是儲存空間受限或舊資料損壞；原始資料尚未覆寫。你仍可瀏覽教材，建議先檢查或匯入備份。',
    };
  }
}
export function writeData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export function recordPractice(
  data: AppData,
  id: string,
  mastery?: Mastery,
  now = new Date(),
): AppData {
  const record = data.records[id] ?? blankRecord;
  const date = localDate(now);
  const history = data.history.some((e) => e.id === id && e.date === date)
    ? data.history
    : [...data.history, { id, date }].slice(-50000);
  return {
    ...data,
    records: {
      ...data.records,
      [id]: {
        ...record,
        mastery: mastery ?? record.mastery,
        lastPracticed: now.toISOString(),
        practiceCount: record.practiceCount + 1,
      },
    },
    history,
  };
}
export function weeklySummary(data: AppData, now = new Date()) {
  const sentenceIds = new Set(trackableSentences.map((s) => s.id));
  const unique = new Set(
    data.history
      .filter((e) => e.date >= weekStart(now) && e.date <= localDate(now) && sentenceIds.has(e.id))
      .map((e) => e.id),
  );
  const counts = [0, 0, 0, 0];
  for (const id of unique) counts[data.records[id]?.mastery ?? 0]++;
  return { total: unique.size, counts, ids: [...unique] };
}
export function exportBackup(data: AppData): string {
  return JSON.stringify(
    { app: 'olivers-english-adventure', version: 1, exportedAt: new Date().toISOString(), data },
    null,
    2,
  );
}
export function parseBackup(raw: string): AppData {
  if (new TextEncoder().encode(raw).length > 2 * 1024 * 1024)
    throw new Error('備份檔請小於 2 MB。目前的資料未變更。');
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('這不是有效的 JSON 檔案。目前的資料未變更。');
  }
  if (!obj(value) || value.app !== 'olivers-english-adventure' || value.version !== 1)
    return fail();
  return validateData(value.data);
}
