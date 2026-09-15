import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navigation",
      title: "Navigation",
      description: "The navbar at the top of every page.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "wordmark",
          title: "Wordmark",
          description: "The text shown next to the logo mark.",
          type: "string",
          initialValue: "Riyo Productions",
        }),
        defineField({
          name: "logo",
          title: "Logo mark",
          description:
            "Optional override for the built-in logo mark. Upload an SVG for the crispest result.",
          type: "image",
          options: { accept: "image/svg+xml,image/png" },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
            }),
          ],
        }),
        defineField({
          name: "links",
          title: "Links",
          description:
            "Each link renders as a navbar button, in this order, from left to right.",
          type: "array",
          of: [defineArrayMember({ type: "navLink" })],
          validation: (rule) => rule.min(1),
        }),
      ],
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "aboutSection",
      title: "Homepage about section",
      description: "Mission statement, call to action, and customer testimonials.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "statement",
          title: "Statement",
          type: "text",
          rows: 7,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "callToActionLabel",
          title: "Call to action label",
          type: "string",
          initialValue: "More about us",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "callToActionHref",
          title: "Call to action link",
          type: "string",
          initialValue: "/about",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "testimonials",
          title: "Testimonials",
          type: "array",
          validation: (rule) => rule.min(1),
          of: [
            defineArrayMember({
              name: "testimonial",
              title: "Testimonial",
              type: "object",
              fields: [
                defineField({
                  name: "portrait",
                  title: "Portrait",
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: "alt",
                      title: "Alternative text",
                      type: "string",
                      validation: (rule) =>
                        rule.required().warning("Describe the person in the portrait."),
                    }),
                  ],
                }),
                defineField({
                  name: "name",
                  title: "Name",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "role",
                  title: "Role and company",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "quote",
                  title: "Quote",
                  type: "text",
                  rows: 6,
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: { title: "name", subtitle: "role", media: "portrait" },
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "contactSection",
      title: "Homepage contact section",
      description: "The closing call to action, directly under Services.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "text",
          rows: 2,
          initialValue: "Let's give your story motion.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "callToActionLabel",
          title: "Call to action label",
          type: "string",
          initialValue: "Get in touch",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "callToActionHref",
          title: "Call to action link",
          type: "string",
          initialValue: "#contact",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "servicesSection",
      title: "Homepage services section",
      description:
        "The heading above the services list. The list itself is every Service document, in their display order.",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          initialValue: "Services",
        }),
      ],
    }),
    defineField({
      name: "aboutPage",
      title: "About page",
      description:
        "The about page's opening copy and the people shown under it.",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "paragraphs",
          title: "Copy",
          description:
            "The opening copy, one entry per paragraph. Order is the order they are read in.",
          type: "array",
          of: [defineArrayMember({ type: "text", rows: 4 })],
        }),
        defineField({
          name: "members",
          title: "Members",
          description:
            "The people, as portraits under the copy. Two is what the layout is drawn for; more will fit but will read as a list rather than as the pair.",
          type: "array",
          of: [
            defineArrayMember({
              name: "member",
              title: "Member",
              type: "object",
              fields: [
                defineField({
                  name: "name",
                  title: "Name",
                  description: "Shown under the portrait.",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "portrait",
                  title: "Portrait",
                  type: "image",
                  options: { hotspot: true },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "linkedinUrl",
                  title: "LinkedIn URL",
                  type: "url",
                  validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
                }),
                defineField({
                  name: "instagramUrl",
                  title: "Instagram URL",
                  type: "url",
                  validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
                }),
              ],
              preview: {
                select: { title: "name", media: "portrait" },
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "devHeroVideo",
      title: "Dev hero video (temporary)",
      description:
        "Local development only. Production hero video must be served from a hosted playback URL, not from a Sanity file asset.",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
  ],
});
