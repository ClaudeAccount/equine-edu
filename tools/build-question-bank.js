#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2];
if (!REPO) { console.error('Usage: node build-question-bank.js <repo-root>'); process.exit(1); }
const SCHOOLING = path.join(REPO, 'courses', 'schooling-ring');

const CATEGORY_BY_SLUG = {
  'equine-anatomy': 'anatomy', 'horse-teeth-basics': 'anatomy',
  'intro-to-equine-skeleton': 'anatomy', 'intro-to-hoof-anatomy': 'anatomy',
  'parts-of-the-horse': 'anatomy',
  'appaloosa-patterns': 'colors', 'base-coat-colors': 'colors',
  'common-horse-colors': 'colors', 'pinto-patterns': 'colors',
  'face-markings': 'markings', 'leg-markings': 'markings',
  'equine-first-aid-basics': 'health', 'equine-health-disease-prevention': 'health',
  'vital-signs': 'health', 'equine-nutrition': 'health',
  'hoof-care-farriery': 'health', 'intro-to-feeding-nutrition': 'health',
  'horse-behavior-communication': 'behavior', 'intro-to-horse-behavior': 'behavior',
  'grooming-horses': 'barn management', 'measuring-horses': 'barn management',
  'arena-figures-school-movements': 'movement', 'gaits-movement': 'movement',
  'the-horses-gaits': 'movement',
  'common-riding-disciplines': 'riding basics', 'natural-artificial-aids': 'riding basics',
  'rider-safety-basics': 'safety',
  'driving-equipment': 'tack & equipment', 'english-equipment': 'tack & equipment',
  'intro-to-bits-bridles': 'tack & equipment', 'intro-to-tack-equipment': 'tack & equipment',
  'tack-fundamentals-fit': 'tack & equipment', 'western-equipment': 'tack & equipment'
};
const CANONICAL = ['anatomy','tack & equipment','colors','markings','breeds','health',
  'safety','movement','barn management','riding basics'];
