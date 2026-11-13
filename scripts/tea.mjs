// Procedural pixel-art teacup (+ glint, steam frames). Deterministic, same palette as the moon.
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PAL, runs, svgWrap, BAYER, mulberry32 } from './moon.mjs';

export const TEA_EXTRA = { cream: '#FFF1E0', brown: '#2A1D14' };
const LADDER = [PAL.hi, PAL.light, PAL.baseLight, PAL.base, PAL.mid, PAL.shadow, PAL.deep];
const W = 48, H = 40;
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill(null));
const ell = (cx, cy, rx, ry) => (x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
const dith = (x, y, t) => (BAYER[y & 3][x & 3] + 0.5) / 16 < t;

const RIM = { cx: 24, cy: 11.5, rx: 14, ry: 4.5 };
const TEA = { cx: 24, cy: 11.5, rx: 11.5, ry: 3 };
const GLINT = [[29, 10], [30, 10], [31, 10], [28, 11]];

function body(coffee = false) {
  const g = blank(W, H);
  const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c; };
  // saucer: flat ellipse, shadow top, lit rim on the upper right, deep underside
  const S = { cx: 24, cy: 32.5, rx: 22, ry: 4 };
  const sIn = ell(S.cx, S.cy, S.rx, S.ry), sWell = ell(S.cx, S.cy + 0.5, S.rx - 5, S.ry - 1.6);
  for (let y = 27; y < 38; y++) for (let x = 0; x < W; x++) {
    const under = ell(S.cx, S.cy + 1.5, S.rx, S.ry)(x, y);
    if (under && !sIn(x, y)) put(x, y, PAL.deep);
  }
  for (let y = 27; y < 38; y++) for (let x = 0; x < W; x++) {
    if (!sIn(x, y)) continue;
    const dx = (x + 0.5 - S.cx) / S.rx, dy = (y + 0.5 - S.cy) / S.ry;
    let c = sWell(x, y) ? PAL.deep : PAL.shadow;
    if (!sWell(x, y) && dx - dy * 0.6 > 0.55) c = dx - dy * 0.6 > 0.85 ? PAL.hi : PAL.light;
    else if (!sWell(x, y) && dx < -0.4 && dith(x, y, 0.5)) c = PAL.mid;
    put(x, y, c);
  }
  // handle (left): round ring behind the cup
  const hOut = ell(8.5, 18, 7, 6.2), hIn = ell(8.5, 18, 3.4, 3.2);
  for (let y = 11; y < 26; y++) for (let x = 0; x < 16; x++) {
    if (!hOut(x, y) || hIn(x, y)) continue;
    const t = (x + 0.5 - 8.5) / 7 - (y + 0.5 - 18) / 6.2 * 0.5;
    put(x, y, t > 0.1 ? PAL.base : t > -0.45 ? PAL.mid : PAL.shadow);
  }
  // cup body: bowl silhouette, banded shading from the upper right
  const hw = (y) => {
    const t = (y - 11) / 20;
    let h = 14 - 3.6 * Math.pow(t, 1.5);
    if (y > 27) h -= [0, 1, 2.2, 3.8, 6][y - 27] ?? 6;
    return h;
  };
  for (let y = 11; y <= 31; y++) {
    const h = hw(y);
    for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - 24;
      if (Math.abs(dx) > h) continue;
      const u = dx / h;
      const a = u * 0.85 + (11 - y) / 40; // lower = darker
      let k;
      if (a > 0.6) k = 1; else if (a > 0.3) k = 2; else if (a > -0.05) k = 3; else if (a > -0.3) k = 4;
      else if (a > -0.62) k = dith(x, y, (-0.3 - a) / 0.32) ? 5 : 4;
      else k = a > -0.9 ? 5 : 6;
      let c = LADDER[k];
      if (u > 0.42 && u < 0.6 && y >= 16 && y <= 23) c = PAL.hi; // specular stripe
      put(x, y, c);
    }
  }
  // decoration band: a thin darker line under the rim (cup glaze edge)
  // rim ellipse (lip) over the body top
  const rimO = ell(RIM.cx, RIM.cy, RIM.rx, RIM.ry), teaE = ell(TEA.cx, TEA.cy, TEA.rx, TEA.ry);
  for (let y = 5; y < 18; y++) for (let x = 0; x < W; x++) {
    if (!rimO(x, y)) continue;
    const dx = (x + 0.5 - RIM.cx) / RIM.rx, dy = (y + 0.5 - RIM.cy) / RIM.ry;
    if (teaE(x, y)) {
      // tea surface: back wall shadow on top rows, amber below, dither between
      const ty = (y + 0.5 - (TEA.cy - TEA.ry)) / (TEA.ry * 2);
      if (coffee) put(x, y, ty < 0.3 ? TEA_EXTRA.brown : ty < 0.55 && dith(x, y, 0.5) ? TEA_EXTRA.brown : PAL.outline); // dark roast, no amber
      else put(x, y, ty < 0.3 ? PAL.shadow : ty < 0.55 ? (dith(x, y, 0.5) ? PAL.shadow : PAL.mid) : PAL.mid);
    } else {
      put(x, y, dx - dy * 0.7 > 0.5 ? PAL.hi : dx - dy * 0.7 > -0.2 ? PAL.light : dx < -0.55 ? PAL.base : PAL.baseLight);
    }
  }
  // tea bag: string over the rim + paper tag with a T (coffee has none)
  if (!coffee) {
  for (const [x, y] of [[33, 10], [34, 9], [35, 9], [36, 9], [37, 10], [38, 11], [39, 12], [40, 13]]) put(x, y, TEA_EXTRA.brown);
  for (let y = 14; y <= 18; y++) for (let x = 38; x <= 42; x++) put(x, y, (x === 38 || x === 42 || y === 14 || y === 18) ? TEA_EXTRA.brown : TEA_EXTRA.cream);
  for (const [x, y] of [[39, 15], [40, 15], [41, 15], [40, 16], [40, 17]]) put(x, y, PAL.base);
  }
  // outline: 1px, 4-neighbourhood, drawn outside the shape
  const filled = g.map((r) => r.map((c) => c !== null));
  const keep = new Set(['M']);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (filled[y][x]) continue;
    if ((x > 0 && filled[y][x - 1]) || (x < W - 1 && filled[y][x + 1]) || (y > 0 && filled[y - 1][x]) || (y < H - 1 && filled[y + 1][x])) put(x, y, PAL.outline);
  }
  // soft contact shadow under the saucer (reads on dark pages)
  for (let x = 0; x < W; x++) {
    let ly = -1;
    for (let y = 27; y < H; y++) if (g[y][x] === PAL.outline) ly = y;
    if (ly >= 33 && ly + 1 < H && g[ly + 1][x] === null) put(x, ly + 1, TEA_EXTRA.brown);
  }
  return g;
}

