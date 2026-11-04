export function greeting(hour: number) {
  if (hour < 5)
    return { english: 'Good night', chinese: '夜深了，今天的陪伴已經很好。', icon: 'moon' };
  if (hour < 12)
    return { english: 'Good morning', chinese: '新的一天，從一句溫柔的英文開始。', icon: 'sun' };
  if (hour < 18)
    return { english: 'Good afternoon', chinese: '把一句英文，放進正在發生的日常。', icon: 'sun' };
  return { english: 'Good evening', chinese: '今天也辛苦了，一句晚安就很好。', icon: 'moon' };
}
export function expandReply(reply: string): string {
  const first = reply.trim().split(/(?<=[.!?])\s+(?=[A-Z])/)[0];
  const clean = first.replace(/^(yes|no)[,.!]\s+(?=I\b)/i, '');
  if (/^help me/i.test(clean)) return 'Of course. I can help.';
  if (/^no[,.!]?\s*(thank you|i don)/i.test(clean)) return 'Okay. Thank you for telling me.';
  if (/^yes[,.!]?\s*(please|i can|i do)?[.!]?$/i.test(clean)) return 'Okay. Let’s do it together.';
  if (/^here (it|they|is)/i.test(clean) || /^this one/i.test(clean)) return 'You found it!';
  if (/^like this/i.test(clean)) return 'Yes, like that.';
  if (/^stay with me/i.test(clean)) return 'I’m right here with you.';
  if (/^i('m| am)\b/i.test(clean)) return clean.replace(/^i('m| am)\b/i, 'You are');
  if (/^i (want|need|like|don’t want|don't want|don't like|don’t like|can’t|can't)\b/i.test(clean))
    return clean.replace(/^i /i, 'You ');
  if (/^i /i.test(clean)) return clean.replace(/^i /i, 'You ');
  if (/^my /i.test(clean)) return clean.replace(/^my /i, 'Your ');
  if (/\b(I|me|my)\b/.test(clean)) return 'Thank you for telling me.';
  return clean;
}
export function responseSupport(reply: string) {
  return [
    {
      id: 'quiet',
      label: '孩子沒回答',
      english: 'That’s okay. We can take our time.',
      chinese: '沒關係，我們可以慢慢來。',
      tip: '先等一會兒，再用動作示範。孩子願意看、指一指，已經是在參與。',
    },
    {
      id: 'word',
      label: '只說一個字',
      english: expandReply(reply),
      chinese: '順著孩子的意思，幫他把話接長一點。',
      tip: '下面以這張卡的回答為例；物品請換成孩子實際選的，不用要求再跟說一次。',
    },
    {
      id: 'chinese',
      label: '用中文回答',
      english: expandReply(reply),
      chinese: '先接住意思，再自然示範英文。',
      tip: '先用中文回應「我知道了」，再用一句英文接話。這是範例，不是即時翻譯孩子的回答。',
    },
    {
      id: 'away',
      label: '今天不想玩',
      english: 'We can play later. I’m here with you.',
      chinese: '我們晚一點再玩，我會陪著你。',
      tip: '可以換回孩子想做的事，或到這裡就好。沒有需要完成的進度。',
    },
  ];
}
