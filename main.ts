// SPDX-License-Identifier: MIT
// Hand in the finished game. The grader runs this once or twice with no network; every byte of
// /output comes from this repository, so repeated runs produce the same dossier.
import { closeSync, cpSync, existsSync, mkdirSync, openSync, readdirSync, readSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function emptyOutput(dir) {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    // Ignore lost+found-style mount metadata rather than deleting the mounted output volume.
    if (entry === 'lost+found') continue;
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function assertScreenshots(dir) {
  const shots = readdirSync(dir).filter((name) => !name.startsWith('.')).sort();
  if (shots.length !== 4) throw new Error(`Expected exactly 4 screenshots, found ${shots.length}`);
  for (const name of shots) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (!stats.isFile() || stats.size <= 0 || stats.size > 262144) throw new Error(`Bad screenshot size: ${name}`);
    const handle = openSync(path, 'r');
    const header = Buffer.alloc(3);
    readSync(handle, header, 0, 3, 0);
    closeSync(handle);
    if (header[0] !== 0xff || header[1] !== 0xd8 || header[2] !== 0xff) throw new Error(`Screenshot is not JPEG: ${name}`);
  }
}

emptyOutput(out);
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
assertScreenshots(join(out, 'screenshots'));

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

if (!existsSync(join(out, 'game', 'index.html'))) throw new Error('game/index.html missing');
console.log('Wrote Ember Night Kitchen to', out);
