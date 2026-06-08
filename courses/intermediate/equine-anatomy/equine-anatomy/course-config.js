/* =============================================================================
   Equine Edu — External Equine Anatomy (Intermediate) — Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'equine-anatomy',
  title:         'External Equine Anatomy',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Expanding on Anatomy',
      type:  'Lesson',
      file:  '2-why-anatomy-matters.html',
      desc:  'Learn why developing your eye for external structures makes you a more observant, capable, and confident horse person.'
    },
    {
      num:   2,
      title: 'External Structures',
      type:  'Lesson',
      file:  '3-equine-anatomy.html',
      desc:  'Five interactive region tabs — head, neck and shoulder, body, front legs, and back legs — each with a labeled diagram and vocabulary cards for every external structure.'
    },
    {
      num:   3,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '4-viewing-room.html',
      desc:  'See the full horse in one view — every external landmark labeled on a single whole-horse diagram. Drag any dot or label to reposition it and study how all four regions connect.'
    },
    {
      num:   4,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '5-training-barn.html',
      desc:  'Put your vocabulary to work with three activities: a term challenge, a region sort, and a matching game.'
    },
    {
      num:   5,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '6-test-your-knowledge.html',
      desc:  'Answer 15 questions drawn from a larger bank testing your recall of external landmarks and vocabulary from all five regions.'
    }
  ]
};
