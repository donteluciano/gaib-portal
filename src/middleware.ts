import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PORTAL_COOKIE, isValidPortalSession } from '@/lib/portal-auth';

// The portal and its database proxy require a signed-in session.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = await isValidPortalSession(request.cookies.get(PORTAL_COOKIE)?.value);

  if (pathname.startsWith('/api/db')) {
    return signedIn ? NextResponse.next() : NextResponse.json({ message: 'Not signed in' }, { status: 401 });
  }

  if (pathname.startsWith('/portal')) {
    return signedIn ? NextResponse.next() : NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && signedIn) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/portal/:path*', '/api/db/:path*'],
};
