(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* theme toggle */
  var themeBtn = document.getElementById('themeToggle');
  function syncTheme() {
    if (!themeBtn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeBtn.title = dark ? themeBtn.getAttribute('data-dark') : themeBtn.getAttribute('data-light');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncTheme();
    });
    syncTheme();
  }
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function onScheme(e) {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (err) {}
    if (stored === 'dark' || stored === 'light') return;
    root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    syncTheme();
  }
  if (mq.addEventListener) mq.addEventListener('change', onScheme);

  /* language switch remembers the choice */
  var langLink = document.getElementById('langSwitch');
  if (langLink) {
    langLink.addEventListener('click', function () {
      try { localStorage.setItem('lang', langLink.getAttribute('hreflang') === 'en' ? 'en' : 'pt-BR'); } catch (e) {}
    });
  }

  /* mobile menu */
  var menuBtn = document.getElementById('menuToggle');
  var nav = document.getElementById('siteNav');
  if (menuBtn && nav) {
    var narrow = window.matchMedia('(max-width: 860px)');
    function setMenu(open, focusBtn) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open && focusBtn) menuBtn.focus();
    }
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      setMenu(open, false);
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
    document.addEventListener('click', function (e) {
      if (menuBtn.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false, false);
    });
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !narrow.matches || menuBtn.getAttribute('aria-expanded') !== 'true') return;
      var items = nav.querySelectorAll('a');
      var last = items[items.length - 1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuBtn.focus(); }
    });
    narrow.addEventListener && narrow.addEventListener('change', function () { setMenu(false, false); });
    setMenu(false, false);
  }

  /* scroll progress + hero scroll rotation */
  var bar = document.getElementById('scrollBar');
  var fig = document.getElementById('heroFig');
  var ticking = false;
  function onScroll() {
    var h = root.scrollHeight - root.clientHeight;
    var y = window.pageYOffset || root.scrollTop;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (fig && !reduce.matches) {
      var p = Math.min(1, y / Math.max(1, window.innerHeight));
      fig.style.setProperty('--rot', (p * 8).toFixed(2) + 'deg');
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* reveal on scroll */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce.matches) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* hero pointer parallax */
  var hero = document.getElementById('hero');
  if (hero && fig && !reduce.matches && window.matchMedia('(pointer: fine)').matches) {
    var tx = 0, ty = 0, raf = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(function () {
        fig.style.setProperty('--px', tx.toFixed(3));
        fig.style.setProperty('--py', ty.toFixed(3));
        raf = 0;
      });
    });
    hero.addEventListener('pointerleave', function () {
      fig.style.setProperty('--px', '0'); fig.style.setProperty('--py', '0');
    });
  }
})();
