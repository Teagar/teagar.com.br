// HTML templates. Every interpolated string goes through esc().
import { starsInline } from '../scripts/moon.mjs';
import { cloudsInline } from '../scripts/sun.mjs';

// Navbar name: "Teagar Cerqueira" by default; on hover/focus each letter of
// "Teagar" rolls into the matching letter of "Thiago" (both have 6 letters).
const BRAND_FROM = 'Teagar';
const BRAND_TO = 'Thiago';
function brandName() {
  const slots = [...BRAND_FROM].map((c, i) => c === BRAND_TO[i]
    ? `<span class="bl">${c}</span>`
    : `<span class="bs" style="--i:${i}"><span class="ba">${c}</span><span class="bb">${BRAND_TO[i]}</span></span>`).join('');
  return `<span class="bn"><span class="vh">Teagar Cerqueira (Thiago Cerqueira)</span><span class="bw" aria-hidden="true"><span class="bf">${slots}</span><span class="bc"> C</span>erqueira</span></span>`;
}

export const SITE = 'https://teagar.com.br';
export const LOCALES = {
  'pt-BR': { path: '/', url: `${SITE}/`, short: 'pt-BR' },
  en: { path: '/en/', url: `${SITE}/en/`, short: 'en' },
};

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** spoken languages (BCP 47 code, English name) for knowsLanguage */
const LANGS = [['pt', 'Portuguese'], ['en', 'English'], ['es', 'Spanish'], ['ru', 'Russian'], ['zh', 'Mandarin Chinese']];
/** Contact tea line with the tea word set like a text selection: the "tea" in Teagar. */
function teaLine(contact) {
  const line = esc(contact.teaLine), word = esc(contact.teaWord || '');
  const i = word ? line.indexOf(word) : -1;
  return i < 0 ? line : `${line.slice(0, i)}<span class="tea-word">${word}</span>${line.slice(i + word.length)}`;
}

/** Before/after range chart (HTML/CSS): one row per period, bar from `from` to `to` on a shared 0..max axis,
 *  values always printed beside the bar so identity and value never depend on color. */
function rangeChart(ch) {
  const pct = (v) => +(v / ch.max * 100).toFixed(3);
  const rows = ch.rows.map((r, i) => `<div class="rc-row rc-${i === ch.rows.length - 1 ? 'after' : 'before'}"><span class="rc-l">${esc(r.label)}</span><span class="rc-track"><span class="rc-bar" style="left:${pct(r.from)}%;width:${pct(r.to - r.from)}%"></span></span><span class="rc-v">${r.from}–${r.to} ${esc(ch.unit)}</span></div>`).join('');
  const ticks = ch.ticks.map((t) => `<span style="left:${pct(t)}%">${t}${t === ch.max ? ` ${esc(ch.unit)}` : ''}</span>`).join('');
  return `<figure class="range-chart"><figcaption class="rc-t">${esc(ch.title)}</figcaption>${rows}<div class="rc-row rc-axis" aria-hidden="true"><span></span><span class="rc-track">${ticks}</span><span class="rc-v">${esc(ch.unit)}</span></div></figure>`;
}

/** local landing page and the areas the company serves (city first: local SEO) */
export const CITY_PATH = '/feira-de-santana/';
const CITY = { '@type': 'City', name: 'Feira de Santana', containedInPlace: { '@type': 'State', name: 'Bahia' } };
const AREA_SERVED = [CITY, { '@type': 'Country', name: 'Brasil' }, 'Worldwide'];
const GH = 'https://github.com/Teagar';
const CONTRIB_REPO = 'https://github.com/noctalia-dev/community-plugins';
const GH_ORG = 'https://github.com/teagarcompany';
const LI = 'https://www.linkedin.com/in/teagar/';

/** Teagar Company logo (tc-point) mirrored to point left, used as the service hover marker */
const ICON_POINT = `<svg class="arrow point" viewBox="0 44 612 526" fill="currentColor" aria-hidden="true"><path transform="matrix(-1 0 0 1 612 0)" d="M293.24 566.233 C349.589 559.534 404.168 534.564 447.41 491.322 L376.628 420.54 C361.137 436.032 343.278 447.733 324.223 455.636 C280.674 473.697 230.839 471.944 188.518 450.359 L412.023 226.854 L561.95 376.782 L597.345 341.387 C616.885 321.847 616.885 290.153 597.345 270.613 L447.41 120.678 C435.304 108.573 422.31 97.906 408.637 88.661 C373.468 64.887 333.815 50.591 293.24 45.767 C272.553 43.294 251.623 43.294 230.935 45.767 C174.586 52.466 120.007 77.436 76.766 120.678 C33.524 163.92 8.554 218.499 1.855 274.848 C-0.618 295.535 -0.618 316.465 1.855 337.152 C6.679 377.727 20.974 417.381 44.749 452.549 C53.993 466.222 64.66 479.217 76.766 491.322 C88.871 503.428 101.865 514.094 115.538 523.339 C150.707 547.113 190.361 561.409 230.935 566.233 C251.623 568.706 272.553 568.706 293.24 566.233 Z M112.451 243.865 C120.355 224.81 132.056 206.951 147.547 191.46 C163.039 175.968 180.898 164.267 199.953 156.364 C243.501 138.303 293.337 140.056 335.657 161.641 L117.728 379.57 C96.144 337.249 94.39 287.414 112.451 243.865 Z"/></svg>`;
const ICON_ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_EXT = '<svg class="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

const logo = (cls = '') => `<svg class="${cls}" viewBox="0 0 505 505" aria-hidden="true" focusable="false"><use href="#tc-logo"/></svg>`;

