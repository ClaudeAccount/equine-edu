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
      title: 'Why External Anatomy',
      type:  'Lesson',
      file:  '2-why-anatomy-matters.html',
      desc:  'Learn why developing your eye for external structures makes you a more observant, capable, and confident horse person.'
    },
    {
      num:   2,
      title: 'External Structures',
      type:  'Lesson',
      file:  '3-equine-anatomy.html',
      desc:  'Work through all four regions of the horse — head, neck and shoulder, body, and legs — covering every external landmark, visible structure, and palpable feature.'
    },
    {
      num:   3,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '4-viewing-room.html',
      desc:  'Review every external structure with region-sorted flip cards. Click to reveal what each part looks like, where it sits, and what it tells you.'
    },
    {
      num:   4,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '5-training-barn.html',
      desc:  'Test your recall and deepen your understanding with two interactive activities built around external structures and what they tell you.'
    },
    {
      num:   5,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '6-test-your-knowledge.html',
      desc:  'Answer 15 questions drawn from a larger bank covering external landmarks, visual assessment, palpation, and conformation basics.'
    }
  ]
};
