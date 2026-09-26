import { site } from "../config/active";

/**
 * The only place an Amazon URL is built. No shorteners, no redirects through
 * this site, no cloaking: the href is the real Amazon.es product page.
 */
export const PLACEHOLDER_ASIN = "B0PLACEHLD";

/** Keep noopener; never add noreferrer (Amazon may check the referring site). */
export const AFFILIATE_REL = "sponsored nofollow noopener";

export function amazonUrl(asin: string): string {
  if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error(`Not an ASIN: "${asin}"`);
  const url = new URL(`https://${site.affiliate.marketplace}/dp/${asin}`);
  if (site.affiliate.enabled) {
    if (!site.affiliate.tag) throw new Error("affiliate.enabled is true but affiliate.tag is empty");
    url.searchParams.set("tag", site.affiliate.tag);
  }
  return url.href;
}
