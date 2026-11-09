import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFile(join(root, 'dist', p), 'utf8');

before(() => { execFileSync('node', ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' }); });

test('build emits expected files', async () => {
  for (const f of ['index.html', 'en/index.html', 'sitemap.xml', 'robots.txt', '404.html', 'assets/site.css', 'assets/site.js']) {
    await access(join(root, 'dist', f));
  }
});

for (const [file, lang, canonical] of [['index.html', 'pt-BR', 'https://teagar.com.br/'], ['en/index.html', 'en', 'https://teagar.com.br/en/']]) {
  test(`${file} head, structure and safety`, async () => {
    const html = await read(file);
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.equal((html.match(/<link rel="alternate" hreflang="/g) || []).length, 3);
    for (const h of ['pt-BR', 'en', 'x-default']) assert.ok(html.includes(`hreflang="${h}"`));
    assert.ok(html.includes('<meta property="og:image" content="https://teagar.com.br/og-image.jpg">'));
    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ld, 'json-ld present');
    const data = JSON.parse(ld[1]);
    assert.deepEqual(data['@graph'].map((n) => n['@type']), ['Person', 'Organization']);
    for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /\balt="/, img);
    for (const a of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) assert.match(a, /rel="[^"]*noopener/, a);
    assert.ok(!html.includes('{{'));
    assert.ok(!html.includes('undefined'));
    assert.ok(!html.includes('[object Object]'));
  });
}

test('sitemap lists both locales with alternates', async () => {
  const x = await read('sitemap.xml');
  assert.ok(x.includes('<loc>https://teagar.com.br/</loc>') && x.includes('<loc>https://teagar.com.br/en/</loc>'));
  assert.ok(x.includes('xhtml:link'));
});

test('css keeps focus visible and respects reduced motion', async () => {
  const css = await read('assets/site.css');
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(css.includes(':focus-visible'));
  assert.ok(!/outline\s*:\s*(none|0)\b/.test(css), 'no outline removal');
});
