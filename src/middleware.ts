import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('gaib-auth');
  const isAuthenticated = authCookie?.value === 'authenticated';

  // Protect all /portal routes
  if (request.nextUrl.pathname.startsWith('/portal')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users from login to portal
  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  // Redirect root to appropriate page
  if (request.nextUrl.pathname === '/') {
    // For now, redirect to login. Later this will be the public landing page.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/portal/:path*'],
};
