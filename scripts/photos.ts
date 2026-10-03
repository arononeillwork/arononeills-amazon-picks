/**
 * Adds product photos to entries. `npm run photos` takes every image in
 * photos-inbox/ named after its entry (espresso-machine.jpg, sunscreen.png, ...)
 * and for each one:
 *
 *   - flattens it onto white, makes an off-white backdrop pure white and trims the empty border,
 *   - centres it on a 4:3 white canvas with room around it, at most 1600 px wide,
 *   - saves it as src/profiles/<profile>/kit/images/<slug>.webp,
 *   - sets `image` and `imageCredit` in the entry, and
 *   - removes the original from the inbox.
 *
 * Only the brand's official product photos or Aron's own. Never an image saved
 * from Amazon: the Associates agreement forbids copying or storing them.
 *
 * The credit defaults to the brand (the first word of the entry's `product`).
 * Override it in photos-inbox/credits.json, e.g. { "tens-unit": "" } for one
 * of Aron's own photos, which carries no credit.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, parse, resolve } from "node:path";
import sharp from "sharp";
import { parse as parseYaml } from "yaml";
import { AMAZON_VARIANT } from "../src/config/schema";
import { profileName } from "../src/config/active";

const ROOT = resolve(import.meta.dirname, "..");
const INBOX = join(ROOT, "photos-inbox");
const KIT = join(ROOT, "src/profiles", profileName(process.env.SITE_PROFILE), "kit");
const OUT = join(KIT, "images");
const IMAGE = /\.(jpe?g|png|webp|avif|tiff?)$/i;
const WIDTH = 1600;
const HEIGHT = 1200;
// The product fills at most this share of the canvas, so every picture has the same breathing room.
const FILL = 0.84;
const MAX_ENLARGE = 2;

const credits: Record<string, string> = existsSync(join(INBOX, "credits.json"))
  ? JSON.parse(readFileSync(join(INBOX, "credits.json"), "utf8"))
  : {};

const files = existsSync(INBOX) ? readdirSync(INBOX).filter((file) => IMAGE.test(file)) : [];
if (files.length === 0) {
  console.log("photos-inbox/ has no images. Name each one after its entry, e.g. espresso-machine.jpg.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

/** Sets a top-level frontmatter field, replacing it if present or adding it before `experience:`. */
function setField(frontmatter: string, key: string, value: string | undefined): string {
  const line = new RegExp(`^${key}:.*$\\n?`, "m");
  const without = frontmatter.replace(line, "");
  if (value === undefined) return without;
  return without.replace(/^experience:/m, `${key}: ${JSON.stringify(value)}\nexperience:`);
}

/**
 * Makes an off-white studio backdrop pure white. The site blends white into the
 * card colour, so a backdrop of #fcfcfc shows as a grey box. Only near-white,
 * near-neutral pixels connected to the image's edge change, so white parts of
 * the product itself stay as they are.
 */
async function whitenBackdrop(image: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const isBackdrop = (p: number) => {
    const i = p * channels;
    const lo = Math.min(data[i], data[i + 1], data[i + 2]);
    return lo >= 236 && Math.max(data[i], data[i + 1], data[i + 2]) - lo <= 12;
  };
  const seen = new Uint8Array(width * height);
  const stack: number[] = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p] || !isBackdrop(p)) continue;
    seen[p] = 1;
    data.fill(255, p * channels, p * channels + 3);
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < (height - 1) * width) stack.push(p + width);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

let failed = 0;
for (const file of files) {
  const slug = parse(file).name;
  const entryPath = join(KIT, `${slug}.md`);
  if (!existsSync(entryPath)) {
    console.log(`skip  ${file}: no entry called ${slug}.md`);
    failed++;
    continue;
  }
  const source = readFileSync(entryPath, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) {
    console.log(`skip  ${file}: ${slug}.md has no frontmatter`);
    failed++;
    continue;
  }
  const data = parseYaml(match[1]) as { product?: string };
  const credit = slug in credits ? credits[slug] : (data.product ?? "").split(/\s+/)[0];
  if (credit && AMAZON_VARIANT.test(credit)) {
    console.log(`skip  ${file}: images from Amazon aren't allowed`);
    failed++;
    continue;
  }

  try {
    const input = join(INBOX, file);
    const flat = await whitenBackdrop(await sharp(input).rotate().flatten({ background: "#ffffff" }).toBuffer());
    const trimmed = await sharp(flat)
      .trim({ background: "#ffffff", threshold: 14 })
      .toBuffer()
      .catch(() => flat);
    const { width = 0, height = 0 } = await sharp(trimmed).metadata();
    // Every product fills the same share of the frame; small originals are enlarged, but at most twice.
    const scale = Math.min((WIDTH * FILL) / width, (HEIGHT * FILL) / height, MAX_ENLARGE);
    const fitted = await sharp(trimmed)
      .resize(Math.round(width * scale), Math.round(height * scale))
      .toBuffer();
    await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#ffffff" } })
      .composite([{ input: fitted, gravity: "center" }])
      .webp({ quality: 86 })
      .toFile(join(OUT, `${slug}.webp`));

    let frontmatter = setField(match[1], "image", `./images/${slug}.webp`);
    frontmatter = setField(frontmatter, "imageCredit", credit || undefined);
    writeFileSync(entryPath, source.replace(match[1], frontmatter));
    rmSync(input);
    const small = width < 800 && height < 600 ? ` (only ${width}x${height} after trimming: find a larger original if you can)` : "";
    console.log(`ok    ${slug}: ${credit ? `credited to ${credit}` : "no credit"}${small}`);
  } catch (error) {
    console.log(`fail  ${file}: ${(error as Error).message}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
