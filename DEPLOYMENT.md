# Deployment and Client Handoff

This repository contains two separately deployed applications:

- The public website is a static Astro site built from the repository root.
- The content editor is a standalone Sanity Studio in `studio/`.

Sanity stores the content and media. Netlify or Vercel builds the Astro source,
fetches the published Sanity content, and serves the resulting static files.
Deploying one application does not automatically deploy the other.

## Recommended Production Ownership

For a nontechnical client, use this arrangement:

- The client owns the Netlify team and production site.
- The client owns the domain registrar and DNS account.
- The client has at least one Sanity project administrator and each editor has
  their own Sanity account.
- The development team remains a collaborator in GitHub, Netlify, and Sanity
  for maintenance, but does not remain the sole owner of any production service.
- Host Studio with Sanity at a memorable `*.sanity.studio` URL. This is simpler
  than maintaining a second Netlify site and handles Studio routing and Sanity
  CORS automatically.
- Connect Sanity publishing to a Netlify build hook so published content appears
  on the static site without asking the client to deploy manually.

Do not share personal accounts, passwords, API tokens, or recovery codes. Invite
people to each service with their own account.

## Architecture and Build Behavior

The Astro site uses the default static output. No Netlify adapter or server is
required. Its deployment settings are:

```text
Base directory: repository root
Install command: npm ci
Build command: npm run build:local
Publish directory: dist
Node.js version: 22
```

`npm run build:local` runs `astro check` and `astro build`. It intentionally does
not use Infisical, because Netlify and Vercel inject their own build environment
variables.

The build needs these public identifiers to render Sanity content:

```text
PUBLIC_SANITY_PROJECT_ID=uieb2l00
PUBLIC_SANITY_DATASET=production
```

These values identify a public Sanity dataset and are not secrets. Never add a
Sanity read or write token with a `PUBLIC_` prefix. The frontend currently makes
anonymous, read-only requests and therefore needs no Sanity token.

The site fetches Sanity content while it builds. This has two consequences:

1. Only published Sanity documents appear on the public site.
2. Publishing content does not change an already deployed static site until a
   new Netlify or Vercel build runs.

The site safely renders fallback or empty CMS states if its Sanity variables are
missing. A successful build without these variables is therefore not proof that
the production CMS connection is configured correctly.

## Pre-Deployment Checklist

Run these commands from the repository root before a production release:

```bash
npm ci
npm --prefix studio ci
npm run check
npm run build:local
SANITY_STUDIO_PROJECT_ID=uieb2l00 SANITY_STUDIO_DATASET=production npm --prefix studio run build
```

For a local build containing production Sanity content, either use Infisical:

```bash
npm run build
```

or provide the public variables directly for that command:

```bash
PUBLIC_SANITY_PROJECT_ID=uieb2l00 PUBLIC_SANITY_DATASET=production npm run build:local
```

Then inspect the output with:

```bash
PUBLIC_SANITY_PROJECT_ID=uieb2l00 PUBLIC_SANITY_DATASET=production npm run preview:local
```

Check at minimum:

- `/`, `/about`, and `/work` load without console or network errors.
- Published text, images, links, client logos, and services are present.
- Video URLs are production playback URLs and work on desktop and mobile.
- Navigation, contact links, and external links point to production destinations.
- There are no development-only Sanity video assets relied on in production.

## Deploy the Website to Netlify

### 1. Create the Client-Owned Netlify Site

1. Have the client create or use their own Netlify account and team.
2. In Netlify, choose **Add new project** and **Import an existing project**.
3. Connect the GitHub organization or account that owns this repository.
4. Select this repository.
5. Set the production branch to `main`.
6. Confirm the build settings shown under **Architecture and Build Behavior**.
7. Set `NODE_VERSION` to `22` in Netlify's environment variables.
8. Add `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` with the values
   above. Their scope must include **Builds**, and they should apply to
   Production and Deploy Previews.
9. Start the first deployment.

Netlify normally installs root dependencies automatically from
`package-lock.json`. Studio dependencies are not needed to build the public
website.

### 2. Verify the First Netlify Deploy

Open the generated `*.netlify.app` URL before attaching the production domain.
Verify the pages and CMS content listed in the pre-deployment checklist.

If CMS-driven sections are unexpectedly empty, confirm the two
`PUBLIC_SANITY_*` variables exist in Netlify and trigger **Deploy site** with
**Clear cache and deploy site**.

### 3. Configure Deploy Previews

Keep Netlify Deploy Previews enabled for pull requests. This lets developers and
the client review code changes at a temporary URL before merging them to
`main`. A merge or direct push to `main` creates the production deployment.

Do not give a nontechnical client routine responsibility for merging code. They
can review preview links while a developer owns the merge and release process.

### 4. Attach the Production Domain

1. In Netlify, open **Domain management** and add the production domain.
2. Decide on one canonical hostname, normally `www.riyoproductions.com` or
   `riyoproductions.com`.
3. Follow Netlify's displayed DNS records exactly. The required records depend
   on whether Netlify DNS or an external DNS provider is used.
