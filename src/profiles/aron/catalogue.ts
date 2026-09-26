import type { Catalogue } from "../../config/schema";

export const catalogue = {
  categories: [
    {
      slug: "on-your-feet",
      name: "On your feet",
      intro: "What sits between you and a hard floor for ten hours: shoes, insoles, socks and the mat behind the counter.",
    },
    {
      slug: "recovery",
      name: "Recovery",
      intro: "For the evening after a long shift, when your legs, feet and back want looking after.",
    },
    {
      slug: "carry",
      name: "Carry and charge",
      intro: "Getting to work and through the day: a bag, a bottle, power for your phone and a laptop for the admin.",
    },
  ],
  tags: [
    { slug: "long-shifts", name: "Long shifts" },
    { slug: "after-work", name: "After work" },
    { slug: "commute", name: "The commute" },
    { slug: "travel", name: "Travel" },
  ],
} satisfies Catalogue;
