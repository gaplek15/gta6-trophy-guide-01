import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });
for (const name of ['app', 'screenshots']) {
  const src = join(here, name);
  const dest = join(outDir, name);
  if (existsSync(dest)) {
    // Copy over the previous run's files; the output directory itself is never deleted.
    cpSync(src, dest, { recursive: true, force: true });
  } else {
    cpSync(src, dest, { recursive: true });
  }
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Wrote dossier.json (${dossier.length} bytes) to ${outDir}`);
