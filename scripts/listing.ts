/**
 * Reads an Amazon.es listing as text, the first step of adding a product.
 * `npm run listing -- <amazon link or ASIN>` accepts a full amazon.es link,
 * a share link (amzn.eu/d/..., amzn.to/...) or a bare ASIN, and prints:
 *
 *   - the ASIN, and whether Amazon redirects it to a different one,
 *   - the title, brand, selected variant (colour, size...) and model number,
 *   - the "about this item" bullets and the product details,
 *   - any entry already in the catalogue with the same ASIN or brand.
 *
 * Only the page's text is read, once. It never downloads Amazon's images: the
 * Associates agreement forbids copying or storing them, so product photos come
 * from the maker's own website instead (see .claude/commands/add-product.md).
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { profileName } from "../src/config/active";

const ROOT = resolve(import.meta.dirname, "..");
const KIT = join(ROOT, "src/profiles", profileName(process.env.SITE_PROFILE), "kit");
const AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const ASIN = /^[A-Z0-9]{10}$/;

const input = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
if (!input) {
  console.log("Usage: npm run listing -- <amazon.es link, amzn.eu share link or ASIN>");
  process.exit(1);
}

const curl = (args: string[]) => execFileSync("curl", ["-sS", "--max-time", "30", "-A", AGENT, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** The ASIN in a link, following share-link redirects first. */
function asinOf(raw: string): string {
  if (ASIN.test(raw)) return raw;
  const url = /^https?:\/\/(amzn\.(eu|to)|a\.co)\//.test(raw) ? curl(["-o", "/dev/null", "-L", "-w", "%{url_effective}", raw]) : raw;
  const match = /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/.exec(url);
  if (!match) throw new Error(`No ASIN in ${url}`);
  return match[1];
}

/** The listing page. Amazon sometimes answers with a "continue shopping" check page, so retry a few times. */
function fetchListing(asin: string): string {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const html = curl(["--compressed", "-H", "Accept-Language: es-ES,es;q=0.9", `https://www.amazon.es/dp/${asin}`]);
    if (html.includes('id="productTitle"')) return html;
    execFileSync("sleep", [String(attempt * 3)]);
  }
  throw new Error("Amazon.es didn't return the product page (it may be blocking automated requests); open the link in a browser instead.");
}

const text = (html = "") =>
  html
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rlm;|&lrm;|&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const first = (html: string, pattern: RegExp) => pattern.exec(html)?.[1];

const asin = asinOf(input);
const html = fetchListing(asin);
const shownAsin = first(html, /name="ASIN" value="([A-Z0-9]{10})"/);
const canonical = first(html, /<link rel="canonical" href="[^"]*\/dp\/([A-Z0-9]{10})/);
let variant = "";
const variants = first(html, /"dimensionValuesDisplayData"\s*:\s*(\{[^}]*\})/);
if (variants) {
  try {
    variant = (JSON.parse(variants)[asin] ?? []).join(" / ");
  } catch {
    // Leave it empty; the title usually names the variant too.
  }
}
const details = text(first(html, /(<div id="detailBullets_feature_div"[\s\S]*?<\/ul>)/) ?? first(html, /(<table[^>]*id="productDetails_techSpec_section_1"[\s\S]*?<\/table>)/));

console.log(`ASIN       ${asin}  https://www.amazon.es/dp/${asin}`);
if ((shownAsin && shownAsin !== asin) || (canonical && canonical !== asin)) {
  console.log(`REDIRECT   Amazon shows ${shownAsin ?? canonical} for this code: check it's still the product (and colour) intended`);
}
console.log(`Title      ${text(first(html, /<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/))}`);
console.log(`Brand      ${text(first(html, /<a id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/)).replace(/^(Marca:|Visita la tienda de)\s*/i, "")}`);
console.log(`Variant    ${variant || "(none selected)"}`);
console.log(`Category   ${text(first(html, /(<div id="wayfinding-breadcrumbs_feature_div"[\s\S]*?<\/ul>)/)) || "(not shown)"}`);
console.log(`\nAbout this item\n  ${text(first(html, /<div id="feature-bullets"[\s\S]*?(<ul[\s\S]*?<\/ul>)/)) || "(none)"}`);
console.log(`\nDetails\n  ${details.replace(/\.[\w-]+(\s[\w.-]+)*\s?\{[^}]*\}/g, "").replace(/var dpAcr[\s\S]*$/, "").trim() || "(none)"}`);

// Already in the catalogue? Same ASIN, or the same brand (which may be the same product under a newer listing).
const brand = text(first(html, /<a id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/)).replace(/^(Marca:|Visita la tienda de)\s*/i, "").toLowerCase();
const matches: string[] = [];
for (const file of readdirSync(KIT).filter((f) => f.endsWith(".md"))) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(KIT, file), "utf8"))?.[1] ?? "";
  const data = parseYaml(frontmatter) as { asin?: string; picks?: { asin: string }[]; brand?: string; product?: string; draft?: boolean };
  const codes = [data.asin, ...(data.picks ?? []).map((p) => p.asin)];
  const status = data.draft === false ? "published" : "draft";
  if (codes.includes(asin)) matches.push(`${file} uses this ASIN already (${status})`);
  else if (brand && data.brand && brand.includes(data.brand.toLowerCase())) matches.push(`${file} is also ${data.brand}: ${data.product} (${status}, ${codes.join(", ")}); is it the same product?`);
}
console.log(`\nCatalogue\n  ${matches.length ? matches.join("\n  ") : "nothing similar yet"}`);
