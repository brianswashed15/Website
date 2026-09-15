import {
  BlockElementIcon,
  CogIcon,
  StarIcon,
  UsersIcon,
} from "@sanity/icons";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
import { schemaTypes, singletonTypes } from "./schema-types";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID. Run the Studio through the repository's npm run studio command.",
  );
}

export default defineConfig({
  name: "default",
  title: "Riyo Productions",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .id("featuredWork")
              .title("Featured work")
              .icon(StarIcon)
              .child(
                S.document()
                  .schemaType("featuredWork")
                  .documentId("featuredWork")
                  .title("Featured work"),
              ),
            S.listItem()
              .id("selectedProjects")
              .title("Selected projects")
              .icon(BlockElementIcon)
              .child(
                S.document()
                  .schemaType("selectedProjects")
                  .documentId("selectedProjects")
                  .title("Selected projects"),
              ),
            S.listItem()
              .id("brandsClients")
              .title("Brands and clients")
              .icon(UsersIcon)
              .child(
                S.document()
                  .schemaType("brandsClients")
                  .documentId("brandsClients")
                  .title("Brands and clients"),
              ),
            S.divider(),
            S.documentTypeListItem("project"),
            S.documentTypeListItem("client"),
            S.documentTypeListItem("service"),
            S.divider(),
            S.listItem()
              .id("siteSettings")
              .title("Site settings")
              .icon(CogIcon)
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Site settings"),
              ),
          ]),
    }),
    visionTool(),
    colorInput(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Singletons live at a fixed ID, so they must not be creatable from the
    // global "new document" menu — a second copy would make the [0] in the
    // frontend queries ambiguous.
    newDocumentOptions: (previous) =>
      previous.filter(
        (item) => !singletonTypes.has(item.templateId as string),
      ),
  },
});
