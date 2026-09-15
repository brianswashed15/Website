import { defineField, defineType } from "sanity";

/**
 * A single result claimed for a project: the figure and what it measures.
 * Shown as a highlighted chip next to its label in the selected work listing.
 */
export const metric = defineType({
  name: "metric",
  title: "Metric",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      description: 'The figure on its own, for example "+ 28%".',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      description: 'What the figure measures, for example "conversion rate from reels".',
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});
