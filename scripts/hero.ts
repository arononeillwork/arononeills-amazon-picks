/**
 * Builds the home page's hero picture: a handful of products cut out of their
 * white backgrounds and arranged together, like a shop's "family" shot.
 * `npm run hero` reads src/profiles/<profile>/hero/hero.json and writes
 *
 *   hero/collection-wide.webp    for tablets and desktops
 *   hero/collection-square.webp  for phones
 *
 * Both are transparent, so the hero's gradient shows through. Each product is
 * an entry's own photo (kit/images/), so only the brand's official images or
 * Aron's own ever appear. Run it again after changing hero.json or a photo.
 *
 * hero.json lists, per layout, the canvas size and the products from back to
 * front. Each product is placed by the centre of its base (x, bottom, as
 * shares of the canvas) and sized by `height` or `width` (also shares).
 * Two optional settings help with photos shot on a surface rather than on
 * pure white: `backdrop` ({ min, spread }) widens what counts as background,
 * for example a soft cast shadow, and `holes` also clears background enclosed
 * by the product, such as the inside of a handle: `true` clears every patch
 * bigger than 0.2% of the photo, a number sets that share instead (raise it
 * when a highlight on the product goes missing).
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { parse as parseYaml } from "yaml";
import { profileName } from "../src/config/active";

const ROOT = resolve(import.meta.dirname, "..");
const PROFILE = join(ROOT, "src/profiles", profileName(process.env.SITE_PROFILE));
const HERO = join(PROFILE, "hero");

interface Backdrop {
  /** The darkest channel must be at least this bright. */
  min: number;
  /** And the channels at most this far apart (near-neutral). */
  spread: number;
}
interface Item {
  slug: string;
  x: number;
  bottom: number;
  height?: number;
  width?: number;
  backdrop?: Backdrop;
  holes?: boolean | number;
}
interface Layout {
  width: number;
  height: number;
  items: Item[];
}
export interface HeroConfig {
  layouts: Record<"wide" | "square", Layout>;
}

interface Cutout {
  data: Buffer;
  width: number;
  height: number;
}

// The photo pipeline already made the backdrop pure white.
const WHITE: Backdrop = { min: 250, spread: 255 };

/**
 * Cuts a product out of its white background: everything that counts as
 * backdrop and touches the edge goes transparent (with `holes`, enclosed
 * patches of it too). The two-pixel rim where the product meets it is
 * un-blended from white, which keeps the edge smooth on any colour behind.
 */
async function cutout(file: string, backdrop = WHITE, holes: boolean | number = false): Promise<Cutout> {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const size = width * height;
  const background = new Uint8Array(size);
  const isBackdrop = (p: number) => {
    const lo = Math.min(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]);
    return lo >= backdrop.min && Math.max(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]) - lo <= backdrop.spread;
  };
  /** Marks the backdrop connected to the seed pixels in `mark`, and returns the pixels it marked. */
  const fill = (seeds: number[], mark: Uint8Array) => {
    const patch: number[] = [];
    const stack = seeds;
    while (stack.length) {
      const p = stack.pop()!;
      if (mark[p] || !isBackdrop(p)) continue;
      mark[p] = 1;
      patch.push(p);
      const x = p % width;
      if (x > 0) stack.push(p - 1);
      if (x < width - 1) stack.push(p + 1);
      if (p >= width) stack.push(p - width);
      if (p < size - width) stack.push(p + width);
    }
    return patch;
  };
  const edges: number[] = [];
  for (let x = 0; x < width; x++) edges.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) edges.push(y * width, y * width + width - 1);
  fill(edges, background);
  if (holes) {
    // Enclosed patches big enough to be a gap, not a highlight on the product.
    const minimum = size * (typeof holes === "number" ? holes : 0.002);
    const seen = new Uint8Array(background);
    for (let p = 0; p < size; p++) {
      if (seen[p] || !isBackdrop(p)) continue;
      const patch = fill([p], seen);
      if (patch.length >= minimum) for (const q of patch) background[q] = 1;
    }
  }

  // Pixels within two pixels of the background form the rim.
  let near = background;
  for (let pass = 0; pass < 2; pass++) {
    const grown = new Uint8Array(near);
    for (let p = 0; p < size; p++) {
      if (near[p]) continue;
      const x = p % width;
      if ((x > 0 && near[p - 1]) || (x < width - 1 && near[p + 1]) || (p >= width && near[p - width]) || (p < size - width && near[p + width])) {
        grown[p] = 1;
      }
    }
    near = grown;
  }

  const out = Buffer.alloc(size * 4);
  for (let p = 0; p < size; p++) {
    const [r, g, b] = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
    if (background[p]) continue;
    if (!near[p]) {
      out.set([r, g, b, 255], p * 4);
      continue;
    }
    const alpha = Math.max(255 - r, 255 - g, 255 - b) / 255;
    if (alpha <= 0) continue;
    const unblend = (c: number) => Math.max(0, Math.min(255, Math.round((c - 255 * (1 - alpha)) / alpha)));
    out.set([unblend(r), unblend(g), unblend(b), Math.round(alpha * 255)], p * 4);
  }

  const trimmed = await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 0 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: trimmed.data, width: trimmed.info.width, height: trimmed.info.height };
}

