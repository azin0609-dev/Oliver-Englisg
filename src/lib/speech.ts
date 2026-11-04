export function englishVoices(): SpeechSynthesisVoice[] {
  return 'speechSynthesis' in window
    ? window.speechSynthesis
        .getVoices()
        .filter((v) => /^en[-_]/i.test(v.lang))
        .sort(
          (a, b) =>
            Number(/^en-US$/i.test(b.lang)) - Number(/^en-US$/i.test(a.lang)) ||
            a.name.localeCompare(b.name),
        )
    : [];
}
export function preferredVoice(uri: string): SpeechSynthesisVoice | undefined {
  const voices = englishVoices();
  return (
    voices.find((v) => v.voiceURI === uri) ??
    voices.find((v) => v.lang === 'en-US' && /Samantha|Google|Microsoft|Alex/.test(v.name)) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices[0]
  );
}
