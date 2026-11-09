(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form) return;
  var msg = document.getElementById('formMsg');
  var to = form.getAttribute('data-to');
  var subject = form.getAttribute('data-subject');
  var required = form.getAttribute('data-required');
  form.setAttribute('novalidate', '');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var company = f.company.value.trim();
    var need = f.need.value;
    var message = f.message.value.trim();
    var bad = [];
    [['name', name], ['message', message]].forEach(function (p) {
      var field = f[p[0]].closest('.field');
      var empty = !p[1];
      field.classList.toggle('has-error', empty);
      f[p[0]].setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty) bad.push(f[p[0]]);
    });
    if (bad.length) {
      msg.textContent = required;
      bad[0].focus();
      return;
    }
    msg.textContent = '';
    var labels = form.getAttribute('data-labels').split('|');
    var body = labels[0] + ': ' + name + '\n' + labels[1] + ': ' + (company || '-') + '\n' + labels[2] + ': ' + need + '\n\n' + message;
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
