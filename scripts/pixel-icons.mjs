// Pixel-art project and status icons, generated at build from hand-placed ASCII maps.
// Deterministic (no randomness). Reuses the moon palette; light comes from the upper right.
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PAL, runs, svgWrap } from './moon.mjs';

/** the only colours allowed besides PAL; green is reserved for the "live" status, stone for neutral accents */
export const EXTRA = { cream: '#FFF1E0', dark: '#2A1D14', green: '#2E9E62', stone: '#A89C8E' };
// legend: char -> colour ('.' is transparent)
const LEG = {
  o: PAL.outline, h: PAL.hi, l: PAL.light, b: PAL.baseLight, B: PAL.base, m: PAL.mid, s: PAL.shadow, d: PAL.deep,
  c: EXTRA.cream, k: EXTRA.dark, g: EXTRA.green, r: EXTRA.stone,
};

/** 24x24 project icons, 1 px outline, stepped shades, one ASCII row per pixel row */
export const PROJECT_ICONS = {
  gartrol: [
    '........................',
    '........................',
    '....oooooooooooooooooo..',
    '....ohhhhhhhhhhhhhhhho..',
    '....ollllllllllllllllo..',
    '....obbbbbbbbbbbbbbbbo..',
    '..oooooooooooooooooobo..',
    '..ohcccccccccccccccobo..',
    '..ohcBBBBBBBBccccccobo..',
    '..ohcmmmmmmmmccccccobo..',
    '..ohcccccccccccccccobo..',
    '..ohccccccBcllllllcobo..',
    '..ohcccccBBccccccccobo..',
    '..ohBcccBBcclllllccomo..',
    '..ohBBcBBccccccccccomo..',
    '..ohcBBBcccccdddcccomo..',
    '..ohccBcccccccdcdccomo..',
    '..ohcccccccccBBBBBcomo..',
    '..ohcccccccccBBdBBcomo..',
    '..ohcccccccccmmmmmcomo..',
    '..ohhhhhhhhhhhhhhhhomo..',
    '..oooooooooooooooooo....',
    '........................',
    '........................',
  ],
  teagarden: [
    '........................',
    '........................',
    '........................',
    '.oooooooooooooooooooooo.',
    '.ohBhBhBhhhhhhhhhhhhhho.',
    '.oooooooooooooooooooooo.',
    '.okkkkkkkkkokkkkkkkkkdo.',
    '.okBkkkkkkkokhhhhhhkkdo.',
    '.okkBkllllkokkkkkkkkkdo.',
    '.okBkkkkkkkoklllllkkkdo.',
    '.okkkkkkkkkokhhhhkkkkdo.',
    '.okhhhhhhkkokkkkkkkkkdo.',
    '.okkkkkkkkkoooooooooooo.',
    '.okBkkkkkkkokkkkkkkkkdo.',
    '.okkBkllllkokhhhklllkdo.',
    '.okBkkkkkkkokkhlhkllhdo.',
    '.okkkkkkkkkokkkhlBhlkdo.',
    '.okhhhkllkkokkkkBBkkkdo.',
    '.okkkkkkkkkokkkkkBkkkdo.',
    '.okkkkkkkkkokkmsssssmdo.',
    '.oooooooooooooooooooooo.',
    '........................',
    '........................',
    '........................',
  ],
  egogero: [
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '...oooo.................',
    '...ohbo.................',
    '...oBmo.................',
    '.oooooooo...............',
    '.omBBBlho...............',
    '.omBBBlhooooooooooooooo.',
    '.omkkkkhoBlccllccllcclo.',
    '.omkckchoBBccBBccBBccBo.',
    '.omckkkhoBmhhmmhhmmhhmo.',
    '.omkkckhooooooooooooooo.',
    '.omkkkkho...............',
    '.omBBBlho..oooooooooooo.',
    '.omBBBlho..oBBcllllccco.',
    '.omBBBlho..ommcllllccco.',
    '.omBBBlho..occchhhhccco.',
    '.omBBBlho..ohhhhhhhhhho.',
    '.oooooooo..oooooooooooo.',
    '........................',
    '........................',
  ],
  vitrines: [
    '........................',
    '........................',
    '..oooooooooooooooooooo..',
    '..occcBBBcccBBBcccBBBo..',
    '..occcBBBcccBBBcccBBBo..',
    '..ohhhmmmhhhmmmhhhmmmo..',
    '..oocooBoocooBoocooBoo..',
    '....o..o..o..o..o..o....',
    '..ommmmmmmmmmmmmmmmmmo..',
    '..obbbbbbbbbbbbbbbbllo..',
    '..oboooooooobboooooolo..',
    '..oboccchhcobbommmBolo..',
    '..obocchhccobbommmBolo..',
    '..obochhcccobbommmBolo..',
    '..obocBBBBcobbommmBolo..',
    '..oboccccccobbommmBolo..',
    '..oboooooooobbommcBolo..',
    '..obbbbbbbbbbbommmBolo..',
    '..obbbbbbbbbbbommmBolo..',
    '..obbbbbbbbbbbommmBolo..',
    '..obbbbbbbbbbboooooolo..',
    '..oooooooooooooooooooo..',
    '........................',
    '........................',
  ],
  crawl: [
    '........................',
    '......oo................',
    '.....ohho.......ooo.....',
    '....ohhho......ohhlo....',
    '....ohcllo.....oblBo....',
    '...ohcclbo.....omBBo....',
    '...olcclBo......ooo.....',
    '...olclbBo..............',
    '....olbBBmo......BB.....',
    '.....ombmo........B.....',
    '...oooooooo........B....',
    '...omhhhllo........B....',
    '...omBBBBBo........B....',
    '....ommmmo..............',
    '.....omBlo.........ooo..',
    '.....omBlo........ohhlo.',
    '.....omBlo........oblBo.',
    '.....omBlo........omBBo.',
    '.....omBlo.........ooo..',
    '.....omBlo..............',
    '.....omBlo..............',
    '.....omBlo..............',
    '.....ooooo..............',
    '........................',
  ],
  craftonica: [
    '............l...........',
    '........................',
    '.........oooooo.........',
    '.....l..ohhhhhlo..l.....',
    '.......oblchhhcho.......',
    '.......obblllhhho.......',
    '...l...oBbblllhlo...l...',
    '.......oBBbbllllo.......',
    '.......omBBbbbblo.......',
    '....l..omBBBbbbbo..l....',
    '......oooooooooooo......',
    '......ommmmmmmmBBo......',
    '......oooooooooooo......',
    '.........r....r.........',
    '.........r....r..oooooo.',
    '.........r....r.rohBhBor',
    '.........r....r.roooooor',
    '.ooooooooroooororoooooo.',
    '.ockckckckckckckckckcco.',
    '.orrrrrrrrrrrrrrrrrrrro.',
    '.ohkhkhkhkhkhkhkhkhkhho.',
    '.oooooooooooooooooooooo.',
    '........................',
    '........................',
  ],
  tutorials: [
    '...........BB...........',
    '...........oo......l....',
    '........oooooooo..lhl...',
    '....l...occcccho...l....',
    '...lhl.BocBccBhoB.......',
    '....l...ockkkkho........',
    '........oooooooo........',
    '........................',
    '.oooooooooooooooooooooo.',
    '.occcccccchoohcccccccho.',
    '.ocBBBBlllhoohBBBBlllho.',
    '.occcccccchoohcccccccho.',
    '.oclllllllhoohlllllllho.',
    '.occcccccchoohcccccccho.',
    '.oclllllllhoohlllllllho.',
    '.occcccccchoohcccccccho.',
    '.oclllllllhoohlllllllho.',
    '.occcccccchoohcccccccho.',
    '.oBBBBBBBBBooBBBBBBBBBo.',
    '.oooooooooooooooooooooo.',
    '........................',
    '........................',
    '........................',
    '........................',
  ],
  linux: [
    '........................',
    '........................',
    '.ooooooooooooo..........',
    '.ohBhBhBhhhhho..........',
    '.ooooooooooooo..........',
    '.okkkkkkkkkkdo..........',
    '.okBkkkkkkkkdooooo..oooo',
    '.okkBkkkkkkkdoocro..ocro',
    '.okkkBkkkkkkdoocro..ocro',
    '.okkBkkkkkkkdoocroooorro',
    '.okBkkkllllkdoocrrrrrrro',
    '.okkkkkkkkkkdo.ocrrrrro.',
    '.okkkkkkkkkkdo..ocrrro..',
    '.ooooooooooooo..ocro....',
    '...............ocro.....',
    '..............ocro......',
    '.............ocro.......',
    '............ocro........',
    '...........ocro.........',
    '..........ocro..........',
    '.........ocro...........',
    '........ocro............',
    '......oooo..............',
    '........................',
  ],
  track: [
    '.................oooo...',
    '.................olBo...',
    '.................oBoo...',
    '....................o...',
    '....................o...',
    '..................ooooo.',
    '..................ohhho.',
    '..................oBblo.',
    '..............oooooBblo.',
    '..............ohhhoBblo.',
    '..............oBbloBblo.',
    '..........oooooBbloBblo.',
    '..........ohhhoBbloBblo.',
    '..........oBbloBbloBblo.',
    '......oooooBbloBbloBblo.',
    '......ohhhoBbloBbloBblo.',
    '......oBbloBbloBbloBblo.',
    '..oooooBbloBbloBbloBblo.',
    '..ohhhoBbloBbloBbloBblo.',
    '..oBbloBbloBbloBbloBblo.',
    '..oBbloBbloBbloBbloBblo.',
    '..ooooooooooooooooooooo.',
    '........................',
    '........................',
  ],
  // puzzle piece joining a small window (a plugin merged into someone else's project)
  'oss-plugin': [
    '........................',
    '........................',
    '........................',
    '..oooooooooooooooo......',
    '..ohBhBhBhhhhhhhho......',
    '..oooooooooooooooo......',
    '..okkkkkkkkkkkkkko......',
    '..oklllllkkkkkkkko......',
    '..okhhhhhhhkkkkkko......',
    '..okkkkkkkkkkkoooooo....',
    '..okkkkkkkkkkkohhhhoooo.',
    '..okkkkkkkkkkkoBBBBBBBo.',
    '..oklllllkkkkkoBBBBBBmo.',
    '..okhhhhkkkkkkommmmmmmo.',
    '..okkkkkkkkkkkommmmoooo.',
    '..okkkkkkkkkkkoooooo....',
    '..okkkkkkkkkkkkkko......',
    '..oklllllllkkkkkko......',
    '..okhhhhkkkkkkkkko......',
    '..okkkkkkkkkkkkkko......',
    '..oooooooooooooooo......',
    '........................',
    '........................',
    '........................',

  ],
};

