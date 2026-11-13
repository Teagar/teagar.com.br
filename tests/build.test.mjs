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
    assert.deepEqual(data['@graph'].map((n) => n['@type']), ['Person', ['Organization', 'ProfessionalService'], 'WebSite', 'WebPage']);
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
  const names = ['tea-cup.svg', 'tea-coffee.svg', 'tea-glint.svg', 'tea-steam-1.svg', 'tea-steam-2.svg', 'tea-steam-3.svg'];
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
  for (const st of ['inProgress', 'live', 'beta', 'openSource', 'merged']) assert.ok(files[`status-${st}.svg`], `status ${st}`);
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

test('navbar name rolls Teagar into Thiago and location names Feira de Santana', async () => {
  for (const f of ['index.html', 'en/index.html']) {
    const html = await read(f);
    assert.match(html, /Feira de Santana/, `${f} names the city`);
    const brand = html.match(/<a class="brand"[\s\S]*?<\/a>/)[0];
    assert.match(brand, /<span class="vh">Teagar Cerqueira \(Thiago Cerqueira\)<\/span>/);
    assert.match(brand, /<span class="bw" aria-hidden="true">/);
    assert.match(brand, /<span class="bl">T<\/span>[\s\S]*<span class="bc"> C<\/span>erqueira/, 'initials T and C are marked');
    const from = [...brand.matchAll(/class="(?:bl|ba)">(.)</g)].map((m) => m[1]).join('');
    const to = [...brand.matchAll(/class="(?:bl|bb)">(.)</g)].map((m) => m[1]).join('');
    assert.equal(from, 'Teagar');
    assert.equal(to, 'Thiago');
  }
  assert.match(await read('index.html'), /Feira de Santana, BA · atendimento em todo o Brasil/);
  assert.match(await read('en/index.html'), /Feira de Santana, Brazil · serving clients remotely/);
});

