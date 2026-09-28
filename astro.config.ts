import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineConfig, envField } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { profileName, profiles } from "./src/config/active";

// .env is only read by Vite for source files; the config needs it too.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env (e.g. on Vercel, where the variables are already in process.env).
}

const site = profiles[profileName(process.env.SITE_PROFILE)].site;
const require = createRequire(import.meta.url);

/** Pages that are for Aron, not the public: kept out of the sitemap and prefetching. */
const PRIVATE = ["/apartment/", "/admin/", "/api/"];

export default defineConfig({
  site: site.identity.url,
  // Every public page is prerendered static HTML. The adapter is only there for
  // the two admin sign-in endpoints in src/pages/api/, which opt out of prerendering.
  output: "static",
  adapter: vercel(),
  trailingSlash: "always",
  // Prefetch comes from a Speculation Rules block in Base.astro, which costs no JavaScript.
  prefetch: false,
  env: {
    schema: {
      // A GitHub OAuth app for "Sign in with GitHub" on /admin/. Optional: without
      // them the admin still works with "Sign in with token". See docs/ADMIN.md.
      GITHUB_OAUTH_CLIENT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      GITHUB_OAUTH_CLIENT_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  integrations: [
    // Preact only powers the calendar island; without it no client runtime is bundled.
    ...(site.features.apartment ? [preact()] : []),
    {
      // The friends' calendar is optional per profile (features.apartment).
      name: "apartment-calendar",
      hooks: {
        "astro:config:setup": ({ injectRoute }) => {
          if (site.features.apartment) {
            injectRoute({ pattern: "/apartment", entrypoint: "./src/routes/apartment.astro" });
          }
        },
      },
    },
    {
      // The admin editor (Sveltia CMS) is self-hosted from node_modules rather than
      // a CDN, so its version is pinned by the lockfile. Copied into public/admin/cms/
      // (gitignored) before every dev or build run.
      name: "admin-editor",
      hooks: {
        "astro:config:setup": () => {
          // The package only exports its npm entry (npm/index.js); dist/ sits beside it.
          const dist = join(dirname(require.resolve("@sveltia/cms")), "..", "dist");
          // The browser build is sveltia-cms.js plus chunks/, which it loads relative to itself.
          cpSync(dist, "public/admin/cms", { recursive: true, filter: (path) => !/\.(map|mjs)$/.test(path) });
        },
      },
    },
    sitemap({
      filter: (page) => !PRIVATE.some((prefix) => new URL(page).pathname.startsWith(prefix)),
    }),
  ],
});
