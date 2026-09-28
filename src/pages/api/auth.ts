import type { APIRoute } from "astro";
import { GITHUB_OAUTH_CLIENT_ID } from "astro:env/server";
import { OAUTH_SCOPE, STATE_COOKIE, callbackUrl, popupPage } from "../../lib/github-oauth";

// Step 1 of "Sign in with GitHub" on /admin/: send the admin's browser to
// GitHub to approve access. Runs on demand, not prerendered.
export const prerender = false;

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  if (!GITHUB_OAUTH_CLIENT_ID) {
    return popupPage(url.origin, {
      error: "Sign in with GitHub isn't set up yet. Close this window and use “Sign in with token” instead.",
    });
  }
  if (url.searchParams.get("provider") !== "github") {
    return popupPage(url.origin, { error: "Only GitHub sign-in is supported." });
  }

  // Random state, checked in /api/callback/, so a sign-in can't be started by another site.
  const state = crypto.randomUUID();
  cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/", maxAge: 600 });

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", GITHUB_OAUTH_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", callbackUrl(url));
  authorize.searchParams.set("scope", OAUTH_SCOPE);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");
  return redirect(authorize.href, 302);
};
