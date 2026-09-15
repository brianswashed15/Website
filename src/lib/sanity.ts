import { defineQuery } from "groq";
import { createClient, type SanityClient } from "@sanity/client";

export interface Metric {
  _key: string;
  value: string;
  label: string;
}

export interface ProjectSummary {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  subtitle?: string;
  description?: string;
  /** Where the project's own page lives. Absent leaves the row unlinked. */
  projectPageUrl?: string;
  metrics: Metric[];
  posterUrl?: string;
  posterAlt?: string;
  videoUrl?: string;
  /** Video file uploaded to Sanity, used until videoUrl is populated. */
  devVideoUrl?: string;
}

export interface NavLink {
  label: string;
  href: string;
  variant: "white" | "green";
  arrow: boolean;
  external: boolean;
}

export interface Navigation {
  wordmark: string;
  logoUrl?: string;
  logoAlt?: string;
  links: NavLink[];
}

export interface SelectedProjectsSection {
  heading: string;
  projects: ProjectSummary[];
  callToActionLabel?: string;
  callToActionHref?: string;
}

export interface Testimonial {
  _key: string;
  name: string;
  role: string;
  quote: string;
  portraitUrl?: string;
  portraitAlt?: string;
}

export interface ClientLogoDisplay {
  grayscale: boolean;
  /** Flips the logo's tones, so artwork drawn in black survives a dark page. */
  invert: boolean;
  /** Percent. 100 is fully opaque. */
  opacity: number;
  /** Percent, relative to the grid's default logo box. 100 leaves it unscaled. */
  scale: number;
  /** Hex. Recolors the logo to one flat colour; absent keeps its own colours. */
  tint?: string;
}

export interface ClientLogo {
  _id: string;
  name: string;
  logoUrl: string;
  display: ClientLogoDisplay;
}

export interface BrandsClientsSection {
  heading: string;
  clients: ClientLogo[];
}

export interface Service {
  _id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  coverVideoUrl?: string;
}

export interface ServicesSection {
  heading: string;
  services: Service[];
}

export interface AboutSection {
  statement: string;
  callToActionLabel: string;
  callToActionHref: string;
  testimonials: Testimonial[];
}

/**
 * The about page's opening block. Only the picture is content: the copy beside
 * it is still placeholder in the component, so there is nothing here for it
 * yet. Both fields are optional — a dataset without the image renders the
 * frame empty rather than a broken picture.
 */
/**
 * One of the people, as shown under the about page's copy. Name and portrait
 * are what make an entry worth rendering at all; the two profile links are
 * each optional and each dropped on their own when absent, the same way the
 * footer drops a link it has not been given.
 */
export interface AboutMember {
  _key: string;
  name: string;
  portraitUrl: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

export interface AboutPageSection {
  paragraphs: string[];
  members: AboutMember[];
}

export interface ContactSection {
  heading: string;
  callToActionLabel: string;
  callToActionHref: string;
}

/**
 * The footer's three ways of reaching the studio. Every one is optional: a
 * dataset that has not been filled in yet drops the line rather than rendering
 * a link to nowhere.
 */
export interface FooterSection {
  contactEmail?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

const PROJECT_SUMMARY_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  client,
  subtitle,
  description,
  projectPageUrl,
  "metrics": coalesce(metrics[] { _key, value, label }, []),
  "posterUrl": poster.asset->url,
  "posterAlt": poster.alt,
  videoUrl,
  "devVideoUrl": devVideo.asset->url
`;

const PROJECTS_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && defined(slug.current)]
    | order(orderRank asc, _createdAt desc) {
      ${PROJECT_SUMMARY_FIELDS}
    }
`);

/**
 * Featuring is an ordered list on a single document rather than a per-project
 * flag, so dereferencing in place preserves the order the editor dragged them
 * into. References to deleted projects deref to null and are dropped.
 */
const FEATURED_PROJECTS_QUERY = defineQuery(/* groq */ `
  *[_type == "featuredWork"][0].projects[]-> {
    ${PROJECT_SUMMARY_FIELDS}
  }
`);

/**
 * Selecting and ordering happen on one document, exactly as featuredWork does
 * for the homepage grid. References to deleted projects deref to null and are
 * dropped in getSelectedProjects.
 */
const SELECTED_PROJECTS_QUERY = defineQuery(/* groq */ `
  *[_type == "selectedProjects"][0] {
    heading,
    callToActionLabel,
    callToActionHref,
    "projects": coalesce(projects[]-> {
      ${PROJECT_SUMMARY_FIELDS}
    }, [])
  }
`);

/**
 * `logoDisplay` is optional on the document and every field inside it is
 * optional too, so the neutral treatment is coalesced in here rather than left
 * for the component to guess at.
 */
const BRANDS_CLIENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "brandsClients"][0] {
    heading,
    "clients": coalesce(clients[]-> {
      _id,
      name,
      "logoUrl": logo.asset->url,
      "display": {
        "grayscale": coalesce(logoDisplay.grayscale, false),
        "invert": coalesce(logoDisplay.invert, false),
        "opacity": coalesce(logoDisplay.opacity, 100),
        "scale": coalesce(logoDisplay.scale, 100),
        "tint": logoDisplay.tint.hex
      }
    }, [])
  }
