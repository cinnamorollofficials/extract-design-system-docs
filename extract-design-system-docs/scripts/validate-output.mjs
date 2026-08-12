import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const options = {
  input: { type: 'string', short: 'i', default: './output/index.html' }
};

let args;
try {
  args = parseArgs({ options, allowPositionals: true }).values;
} catch (e) {
  args = { input: './output/index.html' };
}

const htmlFile = path.resolve(args.input);

console.log(`Validating output document: ${htmlFile}...`);

if (!fs.existsSync(htmlFile)) {
  console.error(`Error: File not found at ${htmlFile}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlFile, 'utf8');
const errors = [];
const warnings = [];

// 1. Basic HTML structure validation
if (!html.includes('<!DOCTYPE html>')) errors.push('Missing <!DOCTYPE html> declaration');
if (!html.includes('<html') || !html.includes('</html>')) errors.push('Missing <html> root element');
if (!html.includes('<head>') || !html.includes('</head>')) errors.push('Missing <head> element');
if (!html.includes('<body>') || !html.includes('</body>')) errors.push('Missing <body> element');

// 2. Check for duplicate IDs
const idMatches = html.match(/id=["']([^"']+)["']/g) || [];
const ids = idMatches.map(m => m.split('=')[1].replace(/["']/g, ''));
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  errors.push(`Duplicate DOM IDs found: ${Array.from(new Set(duplicateIds)).join(', ')}`);
}

// 3. Offline Portability Check (no remote scripts or stylesheets)
if (/<script[^>]+src=["']http/i.test(html) || /<link[^>]+href=["']http/i.test(html)) {
  warnings.push('External network dependencies detected in output HTML');
}

// 4. Accessibility Checks
if (!html.includes('lang="en"') && !html.includes('lang=')) {
  warnings.push('Missing lang attribute on <html> element');
}

if (!html.includes('<title>') || html.includes('<title></title>')) {
  errors.push('Missing or empty <title> tag');
}

console.log('\n--- Validation Summary ---');
if (errors.length > 0) {
  console.error(`FAILED! Found ${errors.length} critical errors:`);
  errors.forEach(e => console.error(`  ✖ ${e}`));
} else {
  console.log('✔ All critical validation checks PASSED!');
}

if (warnings.length > 0) {
  console.warn(`Warnings (${warnings.length}):`);
  warnings.forEach(w => console.warn(`  ⚠ ${w}`));
}

if (errors.length > 0) {
  process.exit(1);
}
