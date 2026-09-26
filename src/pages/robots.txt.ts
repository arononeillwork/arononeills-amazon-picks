import type { APIRoute } from "astro";

// /apartment/ is not disallowed here on purpose: crawlers must be able to
// fetch it to see its noindex (meta tag and X-Robots-Tag header in vercel.json).
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