function difficultyFor(slug, collection) {
  if (/^intro-|-basics$|^parts-of-/.test(slug)) return 'easy';
  if (collection === 'colors-markings' || collection === 'equine-anatomy') return 'easy';
  return 'medium';
}
function configField(js, field) {
  const m = js.match(new RegExp(field + "\\s*:\\s*'([^']*)'"));
  return m ? m[1] : null;
}
function quizFileFromConfig(js) {
  const re = /\{[^{}]*type:\s*'Quiz'[^{}]*\}/g;
  let m;
  while ((m = re.exec(js))) { const f = m[0].match(/file:\s*'([^']+)'/); if (f) return f[1]; }
  return null;
}
function camelCase(slug) {
  return String(slug).replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); });
}
function progressKeyFromQuiz(html, courseId) {
  var m = html.match(/progressKey:\s*["']([^"']+)["']/);
  if (m) return m[1];
  return 'equineEduProgress.' + camelCase(courseId) + '.testYourKnowledge';
}
function extractBank(html) {
  const start = html.indexOf('EE_QUIZ_BANK');
  if (start === -1) return [];
  const br = html.indexOf('[', start);
  if (br === -1) return [];
  let depth = 0, i = br, inStr = false, q = '';
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) { if (c === '\\') { i++; continue; } if (c === q) inStr = false; continue; }
    if (c === '"' || c === "'") { inStr = true; q = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  const literal = html.slice(br, i);
  try { return JSON.parse(literal); }
  catch (e) { try { return JSON.parse(literal.replace(/,\s*([\]}])/g, '$1')); }
    catch (e2) { console.warn('  ! parse failed:', e2.message); return []; } }
}
const questions = [], courses = [], seen = new Map();
const crypto = require('crypto');
const norm = s => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
// Stable id derived from question content, so unchanged questions keep the same
// id across runs (minimal sync churn) and edits/deletes are handled cleanly.
const idFor = key => 'q_' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 12);
const collections = fs.readdirSync(SCHOOLING).filter(d => fs.statSync(path.join(SCHOOLING, d)).isDirectory());
for (const collection of collections) {
  const collDir = path.join(SCHOOLING, collection);
  for (const slug of fs.readdirSync(collDir)) {
    const courseDir = path.join(collDir, slug);
    if (!fs.statSync(courseDir).isDirectory()) continue;
    const cfgPath = path.join(courseDir, 'course-config.js');
    if (!fs.existsSync(cfgPath)) continue;
    const cfg = fs.readFileSync(cfgPath, 'utf8');
    const courseId = configField(cfg, 'id') || slug;
    const title = configField(cfg, 'title') || slug;
    const category = CATEGORY_BY_SLUG[courseId] || CATEGORY_BY_SLUG[slug] || 'general';
    let quizFile = quizFileFromConfig(cfg);
    let quizPath = quizFile && path.join(courseDir, quizFile);
    if (!quizPath || !fs.existsSync(quizPath)) {
      const tests = fs.readdirSync(courseDir).filter(f => /test-your-knowledge\.html$/.test(f)).sort();
      if (!tests.length) { console.warn('  - no quiz for', courseId); continue; }
      quizPath = path.join(courseDir, tests[tests.length - 1]);
    }
    const quizHtml = fs.readFileSync(quizPath, 'utf8');
    const bank = extractBank(quizHtml);
    const progressKey = progressKeyFromQuiz(quizHtml, courseId);
    const difficulty = difficultyFor(slug, collection);
    const courseRef = { courseId, title, category, collection, progressKey, questionBank: [] };
    for (const raw of bank) {
      const qtext = raw.q || raw.prompt || raw.question;
      const opts = raw.opts || raw.options;
      const ans = raw.a || raw.answer || raw.correct || raw.correctAnswer;
      if (!qtext || !Array.isArray(opts) || opts.length < 2 || !ans) continue;
      const img = raw.img || raw.image || null;
      const key = norm(qtext) + '||' + opts.map(norm).sort().join('|') + '||' + (img || '');
      if (seen.has(key)) { courseRef.questionBank.push(seen.get(key)); continue; }
      const id = idFor(key);
      seen.set(key, id);
      courseRef.questionBank.push(id);
      questions.push({ id, question: qtext, options: opts, correctAnswer: ans, category, courseId, difficulty,
        image: img,
        explanationCorrect: raw.ok || 'Correct. ' + ans + ' is the right answer.',
        explanationIncorrect: raw.no || 'Not quite. The correct answer is ' + ans + '.',
        version: 1, lastUpdated: new Date().toISOString() });
    }
    courses.push(courseRef);
    console.log(`  ${courseId} [${category}] -> ${courseRef.questionBank.length} q (${path.basename(quizPath)})`);
  }
}
/* ---- merge curated image-question bank (links to in-course images) -------- */
const imgPath = path.join(REPO, 'assets', 'data', 'image-questions.json');
if (fs.existsSync(imgPath)) {
  const imgBank = JSON.parse(fs.readFileSync(imgPath, 'utf8')).questions || [];
  let merged = 0;
  for (const r of imgBank) {
    const opts = r.options;
    if (!r.question || !Array.isArray(opts) || !r.correctAnswer) continue;
    const key = norm(r.question) + '||' + opts.map(norm).sort().join('|') + '||' + (r.image || '');
    if (seen.has(key)) continue;
    const id = idFor(key);
    seen.set(key, id);
    questions.push({ id, question: r.question, options: opts, correctAnswer: r.correctAnswer,
      category: r.category, courseId: r.courseId || null, difficulty: r.difficulty || 'medium',
      image: r.image || null,
      explanationCorrect: r.explanationCorrect || 'Correct.',
      explanationIncorrect: r.explanationIncorrect || 'Not quite.',
      version: 1, lastUpdated: new Date().toISOString() });
    merged++;
  }
  console.log('  merged image questions:', merged, 'of', imgBank.length);
}

const byCat = {};
for (const c of CANONICAL) byCat[c] = 0;
for (const q of questions) byCat[q.category] = (byCat[q.category] || 0) + 1;
const dataDir = path.join(REPO, 'assets', 'data');
const dbDir = path.join(REPO, 'db');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(dbDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'question-bank.json'),
  JSON.stringify({ generated: new Date().toISOString(), count: questions.length, categories: byCat, questions }, null, 2));
// ---- decorative images for the wizard: uniform course-card + index-hero art -
var decoImages = [];
(function collectDeco() {
  var root = path.join(REPO, 'courses', 'schooling-ring');
  if (!fs.existsSync(root)) return;
  fs.readdirSync(root).forEach(function (coll) {
    var collDir = path.join(root, coll);
    if (!fs.statSync(collDir).isDirectory()) return;
    fs.readdirSync(collDir).forEach(function (slug) {
      var imgDir = path.join(collDir, slug, 'images');
      if (!fs.existsSync(imgDir)) return;
      fs.readdirSync(imgDir).forEach(function (f) {
        if (/(course-cards?|index-hero)/i.test(f) && /\.(png|jpe?g|webp)$/i.test(f)) {
          decoImages.push('/courses/schooling-ring/' + coll + '/' + slug + '/images/' + f);
        }
      });
    });
  });
})();
console.log('  decorative images:', decoImages.length);

