import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      description:
        "Shown in the large panel beside the services list while this service is the one being read. Landscape, roughly 5:3.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "coverVideoUrl",
      title: "Cover video URL",
      description:
        "Optional. Plays over the cover image in the services panel, so it must be a direct playback file (a Mux .mp4 or .m3u8). A Vimeo or YouTube page URL needs an iframe and will not play here. The cover image is what shows until it has frames.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "orderRank",
      title: "Display order",
      description: "Lower numbers appear first.",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description", media: "cover" },
  },
});
