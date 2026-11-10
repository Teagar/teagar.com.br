import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeMoonAssets } from './moon.mjs';
import { writeSunAssets } from './sun.mjs';
import { writeTeaAssets } from './tea.mjs';
import { writeIconAssets } from './pixel-icons.mjs';
import { renderPage, render404, SITE, LOCALES } from '../src/template.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const minCss = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/:\s+/g, ':').replace(/;}/g, '}');
const minJs = (s) =>
  s.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);

async function bundle(dir, ext, min) {
  const files = (await readdir(join(root, dir))).filter((f) => f.endsWith(ext)).sort();
  const parts = [];
  for (const f of files) parts.push(await readFile(join(root, dir, f), 'utf8'));
  return min(parts.join('\n'));
}

async function main() {
  const pt = JSON.parse(await readFile(join(root, 'src/content/pt-BR.json'), 'utf8'));
  const en = JSON.parse(await readFile(join(root, 'src/content/en.json'), 'utf8'));

  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, 'en'), { recursive: true });
  await cp(join(root, 'public'), dist, { recursive: true });

  await writeMoonAssets(join(dist, 'assets/img'));
  await writeSunAssets(join(dist, 'assets/img'));
  await writeTeaAssets(join(dist, 'assets/img'));
  await writeIconAssets(join(dist, 'assets/img/icons'));
  const css = await bundle('src/styles', '.css', minCss);
  const js = await bundle('src/scripts', '.js', minJs);
  const assets = { css: hash(css), js: hash(js) };
  await writeFile(join(dist, 'assets/site.css'), css);
  await writeFile(join(dist, 'assets/site.js'), js);

  const svg = await readFile(join(root, 'public/assets/brand/logo.svg'), 'utf8');
  const logoPaths = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

  await writeFile(join(dist, 'index.html'), renderPage({ c: pt, locale: 'pt-BR', other: { locale: 'en', meta: en.meta }, assets, logoPaths }));
  await writeFile(join(dist, 'en/index.html'), renderPage({ c: en, locale: 'en', other: { locale: 'pt-BR', meta: pt.meta }, assets, logoPaths }));
  await writeFile(join(dist, '404.html'), render404({ assets }));

  const alt = (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${LOCALES[l].url}"/>`;
  const links = [alt('pt-BR'), alt('en'), `<xhtml:link rel="alternate" hreflang="x-default" href="${LOCALES['pt-BR'].url}"/>`].join('');
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${Object.values(LOCALES).map((l) => `<url><loc>${l.url}</loc><lastmod>${today}</lastmod>${links}</url>`).join('\n')}\n</urlset>\n`;
  await writeFile(join(dist, 'sitemap.xml'), sitemap);
  await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  await writeFile(join(dist, 'llms.txt'), llmsTxt(en, pt));
  console.log(`built dist/ (css ${assets.css}, js ${assets.js})`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/** llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants, generated from the same copy as the pages */
function llmsTxt(en, pt) {
  const plain = (t) => String(t).replace(/\s+/g, ' ').trim();
  const lines = [
    '# Teagar Company — Thiago Cerqueira (Teagar)',
    '',
    `> ${plain(en.meta.description)}`,
    '',
    plain(en.hero.lead),
    '',
    `Location: ${plain(en.hero.location)}. Languages: ${plain(en.about.facts.find((f) => /language/i.test(f.label))?.value || '')}.`,
    `Contact: ${en.contact.email}`,
    '',
    '## Pages',
    '',
    `- [Portuguese (pt-BR)](${LOCALES['pt-BR'].url}): ${plain(pt.meta.description)}`,
    `- [English](${LOCALES.en.url}): ${plain(en.meta.description)}`,
    '',
    '## Services',
    '',
    ...en.services.items.map((s) => `- ${plain(s.title)}: ${plain(s.body)}`),
    '',
    '## Results',
    '',
    plain(en.results.intro),
    '',
    ...en.results.items.map((r) => `- ${plain(r.value)} — ${plain(r.label)}.${r.body ? ` ${plain(r.body)}` : ''}`),
    '',
    plain(en.results.note),
    '',
    '## Projects',
    '',
    ...en.work.items.map((i) => {
      const link = i.links && i.links[0] ? `[${plain(i.name)}](${i.links[0].url})` : plain(i.name);
      return `- ${link} (${plain(i.category)}, ${plain(String(i.year))}): ${plain(i.summary)}`;
    }),
    '',
    '## Profiles',
    '',
    '- [GitHub (Teagar)](https://github.com/Teagar)',
    '- [GitHub (Teagar Company)](https://github.com/teagarcompany)',
    '- [LinkedIn](https://www.linkedin.com/in/teagar/)',
    '',
  ];
  return lines.join('\n');
}
