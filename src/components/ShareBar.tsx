"use client";

import { useState } from "react";
import { whatsappHref } from "@/lib/trip";

export default function ShareBar({
  message,
  url,
}: {
  message: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked - the WhatsApp button still works */
    }
  }

  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-8 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={whatsappHref(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-coral px-4 py-3 text-center text-[0.98rem] font-bold text-white transition-colors hover:bg-coral-dark"
        >
          Send to the group
        </a>
        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-line bg-card px-4 py-3 text-[0.9rem] font-semibold transition-colors hover:bg-ink/5"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
