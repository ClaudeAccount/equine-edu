#!/usr/bin/env node
/* =============================================================================
   Equine EDU — sync the master question bank into Supabase
   ----------------------------------------------------------------------------
   Makes the `questions`, `courses`, and `course_questions` tables EXACTLY mirror
   assets/data/question-bank.json + courses.json (which are regenerated from the
   live course quiz files on every build). Handles adds, edits, AND deletions.

   Runs automatically during `npm run build` (Netlify). It NO-OPS safely when the
   service credentials are not configured, so local/dev builds never fail:
     SUPABASE_URL                 e.g. https://xxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY    service role key (bypasses RLS; build env only)
   ============================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.log('[sync-supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping DB sync (static bank already regenerated).');
  process.exit(0);
}

let createClient;
try { ({ createClient } = require('@supabase/supabase-js')); }
catch (e) { console.log('[sync-supabase] @supabase/supabase-js not installed — skipping.'); process.exit(0); }

const dataDir = path.join(__dirname, '..', 'assets', 'data');
const bank = JSON.parse(fs.readFileSync(path.join(dataDir, 'question-bank.json'), 'utf8'));
const coursesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'courses.json'), 'utf8'));
const questions = bank.questions || [];
const courses = coursesData.courses || [];

const db = createClient(URL, KEY, { auth: { persistSession: false } });

const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };

(async () => {
  try {
    // 1. upsert courses
    const courseRows = courses.map(c => ({ id: c.courseId, title: c.title, category: c.category, collection: c.collection }));
    for (const part of chunk(courseRows, 500)) {
      const { error } = await db.from('courses').upsert(part, { onConflict: 'id' });
      if (error) throw error;
    }

    // 2. upsert questions
    const qRows = questions.map(q => ({
      id: q.id, question: q.question, options: q.options, correct_answer: q.correctAnswer,
      category: q.category, course_id: q.courseId, difficulty: q.difficulty, image_url: q.image || null,
      explanation_correct: q.explanationCorrect, explanation_incorrect: q.explanationIncorrect
    }));
    for (const part of chunk(qRows, 500)) {
      const { error } = await db.from('questions').upsert(part, { onConflict: 'id' });
      if (error) throw error;
    }

    // 3. prune questions/courses that no longer exist on the live site
    const keepQ = new Set(questions.map(q => q.id));
    const keepC = new Set(courses.map(c => c.courseId));
    const { data: existingQ } = await db.from('questions').select('id');
    const delQ = (existingQ || []).map(r => r.id).filter(id => !keepQ.has(id));
    if (delQ.length) { const { error } = await db.from('questions').delete().in('id', delQ); if (error) throw error; }
    const { data: existingC } = await db.from('courses').select('id');
    const delC = (existingC || []).map(r => r.id).filter(id => !keepC.has(id));
    if (delC.length) { const { error } = await db.from('courses').delete().in('id', delC); if (error) throw error; }

    // 4. rebuild course<->question map
    await db.from('course_questions').delete().neq('course_id', '');
    const joinRows = [];
    courses.forEach(c => (c.questionBank || []).forEach(qid => joinRows.push({ course_id: c.courseId, question_id: qid })));
    for (const part of chunk(joinRows, 1000)) {
      const { error } = await db.from('course_questions').upsert(part, { onConflict: 'course_id,question_id' });
      if (error) throw error;
    }

    console.log(`[sync-supabase] OK — ${questions.length} questions, ${courses.length} courses; pruned ${delQ.length} questions / ${delC.length} courses.`);
  } catch (e) {
    console.error('[sync-supabase] FAILED:', e.message || e);
    process.exit(1);
  }
})();
