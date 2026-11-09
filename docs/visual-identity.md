# Visual identity — teagar.com.br

The portfolio has its **own** identity. It is a personal site for Thiago and a
storefront for Teagar Company, not another product built on the Teagar Company
design system.

Shared with the company brand: **only** the logo mark and ember orange `#FF6700`.

## Concept: "Golden hour"

The portrait is lit by a warm, low orange light against deep brown shadow. The
whole site is built from that light: warm darks, cream paper, one ember-orange
light source. It should read as an editorial, personal and confident site, closer
to a magazine profile than a technical spec sheet.

The signature element is **the sun disc**: a large solid ember circle (the round
shape echoes the logo's "C") that sits behind the portrait like a low sun and
reappears, small, as the section marker and the cursor-following glow on cards.

## Do NOT inherit from the Teagar Company design system

- No uppercase headlines, no italic emphasis, no letter-spaced eyebrows.
- No blueprint grid, crop marks, registration ticks, coordinates, "FIG. 01" captions.
- No blueprint blue `#1F4B8C`, charcoal `#2B2A28`, paper `#F0F1F3`.
- No 2–4 px "almost square" radii everywhere; no hairline-boxed card grids.
- No "01 — Section" kicker split into number + point mark.

## Palette

Both themes are first-class. Light is not white; dark is not black.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F5EFE6` cream | `#0E0B09` night umber | page |
| `--surface` | `#FFFAF3` | `#17120F` | cards, form |
| `--surface-2` | `#ECE3D6` | `#211A15` | alternating sections, chips |
| `--text` | `#1A130E` | `#F2EBE1` | body and headings |
| `--muted` | `#6B5D50` | `#A89C8E` | secondary text |
| `--line` | `#DDD1C1` | `#2E251F` | dividers |
| `--ember` | `#FF6700` | `#FF6700` | sun disc, primary button fill, large display accents |
| `--ember-text` | `#A03F00` | `#FF8A3D` | orange text below 24 px (links, small accents) |
| `--on-ember` | `#1A130E` | `#1A130E` | text on ember fills (6.3:1) |

Measured: text/bg 16:1 in both themes; muted ≥ 5.5:1; `--ember-text` ≥ 4.5:1 on
`--bg` and `--surface-2` (verify with the contrast test). `#FF6700` on cream is
2.5:1, so use it on light backgrounds only for shapes or text ≥ 32 px bold.

No gradients except one: a soft radial ember glow (`radial-gradient` of
`--ember` at ≤ 18% opacity to transparent) used behind the sun disc and as the
card hover glow. No glassmorphism, no blur.

## Typography

- **Typography (design-system fonts, owner request 2026-11-09):** the owner
  asked for the Teagar design-system typefaces, used with these roles only:
  - **Display** (`--display`): *Big Shoulders Display*, variable 100–900.
    Headings (h1, h2, h3), stat numbers, section numerals, wordmark and the
    pull quote. Headings use weight 800, sentence case, tracking -0.005em and
    leading 0.95–1.0. The hero emphasis (`titleB`) is the same face at
    weight 300 colored `--ember`; there is no italic anywhere.
  - **Body and UI** (`--body`): *Public Sans*, variable 100–900. Body 400,
    buttons and nav 600, sentence case, body 17–18 px, line-height 1.6.
  - **Small labels** (`--mono`): *IBM Plex Mono* 400/500/600 for card
    category and year, status chips, stack chips, fact labels, form labels,
    service numbers 01–06, footer meta and marquee group labels. Weight 500,
    12–13 px, tracking .02em, sentence case, `--muted`.
- Self-host woff2 (latin + latin-ext) under `public/fonts/` with the OFL text.
- Self-host woff2 (latin + latin-ext) under `public/fonts/` with the OFL text.

Scale (clamp): hero name 64→129 px; h2 51→101 px; h3 24→32 px; stat numbers and section numerals scaled about 15% up from the earlier scale.

## Shape and space

- Radii: 999 px for buttons, chips and the language/theme controls; 24 px for
  cards and images; 32 px for the hero portrait stage.
- Generous whitespace: sections 120–176 px vertical on desktop, 80 px mobile.
- 12-column fluid layout, max content width 1240 px, gutters 24–32 px.
- Borders are rare; separate with surface color changes and space.
- Shadows: none in dark; in light one soft warm shadow for raised cards
  (`0 1px 0 rgba(26,19,14,.04), 0 12px 32px -12px rgba(120,60,10,.18)`).

## Motion

Calm and physical. Durations 500–900 ms, `cubic-bezier(.2,.7,.2,1)`.

- Hero load: headline lines rise out of a mask (stagger 80 ms); sun disc scales
  0.85→1 and fades in; cut-out portrait rises 32 px.
- Hero pointer: the sun disc drifts up to 18 px toward the pointer, the
  portrait 6 px the opposite way (fine pointers only).
- Scroll: the sun disc sinks slowly (translateY up to 12% of its size) as the
  hero scrolls out, like a sunset.
- Cards: a 280 px radial ember glow follows the pointer inside the card on hover.
- Stack: one slow horizontal marquee row of technologies (pauses on hover and
  focus).
- Section headings and rows fade-rise 16 px on first view.
- `prefers-reduced-motion: reduce` disables every transform, the marquee
  becomes a wrapped list, and content is visible without JS.

## Layout by section

1. **Header:** transparent over the hero, becomes `--bg` with a bottom divider
   after scrolling. Left: logo mark (ember) + "Thiago Cerqueira" in Big Shoulders Display.
   Center/right: nav in sentence case, language pill ("EN" / "PT"),
   theme pill (sun/moon icon), primary button "Iniciar projeto" (ember pill).
   Mobile: menu button opens a full-screen sheet with large display links.
2. **Hero:** asymmetric. Left 7 columns: small line "Thiago Cerqueira ·
   Teagar Company" (muted, with a 10 px ember dot), then the headline
   `titleA` + `titleB` (weight 300, ember) in huge display, lead paragraph, two pill
   buttons (ember fill + outline), status with a pulsing 8 px green dot,
   location line. Right 5 columns: the **portrait stage**: rounded 32 px
   container in `--surface-2`, the sun disc (≈ 80% of stage width) positioned
   upper-center with its soft glow, the transparent cut-out in front anchored to
   the bottom edge. Below the hero, the three stats as large display numbers in a
   row with muted labels.
3. **Services:** editorial numbered list, not a card grid. Each service is a
   full-width row: number (01–06, display, muted), title (display h3), body and
   points in a second column. Dividers between rows. On hover/focus the row
   number turns ember and an arrow slides in. Section heading uses the sun-dot
   marker + h2 (`services.title`), with the intro in a side column.
4. **Work:** featured three as large rounded cards in a 2-column masonry-like
   grid (first card full width with a large title), the other six in a
   3-column grid of smaller cards. Card content: category · year (muted),
   status chip (pill: in development = ember outline, live = green, open
   source = neutral), display name, summary, stack chips, link pills with arrow.
   Cursor glow on hover.
5. **Process:** four large display numerals in a row with titles and text,
   connected by a thin line on which a small sun dot travels as the section
   scrolls (static under reduced motion).
6. **About:** a large display pull quote built from the first sentence of the
   second paragraph, next to the normal portrait (rounded 24 px, warm). Then
   the remaining paragraphs and the facts as a simple two-column list.
7. **Stack:** heading + marquee (all items from all groups, group names as
   muted separators). Under reduced motion: grouped wrapped chips.
8. **Contact:** big section on `--surface-2` (light) / `--surface` (dark):
   huge display `contact.title`, body, email as a big
   underlined display link, social pills; the form in a rounded `--surface` card
   with soft fields (12 px radius inputs, labels above, ember focus ring).
9. **Footer:** large display wordmark "Teagar" cropped by the page edge, tagline,
   links, © line, back to top.

## Accessibility floor (unchanged)

WCAG 2.2 AA contrast in both themes, visible focus (3 px `--ember` ring with
2 px offset, `--ember-text` ring on light surfaces if needed for 3:1), 44 px
targets, semantic landmarks, one h1, progressive enhancement, no horizontal
scroll from 320 px.
