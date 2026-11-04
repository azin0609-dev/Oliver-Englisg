// Rebuild original, self-authored SVG icons. Requires Chromium (see README).
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const svg = await readFile('public/icon.svg', 'utf8');
for (const [name, size, maskable] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
  ['icon-maskable-512.png', 512, true],
]) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<html><body style="margin:0;background:#edf0e1;display:grid;place-items:center;width:100vw;height:100vh">${svg.replace('<svg ', `<svg style="width:${maskable ? 80 : 100}%;height:${maskable ? 80 : 100}%" `)}</body></html>`,
  );
  await page.screenshot({ path: `public/${name}` });
  await page.close();
}
await browser.close();
console.log('Created 192px, 512px, maskable and Apple touch PNG icons.');