4. Configure the other hostname to redirect to the canonical hostname.
5. Wait for Netlify to provision HTTPS, then verify both HTTP and HTTPS requests.

Before changing DNS, record the existing DNS entries and lower the TTL if the
provider permits it. Do not delete unrelated email records such as MX, SPF,
DKIM, or DMARC records. Domain and DNS access should remain in the client's
account.

### 5. Rebuild Netlify When Sanity Content Is Published

Create a build hook in Netlify under **Project configuration → Build & deploy →
Continuous deployment → Build hooks**. Name it `Sanity production publish` and
target `main`.

The hook URL is effectively a deployment credential. Do not commit it or expose
it in frontend code.

In Sanity Manage, create a webhook for project `uieb2l00` that sends a `POST` to
the Netlify build-hook URL when production documents are created, updated, or
deleted. Configure it for dataset `production` and published document activity,
not drafts. If the webhook configuration offers a draft filter, use:

```groq
!(_id in path("drafts.**"))
```

Test the integration by making and publishing a harmless content change. A new
Netlify deploy should start, complete successfully, and display the change.
Sanity webhooks and Netlify builds can take a short time, so publication is not
instant.

If no webhook is configured, an authorized Netlify user can manually choose
**Deploy site**, but that is not the recommended client workflow.

### 6. Netlify Rollback

Netlify retains earlier deploys. If a production code deploy is broken, open the
previous known-good deploy and use Netlify's option to publish or restore it.
Then fix the source code in Git; otherwise the next build can reintroduce the
problem.

Deploy rollback does not roll back Sanity content. Correct or restore content in
Sanity separately, publish it, and trigger another site build.

## Deploy the Website to Vercel

The repository already contains `vercel.json` and a GitHub Actions workflow at
`.github/workflows/deploy.yml`.

`vercel.json` configures:

```text
Framework: Astro
Install command: npm ci
Build command: npm run build:local
Output directory: dist
Vercel Git integration: disabled
```

Because Vercel's native Git integration is disabled, GitHub Actions currently
performs preview and production deployments. The repository needs these GitHub
Actions secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

The Vercel project itself must also contain:

```text
PUBLIC_SANITY_PROJECT_ID=uieb2l00
PUBLIC_SANITY_DATASET=production
```

Pushes to `main` deploy to production. Pull requests deploy previews. The
workflow can also be run manually from GitHub Actions.

### Vercel Commit-Author Errors

If Vercel reports that it cannot identify a commit author, it is checking the
email stored in the commit metadata. The author should use an email that is
verified on their GitHub account and be authorized for the relevant Vercel team:

```bash
git config user.name "Their Name"
git config user.email "their-verified-github-email@example.com"
```

This only affects new commits. After fixing the configuration, create and push a
new commit. A verified GitHub `noreply` address is also acceptable.

When Netlify becomes production, disable the Vercel GitHub Actions workflow or
remove its Vercel secrets after DNS has switched and the Netlify site is
verified. Do not leave two systems appearing to own production deployments.

## Deploy Sanity Studio

Studio deployment is for schema and editor-interface changes. Editing and
publishing ordinary content does not require redeploying Studio.

### Recommended: Sanity-Hosted Studio

The developer performing the deployment must have their own Sanity account with
deployment access to project `uieb2l00`.

Authenticate once:

```bash
cd studio
npx sanity login
cd ..
```

Build and verify Studio from the repository root:

```bash
npm --prefix studio ci
SANITY_STUDIO_PROJECT_ID=uieb2l00 SANITY_STUDIO_DATASET=production npm --prefix studio run build
```

Deploy from `studio/` with the required variables:

```bash
cd studio
SANITY_STUDIO_PROJECT_ID=uieb2l00 SANITY_STUDIO_DATASET=production npx sanity@latest deploy --schema-required
cd ..
```

On the first deployment, choose a stable, client-friendly hostname such as
`riyo-productions`, if available. Sanity then serves Studio at a URL resembling:

```text
https://riyo-productions.sanity.studio
```

Record the final URL in the client's password manager or operations notes. The
client signs in with their own Sanity account; the public Studio files are not a
substitute for Sanity authentication.

`sanity deploy` deploys the Studio, its manifest, and its workspace schema. The
`--schema-required` flag makes the command fail if schema deployment fails.

### After Schema Changes

Schema source lives in `studio/schema-types/`. After changing it:

1. Review whether existing content needs a migration. Never delete a populated
   production field without a migration and deprecation period.
2. Build Studio locally.
3. Deploy Studio and its schema with the command above.
4. Regenerate frontend types:

```bash
npm run typegen
```

5. Commit the schema source and generated `sanity.types.ts` together.
6. Build and deploy the Astro site if its query or rendering code also changed.

Infisical-backed development commands remain documented in `README.md`.

### Alternative: Self-Host Studio on Netlify

This is supported but is not recommended for this nontechnical handoff. It adds
a second Netlify site, separate environment settings, SPA routing, CORS setup,
and Sanity Studio registration.