const secHead = (s, id) => `<div class="sec-head reveal"><h2 id="${id}"><span class="sun-dot" aria-hidden="true"></span>${esc(s.title)}</h2>${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}</div>`;

const firstSentence = (text) => {
  const m = String(text).match(/^(.+?[.!?])(?:\s+|$)/);
  return m ? [m[1], String(text).slice(m[0].length)] : [String(text), ''];
};

const ext = (ui, label, url, icon) =>
  `<a href="${esc(url)}" target="_blank" rel="noopener">${icon ? `<img class="soc-ico" src="/assets/img/icons/social-${icon}.svg" width="16" height="16" alt="" decoding="async">` : ''}${esc(label)}${ICON_EXT}<span class="vh"> (${esc(ui.external)})</span></a>`;

const picture = ({ base, exts, sizes, widths, w, h, alt, attrs, fallback }) => {
  const set = (e) => widths.map((x) => `/assets/img/${base}-${x}.${e} ${x}w`).join(', ');
  const src = exts.map((e, i) => (i < exts.length - 1 ? `<source type="image/${e}" srcset="${set(e)}" sizes="${sizes}">` : '')).join('');
  const last = exts[exts.length - 1];
  return `<picture>${src}<img src="/assets/img/${base}-${widths[1]}.${last}" srcset="${set(last)}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${attrs}></picture>`;
};

const STATUS_CLS = { live: 'live', beta: 'beta', inProgress: 'dev', openSource: 'oss' };
const statusIco = (st) => `<span class="st-ico st-${STATUS_CLS[st] || 'oss'}" aria-hidden="true"></span>`;
const statusBadge = (ui, st) =>
  `<span class="status-chip ${STATUS_CLS[st] || 'oss'}">${statusIco(st)}${esc(ui[st] || st)}</span>`;
const statusLegend = (ui, work) =>
  `<ul class="status-legend reveal" aria-label="${esc(work.legend)}">${Object.keys(STATUS_CLS).map((st) => `<li>${statusIco(st)}${esc(ui[st])}</li>`).join('')}</ul>`;
const projectIcon = (id, px) =>
  id ? `<img class="pico" src="/assets/img/icons/${esc(id)}.svg" width="${px}" height="${px}" alt="" decoding="async">` : '';

const workItem = (ui, it, size) => {
  const links = it.links.length
    ? `<div class="links">${it.links.map((l) => ext(ui, l.label, l.url)).join('')}</div>`
    : `<p class="private">${esc(ui.private)}</p>`;
  return `<li class="card glow-card ${size} reveal" id="work-${esc(it.slug)}">
${projectIcon(it.icon, size === 'small' ? 48 : 72)}
<div class="meta-row"><span class="meta">${esc(it.category)} · ${esc(it.year)}</span>${statusBadge(ui, it.status)}</div>
<h3 class="name">${esc(it.name)}</h3>
<p class="sum">${esc(it.summary)}</p>
<ul class="chips" aria-label="Stack">${it.stack.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>
${links}
</li>`;
};

