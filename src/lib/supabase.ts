import { createClient } from '@supabase/supabase-js';

// Portal database client.
//
// Requests go to this site's /api/db proxy, which checks the portal sign-in and adds the
// server-only Supabase key. The browser never talks to the database with a key that can
// read data, so the database itself can stay closed to the public.

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

function proxyBaseUrl(): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/api/db`;
  // Only used while pages are pre-rendered on the server; no requests are made then.
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://heraldcappartners.com'}/api/db`;
}

// The anon key is only a placeholder here: the proxy replaces it with the service key.
export const supabase = createClient(proxyBaseUrl(), anonKey, clientOptions);

/**
 * Storage client that talks to Supabase directly. Used only to upload a file with a
 * one-time signed upload token issued through the proxy, so large files don't pass
 * through the website's server.
 */
export function directStorage() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, anonKey, clientOptions).storage;
}

/** Turns a stored document link into one that opens through the signed-in portal. */
export function portalFileUrl(url: string): string {
  return url.replace(/^https:\/\/[^/]+\/storage\/v1\/object\/public\//, '/api/db/storage/v1/object/public/');
}
