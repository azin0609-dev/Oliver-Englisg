// Capture the actual running production preview (npm run preview -- --port 4173).
import { chromium, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
for (const [device, options] of [
  ['iphone', devices['iPhone 13']],
  ['desktop', { viewport: { width: 1440, height: 1100 } }],
]) {
  const page = await browser.newPage(options);
  await page.goto('http://127.0.0.1:4173/');
  await page.screenshot({ path: `docs/screenshots/${device}-home.png`, fullPage: true });
  if (device === 'iphone') {
    await page.goto('http://127.0.0.1:4173/#/dialogue/dialogue-food-1');
    await page.screenshot({ path: 'docs/screenshots/iphone-dialogue.png', fullPage: true });
    for (const route of ['quick/food', 'about', 'today', 'class-notes']) {
      await page.goto(`http://127.0.0.1:4173/#/${route}`);
      await page.screenshot({
        path: `docs/screenshots/iphone-${route.replace('/', '-')}.png`,
        fullPage: true,
      });
    }
  }
  await page.close();
}
await browser.close();
console.log('Captured real desktop, iPhone home and iPhone dialogue screens.');