const contribBlock = (ui, ct) => `<div class="contrib reveal">
<h3 class="contrib-h">${esc(ct.title)}</h3>
<p class="contrib-intro">${esc(ct.intro)}</p>
<div class="card glow-card contrib-card">
<div class="contrib-head">
<img class="pico" src="/assets/img/icons/oss-plugin.svg" width="48" height="48" alt="" decoding="async">
<div class="contrib-id"><p class="contrib-proj">${ext(ui, ct.project, ct.projectUrl)}</p><p class="meta">${esc(ct.repo)}</p></div>
</div>
<p class="sum">${esc(ct.projectNote)}</p>
<ul class="contrib-items">
${ct.items.map((it) => `<li class="contrib-item">
<h4 class="name">${esc(it.name)}</h4>
<p class="sum">${esc(it.summary)}</p>
<ul class="chips" aria-label="Stack">${it.stack.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>
<ul class="prs" aria-label="${esc(ct.merged)}">${it.prs.map((p) => `<li><a href="${CONTRIB_REPO}/pull/${p.n}" target="_blank" rel="noopener"><img src="/assets/img/icons/status-merged.svg" width="16" height="16" alt="" decoding="async"><span class="pr-t"><span class="meta">#${p.n}</span> · ${esc(p.title)}</span>${ICON_EXT}<span class="vh"> (${esc(ui.external)})</span></a></li>`).join('')}</ul>
</li>`).join('\n')}
</ul>
</div>
</div>`;

const themeScript = `(function(){var d=document.documentElement;d.className='js';try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t);}catch(e){d.setAttribute('data-theme','light')}})();`;

/** suggestion (not a redirect) to switch language, written in the other language; shown by JS only when the browser prefers it */
const langHint = (other, O) => {
  const h = other.meta.langHint;
  return `<div class="lang-hint" id="langHint" lang="${O.short}" data-for="${other.locale === 'en' ? 'en' : 'pt'}" hidden><p>${esc(h.text)}</p><a class="lh-go" href="${O.path}" hreflang="${O.short}">${esc(h.cta)}</a><button type="button" class="lh-x" aria-label="${esc(h.close)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`;
};

const teaImg = (n, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/${n}.svg" alt="" width="48" height="${n.startsWith('tea-steam') ? 24 : 40}" decoding="async">`;
/** decorative pixel teacup; steam frames and glint are stacked images animated with steps() in CSS */
const teaStack = (steam) => `${steam ? `<span class="tea-steam">${[1, 2, 3].map((i) => teaImg(`tea-steam-${i}`, `st st${i}`)).join('')}</span>` : ''}<span class="tea-cup">${teaImg('tea-cup')}${teaImg('tea-glint', 'glint')}</span>`;

export function renderPage({ c, locale, other, assets, logoPaths }) {
  const L = LOCALES[locale];
  const O = LOCALES[other.locale];
  const { meta, ui, nav, hero, services, results, work, process: proc, about, stack, contact, footer } = c;
  const year = new Date().getFullYear();
  const ogImg = `${SITE}/og-image.jpg`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE}/#person`,
        name: 'Thiago Cerqueira',
        alternateName: 'Teagar',
        url: SITE + '/',
        image: `${SITE}/assets/img/about-800.jpg`,
        jobTitle: about.jobTitle,
        description: hero.lead,
        knowsAbout: [...services.items.map((s) => s.title), ...stack.groups.flatMap((g) => g.items).slice(0, 24)],
        knowsLanguage: LANGS.map(([code, name]) => ({ '@type': 'Language', name, alternateName: code })),
        sameAs: [GH, GH_ORG, LI],
        worksFor: { '@id': `${SITE}/#org` },
      },
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${SITE}/#org`,
        name: 'Teagar Company',
        url: SITE + '/',
        description: meta.description,
        slogan: meta.ogDescription,
        image: ogImg,
        knowsLanguage: LANGS.map(([code]) => code),
        makesOffer: services.items.map((it) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: it.title, description: it.body, provider: { '@id': `${SITE}/#org` }, areaServed: AREA_SERVED },
        })),
        logo: `${SITE}/assets/brand/apple-touch-icon.png`,
        email: contact.email,
        founder: { '@id': `${SITE}/#person` },
        sameAs: [GH_ORG],
        areaServed: AREA_SERVED,
        address: { '@type': 'PostalAddress', addressLocality: 'Feira de Santana', addressRegion: 'BA', addressCountry: 'BR' },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE + '/',
        name: 'Teagar Company',
        alternateName: 'Thiago Cerqueira (Teagar)',
        inLanguage: ['pt-BR', 'en'],
        publisher: { '@id': `${SITE}/#org` },
        about: { '@id': `${SITE}/#person` },
      },
      {
        '@type': 'WebPage',
        '@id': `${L.url}#webpage`,
        url: L.url,
        name: meta.title,
        description: meta.description,
        inLanguage: locale,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#org` },
        primaryImageOfPage: ogImg,
      },
    ],
  };

  const navItems = [['services', nav.services], ['work', nav.work], ['process', nav.process], ['about', nav.about], ['contact', nav.contact]];
  const featured = work.items.filter((i) => i.featured);
  const rest = work.items.filter((i) => !i.featured);
  const [quote, restOfP1] = firstSentence(about.paragraphs[1]);
  const mqGroups = stack.groups.map((g) => `<div class="mq-group"><h3>${esc(g.name)}</h3><ul>${g.items.map((i) => `<li class="chip">${esc(i)}</li>`).join('')}</ul></div>`).join('');
  const portraitSizes = '(max-width: 860px) 360px, 500px';

  const sun = '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  return `<!doctype html>
