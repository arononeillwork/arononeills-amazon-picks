/**
 * All non-entry copy for Aron's profile. Entries live in ./kit/*.md.
 * Sections are rendered as <h2> + paragraphs. Keep claims factual: the
 * privacy text must match what the site actually does.
 */

export interface Section {
  heading: string;
  paragraphs: string[];
}

export const copy = {
  home: {
    title: "Kit for long days on your feet",
    lead: "Recommendations for people who stand, lift and carry for a living: café and kitchen staff, shop floors, anyone whose day ends with sore feet.",
    categoriesHeading: "Browse by what you need",
    allLink: "See everything in one list",
    featuredHeading: "Start here",
  },
  kit: {
    title: "Everything, in one list",
    lead: "Every recommendation on the site. Filter by what it's for or by the situation you're in.",
    filterCategory: "What it's for",
    filterTag: "Situation",
    allCategories: "Everything",
    allTags: "Any situation",
    empty: "Nothing matches both of those yet. Try a different combination.",
    clear: "Show everything",
  },
  entry: {
    owned: "I own and use this",
    researched: "Researched, not owned",
    researchedNote:
      "I haven't used this one myself. It's here because it meets the criteria below, based on the manufacturer's specifications and widely reported experience.",
    drawbackHeading: "The honest drawback",
    healthHeading: "Before you buy",
    healthLead:
      "This describes experience and research, not medical advice. Nothing here treats, cures or prevents any condition.",
    reviewed: "Last checked",
    buyLabel: "View on Amazon.es",
    untaggedNote: "Opens Amazon.es in a new tab.",
    picksHeading: "Three picks, by use",
  },
  disclosure: {
    title: "How this site is paid for",
    affiliateOn: [
      {
        heading: "Affiliate links",
        paragraphs: [
          "Buy buttons on this site are Amazon.es affiliate links. If you buy through one, Amazon pays me a commission. You pay the same price either way.",
          "Every affiliate link has a note directly above it saying so, and the statement required by the Amazon Associates programme is in the footer of every page.",
        ],
      },
    ] satisfies Section[],
    affiliateOff: [
      {
        heading: "Affiliate links",
        paragraphs: [
          "At the moment the buttons on this site are ordinary links to Amazon.es, and I earn nothing from them. I intend to join the Amazon Associates programme; when I do, this page and every buy button will say so.",
        ],
      },
    ] satisfies Section[],
    always: [
      {
        heading: "What I don't do",
        paragraphs: [
          "No brand pays to be listed here. There are no prices on the site, because they change daily; Amazon.es shows the current one.",
          "Photos, when there are any, are my own. I don't copy Amazon's product images or its customer reviews.",
        ],
      },
      {
        heading: "Owned or researched",
        paragraphs: [
          "Each entry says whether I own and use the product or have only researched it. Researched entries are based on the manufacturer's specifications and on weaknesses widely reported by owners, which I paraphrase rather than quote. Every entry has an honest drawback.",
        ],
      },
      {
        heading: "Health products",
        paragraphs: [
          "Some products here, like compression socks or a TENS unit, touch on health. I describe my experience or my research, never treatment. If you have a medical condition, are pregnant, or aren't sure a product suits you, ask a doctor or pharmacist first.",
        ],
      },
    ] satisfies Section[],
  },
  privacy: {
    title: "Privacy",
    lead: "This site collects as little as possible. There are no cookies on the public pages, no analytics and no tracking scripts.",
    controllerHeading: "Who is responsible",
    controllerLead:
      "The data controller, and the owner of this website for the purposes of Spain's Ley 34/2002 (LSSI-CE), is:",
    sections: [
      {
        heading: "Browsing the site",
        paragraphs: [
          "The catalogue pages are static files. They set no cookies and run no analytics. Fonts are served from this site, not from Google or any other third party.",
          "The site is hosted by Vercel Inc., which processes standard request data (IP address, browser, the page requested) in server logs to deliver pages and protect against abuse. Vercel acts as my processor under its data processing agreement, which covers transfers outside the EU.",
        ],
      },
      {
        heading: "Links to Amazon.es",
        paragraphs: [
          "When you follow a link to Amazon.es, Amazon receives this site's address as the referrer and handles everything from then on under its own privacy notice and cookie settings. I never learn who you are or what you bought; Amazon only reports aggregate, anonymous sales totals to affiliates.",
        ],
      },
      {
        heading: "The friends' calendar",
        paragraphs: [
          "The apartment page is private and only works for people I have personally invited. For them it stores their email address and name, the dates they ask for, and any message they add. It's used for one purpose: arranging free stays between friends.",
          "The data is held by Supabase Inc., acting as my processor, in its Paris (EU) region. Signing in stores a session token in your browser's local storage so you stay signed in; it is not used for anything else. Sign-in emails are sent by Supabase.",
          "The legal basis is my legitimate interest in organising stays with friends who ask for them. Requests are kept only while they're useful for arranging stays. Ask me and I'll delete your invitation and everything linked to it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask to see, correct or delete your data, to restrict or object to its use, or to receive a copy, by emailing the address above. If you're unhappy with my reply you can complain to the Agencia Española de Protección de Datos (aepd.es).",
        ],
      },
    ] satisfies Section[],
  },
  apartment: {
    title: "The apartment",
    lead: "For friends only. If I've invited you, sign in with your email to see which dates are free and ask for a stay. It's free: no money ever changes hands.",
    emailLabel: "Your email",
    send: "Email me a sign-in link",
    sent: "If that address has been invited, a sign-in link is on its way. It can take a minute; check spam too.",
    notInvited: "This account isn't on the guest list. If you think it should be, ask Aron.",
  },
  notFound: {
    title: "Page not found",
    lead: "That page doesn't exist, or it moved.",
    home: "Go to the home page",
    all: "Browse everything",
  },
};
