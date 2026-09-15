import { PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Motion Graphics", value: "motion-graphics" },
          { title: "Mixed Media", value: "mixed-media" },
          { title: "VFX / 3D", value: "vfx-3d" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      description:
        'One line describing the work, for example "Motion graphics for Duolingo brand content."',
      type: "string",
    }),
    defineField({
      name: "metrics",
      title: "Metrics",
      description: "Results shown alongside the project in the selected work listing.",
      type: "array",
      of: [defineArrayMember({ type: "metric" })],
    }),
    defineField({
      name: "projectPageUrl",
      title: "Project page link",
      description:
        "Where the project opens when its row is clicked in Selected projects. A path on this site such as /work/wendys-commercial, or a full URL. Leave empty and the row is not clickable.",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"], allowRelative: true }),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      description: "A Vimeo, YouTube, or Mux playback URL.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "devVideo",
      title: "Dev preview video (temporary)",
      description:
        "Local development only. Production video must be served from videoUrl (Vimeo, YouTube, or Mux), not from a Sanity file asset.",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "orderRank",
      title: "Display order",
      description:
        "Lower numbers appear first in the full work listing. Homepage order is set by dragging in Featured work.",
      type: "number",
    }),
  ],
});