test('about photo ships 4:5 crops large enough for 3x; languages and social icons', async () => {
  const { stat } = await import('node:fs/promises');
  for (const w of [480, 800, 1200, 1600]) {
    for (const e of ['avif', 'webp', 'jpg']) assert.ok((await stat(join(root, `dist/assets/img/about-${w}.${e}`))).size > 0, `about-${w}.${e}`);
  }
  for (const [f, langs] of [['index.html', 'Português, inglês, espanhol, russo e mandarim'], ['en/index.html', 'Portuguese, English, Spanish, Russian and Mandarin']]) {
    const html = await read(f);
    const fig = html.match(/<figure class="portrait[\s\S]*?<\/figure>/)[0];
    assert.match(fig, /about-1600\.avif 1600w/);
    assert.match(fig, /width="800" height="1000"/);
    assert.ok(!/portrait-\d+/.test(html), `${f} has no old portrait files`);
    assert.ok(html.includes(langs), `${f} lists languages`);
    const social = html.match(/<div class="social[\s\S]*?<\/ul>/)[0];
    assert.equal((social.match(/social-github\.svg/g) || []).length, 2);
    assert.equal((social.match(/social-linkedin\.svg/g) || []).length, 1);
    assert.equal((social.match(/class="soc-ico"[^>]*alt=""/g) || []).length, 3);
  }
  const { SOCIAL_ICONS } = await import('../scripts/pixel-icons.mjs');
  for (const id of Object.keys(SOCIAL_ICONS)) {
    assert.match(await read(`assets/img/icons/social-${id}.svg`), /shape-rendering="crispEdges"/);
  }
});

test('seo: no language redirect, short titles, full JSON-LD, llms.txt and favicon.ico', async () => {
  const { stat } = await import('node:fs/promises');
  for (const [f, hintLang] of [['index.html', 'en'], ['en/index.html', 'pt']]) {
    const html = await read(f);
    assert.ok(!/location\.replace/.test(html), `${f} has no JS redirect`);
    const title = html.match(/<title>([^<]*)<\/title>/)[1];
    assert.ok([...title].length <= 60, `${f} title ${[...title].length} chars`);
    assert.match(html, new RegExp(`<div class="lang-hint" id="langHint" lang="[^"]+" data-for="${hintLang}" hidden>`));
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const byType = (t) => ld['@graph'].find((n) => [].concat(n['@type']).includes(t));
    const person = byType('Person');
    assert.ok(person.description && person.knowsAbout.length >= 6);
    assert.deepEqual(person.knowsLanguage.map((l) => l.alternateName), ['pt', 'en', 'es', 'ru', 'zh']);
    const org = byType('ProfessionalService');
    assert.equal(org.makesOffer.length, 6);
    assert.ok(org.makesOffer.every((o) => o.itemOffered['@type'] === 'Service' && o.itemOffered.name));
    assert.ok(byType('WebSite') && byType('WebPage'));
  }
  const llms = await read('llms.txt');
  assert.match(llms, /^# Teagar Company/);
  assert.match(llms, /## Services/);
  assert.match(llms, /https:\/\/teagar\.com\.br\/en\//);
  assert.ok((await stat(join(root, 'dist/favicon.ico'))).size > 0);
});

test('results section: three cases with pixel icons, focus statement, renumbered kickers', async () => {
  const { RESULT_ICONS } = await import('../scripts/pixel-icons.mjs');
  for (const [f, words] of [['index.html', ['+150%', 'e-commerce multinacional', 'atendimento ao cliente', 'LGPD', 'condições de trabalho', 'confidencialidade']], ['en/index.html', ['+150%', 'multinational e-commerce', 'customer service', 'LGPD', 'working conditions', 'confidentiality']]]) {
    const html = await read(f);
    const sec = html.match(/<section class="section" id="results"[\s\S]*?<\/section>/)[0];
    assert.equal((sec.match(/<li class="res reveal">/g) || []).length, 3);
    for (const id of Object.keys(RESULT_ICONS)) assert.ok(sec.includes(`/assets/img/icons/${id}.svg`), `${f} uses ${id}`);
    for (const w of words) assert.ok(sec.includes(w), `${f} mentions ${w}`);
    assert.ok(html.indexOf('id="services"') < html.indexOf('id="results"') && html.indexOf('id="results"') < html.indexOf('id="work"'));
  }
  for (const id of Object.keys(RESULT_ICONS)) assert.match(await read(`assets/img/icons/${id}.svg`), /shape-rendering="crispEdges"/);
  const pt = JSON.parse(await readFile(join(root, 'src/content/pt-BR.json'), 'utf8'));
  assert.deepEqual(['services', 'results', 'work', 'process', 'about', 'stack'].map((k) => pt[k].kicker.slice(0, 2)), ['01', '02', '03', '04', '05', '06']);
});

test('llms.txt includes the results section', async () => {
  const llms = await read('llms.txt');
  assert.match(llms, /## Results/);
  assert.match(llms, /\+150% — production at a multinational e-commerce company\./);
});

test('Feira de Santana landing page: local cases, testimonial, JSON-LD, sitemap, links', async () => {
  const html = await read('feira-de-santana/index.html');
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  assert.ok(/Feira de Santana/.test(title) && [...title].length <= 60, title);
  assert.match(html, /<html lang="pt-BR"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/teagar\.com\.br\/feira-de-santana\/">/);
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.match(html, /SAC/);
  assert.match(html, /TNF-e[\s\S]*mais de 200 transportadoras[\s\S]*link de rastreio/);
  assert.match(await read('index.html'), /TNF-e/);
  assert.match(await read('en/index.html'), /TNF-e, read invoice PDFs from more than 200 carriers/);
  assert.match(html, /\/assets\/img\/icons\/gartrol\.svg/);
  assert.match(html, /<blockquote><p>Peguei o projeto todo/);
  assert.ok(!/R\. Vicente|Papagaio|44055/.test(html), 'no street address');
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const types = ld['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('WebPage') && types.includes('BreadcrumbList'));
  const svcs = ld['@graph'].filter((n) => n['@type'] === 'Service');
  assert.equal(svcs.length, 6);
  assert.ok(svcs.every((s) => s.areaServed.name === 'Feira de Santana'));
  assert.match(await read('sitemap.xml'), /<loc>https:\/\/teagar\.com\.br\/feira-de-santana\/<\/loc>/);
  assert.match(await read('llms.txt'), /feira-de-santana\//);
  for (const f of ['index.html', 'en/index.html']) {
    const home = await read(f);
    assert.match(home, /<a href="\/feira-de-santana\/" hreflang="pt-BR">/);
    const org = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find((n) => [].concat(n['@type']).includes('ProfessionalService'));
    assert.equal(org.address.addressLocality, 'Feira de Santana');
    assert.ok(!org.address.streetAddress);
    assert.equal(org.areaServed[0].name, 'Feira de Santana');
  }
});

test('service hover marker is the Teagar logo pointing left; contact form button; OSS stat; product statuses', async () => {
  for (const f of ['index.html', 'en/index.html']) {
    const html = await read(f);
    const svcs = html.match(/<li class="svc reveal">[\s\S]*?<\/li>\n/g);
    assert.equal(svcs.length, 6);
    for (const li of svcs) assert.match(li, /<svg class="arrow point" viewBox="0 44 612 526" fill="currentColor" aria-hidden="true"><path transform="matrix\(-1 0 0 1 612 0\)" d="M293\.24 566\.233 /);
  }
  assert.match(await read('index.html'), /type="submit">Abrir no e-mail/);
  assert.match(await read('en/index.html'), /type="submit">Open in email/);
  const pt = await read('index.html'), en = await read('en/index.html');
  assert.equal((pt.match(/<dl class="stats">[\s\S]*?<\/dl>/)[0].match(/<dt>/g) || []).length, 4);
  assert.match(pt, /<dt>5<\/dt><dd>contribuições aceitas em open source com ~12 mil estrelas<\/dd>/);
  assert.match(en, /<dt>5<\/dt><dd>accepted contributions to open source with ~12k stars<\/dd>/);
  const chip = (html, slug) => html.match(new RegExp(`id="work-${slug}"[\\s\\S]*?class="status-chip (\\w+)"`))?.[1];
  for (const html of [pt, en]) {
    assert.equal(chip(html, 'gartrol'), 'live');
    assert.equal(chip(html, 'teagarden'), 'beta');
  }
});

test('about: own voice title, concrete pull quote and a dated "now" block', async () => {
  const pt = await read('index.html'), en = await read('en/index.html');
  assert.match(pt, /<h2 id="about-h"[^>]*>[\s\S]*?Thiago no RG, Teagar no GitHub\.<\/h2>/);
  assert.match(en, /<h2 id="about-h"[^>]*>[\s\S]*?Thiago on paper, Teagar on GitHub\.<\/h2>/);
  assert.match(pt, /<p class="pull reveal">Quase todo projeto meu começa com alguém fazendo à mão o que o computador podia fazer\.<\/p>/);
  assert.match(pt, /<figcaption class="ptag">Thiago Cerqueira, o Teagar<\/figcaption>/);
  assert.match(pt, /Também dou aula: mantenho uma trilha aberta de Programação de Sistemas\.<\/p>/);
  const person = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find((n) => n['@type'] === 'Person');
  assert.equal(person(pt).jobTitle, 'Engenheiro de software, fundador e professor');
  assert.equal(person(en).jobTitle, 'Software engineer, founder and teacher');
  for (const html of [pt, en]) {
    const now = html.match(/<div class="now reveal">[\s\S]*?<\/div>/)[0];
    assert.match(now, /<time class="now-date" datetime="2026-11">/);
    assert.equal((now.match(/<li>/g) || []).length, 4);
    assert.ok(!/Back-end, tempo real, IA aplicada|Back-end, real-time, applied AI/.test(html), 'generic focus line removed');
  }
});

test('process: each step says what the client gets, no slogan or dashes, ends with a CTA', async () => {
  for (const [f, label, cta] of [['index.html', 'Você recebe', 'Começar pelo diagnóstico'], ['en/index.html', 'You get', 'Start with a diagnosis']]) {
    const html = await read(f);
    const sec = html.match(/<section class="section" id="process"[\s\S]*?<\/section>/)[0];
    assert.equal((sec.match(/<li class="step reveal">/g) || []).length, 4);
    assert.equal((sec.match(new RegExp(`<span class="get-l">${label}</span>`, 'g')) || []).length, 4);
    assert.match(sec, new RegExp(`<a class="btn btn-primary" href="#contact">${cta}`));
    assert.ok(!/caixa-preta|black box|—/.test(sec), `${f}: no slogan or em dash`);
  }
});

test('support result shows time per case 7-15 -> 3-6 min with a labelled range chart', async () => {
  for (const [f, before, after] of [['index.html', 'Antes', 'Depois'], ['en/index.html', 'Before', 'After']]) {
    const html = await read(f);
    const card = html.match(/<li class="res reveal"><img class="res-ico" src="\/assets\/img\/icons\/result-support\.svg"[\s\S]*?<\/li>/)[0];
    assert.match(card, /<span class="res-v">3–6 min<\/span>/);
    const chart = card.match(/<figure class="range-chart">[\s\S]*?<\/figure>/)[0];
    assert.match(chart, new RegExp(`<span class="rc-l">${before}</span><span class="rc-track"><span class="rc-bar" style="left:46\\.667%;width:53\\.333%"></span></span><span class="rc-v">7–15 min</span>`));
    assert.match(chart, new RegExp(`<span class="rc-l">${after}</span><span class="rc-track"><span class="rc-bar" style="left:20%;width:20%"></span></span><span class="rc-v">3–6 min</span>`));
    assert.match(chart, /<div class="rc-row rc-axis" aria-hidden="true">/);
  }
});

test('theme switch: page colors use the same duration and easing as the sky cross-fade', async () => {
  const css = await read('assets/site.css');
  const sky = css.match(/scene-in (\.7s cubic-bezier\(\.65,0,\.35,1\))/);
  assert.ok(sky, 'sky cross-fade timing found');
  const page = css.match(/html\.theme-anim[^{]*\{transition:([^}]*)\}/);
  assert.ok(page, 'theme-anim rule found');
  for (const prop of ['background-color', 'color', 'border-color']) assert.ok(page[1].includes(`${prop} ${sky[1]}`), `${prop} follows the sky`);
});

test('contact tea line marks the tea word like a selection, in every page', async () => {
  for (const [f, word] of [['index.html', 'chá'], ['en/index.html', 'tea'], ['feira-de-santana/index.html', 'chá']]) {
    const html = await read(f);
    assert.match(html, new RegExp(`<p class="tea-line reveal">[^<]*<span class="tea-word">${word}</span>`), `${f} marks ${word}`);
  }
  const css = await read('assets/site.css');
  assert.match(css, /\.tea-word\{background:var\(--ember\);color:var\(--on-ember\)/);
});

test('company page: both languages, SEO, language switch and in-house products', async () => {
  for (const [f, lang, self, other] of [['teagar-company/index.html', 'pt-BR', '/teagar-company/', '/en/teagar-company/'], ['en/teagar-company/index.html', 'en', '/en/teagar-company/', '/teagar-company/']]) {
    const html = await read(f);
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.match(html, new RegExp(`<link rel="canonical" href="https://teagar.com.br${self}">`));
    assert.match(html, /<link rel="alternate" hreflang="pt-BR" href="https:\/\/teagar.com.br\/teagar-company\/">/);
    assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/teagar.com.br\/en\/teagar-company\/">/);
    assert.match(html, new RegExp(`id="langSwitch" href="${other}"`));
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const types = ld['@graph'].map((n) => [].concat(n['@type']).join('+'));
    assert.ok(types.includes('AboutPage') && types.includes('BreadcrumbList') && types.includes('Organization+ProfessionalService'));
    for (const slug of ['gartrol', 'teagarden', 'egogero']) assert.match(html, new RegExp(`id="work-${slug}"`));
    assert.match(html, /href="https:\/\/github.com\/teagarcompany"/);
    assert.doesNotMatch(html, /class="co-link"/, 'the company page does not link to itself');
  }
  const sitemap = await read('sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/teagar.com.br\/teagar-company\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/teagar.com.br\/en\/teagar-company\/<\/loc>/);
  assert.match(await read('llms.txt'), /\/teagar-company\//);
});

test('every visible "Teagar Company" on the other pages links to the company page of its language', async () => {
  for (const [f, href] of [['index.html', '/teagar-company/'], ['en/index.html', '/en/teagar-company/'], ['feira-de-santana/index.html', '/teagar-company/'], ['404.html', '/teagar-company/']]) {
    const html = await read(f);
    const body = html.slice(html.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, '');
    const total = (body.match(/Teagar Company/g) || []).length;
    const linked = [...body.matchAll(/<a class="co-link" href="([^"]+)">Teagar Company<\/a>/g)];
    assert.ok(total > 0, `${f} mentions the company`);
    assert.equal(linked.length, total, `${f}: every mention is linked`);
    assert.ok(linked.every((m) => m[1] === href), `${f} links to ${href}`);
    assert.doesNotMatch(body, /<a [^>]*>(?:(?!<\/a>)[\s\S])*<a /, `${f} has no nested links`);
  }
});

test('hero stage fades into the page instead of ending in a hard card edge', async () => {
  const css = await read('assets/site.css');
  const rule = css.match(/\.stage\{--px-size:6;[^}]*\}/)[0];
  assert.match(rule, /mask-image:var\(--fade-x\),var\(--fade-y\)/);
  assert.match(rule, /mask-composite:intersect/);
  assert.match(rule, /-webkit-mask-composite:source-in/);
  assert.doesNotMatch(rule, /border-radius/);
});

test('easter egg: three clicks on the moon or the sun swap it for the Teagar Company logo', async () => {
  for (const f of ['index.html', 'en/index.html']) {
    const html = await read(f);
    assert.match(html, /<img class="pmoon" src="\/assets\/img\/moon.svg"[^>]*><span class="egg-logo egg-moon" aria-hidden="true"><\/span>/);
    assert.match(html, /<img class="pmoon psun" src="\/assets\/img\/sun.svg"[^>]*><span class="egg-logo egg-sun" aria-hidden="true"><\/span>/);
  }
  const js = await read('assets/site.js');
  assert.match(js, /querySelectorAll\('#stage \.moon-wrap, #stage \.sun-wrap'\)/);
  assert.match(js, /taps === 3/);
  assert.match(js, /classList\.toggle\('egg'\)/);
  const css = await read('assets/site.css');
  assert.match(css, /\.stage\.egg \.egg-logo\{opacity:1;transform:none\}/);
  assert.match(css, /mask:url\(\/assets\/brand\/logo\.svg\) center\/contain no-repeat/, 'the logo masks the texture');
  assert.match(css, /\.egg-moon\{--egg-tex:url\(\/assets\/img\/moon\.svg\)/);
  assert.match(css, /\.egg-sun\{--egg-tex:url\(\/assets\/img\/sun\.svg\)/);
});

test('more easter eggs: tea time, cup, Konami, console, shooting star, typing teagar and eclipse', async () => {
  for (const f of ['index.html', 'en/index.html', 'feira-de-santana/index.html', 'teagar-company/index.html', 'cheats/index.html', 'en/cheats/index.html']) {
    const html = await read(f);
    assert.ok(html.includes('<div class="egg-toast" id="eggToast" role="status" aria-live="polite"></div>'), f);
    const data = JSON.parse(html.match(/<script type="application\/json" id="eggData">([^<]*)<\/script>/)[1]);
    for (const k of ['cup', 'wish', 'konami', 'eclipse', 'console', 'terminal', 'names', 'projects', 'mail', 'cheats']) assert.ok(data[k], `${f}: eggData.${k}`);
    assert.ok(html.includes('<filter id="gb-filter"'), `${f}: Game Boy filter`);
    assert.ok(html.includes('class="tea tea-mini"'), `${f}: footer cup`);
  }
  for (const [f, line] of [['index.html', 'Já é hora do <span class="tea-word">chá</span>'], ['en/index.html', 'It&#39;s <span class="tea-word">tea</span> time'], ['feira-de-santana/index.html', 'hora do <span class="tea-word">chá</span>']]) {
    const html = await read(f);
    assert.ok(html.includes('<template class="tea-time-tpl">') && html.includes(line), `${f}: tea-time line`);
  }
  for (const f of ['index.html', 'en/index.html']) {
    assert.match(await read(f), /<div class="eclipse" aria-hidden="true"><img class="ec-sun" src="\/assets\/img\/sun.svg"/);
  }
  const js = await read('assets/site.js');
  assert.match(js, /getHours\(\)/); assert.match(js, /hour\s*===\s*16/, 'tea time is 16:00-17:00');
  assert.ok(js.includes("'arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'") || js.includes("'arrowup', 'arrowup', 'arrowdown'"), 'Konami sequence');
  assert.match(js, /'teagar'/);
  assert.match(js, /fills\s*<\s*5/);
  assert.match(js, /flips\s*<\s*5/);
  assert.match(js, /shoot,\s*2e4|shoot,\s*20000/);
  assert.match(js, /console\.log/);
  assert.match(js, /input\|textarea\|select/, 'keyboard eggs ignore form fields');
  const css = await read('assets/site.css');
  assert.match(css, /html\.gameboy :is\(\.topbar,main,\.footer\)\{filter:url\(#gb-filter\)\}/, 'filter never on body (keeps the fixed bar)');
  assert.match(css, /\.brand\.roll \.bb\{transform:none;opacity:1\}/);
  assert.match(css, /\.stage\.eclipsing \.eclipse\{opacity:1\}/);
  assert.match(css, /prefers-reduced-motion:reduce\)\{[^@]*\.stage\.eclipsing \.eclipse \.ec-moon\{animation:none;transform:none\}/);
});

test('second batch of easter eggs: source note, terminal, deploy, drag, constellation, rain, coffee, spell, dates, photo, turbo', async () => {
  for (const f of ['index.html', 'en/index.html', 'feira-de-santana/index.html', 'teagar-company/index.html', 'cheats/index.html', '404.html']) {
    const html = await read(f);
    assert.match(html, /^<!doctype html>\n<!--\n[\s\S]*?\/cheats\/\?found=source[\s\S]*?-->\n<html /, `${f}: view-source note`);
  }
  for (const f of ['index.html', 'en/index.html']) {
    const html = await read(f);
    assert.match(html, /<span class="bspell" aria-hidden="true">Tea<img src="\/assets\/img\/tea-cup.svg"[^>]*>gar<\/span>/);
    assert.match(html, /<svg class="constellation" viewBox="0 0 64 64" aria-hidden="true" focusable="false">(<polyline [^>]+\/>){3}(<rect [^>]+\/>){12}<\/svg>/);
    assert.ok(html.includes('<template class="late-tpl">'));
    assert.equal((html.match(/<g class="cloud" transform=/g) || []).length, 4, 'clouds are hit-testable');
  }
  const js = await read('assets/site.js');
  for (const needle of ['teagar-eggs', 'tea-coffee.svg', 'stars-align', 'raindrop', 'tickle', 'sweat', 'bunting', 'party-hat', 'deploy-log', 'found=source', 'window.cha', "'contratar'", "'hire'", 'aria-modal']) assert.ok(js.includes(needle), needle);
  assert.match(js, /pointerType\s*===\s*['"]touch['"]/, 'drag ignores touch so scrolling is untouched');
  assert.match(js, /getMonth\(\)\s*===\s*5/, 'June bunting');
  assert.match(js, /hour\s*<\s*5/, 'late night 0-5h');
  const css = await read('assets/site.css');
  assert.match(css, /\.cheats\.lockable \.cheat:not\(\.got\)\s*>\s*:not\(\.cheat-lock\)\{display:none\}/);
  assert.match(css, /\.brand\.spell \.bspell\{display:inline-flex/);
  await access(join(root, 'dist/assets/img/tea-coffee.svg'));
});

test('secret cheats page: both languages, noindex, every egg listed, not in sitemap or llms.txt', async () => {
  for (const [f, lang, other] of [['cheats/index.html', 'pt-BR', '/en/cheats/'], ['en/cheats/index.html', 'en', '/cheats/']]) {
    const html = await read(f);
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'));
    assert.ok(!html.includes('rel="canonical"'), 'no canonical on a hidden page');
    const { BIRTHDAY } = await import('../src/template.mjs');
    const ids = ['moon', 'teatime', 'cup', 'konami', 'console', 'star', 'teagar', 'eclipse', 'deploy', 'source', 'terminal', 'drag', 'constellation', 'rain', 'latenight', 'spell', 'junino', 'birthday', 'photo', 'turbo'].filter((id) => id !== 'birthday' || BIRTHDAY);
    assert.equal((html.match(/<li class="cheat" id="cheat-/g) || []).length, ids.length);
    for (const id of ids) assert.ok(html.includes(`id="cheat-${id}" data-egg="${id}"`), `${f}: ${id}`);
    assert.ok(html.includes('id="cheatsBar" hidden') && html.includes('id="cheatsReveal"') && html.includes('data-tpl="'), `${f}: achievements bar`);
    assert.equal((html.match(/class="cheat-lock"/g) || []).length, ids.length, 'every card has a locked face');
    assert.ok(html.includes(`id="langSwitch" href="${other}"`));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  }
  assert.ok(!(await read('sitemap.xml')).includes('cheats'));
  assert.ok(!(await read('llms.txt')).includes('cheats'));
  for (const f of ['index.html', 'en/index.html', 'feira-de-santana/index.html', 'teagar-company/index.html']) {
    assert.ok(!(await read(f)).includes('href="/cheats/') && !(await read(f)).includes('href="/en/cheats/'), `${f} does not link the secret page`);
  }
});
