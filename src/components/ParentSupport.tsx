import { useState } from 'react';
import { ArrowRight, Check, Heart, MessageCircle, Volume2 } from 'lucide-react';
import { useApp } from '../lib/context';
import { phraseChunks } from '../lib/speech';
import { responseSupport } from '../lib/parenting';
import { FavoriteButton, MasteryPicker } from './LearningControls';
import { SpeechButtons } from './SpeechButtons';
import type { Sentence } from '../types';
export function PhraseHelp({ text }: { text: string }) {
  const { speak } = useApp();
  const chunks = phraseChunks(text);
  if (chunks.length < 2) return null;
  return (
    <details className="phrase-help">
      <summary>想先聽短一點？分段示範</summary>
      <p>先聽小段，再按上方播放整句。跟著說一次就好。</p>
      <div>
        {chunks.map((chunk, i) => (
          <button key={i} onClick={() => speak(chunk)} lang="en">
            <Volume2 size={15} />
            {chunk}
          </button>
        ))}
      </div>
    </details>
  );
}
export function ResponseSupport({ reply }: { reply: string }) {
  const [active, setActive] = useState<string>('quiet');
  const options = responseSupport(reply);
  const selected = options.find((o) => o.id === active)!;
  return (
    <details className="response-support">
      <summary>
        <MessageCircle size={16} />
        孩子沒有照範例回答？
      </summary>
      <p className="support-intro">每種回應都可以。選一個當下的情況，找一句接得下去的話。</p>
      <div className="response-choices" aria-label="孩子的回應">
        {options.map((option) => (
          <button
            key={option.id}
            aria-pressed={active === option.id}
            onClick={() => setActive(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="response-example">
        <p lang="en">{selected.english}</p>
        <span>{selected.chinese}</span>
        <SpeechButtons text={selected.english} />
      </div>
      <p className="response-tip">{selected.tip}</p>
    </details>
  );
}
export function QuickSession({
  sentence,
  action,
  materials,
  onComplete,
  completed = false,
}: {
  sentence: Sentence;
  action: string;
  materials?: string;
  onComplete: () => void;
  completed?: boolean;
}) {
  const { data, stop } = useApp();
  return (
    <section className="quick-session">
      <div className="quick-session-top">
        <span className="tag">一句英文，一個小動作</span>
        <FavoriteButton id={sentence.id} english={sentence.english} />
      </div>
      <span className="session-label">爸媽先說</span>
      <h2 className="english-text" lang="en">
        {sentence.english}
      </h2>
      <p className="translation">{sentence.traditionalChinese}</p>
      <SpeechButtons text={sentence.english} />
      <PhraseHelp text={sentence.english} />
      <div className="action-recipe">
        <span>
          <Heart size={16} />
          接著，一起做
        </span>
        <p>{action}</p>
        {materials && <small>身邊準備：{materials}</small>}
      </div>
      <ResponseSupport reply={sentence.suggestedReply} />
      {!completed ? (
        <button
          className="button primary session-done"
          onClick={() => {
            stop();
            onComplete();
          }}
        >
          <Check size={18} />
          我們玩過了，今天先到這裡
        </button>
      ) : (
        <div className="session-finished" role="status">
          <Heart size={23} />
          <h3>這一小段陪伴，就很好。</h3>
          <p>把手機放下，繼續你們的日常。</p>
          <details className="observation-later">
            <summary>稍後記下 {data.settings.nickname} 的小進步（選用）</summary>
            <MasteryPicker id={sentence.id} />
            <a href="#/progress?note=1" className="text-button">
              留一段今天的小發現
              <ArrowRight size={15} />
            </a>
          </details>
        </div>
      )}
    </section>
  );
}
