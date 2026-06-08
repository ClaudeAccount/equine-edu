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
    if (!config || !modNum) return;

    const modules  = config.modules;
    const current  = modules.find(m => m.num === modNum);
    if (!current) return;

    const prevMod  = modules.find(m => m.num === modNum - 1) || null;
    const nextMod  = modules.find(m => m.num === modNum + 1) || null;

    buildBreadcrumb(config, current);
    buildSidebar(config, modules, modNum);
    buildSidebarNav(prevMod, nextMod, config);
    buildNotes();
    patchLessonNav(prevMod, nextMod, config);
  }

  /* ---------- BREADCRUMB ---------- */
  function buildBreadcrumb(config, current) {
    const el = document.getElementById('course-breadcrumb');
    if (!el) return;
    el.outerHTML = `
<div class="breadcrumb">
  <a href="${config.homeUrl}">Home</a>
  <span>›</span>
  <a href="${config.allCoursesUrl}">All Courses</a>
  <span>›</span>
  <a href="${config.indexUrl}">${config.title}</a>
  <span>›</span>
  <span class="breadcrumb-current">Module ${current.num} — ${current.title}</span>
</div>`.trim();
  }

  /* ---------- SIDEBAR ---------- */
  function buildSidebar(config, modules, currentNum) {
    const el = document.getElementById('course-sidebar');
    if (!el) return;

    const items = modules.map(m => {
      const isActive = m.num === currentNum ? ' active' : '';
      return `
    <li>
      <a href="${m.file}" class="sidebar-module${isActive}">
        <div class="sidebar-num">${m.num}</div>
        <div class="sidebar-module-info">
          <div class="sidebar-module-title">${m.title}</div>
          <div class="sidebar-module-type">${m.type}</div>
        </div>
      </a>
    </li>`.trim();
    }).join('\n');

    el.outerHTML = `
<div class="module-sidebar">
  <div class="module-sidebar-header">
    <h3>${config.title}</h3>
    <a href="${config.indexUrl}">View course →</a>
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
  function buildSidebarNav(prevMod, nextMod, config) {
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

    const prevHref  = prevMod ? prevMod.file : config.indexUrl;
    const prevLabel = prevMod ? '← ' + prevMod.title : '← Back to Course';
    const nextHref  = nextMod ? nextMod.file : config.indexUrl;
    const nextLabel = nextMod ? nextMod.title + ' →' : 'Back to Course →';

    el.outerHTML = `
<div class="sidebar-module-nav">
  <a href="${prevHref}" class="sidebar-nav-btn">${prevLabel}</a>
  <a href="${nextHref}" class="sidebar-nav-btn next">${nextLabel}</a>
</div>`.trim();
  }

  /* ---------- UP NEXT ---------- */
  function buildUpNext(nextMod) {
    const el = document.getElementById('course-upnext');
    if (!el) return;

    if (!nextMod) {
      el.remove();
      return;
    }

    el.outerHTML = `
<div class="whats-next">
  <h3>Up Next</h3>
  <div class="next-lesson-title">${nextMod.title}</div>
  <div class="next-lesson-desc">${nextMod.desc || ''}</div>
  <a href="${nextMod.file}" class="btn-next-full">Start Next Module →</a>
</div>`.trim();
  }

  /* ---------- LESSON NAV PREV/NEXT BUTTONS ---------- */
  // Lesson pages still define .lesson-nav in HTML but leave hrefs as '#'
  // This patches them with the real prev/next URLs
  function patchLessonNav(prevMod, nextMod, config) {
    const prevBtn = document.querySelector('.lesson-nav .nav-btn.previous');
    const nextBtn = document.querySelector('.lesson-nav .nav-btn.next');
    const backBtn = document.querySelector('.lesson-nav .back-to-course');

    if (prevBtn) {
      if (prevMod) {
        prevBtn.href = prevMod.file;
        prevBtn.classList.remove('disabled');
        prevBtn.textContent = '← ' + prevMod.title;
      } else {
        // First module — link back to course landing instead of disabling
        prevBtn.href = config.indexUrl;
        prevBtn.classList.remove('disabled');
        prevBtn.textContent = '← Back to Course';
      }
    }

    if (nextBtn) {
      if (nextMod) {
        nextBtn.href = nextMod.file;
      } else {
        nextBtn.href = config.indexUrl;
        nextBtn.textContent = 'Back to Course →';
      }
    }

    if (backBtn) {
      backBtn.href = config.indexUrl;
    }
  }

  /* ---------- INIT ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