`);

/**
 * Unlike the other list sections, services are not selected on the section
 * document: every published service is shown, and `orderRank` on the service
 * itself is the order. So only the heading lives on siteSettings, alongside the
 * about section's copy, and the list is fetched separately.
 */
const SERVICES_SECTION_QUERY = defineQuery(/* groq */ `
  {
    "heading": coalesce(
      *[_type == "siteSettings"][0].servicesSection.heading,
      "Services"
    ),
    "services": *[_type == "service" && defined(title)]
      | order(orderRank asc, _createdAt asc) {
        _id,
        title,
        description,
        "coverUrl": cover.asset->url,
        coverVideoUrl
      }
  }
`);

const NAVIGATION_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0].navigation {
    wordmark,
    "logoUrl": logo.asset->url,
    "logoAlt": logo.alt,
    links[] {
      label,
      href,
      variant,
      arrow,
      external
    }
  }
`);

const ABOUT_SECTION_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0] {
    "statement": coalesce(aboutSection.statement, mission),
    "callToActionLabel": coalesce(aboutSection.callToActionLabel, "More about us"),
    "callToActionHref": coalesce(aboutSection.callToActionHref, "/about"),
    "testimonials": coalesce(aboutSection.testimonials[] {
      _key,
      name,
      role,
      quote,
      "portraitUrl": portrait.asset->url,
      "portraitAlt": portrait.alt
    }, [])
  }
`);

const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0] {
    "paragraphs": coalesce(aboutPage.paragraphs, []),
    "members": coalesce(aboutPage.members[] {
      _key,
      name,
      "portraitUrl": portrait.asset->url,
      linkedinUrl,
      instagramUrl
    }, [])
  }
`);

const CONTACT_SECTION_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0] {
    "heading": coalesce(contactSection.heading, "Let's give your story motion."),
    "callToActionLabel": coalesce(contactSection.callToActionLabel, "Get in touch"),
    "callToActionHref": coalesce(contactSection.callToActionHref, "#contact")
  }
`);

const FOOTER_SECTION_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0] {
    contactEmail,
    linkedinUrl,
    instagramUrl
  }
`);

/**
 * Used until the Studio has a published siteSettings document, and whenever the
 * build runs without Sanity credentials.
 */
/**
 * Editors type a bare address into link fields ("work@riyoproductions.com"),
 * which a browser would resolve as a relative path. Anything that is only an
 * email address becomes a mailto: link; every other value passes through.
 */
function toHref(href: string): string {
  return /^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(href) ? `mailto:${href}` : href;
}

export const NAVIGATION_FALLBACK: Navigation = {
  wordmark: "Riyo Productions",
  links: [
    { label: "Work", href: "/work", variant: "white", arrow: false, external: false },
    { label: "About", href: "/about", variant: "white", arrow: false, external: false },
    { label: "Contact us", href: "mailto:work@riyoproductions.com", variant: "green", arrow: true, external: false },
  ],
};

export const SELECTED_PROJECTS_FALLBACK: SelectedProjectsSection = {
  heading: "Selected projects",
  projects: [],
  callToActionLabel: "See all works",
  callToActionHref: "/work",
};

export const BRANDS_CLIENTS_FALLBACK: BrandsClientsSection = {
  heading: "We've worked with",
  clients: [],
};

