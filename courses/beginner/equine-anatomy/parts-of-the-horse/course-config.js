/* =============================================================================
   Equine Edu — Parts of the Horse — Course Config
   Single source of truth for this course's module list.
   Loaded by every lesson page in this folder.
   To add or reorder a module, edit this file only.
   ============================================================================= */

window.COURSE_CONFIG = {
  id:            'parts-of-the-horse',
  title:         'Intro to Equine Anatomy',
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
      title: 'The Viewing Room',
      type:  'Practice',
      file:  '4-viewing-room.html',
      desc:  'Test your recognition using flip cards that reveal each part name and description.'
    },
    {
      num:   4,
      title: 'The Training Barn',
      type:  'Learning Lab',
      file:  '5-training-barn.html',
      desc:  'Practice with three interactive anatomy games designed to sharpen your knowledge.'
    },
    {
      num:   5,
      title: 'Test Your Knowledge',
      type:  'Quiz',
      file:  '6-test-your-knowledge.html',
      desc:  'Answer 15 randomized questions drawn from a larger bank covering all course content.'
    }
  ]
};
