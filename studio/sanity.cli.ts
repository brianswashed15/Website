import { defineCliConfig } from "sanity/cli";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_STUDIO_DATASET ??
  process.env.PUBLIC_SANITY_DATASET ??
  "production";

if (!projectId) {
  throw new Error("Missing Sanity project ID.");
}

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "riyo-productions",
  deployment: {
    appId: "e37eera6fugl1533w5y647c2",
  },
  typegen: {
    path: "../src/**/*.{astro,ts}",
    schema: "schema.json",
    generates: "../sanity.types.ts",
    overloadClientMethods: true,
  },
});
