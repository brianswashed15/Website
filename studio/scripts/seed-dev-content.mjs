/**
 * Seeds the Sanity dataset with the content of the reference site at ../Website
 * so there is something real to develop against.
 *
 * Videos are uploaded as Sanity file assets into the temporary `devVideo` /
 * `devHeroVideo` fields. Production video must move to a hosted playback URL
 * (Vimeo, YouTube, Mux) in `videoUrl` before launch.
 *
 * Usage: npm run seed:dev [step ...]  (from the repository root)
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  fs.readFileSync(path.join(here, "seed-content.json"), "utf8"),
);

const assetsDir = path.resolve(
  process.env.REFERENCE_SITE_DIR ??
    path.join(here, "../../../Website"),
  "assets",
);

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_STUDIO_DATASET ??
  process.env.PUBLIC_SANITY_DATASET ??
  "production";

if (!projectId) {
  throw new Error(
    "Missing Sanity project ID. Run this through `npm run seed:dev` so Infisical supplies PUBLIC_SANITY_PROJECT_ID.",
  );
}

if (!fs.existsSync(assetsDir)) {
  throw new Error(
    `Reference site assets not found at ${assetsDir}. Set REFERENCE_SITE_DIR to the Website checkout.`,
  );
}

function resolveToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const cliConfig = path.join(os.homedir(), ".config/sanity/config.json");
  if (fs.existsSync(cliConfig)) {
    const token = JSON.parse(fs.readFileSync(cliConfig, "utf8")).authToken;
    if (token) return token;
  }
  throw new Error(
    "No Sanity write token. Run `npx sanity login` or set SANITY_AUTH_TOKEN.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-09-06",
  token: resolveToken(),
  useCdn: false,
});

const posterDir = path.join(os.tmpdir(), "riyo-seed-posters");
fs.mkdirSync(posterDir, { recursive: true });

/** Grabs a still ~0.5s in, falling back to the first frame for very short clips. */
function posterFor(videoPath) {
  const name = createHash("sha1").update(videoPath).digest("hex").slice(0, 12);
  const out = path.join(posterDir, `${name}.jpg`);
  if (fs.existsSync(out)) return out;
  for (const seek of ["0.5", "0"]) {
    try {
      execFileSync(
        "ffmpeg",
        ["-y", "-ss", seek, "-i", videoPath, "-frames:v", "1", "-q:v", "3", out],
        { stdio: "ignore" },
      );
      if (fs.statSync(out).size > 0) return out;
    } catch {
      // try the next seek position
    }
  }
  return null;
}

const assetCache = new Map();

/**
 * Most seed assets come from the reference site. Assets committed specifically
 * for this seed live under `logos/` and resolve against this directory instead.
 */
function resolveAsset(source) {
  if (path.isAbsolute(source)) return source;
  if (source.startsWith("logos/")) return path.join(here, source);
  return path.join(assetsDir, source);
}

async function upload(kind, source, filename) {
  const key = `${kind}:${source}`;
  if (assetCache.has(key)) return assetCache.get(key);
  // Placeholder people photos have no local counterpart in the reference site,
  // so remote sources are read over HTTP and everything else off disk.
  const remote = /^https?:\/\//.test(source);
  const body = remote
    ? Buffer.from(await (await fetch(source)).arrayBuffer())
    : fs.createReadStream(resolveAsset(source));
  const asset = await client.assets.upload(kind, body, {
    filename: filename ?? path.basename(new URL(source, "file:///").pathname),
  });
  assetCache.set(key, asset._id);
  return asset._id;
}

const fileRef = (assetId) => ({ _type: "file", asset: { _type: "reference", _ref: assetId } });
const imageRef = (assetId, alt) => ({
  _type: "image",
  asset: { _type: "reference", _ref: assetId },
  alt,
});

// Deterministic IDs keep the seed re-runnable without creating duplicates.
// No dots: a dotted ID is a private ACL path and would be unreadable anonymously.
const docId = (type, slug) => `seed-${type}-${slug}`;

/**
 * Subtitle, metrics, and the project page link are authored on the selected
 * work entries, not per project.
 */
const selectedBySlug = new Map(
  manifest.selectedProjects.projects.map((entry) => [entry.slug, entry]),
);

async function seedProjects() {
  const rankByCategory = new Map();
  for (const [index, entry] of manifest.projects.entries()) {
    const rank = (rankByCategory.get(entry.category) ?? 0) + 1;
    rankByCategory.set(entry.category, rank);

    const videoAsset = await upload("file", entry.video);
    const posterPath = posterFor(path.join(assetsDir, entry.video));
    const posterAsset = posterPath
      ? await upload("image", posterPath, `${entry.slug}.jpg`)
      : null;

    await client.createOrReplace({
      _id: docId("project", entry.slug),
      _type: "project",
      title: entry.title,
      slug: { _type: "slug", current: entry.slug },
      ...(entry.client ? { client: entry.client } : {}),
      category: entry.category,
      description: entry.description,
      ...(selectedBySlug.has(entry.slug)
        ? {
            subtitle: selectedBySlug.get(entry.slug).subtitle,
            projectPageUrl: selectedBySlug.get(entry.slug).projectPageUrl,
            metrics: selectedBySlug.get(entry.slug).metrics.map((metric, index) => ({
              _key: `metric-${index}`,
              _type: "metric",
              ...metric,
            })),
          }
        : {}),
      orderRank: rank,
      devVideo: fileRef(videoAsset),
      ...(posterAsset
        ? { poster: imageRef(posterAsset, `Still from ${entry.title}`) }
        : {}),
    });
    console.log(`project ${index + 1}/${manifest.projects.length}: ${entry.title}`);
  }
}

