import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeMoonAssets } from './moon.mjs';
import { writeSunAssets } from './sun.mjs';
import { writeTeaAssets } from './tea.mjs';
import { writeIconAssets } from './pixel-icons.mjs';
import { renderPage, render404, renderCityPage, renderCompanyPage, renderCheatsPage, linkCompany, companyUrl, CHEATS_SLUG, SITE, LOCALES, CITY_PATH } from '../src/template.mjs';

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

  // every visible "Teagar Company" outside the company page links to the company page of the same language
  const ptCo = companyUrl('pt-BR'), enCo = companyUrl('en');
  await writeFile(join(dist, 'index.html'), linkCompany(renderPage({ c: pt, locale: 'pt-BR', other: { locale: 'en', meta: en.meta }, assets, logoPaths }), ptCo));
  await writeFile(join(dist, 'en/index.html'), linkCompany(renderPage({ c: en, locale: 'en', other: { locale: 'pt-BR', meta: pt.meta }, assets, logoPaths }), enCo));
  await writeFile(join(dist, '404.html'), linkCompany(render404({ assets }), ptCo));
  await mkdir(join(dist, ptCo), { recursive: true });
  await mkdir(join(dist, enCo), { recursive: true });
  await writeFile(join(dist, ptCo, 'index.html'), renderCompanyPage({ c: pt, locale: 'pt-BR', other: { locale: 'en', meta: en.meta }, assets, logoPaths }));
  await writeFile(join(dist, enCo, 'index.html'), renderCompanyPage({ c: en, locale: 'en', other: { locale: 'pt-BR', meta: pt.meta }, assets, logoPaths }));
  // secret easter egg page: noindex and deliberately left out of the sitemap and llms.txt
  for (const [c, locale, other] of [[pt, 'pt-BR', { locale: 'en', meta: en.meta }], [en, 'en', { locale: 'pt-BR', meta: pt.meta }]]) {
    const dir = join(dist, LOCALES[locale].path, CHEATS_SLUG);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), linkCompany(renderCheatsPage({ c, locale, other, assets, logoPaths }), companyUrl(locale)));
  }
  const city = JSON.parse(await readFile(join(root, 'src/content/feira-de-santana.json'), 'utf8'));
  await mkdir(join(dist, CITY_PATH), { recursive: true });
  await writeFile(join(dist, CITY_PATH, 'index.html'), linkCompany(renderCityPage({ c: pt, city, assets, logoPaths }), ptCo));

  const alt = (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${LOCALES[l].url}"/>`;
  const links = [alt('pt-BR'), alt('en'), `<xhtml:link rel="alternate" hreflang="x-default" href="${LOCALES['pt-BR'].url}"/>`].join('');
  const coAlt = (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${companyUrl(l)}"/>`;
  const coLinks = [coAlt('pt-BR'), coAlt('en'), `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${companyUrl('pt-BR')}"/>`].join('');
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${Object.values(LOCALES).map((l) => `<url><loc>${l.url}</loc><lastmod>${today}</lastmod>${links}</url>`).join('\n')}\n<url><loc>${SITE}${CITY_PATH}</loc><lastmod>${today}</lastmod></url>\n${['pt-BR', 'en'].map((l) => `<url><loc>${SITE}${companyUrl(l)}</loc><lastmod>${today}</lastmod>${coLinks}</url>`).join('\n')}\n</urlset>\n`;
  await writeFile(join(dist, 'sitemap.xml'), sitemap);
  await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  await writeFile(join(dist, 'llms.txt'), llmsTxt(en, pt, city));
  console.log(`built dist/ (css ${assets.css}, js ${assets.js})`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/** llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants, generated from the same copy as the pages */
function llmsTxt(en, pt, city) {
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
    `- [Feira de Santana (pt-BR)](${SITE}${CITY_PATH}): ${plain(city.meta.description)}`,
    `- [Teagar Company (English)](${SITE}${companyUrl('en')}): ${plain(en.company.meta.description)}`,
    `- [Teagar Company (pt-BR)](${SITE}${companyUrl('pt-BR')}): ${plain(pt.company.meta.description)}`,
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
