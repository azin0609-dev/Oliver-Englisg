import { useState } from 'react';
import { ArrowRight, BookOpen, Check, Pencil, X } from 'lucide-react';
import { useApp } from '../lib/context';
import { localDate } from '../lib/dates';
import { lessonTopics } from '../data/parentTools';
import { sentences } from '../data';
import { PageHeading, SpeechButtons } from '../components/Cards';
export default function ClassNotesPage() {
  const { data, saveClassSession, daily } = useApp();
  const [date, setDate] = useState(localDate());
  const [topics, setTopics] = useState<string[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState('');
  const [saved, setSaved] = useState(false);
  const choices = [
    ...new Set(lessonTopics.filter((t) => topics.includes(t.id)).flatMap((t) => t.sentenceIds)),
  ].map((id) => sentences.find((s) => s.id === id)!);
  function toggleTopic(id: string) {
    const next = topics.includes(id) ? topics.filter((t) => t !== id) : [...topics, id];
    setTopics(next);
    const available = new Set(
      lessonTopics.filter((t) => next.includes(t.id)).flatMap((t) => t.sentenceIds),
    );
    setIds(ids.filter((id) => available.has(id)));
    setSaved(false);
  }
  return (
    <div>
      <PageHeading
        eyebrow="FROM CLASS TO HOME"
        title="今天課堂，玩了什麼？"
        description="花一點點時間記下來，讓課堂裡熟悉的英文陪孩子回家。"
      />
      <form
        className="class-notes-form settings-section"
        onSubmit={(e) => {
          e.preventDefault();
          if (!topics.length && !note.trim()) return;
          if (
            !saveClassSession({
              id: editing || crypto.randomUUID(),
              date,
              topics,
              sentenceIds: ids,
              note: note.trim(),
            })
          )
            return;
          setEditing('');
          setSaved(true);
        }}
      >
        <label htmlFor="class-date">上課日期</label>
        <input
          id="class-date"
          type="date"
          max={localDate()}
          required
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSaved(false);
          }}
        />
        <fieldset>
          <legend>今天出現了哪些主題？</legend>
          <div className="class-topic-options">
            {lessonTopics.map((t) => (
              <button
                type="button"
                key={t.id}
                aria-pressed={topics.includes(t.id)}
                className={topics.includes(t.id) ? 'selected' : ''}
                onClick={() => toggleTopic(t.id)}
              >
                {topics.includes(t.id) && <Check size={14} />} {t.name}
              </button>
            ))}
          </div>
        </fieldset>
        {choices.length > 0 && (
          <fieldset>
            <legend>
              想帶回家用的句子 <span>選 0–3 句就好</span>
            </legend>
            <div className="class-sentence-options">
              {choices.map((sentence) => (
                <label key={sentence.id}>
                  <input
                    type="checkbox"
                    checked={ids.includes(sentence.id)}
                    disabled={!ids.includes(sentence.id) && ids.length >= 3}
                    onChange={() => {
                      setIds(
                        ids.includes(sentence.id)
                          ? ids.filter((id) => id !== sentence.id)
                          : [...ids, sentence.id],
                      );
                      setSaved(false);
                    }}
                  />
                  <span>
                    <strong lang="en">{sentence.english}</strong>
                    <small>{sentence.traditionalChinese}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label htmlFor="class-note">
          爸媽的小筆記 <span>選填；例如今天很喜歡橘色磁鐵</span>
        </label>
        <textarea
          id="class-note"
          maxLength={280}
          value={note}
          placeholder="孩子喜歡什麼、老師示範了哪一句…"
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
        />
        <p className="field-description">
          只依你記下的內容安排複習，不推測孩子已經學會。近兩週的主題與句子會加入下次推薦。
        </p>
        <div className="backup-actions">
          <button
            className="button primary"
            type="submit"
            disabled={saved || (!topics.length && !note.trim())}
          >
            <Check size={17} />
            {saved ? '已好好記下來' : '儲存課堂筆記'}
          </button>
          {editing && (
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setEditing('');
                setTopics([]);
                setIds([]);
                setNote('');
              }}
            >
              <X size={16} />
              取消編輯
            </button>
          )}
        </div>
        {saved && (
          <a className="next-gentle-link" href="#/today" onClick={() => daily('replace')}>
            用最近課堂內容換一組
            <ArrowRight size={16} />
          </a>
        )}
      </form>
      <section className="lesson-section">
        <div className="section-title">
          <BookOpen size={22} />
          <h2>帶回家的小足跡</h2>
        </div>
        {!data.classSessions.length ? (
          <p className="empty-note">還沒有課堂筆記。記一個主題就可以，不用寫成上課報告。</p>
        ) : (
          data.classSessions.map((session) => (
            <article className="class-note-card" key={session.id}>
              <div className="journal-card-top">
                <span>{session.date.replaceAll('-', ' / ')}</span>
                <button
                  className="text-button"
                  onClick={() => {
                    setDate(session.date);
                    setTopics(session.topics);
                    setIds(session.sentenceIds);
                    setNote(session.note);
                    setEditing(session.id);
                    setSaved(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Pencil size={14} />
                  編輯
                </button>
              </div>
              <div className="journal-tags">
                {session.topics.map((id) => (
                  <span key={id}>{lessonTopics.find((t) => t.id === id)?.name}</span>
                ))}
              </div>
              {session.note && <p>{session.note}</p>}
              {session.sentenceIds.map((id) => {
                const s = sentences.find((s) => s.id === id)!;
                return (
                  <div className="class-note-line" key={id}>
                    <a lang="en" href={`#/practice/${id}`}>
                      {s.english}
                    </a>
                    <SpeechButtons text={s.english} compact />
                  </div>
                );
              })}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
