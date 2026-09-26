import { getCollection, type CollectionEntry } from "astro:content";
import { catalogue } from "../config/active";

export type Entry = CollectionEntry<"kit">;

const categoryRank = (slug: string) => catalogue.categories.findIndex((c) => c.slug === slug);

/** Every entry, in catalogue order: category, then `order` within it. Drafts build; the preflight blocks them from deploying. */
export async function getKit(): Promise<Entry[]> {
  const entries = await getCollection("kit");
  return entries.sort(
    (a, b) =>
      categoryRank(a.data.category) - categoryRank(b.data.category) ||
      a.data.order - b.data.order ||
      a.id.localeCompare(b.id),
  );
}

export const entryHref = (entry: Entry) => `/kit/${entry.data.category}/${entry.id}/`;

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatDate = (date: Date) => dateFormat.format(date);
