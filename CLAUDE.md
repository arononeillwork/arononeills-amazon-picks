# arononeillspicks

Static Astro site recommending kit for long, physical working days, monetised through Amazon Associates (Amazon.es), plus a private friends-only apartment calendar on Supabase. Owner: Aron O'Neill.

@docs/BRIEF.md

## Standing rules (summary; the brief is authoritative)

- Nothing deploys until Aron explicitly says so **and** `npm run preflight` passes.
- Never write first-person experience Aron hasn't given you. Owned entries use `[Aron: ...]` prompts where his words are missing; the preflight refuses brackets.
- No prices, no Amazon images, no copied reviews. Every Amazon URL comes from `src/lib/amazon.ts`, inside a `data-affiliate-block` with its disclosure directly above the link. Keep `noopener`, never add `noreferrer`.
- "Amazon"/"amzn" never appears in the site name, titles, URLs or handles (`src/config/schema.ts` enforces it).
- Health entries describe experience or research, never treatment, and carry a specific `healthNote`.
- RLS is the security boundary. No client-callable allowlist check. Every DB change is a migration on the live project **and** mirrored in `supabase/schema.sql`, followed by both advisors and `supabase/tests/access.sql`.
- Catalogue pages ship zero JavaScript. No `ClientRouter`. Fonts stay self-hosted. No analytics without updating `/privacy/` first.
- TypeScript stays on 6 (`astro check` refuses 7). Zod comes from `astro/zod`. `@supabase/auth-js` and `@supabase/postgrest-js` versions move together.
- Associates account is Aron as persona física with his own NIF, never the Easy Beans café entity. Purchases by Aron, friends or family don't count.

## Commands

```bash
npm run dev        # http://localhost:4321
npm run check      # astro check
npm run preflight  # build, then the deploy gate
```
