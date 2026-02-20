import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('gaib-auth');
  const isAuthenticated = authCookie?.value === 'authenticated';

  // Portal is temporarily public for sharing
  // To re-enable protection, uncomment below:
  // if (request.nextUrl.pathname.startsWith('/portal')) {
  //   if (!isAuthenticated) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }
  // }

  // Redirect authenticated users from login to portal
  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/portal/:path*'],
};
