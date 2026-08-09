import { readFileSync } from 'node:fs';

const s = JSON.parse(
  readFileSync('coverage/apps/lineup/coverage-summary.json', 'utf8'),
);
const rows = Object.entries(s)
  .filter(([k]) => k !== 'total')
  .map(([k, v]) => ({
    file: k.replace(/^.*apps[\\/]lineup[\\/]/, ''),
    stmts: v.statements.pct,
    branches: v.branches.pct,
    funcs: v.functions.pct,
    lines: v.lines.pct,
    miss: v.lines.total - v.lines.covered,
  }))
  .sort((a, b) => a.lines - b.lines);

for (const r of rows.slice(0, 30)) {
  console.log(
    `${r.lines.toFixed(1)}% lines (${r.miss} miss) branches ${r.branches.toFixed(1)}% funcs ${r.funcs.toFixed(1)}% | ${r.file}`,
  );
}

const t = s.total;
console.log('\nTOTAL:', t);
