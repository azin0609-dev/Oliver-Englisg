import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  Layers,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';
import { dialogues } from '../data';
import { categories, categoryById } from '../data/categories';
import {
  FavoriteButton,
  MasteryPicker,
  PageHeading,
  SpeechButtons,
  EmptyState,
} from '../components/Cards';
import { TopicIcon } from '../components/Art';
import { useApp } from '../lib/context';
import { PhraseHelp, ResponseSupport } from '../components/ParentSupport';
export function DialoguesPage() {
  const [category, setCategory] = useState('all');
  return (
    <div>
      <PageHeading
        eyebrow="LITTLE CONVERSATIONS, REAL CONNECTIONS"
        title="你一句，我一句。"
        description="爸媽照著說，讓英文自然聊起來。孩子的回答沒有標準答案。"
      />
      <div className="category-chips" aria-label="篩選對話場景">
        <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>
          全部場景
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={c.id === category ? 'active' : ''}
            onClick={() => setCategory(c.id)}
          >
            {c.shortName}
          </button>
        ))}
      </div>
      <div className="dialogue-grid">
        {dialogues
          .filter((d) => category === 'all' || d.category === category)
          .map((d) => (
            <a className="dialogue-list-card" href={`#/dialogue/${d.id}`} key={d.id}>
              <div className={`dialogue-illustration ${categoryById[d.category].color}`}>
                <TopicIcon name={categoryById[d.category].icon} size={31} />
                <MessageCircle size={17} className="little-message" />
              </div>
              <div className="dialogue-list-copy">
                <span className="eyebrow">
                  {categoryById[d.category].shortName} · L{d.difficulty}
                </span>
                <h2>{d.traditionalChinese}</h2>
                <p lang="en">{d.turns[0].english}</p>
                <span>6 句對話 · 約 1 分鐘</span>
              </div>
              <ChevronRight size={18} />
            </a>
          ))}
      </div>
    </div>
  );
}
export function DialoguePage({ id }: { id: string }) {
  const dialogue = dialogues.find((d) => d.id === id);
  const [index, setIndex] = useState(0);
  const [all, setAll] = useState(false);
  const [chinese, setChinese] = useState(true);
  const { practice, setNotice, data, stop } = useApp();
  if (!dialogue)
    return (
      <EmptyState
        title="找不到這段對話"
        description="回到對話列表，挑一個今天想聊的場景。"
        href="#/dialogues"
        label="挑一段對話"
      />
    );
  const turn = dialogue.turns[index];
  return (
    <div className="dialogue-page">
      <a href="#/dialogues" className="back-link">
        ← 所有親子對話
      </a>
      <PageHeading
        back={false}
        eyebrow={`${categoryById[dialogue.category].shortName} · LEVEL ${dialogue.difficulty}`}
        title={dialogue.traditionalChinese}
        description="照著說，也可以自由發揮。沒有回答時，先等一等。"
      />
      <div className="dialogue-toolbar">
        <div className="segmented">
          <button className={!all ? 'active' : ''} onClick={() => setAll(false)}>
            <MessageCircle size={15} />
            逐句顯示
          </button>
          <button className={all ? 'active' : ''} onClick={() => setAll(true)}>
            <Layers size={15} />
            顯示整段
          </button>
        </div>
        <button className="text-button" onClick={() => setChinese(!chinese)}>
          <Eye size={16} />
          {chinese ? '隱藏中文' : '顯示中文'}
        </button>
        <FavoriteButton id={dialogue.id} english={dialogue.english} />
      </div>
      {all ? (
        <div className="conversation-all">
          {dialogue.turns.map((line, i) => (
            <article className={`conversation-line ${line.role}`} key={i}>
              <div className="turn-label">
                {line.role === 'parent' ? '爸媽說' : `${data.settings.nickname} 可以說`}
                <span>{String(i + 1).padStart(2, '0')}</span>
                <FavoriteButton id={`${id}-turn-${i}`} english={line.english} />
              </div>
              <p className="english-text" lang="en">
                {line.english}
              </p>
              {chinese && <p className="translation">{line.traditionalChinese}</p>}
              <SpeechButtons text={line.english} />
              <PhraseHelp text={line.english} />
              {line.role === 'parent' && (
                <ResponseSupport reply={dialogue.turns[i + 1]?.english ?? 'Okay.'} />
              )}
              <details className="observation-later">
                <summary>爸媽稍後記一下（選用）</summary>
                <MasteryPicker id={`${id}-turn-${i}`} />
              </details>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="conversation-stepper" aria-label="選擇對話句子">
            {dialogue.turns.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  stop();
                  setIndex(i);
                }}
                className={i === index ? 'active' : i < index ? 'past' : ''}
                aria-label={`跳到第 ${i + 1} 句`}
                aria-current={i === index ? 'step' : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <article className={`conversation-focus ${turn.role}`}>
            <div className="turn-label">
              <TopicIcon name={turn.role === 'parent' ? 'message' : 'dino'} />
              <span>
                Step {index + 1} ·{' '}
                {turn.role === 'parent' ? '爸爸媽媽說' : `${data.settings.nickname} 可能這樣回答`}
              </span>
              <FavoriteButton id={`${id}-turn-${index}`} english={turn.english} />
            </div>
            <p className="english-text" lang="en">
              {turn.english}
            </p>
            {chinese && <p className="translation">{turn.traditionalChinese}</p>}
            <SpeechButtons text={turn.english} />
            <PhraseHelp text={turn.english} />
            {turn.role === 'parent' && (
              <ResponseSupport key={index} reply={dialogue.turns[index + 1]?.english ?? 'Okay.'} />
            )}
            <details className="observation-later" key={`observe-${index}`}>
              <summary>爸媽稍後記一下（選用）</summary>
              <MasteryPicker id={`${id}-turn-${index}`} />
            </details>
            <div className="conversation-nav">
              <button
                className="button ghost"
                disabled={index === 0}
                onClick={() => {
                  stop();
                  setIndex(index - 1);
                }}
              >
                <ArrowLeft size={17} />
                上一句
              </button>
              <span>
                {index + 1} / {dialogue.turns.length}
              </span>
              <button
                className="button primary"
                onClick={() => {
                  stop();
                  if (index < dialogue.turns.length - 1) setIndex(index + 1);
                  else {
                    practice(dialogue.id);
                    setNotice('這段對話已記錄！可以再玩一次，也可以把手機放下囉。');
                  }
                }}
              >
                {index === dialogue.turns.length - 1 ? '記錄這次對話' : '下一句'}
                {index === dialogue.turns.length - 1 ? (
                  <Check size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </button>
            </div>
          </article>
        </>
      )}
      {id === 'dialogue-food-1' && (
        <p className="alternative-reply">
          也可以回答：<span lang="en">“No, I'm not hungry.”</span>（不，我不餓。）爸媽可以接{' '}
          <span lang="en">“Okay. Tell me when you are hungry.”</span>
        </p>
      )}
      <div className="info-note">
        <Lightbulb size={20} />
        <p>{dialogue.parentTip} 範例不是唯一答案；點上方數字可以自由跳句。</p>
      </div>
    </div>
  );
}
