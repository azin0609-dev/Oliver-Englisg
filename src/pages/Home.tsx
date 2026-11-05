import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  ChevronRight,
  Clock3,
  Heart,
  Search,
} from 'lucide-react';
import { Garden, TopicIcon } from '../components/Art';
import { useApp } from '../lib/context';
import { greeting } from '../lib/parenting';
import { quickSituations } from '../data/parentTools';
import { sentences } from '../data';
import { brand } from '../lib/brand';
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
    label: '孩子的最愛',
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
    title: '成長紀錄',
    subtitle: '每個小進步，都值得看見',
    icon: 'sprout',
    color: 'purple',
    href: '/progress',
    label: '陪伴留下的足跡',
  },
];
export default function HomePage() {
  const { data } = useApp();
  const [query, setQuery] = useState('');
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const refresh = () => setHour(new Date().getHours());
    const timer = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const hello = greeting(hour);
  const recent = sentences
    .filter((s) => data.records[s.id]?.lastPracticed)
    .sort((a, b) =>
      (data.records[b.id].lastPracticed ?? '').localeCompare(
        data.records[a.id].lastPracticed ?? '',
      ),
    )
    .slice(0, 3);
  const latestClass = data.classSessions[0];
  return (
    <div className="home-page parent-home">
      <section className="welcome">
        <div>
          <span className="home-welcome-label">
            <TopicIcon name={hello.icon} size={16} />
            給忙碌爸媽的日常美語小幫手
          </span>
          <h1 lang="en" aria-label={`${hello.english}, ${data.settings.nickname}!`}>
            {hello.english},{' '}
            <span>
              {data.settings.nickname}
              <svg viewBox="0 0 245 14" aria-hidden="true">
                <path
                  d="M3 9C68 0 151 0 241 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            !
          </h1>
          <p className="welcome-subtitle">{hello.chinese}</p>
        </div>
        <div className="welcome-note">
          <Heart size={16} />
          <span>
            手機留給爸媽
            <br />
            把陪伴留給孩子
          </span>
        </div>
      </section>
      <section className="right-now-section">
        <div className="home-sections-heading">
          <div>
            <p className="eyebrow">A LITTLE ENGLISH, RIGHT NOW</p>
            <h2>現在，你們在做什麼？</h2>
          </div>
          <span className="one-tap-note">點一下，就有一句能用</span>
        </div>
        <div className="quick-shortcut-grid">
          {quickSituations.map((q) => (
            <a key={q.id} href={`#/quick/${q.id}`} className={`quick-shortcut ${q.color}`}>
              <span className="shortcut-icon">
                <TopicIcon name={q.icon} size={22} />
              </span>
              <span>{q.title}</span>
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </section>
      <form
        className="home-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) location.hash = `/search?q=${encodeURIComponent(query.trim())}`;
        }}
      >
        <Search size={20} />
        <input
          aria-label={`現在想跟 ${data.settings.nickname} 說什麼？`}
          placeholder="想說別的？中文、英文都能找"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button aria-label="搜尋教材" type="submit">
          <ArrowRight size={20} />
        </button>
      </form>
      {recent.length > 0 && (
        <section className="recent-phrases">
          <div>
            <Clock3 size={14} />
            <span>上次一起說過的</span>
            <a href="#/favorites">
              <Bookmark size={14} />
              收藏
            </a>
          </div>
          {recent.map((s) => (
            <a href={`#/practice/${s.id}`} key={s.id}>
              <span lang="en">{s.english}</span>
              <ChevronRight size={15} />
            </a>
          ))}
        </section>
      )}
      <section className="adventure-hero">
        <div className="hero-copy">
          <div className="hero-label">TODAY’S LITTLE MOMENT</div>
          <h2>
            今天，
            <br />
            一句就很好。
          </h2>
          <p>
            一句英文，一個小動作。
            <br />
            想多玩一點，再繼續。
          </p>
          <a className="button primary" href="#/today">
            開始今天的一小段
            <ArrowRight size={17} />
          </a>
        </div>
        <div className="hero-visual">
          <div className="speech-bubble" lang="en">
            A little is lovely.<span>有你陪著，就很好。</span>
          </div>
          <Garden />
        </div>
      </section>
      {latestClass && (
        <a className="class-home-reminder" href="#/class-notes">
          <TopicIcon name="backpack" size={24} />
          <div>
            <strong>把上次英文課，帶進今天的生活。</strong>
            <span>{latestClass.date} 的小筆記已備妥，挑一句熟悉的玩一玩。</span>
          </div>
          <ArrowRight size={17} />
        </a>
      )}
      <div className="home-sections-heading">
        <div>
          <p className="eyebrow">MORE WAYS TO GROW TOGETHER</p>
          <h2>想多玩一點的時候</h2>
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
              </div>
              <span className="entry-number">{entry.number}</span>
            </div>
            <h3>
              {entry.href === '/progress'
                ? `${data.settings.nickname} 成長紀錄`
                : entry.href === '/today'
                  ? '今天的一小段'
                  : entry.title}
            </h3>
            <p>{entry.subtitle}</p>
            <div className="entrance-bottom">
              <span>
                {entry.href === '/dinosaur' ? `${data.settings.nickname} 的最愛` : entry.label}
              </span>
              <ArrowUpRight size={18} />
            </div>
          </a>
        ))}
      </section>
      <a className="brand-home-card" href="#/about">
        <span className="brand-story-mark">♡</span>
        <div>
          <span className="eyebrow">LITTLE MOMENTS · 品牌說明</span>
          <h2>
            英文不用很厲害，
            <br className="mobile-only" />
            也能把陪伴說成英文。
          </h2>
          <p>陪忙碌的 3–6 歲孩子爸媽，從一句日常美語開始。</p>
          <span className="brand-read-link">
            認識小日子英文
            <ArrowRight size={15} />
          </span>
        </div>
      </a>
      <footer className="home-footer">
        <Heart size={13} />
        <span>{brand.tagline}</span>
      </footer>
    </div>
  );
}
