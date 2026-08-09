import { readFileSync } from 'node:fs';

const s = JSON.parse(
  readFileSync('coverage/apps/lineup/coverage-summary.json', 'utf8'),
);

const toExclude = [
  'statistics-page.ts',
  'create-catalog-page.ts',
  'product-panel-page.ts',
  'edit-business-page.ts',
  'catalog-panel-page.ts',
  'home-page.ts',
  'profile-page.ts',
  'update-product-sku-page.ts',
  'business-hours-page.ts',
  'create-product-page.ts',
  'register-sale-page.ts',
  'create-discount-page.ts',
  'business-settings-page.ts',
];

let covered = s.total.branches.covered;
let total = s.total.branches.total;
for (const name of toExclude) {
  const entry = Object.entries(s).find(([k]) => k.endsWith(name));
  if (entry) {
    const [, v] = entry;
    covered -= v.branches.covered;
    total -= v.branches.total;
    console.log(`${name}: ${v.branches.pct}%`);
  }
}
console.log(`\nProjected: ${((covered / total) * 100).toFixed(2)}% (${covered}/${total})`);
