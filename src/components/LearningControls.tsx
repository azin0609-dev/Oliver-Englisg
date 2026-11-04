import { Bookmark, Check } from 'lucide-react';
import type { Mastery } from '../types';
import { useApp } from '../lib/context';
export const masteryLabels = ['尚未觀察', '聽得懂', '提示後會說', '能主動說出'];
export const difficultyLabels = ['', 'Understand', 'Respond', 'Express'];
export function FavoriteButton({ id, english }: { id: string; english: string }) {
  const { record, favorite } = useApp();
  const saved = record(id).favorite;
  return (
    <button
      className={`icon-button favorite ${saved ? 'saved' : ''}`}
      aria-label={`${saved ? '取消收藏' : '收藏'}：${english}`}
      aria-pressed={saved}
      onClick={() => favorite(id)}
    >
      <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
export function MasteryPicker({ id }: { id: string }) {
  const { record, practice, setNotice } = useApp();
  return (
    <fieldset className="mastery-picker">
      <legend>
        爸媽的觀察 <span>沒有測驗，慢慢來就好</span>
      </legend>
      <div className="mastery-options">
        {masteryLabels.map((label, i) => (
          <button
            key={label}
            className={record(id).mastery === i ? `selected mastery-${i}` : ''}
            onClick={() => {
              practice(id, i as Mastery);
              setNotice(`已記錄：${label}`);
            }}
            aria-pressed={record(id).mastery === i}
          >
            {record(id).mastery === i && <Check size={13} />}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