If self-hosting is required, create a second Netlify site from the same repo:

```text
Base directory: studio
Install command: npm ci
Build command: npm run build
Publish directory: dist
```

Set these build variables on the Studio Netlify site:

```text
SANITY_STUDIO_PROJECT_ID=uieb2l00
SANITY_STUDIO_DATASET=production
NODE_VERSION=22
```

Configure an SPA fallback so Studio client-side routes serve `index.html`, and
add the exact Studio origin to the Sanity project's CORS origins with
credentials allowed. Do not use `*` for an authenticated Studio.

After the Netlify Studio URL is live, register that external Studio and deploy
its schema from `studio/`:

```bash
SANITY_STUDIO_PROJECT_ID=uieb2l00 SANITY_STUDIO_DATASET=production npx sanity@latest deploy --external --url https://studio.example.com --schema-required
```

Run that registration command on every Studio deployment. In unattended CI it
also requires a Sanity deploy token in `SANITY_AUTH_TOKEN`; store that token only
in the hosting provider's protected environment variables.

## Client Content Workflow

The client's routine workflow should be:

1. Open the Sanity Studio URL.
2. Sign in with their own account.
3. Edit the relevant project, client, service, or site settings document.
4. Use Studio's validation messages to correct missing required fields.
5. Preview the entry where practical.
6. Click **Publish**. Draft changes are not visible on the public website.
7. Wait for the Netlify build triggered by the Sanity webhook.
8. Check the public site after the deployment completes.

The client should not need GitHub, a terminal, Infisical, or Netlify for normal
content editing. They only need Netlify access for billing, domain ownership,
deployment visibility, and emergency support.

Content caveats specific to this project:

- Project and service videos rendered in `<video>` require direct playback URLs,
  such as Mux `.m3u8` or `.mp4` URLs. YouTube and Vimeo page URLs do not work in
  those players.
- Do not use the temporary `devVideo` or `devHeroVideo` Sanity fields for
  production delivery.
- Content must be published, not merely saved as a draft.
- Deleting referenced content can remove it from lists or leave incomplete
  entries. Prefer unpublishing only after checking where an item is used.

## Client Handoff Checklist

Complete this while the development team still has full access:

- Client owns the domain registrar and can access DNS and billing.
- Client owns or administers the Netlify team and production site.
- At least two appropriate client contacts have Netlify access to avoid a
  single-person lockout.
- Client has a Sanity project administrator; every editor uses an individual
  Sanity account with the least privilege they need.
- Development team has collaborator access rather than sole ownership.
- Production Git repository ownership and recovery access are documented.
- Netlify environment variables are configured for Production and previews.
- Netlify's production branch is `main` and Deploy Previews are enabled.
- The production domain, canonical redirect, and HTTPS all work.
- The Sanity-hosted Studio URL is recorded and opens successfully.
- A Sanity publish triggers a Netlify build and appears on the public site.
- Billing contacts are set correctly in Netlify, Sanity, the registrar, video
  hosting, GitHub, and any other paid service.
- Recovery methods and two-factor authentication are enabled on owner accounts.
- No personal developer token is the only credential keeping production alive.
- The client receives a short content-editing walkthrough and knows who to
  contact for code, schema, DNS, or failed-build issues.

Do not remove the development team's access until the domain, Studio, webhook,
and a real content publication have all been tested under client ownership.

## Troubleshooting

### Netlify build succeeds but CMS sections are empty

Confirm `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` exist in Netlify,
include the Builds scope, and apply to the active deploy context. Then clear the
build cache and deploy again.

### Published content does not appear

Confirm the document is published, then check whether the Sanity webhook
triggered a Netlify build. If the build ran, inspect its log and verify that it
used the expected `main` commit and production environment variables.

### Netlify build fails during `npm ci`

Confirm `package.json` and `package-lock.json` were committed together and that
Node 22 is selected. Reproduce locally with `npm ci && npm run build:local`.

### Studio says the project ID is missing

Studio uses `SANITY_STUDIO_PROJECT_ID`, not only the frontend's
`PUBLIC_SANITY_PROJECT_ID`. Set both Studio variables in its deployment
environment or run Studio through the root scripts described in `README.md`.

### Self-hosted Studio cannot connect to Sanity

Add its exact `https://` origin to the Sanity project's CORS settings and allow
credentials. Confirm SPA fallback routing is enabled and the Studio was
registered with `sanity deploy --external`.

### A deployment contains old content

Trigger a fresh build rather than redeploying an existing static artifact. If
necessary, clear the host's build cache. The Sanity CDN and the deployed HTML are
separate: this site's HTML is generated at build time.

## Service Links

- Netlify dashboard: <https://app.netlify.com/>
- Netlify Astro deployment guide: <https://docs.astro.build/en/guides/deploy/netlify/>
- Sanity project management: <https://www.sanity.io/manage/project/uieb2l00>
- Sanity Studio deployment: <https://www.sanity.io/docs/studio/deployment>
- GitHub email settings: <https://github.com/settings/emails>
