import { useRef, useState } from 'react';
import {
  Check,
  Download,
  FileJson,
  Heart,
  Info,
  Plus,
  Share,
  ShieldCheck,
  Smartphone,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import type { AppData, Difficulty } from '../types';
import { useApp } from '../lib/context';
import { exportBackup, parseBackup } from '../lib/storage';
import { localDate } from '../lib/dates';
import { PageHeading } from '../components/Cards';
export default function SettingsPage() {
  const { data, settings, voices, speak, setNotice, replaceData } = useApp();
  const [nickname, setNickname] = useState(data.settings.nickname);
  const [pending, setPending] = useState<AppData | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  function download() {
    const url = URL.createObjectURL(new Blob([exportBackup(data)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `oliver-english-${localDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    setNotice('備份檔已交給瀏覽器下載。iPhone 可在「檔案」App 的下載項目查看。');
  }
  async function readFile(file?: File) {
    setError('');
    setPending(null);
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('備份檔請小於 2 MB。目前的資料未變更。');
      return;
    }
    try {
      setPending(parseBackup(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : '無法讀取檔案。目前的資料未變更。');
    }
    if (inputRef.current) inputRef.current.value = '';
  }
  return (
    <div className="settings-page">
      <PageHeading
        eyebrow="MAKE A LITTLE ROOM FOR YOU"
        title="爸媽的小設定"
        description="用適合你們家的方式，開始每一天的小冒險。"
      />
      <section className="settings-section">
        <div className="settings-title">
          <Heart size={21} />
          <h2>孩子的學習節奏</h2>
        </div>
        <form
          className="nickname-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!nickname.trim()) return;
            settings({ nickname: nickname.trim() });
            setNotice('顯示暱稱已儲存。');
          }}
        >
          <label htmlFor="nickname">
            顯示暱稱<span>不用真實姓名，也不需要生日。</span>
          </label>
          <div>
            <input
              id="nickname"
              value={nickname}
              maxLength={32}
              required
              onChange={(e) => setNickname(e.target.value)}
            />
            <button className="button secondary" type="submit">
              <Check size={16} />
              儲存
            </button>
          </div>
        </form>
        <fieldset className="settings-fieldset">
          <legend>目前的學習程度</legend>
          <p className="field-description">建議從 Level 2 開始，也會搭配熟悉的短句與少量挑戰。</p>
          <div className="level-options">
            {[
              { n: 1, en: 'Understand', zh: '先聽懂、做動作' },
              { n: 2, en: 'Respond', zh: '練習回應與選擇' },
              { n: 3, en: 'Express', zh: '自在表達想法' },
            ].map((l) => (
              <button
                key={l.n}
                className={data.settings.difficulty === l.n ? 'selected' : ''}
                aria-pressed={data.settings.difficulty === l.n}
                onClick={() => {
                  settings({ difficulty: l.n as Difficulty });
                  setNotice('學習程度已調整，今日建議也已更新。');
                }}
              >
                <span>Level {l.n}</span>
                <strong>{l.en}</strong>
                <small>{l.zh}</small>
                {data.settings.difficulty === l.n && <Check size={16} />}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="settings-fieldset">
          <legend>每週的英文課日</legend>
          <p className="field-description">這些日子會優先推薦課堂複習，可複選或全部取消。</p>
          <div className="day-options">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
              <button
                key={day}
                aria-pressed={data.settings.classDays.includes(i)}
                className={data.settings.classDays.includes(i) ? 'selected' : ''}
                onClick={() =>
                  settings({
                    classDays: data.settings.classDays.includes(i)
                      ? data.settings.classDays.filter((d) => d !== i)
                      : [...data.settings.classDays, i],
                  })
                }
              >
                週{day}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="settings-section">
        <div className="settings-title">
          <Volume2 size={22} />
          <h2>英文語音</h2>
        </div>
        <label htmlFor="voice">裝置提供的英文聲音</label>
        <select
          id="voice"
          className="full-select"
          value={data.settings.voiceURI}
          onChange={(e) => settings({ voiceURI: e.target.value })}
        >
          <option value="">自動選擇 · 優先美式英文 en-US</option>
          {voices.map((v) => (
            <option value={v.voiceURI} key={v.voiceURI}>
              {v.name} · {v.lang}
              {v.localService ? ' · 裝置語音' : ''}
            </option>
          ))}
        </select>
        {data.settings.voiceURI && !voices.some((v) => v.voiceURI === data.settings.voiceURI) && (
          <p className="inline-warning">
            原本選擇的聲音在這台裝置不可用，播放時會自動使用其他英文聲音。
          </p>
        )}
        <button
          className="button secondary"
          onClick={() => speak(`Hello, ${data.settings.nickname}! Let's play together.`)}
        >
          <Volume2 size={17} />
          試聽英文聲音
        </button>
        <div className="info-note">
          <Info size={19} />
          <p>
            {voices.length
              ? '發音品質與離線可用性依裝置語音而異。點擊播放才會出聲，每次只播放一句，也可以隨時停止。'
              : '尚未找到英文語音。iPhone 可至「設定 → 輔助使用 → 朗讀內容／閱讀與朗讀 → 聲音 → 英文」下載後再開啟 App。'}{' '}
            本 App
            不會開啟麥克風。標示「裝置語音」的聲音適合離線使用；部分其他聲音會使用系統供應商的連線服務。
          </p>
        </div>
      </section>
      <section className="settings-section" id="backup">
        <div className="settings-title">
          <FileJson size={22} />
          <h2>把陪伴好好保存</h2>
        </div>
        <p>
          紀錄只在這台裝置。清除網站資料、移除 App 或更換手機可能遺失紀錄，建議定期匯出 JSON
          備份。爸爸與媽媽的手機目前各自儲存，沒有自動同步。
        </p>
        <div className="backup-actions">
          <button className="button primary" onClick={download}>
            <Download size={18} />
            匯出學習資料
          </button>
          <button className="button secondary" onClick={() => inputRef.current?.click()}>
            <Upload size={18} />
            匯入 JSON 備份
          </button>
        </div>
        <input
          className="visually-hidden"
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          aria-label="選擇 JSON 備份檔案"
          onChange={(e) => {
            void readFile(e.target.files?.[0]);
          }}
        />
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {pending && (
          <div className="import-preview" role="region" aria-label="備份匯入確認">
            <h3>備份格式正確，準備好了。</h3>
            <p>
              暱稱：{pending.settings.nickname} · {Object.keys(pending.records).length} 筆紀錄 ·{' '}
              {pending.history.length} 筆每日練習
            </p>
            <p>匯入會取代這台裝置目前的紀錄與設定。建議先匯出現在的資料。</p>
            <div>
              <button
                className="button primary"
                onClick={() => {
                  replaceData(pending);
                  setNickname(pending.settings.nickname);
                  setPending(null);
                }}
              >
                <Check size={16} />
                確認取代並匯入
              </button>
              <button className="button ghost" onClick={() => setPending(null)}>
                <X size={16} />
                取消
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="settings-section" id="install">
        <div className="settings-title">
          <Smartphone size={22} />
          <h2>加入 iPhone 主畫面</h2>
        </div>
        <p>
          使用 Safari 開啟正式的 HTTPS 網址，再跟著下面做。第一次請連網開啟，讓教材完成離線快取。
        </p>
        <ol className="install-steps">
          <li>
            <span>
              <Share size={19} />
            </span>
            <div>
              <strong>在 Safari 點一下「分享」</strong>
              <p>依 iOS 版本，按鈕可能在網址列旁或選單內。</p>
            </div>
          </li>
          <li>
            <span>
              <Plus size={20} />
            </span>
            <div>
              <strong>選擇「加入主畫面」</strong>
              <p>需要時往下滑；若有「以 Web App 開啟」，請保持開啟。</p>
            </div>
          </li>
          <li>
            <span>
              <Check size={20} />
            </span>
            <div>
              <strong>點選「加入」，再從主畫面開啟</strong>
              <p>完成快取後，就能離線看教材、收藏與儲存進度。</p>
            </div>
          </li>
        </ol>
        <p className="small-note">
          語音離線可用性取決於系統已下載的英文聲音。Safari 與主畫面 App 的資料空間可能依 iOS
          版本而異，切換前請先備份。
        </p>
      </section>
      <section className="privacy-card">
        <ShieldCheck size={29} />
        <div>
          <h2>小小的學習，安心的空間。</h2>
          <p>
            沒有帳號、廣告、AI API
            或第三方追蹤。不錄音、不使用麥克風、不取得位置，也不上傳學習紀錄。內建教材與原創 SVG
            插畫隨 App 提供，僅在裝置本機保存你的設定與紀錄。
          </p>
          <span>Oliver's English Adventure · v1.0.0</span>
        </div>
      </section>
    </div>
  );
}
