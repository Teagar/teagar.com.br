(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* theme toggle */
  var swapTimer = 0;
  var themeBtn = document.getElementById('themeToggle');
  function syncTheme() {
    if (!themeBtn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeBtn.title = dark ? themeBtn.getAttribute('data-dark') : themeBtn.getAttribute('data-light');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var prev = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = prev === 'dark' ? 'light' : 'dark';
      var st = document.getElementById('stage');
      var swap = st && !reduce.matches && st.getBoundingClientRect().bottom > 0 && st.getBoundingClientRect().top < window.innerHeight;
      if (swap) {
        /* 0.7 s eased swap: the new sky cross-fades over the old one while the bodies set and rise */
        st.classList.remove('swapping');
        void st.offsetWidth;
        st.classList.add('swapping', 'settled');
        clearTimeout(swapTimer);
        swapTimer = setTimeout(function () { st.classList.remove('swapping'); }, 750);
      }
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

  /* header state, hero sunset, process sun dot */
  var bar = document.getElementById('topbar');
  var stage = document.getElementById('stage');
  var hero = document.getElementById('hero');
  var steps = document.getElementById('steps');
  var ticking = false, lastSink = -1;
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (bar) bar.classList.toggle('scrolled', y > 8);
    if (!reduce.matches) {
      if (stage && hero) {
        var p = Math.min(1, Math.max(0, y / Math.max(1, hero.offsetHeight)));
        var sink = Math.round(p * 8);
        if (sink !== lastSink) {
          lastSink = sink;
          stage.style.setProperty('--sink', sink);
          stage.style.setProperty('--hf', (1 - Math.round(p * 4) / 4).toFixed(2));
        }
      }
      if (steps) {
        var r = steps.getBoundingClientRect();
        var vh = window.innerHeight;
        var q = (vh * 0.7 - r.top) / Math.max(1, r.height);
        steps.style.setProperty('--p', Math.min(1, Math.max(0, q)).toFixed(3));
      }
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

  /* hero pointer drift (fine pointers only) */
  if (hero && stage && !reduce.matches && window.matchMedia('(pointer: fine)').matches) {
    var raf = 0, tx = 0, ty = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(function () {
        /* snap to whole logical pixels: moon up to 3, stars 1 opposite */
        stage.style.setProperty('--mx', Math.round(tx * 3));
        stage.style.setProperty('--my', Math.round(ty * 3));
        stage.style.setProperty('--sx', -Math.round(tx));
        stage.style.setProperty('--sy', -Math.round(ty));
        stage.style.setProperty('--px', tx.toFixed(3));
        stage.style.setProperty('--py', ty.toFixed(3));
        raf = 0;
      });
    });
    hero.addEventListener('pointerleave', function () {
      ['--mx', '--my', '--sx', '--sy', '--px', '--py'].forEach(function (k) { stage.style.setProperty(k, '0'); });
    });
  }

  /* card glow follows the pointer */
  if (!reduce.matches && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.glow-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* navbar name: give each rolling letter slot its exact from/to width */
  function sizeBrand() {
    Array.prototype.forEach.call(document.querySelectorAll('.brand .bs'), function (slot) {
      var a = slot.querySelector('.ba'), b = slot.querySelector('.bb');
      slot.style.setProperty('--w0', a.getBoundingClientRect().width + 'px');
      slot.style.setProperty('--w1', b.getBoundingClientRect().width + 'px');
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBrand); else sizeBrand();
})();
