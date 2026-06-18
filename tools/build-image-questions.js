#!/usr/bin/env node
/* =============================================================================
   Equine EDU — curated IMAGE question bank
   ----------------------------------------------------------------------------
   Generates assets/data/image-questions.json: image-based questions that link
   to real images already in the course folders. Merged into the master bank by
   build-question-bank.js. Paths are root-relative so they resolve from the
   Horse Bowl page and the course quiz pages alike (site served from domain root).
   Add new groups here as more course image banks are created.
   ============================================================================= */
'use strict';
const fs = require('path');
const path = require('path');
const fsx = require('fs');

const REPO = process.argv[2] || path.join(__dirname, '..');

// ---- curated label -> filename maps (accuracy verified against course images)
const COLORS = {
  base: '/courses/schooling-ring/colors-markings/common-horse-colors/images/the-viewing-room/',
  courseId: 'common-horse-colors', category: 'colors', noun: 'coat color',
  items: [
    ['Bay','bay.png'],['Black','black.png'],['Buckskin','buckskin.png'],['Chestnut','chestnut.png'],
    ['Flaxen Chestnut','flaxen-chestnut.png'],['Gray','gray.png'],['Leopard Appaloosa','leopard-appaloosa.png'],
    ['Palomino','palomino.png'],['Strawberry Roan','strawberry-roan.png'],['Tobiano','tobiano.png']
  ]
};
const MARKINGS = {
  base: '/courses/schooling-ring/colors-markings/face-markings/images/viewing-room/',
  courseId: 'face-markings', category: 'markings', noun: 'face marking',
  items: [
    ['Bald Face','bald-face.png'],['Blaze and Snip','blaze-snip.png'],['Blaze','blaze.png'],
    ['Chin Spot','chin-spot.png'],['Snip','snip.png'],['Star and Snip','star-snip.png'],
    ['Star, Strip, and Snip','star-strip-snip.png'],['Star and Strip','star-strip.png'],
    ['Star','star.png'],['Strip and Snip','strip-snip.png'],['Strip','strip.png']
  ]
};
const BREEDS = {
  base: '/courses/schooling-ring/breeds/horse-and-pony-breeds/images/breeds/',
  courseId: 'horse-and-pony-breeds', category: 'breeds', noun: 'breed',
  items: [
    ['American Paint Horse','american-paint-horse.png'],['American Quarter Horse','american-quarter-horse.png'],
    ['American Saddlebred','american-saddlebred.png'],['Appaloosa','appaloosa.png'],['Arabian','arabian.png'],
    ['Belgian','belgian.png'],['Clydesdale','clydesdale.png'],['Fell Pony','fell-pony.png'],
    ['Falabella','fellabella-horse.png'],['Fjord','fjord.png'],['Friesian','friesian.png'],
    ['Gypsy Vanner','gypsy-vanner.png'],['Hackney Pony','hackney-pony.png'],['Haflinger','haflinger.png'],
    ['Miniature Horse','miniature-horse.png'],['Missouri Fox Trotter','missouri-fox-trotter.png'],
    ['Morgan','morgan.png'],['Mustang','mustang.png'],['National Show Horse','national-show-horse.png'],
    ['Percheron','percheron.png'],['POA Pony','poa-pony.png'],['Rocky Mountain Horse','rocky-mountain-horse.png'],
    ['Shetland Pony','shetland-pony.png'],['Shire','shire.png'],['Standardbred','standardbred.png'],
    ['Tennessee Walking Horse','tennessee-walking-horse.png'],['Thoroughbred','thoroughbred.png'],
    ['Welsh Pony','welsh-pony.png']
  ]
};

function buildGroup(g) {
  const labels = g.items.map(i => i[0]);
  const out = [];
  g.items.forEach((it, i) => {
    const [label, file] = it;
    // deterministic distractors: next three labels cyclically
    const distractors = [];
    for (let k = 1; k <= 3; k++) distractors.push(labels[(i + k) % labels.length]);
    // stable option order: correct slotted by index%4
    const opts = distractors.slice();
    opts.splice(i % 4, 0, label);
    out.push({
      question: 'Which ' + g.noun + ' is shown in the photo?',
      options: opts,
      correctAnswer: label,
      category: g.category,
      courseId: g.courseId,
      difficulty: 'medium',
      image: g.base + file,
      explanationCorrect: 'Correct — the ' + g.noun + ' shown is ' + label + '.',
      explanationIncorrect: 'Look again at the photo — the ' + g.noun + ' shown is ' + label + '.'
    });
  });
  return out;
}

let questions = [];
[COLORS, MARKINGS, BREEDS].forEach(g => { questions = questions.concat(buildGroup(g)); });

// verify every referenced image actually exists
let missing = 0;
questions.forEach(q => {
  const p = path.join(REPO, q.image.replace(/^\//, ''));
  if (!fsx.existsSync(p)) { console.warn('  ! missing image:', q.image); missing++; }
});

const outDir = path.join(REPO, 'assets', 'data');
fsx.mkdirSync(outDir, { recursive: true });
fsx.writeFileSync(path.join(outDir, 'image-questions.json'),
  JSON.stringify({ generated: new Date().toISOString(), count: questions.length, questions }, null, 2));
console.log('image questions:', questions.length, '| missing images:', missing);
console.log('  by category:', questions.reduce((a, q) => (a[q.category] = (a[q.category]||0)+1, a), {}));
