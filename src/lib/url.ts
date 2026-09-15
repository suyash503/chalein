/**
 * Origin used to build the share link and the link preview.
 *
 * Getting this wrong ships dead links into people's group chats, so it is
 * derived rather than configured wherever possible: Vercel supplies the
 * production hostname on its own, and the explicit variable is only needed
 * once there is a custom domain.
 */
export function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return "https://" + vercelHost.replace(/\/+$/, "");

  return "http://localhost:3000";
}

export const tripUrl = (slug: string) => baseUrl() + "/t/" + slug;
