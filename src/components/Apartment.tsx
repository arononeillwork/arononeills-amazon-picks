import type { Session } from "@supabase/auth-js";
import { useEffect, useMemo, useState } from "preact/hooks";
import { auth, configured, db, type Invite, type Stay } from "../lib/supabase";

/*
 * Friends-only calendar. Row-level security in Postgres is the security
 * boundary; nothing here decides who may see or change what. The UI only
 * hides controls a person couldn't use anyway.
 *
 * Never add a client-side "is this address invited?" check. The sign-up hook
 * refuses uninvited addresses on the server, and the sign-in form shows the
 * same neutral message whatever the outcome, so it can't be used to probe
 * who is on the list.
 */

interface Copy {
  emailLabel: string;
  send: string;
  sent: string;
  notInvited: string;
}

type Phase = "loading" | "signed-out" | "signed-in";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Local calendar date as YYYY-MM-DD. */
function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return isoDate(new Date(y, m - 1, d + days));
}

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

function formatIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return longDate.format(new Date(y, m - 1, d));
}

function nights(stay: Pick<Stay, "starts_on" | "ends_on">): number {
  const [a, b] = [stay.starts_on, stay.ends_on].map((iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86_400_000);
}

/** Stays are [starts_on, ends_on): the leaving day is free for the next guest. */
const overlaps = (a: Pick<Stay, "starts_on" | "ends_on">, b: Pick<Stay, "starts_on" | "ends_on">) =>
  a.starts_on < b.ends_on && b.starts_on < a.ends_on;

function describeError(error: { code?: string; message: string }): string {
  if (error.code === "23P01") return "Those dates overlap a stay that's already confirmed.";
  if (error.code === "42501") return "You don't have permission to do that.";
  return "Something went wrong. Please try again.";
}

export default function Apartment({ copy }: { copy: Copy }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    // A failed or expired magic link comes back with the error in the hash.
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.get("error")) {
      setLinkError("That sign-in link has expired or was already used. Ask for a new one below.");
      history.replaceState(null, "", location.pathname);
    }
    auth.getSession().then(({ data }) => {
      setSession(data.session);
      setPhase(data.session ? "signed-in" : "signed-out");
    });
    const { data } = auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setPhase(next ? "signed-in" : "signed-out");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!configured) {
    return <p class="note">The calendar isn't configured on this build.</p>;
  }
  if (phase === "loading") return <p class="muted">Loading…</p>;
  if (phase === "signed-out" || !session) return <SignIn copy={copy} linkError={linkError} />;
  return <Calendar session={session} copy={copy} />;
}

