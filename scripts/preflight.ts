/**
 * The deploy gate. `npm run preflight` builds the site, then this checks the
 * source entries and the built HTML against the rules in docs/BRIEF.md §5.
 * Exits non-zero on any failure. Nothing deploys unless this passes.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { parse as parseHtml, type HTMLElement } from "node-html-parser";
import { parse as parseYaml } from "yaml";
import { profileName, profiles } from "../src/config/active";
import { AMAZON_VARIANT, siteSchema } from "../src/config/schema";
import { PLACEHOLDER_ASIN } from "../src/lib/amazon";

try {
  process.loadEnvFile(".env");
} catch {
  // Fine on CI/Vercel, where the variables are already set.
}

const ROOT = resolve(import.meta.dirname, "..");
// @astrojs/vercel writes what Vercel serves to .vercel/output/static.
const OUTPUT = join(ROOT, ".vercel/output");
const DIST = join(OUTPUT, "static");
const KB = 1024;
// /admin/ is the editor, used only by Aron; public pages keep their budgets.
const BUDGETS = { default: 0, "/kit/": 3 * KB, "/apartment/": 60 * KB, "/admin/": Infinity, fonts: 55 * KB };
const TODAY = new Date();

const failures: string[] = [];
const warnings: string[] = [];
const passes: string[] = [];
const fail = (check: string, detail: string) => failures.push(`${check}: ${detail}`);
const warn = (check: string, detail: string) => warnings.push(`${check}: ${detail}`);
const pass = (check: string, detail = "") => passes.push(detail ? `${check}: ${detail}` : check);

const name = profileName(process.env.SITE_PROFILE);
const site = siteSchema.parse(profiles[name].site);

// ---------------------------------------------------------------- environment

{
  // The Supabase variables only matter while the apartment calendar is on.
  // Without them Vite tree-shakes the Supabase client away and the bundle
  // measures far smaller than what ships, so never measure without them.
  const required = ["SITE_PROFILE", ...(site.features.apartment ? ["PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_PUBLISHABLE_KEY"] : [])];
  const missing = required.filter((key) => !process.env[key]);
  const key = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (missing.length) {
    fail("env", `missing ${missing.join(", ")} (copy .env.example to .env)`);
  } else if (key && !key.startsWith("sb_publishable_")) {
    fail("env", "PUBLIC_SUPABASE_PUBLISHABLE_KEY must be the publishable key (sb_publishable_...), never a secret or service_role key");
  } else {
    pass("env", `profile ${name}, calendar ${site.features.apartment ? "on" : "off"}`);
  }
}

// ---------------------------------------------------------------------- legal

const PLACEHOLDER = /placeholder|\[|\]|todo|tbc|xxx/i;

/** A person's NIF (DNI) or NIE, including the check letter. */
function validPersonalNif(value: string): boolean {
  const match = /^([XYZ]|\d)(\d{7})([A-Z])$/.exec(value);
  if (!match) return false;
  const first = { X: "0", Y: "1", Z: "2" }[match[1]] ?? match[1];
  return "TRWAGMYFPDXBNJZSQVHLCKE"[Number(first + match[2]) % 23] === match[3];
}

/** A company's NIF (the old CIF, e.g. B12345678), including the control character. */
function validCompanyNif(value: string): boolean {
  const match = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/.exec(value);
  if (!match) return false;
  const sum = [...match[2]].map(Number).reduce((total, digit, i) => {
    if (i % 2 === 1) return total + digit;
    const doubled = digit * 2;
    return total + Math.floor(doubled / 10) + (doubled % 10);
  }, 0);
  const control = (10 - (sum % 10)) % 10;
  const letter = "JABCDEFGHI"[control];
  if ("ABEH".includes(match[1])) return match[3] === String(control);
  if ("NPQRSW".includes(match[1])) return match[3] === letter;
  return match[3] === String(control) || match[3] === letter;
}

