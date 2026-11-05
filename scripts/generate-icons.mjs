// Export the brand artwork at installable sizes. Requires Chromium (see README).
import { chromium } from '@playwright/test';
import { copyFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const source = `data:image/png;base64,${(await readFile('docs/brand/little-moments-icon-source.png')).toString('base64')}`;
const outputs = [
  { name: 'little-moments-icon-192.png', legacy: 'icon-192.png', size: 192 },
  { name: 'little-moments-icon-512.png', legacy: 'icon-512.png', size: 512 },
  { name: 'little-moments-apple-touch-icon.png', legacy: 'apple-touch-icon.png', size: 180 },
  {
    name: 'little-moments-icon-maskable-512.png',
    legacy: 'icon-maskable-512.png',
    size: 512,
    maskable: true,
  },
];
try {
  for (const { name, legacy, size, maskable } of outputs) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent('<html><body style="margin:0"><canvas></canvas></body></html>');
    await page.evaluate(
      async ({ source, size, maskable }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.querySelector('canvas');
        canvas.width = canvas.height = size;
        const context = canvas.getContext('2d', { alpha: false });
        context.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        context.fillStyle = `rgb(${r},${g},${b})`;
        context.fillRect(0, 0, size, size);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        const inset = maskable ? size * 0.1 : 0;
        context.drawImage(image, inset, inset, size - inset * 2, size - inset * 2);
      },
      { source, size, maskable: !!maskable },
    );
    await page.locator('canvas').screenshot({ path: `public/${name}` });
    // Existing installed shortcuts may still request the previous URLs.
    await copyFile(`public/${name}`, `public/${legacy}`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  'Created Little Moments 192px, 512px, maskable and Apple touch icons, with legacy aliases.',
);
