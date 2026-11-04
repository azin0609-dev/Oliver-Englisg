import { useState } from 'react';
import { Check, Heart, Pencil, Plus, X } from 'lucide-react';
import { useApp } from '../lib/context';
import { localDate } from '../lib/dates';
export default function MemoryJournal() {
  const { data, saveMemory } = useApp();
  const [open, setOpen] = useState(() =>
    new URLSearchParams(location.hash.split('?')[1]).has('note'),
  );
  const [date, setDate] = useState(localDate());
  const [quote, setQuote] = useState('');
  const [context, setContext] = useState('');
  const [editing, setEditing] = useState('');
  function reset() {
    setQuote('');
    setContext('');
    setEditing('');
    setDate(localDate());
    setOpen(false);
  }
  return (
    <section className="memory-journal">
      <div className="memory-intro">
        <span className="eyebrow">LITTLE MOMENTS WORTH KEEPING</span>
        <h2>想記住的，是這樣的小時刻。</h2>
        <p>
          自己開口、指給你看、第一次聽懂一句話……
          <br />
          不需要每次記錄，偶爾留下一個小發現就好。
        </p>
        <button className="button primary" onClick={() => setOpen(true)}>
          <Plus size={17} />
          記下今天的小發現
        </button>
      </div>
      {open && (
        <form
          className="memory-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!context.trim()) return;
            if (
              saveMemory({
                id: editing || crypto.randomUUID(),
                date,
                quote: quote.trim(),
                context: context.trim(),
              })
            )
              reset();
          }}
        >
          <div className="journal-card-top">
            <h3>{editing ? '編輯小發現' : '今天，發生了什麼？'}</h3>
            <button
              type="button"
              className="icon-button"
              aria-label="關閉小發現表單"
              onClick={reset}
            >
              <X size={18} />
            </button>
          </div>
          <label htmlFor="memory-date">這一天</label>
          <input
            id="memory-date"
            type="date"
            max={localDate()}
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
          />
          <label htmlFor="memory-quote">
            孩子說了什麼？ <span>選填；中文、英文或一個字都可以</span>
          </label>
          <input
            id="memory-quote"
            maxLength={160}
            value={quote}
            placeholder="例如：More bubbles!"
            onChange={(e) => setQuote(e.target.value)}
          />
          <label htmlFor="memory-context">當時在做什麼？</label>
          <textarea
            id="memory-context"
            required
            maxLength={280}
            value={context}
            placeholder="例如：洗澡時自己指著泡泡說，沒有提醒他。"
            onChange={(e) => setContext(e.target.value)}
          />
          <button className="button primary" type="submit" disabled={!context.trim()}>
            <Check size={17} />
            保存這個小時刻
          </button>
          <p className="small-note">只存在這台裝置，也會一起放進 JSON 備份。</p>
        </form>
      )}
      {data.memories.length ? (
        <div className="memory-timeline">
          {data.memories.map((memory) => (
            <article key={memory.id} className="memory-card">
              <div className="journal-card-top">
                <span>
                  <Heart size={14} />
                  {memory.date.replaceAll('-', ' / ')}
                </span>
                <button
                  className="text-button"
                  onClick={() => {
                    setDate(memory.date);
                    setQuote(memory.quote);
                    setContext(memory.context);
                    setEditing(memory.id);
                    setOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Pencil size={14} />
                  編輯
                </button>
              </div>
              {memory.quote && <blockquote>{memory.quote}</blockquote>}
              <p>{memory.context}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="journal-empty">
          <Heart size={26} />
          <p>
            這裡還沒有筆記，沒有關係。
            <br />
            你們一起度過的日常，已經很珍貴。
          </p>
        </div>
      )}
    </section>
  );
}
