import { catalogueSchema, siteSchema } from "./schema";
export { AMAZON_VARIANT } from "./schema";
import { site as aronSite } from "../profiles/aron/site";
import { catalogue as aronCatalogue } from "../profiles/aron/catalogue";
import { copy as aronCopy } from "../profiles/aron/copy";

/** Every profile the build knows about. SITE_PROFILE picks one. */
export const profiles = {
  aron: { site: aronSite, catalogue: aronCatalogue, copy: aronCopy },
};

export type ProfileName = keyof typeof profiles;

export function profileName(raw: string | undefined): ProfileName {
  const name = raw || "aron";
  if (!Object.hasOwn(profiles, name)) {
    throw new Error(`Unknown SITE_PROFILE "${name}". Known: ${Object.keys(profiles).join(", ")}`);
  }
  return name as ProfileName;
}

// import.meta.env is undefined when astro.config.ts loads this file.
const active = profiles[profileName(import.meta.env?.SITE_PROFILE)];

export const activeProfile = profileName(import.meta.env?.SITE_PROFILE);
export const site = siteSchema.parse(active.site);
export const catalogue = catalogueSchema.parse(active.catalogue);
export const copy = active.copy;

export const categoryBySlug = (slug: string) => {
  const category = catalogue.categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category "${slug}"`);
  return category;
};

export const tagBySlug = (slug: string) => {
  const tag = catalogue.tags.find((t) => t.slug === slug);
  if (!tag) throw new Error(`Unknown tag "${slug}"`);
  return tag;
};
