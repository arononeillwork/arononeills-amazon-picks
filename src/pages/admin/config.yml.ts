import type { APIRoute } from "astro";
import { stringify } from "yaml";
import { activeProfile, catalogue, site } from "../../config/active";

/**
 * The admin's configuration (Sveltia CMS), generated at build time so the
 * category and situation choices always match catalogue.ts, and the field
 * rules mirror the ones the preflight enforces. Wording here is for Aron.
 */

// The field patterns below are regular expressions without flags, so the
// case-insensitive "Amazon" check spells out each letter's cases.
const NO_AMAZON = "(?![\\s\\S]*([Aa][Mm][Aa4@][Zz][Oo0][Nn]|[Aa][Mm][Zz][Nn]))";
const NO_PRICES_OR_BRACKETS = "[^€$£\\[\\]]*";
const plainText = (what: string): [string, string] => [
  `^${NO_AMAZON}${NO_PRICES_OR_BRACKETS}$`,
  `${what} can't mention Amazon, prices or currency symbols, or contain square brackets.`,
];

const kitFolder = `src/profiles/${activeProfile}/kit`;

const products = {
  name: "kit",
  label: "Products",
  label_singular: "Product",
  icon: "inventory_2",
  description:
    "Everything recommended on the site. Drafts stay hidden. Each save rebuilds the live site in a minute or two, and only if every published product passes the site's checks.",
  folder: kitFolder,
  extension: "md",
  format: "frontmatter",
  create: true,
  delete: true,
  identifier_field: "title",
  slug: {
    template: "{{product}}",
    editable: ["create"],
    hint: "The end of the page address, e.g. power-bank. Short, lowercase, words joined by hyphens. It can't be changed later.",
  },
  summary: "{{draft | ternary('Draft · ', '')}}{{product}}",
  sortable_fields: ["title", "product", "reviewed"],
  view_groups: { groups: [{ name: "category", label: "Category", field: "category" }], default: "category" },
  view_filters: {
    filters: [
      { name: "live", label: "Live on the site", field: "draft", pattern: false },
      { name: "drafts", label: "Drafts", field: "draft", pattern: true },
    ],
  },
  // Drag and drop to set the order within each category.
  reorder: { key: "order", group: "category" },
  preview_path: "kit/{{category}}/{{slug}}/",
  fields: [
    {
      name: "draft",
      label: "Draft (hidden from the live site)",
      widget: "boolean",
      default: true,
      hint: "Untick to publish. First open the Amazon.es link (https://www.amazon.es/dp/ followed by the product code) and check it shows the right product.",
    },
    {
      name: "title",
      label: "Headline",
      widget: "string",
      maxlength: 70,
      pattern: plainText("The headline"),
      hint: "The need it meets, not a sales line, e.g. “A power bank that charges a laptop and flies in cabin bags”.",
    },
    {
      name: "product",
      label: "Product name",
      widget: "string",
      pattern: plainText("The product name"),
      hint: "Brand and model as sold. Never an Amazon own brand (Amazon Basics and similar).",
    },
    {
      name: "brand",
      label: "Brand",
      widget: "string",
      required: false,
      maxlength: 24,
      pattern: plainText("The brand"),
      hint: "Shown small above the name, e.g. “Apple”.",
    },
    {
      name: "name",
      label: "Short name",
      widget: "string",
      required: false,
      maxlength: 28,
      pattern: plainText("The short name"),
      hint: "What the cards and page heading show, e.g. “MacBook Neo”. The full product name above stays in the details.",
    },
    {
      name: "category",
      label: "Category",
      widget: "select",
      options: catalogue.categories.map((c) => ({ label: c.name, value: c.slug })),
    },
    {
      name: "tags",
      label: "Situations",
      widget: "select",
      multiple: true,
      min: 1,
      max: 3,
      options: catalogue.tags.map((t) => ({ label: t.name, value: t.slug })),
      hint: "Pick one to three. Used by the filter on the full list.",
    },
    {
      name: "summary",
      label: "One-line summary",
      widget: "text",
      maxlength: 160,
      pattern: plainText("The summary"),
      hint: "Shown in lists and in search results.",
    },
    {
      name: "highlights",
      label: "At a glance",
      label_singular: "fact",
      widget: "list",
      required: false,
      min: 2,
      max: 4,
      field: { name: "fact", label: "Fact", widget: "string", maxlength: 44, pattern: plainText("A fact") },
      hint: "Two to four short facts shown beside the buy button, e.g. “Five speeds, stated 55 dB”. Specs from the maker, never prices.",
    },
    {
      name: "image",
      label: "Photo",
      widget: "image",
      required: false,
      // Saved beside the product file (kit/images/), converted to WebP in the browser, so phone photos work too.
      media_folder: "images",
      public_folder: "./images",
      choose_url: false,
      accept: "image/jpeg,image/png,image/webp,image/heic,image/avif",
      hint: "Your own photo, or the brand's official product photo from its own website or press kit (then fill in Photo credit). Never an image saved from Amazon: its rules forbid it. Check the photo shows the exact model and colour. A product can't be published without one: the deploy check stops it.",
    },
    {
      name: "imageCredit",
      label: "Photo credit",
      widget: "string",
      required: false,
      pattern: plainText("The credit"),
      hint: "Only when the photo isn't yours: the brand's name, e.g. “Therabody”. Shown under the photo.",
    },
    {
      name: "experience",
      label: "Do you own it?",
      widget: "select",
      default: "researched",
      options: [
        { label: "Yes, I own and use it", value: "owned" },
        { label: "No, researched only", value: "researched" },
      ],
      hint: "If you own it, write only what you've actually experienced. If not, never imply you've used it; the page says “Researched, not owned” for you.",
    },
    {
      name: "asin",
      label: "Amazon.es product code (ASIN)",
      widget: "string",
      required: false,
      pattern: ["^[A-Z0-9]{10}$", "Ten capital letters or digits, e.g. B0CXDXP8VR."],
      hint: "The 10 characters after /dp/ in the Amazon.es address. Leave empty only for three-pick products like the laptops.",
    },
    {
      name: "picks",
      label: "Three picks (instead of one product code)",
      label_singular: "pick",
      widget: "list",
      required: false,
      min: 3,
      max: 3,
      summary: "{{label}}: {{product}}",
      hint: "Only for products shown as three options by use, like the laptops. Use either the product code above or exactly three picks, not both.",
      fields: [
        { name: "label", label: "Use case", widget: "string", pattern: plainText("The use case"), hint: "e.g. “Lightest to carry”." },
        { name: "product", label: "Product name", widget: "string", pattern: plainText("The product name") },
        {
          name: "asin",
          label: "Amazon.es product code (ASIN)",
          widget: "string",
          pattern: ["^[A-Z0-9]{10}$", "Ten capital letters or digits."],
        },
        { name: "why", label: "Why this one", widget: "text", pattern: plainText("This") },
      ],
    },
    {
      name: "drawback",
      label: "The honest drawback",
      widget: "text",
      maxlength: 120,
      pattern: plainText("The drawback"),
      hint: "Every product needs one: one short sentence with the main weakness, in your own words. Never copy Amazon reviews.",
    },
    {
      name: "health",
      label: "Health product",
      widget: "boolean",
      default: false,
      hint: "Tick for anything like compression socks, massage guns or TENS units.",
    },
    {
      name: "healthNote",
      label: "Health note",
      widget: "text",
      required: false,
      pattern: plainText("The health note"),
      hint: "Health products only: the manufacturer's contraindications (who shouldn't use it). Never say it treats, cures or prevents anything.",
    },
    {
      name: "featured",
      label: "Spotlight on the home page",
      widget: "boolean",
      default: false,
      required: false,
      hint: "Tick one product to feature it in the big spotlight on the home page.",
    },
    {
      name: "reviewed",
      label: "Last checked",
      widget: "datetime",
      type: "date",
      format: "YYYY-MM-DD",
      default: "{{now}}",
      hint: "The day you last checked the Amazon.es listing. The site flags products not checked for six months (three for the laptops).",
    },
    {
      name: "body",
      label: "Write-up",
      widget: "markdown",
      buttons: ["bold", "italic", "heading-two", "heading-three", "bulleted-list", "numbered-list", "quote"],
      editor_components: [],
      pattern: [`^${NO_PRICES_OR_BRACKETS}$`, "The write-up can't contain prices, currency symbols or square brackets (links and images aren't allowed)."],
      hint: "200 to 400 words. Use headings like What to look for, Why this one, Who it suits and Who should skip it.",
    },
  ],
};

