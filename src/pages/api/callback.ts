import type { APIRoute } from "astro";
import { GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET } from "astro:env/server";
import { STATE_COOKIE, callbackUrl, popupPage } from "../../lib/github-oauth";

// Step 2 of "Sign in with GitHub": GitHub sends the browser back here with a
// one-time code, which is swapped for an access token and handed to the admin
// window. The token lives only in the admin's browser; nothing is stored here.
export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  const expected = cookies.get(STATE_COOKIE)?.value;
  cookies.delete(STATE_COOKIE, { path: "/api/" });

  const denied = url.searchParams.get("error");
  if (denied) {
    return popupPage(url.origin, { error: url.searchParams.get("error_description") ?? "GitHub sign-in was cancelled." });
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !expected || state !== expected) {
    return popupPage(url.origin, { error: "That sign-in expired or didn't start here. Close this window and try again." });
  }
  if (!GITHUB_OAUTH_CLIENT_ID || !GITHUB_OAUTH_CLIENT_SECRET) {
    return popupPage(url.origin, { error: "Sign in with GitHub isn't set up yet. Use “Sign in with token” instead." });
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_OAUTH_CLIENT_ID,
      client_secret: GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(url),
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token) {
    return popupPage(url.origin, { error: data.error_description ?? "GitHub didn't return a sign-in token. Try again." });
  }
  return popupPage(url.origin, { token: data.access_token });
};
