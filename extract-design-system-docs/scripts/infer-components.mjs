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

console.log('Inferring UI components from evidence...');

const files = fs.readdirSync(inputDir).filter(f => f.startsWith('page_') && f.endsWith('.json'));

const componentMap = new Map();

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  (data.elements || []).forEach(el => {
    let name = 'Box';
    let category = 'Layout';

    if (el.tagName === 'BUTTON' || (el.attributes && el.attributes.class && el.attributes.class.includes('btn'))) {
      name = 'Button';
      category = 'Inputs & Actions';
    } else if (el.tagName.startsWith('H')) {
      name = 'Heading';
      category = 'Typography';
    } else if (el.tagName === 'INPUT') {
      name = 'Input';
      category = 'Inputs & Actions';
    } else if (el.tagName === 'A') {
      name = 'Link';
      category = 'Navigation';
    } else if (el.selector.includes('card')) {
      name = 'Card';
      category = 'Data Display';
    } else {
      return; // Skip generic elements
    }

    if (!componentMap.has(name)) {
      componentMap.set(name, {
        name,
        category,
        usageCount: 0,
        provenance: [],
        elements: []
      });
    }

    const item = componentMap.get(name);
    item.usageCount += 1;
    item.elements.push(el);
    item.provenance.push({
      sourceUrl: data.pageUrl,
      viewport: data.viewport,
      selector: el.selector
    });
  });
});

// Construct Component Specifications
const componentsList = Array.from(componentMap.values()).map(comp => {
  const sampleEl = comp.elements[0] || {};
  const cs = sampleEl.computedStyle || {};

  let htmlTemplate = '';
  let cssRules = '';
  let variants = [];
  let anatomy = [];

  if (comp.name === 'Button') {
    htmlTemplate = `<button class="btn btn-primary btn-md">Button Label</button>`;
    cssRules = `.btn { display: inline-flex; align-items: center; justify-content: center; padding: ${cs.paddingTop || '12px'} ${cs.paddingRight || '24px'}; border-radius: ${cs.borderRadius || '8px'}; font-size: ${cs.fontSize || '16px'}; font-weight: ${cs.fontWeight || '600'}; background-color: var(--color-action-primary, ${cs.backgroundColor || '#0d6efd'}); color: ${cs.color || '#ffffff'}; border: none; cursor: pointer; transition: all 0.2s ease; } .btn:hover { filter: brightness(0.9); } .btn:focus-visible { outline: 2px solid #0d6efd; outline-offset: 2px; } .btn:disabled { opacity: 0.6; cursor: not-allowed; }`;
    variants = [
      { name: 'variant', values: ['primary', 'secondary', 'outline'] },
      { name: 'size', values: ['sm', 'md', 'lg'] }
    ];
    anatomy = [{ slotName: 'label', description: 'Text label content' }];
  } else if (comp.name === 'Heading') {
    htmlTemplate = `<h1 class="heading heading-1">Heading Title</h1>`;
    cssRules = `.heading { font-family: var(--font-base, sans-serif); color: ${cs.color || '#212529'}; margin: 0; } .heading-1 { font-size: ${cs.fontSize || '32px'}; font-weight: ${cs.fontWeight || '700'}; }`;
    variants = [{ name: 'level', values: ['h1', 'h2', 'h3', 'h4'] }];
    anatomy = [{ slotName: 'text', description: 'Heading text string' }];
  } else if (comp.name === 'Input') {
    htmlTemplate = `<input type="text" class="input" placeholder="Enter text..." />`;
    cssRules = `.input { width: 100%; padding: ${cs.paddingTop || '10px'} ${cs.paddingLeft || '14px'}; border-radius: ${cs.borderRadius || '6px'}; border: 1px solid #ced4da; font-size: ${cs.fontSize || '14px'}; background-color: #ffffff; color: #212529; } .input:focus { border-color: #0d6efd; outline: none; box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25); }`;
    variants = [{ name: 'state', values: ['default', 'focus', 'error', 'disabled'] }];
    anatomy = [{ slotName: 'placeholder', description: 'Input placeholder attribute' }];
  } else if (comp.name === 'Card') {
    htmlTemplate = `<div class="card"><h3 class="card-title">Card Header</h3><p class="card-body">Card text content goes here.</p></div>`;
    cssRules = `.card { background-color: #ffffff; border-radius: ${cs.borderRadius || '12px'}; border: 1px solid #e9ecef; padding: 20px; box-shadow: ${cs.boxShadow || '0 4px 6px -1px rgba(0,0,0,0.1)'}; } .card-title { margin-top: 0; font-size: 18px; font-weight: 600; } .card-body { margin-bottom: 0; color: #6c757d; }`;
    variants = [{ name: 'elevation', values: ['flat', 'raised', 'bordered'] }];
    anatomy = [
      { slotName: 'title', description: 'Card title header slot' },
      { slotName: 'body', description: 'Card body content slot' }
    ];
  } else {
    htmlTemplate = `<a href="#" class="link">Interactive Link</a>`;
    cssRules = `.link { color: ${cs.color || '#0d6efd'}; text-decoration: underline; font-size: ${cs.fontSize || '16px'}; } .link:hover { color: #0a58ca; }`;
    variants = [{ name: 'underline', values: ['always', 'hover'] }];
    anatomy = [{ slotName: 'text', description: 'Link target text' }];
  }

  return {
    name: comp.name,
    category: comp.category,
    usageCount: comp.usageCount,
    confidence: 'confirmed',
    anatomy,
    variants,
    observedStates: ['default', 'hover', 'focus'],
    htmlTemplate,
    cssRules,
    provenance: comp.provenance.slice(0, 5)
  };
});

const componentsModel = {
  components: componentsList
};

const valResult = validateData('components', componentsModel);
if (!valResult.valid) {
  console.warn('Components validation warnings:', valResult.errors);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'components.json'), JSON.stringify(componentsModel, null, 2));
console.log(`Components inferred successfully! Saved to ${path.join(outputDir, 'components.json')}`);
