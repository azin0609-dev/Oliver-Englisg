import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  CircleHelp,
  Download,
  Home,
  Heart,
  Leaf,
  Menu,
  Settings,
  Square,
  WifiOff,
  X,
} from 'lucide-react';
import { Dino, TopicIcon } from './components/Art';
import { EmptyState } from './components/Cards';
import HomePage from './pages/Home';
import { ReviewPage, TodayPage, TopicPage, TopicsPage } from './pages/Learning';
import { DialoguePage, DialoguesPage } from './pages/Dialogues';
import { FavoritesPage, SearchPage } from './pages/Search';
import ProgressPage from './pages/Progress';
import SettingsPage from './pages/Settings';
import QuickPage from './pages/Quick';
import AboutPage from './pages/About';
import ClassNotesPage from './pages/ClassNotes';
import VoiceCheckPage from './pages/VoiceCheck';
import { useApp } from './lib/context';
import { usePwa } from './lib/pwa';
import { brand } from './lib/brand';
const navItems = [
  { href: '/', label: '冒險首頁', mobile: '首頁', icon: 'home' },
  { href: '/topics', label: '生活情境英文', mobile: '生活情境', icon: 'basket' },
  { href: '/dinosaur', label: '恐龍英文樂園', mobile: '恐龍樂園', icon: 'dino' },
  { href: '/dialogues', label: '親子對話練習', mobile: '親子對話', icon: 'message' },
  { href: '/progress', label: '成長紀錄', mobile: '成長紀錄', icon: 'sprout' },
];
function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(1) || '/');
  useEffect(() => {
    const update = () => setRoute(location.hash.slice(1) || '/');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}
export default function App() {
  const route = useRoute();
  const [path, query = ''] = route.split('?');
  const { data, notice, setNotice, storageWarning, online, speaking, stop } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const change = () => {
      setIsMobile(query.matches);
      if (!query.matches) setMobileMenu(false);
    };
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!mobileMenu) return;
    const previous = document.activeElement as HTMLElement | null;
    const sidebar = document.querySelector<HTMLElement>('.sidebar');
    sidebar?.querySelector<HTMLElement>('a')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenu(false);
      if (e.key === 'Tab' && sidebar) {
        const targets = [...sidebar.querySelectorAll<HTMLElement>('a[href],button')].filter(
          (el) => el.offsetParent !== null,
        );
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [mobileMenu]);
  const { ready, update, installUpdate } = usePwa();
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenu(false);
    stop();
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [path, stop]);
  const active = (href: string) =>
    href === '/'
      ? path === '/'
      : path.startsWith(href) ||
        (href === '/topics' && path.startsWith('/topic/')) ||
        (href === '/dialogues' && path.startsWith('/dialogue/'));
  const screen = () => {
    if (path === '/') return <HomePage />;
    if (path === '/voice-check') return <VoiceCheckPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/class-notes') return <ClassNotesPage />;
    if (path.startsWith('/quick/')) return <QuickPage key={path} id={path.split('/')[2]} />;
    if (path.startsWith('/practice/'))
      return <QuickPage key={path} practiceId={path.split('/')[2]} />;
    if (path === '/today') return <TodayPage />;
    if (path === '/topics') return <TopicsPage />;
    if (path.startsWith('/topic/')) return <TopicPage key={path} id={path.split('/')[2]} />;
    if (path === '/dinosaur') return <TopicPage key="dinosaur" id="toys" dinosaur />;
    if (path === '/review') return <ReviewPage />;
    if (path === '/dialogues') return <DialoguesPage />;
    if (path.startsWith('/dialogue/')) return <DialoguePage key={path} id={path.split('/')[2]} />;
    if (path === '/progress') return <ProgressPage />;
    if (path === '/settings') return <SettingsPage />;
    if (path === '/favorites') return <FavoritesPage />;
    if (path === '/search')
      return <SearchPage key={route} query={new URLSearchParams(query).get('q') ?? ''} />;
    return (
      <EmptyState
        title="這條小路，還沒有足跡。"
        description="回到首頁，開始一段新的小冒險吧。"
        href="#/"
        label="回到首頁"
      />
    );
  };
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        跳到主要內容
      </a>
      <aside inert={isMobile && !mobileMenu} className={`sidebar ${mobileMenu ? 'menu-open' : ''}`}>
        <a href="#/" className="brand" aria-label={`${brand.name} ${brand.englishName} 首頁`}>
          <span className="brand-mark">
            <Dino small />
          </span>
          <span>
            <strong>{brand.name}</strong>
            <span>{brand.englishName}</span>
            <small>免費親子美語</small>
          </span>
        </a>
        <button
          className="menu-close icon-button"
          onClick={() => setMobileMenu(false)}
          aria-label="關閉選單"
        >
          <X />
        </button>
        <div className="sidebar-section-label">一起探索生活</div>
        <nav className="sidebar-nav" aria-label="主選單">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={`#${item.href}`}
              className={active(item.href) ? 'active' : ''}
              aria-current={active(item.href) ? 'page' : undefined}
            >
              <TopicIcon name={item.icon} size={20} />
              <span>
                {item.href === '/progress' ? `${data.settings.nickname} 成長紀錄` : item.label}
              </span>
              {active(item.href) && <span className="nav-active-dot" />}
            </a>
          ))}
          <a href="#/review" className={active('/review') ? 'active' : ''}>
            <TopicIcon name="backpack" size={20} />
            <span>英文課複習</span>
          </a>
        </nav>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav secondary-nav" aria-label="個人功能">
          <a href="#/favorites" className={active('/favorites') ? 'active' : ''}>
            <Bookmark size={19} />
            <span>我的收藏</span>
          </a>
          <a href="#/settings" className={active('/settings') ? 'active' : ''}>
            <Settings size={19} />
            <span>爸媽的小設定</span>
          </a>
        </nav>
        <a href="#/about" className="about-nav-link">
          <Heart size={17} />
          <span>品牌說明・關於小冒險</span>
        </a>
        <div className="sidebar-bottom">
          <div className="sidebar-message">
            <span>✳</span>
            <p>
              Little by little,
              <br />a little becomes a lot.
            </p>
            <small>每天一點點，就很棒了。</small>
            <Leaf size={27} />
          </div>
          <a href="#/settings" className="install-link">
            <Download size={15} />
            加入 iPhone 主畫面
            <ArrowUpRight size={14} />
          </a>
          <div className="offline-status">
            <span className={ready ? 'ready' : ''} />
            {ready ? '教材已備妥，可離線使用' : '溫柔陪伴，不趕進度'}
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="menu-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="關閉導覽選單"
        />
      )}
      <div className="main-shell" inert={isMobile && mobileMenu}>
        <header className="mobile-header">
          <a className="mobile-brand" href="#/">
            <Dino />
            <span>
              {brand.name} <small>{brand.englishName}</small>
            </span>
          </a>
          <div>
            <a href="#/settings" className="icon-button" aria-label="爸媽的小設定">
              <Settings size={20} />
            </a>
            <button
              className="icon-button"
              aria-label="開啟完整選單"
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
          </div>
        </header>
        <div className="desktop-header">
          <div className="header-trail">
            <Home size={14} />
            <span>
              {brand.name} · {brand.englishName}
            </span>
            <span className="header-slash">/</span>
            <span>
              {path === '/'
                ? '今天也一起說英文吧'
                : path === '/settings'
                  ? '爸媽的小設定'
                  : '每個日常，都是小冒險'}
            </span>
          </div>
          <a href="#/about" className="parent-pill">
            <span>{data.settings.nickname.slice(0, 1)}</span>給 {data.settings.nickname} 的爸媽
            <CircleHelp size={16} />
          </a>
        </div>
        <div className="system-banners">
          {!online && (
            <div className="offline-banner" role="status">
              <WifiOff size={17} />
              <span>
                已離線 ·{' '}
                {ready
                  ? '教材、收藏與進度仍可使用；發音依裝置語音而定。'
                  : '本頁仍可使用；完整離線快取尚未確認。'}
              </span>
            </div>
          )}
          {storageWarning && (
            <div className="storage-warning" role="alert">
              {storageWarning}
              <a href="#/settings">前往備份</a>
            </div>
          )}
          {update && (
            <div className="update-banner">
              <Leaf size={17} />
              <span>新的小冒險準備好了。紀錄會保留。</span>
              <button onClick={installUpdate}>更新 App</button>
            </div>
          )}
        </div>
        <main id="main" tabIndex={-1}>
          {screen()}
        </main>
        <div className="main-bottom-note">
          <span className="cache-readiness">
            {import.meta.env.PROD ? (
              ready ? (
                <>
                  <Check size={11} />
                  教材已備妥，可離線使用
                </>
              ) : (
                '離線準備中，請保持連網；若長時間未完成請重新開啟。'
              )
            ) : (
              'MADE FOR LITTLE MOMENTS'
            )}
          </span>
          <span>Privacy first. Always.</span>
        </div>
      </div>
      <nav inert={isMobile && mobileMenu} className="bottom-nav" aria-label="手機導覽">
        {navItems.map((item) => (
          <a
            key={item.href}
            className={active(item.href) ? 'active' : ''}
            href={`#${item.href}`}
            aria-current={active(item.href) ? 'page' : undefined}
          >
            <TopicIcon name={item.icon} size={21} />
            <span>{item.mobile}</span>
          </a>
        ))}
      </nav>
      {speaking && (
        <div className="speech-player" role="status">
          <span className="playing-dots">
            <i />
            <i />
            <i />
          </span>
          <span>正在播放英文</span>
          <button onClick={stop}>
            <Square size={13} fill="currentColor" />
            停止播放
          </button>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          <p>{notice}</p>
          <button className="icon-button" aria-label="關閉提示" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
