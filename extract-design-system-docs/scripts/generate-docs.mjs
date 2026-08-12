import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const options = {
  input: { type: 'string', short: 'i', default: './output' },
  output: { type: 'string', short: 'o', default: './output/index.html' }
};

let args;
try {
  args = parseArgs({ options, allowPositionals: true }).values;
} catch (e) {
  args = { input: './output', output: './output/index.html' };
}

const inputDir = path.resolve(args.input);
const outputFile = path.resolve(args.output);

console.log('Generating single-file standalone index.html documentation...');

const tokensPath = path.join(inputDir, 'tokens.json');
const componentsPath = path.join(inputDir, 'components.json');
const summaryPath = path.join(inputDir, 'evidence/job-summary.json');
const templatePath = path.resolve(process.cwd(), 'extract-design-system-docs/assets/documentation-shell/template.html');

if (!fs.existsSync(tokensPath) || !fs.existsSync(componentsPath)) {
  console.error('Missing tokens.json or components.json. Run normalize-tokens.mjs and infer-components.mjs first.');
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
const components = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));
const summary = fs.existsSync(summaryPath) ? JSON.parse(fs.readFileSync(summaryPath, 'utf8')) : { targetUrls: [] };
let template = fs.readFileSync(templatePath, 'utf8');

// Build Color Swatches HTML
let colorSwatchesHtml = '';
const colors = tokens.primitives?.colors || {};
Object.entries(colors).forEach(([name, hex]) => {
  colorSwatchesHtml += `
    <div class="swatch-card">
      <div class="swatch-preview" style="background-color: ${hex};"></div>
      <div class="swatch-info">
        <div class="swatch-name">var(--${name})</div>
        <div class="swatch-value">${hex}</div>
      </div>
    </div>
  `;
});

// Build Component Links & Sections HTML
let sidebarLinksHtml = '';
let componentsSectionHtml = '';

(components.components || []).forEach((comp, idx) => {
  const compId = `component-${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  sidebarLinksHtml += `<a href="#${compId}" class="nav-link">${comp.name}</a>\n`;

  const codeId = `code-snippet-${idx}`;
  const escapedHtml = (comp.htmlTemplate || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const escapedCss = (comp.cssRules || '');

  componentsSectionHtml += `
    <div id="${compId}" class="component-card">
      <div class="component-header">
        <h3 class="component-title">${comp.name}</h3>
        <span class="component-badge">${comp.category} • Usage (${comp.usageCount})</span>
      </div>
      <div class="component-preview-box">
        <style>${comp.cssRules || ''}</style>
        ${comp.htmlTemplate || ''}
      </div>
      <div class="code-box">
        <button class="copy-btn" onclick="copySnippet(this, '${codeId}')">Copy Code</button>
        <pre id="${codeId}"><code>&lt;!-- HTML --&gt;
${escapedHtml}

&lt;!-- CSS --&gt;
${escapedCss}</code></pre>
      </div>
    </div>
  `;
});

// Replace template placeholders
const finalHtml = template
  .replace(/{{DOCUMENT_TITLE}}/g, 'Design System')
  .replace(/{{BRAND_NAME}}/g, 'Design System')
  .replace(/{{SOURCE_URL_COUNT}}/g, summary.targetUrls?.length || 3)
  .replace(/{{GENERATED_DATE}}/g, new Date().toLocaleDateString())
  .replace(/{{COLOR_SWATCHES_HTML}}/g, colorSwatchesHtml)
  .replace(/{{SIDEBAR_COMPONENT_LINKS}}/g, sidebarLinksHtml)
  .replace(/{{COMPONENTS_SECTION_HTML}}/g, componentsSectionHtml)
  .replace(/{{AUDIT_LOG_JSON}}/g, JSON.stringify({ summary, tokens: { semantics: tokens.semantics } }, null, 2));

const outDir = path.dirname(outputFile);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputFile, finalHtml, 'utf8');
console.log(`Single-file documentation successfully generated at ${outputFile}!`);
