// Portal sign-in helpers. Works in both middleware (edge) and route handlers (node).
//
// The portal password lives only in the PORTAL_PASSWORD environment variable on Vercel.
// A signed-in browser holds a cookie whose value is a hash derived from that password,
// so the cookie cannot be guessed or forged, and changing the password signs everyone out.

export const PORTAL_COOKIE = 'herald-portal';
export const PORTAL_SESSION_SECONDS = 60 * 60 * 24 * 14; // 14 days

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function equalStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function portalPasswordConfigured(): boolean {
  return Boolean(process.env.PORTAL_PASSWORD);
}

/** Session token for the configured password, or null when no password is configured. */
export async function expectedPortalToken(): Promise<string | null> {
  const password = process.env.PORTAL_PASSWORD;
  if (!password) return null;
  return sha256Hex(`herald-portal-session-v1:${password}`);
}

/** True when the submitted password matches PORTAL_PASSWORD. Always false if none is configured. */
export async function portalPasswordMatches(submitted: unknown): Promise<boolean> {
  const password = process.env.PORTAL_PASSWORD;
  if (!password || typeof submitted !== 'string' || !submitted) return false;
  const [a, b] = await Promise.all([sha256Hex(submitted), sha256Hex(password)]);
  return equalStrings(a, b);
}

/** True when the cookie value belongs to a signed-in portal session. */
export async function isValidPortalSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await expectedPortalToken();
  return expected !== null && equalStrings(cookieValue, expected);
}