var courseMeta = courses.map(function (c) { return { courseId: c.courseId, title: c.title, category: c.category, progressKey: c.progressKey }; });
fs.writeFileSync(path.join(dataDir, 'question-bank.js'),
  '/* generated */\nwindow.HORSE_BOWL_BANK = ' + JSON.stringify({ generated: new Date().toISOString(), count: questions.length, categories: byCat, courses: courseMeta, decoImages: decoImages, questions }) + ';\n');
fs.writeFileSync(path.join(dataDir, 'courses.json'),
  JSON.stringify({ generated: new Date().toISOString(), courses }, null, 2));
const esc = s => String(s).replace(/'/g, "''");
let sql = '-- Equine EDU — Horse Bowl seed data (generated). Run AFTER horse-bowl-schema.sql.\nbegin;\n\n';
for (const c of courses)
  sql += `insert into courses (id, title, category, collection) values ('${esc(c.courseId)}','${esc(c.title)}','${esc(c.category)}','${esc(c.collection)}') on conflict (id) do update set title=excluded.title, category=excluded.category, collection=excluded.collection;\n`;
sql += '\n';
const sqlV = v => v == null ? 'null' : `'${esc(v)}'`;
for (const q of questions)
  sql += `insert into questions (id, question, options, correct_answer, category, course_id, difficulty, image_url, explanation_correct, explanation_incorrect, version) values ('${q.id}','${esc(q.question)}','${esc(JSON.stringify(q.options))}'::jsonb,'${esc(q.correctAnswer)}','${esc(q.category)}',${sqlV(q.courseId)},'${esc(q.difficulty)}',${sqlV(q.image)},'${esc(q.explanationCorrect)}','${esc(q.explanationIncorrect)}',1) on conflict (id) do nothing;\n`;
// (seed uses do-nothing; the SYNC file below does full upsert + prune)
sql += '\n';
for (const c of courses) for (const qid of c.questionBank)
  sql += `insert into course_questions (course_id, question_id) values ('${esc(c.courseId)}','${qid}') on conflict do nothing;\n`;
sql += '\ncommit;\n';
fs.writeFileSync(path.join(dbDir, 'horse-bowl-seed.sql'), sql);

// ---- SYNC sql: makes Supabase exactly mirror the live course files ----------
// Upserts every current course/question, then deletes any course, question, or
// join row that is NO LONGER produced by the live site (handles edits + deletes).
const qIdList = questions.map(q => `'${q.id}'`).join(',') || `''`;
const cIdList = courses.map(c => `'${esc(c.courseId)}'`).join(',') || `''`;
let sync = '-- Equine EDU — Horse Bowl SYNC (generated). Mirrors live course files.\n';
sync += '-- Run AFTER horse-bowl-schema.sql. Safe to run repeatedly.\n';
sync += 'begin;\n\n';
for (const c of courses)
  sync += `insert into courses (id, title, category, collection) values ('${esc(c.courseId)}','${esc(c.title)}','${esc(c.category)}','${esc(c.collection)}') on conflict (id) do update set title=excluded.title, category=excluded.category, collection=excluded.collection;\n`;
sync += '\n';
for (const q of questions)
  sync += `insert into questions (id, question, options, correct_answer, category, course_id, difficulty, image_url, explanation_correct, explanation_incorrect) values ('${q.id}','${esc(q.question)}','${esc(JSON.stringify(q.options))}'::jsonb,'${esc(q.correctAnswer)}','${esc(q.category)}',${sqlV(q.courseId)},'${esc(q.difficulty)}',${sqlV(q.image)},'${esc(q.explanationCorrect)}','${esc(q.explanationIncorrect)}') on conflict (id) do update set question=excluded.question, options=excluded.options, correct_answer=excluded.correct_answer, category=excluded.category, course_id=excluded.course_id, difficulty=excluded.difficulty, image_url=excluded.image_url, explanation_correct=excluded.explanation_correct, explanation_incorrect=excluded.explanation_incorrect;\n`;
sync += '\n-- prune questions and courses that no longer exist on the live site\n';
sync += `delete from questions where id not in (${qIdList});\n`;
sync += `delete from courses   where id not in (${cIdList});\n`;
sync += '\n-- rebuild the course<->question map (FK cascade keeps it consistent)\n';
sync += 'delete from course_questions;\n';
for (const c of courses) for (const qid of c.questionBank)
  sync += `insert into course_questions (course_id, question_id) values ('${esc(c.courseId)}','${qid}') on conflict do nothing;\n`;
sync += '\ncommit;\n';
fs.writeFileSync(path.join(dbDir, 'horse-bowl-sync.sql'), sync);
console.log('\n=== SUMMARY ===');
console.log('unique questions:', questions.length, '| courses:', courses.length);
console.log('by category:', byCat);
