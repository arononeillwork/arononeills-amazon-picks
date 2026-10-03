# Using the admin

The admin lives at **https://arononeillspicks.vercel.app/admin/**. It edits the products on the site and the Amazon Associates settings. It's for you only: the page is hidden from search engines, and only GitHub accounts with write access to the `arononeillwork/arononeills-amazon-picks` repository can save anything.

## How saving works

Every time you press **Save**, the admin records the change in the site's GitHub repository. Vercel notices, rebuilds the site and runs the site's checks (`npm run preflight`). If everything passes, the live site updates, usually within two minutes.

If a check fails, **the live site doesn't change**: it keeps showing the last version that passed. Vercel emails you that the deployment failed. Open the deployment in the Vercel dashboard and look at the end of the build log: the lines starting with `FAIL` say exactly what to fix.

## Signing in

You have two options. Set up the first one once and you won't need the second.

### Sign in with GitHub (recommended)

This needs a one-time setup on GitHub and Vercel, about five minutes:

1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App** (https://github.com/settings/applications/new).
2. Fill in:
   - **Application name:** `arononeillspicks admin`
   - **Homepage URL:** `https://arononeillspicks.vercel.app`
   - **Authorization callback URL:** `https://arononeillspicks.vercel.app/api/callback/` (with the slash at the end)
3. Press **Register application**. On the next page, copy the **Client ID**, then press **Generate a new client secret** and copy the secret. GitHub only shows it once.
4. In Vercel, open the `arononeillspicks` project → **Settings → Environment Variables** and add two variables for **Production**:
   - `GITHUB_OAUTH_CLIENT_ID` = the Client ID
   - `GITHUB_OAUTH_CLIENT_SECRET` = the client secret (tick **Sensitive**)
5. Redeploy: **Deployments** → the latest one → **⋯ → Redeploy**.

Don't paste the client secret into chat or email; put it straight into Vercel.

### Sign in with a token (works straight away)

1. On GitHub, open https://github.com/settings/personal-access-tokens/new.
2. **Token name:** `arononeillspicks admin`. **Expiration:** up to a year. **Repository access:** *Only select repositories* → `arononeills-amazon-picks`.
3. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**.
4. **Generate token**, copy it, and on the admin page choose **Sign In Using Access Token** and paste it.

The admin remembers you in that browser until you sign out.

## Publishing a product

Products start as **drafts**, which never appear on the live site. To publish one:

1. Open **Products** and pick the product.
2. Open `https://www.amazon.es/dp/` followed by its **product code (ASIN)** in another tab, and check it's the right product, in stock and sold by the brand or by Amazon. `docs/ASIN-CHECK.md` lists what to look out for on each of the current products.
3. Back in the admin, set **Last checked** to today, untick **Draft**, and **Save**.

Publish at least ten products before applying to Amazon Associates; their review expects a site with substantial content.

## Adding a new product

**Products → New**. Every field explains itself. Fill in **Brand** and **Short name** too (for example "Apple" and "MacBook Neo"): the cards and the page heading show those, and the full product name appears under the heading. The form won't save if something breaks the site's rules, for example "Amazon" in a headline, a price, a malformed product code, or square brackets. A few rules are only checked when the site rebuilds, so a published product can still fail the build:

- The write-up must be 200 to 400 words.
- If you tick **Do you own it? → No**, the write-up must not suggest you've used it ("I use", "my feet" and so on).
- Health products need a specific health note, and their write-up can't say the product treats, cures, relieves or prevents anything.
- Each product needs either one product code or exactly three picks.

Keep new products as drafts until they're finished; drafts are never checked this strictly and never go live.

## Adding a photo

Every product shows a simple drawing until it has a photo. Two kinds are allowed:

- **The brand's official product photo**, saved from the brand's own website or press kit (not from Amazon). Check it shows the exact model and colour you link to, and fill in **Photo credit** with the brand's name.
- **Your own photo**: the product on a plain, light background, in daylight.

In the admin, open the product, press **Photo**, upload it and **Save**. The site sizes it for every screen and blends a white background into the page.

Never use an image saved from Amazon: the Associates rules forbid copying or storing Amazon's images, and breaking them can close the account.

## "At a glance"

Two to four very short facts shown next to the buy button, for example "Five speeds, stated 55 dB". Keep them to specs from the maker, never prices.

## The home page spotlight

Tick **Spotlight on the home page** on one product to feature it in the big panel on the home page. If none is ticked, the most recently checked product is shown.

## Ordering

In **Products**, choose **Reorder** and drag products into the order you want within each category.

## Amazon Associates settings

Once Associates Central gives you a tracking ID (it ends in `-21`):

1. Open **Amazon Associates**.
2. Enter the **Tracking ID**, paste the disclosure statements exactly as Associates Central words them, and tick **Affiliate links switched on**.
3. **Save**. Check a product page on the live site: the buy button's address should end in `?tag=` and your ID, with the disclosure note above it and the statements in the footer.

## Things the admin won't let you do, on purpose

- Put product photos from Amazon on the site. Only your own photos or the brand's official ones, uploaded in the **Photo** field, are allowed.
- Link to Amazon from the write-up. The site builds every Amazon link itself, with the right disclosure next to it.
