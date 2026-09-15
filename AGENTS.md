# Riyo Productions Project Guide

## Project Context

This repository is a redesign of the existing Riyo Productions website located at:

`/Users/jaja/Documents/coding/jamms/client/Website`

Use that repository as a reference for existing content, behavior, and site structure. Do not copy its implementation blindly. The new site will receive a separate design later.

## Current Scope

The project is a largely unstyled foundation. Preserve that constraint unless the user explicitly asks for design work. The navbar is the exception: it is implemented against the Figma design and establishes the design tokens documented in `design.md`.

The homepage section order is:

1. Navbar
2. Hero / featured project grid
3. About and mission
4. Work / visuals / selected projects
5. Brands and clients
6. Services
7. Contact call to action
8. Footer

The site also has `/about` and `/work` routes.

## Architecture

- Astro frontend at the repository root
- Standalone Sanity Studio in `studio/`
- Shared page shell in `src/layouts/Layout.astro`
- Page sections in `src/components/sections/`
- Shared UI and development utilities in `src/components/ui/`
- Routes in `src/pages/`
- Sanity queries and client setup in `src/lib/sanity.ts`
- Global baseline and development-grid styles in `src/styles/global.css`
- Design tokens in `src/styles/tokens.css`, explained in `design.md`
- Sanity schemas in `studio/schema-types/`

Keep components separated by meaningful site section. Avoid premature abstractions and design-system work while the visual direction is undecided.

## Commands

Install dependencies:

```bash
npm install
npm --prefix studio install
```

Run with Infisical:

```bash
npm run dev
npm run studio
```

Run without Infisical for local troubleshooting:

```bash
npm run dev:local
npm run studio:local
```

Verification:

```bash
npm run check
npm run build
npm run build:local
npm run studio:build
```

`npm run build:local` must work without Sanity credentials and render empty CMS states safely.

## Environment Variables

Infisical is the preferred environment-variable source. Link the repository with:

```bash
infisical login
infisical init
```

Every collaborator must use their own Infisical account and be invited to the project's organization or project. Never share Infisical login credentials, access tokens, or machine identities. After accepting the invitation, each collaborator should run `infisical login`; if the repository link is unavailable on their machine, they should also run `infisical init` and select the existing project.

Expected variables:

```text
PUBLIC_SANITY_PROJECT_ID
PUBLIC_SANITY_DATASET
```

The Astro app and standalone Studio share these values. `PUBLIC_*` variables are exposed identifiers, not secrets. Never expose read/write tokens using a `PUBLIC_` prefix or commit credentials to the repository.

## Sanity Guidelines

- The local Studio schema is the source of truth.
- Use `defineType`, `defineField`, and `defineArrayMember` in schemas.
- Wrap GROQ queries with `defineQuery` and project only required fields.
- Update schemas, queries, and generated types together when content fields change.
- Let Sanity generate IDs for ordinary documents.
- Use references for reusable content and nested objects for document-specific content.
- Never remove populated production fields without a migration and deprecation period.
- Publish documents before expecting the public Astro build to return them.
- Project video fields should hold Vimeo, YouTube, or Mux playback URLs. Do not serve production video through raw Sanity file assets.
- `project.devVideo` and `siteSettings.devHeroVideo` are temporary local-development fields holding the reference site's mp4s. Remove them once real playback URLs exist; never depend on them in production code. `stripDevVideo()` in `src/lib/sanity.ts` enforces this by deleting `devVideoUrl` from the payload outside `import.meta.env.DEV`, so the featured grid falls back to it locally and never in a build.
- The featured grid autoplays `videoUrl` inline in a `<video>`, so it must be a direct playback file (Mux `.m3u8`/`.mp4`). Vimeo and YouTube page URLs need an iframe and will not play there.
- `npm run seed:dev` reseeds the dataset from the reference site via `studio/scripts/seed-dev-content.mjs` and its `seed-content.json` manifest.
- Most seed assets live in the reference site, but a manifest path beginning `logos/` resolves against `studio/scripts/logos/` instead. Those are the marks the design uses where the reference site has a wordmark: Google's G, Duolingo's owl, Audible's chevron, and Notion's white-faced cube.
- Seed documents use deterministic `seed-*` IDs. Do not use dots in document IDs: a dotted ID is a private ACL path and is unreadable by anonymous clients.

- The Studio registers the `@sanity/color-input` plugin, which supplies the `color` type used by `client.logoDisplay.tint`. Pin it to the v5 line while the Studio is on `sanity` v4.
- `client.logoDisplay` holds per-logo presentation values (grayscale, invert, opacity percent, tint, scale percent). It is content, not styling: components must read it rather than hard-coding logo treatment. `invert` exists because several client logos are drawn in solid black and would otherwise vanish against the near-black page; it is applied after `grayscale`, so a coloured mark flips tone rather than hue.

- `siteSettings.navigation` holds the navbar: wordmark, an optional logo-mark override, and the link list. Navbar labels, hrefs, button variants, and the arrow flag are content and must not be hard-coded in components.