{
  const { legalName, address, registry } = site.legal;
  const nif = site.legal.nif.toUpperCase().replace(/[\s-]/g, "");
  const company = validCompanyNif(nif);
  const problems = [
    PLACEHOLDER.test(legalName) && (company ? "legalName (the company's registered name)" : "legalName"),
    !company && !validPersonalNif(nif) && "nif (not a valid NIF, NIE or company NIF)",
    PLACEHOLDER.test(address) && "address",
    registry !== undefined && PLACEHOLDER.test(registry) && "registry",
  ].filter(Boolean);
  // LSSI-CE art. 10.1.b: a company's legal notice should show its Registro Mercantil entry.
  if (company && !registry) {
    warn("legal", "no Registro Mercantil entry (tomo, folio, hoja) yet; add legal.registry from the escritura");
  }
  if (problems.length) fail("legal", `placeholder or invalid ${problems.join(", ")} in legal (src/profiles/${name}/site.ts)`);
  else pass("legal", `${company ? "company" : "person"}, NIF ${nif}`);

  const email = site.legal.email;
  if (PLACEHOLDER.test(email) || /@example\.(com|org|net)$/i.test(email)) {
    fail("contact", `legal.email is a placeholder (${email})`);
  } else pass("contact", email);
}

// -------------------------------------------------------------------- entries

interface EntryData {
  title: string;
  category: string;
  product: string;
  brand?: string;
  name?: string;
  summary: string;
  highlights?: string[];
  image?: string;
  imageCredit?: string;
  experience: "owned" | "researched";
  asin?: string;
  picks?: { label: string; product: string; asin: string; why: string }[];
  drawback: string;
  health?: boolean;
  healthNote?: string;
  reviewed: string | Date;
  draft?: boolean;
}

const PRICE = /[€£$]\s?\d|\d\s?(€|eur\b|euros?\b)/i;
const FIRST_PERSON_USE =
  /\b(I|I've|I'd|I'm)\s+(use|used|using|own|owned|bought|wear|wore|tested|tried|love|carry|swear)\b|\bmy (café|cafe|shift|feet|legs|back|kitchen)\b|\bin my experience\b/i;
const TREATMENT = /\b(cures?|cured|curing|treats?|treated|treating|treatment|prevents?|prevented|preventing|heal(s|ed|ing)?|reliev(e|es|ed|ing)|remed(y|ies)|therap(y|ies|eutic))\b/i;
const AMAZON_URL = /https?:\/\/\S*(amazon|amzn)\.|www\.amazon\.|\bamzn\.to\b|\]\([^)]*(amazon|amzn)\./i;

const wordCount = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>#-]/g, " ")
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

const monthsSince = (date: Date) =>
  (TODAY.getFullYear() - date.getFullYear()) * 12 + (TODAY.getMonth() - date.getMonth()) - (TODAY.getDate() < date.getDate() ? 1 : 0);

const kitDir = join(ROOT, "src/profiles", name, "kit");
const entryFiles = readdirSync(kitDir).filter((file) => file.endsWith(".md")).sort();
// Drafts never ship (production builds leave them out), so they're reported, not failed.
// Every published entry must pass every check, and at least ten must be published.
const published: { slug: string; category: string }[] = [];