<html lang="${esc(meta.lang)}" class="no-js" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${themeScript}</script>
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${L.url}">
<link rel="alternate" hreflang="pt-BR" href="${LOCALES['pt-BR'].url}">
<link rel="alternate" hreflang="en" href="${LOCALES.en.url}">
<link rel="alternate" hreflang="x-default" href="${LOCALES['pt-BR'].url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Teagar Company">
<meta property="og:title" content="${esc(meta.ogTitle)}">
<meta property="og:description" content="${esc(meta.ogDescription)}">
<meta property="og:url" content="${L.url}">
<meta property="og:locale" content="${esc(meta.ogLocale)}">
<meta property="og:locale:alternate" content="${esc(other.meta.ogLocale)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(meta.ogTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.ogTitle)}">
<meta name="twitter:description" content="${esc(meta.ogDescription)}">
<meta name="twitter:image" content="${ogImg}">
<meta name="twitter:image:alt" content="${esc(meta.ogTitle)}">
<meta name="theme-color" content="#F5EFE6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E0B09" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="preload" href="/fonts/big-shoulders-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/public-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${assets.css}">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="tc-logo" viewBox="0 0 505 505">${logoPaths}</symbol></svg>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="topbar" id="topbar">
<div class="wrap bar">
<a class="brand" href="${L.path}#top">${logo()}${brandName()}</a>
<nav class="nav" id="siteNav" aria-label="${esc(ui.menu)}">
${navItems.map(([id, label]) => `<a class="nl" href="#${id}">${esc(label)}</a>`).join('\n')}
<a class="btn btn-primary btn-menu" href="#contact">${esc(nav.cta)}</a>
</nav>
<div class="tools">
<a class="pill-ctl lang lang-flag" id="langSwitch" href="${O.path}" hreflang="${esc(other.locale)}" lang="${esc(other.locale)}" title="${esc(ui.langSwitch)}" aria-label="${esc(ui.langLabel)}: ${esc(ui.langSwitch)}"><img class="flag" src="/assets/img/icons/${other.locale === 'en' ? 'flag-us' : 'flag-br'}.svg" width="32" height="22" alt="" decoding="async"><span class="vh">${esc(ui.langSwitchShort)}</span></a>
<button type="button" class="pill-ctl theme-btn" id="themeToggle" aria-label="${esc(ui.themeLabel)}" aria-pressed="false" data-light="${esc(ui.themeLight)}" data-dark="${esc(ui.themeDark)}" title="${esc(ui.themeLabel)}">${sun}${moon}</button>
<a class="btn btn-primary btn-cta" href="#contact">${esc(nav.cta)}</a>
<button type="button" class="pill-ctl menu-btn" id="menuToggle" aria-expanded="false" aria-controls="siteNav" aria-label="${esc(ui.menu)}" title="${esc(ui.menu)}"><svg class="bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
</div>
</div>
</header>
<main id="main" tabindex="-1">
<section class="hero" id="hero" aria-labelledby="top">
<div class="wrap hero-grid">
<div class="hero-copy">
<p class="hero-kicker"><span class="dot" aria-hidden="true"></span><span>${esc(hero.eyebrow)}</span></p>
<h1 id="top"><span class="ln" style="--i:0"><span>${esc(hero.titleA)}</span></span> <span class="ln" style="--i:1"><span><em>${esc(hero.titleB)}</em></span></span></h1>
<p class="lead">${esc(hero.lead)}</p>
<div class="hero-cta">
<a class="btn btn-primary" href="#contact">${esc(hero.ctaPrimary)}${ICON_ARROW}</a>
<a class="btn btn-outline" href="#work">${esc(hero.ctaSecondary)}</a>
</div>
<p class="status"><span class="live-dot" aria-hidden="true"></span><span><strong>${esc(hero.status)}</strong><span class="loc">${esc(hero.location)}</span></span></p>
</div>
<div class="stage" id="stage">
<div class="scene night">
<div class="sky" aria-hidden="true"><img src="/assets/img/moon-sky.svg" alt="" width="120" height="150" decoding="async"></div>
${starsInline()}
<div class="moon-wrap" aria-hidden="true"><div class="rise"><div class="bob">
<div class="halo"><span class="ring r1"><img src="/assets/img/moon-ring-1.svg" alt="" width="96" height="96"></span><span class="ring r2"><img src="/assets/img/moon-ring-2.svg" alt="" width="96" height="96"></span><span class="ring r3"><img src="/assets/img/moon-ring-3.svg" alt="" width="96" height="96"></span></div>
<img class="pmoon" src="/assets/img/moon.svg" alt="" width="64" height="64" decoding="async"><span class="egg-logo egg-moon" aria-hidden="true"></span>
</div></div></div>
</div>
<div class="scene day">
<div class="sky" aria-hidden="true"><img src="/assets/img/day-sky.svg" alt="" width="120" height="150" decoding="async"></div>
${cloudsInline()}
<div class="sun-wrap" aria-hidden="true"><div class="rise"><div class="bob">
<div class="halo"><span class="ring rays"><img class="f1" src="/assets/img/sun-rays-1.svg" alt="" width="96" height="96"><img class="f2" src="/assets/img/sun-rays-2.svg" alt="" width="96" height="96"></span></div>
<img class="pmoon psun" src="/assets/img/sun.svg" alt="" width="64" height="64" decoding="async"><span class="egg-logo egg-sun" aria-hidden="true"></span>
</div></div></div>
</div>
<div class="cut-pos"><div class="cut">${picture({ base: 'cutout', exts: ['avif', 'webp', 'png'], widths: [480, 960, 1440], sizes: portraitSizes, w: 960, h: 960, alt: meta.portraitAlt, attrs: 'fetchpriority="high" decoding="async"' })}</div></div>
</div>
</div>
<div class="wrap">
<dl class="stats">
${hero.stats.map((s) => `<div class="reveal"><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join('\n')}
</dl>
</div>
</section>

<section class="section" id="services" aria-labelledby="services-h">
<div class="wrap">
${secHead(services, 'services-h')}
<ol class="svc-list">
${services.items.map((it, i) => `<li class="svc reveal"><span class="svc-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(it.title)}</h3><div class="svc-body"><p>${esc(it.body)}</p><ul class="points">${it.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>${ICON_POINT}</li>`).join('\n')}
</ol>
</div>
</section>

<section class="section" id="results" aria-labelledby="results-h">
<div class="wrap">
${secHead(results, 'results-h')}
<ul class="results">
${results.items.map((it) => `<li class="res reveal"><img class="res-ico" src="/assets/img/icons/${esc(it.icon)}.svg" width="72" height="72" alt="" decoding="async"><h3><span class="res-v">${esc(it.value)}</span> <span class="res-l">${esc(it.label)}</span></h3>${it.chart ? rangeChart(it.chart) : ''}${it.body ? `<p>${esc(it.body)}</p>` : ''}</li>`).join('\n')}
</ul>
<p class="res-note reveal">${esc(results.note)}</p>
</div>
</section>

<section class="section alt" id="work" aria-labelledby="work-h">
<div class="wrap">
${secHead(work, 'work-h')}
${statusLegend(ui, work)}
<ul class="work-feat">
${featured.map((i, n) => workItem(ui, i, n === 0 ? 'big' : 'mid')).join('\n')}
</ul>
<ul class="work-rest">
${rest.map((i) => workItem(ui, i, 'small')).join('\n')}
</ul>
${work.contrib ? contribBlock(ui, work.contrib) : ''}
<p class="view-all reveal">${ext(ui, work.viewAll, GH)}</p>
</div>
</section>

<section class="section" id="process" aria-labelledby="process-h">
<div class="wrap">
${secHead(proc, 'process-h')}
<div class="steps-wrap" id="steps">
<div class="track" aria-hidden="true"><span class="track-dot"></span></div>
<ol class="steps">
${proc.steps.map((s) => `<li class="step reveal"><span class="n" aria-hidden="true">${esc(s.n)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><div class="get"><span class="get-l">${esc(proc.getLabel)}</span><p>${esc(s.get)}</p></div></li>`).join('\n')}
</ol>
</div>
<div class="proc-cta reveal"><a class="btn btn-primary" href="#contact">${esc(proc.cta)}${ICON_ARROW}</a><p>${esc(proc.ctaNote)}</p></div>
</div>
</section>

<section class="section alt" id="about" aria-labelledby="about-h">
<div class="wrap about">
<h2 id="about-h" class="about-title reveal"><span class="sun-dot" aria-hidden="true"></span>${esc(about.title)}</h2>
<div class="about-side">
<figure class="portrait reveal">
${picture({ base: 'about', exts: ['avif', 'webp', 'jpg'], widths: [480, 800, 1200, 1600], sizes: '(max-width: 860px) min(440px, calc(100vw - 40px)), min(420px, 32vw)', w: 800, h: 1000, alt: meta.portraitAlt, attrs: 'loading="lazy" decoding="async"' })}
<figcaption class="ptag">${esc(about.photoTag)}</figcaption>
</figure>
<dl class="facts reveal">
${about.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('\n')}
</dl>
</div>
<div class="about-text">
<p class="pull reveal">${esc(quote)}</p>
<div class="prose reveal">
${[about.paragraphs[0], restOfP1, ...about.paragraphs.slice(2)].filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n')}
</div>
<div class="now reveal">
<h3><span class="live-dot" aria-hidden="true"></span>${esc(about.now.title)} <time class="now-date" datetime="${esc(about.now.datetime)}">${esc(about.now.updated)}</time></h3>
<ul>${about.now.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
</div>
</div>
</div>
</section>

<section class="section" id="stack" aria-labelledby="stack-h">
<div class="wrap">
${secHead(stack, 'stack-h')}
</div>
<div class="marquee" tabindex="0" role="group" aria-labelledby="stack-h">
<div class="mq-track">
<div class="mq-set">${mqGroups}</div>
<div class="mq-set mq-copy" aria-hidden="true">${mqGroups}</div>
</div>
</div>
</section>

<section class="section contact" id="contact" aria-labelledby="contact-h">
<div class="wrap contact-grid">
<div class="contact-copy">
<div class="tea-row"><div class="tea" aria-hidden="true">${teaStack(true)}</div><p class="tea-line reveal">${teaLine(contact)}</p></div>
<h2 id="contact-h" class="reveal">${esc(contact.title)}</h2>
<p class="body reveal">${esc(contact.body)}</p>
<p class="mail-line reveal">${esc(contact.emailLabel)}<br><a class="mail" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
<div class="social reveal">
<h3>${esc(contact.socialTitle)}</h3>
<ul>
<li>${ext(ui, 'GitHub Teagar', GH, 'github')}</li>
<li>${ext(ui, 'GitHub teagarcompany', GH_ORG, 'github')}</li>
<li>${ext(ui, 'LinkedIn', LI, 'linkedin')}</li>
</ul>
</div>
</div>
<form class="form reveal" id="contactForm" action="mailto:${esc(contact.email)}" method="post" enctype="text/plain" data-to="${esc(contact.email)}" data-subject="${esc(contact.form.subject)}" data-required="${esc(contact.form.required)}" data-labels="${esc([contact.form.name, contact.form.company, contact.form.need].join('|'))}">
<div class="row2">
<div class="field"><label for="f-name">${esc(contact.form.name)}</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
<div class="field"><label for="f-company">${esc(contact.form.company)}</label><input id="f-company" name="company" type="text" autocomplete="organization"></div>
</div>
<div class="field"><label for="f-need">${esc(contact.form.need)}</label><select id="f-need" name="need">${contact.form.needOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>
<div class="field"><label for="f-message">${esc(contact.form.message)}</label><textarea id="f-message" name="message" rows="6" required></textarea></div>
<p class="form-msg" id="formMsg" role="status" aria-live="polite"></p>
<button class="btn btn-primary" type="submit">${esc(contact.form.submit)}${ICON_ARROW}</button>
</form>
</div>
</section>
</main>
<footer class="footer">
<div class="wrap foot-row">
<div><p class="tag">${esc(footer.tagline)}</p><p class="copy">© ${year} ${esc(footer.rights)} ${esc(footer.builtWith)}</p></div>
<nav class="foot-links" aria-label="${esc(ui.menu)}">${navItems.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('')}<a href="${CITY_PATH}" hreflang="pt-BR">${esc(footer.localLink)}</a><a href="#top">${esc(ui.backToTop)}</a></nav>
</div>
<div class="wm"><p class="wordmark" aria-hidden="true">Teagar</p><div class="tea tea-mini" aria-hidden="true">${teaStack(false)}</div></div>
</footer>
${langHint(other, O)}
<script src="/assets/site.js?v=${assets.js}" defer></script>
</body>
</html>
`;
}

export function render404({ assets }) {
  return `<!doctype html>
<html lang="pt-BR" data-theme="dark" class="js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 — Teagar Company</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/site.css?v=${assets.css}">
</head>
<body>
<main class="nf" id="main"><div>
<p class="hero-kicker"><span class="dot" aria-hidden="true"></span>Teagar Company</p>
<h1>404</h1>
<p lang="pt-BR">${esc('Página não encontrada. O endereço pode ter mudado ou nunca existiu.')}</p>
<p lang="en">${esc('Page not found. The address may have changed or never existed.')}</p>
<div class="hero-cta"><a class="btn btn-primary" href="/" lang="pt-BR">${esc('Voltar ao início')}</a><a class="btn btn-outline" href="/en/" lang="en">${esc('Back to home')}</a></div>
</div></main>
</body>
</html>
`;
}

/** Local landing page for Feira de Santana (pt-BR only): local cases, a user testimonial, services and contact. */
export function renderCityPage({ c, city, assets, logoPaths }) {
  const { ui, nav, services, contact, footer } = c;
  const url = SITE + CITY_PATH;
  const year = new Date().getFullYear();
  const ogImg = `${SITE}/og-image.jpg`;
  const navItems = [['services', nav.services], ['work', nav.work], ['process', nav.process], ['about', nav.about], ['contact', nav.contact]];
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: city.meta.title,
        description: city.meta.description,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#org` },
        primaryImageOfPage: ogImg,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: city.breadcrumb, item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Feira de Santana', item: url },
        ],
      },
      ...services.items.map((it, i) => ({
        '@type': 'Service',
        '@id': `${url}#service-${i + 1}`,
        name: `${it.title} em Feira de Santana`,
        description: it.body,
        serviceType: it.title,
        areaServed: CITY,
        provider: { '@id': `${SITE}/#org` },
      })),
    ],
  };
  const sun = '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const caseItem = (it) => `<li class="res loc-case reveal"><img class="res-ico" src="/assets/img/icons/${esc(it.icon)}.svg" width="72" height="72" alt="" decoding="async"><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p>${it.quote ? `<figure class="quote"><figcaption class="q-ctx">${esc(it.quote.context)}</figcaption><blockquote><p>${esc(it.quote.text)}</p></blockquote><p class="q-cite">${esc(it.quote.cite)}</p></figure>` : ''}</li>`;

  return `<!doctype html>
<html lang="pt-BR" class="no-js" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${themeScript}</script>
<title>${esc(city.meta.title)}</title>
<meta name="description" content="${esc(city.meta.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Teagar Company">
<meta property="og:title" content="${esc(city.meta.ogTitle)}">
<meta property="og:description" content="${esc(city.meta.ogDescription)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="pt_BR">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(city.meta.ogTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(city.meta.ogTitle)}">
<meta name="twitter:description" content="${esc(city.meta.ogDescription)}">
<meta name="twitter:image" content="${ogImg}">
<meta name="theme-color" content="#F5EFE6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E0B09" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="preload" href="/fonts/big-shoulders-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/public-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${assets.css}">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
</head>
<body class="page-city">
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="tc-logo" viewBox="0 0 505 505">${logoPaths}</symbol></svg>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="topbar" id="topbar">
<div class="wrap bar">
<a class="brand" href="/">${logo()}${brandName()}</a>
<nav class="nav" id="siteNav" aria-label="${esc(ui.menu)}">
${navItems.map(([id, label]) => `<a class="nl" href="/#${id}">${esc(label)}</a>`).join('\n')}
<a class="btn btn-primary btn-menu" href="#contato">${esc(nav.cta)}</a>
</nav>
<div class="tools">
<button type="button" class="pill-ctl theme-btn" id="themeToggle" aria-label="${esc(ui.themeLabel)}" aria-pressed="false" data-light="${esc(ui.themeLight)}" data-dark="${esc(ui.themeDark)}" title="${esc(ui.themeLabel)}">${sun}${moon}</button>
<a class="btn btn-primary btn-cta" href="#contato">${esc(nav.cta)}</a>
<button type="button" class="pill-ctl menu-btn" id="menuToggle" aria-expanded="false" aria-controls="siteNav" aria-label="${esc(ui.menu)}" title="${esc(ui.menu)}"><svg class="bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
</div>
</div>
</header>
<main id="main" tabindex="-1">
<section class="loc-hero" aria-labelledby="top">
<div class="wrap">
<nav class="crumbs" aria-label="Trilha"><a href="/">${esc(city.breadcrumb)}</a><span aria-hidden="true"> / </span><span aria-current="page">Feira de Santana</span></nav>
<p class="hero-kicker"><span class="dot" aria-hidden="true"></span>${esc(city.hero.eyebrow)}</p>
<h1 id="top">${esc(city.hero.title)}</h1>
<p class="lead">${esc(city.hero.lead)}</p>
<div class="hero-cta">
<a class="btn btn-primary" href="#contato">${esc(city.hero.ctaPrimary)}${ICON_ARROW}</a>
<a class="btn btn-outline" href="#casos">${esc(city.hero.ctaSecondary)}</a>
</div>
</div>
</section>

<section class="section alt" id="casos" aria-labelledby="casos-h">
<div class="wrap">
${secHead(city.cases, 'casos-h')}
<ul class="results loc-cases">
${city.cases.items.map(caseItem).join('\n')}
</ul>
</div>
</section>

<section class="section" id="servicos" aria-labelledby="servicos-h">
<div class="wrap">
${secHead(city.services, 'servicos-h')}
<ul class="loc-svcs">
${services.items.map((it) => `<li class="reveal"><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></li>`).join('\n')}
</ul>
<div class="hero-cta reveal"><a class="btn btn-outline" href="/#services">${esc(city.services.more)}${ICON_ARROW}</a></div>
</div>
</section>

<section class="section contact" id="contato" aria-labelledby="contato-h">
<div class="wrap loc-contact">
<div class="tea-row"><div class="tea" aria-hidden="true">${teaStack(true)}</div><p class="tea-line reveal">${teaLine(contact)}</p></div>
<h2 id="contato-h" class="reveal">${esc(city.contact.title)}</h2>
<p class="body reveal">${esc(city.contact.body)}</p>
<p class="mail-line reveal"><a class="mail" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
<div class="hero-cta reveal"><a class="btn btn-primary" href="mailto:${esc(contact.email)}">${esc(city.contact.cta)}${ICON_ARROW}</a><a class="btn btn-outline" href="/#contact">${esc(city.contact.form)}</a></div>
</div>
</section>
</main>
<footer class="footer">
<div class="wrap foot-row">
<div><p class="tag">${esc(footer.tagline)}</p><p class="copy">© ${year} ${esc(footer.rights)} ${esc(footer.builtWith)}</p></div>
<nav class="foot-links" aria-label="${esc(ui.menu)}">${navItems.map(([id, label]) => `<a href="/#${id}">${esc(label)}</a>`).join('')}<a href="#top">${esc(ui.backToTop)}</a></nav>
</div>
<div class="wm"><p class="wordmark" aria-hidden="true">Teagar</p><div class="tea tea-mini" aria-hidden="true">${teaStack(false)}</div></div>
</footer>
<script src="/assets/site.js?v=${assets.js}" defer></script>
</body>
</html>
`;
}

