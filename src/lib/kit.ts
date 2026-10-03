import { getCollection, type CollectionEntry } from "astro:content";
import { catalogue } from "../config/active";

export type Entry = CollectionEntry<"kit">;

const categoryRank = (slug: string) => catalogue.categories.findIndex((c) => c.slug === slug);

/**
 * Entries in catalogue order: category, then `order` within it.
 * Drafts show in `npm run dev` for review but never ship: production builds
 * (and so the preflight and every deploy) leave them out.
 */
export async function getKit(): Promise<Entry[]> {
  const entries = await getCollection("kit", (entry) => !import.meta.env.PROD || !entry.data.draft);
  return entries.sort(
    (a, b) =>
      categoryRank(a.data.category) - categoryRank(b.data.category) ||
      a.data.order - b.data.order ||
      a.id.localeCompare(b.id),
  );
}

/** Categories and tags that have at least one entry, in catalogue order. Empty ones get no page, card or button. */
export async function getShelves() {
  const kit = await getKit();
  return {
    kit,
    categories: catalogue.categories.filter((c) => kit.some((e) => e.data.category === c.slug)),
    tags: catalogue.tags.filter((t) => kit.some((e) => e.data.tags.includes(t.slug))),
  };
}

export const entryHref = (entry: Entry) => `/kit/${entry.data.category}/${entry.id}/`;

/** The short name cards and headings show ("MacBook Neo"); the full `product` stays for the details and screen readers. */
export const displayName = (entry: Entry) => entry.data.name ?? entry.data.product;

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatDate = (date: Date) => dateFormat.format(date);
