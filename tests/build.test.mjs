import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, access } from 'node:fs/promises';
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

const FORBIDDEN = [/1F4B8C/i, /2B2A28/i];

test('old design-system fonts and colors are gone from src, public and dist', async () => {
  const files = [];
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (/\.(css|mjs|js|html|json|svg|txt|xml)$/.test(e.name) && e.name !== 'LICENSE-OFL.txt') files.push(p);
    }
  };
  for (const d of ['src', 'dist', 'public']) await walk(join(root, d));
  assert.ok(files.length > 5);
  for (const f of files) {
    const txt = await readFile(f, 'utf8');
    for (const re of FORBIDDEN) assert.ok(!re.test(txt), `${f} matches ${re}`);
    assert.ok(!/Instrument/.test(txt), `${f} still references Instrument fonts`);
  }
});

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test('text tokens reach 4.5:1 on every surface in both themes', async () => {
  const css = await readFile(join(root, 'src/styles/01-tokens.css'), 'utf8');
  const block = (sel) => css.slice(css.indexOf(sel));
  const light = css.slice(css.indexOf(':root{'), css.indexOf('html[data-theme="dark"]'));
  const dark = block('html[data-theme="dark"]{');
  const tok = (b, n) => b.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
  for (const [name, own] of [['light', light], ['dark', dark]]) {
    const get = (n) => tok(own, n) || tok(light, n);
    for (const fg of ['text', 'muted', 'ember-text']) {
      for (const bg of ['bg', 'surface', 'surface-2']) {
        const r = ratio(get(fg), get(bg));
        assert.ok(r >= 4.5, `${name}: --${fg} on --${bg} is ${r.toFixed(2)}`);
      }
    }
  }
});

