import type { SiteConfig } from "../../config/schema";

/**
 * Aron's profile. Validated by siteSchema at build.
 * `legal` must be real before launch; the preflight refuses placeholders.
 */
export const site = {
  identity: {
    name: "arononeillspicks",
    // Aron to confirm: "Aron" or "Aron O'Neill".
    masthead: "Aron O'Neill",
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
  legal: {
    fullName: "Aron O'Neill",
    nif: "PLACEHOLDER",
    address: "PLACEHOLDER postal address",
    email: "placeholder@example.com",
  },
  social: [],
  palette: {
    light: {
      bg: "#faf7f2",
      surface: "#ffffff",
      text: "#2b221d",
      muted: "#6a5d54",
      line: "#e4dacf",
      accent: "#a8481f",
      accentText: "#ffffff",
      focus: "#1f5fa8",
    },
    dark: {
      bg: "#161210",
      surface: "#201a17",
      text: "#f1e9e1",
      muted: "#b5a79b",
      line: "#3a302a",
      accent: "#e8905f",
      accentText: "#1a110c",
      focus: "#8cb8ff",
    },
  },
  features: {
    // The friends' calendar. Off for launch; switch on once the Supabase hook,
    // URL configuration and SMTP are set up (docs/BRIEF.md, Phase 2).
    apartment: false,
  },
  affiliate: {
    enabled: false,
    marketplace: "www.amazon.es",
    tag: "",
    linkDisclosure: "Affiliate link: I earn a commission if you buy through it, at no extra cost to you.",
    // Replace with the exact wording Associates Central shows once the account exists.
    sitewideStatement: [
      "As an Amazon Associate I earn from qualifying purchases.",
      "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.",
    ],
  },
} satisfies SiteConfig;
