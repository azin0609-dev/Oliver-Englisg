import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Clock3,
  Heart,
  Leaf,
  Search,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { Garden, TopicIcon } from '../components/Art';
import { useApp } from '../lib/context';
import { weeklySummary } from '../lib/storage';
const entrances = [
  {
    number: '01',
    title: '今日 5 分鐘',
    subtitle: '一點點英文，很多的陪伴',
    icon: 'sun',
    color: 'peach',
    href: '/today',
    label: '每天的小冒險',
  },
  {
    number: '02',
    title: '生活情境英文',
    subtitle: '想說的話，隨時找得到',
    icon: 'basket',
    color: 'blue',
    href: '/topics',
    label: '10 個生活主題',
  },
  {
    number: '03',
    title: '恐龍英文樂園',
    subtitle: '跟著恐龍，玩出英文力',
    icon: 'dino',
    color: 'sage',
    href: '/dinosaur',
    label: 'Oliver 的最愛',
  },
  {
    number: '04',
    title: '英文課複習',
    subtitle: '把教室裡的英文帶回家',
    icon: 'backpack',
    color: 'orange',
    href: '/review',
    label: '5 種溫柔練習',
  },
  {
    number: '05',
    title: '親子對話練習',
    subtitle: '爸媽照著說，就能聊起來',
    icon: 'message',
    color: 'pink',
    href: '/dialogues',
    label: '30 組小對話',
  },
  {
    number: '06',
    title: 'Oliver 成長紀錄',
    subtitle: '每個小進步，都值得看見',
    icon: 'sprout',
    color: 'purple',
    href: '/progress',
    label: '陪伴留下的足跡',
  },
];
export default function HomePage() {
  const { data, plan } = useApp();
  const [query, setQuery] = useState('');
  const summary = weeklySummary(data);
  const date = new Date();
  return (
    <div className="home-page">
      <div className="home-topline">
        <span>
          <span className="tiny-sun">
            <Sun size={14} />
          </span>{' '}
          A LITTLE ENGLISH, A LOT OF LOVE
        </span>
        <span className="today-date">
          {date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
        </span>
      </div>
      <section className="welcome">
        <div>
          <p className="welcome-caption">每天 5 分鐘，讓英文成為生活的一部分。</p>
          <h1 lang="en" aria-label={`Good morning, ${data.settings.nickname}!`}>
            Good morning,{' '}
            <span>
              {data.settings.nickname}
              <svg viewBox="0 0 245 14" aria-hidden="true">
                <path
                  d="M3 9C68 0 151 0 241 7M21 13c66-7 130-7 200-3"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="greeting-period">!</span>
          </h1>
          <p className="welcome-subtitle">
            今天也一起說英文吧！<span>不急，我們慢慢來。</span>
          </p>
        </div>
        <div className="welcome-note">
          <Heart size={15} />
          <span>
            手機留給爸媽
            <br />
            把陪伴留給孩子
          </span>
        </div>
      </section>
      <form
        className="home-search"
        action="#/search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) location.hash = `/search?q=${encodeURIComponent(query.trim())}`;
        }}
      >
        <Search size={21} />
        <input
          aria-label="現在想跟 Oliver 說什麼？"
          placeholder="現在想跟 Oliver 說什麼？"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="search-hint">中文、英文都可以</span>
        <button aria-label="搜尋教材" type="submit">
          <ArrowRight size={20} />
        </button>
      </form>
      <section className="adventure-hero">
        <div className="hero-copy">
          <div className="hero-label">
            <span className="little-star">✳</span> TODAY'S LITTLE ADVENTURE
          </div>
          <div className="time-badge">
            <Clock3 size={13} />約 5 分鐘 · 沒有倒數，只有陪伴
          </div>
          <h2>
            今天，和恐龍
            <br />
            一起出發吧。
          </h2>
          <p>
            找一隻喜歡的玩具，
            <br />
            把小小的英文，變成大大的日常。
          </p>
          <a className="button primary" href="#/today">
            開始今天的 5 分鐘
            <ArrowRight size={18} />
          </a>
          <div className="hero-footnote">
            <span />3 個單字
            <span />2 句英文
            <span />1 個小任務
          </div>
        </div>
        <div className="hero-visual">
          <div className="speech-bubble" lang="en">
            Let's play, {data.settings.nickname}!<span>今天想和我玩什麼？</span>
          </div>
          <Garden />
          <div className="art-caption">
            <span className="dashed-line" /> LITTLE MOMENTS, BIG DISCOVERIES <Leaf size={12} />
          </div>
        </div>
      </section>
      <div className="home-sections-heading">
        <div>
          <p className="eyebrow">EXPLORE TOGETHER</p>
          <h2>我們今天玩什麼？</h2>
        </div>
        <a href="#/favorites" className="text-button">
          <Bookmark size={16} />
          我的收藏
          <ChevronRight size={15} />
        </a>
      </div>
      <section className="entrance-grid" aria-label="六個主要功能">
        {entrances.map((entry) => (
          <a key={entry.number} className={`entrance-card ${entry.color}`} href={`#${entry.href}`}>
            <div className="entrance-top">
              <div className="illustrated-icon">
                <TopicIcon name={entry.icon} size={27} />
                <span className="icon-spark">✧</span>
              </div>
              <span className="entry-number">{entry.number}</span>
            </div>
            <h3>
              {entry.title === 'Oliver 成長紀錄'
                ? `${data.settings.nickname} 成長紀錄`
                : entry.title}
            </h3>
            <p>{entry.subtitle}</p>
            <div className="entrance-bottom">
              <span>{entry.label}</span>
              <ArrowUpRight size={18} />
            </div>
          </a>
        ))}
      </section>
      <section className="home-bottom">
        <div className="gentle-note">
          <div className="note-icon">
            <Heart size={21} />
          </div>
          <div>
            <h3>等一等，也是一種溫柔。</h3>
            <p>
              問完後，留給 {data.settings.nickname} 約 5 秒。
              <br className="mobile-only" />
              指一指、說一個字，都是很棒的開始。
            </p>
          </div>
          <span className="note-doodle">♡</span>
        </div>
        <a className="week-preview" href="#/progress">
          <div>
            <span className="eyebrow">THIS WEEK</span>
            <h3>
              這週，一起說了 <b>{summary.total}</b> 句英文
            </h3>
            <p>不用追趕，陪伴就是最好的進度。</p>
          </div>
          <div className="week-preview-icon">
            <TopicIcon name="sprout" size={29} />
            <ArrowUpRight size={17} />
          </div>
        </a>
      </section>
      {plan.classroom && (
        <a href="#/review" className="class-reminder">
          <CalendarDays size={17} />
          <span>今天是英文課日，回家挑一句熟悉的英文玩一玩。</span>
          <ArrowRight size={16} />
        </a>
      )}
      <footer className="home-footer">
        <Leaf size={13} />
        <span>Small words. Sweet moments. Growing together.</span>
      </footer>
    </div>
  );
}