for (const file of entryFiles) {
  const slug = file.replace(/\.md$/, "");
  const source = readFileSync(join(kitDir, file), "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) {
    fail(`entry ${slug}`, "no frontmatter");
    continue;
  }
  const data = parseYaml(match[1]) as EntryData;
  const body = match[2];
  // Drafts saved from the admin can be half-finished, so every field may be missing.
  const strings = [
    data.title,
    data.product,
    data.summary,
    data.drawback,
    data.healthNote,
    ...(data.picks ?? []).flatMap((p) => [p.label, p.product, p.why]),
    ...(data.highlights ?? []),
    data.brand,
    data.name,
  ].map((s) => s ?? "");
  const problems: string[] = [];

  const draft = data.draft !== false;
  const words = wordCount(body);
  if (words < 200 || words > 400) problems.push(`${words} words (needs 200–400)`);
  const brackets = (source.match(/\[(?!\s*\]\()/g) ?? []).length;
  if (/[[\]]/.test(body) || strings.some((s) => /[[\]]/.test(s))) problems.push(`${brackets} bracketed prompt${brackets === 1 ? "" : "s"} still to fill`);
  const asins = [data.asin, ...(data.picks ?? []).map((p) => p.asin)].filter(Boolean);
  if (asins.includes(PLACEHOLDER_ASIN)) problems.push(`placeholder ASIN ${PLACEHOLDER_ASIN}`);
  if (PRICE.test(body) || strings.some((s) => PRICE.test(s))) problems.push("mentions a price or currency (Amazon forbids static prices)");
  if (AMAZON_URL.test(body)) problems.push("links to Amazon from the body (only amazon.ts builds Amazon links)");
  if (/!\[/.test(body)) problems.push("has an image in the body (own photos only, via <Picture>)");
  if (data.image && !/^\.\/images\/[^/]+\.(webp|jpe?g|png|avif)$/i.test(data.image)) {
    problems.push(`image must be a photo stored in ./images/, not ${data.image} (own or manufacturer photos only)`);
  }
  if (data.imageCredit && AMAZON_VARIANT.test(data.imageCredit)) {
    problems.push("image credited to Amazon (Amazon's product images aren't allowed; use the manufacturer's or your own)");
  }
  if (data.experience === "researched" && (FIRST_PERSON_USE.test(body) || strings.some((s) => FIRST_PERSON_USE.test(s)))) {
    problems.push("researched entry implies personal use");
  }
  if (data.health) {
    if (!data.healthNote || data.healthNote.length < 60) problems.push("health entry needs a specific healthNote");
    const claim = [body, ...strings.slice(0, 4)].find((s) => TREATMENT.test(s));
    if (claim) problems.push(`health entry uses treatment language ("${TREATMENT.exec(claim)![0]}")`);
  }
  if (strings[3].trim().length < 30) problems.push("drawback is too thin to be honest");
  if ([data.title, data.product, data.brand, data.name].some((s) => s && AMAZON_VARIANT.test(s))) {
    problems.push('title, product, brand or name contains "Amazon"');
  }

  const reviewed = new Date(data.reviewed);
  const limit = data.picks ? 3 : 6;
  if (Number.isNaN(reviewed.getTime())) {
    problems.push("no valid last-checked date");
  } else if (monthsSince(reviewed) >= limit) {
    warn(`entry ${slug}`, `last checked ${reviewed.toISOString().slice(0, 10)}; re-check at least every ${limit} months`);
  }

  if (draft) {
    warn(`draft ${slug}`, `not published${problems.length ? `; still to do: ${problems.join("; ")}` : "; ready once confirmed (set draft: false)"}`);
  } else if (problems.length) {
    fail(`entry ${slug}`, problems.join("; "));
  } else {
    published.push({ slug, category: data.category });
  }
}
// Fewer than ten can go live (products are published from the admin after launch),
// but Amazon's review expects at least ten substantial ones before signing up.
if (published.length < 10) {
  warn("catalogue", `${published.length} published entries; publish at least ten before applying to Amazon Associates`);
} else {
  pass("catalogue", `${published.length} published entries`);
}

// ---------------------------------------------------------------- built HTML

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((item) => {
    const path = join(dir, item);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

if (!existsSync(DIST)) {
  fail("build", ".vercel/output/static not found; run `npm run preflight`, which builds first");
} else {
  const files = walk(DIST);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  const route = (file: string) => {
    const rel = "/" + relative(DIST, file).replace(/\\/g, "/");
    return rel === "/404.html" ? "/404" : rel.replace(/index\.html$/, "");
  };
  const entryRoute = /^\/kit\/[a-z0-9-]+\/[a-z0-9-]+\/$/;
  let amazonLinks = 0;
  const jsByRoute: Record<string, number> = {};

  const readText = (path: string) => readFileSync(path, "utf8");
  const gz = (content: string | Buffer) => gzipSync(content, { level: 9 }).length;

  /** A same-origin script and everything it imports, statically or dynamically. */
  function collectModules(url: string, seen: Set<string>) {
    const path = join(DIST, url.split("?")[0]);
    if (seen.has(path) || !existsSync(path)) return;
    seen.add(path);
    const code = readText(path);
    const imports = /(?:import|from)\s*\(?\s*["']([^"']+\.js)["']/g;
    for (const [, spec] of code.matchAll(imports)) {
      collectModules(new URL(spec, `https://x${url}`).pathname, seen);
    }
  }

  for (const file of htmlFiles) {
    const path = route(file);
    const html = readText(file);
    const doc = parseHtml(html);
    const problems: string[] = [];

    const title = doc.querySelector("title")?.text ?? "";
    if (AMAZON_VARIANT.test(title)) problems.push(`<title> contains "Amazon": ${title}`);

    for (const a of doc.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href")!;
      if (href.startsWith("/") && AMAZON_VARIANT.test(href)) problems.push(`internal URL contains "Amazon": ${href}`);
      let url: URL;
      try {
        url = new URL(href, site.identity.url);
      } catch {
        continue;
      }
      if (!/(^|\.)(amazon\.[a-z.]+|amzn\.[a-z]+|a\.co)$/i.test(url.hostname)) continue;
      amazonLinks++;
      const where = `${href.slice(0, 60)}`;
      if (url.hostname !== site.affiliate.marketplace) problems.push(`Amazon link not on ${site.affiliate.marketplace} (shortener or wrong marketplace): ${where}`);
      if (!/^\/dp\/[A-Z0-9]{10}\/?$/.test(url.pathname)) problems.push(`Amazon link is not a plain /dp/ASIN URL: ${where}`);
      const rel = new Set((a.getAttribute("rel") ?? "").split(/\s+/));
      for (const token of ["sponsored", "nofollow", "noopener"]) if (!rel.has(token)) problems.push(`Amazon link missing rel="${token}": ${where}`);
      if (rel.has("noreferrer")) problems.push(`Amazon link has noreferrer (Amazon may check the referring site): ${where}`);
      if (!entryRoute.test(path)) problems.push(`Amazon link outside an entry page (home, category and list pages link to entries only)`);
      let block: HTMLElement | null = a.parentNode;
      while (block && block.getAttribute?.("data-affiliate-block") === undefined) block = block.parentNode;
      if (!block) problems.push(`Amazon link outside a data-affiliate-block: ${where}`);
      const tag = url.searchParams.get("tag");
      if (site.affiliate.enabled) {
        if (tag !== site.affiliate.tag) problems.push(`Amazon link not tagged with ${site.affiliate.tag}: ${where}`);
        const before = a.previousElementSibling;
        if (!before || before.getAttribute("data-disclosure") === undefined) problems.push(`no link-level disclosure directly above: ${where}`);
      } else if (tag !== null) {
        problems.push(`Amazon link is tagged while affiliate is switched off: ${where}`);
      }
    }

    // Every public page carries the statement; the 404 and the private admin editor have no site footer.
    if (site.affiliate.enabled && path !== "/404" && path !== "/admin/") {
      const footer = doc.querySelector("footer [data-sitewide-disclosure]");
      const text = footer?.text.replace(/\s+/g, " ") ?? "";
      const missing = site.affiliate.sitewideStatement.filter((s) => !text.includes(s));
      if (!footer || missing.length) problems.push("sitewide disclosure missing from the footer");
    }

    for (const img of doc.querySelectorAll("img, source")) {
      for (const src of [img.getAttribute("src") ?? "", ...(img.getAttribute("srcset") ?? "").split(/,\s*/).map((s) => s.split(/\s+/)[0])]) {
        if (/media-amazon|images-amazon|ssl-images-amazon/i.test(src)) problems.push(`Amazon product image: ${src}`);
        else if (/^(https?:)?\/\//.test(src) && !src.startsWith(site.identity.url)) problems.push(`image from another site: ${src}`);
      }
    }
    for (const el of doc.querySelectorAll("script[src], link[href]")) {
      const url = el.getAttribute("src") ?? el.getAttribute("href") ?? "";
      const rel = el.getAttribute("rel") ?? "";
      if (el.tagName === "LINK" && !/stylesheet|preload|modulepreload|icon/.test(rel)) continue;
      if (/^https?:\/\//.test(url) && !url.startsWith(site.identity.url)) problems.push(`third-party resource: ${url}`);
    }
    const visible = doc.querySelector("main")?.text ?? "";
    if (/[€£$]\s?\d|\d\s?€/.test(visible)) problems.push("a price appears on the page");
    if ((path === "/apartment/" || path === "/admin/") && !doc.querySelector('meta[name="robots"][content*="noindex"]')) {
      problems.push("private page is missing noindex");
    }

    // JavaScript shipped by this page, gzipped.
    const modules = new Set<string>();
    let inline = 0;
    for (const script of doc.querySelectorAll("script")) {
      const type = script.getAttribute("type");
      const src = script.getAttribute("src");
      if (src) collectModules(src, modules);
      else if (!type || type === "module" || type === "text/javascript") inline += gz(script.innerHTML);
    }
    for (const link of doc.querySelectorAll('link[rel="modulepreload"]')) collectModules(link.getAttribute("href")!, modules);
    for (const island of doc.querySelectorAll("astro-island")) {
      for (const attr of ["component-url", "renderer-url"]) {
        const url = island.getAttribute(attr);
        if (url) collectModules(url, modules);
      }
    }
    const js = inline + [...modules].reduce((sum, file) => sum + gz(readFileSync(file)), 0);
    jsByRoute[path] = js;
    const budget = BUDGETS[path as keyof typeof BUDGETS] ?? BUDGETS.default;
    if (js > budget) problems.push(`ships ${(js / KB).toFixed(1)} KB of JavaScript (budget ${budget / KB} KB)`);

    if (path === "/apartment/") {
      const bundle = [...modules].map((file) => readText(file)).join("\n");
      if (process.env.PUBLIC_SUPABASE_URL && !bundle.includes(process.env.PUBLIC_SUPABASE_URL)) {
        problems.push("Supabase URL not in the apartment bundle; built without env vars, so the size is not real");
      }
    }

    if (problems.length) fail(`page ${path}`, [...new Set(problems)].join("; "));
  }

  // home, /kit/, disclosure, privacy, 404, admin, the calendar if on, one per category in use, one per published entry
  const categoriesInUse = new Set(published.map((p) => p.category)).size;
  const expected = 6 + (site.features.apartment ? 1 : 0) + categoriesInUse + published.length;
  const hasApartment = htmlFiles.some((file) => route(file) === "/apartment/");
  if (hasApartment !== site.features.apartment) {
    fail("apartment", `calendar is switched ${site.features.apartment ? "on" : "off"} but /apartment/ was ${hasApartment ? "" : "not "}built`);
  }
  const pages = htmlFiles.length;
  if (pages !== expected) warn("pages", `${pages} HTML pages built, expected ${expected}`);
  pass("pages", `${pages} HTML pages, ${amazonLinks} Amazon links`);

  const kb = (bytes: number) => `${(bytes / KB).toFixed(1)} KB`;
  const zeroJs = Object.entries(jsByRoute).filter(([path]) => !["/kit/", "/apartment/", "/admin/"].includes(path));
  pass(
    "javascript",
    `catalogue pages max ${kb(Math.max(0, ...zeroJs.map(([, n]) => n)))}, /kit/ ${kb(jsByRoute["/kit/"] ?? 0)}` +
      (site.features.apartment ? `, /apartment/ ${kb(jsByRoute["/apartment/"] ?? 0)}` : "") +
      " (gzip)",
  );

  const fonts = files.filter((f) => f.endsWith(".woff2"));
  const fontBytes = fonts.reduce((sum, f) => sum + gz(readFileSync(f)), 0);
  if (fontBytes > BUDGETS.fonts) fail("fonts", `${kb(fontBytes)} of fonts (budget ${kb(BUDGETS.fonts)})`);
  else pass("fonts", `${fonts.length} files, ${kb(fontBytes)}`);
  const css = files.filter((f) => f.endsWith(".css")).map(readText).join("\n") + htmlFiles.map(readText).join("\n");
  if (/fonts\.(googleapis|gstatic)\.com/.test(css)) fail("fonts", "loads Google Fonts from Google's servers (GDPR); self-host them");

  const robots = join(DIST, "robots.txt");
  if (!existsSync(robots) || !/Sitemap:/.test(readText(robots))) fail("robots", "robots.txt missing or has no Sitemap line");
  const sitemaps = files.filter((f) => /sitemap-\d+\.xml$/.test(f)).map(readText).join("\n");
  if (!existsSync(join(DIST, "sitemap-index.xml"))) fail("sitemap", "sitemap-index.xml missing");
  else if (/\/(apartment|admin|api)\//.test(sitemaps)) fail("sitemap", "sitemap lists a private page");
  else pass("sitemap");

  // The admin: its editor, its generated config, and the sign-in endpoints.
  const adminProblems = [
    !existsSync(join(DIST, "admin/cms/sveltia-cms.js")) && "editor bundle missing from /admin/cms/",
    !existsSync(join(DIST, "admin/config.yml")) && "/admin/config.yml missing",
  ].filter(Boolean);
  if (existsSync(join(DIST, "admin/config.yml"))) {
    const config = parseYaml(readText(join(DIST, "admin/config.yml"))) as { backend?: { repo?: string } };
    if (config.backend?.repo !== site.admin.repo) adminProblems.push("admin config points at the wrong repository");
  }
  if (adminProblems.length) fail("admin", adminProblems.join("; "));
  else pass("admin", `/admin/ edits ${site.admin.repo}`);

  // vercel.json's headers, copied into the Build Output by scripts/vercel-headers.ts.
  const routing = JSON.parse(readText(join(OUTPUT, "config.json"))) as { routes: { src?: string; headers?: Record<string, string> }[] };
  const header = (path: string, key: string) =>
    routing.routes.find((r) => r.src && new RegExp(r.src).test(path) && r.headers && key in r.headers)?.headers?.[key];
  const headerProblems = [
    !/noindex/.test(header("/admin/", "X-Robots-Tag") ?? "") && "no noindex header on /admin/",
    header("/", "X-Content-Type-Options") !== "nosniff" && "no nosniff header",
    header("/", "Referrer-Policy") !== "strict-origin-when-cross-origin" && "Referrer-Policy isn't strict-origin-when-cross-origin",
  ].filter(Boolean);
  if (headerProblems.length) fail("headers", `${headerProblems.join("; ")} (run scripts/vercel-headers.ts after astro build)`);
  else pass("headers");
}

// --------------------------------------------------------------------- report

const line = "─".repeat(64);
console.log(`\nPreflight · ${site.identity.name} · affiliate ${site.affiliate.enabled ? `ON (${site.affiliate.tag})` : "OFF"}\n${line}`);
for (const p of passes) console.log(`  ok    ${p}`);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log(line);
if (failures.length) {
  console.log(`${failures.length} failure${failures.length === 1 ? "" : "s"}. Not ready to deploy.\n`);
  process.exit(1);
}
console.log(`All checks passed${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? "" : "s"})` : ""}. Ready to deploy.\n`);
