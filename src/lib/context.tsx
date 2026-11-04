import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AppData,
  ClassSession,
  LearningRecord,
  Mastery,
  MemoryNote,
  Settings,
} from '../types';
import { blankRecord, readData, recordPractice, writeData } from './storage';
import { englishVoices, preferredVoice, NORMAL_RATE, SLOW_RATE } from './speech';
import { localDate } from './dates';
import { dailyPlan, planIds } from './recommendations';
const useAppState = () => {
  const initial = useRef<ReturnType<typeof readData> | null>(null);
  if (!initial.current) initial.current = readData();
  const [data, setData] = useState(initial.current.data);
  const dataRef = useRef(data);
  const [notice, setNotice] = useState('');
  const [storageWarning, setStorageWarning] = useState(initial.current.warning);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sequenceRef = useRef(0);
  const [online, setOnline] = useState(navigator.onLine);
  const commit = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
    setStorageWarning(
      writeData(next)
        ? ''
        : '這次變更尚未存入裝置。請先匯出備份，再檢查 Safari 儲存空間；重新開啟可能會遺失變更。',
    );
  }, []);
  const [day, setDay] = useState(localDate());
  useEffect(() => {
    const refresh = () => setDay(localDate());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  // Freeze today's plan until the parent explicitly replaces it. Logging a practice must not reshuffle cards.
  const [plan, setPlan] = useState(() => dailyPlan(data));
  useEffect(() => {
    const current = dataRef.current;
    const daily =
      current.daily.date === day
        ? current.daily
        : { date: day, seed: 0, completed: [], selection: [], skipped: false };
    const selected = dailyPlan({ ...current, daily });
    setPlan(selected);
    if (!initial.current?.warning && (!daily.selection.length || current.daily.date !== day))
      commit({ ...current, daily: { ...daily, selection: planIds(selected) } });
  }, [day, commit]);
  const record = (id: string): LearningRecord => data.records[id] ?? blankRecord;
  const practice = (id: string, mastery?: Mastery) =>
    commit(recordPractice(dataRef.current, id, mastery));
  const favorite = (id: string) => {
    const current = dataRef.current;
    const r = current.records[id] ?? blankRecord;
    commit({ ...current, records: { ...current.records, [id]: { ...r, favorite: !r.favorite } } });
  };
  const settings = (value: Partial<Settings>) => {
    const next = { ...dataRef.current, settings: { ...dataRef.current.settings, ...value } };
    if (value.difficulty !== undefined || value.classDays !== undefined) {
      next.daily = { ...next.daily, date: localDate(), completed: [], selection: [] };
      const selected = dailyPlan(next);
      next.daily.selection = planIds(selected);
      setPlan(selected);
    }
    commit(next);
  };
  const daily = (action: 'replace' | 'skip' | 'resume' | 'complete', id?: string) => {
    const current = dataRef.current;
    const state =
      current.daily.date === localDate()
        ? current.daily
        : { date: localDate(), seed: 0, completed: [], selection: [], skipped: false };
    const next = { ...current, daily: { ...state } };
    if (action === 'replace') {
      next.daily.seed++;
      next.daily.completed = [];
      next.daily.selection = [];
      next.daily.skipped = false;
    }
    if (action === 'skip') next.daily.skipped = true;
    if (action === 'resume') next.daily.skipped = false;
    if (action === 'complete' && id && !next.daily.completed.includes(id))
      next.daily.completed = [...next.daily.completed, id].slice(-7);
    if (action === 'replace') {
      const selected = dailyPlan(next);
      next.daily.selection = planIds(selected);
      setPlan(selected);
    }
    commit(next);
  };
  const stop = useCallback(() => {
    sequenceRef.current++;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking('');
  }, []);
  const speak = (text: string, slow = false) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setNotice('這個瀏覽器沒有語音播放功能。你可以照著英文示範，或改用 Safari。');
      return;
    }
    stop();
    const voice = preferredVoice(dataRef.current.settings.voiceURI);
    if (!voice) {
      setNotice(
        '尚未找到裝置的英文語音。可到 iPhone「設定 → 輔助使用 → 朗讀內容／閱讀與朗讀 → 聲音 → 英文」下載語音，再回來試試。你也可以直接照著英文說。',
      );
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = slow ? SLOW_RATE : NORMAL_RATE;
    const sequence = sequenceRef.current;
    utterance.onend = () => {
      if (sequence === sequenceRef.current) {
        setSpeaking('');
        utteranceRef.current = null;
      }
    };
    utterance.onerror = (event) => {
      if (sequence !== sequenceRef.current) return;
      setSpeaking('');
      if (!['interrupted', 'canceled'].includes(event.error))
        setNotice('這次語音未能播放，請再點一次。離線發音取決於裝置已下載的英文語音。');
    };
    utteranceRef.current = utterance; // Safari needs a retained reference.
    setSpeaking(text);
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance); // Called synchronously from the parent's tap, including on iOS.
  };
  useEffect(() => {
    const update = () => setVoices(englishVoices());
    update();
    if ('speechSynthesis' in window)
      window.speechSynthesis.addEventListener('voiceschanged', update);
    const timer = window.setTimeout(update, 500);
    const connected = () => setOnline(navigator.onLine);
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener('online', connected);
    window.addEventListener('offline', connected);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window)
        window.speechSynthesis.removeEventListener('voiceschanged', update);
      window.removeEventListener('online', connected);
      window.removeEventListener('offline', connected);
      document.removeEventListener('visibilitychange', hidden);
      stop();
    };
  }, [stop]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 8000);
    return () => clearTimeout(timer);
  }, [notice]);
  const replaceData = (next: AppData) => {
    stop();
    const restored = {
      ...next,
      daily:
        next.daily.date === localDate()
          ? next.daily
          : { date: localDate(), seed: 0, completed: [], selection: [], skipped: false },
    };
    const selected = dailyPlan(restored);
    restored.daily = { ...restored.daily, selection: planIds(selected) };
    commit(restored);
    setPlan(selected);
    setNotice('備份已匯入。學習紀錄與設定已更新。');
  };
  const saveClassSession = (session: ClassSession) => {
    const current = dataRef.current;
    if (
      current.classSessions.length >= 200 &&
      !current.classSessions.some((c) => c.id === session.id)
    ) {
      setNotice('課堂筆記已滿，現有筆記都會保留。請先匯出備份，你仍可編輯舊筆記。');
      return false;
    }
    const sessions = [session, ...current.classSessions.filter((c) => c.id !== session.id)].sort(
      (a, b) => b.date.localeCompare(a.date),
    );
    commit({ ...current, classSessions: sessions });
    setNotice('課堂筆記已保存。下次換一組或明天開始，會優先安排近兩週的課堂內容。');
    return true;
  };
  const saveMemory = (memory: MemoryNote) => {
    const current = dataRef.current;
    if (current.memories.length >= 300 && !current.memories.some((m) => m.id === memory.id)) {
      setNotice('小發現筆記已滿，現有回憶都會保留。請先匯出備份，你仍可編輯舊筆記。');
      return false;
    }
    commit({
      ...current,
      memories: [memory, ...current.memories.filter((m) => m.id !== memory.id)].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    });
    setNotice('今天的小發現，已經好好收進成長紀錄了。');
    return true;
  };
  return {
    saveClassSession,
    saveMemory,
    data,
    record,
    practice,
    favorite,
    settings,
    daily,
    plan,
    notice,
    setNotice,
    storageWarning,
    voices,
    speak,
    speaking,
    stop,
    online,
    replaceData,
  };
};
type AppContextValue = ReturnType<typeof useAppState>;
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppState();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() {
  const app = useContext(AppContext);
  if (!app) throw new Error('Missing AppProvider');
  return app;
}
