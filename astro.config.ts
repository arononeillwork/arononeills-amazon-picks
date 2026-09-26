import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import { profileName, profiles } from "./src/config/active";

// .env is only read by Vite for source files; the config needs it too.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env (e.g. on Vercel, where the variables are already in process.env).
}

const site = profiles[profileName(process.env.SITE_PROFILE)].site;

export default defineConfig({
  site: site.identity.url,
  output: "static",
  trailingSlash: "always",
  // Prefetch comes from a Speculation Rules block in Base.astro, which costs no JavaScript.
  prefetch: false,
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/apartment/"),
    }),
  ],
});
