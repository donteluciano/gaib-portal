-- Herald portal: close the database and document storage to public access.
--
-- Run this in Supabase > SQL Editor only AFTER:
--   1. SUPABASE_SERVICE_ROLE_KEY and PORTAL_PASSWORD are set in Vercel, and
--   2. the portal update (database proxy at /api/db) is live and you can sign in.
-- The portal and the website contact form use the service key on the server, which these
-- rules do not affect. Running this earlier would break the old portal.

-- 1. Remove every row-level security policy on public tables (including the "Allow all"
--    ones) and make sure RLS is on everywhere. RLS on + no policies = no public access.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- 2. Make the documents bucket private and remove public storage policies.
--    Files then open only through the signed-in portal, via short-lived links.
DO $$
DECLARE r record;
BEGIN
  UPDATE storage.buckets SET public = false WHERE id = 'documents';
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' LOOP
    BEGIN
      EXECUTE format('DROP POLICY %I ON storage.objects', r.policyname);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not drop storage policy "%": remove it in Storage > Policies.', r.policyname;
    END;
  END LOOP;
END $$;

-- 3. Check. Both queries should return no rows.
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname IN ('public', 'storage');
SELECT id, public FROM storage.buckets WHERE public = true;
