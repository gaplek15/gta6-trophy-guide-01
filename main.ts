// Leonida Trophy Guide — hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is plain static files in app/ (index.html, style.css, app.js and the
// data in app/data/), served by any static server with app/ at its root, offline.
// This program copies app/ and screenshots/ from beside this file into /output and
// writes /output/dossier.json with buildDossier from the vendored make.fun library.
// vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer rebuilds the
// dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Same caps the scorer enforces: at most 4 screenshots of 256 KiB each, app/ at most
// 993 files and directories and 48 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
