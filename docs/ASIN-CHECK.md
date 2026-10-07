# ASIN check for Aron

The cloud container that researched these products couldn't open amazon.es at first. Since 3 October 2026 it can read listings as text (titles and selected variants; never Amazon's images), and every link below was checked that day: the notes say what each one actually sells. Still open each draft's link yourself before it's published. The brief's rule is to never ship an ASIN nobody has seen resolve. Open each link on your phone or laptop and check:

1. It's the product named here (brand, model, size or variant).
2. It's in stock and sold or shipped by the brand or by Amazon, not a random reseller.
3. Anything listed under "Also check" for that row.

If it's right, tell Claude (or set `draft: false` in the entry file yourself). If it's wrong, tell Claude which one and it will switch to a backup ASIN from `docs/research/2026-09-26-products.md`. At least ten confirmed entries are needed to launch; drafts simply don't appear on the site.

| Entry file | Product | Link | Also check |
| --- | --- | --- | --- |
| `anti-fatigue-mat.md` | Sky Solutions Anti-Fatigue Mat, 19 mm, 50 x 99 cm | https://www.amazon.es/dp/B00M8O122G | Amazon labels this code "60 x 120 cm, black" but lists the item as 99 x 51 cm: check which size the page sells. No allowed photo: the brand's website redirects to its Amazon store |
| `compression-socks.md` | Relaxsan 830, 18-22 mmHg, X-Static | https://www.amazon.es/dp/B01FZQZYNQ | Size picker shows all sizes. No studio photo: Relaxsan only publishes lifestyle shots of the 830 |
| `insoles.md` | Scholl GelActiv Work (men's 40-46.5) | https://www.amazon.es/dp/B07FCCDN45 | |
| `work-shoes.md` | DIAN Marsella, EN ISO 20347 SRC | https://www.amazon.es/dp/B09253K4MH | Opens on white (also sold in black); the photo shows white |
| `massage-gun.md` | Hyperice Hypervolt Go 3 | https://www.amazon.es/dp/B0G82W9ZZK | Listing says 3 speeds; Hyperice says 5 (entry uses 5) |
| `foam-roller.md` | BLACKROLL Standard 45, medium, black | https://www.amazon.es/dp/B01D1V69X6 | Switched 3 October 2026: the old code (B01CEIGD06) was the softer BLACKROLL Med |
| `foot-massage-ball.md` | BLACKROLL Blackbox Mini set | https://www.amazon.es/dp/B01M7XPBJM | |
| `power-bank.md` | UGREEN Nexode 25,000 mAh 145 W | https://www.amazon.es/dp/B0BJQ7F16T | **Done**: chosen and opened by Aron, 28 September 2026 (replaces the Anker A1383, B0CXDXP8VR, now a backup) |
| `laptop.md` (pick 1) | Lenovo IdeaPad Slim 3 Gen 10, i5-13420H, 16 GB, 512 GB | https://www.amazon.es/dp/B0GZHZ7HM7 | Spanish keyboard |
| `laptop.md` (pick 2) | ASUS Zenbook A14 OLED UX3407QA | https://www.amazon.es/dp/B0DVCGC5MW | Spanish keyboard (title is cut off at "QWERTY") |
| `laptop.md` (pick 3) | MacBook Air 13-inch M5, 16 GB, 512 GB | https://www.amazon.es/dp/B0GR1MZP3L | Spanish, not Portuguese, keyboard |
| `water-bottle.md` | Hydro Flask Standard Mouth 709 ml, Flex Cap | https://www.amazon.es/dp/B01KXHGWQU | This code is white; the photo shows white |
| `work-backpack.md` | Thule Paramount Backpack 27L | https://www.amazon.es/dp/B09FPYMTQ9 | Paramount Backpack, not the Paramount Commuter. This code is the 2021 model in Timberwolf (3204490), which Thule's site no longer shows, so there's no allowed photo: pick the current model or send your own photo |
| `tens-unit.md` | iWarmbase 3-in-1 TENS/EMS/Massage | https://www.amazon.es/dp/B0H83C9TYS | Chosen by Aron, 28 September 2026; on 7 October 2026 he sent iWarmbase's newer listing of the same unit (same description and package, on Amazon.es since July 2026), which replaced B0FJRXMVK9. **Off the site since 3 October 2026**: iWarmbase has no website and sells only on Amazon, so there's no allowed photo. A photo of your own unit (and a few lines if it's the one you use) brings it back |
| `theragun-sense.md` | Therabody Theragun Sense (2nd generation) | https://www.amazon.es/dp/B0FNX9TF9R | **Done**: chosen by Aron, 28 September 2026 |
| `macbook-neo.md` | Apple MacBook Neo 13-inch, A18 Pro, 512 GB, Touch ID, Indigo | https://www.amazon.es/dp/B0GR6HXPJ7 | **Done**: chosen by Aron, 28 September 2026. Spanish keyboard |
| `macbook-pro-14.md` | Apple MacBook Pro 14-inch, M5 Pro, 24 GB, 1 TB, Space Black | https://www.amazon.es/dp/B0GR1FQGHV | **Done**: chosen by Aron, 28 September 2026. Switched 3 October 2026: the old code (B0GR1NZFNK) now redirects to the silver model. This one is Space Black, Spanish keyboard (Amazon's title says Portuguese for the whole family; the selected keyboard is Spanish) |
| `loop-earplugs.md` | Loop Experience 2 earplugs | https://www.amazon.es/dp/B0D4DFQTMJ | **Done**: chosen by Aron, 28 September 2026 |
| `sony-wh-1000xm6.md` | Sony WH-1000XM6 | https://www.amazon.es/dp/B0F2TT8Q7M | **Done**: chosen by Aron, 28 September 2026 |
| `sony-wh-1000xm5.md` | Sony WH-1000XM5 | https://www.amazon.es/dp/B09Y2MYL5C | **Done**: chosen by Aron, 28 September 2026 |
| `lunchbox.md` | Everusely stainless-steel bento box, 0.8 L, lavender | https://www.amazon.es/dp/B09TGDJBVP | **Done**: chosen by Aron, 28 September 2026. Stainless steel: not microwave-safe |
| `xiaomi-smart-band-10.md` | Xiaomi Smart Band 10, black (BHR07PYGL) | https://www.amazon.es/dp/B0DYF82545 | **Done**: chosen by Aron, 29 September 2026 |
| `espresso-machine.md` | Sage The Oracle Jet | https://www.amazon.es/dp/B0DFGRJMBC | **Done**: chosen by Aron, 28 September 2026 |
| `coffee-canister.md` | Fellow Atmos Vacuum Canister 1.2 L, glass | https://www.amazon.es/dp/B07NPMNW84 | **Done**: chosen by Aron, 28 September 2026 |
| `multi-cooker.md` | Ninja Combi 12-in-1 SFP700EU | https://www.amazon.es/dp/B0CZPKSGFV | **Done**: chosen by Aron, 28 September 2026 |
| `usb-power-strip.md` | VOOMY 100 W USB power strip | https://www.amazon.es/dp/B0D44VR3TY | **Done**: chosen by Aron, 28 September 2026 |
| `sunscreen.md` | Altruist Sunscreen SPF 50, unscented | https://www.amazon.es/dp/B0CWPH59MQ | **Done**: chosen by Aron, 28 September 2026. The 1 litre bottle, as in the photo |
| `face-sunscreen.md` | Altruist Face Fluid SPF 50, 50 ml | https://www.amazon.es/dp/B086VR76TB | **Done**: chosen by Aron, 28 September 2026. Switched 3 October 2026: the old code (B0B5273DN1) is the SPF 30 fluid, not the SPF 50 the page describes |

Opening these links yourself is fine. Buying through them doesn't count toward the three qualifying sales: purchases by the company, its owners, staff, friends and family never do.
