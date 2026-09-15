import { UsersIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const brandsClients = defineType({
  name: "brandsClients",
  title: "Brands and clients",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "We've worked with",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clients",
      title: "Clients",
      description:
        "The logos shown in the grid. The grid holds fewer cells than this list on smaller screens and cycles through the whole list as it swaps, so order sets where a logo first lands, not whether it is seen.",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "client" }],
        }),
      ],
      validation: (rule) => rule.min(1).unique(),
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title ?? "Brands and clients" }),
  },
});
