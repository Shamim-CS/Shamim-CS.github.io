// Theme toggle and the MA-IDS illustration in the header.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeBtn');
  var moon = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  var sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';

  function paint() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.querySelector('svg').innerHTML = dark ? sun : moon;
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (btn) {
    paint();
    btn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') !== 'dark';
      if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
      paint();
    });
  }

  // Header panel: three tabs, one per research area. Each plays its sequence
  // when shown (once on load for the first tab, again on tab change or Replay).
  var panel = document.getElementById('panel');
  if (!panel) return;
  var tabs = Array.prototype.slice.call(panel.querySelectorAll('[role="tab"]'));
  var cap = document.getElementById('paneCap');
  var replay = document.getElementById('replay');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [];
  var current = null;

  function play(pane) {
    timers.forEach(clearTimeout); timers = [];
    var steps = pane.querySelectorAll('.step');
    var counter = pane.querySelector('[data-count-at], .lib-count[data-at]');
    if (reduce) {
      panel.classList.remove('is-playing');
      steps.forEach(function (s) { s.classList.add('on'); });
      if (counter) counter.textContent = counter.getAttribute('data-to');
      return;
    }
    panel.classList.add('is-playing');
    steps.forEach(function (s) { s.classList.remove('on'); });
    if (counter) {
      counter.textContent = counter.getAttribute('data-from');
      timers.push(setTimeout(function () { counter.textContent = counter.getAttribute('data-to'); }, +counter.getAttribute('data-at')));
    }
    steps.forEach(function (s) {
      timers.push(setTimeout(function () { s.classList.add('on'); }, +(s.getAttribute('data-at') || 0)));
    });
  }

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    cap.textContent = tab.getAttribute('data-cap');
    current = document.getElementById(tab.getAttribute('aria-controls'));
    play(current);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t, false); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = null;
      if (k === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') j = 0;
      else if (k === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });
  if (replay) replay.addEventListener('click', function () { if (current) play(current); });
  select(tabs[0], false);
})();

// Figure viewer: opens a paper figure at full size.
(function () {
  var dlg = document.getElementById('viewer');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var img = document.getElementById('viewerImg');
  var cap = document.getElementById('viewerCap');
  var last = null;
  document.querySelectorAll('[data-full]').forEach(function (b) {
    b.addEventListener('click', function () {
      last = b;
      img.src = b.getAttribute('data-full');
      img.alt = (b.querySelector('img') || {}).alt || '';
      cap.textContent = b.getAttribute('data-caption') || '';
      dlg.showModal();
    });
  });
  document.getElementById('viewerClose').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (last) last.focus(); });
})();
