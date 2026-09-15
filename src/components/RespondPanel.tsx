"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respond } from "@/app/actions";
import { STATUS_LABEL, STATUSES, type Status } from "@/lib/trip";

const KEY = (slug: string) => `chalein:${slug}`;

type Stored = { claimToken: string; name: string };

function read(slug: string): Stored | null {
  try {
    const raw = localStorage.getItem(KEY(slug));
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function write(slug: string, value: Stored) {
  try {
    localStorage.setItem(KEY(slug), JSON.stringify(value));
  } catch {
    /* private mode, shared device with storage blocked - not fatal */
  }
}

const TONE: Record<Status, string> = {
  IN: "border-go bg-go text-white",
  MAYBE: "border-hold bg-hold text-white",
  OUT: "border-line bg-ink/5 text-ink",
};

export default function RespondPanel({
  slug,
  knownIdentity = null,
}: {
  slug: string;
  /**
   * Set when the server already knows who this viewer is - currently the
   * organiser, recognised by the token in her URL. Saves asking the person
   * who created the trip to introduce herself to her own trip.
   */
  knownIdentity?: Stored | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<Stored | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = read(slug) ?? knownIdentity;
    setMe(stored);
    if (stored) {
      setName(stored.name);
      // Persist the server-supplied identity so it survives losing the token
      // from the URL on a later visit.
      if (!read(slug)) write(slug, stored);
    }
    setMounted(true);
  }, [slug, knownIdentity]);

  function send(status: Status) {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Add your name first so the group knows who's in.");
      return;
    }
    startTransition(async () => {
      const result = await respond(slug, trimmed, status, me?.claimToken ?? null);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      const next = { claimToken: result.claimToken, name: trimmed };
      write(slug, next);
      setMe(next);
      setEditing(false);
      router.refresh();
    });
  }

  // Render nothing identity-dependent until localStorage has been read, so the
  // server and client markup agree on the first paint.
  if (!mounted) {
    return <div className="h-[8.5rem] rounded-2xl border border-line bg-card" />;
  }

  const responded = me !== null && !editing;

  return (
    <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
      {responded ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.95rem]">
            <span className="text-muted">You replied as </span>
            <span className="font-bold">{me.name}</span>
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[0.85rem] font-semibold text-ink transition-colors hover:bg-ink/5"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <label className="label" htmlFor="respond-name">
            Your name
          </label>
          <input
            id="respond-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="field"
            placeholder="e.g. Ananya"
            autoComplete="given-name"
          />

          <div className="mt-3 grid grid-cols-3 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => send(s)}
                className={`rounded-xl border px-2 py-2.5 text-[0.88rem] font-bold transition-transform disabled:opacity-60 ${TONE[s]} active:scale-[0.97]`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          {error ? (
            <p role="alert" className="mt-2.5 text-[0.85rem] font-medium text-coral-dark">
              {error}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
