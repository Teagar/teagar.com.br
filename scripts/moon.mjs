// Procedural pixel-art moon, halo, stars and sky. Deterministic: same bytes every run.
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const PAL = {
  hi: '#FFD2A1', light: '#FFA05A', baseLight: '#FF7A1F', base: '#FF6700',
  mid: '#D9520A', shadow: '#A63D05', deep: '#6E2803', outline: '#3D1702',
};
// shading ladder, bright to dark
const LADDER = [PAL.hi, PAL.light, PAL.baseLight, PAL.base, PAL.mid, PAL.shadow, PAL.deep];

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

/** Merge horizontal runs of equal color; one <path> per color (rect runs as path rows). */
function runs(grid) {
  const by = new Map();
  for (let y = 0; y < grid.length; y++) {
    let x = 0;
    while (x < grid[y].length) {
      const c = grid[y][x];
      if (!c) { x++; continue; }
      let e = x + 1;
      while (e < grid[y].length && grid[y][e] === c) e++;
      if (!by.has(c)) by.set(c, []);
      by.get(c).push(`M${x} ${y}h${e - x}v1h-${e - x}z`);
      x = e;
    }
  }
  return [...by].map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join('');
}
const svgWrap = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>\n`;
const blank = (n, m = n) => Array.from({ length: m }, () => Array(n).fill(null));

export function moonSvg() {
  const N = 64, R = 28, C = N / 2; // pixel centres at x + .5
  const g = blank(N);
  const inside = (x, y) => (x + 0.5 - C) ** 2 + (y + 0.5 - C) ** 2 <= R * R;
  // light from the upper right: banded (never smooth) shading, rim crescent + terminator dither
  const shade = new Map();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inside(x, y)) continue;
    const dx = x + 0.5 - C, dy = y + 0.5 - C;
    const rr = Math.hypot(dx, dy) / R;
    const a = (dx - dy) / (Math.SQRT2 * R); // +1 toward the upper right
    let k;
    if (a > 0.38 && rr > 0.82) k = 0;
    else if (a > 0.28 && rr > 0.7) k = 1;
    else if (a > 0.14 && rr > 0.5) k = 2;
    else if (a > -0.1) k = 3;
    else if (a > -0.3) k = 4;
    else if (a > -0.56) { const t = (-0.3 - a) / 0.26; k = (BAYER[y & 3][x & 3] + 0.5) / 16 < t ? 5 : 4; }
    else k = 5;
    shade.set(y * N + x, k);
  }
  // craters
  const rnd = mulberry32(0x7e4a9c1);
  const craters = [];
  let guard = 0;
  while (craters.length < 8 && guard++ < 4000) {
    const r = [1.5, 2, 2.5, 3, 3.5, 4, 5, 6][Math.floor(rnd() * 8)];
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (R - r - 4);
    const cx = C + Math.cos(a) * d, cy = C + Math.sin(a) * d;
    if (craters.some((c) => Math.hypot(c.cx - cx, c.cy - cy) < c.r + r + 3)) continue;
    craters.push({ cx: Math.round(cx * 2) / 2, cy: Math.round(cy * 2) / 2, r });
  }
  const craterPx = new Set();
  const put = (x, y, col) => { g[y][x] = col; };
  for (const [key, k] of shade) { const x = key % N, y = (key - x) / N; put(x, y, LADDER[k]); }
  for (const { cx, cy, r } of craters) {
    const b = shade.get(Math.floor(cy) * N + Math.floor(cx)) ?? 3;
    const floor = b >= 4 ? PAL.deep : PAL.shadow, wall = b >= 4 ? PAL.shadow : PAL.mid;
    const rim = b <= 3 ? (r >= 3.5 && b <= 2 ? PAL.hi : PAL.light) : PAL.mid;
    for (let y = Math.floor(cy - r - 2); y <= Math.ceil(cy + r + 2); y++) for (let x = Math.floor(cx - r - 2); x <= Math.ceil(cx + r + 2); x++) {
      if (!inside(x, y) || !shade.has(y * N + x)) continue;
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      const lr = Math.SQRT2 * Math.max(r, 1);
      if (d <= r) {
        const u = (dx - dy) / lr; // + = upper right inside wall
        put(x, y, u > 0.3 ? wall : floor);
        craterPx.add(y * N + x);
      } else if (d <= r + 1.1 && (dx + dy) / lr > 0.45) {
        put(x, y, rim);
        craterPx.add(y * N + x);
      }
    }
  }
  // dust speckles on the lit side
  let dust = 0; guard = 0;
  while (dust < 12 && guard++ < 5000) {
    const x = Math.floor(rnd() * N), y = Math.floor(rnd() * N);
    const k = shade.get(y * N + x);
    if (k === undefined || k > 3 || k < 2 || craterPx.has(y * N + x)) continue;
    put(x, y, PAL.mid); dust++;
  }
  // 1px outline on the circle edge (4-neighbourhood)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inside(x, y)) continue;
    if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) put(x, y, PAL.outline);
  }
  return svgWrap(N, N, runs(g));
}

function ringGrid(radii) {
  const N = 96, C = 48, g = blank(N);
  for (const [r, t] of radii) {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const d = Math.hypot(x + 0.5 - C, y + 0.5 - C);
      if (d <= r && d > r - t) g[y][x] = '#FF6700';
    }
  }
  return g;
}
const RINGS = [[31, 2, 0.3], [34, 1, 0.16], [37, 1, 0.08]];

export function haloSvg() {
  const body = RINGS.map(([r, t, o]) => `<g fill-opacity="${o}">${runs(ringGrid([[r, t]]))}</g>`).join('');
  return svgWrap(96, 96, body);
}
/** single ring (0..2) as its own svg so CSS can pulse each one */
export function haloRingSvg(i) {
  const [r, t] = RINGS[i];
  return svgWrap(96, 96, runs(ringGrid([[r, t]])));
}

export function skySvg() {
  const bands = [['#1B1410', 136], ['#211812', 138], ['#2A1D14', 140]];
  return svgWrap(120, 150, `<rect width="120" height="150" fill="#140F0C"/>` +
    bands.map(([c, y]) => `<rect y="${y}" width="120" height="2" fill="${c}"/>`).join('') +
    `<rect y="142" width="120" height="8" fill="#2A1D14"/>`);
}

/** returns inner markup (rects/groups) of the star field */
function starsBody() {
  const rnd = mulberry32(0x51a7);
  const cols = ['#FFE3C4', '#FFA05A'];
  const placed = [];
  const free = (x, y, m) => Math.hypot(x - 60, y - 46) > 38 && x > m && y > m && x < 120 - m && y < 104 &&
    placed.every((p) => Math.hypot(p[0] - x, p[1] - y) > 7);
  const pick = (m) => { for (let n = 0; n < 500; n++) { const x = Math.floor(rnd() * 120), y = Math.floor(rnd() * 110); if (free(x, y, m)) { placed.push([x, y]); return [x, y]; } } return null; };
  const groups = { s1: [], s2: [], s3: [] };
  const names = ['s1', 's2', 's3'];
  // 4 plus sparkles first
  for (let i = 0; i < 4; i++) {
    const p = pick(5); if (!p) continue;
    const [x, y] = p, c = cols[i % 2 ? 1 : 0];
    groups[names[i % 3]].push(`<g class="sp"><rect x="${x - 2}" y="${y}" width="5" height="1" fill="${c}"/><rect x="${x}" y="${y - 2}" width="1" height="5" fill="${c}"/><rect x="${x}" y="${y}" width="1" height="1" fill="#FFF3E3"/></g>`);
  }
  for (let i = 0; i < 18; i++) {
    const p = pick(2); if (!p) continue;
    const big = rnd() < 0.25, c = cols[rnd() < 0.7 ? 0 : 1];
    groups[names[i % 3]].push(`<rect x="${p[0]}" y="${p[1]}" width="${big ? 2 : 1}" height="${big ? 2 : 1}" fill="${c}"/>`);
  }
  return names.map((n) => `<g class="${n}">${groups[n].join('')}</g>`).join('');
}
export const starsSvg = () => svgWrap(120, 150, starsBody());
/** inline variant with classes for the hero */
export const starsInline = () => `<svg class="stars" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" shape-rendering="crispEdges" preserveAspectRatio="none" aria-hidden="true" focusable="false">${starsBody()}</svg>`;

export const MOON_FILES = () => ({
  'moon.svg': moonSvg(), 'moon-halo.svg': haloSvg(), 'moon-stars.svg': starsSvg(), 'moon-sky.svg': skySvg(),
  'moon-ring-1.svg': haloRingSvg(0), 'moon-ring-2.svg': haloRingSvg(1), 'moon-ring-3.svg': haloRingSvg(2),
});

export async function writeMoonAssets(dir) {
  await mkdir(dir, { recursive: true });
  const files = MOON_FILES();
  for (const [n, s] of Object.entries(files)) await writeFile(join(dir, n), s);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await writeMoonAssets(process.argv[2] || 'dist/assets/img');
}
