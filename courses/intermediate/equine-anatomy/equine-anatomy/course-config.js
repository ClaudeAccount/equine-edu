/* =============================================================================
   Equine Edu — Equine Anatomy (Intermediate) — Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'equine-anatomy',
  title:         'Equine Anatomy',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Expanding on Anatomy',
      type:  'Lesson',
      file:  '2-why-anatomy-matters.html',
      desc:  'Learn how this course expands the foundations course with more detailed physical anatomy vocabulary.'
    },
    {
      num:   2,
      title: 'Parts of the Horse',
      type:  'Lesson',
      file:  '3-equine-anatomy.html',
      desc:  'Five interactive region tabs: head, neck and shoulder, body, front legs, and hind legs, each with a labeled diagram and vocabulary cards for every anatomy part.'
    },
    {
      num:   3,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '5-training-barn.html',
      desc:  'Put your vocabulary to work with three activities: a term challenge, a region sort, and a matching game.'
    },
    {
      num:   4,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '6-test-your-knowledge.html',
      desc:  'Answer 15 questions drawn from a larger bank testing your recall of anatomy landmarks and vocabulary from all five regions.'
    }
  ]};
