import type { Catalogue } from "../../config/schema";

export const catalogue = {
  categories: [
    {
      slug: "on-your-feet",
      name: "On your feet",
      intro: "What gets you through ten hours on a hard floor: shoes, insoles, socks, the mat behind the counter and a band that counts the steps.",
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
      slug: "quiet",
      name: "Peace and quiet",
      intro: "For loud shifts, noisy commutes and switching off afterwards: earplugs and headphones that turn the world down.",
      tone: "teal",
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
