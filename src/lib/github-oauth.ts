/**
 * Shared pieces of the admin's "Sign in with GitHub" flow (src/pages/api/).
 * The popup protocol is the one Sveltia CMS and Decap CMS expect from an
 * external OAuth provider.
 */

export const STATE_COOKIE = "admin_oauth_state";

/** The repository is public, so committing only needs public_repo, not access to every private repo. */
export const OAUTH_SCOPE = "public_repo";

export const callbackUrl = (url: URL) => new URL("/api/callback/", url).href;

type Result = { token: string } | { error: string };

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** JSON that is safe to inline in a <script> element. */
const inlineJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

/**
 * The page shown in the sign-in popup. It announces itself to the admin window
 * and, once the admin window answers, posts the result back. Both messages are
 * restricted to this site's own origin, so the token never reaches another site.
 */
export function popupPage(origin: string, result: Result): Response {
  const ok = "token" in result;
  const message = ok
    ? `authorization:github:success:${JSON.stringify({ token: result.token, provider: "github" })}`
    : `authorization:github:error:${JSON.stringify({ provider: "github", message: result.error })}`;
  const text = ok ? "Signed in. This window will close by itself." : result.error;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${ok ? "Signed in" : "Sign-in problem"}</title>
<style>body{font:1rem/1.5 system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem}</style>
</head>
<body>
<p>${escapeHtml(text)}</p>
<script>
(() => {
  const origin = ${inlineJson(origin)};
  const message = ${inlineJson(message)};
  if (!window.opener) return;
  const answer = (event) => {
    if (event.origin !== origin) return;
    window.removeEventListener("message", answer);
    window.opener.postMessage(message, origin);
  };
  window.addEventListener("message", answer);
  window.opener.postMessage("authorizing:github", origin);
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: ok ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
