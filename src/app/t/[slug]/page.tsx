import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  deadlineLabel,
  formatDateRange,
  formatINR,
  shareMessage,
  tripState,
  type Status,
} from "@/lib/trip";
import RespondPanel from "@/components/RespondPanel";
import ShareBar from "@/components/ShareBar";
import PaidToggle from "@/components/PaidToggle";
import OrganizerMemory from "@/components/OrganizerMemory";

type Params = { params: Promise<{ slug: string }> };
type Search = { searchParams: Promise<{ organizer?: string }> };

const baseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

async function load(slug: string) {
  return db.trip.findUnique({
    where: { slug },
    include: { participants: { orderBy: { createdAt: "asc" } } },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const trip = await load(slug);
  if (!trip) return { title: "Trip not found" };

  const state = tripState(trip, trip.participants);
  const bits = [state.inCount + " going"];
  if (state.perHead != null) bits.push(formatINR(state.perHead) + " each");
  const summary = bits.join(" · ");

  return {
    title: trip.title + " - Chalein",
    description: summary,
    openGraph: {
      title: trip.title,
      description: summary,
      url: baseUrl() + "/t/" + slug,
    },
  };
}

const GROUPS: { key: Status; label: string; tone: string }[] = [
  { key: "IN", label: "Going", tone: "text-go" },
  { key: "MAYBE", label: "Maybe", tone: "text-hold" },
  { key: "OUT", label: "Out", tone: "text-muted" },
];

export default async function TripPage({ params, searchParams }: Params & Search) {
  const { slug } = await params;
  const { organizer } = await searchParams;

  const trip = await load(slug);
  if (!trip) notFound();

  const state = tripState(trip, trip.participants);
  const url = baseUrl() + "/t/" + slug;
  const message = shareMessage(trip, state, url);
  const dates = formatDateRange(trip.startDate, trip.endDate);
  const deadline = deadlineLabel(state.daysLeft);
  const isOrganizer = Boolean(organizer && organizer === trip.organizerToken);
  const organizerRow = isOrganizer
    ? trip.participants.find((p) => p.claimToken === trip.organizerToken)
    : undefined;
  const total = trip.estimatedTotal ?? 0;

  return (
    <main className="mx-auto max-w-lg px-5 pb-4 pt-8">
      <OrganizerMemory slug={slug} tokenFromUrl={organizer ?? null} />

      <header className="mb-6">
        <h1 className="text-[1.8rem] font-extrabold leading-tight tracking-[-0.02em] text-balance">
          {trip.title}
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-muted">
          {[trip.destination, dates].filter(Boolean).join("  ·  ")}
        </p>
      </header>

      {/* The answer a group chat can never hold: current headcount and what it
          costs each, above everything else. */}
      <section className="rounded-2xl border border-line bg-card p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label mb-1">Confirmed</p>
            <p className="text-[2.4rem] font-extrabold leading-none tabular-nums">
              {state.inCount}
              <span className="ml-1.5 text-[1rem] font-semibold text-muted">
                going
              </span>
            </p>
          </div>
          {state.perHead != null ? (
            <div className="text-right">
              <p className="label mb-1">Each</p>
              <p className="text-[2.4rem] font-extrabold leading-none tabular-nums text-coral">
                {formatINR(state.perHead)}
              </p>
            </div>
          ) : null}
        </div>

        {state.perHead != null && state.inCount > 0 ? (
          <p className="mt-3 border-t border-line pt-3 text-[0.85rem] leading-snug text-muted">
            {formatINR(total)} split{" "}
            {state.inCount === 1 ? "1 way" : state.inCount + " ways"}. One more
            person and it drops to{" "}
            <span className="font-semibold text-ink">
              {formatINR(Math.ceil(total / (state.inCount + 1)))}
            </span>
            .
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {state.maybeCount > 0 ? (
            <span className="rounded-full bg-hold-wash px-2.5 py-1 text-[0.78rem] font-semibold text-hold">
              {state.maybeCount} still deciding
            </span>
          ) : null}
          {deadline ? (
            <span
              className={
                "rounded-full px-2.5 py-1 text-[0.78rem] font-semibold " +
                ((state.daysLeft ?? 99) <= 1
                  ? "bg-coral-wash text-coral-dark"
                  : "bg-ink/5 text-muted")
              }
            >
              {deadline}
            </span>
          ) : null}
          {trip.advanceAmount ? (
            <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[0.78rem] font-semibold text-muted">
              {state.paidCount}/{state.inCount} paid {formatINR(trip.advanceAmount)}
            </span>
          ) : null}
        </div>
      </section>

      <div className="mt-4">
        <RespondPanel
          slug={slug}
          knownIdentity={
            organizerRow
              ? { claimToken: organizerRow.claimToken, name: organizerRow.name }
              : null
          }
        />
      </div>

      <section className="mt-6">
        {GROUPS.map(({ key, label, tone }) => {
          const people = trip.participants.filter((p) => p.status === key);
          if (people.length === 0) return null;
          return (
            <div key={key} className="mb-5">
              <h2 className={"label mb-2 " + tone}>
                {label} &middot; {people.length}
              </h2>
              <ul className="flex flex-col gap-1.5">
                {people.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5"
                  >
                    <span className="truncate text-[0.97rem] font-medium">
                      {p.name}
                    </span>
                    {key === "IN" && trip.advanceAmount ? (
                      isOrganizer && organizer ? (
                        <PaidToggle
                          slug={slug}
                          participantId={p.id}
                          paid={p.paidAdvance}
                          organizerToken={organizer}
                        />
                      ) : p.paidAdvance ? (
                        <span className="shrink-0 rounded-lg border border-go bg-go-wash px-2.5 py-1 text-[0.75rem] font-bold uppercase tracking-[0.04em] text-go">
                          Paid
                        </span>
                      ) : null
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {trip.participants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.92rem] text-muted">
            Nobody has replied yet. Send the link to the group.
          </p>
        ) : null}
      </section>

      {isOrganizer && trip.advanceAmount && state.unpaidNames.length > 0 ? (
        <p className="mb-2 rounded-xl bg-hold-wash px-4 py-3 text-[0.88rem] leading-snug text-hold">
          <span className="font-bold">Still to pay: </span>
          {state.unpaidNames.join(", ")}
        </p>
      ) : null}

      <ShareBar message={message} url={url} />
    </main>
  );
}
