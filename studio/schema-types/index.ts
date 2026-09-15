import { brandsClients } from "./documents/brands-clients";
import { client } from "./documents/client";
import { featuredWork } from "./documents/featured-work";
import { project } from "./documents/project";
import { selectedProjects } from "./documents/selected-projects";
import { service } from "./documents/service";
import { siteSettings } from "./documents/site-settings";
import { metric } from "./objects/metric";
import { navLink } from "./objects/nav-link";

export const schemaTypes = [
  project,
  client,
  service,
  featuredWork,
  selectedProjects,
  brandsClients,
  siteSettings,
  metric,
  navLink,
];

/** Document types that exist exactly once, at a fixed ID. See sanity.config.ts. */
export const singletonTypes = new Set([
  featuredWork.name,
  selectedProjects.name,
  brandsClients.name,
  siteSettings.name,
]);
