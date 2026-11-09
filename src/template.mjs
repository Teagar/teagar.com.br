// HTML templates. Every interpolated string goes through esc().
export const SITE = 'https://teagar.com.br';
export const LOCALES = {
  'pt-BR': { path: '/', url: `${SITE}/`, short: 'pt-BR' },
  en: { path: '/en/', url: `${SITE}/en/`, short: 'en' },
};

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const GH = 'https://github.com/Teagar';
const GH_ORG = 'https://github.com/teagarcompany';
const LI = 'https://www.linkedin.com/in/teagar/';

const ICON_EXT = '<svg class="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

const logo = (cls = '') => `<svg class="${cls}" viewBox="0 0 505 505" aria-hidden="true" focusable="false"><use href="#tc-logo"/></svg>`;

const eyebrow = (kicker) => {
  const [n, ...t] = String(kicker).split(' — ');
  return t.length
    ? `<p class="eyebrow"><span class="ey-n">${esc(n)}</span><span class="ey-t">${esc(t.join(' — '))}</span></p>`
    : `<p class="eyebrow"><span class="ey-t">${esc(kicker)}</span></p>`;
};

const secHead = (s, id) => `<div class="sec-head reveal">${eyebrow(s.kicker)}<h2 id="${id}">${esc(s.title)}</h2>${s.intro ? `<p>${esc(s.intro)}</p>` : ''}</div>`;

const ext = (ui, label, url) =>
  `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}${ICON_EXT}<span class="vh"> (${esc(ui.external)})</span></a>`;

const picture = ({ base, exts, sizes, widths, w, h, alt, attrs, fallback }) => {
  const set = (e) => widths.map((x) => `/assets/img/${base}-${x}.${e} ${x}w`).join(', ');
  const src = exts.map((e, i) => (i < exts.length - 1 ? `<source type="image/${e}" srcset="${set(e)}" sizes="${sizes}">` : '')).join('');
  const last = exts[exts.length - 1];
  return `<picture>${src}<img src="/assets/img/${base}-${widths[1]}.${last}" srcset="${set(last)}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${attrs}></picture>`;
};

const statusBadge = (ui, st) => {
  const map = { inProgress: 'warning', live: 'success', openSource: 'info' };
  return `<span class="badge ${map[st] || 'neutral'}">${esc(ui[st] || st)}</span>`;
};

const workItem = (ui, it, featured, wk) => {
  const links = it.links.length
    ? `<div class="links">${it.links.map((l) => ext(ui, l.label, l.url)).join('')}</div>`
    : `<p class="private">${esc(ui.private)}</p>`;
  return `<li class="panel work-item reveal" id="work-${esc(it.slug)}">
<div class="meta-row"><span class="meta">${featured ? `<span class="feat-tag">${esc(wk.featuredLabel)}</span> / ` : ''}${esc(it.category)} / ${esc(it.year)}</span>${statusBadge(ui, it.status)}</div>
<h3 class="name">${esc(it.name)}</h3>
<p>${esc(it.summary)}</p>
<ul class="chips" aria-label="Stack">${it.stack.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>
${links}
</li>`;
};

const themeScript = `(function(){var d=document.documentElement;d.className='js';try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t);if(d.lang==='pt-BR'&&location.pathname==='/'){var l=localStorage.getItem('lang');var n=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(!l&&n&&n.toLowerCase().indexOf('pt')!==0){location.replace('/en/'+location.hash)}}}catch(e){d.setAttribute('data-theme','light')}})();`;

