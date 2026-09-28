# Your step-by-step guide

Everything you need to do, in order. Each step says roughly how long it takes. More detail on the admin is in `docs/ADMIN.md`.

## Step 1. Look at the live site (2 minutes)

1. Open **https://arononeillspicks.vercel.app** in a private or incognito window.
2. You'll see the site with a "Coming soon" note, because no products are published yet. That's expected.

## Step 2. Sign in to the admin (5 minutes, once)

The admin is where you publish and edit products. The quickest way in is a GitHub token:

1. Sign in to GitHub as **arononeillwork**, then open **https://github.com/settings/personal-access-tokens/new**.
2. **Token name:** `arononeillspicks admin`. **Expiration:** 1 year.
3. **Repository access:** choose **Only select repositories**, then pick **arononeills-amazon-picks**.
4. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**.
5. Press **Generate token** and copy it. GitHub only shows it once.
6. Open **https://arononeillspicks.vercel.app/admin/**, choose **Sign In Using Access Token**, paste the token and sign in.

The browser remembers you. If you'd rather have a "Sign in with GitHub" button, `docs/ADMIN.md` explains the one-time setup.

## Step 3. Publish the products (about 2 minutes each)

The eleven researched products are written and waiting as drafts. For each one:

1. In the admin, open **Products** and click a product. Drafts show "Draft ·" before their name.
2. Copy the **Amazon.es product code (ASIN)**, for example `B0CXDXP8VR`.
3. In a new tab, open `https://www.amazon.es/dp/` followed by the code, e.g. `https://www.amazon.es/dp/B0CXDXP8VR`.
4. Check it's the right product, it's in stock, and it's sold by the brand or by Amazon. `docs/ASIN-CHECK.md` lists anything extra to check for each product, such as the laptop keyboards being Spanish.
5. Back in the admin, set **Last checked** to today and untick **Draft (hidden from the live site)**.
6. Press **Save** (top right). After about a minute, refresh the live site and the product appears.

Publish at least **ten**. Leave the **TENS unit** as a draft until you've written your own experience into it. If a product is wrong on Amazon, tell Claude which one and it will swap in a backup.

**If a save doesn't appear on the site:** Vercel emails you that the deployment failed. The live site stays as it was. Open the email's link, scroll to the end of the log, and read the lines starting with `FAIL`, or forward the email to Claude.

## Step 4. Send the company's registration details (1 minute)

The legal notice needs the company's Registro Mercantil entry. It's on the escritura de constitución and looks like: *Registro Mercantil de Málaga, Tomo 1234, Folio 56, Hoja MA-78901*. Send it to Claude.

## Step 5. Apply to Amazon Associates (20 minutes, once ten products are live)

1. Go to **https://afiliados.amazon.es** and sign in with the Amazon account the business will use.
2. Register as a business: **Easy Beans Coffee, S.L.**, NIF **B27576347**, C. Pizarro, 8, 29670 San Pedro de Alcántara.
3. **Website:** `https://arononeillspicks.vercel.app`.
4. Describe the site honestly: recommendations for people who work long days on their feet, written in English, with visitors from social media and community groups.
5. Complete the **tax interview** as a company, and add the company's bank account for payments.
6. Note down your **tracking ID** (it ends in `-21`) and the exact **disclosure wording** Associates Central shows you.

The 180 days to make three qualifying sales start from this signup.

## Step 6. Switch on the affiliate links (2 minutes)

1. In the admin, open **Amazon Associates**.
2. Paste the **Tracking ID**, replace the two statements with Amazon's exact wording, and tick **Affiliate links switched on**.
3. Press **Save** and wait a minute.
4. Open any product page and check three things:
   - The **View on Amazon.es** button's address ends in `?tag=` followed by your ID.
   - A note above the button says it's an affiliate link.
   - Amazon's statements appear at the bottom of the page.

## Step 7. Get the first three sales (within 180 days)

- Sales from you, your co-owner, staff, friends or family don't count, and buying through your own links breaks Amazon's rules.
- Share links to the **site's pages**, never straight to Amazon, where they genuinely help: hospitality and Marbella expat groups, and your personal Instagram or TikTok. Add those social accounts as extra sites in Associates Central.

## For your gestor

Commissions now go to the company. Ask your gestor about adding an advertising activity to the company's census registration (modelo 036, IAE 844), registering for EU VAT (ROI/VIES), and filing modelo 349 for Amazon's invoices from Luxembourg.
