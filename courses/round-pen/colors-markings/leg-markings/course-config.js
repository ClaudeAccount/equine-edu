/* =============================================================================
   Equine Edu - Horse Leg Markings - Course Config
   Course configuration for the leg markings learning path.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'leg-markings',
  title:         'Horse Leg Markings',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Why Leg Markings Matter',
      type:  'Lesson',
      file:  '2-why-markings-matter.html',
      desc:  'Learn why leg markings are useful for identification and why exact leg location matters.'
    },
    {
      num:   2,
      title: 'Parts of the Front & Hind Leg',
      type:  'Lesson',
      file:  '3-leg-anatomy.html',
      desc:  'Study the parts of the horse that help describe where white begins, ends, and changes name.'
    },
    {
      num:   3,
      title: 'Horse Leg Markings',
      type:  'Lesson',
      file:  '4-leg-markings.html',
      desc:  'Study leg markings, partial markings, and height-on-leg examples in one tabbed reference.'
    },
    {
      num:   4,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '5-viewing-room.html',
      desc:  'Practice identifying leg markings using real horse photo flip cards.'
    },
    {
      num:   5,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '6-training-barn.html',
      desc:  'Open linked practice games, downloads, references, and course resources.'
    },
    { num: 6, title: 'Study Guide', type: 'Review', file: '7-study-guide.html', desc: 'Self-test with reveal prompts on height-based names, partial markings, and ermine marks.' },
    {
      num:   7,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '8-test-your-knowledge.html',
      desc:  'Answer randomized leg marking questions with text and photo identification practice.'
    }
  ]
};