test('procedural pixel moon assets are emitted, palette-limited, small and deterministic', async () => {
  const names = ['moon.svg', 'moon-halo.svg', 'moon-stars.svg'];
  const before = {};
  for (const n of names) {
    const txt = await read(`assets/img/${n}`);
    assert.ok(Buffer.byteLength(txt) < 25 * 1024, `${n} < 25 KB`);
    assert.match(txt, /shape-rendering="crispEdges"/);
    before[n] = txt;
  }
  const allowed = new Set(['#FFD2A1', '#FFA05A', '#FF7A1F', '#FF6700', '#D9520A', '#A63D05', '#6E2803', '#3D1702']);
  const used = new Set((before['moon.svg'].match(/#[0-9A-Fa-f]{6}\b/g) || []).map((c) => c.toUpperCase()));
  assert.ok(used.size > 0);
  for (const c of used) assert.ok(allowed.has(c), `moon.svg uses disallowed ${c}`);
  assert.ok(!/gradient|filter/i.test(before['moon.svg']));
  // generator twice -> byte-identical
  const { MOON_FILES } = await import('../scripts/moon.mjs');
  const a = MOON_FILES(), b = MOON_FILES();
  for (const n of Object.keys(a)) assert.equal(a[n], b[n], `${n} deterministic`);
  for (const n of names) assert.equal(a[n], before[n], `${n} matches dist`);
  assert.ok(Object.values(a).every((s) => Buffer.byteLength(s) < 25 * 1024));
});

test('pixel tea assets are emitted, palette-limited, small and deterministic', async () => {
  const names = ['tea-cup.svg', 'tea-glint.svg', 'tea-steam-1.svg', 'tea-steam-2.svg', 'tea-steam-3.svg'];
  const allowed = new Set(['#FFD2A1', '#FFA05A', '#FF7A1F', '#FF6700', '#D9520A', '#A63D05', '#6E2803', '#3D1702', '#FFF1E0', '#2A1D14']);
  const { TEA_FILES } = await import('../scripts/tea.mjs');
  const a = TEA_FILES(), b = TEA_FILES();
  for (const n of names) {
    const txt = await read(`assets/img/${n}`);
    assert.ok(Buffer.byteLength(txt) < 12 * 1024, `${n} < 12 KB`);
    assert.match(txt, /shape-rendering="crispEdges"/);
    assert.ok(!/gradient|filter/i.test(txt));
    for (const c of txt.match(/#[0-9A-Fa-f]{6}\b/g) || []) assert.ok(allowed.has(c.toUpperCase()), `${n} uses disallowed ${c}`);
    assert.equal(a[n], b[n], `${n} deterministic`);
    assert.equal(a[n], txt, `${n} matches dist`);
  }
  assert.notEqual(a['tea-steam-1.svg'], a['tea-steam-2.svg']);
  const html = await read('index.html');
  assert.match(html, /class="tea-row"/);
  assert.match(html, /tea tea-mini" aria-hidden="true"/);
});

test('pixel icons: one per work item, status sprites, palette, determinism, size', async () => {
  const { ICON_FILES } = await import('../scripts/pixel-icons.mjs');
  const items = JSON.parse(await readFile(join(root, 'src/content/pt-BR.json'), 'utf8')).work.items;
  const ids = items.map((i) => i.icon);
  assert.equal(new Set(ids).size, ids.length, 'unique icon ids');
  for (const id of ids) {
    assert.ok(id, 'every work item has an icon');
    const svg = await read(`assets/img/icons/${id}.svg`);
    assert.match(svg, /viewBox="0 0 24 24"/);
  }
  const html = await read('index.html');
  for (const id of ids) assert.ok(html.includes(`/assets/img/icons/${id}.svg`), `${id} used in html`);
  const base = new Set(['#FFD2A1', '#FFA05A', '#FF7A1F', '#FF6700', '#D9520A', '#A63D05', '#6E2803', '#3D1702', '#FFF1E0', '#2A1D14']);
  const files = ICON_FILES();
  for (const [n, s] of Object.entries(files)) {
    assert.ok(Buffer.byteLength(s) < 6 * 1024, `${n} < 6 KB`);
    assert.match(s, /shape-rendering="crispEdges"/);
    const cols = new Set((s.match(/#[0-9A-Fa-f]{6}\b/g) || []).map((c) => c.toUpperCase()));
    const ok = new Set(base);
    if (n === 'status-live.svg') { ok.add('#2E9E62'); assert.ok(cols.has('#2E9E62')); }
    if (n === 'status-openSource.svg' || n === 'craftonica.svg' || n === 'linux.svg') ok.add('#A89C8E');
    if (n.startsWith('flag-')) {
      // flags: their real national colours plus the outline, nothing else
      const flagOk = new Set(['#3D1702', '#009C3B', '#FFDF00', '#002776', '#FFFFFF', '#B22234', '#3C3B6E']);
      assert.match(s, /viewBox="0 0 16 11"/);
      for (const c of cols) assert.ok(flagOk.has(c), `${n} uses disallowed ${c}`);
      continue;
    }
    for (const c of cols) assert.ok(ok.has(c), `${n} uses disallowed ${c}`);
    assert.equal(s, await read(`assets/img/icons/${n}`), `${n} matches dist`);
  }
  for (const st of ['inProgress', 'live', 'openSource', 'merged']) assert.ok(files[`status-${st}.svg`], `status ${st}`);
  const again = ICON_FILES();
  for (const n of Object.keys(files)) assert.equal(files[n], again[n], `${n} deterministic`);
});

test('language switch shows the target-language pixel flag with its accessible name', async () => {
  for (const f of ['flag-br.svg', 'flag-us.svg']) {
    assert.match(await read(`assets/img/icons/${f}`), /viewBox="0 0 16 11"/, `${f} in dist`);
  }
  const cases = [['index.html', 'flag-us.svg', 'English'], ['en/index.html', 'flag-br.svg', 'Português']];
  for (const [file, flag, name] of cases) {
    const html = await read(file);
    const sw = html.match(/<a class="pill-ctl lang[^"]*" id="langSwitch"[^>]*>[\s\S]*?<\/a>/)?.[0];
    assert.ok(sw, `${file} has the language switch`);
    assert.ok(sw.includes(`/assets/img/icons/${flag}`), `${file} switch shows ${flag}`);
    assert.match(sw, /aria-label="[^"]*"/);
    assert.ok(sw.includes(name), `${file} switch names ${name}`);
  }
});

test('open-source contributions: merged PR links and icons are built in both languages', async () => {
  for (const [lang, file] of [['pt-BR', 'index.html'], ['en', 'en/index.html']]) {
    const c = JSON.parse(await readFile(join(root, `src/content/${lang}.json`), 'utf8')).work.contrib;
    const html = await read(file);
    assert.ok(html.includes(`href="${c.projectUrl}"`), `${lang} project link`);
    let count = 0;
    for (const it of c.items) {
      for (const p of it.prs) {
        count++;
        assert.ok(html.includes(`href="https://github.com/noctalia-dev/community-plugins/pull/${p.n}"`), `${lang} PR #${p.n}`);
      }
    }
    assert.equal(count, 5, `${lang} lists five merged PRs`);
    assert.ok(html.includes(`aria-label="${c.merged}"`), `${lang} merged label`);
    assert.ok(html.includes('/assets/img/icons/oss-plugin.svg') && html.includes('/assets/img/icons/status-merged.svg'));
  }
  const plug = await read('assets/img/icons/oss-plugin.svg');
  assert.match(plug, /viewBox="0 0 24 24"/);
  assert.match(await read('assets/img/icons/status-merged.svg'), /viewBox="0 0 8 8"/);
});

test('sun generator: sun, rays and day sky are deterministic, on-palette and small; both scenes are built', async () => {
  const { SUN_FILES, cloudsInline } = await import('../scripts/sun.mjs');
  const { PAL } = await import('../scripts/moon.mjs');
  const ok = new Set([...Object.values(PAL), '#FFF1E0', '#FFFFFF', '#FFD9B0', '#FFE3C2', '#FFEBD3', '#F3D3B0', '#EAC39C', '#E0B48A'].map((c) => c.toUpperCase()));
  const files = SUN_FILES();
  const again = SUN_FILES();
  for (const n of ['sun.svg', 'sun-rays-1.svg', 'sun-rays-2.svg', 'day-sky.svg']) {
    const s = await read(`assets/img/${n}`);
    assert.equal(s, files[n], `${n} matches generator`);
    assert.equal(s, again[n], `${n} deterministic`);
    assert.ok(Buffer.byteLength(s) < 25 * 1024, `${n} under 25 KB`);
    for (const m of s.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) assert.ok(ok.has(m[1].toUpperCase()), `${n} uses disallowed ${m[1]}`);
  }
  assert.notEqual(files['sun-rays-1.svg'], files['sun-rays-2.svg'], 'ray frames differ');
  assert.equal(cloudsInline(), cloudsInline());
  for (const m of cloudsInline().matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) assert.ok(ok.has(m[1].toUpperCase()), `clouds use disallowed ${m[1]}`);
  for (const f of ['index.html', 'en/index.html']) {
    const html = await read(f);
    assert.ok(html.includes('class="scene night"') && html.includes('class="scene day"'), `${f} has both scenes`);
    assert.ok(html.includes('/assets/img/sun.svg') && html.includes('sun-rays-2.svg') && html.includes('class="clouds"'));
  }
});

test('footer wordmark uses the self-hosted Teagar font', async () => {
  const css = await read('assets/site.css');
  assert.match(css, /font-family:"Teagar";[^}]*src:url\(\/fonts\/teagar-regular\.woff2\)/);
  assert.match(css, /\.wordmark\{[^}]*font-family:"Teagar"/);
  const font = await readFile(join(root, 'dist/fonts/teagar-regular.woff2'));
  assert.equal(font.subarray(0, 4).toString('latin1'), 'wOF2');
  assert.match(await read('index.html'), /<p class="wordmark" aria-hidden="true">Teagar<\/p>/);
});
