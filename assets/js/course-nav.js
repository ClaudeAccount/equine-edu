/* =============================================================================
   Equine Edu — course-nav.js
   Builds the sidebar module list, breadcrumb, and "Up Next" panel on lesson pages.
   Reads from window.COURSE_CONFIG (defined in each course's course-config.js)
   and window.CURRENT_MODULE (1-indexed, set inline on each lesson page).

   PROGRESS — SINGLE SOURCE OF TRUTH:
     Course progress lives ONLY in Supabase, in the `enrollments` table
     (columns: completed_modules jsonb, progress_percent). There is no
     localStorage progress anymore. On each lesson visit this script:
       1. loads the user's completed_modules for the course (best-effort), then
       2. renders the sidebar / landing progress from that data, then
       3. upserts the current module into enrollments (best-effort).
     If the user is signed out or Supabase is unreachable, the nav still renders
     fully (just with no completion marks) — progress is simply not tracked for
     anonymous users. Nothing here ever throws or blocks the page.

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

  /* Completion keys for the current course, loaded from Supabase enrollments.
     Starts empty so isModuleComplete() is always safe to call, even before
     (or without) a successful load. */
  var _completed = new Set();

  function init() {
    var config = window.COURSE_CONFIG;
    if (!config) return;
    // Load progress from Supabase first (best-effort), then render once.
    loadProgress(config.id).then(function () { render(config); },
                                 function () { render(config); });
  }

  function render(config) {
    var modNum = window.CURRENT_MODULE;

    // Landing pages have a module list but no CURRENT_MODULE — show course progress there.
    if (!modNum) {
      if (document.getElementById('course-module-list')) {
        buildLandingProgress(config, getCourseBasePath());
      }
      return;
    }

    var modules  = config.modules;
    var current  = modules.find(function (m) { return m.num === modNum; });
    if (!current) return;

    // Course completion is defined as PASSING Test Your Knowledge (>=80%),
    // recorded by quiz-standard.js. Visiting the quiz page must NOT mark it
    // complete, so the quiz module is excluded from visit-based completion.
    var fileKey = fileKeyCamel(current.file);
    var isQuizModule = (current.type && /quiz/i.test(current.type)) || fileKey === 'testYourKnowledge';
    if (!isQuizModule) _completed.add(fileKey);

    var prevMod  = modules.find(function (m) { return m.num === modNum - 1; }) || null;
    var nextMod  = modules.find(function (m) { return m.num === modNum + 1; }) || null;

    var courseBase = getCourseBasePath();
    buildBreadcrumb(config, current, courseBase);
    buildSidebar(config, modules, modNum, courseBase);
    buildSidebarNav(prevMod, nextMod, config, courseBase);
    buildNotes();
    patchLessonNav(prevMod, nextMod, config, courseBase);

    // Persist this visit to enrollments (best-effort, never blocks). The quiz
    // module is never auto-completed on visit (pass null).
    recordVisit(config, isQuizModule ? null : fileKey);
  }

  function getCourseBasePath() {
    var scripts = Array.from(document.scripts || []);
    var configScript = scripts.find(function (script) {
      return /(?:^|\/)course-config\.js(?:\?.*)?$/.test(script.getAttribute('src') || '');
    });
    if (!configScript) return '';
    return (configScript.getAttribute('src') || '').replace(/course-config\.js(?:\?.*)?$/, '');
  }

  function courseUrl(file, courseBase) {
    if (!file || /^(?:[a-z]+:|#|\/)/i.test(file)) return file;
    return (courseBase || '') + file;
  }

  /* ---------- SUPABASE PROGRESS (single source of truth) ----------
     enrollments.completed_modules holds a JSON array of module keys derived
     from each module's file name ('4-viewing-room.html' → 'viewingRoom').
     progress_percent is derived from how many of the course's modules are
     complete. All calls are best-effort and resolve even on failure. */

  function sbClient() {
    return (window.EEAuth && typeof window.EEAuth.client === 'function')
      ? window.EEAuth.client()
      : null;
  }

  function loadProgress(courseId) {
    return new Promise(function (resolve) {
      try {
        if (!courseId || !window.EEAuth || typeof window.EEAuth.getUser !== 'function') {
          resolve(); return;
        }
        window.EEAuth.getUser().then(function (user) {
          var client = sbClient();
          if (!user || !client) { resolve(); return; }
          client.from('enrollments')
            .select('completed_modules')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle()
            .then(function (res) {
              var arr = res && res.data && res.data.completed_modules;
              if (Array.isArray(arr)) arr.forEach(function (k) { _completed.add(k); });
              resolve();
            }, function () { resolve(); });
        }, function () { resolve(); });
      } catch (e) { resolve(); }
    });
  }

  function persist(config) {
    return new Promise(function (resolve) {
      try {
        if (!config || !window.EEAuth || typeof window.EEAuth.getUser !== 'function') { resolve(); return; }
        window.EEAuth.getUser().then(function (user) {
          var client = sbClient();
          if (!user || !client) { resolve(); return; }
          var modules = config.modules || [];
          var total = modules.length || 1;
          var done = modules.filter(function (m) { return isModuleComplete(config, m); }).length;
          var percent = Math.round((done / total) * 100);
          client.from('enrollments')
            .upsert({
              user_id:           user.id,
              course_id:         config.id,
              completed_modules: Array.from(_completed),
              progress_percent:  percent,
              last_accessed:     new Date().toISOString()
            }, { onConflict: 'user_id,course_id' })
            .then(function () { resolve(); }, function () { resolve(); });
        }, function () { resolve(); });
      } catch (e) { resolve(); }
    });
  }

  // Records a lesson visit. moduleKey may be null (the quiz page must not be
  // auto-completed). Best-effort; never blocks the page.
  function recordVisit(config, moduleKey) {
    if (moduleKey) _completed.add(moduleKey);
    persist(config);
  }

  /* Shared progress API for other scripts (e.g. quiz-standard.js).
     EEProgress.markComplete('testYourKnowledge') records course completion
     (a passed test) to Supabase enrollments — the single source of truth. */
  window.EEProgress = {
    markComplete: function (moduleKey) {
      var config = window.COURSE_CONFIG;
      if (!config || !moduleKey) return Promise.resolve();
      _completed.add(moduleKey);
      return persist(config);
    },
    isComplete: function (moduleKey) { return _completed.has(moduleKey); }
  };

  /* ---------- PROGRESS HELPERS ----------
     The CANONICAL module key is derived from the module's file name
     ('4-viewing-room.html' → 'viewingRoom'). For backward compatibility,
     completion also matches the title-derived key and its leading-'The'
     stripped variant ('The Viewing Room' → 'theViewingRoom' / 'viewingRoom'). */
  function toCamel(str) {
    var words = String(str || '').replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/);
    return words.map(function (w, i) {
      if (!w) return '';
      return i === 0
        ? w.charAt(0).toLowerCase() + w.slice(1)
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join('');
  }

  function fileKeyCamel(file) {
    // '4-viewing-room.html' → 'viewingRoom'
    var base = String(file || '')
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
    var cands = [];
    var fk = fileKeyCamel(m.file);
    if (fk) cands.push(fk);
    var tk = toCamel(m.title);
    if (tk && cands.indexOf(tk) === -1) cands.push(tk);
    if (/^the[A-Z]/.test(tk)) {
      var stripped = tk.charAt(3).toLowerCase() + tk.slice(4);
      if (cands.indexOf(stripped) === -1) cands.push(stripped);
    }
    return cands;
  }

  function isModuleComplete(config, m) {
    return moduleKeyCandidates(m).some(function (k) { return _completed.has(k); });
  }

  /* ---------- LANDING PAGE PROGRESS ---------- */
  function buildLandingProgress(config, courseBase) {
    var modules = (config.modules || []);
    if (!modules.length) return;
    var list = document.getElementById('course-module-list');
    if (!list) return;

    var complete = 0;
    modules.forEach(function (m) { if (isModuleComplete(config, m)) complete++; });
    var total = modules.length;
    var pct = total ? Math.round((complete / total) * 100) : 0;
    var done = complete >= total && total > 0;

    // mark completed module items already rendered by the page's own script
    var items = list.querySelectorAll('.module-item');
    modules.forEach(function (m, i) {
      if (isModuleComplete(config, m) && items[i]) {
        items[i].classList.add('is-complete');
        var num = items[i].querySelector('.module-num');
        if (num) num.innerHTML = '&#10003;';
      }
    });

    // build the bar once, just above the module list
    if (document.getElementById('course-progress')) return;
    var wrap = document.createElement('div');
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
    var el = document.getElementById('course-breadcrumb');
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
    var el = document.getElementById('course-sidebar');
    if (!el) return;

    var completeCount = 0;
    var items = modules.map(function (m) {
      var isActive = m.num === currentNum ? ' active' : '';
      var complete = isModuleComplete(config, m);
      if (complete) completeCount++;
      var completeClass = complete ? ' is-complete' : '';
      var numContent = complete ? '&#10003;' : m.num;
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

    var total = modules.length;
    var pct = total ? Math.round((completeCount / total) * 100) : 0;

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
    var el = document.getElementById('course-notes');
    var notes = window.PAGE_NOTES;
    if (!el || !notes) return;

    var items = (notes.items || []).map(function (n) { return `<li>${n}</li>`; }).join('\n        ');
    var highlight = notes.highlight
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
    var el = document.getElementById('course-sidebar-nav');
    if (!el) return;

    var layout = window.LAYOUT || {};
    var cta = layout.navCta || null;
    var path = window.location.pathname.toLowerCase();
    var isTrainingBarnActivity =
      cta &&
      /back to training barn/i.test(cta.label || '') &&
      /(games?|downloads?)/.test(path);
    var isLearningLoftActivity =
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

    var prevHref  = prevMod ? courseUrl(prevMod.file, courseBase) : courseUrl(config.indexUrl, courseBase);
    var prevLabel = prevMod ? '<- ' + prevMod.title : '<- Back to Course';
    var nextHref  = nextMod ? courseUrl(nextMod.file, courseBase) : courseUrl(config.indexUrl, courseBase);
    var nextLabel = nextMod ? nextMod.title + ' ->' : 'Back to Course ->';

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
    var prevBtn = document.querySelector('.lesson-nav .nav-btn.previous');
    var nextBtn = document.querySelector('.lesson-nav .nav-btn.next');
    var backBtn = document.querySelector('.lesson-nav .back-to-course');

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
