/* =============================================================================
   Equine Edu — Equine Vital Signs — Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   To add or reorder a module, edit this file only.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'vital-signs',
  title:         'Equine Vital Signs',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Why Vital Signs Matter',
      type:  'Lesson',
      file:  '2-why-vitals-matter.html',
      desc:  'Understand why knowing your horse\'s normal vital signs is one of the most valuable skills in basic horse care.'
    },
    {
      num:   2,
      title: 'Equine Vital Signs',
      type:  'Lesson',
      file:  '3-vital-signs.html',
      desc:  'Explore each vital sign in detail — normal ranges, how to check them, and what to watch for.'
    },
    {
      num:   3,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '4-viewing-room.html',
      desc:  'Work through real-world vital sign scenarios and flip each card to check your understanding.'
    },
    {
      num:   4,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '5-training-barn.html',
      desc:  'Practice reading and interpreting vital signs through three interactive activities.'
    },
    {
      num:   5,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '6-test-your-knowledge.html',
      desc:  'Answer 15 questions drawn from a bank of 45 covering all six equine vital signs.'
    }
  ]
};
