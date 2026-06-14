/* =============================================================================
   Equine Edu — Base Coat Colors — Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   To add or reorder a module, edit this file only.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'base-coat-colors',
  title:         'Base Coat Colors',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Why Color Matters',
      type:  'Lesson',
      file:  '2-why-color-matters.html',
      desc:  'Learn why coat color identification matters for records, communication, and everyday horse care.'
    },
    {
      num:   2,
      title: 'What Is Pigment?',
      type:  'Lesson',
      file:  '3-pigment-basics.html',
      desc:  'Discover the two pigments behind every horse coat color — and why white markings are the absence of color.'
    },
    {
      num:   3,
      title: 'The Three Base Coat Colors',
      type:  'Lesson',
      file:  '4-base-coat-colors.html',
      desc:  'Chestnut, black, and bay — what makes each one unique and how to identify them on sight.'
    },
    {
      num:   4,
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '5-viewing-room.html',
      desc:  'Practice identifying chestnut, black, and bay using real horse photo flip cards.'
    },
    {
      num:   5,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '6-training-barn.html',
      desc:  'Open linked practice tools, comparisons, and course resources.'
    },
    { num: 6, title: 'Study Guide', type: 'Review', file: '7-study-guide.html', desc: 'Self-test with reveal prompts on the three base colors, two pigments, and common mix-ups.' },
    {
      num:   7,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '8-test-your-knowledge.html',
      desc:  'Answer randomized questions covering pigment, identification, and common mix-ups.'
    }
  ]
};
