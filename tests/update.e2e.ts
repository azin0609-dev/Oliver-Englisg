import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
test('a complete new service worker waits for acceptance, then updates without losing records', async ({
  page,
}) => {
  let nextVersion = false;
  const root = resolve('dist');
  const server = createServer(async (request, response) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    const filename = resolve(root, `.${path === '/' ? '/index.html' : path}`);
    if (!filename.startsWith(root + '/')) {
      response.writeHead(403).end();
      return;
    }
    try {
      let content = await readFile(filename);
      if (path === '/sw.js' && nextVersion)
        content = Buffer.from(
          content.toString().replace(/oliver-shell-([a-f0-9]+)'/, "oliver-shell-$1-new'"),
        );
      const types: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.webmanifest': 'application/manifest+json',
      };
      response.writeHead(200, {
        'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test server');
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await page.goto(`${origin}/#/topic/morning`);
    await page
      .getByRole('button', { name: '收藏：Good morning, sleepyhead!', exact: true })
      .click();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    const oldController = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL);
    nextVersion = true;
    await page.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      await r?.update();
    });
    await expect(page.getByRole('button', { name: '更新 App', exact: true })).toBeVisible();
    const oldKeys = await page.evaluate(() => caches.keys());
    expect(oldKeys.filter((k) => k.startsWith('oliver-shell-')).length).toBe(2);
    await page.getByRole('button', { name: '更新 App', exact: true }).click();
    await expect(
      page.getByRole('button', { name: '取消收藏：Good morning, sleepyhead!', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '更新 App', exact: true })).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await caches.keys()).filter((k) => k.startsWith('oliver-shell-')),
        ),
      )
      .toEqual([oldKeys.find((k) => k.endsWith('-new'))]);
    expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toBe(
      oldController,
    );
  } finally {
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  }
});
