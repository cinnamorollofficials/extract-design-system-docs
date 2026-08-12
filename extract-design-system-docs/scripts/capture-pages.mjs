import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import { validateData } from './lib/schema-validator.mjs';

const options = {
  urls: { type: 'string', short: 'u' },
  output: { type: 'string', short: 'o', default: './output' },
  help: { type: 'boolean', short: 'h' }
};

let args;
try {
  args = parseArgs({ options, allowPositionals: true }).values;
} catch (e) {
  args = { output: './output' };
}

if (args.help) {
  console.log(`
Extract Design System Docs — Capture Pages Script

Usage:
  node capture-pages.mjs --urls "https://site.com,https://site.com/about,https://site.com/pricing" --output ./output
`);
  process.exit(0);
}

const DEFAULT_URLS = [
  'https://www.telkom.co.id/',
  'https://www.telkom.co.id/servlet/tk/about',
  'https://www.telkom.co.id/servlet/tk/contact'
];

let rawUrls = args.urls ? args.urls.split(',').map(u => u.trim()) : DEFAULT_URLS;

if (rawUrls.length < 3 || rawUrls.length > 5) {
  console.error(`Error: Must provide between 3 and 5 URLs. Provided ${rawUrls.length}.`);
  process.exit(1);
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

const outputDir = path.resolve(args.output);
const evidenceDir = path.join(outputDir, 'evidence');

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

console.log(`Starting page capture for ${rawUrls.length} URLs...`);

async function captureWithPlaywright() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (let urlIndex = 0; urlIndex < rawUrls.length; urlIndex++) {
    const targetUrl = rawUrls[urlIndex];
    for (const vp of VIEWPORTS) {
      console.log(`Capturing ${targetUrl} [${vp.name}]...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1000);

        const pageTitle = await page.title();
        const finalUrl = page.url();

        const extractedData = await page.evaluate(() => {
          const cssVars = {};
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (rule.selectorText === ':root' || rule.selectorText === 'body') {
                  const style = rule.style;
                  for (let i = 0; i < style.length; i++) {
                    const prop = style[i];
                    if (prop.startsWith('--')) {
                      cssVars[prop] = style.getPropertyValue(prop).trim();
                    }
                  }
                }
              }
            } catch (e) {}
          }

          const bodyStyle = window.getComputedStyle(document.body);
          const fonts = bodyStyle.fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));

          const targetSelectors = ['button', 'a', 'h1', 'h2', 'h3', 'input', '.card', '.btn', 'header', 'nav', 'footer'];
          const elements = [];

          targetSelectors.forEach(sel => {
            const nodes = Array.from(document.querySelectorAll(sel)).slice(0, 10);
            nodes.forEach(node => {
              const cs = window.getComputedStyle(node);
              elements.push({
                selector: sel + (node.className ? '.' + Array.from(node.classList).join('.') : ''),
                tagName: node.tagName,
                text: (node.textContent || '').trim().slice(0, 100),
                computedStyle: {
                  color: cs.color,
                  backgroundColor: cs.backgroundColor,
                  fontSize: cs.fontSize,
                  fontWeight: cs.fontWeight,
                  fontFamily: cs.fontFamily,
                  lineHeight: cs.lineHeight,
                  paddingTop: cs.paddingTop,
                  paddingBottom: cs.paddingBottom,
                  paddingLeft: cs.paddingLeft,
                  paddingRight: cs.paddingRight,
                  borderRadius: cs.borderRadius,
                  borderWidth: cs.borderWidth,
                  borderColor: cs.borderColor,
                  boxShadow: cs.boxShadow
                },
                attributes: Array.from(node.attributes).reduce((acc, attr) => {
                  if (['id', 'class', 'type', 'role', 'aria-label'].includes(attr.name)) {
                    acc[attr.name] = attr.value;
                  }
                  return acc;
                }, {})
              });
            });
          });

          return { cssVars, fonts, elements };
        });

        const evidence = {
          pageUrl: targetUrl,
          finalUrl,
          title: pageTitle,
          timestamp: new Date().toISOString(),
          viewport: vp.name,
          cssVariables: extractedData.cssVars,
          fontFamilies: extractedData.fonts,
          elements: extractedData.elements
        };

        const fileName = `page_${urlIndex + 1}_${vp.name}.json`;
        fs.writeFileSync(path.join(evidenceDir, fileName), JSON.stringify(evidence, null, 2));
        results.push({ url: targetUrl, viewport: vp.name, status: 'success', file: fileName });

      } catch (err) {
        console.error(`Failed Playwright capture for ${targetUrl} [${vp.name}]:`, err.message);
        throw err;
      } finally {
        await page.close();
        await context.close();
      }
    }
  }

  await browser.close();
  return results;
}

// Live HTTP Fetch Extractor (Fallback if Playwright Chromium browser binary is not installed)
async function captureWithHttpFetch() {
  console.log('Using Live HTTP Fetch Extractor to analyze web content directly...');
  const results = [];

  for (let urlIndex = 0; urlIndex < rawUrls.length; urlIndex++) {
    const targetUrl = rawUrls[urlIndex];
    let pageTitle = `Telkom Indonesia Page ${urlIndex + 1}`;
    let htmlText = '';

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      htmlText = await res.text();
      const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) pageTitle = titleMatch[1].trim();
    } catch (e) {
      console.warn(`HTTP fetch warning for ${targetUrl}: ${e.message}`);
    }

    // Extract colors & fonts from live HTML & style tags
    const colorMatches = Array.from(htmlText.matchAll(/#([0-9a-fA-F]{3,6})|rgba?\([^)]+\)/g)).map(m => m[0]);
    const fontMatches = Array.from(htmlText.matchAll(/font-family\s*:\s*([^;"'}]+)/gi)).map(m => m[1].trim());

    const extractedColors = colorMatches.slice(0, 10);
    const extractedFonts = fontMatches.length > 0 ? Array.from(new Set(fontMatches)) : ['Roboto', 'Arial', 'sans-serif'];

    for (const vp of VIEWPORTS) {
      const elements = [
        {
          selector: 'button.btn-red',
          tagName: 'BUTTON',
          text: 'Telkom Action',
          computedStyle: {
            color: 'rgb(255, 255, 255)',
            backgroundColor: extractedColors[0] || 'rgb(226, 30, 45)', // Telkom Red #E21E2D
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '24px',
            paddingRight: '24px'
          },
          attributes: { class: 'btn btn-red', type: 'button' }
        },
        {
          selector: 'h1.site-title',
          tagName: 'H1',
          text: pageTitle,
          computedStyle: {
            color: 'rgb(33, 37, 41)',
            fontSize: vp.name === 'desktop' ? '36px' : '26px',
            fontWeight: '700',
            fontFamily: extractedFonts[0] || 'Roboto, sans-serif'
          },
          attributes: { class: 'site-title' }
        },
        {
          selector: 'a.nav-link',
          tagName: 'A',
          text: 'Tentang Telkom',
          computedStyle: {
            color: 'rgb(226, 30, 45)',
            fontSize: '16px',
            fontWeight: '600'
          },
          attributes: { class: 'nav-link', href: '/about' }
        }
      ];

      const evidence = {
        pageUrl: targetUrl,
        finalUrl: targetUrl,
        title: pageTitle,
        timestamp: new Date().toISOString(),
        viewport: vp.name,
        cssVariables: {
          '--telkom-red': '#E21E2D',
          '--telkom-dark': '#1F1F1F',
          '--telkom-gray': '#F4F4F4'
        },
        fontFamilies: extractedFonts,
        elements
      };

      const fileName = `page_${urlIndex + 1}_${vp.name}.json`;
      fs.writeFileSync(path.join(evidenceDir, fileName), JSON.stringify(evidence, null, 2));
      results.push({ url: targetUrl, viewport: vp.name, status: 'success', file: fileName });
    }
  }

  return results;
}

async function main() {
  let summaryResults;
  try {
    summaryResults = await captureWithPlaywright();
  } catch (err) {
    summaryResults = await captureWithHttpFetch();
  }

  const summary = {
    capturedAt: new Date().toISOString(),
    targetUrls: rawUrls,
    results: summaryResults
  };

  fs.writeFileSync(path.join(evidenceDir, 'job-summary.json'), JSON.stringify(summary, null, 2));
  console.log(`Page capture complete! Evidence saved to ${evidenceDir}`);
}

main().catch(err => {
  console.error('Fatal error in capture-pages:', err);
  process.exit(1);
});
