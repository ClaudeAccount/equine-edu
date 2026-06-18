(function () {
  'use strict';

  const cfg = window.EE_QUIZ_CONFIG || {};
  const bank = Array.isArray(window.EE_QUIZ_BANK) ? window.EE_QUIZ_BANK : [];
  const questionCount = Number(cfg.questionCount || 15);

  const cardEl = document.getElementById('quiz-card');
  const countEl = document.getElementById('quiz-count');
  const scoreEl = document.getElementById('quiz-score');
  const questionEl = document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const feedbackEl = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');
  const scorePanel = document.getElementById('score-panel');
  const scoreDisplay = document.getElementById('score-display');
  const scoreMessage = document.getElementById('score-message');
  const retakeBtn = document.getElementById('btn-retake');

  if (!cardEl || !countEl || !scoreEl || !questionEl || !optionsEl || !feedbackEl || !nextBtn || !scorePanel || !scoreDisplay || !scoreMessage || !retakeBtn) {
    return;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function shuffle(items) {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function normalizeQuestion(raw, index) {
    const opts = raw.opts || raw.options || [];
    const answer = typeof raw.a === 'number' ? opts[raw.a] :
      typeof raw.ans === 'number' ? opts[raw.ans] :
      typeof raw.answer === 'number' ? opts[raw.answer] :
      raw.a || raw.ans || raw.answer;

    return {
      q: raw.q || raw.prompt || `Question ${index + 1}`,
      opts,
      a: answer,
      img: raw.img || raw.image || null,
      ok: raw.ok || raw.correct || 'Correct.',
      no: raw.no || raw.incorrect || `Not quite. The correct answer is ${answer}.`
    };
  }

  const normalizedBank = bank.map(normalizeQuestion).filter(q => q.q && Array.isArray(q.opts) && q.opts.length >= 2 && q.a);

  let active = [];
  let index = 0;
  let score = 0;
  let answered = false;

  function startQuiz() {
    active = shuffle(normalizedBank).slice(0, Math.min(questionCount, normalizedBank.length));
    index = 0;
    score = 0;
    scorePanel.classList.remove('show');
    cardEl.style.display = '';
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    const q = active[index];
    countEl.textContent = `Question ${index + 1} of ${active.length}`;
    scoreEl.textContent = `Score: ${score}`;
    questionEl.textContent = q.q;
    var imgEl = document.getElementById('quiz-image');
    if (q.img) {
      if (!imgEl) {
        imgEl = document.createElement('img');
        imgEl.id = 'quiz-image';
        imgEl.className = 'quiz-image';
        questionEl.parentNode.insertBefore(imgEl, questionEl.nextSibling);
      }
      imgEl.src = q.img;          // root-relative path, served from site root
      imgEl.alt = 'Photo for this question';
      imgEl.style.display = '';
    } else if (imgEl) {
      imgEl.style.display = 'none';
      imgEl.removeAttribute('src');
    }
    feedbackEl.className = 'quiz-feedback';
    feedbackEl.textContent = '';
    nextBtn.disabled = true;
    nextBtn.textContent = 'Next Question';

    optionsEl.innerHTML = shuffle(q.opts).map(option =>
      `<button type="button" class="quiz-option" data-val="${escapeHtml(option)}">${escapeHtml(option)}</button>`
    ).join('');

    optionsEl.querySelectorAll('.quiz-option').forEach(button => {
      button.addEventListener('click', () => selectAnswer(button, q));
    });
  }

  function selectAnswer(button, q) {
    if (answered) return;
    answered = true;
    const selected = button.dataset.val;
    const correct = String(q.a);
    const isCorrect = selected === correct;

    optionsEl.querySelectorAll('.quiz-option').forEach(option => {
      option.disabled = true;
      if (option.dataset.val === correct) option.classList.add('correct-ans');
    });

    if (isCorrect) score += 1;
    else button.classList.add('wrong-ans');

    feedbackEl.innerHTML = isCorrect ? q.ok : q.no;
    feedbackEl.classList.add('show', isCorrect ? 'correct' : 'incorrect');
    scoreEl.textContent = `Score: ${score}`;
    nextBtn.textContent = index + 1 < active.length ? 'Next Question' : 'See Results';
    nextBtn.disabled = false;
  }

  function finishQuiz() {
    cardEl.style.display = 'none';
    scoreDisplay.textContent = `${score}/${active.length}`;
    const ratio = score / active.length;
    scoreMessage.textContent = ratio >= 0.9
      ? 'Excellent work. You have a strong command of this material.'
      : ratio >= 0.75
        ? 'Good work. Review the questions you missed and try another round.'
        : ratio >= 0.6
          ? 'You are getting there. Revisit the lesson and study guide, then try again.'
          : 'Keep practicing. These concepts will get easier with review.';
    scorePanel.classList.add('show');
    if (ratio >= 0.8 && cfg.progressKey) {
      try { localStorage.setItem(cfg.progressKey, 'true'); } catch (e) {}
    }
  }

  nextBtn.addEventListener('click', () => {
    index += 1;
    if (index >= active.length) finishQuiz();
    else showQuestion();
  });

  retakeBtn.addEventListener('click', () => {
    startQuiz();
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  startQuiz();
})();
