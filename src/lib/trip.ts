import { customAlphabet } from "nanoid";

export type Status = "IN" | "MAYBE" | "OUT";

export const STATUSES: Status[] = ["IN", "MAYBE", "OUT"];

export const STATUS_LABEL: Record<Status, string> = {
  IN: "I'm in",
  MAYBE: "Maybe",
  OUT: "Can't make it",
};

// Lowercase, no lookalikes. Short enough to read aloud, long enough that the
// link is not guessable - the trip page has no login, so the URL is the key.
const slugId = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 9);
const tokenId = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  32,
);

export const makeSlug = () => slugId();
export const makeToken = () => tokenId();

export type ParticipantLike = {
  id: string;
  name: string;
  status: string;
  paidAdvance: boolean;
};

export type TripLike = {
  title: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  estimatedTotal: number | null;
  advanceAmount: number | null;
  decideBy: Date | null;
};

export type TripState = {
  inCount: number;
  maybeCount: number;
  outCount: number;
  perHead: number | null;
  paidCount: number;
  unpaidNames: string[];
  daysLeft: number | null;
};

export function tripState(
  trip: TripLike,
  participants: ParticipantLike[],
): TripState {
  const going = participants.filter((p) => p.status === "IN");
  const inCount = going.length;

  // Per head divides by confirmed heads only. With nobody confirmed yet we
  // show the total against a single head rather than dividing by zero, which
  // reads as "this is what it costs if it is just you".
  const perHead =
    trip.estimatedTotal == null
      ? null
      : Math.ceil(trip.estimatedTotal / Math.max(inCount, 1));

  const paid = going.filter((p) => p.paidAdvance);

  let daysLeft: number | null = null;
  if (trip.decideBy) {
    const ms = startOfDay(trip.decideBy).getTime() - startOfDay(new Date()).getTime();
    daysLeft = Math.round(ms / 86_400_000);
  }

  return {
    inCount,
    maybeCount: participants.filter((p) => p.status === "MAYBE").length,
    outCount: participants.filter((p) => p.status === "OUT").length,
    perHead,
    paidCount: paid.length,
    unpaidNames: going.filter((p) => !p.paidAdvance).map((p) => p.name),
    daysLeft,
  };
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDateRange(start: Date | null, end: Date | null) {
  if (!start) return null;
  const fmt = (d: Date, withYear = false) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  if (!end) return fmt(start, true);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}-${fmt(end, true)}`;
  }
  return `${fmt(start)} - ${fmt(end, true)}`;
}

export function deadlineLabel(daysLeft: number | null) {
  if (daysLeft == null) return null;
  if (daysLeft < 0) return "Decision overdue";
  if (daysLeft === 0) return "Decide today";
  if (daysLeft === 1) return "1 day to decide";
  return `${daysLeft} days to decide`;
}

/**
 * The message that gets pasted into the group chat. This is the product's
 * distribution, so it carries the live state - re-sharing it after someone
 * joins says something new rather than repeating an invite.
 */
export function shareMessage(
  trip: TripLike,
  state: TripState,
  url: string,
): string {
  const lines: string[] = [];
  const dates = formatDateRange(trip.startDate, trip.endDate);

  lines.push(`*${trip.title}*${dates ? ` - ${dates}` : ""}`);

  const tally = [`${state.inCount} in`];
  if (state.maybeCount) tally.push(`${state.maybeCount} maybe`);
  lines.push(tally.join(" \u00b7 "));

  if (state.perHead != null) {
    lines.push(`${formatINR(state.perHead)} each${state.inCount > 1 ? "" : " so far"}`);
  }

  const deadline = deadlineLabel(state.daysLeft);
  if (deadline) lines.push(deadline);

  lines.push("");
  lines.push(`You in? ${url}`);

  return lines.join("\n");
}

export function whatsappHref(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
