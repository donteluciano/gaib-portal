import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Demo mode: accept any email with password "gaib2026" or "demo"
  const validPasswords = ['gaib2026', 'demo', 'password'];
  
  if (email && validPasswords.includes(password)) {
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
  
  return NextResponse.json({ error: 'Invalid credentials. Try password: demo' }, { status: 401 });
}
