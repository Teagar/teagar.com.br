// Easter eggs. Every one is listed on the secret /cheats/ page; none changes anything until it is triggered.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  var calm = function () { return reduce && reduce.matches; };
  var toastEl = document.getElementById('eggToast');
  var toastTimer = 0;
  function toast(key) {
    if (!toastEl) return;
    toastEl.textContent = toastEl.getAttribute('data-' + key) || '';
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 3600);
  }

  /* 1. console note for the curious */
  if (toastEl && window.console && console.log) {
    var lines = [];
    try { lines = JSON.parse(toastEl.getAttribute('data-console') || '[]'); } catch (e) {}
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
    console.log('%c' + art, 'color:#FF6700;font-family:monospace;line-height:1');
    if (lines.length) console.log('%c' + lines[0] + '\n%c' + lines.slice(1).join('\n'), 'font:700 14px sans-serif', 'font:12px monospace;color:#FF6700');
  }

  /* 2. tea time: between 16:00 and 17:00 (visitor's clock) the contact line becomes an invitation */
  var tpl = document.querySelector('.tea-time-tpl');
  if (tpl && new Date().getHours() === 16) {
    var line = tpl.parentNode.querySelector('.tea-line');
    if (line) line.innerHTML = tpl.innerHTML;
    var row = tpl.closest('.tea-row');
    if (row) row.classList.add('tea-time');
  }

  /* 3. footer cup: five clicks fill it, the fifth overflows */
  var cup = document.querySelector('.tea-mini');
  if (cup) {
    var fills = 0, cupTimer = 0;
    cup.addEventListener('click', function () {
      if (cup.classList.contains('full')) return;
      fills += 1;
      clearTimeout(cupTimer);
      cupTimer = setTimeout(function () { fills = 0; }, 4000);
      var d = document.createElement('span');
      d.className = 'drip';
      cup.appendChild(d);
      setTimeout(function () { d.remove(); }, 500);
      cup.classList.remove('sip'); void cup.offsetWidth; cup.classList.add('sip');
      if (fills >= 5) {
        fills = 0;
        cup.classList.add('full');
        ['l', 'r'].forEach(function (side) {
          var s = document.createElement('span');
          s.className = 'spill ' + side;
          cup.appendChild(s);
        });
        toast('cup');
        setTimeout(function () {
          cup.classList.remove('full', 'sip');
          Array.prototype.forEach.call(cup.querySelectorAll('.spill'), function (s) { s.remove(); });
        }, 4200);
      }
    });
  }

  /* keyboard eggs (ignored while typing in a field) */
  var KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  var keys = [], typed = '', gbTimer = 0, rollTimer = 0;
  function typing(t) { return t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName)); }
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    var k = (e.key || '').toLowerCase();
    /* 4. Konami code: Game Boy palette for 10 s */
    keys.push(k); if (keys.length > KONAMI.length) keys.shift();
    if (keys.join() === KONAMI.join()) {
      keys = [];
      root.classList.add('gameboy');
      toast('konami');
      clearTimeout(gbTimer);
      gbTimer = setTimeout(function () { root.classList.remove('gameboy'); }, 10000);
    }
    /* 5. type "teagar": the name rolls to Thiago and teacups rain */
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
    if (calm()) return;
    for (var i = 0; i < 16; i++) {
      var img = document.createElement('img');
      img.src = '/assets/img/tea-cup.svg'; img.alt = ''; img.className = 'cup-rain';
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

  var stage = document.getElementById('stage');
  function stageVisible() {
    if (!stage) return false;
    var r = stage.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  /* 6. shooting star: 20 s with no input while the night hero is on screen */
  if (stage && !calm()) {
    var idle = 0;
    var resetIdle = function () { clearTimeout(idle); idle = setTimeout(shoot, 20000); };
    var shoot = function () {
      resetIdle();
      if (document.hidden || root.getAttribute('data-theme') !== 'dark' || !stageVisible() || stage.querySelector('.shooting-star')) return;
      var s = document.createElement('span');
      s.className = 'shooting-star';
      s.setAttribute('aria-hidden', 'true');
      s.addEventListener('click', function () {
        if (s.classList.contains('wished')) return;
        s.classList.add('wished');
        toast('wish');
        setTimeout(function () { s.remove(); }, 900);
      });
      s.addEventListener('animationend', function () { if (!s.classList.contains('wished')) s.remove(); });
      stage.appendChild(s);
    };
    ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, resetIdle, { passive: true });
    });
    resetIdle();
  }

  /* 7. eclipse: five theme switches in a row (each within 1.5 s of the last) */
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    var flips = 0, flipTimer = 0, ecTimer = 0;
    themeBtn.addEventListener('click', function () {
      flips += 1;
      clearTimeout(flipTimer);
      flipTimer = setTimeout(function () { flips = 0; }, 1500);
      if (flips < 5) return;
      flips = 0;
      if (!stage || !stageVisible()) return;
      stage.classList.remove('eclipsing'); void stage.offsetWidth;
      setTimeout(function () {
        stage.classList.add('eclipsing');
        toast('eclipse');
        clearTimeout(ecTimer);
        ecTimer = setTimeout(function () { stage.classList.remove('eclipsing'); }, calm() ? 2500 : 3600);
      }, 750);
    });
  }
})();
