# Build brief: arononeillspicks

Status as of 28 September 2026. Owner: Aron O'Neill. Operator and Associates account holder: the café company (NIF `B27576347`).

This brief records what exists, what has been verified, the rules the site must never break, and the remaining work in order. Read all of it before changing anything; several sections exist because something went wrong once already.

> **Rebuild note, 26 September 2026.** The original project archive from the claude.ai planning session never reached this repository (GitHub and Drive were both empty). The site was rebuilt from this brief in Claude Code. `supabase/schema.sql` and `supabase/tests/access.sql` were reconstructed from the live database and verified against it (§3). The twelve products were re-chosen, because the original drafts were lost with the archive.

## 1. What this is

A static website that recommends products for people with long, physical working days, monetised through Amazon Associates (Amazon.es). Aron runs a specialty café in San Pedro de Alcántara and stands for ten hours a day; that experience is the site's credibility. Alongside the public catalogue sits a private, friends-only calendar where invited friends request free stays at Aron's apartment.

Nothing is sold directly. There is no checkout, no stock and no Stripe. Visitors click through to Amazon, Amazon handles the sale, and Amazon pays a commission.

The goal for launch is a site that passes Amazon's review: at least ten genuine, substantial entries, compliant disclosures, and three qualifying sales from people outside Aron's circle within 180 days of signing up.

## 2. Settled decisions

| Area | Decision |
| --- | --- |
| Business model | Amazon affiliate recommendations only |
| Framework | Astro 7. Every public page is prerendered static HTML; the `@astrojs/vercel` adapter exists only for the two admin sign-in endpoints (`/api/auth/`, `/api/callback/`) |
| Admin | Sveltia CMS at `/admin/`, self-hosted. Edits products and the Associates settings as commits to the GitHub repo; see `docs/ADMIN.md` |
| Hosting | Vercel Pro ($20/month, from launch), connected to the GitHub repo. Every push, including every admin save, builds with `npm run preflight`; a failing gate fails the deployment and the live site stays on the last good version |
| Address | `https://arononeillspicks.vercel.app`. No custom domain |
| Marketplace | Amazon.es |
| Associates account | **The café company** (Easy Beans, NIF `B27576347`) runs the site and holds the Associates account. Aron's decision, 28 September 2026, replacing the earlier persona física plan |
| Café separation | The site stays under Aron's name at `arononeillspicks.vercel.app` and doesn't link to the café or its domain. Only the legal notice on `/privacy/` names the company, because LSSI-CE requires it |
| Database | Supabase project `arononeillspicks`, used only by the apartment calendar |
| Auth | Magic link, implicit flow; allowlist enforced by a sign-up hook and Postgres RLS |
| Apartment | Free use by invited friends. No money ever changes hands. **Switched off for launch** (`features.apartment: false`); the code, database and tests stay ready |
| Catalogue | 18 products in 5 categories (Aron added six and replaced the TENS pick, 28 September 2026) |
| Catalogue shape | Category landing pages plus one filterable list of everything |
| Language | English (for the expat audience) unless the owner decides otherwise |
| Deployment rule | Nothing deploys until the owner explicitly says so and the preflight passes |
| Drafts | `draft: true` entries show in `npm run dev` but never ship; production builds leave them out |

## 3. Current state

### Built and verified

A production build contains home, `/kit/` (filterable list), one page per category that has a published entry, one page per published entry, `/disclosure/`, `/privacy/` and `/404`, plus `robots.txt` and a sitemap. `/apartment/` is only built while the calendar is switched on. With the calendar off and the eight entries published so far, that is 18 pages and 16 Amazon links; with all eighteen published it will be 29 pages and 37 links. `astro check` reports 0 errors, 0 warnings, 0 hints.

With the calendar off, the build ships no JavaScript except the 0.6 KB `/kit/` filter: `astro.config.ts` only loads Preact and injects `src/routes/apartment.astro` when `features.apartment` is true, and the privacy page only describes Supabase processing while the calendar exists.

Catalogue (category → entries):

