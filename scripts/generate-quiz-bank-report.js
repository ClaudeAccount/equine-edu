const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const bank = JSON.parse(
  fs.readFileSync(path.join(root, 'assets/data/question-bank.json'), 'utf8')
);
const expectedCount = 40;
const counts = new Map();

for (const question of bank.questions || []) {
  counts.set(question.courseId, (counts.get(question.courseId) || 0) + 1);
}

function walk(directory, fileName) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(fullPath, fileName));
    else if (entry.name === fileName) found.push(fullPath);
  }
  return found;
}

const courses = [];
for (const configPath of walk(path.join(root, 'courses/schooling-ring'), 'course-config.js')) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(configPath, 'utf8'), sandbox, {
    filename: configPath,
    timeout: 1000
  });
  const config = sandbox.window.COURSE_CONFIG;
  if (!config || !config.id) continue;
  const count = counts.get(config.id) || 0;
  courses.push({
    course: config.title,
    courseId: config.id,
    currentCount: count,
    expectedCount,
    status: count === expectedCount ? 'PASS' : 'DEFICIENT'
  });
}

courses.sort((a, b) => a.course.localeCompare(b.course));
const deficient = courses.filter(course => course.status !== 'PASS');
const generatedAt = new Date().toISOString();
const report = {
  generatedAt,
  standard: {
    bankQuestionsPerCourse: expectedCount,
    deliveredQuestionsPerAttempt: 15
  },
  summary: {
    courseCount: courses.length,
    compliant: courses.length - deficient.length,
    deficient: deficient.length
  },
  courses
};

const reportDirectory = path.join(root, 'reports');
fs.mkdirSync(reportDirectory, { recursive: true });
fs.writeFileSync(
  path.join(reportDirectory, 'quiz-bank-validation.json'),
  JSON.stringify(report, null, 2) + '\n',
  'utf8'
);

const markdown = [
  '# Quiz Bank Validation Report',
  '',
  `Generated: ${generatedAt}`,
  '',
  'Equine EDU standard: 40 verified questions per course bank and 15 questions delivered per attempt.',
  '',
  `Courses audited: ${courses.length}`,
  `Compliant banks: ${courses.length - deficient.length}`,
  `Deficient banks: ${deficient.length}`,
  '',
  '| Course | Course ID | Current | Expected | Status |',
  '|---|---|---:|---:|---|',
  ...courses.map(course =>
    `| ${course.course.replace(/\|/g, '\\|')} | \`${course.courseId}\` | ${course.currentCount} | ${course.expectedCount} | ${course.status} |`
  ),
  '',
  'No questions were created or changed by this audit.',
  ''
].join('\n');

fs.writeFileSync(
  path.join(reportDirectory, 'QUIZ-BANK-VALIDATION.md'),
  markdown,
  'utf8'
);

console.log(JSON.stringify(report.summary));
