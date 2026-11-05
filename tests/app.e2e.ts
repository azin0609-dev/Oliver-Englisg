import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const storageKey = 'oliver-adventure-v1';
test('all six home entrances work, with no browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening|night), Oliver!/ }),
  ).toBeVisible();
  const cards = page.locator('.entrance-card');
  expect(await cards.count()).toBe(6);
  for (let i = 0; i < 6; i++) {
    await cards.nth(i).click();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main')).not.toContainText('這條小路');
    await page.goto('/');
  }
  expect(errors).toEqual([]);
});
test('today can be completed, skipped, resumed and replaced; practice preserves the daily selection', async ({
  page,
}) => {
  await page.goto('/#/today');
  await page.locator('.full-adventure > summary').click();
  await expect(page.locator('.daily-words .material-card')).toHaveCount(3);
  const first = await page.locator('.daily-words h3').first().textContent();
  await page.getByRole('button', { name: '我們一起看過了' }).first().click();
  await expect(page.getByText('1 / 7 個小時刻')).toBeVisible();
  await page.reload();
  await page.locator('.full-adventure > summary').click();
  await expect(page.getByText('1 / 7 個小時刻')).toBeVisible();
  await expect(page.locator('.daily-words h3').first()).toHaveText(first!);
  await page.locator('.full-adventure').getByRole('button', { name: '今天先休息' }).click();
  await expect(page.getByText('今天，休息也是很棒的選擇。')).toBeVisible();
  await page.getByRole('button', { name: '繼續今天的小冒險' }).click();
  await page.getByRole('button', { name: '換一組', exact: true }).click();
  await expect(page.getByText('0 / 7 個小時刻')).toBeVisible();
});
test('Chinese phrase and English word search; save observation and favorite; reopen persists data', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: '現在想跟 Oliver 說什麼？' }).fill('快去刷牙');
  await page.getByRole('button', { name: '搜尋教材' }).click();
  await expect(page.locator('.material-card h3').first()).toHaveText(
    "It's time to brush your teeth.",
  );
  await page
    .getByRole('button', { name: "收藏：It's time to brush your teeth.", exact: true })
    .click();
  await page.getByRole('button', { name: '提示與接話', exact: true }).first().click();
  await page.getByRole('button', { name: '聽得懂', exact: true }).click();
  await page.getByRole('button', { name: '能主動說出', exact: true }).click();
  const reopen = await context.newPage();
  await page.close();
  await reopen.goto('/#/favorites');
  await expect(reopen.locator('.material-card h3')).toHaveText("It's time to brush your teeth.");
  await reopen.goto('/#/progress');
  await reopen.locator('.observation-summary > summary').click();
  await expect(reopen.getByRole('heading', { name: '本週複習 1 句英文' })).toBeVisible();
  await expect(reopen.locator('.weekly-bars')).toContainText('能主動說出1');
  await reopen.goto('/#/search?q=dinosaur');
  await expect(reopen.locator('.material-card h3').filter({ hasText: /^dinosaur$/ })).toBeVisible();
});
test('all dialogue modes, free navigation, Chinese toggle and independent line observations work', async ({
  page,
}) => {
  await page.goto('/#/dialogue/dialogue-food-1');
  await expect(page.locator('.conversation-focus>.english-text')).toHaveText('Are you hungry?');
  await page.getByRole('button', { name: '下一句', exact: true }).click();
  await expect(page.locator('.conversation-focus>.english-text')).toHaveText("Yes, I'm hungry.");
  await page.getByRole('button', { name: '跳到第 5 句' }).click();
  await expect(page.locator('.conversation-focus>.english-text')).toHaveText(
    "Okay! Let's make some noodles.",
  );
  await page.getByRole('button', { name: '隱藏中文', exact: true }).click();
  await expect(page.locator('.conversation-focus>.translation')).toHaveCount(0);
  await page.locator('.conversation-focus .observation-later > summary').click();
  await page.getByRole('button', { name: '聽得懂', exact: true }).click();
  await page.getByRole('button', { name: '顯示整段', exact: true }).click();
  await expect(page.locator('.conversation-line')).toHaveCount(6);
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(saved.records['dialogue-food-1-turn-4'].mastery).toBe(1);
  expect(saved.records['dialogue-food-1-turn-1']).toBeUndefined();
});
test('speech normal/slow replace active utterances, selected voice is used, and Stop cancels', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const calls: { text?: string; rate?: number; voice?: string; type: string }[] = [];
    const voice = {
      voiceURI: 'test-us',
      name: 'Test English',
      lang: 'en-US',
      localService: true,
      default: true,
    };
    Object.defineProperty(window, '__speechCalls', { value: calls });
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
        getVoices: () => [voice],
        cancel: () => calls.push({ type: 'cancel' }),
        speak: (u: SpeechSynthesisUtterance) =>
          calls.push({ type: 'speak', text: u.text, rate: u.rate, voice: u.voice?.voiceURI }),
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  await page.goto('/#/topic/morning');
  const first = page.locator('.material-card').first();
  await first
    .getByRole('button', { name: '播放英文：Good morning, sleepyhead!', exact: true })
    .click();
  await first
    .getByRole('button', { name: '慢速播放：Good morning, sleepyhead!', exact: true })
    .click();
  await page.getByRole('button', { name: '停止播放', exact: true }).click();
  const calls = await page.evaluate(
    () =>
      (window as unknown as { __speechCalls: { type: string; rate?: number; voice?: string }[] })
        .__speechCalls,
  );
  const spoken = calls.filter((c) => c.type === 'speak');
  expect(spoken).toHaveLength(2);
  expect(spoken[0].rate).toBe(0.96);
  expect(spoken[1].rate).toBe(0.82);
  expect(spoken[0].voice).toBe('test-us');
  for (let i = 0; i < calls.length; i++)
    if (calls[i].type === 'speak') expect(calls[i - 1].type).toBe('cancel');
  expect(calls.at(-1)?.type).toBe('cancel');
});
test('missing English voices show helpful feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [],
        cancel: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  await page.goto('/#/topic/morning');
  await page
    .getByRole('button', { name: '播放英文：Good morning, sleepyhead!', exact: true })
    .click();
  await expect(page.locator('.toast')).toContainText('尚未找到裝置的英文語音');
});
test('JSON export, rejected import, valid import preview/cancel and replacement', async ({
  page,
}) => {
  await page.goto('/#/settings');
  await page.getByRole('textbox', { name: '顯示暱稱' }).fill('小恐龍');
  await page.getByRole('button', { name: '儲存', exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出學習資料' }).click();
  const download = await downloadEvent;
  const raw = await readFile((await download.path())!, 'utf8');
  const backup = JSON.parse(raw);
  expect(backup.data.settings.nickname).toBe('小恐龍');
  await page.locator('input[type=file]').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"app":"wrong"}'),
  });
  await expect(page.getByRole('alert')).toContainText('備份格式不正確');
  await expect(page.getByRole('textbox', { name: '顯示暱稱' })).toHaveValue('小恐龍');
  backup.data.settings.nickname = 'Oliver again';
  await page.locator('input[type=file]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByRole('region', { name: '備份匯入確認' })).toBeVisible();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '顯示暱稱' })).toHaveValue('小恐龍');
  await page.locator('input[type=file]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByRole('button', { name: '確認取代並匯入' }).click();
  await page.reload();
  await expect(page.getByRole('textbox', { name: '顯示暱稱' })).toHaveValue('Oliver again');
});
test('production service worker caches every built asset and works on an offline reopen', async ({
  page,
  context,
}) => {
  await page.goto('/#/topic/toys');
  await page
    .getByRole('button', { name: '收藏：Which dinosaur do you want?', exact: true })
    .click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.name).toBe('小日子英文 · Little Moments');
  expect(manifest.short_name).toBe('小日子英文');
  expect(manifest.id).toBe('./');
  expect(manifest.scope).toBe('./');
  for (const icon of manifest.icons)
    expect((await page.request.get(`/${icon.src}`)).ok()).toBe(true);
  const cachedUrls = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (await (await caches.open(keys.find((k) => k.startsWith('oliver-shell-'))!)).keys()).map(
      (r) => r.url,
    );
  });
  expect(cachedUrls.length).toBeGreaterThanOrEqual(9);
  expect(cachedUrls.some((url) => url.endsWith('/_headers'))).toBe(false);
  await context.setOffline(true);
  const reopen = await context.newPage();
  await reopen.goto('/#/favorites');
  await expect(reopen.locator('.material-card h3')).toHaveText('Which dinosaur do you want?');
  await expect(reopen.getByRole('status').filter({ hasText: '已離線' })).toBeVisible();
  await reopen.getByRole('button', { name: '提示與接話', exact: true }).click();
  await reopen.getByRole('button', { name: '聽得懂', exact: true }).click();
  await reopen.reload();
  await expect(reopen.locator('.status-mini')).toHaveText('聽得懂');
  await reopen.goto('/#/topic/bedtime');
  await expect(reopen.locator('.material-card')).toHaveCount(10);
});
test('all five classroom modes expose real practice cards', async ({ page }) => {
  await page.goto('/#/review');
  for (const mode of ['聽懂指令', '選擇與回答', '完整句子', '主動表達需求', '生活情境遷移']) {
    await page.locator('.review-mode').filter({ hasText: mode }).click();
    expect(await page.locator('.material-card').count()).toBeGreaterThan(0);
    await expect(page.locator('.activity-prompt').first()).toBeVisible();
  }
});
test('no horizontal overflow at 320, 375, 390 and 768 px on representative pages', async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of [
      '/',
      '/today',
      '/topics',
      '/dinosaur',
      '/dialogue/dialogue-food-1',
      '/review',
      '/settings',
      '/progress',
      '/quick/food',
      '/about',
      '/class-notes',
    ]) {
      await page.goto(`/#${path}`);
      await expect(page.locator('main h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow, `${width}px at ${path}`).toBe(false);
    }
  }
});
test('parents can change level, class days and nickname and settings survive reopening', async ({
  page,
}) => {
  await page.goto('/#/settings');
  await page.getByRole('button', { name: 'Level 1 Understand 先聽懂、做動作' }).click();
  await page.getByRole('button', { name: '週三', exact: true }).click();
  await page.getByRole('button', { name: '週二', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Level 1 Understand 先聽懂、做動作' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '週二', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: '週三', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(saved.settings.difficulty).toBe(1);
  expect(saved.settings.classDays.sort()).toEqual([2, 5]);
});
test('failed local storage writes warn parents and current observations remain exportable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    };
  });
  await page.goto('/#/topic/morning');
  await expect(page.getByRole('alert')).toContainText('這次變更尚未存入裝置');
  await page.getByRole('button', { name: '提示與接話', exact: true }).first().click();
  await page.getByRole('button', { name: '聽得懂', exact: true }).click();
  await page.goto('/#/settings'); // Intentionally cannot persist across a new document.
  await expect(page.getByRole('alert')).toBeVisible();
  // In-app navigation retains current in-memory observations even when disk writes fail.
  await page.goto('/#/topic/morning');
  await page.getByRole('button', { name: '提示與接話', exact: true }).first().click();
  await page.getByRole('button', { name: '聽得懂', exact: true }).click();
  await page.locator('.mobile-header a[aria-label="爸媽的小設定"]').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出學習資料' }).click();
  const result = JSON.parse(await readFile((await (await downloadEvent).path())!, 'utf8'));
  expect(result.data.records['sentence-morning-1'].mastery).toBe(1);
});
