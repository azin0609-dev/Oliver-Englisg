import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function installSpeech(page: Page, mode: 'async' | 'local' | 'empty' | 'remote' = 'local') {
  await page.addInitScript((mode) => {
    const events = new EventTarget();
    let loaded = mode !== 'async';
    const voices = [
      { name: 'Boing', lang: 'en-US', voiceURI: 'boing', localService: true, default: false },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'samantha', localService: true, default: false },
      { name: 'Daniel', lang: 'en-GB', voiceURI: 'daniel', localService: true, default: false },
      { name: 'Mei-Jia', lang: 'zh-TW', voiceURI: 'meijia', localService: true, default: true },
    ];
    const state = {
      calls: [] as { type: string; text?: string; rate?: number; voice?: string }[],
      copied: '',
      load: () => {
        loaded = true;
        events.dispatchEvent(new Event('voiceschanged'));
      },
    };
    Object.defineProperty(window, '__voiceCheckTest', { value: state });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () =>
          !loaded || mode === 'empty'
            ? []
            : mode === 'remote'
              ? [
                  {
                    name: 'Google US English',
                    lang: 'en-US',
                    voiceURI: 'google-us',
                    localService: false,
                    default: true,
                  },
                ]
              : voices,
        cancel: () => state.calls.push({ type: 'cancel' }),
        speak: (u: SpeechSynthesisUtterance) =>
          state.calls.push({ type: 'speak', text: u.text, rate: u.rate, voice: u.voice?.voiceURI }),
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          state.copied = text;
        },
      },
    });
  }, mode);
}

type VoiceState = {
  calls: { type: string; text?: string; rate?: number; voice?: string }[];
  copied: string;
  load: () => void;
};
const readState = (page: Page) =>
  page.evaluate(() => (window as unknown as { __voiceCheckTest: VoiceState }).__voiceCheckTest);

test('hidden entry lists every raw voice and refreshes after iOS voiceschanged', async ({
  page,
}) => {
  await installSpeech(page, 'async');
  await page.goto('/');
  await expect(page.locator('a[href="#/voice-check"]')).toHaveCount(0);
  await page.goto('/#/settings');
  await page.getByRole('link', { name: '語音檢測（進階）', exact: true }).click();
  await expect(page.getByRole('heading', { name: '語音檢測', exact: true })).toBeVisible();
  await expect(page.locator('.voice-raw-section tbody tr')).toHaveCount(0);
  await page.evaluate(() =>
    (window as unknown as { __voiceCheckTest: VoiceState }).__voiceCheckTest.load(),
  );
  await expect(page.locator('.voice-raw-section tbody tr')).toHaveCount(4);
  await expect(page.locator('.voice-raw-section')).toContainText('Boing');
  await expect(page.locator('.voice-raw-section')).toContainText('zh-TW');
  await expect(page.getByTestId('automatic-voice')).toContainText('Samantha');
  await expect(page.getByTestId('current-voice')).toContainText('Samantha');
  await expect(page.locator('.voice-raw-section tbody tr').last()).toContainText('true');
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
  }
});

test('all 13 diagnostic samples play normal and slow through the existing non-overlapping manager', async ({
  page,
}) => {
  await installSpeech(page);
  await page.goto('/#/settings');
  await page.waitForLoadState('networkidle');
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  const requests: string[] = [];
  page.on('request', (request) => {
    // Chromium may re-request the shell favicon after a hash navigation.
    // Keep fetch/XHR and every other request observable, including a scripted icon fetch.
    const shellIcon =
      request.resourceType() === 'other' && request.url() === new URL('icon.svg', page.url()).href;
    if (!shellIcon) requests.push(request.url());
  });
  await page.getByRole('link', { name: '語音檢測（進階）', exact: true }).click();
  const samples = [
    'Shoes on!',
    "Let's wash your hands.",
    'Time for bed.',
    'Can you stomp like a dinosaur?',
    'Good night, sleep tight.',
    'Triceratops',
    'Pteranodon',
    'Parasaurolophus',
    'Pachycephalosaurus',
    'Quetzalcoatlus',
    'chameleon',
    'tortoise',
    'cicada',
  ];
  for (const text of samples) {
    await page.getByRole('button', { name: `正常：${text}`, exact: true }).click();
    await page.getByRole('button', { name: `慢速：${text}`, exact: true }).click();
  }
  await page
    .locator('.voice-check-actions')
    .getByRole('button', { name: '停止播放', exact: true })
    .click();
  const state = await readState(page);
  const spoken = state.calls.filter((call) => call.type === 'speak');
  expect(spoken.map((call) => call.text)).toEqual(samples.flatMap((text) => [text, text]));
  expect(spoken.map((call) => call.rate)).toEqual(samples.flatMap(() => [0.96, 0.82]));
  expect(spoken.every((call) => call.voice === 'samantha')).toBe(true);
  for (let i = 0; i < state.calls.length; i++)
    if (state.calls[i].type === 'speak') expect(state.calls[i - 1].type).toBe('cancel');
  expect(state.calls.at(-1)?.type).toBe('cancel');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before);
  expect(requests).toEqual([]);
});

test('copied report includes voice metadata and excludes child profile and learning records', async ({
  page,
}) => {
  await installSpeech(page);
  await page.goto('/#/settings');
  await page.getByRole('textbox', { name: '顯示暱稱' }).fill('私密暱稱');
  await page.getByRole('button', { name: '儲存', exact: true }).click();
  await page.getByRole('link', { name: '語音檢測（進階）', exact: true }).click();
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await page.getByRole('button', { name: '複製檢測結果', exact: true }).click();
  await expect(page.locator('.copy-result')).toContainText('已複製檢測結果');
  const { copied } = await readState(page);
  expect(copied).toContain('小日子英文 · Little Moments');
  expect(copied).toContain('Phase 0 語音檢測');
  expect(copied).toContain(await page.evaluate(() => navigator.userAgent));
  expect(copied).toContain('name=Boing; lang=en-US; localService=true; default=false');
  expect(copied).toContain('name=Mei-Jia; lang=zh-TW; localService=true; default=true');
  expect(copied).toContain('自動選擇：Samantha');
  expect(copied).not.toContain('私密暱稱');
  expect(copied).not.toContain('practiceCount');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before);
});

test('empty voice lists and a denied clipboard offer a readable manual copy fallback', async ({
  page,
}) => {
  await installSpeech(page, 'empty');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Denied', 'NotAllowedError');
        },
      },
    });
    document.execCommand = () => false;
  });
  await page.goto('/#/voice-check');
  await expect(page.getByTestId('automatic-voice')).toContainText('尚未找到英文語音');
  await expect(page.locator('.voice-test-row button')).toHaveCount(26);
  await expect(page.locator('.voice-test-row button').first()).toBeDisabled();
  await page.getByRole('button', { name: '複製檢測結果', exact: true }).click();
  await expect(page.locator('.copy-result')).toContainText('無法自動複製');
  await expect(page.getByRole('textbox', { name: '檢測結果文字' })).toHaveValue(
    /裝置回報全部聲音：0/,
  );
});

test('the diagnostic page refuses online-only system voices to avoid outbound speech connections', async ({
  page,
}) => {
  await installSpeech(page, 'remote');
  await page.goto('/#/voice-check');
  await expect(page.getByTestId('current-voice')).toContainText('Google US English');
  await expect(page.locator('.voice-check-warning')).toContainText('不對外連線');
  await expect(page.locator('.voice-test-row button').first()).toBeDisabled();
  expect((await readState(page)).calls.filter((call) => call.type === 'speak')).toHaveLength(0);
});
