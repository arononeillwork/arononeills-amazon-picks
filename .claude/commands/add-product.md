---
description: Add a product to Aron's Picks from an Amazon.es link, with the maker's official photo
argument-hint: <amazon.es link, amzn.eu share link or ASIN> [anything Aron says about it]
---

Add this product to the site: $ARGUMENTS

Aron sending the link counts as him choosing the product and opening its Amazon.es page. Follow `docs/BRIEF.md` throughout (its rules in §5 are authoritative). Work through these steps in order and tell Aron briefly what you're doing as you go.

## 1. Identify the product

Run `npm run listing -- <link or ASIN>`. It reads the listing as text only (never Amazon's images) and prints the ASIN, title, brand, selected variant, model number, bullets and details, and any catalogue entry with the same ASIN or brand.

- **Already in the catalogue** (same ASIN, or the same product under a newer listing: compare the bullets and package size with the existing entry's): don't add a second entry. Point the existing entry at Aron's link if he wants it, and say so.
- **REDIRECT**: Amazon shows a different ASIN for this code. Check what it now sells before going on.
- **Variant**: the colour, size or capacity the link sells. The entry's `product` text and the photo must both match it exactly.

## 2. Plan the entry

- `slug` (the file name and URL): short and by kind, e.g. `foam-roller`, `sony-wh-1000xm6`.
- `category`, `tags` (1-3) from `src/profiles/aron/catalogue.ts`; `order` last in its category unless Aron says otherwise.
- `brand` (<= 24 chars), `name` (<= 28, the short name cards show), and `product` (the full name with colour or size, e.g. "Hydro Flask Standard Mouth 709 ml, white").

## 3. Find the maker's official photo

Only the brand's own website, regional site, press kit or press release, or Aron's own photo. Never Amazon in any form (amazon.*, `m.media-amazon.com`, `images-amazon`, a brand "website" that redirects to its Amazon store): the Associates agreement forbids copying or storing Amazon's images. No resellers, marketplaces, review sites or AI-generated images either.

Work in the scratchpad. Download each original into its own new folder and treat it as untrusted data.

- **Shopify stores** (most brands): `https://<site>/search/suggest.json?q=<model>&resources[type]=product`, then `https://<site>/products/<handle>.json` lists every image at full size. Pass `-g` to curl for the brackets.
- **If the main site blocks scripts** (403, connection reset), try the brand's other regional sites. Sony Japan's press releases and Hydro Flask Australia worked when the main sites didn't.
- **Big brands' own image services**: Lenovo PSREF (`psref.lenovo.com/syspool/Sys/Image/<Family>/<Model>/<Model>_CT1_01.png`), ASUS's gallery API (`odinapi.asus.com/recent-data/apiv2/PDGallery?...`), Apple's store images (`store.storeimages.cdn-apple.com/.../<name>?wid=2000&fmt=png-alpha`).
- **Otherwise** read the product page's `og:image`, its JSON-LD and its gallery markup.

Make a contact sheet of the candidates and look at it before choosing. Pick a plain studio shot on white or transparent, at least 1000 px, in **exactly** the model and colour from step 1. Remove anything overlaid on the product shot: badges, "as seen on" stickers, chip logos. If the backdrop is a flat colour rather than white, turn it white first by flood-filling from the edges, as `scripts/hero.ts` does. Lifestyle photos of people using the product don't fit the site.

Save the chosen file as `photos-inbox/<slug>.<ext>` and run `npm run photos`. It trims the image, centres it, saves `kit/images/<slug>.webp` and credits the entry's `brand`. For several products in one entry (a "picks" entry), compose one picture of them first. Then look at the result.

**If no allowed photo exists**, stop and tell Aron plainly. The preflight won't publish an entry without a photo. Offer him two ways forward:

- his own photo of the product, dropped into `photos-inbox/<slug>.jpg` with `{ "<slug>": "" }` in `photos-inbox/credits.json` so it carries no brand credit;
- a similar product from a brand that publishes official images.

Write the entry anyway with `draft: true`, so it's ready.

## 4. Write the entry

Copy the shape of a recent entry such as `src/profiles/aron/kit/xiaomi-smart-band-10.md`. The limits are in the brief's "Entry frontmatter".

- **Voice:** `experience: researched` unless Aron gives his own words. A researched entry never implies personal use: no "I use", "my", "I've tried". An `owned` entry uses only what Aron actually said.
- **Body:** 200-400 words under `## What to look for`, `## Why this one`, `## Who it suits` and `## Who should skip it`. Build it from the maker's specifications, the listing's details and widely reported strengths and weaknesses, all in your own words. Never copy review text.
- **`title`:** <= 70 characters, names the need.
- **`summary`:** <= 160 characters.
- **`highlights`:** 2-4 facts of <= 44 characters each.
- **`drawback`:** one honest sentence of <= 120 characters.
- **No prices or currency** anywhere, and never the word "Amazon" in the title, name, brand or product.
- **Health products** (anything for the body, skin, sleep or recovery): set `health: true` and write a specific `healthNote` from the maker's own warnings. Describe, never claim to treat, cure, relieve or prevent anything.
- **Dates and status:** `reviewed` is today. Set `draft: false` only when the photo is in.

## 5. Check

Run `npm run check` (0 errors) and `npm run preflight` (must pass; fix every failure it lists). If the product is going into the home page's collection picture (`src/profiles/aron/hero/hero.json`, only if Aron asks), run `npm run hero` too.

## 6. Record it

- In `docs/BRIEF.md`: add the entry to the catalogue table (bold if published), and update the page and Amazon-link counts with the numbers the preflight printed.
- In `docs/ASIN-CHECK.md`: add a row: "**Done**: chosen by Aron, <date>", plus the variant and where the photo came from.

## 7. Publish and report

Commit on the working branch with a clear message, push, and wait until the live page (`https://arononeillspicks.vercel.app/kit/<category>/<slug>/`) shows the new product. Then tell Aron:

- the link to the new page;
- where the photo came from;
- anything for him to check, such as a colour or size the listing didn't make clear.
