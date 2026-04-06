/**
 * primeicons 7.x ships @font-face with font-display: block, which delays text/icons
 * and triggers PageSpeed "Visualización de la fuente". Swap matches Montserrat and PSI guidance.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'primeicons',
  'primeicons.css',
);

if (!fs.existsSync(cssPath)) {
  console.warn('[patch-primeicons] primeicons.css not found, skip');
  process.exit(0);
}

let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('font-display: block')) {
  console.log('[patch-primeicons] already patched or unexpected format, skip');
  process.exit(0);
}

css = css.replace('font-display: block', 'font-display: swap');
fs.writeFileSync(cssPath, css);
console.log('[patch-primeicons] font-display: block -> swap');
