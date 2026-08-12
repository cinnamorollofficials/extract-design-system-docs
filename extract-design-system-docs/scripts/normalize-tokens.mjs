import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import { validateData } from './lib/schema-validator.mjs';

const options = {
  input: { type: 'string', short: 'i', default: './output/evidence' },
  output: { type: 'string', short: 'o', default: './output' }
};

let args;
try {
  args = parseArgs({ options, allowPositionals: true }).values;
} catch (e) {
  args = { input: './output/evidence', output: './output' };
}

const inputDir = path.resolve(args.input);
const outputDir = path.resolve(args.output);

if (!fs.existsSync(inputDir)) {
  console.error(`Input evidence directory not found: ${inputDir}. Run capture-pages.mjs first.`);
  process.exit(1);
}

console.log('Normalizing design tokens from evidence...');

// Load evidence files
const files = fs.readdirSync(inputDir).filter(f => f.startsWith('page_') && f.endsWith('.json'));
if (files.length === 0) {
  console.error('No page evidence JSON files found in evidence directory.');
  process.exit(1);
}

const rawColors = new Map();
const rawFonts = new Set();
const rawSizes = new Set();
const rawSpacing = new Set();
const rawRadii = new Set();
const rawShadows = new Set();
const provenanceList = [];

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (data.fontFamilies) {
    data.fontFamilies.forEach(f => rawFonts.add(f));
  }

  if (data.elements) {
    data.elements.forEach(el => {
      const style = el.computedStyle || {};
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
        const c = style.backgroundColor;
        rawColors.set(c, (rawColors.get(c) || 0) + 1);
        provenanceList.push({
          sourceUrl: data.pageUrl,
          viewport: data.viewport,
          selector: el.selector,
          cssProperty: 'backgroundColor',
          observedValue: c
        });
      }

      if (style.color) {
        const c = style.color;
        rawColors.set(c, (rawColors.get(c) || 0) + 1);
        provenanceList.push({
          sourceUrl: data.pageUrl,
          viewport: data.viewport,
          selector: el.selector,
          cssProperty: 'color',
          observedValue: c
        });
      }

      if (style.fontSize) rawSizes.add(style.fontSize);
      if (style.paddingTop) rawSpacing.add(style.paddingTop);
      if (style.paddingLeft) rawSpacing.add(style.paddingLeft);
      if (style.borderRadius && style.borderRadius !== '0px') rawRadii.add(style.borderRadius);
      if (style.boxShadow && style.boxShadow !== 'none') rawShadows.add(style.boxShadow);
    });
  }
});

// Convert colors to hex helper
function colorToHex(rgbStr) {
  if (rgbStr.startsWith('#')) return rgbStr;
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return rgbStr;
  const [r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Construct Primitives
const primitiveColors = {};
let colorIdx = 100;
Array.from(rawColors.keys()).forEach(col => {
  const hex = colorToHex(col);
  const name = `color-brand-${colorIdx}`;
  primitiveColors[name] = hex;
  colorIdx += 100;
});

const primitiveTypography = {
  'font-family-base': Array.from(rawFonts)[0] || 'Inter, sans-serif'
};
Array.from(rawSizes).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach((sz, idx) => {
  primitiveTypography[`font-size-${idx + 1}`] = sz;
});

const primitiveSpacing = {};
Array.from(rawSpacing).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach((sp, idx) => {
  primitiveSpacing[`space-${idx + 1}`] = sp;
});

const primitiveRadii = {};
Array.from(rawRadii).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach((rd, idx) => {
  primitiveRadii[`radius-${idx + 1}`] = rd;
});

const primitiveShadows = {};
Array.from(rawShadows).forEach((sh, idx) => {
  primitiveShadows[`shadow-${idx + 1}`] = sh;
});

// Construct Semantics
const primaryColorEntry = Array.from(rawColors.entries()).sort((a, b) => b[1] - a[1])[0];
const primaryHex = primaryColorEntry ? colorToHex(primaryColorEntry[0]) : '#0d6efd';

const semantics = [
  {
    name: 'color-action-primary',
    role: 'Primary action and interactive element background',
    primitiveRef: Object.keys(primitiveColors)[0] || 'color-brand-100',
    confidence: 'confirmed',
    provenance: provenanceList.slice(0, 5)
  },
  {
    name: 'color-text-primary',
    role: 'Primary body text color',
    primitiveRef: 'color-brand-200',
    confidence: 'inferred',
    provenance: provenanceList.filter(p => p.cssProperty === 'color').slice(0, 3)
  }
];

const tokensModel = {
  primitives: {
    colors: primitiveColors,
    typography: primitiveTypography,
    spacing: primitiveSpacing,
    radii: primitiveRadii,
    shadows: primitiveShadows
  },
  semantics,
  conflicts: [],
  exclusions: []
};

const valResult = validateData('tokens', tokensModel);
if (!valResult.valid) {
  console.warn('Tokens validation warnings:', valResult.errors);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'tokens.json'), JSON.stringify(tokensModel, null, 2));
console.log(`Tokens normalized successfully! Saved to ${path.join(outputDir, 'tokens.json')}`);
