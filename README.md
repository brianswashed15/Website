# Riyo Productions

Astro site with a standalone Sanity Studio.

## Setup

### Prerequisites

- Node.js and npm
- The [Infisical CLI](https://infisical.com/docs/cli/overview)
- Access to the Riyo Productions Infisical project
- A Sanity account with access to the `riyo productions` project (`uieb2l00`)
- `ffmpeg` on `PATH` only if you need to run the development-content seed

Every collaborator must use their own Infisical and Sanity accounts. The project owner should
invite collaborators to both services; do not share account credentials, access tokens, or
machine identities.

### Install dependencies

Run both installs from the repository root:

```bash
npm install
npm --prefix studio install
```

### Connect Infisical

1. Accept the invitation to the existing Riyo Productions Infisical organization or project.
2. Sign in with your own account:

```bash
infisical login
```

3. Link this checkout to the existing project:

```bash
infisical init
```

Select the Riyo Productions project and its development environment when prompted. Infisical
creates a local `.infisical.json` link; it is ignored by Git and may need to be created on each
collaborator's machine.

The linked environment must contain:

```text
PUBLIC_SANITY_PROJECT_ID=uieb2l00
PUBLIC_SANITY_DATASET=production
```

The Astro app and standalone Studio share these values. The npm scripts map them to Sanity's
required `SANITY_STUDIO_*` names when starting or building Studio. The `PUBLIC_*` values are
intentionally exposed identifiers; never give a private read/write token a `PUBLIC_` prefix.

Confirm Infisical can inject the project ID:

```bash
infisical run -- printenv PUBLIC_SANITY_PROJECT_ID
```

The output should be `uieb2l00`. If Infisical reports a connection problem but says it is
serving the last successful fetch, it is using the locally cached values. Run `infisical login`
again if the session has expired or no cached values are available.

### Connect Sanity

Infisical provides configuration values but does not sign you into Sanity. Authenticate the
Sanity CLI separately with your own invited Sanity account:

```bash
cd studio
npx sanity login
cd ..
```

The Studio is already configured for project `uieb2l00` and dataset `production`; do not create
a new Sanity project. Confirm the active account and project with:

```bash
infisical run -- sh -c 'SANITY_STUDIO_PROJECT_ID=$PUBLIC_SANITY_PROJECT_ID SANITY_STUDIO_DATASET=$PUBLIC_SANITY_DATASET npm --prefix studio exec sanity debug'
```

Schema changes are defined locally in `studio/schema-types/`. After changing a schema, deploy it
and regenerate frontend query types:

```bash
cd studio
infisical run -- sh -c 'SANITY_STUDIO_PROJECT_ID=$PUBLIC_SANITY_PROJECT_ID SANITY_STUDIO_DATASET=$PUBLIC_SANITY_DATASET npx sanity schema deploy'
cd ..
npm run typegen
```

### Start development

Run Astro and Studio in separate terminals from the repository root:

```bash
npm run dev
```

```bash
npm run studio
```

Astro normally runs at `http://localhost:4321/`. The standalone Sanity Studio runs at
`http://localhost:3333/` and is not embedded in the Astro app.

### Verify the setup

```bash
npm run check
npm run build
npm run studio:build
```

The primary `dev`, `build`, `preview`, `studio`, `studio:build`, `typegen`, and `seed:dev`
scripts inject variables through Infisical. The `dev:local`, `build:local`, `preview:local`, and
`studio:local` scripts bypass Infisical for troubleshooting. `npm run build:local` works without
Sanity credentials and renders empty CMS states safely; `studio:local` still requires
`SANITY_STUDIO_PROJECT_ID` because Studio itself cannot run without a project.

## Structure

- `src/layouts/Layout.astro`: shared page shell
- `src/components/sections/`: page section components
- `src/components/ui/`: shared UI and development utilities
- `src/pages/`: `/`, `/about`, and `/work`
- `src/lib/sanity.ts`: Sanity client, queries, and data access
- `src/styles/tokens.css`: brand color, type, and layout tokens (see `design.md`)
- `studio/`: standalone Sanity Studio and content schemas

`design.md` documents the brand colors, the type, the `Button` variants, and the navbar.
Type runs `--text-h1`–`--text-h4` and `--text-b1`–`--text-b3`, extrapolated from the h2, h3,
and b3 styles in Figma; only size and kerning change across the scale, and text hierarchy
comes from the `--ink-*` opacities. Inter
Tight is self-hosted through Astro's fonts API, so no font request leaves the site at
runtime. Colors are
defined once in `src/styles/tokens.css` as channel triplets, so any tint is the same brand
color at a different opacity.

The navbar is editable from the Studio under **Site settings → Navigation**: wordmark, an
optional logo-mark override, and the link list, where each link picks its button variant
(white or green) and whether it shows the ↗ arrow. Without Sanity credentials the site falls
back to Work / About / Contact us.

Project videos use external Vimeo, YouTube, or Mux playback URLs instead of raw video file assets.

Each client carries a collapsible `Logo display` group — grayscale, opacity, tint, and scale — so
logo treatment is editable per brand instead of hard-coded. The tint field uses the
`@sanity/color-input` Studio plugin.

## Development content

`npm run seed:dev` populates the dataset from the reference site at `../Website`, using
`studio/scripts/seed-content.json` as the manifest. It creates the site settings, clients,
services, and 31 projects, generating a poster still for each clip with `ffmpeg` (required
on PATH). Documents use deterministic `seed-*` IDs, so the script is safe to re-run.

The clips are uploaded into the temporary `devVideo` and `devHeroVideo` file fields so there
is something to play locally. They are development scaffolding: production video belongs in
`videoUrl` as a hosted playback URL, and both dev fields should be removed once real URLs
exist. Set `REFERENCE_SITE_DIR` if the reference site lives elsewhere.

React Grab loads during local development. The initializer does not support Astro automatically, so it uses the package's documented global-script setup. Press `Shift+G` to toggle the 12-column layout grid; at 1440px it uses 64px margins and 16px gutters.