export function renderPage({ c, locale, other, assets, logoPaths }) {
  const L = LOCALES[locale];
  const O = LOCALES[other.locale];
  const { meta, ui, nav, hero, services, work, process: proc, about, stack, contact, footer } = c;
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
        image: `${SITE}/assets/img/portrait-960.jpg`,
        jobTitle: about.title,
        sameAs: [GH, GH_ORG, LI],
        worksFor: { '@id': `${SITE}/#org` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#org`,
        name: 'Teagar Company',
        url: SITE + '/',
        logo: `${SITE}/assets/brand/apple-touch-icon.png`,
        email: contact.email,
        founder: { '@id': `${SITE}/#person` },
        sameAs: [GH_ORG],
        areaServed: ['BR', 'Worldwide'],
        address: { '@type': 'PostalAddress', addressLocality: 'Feira de Santana', addressRegion: 'BA', addressCountry: 'BR' },
      },
    ],
  };

  const navItems = [['services', nav.services], ['work', nav.work], ['process', nav.process], ['about', nav.about], ['contact', nav.contact]];
  const featured = work.items.filter((i) => i.featured);
  const rest = work.items.filter((i) => !i.featured);
  const portraitSizes = '(max-width: 860px) 360px, 480px';

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
<meta name="theme-color" content="#F0F1F3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#171615" media="(prefers-color-scheme: dark)">
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
<div class="scroll-bar" id="scrollBar" aria-hidden="true"></div>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="topbar">
<div class="wrap">
<a class="brand" href="${L.path}#top">${logo()}<span>Teagar</span></a>
<nav class="nav" id="siteNav" aria-label="${esc(ui.menu)}">
${navItems.map(([id, label]) => `<a class="nl" href="#${id}">${esc(label)}</a>`).join('\n')}
<a class="btn btn-primary btn-menu" href="#contact">${esc(nav.cta)}</a>
</nav>
<div class="tools">
<a class="lang" id="langSwitch" href="${O.path}" hreflang="${esc(other.locale)}" lang="${esc(other.locale)}" title="${esc(ui.langSwitch)}" aria-label="${esc(ui.langLabel)}: ${esc(ui.langSwitch)}">${esc(ui.langSwitchShort)}</a>
<button type="button" class="icon-btn theme-btn" id="themeToggle" aria-label="${esc(ui.themeLabel)}" aria-pressed="false" data-light="${esc(ui.themeLight)}" data-dark="${esc(ui.themeDark)}" title="${esc(ui.themeLabel)}">${sun}${moon}</button>
<button type="button" class="icon-btn menu-btn" id="menuToggle" aria-expanded="false" aria-controls="siteNav" aria-label="${esc(ui.menu)}" title="${esc(ui.menu)}"><svg class="bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
<a class="btn btn-primary btn-cta" href="#contact">${esc(nav.cta)}</a>
</div>
</div>
</header>
<main id="main" tabindex="-1">
<section class="hero" id="hero" aria-labelledby="top">
<div class="wrap">
<div class="hero-copy">
<p class="eyebrow">${esc(hero.eyebrow)}</p>
<h1 id="top"><span class="a">${esc(hero.titleA)}</span> <span class="b">${esc(hero.titleB)}</span></h1>
<p class="lead">${esc(hero.lead)}</p>
<div class="hero-cta">
<a class="btn btn-primary" href="#contact">${esc(hero.ctaPrimary)}</a>
<a class="btn btn-on-dark" href="#work">${esc(hero.ctaSecondary)}</a>
</div>
<p class="status"><span class="dot" aria-hidden="true"></span><span><strong>${esc(hero.status)}</strong>${esc(hero.location)}</span></p>
<dl class="stats">
${hero.stats.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join('\n')}
</dl>
</div>
<figure class="fig" id="heroFig">
<div class="fig-frame">
<div class="fig-layer fig-grid" aria-hidden="true"></div>
<div class="fig-layer fig-logo" aria-hidden="true"><div class="spin">${logo()}</div></div>
<div class="fig-layer fig-person">${picture({ base: 'cutout', exts: ['avif', 'webp', 'png'], widths: [480, 960, 1440], sizes: portraitSizes, w: 960, h: 960, alt: meta.portraitAlt, attrs: 'fetchpriority="high" decoding="async"' })}</div>
<span class="tick t1" aria-hidden="true"></span><span class="tick t2" aria-hidden="true"></span><span class="tick t3" aria-hidden="true"></span><span class="tick t4" aria-hidden="true"></span>
<span class="fig-label tl" aria-hidden="true">-12.2664° S / -38.9663° W</span>
<span class="fig-label br" aria-hidden="true">FIG. 01 — T. CERQUEIRA</span>
</div>
</figure>
</div>
</section>

