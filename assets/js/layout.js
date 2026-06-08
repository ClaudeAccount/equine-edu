/* =============================================================================
   Equine Edu — layout.js
   Injects shared nav + footer into every page. Also runs the motion observer.
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

  /* ---------- always start at the top of the page ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- resolve root-relative paths from any depth ---------- */
  function depthPrefix() {
    // Count how many folders deep we are from the root
    const parts = window.location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
    // On GitHub Pages the first segment is the repo name — skip it if present
    // We just want enough "../" to reach root
    return parts.map(() => '../').join('') || './';
  }

  const root   = depthPrefix();
  const cfg    = window.LAYOUT || {};
  const homeUrl    = cfg.homeUrl    || root + 'index.html';
  const coursesUrl = cfg.coursesUrl || root + 'courses/index.html';
  const navCta     = cfg.navCta     || null;
  const navExtras  = cfg.navExtras  || [];

  /* ---------- NAV ---------- */
  function buildNav() {
    const extraLinks = navExtras.map(e =>
      `<li><a href="${e.url}">${e.label}</a></li>`
    ).join('');

    const ctaLink = navCta
      ? `<li><a href="${navCta.url}" class="nav-cta">${navCta.label}</a></li>`
      : '';

    // Pricing link
    const pricingLink = `<li><a href="${root}pricing.html">Pricing</a></li>`;

    // Auth button — renders as Log In by default; updated after session check below
    const authLink = `<li><a href="${root}auth/login.html" class="nav-auth-btn" id="nav-auth-btn">Log In</a></li>`;

    // Mobile drawer — always includes Home + Courses as baseline
    const drawerExtras = navExtras.map(e =>
      `<li><a href="${e.url}">${e.label}</a></li>`
    ).join('');

    const drawerCta = navCta
      ? `<li><a href="${navCta.url}" class="nav-drawer-cta">${navCta.label}</a></li>`
      : '';

    const drawerAuth = `<li><a href="${root}auth/login.html" id="nav-drawer-auth-btn">Log In</a></li>`;

    return `
<nav>
  <a href="${homeUrl}" class="nav-logo">Equine <span>Edu</span></a>
  <ul class="nav-links">
    ${extraLinks}
    ${pricingLink}
    ${ctaLink}
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
      ${drawerCta}
      ${drawerAuth}
    </ul>
  </div>
</nav>`.trim();
  }

  /* ---------- FOOTER ---------- */
  function buildFooter() {
    return `
<footer>
  <div class="footer-inner">
    <div class="footer-logo">Equine <span>Edu</span></div>
    <ul class="footer-links">
      <li><a href="${coursesUrl}">Courses</a></li>
      <li><a href="${homeUrl}#how">How It Works</a></li>
      <li><a href="${homeUrl}#about">About</a></li>
      <li><a href="#">Contact</a></li>
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

  /* ---------- MOTION OBSERVER ---------- */
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
      '.fade-in'
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

  /* ---------- ALSO handle old fade-in observer (index pages) ---------- */
  function setupFadeIn() {
    const fadeItems = document.querySelectorAll('.fade-in');
    if (!fadeItems.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
        }
      });
    }, { threshold: 0.1 });
    fadeItems.forEach(el => obs.observe(el));
  }

  /* ---------- AUTH NAV UPDATE ---------- */
  // After nav is injected, check session and update Log In → Account if signed in
  function updateAuthNav() {
    if (!window.EEAuth) return;
    EEAuth.getSession().then(function (session) {
      var btn   = document.getElementById('nav-auth-btn');
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
    });
  }

  /* ---------- INIT ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      inject(); setupMobileNav(); setupMotion(); setupFadeIn();
      updateAuthNav();
    });
  } else {
    inject(); setupMobileNav(); setupMotion(); setupFadeIn();
    updateAuthNav();
  }

})();