/** 8x8 status icons; each is a list of animation frames (drawn at 2 CSS px per pixel) */
export const STATUS_ICONS = {
  // hourglass, 3 frames: sand on top, falling, sand at the bottom
  inProgress: [
    ['.BBBBBB.', '.BllllB.', '..BllB..', '...BB...', '...BB...', '..B..B..', '.B.ll.B.', '.BBBBBB.'],
    ['.BBBBBB.', '.B.ll.B.', '..BllB..', '...Bl...', '...Bl...', '..B..B..', '.B.ll.B.', '.BBBBBB.'],
    ['.BBBBBB.', '.B....B.', '..B..B..', '...BB...', '...BB...', '..BllB..', '.BllllB.', '.BBBBBB.'],
  ],
  // broadcast signal, 2 frames: dot with inner arcs, then with outer arcs too (blinks)
  live: [
    ['........', '........', '..g..g..', '..gggg..', '..gggg..', '..g..g..', '........', '........'],
    ['........', '........', 'g.g..g.g', 'g.gggg.g', 'g.gggg.g', 'g.g..g.g', '........', '........'],
  ],
  // </> brackets
  openSource: [
    ['........', '.....r..', '.r...r.r', 'r...r..r', 'r...r..r', '.r..r.r.', '.....r..', '........'],
  ],
  // git-merge glyph (static)
  merged: [
    ['.BB.....', 'BllB....', '.BBB....', '.B..B...', '.B...BB.', 'BBB.BllB', 'BllB.BB.', '.BB.....'],
  ],
};

