# Photos inbox

Drop product photos here, one per product, named after the product's file in
`src/profiles/aron/kit/` (for example `espresso-machine.jpg`, `sony-wh-1000xm6.png`).
Then `npm run photos` cleans each one up (white background, trimmed, centred,
compressed), adds it to the product with a credit to the brand, and empties this
folder.

- Use the **brand's official product photo** from its own website or press kit, or
  **your own photo**. Never an image saved from Amazon: the Associates agreement
  forbids copying or storing Amazon's images.
- Pick the plain studio shot on a white or transparent background, front or
  three-quarter view, in the colour the Amazon.es link sells.
- JPG, PNG or WebP, ideally 1500 px or larger. iPhone HEIC photos: export as JPG first.
- For your own photos, add `photos-inbox/credits.json` with `{ "product-name": "" }`
  so no brand credit is shown.