/** Company page path inside each locale ("/teagar-company/" and "/en/teagar-company/"). */
export const COMPANY_SLUG = 'teagar-company/';
export const companyUrl = (locale) => LOCALES[locale].path + COMPANY_SLUG;

/** Turns every visible "Teagar Company" in the <body> into a link to the company page.
 *  Skips text inside links, buttons, scripts, styles, SVG and aria-hidden or visually hidden elements, so no link is nested. */
export function linkCompany(html, href) {
  const start = html.indexOf('<body');
  if (start < 0) return html;
  const SKIP = new Set(['a', 'button', 'script', 'style', 'svg', 'title', 'textarea', 'select', 'option', 'label']);
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  const stack = [];
  let skipDepth = 0;
  const body = html.slice(start).replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>|([^<]+)/g, (m, close, tag, attrs, text) => {
    if (text !== undefined) {
      if (skipDepth > 0 || !text.includes('Teagar Company')) return m;
      return text.replace(/Teagar Company/g, `<a class="co-link" href="${href}">Teagar Company</a>`);
    }
    const t = tag.toLowerCase();
    if (VOID.has(t) || /\/\s*$/.test(attrs)) return m;
    if (close) {
      const i = stack.findLastIndex((e) => e.tag === t);
      if (i >= 0) { for (const e of stack.splice(i)) if (e.skip) skipDepth--; }
      return m;
    }
    const skip = SKIP.has(t) || /aria-hidden="true"/.test(attrs) || /class="[^"]*\bvh\b/.test(attrs);
    stack.push({ tag: t, skip });
    if (skip) skipDepth++;
    return m;
  });
  return html.slice(0, start) + body;
}

