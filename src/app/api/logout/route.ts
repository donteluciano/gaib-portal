import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_COOKIE } from '@/lib/portal-auth';

function signOut(request: NextRequest) {
  // 303 so a POST from the sidebar's logout form becomes a GET of /login.
  const response = NextResponse.redirect(new URL('/login', request.url), 303);
  response.cookies.delete(PORTAL_COOKIE);
  response.cookies.delete('gaib-auth');
  return response;
}

export async function POST(request: NextRequest) {
  return signOut(request);
}

export async function GET(request: NextRequest) {
  return signOut(request);
}
