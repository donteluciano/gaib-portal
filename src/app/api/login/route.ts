import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  
  // Password from environment variable, with fallback for demo
  const validPassword = process.env.PORTAL_PASSWORD || 'gaib2026';
  
  // Also accept 'demo' for testing
  if (password === validPassword || password === 'demo') {
    // Set auth cookie (30 days)
    const cookieStore = await cookies();
    cookieStore.set('gaib-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
