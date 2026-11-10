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

/** 24x24 icons for the results section: growth chart, support headset, privacy shield */
export const RESULT_ICONS = {
  'result-growth': [
    '.........ooooooo........',
    '.........ohhhhho........',
    '.........oohhhho........',
    '...........ohhho........',
    '..........ohohho.ooooo..',
    '.........oho.oho.olllo..',
    '........oho..ooo.omBlo..',
    '.......oho.......omBlo..',
    '......oho...oooooomBlo..',
    '.....oho....ollloomBlo..',
    '....oho.....omBloomBlo..',
    '...oho......omBloomBlo..',
    '..oho..oooooomBloomBlo..',
    '..oo...ollloomBloomBlo..',
    '.......omBloomBloomBlo..',
    '..oooooomBloomBloomBlo..',
    '..ollloomBloomBloomBlo..',
    '..omBloomBloomBloomBlo..',
    '..omBloomBloomBloomBlo..',
    '..omBloomBloomBloomBlo..',
    '..oooooooooooooooooooo..',
    '.oooooooooooooooooooooo.',
    '........................',
    '........................',
  ],
  'result-support': [
    '........................',
    '........................',
    '........oooooooo........',
    '......ooBBBBlllloo......',
    '.....oBBBBoooollllo.....',
    '....oBBBoo....oolllo....',
    '...oBBBo........olllo...',
    '...oBBo..........ollo...',
    '..oBBo............ollo..',
    '..oBo..............olo..',
    '..oBo..............olo..',
    '.oooooo..........oooooo.',
    '.oolllo..........ollloo.',
    '..omBlo..........omBlo..',
    '..omBlo..........omBlo..',
    '..omBlo..........omBlo..',
    '..omBlo..........omBlo..',
    '..omBlo..........omBlo..',
    '..ooooo..........ooooo..',
    '.....o..................',
    '.....o.....ooo..........',
    '......ooooooco..........',
    '...........ooo..........',
    '........................',
  ],
  'result-privacy': [
    '........................',
    '........................',
    '....oooooooooooooooo....',
    '....oBBBBBBBlllllllo....',
    '....oBBBBBBBlllllllo....',
    '....oBBBBBBBlllllllo....',
    '....oBBBBBBBlllllllo....',
    '....oBBBBBcccclllllo....',
    '....oBBBBcBBllcllllo....',
    '....oBBBBcBBllcllllo....',
    '....oBBBBcBBllcllllo....',
    '....oBBBcccccccclllo....',
    '....oBBBcccccccclllo....',
    '....oBBBccckkccclllo....',
    '.....oBBccckkcccllo.....',
    '......oBcccccccclo......',
    '.......occcccccco.......',
    '........oBBBlllo........',
    '.........oBBllo.........',
    '..........oBlo..........',
    '...........oo...........',
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
  // lab flask with liquid (static): beta
  beta: [
    ['..BBBB..', '...BB...', '...BB...', '..B..B..', '.B....B.', '.BllllB.', 'BllllllB', 'BBBBBBBB'],
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

/** 16x16 icons for the external profile links (GitHub mark, LinkedIn "in"), pixel versions in the site palette */
export const SOCIAL_ICONS = {
  github: [
    '......oooo......',
    '....oolllloo....',
    '...oBBBlllllo...',
    '..oBcBBBlllclo..',
    '.oBBccBBBlccllo.',
    '.oBBccccccccllo.',
    'omBBcccccccclllo',
    'ommBcccccccclllo',
    'ommmccccccccBllo',
    'ommmccccccccBBlo',
    '.omcmccccccBBBo.',
    '.omcmmccccBBBBo.',
    '..occcccccBBBo..',
    '...ommccccBBo...',
    '....ooccccoo....',
    '......oooo......',
  ],
  linkedin: [
    '.oooooooooooooo.',
    'ooBbbbbblllllloo',
    'oBBBbbbbbllllllo',
    'oBBccbbbbblllllo',
    'oBBccBbbbbbllllo',
    'oBBBBBBbbbbblllo',
    'oBBccBcccccbbllo',
    'oBBccBccccccbblo',
    'omBccBccBBbccbbo',
    'ommccBccBBBccbbo',
    'ommccBccBBBccbbo',
    'ommccBccBBBccbbo',
    'ommccmccBBBccBbo',
    'ommmmmmBBBBBBBBo',
    'oommmmmmBBBBBBoo',
    '.oooooooooooooo.',
  ],
};

/** flags are public symbols, so they use their real colours (the only exception to the orange palette) */
export const FLAG_COLORS = {
  outline: '#3D1702', green: '#009C3B', yellow: '#FFDF00', blue: '#002776', white: '#FFFFFF',
  red: '#B22234', canton: '#3C3B6E',
};
const FLAG_LEG = {
  o: FLAG_COLORS.outline, g: FLAG_COLORS.green, y: FLAG_COLORS.yellow, b: FLAG_COLORS.blue, w: FLAG_COLORS.white,
  r: FLAG_COLORS.red, n: FLAG_COLORS.canton,
};
const OUT = 'o'.repeat(16);
const frameRow = (inner) => `o${inner}o`;
/** 16x11 flags: 1 px outline, inner field 14x9 (rows are checked by parseWith) */
export const FLAG_ICONS = {
  br: [
    OUT,
    frameRow('gggggggggggggg'),
    frameRow('ggggyyyyyygggg'),
    frameRow('gggyybbbbyyggg'),
    frameRow('ggyybbbbbbyygg'),
    frameRow('gyyybwwwwbyyyg'),
    frameRow('ggyybbbbbbyygg'),
    frameRow('gggyybbbbyyggg'),
    frameRow('ggggyyyyyygggg'),
    frameRow('gggggggggggggg'),
    OUT,
  ],
  us: [
    OUT,
    frameRow('nwnwnwrrrrrrrr'),
    frameRow('nnnnnnwwwwwwww'),
    frameRow('nnwnwnrrrrrrrr'),
    frameRow('nnnnnnwwwwwwww'),
    frameRow('nnnnnnrrrrrrrr'),
    frameRow('wwwwwwwwwwwwww'),
    frameRow('rrrrrrrrrrrrrr'),
    frameRow('wwwwwwwwwwwwww'),
    frameRow('rrrrrrrrrrrrrr'),
    OUT,
  ],
};

const parseWith = (rows, w, h, leg) => {
  if (rows.length !== h || rows.some((r) => r.length !== w)) throw new Error(`pixel map must be ${w}x${h}`);
  return rows.map((r) => [...r].map((ch) => {
    if (ch === '.') return null;
    if (!leg[ch]) throw new Error(`unknown pixel char ${ch}`);
    return leg[ch];
  }));
};
const parse = (rows, w, h) => parseWith(rows, w, h, LEG);

export const socialSvg = (id) => svgWrap(16, 16, runs(parse(SOCIAL_ICONS[id], 16, 16)));
export const flagSvg = (id) => svgWrap(16, 11, runs(parseWith(FLAG_ICONS[id], 16, 11, FLAG_LEG)));

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
  for (const id of Object.keys(RESULT_ICONS)) f[`${id}.svg`] = svgWrap(24, 24, runs(parse(RESULT_ICONS[id], 24, 24)));
  for (const id of Object.keys(STATUS_ICONS)) f[`status-${id}.svg`] = statusSvg(id);
  for (const id of Object.keys(FLAG_ICONS)) f[`flag-${id}.svg`] = flagSvg(id);
  for (const id of Object.keys(SOCIAL_ICONS)) f[`social-${id}.svg`] = socialSvg(id);
  return f;
};

export async function writeIconAssets(dir) {
  await mkdir(dir, { recursive: true });
  const files = ICON_FILES();
  for (const [n, s] of Object.entries(files)) await writeFile(join(dir, n), s);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) await writeIconAssets(process.argv[2] || 'dist/assets/img/icons');
