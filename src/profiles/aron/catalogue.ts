import type { Catalogue } from "../../config/schema";

export const catalogue = {
  categories: [
    {
      slug: "on-your-feet",
      name: "On your feet",
      intro: "What sits between you and a hard floor for ten hours: shoes, insoles, socks and the mat behind the counter.",
      tone: "blue",
    },
    {
      slug: "recovery",
      name: "Recovery",
      intro: "For the evening after a long shift, when your legs, feet and back want looking after.",
      tone: "green",
    },
    {
      slug: "carry",
      name: "Carry and charge",
      intro: "Getting to work and through the day: a bag, a bottle, power for your phone and a laptop for the admin.",
      tone: "orange",
    },
    {
      slug: "at-home",
      name: "At home",
      intro: "For the hours either side of a shift: proper espresso in your own kitchen, dinner without standing at the hob, and one place to charge everything.",
      tone: "purple",
    },
    {
      slug: "sun",
      name: "Out in the sun",
      intro: "For terrace shifts, commutes and days off under the Andalusian sun.",
      tone: "yellow",
    },
  ],
  tags: [
    { slug: "long-shifts", name: "Long shifts" },
    { slug: "after-work", name: "After work" },
    { slug: "commute", name: "The commute" },
    { slug: "travel", name: "Travel" },
    { slug: "at-home", name: "At home" },
  ],
} satisfies Catalogue;
