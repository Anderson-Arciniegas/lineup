import { readFileSync } from 'node:fs';

const s = JSON.parse(
  readFileSync('coverage/apps/lineup/coverage-summary.json', 'utf8'),
);
const rows = Object.entries(s)
  .filter(([k]) => k !== 'total')
  .map(([k, v]) => ({
    file: k.replace(/^.*apps[\\/]lineup[\\/]/, ''),
    branchMiss: v.branches.total - v.branches.covered,
    branchPct: v.branches.pct,
    branches: v.branches.total,
  }))
  .sort((a, b) => b.branchMiss - a.branchMiss);

for (const r of rows.slice(0, 20)) {
  console.log(
    `${r.branchMiss} miss / ${r.branches} total (${r.branchPct.toFixed(1)}%) | ${r.file}`,
  );
}

const need = Math.ceil(s.total.branches.total * 0.8) - s.total.branches.covered;
console.log(`\nNeed ${need} more branches for 80%`);
