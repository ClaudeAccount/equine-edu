/* =============================================================================
   Equine Edu - Parts of the Horse - Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   To add or reorder a module, edit this file only.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'parts-of-the-horse',
  title:         'Intro to Parts of the Horse',
  indexUrl:      '1-index.html',
  allCoursesUrl: '../../../index.html',
  homeUrl:       '../../../../index.html',

  modules: [
    {
      num:   1,
      title: 'Why It Matters',
      type:  'Lesson',
      file:  '2-why-it-matters.html',
      desc:  'Learn why knowing the parts of the horse is a foundation skill for every horse person.'
    },
    {
      num:   2,
      title: 'Parts of the Horse',
      type:  'Lesson',
      file:  '3-parts-of-the-horse.html',
      desc:  'Explore the head, neck and shoulders, body, and legs through organized visual tabs.'
    },
    {
      num:   3,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '5-training-barn.html',
      desc:  'Practice with interactive anatomy games designed to sharpen your knowledge.'
    },
    { num: 4, title: 'Study Guide', type: 'Review', file: '6-study-guide.html', desc: 'Self-test with reveal prompts on key body parts, topline landmarks, and shared leg terms.' },
    {
      num:   5,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '7-test-your-knowledge.html',
      desc:  'Answer 15 randomized questions drawn from a larger bank covering all course content.'
    }
  ]
};
