/* =============================================================================
   Equine Edu — loft-nav.js
   Context-aware navigation for the Learning Loft "Training Barn".

   The same practice hub can be entered two ways:
     • from the Learning Loft tab   → courses/index.html?#learning-loft
     • from inside a course         → the course's doorway (training-barn page)

   This script makes the Back button on hub pages AND on the individual game
   pages return the learner to wherever they came from, with no duplicated game
   components — games are linked in place.

   ---------------------------------------------------------------------------
   URL parameter contract (all values are site-root-relative where they are
   paths, so they resolve correctly from any folder depth):

     from   'loft' | 'course'      where the learner originally came from
     ret    <root-relative path>   course page to return to (when from=course)
     rl     <label>                human label for that course (e.g. "Face Markings")
     hub    <root-relative path>   the hub a game was launched from
     ht     <label>                the hub's title (e.g. "Colors & Markings")

   ---------------------------------------------------------------------------
   Per-page setup:

     • Hub pages set, before this script loads:
         window.LOFT_NAV = {
           role:     'hub',
           selfPath: 'courses/learning-loft/colors-markings/index.html', // root-relative
           title:    'Colors & Markings',
           loft:     'courses/index.html'   // root-relative Loft page (optional)
         };
       and include an empty <div id="loft-back"></div> near the top.

     • Game pages need no config — they are reached with ?hub=...&from=...
       in the URL (the hub forwards it), and this script injects a back bar.
   ============================================================================= */

(function () {
  'use strict';

  /* "../" prefix needed to reach the site root (the folder that contains
     "courses/") from the current page. Anchoring on the "courses" segment
     keeps this correct whether the site is served from a domain root, a
     sub-path, or opened directly from disk via file:// — where the URL also
     contains the machine's folder chain. Every page that loads this script
     lives under courses/, so the anchor is always present. */
  function rootPrefix() {
    var segs = location.pathname.split('/').filter(Boolean);
    var ci = segs.lastIndexOf('courses');
    if (ci === -1) {
      var parts = location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
      return parts.map(function () { return '../'; }).join('') || './';
    }
    var depth = (segs.length - 1) - ci;        // directories between site root and this file
    return depth > 0 ? new Array(depth + 1).join('../') : './';
  }

  function parseQuery() {
    var out = {}, s = location.search.replace(/^\?/, '');
    if (!s) return out;
    s.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = decodeURIComponent(i < 0 ? pair : pair.slice(0, i));
      var v = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }

  function buildQuery(obj) {
    return Object.keys(obj)
      .filter(function (k) { return obj[k] != null && obj[k] !== ''; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); })
      .join('&');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var ROOT = rootPrefix();
  var Q = parseQuery();
  var CFG = window.LOFT_NAV || null;

  /* ---------------------------------------------------------------------------
     HUB PAGE
     - Render the Back button (to course or to the Loft).
     - Forward the entry context onto every game card so each game can send the
       learner back to this hub, and this hub keeps its own origin.
  --------------------------------------------------------------------------- */
  function initHub() {
    var backHref, backLabel;
    if (Q.ret) {
      backHref = ROOT + Q.ret;
      backLabel = Q.rl ? ('Back to ' + Q.rl) : 'Back to the course';
    } else {
      backHref = ROOT + (CFG.loft || 'courses/index.html') + '#learning-loft';
      backLabel = 'Back to ' + (CFG.loftLabel || 'the Training Barn');
    }

    var holder = document.getElementById('loft-back');
    if (holder) {
      holder.innerHTML = '<a class="loft-back-link" href="' + esc(backHref) + '">' +
        '← ' + esc(backLabel) + '</a>';
    }

    var forward = {
      hub: CFG.selfPath,
      ht: CFG.title,
      from: Q.from || 'loft'
    };
    if (Q.ret) forward.ret = Q.ret;
    if (Q.rl) forward.rl = Q.rl;
    var qstr = buildQuery(forward);

    var cards = document.querySelectorAll('a.activity-card[href], a.lesson-card[href]');
    Array.prototype.forEach.call(cards, function (a) {
      var h = a.getAttribute('href');
      if (!h || /^(?:[a-z]+:|#)/i.test(h)) return;        // skip mailto:, #anchors, etc.
      a.setAttribute('href', h + (h.indexOf('?') < 0 ? '?' : '&') + qstr);
    });

    /* When the learner arrived from a specific course, float that course's
       activity group to the top of the hub so it is easy to find. */
    if (Q.from === 'course' && Q.ret) {
      var segs = Q.ret.split('/').filter(Boolean);
      var slug = segs.length >= 2 ? segs[segs.length - 2] : '';   // .../{course}/1-index.html
      var group = slug && document.querySelector('[data-course="' + slug + '"]');
      if (group && group.parentNode) {
        var firstGroup = group.parentNode.querySelector('[data-course]');
        if (firstGroup && firstGroup !== group) {
          group.parentNode.insertBefore(group, firstGroup);
        }
        group.classList.add('loft-from-course');
        var h2 = group.querySelector('h2');
        if (h2 && !h2.querySelector('.loft-here-badge')) {
          h2.insertAdjacentHTML('beforeend', ' <span class="loft-here-badge">Your course</span>');
        }
      }
    }
  }

  /* ---------------------------------------------------------------------------
     GAME PAGE (reached with ?hub=...)
     - Inject a prominent "Back to <Hub> Practice" bar below the site nav.
     - Repoint any stale in-course "Back to Training Barn" sidebar button to the
       hub so there is a single, correct return path.
  --------------------------------------------------------------------------- */
  function initGame() {
    var hubQuery = buildQuery({ from: Q.from, ret: Q.ret, rl: Q.rl, ht: Q.ht });
    var hubHref = ROOT + Q.hub + (hubQuery ? ('?' + hubQuery) : '');
    var label = 'Back to ' + (Q.ht ? Q.ht + ' Practice' : 'Practice');

    if (!document.querySelector('.loft-backbar')) {
      var bar = document.createElement('div');
      bar.className = 'loft-backbar';
      bar.innerHTML = '<a class="loft-back-link" href="' + esc(hubHref) + '">' +
        '← ' + esc(label) + '</a>';
      var navEl = document.querySelector('nav');
      if (navEl && navEl.parentNode) {
        navEl.parentNode.insertBefore(bar, navEl.nextSibling);
      } else {
        document.body.insertBefore(bar, document.body.firstChild);
      }
    }

    /* Repoint stale return buttons (rendered by course-nav.js) and any
       "Training Barn" nav-extra link to the hub. */
    var stale = document.querySelectorAll(
      'a.sidebar-nav-btn-return, #course-sidebar-nav a, .sidebar-module-nav-return a'
    );
    Array.prototype.forEach.call(stale, function (a) {
      a.setAttribute('href', hubHref);
      a.innerHTML = '← ' + esc(label);
    });
    var navLinks = document.querySelectorAll('nav a, .nav-drawer-links a');
    Array.prototype.forEach.call(navLinks, function (a) {
      if (/training barn/i.test(a.textContent || '')) {
        a.setAttribute('href', hubHref);
      }
    });
  }

  function run() {
    if (CFG && CFG.role === 'hub') { initHub(); return; }
    if (Q.hub) { initGame(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
