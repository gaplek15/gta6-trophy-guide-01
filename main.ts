import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

for (const dir of ['app', 'screenshots']) {
  const src = join(here, dir);
  if (!existsSync(src)) {
    throw new Error(`main.ts: source directory ${src} is missing — run this program from the repository root, beside app/ and screenshots/`);
  }
}

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

function listFiles(dir, prefix = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, rel));
    else out.push({ path: rel, bytes: statSync(full).size });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : 1));
}

const copied = [
  ...listFiles(join(outDir, 'app'), 'app'),
  ...listFiles(join(outDir, 'screenshots'), 'screenshots'),
];
console.log(`Copied ${copied.length} files (${copied.reduce((n, f) => n + f.bytes, 0)} bytes) to ${outDir}:`);
for (const f of copied) console.log(`  ${f.path} — ${f.bytes} bytes`);

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Wrote ${join(outDir, 'dossier.json')}`);