/** Company page (pt-BR and en): what Teagar Company is, services, in-house products, how it works, technology and contact. */
export function renderCompanyPage({ c, locale, other, assets, logoPaths }) {
  const L = LOCALES[locale];
  const O = LOCALES[other.locale];
  const { ui, nav, services, work, contact, footer, company: co } = c;
  const url = SITE + companyUrl(locale);
  const year = new Date().getFullYear();
  const ogImg = `${SITE}/og-image.jpg`;
  const navItems = [['services', nav.services], ['work', nav.work], ['process', nav.process], ['about', nav.about], ['contact', nav.contact]];
  const products = co.products.slugs.map((s) => work.items.find((i) => i.slug === s)).filter(Boolean);
  const factHref = (h) => (h.startsWith('#') ? L.path + h : h);
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#webpage`,
        url,
        name: co.meta.title,
        description: co.meta.description,
        inLanguage: locale,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#org` },
        mainEntity: { '@id': `${SITE}/#org` },
        primaryImageOfPage: ogImg,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: co.breadcrumb, item: L.url },
          { '@type': 'ListItem', position: 2, name: 'Teagar Company', item: url },
        ],
      },
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${SITE}/#org`,
        name: 'Teagar Company',
        url: SITE + '/',
        description: co.meta.description,
        email: contact.email,
        logo: `${SITE}/assets/brand/apple-touch-icon.png`,
        founder: { '@id': `${SITE}/#person` },
        sameAs: [GH_ORG],
        areaServed: AREA_SERVED,
        address: { '@type': 'PostalAddress', addressLocality: 'Feira de Santana', addressRegion: 'BA', addressCountry: 'BR' },
        owns: products.map((p) => ({ '@type': 'SoftwareApplication', name: p.name, description: p.summary, applicationCategory: 'BusinessApplication' })),
      },
    ],
  };
  const sun = '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  return `<!doctype html>
