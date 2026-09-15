# Design System

The visual language for the Riyo Productions site. Source of truth for values is
`src/styles/tokens.css`; this file explains the rules behind them.

## Brand colors

Five brand colors, no more. Every other shade in the site is one of these at a
different opacity — never a new hex value.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-base` | `#0A0A0A` | Near-black. Page background. |
| `--color-paper` | `#F5F4F0` | Off-white. Body text, logo, quiet UI. |
| `--color-accent` | `#C8FF3D` | Acid green. The main accent and primary action. |
| `--color-signal` | `#FF3B1F` | Signal red/orange. Alternate accent. |
| `--color-magenta` | `#FF2E6B` | Hot pink. Alternate accent. |
| `--color-cobalt` | `#1E5AFF` | Electric blue. Alternate accent. |

Each color is also published as a raw channel triplet (`--color-accent-rgb:
200 255 61`) so it can be used at any opacity:

```css
background-color: rgb(var(--color-accent-rgb) / 0.2);
border-color: rgb(var(--color-paper-rgb) / 0.19);
```

Use the `-rgb` triplet whenever transparency is involved and the solid token
(`var(--color-accent)`) otherwise. Do not introduce hex literals in components.

### Text emphasis

Hierarchy in text comes from opacity, not from a second grey.

| Token | Value | Use |
| --- | --- | --- |
| `--ink-primary` | paper 100% | Headings, body copy, the default |
| `--ink-secondary` | paper 70% | Supporting copy, captions |
| `--ink-muted` | paper 50% | Metadata, labels, placeholders |
| `--ink-subtle` | paper 35% | Disabled and decorative text |

### Hairlines

Every hairline on the site — section rules, vertical edges — is
`--border-hairline` at `--border-hairline-width` (1px). One weight, one color.
Changing the token changes every stroke. Buttons carry no border; they are read
by their surface fill alone.

## Vertical edges

`src/components/ui/VerticalEdges.astro` draws the two vertical hairlines that
mark the page's left and right margins — the outer edges of the first and
twelfth columns, at `--grid-margin`. Every section on the page carries one, so
the lines run the height of the page.

It is absolutely positioned and spans its section, so the section must set
`position: relative`. It is decorative: `aria-hidden`, `pointer-events: none`,
and drawn with `::before` / `::after` rather than real elements.

Do not confuse it with `ColumnGrid.astro`, the 12-column overlay toggled with
Shift+G. That one is a development tool, hidden by default. This one is part of
the design and always visible.

## Buttons

`src/components/Button.astro` is the single button. It renders an `<a>` when
given `href` and a `<button>` otherwise, and takes `variant`, `arrow`,
`external`, `ariaLabel`, and `type`.

| Variant | Rest | Hover / focus | Text |
| --- | --- | --- | --- |
| `green` | accent at 20% | accent at 40% | `--color-accent` |
| `white` | paper at 0% | paper at 20% | `--color-paper` |

Both variants carry a hairline border of paper at 19% at
`--border-hairline-width`, matching the Figma navbar. Background transitions run 150ms and are disabled under
`prefers-reduced-motion`.

New button styles should be added as variants here rather than as one-off CSS in
a consuming component.

## Icons

Use the **Central Icons** set for interface icons. Inline its SVGs where needed
so they can inherit the component's text color through `currentColor`; do not
redraw, substitute, or mix them with another icon set. Buttons accept named
`icon-start` and `icon-end` slots for leading and trailing Central Icons.

## Typography

The typeface is **Inter Tight**, self-hosted through Astro's fonts API. It is
declared once in `astro.config.mjs`, preloaded by `<Font>` in
`src/layouts/Layout.astro`, and consumed through `--font-heading` and
`--font-body`, both of which point at the generated `--font-inter-tight`
variable. Astro downloads the woff2 into `_astro/fonts/` at build time, so there
is no request to Google at runtime.

The Figma file specifies PP Neue Montreal; Inter Tight is the deliberate
substitute in code.

A second family, **JetBrains Mono**, is loaded the same way and exposed as
`--font-mono`. It is not a third voice in the hierarchy: it is reserved for
metadata set against the prose — testimonial attributions, the carousel
counter, and labels of that kind. Body copy and headings never use it.

### Scale

h2, h3, and b3 are the Figma text styles. The remaining steps continue the same
1.25 ratio on the headings and a 4px ladder on the body sizes, so the whole
system is derived from the three real values rather than invented alongside
them. Sizes are the value at the 1440px design width; each step scales with the
viewport down to a floor, and b3 never scales at all.

| Token | Figma style | Size | Kerning | Use |
| --- | --- | --- | --- | --- |
| `--text-h1` | — | `clamp(32px, 3.333vw, 48px)` | `-0.05em` | Page and hero headings |
| `--text-h2` | h2 · 40/Auto | `clamp(28px, 2.778vw, 40px)` | `-0.04em` | Section headings |
| `--text-h3` | h3 · 32/Auto | `clamp(20px, 2.222vw, 32px)` | `-0.04em` | Navbar, subheadings |
| `--text-h4` | — | `clamp(18px, 1.667vw, 24px)` | `-0.02em` | Small headings, eyebrows |
| `--text-b1` | — | `clamp(18px, 1.667vw, 24px)` | `-0.02em` | Lead paragraphs |
| `--text-b2` | — | `clamp(17px, 1.389vw, 20px)` | `0` | Long-form body copy |
| `--text-b3` | b3 · 16/Auto | `16px` | `0` | Default body, UI text |

