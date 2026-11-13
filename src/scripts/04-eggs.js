// Easter eggs. Every one is listed on the secret /cheats/ page, which also shows which ones this browser has found.
// None changes anything until it is triggered; strings come from the inline #eggData JSON of each page.
(function () {
  'use strict';
  var root = document.documentElement;
  var dataEl = document.getElementById('eggData');
  if (!dataEl) return;
  var D = {};
  try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  var calm = function () { return !!(reduce && reduce.matches); };
  var stage = document.getElementById('stage');
  var themeBtn = document.getElementById('themeToggle');
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); }
  function make(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function typing(t) { return t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName)); }
  function stageVisible() {
    if (!stage) return false;
    var r = stage.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  function dark() { return root.getAttribute('data-theme') === 'dark'; }

  /* ---------- achievements: found eggs are kept in this browser only ---------- */
  var KEY = 'teagar-eggs';
  var total = Object.keys(D.names || {}).length;
  function got() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  /** logs an egg; returns the "Achievement: name (n/total)" line the first time, '' after */
  function found(id) {
    if (!D.names || !D.names[id]) return '';
    var g = got();
    if (g.indexOf(id) >= 0) return '';
    g.push(id);
    try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (e) {}
    return D.found + ': ' + D.names[id] + ' (' + g.length + '/' + total + ')';
  }

  /* ---------- toast ---------- */
  var toastEl = document.getElementById('eggToast'), toastTimer = 0;
  function toast(text) {
    if (!toastEl || !text) return;
    toastEl.textContent = text;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 3800);
  }
  /** an egg fired: show its message plus, the first time, the achievement line */
  function egg(id, text) { var line = found(id); toast([text, line].filter(Boolean).join('\n')); }
  /** quiet eggs (dates, hours) only speak the first time they are found */
  function quietEgg(id, text) { var line = found(id); if (line) toast([text, line].filter(Boolean).join('\n')); }

  /* ---------- console note; cha() logs the achievement ---------- */
  if (window.console && console.log) {
    /* the real TC mark: logo.svg rasterised to 28x28 and drawn with half blocks (two pixel rows per line) */
    var art = [
      '        ▄▄█████████████████▄',
      '     ▄██████████████████████',
      '   ▄█████████████▀▀▀▀▀▀▀▀▀▀▀',
      '  ██████▀▀ ██████',
      ' ██████    ██████',
      '██████     ██████',
      '█████      ██████',
      '█████      ██████      █████',
      '██████     ██████     ██████',
      ' ██████    ██████    ██████',
      '  ██████▄▄ ██████ ▄▄██████',
      '   ▀████████████████████▀',
      '     ▀████████████████▀',
      '        ▀▀████████▀▀'
    ].join('\n');
    var lines = (D.console || []).concat(D.consoleHint ? [D.consoleHint] : []);
    console.log('%c' + art, 'color:#FF6700;font-family:monospace;line-height:1');
    if (lines.length) console.log('%c' + lines[0] + '\n%c' + lines.slice(1).join('\n'), 'font:700 14px sans-serif', 'font:12px monospace;color:#FF6700');
    window.cha = function () { egg('console', ''); return D.consoleOk; };
  }

  /* ---------- the hour of the visit: tea time (16:00) or late-night coffee (00:00-04:59) ---------- */
  var hour = new Date().getHours();
  var tpl = document.querySelector('.tea-time-tpl');
  var row = tpl && tpl.closest('.tea-row');
  if (row && (hour === 16 || hour < 5)) {
    var late = hour < 5;
    var line = row.querySelector('.tea-line');
    if (late) {
      var lateTpl = row.querySelector('.late-tpl');
      if (line && lateTpl) line.innerHTML = lateTpl.innerHTML;
      var cupImg = row.querySelector('.tea-cup img:not(.glint)');
      if (cupImg) cupImg.src = '/assets/img/tea-coffee.svg';
      row.classList.add('late-night');
    } else {
      if (line) line.innerHTML = tpl.innerHTML;
      row.classList.add('tea-time');
    }
    /* logged when the visitor actually sees the contact line */
    var seen = function () { quietEgg(late ? 'latenight' : 'teatime', ''); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); seen(); } }, { threshold: 0.6 });
      io.observe(row);
    }
  }

  /* ---------- special dates on the home sky ---------- */
  var today = new Date();
  var mmdd = ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  if (stage && today.getMonth() === 5) {
    /* June: São João bunting across the sky */
    var bunting = make('div', 'bunting', stage);
    bunting.setAttribute('aria-hidden', 'true');
    for (var f = 0; f < 14; f++) make('span', 'flag f' + (f % 4), bunting);
    quietEgg('junino', D.junino);
  }
  if (stage && D.birthdayDate && D.birthdayDate === mmdd) {
    /* Thiago's birthday: party hats on the moon and the sun */
    Array.prototype.forEach.call(stage.querySelectorAll('.moon-wrap .bob, .sun-wrap .bob'), function (b) { make('span', 'party-hat', b).setAttribute('aria-hidden', 'true'); });
    quietEgg('birthday', D.birthday);
  }

  /* ---------- moon/sun logo (toggled by 01-core.js): logged when it shows ---------- */
  if (stage && 'MutationObserver' in window) {
    new MutationObserver(function () { if (stage.classList.contains('egg')) egg('moon', ''); }).observe(stage, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- footer cup: five clicks fill it, the fifth overflows ---------- */
  var cup = document.querySelector('.tea-mini');
  if (cup) {
    var fills = 0, cupTimer = 0;
    on(cup, 'click', function () {
      if (cup.classList.contains('full')) return;
      fills += 1;
      clearTimeout(cupTimer);
      cupTimer = setTimeout(function () { fills = 0; }, 4000);
      var d = make('span', 'drip', cup);
      setTimeout(function () { d.remove(); }, 500);
      cup.classList.remove('sip'); void cup.offsetWidth; cup.classList.add('sip');
      if (fills < 5) return;
      fills = 0;
      cup.classList.add('full');
      make('span', 'spill l', cup); make('span', 'spill r', cup);
      egg('cup', D.cup);
      setTimeout(function () {
        cup.classList.remove('full', 'sip');
        Array.prototype.forEach.call(cup.querySelectorAll('.spill'), function (s) { s.remove(); });
      }, 4200);
    });
  }

  /* ---------- keyboard: Konami, typing teagar, the hidden terminal ---------- */
  var KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  var keys = [], typed = '', gbTimer = 0, rollTimer = 0;
  on(document, 'keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    var k = (e.key || '').toLowerCase();
    /* ~ or ` opens the terminal (on ABNT2 keyboards ~ is a dead key on the Quote key) */
    if (k === '~' || k === '`' || (k === 'dead' && (e.code === 'Quote' || e.code === 'Backquote'))) { e.preventDefault(); openTerm(); return; }
    keys.push(k); if (keys.length > KONAMI.length) keys.shift();
    if (keys.join() === KONAMI.join()) {
      keys = [];
      root.classList.add('gameboy');
      egg('konami', D.konami);
      clearTimeout(gbTimer);
      gbTimer = setTimeout(function () { root.classList.remove('gameboy'); }, 10000);
    }
    if (k.length === 1) {
      typed = (typed + k).slice(-6);
      if (typed === 'teagar') { typed = ''; teagar(); }
    }
  });
  function teagar() {
    var brand = document.querySelector('.brand');
    if (brand) {
      brand.classList.add('roll');
      clearTimeout(rollTimer);
      rollTimer = setTimeout(function () { brand.classList.remove('roll'); }, 2600);
    }
    egg('teagar', '');
    if (calm()) return;
    for (var i = 0; i < 16; i++) {
      var img = make('img', 'cup-rain');
      img.src = '/assets/img/tea-cup.svg'; img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.style.left = (Math.random() * 96) + 'vw';
      img.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's';
      img.style.setProperty('--d', (1.6 + Math.random() * 1.2).toFixed(2) + 's');
      img.style.setProperty('--r', (Math.random() * 120 - 60).toFixed(0) + 'deg');
      document.body.appendChild(img);
      img.addEventListener('animationend', function () { this.remove(); });
      setTimeout(img.remove.bind(img), 5000);
    }
  }

  /* hidden terminal: a small dialog with a few commands */
  var term = null, termOut, termIn, lastFocus = null, hist = [], hIdx = 0;
  var T = D.terminal || {};
  function print(lines, cls) {
    [].concat(lines).forEach(function (l) { var p = make('div', cls || 'term-line', termOut); p.textContent = l; });
    termOut.scrollTop = termOut.scrollHeight;
  }
  function closeTerm() {
    if (!term || term.hidden) return;
    term.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function run(raw) {
    var cmd = raw.trim().toLowerCase();
    print(T.prompt + ' ' + raw, 'term-line term-echo');
    if (!cmd) return;
    hist.push(raw); hIdx = hist.length;
    if (cmd.indexOf('sudo') === 0) {
      var what = cmd.replace(/^sudo\s*/, '');
      if (what === 'contratar' || what === 'hire') { print(T.sudo); setTimeout(function () { window.location.href = 'mailto:' + D.mail; }, 500); }
      else print(T.sudoNo);
      return;
    }
    cmd = (T.commands && T.commands[cmd]) || cmd;
    if (cmd === 'clear') { termOut.textContent = ''; return; }
    if (cmd === 'exit') { closeTerm(); return; }
    if (cmd === 'projetos') { print(D.projects || []); return; }
    if (cmd === 'tema') { if (themeBtn) themeBtn.click(); print(T.tema); return; }
    if (cmd === 'cheats') { print(T.cheats); setTimeout(function () { window.location.href = D.cheats; }, 600); return; }
    if (['help', 'whoami', 'contato', 'cha', 'ls'].indexOf(cmd) >= 0) { print(T[cmd]); return; }
    print((T.notFound || '').replace('{cmd}', raw.trim()));
  }
  function openTerm() {
    if (!term) {
      term = make('div', 'term', document.body);
      term.setAttribute('role', 'dialog');
      term.setAttribute('aria-modal', 'true');
      term.setAttribute('aria-label', T.label || 'Terminal');
      var bar = make('div', 'term-bar', term);
      make('span', 'term-title', bar).textContent = T.title || '';
      var x = make('button', 'term-x', bar);
      x.type = 'button'; x.setAttribute('aria-label', T.close || 'Close'); x.textContent = '×';
      on(x, 'click', closeTerm);
      termOut = make('div', 'term-out', term);
      termOut.setAttribute('aria-live', 'polite');
      var form = make('form', 'term-in', term);
      var lab = make('label', 'term-prompt', form);
      lab.textContent = T.prompt || '$';
      lab.setAttribute('for', 'termInput');
      termIn = make('input', '', form);
      termIn.id = 'termInput'; termIn.type = 'text'; termIn.autocomplete = 'off'; termIn.spellcheck = false;
      termIn.setAttribute('autocapitalize', 'off');
      on(form, 'submit', function (e) { e.preventDefault(); var v = termIn.value; termIn.value = ''; run(v); });
      on(term, 'keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); closeTerm(); }
        else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === termIn ? x : termIn).focus(); }
        else if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); termIn.value = hist[hIdx]; }
        else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hIdx = Math.min(hist.length, hIdx + 1); termIn.value = hist[hIdx] || ''; }
      });
      print(T.welcome || []);
    }
    lastFocus = document.activeElement;
    term.hidden = false;
    termIn.focus();
    egg('terminal', '');
  }
  window.teagarTerminal = openTerm;

  /* ---------- contact form: /deploy in the message ---------- */
  var msgBox = document.getElementById('f-message');
  if (msgBox) {
    var deploying = false;
    on(msgBox, 'input', function () {
      if (deploying || !/\/deploy\s*$/i.test(msgBox.value)) return;
      deploying = true;
      msgBox.value = msgBox.value.replace(/\/deploy\s*$/i, '');
      var btn = msgBox.form && msgBox.form.querySelector('button[type="submit"]');
      var label = btn && btn.firstChild && btn.firstChild.nodeType === 3 ? btn.firstChild : null;
      var was = label ? label.nodeValue : '';
      if (label) label.nodeValue = D.deployBtn;
      if (btn) btn.classList.add('deploying');
      var log = make('pre', 'deploy-log');
      log.setAttribute('aria-hidden', 'true');
      if (btn) btn.parentNode.insertBefore(log, btn.nextSibling);
      (D.deploy || []).forEach(function (l, i) { setTimeout(function () { log.textContent += (i ? '\n' : '') + l; }, calm() ? 0 : 380 * i); });
      egg('deploy', '');
      setTimeout(function () {
        if (label) label.nodeValue = was;
        if (btn) btn.classList.remove('deploying');
        log.remove();
        deploying = false;
      }, 5200);
    });
  }

  /* ---------- header name: hovered 5 times, it spells Tea · gar ---------- */
  var brand = document.querySelector('.brand');
  if (brand) {
    var hovers = 0, hoverTimer = 0;
    on(brand, 'mouseenter', function () {
      hovers += 1;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () { hovers = 0; }, 4000);
      if (hovers < 5) return;
      hovers = 0;
      brand.classList.add('spell');
      egg('spell', '');
      setTimeout(function () { brand.classList.remove('spell'); }, 3200);
    });
  }

  /* ---------- the hero stage ---------- */
  if (stage) {
    /* shooting star: 20 s with no input while the night hero is on screen */
    if (!calm()) {
      var idle = 0;
      var resetIdle = function () { clearTimeout(idle); idle = setTimeout(shoot, 20000); };
      var shoot = function () {
        resetIdle();
        if (document.hidden || !dark() || !stageVisible() || stage.querySelector('.shooting-star')) return;
        var s = make('span', 'shooting-star');
        s.setAttribute('aria-hidden', 'true');
        on(s, 'click', function () {
          if (s.classList.contains('wished')) return;
          s.classList.add('wished');
          egg('star', D.wish);
          setTimeout(function () { s.remove(); }, 900);
        });
        on(s, 'animationend', function () { if (!s.classList.contains('wished')) s.remove(); });
        stage.appendChild(s);
      };
      ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(function (ev) { on(window, ev, resetIdle, { passive: true }); });
      resetIdle();
    }

    /* eclipse: five theme switches in a row (each within 1.5 s of the last) */
    var flips = 0, flipTimer = 0, ecTimer = 0;
    on(themeBtn, 'click', function () {
      flips += 1;
      clearTimeout(flipTimer);
      flipTimer = setTimeout(function () { flips = 0; }, 1500);
      if (flips < 5) return;
      flips = 0;
      if (!stageVisible()) return;
      stage.classList.remove('eclipsing'); void stage.offsetWidth;
      setTimeout(function () {
        stage.classList.add('eclipsing');
        egg('eclipse', D.eclipse);
        clearTimeout(ecTimer);
        ecTimer = setTimeout(function () { stage.classList.remove('eclipsing'); }, calm() ? 2500 : 3600);
      }, 750);
    });

    /* drag the moon or the sun down to set it and switch the theme (mouse and pen only, so touch scrolling is untouched).
       Listened on the stage and hit-tested by geometry: the transparent portrait box covers most of the disc. */
    var drag = null, dragMoved = false;
    var bodyNow = function () { return stage.querySelector(dark() ? '.scene.night .moon-wrap' : '.scene.day .sun-wrap'); };
    var onDisc = function (body, x, y) {
      var r = body.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      return Math.hypot(x - cx, y - cy) < r.width * 0.42;
    };
    on(stage, 'pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      var body = bodyNow();
      if (!body || !onDisc(body, e.clientX, e.clientY)) return;
      drag = { body: body, rise: body.querySelector('.rise'), y: e.clientY, dy: 0, id: e.pointerId };
      dragMoved = false;
      e.preventDefault();
    });
    on(window, 'pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dy = Math.max(0, e.clientY - drag.y);
      if (drag.dy > 6) dragMoved = true;
      if (!dragMoved) return;
      drag.rise.style.transition = 'none';
      drag.rise.style.translate = '0 ' + drag.dy + 'px';
      stage.classList.add('dragging');
    });
    var endDrag = function () {
      if (!drag) return;
      var d = drag; drag = null;
      stage.classList.remove('dragging');
      d.rise.style.transition = 'translate .45s cubic-bezier(.34,1.56,.64,1)';
      d.rise.style.translate = '';
      if (dragMoved && d.dy > stage.getBoundingClientRect().height * 0.22 && themeBtn) {
        themeBtn.click();
        egg('drag', '');
      }
    };
    on(window, 'pointerup', endDrag);
    on(window, 'pointercancel', endDrag);
    /* a drag is not a click: keep it from counting towards the three-click logo or the photo */
    on(stage, 'click', function (e) { if (dragMoved) { dragMoved = false; e.stopPropagation(); } }, true);
    on(stage, 'pointermove', function (e) {
      if (e.pointerType === 'touch' || drag) return;
      var body = bodyNow();
      stage.classList.toggle('grab', !!body && onDisc(body, e.clientX, e.clientY));
    });

    /* constellation: move the mouse slowly across the night sky and the stars draw T and C */
    var slow = 0, lastP = null, starTimer = 0;
    on(stage, 'pointermove', function (e) {
      if (e.pointerType === 'touch' || !dark() || stage.classList.contains('stars-align')) return;
      var now = e.timeStamp;
      if (lastP) {
        var dist = Math.hypot(e.clientX - lastP.x, e.clientY - lastP.y), dt = Math.max(1, now - lastP.t);
        if (dist / dt < 0.5) slow += dist; else slow *= 0.5;
      }
      lastP = { x: e.clientX, y: e.clientY, t: now };
      if (slow < 700) return;
      slow = 0;
      stage.classList.add('stars-align');
      egg('constellation', '');
      clearTimeout(starTimer);
      starTimer = setTimeout(function () { stage.classList.remove('stars-align'); }, 6500);
    });
    on(stage, 'pointerleave', function () { lastP = null; });

    /* three clicks on a cloud: it rains pixels for a few seconds */
    var cloudClicks = 0, cloudTimer = 0;
    on(stage, 'click', function (e) {
      if (dark() || !document.elementsFromPoint) return;
      var hit = null;
      document.elementsFromPoint(e.clientX, e.clientY).some(function (el) { hit = el.closest && el.closest('.cloud'); return !!hit; });
      if (!hit) return;
      cloudClicks += 1;
      clearTimeout(cloudTimer);
      cloudTimer = setTimeout(function () { cloudClicks = 0; }, 800);
      if (cloudClicks < 3) return;
      cloudClicks = 0;
      rain(hit);
      egg('rain', '');
    });
    var rain = function (cloud) {
      var s = stage.getBoundingClientRect(), c = cloud.getBoundingClientRect();
      var n = calm() ? 0 : 36;
      for (var i = 0; i < n; i++) {
        var d = make('span', 'raindrop', stage);
        d.setAttribute('aria-hidden', 'true');
        d.style.left = (c.left - s.left + Math.random() * c.width) + 'px';
        d.style.top = (c.bottom - s.top - 4) + 'px';
        d.style.setProperty('--fall', (s.bottom - c.bottom) + 'px');
        d.style.animationDelay = (Math.random() * 2.4).toFixed(2) + 's';
        d.addEventListener('animationend', function () { this.remove(); });
      }
      cloud.classList.add('raining');
      setTimeout(function () { cloud.classList.remove('raining'); }, 3400);
    };

    /* ten clicks on the photo: it jumps and complains */
    var cut = stage.querySelector('.cut-pos'), photoClicks = 0, photoTimer = 0;
    on(cut, 'click', function () {
      photoClicks += 1;
      clearTimeout(photoTimer);
      photoTimer = setTimeout(function () { photoClicks = 0; }, 3000);
      if (photoClicks < 10) return;
      photoClicks = 0;
      cut.classList.remove('tickle'); void cut.offsetWidth; cut.classList.add('tickle');
      egg('photo', D.photo);
      setTimeout(function () { cut.classList.remove('tickle'); }, 900);
    });

    /* turbo: bottom of the page and back to the top three times within 15 s */
    var trips = [], atBottom = false, sweatTimer = 0;
    on(window, 'scroll', function () {
      var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      if (y >= max - 4) atBottom = true;
      else if (atBottom && y < 40) {
        atBottom = false;
        var t = Date.now();
        trips = trips.filter(function (x) { return t - x < 15000; });
        trips.push(t);
        if (trips.length >= 3) {
          trips = [];
          stage.classList.add('sweat');
          egg('turbo', D.turbo);
          clearTimeout(sweatTimer);
          sweatTimer = setTimeout(function () { stage.classList.remove('sweat'); }, 3500);
        }
      }
    }, { passive: true });
  }

  /* ---------- the /cheats/ page: progress, locked cards, reveal and reset ---------- */
  var bar = document.getElementById('cheatsBar');
  if (bar) {
    if (/[?&]found=source\b/.test(location.search)) {
      egg('source', '');
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    }
    var list = document.querySelector('.cheats');
    var progress = document.getElementById('cheatsProgress');
    var paint = function () {
      var g = got(), n = 0;
      Array.prototype.forEach.call(list.querySelectorAll('.cheat'), function (li) {
        var has = g.indexOf(li.getAttribute('data-egg')) >= 0;
        li.classList.toggle('got', has);
        if (has) n += 1;
      });
      progress.textContent = progress.getAttribute('data-tpl').replace('{n}', n).replace('{total}', total);
    };
    list.classList.add('lockable');
    bar.hidden = false;
    paint();
    on(document.getElementById('cheatsReveal'), 'click', function () { list.classList.add('revealed'); this.hidden = true; });
    on(document.getElementById('cheatsReset'), 'click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      paint();
    });
    /* eggs found on this page (terminal, Konami...) update the count right away */
    on(window, 'storage', paint);
    setInterval(paint, 1500);
  }
})();