/** Featuring is an ordered reference list, so the manifest order is the grid order. */
async function seedFeaturedWork() {
  await client.createOrReplace({
    _id: "featuredWork",
    _type: "featuredWork",
    projects: manifest.featuredWork.map((slug) => ({
      _key: slug,
      _type: "reference",
      _ref: docId("project", slug),
    })),
  });
  console.log(`featured work: ${manifest.featuredWork.length} projects`);
}

/** Selecting is an ordered reference list, so the manifest order is the row order. */
async function seedSelectedProjects() {
  const { heading, callToActionLabel, callToActionHref, projects } =
    manifest.selectedProjects;
  await client.createOrReplace({
    _id: "selectedProjects",
    _type: "selectedProjects",
    heading,
    callToActionLabel,
    callToActionHref,
    projects: projects.map(({ slug }) => ({
      _key: slug,
      _type: "reference",
      _ref: docId("project", slug),
    })),
  });
  console.log(`selected projects: ${projects.length} projects`);
}

const clientSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function seedClients() {
  for (const entry of manifest.clients) {
    const slug = clientSlug(entry.name);
    const logoAsset = await upload("image", entry.logo);
    await client.createOrReplace({
      _id: docId("client", slug),
      _type: "client",
      name: entry.name,
      logo: imageRef(logoAsset, `${entry.name} logo`),
      logoDisplay: {
        _type: "object",
        grayscale: false,
        opacity: 100,
        scale: 100,
        ...(entry.logoDisplay ?? {}),
      },
    });
    console.log(`client: ${entry.name}`);
  }
}

/** Selecting and ordering the logo wall is one drag-and-drop decision, exactly
    as it is for featured and selected work. */
async function seedBrandsClients() {
  const { heading, clients } = manifest.brandsClients;
  await client.createOrReplace({
    _id: "brandsClients",
    _type: "brandsClients",
    heading,
    clients: clients.map((name) => ({
      _key: clientSlug(name),
      _type: "reference",
      _ref: docId("client", clientSlug(name)),
    })),
  });
  console.log(`brands and clients: ${clients.length} clients`);
}

/** The services panel needs a still per service, so each one borrows a frame
    from a clip of that kind of work. Unlike projects, the cover is a real
    image field rather than a temporary dev video: the panel's video is a
    hosted playback URL the editor supplies later. */
async function seedServices() {
  for (const [index, entry] of manifest.services.entries()) {
    const slug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const coverPath = entry.cover
      ? posterFor(path.join(assetsDir, entry.cover))
      : null;
    const coverAsset = coverPath
      ? await upload("image", coverPath, `service-${slug}.jpg`)
      : null;

    await client.createOrReplace({
      _id: docId("service", slug),
      _type: "service",
      title: entry.title,
      description: entry.description,
      orderRank: index + 1,
      ...(coverAsset ? { cover: imageRef(coverAsset) } : {}),
    });
    console.log(`service: ${entry.title}`);
  }
}

async function seedSiteSettings() {
  const settings = manifest.siteSettings;
  const heroAsset = await upload("file", settings.heroVideo);
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: settings.siteTitle,
    navigation: {
      wordmark: settings.navigation.wordmark,
      links: settings.navigation.links.map((link, index) => ({
        _key: `nav-${index}`,
        _type: "navLink",
        ...link,
      })),
    },
    mission: settings.mission,
    aboutSection: {
      statement: settings.aboutSection.statement,
      callToActionLabel: settings.aboutSection.callToActionLabel,
      callToActionHref: settings.aboutSection.callToActionHref,
      testimonials: await Promise.all(
        settings.aboutSection.testimonials.map(
          async ({ portrait, portraitAlt, ...testimonial }, index) => ({
            _key: `testimonial-${index}`,
            _type: "testimonial",
            ...testimonial,
            ...(portrait
              ? {
                  portrait: imageRef(
                    await upload("image", portrait),
                    portraitAlt ?? testimonial.name,
                  ),
                }
              : {}),
          }),
        ),
      ),
    },
    servicesSection: { heading: settings.servicesSection.heading },
    contactEmail: settings.contactEmail,
    instagramUrl: settings.instagramUrl,
    linkedinUrl: settings.linkedinUrl,
    devHeroVideo: fileRef(heroAsset),
  });
  console.log("site settings");
}

/**
 * Named steps, in the order the dependent documents need: a reference list is
 * written after the documents it points at. Naming them lets one section be
 * reseeded on its own — `npm run seed:dev -- services` — instead of re-uploading
 * every project video to fix one field.
 */
const steps = {
  siteSettings: seedSiteSettings,
  clients: seedClients,
  brandsClients: seedBrandsClients,
  services: seedServices,
  projects: seedProjects,
  featuredWork: seedFeaturedWork,
  selectedProjects: seedSelectedProjects,
};

const requested = process.argv.slice(2);
const unknown = requested.filter((name) => !(name in steps));

if (unknown.length) {
  throw new Error(
    `Unknown seed step: ${unknown.join(", ")}. Choose from ${Object.keys(steps).join(", ")}.`,
  );
}

// No argument seeds everything, which is what `npm run seed:dev` has always
// meant.
const selected = requested.length > 0 ? requested : Object.keys(steps);

console.log(`Seeding ${projectId}/${dataset} from ${assetsDir}`);
for (const name of selected) {
  await steps[name]();
}
console.log("Done.");
