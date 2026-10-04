import { timingSafeEqual } from "crypto";

export function isAuthorized(request: Request): boolean {
  const expected = process.env.AGENT_API_KEY;
  if (!expected) return false;

  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const provided = match?.[1]?.trim();
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
