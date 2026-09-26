import { AuthClient } from "@supabase/auth-js";
import { PostgrestClient } from "@supabase/postgrest-js";

/**
 * auth-js and postgrest-js directly rather than supabase-js, which bundles
 * realtime, storage and functions clients this site never uses. Keep the two
 * package versions in step.
 *
 * The publishable key is not a JWT. It goes in the apikey header only, never
 * as a Bearer token. Authorization carries the user's session token or nothing.
 */
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const configured = Boolean(url && key);

export const auth = new AuthClient({
  url: `${url}/auth/v1`,
  headers: { apikey: key },
  storageKey: "arononeillspicks-auth",
  // Implicit, not PKCE: friends often request a link on one device and open
  // it on another, or in a mail app's browser, where PKCE fails.
  flowType: "implicit",
  detectSessionInUrl: true,
  persistSession: true,
  autoRefreshToken: true,
});

const withSession: typeof fetch = async (input, init) => {
  const { data } = await auth.getSession();
  const headers = new Headers(init?.headers);
  headers.set("apikey", key);
  if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  else headers.delete("Authorization");
  return fetch(input, { ...init, headers });
};

export const db = new PostgrestClient(`${url}/rest/v1`, { fetch: withSession });

export interface Invite {
  email: string;
  name: string | null;
  is_owner: boolean;
}

export interface Stay {
  id: string;
  guest_email: string;
  guest_name: string;
  starts_on: string;
  ends_on: string;
  status: "requested" | "confirmed" | "declined";
  message: string | null;
  created_at: string;
}