export function teaCupSvg() { return svgWrap(W, H, runs(body())); }
/** late-night egg: the same cup holding coffee */
export function coffeeCupSvg() { return svgWrap(W, H, runs(body(true))); }

export function teaGlintSvg() {
  const g = blank(W, H);
  for (const [x, y] of GLINT) g[y][x] = PAL.hi;
  return svgWrap(W, H, runs(g));
}

/** Rising steam: 3 wisps with a sine path; each frame shifts the phase by a third of a period. */
export function teaSteamSvg(frame) {
  const w = 48, h = 24, g = blank(w, h);
  const wisps = [{ x: 17, ph: 0 }, { x: 24, ph: 5 }, { x: 31, ph: 10 }];
  const period = 22, shift = 7 * frame; // frame k moves the pattern 7 rows: 3 frames = a third of a cycle each
  for (const [wi, wsp] of wisps.entries()) {
    for (let y = h - 1; y >= 1; y--) {
      const yy = y + shift + wsp.ph; // phase advances with the frame
      if (yy % 11 === 0 || (yy + 4) % 11 === 0 && y < 14) continue; // gaps drift upward with the frame
      const up = (h - 1 - y) / (h - 2);
      if (up > 0.94) continue;
      const cx = wsp.x + Math.round(2 * Math.sin((yy / period) * Math.PI * 2));
      const wide = up < 0.6 ? 2 : 1;
      for (let i = 0; i < wide; i++) g[y][cx + i] = (i === 0 && up > 0.3) ? PAL.hi : TEA_EXTRA.cream;
      if (g[y][cx + wide] === null) g[y][cx + wide] = PAL.light; // 1px warm edge so it reads on cream pages
    }
  }
  return svgWrap(w, h, runs(g));
}

export const TEA_FILES = () => ({
  'tea-cup.svg': teaCupSvg(), 'tea-coffee.svg': coffeeCupSvg(), 'tea-glint.svg': teaGlintSvg(),
  'tea-steam-1.svg': teaSteamSvg(0), 'tea-steam-2.svg': teaSteamSvg(1), 'tea-steam-3.svg': teaSteamSvg(2),
});

export async function writeTeaAssets(dir) {
  await mkdir(dir, { recursive: true });
  const files = TEA_FILES();
  for (const [n, s] of Object.entries(files)) await writeFile(join(dir, n), s);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) await writeTeaAssets(process.argv[2] || 'dist/assets/img');
