/* =============================================================================
   Equine Edu - Horse Face Markings - Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   To add or reorder a module, edit this file only.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'face-markings',
  title:         'Horse Face Markings',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Why Markings Matter',
      type:  'Lesson',
      file:  '2-why-markings-matter.html',
      desc:  'Learn why face markings are useful for identification, records, and clear horse descriptions.'
    },
    {
      num:   2,
      title: 'Parts of the Face',
      type:  'Lesson',
      file:  '3-face-anatomy.html',
      desc:  'Learn the key facial landmarks that make marking names easier to understand.'
    },
    {
      num:   3,
      title: 'Horse Face Markings',
      type:  'Lesson',
      file:  '4-face-markings.html',
      desc:  'Study common markings, combination markings, and irregular markings in clear tabs.'
    },
    {
      num:   4,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '5-viewing-room.html',
      desc:  'Practice identifying markings using real horse photo flip cards.'
    },
    {
      num:   5,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '6-training-barn.html',
      desc:  'Open linked practice tools, games, references, and course resources.'
    },
    { num: 6, title: 'Study Guide', type: 'Review', file: '7-study-guide.html', desc: 'Self-test with reveal prompts on marking names, combinations, and description rules.' },
    {
      num:   7,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '8-test-your-knowledge.html',
      desc:  'Answer randomized questions with text and photo identification practice.'
    }
  ]
};
