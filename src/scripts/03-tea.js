// pixel tea: pop in when the contact section enters the viewport (visible without JS)
(function () {
  var t = document.querySelector('.tea-row .tea');
  if (!t) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) { t.classList.add('in'); return; }
  var io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { t.classList.add('in'); io.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(t);
})();
