"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePaid } from "@/app/actions";

export default function PaidToggle({
  slug,
  participantId,
  paid,
  organizerToken,
}: {
  slug: string;
  participantId: string;
  paid: boolean;
  organizerToken: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={paid}
      onClick={() =>
        startTransition(async () => {
          await togglePaid(slug, participantId, organizerToken);
          router.refresh();
        })
      }
      className={`shrink-0 rounded-lg border px-2.5 py-1 text-[0.75rem] font-bold uppercase tracking-[0.04em] transition-colors disabled:opacity-50 ${
        paid
          ? "border-go bg-go-wash text-go"
          : "border-line bg-card text-muted hover:bg-ink/5"
      }`}
    >
      {paid ? "Paid" : "Mark paid"}
    </button>
  );
}