const associates = {
  name: "associates",
  label: "Amazon Associates",
  icon: "handshake",
  file: `src/profiles/${activeProfile}/affiliate.json`,
  format: "json",
  description: "Affiliate settings. Leave switched off until Associates Central has given you a tracking ID.",
  fields: [
    {
      name: "enabled",
      label: "Affiliate links switched on",
      widget: "boolean",
      default: false,
      hint: "Adds the tracking ID to every buy button and shows the disclosures.",
    },
    {
      name: "tag",
      label: "Tracking ID",
      widget: "string",
      required: false,
      pattern: ["^[a-z0-9-]+-21$", "Amazon.es tracking IDs end in -21."],
      hint: "From Associates Central, e.g. yourname-21.",
    },
    {
      name: "linkDisclosure",
      label: "Note above each buy button",
      widget: "string",
    },
    {
      name: "sitewideStatement",
      label: "Statements in every page's footer",
      label_singular: "statement",
      widget: "list",
      min: 1,
      field: { name: "statement", label: "Statement", widget: "string" },
      hint: "Word for word as Associates Central gives them.",
    },
  ],
};

const config = {
  app_title: `${site.identity.masthead} · admin`,
  site_url: site.identity.url,
  display_url: site.identity.url,
  logo: { src: "/favicon.svg" },
  backend: {
    name: "github",
    repo: site.admin.repo,
    // "Sign in with GitHub" goes through this site's own /api/auth/ and /api/callback/.
    base_url: site.identity.url,
    auth_endpoint: "api/auth/",
    auth_scope: "public_repo",
    commit_messages: {
      create: "Admin: add {{collection}} “{{slug}}”",
      update: "Admin: update {{collection}} “{{slug}}”",
      delete: "Admin: remove {{collection}} “{{slug}}”",
    },
  },
  // Product photos go beside each product (the Photo field sets its own folder); this is the fallback.
  media_folder: "public/images/kit",
  public_folder: "/images/kit",
  media_libraries: {
    default: {
      config: {
        max_file_size: 15 * 1024 * 1024,
        slugify_filename: true,
        // Phone photos are large; the site makes its own sizes from this at build time.
        transformations: { raster_image: { format: "webp", quality: 85, width: 2400, height: 2400 } },
      },
    },
    // Stock photos would show a product that isn't the one recommended.
    stock_assets: false,
  },
  output: { omit_empty_optional_fields: true },
  slug: { encoding: "ascii", clean_accents: true, maxlength: 60 },
  collections: [products],
  singletons: [associates],
};

export const GET: APIRoute = () =>
  new Response(stringify(config, { lineWidth: 0 }), { headers: { "Content-Type": "application/yaml; charset=utf-8" } });
