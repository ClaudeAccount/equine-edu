const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const courseRoot = path.join(root, 'courses/schooling-ring');
const issues = [];

function walk(directory, fileName) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(fullPath, fileName));
    else if (!fileName || entry.name === fileName) found.push(fullPath);
  }
  return found;
}

function addIssue(file, message) {
  issues.push({
    file: path.relative(root, file).replace(/\\/g, '/'),
    message
  });
}

for (const configPath of walk(courseRoot, 'course-config.js')) {
  const sandbox = { window: {} };
  let config;
  try {
    vm.runInNewContext(fs.readFileSync(configPath, 'utf8'), sandbox, {
      filename: configPath,
      timeout: 1000
    });
    config = sandbox.window.COURSE_CONFIG;
  } catch (error) {
    addIssue(configPath, `Configuration does not execute: ${error.message}`);
    continue;
  }

  if (!config || !Array.isArray(config.modules)) {
    addIssue(configPath, 'COURSE_CONFIG.modules is missing');
    continue;
  }

  const seen = new Set();
  let studyIndex = -1;
  let quizIndex = -1;

  config.modules.forEach((module, index) => {
    if (module.num !== index + 1) {
      addIssue(configPath, `Module ${module.num} is out of sequence at position ${index + 1}`);
    }
    if (seen.has(module.num)) addIssue(configPath, `Duplicate module number ${module.num}`);
    seen.add(module.num);

    if (/study guide/i.test(module.title)) studyIndex = index;
    if (/quiz/i.test(module.type) || /test your knowledge/i.test(module.title)) quizIndex = index;

    const modulePath = path.resolve(path.dirname(configPath), module.file);
    if (!fs.existsSync(modulePath)) {
      addIssue(configPath, `Missing module file: ${module.file}`);
      return;
    }

    const html = fs.readFileSync(modulePath, 'utf8');
    const currentMatch = html.match(/window\.CURRENT_MODULE\s*=\s*(\d+)/);
    if (!currentMatch || Number(currentMatch[1]) !== module.num) {
      addIssue(modulePath, `CURRENT_MODULE does not match module ${module.num}`);
    }
    if (!/assets\/js\/layout\.js/.test(html)) addIssue(modulePath, 'layout.js is missing');
    if (!/assets\/js\/course-nav\.js/.test(html)) addIssue(modulePath, 'course-nav.js is missing');

    if (index === quizIndex || /test-your-knowledge/i.test(module.file)) {
      if (!/questionCount\s*:\s*15/.test(html)) {
        addIssue(modulePath, 'Quiz does not deliver 15 questions');
      }
      if (!/progressKey\s*:/.test(html)) addIssue(modulePath, 'Quiz progressKey is missing');
    }
  });

  if (studyIndex >= 0 && quizIndex >= 0 && studyIndex > quizIndex) {
    addIssue(configPath, 'Study Guide appears after Test Your Knowledge');
  }
}

issues.sort((a, b) => a.file.localeCompare(b.file) || a.message.localeCompare(b.message));
if (issues.length) {
  console.error(JSON.stringify({ decision: 'FAIL', count: issues.length, issues }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ decision: 'PASS', count: 0, issues: [] }, null, 2));
}
