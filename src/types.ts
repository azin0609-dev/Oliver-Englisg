export type Difficulty = 1 | 2 | 3;
export type Mastery = 0 | 1 | 2 | 3;
export type CategoryId =
  | 'morning'
  | 'wash'
  | 'food'
  | 'outside'
  | 'toys'
  | 'park'
  | 'tidy'
  | 'feelings'
  | 'friends'
  | 'bedtime';
export interface Material {
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  english: string;
  traditionalChinese: string;
  parentTip: string;
  suggestedReply: string;
  tags: string[];
}
export interface Sentence extends Material {
  nextLine: string;
}
export interface Dialogue extends Material {
  turns: { role: 'parent' | 'child'; english: string; traditionalChinese: string }[];
}
export interface ActionTask extends Material {
  materials: string;
  instruction: string;
}
export interface LearningRecord {
  mastery: Mastery;
  favorite: boolean;
  lastPracticed: string | null;
  practiceCount: number;
}
export interface PracticeEvent {
  id: string;
  date: string;
}
export interface Settings {
  nickname: string;
  difficulty: Difficulty;
  voiceURI: string;
  classDays: number[];
}
export interface AppData {
  version: 1;
  settings: Settings;
  records: Record<string, LearningRecord>;
  history: PracticeEvent[];
  daily: { date: string; seed: number; completed: string[]; selection: string[]; skipped: boolean };
}
export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  english: string;
  icon: string;
  color: string;
  description: string;
  tip: string;
}
