import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function files(dir, prefix = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) found.push(...(await files(`${dir}/${entry.name}`, `${name}/`)));
    // Hosting configuration may not be served as a public asset (e.g. Netlify _headers).
    else if (!['sw.js', '_headers', '_redirects'].includes(entry.name)) found.push(name);
  }
  return found.sort();
}
const assets = await files('dist');
const hash = createHash('sha256');
for (const path of assets) hash.update(await readFile(`dist/${path}`));
const version = hash.digest('hex').slice(0, 12);
await writeFile(
  'dist/sw.js',
  `/* Generated from the complete build. No external resources. */
const CACHE = 'oliver-shell-${version}';
const ASSETS = ${JSON.stringify(assets)};
const urls = ASSETS.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls)));
});
self.addEventListener('message', event => {
 if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('oliver-shell-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
 // Keep HTML and its content-hashed assets on the same version until the parent accepts an update.
 if (event.request.mode === 'navigate') {
  event.respondWith(caches.open(CACHE).then(cache => cache.match(new URL('index.html', self.registration.scope).href)).then(cached => cached || fetch(event.request)));
 } else if (urls.includes(url.href)) {
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, { ignoreVary: true })).then(cached => cached || fetch(event.request)));
 }
});
`,
);
console.log(`Service worker: ${assets.length} local assets, cache ${version}`);
