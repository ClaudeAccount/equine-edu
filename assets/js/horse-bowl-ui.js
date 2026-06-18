/* =============================================================================
   Equine EDU — Horse Bowl UI controller
   Drives the finite state machine (setup -> active -> results) by binding the
   HorseBowl engine services to the DOM. No question data lives here.
   ============================================================================= */
(function () {
  'use strict';

  var HB = window.HorseBowl;
  if (!HB) { console.error('[HorseBowl] engine not loaded'); return; }

  // canonical categories shown in setup (breeds appears even when empty)
  var CANONICAL = ['anatomy', 'tack & equipment', 'colors', 'markings', 'breeds',
    'health', 'safety', 'movement', 'barn management', 'riding basics'];

  var el = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // bank image paths are root-relative ('/courses/...'); the page is at /horse-bowl/
  function imgSrc(p) { return p ? ('..' + p) : ''; }

  function show(stageId) {
    ['hb-setup', 'hb-active', 'hb-results'].forEach(function (s) {
      el(s).classList.toggle('is-active', s === stageId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- setup state --------------------------------------------------------- */
  var setup = { categories: [], count: 10, timed: false, perQuestionSecs: 30, completedOnly: false };
  var counts = {};            // category -> available questions (respects completedOnly)
  var completedIds = [];      // courseIds the learner has completed
  var session = null, timerId = null, secsLeft = 0, startedAt = 0;

  // recompute available counts based on the completed-only toggle
  function refreshCounts() {
    completedIds = HB.Questions.completedCourseIds();
    counts = HB.Questions.categoryCounts(setup.completedOnly ? completedIds : null);
  }

  /* ---- build the setup screen --------------------------------------------- */
  function renderCategories() {
    refreshCounts();
    // drop any previously-selected category that now has no questions
    setup.categories = setup.categories.filter(function (c) { return (counts[c] || 0) > 0; });
    // show canonical first, then any extra categories present in the bank
    var extra = HB.Questions.categories().filter(function (c) { return CANONICAL.indexOf(c) === -1; });
    var list = CANONICAL.concat(extra);
    el('hb-cat-grid').innerHTML = list.map(function (cat) {
      var n = counts[cat] || 0;
      var empty = n === 0 ? ' is-empty' : '';
      var on = setup.categories.indexOf(cat) > -1 && n > 0;
      // Question counts are intentionally NOT shown to learners.
      return '<label class="hb-cat' + empty + (on ? ' is-on' : '') + '" data-cat="' + esc(cat) + '">' +
        '<input type="checkbox" value="' + esc(cat) + '"' + (n === 0 ? ' disabled' : '') + (on ? ' checked' : '') + '>' +
        '<span class="hb-cat-name">' + esc(cat) + '</span></label>';
    }).join('');

    el('hb-cat-grid').querySelectorAll('input').forEach(function (input) {
      input.addEventListener('change', function () {
        input.closest('.hb-cat').classList.toggle('is-on', input.checked);
        syncCategories();
      });
    });
  }

  function syncCategories() {
    var boxes = el('hb-cat-grid').querySelectorAll('input:checked');
    setup.categories = Array.prototype.map.call(boxes, function (b) { return b.value; });
    var allBox = el('hb-allcats-input');
    if (allBox) allBox.checked = setup.categories.length === 0;
    updatePoolNote();
  }

  function totalAvailable() {
    // total questions available under the current toggle (all categories)
    return Object.keys(counts).reduce(function (sum, c) { return sum + (counts[c] || 0); }, 0);
  }

  function updatePoolNote() {
    // pool size is computed for selection logic only — never shown to learners
    var pool = setup.categories.length
      ? setup.categories.reduce(function (sum, c) { return sum + (counts[c] || 0); }, 0)
      : totalAvailable();
    el('hb-pool-note').textContent = '';
    var warn = el('hb-warn');
    if (setup.completedOnly && completedIds.length === 0) {
      warn.textContent = 'You have not completed any courses yet. Finish a course test to unlock this, or turn the toggle off.';
      warn.hidden = false;
    } else if (pool === 0) {
      warn.textContent = 'Pick at least one category to practice.'; warn.hidden = false;
    } else if (pool < setup.count) {
      warn.textContent = 'Your selection is small, so some questions may repeat during the round.'; warn.hidden = false;
    } else { warn.hidden = true; }
    el('hb-start').disabled = pool === 0;
  }

  function updateCompletedSub() {
    var n = HB.Questions.completedCourseCount();
    var total = HB.Questions.courses().length;
    el('hb-completed-sub').textContent = n === 0
      ? 'No completed courses yet — pass a course test to unlock these questions.'
      : 'Draws only from the course' + (n === 1 ? '' : 's') + ' you have completed.';
  }

  function bindChoices(groupId, key, parse) {
    el(groupId).querySelectorAll('.hb-choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        el(groupId).querySelectorAll('.hb-choice').forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        setup[key] = parse(btn.dataset.val);
        if (key === 'count') updatePoolNote();
        if (key === 'timed') el('hb-timer-detail').hidden = !setup.timed;
      });
    });
  }

  /* ---- active practice ----------------------------------------------------- */
  function startSession() {
    session = new HB.Session({
      categories: setup.categories,
      courseIds: setup.completedOnly ? completedIds : [],
      count: setup.count,
      timed: setup.timed,
      perQuestionSecs: setup.perQuestionSecs
    });
    session.build();
    if (!session.questions.length) { updatePoolNote(); return; }
    startedAt = Date.now();
    show('hb-active');
    renderQuestion();
  }

  function renderQuestion() {
    var q = session.current();
    var p = session.progress();
    el('hb-progress-text').textContent = 'Question ' + p.number + ' of ' + p.total;
    el('hb-qtag').textContent = q.category;
    el('hb-progress-fill').style.width = ((p.number - 1) / p.total * 100) + '%';
    el('hb-question').textContent = q.question;
    if (q.image) {
      el('hb-media-img').src = imgSrc(q.image);
      el('hb-media-img').alt = 'Photo for this question';
      el('hb-media').hidden = false;
      el('hb-qa-row').classList.add('has-image');
    } else {
      el('hb-media').hidden = true;
      el('hb-media-img').removeAttribute('src');
      el('hb-qa-row').classList.remove('has-image');
    }
    el('hb-feedback').className = 'hb-feedback';
    el('hb-next').disabled = true;
    el('hb-next').textContent = session.isLast() ? 'See Results' : 'Next Question';

    el('hb-options').innerHTML = HB.shuffle(q.options).map(function (opt) {
      return '<button type="button" class="hb-option" data-val="' + esc(opt) + '">' + esc(opt) + '</button>';
    }).join('');
    el('hb-options').querySelectorAll('.hb-option').forEach(function (b) {
      b.addEventListener('click', function () { selectAnswer(b.dataset.val); });
    });

    if (setup.timed) startTimer();
  }

  function selectAnswer(value) {
    if (el('hb-options').dataset.locked === '1') return;
    el('hb-options').dataset.locked = '1';
    stopTimer();
    var evals = session.answer(value);

    el('hb-options').querySelectorAll('.hb-option').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.val === String(evals.correctAnswer)) b.classList.add('is-correct');
      else if (b.dataset.val === String(value)) b.classList.add('is-wrong');
    });

    var fb = el('hb-feedback');
    fb.className = 'hb-feedback show ' + (evals.correct ? 'correct' : 'incorrect');
    if (evals.correct) {
      fb.innerHTML = '<h4>Correct</h4><p>' + esc(evals.explanation) + '</p>';
    } else {
      var q = session.current();
      fb.innerHTML = '<h4>Not quite</h4>' +
        '<p class="why-wrong">' + esc(q.explanationIncorrect) + '</p>' +
        '<p class="why-right">The correct answer is "' + esc(q.correctAnswer) + '."</p>';
    }
    el('hb-next').disabled = false;
  }

  function advance() {
    el('hb-options').dataset.locked = '';
    if (session.next()) renderQuestion();
    else finish();
  }

  /* ---- timer --------------------------------------------------------------- */
  function startTimer() {
    secsLeft = setup.perQuestionSecs;
    paintTimer();
    el('hb-timer').style.display = '';
    timerId = setInterval(function () {
      secsLeft--;
      paintTimer();
      if (secsLeft <= 0) { stopTimer(); autoMiss(); }
    }, 1000);
  }
  function paintTimer() {
    var t = el('hb-timer');
    t.textContent = secsLeft + 's';
    t.classList.toggle('is-low', secsLeft <= 5);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function autoMiss() {
    // time out = recorded as unanswered/incorrect, reveal correct answer
    if (el('hb-options').dataset.locked === '1') return;
    el('hb-options').dataset.locked = '1';
    var q = session.current();
    session.responses[session.index] = { questionId: q.id, selected: null, correct: false };
    el('hb-options').querySelectorAll('.hb-option').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.val === String(q.correctAnswer)) b.classList.add('is-correct');
    });
    var fb = el('hb-feedback');
    fb.className = 'hb-feedback show incorrect';
    fb.innerHTML = '<h4>Time’s up</h4><p class="why-right">The correct answer is "' +
      esc(q.correctAnswer) + '." ' + esc(q.explanationCorrect) + '</p>';
    el('hb-next').disabled = false;
  }

  /* ---- results + review ---------------------------------------------------- */
  function finish() {
    stopTimer();
    el('hb-timer').style.display = 'none';
    var res = session.results();
    var durationSecs = Math.round((Date.now() - startedAt) / 1000);

    el('hb-score-ring').innerHTML = res.score + '/' + res.total +
      ' <span class="hb-score-pct">(' + res.percentage + '%)</span>';
    el('hb-score-sub').textContent = res.repeated
      ? 'Some questions repeated because the selected pool was small.'
      : scoreMessage(res.percentage);

    // strengths / weaknesses
    el('hb-strengths').innerHTML = res.strengths.length
      ? res.strengths.map(function (c) { return '<span class="hb-pill">' + esc(c.category) + ' · ' + Math.round(c.accuracy * 100) + '%</span>'; }).join('')
      : '<span class="hb-rv-label">Keep practicing to build strengths.</span>';
    el('hb-weaknesses').innerHTML = res.weaknesses.length
      ? res.weaknesses.map(function (c) { return '<span class="hb-pill">' + esc(c.category) + ' · ' + Math.round(c.accuracy * 100) + '%</span>'; }).join('')
      : '<span class="hb-rv-label">No weak areas this round — nice work.</span>';

    // per-category breakdown bars
    el('hb-breakdown').innerHTML = res.categoryBreakdown.map(function (c) {
      var pct = Math.round(c.accuracy * 100);
      var cls = c.accuracy >= 0.8 ? 'hi' : (c.accuracy < 0.7 ? 'lo' : '');
      return '<div class="hb-bd-row"><span class="hb-bd-name">' + esc(c.category) + '</span>' +
        '<span class="hb-bd-track"><span class="hb-bd-fill ' + cls + '" style="width:' + pct + '%"></span></span>' +
        '<span class="hb-bd-val">' + c.correct + '/' + c.total + '</span></div>';
    }).join('');

    // full review
    el('hb-review').innerHTML = res.review.map(function (r, i) {
      var yours = r.userAnswer == null ? '<em>No answer</em>' : esc(r.userAnswer);
      var expl = r.isCorrect
        ? '<p class="why-right">' + esc(r.explanationCorrect) + '</p>'
        : '<p class="why-wrong">' + esc(r.explanationIncorrect) + '</p>' +
          '<p class="why-right">The correct answer is "' + esc(r.correctAnswer) + '." ' + esc(r.explanationCorrect) + '</p>';
      var media = r.image ? '<div class="hb-rv-media"><img src="' + esc(imgSrc(r.image)) + '" alt=""></div>' : '';
      var body = '<div class="hb-rv-main">' +
        '<div class="hb-rv-q">' + (i + 1) + '. ' + esc(r.question) + '</div>' +
        '<p class="hb-rv-line"><span class="hb-rv-label">Your answer:</span> ' +
          '<span class="hb-rv-yours ' + (r.isCorrect ? 'ok' : 'no') + '">' + yours + '</span></p>' +
        (r.isCorrect ? '' : '<p class="hb-rv-line"><span class="hb-rv-label">Correct answer:</span> ' +
          '<span class="hb-rv-correct">' + esc(r.correctAnswer) + '</span></p>') +
        '<div class="hb-rv-expl">' + expl + '</div></div>';
      return '<div class="hb-review-item ' + (r.isCorrect ? 'ok' : 'no') + (r.image ? ' has-image' : '') + '">' +
        body + media + '</div>';
    }).join('');

    show('hb-results');
    session.save(durationSecs);
  }

  function scoreMessage(pct) {
    if (pct >= 90) return 'Excellent recall. You have a strong command of this material.';
    if (pct >= 75) return 'Good work. Review the misses below and run another round.';
    if (pct >= 60) return 'Getting there. The review below shows exactly what to revisit.';
    return 'Keep practicing. Read each explanation below, then try again.';
  }

  /* ---- setup wizard navigation -------------------------------------------- */
  var currentStep = 1;
  var STEP_COUNT = 3;

  var decoPool = [];
  function buildDecoPool() {
    decoPool = [];
    // uniform course-card + index-hero art, collected into the bank by the generator
    var bank = window.HORSE_BOWL_BANK;
    if (bank && Array.isArray(bank.decoImages) && bank.decoImages.length) {
      decoPool = bank.decoImages.slice();
      return;
    }
    // fallback: question images, if deco list is unavailable
    var seen = {};
    HB.Questions.all().forEach(function (q) {
      if (q.image && !seen[q.image]) { seen[q.image] = true; decoPool.push(q.image); }
    });
  }
  var lastDeco = null;
  function swapDeco() {
    var img = el('hb-deco');
    if (!img || !decoPool.length) { if (img) img.hidden = true; return; }
    var pick = decoPool[Math.floor(Math.random() * decoPool.length)];
    var guard = 0;
    while (pick === lastDeco && decoPool.length > 1 && guard++ < 8) {
      pick = decoPool[Math.floor(Math.random() * decoPool.length)];
    }
    lastDeco = pick;
    img.src = imgSrc(pick);
    img.hidden = false;
    img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap');
  }

  function gotoStep(n) {
    n = Math.max(1, Math.min(STEP_COUNT, n));
    currentStep = n;
    document.querySelectorAll('#hb-setup .hb-step').forEach(function (stp) {
      var on = Number(stp.getAttribute('data-step')) === n;
      stp.classList.toggle('is-active', on);
      if (on) stp.removeAttribute('hidden'); else stp.setAttribute('hidden', '');
    });
    document.querySelectorAll('#hb-steps li').forEach(function (li) {
      var sn = Number(li.getAttribute('data-step'));
      li.classList.toggle('is-current', sn === n);
      li.classList.toggle('is-done', sn < n);
    });
    if (n === 3) updatePoolNote();   // refresh Start button + any warning
    swapDeco();                      // fresh decorative image each step
  }

  /* ---- end the quiz early -------------------------------------------------- */
  function endEarly() {
    var answered = session ? session.responses.filter(function (r) { return r; }).length : 0;
    if (!answered) {
      if (!window.confirm('End the round? You have not answered any questions yet, so this will take you back to setup.')) return;
      stopTimer();
      el('hb-timer').style.display = 'none';
      el('hb-options').dataset.locked = '';
      show('hb-setup');
      gotoStep(1);
      return;
    }
    if (!window.confirm('End the round now? You will jump to your results and see the answer explanations for the ' +
      answered + ' question' + (answered === 1 ? '' : 's') + ' you have answered.')) return;
    // keep only the questions actually answered, then show results + review
    session.questions = session.questions.slice(0, answered);
    session.responses = session.responses.slice(0, answered);
    finish();
  }

  /* ---- wire up ------------------------------------------------------------- */
  function init() {
    renderCategories();
    syncCategories();
    bindChoices('hb-count-group', 'count', function (v) { return parseInt(v, 10); });
    bindChoices('hb-timer-group', 'timed', function (v) { return v === 'timed'; });
    bindChoices('hb-secs-group', 'perQuestionSecs', function (v) { return parseInt(v, 10); });

    updateCompletedSub();
    el('hb-completed-input').addEventListener('change', function () {
      setup.completedOnly = this.checked;
      renderCategories();
      syncCategories();
      updateCompletedSub();
    });

    el('hb-allcats-input').addEventListener('change', function () {
      if (this.checked) {
        el('hb-cat-grid').querySelectorAll('input:checked').forEach(function (b) {
          b.checked = false; b.closest('.hb-cat').classList.remove('is-on');
        });
      }
      syncCategories();
    });

    el('hb-start').addEventListener('click', startSession);
    el('hb-next').addEventListener('click', advance);
    el('hb-end-early').addEventListener('click', endEarly);
    el('hb-again').addEventListener('click', function () { show('hb-setup'); gotoStep(1); });
    el('hb-retake').addEventListener('click', startSession);

    // wizard: Continue / Go back / step-dot clicks
    document.querySelectorAll('#hb-setup [data-next]').forEach(function (b) {
      b.addEventListener('click', function () { gotoStep(currentStep + 1); });
    });
    document.querySelectorAll('#hb-setup [data-back]').forEach(function (b) {
      b.addEventListener('click', function () { gotoStep(currentStep - 1); });
    });
    document.querySelectorAll('#hb-steps li').forEach(function (li) {
      li.addEventListener('click', function () {
        var sn = Number(li.getAttribute('data-step'));
        if (sn < currentStep) gotoStep(sn);   // only jump back to completed steps
      });
    });
    gotoStep(1);

    buildDecoPool();
    swapDeco();
    el('hb-loading').style.display = 'none';
    el('hb-setup').classList.add('is-active');
  }

  HB.Questions.load().then(init).catch(function (e) {
    console.error('[HorseBowl] failed to load bank', e);
    el('hb-loading').textContent = 'Could not load the question bank. Please refresh.';
  });
})();
