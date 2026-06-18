(function () {
  'use strict';

  if (window.EEPageStateRestore) return;
  window.EEPageStateRestore = true;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const key = 'equineEdu.pageState:' + location.pathname + location.search + location.hash;

  function isHistoryRestore() {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    return nav && nav.type === 'back_forward';
  }

  function getActiveLevelTab() {
    const active = document.querySelector('.level-tab-btn.active[data-tab], .level-tab-btn[aria-selected="true"][data-tab]');
    return active ? active.getAttribute('data-tab') : '';
  }

  function save() {
    try {
      sessionStorage.setItem(key, JSON.stringify({
        x: window.scrollX || window.pageXOffset || 0,
        y: window.scrollY || window.pageYOffset || 0,
        levelTab: getActiveLevelTab()
      }));
    } catch (e) {}
  }

  function restoreLevelTab(tabId) {
    if (!tabId) return;
    const btns = document.querySelectorAll('.level-tab-btn[data-tab]');
    const panes = document.querySelectorAll('.level-tab-pane');
    if (!btns.length || !panes.length) return;

    btns.forEach(function (btn) {
      const on = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panes.forEach(function (pane) {
      const on = pane.id === 'tab-' + tabId;
      pane.classList.toggle('active', on);
      if (on) pane.removeAttribute('hidden');
      else pane.setAttribute('hidden', '');
    });
  }

  function restore(force) {
    if (!force && !isHistoryRestore()) return;
    let state = null;
    try {
      state = JSON.parse(sessionStorage.getItem(key) || 'null');
    } catch (e) {}
    if (!state) return;

    restoreLevelTab(state.levelTab);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.scrollTo(state.x || 0, state.y || 0);
      });
    });
  }

  window.EEPageStateRestoreNow = restore;
  window.addEventListener('pagehide', save);
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) restore(true);
  });
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') save();
  });
  document.addEventListener('click', function (event) {
    const link = event.target.closest && event.target.closest('a[href]');
    if (link) save();
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restore);
  } else {
    restore();
  }
})();
