import { StarIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The homepage grid. A single document holding an ordered list of project
 * references, so featuring and sequencing are one drag-and-drop decision
 * instead of a per-project toggle plus a rank number.
 */
export const featuredWork = defineType({
  name: "featuredWork",
  title: "Featured work",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "projects",
      title: "Projects",
      description:
        "Fills the homepage grid left to right, top to bottom. Drag to reorder. Nine fills the 3×3 grid.",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "project" }],
        }),
      ],
      validation: (rule) => [
        rule.max(9).error("The homepage grid holds nine projects."),
        rule.unique().error("Each project can only be featured once."),
        rule.min(9).warning("The 3×3 grid is short until nine are chosen."),
      ],
    }),
  ],
  preview: {
    select: { projects: "projects" },
    prepare: ({ projects }) => ({
      title: "Featured work",
      subtitle: `${projects?.length ?? 0} of 9 projects`,
    }),
  },
});
