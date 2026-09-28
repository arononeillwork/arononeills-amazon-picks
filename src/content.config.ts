import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { activeProfile, catalogue, AMAZON_VARIANT } from "./config/active";

const categories = catalogue.categories.map((c) => c.slug) as [string, ...string[]];
const tags = catalogue.tags.map((t) => t.slug) as [string, ...string[]];

const asin = z.string().regex(/^[A-Z0-9]{10}$/, "An ASIN is 10 capital letters or digits");
const noAmazon = (value: string) => !AMAZON_VARIANT.test(value);
const NO_AMAZON = { message: 'Page titles and headings must not contain "Amazon" or a variant' };

const pick = z.strictObject({
  /** The use case, e.g. "Longest battery". */
  label: z.string().min(1).refine(noAmazon, NO_AMAZON),
  product: z.string().min(1).refine(noAmazon, NO_AMAZON),
  asin,
  why: z.string().min(1),
});

/** The admin leaves empty optional fields out, but hand edits may leave them blank. Treat both the same. */
const blank = (value: unknown) =>
  value === "" || value === null || (Array.isArray(value) && value.length === 0) ? undefined : value;

const kit = defineCollection({
  // The filename is the URL slug: kit/power-bank.md -> /kit/carry/power-bank/
  loader: glob({ pattern: "*.md", base: `./src/profiles/${activeProfile}/kit` }),
  schema: z
    .strictObject({
      title: z.string().min(1).max(70).refine(noAmazon, NO_AMAZON),
      product: z.string().min(1).refine(noAmazon, NO_AMAZON),
      category: z.enum(categories),
      tags: z.array(z.enum(tags)).min(1).max(3),
      summary: z.string().min(1).max(160),
      /** owned: only what Aron has actually said. researched: never implies personal use. */
      experience: z.enum(["owned", "researched"]),
      asin: z.preprocess(blank, asin.optional()),
      /** Multi-option entries (the laptop): exactly three use-case picks instead of one ASIN. */
      picks: z.preprocess(blank, z.array(pick).length(3).optional()),
      drawback: z.string().min(1),
      health: z.boolean().default(false),
      healthNote: z.preprocess(blank, z.string().min(1).optional()),
      /** Position within its category. The admin sets it when products are dragged into order; new ones sort last. */
      order: z.number().int().min(1).default(999),
      reviewed: z.coerce.date(),
      draft: z.boolean().default(true),
    })
    // Cross-field rules bind published entries only, so a half-finished draft saved
    // from the admin can't fail the build and hold up every other change.
    .refine((e) => e.draft || (e.asin === undefined) !== (e.picks === undefined), {
      message: "Give either `asin` or `picks`, not both and not neither",
    })
    .refine((e) => e.draft || !e.health || e.healthNote !== undefined, {
      message: "Health products need a specific healthNote with the manufacturer's contraindications",
      path: ["healthNote"],
    }),
});

export const collections = { kit };
