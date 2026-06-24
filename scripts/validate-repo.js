const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules']);
const textExtensions = new Set(['.html', '.css']);
const findings = [];

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

function decodeReference(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function isExternal(reference) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference);
}

function resolveReference(sourceFile, rawReference) {
  const reference = decodeReference(rawReference);
  if (!reference || isExternal(reference) || /[${}]/.test(reference) || /\s*\+\s*/.test(reference)) {
    return null;
  }

  const clean = reference.split('#')[0].split('?')[0];
  if (!clean) return null;

  if (clean.startsWith('/.netlify/')) return null;
  if (clean.startsWith('/')) return path.join(root, clean.replace(/^\/+/, ''));
  return path.resolve(path.dirname(sourceFile), clean);
}

function inspectHtml(file, text) {
  const attributePattern = /\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi;
  let match;
  while ((match = attributePattern.exec(text))) {
    const target = resolveReference(file, match[2]);
    if (target && !fs.existsSync(target)) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      findings.push({
        type: 'broken-reference',
        file: path.relative(root, file).replace(/\\/g, '/'),
        line,
        reference: decodeReference(match[2])
      });
    }
  }
}

function inspectCss(file, text) {
  const urlPattern = /url\(\s*(["']?)(.*?)\1\s*\)/gi;
  let match;
  while ((match = urlPattern.exec(text))) {
    const target = resolveReference(file, match[2]);
    if (target && !fs.existsSync(target)) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      findings.push({
        type: 'broken-css-reference',
        file: path.relative(root, file).replace(/\\/g, '/'),
        line,
        reference: decodeReference(match[2])
      });
    }
  }
}

for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  if (path.extname(file).toLowerCase() === '.html') inspectHtml(file, text);
  else inspectCss(file, text);
}

findings.sort((a, b) =>
  a.file.localeCompare(b.file) || a.line - b.line || a.reference.localeCompare(b.reference)
);

if (findings.length) {
  console.error(JSON.stringify({ decision: 'FAIL', count: findings.length, findings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ decision: 'PASS', count: 0, findings: [] }, null, 2));
}
