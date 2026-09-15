"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { makeSlug, makeToken, type Status } from "@/lib/trip";

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseMoney(v: FormDataEntryValue | null): number | null {
  const s = typeof v === "string" ? v.replace(/[^0-9]/g, "") : "";
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function str(v: FormDataEntryValue | null, max = 80): string {
  return (typeof v === "string" ? v : "").trim().slice(0, max);
}

export async function createTrip(formData: FormData) {
  const title = str(formData.get("title"), 60);
  const destination = str(formData.get("destination"), 60);
  const organizerName = str(formData.get("organizerName"), 40);

  if (!title || !organizerName) {
    throw new Error("Trip name and your name are both required");
  }

  const slug = makeSlug();
  const organizerToken = makeToken();

  await db.trip.create({
    data: {
      slug,
      title,
      destination,
      startDate: parseDate(formData.get("startDate")),
      endDate: parseDate(formData.get("endDate")),
      estimatedTotal: parseMoney(formData.get("estimatedTotal")),
      advanceAmount: parseMoney(formData.get("advanceAmount")),
      decideBy: parseDate(formData.get("decideBy")),
      organizerToken,
      // The organiser is the first person in. A trip with nobody in it reads
      // as dead on arrival when the first friend opens the link.
      participants: {
        create: {
          name: organizerName,
          status: "IN",
          claimToken: organizerToken,
        },
      },
    },
  });

  redirect(`/t/${slug}?organizer=${organizerToken}`);
}

export async function respond(
  slug: string,
  name: string,
  status: Status,
  claimToken: string | null,
): Promise<{ claimToken: string } | { error: string }> {
  const trip = await db.trip.findUnique({ where: { slug }, select: { id: true } });
  if (!trip) return { error: "That trip link is no longer valid." };

  const cleanName = name.trim().slice(0, 40);
  if (!cleanName) return { error: "Add your name so the group knows who's in." };

  if (claimToken) {
    const existing = await db.participant.findUnique({
      where: { claimToken },
      select: { id: true, tripId: true },
    });
    if (existing && existing.tripId === trip.id) {
      await db.participant.update({
        where: { id: existing.id },
        data: { name: cleanName, status },
      });
      revalidatePath(`/t/${slug}`);
      return { claimToken };
    }
  }

  const token = makeToken();
  await db.participant.create({
    data: { tripId: trip.id, name: cleanName, status, claimToken: token },
  });

  revalidatePath(`/t/${slug}`);
  return { claimToken: token };
}

export async function togglePaid(
  slug: string,
  participantId: string,
  organizerToken: string,
): Promise<{ ok: true } | { error: string }> {
  const trip = await db.trip.findUnique({
    where: { slug },
    select: { id: true, organizerToken: true },
  });
  if (!trip) return { error: "That trip link is no longer valid." };
  if (trip.organizerToken !== organizerToken) {
    return { error: "Only the person who created this trip can mark payments." };
  }

  const participant = await db.participant.findUnique({
    where: { id: participantId },
    select: { id: true, tripId: true, paidAdvance: true },
  });
  if (!participant || participant.tripId !== trip.id) {
    return { error: "That person isn't on this trip." };
  }

  await db.participant.update({
    where: { id: participant.id },
    data: { paidAdvance: !participant.paidAdvance },
  });

  revalidatePath(`/t/${slug}`);
  return { ok: true };
}
