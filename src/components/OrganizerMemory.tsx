"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const organizerKey = (slug: string) => "chalein:organizer:" + slug;

/**
 * The organiser is identified by a token that arrives in the URL once, at
 * creation. Remember it so she keeps her payment controls after sharing the
 * plain link and coming back to it later.
 */
export default function OrganizerMemory({
  slug,
  tokenFromUrl,
}: {
  slug: string;
  tokenFromUrl: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    try {
      if (tokenFromUrl) {
        localStorage.setItem(organizerKey(slug), tokenFromUrl);
        return;
      }
      const saved = localStorage.getItem(organizerKey(slug));
      if (saved) {
        router.replace("/t/" + slug + "?organizer=" + saved);
      }
    } catch {
      /* storage unavailable - the original link still works */
    }
  }, [slug, tokenFromUrl, router]);

  return null;
}
