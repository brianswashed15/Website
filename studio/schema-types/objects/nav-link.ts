import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const navLink = defineType({
  name: "navLink",
  title: "Navigation link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      description:
        "An internal path such as /work, a full https URL, or an email address.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Button style",
      description:
        "Green is the accent button used for the primary action. White is the quieter default.",
      type: "string",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Green", value: "green" },
        ],
        layout: "radio",
      },
      initialValue: "white",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "arrow",
      title: "Show arrow",
      description: "Appends the ↗ glyph after the label.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "external",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href", variant: "variant" },
    prepare: ({ title, subtitle, variant }) => ({
      title,
      subtitle: [subtitle, variant].filter(Boolean).join(" · "),
    }),
  },
});