<html lang="${esc(c.meta.lang)}" class="no-js" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${themeScript}</script>
<title>${esc(co.meta.title)}</title>
<meta name="description" content="${esc(co.meta.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="pt-BR" href="${SITE + companyUrl('pt-BR')}">
<link rel="alternate" hreflang="en" href="${SITE + companyUrl('en')}">
<link rel="alternate" hreflang="x-default" href="${SITE + companyUrl('pt-BR')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Teagar Company">
<meta property="og:title" content="${esc(co.meta.ogTitle)}">
<meta property="og:description" content="${esc(co.meta.ogDescription)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${esc(c.meta.ogLocale)}">
<meta property="og:locale:alternate" content="${esc(other.meta.ogLocale)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(co.meta.ogTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(co.meta.ogTitle)}">
<meta name="twitter:description" content="${esc(co.meta.ogDescription)}">
<meta name="twitter:image" content="${ogImg}">
<meta name="theme-color" content="#F5EFE6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E0B09" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="preload" href="/fonts/big-shoulders-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/public-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${assets.css}">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
</head>
<body class="page-company">
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="tc-logo" viewBox="0 0 505 505">${logoPaths}</symbol></svg>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="topbar" id="topbar">
<div class="wrap bar">
<a class="brand" href="${L.path}">${logo()}${brandName()}</a>
<nav class="nav" id="siteNav" aria-label="${esc(ui.menu)}">
${navItems.map(([id, label]) => `<a class="nl" href="${L.path}#${id}">${esc(label)}</a>`).join('\n')}
<a class="btn btn-primary btn-menu" href="#contact">${esc(nav.cta)}</a>
</nav>
<div class="tools">
<a class="pill-ctl lang lang-flag" id="langSwitch" href="${O.path + COMPANY_SLUG}" hreflang="${esc(other.locale)}" lang="${esc(other.locale)}" title="${esc(ui.langSwitch)}" aria-label="${esc(ui.langLabel)}: ${esc(ui.langSwitch)}"><img class="flag" src="/assets/img/icons/${other.locale === 'en' ? 'flag-us' : 'flag-br'}.svg" width="32" height="22" alt="" decoding="async"></a>
<button type="button" class="pill-ctl theme-btn" id="themeToggle" aria-label="${esc(ui.themeLabel)}" aria-pressed="false" data-light="${esc(ui.themeLight)}" data-dark="${esc(ui.themeDark)}" title="${esc(ui.themeLabel)}">${sun}${moon}</button>
<a class="btn btn-primary btn-cta" href="#contact">${esc(nav.cta)}</a>
<button type="button" class="pill-ctl menu-btn" id="menuToggle" aria-expanded="false" aria-controls="siteNav" aria-label="${esc(ui.menu)}" title="${esc(ui.menu)}"><svg class="bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
</div>
</div>
</header>
<main id="main" tabindex="-1">
<section class="loc-hero co-hero" aria-labelledby="top">
<div class="wrap">
<nav class="crumbs" aria-label="${locale === 'en' ? 'Breadcrumb' : 'Trilha'}"><a href="${L.path}">${esc(co.breadcrumb)}</a><span aria-hidden="true"> / </span><span aria-current="page">Teagar Company</span></nav>
<div class="co-grid">
<div class="co-copy">
<p class="hero-kicker"><span class="dot" aria-hidden="true"></span>${esc(co.hero.eyebrow)}</p>
<h1 id="top">${esc(co.hero.title)}</h1>
<p class="lead">${esc(co.hero.lead)}</p>
<div class="hero-cta">
<a class="btn btn-primary" href="#contact">${esc(co.hero.ctaPrimary)}${ICON_ARROW}</a>
<a class="btn btn-outline" href="#products">${esc(co.hero.ctaSecondary)}</a>
</div>
</div>
<aside class="co-card reveal" aria-label="Teagar Company">
<svg class="co-mark" viewBox="0 0 505 505" aria-hidden="true" focusable="false"><use href="#tc-logo"/></svg>
<dl class="co-facts">
${co.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${f.href ? `<a href="${esc(factHref(f.href))}"${/^https?:/.test(f.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(f.value)}</a>` : esc(f.value)}</dd></div>`).join('\n')}
</dl>
</aside>
</div>
</div>
</section>

<section class="section alt" id="services" aria-labelledby="services-h">
<div class="wrap">
${secHead(co.services, 'services-h')}
<ul class="loc-svcs co-svcs">
${services.items.map((it) => `<li class="reveal"><span class="co-code" aria-hidden="true">${esc(it.code)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></li>`).join('\n')}
</ul>
<div class="hero-cta reveal"><a class="btn btn-outline" href="${L.path}#services">${esc(co.services.more)}${ICON_ARROW}</a></div>
</div>
</section>

<section class="section" id="products" aria-labelledby="products-h">
<div class="wrap">
${secHead(co.products, 'products-h')}
<ul class="work-rest co-products">
${products.map((i) => workItem(ui, i, 'small')).join('\n')}
</ul>
</div>
</section>

<section class="section alt" id="principles" aria-labelledby="principles-h">
<div class="wrap">
${secHead(co.principles, 'principles-h')}
<ol class="co-principles">
${co.principles.items.map((p, i) => `<li class="reveal"><span class="co-n" aria-hidden="true">0${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('\n')}
</ol>
<div class="hero-cta reveal"><a class="btn btn-outline" href="${L.path}#process">${esc(co.principles.more)}${ICON_ARROW}</a></div>
</div>
</section>

<section class="section" id="tech" aria-labelledby="tech-h">
<div class="wrap">
${secHead(co.tech, 'tech-h')}
<ul class="chips co-tech reveal">${co.tech.items.map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul>
</div>
</section>

<section class="section contact" id="contact" aria-labelledby="contact-h">
<div class="wrap loc-contact">
<div class="tea-row"><div class="tea" aria-hidden="true">${teaStack(true)}</div><p class="tea-line reveal">${teaLine(contact)}</p></div>
<h2 id="contact-h" class="reveal">${esc(co.contact.title)}</h2>
<p class="body reveal">${esc(co.contact.body)}</p>
<p class="mail-line reveal"><a class="mail" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
<div class="hero-cta reveal"><a class="btn btn-primary" href="mailto:${esc(contact.email)}">${esc(co.contact.cta)}${ICON_ARROW}</a><a class="btn btn-outline" href="${L.path}#contact">${esc(co.contact.form)}</a></div>
</div>
</section>
</main>
<footer class="footer">
<div class="wrap foot-row">
<div><p class="tag">${esc(footer.tagline)}</p><p class="copy">© ${year} ${esc(footer.rights)} ${esc(footer.builtWith)}</p></div>
<nav class="foot-links" aria-label="${esc(ui.menu)}">${navItems.map(([id, label]) => `<a href="${L.path}#${id}">${esc(label)}</a>`).join('')}<a href="#top">${esc(ui.backToTop)}</a></nav>
</div>
<div class="wm"><p class="wordmark" aria-hidden="true">Teagar</p><div class="tea tea-mini" aria-hidden="true">${teaStack(false)}</div></div>
</footer>
<script src="/assets/site.js?v=${assets.js}" defer></script>
</body>
</html>
`;
}
