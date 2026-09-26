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
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/apartment/"),
    }),
  ],
});