Kerning tightens as type grows, which is the only axis besides size that varies
across the scale: `--tracking-display` (h1), `--tracking-heading` (h2, h3),
`--tracking-tight` (h4, b1), `--tracking-body` (b2, b3).

Everything else is shared: one family, two weights (`--weight-regular` 400,
`--weight-medium` 500), and two line heights — `--leading-heading` (`1`, what
Figma's "Auto" resolves to for these styles) and `--leading-body` (`1.5`).

`--leading-body` is the one deliberate departure: the Figma panel shows b3 at
Auto, which is too tight for multi-line paragraphs.

`global.css` maps `h1`–`h4` to the heading steps and sets the `<body>` default
to b3; heading margins stay at the browser default until the design specifies
vertical rhythm. b1 and b2 have no element of their own — apply them with
`font-size: var(--text-b1)` where a lead paragraph or long-form column needs
them.

h1, h4, b1, and b2 are extrapolations, not design decisions. If the Figma file
later defines them, its values win: update `tokens.css` and this table together.

The navbar is `--text-h3`.

## Layout

`--grid-margin` (64px at 1440) and `--grid-gutter` (16px at 1440) match the
12-column development grid toggled with `Shift+G`. The navbar uses the grid
margin for its outer padding; the Figma frame sits at an 82px offset, which is
treated as canvas imprecision rather than a second margin value.

`--navbar-height` is 60px, applied as a minimum height so the bar can grow when
content wraps.

## Navbar

`src/components/Navbar.astro` implements Figma node `231:113`. Layout: logo mark
plus wordmark on the left, a flush row of `Button` components on the right whose
shared borders overlap by 1px.

The logo mark is the exported Figma vector, inlined in
`src/components/BrandMark.astro` so it inherits `currentColor`. It can be
overridden per-project from the Studio (Site settings → Navigation → Logo mark).

All navbar content is content, not code: the wordmark, the logo override, and
the list of links (label, href, button variant, arrow, new-tab) live on
`siteSettings.navigation`. `getNavigation()` in `src/lib/sanity.ts` falls back to
Work / About / Contact us when Sanity is unconfigured or the document is
unpublished, so `npm run build:local` still renders a correct navbar.

## Featured grid

`src/components/sections/Hero.astro` implements Figma node `146:244`: the
homepage grid that sits directly under the navbar.

Three 16:9 tiles per row, three rows, nine in total. The tiles are **flush** —
the grid has no gutter, which is the one place the site deliberately ignores
`--grid-gutter`. They are inset by `--grid-margin`, so a tile is exactly a third
of the content width and `aspect-ratio: 16 / 9` sets the height.

The section is bounded above and below by a rule of `--border-hairline`, running
full bleed while the tiles stay inside the margin. Figma draws these at 3px, but
they use `--border-hairline-width` — one hairline weight across the site rather
than two.

Each tile is a still with a muted, looping video laid over it. The still is the
project's `poster`, served from the Sanity CDN at tile size through a `srcset`
and cropped to fill; the first row loads eagerly and the rest lazily. A tile
with no poster falls back to paper at 5%.

The video carries `preload="none"` and no `autoplay` attribute, so nothing is
downloaded until an IntersectionObserver sees the tile on screen and calls
`play()`. It fades in over the still on its first `playing` event, so a tile
never flashes empty. Videos pause when scrolled away or when the tab is hidden,
and under `prefers-reduced-motion` none of them ever play — the still is what
remains. There are no controls and no audio: the video is decorative and
`aria-hidden`, with the still carrying the alt text.

Below 700px the grid collapses to a single column — three 16:9 tiles across a
phone are too small to read.

The design shows no heading here, so the page `h1` is present but
`.visually-hidden`.

Content comes from the `featuredWork` document: an ordered list of project
references, dragged into order in the Studio. Order in the CMS is order in the
grid, filling left to right and top to bottom.

## About and mission

`src/components/sections/AboutMission.astro` implements Figma node `146:217`.
The desktop section follows the 12-column grid: the testimonial occupies four
columns on the left and the mission statement starts at column six and spans
seven columns. Below 900px the two areas stack.

Content lives in `siteSettings.aboutSection`: the statement, call-to-action,
and ordered testimonials are editable in Studio. Each testimonial contains a
portrait, name, role/company, and quote. Portraits are rendered grayscale; use
the Sanity image hotspot to control their square crop.

Within the mission statement, Riyo Productions and the words brands, artists,
and creators use the existing accent, signal, magenta, and cobalt brand tokens.

The video source is `project.videoUrl`. Because the grid plays it inline in a
`<video>` element, that URL has to be a direct playback file — a Mux `.m3u8` or
`.mp4`. A Vimeo or YouTube *page* URL will not play here; those need an iframe,
which nine autoplaying tiles cannot afford. In development only, `devVideo`
stands in when `videoUrl` is empty.
