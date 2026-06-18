/* =============================================================================
   Equine EDU — Horse Bowl Practice Engine
   ----------------------------------------------------------------------------
   Three services + one finite state machine, exposed as window.HorseBowl:
     HorseBowl.Questions  — loads the MASTER bank (Supabase, JSON fallback)
     HorseBowl.Filter     — category / courseId / difficulty filtering
     HorseBowl.Session    — randomized, balanced, no-duplicate selection + scoring
   The UI controller (horse-bowl-ui.js) drives these. No question data is stored
   here or in any course page — the bank is the single source of truth.
   ============================================================================= */
(function () {
  'use strict';

  var BANK_URL = '../assets/data/question-bank.json';

  /* ---- small utils --------------------------------------------------------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* =========================================================================
     QUESTION SERVICE — owns the master bank
     ========================================================================= */
  var Questions = (function () {
    var _all = null;          // cached array of question objects
    var _byCat = null;        // { category: [questions] }
    var _courses = [];        // [{ courseId, title, category, progressKey }]

    // normalize a Supabase row OR a JSON entry into one shape
    function normalize(r) {
      return {
        id: r.id,
        question: r.question,
        options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
        correctAnswer: r.correctAnswer != null ? r.correctAnswer : r.correct_answer,
        category: r.category,
        courseId: r.courseId != null ? r.courseId : r.course_id,
        image: r.image != null ? r.image : (r.image_url != null ? r.image_url : null),
        difficulty: r.difficulty || 'medium',
        explanationCorrect: r.explanationCorrect != null ? r.explanationCorrect : r.explanation_correct,
        explanationIncorrect: r.explanationIncorrect != null ? r.explanationIncorrect : r.explanation_incorrect,
        version: r.version || 1
      };
    }

    function index(list) {
      _all = list;
      _byCat = {};
      list.forEach(function (q) {
        (_byCat[q.category] = _byCat[q.category] || []).push(q);
      });
    }

    function loadFromSupabase() {
      if (!window.EEAuth || typeof window.EEAuth.client !== 'function') return Promise.resolve(null);
      var client = window.EEAuth.client();
      if (!client) return Promise.resolve(null);
      return client.from('questions').select('*').then(function (res) {
        if (res.error || !res.data || !res.data.length) return null;
        return res.data.map(normalize);
      }).catch(function () { return null; });
    }

    function loadFromGlobal() {
      // window.HORSE_BOWL_BANK is set by assets/data/question-bank.js (a <script>).
      // This works from any context, including opening the page via file://.
      var g = window.HORSE_BOWL_BANK;
      if (!g) return null;
      if (g.courses) _courses = g.courses;
      return (g.questions || g).map(normalize);
    }

    function loadFromJson() {
      return fetch(BANK_URL).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (data) {
        if (data.courses) _courses = data.courses;
        return (data.questions || data).map(normalize);
      });
    }

    return {
      // load() resolves once the bank is cached. Supabase first, JSON fallback.
      load: function () {
        if (_all) return Promise.resolve(_all);
        return loadFromSupabase().then(function (rows) {
          if (rows) return rows;                 // live Supabase bank (source of truth)
          return loadFromGlobal() || loadFromJson(); // embedded global, then JSON fetch
        }).catch(function () {
          return loadFromGlobal() || loadFromJson();
        }).then(function (list) {
          index(list);
          if (!_courses.length) {
            // fallback: derive course list from the questions themselves
            var seen = {};
            list.forEach(function (q) {
              if (q.courseId && !seen[q.courseId]) {
                seen[q.courseId] = true;
                _courses.push({ courseId: q.courseId, category: q.category, progressKey: null });
              }
            });
          }
          return _all;
        });
      },
      all: function () { return _all || []; },
      byCategory: function () { return _byCat || {}; },
      categories: function () { return Object.keys(_byCat || {}).sort(); },
      // count of questions available per category (drives the setup screen).
      // Pass an array of courseIds to count only questions from those courses.
      categoryCounts: function (courseIds) {
        var out = {};
        if (courseIds && courseIds.length) {
          var set = {};
          courseIds.forEach(function (id) { set[id] = true; });
          (_all || []).forEach(function (q) {
            if (set[q.courseId]) out[q.category] = (out[q.category] || 0) + 1;
          });
          // ensure all known categories appear (as 0) so the grid stays stable
          Object.keys(_byCat || {}).forEach(function (c) { if (!(c in out)) out[c] = 0; });
        } else {
          Object.keys(_byCat || {}).forEach(function (c) { out[c] = _byCat[c].length; });
        }
        return out;
      },
      // course metadata (incl. progressKey)
      courses: function () { return _courses; },
      // courseIds the learner has completed (passed the course test), from localStorage
      completedCourseIds: function () {
        return _courses.filter(function (c) {
          if (!c.progressKey) return false;
          try { return localStorage.getItem(c.progressKey) === 'true'; }
          catch (e) { return false; }
        }).map(function (c) { return c.courseId; });
      },
      completedCourseCount: function () { return this.completedCourseIds().length; }
    };
  })();

  /* =========================================================================
     FILTER SERVICE — strict, composable filtering
     ========================================================================= */
  var Filter = {
    // opts: { categories:[], courseIds:[], difficulty:'easy'|null }
    apply: function (questions, opts) {
      opts = opts || {};
      var cats = (opts.categories || []).filter(Boolean);
      var courses = (opts.courseIds || []).filter(Boolean);
      var diff = opts.difficulty || null;
      return questions.filter(function (q) {
        if (cats.length && cats.indexOf(q.category) === -1) return false;
        if (courses.length && courses.indexOf(q.courseId) === -1) return false;
        if (diff && q.difficulty !== diff) return false;
        return true;
      });
    }
  };

  /* =========================================================================
     SESSION ENGINE — selection, state machine, scoring
     ========================================================================= */
  function Session(config) {
    // config: { categories:[], courseIds:[], difficulty, count:10|20|30, timed, perQuestionSecs }
    this.config = config || {};
    this.count = [10, 20, 30].indexOf(config.count) > -1 ? config.count : 10;
    this.questions = [];     // selected, ordered question objects
    this.responses = [];     // { questionId, selected, correct }
    this.index = 0;
    this.poolSize = 0;       // distinct questions available after filtering
    this.repeated = false;   // true if controlled repeats were needed
  }

  // Balanced, randomized, duplicate-free selection across selected categories.
  Session.prototype.build = function () {
    var pool = Filter.apply(Questions.all(), this.config);
    this.poolSize = pool.length;
    var cats = (this.config.categories || []).filter(Boolean);

    var selected;
    if (cats.length > 1) {
      selected = this._balanced(pool, cats, this.count);
    } else {
      selected = shuffle(pool).slice(0, this.count);
    }

    // Controlled repeats: only AFTER the distinct pool is exhausted.
    if (selected.length < this.count && pool.length > 0) {
      this.repeated = true;
      var filler = shuffle(pool);
      var fi = 0;
      while (selected.length < this.count) {
        selected.push(filler[fi % filler.length]);
        fi++;
      }
    }

    this.questions = shuffle(selected); // final presentation order
    return this.questions;
  };

  // distribute `count` as evenly as possible across categories, capped by pool
  Session.prototype._balanced = function (pool, cats, count) {
    var buckets = {};
    cats.forEach(function (c) { buckets[c] = []; });
    shuffle(pool).forEach(function (q) {
      if (buckets[q.category]) buckets[q.category].push(q);
    });

    var base = Math.floor(count / cats.length);
    var remainder = count % cats.length;
    var picked = [];
    var leftover = [];

    // round 1: even base share (+1 for the first `remainder` categories)
    cats.forEach(function (c, i) {
      var want = base + (i < remainder ? 1 : 0);
      var take = buckets[c].splice(0, want);
      picked = picked.concat(take);
      leftover = leftover.concat(buckets[c]); // categories with surplus
    });

    // round 2: backfill any shortfall (some categories were too small)
    if (picked.length < count) {
      picked = picked.concat(shuffle(leftover).slice(0, count - picked.length));
    }
    return picked.slice(0, count);
  };

  Session.prototype.current = function () { return this.questions[this.index]; };
  Session.prototype.progress = function () {
    return { number: this.index + 1, total: this.questions.length };
  };

  // record an answer immediately; returns the evaluation for feedback
  Session.prototype.answer = function (selectedValue) {
    var q = this.current();
    var isCorrect = String(selectedValue) === String(q.correctAnswer);
    this.responses[this.index] = { questionId: q.id, selected: selectedValue, correct: isCorrect };
    return { correct: isCorrect, correctAnswer: q.correctAnswer,
             explanation: isCorrect ? q.explanationCorrect : q.explanationIncorrect };
  };

  Session.prototype.next = function () {
    this.index++;
    return this.index < this.questions.length;
  };
  Session.prototype.isLast = function () { return this.index >= this.questions.length - 1; };

  // full results object for the results + review screens
  Session.prototype.results = function () {
    var correct = 0, byCat = {};
    var self = this;
    this.questions.forEach(function (q, i) {
      var r = self.responses[i] || { selected: null, correct: false };
      if (r.correct) correct++;
      var c = byCat[q.category] || (byCat[q.category] = { correct: 0, total: 0 });
      c.total++; if (r.correct) c.correct++;
    });

    // strengths / weaknesses (weak limited to top 1–3)
    var cats = Object.keys(byCat).map(function (c) {
      return { category: c, correct: byCat[c].correct, total: byCat[c].total,
               accuracy: byCat[c].total ? byCat[c].correct / byCat[c].total : 0 };
    });
    var strengths = cats.filter(function (c) { return c.accuracy >= 0.8; })
      .sort(function (a, b) { return b.accuracy - a.accuracy; });
    var weak = cats.filter(function (c) { return c.accuracy < 0.7; })
      .sort(function (a, b) { return a.accuracy - b.accuracy; }).slice(0, 3);

    var review = this.questions.map(function (q, i) {
      var r = self.responses[i] || { selected: null, correct: false };
      return {
        question: q.question,
        options: q.options,
        userAnswer: r.selected,
        correctAnswer: q.correctAnswer,
        isCorrect: r.correct,
        explanationCorrect: q.explanationCorrect,
        explanationIncorrect: q.explanationIncorrect,
        category: q.category,
        difficulty: q.difficulty,
        image: q.image || null
      };
    });

    return {
      score: correct,
      total: this.questions.length,
      percentage: this.questions.length ? Math.round(correct / this.questions.length * 100) : 0,
      categoryBreakdown: cats.sort(function (a, b) { return b.accuracy - a.accuracy; }),
      strengths: strengths,
      weaknesses: weak,
      review: review,
      poolSize: this.poolSize,
      repeated: this.repeated
    };
  };

  // optional analytics write (no-op if not signed in)
  Session.prototype.save = function (durationSecs) {
    if (!window.EEAuth || typeof window.EEAuth.client !== 'function') return Promise.resolve();
    var client = window.EEAuth.client();
    if (!client) return Promise.resolve();
    var res = this.results();
    var self = this;
    return window.EEAuth.getUser().then(function (user) {
      if (!user) return;
      var breakdown = {};
      res.categoryBreakdown.forEach(function (c) {
        breakdown[c.category] = { correct: c.correct, total: c.total };
      });
      return client.from('session_results').insert({
        user_id: user.id,
        categories: self.config.categories || [],
        question_count: self.count,
        timed: !!self.config.timed,
        score: res.score, total: res.total, percentage: res.percentage,
        category_breakdown: breakdown,
        question_ids: self.questions.map(function (q) { return q.id; }),
        responses: self.responses,
        duration_secs: durationSecs || null
      });
    }).catch(function () { /* analytics is best-effort */ });
  };

  /* ---- expose -------------------------------------------------------------- */
  window.HorseBowl = { Questions: Questions, Filter: Filter, Session: Session, shuffle: shuffle };
})();
