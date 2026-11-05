import { useEffect, useState } from 'react';
import { ClipboardCheck, Copy, Square, Volume2, Turtle } from 'lucide-react';
import { PageHeading } from '../components/Cards';
import { useApp } from '../lib/context';
import { brand } from '../lib/brand';
import { preferredVoice, NORMAL_RATE, SLOW_RATE } from '../lib/speech';
import './voice-check.css';

const samples = [
  {
    id: 'daily',
    title: '生活句',
    texts: [
      'Shoes on!',
      "Let's wash your hands.",
      'Time for bed.',
      'Can you stomp like a dinosaur?',
      'Good night, sleep tight.',
    ],
  },
  {
    id: 'names',
    title: '困難名稱',
    texts: [
      'Triceratops',
      'Pteranodon',
      'Parasaurolophus',
      'Pachycephalosaurus',
      'Quetzalcoatlus',
      'chameleon',
      'tortoise',
      'cicada',
    ],
  },
];

function voiceSummary(voice?: SpeechSynthesisVoice) {
  return voice
    ? `${voice.name} | ${voice.lang} | ${voice.localService ? '裝置語音' : '線上系統語音'} | default=${voice.default}`
    : '尚未找到英文語音';
}

export default function VoiceCheckPage() {
  const { data, speak, stop } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceError, setVoiceError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [manualReport, setManualReport] = useState('');
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  useEffect(() => {
    const update = () => {
      try {
        setVoices(supported ? [...window.speechSynthesis.getVoices()] : []);
        setVoiceError('');
      } catch {
        setVoiceError('瀏覽器暫時無法提供聲音清單，請重新開啟本頁。');
      }
    };
    update();
    if (supported) window.speechSynthesis.addEventListener('voiceschanged', update);
    const retry = window.setTimeout(update, 750);
    return () => {
      clearTimeout(retry);
      if (supported) window.speechSynthesis.removeEventListener('voiceschanged', update);
    };
  }, [supported]);

  // Re-evaluate when iOS asynchronously provides its voices. The raw list is deliberately unfiltered.
  const automaticVoice = voices.length ? preferredVoice('') : undefined;
  const currentVoice = voices.length ? preferredVoice(data.settings.voiceURI) : undefined;
  const localPlayback = supported && currentVoice?.localService === true;

  function report() {
    return [
      `${brand.fullName} · v${brand.version} · Phase 0 語音檢測`,
      `裝置資訊：${navigator.userAgent}`,
      `Web Speech 支援：${supported ? '是' : '否'}`,
      `自動選擇：${voiceSummary(automaticVoice)}`,
      `目前選用：${voiceSummary(currentVoice)}`,
      `本頁可使用裝置語音播放：${localPlayback ? '是' : '否'}`,
      `正常語速：${NORMAL_RATE}；慢速：${SLOW_RATE}`,
      `裝置回報全部聲音：${voices.length} 個（未篩選）`,
      ...voices.map(
        (voice, i) =>
          `${i + 1}. name=${voice.name}; lang=${voice.lang}; localService=${voice.localService}; default=${voice.default}`,
      ),
      '以上只包含裝置與聲音資訊，不含孩子暱稱或學習紀錄。聽感與名字是否念對，請另附人工觀察。',
    ].join('\n');
  }

  function manualCopy(text: string) {
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.setAttribute('aria-hidden', 'true');
    field.style.position = 'fixed';
    field.style.top = '-9999px';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      /* Offer the visible manual copy below. */
    }
    field.remove();
    return copied;
  }

  async function copyReport() {
    const text = report();
    setCopyStatus('');
    setManualReport('');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus('已複製檢測結果，請貼回對話給開發者。');
        return;
      }
    } catch {
      /* Safari can deny clipboard access; keep the report available. */
    }
    if (manualCopy(text)) setCopyStatus('已複製檢測結果，請貼回對話給開發者。');
    else {
      setManualReport(text);
      setCopyStatus('這個瀏覽器無法自動複製。請長按下方文字，選擇全選與複製。');
    }
  }

  return (
    <div className="voice-check-page">
      <a className="back-link" href="#/settings">
        ← 回到爸媽的小設定
      </a>
      <PageHeading
        back={false}
        eyebrow="PHASE 0 · FOR PARENTS & DEVELOPERS"
        title="語音檢測"
        description="給家長與開發者確認裝置語音。這不是孩子的練習或測驗，不需要請孩子跟著念。"
      />
      <section className="voice-device-card" aria-label="裝置與選用聲音">
        <h2>這台裝置的聲音</h2>
        <dl>
          <dt>裝置資訊</dt>
          <dd className="device-agent">{navigator.userAgent}</dd>
          <dt>App 自動選擇</dt>
          <dd data-testid="automatic-voice">{voiceSummary(automaticVoice)}</dd>
          <dt>目前實際選用</dt>
          <dd data-testid="current-voice">{voiceSummary(currentVoice)}</dd>
        </dl>
        <p>
          完整清單包含平常不列入建議的角色音與其他語言。此頁只讀取資訊，不更動聲音設定、收藏或學習紀錄。
        </p>
        {!supported && (
          <p className="voice-check-warning" role="status">
            這個瀏覽器沒有提供 Web Speech 語音功能。你仍可複製檢測結果。
          </p>
        )}
        {supported && !voices.length && (
          <p className="voice-check-warning" role="status">
            聲音清單尚未載入。iPhone 可能需要稍等，或先到系統設定下載英文聲音，再重新開啟。
          </p>
        )}
        {currentVoice && !currentVoice.localService && (
          <p className="voice-check-warning" role="status">
            目前選用的是線上系統語音。為遵守本頁不對外連線的規則，這裡暫不播放；請先在系統下載英文裝置語音，再回設定頁選擇。
          </p>
        )}
        {voiceError && (
          <p className="voice-check-warning" role="alert">
            {voiceError}
          </p>
        )}
        <div className="voice-check-actions">
          <button
            className="button primary"
            onClick={() => {
              void copyReport();
            }}
          >
            <Copy size={17} />
            複製檢測結果
          </button>
          <button className="button secondary" onClick={stop}>
            <Square size={14} />
            停止播放
          </button>
        </div>
        {copyStatus && (
          <p className="copy-result" role="status">
            <ClipboardCheck size={16} />
            {copyStatus}
          </p>
        )}
        {manualReport && (
          <label className="manual-voice-report">
            檢測結果文字
            <textarea readOnly value={manualReport} onFocus={(e) => e.target.select()} />
          </label>
        )}
      </section>
      {samples.map((group) => (
        <section key={group.id} className="voice-test-section" aria-label={group.title}>
          <h2>{group.title}</h2>
          <p>由家長點擊播放。正常與慢速都念完整文字，請記下聽起來怪或念錯的項目。</p>
          <div className="voice-test-list">
            {group.texts.map((text) => (
              <article key={text} className="voice-test-row">
                <p lang="en">{text}</p>
                <div>
                  <button
                    disabled={!localPlayback}
                    onClick={() => speak(text)}
                    aria-label={`正常：${text}`}
                  >
                    <Volume2 size={16} />
                    正常
                  </button>
                  <button
                    disabled={!localPlayback}
                    onClick={() => speak(text, true)}
                    aria-label={`慢速：${text}`}
                  >
                    <Turtle size={16} />
                    慢速
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section className="voice-raw-section">
        <h2>
          裝置提供的全部聲音 <span>共 {voices.length} 個</span>
        </h2>
        <p>
          localService 表示瀏覽器回報為裝置語音；default 表示裝置的預設聲音，不代表 App
          一定選用它。清單會隨 voiceschanged 更新。
        </p>
        <div className="voice-table-wrap">
          <table>
            <caption className="visually-hidden">完整裝置聲音清單，未篩除角色音或其他語言</caption>
            <thead>
              <tr>
                <th scope="col">name</th>
                <th scope="col">lang</th>
                <th scope="col">localService</th>
                <th scope="col">default</th>
              </tr>
            </thead>
            <tbody>
              {voices.map((voice, i) => (
                <tr key={`${voice.voiceURI}-${i}`}>
                  <th scope="row">{voice.name}</th>
                  <td>{voice.lang}</td>
                  <td>{String(voice.localService)}</td>
                  <td>{String(voice.default)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!voices.length && <p className="empty-voices">目前沒有聲音可列出。</p>}
      </section>
      <p className="voice-check-privacy">
        檢測頁沒有
        fetch、XHR、上傳或儲存功能。結果只在畫面記憶體中，由你決定是否複製分享；僅允許瀏覽器標為裝置語音的聲音在此播放。
      </p>
    </div>
  );
}
