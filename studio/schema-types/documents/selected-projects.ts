import { BlockElementIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The selected work listing. Like featuredWork, choosing and ordering are the
 * same drag-and-drop decision on one document, so a project needs no flag of
 * its own. The rows render each project's poster, title, subtitle, and metrics.
 */
export const selectedProjects = defineType({
  name: "selectedProjects",
  title: "Selected projects",
  type: "document",
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Selected projects",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projects",
      title: "Projects",
      description:
        "One row each, top to bottom. Drag to reorder. Four fills the section.",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "project" }],
        }),
      ],
      validation: (rule) => [
        rule.max(4).error("The selected work listing holds four projects."),
        rule.unique().error("Each project can only be selected once."),
        rule.min(4).warning("The listing is short until four are chosen."),
      ],
    }),
    defineField({
      name: "callToActionLabel",
      title: "Call to action label",
      type: "string",
      initialValue: "See all works",
    }),
    defineField({
      name: "callToActionHref",
      title: "Call to action link",
      type: "string",
      initialValue: "/work",
    }),
  ],
  preview: {
    select: { title: "heading", projects: "projects" },
    prepare: ({ title, projects }) => ({
      title: title || "Selected projects",
      subtitle: `${projects?.length ?? 0} of 4 projects`,
    }),
  },
});