export const SERVICES_SECTION_FALLBACK: ServicesSection = {
  heading: "Services",
  services: [],
};

export const ABOUT_SECTION_FALLBACK: AboutSection = {
  statement:
    "Riyo Productions is a post-production studio for brands, artists, and creators built by people who live inside the creator economy, not agencies studying it from the outside. When clients need the story and strategy behind it too, that's where we go next.",
  callToActionLabel: "More about us",
  callToActionHref: "/about",
  testimonials: [],
};

/**
 * The copy that shipped before it was editable, kept as what the page says
 * until the dataset says otherwise — the same arrangement every other section
 * here has. Nothing stands in for a photograph, so the frames are left empty.
 */
export const ABOUT_PAGE_FALLBACK: AboutPageSection = {
  paragraphs: [
    "Riyo Productions is a post-production studio for brands, artists, and creators. We were built by people who live inside the creator economy rather than agencies studying it from the outside, and that difference shows up in the work long before it shows up in the deck.",
    "We cut, grade, and finish. When a project needs the story and the strategy behind it too, that is where we go next — not as an upsell, but because the edit is rarely the first place a piece goes wrong.",
    "The studio is small on purpose. Every project is run by the people who will actually do the work, and the person you brief is the person in the timeline.",
  ],
  members: [],
};

export const CONTACT_SECTION_FALLBACK: ContactSection = {
  heading: "Let's give your story motion.",
  callToActionLabel: "Get in touch",
  callToActionHref: "mailto:work@riyoproductions.com",
};

/**
 * The email and the Instagram handle are the studio's own, and match the seed
 * manifest. The LinkedIn URL is a guess at the company slug and is the one
 * value here worth confirming: set it in the Studio and this stops being read.
 */
export const FOOTER_SECTION_FALLBACK: FooterSection = {
  contactEmail: "work@riyoproductions.com",
  linkedinUrl: "https://www.linkedin.com/company/riyoproductions",
  instagramUrl: "https://www.instagram.com/riyoproductions/",
};

function getClient(): SanityClient | null {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-09-06",
    useCdn: true,
  });
}

async function fetchProjects(query: string): Promise<ProjectSummary[]> {
  const client = getClient();

  if (!client) {
    return [];
  }

  const projects = await client.fetch<(ProjectSummary | null)[] | null>(query);

  return (
    projects?.filter(
      (project): project is ProjectSummary => Boolean(project?._id),
    ) ?? []
  );
}

export function getProjects() {
  return fetchProjects(PROJECTS_QUERY);
}

export function getFeaturedProjects() {
  return fetchProjects(FEATURED_PROJECTS_QUERY);
}

export async function getSelectedProjects(): Promise<SelectedProjectsSection> {
  const client = getClient();

  if (!client) {
    return SELECTED_PROJECTS_FALLBACK;
  }

  const section = await client.fetch<Partial<SelectedProjectsSection> | null>(
    SELECTED_PROJECTS_QUERY,
  );

  const projects =
    section?.projects?.filter((project): project is ProjectSummary =>
      Boolean(project?._id),
    ) ?? [];

  return {
    heading: section?.heading || SELECTED_PROJECTS_FALLBACK.heading,
    projects,
    callToActionLabel:
      section?.callToActionLabel ||
      SELECTED_PROJECTS_FALLBACK.callToActionLabel,
    callToActionHref:
      section?.callToActionHref || SELECTED_PROJECTS_FALLBACK.callToActionHref,
  };
}

export async function getBrandsClients(): Promise<BrandsClientsSection> {
  const client = getClient();

  if (!client) {
    return BRANDS_CLIENTS_FALLBACK;
  }

  const section = await client.fetch<Partial<BrandsClientsSection> | null>(
    BRANDS_CLIENTS_QUERY,
  );

  return {
    heading: section?.heading || BRANDS_CLIENTS_FALLBACK.heading,
    // A client with no logo uploaded yet would leave a hole in the grid.
    clients:
      section?.clients?.filter((entry): entry is ClientLogo =>
        Boolean(entry?._id && entry?.logoUrl),
      ) ?? [],
  };
}

