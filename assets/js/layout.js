/* =============================================================================
   Equine Edu — layout.js
   Injects shared nav + footer into every page. Also runs the motion observer
   and sets the room accent (data-room) for the barn areas.
   Load this at the bottom of every page's <body>.

   Each page must have these placeholder elements in its HTML:
     <div id="site-nav"></div>      ← receives the nav
     <div id="site-footer"></div>   ← receives the footer

   Optional page-level config (set before this script loads):
     window.LAYOUT = {
       coursesUrl:  relative path to all-courses index  (default: inferred)
       homeUrl:     relative path to site root index    (default: inferred)
       navCta:      { label: 'Back to Face Markings', url: 'index.html' }
       navExtras:   [{ label: 'Learning Lab', url: 'learning-lab.html' }, ...]
     }
   ============================================================================= */

(function () {
  'use strict';

  /* ---------- back-button position restore ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const pageStateKey = 'equineEdu.pageState:' + location.pathname + location.search + location.hash;

  function isHistoryRestore() {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    return nav && nav.type === 'back_forward';
  }

  function getActiveLevelTab() {
    const active = document.querySelector('.level-tab-btn.active[data-tab], .level-tab-btn[aria-selected="true"][data-tab]');
    return active ? active.getAttribute('data-tab') : '';
  }

  function savePageState() {
    try {
      sessionStorage.setItem(pageStateKey, JSON.stringify({
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

  function restorePageState(force) {
    if (!force && !isHistoryRestore()) return;
    let state = null;
    try {
      state = JSON.parse(sessionStorage.getItem(pageStateKey) || 'null');
    } catch (e) {}
    if (!state) return;

    restoreLevelTab(state.levelTab);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.scrollTo(state.x || 0, state.y || 0);
      });
    });
  }

  window.addEventListener('pagehide', savePageState);
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) restorePageState(true);
  });
  window.addEventListener('beforeunload', savePageState);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') savePageState();
  });
  document.addEventListener('click', function (event) {
    const link = event.target.closest && event.target.closest('a[href]');
    if (link) savePageState();
  }, true);

  /* ---------- resolve root-relative paths from any depth ---------- */
  function depthPrefix() {
    // Count how many folders deep we are from the root
    const parts = window.location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
    // We just want enough "../" to reach root
    return parts.map(() => '../').join('') || './';
  }

  const root   = depthPrefix();
  const cfg    = window.LAYOUT || {};

  /* ---------- ROOM DETECTION ----------
     The rooms of the barn share one design system; each gets an accent tint.
     Setting data-room on <body> activates the room's --room-accent/--room-wash
     tokens (see core.css §2). Derived from the URL — no per-page setup. */
  const ROOMS = {
    'round-pen':      'The Round Pen',
    'schooling-ring': 'The Schooling Ring',
    'quiz-corral':    'The Quiz Corral',
    'lesson-board':   'The Lesson Board'
  };
  let roomName = '';
  (function detectRoom() {
    const path = window.location.pathname;
    for (const slug in ROOMS) {
      if (path.indexOf('/' + slug + '/') !== -1) {
        document.body.setAttribute('data-room', slug);
        roomName = ROOMS[slug];
        return;
      }
    }
  })();

  /* ──────────────────────────────────────────────────────────────────────
     CLOSED BETA MODE (temporary).
     While true, the site runs as a public, no-account content beta:
       • Logo + nav point at the All Courses page (the beta homepage)
       • Login / Sign Up / Pricing / Dashboard / My Account links are hidden
       • Per-page navExtras (which mostly point at the hidden marketing home)
         are ignored
       • Footer drops its links to the hidden marketing homepage
       • updateAuthNav() is skipped (no session lookup, no "My Account" swap)
     To RESTORE the full membership experience, set EE_BETA to false (or flip
     the default below). Nothing here is deleted — it is all gated on this flag.
     ────────────────────────────────────────────────────────────────────── */
  const BETA = (typeof window.EE_BETA === 'boolean') ? window.EE_BETA : true;

  const homeUrl    = cfg.homeUrl    || root + 'index.html';
  const coursesUrl = cfg.coursesUrl || root + 'courses/index.html';
  const horseBowlUrl = root + 'horse-bowl/index.html';
  // In beta, ignore per-page extra links (they point at the hidden home page).
  const navExtras  = BETA ? [] : (cfg.navExtras || []);

  /* ---------- NAV ----------
     Note: the large "Back to Course" / "Back to All Courses" CTA buttons
     (window.LAYOUT.navCta) are not rendered in the header — that navigation
     lives in the per-page sidebar (see course-nav.js / .sidebar-module-nav).
     navCta is still read by course-nav.js for the sidebar's "Back to
     Training Barn" button on game/activity pages, so leave it set there.
     navExtras text links are rendered here — space for future
     top-level nav links. */
  function buildNav() {
    const roomLabel = roomName ? `<span class="nav-room">${roomName}</span>` : '';

    /* ---- CLOSED BETA NAV: All Courses + Horse Bowl only, no auth/pricing ---- */
    if (BETA) {
      const logoUrl = coursesUrl; // courses page is the beta homepage
      return `
<nav>
  <span style="display:flex;align-items:center;min-width:0;">
    <a href="${logoUrl}" class="nav-logo">Equine <span>Edu</span></a>
    ${roomLabel}
  </span>
  <ul class="nav-links">
    <li><a href="${coursesUrl}">All Courses</a></li>
    <li><a href="${horseBowlUrl}">Horse Bowl</a></li>
  </ul>
  <button class="nav-burger" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <div class="nav-drawer">
    <ul class="nav-drawer-links">
      <li><a href="${coursesUrl}">All Courses</a></li>
      <li><a href="${horseBowlUrl}">Horse Bowl</a></li>
    </ul>
  </div>
</nav>`.trim();
    }

    /* ---- FULL (post-beta) NAV ---- */
    const extraLinks = navExtras.map(e =>
      `<li><a href="${e.url}">${e.label}</a></li>`
    ).join('');

    // Pricing link
    const pricingLink = `<li><a href="${root}pricing.html">Pricing</a></li>`;

    // Auth button — renders as Log In by default; updated after session check below
    const authLink = `<li><a href="${root}auth/login.html" class="nav-auth-btn" id="nav-auth-btn">Log In</a></li>`;

    // Mobile drawer — always includes Home + Courses as baseline
    const drawerExtras = navExtras.map(e =>
      `<li><a href="${e.url}">${e.label}</a></li>`
    ).join('');

    const drawerAuth = `<li><a href="${root}auth/login.html" id="nav-drawer-auth-btn">Log In</a></li>`;

    // Dashboard (learning hub) link — hidden by default, revealed for signed-in users (see updateAuthNav)
    const dashLink   = `<li id="nav-dash-li" style="display:none"><a href="${root}hub/index.html" class="nav-dash-link">Dashboard</a></li>`;
    const drawerDash = `<li id="nav-drawer-dash-li" style="display:none"><a href="${root}hub/index.html">Dashboard</a></li>`;

    return `
<nav>
  <span style="display:flex;align-items:center;min-width:0;">
    <a href="${homeUrl}" class="nav-logo">Equine <span>Edu</span></a>
    ${roomLabel}
  </span>
  <ul class="nav-links">
    ${extraLinks}
    ${dashLink}
    ${pricingLink}
    ${authLink}
  </ul>
  <button class="nav-burger" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <div class="nav-drawer">
    <ul class="nav-drawer-links">
      <li><a href="${homeUrl}">Home</a></li>
      <li><a href="${coursesUrl}">All Courses</a></li>
      <li><a href="${root}pricing.html">Pricing</a></li>
      ${drawerExtras}
      ${drawerDash}
      ${drawerAuth}
    </ul>
  </div>
</nav>`.trim();
  }

  /* ---------- FOOTER ---------- */
  function buildFooter() {
    // In beta, drop the "How It Works"/"About" links — they point at the
    // hidden marketing homepage. Keep Courses, Horse Bowl, and Contact.
    const footerLinks = BETA
      ? `
      <li><a href="${coursesUrl}">All Courses</a></li>
      <li><a href="${horseBowlUrl}">Horse Bowl</a></li>
      <li><a href="#">Contact</a></li>`
      : `
      <li><a href="${coursesUrl}">Courses</a></li>
      <li><a href="${homeUrl}#how">How It Works</a></li>
      <li><a href="${homeUrl}#about">About</a></li>
      <li><a href="#">Contact</a></li>`;
    return `
<footer>
  <div class="footer-inner">
    <div class="footer-logo">Equine <span>Edu</span></div>
    <ul class="footer-links">${footerLinks}
    </ul>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} Equine Edu. All rights reserved.</p>
  </div>
</footer>`.trim();
  }

  /* ---------- INJECT ---------- */
  function inject() {
    const navEl    = document.getElementById('site-nav');
    const footerEl = document.getElementById('site-footer');
    if (navEl)    navEl.outerHTML    = buildNav();
    if (footerEl) footerEl.outerHTML = buildFooter();
  }

  /* ---------- MOBILE NAV TOGGLE ---------- */
  function setupMobileNav() {
    const nav    = document.querySelector('nav');
    const burger = nav && nav.querySelector('.nav-burger');
    if (!burger) return;

    function closeNav() {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burger.setAttribute('aria-label',    isOpen ? 'Close menu' : 'Open menu');
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) closeNav();
    });

    // Close when a drawer link is tapped
    nav.querySelectorAll('.nav-drawer-links a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  /* ---------- MOTION OBSERVER ----------
     The single site-wide reveal system (.motion-reveal). Pages should not
     define their own observers or fade systems — add selectors here. */
  function setupMotion() {
    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const selectors = [
      '.lesson-hero-inner', '.page-hero-inner', '.quiz-hero-inner',
      '.lesson-left > *', '.lesson-right > *',
      '.key-terms', '.lesson-notes', '.whats-next', '.module-sidebar',
      '.concept-card', '.term-card', '.lesson-intro-card', '.visual-card',
      '.module-item', '.outcomes-grid', '.track-visual', '.cta-inner',
      '.note-card', '.lesson-card', '.quiz-panel', '.game-panel',
      '.practice-card', '.flip-card', '.study-card', '.resource-card',
      '.fade-in',
      /* homepage editorial blocks */
      '.cover-text', '.cover-art', '.hallmark', '.library-content',
      '.library-art', '.step', '.beyond-card', '.beyond-art',
      '.about-text', '.about-visual', '.faq-item'
    ];

    const items = Array.from(
      new Set(document.querySelectorAll(selectors.join(',')))
    );

    items.forEach((el, i) => {
      el.classList.add('motion-reveal');
      el.style.setProperty('--motion-delay', `${Math.min(i * 35, 210)}ms`);
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    items.forEach(el => obs.observe(el));
  }

  /* ---------- LESSON TABS ----------
     Global handlers for the canonical .tab-system pattern (see components.css
     §11b). Top tab bars switch panels; bottom ".tab-bar--jump" bars switch
     panels AND scroll back to the top of the tab system at a medium speed.
     Pages only provide markup — no per-page tab JS. */
  function systemOf(id) {
    const panel = document.getElementById(id);
    if (!panel) return null;
    return panel.closest('.tab-system') || document.body;
  }

  /* Animated scroll used by jump bars — medium speed, eased. Exposed so
     pages with custom tab logic can reuse the same feel. */
  window.eeScrollTo = function (target) {
    if (!target) return;
    const navOffset = 84;
    const destY = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, destY);
      return;
    }
    const startY = window.pageYOffset;
    const dist = destY - startY;
    const duration = 650;
    const t0 = performance.now();
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    (function step(now) {
      const p = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, startY + dist * easeInOut(p));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };

  if (!window.switchTab) window.switchTab = function (id) {
    const system = systemOf(id);
    if (!system) return;
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      if ((p.closest('.tab-system') || document.body) === system) {
        p.classList.toggle('active', p.id === id);
      }
    });
    document.querySelectorAll('.tab-btn[aria-controls]').forEach(function (b) {
      if (systemOf(b.getAttribute('aria-controls')) === system) {
        const on = b.getAttribute('aria-controls') === id;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      }
    });
    document.querySelectorAll('.tab-btn[data-jump-target]').forEach(function (b) {
      if (systemOf(b.dataset.jumpTarget) === system) {
        b.classList.toggle('active', b.dataset.jumpTarget === id);
      }
    });
  };

  if (!window.jumpToTab) window.jumpToTab = function (id) {
    window.switchTab(id);
    const panel = document.getElementById(id);
    const target = panel ? (panel.closest('.tab-system') || panel) : null;
    window.eeScrollTo(target);
  };

  function setupTabs() {
    /* Buttons with their own onclick keep their page-defined behavior. */
    document.querySelectorAll('.tab-btn[aria-controls]').forEach(function (b) {
      if (b.dataset.tabWired || b.hasAttribute('onclick')) return;
      b.dataset.tabWired = '1';
      b.addEventListener('click', function () {
        window.switchTab(b.getAttribute('aria-controls'));
      });
    });
    document.querySelectorAll('.tab-btn[data-jump-target]').forEach(function (b) {
      if (b.dataset.tabWired || b.hasAttribute('onclick')) return;
      b.dataset.tabWired = '1';
      b.addEventListener('click', function () {
        window.jumpToTab(b.dataset.jumpTarget);
      });
    });
    /* Bottom bars whose buttons are wired by page JS (e.g. .part-tab) still
       get the scroll-back-to-top-bar behavior. */
    document.querySelectorAll('.tab-bar--jump button:not([data-jump-target]):not([onclick])').forEach(function (b) {
      if (b.dataset.jumpWired) return;
      b.dataset.jumpWired = '1';
      b.addEventListener('click', function () {
        window.eeScrollTo(document.querySelector('.tab-bar:not(.tab-bar--jump)'));
      });
    });
  }

  /* ---------- AUTH NAV UPDATE ---------- */
  // After nav is injected, check session and update Log In → Account if signed in
  function updateAuthNav() {
    if (BETA) return; // closed beta: no accounts, no session lookup, no "My Account" swap
    if (!window.EEAuth) return;
    EEAuth.getSession().then(function (session) {
      var btn    = document.getElementById('nav-auth-btn');
      var drawer = document.getElementById('nav-drawer-auth-btn');
      if (!session) return; // not logged in — keep "Log In"
      var accountUrl = root + 'account/index.html';
      if (btn) {
        btn.textContent = 'My Account';
        btn.href = accountUrl;
      }
      if (drawer) {
        drawer.textContent = 'My Account';
        drawer.href = accountUrl;
      }
      // Reveal the Dashboard (hub) link now that we know the user is signed in
      var dashLi = document.getElementById('nav-dash-li');
      var dashDrawerLi = document.getElementById('nav-drawer-dash-li');
      if (dashLi) dashLi.style.display = '';
      if (dashDrawerLi) dashDrawerLi.style.display = '';
    });
  }

  /* ---------- INIT ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      inject(); setupMobileNav(); setupMotion(); setupTabs();
      updateAuthNav();
      restorePageState();
    });
  } else {
    inject(); setupMobileNav(); setupMotion(); setupTabs();
    updateAuthNav();
    restorePageState();
  }

})();
