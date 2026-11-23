import { NextRequest, NextResponse } from 'next/server';
import {
  PORTAL_COOKIE,
  PORTAL_SESSION_SECONDS,
  expectedPortalToken,
  portalPasswordConfigured,
  portalPasswordMatches,
} from '@/lib/portal-auth';

export async function POST(request: NextRequest) {
  if (!portalPasswordConfigured()) {
    return NextResponse.json(
      { error: 'Portal sign-in is not set up yet. Add PORTAL_PASSWORD in Vercel.' },
      { status: 503 }
    );
  }

  let password: unknown = '';
  try {
    ({ password } = await request.json());
  } catch {
    // fall through with an empty password
  }

  if (!(await portalPasswordMatches(password))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await expectedPortalToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(PORTAL_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PORTAL_SESSION_SECONDS,
    path: '/',
  });
  // Clear the old, insecure cookie if a browser still has it.
  response.cookies.delete('gaib-auth');
  return response;
}