export async function getNavigation(): Promise<Navigation> {
  const client = getClient();

  if (!client) {
    return NAVIGATION_FALLBACK;
  }

  const navigation = await client.fetch<Partial<Navigation> | null>(
    NAVIGATION_QUERY,
  );

  const links = navigation?.links
    ?.filter((link) => link?.label && link?.href)
    .map((link) => ({ ...link, href: toHref(link.href) }));

  return {
    wordmark: navigation?.wordmark || NAVIGATION_FALLBACK.wordmark,
    logoUrl: navigation?.logoUrl,
    logoAlt: navigation?.logoAlt,
    links: links?.length ? links : NAVIGATION_FALLBACK.links,
  };
}

export async function getServices(): Promise<ServicesSection> {
  const client = getClient();

  if (!client) {
    return SERVICES_SECTION_FALLBACK;
  }

  const section = await client.fetch<Partial<ServicesSection> | null>(
    SERVICES_SECTION_QUERY,
  );

  return {
    heading: section?.heading || SERVICES_SECTION_FALLBACK.heading,
    // A service with no title would be a blank row in a list of four.
    services:
      section?.services?.filter((service): service is Service =>
        Boolean(service?._id && service?.title),
      ) ?? [],
  };
}

export async function getAboutSection(): Promise<AboutSection> {
  const client = getClient();

  if (!client) {
    return ABOUT_SECTION_FALLBACK;
  }

  const section = await client.fetch<Partial<AboutSection> | null>(
    ABOUT_SECTION_QUERY,
  );

  return {
    statement: section?.statement || ABOUT_SECTION_FALLBACK.statement,
    callToActionLabel:
      section?.callToActionLabel || ABOUT_SECTION_FALLBACK.callToActionLabel,
    callToActionHref:
      section?.callToActionHref || ABOUT_SECTION_FALLBACK.callToActionHref,
    testimonials:
      section?.testimonials?.filter(
        (testimonial): testimonial is Testimonial =>
          Boolean(
            testimonial?._key &&
              testimonial?.name &&
              testimonial?.role &&
              testimonial?.quote,
          ),
      ) ?? [],
  };
}

export async function getAboutPage(): Promise<AboutPageSection> {
  const client = getClient();

  if (!client) {
    return ABOUT_PAGE_FALLBACK;
  }

  const section = await client.fetch<Partial<AboutPageSection> | null>(
    ABOUT_PAGE_QUERY,
  );

  const paragraphs =
    section?.paragraphs?.map((paragraph) => paragraph?.trim()).filter(Boolean) ??
    [];

  return {
    // An empty array is a dataset nobody has written the copy into yet, not a
    // decision to show none — so the shipped copy stands until it is replaced.
    paragraphs: paragraphs.length ? paragraphs : ABOUT_PAGE_FALLBACK.paragraphs,
    // A member without a picture has nothing to render as a portrait, so it is
    // dropped rather than shown as a hole in the row.
    members:
      section?.members?.filter(
        (member): member is AboutMember =>
          Boolean(member?._key && member?.name && member?.portraitUrl),
      ) ?? [],
  };
}

export async function getContactSection(): Promise<ContactSection> {
  const client = getClient();

  if (!client) {
    return CONTACT_SECTION_FALLBACK;
  }

  const section = await client.fetch<Partial<ContactSection> | null>(
    CONTACT_SECTION_QUERY,
  );

  return {
    heading: section?.heading || CONTACT_SECTION_FALLBACK.heading,
    callToActionLabel:
      section?.callToActionLabel || CONTACT_SECTION_FALLBACK.callToActionLabel,
    callToActionHref: toHref(
      section?.callToActionHref || CONTACT_SECTION_FALLBACK.callToActionHref,
    ),
  };
}

export async function getFooterSection(): Promise<FooterSection> {
  const client = getClient();

  if (!client) {
    return FOOTER_SECTION_FALLBACK;
  }

  const section = await client.fetch<FooterSection | null>(
    FOOTER_SECTION_QUERY,
  );

  return {
    contactEmail:
      section?.contactEmail || FOOTER_SECTION_FALLBACK.contactEmail,
    linkedinUrl: section?.linkedinUrl || FOOTER_SECTION_FALLBACK.linkedinUrl,
    instagramUrl:
      section?.instagramUrl || FOOTER_SECTION_FALLBACK.instagramUrl,
  };
}
