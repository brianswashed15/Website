import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const client = defineType({
  name: "client",
  title: "Client",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
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
      name: "logoDisplay",
      title: "Logo display",
      description: "How this logo is rendered in the clients row.",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "grayscale",
          title: "Grayscale",
          description: "Strips the logo's own colors.",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "opacity",
          title: "Opacity",
          description: "Percent. 100 is fully opaque.",
          type: "number",
          initialValue: 100,
          validation: (rule) => rule.min(0).max(100),
        }),
        defineField({
          name: "invert",
          title: "Invert",
          description:
            "Flips the logo's tones. Use it for artwork drawn in solid black, which would otherwise disappear against the page.",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "tint",
          title: "Tint",
          description:
            "Recolors the logo to a single flat color. Leave empty to keep the logo's own colors.",
          type: "color",
          options: { disableAlpha: true },
        }),
        defineField({
          name: "scale",
          title: "Scale",
          description:
            "Percent, relative to the row's default logo size. 100 leaves it unscaled.",
          type: "number",
          initialValue: 100,
          validation: (rule) => rule.min(10).max(400),
        }),
      ],
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
  ],
});
