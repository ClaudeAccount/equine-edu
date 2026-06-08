/* =============================================================================
   Equine Edu — Common Horse Colors — Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   To add or reorder a module, edit this file only.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'common-horse-colors',
  title:         'Common Horse Colors',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Why Colors Matter',
      type:  'Lesson',
      file:  '2-why-colors-matter.html',
      desc:  'Discover why coat color matters for identification, breed standards, registration, and clear horse descriptions.'
    },
    {
      num:   2,
      title: 'Common Horse Colors',
      type:  'Lesson',
      file:  '3-color-types.html',
      desc:  'Explore five color families — base coat colors, dilute colors, gray, roan, and patterned coats — in one guided lesson.'
    },
    {
      num:   3,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '8-viewing-room.html',
      desc:  'Practice identifying coat colors using real horse photo flip cards.'
    },
    {
      num:   4,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '9-training-barn.html',
      desc:  'Learning through tools, games, references and course resources.'
    },
    {
      num:   5,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '10-test-your-knowledge.html',
      desc:  'Answer randomized questions with text and photo identification practice.'
    }
  ]
};
