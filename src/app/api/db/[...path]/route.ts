import { NextRequest } from 'next/server';
import { PORTAL_COOKIE, isValidPortalSession } from '@/lib/portal-auth';

// Database proxy for the portal.
//
// The portal's Supabase client sends its requests here instead of straight to Supabase.
// This route checks the portal sign-in, then forwards the request with the server-only
// service key. Because the browser never holds a key that can read data, the database
// can deny all public (anon) access.

export const dynamic = 'force-dynamic';

const ALLOWED_PREFIXES = ['rest/v1/', 'storage/v1/'];

const REQUEST_HEADERS = [
  'accept',
  'accept-profile',
  'content-profile',
  'content-type',
  'prefer',
  'range',
  'x-client-info',
  'x-upsert',
  'cache-control',
];

const RESPONSE_HEADERS = [
  'content-type',
  'content-range',
  'content-disposition',
  'cache-control',
  'etag',
  'last-modified',
  'preference-applied',
];

// Files are opened via links like /api/db/storage/v1/object/public/<bucket>/<path>.
const FILE_LINK = /^storage\/v1\/object\/(?:public|authenticated)\/(.+)$/;

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: Context) {
  if (!(await isValidPortalSession(request.cookies.get(PORTAL_COOKIE)?.value))) {
    return Response.json({ message: 'Not signed in' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[db proxy] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.');
    return Response.json({ message: 'Database access is not configured.' }, { status: 503 });
  }

  const { path = [] } = await context.params;
  if (path.some((segment) => segment === '..' || segment === '.' || segment === '')) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }
  const target = path.map(encodeURIComponent).join('/');
  if (!ALLOWED_PREFIXES.some((prefix) => target.startsWith(prefix))) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  const authHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

  // Opening a document: hand the browser a short-lived signed link instead of streaming
  // the file through this function (which would cap file size).
  const fileLink = request.method === 'GET' ? target.match(FILE_LINK) : null;
  if (fileLink) {
    const signResponse = await fetch(`${supabaseUrl}/storage/v1/object/sign/${fileLink[1]}`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 300 }),
      cache: 'no-store',
    });
    const signed = await signResponse.json().catch(() => null);
    if (!signResponse.ok || !signed?.signedURL) {
      return Response.json({ message: 'File not found' }, { status: 404 });
    }
    return Response.redirect(`${supabaseUrl}/storage/v1${signed.signedURL}`, 302);
  }

  const headers = new Headers(authHeaders);
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const buffer = await request.arrayBuffer();
    body = buffer.byteLength > 0 ? buffer : undefined;
  }

  const upstream = await fetch(`${supabaseUrl}/${target}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE, handle as HEAD };
