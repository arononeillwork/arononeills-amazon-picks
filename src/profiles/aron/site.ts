import type { SiteConfig } from "../../config/schema";
// Edited from the admin (/admin/ → Amazon Associates), so it lives in JSON rather than here.
import affiliate from "./affiliate.json";

/**
 * Aron's profile. Validated by siteSchema at build.
 * `legal` must be real before launch; the preflight refuses placeholders.
 */
export const site = {
  identity: {
    name: "arononeillspicks",
    // Aron to confirm: "Aron" or "Aron O'Neill".
    // Aron asked for "Aron's Amazon Picks" (28 September 2026); Amazon's trademark rules forbid
    // "Amazon" in an Associate's site name, so the masthead drops that word.
    masthead: "Aron's Picks",
    url: "https://arononeillspicks.vercel.app",
    tagline: "Kit for long days on your feet",
    description:
      "Practical recommendations for people who stand, lift and carry all day, from someone who runs a café and works ten-hour shifts.",
    lang: "en",
    locale: "en_GB",
  },
  owner: {
    name: "Aron O'Neill",
    about:
      "I run a specialty café in San Pedro de Alcántara and spend around ten hours a day on my feet. This site collects kit for days like that. Every entry says plainly whether I own and use it, or have only researched it.",
  },
  // The café company runs the site and holds the Associates account (Aron's
  // decision, 28 September 2026). The site itself stays under Aron's name and
  // doesn't link to the café; only this legal notice names the company.
  legal: {
    // Registered as "Easy Beans Coffee" (Aron, 28 September 2026). The legal form is part of an
    // S.L.'s registered name (Ley de Sociedades de Capital, art. 6), and B-prefixed NIFs are S.L.s.
    legalName: "Easy Beans Coffee, S.L.",
    nif: "B27576347",
    // Confirmed by Aron as the registered address, 28 September 2026.
    address: "C. Pizarro, 8, 29670 San Pedro de Alcántara, Málaga",
    email: "easybeanscafe@gmail.com",
    // Still to add from the escritura, e.g. "Registro Mercantil de Málaga, tomo 1234, folio 56, hoja MA-78901".
    // The preflight warns until it's here; the privacy page shows it once set.
  },
  social: [],
  // Apple-like: white and near-black pages, light grey tiles, Apple's blues.
  palette: {
    light: {
      bg: "#ffffff",
      surface: "#f5f5f7",
      text: "#1d1d1f",
      muted: "#6e6e73",
      line: "#d2d2d7",
      accent: "#0066cc",
      button: "#0071e3",
      accentText: "#ffffff",
      focus: "#0071e3",
    },
    dark: {
      bg: "#000000",
      surface: "#1d1d1f",
      text: "#f5f5f7",
      muted: "#a1a1a6",
      line: "#424245",
      accent: "#2997ff",
      button: "#0071e3",
      accentText: "#ffffff",
      focus: "#2997ff",
    },
  },
  features: {
    // The friends' calendar. Off for launch; switch on once the Supabase hook,
    // URL configuration and SMTP are set up (docs/BRIEF.md, Phase 2).
    apartment: false,
  },
  admin: {
    repo: "arononeillwork/arononeills-amazon-picks",
  },
  affiliate: {
    marketplace: "www.amazon.es",
    // enabled, tag, linkDisclosure and sitewideStatement (the exact wording Associates Central shows).
    ...affiliate,
  },
} satisfies SiteConfig;
