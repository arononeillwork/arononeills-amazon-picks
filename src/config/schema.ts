import { z } from "astro/zod";

/**
 * Amazon Associates: "Amazon", "amzn" or any variant must never appear in the
 * site name, title, URL, subdomain or social handles. Checked at build.
 */
const AMAZON_VARIANT = /am[a4@]z[o0]n|amzn/i;

const NO_AMAZON = {
  message: 'Must not contain "Amazon", "amzn" or any variant (Associates operating agreement).',
};
const clean = (value: string) => !AMAZON_VARIANT.test(value);

const colour = z.string().regex(/^#[0-9a-f]{6}$/i, "Use a six-digit hex colour");

const palette = z.object({
  bg: colour,
  surface: colour,
  text: colour,
  muted: colour,
  line: colour,
  accent: colour,
  accentText: colour,
  focus: colour,
});

export const siteSchema = z.object({
  identity: z.object({
    /** Project name, as in the vercel.app subdomain. */
    name: z.string().min(1).refine(clean, NO_AMAZON),
    /** Name shown in the header and page titles. */
    masthead: z.string().min(1).refine(clean, NO_AMAZON),
    url: z.url({ protocol: /^https$/ }).refine(clean, NO_AMAZON),
    tagline: z.string().min(1).refine(clean, NO_AMAZON),
    description: z.string().min(1).max(160),
    lang: z.string().min(2),
    locale: z.string().min(2),
  }),
  owner: z.object({
    name: z.string().min(1),
    /** One short paragraph about who is recommending these things and why. */
    about: z.string().min(1),
  }),
  /** Published on /privacy/ as the data controller and LSSI-CE identification. */
  legal: z.object({
    fullName: z.string().min(1),
    nif: z.string().min(1),
    address: z.string().min(1),
    email: z.email(),
  }),
  social: z
    .array(z.object({ label: z.string().min(1).refine(clean, NO_AMAZON), url: z.url().refine(clean, NO_AMAZON) }))
    .default([]),
  palette: z.object({ light: palette, dark: palette }),
  features: z.object({
    apartment: z.boolean(),
  }),
  affiliate: z.object({
    /** Off until Associates Central issues a tracking ID. Off means untagged links and no earnings claims. */
    enabled: z.boolean(),
    marketplace: z.literal("www.amazon.es"),
    /** Tracking ID from Associates Central; Amazon.es IDs end in -21. */
    tag: z.string().regex(/^$|^[a-z0-9-]+-21$/, "Amazon.es tracking IDs end in -21"),
    /** Link-level disclosure shown directly above every buy button. */
    linkDisclosure: z.string().min(1),
    /** Sitewide statements in the footer of every page, exactly as Associates Central words them. */
    sitewideStatement: z.array(z.string().min(1)).min(1),
  }),
});

export type SiteConfig = z.infer<typeof siteSchema>;

export const catalogueSchema = z.object({
  categories: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/).refine(clean, NO_AMAZON),
        name: z.string().min(1),
        intro: z.string().min(1),
      }),
    )
    .min(1),
  tags: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/).refine(clean, NO_AMAZON),
        name: z.string().min(1),
      }),
    )
    .min(1),
});

export type Catalogue = z.infer<typeof catalogueSchema>;
export { AMAZON_VARIANT };