/** The image an entry shows, as a path, if it has one and is published. */
function entryPhoto(slug: string): string {
  const file = join(PROFILE, "kit", `${slug}.md`);
  if (!existsSync(file)) throw new Error(`hero.json: no entry called ${slug}`);
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, "utf8"))?.[1] ?? "";
  const data = parseYaml(frontmatter) as { image?: string; draft?: boolean };
  if (data.draft !== false) throw new Error(`hero.json: ${slug} is a draft, so it isn't on the site`);
  if (!data.image) throw new Error(`hero.json: ${slug} has no photo`);
  return join(PROFILE, "kit", data.image);
}

/** A composite operation for an RGBA image at (left, top), clipped to the canvas. */
async function place(image: Cutout, left: number, top: number, canvas: Layout): Promise<OverlayOptions | undefined> {
  const x0 = Math.max(0, left);
  const y0 = Math.max(0, top);
  const x1 = Math.min(canvas.width, left + image.width);
  const y1 = Math.min(canvas.height, top + image.height);
  if (x1 <= x0 || y1 <= y0) return undefined;
  const input = await sharp(image.data, { raw: { width: image.width, height: image.height, channels: 4 } })
    .extract({ left: x0 - left, top: y0 - top, width: x1 - x0, height: y1 - y0 })
    .png()
    .toBuffer();
  return { input, left: x0, top: y0 };
}

/** A soft, cool shadow under the product, so the group reads as one scene. */
async function shadow(item: Cutout): Promise<{ image: Cutout; margin: number }> {
  const sigma = Math.max(6, Math.round(item.height * 0.045));
  const margin = sigma * 3;
  const width = item.width + margin * 2;
  const height = item.height + margin * 2;
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < item.height; y++) {
    for (let x = 0; x < item.width; x++) {
      const alpha = item.data[(y * item.width + x) * 4 + 3];
      if (alpha) data.set([30, 40, 72, Math.round(alpha * 0.26)], ((y + margin) * width + x + margin) * 4);
    }
  }
  const blurred = await sharp(data, { raw: { width, height, channels: 4 } }).blur(sigma).raw().toBuffer();
  return { image: { data: blurred, width, height }, margin };
}

async function render(name: string, layout: Layout) {
  const placed: { product: Cutout; left: number; top: number }[] = [];
  for (const item of layout.items) {
    const source = await cutout(entryPhoto(item.slug), item.backdrop, item.holes);
    const scale = item.width
      ? (item.width * layout.width) / source.width
      : ((item.height ?? 0.4) * layout.height) / source.height;
    const width = Math.round(source.width * scale);
    const height = Math.round(source.height * scale);
    const resized = await sharp(source.data, { raw: { width: source.width, height: source.height, channels: 4 } })
      .resize(width, height, { kernel: "lanczos3" })
      .raw()
      .toBuffer();
    placed.push({
      product: { data: resized, width, height },
      left: Math.round(item.x * layout.width - width / 2),
      top: Math.round(item.bottom * layout.height - height),
    });
  }
  // Centre the group as a whole, so hero.json only has to get the arrangement right.
  const minX = Math.min(...placed.map((p) => p.left));
  const maxX = Math.max(...placed.map((p) => p.left + p.product.width));
  const shift = Math.round((layout.width - (minX + maxX)) / 2);

  const layers: OverlayOptions[] = [];
  for (const { product, left, top } of placed) {
    const { image, margin } = await shadow(product);
    const drop = Math.round(product.height * 0.035);
    const under = await place(image, left + shift - margin, top - margin + drop, layout);
    const over = await place(product, left + shift, top, layout);
    if (under) layers.push(under);
    if (over) layers.push(over);
  }
  const file = join(HERO, `collection-${name}.webp`);
  await sharp({ create: { width: layout.width, height: layout.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers)
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(file);
  console.log(`ok    ${file.slice(ROOT.length + 1)}: ${layout.items.length} products, ${layout.width}×${layout.height}`);
}

const config = JSON.parse(readFileSync(join(HERO, "hero.json"), "utf8")) as HeroConfig;
for (const [name, layout] of Object.entries(config.layouts)) await render(name, layout);