<section class="section" id="services" aria-labelledby="services-h">
<div class="wrap">
${secHead(services, 'services-h')}
<ul class="grid services-grid">
${services.items.map((it) => `<li class="panel reveal"><span class="code">${esc(it.code)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p><ul class="points">${it.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></li>`).join('\n')}
</ul>
</div>
</section>

<section class="section alt" id="work" aria-labelledby="work-h">
<div class="wrap">
${secHead(work, 'work-h')}
<ul class="featured">
${featured.map((i) => workItem(ui, i, true, work)).join('\n')}
</ul>
<ul class="grid work-rest">
${rest.map((i) => workItem(ui, i, false, work)).join('\n')}
</ul>
<p class="view-all reveal">${ext(ui, work.viewAll, GH)}</p>
</div>
</section>

<section class="section" id="process" aria-labelledby="process-h">
<div class="wrap">
${secHead(proc, 'process-h')}
<ol class="steps">
${proc.steps.map((s) => `<li class="step reveal"><span class="n">${esc(s.n)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`).join('\n')}
</ol>
</div>
</section>

<section class="section alt" id="about" aria-labelledby="about-h">
<div class="wrap about">
<figure class="portrait reveal">
<div class="frame">${picture({ base: 'portrait', exts: ['avif', 'webp', 'jpg'], widths: [480, 960, 1440], sizes: '(max-width: 860px) 420px, 480px', w: 960, h: 960, alt: meta.portraitAlt, attrs: 'loading="lazy" decoding="async"' })}</div>
<figcaption>Thiago Cerqueira / Teagar</figcaption>
</figure>
<div class="about-text reveal">
${eyebrow(about.kicker)}
<h2 class="h2" id="about-h">${esc(about.title)}</h2>
${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<dl class="facts">
${about.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('\n')}
</dl>
</div>
</div>
</section>

<section class="section" id="stack" aria-labelledby="stack-h">
<div class="wrap">
${secHead(stack, 'stack-h')}
<div class="stack-rows">
${stack.groups.map((g) => `<div class="stack-row reveal"><h3>${esc(g.name)}</h3><ul class="chips">${g.items.map((i) => `<li class="chip">${esc(i)}</li>`).join('')}</ul></div>`).join('\n')}
</div>
</div>
</section>

<section class="section contact on-dark" id="contact" aria-labelledby="contact-h">
<div class="wrap contact-grid">
<div class="reveal">
${eyebrow(contact.kicker)}
<h2 class="h2" id="contact-h">${esc(contact.title)}</h2>
<p class="body">${esc(contact.body)}</p>
<p class="mail-line">${esc(contact.emailLabel)}<br><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
<div class="social">
<h3>${esc(contact.socialTitle)}</h3>
<ul>
<li>${ext(ui, 'GitHub Teagar', GH)}</li>
<li>${ext(ui, 'GitHub teagarcompany', GH_ORG)}</li>
<li>${ext(ui, 'LinkedIn', LI)}</li>
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
<button class="btn btn-primary" type="submit">${esc(contact.form.submit)}</button>
</form>
</div>
</section>
</main>
<footer class="footer">
<div class="wrap">
<a class="brand" href="${L.path}#top" aria-label="Teagar">${logo()}</a>
<div><p class="tag">${esc(footer.tagline)}</p><p class="copy">© ${year} ${esc(footer.rights)} ${esc(footer.builtWith)}</p></div>
<a class="top" href="#top">${esc(ui.backToTop)}</a>
</div>
</footer>
<script src="/assets/site.js?v=${assets.js}" defer></script>
</body>
</html>
`;
}

export function render404({ assets }) {
  return `<!doctype html>
<html lang="pt-BR" data-theme="dark">
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
<p class="eyebrow"><span class="ey-t">Teagar Company</span></p>
<h1>404</h1>
<p lang="pt-BR">${esc('Página não encontrada. O endereço pode ter mudado ou nunca existiu.')}</p>
<p lang="en">${esc('Page not found. The address may have changed or never existed.')}</p>
<div class="hero-cta"><a class="btn btn-primary" href="/" lang="pt-BR">${esc('Voltar ao início')}</a><a class="btn btn-on-dark" href="/en/" lang="en">${esc('Back to home')}</a></div>
</div></main>
</body>
</html>
`;
}
