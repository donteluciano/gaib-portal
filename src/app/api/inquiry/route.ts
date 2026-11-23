import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INQUIRY_ROLES, type InquiryRole } from '@/components/site/content';

// Public website contact form. Each submission is saved to the portal's `leads`
// table, so it appears under Portal > Leads with status "new".

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function orNull(value: string): string | null {
  return value ? value : null;
}

const MULTIPLIERS: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

/** Turns entries like "50", "1,200", "$2.5M" or "750k" into a number; anything else becomes null. */
function toNumber(value: string): number | null {
  const match = value.replace(/[$,\s]/g, '').match(/^(\d*\.?\d+)([kmb])?$/i);
  if (!match) return null;
  const n = parseFloat(match[1]) * (MULTIPLIERS[(match[2] || '').toLowerCase()] ?? 1);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: people never see this field, so anything in it is a bot. Pretend it worked.
  if (text(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const firstName = text(body.firstName, 100);
  const lastName = text(body.lastName, 100);
  const email = text(body.email, 200);
  const roleInput = text(body.role, 50);
  const role: InquiryRole = (INQUIRY_ROLES as readonly string[]).includes(roleInput)
    ? (roleInput as InquiryRole)
    : 'Other';

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'Please enter your first and last name.' }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const message = text(body.message, 4000);
  const acreageInput = text(body.acreage, 50);
  const askingPriceInput = text(body.askingPrice, 50);
  const asEntered = [
    acreageInput && `Acreage as entered: ${acreageInput}`,
    askingPriceInput && `Asking price as entered: ${askingPriceInput}`,
  ]
    .filter(Boolean)
    .join('\n');
  const notes = [`Submitted through the website contact form (${role}).`, asEntered, message]
    .filter(Boolean)
    .join('\n\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer a server-only key if one is configured; fall back to the public key the portal already uses.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('[inquiry] Supabase environment variables are not set.');
    return NextResponse.json({ error: 'The form is temporarily unavailable.' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const { error } = await supabase.from('leads').insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone: orNull(text(body.phone, 50)),
    company: orNull(text(body.company, 200)),
    relationship: role,
    address: orNull(text(body.address, 300)),
    city: orNull(text(body.city, 100)),
    county: orNull(text(body.county, 100)),
    state: orNull(text(body.state, 50)),
    // acreage and asking_price are numeric columns; the raw entries are kept in the notes.
    current_use: orNull(text(body.currentUse, 300)),
    acreage: toNumber(acreageInput),
    asking_price: toNumber(askingPriceInput),
    additional_notes: notes,
    lead_status: 'new',
    // Older columns the leads table also has.
    status: 'new',
    source: 'Website',
  });

  if (error) {
    console.error('[inquiry] Could not save lead:', error.message);
    return NextResponse.json({ error: 'Your submission could not be sent.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
