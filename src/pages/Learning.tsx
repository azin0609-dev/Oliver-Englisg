import { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Leaf,
  Lightbulb,
  RefreshCw,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import { categories, categoryById } from '../data/categories';
import { dialogues, sentences, tasks, words } from '../data';
import { useApp } from '../lib/context';
import { localDate } from '../lib/dates';
import { EmptyState, MaterialCard, PageHeading, TaskCard } from '../components/Cards';
import { Garden, TopicIcon } from '../components/Art';
import { reviewModes } from '../data/review';
import { quickPair, classroomAction } from '../data/parentTools';
import { QuickSession } from '../components/ParentSupport';
export function TodayPage() {
  const { data, daily, plan, practice } = useApp();
  const completed = data.daily.date === localDate() ? data.daily.completed : [];
  const skipped = data.daily.date === localDate() && data.daily.skipped;
  const ids = [
    ...plan.words.map((w) => w.id),
    ...plan.sentences.map((s) => s.id),
    plan.dialogue.id,
    plan.task.id,
  ];
  const total = ids.filter((id) => completed.includes(id)).length;
  const pair = quickPair(plan.task.id);
  const teacherSentence = plan.sentences.find((sentence) =>
    data.classSessions.some(
      (c) =>
        c.sentenceIds.includes(sentence.id) &&
        c.date <= localDate() &&
        Date.now() - new Date(`${c.date}T12:00:00`).getTime() <= 14 * 86400000,
    ),
  );
  const quick = { sentence: teacherSentence ?? pair.sentence, task: pair.task };
  const completionId = teacherSentence ? teacherSentence.id : quick.task.id;
  const done = (id: string) => {
    practice(id);
    daily('complete', id);
  };
  return (
    <div>
      <PageHeading
        eyebrow="TODAY'S LITTLE ADVENTURE"
        title="今天，說一句就很好。"
        description="說一句、一起做個小動作。想停在這裡，就很棒了。"
      />
      {skipped ? (
        <div className="rest-today">
          <p>今天先休息，也是一種溫柔。</p>
          <button className="button secondary" onClick={() => daily('resume')}>
            想玩了，繼續這一小段
          </button>
        </div>
      ) : (
        <QuickSession
          sentence={quick.sentence}
          action={
            teacherSentence
              ? classroomAction(teacherSentence.id, teacherSentence.category)
              : quick.task.instruction
          }
          materials={teacherSentence ? undefined : quick.task.materials}
          completed={completed.includes(completionId)}
          onComplete={() => {
            practice(quick.sentence.id);
            if (!teacherSentence) practice(quick.task.id);
            daily('complete', completionId);
          }}
        />
      )}
      <div className="gentle-today-actions">
        <button className="text-button" onClick={() => daily('replace')}>
          <RefreshCw size={15} />
          換個小動作
        </button>
        <button className="text-button muted" onClick={() => daily(skipped ? 'resume' : 'skip')}>
          {skipped ? '繼續一起玩' : '今天先休息'}
        </button>
      </div>
      <details className="full-adventure">
        <summary>還想再玩一點？展開完整 5 分鐘</summary>
        <div className="today-strip">
          <div>
            <Clock3 size={19} />
            <span>3 個單字 · 2 句英文 · 1 組對話 · 1 個動作</span>
          </div>
          <span>{total} / 7 個小時刻</span>
        </div>
        <div className="toolbar">
          <span className="tag">
            <TopicIcon name={categoryById[plan.theme].icon} size={15} />
            {plan.classroom
              ? '英文課日・優先複習'
              : `今日靈感・${categoryById[plan.theme].shortName}`}
          </span>
          <button className="text-button" onClick={() => daily('replace')}>
            <RefreshCw size={15} />
            換一組
          </button>
          <button className="text-button muted" onClick={() => daily(skipped ? 'resume' : 'skip')}>
            <SkipForward size={15} />
            {skipped ? '繼續今天的小冒險' : '今天先休息'}
          </button>
        </div>
        {skipped ? (
          <EmptyState
            title="今天，休息也是很棒的選擇。"
            description="抱抱、一起吃飯、好好說話，都是陪伴。想玩時再點上方「繼續今天的小冒險」。"
          />
        ) : (
          <>
            <section className="lesson-section">
              <div className="section-title">
                <span className="step-number">01</span>
                <div>
                  <h2>認識三位單字朋友</h2>
                  <p>指著身邊的物品，說給孩子聽。</p>
                </div>
              </div>
              <div className="daily-words">
                {plan.words.map((w) => (
                  <div key={w.id}>
                    <MaterialCard item={w} observe={false} />
                    <button
                      className={`completion-button ${completed.includes(w.id) ? 'completed' : ''}`}
                      onClick={() => done(w.id)}
                      disabled={completed.includes(w.id)}
                    >
                      <Check size={15} />
                      {completed.includes(w.id) ? '已一起認識' : '我們一起看過了'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="lesson-section">
              <div className="section-title">
                <span className="step-number">02</span>
                <div>
                  <h2>把兩句英文放進生活</h2>
                  <p>可以只聽、做動作，或試著回答。</p>
                </div>
              </div>
              <div className="card-stack">
                {plan.sentences.map((s) => (
                  <div key={s.id}>
                    <MaterialCard item={s} expanded />
                    <button
                      className={`completion-button ${completed.includes(s.id) ? 'completed' : ''}`}
                      onClick={() => done(s.id)}
                      disabled={completed.includes(s.id)}
                    >
                      <Check size={15} />
                      {completed.includes(s.id) ? '已一起練習' : '我們一起說過了'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="lesson-section">
              <div className="section-title">
                <span className="step-number">03</span>
                <div>
                  <h2>聊一段小對話</h2>
                  <p>孩子的回應可以和範例不一樣。</p>
                </div>
              </div>
              <a className="dialogue-promo" href={`#/dialogue/${plan.dialogue.id}`}>
                <TopicIcon name="message" size={30} />
                <div>
                  <h3>{plan.dialogue.traditionalChinese}</h3>
                  <p lang="en">{plan.dialogue.turns[0].english}</p>
                  <span>6 句小對話 · 可以逐句播放</span>
                </div>
                <ArrowRight size={22} />
              </a>
              <button
                className={`completion-button ${completed.includes(plan.dialogue.id) ? 'completed' : ''}`}
                onClick={() => done(plan.dialogue.id)}
                disabled={completed.includes(plan.dialogue.id)}
              >
                <Check size={15} />
                {completed.includes(plan.dialogue.id) ? '已一起聊過' : '我們一起聊過了'}
              </button>
            </section>
            <section className="lesson-section">
              <div className="section-title">
                <span className="step-number">04</span>
                <div>
                  <h2>現在，把手機放一旁</h2>
                  <p>讓真實生活，成為最好的教室。</p>
                </div>
              </div>
              <TaskCard item={plan.task} />
              <button
                className={`completion-button ${completed.includes(plan.task.id) ? 'completed' : ''}`}
                onClick={() => done(plan.task.id)}
                disabled={completed.includes(plan.task.id)}
              >
                <Check size={15} />
                {completed.includes(plan.task.id) ? '已一起完成小任務' : '我們一起玩過了'}
              </button>
            </section>
            {total === 7 && (
              <div className="celebration">
                <Sparkles size={26} />
                <h2>今天的小冒險，好溫暖。</h2>
                <p>關掉手機，給彼此一個擁抱吧。明天再一起玩。</p>
                <a href="#/progress" className="button secondary">
                  看看成長足跡
                  <ArrowRight size={16} />
                </a>
              </div>
            )}
          </>
        )}
      </details>
      <p className="quiet-note">
        <Leaf size={15} />
        有足夠的已熟悉教材時，約 70% 安排熟悉內容、30%
        新挑戰。剛開始會先探索適合目前程度的教材；每天可自由更換。
      </p>
    </div>
  );
}
const tabs = [
  { id: 'sentences', name: '生活句子' },
  { id: 'words', name: '英文單字' },
  { id: 'dialogues', name: '親子對話' },
  { id: 'tasks', name: '動作任務' },
];
export function TopicsPage() {
  return (
    <div>
      <PageHeading
        eyebrow="ENGLISH IN EVERYDAY LIFE"
        title="生活裡，隨時都能說英文。"
        description="從早安到晚安，找一句當下用得上的話。"
      />
      <div className="category-grid">
        {categories.map((c) => (
          <a href={`#/topic/${c.id}`} key={c.id} className={`topic-tile ${c.color}`}>
            <div className="illustrated-icon">
              <TopicIcon name={c.icon} />
            </div>
            <div>
              <h2>{c.name}</h2>
              <p>{c.english}</p>
              <span>
                {sentences.filter((s) => s.category === c.id).length} 句生活英文 · 3 組對話
              </span>
            </div>
            <ChevronRight size={19} />
          </a>
        ))}
      </div>
      <div className="info-note">
        <Lightbulb size={19} />
        <p>問完後等約 5 秒。指一指、做動作、只說一個字，都是很好的回應。</p>
      </div>
    </div>
  );
}
export function TopicPage({ id, dinosaur = false }: { id: string; dinosaur?: boolean }) {
  const { data } = useApp();
  const category = categories.find((c) => c.id === id);
  const [tab, setTab] = useState('sentences');
  const [level, setLevel] = useState(0);
  if (!category)
    return (
      <EmptyState
        title="還沒找到這個主題"
        description="試試從生活情境選擇一個主題。"
        href="#/topics"
        label="探索生活情境"
      />
    );
  const match = (m: { category: string; tags: string[]; difficulty: number }) =>
    (dinosaur
      ? m.tags.includes('恐龍') || m.tags.includes('dinosaur') || m.category === 'toys'
      : m.category === id) &&
    (!level || m.difficulty === level);
  const items = {
    sentences: sentences.filter(match),
    words: words.filter(match),
    dialogues: dialogues.filter(match),
    tasks: tasks.filter(match),
  };
  return (
    <div>
      <PageHeading
        eyebrow={dinosaur ? 'ROAR, PLAY & SAY' : category.english.toUpperCase()}
        title={dinosaur ? '恐龍英文樂園' : category.name}
        description={
          dinosaur
            ? `找一隻真正的恐龍玩具，和 ${data.settings.nickname} 一起吼出小小的英文。`
            : category.description
        }
      />
      {dinosaur && (
        <div className="dino-banner">
          <div>
            <span className="tag">{data.settings.nickname} 的最愛</span>
            <h2>小恐龍，大冒險。</h2>
            <p>
              今天的遊戲夥伴，是暴龍還是三角龍？
              <br />
              讓孩子選，讓好奇心帶路。
            </p>
          </div>
          <Garden />
        </div>
      )}
      <div className="content-controls">
        <div className="tabs" role="tablist" aria-label="教材類型">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              {t.name}
              <span>{items[t.id as keyof typeof items].length}</span>
            </button>
          ))}
        </div>
        <label className="filter-select">
          難度
          <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
            <option value={0}>全部程度</option>
            <option value={1}>L1 · 聽懂指令</option>
            <option value={2}>L2 · 練習回應</option>
            <option value={3}>L3 · 主動表達</option>
          </select>
        </label>
      </div>
      <div className={tab === 'words' ? 'word-grid' : 'card-stack'} role="tabpanel">
        {tab === 'sentences' && items.sentences.map((s) => <MaterialCard key={s.id} item={s} />)}
        {tab === 'words' &&
          items.words.map((w) => <MaterialCard key={w.id} item={w} observe={false} />)}
        {tab === 'dialogues' &&
          items.dialogues.map((d) => (
            <a className="dialogue-promo" href={`#/dialogue/${d.id}`} key={d.id}>
              <TopicIcon name="message" />
              <div>
                <h3>{d.traditionalChinese}</h3>
                <p>{d.english}</p>
                <span>6 句 · Level {d.difficulty}</span>
              </div>
              <ArrowRight size={20} />
            </a>
          ))}
        {tab === 'tasks' && items.tasks.map((t) => <TaskCard key={t.id} item={t} />)}
      </div>
      {items[tab as keyof typeof items].length === 0 && (
        <EmptyState
          title="這個程度暫時沒有這類教材"
          description="可以切換「全部程度」，從孩子熟悉的內容開始。"
        />
      )}
    </div>
  );
}
export function ReviewPage() {
  const [active, setActive] = useState<string | null>(null);
  const mode = reviewModes.find((m) => m.id === active);
  const { data } = useApp();
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return (
    <div>
      <PageHeading
        eyebrow="A LITTLE PRACTICE AFTER CLASS"
        title="英文課裡學的，回家一起玩。"
        description="從聽懂指令，到自在說出需求。每次挑一種練習就好。"
      />
      <a href="#/class-notes" className="class-notes-entry">
        <div>
          <strong>今天老師教了什麼？</strong>
          <span>記下主題與句型，讓下一次推薦接著練。</span>
        </div>
        <ArrowRight size={19} />
      </a>
      <div className="class-days-strip">
        <TopicIcon name="backpack" size={22} />
        <div>
          <strong>
            目前的英文課日：
            {data.settings.classDays.length
              ? [...data.settings.classDays]
                  .sort()
                  .map((d) => `週${days[d]}`)
                  .join('、')
              : '尚未設定'}
          </strong>
          <p>上課日會優先安排玩具、顏色與動作複習。</p>
        </div>
        <a href="#/settings" className="text-button">
          調整
        </a>
      </div>
      <div className="review-grid">
        {reviewModes.map((m) => (
          <button
            key={m.id}
            className={`review-mode ${m.id === active ? 'active' : ''}`}
            onClick={() => setActive(m.id === active ? null : m.id)}
            aria-expanded={m.id === active}
          >
            <span className="review-letter">{m.letter}</span>
            <div>
              <h2>{m.name}</h2>
              <span lang="en">{m.english}</span>
              <p>{m.description}</p>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      {mode ? (
        <section className="lesson-section">
          <div className="section-title">
            <span className="step-number">{mode.letter}</span>
            <div>
              <h2>{mode.name}</h2>
              <p>{mode.tip}</p>
            </div>
          </div>
          <div className="card-stack">
            {mode.ids.map((id, i) => {
              const item = sentences.find((s) => s.id === id)!;
              return (
                <div key={id}>
                  <p className="activity-prompt">
                    <span>{i + 1}</span>
                    {mode.activities[i]}
                  </p>
                  <MaterialCard item={item} expanded />
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="info-note">
          <Lightbulb size={20} />
          <p>選上方任何一種模式開始。先準備玩具、車子、椅子或杯子；不需要列印教材，也沒有考試。</p>
        </div>
      )}
      <div className="quiet-note">
        <Leaf size={17} />
        硬幣與小磁鐵不適合幼兒獨自操作；請改用大型玩具代幣及安全磁鐵玩具，由成人陪同。收銀機英文是
        cash register。
      </div>
    </div>
  );
}
