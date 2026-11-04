import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const storageKey = 'oliver-adventure-v1';
test('six one-tap situations show real English, a physical action and a gentle finish', async ({
  page,
}) => {
  await page.goto('/');
  const shortcuts = page.locator('.quick-shortcut');
  await expect(shortcuts).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    await shortcuts.nth(i).click();
    await expect(page.locator('.quick-session>.english-text')).toBeVisible();
    await expect(page.locator('.action-recipe>p')).not.toBeEmpty();
    await page.getByRole('button', { name: '我們玩過了，今天先到這裡', exact: true }).click();
    await expect(page.locator('.session-finished')).toContainText('這一小段陪伴，就很好。');
    await page.goto('/');
  }
});
test('daily quick session hides the seven-item checklist and retains completion after reopening', async ({
  page,
}) => {
  await page.goto('/#/today');
  await expect(page.locator('.daily-words')).not.toBeVisible();
  await expect(page.locator('.quick-session>.english-text')).toBeVisible();
  await page.getByRole('button', { name: '我們玩過了，今天先到這裡', exact: true }).click();
  await page.locator('.session-finished .observation-later>summary').click();
  await page
    .locator('.session-finished')
    .getByRole('button', { name: '聽得懂', exact: true })
    .click();
  await page.reload();
  await expect(page.locator('.session-finished')).toBeVisible();
  await page.locator('.full-adventure>summary').click();
  await expect(page.locator('.daily-words')).toBeVisible();
});
test('parents can get supportive responses for silence, a word, Chinese and choosing to stop', async ({
  page,
}) => {
  await page.goto('/#/quick/food');
  await page.locator('.response-support>summary').click();
  await expect(page.locator('.response-example>p')).toHaveText(
    'That’s okay. We can take our time.',
  );
  await page.getByRole('button', { name: '只說一個字', exact: true }).click();
  await expect(page.locator('.response-example>p')).toHaveText('You are hungry.');
  await page.getByRole('button', { name: '用中文回答', exact: true }).click();
  await expect(page.locator('.response-tip')).toContainText('不是即時翻譯');
  await page.getByRole('button', { name: '今天不想玩', exact: true }).click();
  await expect(page.locator('.response-example>p')).toHaveText(
    'We can play later. I’m here with you.',
  );
});
test('time-aware greeting, personal name and an accessible brand story work', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-05T20:00:00Z') });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Good evening, Oliver!', exact: true }),
  ).toBeVisible();
  await page.locator('.brand-home-card').click();
  await expect(page.locator('.about-page h1')).toContainText('英文不用很厲害');
  await expect(page.locator('.brand-story-hero')).toContainText('3–6 歲');
  await page.goto('/#/settings');
  await page.getByRole('textbox', { name: '顯示暱稱' }).fill('Ava');
  await page.getByRole('button', { name: '儲存', exact: true }).click();
  await page.goto('/#/topic/toys');
  await page.getByRole('button', { name: '提示與接話', exact: true }).first().click();
  await expect(page.locator('.reply-box').first()).toContainText('Ava 可以這樣說');
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Good evening, Ava!', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: '現在想跟 Ava 說什麼？' })).toBeVisible();
});
test('class notes survive reopening and teacher selections become the next quick recommendation', async ({
  page,
}) => {
  await page.goto('/#/class-notes');
  await page.getByRole('button', { name: '字母', exact: true }).click();
  await page.getByRole('checkbox').first().check();
  await page.getByLabel('爸媽的小筆記').fill('今天自己找到 A。');
  await page.getByRole('button', { name: '儲存課堂筆記', exact: true }).click();
  await expect(page.locator('.class-note-card')).toContainText('今天自己找到 A。');
  await page.reload();
  await expect(page.locator('.class-note-card')).toHaveCount(1);
  await page.goto('/#/today');
  await page.getByRole('button', { name: '換個小動作', exact: true }).click();
  await expect(page.locator('.quick-session>.english-text')).toHaveText(
    'Can you find the letter A?',
  );
  await expect(page.locator('.action-recipe')).toContainText('字母卡');
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(saved.records['classroom-2']).toBeUndefined();
});
test('a small memory can be created, edited and backed up without duplicating entries', async ({
  page,
}) => {
  await page.goto('/#/progress');
  await page.getByRole('button', { name: '記下今天的小發現', exact: true }).click();
  await page.getByLabel('孩子說了什麼？').fill('More bubbles!');
  await page.getByLabel('當時在做什麼？').fill('洗澡時自己說，沒有提醒。');
  await page.getByRole('button', { name: '保存這個小時刻', exact: true }).click();
  await expect(page.locator('.memory-card')).toContainText('More bubbles!');
  await page.locator('.memory-card').getByRole('button', { name: '編輯', exact: true }).click();
  await page.getByLabel('當時在做什麼？').fill('洗澡時自己說了兩次。');
  await page.getByRole('button', { name: '保存這個小時刻', exact: true }).click();
  await page.reload();
  await expect(page.locator('.memory-card')).toHaveCount(1);
  await expect(page.locator('.memory-card')).toContainText('自己說了兩次');
  await page.goto('/#/settings');
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出學習資料', exact: true }).click();
  const backup = JSON.parse(await readFile((await (await event).path())!, 'utf8'));
  expect(backup.version).toBe(2);
  expect(backup.data.memories).toHaveLength(1);
  expect(backup.data.memories[0].quote).toBe('More bubbles!');
});
test('upgrading a legacy device keeps favorites, observed level, counts and history', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key))
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          settings: { nickname: 'Oliver', difficulty: 2, voiceURI: '', classDays: [3, 5] },
          records: {
            'sentence-toys-1': {
              mastery: 3,
              favorite: true,
              practiceCount: 8,
              lastPracticed: '2026-11-04T10:00:00.000Z',
            },
          },
          history: [{ id: 'sentence-toys-1', date: '2026-11-04' }],
          daily: { date: '2026-11-04', seed: 0, completed: [], selection: [], skipped: false },
        }),
      );
  }, storageKey);
  await page.goto('/#/favorites');
  await expect(page.locator('.material-card h3')).toHaveText('Which dinosaur do you want?');
  await expect(page.locator('.status-mini')).toHaveText('能主動說出');
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(saved.records['sentence-toys-1'].practiceCount).toBe(8);
  expect(saved.history).toHaveLength(1);
  expect(saved.classSessions).toEqual([]);
  expect(saved.memories).toEqual([]);
});
test('voice choices exclude character sounds and keep a recommended American voice', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const names = ['Boing', 'Albert', 'Bubbles', 'Whisper', 'Samantha', 'Alex'];
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () =>
          names.map((name) => ({
            name,
            voiceURI: name,
            lang: 'en-US',
            localService: true,
            default: name === 'Samantha',
          })),
        cancel: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  await page.goto('/#/settings');
  await expect(page.locator('#voice option')).toHaveCount(3);
  const choices = await page.locator('#voice').textContent();
  expect(choices).toContain('Samantha');
  expect(choices).not.toContain('Boing');
  expect(choices).not.toContain('Albert');
  expect(choices).not.toContain('Whisper');
});