function SignIn({ copy, linkError }: { copy: Copy; linkError: string | null }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "offline">("idle");

  async function submit(event: Event) {
    event.preventDefault();
    setState("sending");
    try {
      const { error } = await auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${location.origin}/apartment/`, shouldCreateUser: true },
      });
      // Every refusal (not invited, rate limited, already signed up) gets the
      // same neutral message. Only a server or network failure is reported.
      setState(error && (error.status === undefined || error.status >= 500) ? "offline" : "sent");
    } catch {
      setState("offline");
    }
  }

  return (
    <form class="apt-panel" onSubmit={submit}>
      {linkError && <p class="apt-error" role="alert">{linkError}</p>}
      <label for="apt-email">{copy.emailLabel}</label>
      <div class="apt-row">
        <input
          id="apt-email"
          type="email"
          autocomplete="email"
          required
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
        />
        <button class="button" type="submit" disabled={state === "sending"}>
          {copy.send}
        </button>
      </div>
      <p role="status" class="muted">
        {state === "sent" && copy.sent}
        {state === "offline" && "Couldn't reach the server. Check your connection and try again."}
      </p>
    </form>
  );
}

function Calendar({ session, copy }: { session: Session; copy: Copy }) {
  const email = (session.user.email ?? "").toLowerCase();
  const today = isoDate(new Date());
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [stays, setStays] = useState<Stay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [month, setMonth] = useState(() => today.slice(0, 7));

  async function load() {
    const [inviteResult, staysResult] = await Promise.all([
      db.from("allowed_emails").select("email,name,is_owner").eq("email", email).maybeSingle(),
      db.from("stays").select("*").gte("ends_on", today).order("starts_on"),
    ]);
    if (inviteResult.error || staysResult.error) {
      setError(describeError((inviteResult.error ?? staysResult.error)!));
      return;
    }
    setInvite(inviteResult.data as Invite | null);
    setStays((staysResult.data ?? []) as Stay[]);
  }

  useEffect(() => {
    load();
  }, [email]);

  async function act(run: () => PromiseLike<{ error: { code?: string; message: string } | null }>) {
    setBusy(true);
    setError(null);
    const { error } = await run();
    if (error) setError(describeError(error));
    await load();
    setBusy(false);
    return !error;
  }

  const signOut = () => auth.signOut({ scope: "local" });

  if (invite === undefined) return <p class="muted">{error ?? "Loading…"}</p>;
  if (invite === null) {
    return (
      <div class="apt-panel">
        <p>{copy.notInvited}</p>
        <button class="apt-link" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  const owner = invite.is_owner;
  const live = stays.filter((s) => s.status !== "declined");
  const mine = stays.filter((s) => s.guest_email.toLowerCase() === email);
  const pending = stays.filter((s) => s.status === "requested");
  const confirmed = stays.filter((s) => s.status === "confirmed");

  return (
    <div class="apt">
      <p class="apt-who">
        Signed in as <strong>{invite.name ?? email}</strong>
        {owner && " (owner)"} ·{" "}
        <button class="apt-link" type="button" onClick={signOut}>
          Sign out
        </button>
      </p>
      {error && (
        <p class="apt-error" role="alert">
          {error}
        </p>
      )}

      <MonthGrid month={month} setMonth={setMonth} today={today} stays={live} email={email} owner={owner} />

      <RequestForm
        today={today}
        defaultName={invite.name ?? ""}
        confirmed={confirmed}
        busy={busy}
        onRequest={(stay) =>
          act(() => db.from("stays").insert({ ...stay, guest_email: email, status: "requested" }))
        }
      />

      {owner && (
        <section class="apt-panel">
          <h2>Requests to decide</h2>
          {pending.length === 0 && <p class="muted">No open requests.</p>}
          <ul class="apt-list">
            {pending.map((stay) => (
              <li key={stay.id}>
                <StaySummary stay={stay} showGuest />
                {stay.message && <p class="apt-message">“{stay.message}”</p>}
                <div class="apt-actions">
                  <button
                    class="button"
                    type="button"
                    disabled={busy}
                    onClick={() => act(() => db.from("stays").update({ status: "confirmed" }).eq("id", stay.id))}
                  >
                    Confirm
                  </button>
                  <button
                    class="apt-secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => act(() => db.from("stays").update({ status: "declined" }).eq("id", stay.id))}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h2>Confirmed</h2>
          {confirmed.length === 0 && <p class="muted">Nothing confirmed yet.</p>}
          <ul class="apt-list">
            {confirmed.map((stay) => (
              <li key={stay.id}>
                <StaySummary stay={stay} showGuest />
                <div class="apt-actions">
                  <button
                    class="apt-secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => act(() => db.from("stays").update({ status: "declined" }).eq("id", stay.id))}
                  >
                    Cancel this stay
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="apt-panel">
        <h2>Your requests</h2>
        {mine.length === 0 && <p class="muted">You haven't asked for any dates yet.</p>}
        <ul class="apt-list">
          {mine.map((stay) => (
            <li key={stay.id}>
              <StaySummary stay={stay} />
              {stay.status === "requested" && (
                <div class="apt-actions">
                  <button
                    class="apt-secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => act(() => db.from("stays").delete().eq("id", stay.id))}
                  >
                    Withdraw request
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StaySummary({ stay, showGuest = false }: { stay: Stay; showGuest?: boolean }) {
  const n = nights(stay);
  return (
    <p>
      {showGuest && <strong>{stay.guest_name}: </strong>}
      {formatIso(stay.starts_on)} to {formatIso(stay.ends_on)} ({n} {n === 1 ? "night" : "nights"}){" "}
      <span class={`chip apt-${stay.status}`}>{stay.status}</span>
    </p>
  );
}

function MonthGrid(props: {
  month: string;
  setMonth: (month: string) => void;
  today: string;
  stays: Stay[];
  email: string;
  owner: boolean;
}) {
  const { month, setMonth, today, stays, email, owner } = props;
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const days = new Date(year, monthIndex, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const thisMonth = today.slice(0, 7);
  const shift = (delta: number) => setMonth(isoDate(new Date(year, monthIndex - 1 + delta, 1)).slice(0, 7));

  const cells = useMemo(() => {
    const out: { iso: string; stay?: Stay }[] = [];
    for (let d = 1; d <= days; d++) {
      const iso = `${month}-${String(d).padStart(2, "0")}`;
      // A night belongs to the stay whose [starts_on, ends_on) contains it. Confirmed wins over requested.
      const covering = stays.filter((s) => s.starts_on <= iso && iso < s.ends_on);
      out.push({ iso, stay: covering.find((s) => s.status === "confirmed") ?? covering[0] });
    }
    return out;
  }, [month, stays]);

  const label = (stay: Stay) => {
    if (stay.guest_email.toLowerCase() === email) return "You";
    if (owner) return stay.guest_name;
    return stay.status === "confirmed" ? "Booked" : "Asked";
  };

  return (
    <section class="apt-panel" aria-labelledby="apt-month">
      <div class="apt-month-bar">
        <button class="apt-secondary" type="button" onClick={() => shift(-1)} disabled={month <= thisMonth} aria-label="Previous month">
          ←
        </button>
        <h2 id="apt-month">{monthName.format(first)}</h2>
        <button class="apt-secondary" type="button" onClick={() => shift(1)} aria-label="Next month">
          →
        </button>
      </div>
      <div class="apt-grid" role="grid" aria-labelledby="apt-month">
        {WEEKDAYS.map((day) => (
          <div class="apt-weekday" role="columnheader" key={day}>
            {day}
          </div>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <div key={`lead-${i}`} />
        ))}
        {cells.map(({ iso, stay }) => (
          <div
            key={iso}
            role="gridcell"
            class={["apt-day", iso < today && "apt-past", stay && `apt-${stay.status}`].filter(Boolean).join(" ")}
            aria-label={`${formatIso(iso)}: ${stay ? `${label(stay)} (${stay.status})` : "free"}`}
          >
            <span>{Number(iso.slice(8))}</span>
            {stay && <small>{label(stay)}</small>}
          </div>
        ))}
      </div>
      <p class="apt-legend muted">
        <span class="chip apt-confirmed">confirmed</span> <span class="chip apt-requested">requested</span> Each day
        shows that night. The day you leave is free for the next guest.
      </p>
    </section>
  );
}

function RequestForm(props: {
  today: string;
  defaultName: string;
  confirmed: Stay[];
  busy: boolean;
  onRequest: (stay: { guest_name: string; starts_on: string; ends_on: string; message: string | null }) => Promise<boolean>;
}) {
  const { today, defaultName, confirmed, busy, onRequest } = props;
  const [name, setName] = useState(defaultName);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: Event) {
    event.preventDefault();
    setDone(false);
    const wanted = { starts_on: start, ends_on: end };
    if (!name.trim()) return setProblem("Add your name.");
    if (!start || !end) return setProblem("Choose the day you arrive and the day you leave.");
    if (start < today) return setProblem("Arrival can't be in the past.");
    if (end <= start) return setProblem("You need to leave at least a day after you arrive.");
    const clash = confirmed.find((s) => overlaps(s, wanted));
    if (clash) return setProblem(`Those dates overlap a confirmed stay (${formatIso(clash.starts_on)} to ${formatIso(clash.ends_on)}).`);
    setProblem(null);
    const ok = await onRequest({ guest_name: name.trim(), starts_on: start, ends_on: end, message: message.trim() || null });
    if (ok) {
      setDone(true);
      setStart("");
      setEnd("");
      setMessage("");
    }
  }

  return (
    <form class="apt-panel" onSubmit={submit}>
      <h2>Ask for dates</h2>
      <div class="apt-fields">
        <label>
          Arrive
          <input type="date" min={today} value={start} required onInput={(e) => setStart((e.target as HTMLInputElement).value)} />
        </label>
        <label>
          Leave
          <input
            type="date"
            min={start ? addDays(start, 1) : addDays(today, 1)}
            value={end}
            required
            onInput={(e) => setEnd((e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Your name
          <input type="text" autocomplete="name" value={name} required maxLength={80} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
        </label>
      </div>
      <label>
        Message (optional)
        <textarea rows={3} maxLength={500} value={message} onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)} />
      </label>
      {problem && (
        <p class="apt-error" role="alert">
          {problem}
        </p>
      )}
      {done && <p role="status">Request sent. You'll see it confirmed or declined here.</p>}
      <button class="button" type="submit" disabled={busy}>
        Send request
      </button>
    </form>
  );
}
