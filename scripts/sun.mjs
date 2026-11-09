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
  // banded shading around a hot spot in the upper right; dither between baseLight and base
  const hx = C + 5, hy = C - 5;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inside(x, y)) continue;
    const t = Math.hypot(x + 0.5 - hx, y + 0.5 - hy) / (R * 2.0);
    let c;
    if (t < 0.1) c = CREAM;
    else if (t < 0.22) c = PAL.hi;
    else if (t < 0.36) c = PAL.light;
    else if (t < 0.46) c = PAL.baseLight;
    else if (t < 0.58) c = (BAYER[y & 3][x & 3] + 0.5) / 16 < (t - 0.46) / 0.12 ? PAL.base : PAL.baseLight;
    else c = PAL.base;
    g[y][x] = c;
  }
  // specular glint (3 px)
  const gx = C + 5, gy = C - 9;
  g[gy][gx] = WHITE; g[gy][gx + 1] = WHITE; g[gy + 1][gx] = WHITE;
  // 1 px outline
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inside(x, y)) continue;
    if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) g[y][x] = PAL.outline;
  }
  return svgWrap(N, N, runs(g));
}

/** 12 chunky rays on the 96 grid (disc is the 64 grid offset by 16); frame 1 and 2 differ by half a step */
export function raysSvg(frame) {
  const N = 96, C = 48, n = 12, step = (Math.PI * 2) / n;
  const off = frame === 2 ? step / 2 : 0;
  const g = blank(N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x + 0.5 - C, dy = y + 0.5 - C, r = Math.hypot(dx, dy);
    if (r < 24 || r > 40) continue;
    const a = Math.atan2(dy, dx) + Math.PI / 2 - off; // 0 = straight up
    const k = Math.round(a / step), da = a - k * step;
    const long = ((k % n) + n) % n % 2 === 0;
    const len = long ? 39.5 : 32;
    if (r > len) continue;
    const along = r * Math.cos(da), perp = Math.abs(r * Math.sin(da));
    const hw = 1.7 - 0.8 * ((along - 24) / (len - 24));
    if (perp <= hw) g[y][x] = long ? PAL.light : PAL.base;
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

function cloud(rnd, w) {
  const bumps = [];
  const nb = 3 + Math.floor(rnd() * 2);
  for (let i = 0; i < nb; i++) bumps.push({ cx: (i + 0.5) / nb * w + (rnd() - 0.5) * 2, r: 3 + rnd() * 3.2 });
  const cols = [];
  for (let x = 0; x < w; x++) {
    let h = 3;
    for (const b of bumps) { const d = x + 0.5 - b.cx; if (Math.abs(d) < b.r) h = Math.max(h, 2 + Math.sqrt(b.r * b.r - d * d)); }
    // soften the ends
    if (x < 2 || x >= w - 2) h = Math.min(h, 3);
    cols.push(Math.floor(h));
  }
  const H = Math.max(...cols);
  const g = Array.from({ length: H }, () => Array(w).fill(null));
  for (let x = 0; x < w; x++) for (let k = 0; k < cols[x]; k++) {
    const y = H - 1 - k;
    g[y][x] = k === 0 ? '#E0B48A' : k === 1 ? '#F3D3B0' : k === cols[x] - 1 ? WHITE : CREAM;
  }
  return { g, h: H };
}

function cloudsBody() {
  const rnd = mulberry32(0xc10d5);
  const specs = [['c1', 24], ['c1', 18], ['c2', 28], ['c2', 16]];
  const placed = [], groups = { c1: [], c2: [] };
  for (const [name, w] of specs) {
    const { g, h } = cloud(rnd, w);
    let pos = null;
    for (let n = 0; n < 800 && !pos; n++) {
      const x = 4 + Math.floor(rnd() * (112 - w - 8)), y = 6 + Math.floor(rnd() * 84);
      const ccx = x + w / 2, ccy = y + h / 2;
      if (Math.hypot(ccx - 60, ccy - 38) < 50 + w / 4) continue; // keep the sun area clear
      if (placed.some((p) => Math.abs(p[0] - ccx) < (p[2] + w) / 2 + 6 && Math.abs(p[1] - ccy) < 14)) continue;
      pos = [x, y];
      placed.push([ccx, ccy, w]);
    }
    if (!pos) continue;
    groups[name].push(`<g transform="translate(${pos[0]} ${pos[1]})">${runs(g)}</g>`);
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
