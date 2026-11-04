import { sentences, tasks } from './index';
import { reviewModes } from './review';
import type { CategoryId } from '../types';
export const quickSituations = [
  {
    id: 'food',
    title: '吃飯、點心',
    icon: 'apple',
    color: 'peach',
    sentenceId: 'sentence-food-1',
    taskId: 'task-6',
    prompt: '先問一句，再讓孩子選一樣真的可以吃的東西。',
  },
  {
    id: 'wash',
    title: '刷牙、洗手',
    icon: 'droplets',
    color: 'blue',
    sentenceId: 'sentence-wash-1',
    taskId: 'task-4',
    prompt: '拿著牙刷示範一次；孩子先做動作也很好。',
  },
  {
    id: 'tidy',
    title: '收拾玩具',
    icon: 'basket',
    color: 'sage',
    sentenceId: 'sentence-tidy-2',
    taskId: 'task-13',
    prompt: '先只選一隻恐龍，陪牠一起回盒子裡。',
  },
  {
    id: 'feelings',
    title: '需要安慰',
    icon: 'heart',
    color: 'pink',
    sentenceId: 'sentence-feelings-3',
    taskId: 'task-16',
    prompt: '先接住心情。孩子不想抱也可以，安靜陪著就好。',
  },
  {
    id: 'outside',
    title: '穿鞋、出門',
    icon: 'backpack',
    color: 'orange',
    sentenceId: 'sentence-outside-1',
    taskId: 'task-7',
    prompt: '把鞋子放低，讓孩子自己試；需要時再幫忙。',
  },
  {
    id: 'bedtime',
    title: '準備晚安',
    icon: 'moon',
    color: 'purple',
    sentenceId: 'sentence-bedtime-9',
    taskId: 'task-20',
    prompt: '放輕聲音，和玩偶說晚安，然後把手機放下。',
  },
] as const;
export const taskSentenceIds = [
  'sentence-morning-5',
  'sentence-morning-7',
  'sentence-wash-10',
  'sentence-wash-4',
  'sentence-food-4',
  'sentence-food-3',
  'sentence-outside-1',
  'sentence-outside-8',
  'sentence-toys-8',
  'sentence-toys-5',
  'sentence-park-5',
  'sentence-park-2',
  'sentence-tidy-2',
  'sentence-tidy-7',
  'sentence-feelings-1',
  'sentence-feelings-3',
  'sentence-friends-2',
  'sentence-friends-7',
  'sentence-bedtime-4',
  'sentence-bedtime-9',
];
export function quickPair(taskId: string) {
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const index = tasks.indexOf(task);
  return { task, sentence: sentences.find((s) => s.id === taskSentenceIds[index])! };
}
export const lessonTopics = [
  {
    id: 'colors',
    name: '顏色',
    sentenceIds: ['sentence-toys-6', 'sentence-toys-3', 'classroom-6'],
  },
  {
    id: 'animals',
    name: '動物',
    sentenceIds: ['sentence-friends-6', 'classroom-5', 'classroom-12'],
  },
  {
    id: 'dinosaurs',
    name: '恐龍',
    sentenceIds: ['sentence-toys-1', 'sentence-toys-2', 'sentence-toys-8'],
  },
  { id: 'letters', name: '字母', sentenceIds: ['classroom-2'] },
  { id: 'cars', name: '車子', sentenceIds: ['sentence-toys-3', 'classroom-6', 'classroom-11'] },
  { id: 'magnets', name: '磁鐵', sentenceIds: ['sentence-toys-4', 'sentence-toys-5'] },
  {
    id: 'shop',
    name: '小商店',
    sentenceIds: ['classroom-3', 'sentence-feelings-6', 'sentence-friends-6'],
  },
  {
    id: 'positions',
    name: '位置',
    sentenceIds: [
      'classroom-1',
      'classroom-11',
      'classroom-12',
      'sentence-tidy-4',
      'sentence-tidy-5',
    ],
  },
  {
    id: 'sorting',
    name: '大小與分類',
    sentenceIds: ['sentence-toys-7', 'classroom-4', 'sentence-tidy-7', 'classroom-10'],
  },
];
export const gentleActions: Record<CategoryId, string> = {
  morning: '指一指身邊的物品，或陪孩子做一個伸懶腰的小動作。',
  wash: '一邊示範清潔動作一邊說。手濕時把手機放到安全、乾燥的地方。',
  food: '拿出兩樣真的可以選的食物，接受指認、中文或一個單字的回答。',
  outside: '把衣物放在孩子拿得到的地方，陪他試一次，不急著代做。',
  toys: '拿一隻真正的玩具，跟著孩子的玩法說一句，不用一直提問。',
  park: '先確定周圍安全，指著看見的東西一起說，再把手機收起來。',
  tidy: '只挑一樣東西，一起把它放回原位，就能結束這個小任務。',
  feelings: '先讓孩子知道你在身邊。可以只聽、不回答，也可以先休息。',
  friends: '陪著孩子輪流一次，也尊重他還想繼續使用玩具的意願。',
  bedtime: '輕聲說一句，抱抱或陪在旁邊，接著關掉螢幕。',
};

export function classroomAction(id: string, category: CategoryId): string {
  const mode = reviewModes.find((m) => m.ids.includes(id));
  return mode ? mode.activities[mode.ids.indexOf(id)] : gentleActions[category];
}
