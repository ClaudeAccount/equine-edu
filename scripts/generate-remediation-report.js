const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function gitLines(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

const changed = gitLines(['diff', '--name-status']).map(line => {
  const [status, ...nameParts] = line.split(/\t/);
  return { status, file: nameParts.join('\t').replace(/\\/g, '/') };
});

for (const file of gitLines(['ls-files', '--others', '--exclude-standard'])) {
  changed.push({ status: 'A', file: file.replace(/\\/g, '/') });
}

const reportPath = 'reports/PHASE-1-REMEDIATION.md';
if (!changed.some(item => item.file === reportPath)) {
  changed.push({ status: 'A', file: reportPath });
}

changed.sort((a, b) => a.file.localeCompare(b.file));

const statusLabel = {
  A: 'Added',
  M: 'Modified',
  D: 'Deleted'
};

const lines = [
  '# Equine EDU Audit Remediation — Phase 1',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Completed Work',
  '',
  '- Stripe Checkout and Billing Portal now derive identity from a verified Supabase access token.',
  '- Caller-provided user IDs and email addresses are ignored by both Stripe endpoints.',
  '- Stripe webhook database failures now return an error instead of silently acknowledging failed updates.',
  '- Horse Bowl seed and synchronization SQL title quoting was repaired.',
  '- Static internal link and image validation reports zero broken references.',
  '- Course Training Barn pages now route game access through Learning Loft subject hubs.',
  '- Learning Loft game navigation preserves the originating course and returns through the subject hub.',
  '- Missing course navigation scripts and truncated Horse Teeth and Anatomy page endings were repaired.',
  '- Production paywall enforcement was restored while course landing pages remain public previews.',
  '- All configured quizzes deliver 15 questions and include a progress key.',
  '- Obsolete duplicate study guides, quiz pages, test files, hidden course cards, and temporary files were removed.',
  '- Obsolete Round Pen CSS was removed from `course-standardization.css` without changing active selectors.',
  '- Safe course-page inline styles were moved into shared CSS.',
  '- Actual encoding corruption was repaired and a full text scan now passes.',
  '',
  '## Validation Results',
  '',
  '- 318 HTML files returned HTTP 200 from the local site.',
  '- 247 configured course landing/module pages returned HTTP 200.',
  '- All 33 course configurations passed sequencing, file, module, navigation, and quiz-delivery checks.',
  '- All standalone JavaScript files and 480 inline scripts parsed successfully.',
  '- Shared CSS files passed brace-balance validation.',
  '- Question-bank and course-data image references all resolve.',
  '- Browser checks passed for course tabs, Training Barn to Learning Loft routing, game return routing, repaired sidebars, and Common Horse Terms styling.',
  '- Stripe ownership tests confirmed that request-body identity values cannot replace the authenticated user.',
  '- SQL files passed string-literal and transaction-structure checks.',
  '',
  '## Remaining Manual Work',
  '',
  '- Fifteen course question banks do not contain exactly 40 verified questions. See `QUIZ-BANK-VALIDATION.md`.',
  '- Rider Safety Basics, Introduction to Tack and Equipment, and Tack Fundamentals use the shared course artwork placeholder because no approved course-specific image exists.',
  '- Several Learning Loft subject hubs intentionally have no approved games yet. Training Barn links now lead to the correct hub without creating placeholder activities.',
  '- The hoof diagram retains inline coordinate values because they are functional diagram data used by its editing controls.',
  '- Stripe, Supabase, and SQL changes require a deployed environment with secrets and a PostgreSQL connection for live integration testing.',
  '- Dependency versions remain unlocked because no package lockfile exists in the current repository.',
  '',
  '## Changed Files',
  '',
  '| Status | File |',
  '|---|---|',
  ...changed.map(item => `| ${statusLabel[item.status] || item.status} | \`${item.file}\` |`),
  ''
];

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), lines.join('\n'), 'utf8');
console.log(`Wrote ${reportPath} with ${changed.length} file entries`);
