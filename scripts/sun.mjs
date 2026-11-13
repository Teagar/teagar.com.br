// Procedural pixel-art sun, rays, day sky and clouds. Deterministic: same bytes every run.
// Reuses the moon's palette and helpers so both bodies share one pixel language.
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PAL, runs, svgWrap, mulberry32, BAYER } from './moon.mjs';

const CREAM = '#FFF1E0', WHITE = '#FFFFFF';
const blank = (n) => Array.from({ length: n }, () => Array(n).fill(null));

export function sunSvg() {
  const N = 64, R = 20, C = N / 2;
  const g = blank(N);
  const inside = (x, y) => (x + 0.5 - C) ** 2 + (y + 0.5 - C) ** 2 <= R * R;
  // a glowing disc: bright core slightly up-right, stepped warm bands, Bayer dither at each band edge
  const hx = C + 2, hy = C - 2;
  const bands = [[0.2, PAL.hi], [0.48, PAL.light], [0.76, PAL.baseLight], [Infinity, PAL.base]];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inside(x, y)) continue;
    const t = Math.hypot(x + 0.5 - hx, y + 0.5 - hy) / R;
    let i = bands.findIndex(([lim]) => t < lim);
    const prev = i > 0 ? bands[i - 1][0] : 0;
    // dither the inner 0.06 of each band with the brighter band
    if (i > 0 && t - prev < 0.06 && (BAYER[y & 3][x & 3] + 0.5) / 16 < 1 - (t - prev) / 0.06) i -= 1;
    g[y][x] = bands[i][1];
  }
  // warm 1 px rim (lighter than the moon's outline: the sun glows) with a darker lower-left arc
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inside(x, y)) continue;
    if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) {
      g[y][x] = (x + 0.5 - C) - (y + 0.5 - C) < -R * 0.55 ? PAL.shadow : PAL.mid;
    }
  }
  return svgWrap(N, N, runs(g));
}

/** 8 chunky rays on the 96 grid (disc is the 64 grid offset by 16); frame 2 is rotated half a step */
export function raysSvg(frame) {
  const N = 96, C = 48, n = 8, step = (Math.PI * 2) / n;
  const off = frame === 2 ? step / 2 : 0;
  const g = blank(N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x + 0.5 - C, dy = y + 0.5 - C, r = Math.hypot(dx, dy);
    if (r < 23 || r > 34) continue;
    const a = Math.atan2(dy, dx) + Math.PI / 2 - off; // 0 = straight up
    const k = Math.round(a / step), da = a - k * step;
    const long = ((k % n) + n) % n % 2 === 0;
    const len = long ? 33.5 : 29.5;
    if (r > len) continue;
    const perp = Math.abs(r * Math.sin(da));
    if (perp <= 1.05) g[y][x] = r > len - 2 ? PAL.baseLight : PAL.base;
  }
  return svgWrap(N, N, runs(g));
}

export function daySkySvg() {
  const W = 120, H = 150;
  const bands = [['#FFD9B0', 0], ['#FFE3C2', 36], ['#FFEBD3', 74], ['#FFF1E0', 108], ['#F3D3B0', 136], ['#EAC39C', 138], ['#E0B48A', 140]];
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const colorAt = (i) => bands[i][0];
  for (let i = 0; i < bands.length; i++) {
    const y0 = bands[i][1], y1 = i + 1 < bands.length ? bands[i + 1][1] : H;
    for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) g[y][x] = colorAt(i);
  }
  // 2-row Bayer dither bleeding the next band into the top band edges (sky bands only)
  for (let i = 1; i <= 3; i++) {
    const y0 = bands[i][1];
    for (let r = 0; r < 4; r++) for (let x = 0; x < W; x++) {
      const y = y0 - 4 + r;
      if ((BAYER[y & 3][x & 3] + 0.5) / 16 < (r + 1) / 5 * 0.8 && r >= 1) g[y][x] = colorAt(i);
    }
  }
  return svgWrap(W, H, runs(g));
}

// hand-drawn cloud maps: W white, C cream, S warm shade, D bottom edge
const CLOUD_MAPS = {
  big: [
    '.......WWWW...........',
    '.....WWCCCCWW..WWW....',
    '...WWCCCCCCCCWWCCCWW..',
    '..WCCCCCCCCCCCCCCCCCW.',
    '.WCCCCCCCCCCCCCCCCCCCW',
    'WCCCCCCCCCCCCCCCCCCCCW',
    'SSCCCCCCCCCCCCCCCCCCSS',
    '.SSSSSSSSSSSSSSSSSSSS.',
    '..DDDDDDDDDDDDDDDDDD..',
  ],
  small: [
    '....WWW.......',
    '..WWCCCWWWW...',
    '.WCCCCCCCCCW..',
    'WCCCCCCCCCCCWW',
    'SCCCCCCCCCCCCS',
    '.SSSSSSSSSSSS.',
    '..DDDDDDDDDD..',
  ],
};
const CLOUD_LEGEND = { W: WHITE, C: CREAM, S: '#F3D3B0', D: '#E0B48A' };
function cloud(kind, flip) {
  const rows = CLOUD_MAPS[kind].map((r) => (flip ? [...r].reverse().join('') : r));
  return rows.map((r) => [...r].map((ch) => CLOUD_LEGEND[ch] || null));
}

function cloudsBody() {
  // hand-placed so they sit in open sky: top right, and the strips beside the portrait
  const specs = [['c1', 'big', false, 78, 6], ['c2', 'small', true, 100, 26], ['c2', 'small', false, 2, 76], ['c1', 'small', true, 104, 66]];
  const groups = { c1: [], c2: [] };
  for (const [name, kind, flip, x, y] of specs) {
    groups[name].push(`<g class="cloud" transform="translate(${x} ${y})">${runs(cloud(kind, flip))}</g>`);
  }
  return ['c1', 'c2'].map((n) => `<g class="${n}">${groups[n].join('')}</g>`).join('');
}
export const cloudsSvg = () => svgWrap(120, 150, cloudsBody());
export const cloudsInline = () => `<svg class="clouds" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" shape-rendering="crispEdges" preserveAspectRatio="none" aria-hidden="true" focusable="false">${cloudsBody()}</svg>`;

export const SUN_FILES = () => ({
  'sun.svg': sunSvg(), 'sun-rays-1.svg': raysSvg(1), 'sun-rays-2.svg': raysSvg(2), 'day-sky.svg': daySkySvg(),
});

export async function writeSunAssets(dir) {
  await mkdir(dir, { recursive: true });
  const files = SUN_FILES();
  for (const [n, s] of Object.entries(files)) await writeFile(join(dir, n), s);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await writeSunAssets(process.argv[2] || 'dist/assets/img');
}
