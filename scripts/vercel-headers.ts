/**
 * Copies the `headers` from vercel.json into the adapter's Build Output
 * (.vercel/output/config.json). @astrojs/vercel writes its own routing config
 * and doesn't carry vercel.json's headers across, so without this step the
 * security headers and the noindex header on /admin/ would silently be lost.
 * Runs after `astro build` as part of `npm run preflight`, which re-checks them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { getTransformedRoutes } from "@vercel/routing-utils";

const CONFIG = ".vercel/output/config.json";
const vercelJson = JSON.parse(readFileSync("vercel.json", "utf8"));
const output = JSON.parse(readFileSync(CONFIG, "utf8")) as { routes: Record<string, unknown>[] };

const { routes, error } = getTransformedRoutes({ headers: vercelJson.headers ?? [] });
if (error || !routes) throw new Error(`vercel.json headers: ${error?.message ?? "no routes"}`);

// Header routes carry `continue: true`, so they go first and every later route still applies.
// Dropping exact copies keeps a second run from duplicating them.
const added = new Set(routes.map((route) => JSON.stringify(route)));
output.routes = [...routes, ...output.routes.filter((route) => !added.has(JSON.stringify(route)))];
writeFileSync(CONFIG, JSON.stringify(output, null, 2));
console.log(`vercel-headers: ${routes.length} header routes written to ${CONFIG}`);
