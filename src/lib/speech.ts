export const NORMAL_RATE = 0.96;
export const SLOW_RATE = 0.82;
// iOS includes novelty voices that are English but unsuitable for a parent model.
const noveltyNames = new Set([
  'albert',
  'badnews',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'goodnews',
  'hysterical',
  'jester',
  'junior',
  'organ',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
  'grandma',
  'grandpa',
  'rocko',
  'fred',
  'flo',
  'eddy',
  'reed',
  'sandy',
  'shelley',
]);
export function isNaturalVoice(voice: Pick<SpeechSynthesisVoice, 'name' | 'lang'>): boolean {
  if (!/^en[-_]/i.test(voice.lang)) return false;
  const name = voice.name.toLowerCase().replace(/[^a-z]/g, '');
  return (
    ![...noveltyNames].some(
      (n) => name === n || name.startsWith(`${n}en`) || name.includes(`novelty${n}`),
    ) && !/novelty|singing|whisper|funny|robot|character/i.test(voice.name)
  );
}
export function rankVoices(source: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const natural = source.filter(isNaturalVoice);
  const american = natural.filter((v) => /^en[-_]US$/i.test(v.lang));
  const pool = american.length ? american : natural;
  const score = (v: SpeechSynthesisVoice) =>
    (/samantha/i.test(v.name) ? 100 : 0) +
    (/enhanced|premium|natural|neural/i.test(v.name) ? 35 : 0) +
    (/\b(alex|ava|allison|tom|jenny|aria|guy)\b/i.test(v.name) ? 25 : 0) +
    (/google.*(us|united states)|microsoft.*english/i.test(v.name) ? 20 : 0) +
    (v.default ? 15 : 0) +
    (v.localService ? 5 : 0);
  const neutral = pool.filter((v) =>
    /samantha|\balex\b|\bava\b|allison|\btom\b|jenny|aria|\bguy\b|google.*(us|united states)|microsoft.*english|\bsiri\b/i.test(
      v.name,
    ),
  );
  const defaults = pool.filter((v) => v.default);
  const approved = neutral.length ? neutral : defaults.length ? defaults : pool.slice(0, 1);
  const seen = new Set<string>();
  return approved
    .filter((v) => {
      if (seen.has(v.voiceURI)) return false;
      seen.add(v.voiceURI);
      return true;
    })
    .sort((a, b) => score(b) - score(a));
}
export function englishVoices(): SpeechSynthesisVoice[] {
  return 'speechSynthesis' in window ? rankVoices(window.speechSynthesis.getVoices()) : [];
}
export function preferredVoice(uri: string): SpeechSynthesisVoice | undefined {
  const voices = englishVoices();
  return voices.find((v) => v.voiceURI === uri) ?? voices[0];
}
export function phraseChunks(text: string): string[] {
  if (text.trim().split(/\s+/).length < 5) return [text];
  const location = text.match(/^(Put .+?)\s+((?:in|on|under|behind|next to|into) .+)$/i);
  if (location) return [location[1], location[2]];
  const request = text.match(
    /^(Can you (?:find|put|wash|make|bring)|Would you like|Do you want|I want|Can I have|It's time to)\s+(.+)$/i,
  );
  if (request) return [request[1], request[2]];
  const comma = text.indexOf('. ');
  return comma > 0 ? [text.slice(0, comma + 1), text.slice(comma + 2)] : [text];
}