| Category | Slug | Entries |
| --- | --- | --- |
| On your feet | `on-your-feet` | anti-fatigue-mat, compression-socks, insoles, work-shoes |
| Recovery | `recovery` | **tens-unit**, massage-gun, foam-roller, foot-massage-ball |
| Carry and charge | `carry` | **power-bank**, laptop (three picks), water-bottle, work-backpack |
| At home | `at-home` | **espresso-machine**, **coffee-canister**, **multi-cooker**, **usb-power-strip** |
| Out in the sun | `sun` | **sunscreen**, **face-sunscreen** |

Bold entries are published (8 of 18, 28 September 2026). Aron chose the six new products and the iWarmbase TENS unit himself and opened their amazon.es links; they were written as researched entries and published the same day. The TENS entry was switched from an owned draft (waiting for Aron's words) to a researched entry for the iWarmbase unit; if it is the one he uses, his words turn it back into an owned entry (the old prompts are in git history). Each category has a colour tone (`tone` in `catalogue.ts`).

Situation tags: `long-shifts`, `after-work`, `commute`, `travel`, `at-home`.

Performance, measured by the preflight from the build with env vars set:

| Page | JavaScript (gzip) | Budget |
| --- | --- | --- |
| Home, category, product entry | 0 KB | 0 KB |
| `/kit/` | 0.6 KB | 3 KB |
| `/apartment/` | 39.0 KB | 60 KB |
| Fonts, all pages, downloaded once (not at all on Apple devices) | 47.1 KB | 55 KB |

Design (28 September 2026, at Aron's request, modelled on the Apple Store and Chamberlain Coffee's shop pages): the system font stack puts San Francisco first, so Apple devices use their built-in font; everyone else gets Inter (variable, Latin subset, self-hosted from `src/assets/fonts/`). Short two-tone headlines, a row of category buttons, a "latest" shelf that swipes sideways on phones, and product cards that lead with a big picture on the category's soft colour. Product pages open with the picture, two to four "at a glance" facts (`highlights`), the buy button and the honest drawback; the write-up folds into tap-to-open panels (native `<details>`, no JavaScript) and the health note is open by default.

Pictures: Aron's own photo when an entry has one (`image`, uploaded in the admin, stored in `kit/images/`, served as AVIF/WebP in three sizes by `<Picture>`), otherwise a flat drawing of that kind of product (`src/components/art.ts`, inline SVG, labelled "Illustration" on the product page), otherwise the category icon. Amazon's product photos are never used; the preflight rejects remote or Amazon images.

Lighthouse (mobile, production build, 28 September 2026, after the store redesign): 100 performance, accessibility, best practices and SEO on home, `/kit/`, a category page and two product pages, CLS 0.

Palette contrast (WCAG AA): every text/background pair is at least 4.66:1 in light mode and 4.70:1 in dark mode (the lowest is white on the Apple-blue button).

Amazon links: two buy blocks on each single-product entry (under the facts, and after the details), three on the laptop. Each carries `rel="sponsored nofollow noopener"` and is untagged while affiliate is switched off.

### Live infrastructure

**Supabase** project `arononeillspicks`, ref `zmxkwaedfiqepyfywtbe`, region `eu-west-3` (Paris), free plan, $0/month. The org has four other projects; the free plan allows two active.

`supabase/schema.sql` was reconstructed from the live catalog on 26 September 2026 and diffed section by section against it (columns, constraints, indexes, policies, function bodies, grants). It matches, and re-running it is a no-op. `supabase/tests/access.sql` passes 17 of 17 against the live project inside a rolled-back transaction, leaving no rows. Both advisors report zero issues.

Owner row seeded: `arononeillwork@gmail.com`, `is_owner = true` (Aron to confirm this is the address he'll sign in with).

`.env.example` holds the project URL and publishable key. Both are public by design.

**Vercel:** project `arononeillspicks` (`prj_RG44QB2E9D7wF5WjkCpfiUpZ3hPo`) in the account's default team (`team_WjsRqvOQ7M59VPC8TZyiyIuF`), connected to `arononeillwork/arononeills-amazon-picks`. Framework Astro, build command `npm run preflight`, Node 24.x, env `SITE_PROFILE=aron`. Vercel Authentication covers previews only; production is public. First production deployment (`dpl_6TojmXHyAUBZnbwUvRbzeZQsgYVs`, commit `fbbb6bd`) went READY on 28 September 2026 at **https://arononeillspicks.vercel.app**. Aron reports the account is on Pro; the Vercel connector couldn't confirm it (it isn't authorised for the team scope, which also blocks build logs and fetching the live site).

**Network note:** the Claude Code cloud container that did the rebuild could not reach amazon.es, vercel.app or supabase.co directly (egress policy), so live checks happen from Aron's browser or after deploy.

### Not done

- Legal details: Easy Beans Coffee, S.L., NIF `B27576347`, C. Pizarro, 8, 29670 San Pedro de Alcántara, easybeanscafe@gmail.com (all confirmed by Aron, 28 September 2026). Still missing: the Registro Mercantil entry (tomo, folio, hoja) from the escritura, which LSSI-CE art. 10.1.b expects on a company's legal notice. The preflight warns until `legal.registry` is set; the privacy page shows it once it is
- If the iWarmbase is the TENS unit Aron uses, two or three lines from him turn that entry into an owned one
- Ten researched entries (the original picks other than the power bank) are written and pass every content check but stay `draft: true` until Aron opens their amazon.es links with `docs/ASIN-CHECK.md`; backups and sources are in `docs/research/2026-09-26-products.md`
- No product has Aron's own photo yet; every entry shows its drawing
- Calendar (deferred): the Supabase sign-up hook, URL configuration and SMTP are not yet set in the dashboard, and the live magic-link round trip has never been tested. None of this blocks launch while `features.apartment` is false

## 4. Repository map

```
CLAUDE.md                    standing rules; imports this brief
docs/BRIEF.md                this file
astro.config.ts              static output, trailingSlash: "always", sitemap excludes /apartment;
                             injects the calendar route and Preact only when features.apartment is on
vercel.json                  trailing slashes, immutable asset caching, noindex header on /apartment
package.json                 scripts: dev, build, preview, check, preflight; Node >= 22.12
.env.example                 SITE_PROFILE, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY
scripts/preflight.ts         the deploy gate (reads .vercel/output, where the adapter writes what Vercel serves)
scripts/vercel-headers.ts    copies vercel.json headers into .vercel/output/config.json (the adapter drops them)
docs/ADMIN.md                how Aron uses the admin, and its one-time sign-in setup
supabase/schema.sql          matches the live database; safe to re-run
supabase/tests/access.sql    17-case access-control test
public/favicon.svg
src/
  content.config.ts          product collection and its zod schema
  env.d.ts                   import.meta.env types
  assets/fonts/              self-hosted woff2 files and their OFL licences
  config/
    schema.ts                site config schema; rejects "amazon" in names and URLs
    active.ts                profile registry; SITE_PROFILE selects one
    theme.ts                 palette to CSS variables
  profiles/aron/
    site.ts                  identity, legal, palette, features, admin repo
    affiliate.json           Associates switch, tracking ID and disclosures (edited from the admin)
    catalogue.ts             5 categories (each with a colour tone), 5 situation tags
    copy.ts                  all non-entry copy
    kit/*.md                 one file per product; filename is the URL slug
    kit/images/              Aron's own product photos, uploaded from the admin
  lib/
    amazon.ts                the only place an Amazon URL is built
    kit.ts                   loads and orders entries (drafts left out of production); entry URLs
    supabase.ts              auth-js + postgrest-js clients
    github-oauth.ts          shared pieces of the admin's "Sign in with GitHub" popup flow
  layouts/Base.astro         head, theme injection, speculation rules, nav, footer
  components/
    ProductCard.astro        product card; links to the entry, never to Amazon
    ProductArt.astro         the picture: own photo, else drawing, else category icon
    art.ts                   the product drawings (inline SVG, coloured by category tone)
    Icon.astro               inline line icons (categories and the home page)
    BuyBlock.astro           disclosure line + Amazon button
    PicksBlock.astro         multi-option entries (the laptop)
    Apartment.tsx            Preact island: sign-in, calendar, requests, owner actions
    apartment.css            calendar styles, bundled on /apartment/ only
  pages/                     index, kit/, kit/[category]/, kit/[category]/[product],
                             disclosure, privacy, 404, robots.txt
  pages/admin/               the admin page and its generated config.yml
  pages/api/                 auth.ts and callback.ts, the only on-demand (server) routes
  routes/apartment.astro     the calendar page, injected only when features.apartment is on
  styles/global.css
```

### Entry frontmatter

```yaml
title: "Headline naming the need"   # <= 70 chars, no "Amazon"
product: "Brand Model"               # no "Amazon"
category: on-your-feet               # a catalogue.ts slug
tags: [long-shifts, after-work]      # 1-3 catalogue.ts tag slugs
summary: "<= 160 chars"
highlights: ["<= 44 chars", ...]     # optional, 2-4 short facts beside the buy button
image: ./images/photo.webp           # optional, Aron's own photo (the admin uploads it)
experience: owned | researched
asin: B0XXXXXXXX                     # or `picks:` (exactly three: label, product, asin, why)
drawback: "honest, specific"
health: false                        # true requires healthNote
healthNote: "manufacturer contraindications"
order: 1                             # position within the category
reviewed: 2026-09-26
draft: true | false
```

## 5. Rules that must never break

### Amazon Associates

- "Amazon", "amzn" or any variant never appears in the site name, title, URL, subdomain or social handles. `src/config/schema.ts` and `src/content.config.ts` enforce this at build; the preflight re-checks every built `<title>` and internal URL
- Every Amazon link is built by `src/lib/amazon.ts`. No shorteners, no redirects through the site, no cloaking
- Every affiliate link sits inside a `data-affiliate-block` with a link-level disclosure directly above it, and the sitewide statement appears in the footer of every page. The preflight checks both
- No prices anywhere, in text or filters. Amazon only allows prices pulled live from its Product Advertising API
- No Amazon product images, and no copied Amazon customer reviews. Own photos only
- Links keep `noopener` but must not gain `noreferrer`; Amazon may check that clicks come from the registered site. `vercel.json` sets `Referrer-Policy: strict-origin-when-cross-origin`, which sends the site's origin
- Home, category and list pages link to entries, never straight to Amazon, so every affiliate link has its disclosure beside it
- Purchases by the account holder are not eligible: that means the company, both owners, staff, and their friends and family. Never suggest otherwise, never buy café supplies through the site's links, and never put affiliate links in email, PDF, WhatsApp or DMs

### Honesty and health

- Never write first-person experience Aron hasn't given you. Entries marked `experience: owned` describe only what Aron has actually said; use bracketed prompts where his words are missing. The preflight refuses brackets
- `experience: researched` entries say so visibly and never imply personal use. The preflight flags first-person use phrases in researched entries
- Health products describe experience or research, never treatment. No claim that a product treats, cures or prevents a condition. Set `health: true` and give a specific `healthNote` with the manufacturer's contraindications. The preflight flags treatment language in health entries
- Every entry has an honest `drawback`. The schema requires it

### Security

- Row-level security in Postgres is the security boundary. Browser code is not
- Never reintroduce a client-side or anonymous-callable allowlist check. An earlier `is_allowed(email)` function let anyone probe who was invited; it was removed. The `hook_allowlist_signup` sign-up hook refuses uninvited addresses on the server, and the sign-in form shows the same neutral message whatever happens
- The publishable key goes in the `apikey` header only, never as a `Bearer` token; it is not a JWT. `Authorization` carries the user's session token or nothing. The preflight refuses a key that isn't `sb_publishable_…`
- Every database change is a migration applied to the live project **and** mirrored in `supabase/schema.sql`. Afterwards, run both Supabase advisors and `supabase/tests/access.sql`; all must be clean
- The apartment stays free. If anyone ever proposes charging, stop: paid stays need a VFT licence from the Junta de Andalucía

### Performance

- Catalogue pages ship zero JavaScript. Page transitions use CSS `@view-transition`; prefetch uses a Speculation Rules JSON block. Do not add Astro's `ClientRouter`, which ships JavaScript to every page
- Budgets are in the table above. The preflight enforces them

### Privacy

- Fonts stay self-hosted. Loading Google Fonts from Google's servers has been held to breach GDPR
- No analytics or tracking scripts without updating `/privacy/` first
- The privacy page's controller block comes from config and must be real before launch. It doubles as the LSSI-CE identification (name, NIF, address, email)

## 6. Things that already went wrong once

Each of these was found by testing rather than by the build passing. Keep the fixes.

- **The theme never applied.** The inline theme `<style>` lands before the bundled stylesheet, so fallback colours in `:root` overrode the profile palette and dark mode never worked. Fallbacks now live in `:where(:root)`, which has zero specificity. Don't move them back
- **Hidden elements showed.** `.filter { display: grid }` beat the browser's `[hidden]` rule, so dead filter buttons appeared with JavaScript off. `global.css` has `[hidden] { display: none !important; }`
- **A false bundle size.** Building without Supabase env vars makes Vite tree-shake the whole client away; the island measured 9 KB instead of 64 KB. Always measure with env vars set; the preflight fails if they're missing, and checks the Supabase URL is actually in the apartment bundle
- **supabase-js was too heavy.** It pushed `/apartment/` to 64 KB against a 60 KB budget by bundling realtime, storage and function clients. The site uses `@supabase/auth-js` and `@supabase/postgrest-js` directly. Keep their versions in step with each other
- **`astro check` refuses TypeScript 7.** TypeScript is pinned to 6
- **Zod.** Import from `astro/zod`, not `astro:content`. Use `z.email()` and `z.url()`, not the deprecated string methods
- **Images.** Multiple output formats need `<Picture>`, not `<Image>`
- **Invented experience.** The first TENS draft contained made-up details in Aron's voice. They were replaced with prompts. Don't repeat this
- **Implicit auth flow is deliberate.** PKCE fails when a friend requests a link on one device and opens it on another or in a mail app's browser
- **Unused islands still ship.** A page that isn't generated still gets its island bundled if the file sits in `src/pages/`. The calendar lives in `src/routes/` and is injected from `astro.config.ts` so that switching it off really removes it
- **The adapter drops vercel.json headers.** `@astrojs/vercel` writes its own `.vercel/output/config.json` without them; `scripts/vercel-headers.ts` puts them back and the preflight checks they're there
- **The admin editor is 2 MB of JavaScript.** It's copied into `public/admin/cms/` (gitignored) at build; `tsconfig.json` excludes it or `astro check` runs out of memory
- **The project archive never arrived.** The first build lived only in a claude.ai sandbox. Everything now lives in this repository; push after every working session

## 7. The work, in order

Owner tasks are marked **Aron**. Everything else is Claude Code's.

### Phase 0: set up locally

- [x] Project in git, `.env` gitignored, `npm run check` clean
- [x] `npm run preflight` shows only the expected failures

### Phase 1: owner inputs

Ask Aron for anything missing. Don't guess any of it.

- [x] **Aron:** full name (Aron O'Neill)
- [x] **Aron:** who runs the site: the café company, NIF `B27576347`
- [ ] **Aron:** the company's registered name (razón social) and Registro Mercantil entry (tomo, folio, hoja), from the escritura or the company's NIF card; confirm C. Pizarro, 8 is the domicilio social and that easybeanscafe@gmail.com is the contact address to publish
- [ ] **Aron:** confirm `arononeillwork@gmail.com` is the owner address for the calendar (already seeded)
- [ ] **Aron:** which of the twelve products he owns and uses
- [ ] **Aron:** his real TENS experience: how long, how often, what changed. Two or three lines is enough. Plus the brand/model he has
- [ ] **Aron:** masthead name, "Aron" or "Aron O'Neill" (currently "Aron O'Neill")
- [ ] **Aron:** Supabase keep-alive, weekly ping or manual restore (see Phase 7)
- [ ] **Aron:** read the non-entry copy in `src/profiles/aron/copy.ts` (home, disclosure, privacy) and confirm he'd sign it

Acceptance: `legal` has no placeholders, and the owner row exists in the live database.

### Phase 2: Supabase dashboard and live auth (deferred: calendar is off for launch)

Only needed when `features.apartment` is switched back on. The dashboard steps can't be done from Claude Code: no connector exposes Supabase's auth settings.

- [ ] **Aron:** Authentication → Hooks → *Before User Created* → Postgres → schema `public` → `hook_allowlist_signup`. It must be on before launch; without it anyone can create an account (they see nothing, but Supabase emails them)
- [ ] **Aron:** Authentication → URL Configuration. Site URL `https://arononeillspicks.vercel.app`. Redirect URLs `http://localhost:4321/apartment/` and `https://arononeillspicks.vercel.app/apartment/`
- [ ] **Aron:** check Authentication → Emails → SMTP. Supabase's built-in sender is heavily rate-limited and may only deliver to members of the Supabase organisation; if a friend's link never arrives, set up custom SMTP (for example Resend or Brevo)
- [x] Seed the owner
- [ ] Live round trip on localhost with Aron: sign in, request dates, confirm as owner, sign out. Then invite a second address Aron controls and repeat as a friend: request dates, withdraw a request, confirm the friend sees no owner buttons
- [ ] Check an uninvited address: the form shows the neutral message, no email arrives, and no user appears under Authentication → Users

Acceptance: both round trips work, and the uninvited address never gets an account.

### Phase 3: content

For each **researched** entry:

- [x] Choose one specific product sold on Amazon.es that meets the criteria in the entry
- [ ] Record its ASIN from the `/dp/` part of the Amazon.es URL. If Amazon blocks automated fetches, list the candidate ASINs for Aron to confirm by opening `https://www.amazon.es/dp/<ASIN>`; never ship an ASIN nobody has seen resolve
- [x] Body of 200–400 words: what to look for, why this product meets it, who it suits, who should skip it. Researched voice, no personal-use claims, no prices
- [x] Keep `drawback` honest. Paraphrase widely reported weaknesses; don't copy review text
- [ ] Set `reviewed` to the date checked and `draft: false` once the ASIN is confirmed

For **owned** entries, build the body from Aron's own words only, then have him read it and confirm he'd sign his name to it.

The laptop entry needs three picks with real ASINs, framed as use cases, and a review date at most three months old.

Acceptance: `npm run preflight` passes: every published entry passes every check and at least ten are published. Drafts are listed as warnings.

### Phase 4: quality assurance

- [ ] `npm run preflight` passes with zero failures
- [x] `npm run check` is clean
- [x] Lighthouse, mobile: 100 performance on home, `/kit/` and one entry; 95 or more on `/apartment/` (re-run on the live URL after deploy)
- [x] Visual check in light and dark mode at phone and desktop widths
- [x] With JavaScript disabled, the full list shows and the filter is hidden
- [ ] Every entry opened once and read through by a person

### Phase 5: deploy to Vercel

Only after Aron explicitly says to host it.

- [x] **Aron:** upgrade the Vercel account to Pro (done by Aron, 28 September 2026)
- [x] Create project `arononeillspicks` connected to `arononeillwork/arononeills-amazon-picks`. Framework: Astro. Build command: `npm run preflight`. Node 22.x. Env var `SITE_PROFILE=aron` (plus the Supabase pair once the calendar is on). If Vercel's GitHub app can't see the repo, **Aron** grants it access in GitHub → Settings → Applications → Vercel
- [ ] The production branch is the repo's default branch (currently `claude/sharp-heisenberg-mtevsr`); the admin commits there
- [x] Vercel Authentication set to previews only, so production is public
- [ ] **Aron:** confirm https://arononeillspicks.vercel.app loads in a private browser window (the build container can't reach vercel.app)
- [ ] If Vercel assigns a different address because the name is taken, update `identity.url` in `site.ts`, the admin OAuth callback URL, and the Supabase URL configuration, then redeploy before anything is registered with Amazon
- [ ] **Aron:** set up admin sign-in (`docs/ADMIN.md`): a GitHub OAuth app plus `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET` in Vercel, or a fine-grained token
- [ ] **Aron:** in the admin, check each product's Amazon.es link and publish it (at least ten before Phase 6)
- [ ] Smoke test live: every route, the filter, the 404, `robots.txt`, `sitemap-index.xml`, `/admin/` and the sign-in popup (and the apartment round trip from Phase 2 once the calendar is on)

The first deploy goes out with `affiliate.enabled: false`. Links are untagged and link-level disclosures are replaced by a neutral "Opens Amazon.es" note, which is correct until Amazon issues a tag.

### Phase 6: Amazon Associates

The 180-day clock starts at signup, not at launch. Sign up only once the site is live and complete.

- [x] **Aron:** applied on 28 September 2026. **The 180-day window for three qualifying sales ends on 27 March 2027.** Signed up at afiliados.amazon.es as the company (business account) with its registered name and NIF `B27576347`, and the company's bank account for payments. Site URL `https://arononeillspicks.vercel.app`. Complete the tax interview as an entity
- [ ] **Aron:** send the tracking ID (ends `-21`) and the exact disclosure wording Associates Central shows. Amazon.es's standard Spanish statement is "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables"; both the English and Spanish statements are configured and shown together until confirmed
- [ ] Set the tracking ID, the statements and "Affiliate links switched on" in the admin (**Amazon Associates**), or in `src/profiles/aron/affiliate.json`; the save deploys itself if the gate passes
- [ ] Verify on the live site that buy buttons carry `?tag=`, and that both disclosures show

Acceptance: tagged links live within a day of signup.

### Phase 7: after launch

- **First three sales** must come from outside the account holder's circle (the company, its owners and staff, their friends and family). Channels: a personal Instagram or TikTok registered in Associates Central as an additional site, and genuinely useful answers in hospitality and Marbella expat communities that link to the site's pages, never to Amazon directly. The site is kept separate from the café by choice, so the café's own accounts stay out of it unless Aron decides otherwise
- **Supabase free projects pause** after inactivity. Either Aron restores it from the dashboard when needed, or add a weekly keep-alive (for example a scheduled GitHub Action calling the REST endpoint). Decide in Phase 1
- **Review cadence:** the preflight warns on entries not checked in six months; the laptop entry every three
- **Adding a friend:** `insert into public.allowed_emails (email, name) values ('friend@example.com', 'Name');`. Delete the row to remove access
- **Possible privacy improvement:** RLS lets every invited friend read all columns of every stay, including other guests' emails and messages. The UI only shows friends "Booked"/"Asked", but a view exposing only dates and status to non-owners would close the gap at the database. It's a schema change, so it follows the migration rule above

## 8. Business and tax notes for Aron

Not legal or tax advice; confirm with a gestor.

Since 28 September 2026 the café company holds the Associates account, so commissions are company income, taxed through the company's accounts (Impuesto sobre Sociedades), not Aron's personal IRPF. The company has two owners, so both should be happy with that. The gestor will probably need to add an advertising activity to the company's census registration (modelo 036; IAE epígrafe 844 is the usual one). Amazon pays EU affiliates through Amazon Europe Core Sàrl in Luxembourg, so the company's commission invoices are intra-community at 0% IVA (reverse charge). That requires the company to be on the ROI/VIES register and to file modelo 349.

Stripe is not needed for any of this: Amazon takes the payment from the buyer and pays the commission to Aron's bank account.

## 9. Reference

### Commands

```bash
npm run dev          # localhost:4321
npm run build        # astro build + vercel-headers, into .vercel/output
npm run check        # astro check (TypeScript 6)
npm run preflight    # build, then the deploy gate; exits non-zero on any failure
```

### Identifiers

| Thing | Value |
| --- | --- |
| Live address | `https://arononeillspicks.vercel.app` |
| Supabase project ref | `zmxkwaedfiqepyfywtbe` |
| Supabase region | `eu-west-3` (Paris) |
| Supabase org | `arononeill's org` (`mrnpwcpadkzwxxvghrsw`), free plan |
| Vercel project | `arononeillspicks`, `prj_RG44QB2E9D7wF5WjkCpfiUpZ3hPo`, team `team_WjsRqvOQ7M59VPC8TZyiyIuF` |
| Placeholder ASIN | `B0PLACEHLD`; the preflight rejects it |

### Sources

- Amazon Associates do's and don'ts: https://affiliate-program.amazon.sg/help/node/topic/G5CHSDWVK9JWVXRK
- Amazon Associates application review: https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM
- Supabase auth hooks: https://supabase.com/docs/guides/auth/auth-hooks
- Vercel fair use guidelines: https://vercel.com/docs/limits/fair-use-guidelines
