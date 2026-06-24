/* =============================================================================
   Equine Edu — ee-games.js
   Reusable game engine for Training Barn / Learning Loft activities.

   One engine drives eight game types. Every course game page is thin: it links
   game.css + this file, defines a data object, and calls EEGames.mount(config).
   Adding a game to a new course = a new HTML shell + a data object. No new JS.

   Game types:
     recall    — timed multiple-choice recall (the Horse Bowl mechanic), streaks
     match     — match term -> definition (select per definition row)
     memory    — concentration: flip cards to find matching pairs
     label     — click the named part on a course image (anchor coordinates)
     sort      — place each item into the correct category bucket
     order     — put the steps of a procedure in the right sequence
     slider    — drag a slider to the correct value within a tolerance band
     truefalse — judge a statement / image as correct vs incorrect handling

   All visual styling lives in assets/css/game.css (section 17). This file only
   builds DOM and wires behaviour.
   ============================================================================= */
(function (global) {
  'use strict';

  /* ---- small helpers ------------------------------------------------------ */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, Math.min(n, arr.length)); }
  function resolveEl(elOrSel) {
    return typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel;
  }
  function make(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Course progress (including Training Barn completion) is recorded to Supabase
  // enrollments by course-nav.js when the module page is visited. These helpers
  // no longer write progression or scores to localStorage — Supabase is the
  // single source of truth. Kept as no-ops so existing call sites stay valid.
  function saveProgress(key) { /* no-op: Training Barn completion persists to enrollments via course-nav.js */ }
  function saveBest(key, pct) { /* no-op: best-score was non-progression UI state with no reader; removed */ }

  /* ---- shared chrome ------------------------------------------------------ */
  // Builds the standard game-shell skeleton and returns references.
  function buildShell(opts) {
    var shell = make('div', 'game-shell');

    var header = make('div', 'game-progress-bar-wrap');
    var progLabel = make('span', 'game-progress-label', opts.progressText || '');
    var track = make('div', 'game-progress-track');
    var fill = make('div', 'game-progress-fill'); fill.style.width = '0%';
    track.appendChild(fill);
    var scoreLabel = make('span', 'game-score-label', '0 / 0');
    header.appendChild(progLabel);
    header.appendChild(track);
    header.appendChild(scoreLabel);
    var streak = null;
    if (opts.streak) {
      streak = make('span', 'ee-streak',
        '<span class="ee-streak-flame">◆</span><span class="ee-streak-n">0</span>');
      header.appendChild(streak);
    }

    var play = make('div', 'game-play-area');
    var feedback = make('div', 'feedback-banner');
    var nextWrap = make('div', 'game-next-wrap');
    var nextBtn = make('button', 'game-next-btn', opts.nextText || 'Next');
    nextWrap.appendChild(nextBtn);

    var score = make('div', 'score-screen');

    shell.appendChild(header);
    shell.appendChild(play);
    shell.appendChild(feedback);
    shell.appendChild(nextWrap);
    shell.appendChild(score);

    return {
      shell: shell, header: header, progLabel: progLabel, fill: fill,
      scoreLabel: scoreLabel, streak: streak, play: play,
      feedback: feedback, nextWrap: nextWrap, nextBtn: nextBtn, score: score
    };
  }

  function setFeedback(node, ok, msg) {
    node.className = 'feedback-banner show ' + (ok ? 'correct-fb' : 'wrong-fb');
    node.innerHTML = msg;
  }
  function clearFeedback(node) { node.className = 'feedback-banner'; node.innerHTML = ''; }

  function setStreak(ref, n) {
    if (!ref.streak) return;
    ref.streak.querySelector('.ee-streak-n').textContent = n;
    ref.streak.classList.toggle('is-hot', n >= 3);
  }

  function ratingMessage(pct) {
    if (pct >= 90) return ['Excellent work', 'Strong recall across the board. This material is well learned.'];
    if (pct >= 70) return ['Nicely done', 'A solid result. Review the few that were missed and try again to lock it in.'];
    if (pct >= 50) return ['Good start', 'The basics are forming. Another round or two will build confidence.'];
    return ['Keep practicing', 'Repetition is how this sticks. Revisit the lesson, then play again.'];
  }

  // Shows the end screen with score ring + Play Again + optional Back button.
  function showScore(ref, correct, total, cfg, replayFn) {
    var pct = total ? Math.round((correct / total) * 100) : 0;
    saveProgress(cfg.progressKey);
    saveBest(cfg.progressKey, pct);
    var rm = ratingMessage(pct);
    ref.play.classList.add('hidden');
    ref.header.style.display = 'none';
    clearFeedback(ref.feedback);
    ref.nextWrap.className = 'game-next-wrap';
    ref.score.innerHTML = '';
    var ring = make('div', 'score-ring',
      '<span class="score-num">' + correct + '</span><span class="score-denom">/ ' + total + '</span>');
    ref.score.appendChild(ring);
    ref.score.appendChild(make('div', 'score-title', rm[0]));
    ref.score.appendChild(make('div', 'score-msg', rm[1]));
    var actions = make('div', 'score-actions');
    var again = make('button', 'score-btn primary', 'Play Again');
    again.addEventListener('click', function () {
      ref.score.className = 'score-screen';
      ref.play.classList.remove('hidden');
      ref.header.style.display = '';
      replayFn();
    });
    actions.appendChild(again);
    if (cfg.backUrl) {
      var back = document.createElement('a');
      back.className = 'score-btn secondary';
      back.href = cfg.backUrl;
      back.textContent = cfg.backLabel || 'Back to Training Barn';
      actions.appendChild(back);
    }
    ref.score.appendChild(actions);
    ref.score.classList.add('show');
  }

  /* =========================================================================
     TYPE: recall — timed multiple-choice (Horse Bowl mechanic)
     data: { questions: [{ p, a, o:[...], explain? }] }
     ========================================================================= */
  function mountRecall(ref, cfg) {
    var rounds = cfg.rounds || 10;
    var perQ = cfg.seconds || 0; // 0 = untimed
    var bank = cfg.data.questions;
    var active, idx, score, streak, timer, timeLeft;

    var qArea = make('div', 'game-question-area');
    var prompt = make('div', 'game-prompt', '');
    var qText = make('div', '', '');
    qText.style.fontSize = '1.05rem';
    qText.style.fontWeight = '700';
    qText.style.color = 'var(--heading)';
    qText.style.lineHeight = '1.4';
    qArea.appendChild(prompt);
    qArea.appendChild(qText);
    var grid = make('div', 'answer-grid');
    ref.play.appendChild(qArea);
    ref.play.appendChild(grid);

    function start() {
      active = sample(bank, rounds);
      idx = 0; score = 0; streak = 0;
      setStreak(ref, 0);
      render();
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function render() {
      stopTimer();
      var q = active[idx];
      ref.progLabel.textContent = 'Question ' + (idx + 1) + ' of ' + active.length;
      ref.fill.style.width = ((idx) / active.length * 100) + '%';
      ref.scoreLabel.textContent = score + ' / ' + idx;
      prompt.textContent = perQ ? 'Quick recall' : 'Choose the best answer';
      qText.textContent = q.p;
      grid.innerHTML = '';
      clearFeedback(ref.feedback);
      ref.nextWrap.className = 'game-next-wrap';
      shuffle(q.o).forEach(function (opt) {
        var b = make('button', 'answer-btn', opt);
        b.addEventListener('click', function () { choose(opt, b); });
        grid.appendChild(b);
      });
      if (perQ) {
        timeLeft = perQ;
        prompt.textContent = 'Quick recall — ' + timeLeft + 's';
        timer = setInterval(function () {
          timeLeft--;
          prompt.textContent = 'Quick recall — ' + timeLeft + 's';
          if (timeLeft <= 0) { stopTimer(); choose(null, null); }
        }, 1000);
      }
    }
    function choose(opt, btn) {
      stopTimer();
      var q = active[idx];
      var ok = opt === q.a;
      Array.prototype.forEach.call(grid.children, function (b) {
        b.disabled = true;
        if (b.textContent === q.a) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
      });
      if (ok) { score++; streak++; } else { streak = 0; }
      setStreak(ref, streak);
      ref.scoreLabel.textContent = score + ' / ' + (idx + 1);
      var msg = ok
        ? (streak >= 3 ? 'Correct — ' + streak + ' in a row.' : 'Correct.')
        : (opt == null ? 'Time’s up. The answer is ' + q.a + '.' : 'Not quite. The answer is ' + q.a + '.');
      if (q.explain) msg += ' ' + q.explain;
      setFeedback(ref.feedback, ok, msg);
      ref.nextWrap.className = 'game-next-wrap show';
      ref.nextBtn.textContent = (idx + 1 >= active.length) ? 'See Results' : 'Next';
    }
    ref.nextBtn.addEventListener('click', function () {
      idx++;
      if (idx >= active.length) {
        ref.fill.style.width = '100%';
        showScore(ref, score, active.length, cfg, start);
      } else render();
    });
    start();
  }

  /* =========================================================================
     TYPE: match — term -> definition via per-row select
     data: { pairs: [[term, definition], ...] }
     ========================================================================= */
  function mountMatch(ref, cfg) {
    var rounds = cfg.rounds || 6;
    var rows = make('div', 'ee-match-rows');
    ref.play.appendChild(rows);
    ref.header.querySelector('.game-progress-track').style.visibility = 'hidden';

    var actions = make('div', 'actions');
    var check = make('button', 'primary', 'Check Answers');
    var redo = make('button', null, 'New Set');
    actions.appendChild(check); actions.appendChild(redo);
    ref.play.appendChild(actions);

    var active;
    function start() {
      ref.score.className = 'score-screen';
      ref.play.classList.remove('hidden');
      ref.header.style.display = '';
      clearFeedback(ref.feedback);
      active = sample(cfg.data.pairs, rounds);
      var terms = shuffle(active.map(function (p) { return p[0]; }));
      ref.progLabel.textContent = 'Match ' + active.length + ' terms';
      ref.scoreLabel.textContent = '0 / ' + active.length;
      rows.innerHTML = '';
      active.forEach(function (p) {
        var row = make('div', 'ee-match-row');
        row.appendChild(make('div', 'ee-match-def', p[1]));
        var sel = document.createElement('select');
        sel.className = 'select';
        sel.setAttribute('data-answer', p[0]);
        sel.innerHTML = '<option value="">Choose a term</option>' +
          terms.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
        row.appendChild(sel);
        rows.appendChild(row);
      });
    }
    check.addEventListener('click', function () {
      var score = 0;
      var sels = rows.querySelectorAll('select');
      Array.prototype.forEach.call(sels, function (s) {
        var row = s.closest('.ee-match-row');
        row.classList.remove('correct', 'wrong');
        if (s.value === s.getAttribute('data-answer')) { score++; row.classList.add('correct'); }
        else row.classList.add('wrong');
      });
      ref.scoreLabel.textContent = score + ' / ' + sels.length;
      var ok = score === sels.length;
      setFeedback(ref.feedback, ok,
        ok ? 'All matched correctly.' : score + ' of ' + sels.length + ' correct. Fix the highlighted rows and check again.');
      if (ok) { saveProgress(cfg.progressKey); saveBest(cfg.progressKey, 100); }
    });
    redo.addEventListener('click', start);
    start();
  }

  /* =========================================================================
     TYPE: memory — concentration pairs
     data: { pairs: [[faceA, faceB], ...] }  (a clue and its answer)
     ========================================================================= */
  function mountMemory(ref, cfg) {
    var rounds = cfg.rounds || 6;
    ref.header.querySelector('.game-progress-track').style.visibility = 'hidden';
    var grid = make('div', 'ee-mem-grid');
    ref.play.appendChild(grid);
    var actions = make('div', 'actions');
    var redo = make('button', 'primary', 'New Board');
    actions.appendChild(redo);
    ref.play.appendChild(actions);

    var first, lock, matched, moves;
    function start() {
      ref.score.className = 'score-screen';
      ref.play.classList.remove('hidden');
      ref.header.style.display = '';
      clearFeedback(ref.feedback);
      first = null; lock = false; matched = 0; moves = 0;
      var pairs = sample(cfg.data.pairs, rounds);
      ref.progLabel.textContent = 'Find ' + pairs.length + ' pairs';
      ref.scoreLabel.textContent = '0 pairs';
      var cards = [];
      pairs.forEach(function (p, i) {
        cards.push({ pid: i, text: p[0] });
        cards.push({ pid: i, text: p[1] });
      });
      cards = shuffle(cards);
      grid.innerHTML = '';
      cards.forEach(function (c) {
        var card = make('button', 'ee-mem-card');
        card.setAttribute('data-pid', c.pid);
        card.innerHTML =
          '<div class="ee-mem-inner">' +
            '<div class="ee-mem-face ee-mem-front">?</div>' +
            '<div class="ee-mem-face ee-mem-back">' + c.text + '</div>' +
          '</div>';
        card.addEventListener('click', function () { flip(card); });
        grid.appendChild(card);
      });
      var totalPairs = pairs.length;
      grid.setAttribute('data-total', totalPairs);
    }
    function flip(card) {
      if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      if (!first) { first = card; return; }
      moves++;
      if (first.getAttribute('data-pid') === card.getAttribute('data-pid')) {
        first.classList.add('matched'); card.classList.add('matched');
        first = null; matched++;
        ref.scoreLabel.textContent = matched + ' pairs';
        var total = parseInt(grid.getAttribute('data-total'), 10);
        ref.fill.style.width = (matched / total * 100) + '%';
        if (matched === total) {
          setFeedback(ref.feedback, true, 'Board cleared in ' + moves + ' moves.');
          saveProgress(cfg.progressKey); saveBest(cfg.progressKey, 100);
        }
      } else {
        lock = true;
        var a = first, b = card;
        setTimeout(function () {
          a.classList.remove('flipped'); b.classList.remove('flipped');
          first = null; lock = false;
        }, 750);
      }
    }
    redo.addEventListener('click', start);
    start();
  }

  /* =========================================================================
     TYPE: label — click the named part on a course image
     data EITHER: { image, alt, parts: [{ text, ax, ay }] }
            OR  : { views: [{ image, alt, parts:[{text, ax, ay}] }] }
     ax/ay are % coordinates relative to the image. Multiple views let one game
     cover, e.g., the front and back of the horse on their own diagrams.
     ========================================================================= */
  function mountLabel(ref, cfg) {
    // Flatten to a single list where each part carries its own image.
    var allParts = [];
    if (cfg.data.views) {
      cfg.data.views.forEach(function (v) {
        v.parts.forEach(function (p) {
          allParts.push({ text: p.text, ax: p.ax, ay: p.ay, image: v.image, alt: v.alt || '' });
        });
      });
    } else {
      cfg.data.parts.forEach(function (p) {
        allParts.push({ text: p.text, ax: p.ax, ay: p.ay, image: cfg.data.image, alt: cfg.data.alt || '' });
      });
    }
    var rounds = cfg.rounds || allParts.length;
    var tol = cfg.tolerance || 9; // % radius counted as correct
    ref.streak && (ref.streak.style.display = '');

    var promptEl = make('div', 'ee-label-prompt', '');
    var stage = make('div', 'ee-label-stage');
    var img = document.createElement('img');
    img.draggable = false;
    stage.appendChild(img);
    var dot = make('div', 'ee-hot-dot');
    stage.appendChild(dot);
    ref.play.appendChild(promptEl);
    ref.play.appendChild(stage);

    var active, idx, score, streak, answered;
    function start() {
      active = sample(allParts, rounds);
      idx = 0; score = 0; streak = 0; setStreak(ref, 0);
      render();
    }
    function render() {
      answered = false;
      var p = active[idx];
      ref.progLabel.textContent = 'Part ' + (idx + 1) + ' of ' + active.length;
      ref.fill.style.width = (idx / active.length * 100) + '%';
      ref.scoreLabel.textContent = score + ' / ' + idx;
      if (img.src.indexOf(p.image) === -1) { img.src = p.image; img.alt = p.alt; }
      promptEl.innerHTML = 'Click the <span>' + p.text + '</span>';
      dot.className = 'ee-hot-dot';
      clearFeedback(ref.feedback);
      ref.nextWrap.className = 'game-next-wrap';
    }
    stage.addEventListener('click', function (ev) {
      if (answered) return;
      var rect = stage.getBoundingClientRect();
      var px = (ev.clientX - rect.left) / rect.width * 100;
      var py = (ev.clientY - rect.top) / rect.height * 100;
      var p = active[idx];
      var d = Math.sqrt(Math.pow(px - p.ax, 2) + Math.pow(py - p.ay, 2));
      answered = true;
      var ok = d <= tol;
      if (ok) { score++; streak++; } else { streak = 0; }
      setStreak(ref, streak);
      ref.scoreLabel.textContent = score + ' / ' + (idx + 1);
      // show the true location
      dot.style.left = p.ax + '%';
      dot.style.top = p.ay + '%';
      dot.className = 'ee-hot-dot show ' + (ok ? 'correct' : 'wrong');
      setFeedback(ref.feedback, ok,
        ok ? (streak >= 3 ? 'Correct — ' + streak + ' in a row.' : 'Correct.')
           : 'Not quite — the ' + p.text + ' is marked.');
      ref.nextWrap.className = 'game-next-wrap show';
      ref.nextBtn.textContent = (idx + 1 >= active.length) ? 'See Results' : 'Next';
    });
    ref.nextBtn.addEventListener('click', function () {
      idx++;
      if (idx >= active.length) { ref.fill.style.width = '100%'; showScore(ref, score, active.length, cfg, start); }
      else render();
    });
    start();
  }

  /* =========================================================================
     TYPE: sort — place each item into the correct category bucket
     data: { buckets: ['A','B',...], items: [[item, bucket], ...] }
     ========================================================================= */
  function mountSort(ref, cfg) {
    var rounds = cfg.rounds || 10;
    var qArea = make('div', 'game-question-area');
    var prompt = make('div', 'game-prompt', 'Which category?');
    var itemText = make('div', '');
    itemText.style.fontSize = '1.15rem';
    itemText.style.fontWeight = '700';
    itemText.style.color = 'var(--heading)';
    qArea.appendChild(prompt); qArea.appendChild(itemText);
    var grid = make('div', 'answer-grid');
    ref.play.appendChild(qArea);
    ref.play.appendChild(grid);

    var active, idx, score, streak, answered;
    function start() {
      active = sample(cfg.data.items, rounds);
      idx = 0; score = 0; streak = 0; setStreak(ref, 0);
      render();
    }
    function render() {
      answered = false;
      var it = active[idx];
      ref.progLabel.textContent = 'Item ' + (idx + 1) + ' of ' + active.length;
      ref.fill.style.width = (idx / active.length * 100) + '%';
      ref.scoreLabel.textContent = score + ' / ' + idx;
      itemText.textContent = it[0];
      grid.innerHTML = '';
      clearFeedback(ref.feedback);
      ref.nextWrap.className = 'game-next-wrap';
      cfg.data.buckets.forEach(function (b) {
        var btn = make('button', 'answer-btn', b);
        btn.addEventListener('click', function () { choose(b, btn); });
        grid.appendChild(btn);
      });
    }
    function choose(bucket, btn) {
      if (answered) return;
      answered = true;
      var it = active[idx];
      var ok = bucket === it[1];
      Array.prototype.forEach.call(grid.children, function (b) {
        b.disabled = true;
        if (b.textContent === it[1]) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
      });
      if (ok) { score++; streak++; } else { streak = 0; }
      setStreak(ref, streak);
      ref.scoreLabel.textContent = score + ' / ' + (idx + 1);
      setFeedback(ref.feedback, ok, ok ? 'Correct.' : it[0] + ' belongs in ' + it[1] + '.');
      ref.nextWrap.className = 'game-next-wrap show';
      ref.nextBtn.textContent = (idx + 1 >= active.length) ? 'See Results' : 'Next';
    }
    ref.nextBtn.addEventListener('click', function () {
      idx++;
      if (idx >= active.length) { ref.fill.style.width = '100%'; showScore(ref, score, active.length, cfg, start); }
      else render();
    });
    start();
  }

  /* =========================================================================
     TYPE: order — sequence the steps of a procedure
     data: { steps: ['step 1', 'step 2', ...] }  (given in correct order)
     ========================================================================= */
  function mountOrder(ref, cfg) {
    ref.header.querySelector('.game-progress-track').style.visibility = 'hidden';
    var prompt = make('div', 'game-prompt', 'Tap the steps in the correct order');
    prompt.style.padding = '1.25rem 1.4rem 0';
    var list = make('ul', 'ee-order-list');
    ref.play.appendChild(prompt);
    ref.play.appendChild(list);
    var actions = make('div', 'actions');
    var redo = make('button', 'primary', 'New Round');
    actions.appendChild(redo);
    ref.play.appendChild(actions);

    var correctOrder, picked;
    function start() {
      ref.score.className = 'score-screen';
      ref.play.classList.remove('hidden');
      ref.header.style.display = '';
      clearFeedback(ref.feedback);
      correctOrder = cfg.data.steps.slice();
      picked = 0;
      ref.progLabel.textContent = 'Order ' + correctOrder.length + ' steps';
      ref.scoreLabel.textContent = '0 / ' + correctOrder.length;
      list.innerHTML = '';
      shuffle(correctOrder).forEach(function (step) {
        var li = make('li');
        var btn = make('button', 'ee-order-item');
        btn.setAttribute('data-step', step);
        btn.innerHTML = '<span class="ee-order-num">•</span><span>' + step + '</span>';
        btn.addEventListener('click', function () { pick(btn); });
        li.appendChild(btn);
        list.appendChild(li);
      });
    }
    function pick(btn) {
      if (btn.disabled) return;
      var expected = correctOrder[picked];
      if (btn.getAttribute('data-step') === expected) {
        picked++;
        btn.disabled = true;
        btn.classList.add('correct');
        btn.querySelector('.ee-order-num').textContent = picked;
        ref.scoreLabel.textContent = picked + ' / ' + correctOrder.length;
        if (picked === correctOrder.length) {
          setFeedback(ref.feedback, true, 'Correct sequence — well done.');
          saveProgress(cfg.progressKey); saveBest(cfg.progressKey, 100);
        }
      } else {
        btn.classList.add('wrong');
        setFeedback(ref.feedback, false, 'That’s not the next step. The next step is: ' + expected + '.');
        setTimeout(function () { btn.classList.remove('wrong'); }, 700);
      }
    }
    redo.addEventListener('click', start);
    start();
  }

  /* =========================================================================
     TYPE: slider — estimate a value within a tolerance band
     data: { items: [{ prompt, min, max, step?, unit, answer, tolerance, explain? }] }
     ========================================================================= */
  function mountSlider(ref, cfg) {
    var rounds = cfg.rounds || cfg.data.items.length;
    var wrap = make('div', 'ee-slider-wrap');
    var prompt = make('div', 'game-prompt', '');
    var qText = make('div', '');
    qText.style.fontSize = '1.05rem';
    qText.style.fontWeight = '700';
    qText.style.color = 'var(--heading)';
    qText.style.marginBottom = '1rem';
    qText.style.lineHeight = '1.4';
    var readout = make('div', 'ee-slider-readout', '');
    var range = document.createElement('input');
    range.type = 'range'; range.className = 'ee-slider-range';
    var bounds = make('div', 'ee-slider-bounds', '');
    wrap.appendChild(prompt); wrap.appendChild(qText);
    wrap.appendChild(readout); wrap.appendChild(range); wrap.appendChild(bounds);
    ref.play.appendChild(wrap);
    var submitWrap = make('div', 'game-next-wrap show');
    var submitBtn = make('button', 'game-next-btn', 'Lock In Answer');
    submitWrap.appendChild(submitBtn);
    ref.play.appendChild(submitWrap);

    var active, idx, score, answered, cur;
    function start() {
      active = sample(cfg.data.items, rounds);
      idx = 0; score = 0;
      render();
    }
    function render() {
      answered = false;
      var it = active[idx];
      ref.progLabel.textContent = 'Estimate ' + (idx + 1) + ' of ' + active.length;
      ref.fill.style.width = (idx / active.length * 100) + '%';
      ref.scoreLabel.textContent = score + ' / ' + idx;
      prompt.textContent = 'Set the slider';
      qText.textContent = it.prompt;
      range.min = it.min; range.max = it.max; range.step = it.step || 1;
      cur = Math.round((it.min + it.max) / 2);
      range.value = cur;
      updateReadout(it);
      bounds.innerHTML = '<span>' + it.min + (it.unit ? ' ' + it.unit : '') + '</span>' +
                         '<span>' + it.max + (it.unit ? ' ' + it.unit : '') + '</span>';
      clearFeedback(ref.feedback);
      submitWrap.className = 'game-next-wrap show';
      submitBtn.textContent = 'Lock In Answer';
      range.disabled = false;
    }
    function updateReadout(it) {
      readout.innerHTML = range.value + '<span class="ee-slider-unit">' + (it.unit || '') + '</span>';
    }
    range.addEventListener('input', function () { updateReadout(active[idx]); });
    submitBtn.addEventListener('click', function () {
      var it = active[idx];
      if (!answered) {
        answered = true;
        range.disabled = true;
        var val = parseFloat(range.value);
        var diff = Math.abs(val - it.answer);
        var ok = diff <= (it.tolerance || 0);
        if (ok) score++;
        ref.scoreLabel.textContent = score + ' / ' + (idx + 1);
        var msg = ok ? 'Correct — the target is ' + it.answer + (it.unit ? ' ' + it.unit : '') + '.'
                     : 'Close. The correct value is ' + it.answer + (it.unit ? ' ' + it.unit : '') + '.';
        if (it.explain) msg += ' ' + it.explain;
        setFeedback(ref.feedback, ok, msg);
        submitBtn.textContent = (idx + 1 >= active.length) ? 'See Results' : 'Next';
      } else {
        idx++;
        if (idx >= active.length) { ref.fill.style.width = '100%'; showScore(ref, score, active.length, cfg, start); }
        else render();
      }
    });
    start();
  }

  /* =========================================================================
     TYPE: truefalse — judge correct vs incorrect (Right vs Wrong)
     data: { items: [{ prompt, correct:Boolean, explain, image? }],
             labels?: ['Correct','Incorrect'] }
     ========================================================================= */
  function mountTrueFalse(ref, cfg) {
    var rounds = cfg.rounds || 10;
    var labels = (cfg.data.labels) || ['Correct', 'Incorrect'];
    var qArea = make('div', 'game-question-area');
    var prompt = make('div', 'game-prompt', 'Is this right or wrong?');
    var imgFrame = make('div', 'game-image-frame'); imgFrame.style.display = 'none';
    var img = document.createElement('img'); imgFrame.appendChild(img);
    var qText = make('div', '');
    qText.style.fontSize = '1.02rem'; qText.style.fontWeight = '700';
    qText.style.color = 'var(--heading)'; qText.style.lineHeight = '1.45';
    qArea.appendChild(prompt); qArea.appendChild(imgFrame); qArea.appendChild(qText);
    var grid = make('div', 'answer-grid');
    ref.play.appendChild(qArea); ref.play.appendChild(grid);

    var active, idx, score, streak, answered;
    function start() {
      active = sample(cfg.data.items, rounds);
      idx = 0; score = 0; streak = 0; setStreak(ref, 0);
      render();
    }
    function render() {
      answered = false;
      var it = active[idx];
      ref.progLabel.textContent = 'Scenario ' + (idx + 1) + ' of ' + active.length;
      ref.fill.style.width = (idx / active.length * 100) + '%';
      ref.scoreLabel.textContent = score + ' / ' + idx;
      if (it.image) { imgFrame.style.display = ''; img.src = it.image; img.alt = ''; }
      else imgFrame.style.display = 'none';
      qText.textContent = it.prompt;
      grid.innerHTML = '';
      clearFeedback(ref.feedback);
      ref.nextWrap.className = 'game-next-wrap';
      [[true, labels[0]], [false, labels[1]]].forEach(function (pair) {
        var btn = make('button', 'answer-btn', pair[1]);
        btn.addEventListener('click', function () { choose(pair[0], btn); });
        grid.appendChild(btn);
      });
    }
    function choose(val, btn) {
      if (answered) return;
      answered = true;
      var it = active[idx];
      var ok = val === it.correct;
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      btn.classList.add(ok ? 'correct' : 'wrong');
      if (ok) { score++; streak++; } else { streak = 0; }
      setStreak(ref, streak);
      ref.scoreLabel.textContent = score + ' / ' + (idx + 1);
      setFeedback(ref.feedback, ok, (ok ? 'Correct. ' : 'Not quite. ') + (it.explain || ''));
      ref.nextWrap.className = 'game-next-wrap show';
      ref.nextBtn.textContent = (idx + 1 >= active.length) ? 'See Results' : 'Next';
    }
    ref.nextBtn.addEventListener('click', function () {
      idx++;
      if (idx >= active.length) { ref.fill.style.width = '100%'; showScore(ref, score, active.length, cfg, start); }
      else render();
    });
    start();
  }

  /* ---- public API --------------------------------------------------------- */
  var TYPES = {
    recall: mountRecall, match: mountMatch, memory: mountMemory, label: mountLabel,
    sort: mountSort, order: mountOrder, slider: mountSlider, truefalse: mountTrueFalse
  };

  function mount(cfg) {
    var host = resolveEl(cfg.el);
    if (!host) { console.error('EEGames: mount element not found', cfg.el); return; }
    var fn = TYPES[cfg.type];
    if (!fn) { console.error('EEGames: unknown type', cfg.type); return; }
    var ref = buildShell({
      progressText: '', streak: ['recall', 'label', 'sort', 'truefalse'].indexOf(cfg.type) !== -1
    });
    host.innerHTML = '';
    host.appendChild(ref.shell);
    fn(ref, cfg);
    return ref;
  }

  global.EEGames = { mount: mount, _shuffle: shuffle, _sample: sample, types: Object.keys(TYPES) };
})(window);
/* ee-games.js v1.0 — eight reusable game types for Equine EDU. */
