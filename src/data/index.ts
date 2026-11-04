import { words } from './words';
import { sentences } from './sentences';
import { dialogues } from './dialogues';
import { tasks } from './tasks';
export { words, sentences, dialogues, tasks };
export const allMaterials = [...words, ...sentences, ...dialogues, ...tasks];
export const materialById = Object.fromEntries(allMaterials.map((m) => [m.id, m]));
export const dialogueLines = dialogues.flatMap((d) =>
  d.turns.map((turn, i) => ({
    ...d,
    ...turn,
    id: `${d.id}-turn-${i}`,
    suggestedReply: d.turns[i + 1]?.english ?? 'Good job!',
    tags: [...d.tags, turn.traditionalChinese],
  })),
);
export const trackableSentences = [...sentences, ...dialogueLines];
for (const line of dialogueLines) materialById[line.id] = line;
