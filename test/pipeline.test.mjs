import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Running Extract Design System Docs — Pipeline Test Suite...');

try {
  console.log('1. Testing capture script...');
  execSync('node extract-design-system-docs/scripts/capture-pages.mjs --output ./output', { stdio: 'inherit' });

  console.log('2. Testing token normalization script...');
  execSync('node extract-design-system-docs/scripts/normalize-tokens.mjs --input ./output/evidence --output ./output', { stdio: 'inherit' });

  console.log('3. Testing component inference script...');
  execSync('node extract-design-system-docs/scripts/infer-components.mjs --input ./output/evidence --output ./output', { stdio: 'inherit' });

  console.log('4. Testing single-file HTML doc generator...');
  execSync('node extract-design-system-docs/scripts/generate-docs.mjs --input ./output --output ./output/index.html', { stdio: 'inherit' });

  console.log('5. Testing output document validator...');
  execSync('node extract-design-system-docs/scripts/validate-output.mjs --input ./output/index.html', { stdio: 'inherit' });

  const generatedHtml = path.resolve('./output/index.html');
  if (!fs.existsSync(generatedHtml)) {
    throw new Error('index.html was not generated');
  }

  console.log('\n🎉 ALL PIPELINE TESTS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('\n✖ Pipeline test suite failed:', err.message);
  process.exit(1);
}
