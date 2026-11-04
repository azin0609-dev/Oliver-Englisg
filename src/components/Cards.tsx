import { useState } from 'react';
import { Check, ChevronDown, Lightbulb, MessageCircle, Play, Repeat2 } from 'lucide-react';
import type { ActionTask, Material, Sentence } from '../types';
import { useApp } from '../lib/context';
import { categoryById } from '../data/categories';
import { SpeechButtons } from './SpeechButtons';
import { PhraseHelp, ResponseSupport } from './ParentSupport';
export { SpeechButtons } from './SpeechButtons';
export { FavoriteButton, MasteryPicker, masteryLabels } from './LearningControls';
import { FavoriteButton, MasteryPicker, difficultyLabels, masteryLabels } from './LearningControls';
export function MaterialCard({
  item,
  expanded = false,
  observe = true,
}: {
  item: Material;
  expanded?: boolean;
  observe?: boolean;
}) {
  const [details, setDetails] = useState(expanded);
  const [chinese, setChinese] = useState(true);
  const { record, practice, setNotice, data } = useApp();
  const sentence = 'nextLine' in item ? (item as Sentence) : null;
  return (
    <article className={`material-card ${item.id.startsWith('word') ? 'word-card' : ''}`}>
      <div className="card-meta">
        <span className={`category-dot ${categoryById[item.category].color}`} />
        <span>{categoryById[item.category].shortName}</span>
        <span className="difficulty">
          L{item.difficulty} · {difficultyLabels[item.difficulty]}
        </span>
        <FavoriteButton id={item.id} english={item.english} />
      </div>
      <h3 className="english-text" lang="en">
        {item.english}
      </h3>
      {chinese && <p className="translation">{item.traditionalChinese}</p>}
      {item.id.startsWith('dialogue-') && !item.id.includes('-turn-') && (
        <a href={`#/dialogue/${item.id}`} className="text-button">
          開啟完整親子對話 →
        </a>
      )}
      <div className="card-actions">
        <SpeechButtons text={item.english} />
        <button className="text-button muted" onClick={() => setChinese(!chinese)}>
          {chinese ? '隱藏中文' : '顯示中文'}
        </button>
      </div>
      <button
        className="details-toggle"
        onClick={() => setDetails(!details)}
        aria-expanded={details}
      >
        <MessageCircle size={15} />
        {details ? '收起提示與接話' : '提示與接話'}
        <ChevronDown size={15} className={details ? 'rotated' : ''} />
        {record(item.id).mastery > 0 && (
          <span className="status-mini">{masteryLabels[record(item.id).mastery]}</span>
        )}
      </button>
      {details && (
        <div className="material-details">
          <div className="reply-box">
            <span className="eyebrow">{data.settings.nickname} 可以這樣說</span>
            <div className="inline-speech">
              <p lang="en">{item.suggestedReply}</p>
              <SpeechButtons text={item.suggestedReply} compact />
            </div>
            {sentence && (
              <>
                <span className="eyebrow">爸媽接著說</span>
                <div className="inline-speech">
                  <p lang="en">{sentence.nextLine}</p>
                  <SpeechButtons text={sentence.nextLine} compact />
                </div>
              </>
            )}
          </div>
          <PhraseHelp text={item.english} />
          {observe && <ResponseSupport reply={item.suggestedReply} />}
          <p className="parent-tip">
            <Lightbulb size={16} />
            {item.parentTip}
          </p>
          {observe && <MasteryPicker id={item.id} />}
          <div className="practice-row">
            <button
              className="text-button"
              onClick={() => {
                practice(item.id);
                setNotice('已記錄這次練習，陪伴的每一句都算數。');
              }}
            >
              <Check size={15} />
              記錄這次練習
            </button>
            <small>
              練習 {record(item.id).practiceCount} 次
              {record(item.id).lastPracticed &&
                ` · 最近 ${new Date(record(item.id).lastPracticed!).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}`}
            </small>
          </div>
        </div>
      )}
    </article>
  );
}
export function TaskCard({ item }: { item: ActionTask }) {
  const { practice, setNotice } = useApp();
  return (
    <article className="task-card">
      <div className="section-kicker">
        <Play size={15} />
        離開螢幕，動起來
      </div>
      <h3>{item.traditionalChinese}</h3>
      <p className="english-text" lang="en">
        {item.english}
      </p>
      <SpeechButtons text={item.english} />
      <p>{item.instruction}</p>
      <div className="materials-note">準備：{item.materials}</div>
      <p className="parent-tip">
        <Lightbulb size={16} />
        {item.parentTip}
      </p>
      <button
        className="button secondary"
        onClick={() => {
          practice(item.id);
          setNotice('小任務已記錄！謝謝你們一起玩。');
        }}
      >
        <Check size={16} />
        我們一起練習了
      </button>
    </article>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  back = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  back?: boolean;
}) {
  return (
    <header className="page-heading">
      {back && (
        <a href="#/" className="back-link">
          ← 回到首頁
        </a>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}
export function EmptyState({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-sprout">
        <Repeat2 size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <a href={href} className="button secondary">
          {label}
        </a>
      )}
    </div>
  );
}