- `featuredWork` is the homepage grid: one document holding an ordered array of references to `project`. Featuring and sequencing are the same drag-and-drop decision, which is why `project` has no `featured` boolean. `project.orderRank` remains, and now only orders the full `/work` listing.
- `selectedProjects` is the selected work listing: one document holding a heading, an ordered array of four `project` references, and the call-to-action label and link. It reuses `featuredWork`'s model — selecting and ordering are the same drag-and-drop decision — but is a separate list, so a project can be in the homepage grid, the selected listing, both, or neither.
- `project.subtitle` and `project.metrics` are the copy the selected listing renders next to each still. Metrics are `metric` objects (`value` plus `label`) and live on the project, not on the listing, so any view can show them.
- The services section is the only list section without a selection document: it renders every `service`, ordered by `service.orderRank`, so featuring is not a decision anyone makes there. Only its heading is section-level content, and it lives in `siteSettings.servicesSection` beside `aboutSection` rather than in a singleton of its own.
- `service.cover` and `service.coverVideoUrl` are the media shown in the panel beside the services list, one per service. `coverVideoUrl` is played in a `<video>`, so like the featured grid it must be a direct playback file, not a Vimeo or YouTube page URL.

- `brandsClients` is the logo wall: one document holding a heading and an ordered array of `client` references. It reuses the `featuredWork` model again. The board is a fixed seven-by-two grid that drops columns and hides the overflow cells at narrower widths, so it is a window onto the list rather than the whole of it — the list can be longer or shorter than the board, and cells cycle through it. A list shorter than the board repeats, as the Figma comp does.
- `featuredWork`, `selectedProjects`, `brandsClients`, and `siteSettings` are singletons pinned to the document IDs `featuredWork`, `selectedProjects`, `brandsClients`, and `siteSettings`. `studio/sanity.config.ts` gives each a fixed structure entry and filters them out of the global new-document menu, because a second copy would make the `[0]` in `src/lib/sanity.ts` ambiguous. Add new singletons to `singletonTypes` in `studio/schema-types/index.ts`.

Current document types are `project`, `client`, `service`, `featuredWork`, `selectedProjects`, `brandsClients`, and `siteSettings`, plus the `navLink` and `metric` objects.

## Development Tools

React Grab loads only in development using its documented global script because its initializer does not support Astro automatically.

Press `Shift+G` to toggle the layout grid. At a 1440px viewport the grid has:

- 12 columns
- 64px outer margins
- 16px gutters

The grid is visual only and must remain non-interactive and hidden by default.

## Implementation Conventions

- Use TypeScript and Astro components.
- Keep edits minimal and follow existing file naming and organization.
- Use semantic HTML and preserve keyboard and screen-reader accessibility.
- Do not add React unless an interactive feature genuinely requires it; prefer native Astro and browser APIs.
- Keep CMS content out of component source once its schema and query exist.
- Handle absent CMS configuration and empty datasets without crashing builds.
- Do not add visual styling, animation, fonts, color systems, or layout opinions unless explicitly requested.
- When styling is requested, use the tokens in `src/styles/tokens.css`. New shades come from changing the opacity of an existing brand color, never from a new hex value.
- Buttons go through `src/components/Button.astro`. Add variants there instead of writing one-off button CSS.
- Every page section renders `src/components/ui/VerticalEdges.astro` and sets `position: relative` so it can anchor. Do not hand-roll margin rules with `border-inline`.
- All hairlines — button borders, section rules, vertical edges — use `--border-hairline` at `--border-hairline-width`. Never hard-code a stroke width.
- The horizontal rule between two page sections is `src/components/ui/SectionRule.astro`, placed by the page between the sections it separates. Sections do not draw their own top or bottom boundary, so the rule is never doubled.
- The muted heading that opens a section is `src/components/ui/SectionHeading.astro` — right-aligned, held half a column off the right hairline, revealed without travelling. Selected work, brands and clients, and services all use it. It takes the heading `id` as a prop because `aria-labelledby` needs a target that is unique on the page, so there is one component but not one id. Its rhythm is the `--section-heading-space` and `--section-heading-gap` tokens: the air a section opens with, and the gap from the heading to the content under it. A section applies the first as its own top padding; the component owns the second. Do not re-author either per section.
- Section components take their CMS data as props. Pages do the fetching, so a section can be rendered on more than one route without refetching.
- The Figma file is the design source of truth: https://www.figma.com/design/06xlOkVmbuispJW6Bs5m9B/Riyo (navbar is node `231:113`). Its type is specified as PP Neue Montreal; the site uses Inter Tight instead.
- Inter Tight is self-hosted via Astro's fonts API in `astro.config.mjs` and preloaded by `<Font>` in `src/layouts/Layout.astro`. Reference it through `--font-heading` / `--font-body`, never by family name.
- Type sizes come from the `--text-h1`–`--text-h4` and `--text-b1`–`--text-b3` scale. Only h2, h3, and b3 exist in Figma; the rest are extrapolated and the Figma values win if they are ever defined. Do not hard-code font sizes.
- Across the scale only size and kerning change. One family, two weights, two line heights. Text hierarchy uses the `--ink-*` opacities, not a second grey.
- Do not modify the reference repository unless explicitly asked.
- Run relevant checks after code changes and report anything that could not be verified.