const parse = (rows, w, h) => {
  if (rows.length !== h || rows.some((r) => r.length !== w)) throw new Error(`pixel map must be ${w}x${h}`);
  return rows.map((r) => [...r].map((ch) => {
    if (ch === '.') return null;
    if (!LEG[ch]) throw new Error(`unknown pixel char ${ch}`);
    return LEG[ch];
  }));
};

export const projectSvg = (id) => svgWrap(24, 24, runs(parse(PROJECT_ICONS[id], 24, 24)));
/** frames side by side in one sprite (frames * 8 wide) */
export const statusSvg = (id) => {
  const frames = STATUS_ICONS[id];
  const grid = Array.from({ length: 8 }, () => []);
  for (const f of frames) parse(f, 8, 8).forEach((r, y) => grid[y].push(...r));
  return svgWrap(8 * frames.length, 8, runs(grid));
};

export const ICON_FILES = () => {
  const f = {};
  for (const id of Object.keys(PROJECT_ICONS)) f[`${id}.svg`] = projectSvg(id);
  for (const id of Object.keys(STATUS_ICONS)) f[`status-${id}.svg`] = statusSvg(id);
  return f;
};

export async function writeIconAssets(dir) {
  await mkdir(dir, { recursive: true });
  const files = ICON_FILES();
  for (const [n, s] of Object.entries(files)) await writeFile(join(dir, n), s);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) await writeIconAssets(process.argv[2] || 'dist/assets/img/icons');
