-- Herald portal database lockdown. APPLIED to the production project on 2026-11-23
-- (migrations "lock_down_public_access" and "revoke_public_table_grants").
-- Kept here as a record and for setting up a new project the same way.
--
-- Model: the public (anon) key can do nothing except add a new lead from the website
-- contact form. The portal reads and writes through /api/db on the website's server,
-- using SUPABASE_SERVICE_ROLE_KEY, which RLS and these grants do not affect.

-- 1. Lead columns the portal and website form use (additive).
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS county text,
  ADD COLUMN IF NOT EXISTS relationship text,
  ADD COLUMN IF NOT EXISTS current_use text,
  ADD COLUMN IF NOT EXISTS additional_notes text,
  ADD COLUMN IF NOT EXISTS lead_status text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS converted_site_id uuid;

-- 2. RLS on every public table, with no policies except the one below.
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

CREATE POLICY "Website contact form can add new leads"
  ON public.leads FOR INSERT TO anon
  WITH CHECK (lead_status = 'new' AND converted_site_id IS NULL);

-- 3. No table privileges for anon/authenticated, except inserting leads.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT INSERT ON public.leads TO anon;

-- 4. Private bucket for portal documents.
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Check: should return no rows.
SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;
