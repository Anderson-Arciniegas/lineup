#!/usr/bin/env node
/**
 * Gate CI: ≥80% de checkboxes marcados en docs/E2E-JOURNEY-MAP.md
 * por sección (lineup-e2e, admin-e2e, mobile-e2e).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mapPath = join(__dirname, '..', 'docs', 'E2E-JOURNEY-MAP.md');
const md = readFileSync(mapPath, 'utf8');

const sections = [
  { name: 'lineup-e2e', start: '## lineup-e2e', end: '## admin-e2e' },
  { name: 'admin-e2e', start: '## admin-e2e', end: '## mobile-e2e' },
  { name: 'mobile-e2e', start: '## mobile-e2e', end: '## Estado' },
];

const THRESHOLD = 0.8;
let failed = false;

for (const section of sections) {
  const startIdx = md.indexOf(section.start);
  const endIdx = md.indexOf(section.end);
  if (startIdx < 0 || endIdx < 0) {
    console.error(`Missing section markers for ${section.name}`);
    failed = true;
    continue;
  }
  const body = md.slice(startIdx, endIdx);
  const checked = (body.match(/- \[x\]/gi) ?? []).length;
  const unchecked = (body.match(/- \[ \]/g) ?? []).length;
  const total = checked + unchecked;
  const ratio = total === 0 ? 0 : checked / total;
  const pct = (ratio * 100).toFixed(1);
  const ok = ratio >= THRESHOLD;
  console.log(
    `${section.name}: ${checked}/${total} (${pct}%) ${ok ? 'OK' : 'FAIL'} [need ≥80%]`,
  );
  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}
console.log('E2E journey coverage gate passed.');
