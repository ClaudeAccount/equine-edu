/* =============================================================================
   Equine Edu — course-nav.js
   Builds the sidebar module list, breadcrumb, and "Up Next" panel on lesson pages.
   Reads from window.COURSE_CONFIG (defined in each course's course-config.js)
   and window.CURRENT_MODULE (1-indexed, set inline on each lesson page).

   Each lesson page must have:
     <div id="course-breadcrumb"></div>   ← in the breadcrumb position
     <div id="course-sidebar"></div>      ← inside .lesson-right
     <div id="course-upnext"></div>       ← inside .lesson-right (optional)

   Each lesson page must set (before this script loads):
     window.CURRENT_MODULE = 2;   // 1-indexed
     window.PAGE_NOTES = {        // optional — omit if page has no lesson notes
       items: ['Note one.', 'Note two.'],
       highlight: 'A key callout sentence.'
     };
   ============================================================================= */

(function () {
  'use strict';

  function init() {
    const config = window.COURSE_CONFIG;
    const modNum = window.CURRENT_MODULE;
    if (!config) return;

    // Landing pages have a module list but no CURRENT_MODULE — show course progress there.
    if (!modNum) {
      if (document.getElementById('course-module-list')) {
        buildLandingProgress(config, getCourseBasePath());
      }
      return;
    }

    const modules  = config.modules;
    const current  = modules.find(m => m.num === modNum);
    if (!current) return;

    const prevMod  = modules.find(m => m.num === modNum - 1) || null;
    const nextMod  = modules.find(m => m.num === modNum + 1) || null;

    const courseBase = getCourseBasePath();
    buildBreadcrumb(config, current, courseBase);
    buildSidebar(config, modules, modNum, courseBase);
    buildSidebarNav(prevMod, nextMod, config, courseBase);
    buildNotes();
    patchLessonNav(prevMod, nextMod, config, courseBase);
  }

  function getCourseBasePath() {
    const scripts = Array.from(document.scripts || []);
    const configScript = scripts.find(script => /(?:^|\/)course-config\.js(?:\?.*)?$/.test(script.getAttribute('src') || ''));
    if (!configScript) return '';
    return (configScript.getAttribute('src') || '').replace(/course-config\.js(?:\?.*)?$/, '');
  }

  function courseUrl(file, courseBase) {
    if (!file || /^(?:[a-z]+:|#|\/)/i.test(file)) return file;
    return (courseBase || '') + file;
  }

  /* ---------- PROGRESS HELPERS ----------
     Progress is tracked in localStorage as:
       equineEduProgress.<camelCaseCourseId>.<moduleKey> = 'true'
     The CANONICAL module key is derived from the module's file name
     ('4-viewing-room.html' → 'viewingRoom') — this is what lesson pages
     write on visit. For backward compatibility with older stored progress,
     completion also checks the title-derived key and its leading-'The'
     stripped variant ('The Viewing Room' → 'theViewingRoom' / 'viewingRoom'). */
  function toCamel(str) {
    const words = String(str || '').replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/);
    return words.map((w, i) => {
      if (!w) return '';
      return i === 0
        ? w.charAt(0).toLowerCase() + w.slice(1)
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join('');
  }

  function courseIdCamel(id) {
    return String(id || '').split('-').map((w, i) => {
      if (!w) return '';
      return i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1);
    }).join('');
  }

  function fileKeyCamel(file) {
    // '4-viewing-room.html' → 'viewingRoom'
    const base = String(file || '')
      .split('/').pop()
      .replace(/\.html?(\?.*)?$/i, '')
      .replace(/^\d+[-_]?/, '');
    if (!base) return '';
    return base.split(/[-_]+/).filter(Boolean).map(function (w, i) {
      return i === 0
        ? w.charAt(0).toLowerCase() + w.slice(1)
        : w.charAt(0).toUpperCase() + w.slice(1);
    }).join('');
  }

  function moduleKeyCandidates(m) {
    const cands = [];
    const fk = fileKeyCamel(m.file);
    if (fk) cands.push(fk);
    const tk = toCamel(m.title);
    if (tk && cands.indexOf(tk) === -1) cands.push(tk);
    if (/^the[A-Z]/.test(tk)) {
      const stripped = tk.charAt(3).toLowerCase() + tk.slice(4);
      if (cands.indexOf(stripped) === -1) cands.push(stripped);
    }
    return cands;
  }

  function isModuleComplete(config, m) {
    try {
      const prefix = 'equineEduProgress.' + courseIdCamel(config.id) + '.';
      return moduleKeyCandidates(m).some(function (k) {
        return localStorage.getItem(prefix + k) === 'true';
      });
    } catch (e) {
      return false;
    }
  }

  /* ---------- LANDING PAGE PROGRESS ---------- */
  function buildLandingProgress(config, courseBase) {
    const modules = (config.modules || []);
    if (!modules.length) return;
    const list = document.getElementById('course-module-list');
    if (!list) return;

    let complete = 0;
    modules.forEach(function (m) { if (isModuleComplete(config, m)) complete++; });
    const total = modules.length;
    const pct = total ? Math.round((complete / total) * 100) : 0;
    const done = complete >= total && total > 0;

    // mark completed module items already rendered by the page's own script
    const items = list.querySelectorAll('.module-item');
    modules.forEach(function (m, i) {
      if (isModuleComplete(config, m) && items[i]) {
        items[i].classList.add('is-complete');
        const num = items[i].querySelector('.module-num');
        if (num) num.innerHTML = '&#10003;';
      }
    });

    // build the bar once, just above the module list
    if (document.getElementById('course-progress')) return;
    const wrap = document.createElement('div');
    wrap.className = 'course-progress' + (done ? ' is-done' : '');
    wrap.id = 'course-progress';
    wrap.innerHTML =
      '<div class="course-progress-top">' +
        '<span class="course-progress-label">' + (done ? 'Course complete' : 'Your progress') + '</span>' +
        '<span class="course-progress-count">' + complete + ' of ' + total + ' complete</span>' +
      '</div>' +
      '<div class="course-progress-track"><div class="course-progress-fill" style="width:' + pct + '%;"></div></div>';
    list.parentNode.insertBefore(wrap, list);
  }

  /* ---------- BREADCRUMB ---------- */
  function buildBreadcrumb(config, current, courseBase) {
    const el = document.getElementById('course-breadcrumb');
    if (!el) return;
    el.outerHTML = `
<div class="breadcrumb">
  <a href="${config.homeUrl}">Home</a>
  <span>&middot;</span>
  <a href="${config.allCoursesUrl}">All Courses</a>
  <span>&middot;</span>
  <a href="${courseUrl(config.indexUrl, courseBase)}">${config.title}</a>
  <span>&middot;</span>
  <span class="breadcrumb-current">Module ${current.num} &mdash; ${current.title}</span>
</div>`.trim();
  }

  /* ---------- SIDEBAR ---------- */
  function buildSidebar(config, modules, currentNum, courseBase) {
    const el = document.getElementById('course-sidebar');
    if (!el) return;

    let completeCount = 0;
    const items = modules.map(m => {
      const isActive = m.num === currentNum ? ' active' : '';
      const complete = isModuleComplete(config, m);
      if (complete) completeCount++;
      const completeClass = complete ? ' is-complete' : '';
      const numContent = complete ? '&#10003;' : m.num;
      return `
    <li>
      <a href="${courseUrl(m.file, courseBase)}" class="sidebar-module${isActive}${completeClass}">
        <div class="sidebar-num">${numContent}</div>
        <div class="sidebar-module-info">
          <div class="sidebar-module-title">${m.title}</div>
          <div class="sidebar-module-type">${m.type}</div>
        </div>
      </a>
    </li>`.trim();
    }).join('\n');

    const total = modules.length;
    const pct = total ? Math.round((completeCount / total) * 100) : 0;

    el.outerHTML = `
<div class="module-sidebar">
  <div class="module-sidebar-header">
    <h3>${config.title}</h3>
    <a href="${courseUrl(config.indexUrl, courseBase)}">View course &rarr;</a>
  </div>
  <div class="sidebar-progress">
    <div class="sidebar-progress-track">
      <div class="sidebar-progress-fill" style="width: ${pct}%;"></div>
    </div>
    <div class="sidebar-progress-label">${completeCount} of ${total} complete</div>
  </div>
  <ul class="module-sidebar-list">
    ${items}
  </ul>
</div>`.trim();
  }

  /* ---------- LESSON NOTES ---------- */
  function buildNotes() {
    const el = document.getElementById('course-notes');
    const notes = window.PAGE_NOTES;
    if (!el || !notes) return;

    const items = (notes.items || []).map(n => `<li>${n}</li>`).join('\n        ');
    const highlight = notes.highlight
      ? `<div class="notes-highlight">${notes.highlight}</div>`
      : '';

    el.outerHTML = `
<div class="lesson-notes">
  <h3>Things to Remember</h3>
  <div class="notes-body">
    <ul class="notes-list">
        ${items}
    </ul>
    ${highlight}
  </div>
</div>`.trim();
  }

  /* ---------- SIDEBAR NAV ---------- */
  function buildSidebarNav(prevMod, nextMod, config, courseBase) {
    const el = document.getElementById('course-sidebar-nav');
    if (!el) return;

    const layout = window.LAYOUT || {};
    const cta = layout.navCta || null;
    const path = window.location.pathname.toLowerCase();
    const isTrainingBarnActivity =
      cta &&
      /back to training barn/i.test(cta.label || '') &&
      /(games?|downloads?)/.test(path);
    const isLearningLoftActivity =
      cta &&
      /back to learning loft/i.test(cta.label || '') &&
      /\/learning-loft\//.test(path);

    if (isTrainingBarnActivity || isLearningLoftActivity) {
      el.outerHTML = `
<div class="sidebar-module-nav sidebar-module-nav-return">
  <a href="${cta.url}" class="sidebar-nav-btn sidebar-nav-btn-return">&larr; ${cta.label}</a>
</div>`.trim();
      return;
    }

    const prevHref  = prevMod ? courseUrl(prevMod.file, courseBase) : courseUrl(config.indexUrl, courseBase);
    const prevLabel = prevMod ? '<- ' + prevMod.title : '<- Back to Course';
    const nextHref  = nextMod ? courseUrl(nextMod.file, courseBase) : courseUrl(config.indexUrl, courseBase);
    const nextLabel = nextMod ? nextMod.title + ' ->' : 'Back to Course ->';

    el.outerHTML = `
<div class="sidebar-module-nav">
  <a href="${prevHref}" class="sidebar-nav-btn">${prevLabel}</a>
  <a href="${nextHref}" class="sidebar-nav-btn next">${nextLabel}</a>
</div>`.trim();
  }

  /* ---------- LESSON NAV PREV/NEXT BUTTONS ---------- */
  // Lesson pages still define .lesson-nav in HTML but leave hrefs as '#'
  // This patches them with the real prev/next URLs
  function patchLessonNav(prevMod, nextMod, config, courseBase) {
    const prevBtn = document.querySelector('.lesson-nav .nav-btn.previous');
    const nextBtn = document.querySelector('.lesson-nav .nav-btn.next');
    const backBtn = document.querySelector('.lesson-nav .back-to-course');

    if (prevBtn) {
      if (prevMod) {
        prevBtn.href = courseUrl(prevMod.file, courseBase);
        prevBtn.classList.remove('disabled');
        prevBtn.textContent = '<- ' + prevMod.title;
      } else {
        // First module links back to course landing instead of disabling.
        prevBtn.href = courseUrl(config.indexUrl, courseBase);
        prevBtn.classList.remove('disabled');
        prevBtn.textContent = '<- Back to Course';
      }
    }

    if (nextBtn) {
      if (nextMod) {
        nextBtn.href = courseUrl(nextMod.file, courseBase);
      } else {
        nextBtn.href = courseUrl(config.indexUrl, courseBase);
        nextBtn.textContent = 'Back to Course ->';
      }
    }

    if (backBtn) {
      backBtn.href = courseUrl(config.indexUrl, courseBase);
    }
  }

  /* ---------- INIT ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
