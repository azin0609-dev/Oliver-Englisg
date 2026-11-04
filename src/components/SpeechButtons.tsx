import { Volume2, Turtle } from 'lucide-react';
import { useApp } from '../lib/context';
export function SpeechButtons({ text, compact = false }: { text: string; compact?: boolean }) {
  const { speak, speaking } = useApp();
  return (
    <div className={`speech-actions ${compact ? 'compact' : ''}`}>
      <button
        className={`play-button ${speaking === text ? 'is-playing' : ''}`}
        onClick={() => speak(text)}
        aria-label={`播放英文：${text}`}
      >
        <Volume2 size={17} />
        {!compact && '播放英文'}
      </button>
      <button
        className="slow-button"
        onClick={() => speak(text, true)}
        aria-label={`慢速播放：${text}`}
      >
        <Turtle size={17} />
        {!compact && '慢速'}
      </button>
    </div>
  );
}
