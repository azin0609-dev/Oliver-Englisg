import { useState } from 'react';
import { ArrowRight, BookOpen, Heart, Sprout } from 'lucide-react';
import { useApp } from '../lib/context';
import { weeklySummary } from '../lib/storage';
import { categories } from '../data/categories';
import { trackableSentences } from '../data';
import { EmptyState, masteryLabels, MaterialCard, PageHeading } from '../components/Cards';
import { TopicIcon } from '../components/Art';
import MemoryJournal from '../components/MemoryJournal';
export default function ProgressPage() {
  const { data } = useApp();
  const [filter, setFilter] = useState(-1);
  const [limit, setLimit] = useState(12);
  const summary = weeklySummary(data);
  const tracked = trackableSentences.filter((s) => data.records[s.id]?.practiceCount > 0);
  const learned = tracked.filter((s) => data.records[s.id].mastery === 3).length;
  const understood = tracked.filter((s) => data.records[s.id].mastery > 0).length;
  const list = [...tracked]
    .filter((s) => filter === -1 || data.records[s.id].mastery === filter)
    .sort((a, b) =>
      (data.records[b.id].lastPracticed ?? '').localeCompare(
        data.records[a.id].lastPracticed ?? '',
      ),
    );
  return (
    <div>
      <PageHeading
        eyebrow="LITTLE STEPS, BEAUTIFUL GROWTH"
        title={`${data.settings.nickname} 的成長小花園`}
        description="每個孩子都有自己的步調。這裡記下的，是你們一起走過的日常。"
      />
      <MemoryJournal />
      <details className="observation-summary">
        <summary>看看爸媽的觀察摘要與練習紀錄</summary>
        <section className="progress-overview">
          <div className="progress-main">
            <div className="illustrated-icon">
              <Sprout size={31} />
            </div>
            <span className="eyebrow">GROWING AT YOUR OWN PACE</span>
            <h2>
              已經認識 <strong>{understood}</strong> 句英文
            </h2>
            <p>
              其中 {learned} 句能主動說出，{tracked.length} 句曾一起練習。
            </p>
            <span className="small-note">
              「認識」包含聽得懂、提示後會說、能主動說出；各狀態不重複。
            </span>
          </div>
          <div className="weekly-summary">
            <div className="section-kicker">THIS WEEK · 週一到今天</div>
            <h3>
              本週複習 <b>{summary.total}</b> 句英文
            </h3>
            <div className="weekly-bars">
              {masteryLabels.map((label, i) => (
                <div key={label}>
                  <span className={`legend-dot mastery-${i}`} />
                  <span>{i === 0 ? '練習中・尚未標記' : label}</span>
                  <b>{summary.counts[i]}</b>
                </div>
              ))}
            </div>
            <p>同一句本週只算一次，按目前的觀察狀態分類。</p>
          </div>
        </section>
        <section className="lesson-section">
          <div className="section-title">
            <TopicIcon name="leaf" />
            <div>
              <h2>每個主題，都慢慢發芽。</h2>
              <p>內建生活句子與對話台詞，分開逐句記錄。</p>
            </div>
          </div>
          <div className="topic-progress-grid">
            {categories.map((c) => {
              const total = trackableSentences.filter((s) => s.category === c.id).length;
              const mastered = trackableSentences.filter(
                (s) => s.category === c.id && (data.records[s.id]?.mastery ?? 0) > 0,
              ).length;
              return (
                <a href={`#/topic/${c.id}`} className="topic-progress" key={c.id}>
                  <div className={`topic-progress-icon ${c.color}`}>
                    <TopicIcon name={c.icon} size={21} />
                  </div>
                  <div>
                    <div>
                      <strong>{c.shortName}</strong>
                      <span>
                        {mastered} / {total}
                      </span>
                    </div>
                    <progress
                      max={total}
                      value={mastered}
                      aria-label={`${c.shortName} 已認識 ${mastered} 句，共 ${total} 句`}
                    />
                  </div>
                </a>
              );
            })}
          </div>
        </section>
        <section className="lesson-section">
          <div className="section-title">
            <BookOpen size={23} />
            <div>
              <h2>一起練習過的英文</h2>
              <p>觀察會改變，隨時都可以調整。</p>
            </div>
            <a href="#/settings" className="text-button push-right">
              備份資料
              <ArrowRight size={15} />
            </a>
          </div>
          <div className="category-chips">
            <button
              className={filter === -1 ? 'active' : ''}
              onClick={() => {
                setFilter(-1);
                setLimit(12);
              }}
            >
              全部紀錄
            </button>
            {masteryLabels.map((l, i) => (
              <button
                key={l}
                className={filter === i ? 'active' : ''}
                onClick={() => {
                  setFilter(i);
                  setLimit(12);
                }}
              >
                {l}
              </button>
            ))}
          </div>
          {list.length ? (
            <>
              <div className="card-stack">
                {list.slice(0, limit).map((s) => (
                  <MaterialCard key={s.id} item={s} />
                ))}
              </div>
              {list.length > limit && (
                <button className="button secondary load-more" onClick={() => setLimit(limit + 12)}>
                  看更多紀錄
                </button>
              )}
            </>
          ) : (
            <EmptyState
              title={tracked.length ? '這個狀態還沒有紀錄' : '第一句，從今天開始。'}
              description="打開教材的「提示與接話」，記錄練習或選擇孩子目前的學習程度，就會在這裡留下足跡。"
              href="#/today"
              label="開始今天的小冒險"
            />
          )}
        </section>
      </details>
      <div className="quiet-note">
        <Heart size={17} />
        這是爸媽的觀察筆記，不是孩子的成績單。兩支手機各自保存紀錄，尚無跨裝置同步。
      </div>
    </div>
  );
}
