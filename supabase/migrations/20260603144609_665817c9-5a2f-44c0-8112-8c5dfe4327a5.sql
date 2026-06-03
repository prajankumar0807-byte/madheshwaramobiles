-- security_scans: append-only history of in-app security scans
CREATE TABLE public.security_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  run_by uuid,
  run_by_email text,
  total int NOT NULL DEFAULT 0,
  high_count int NOT NULL DEFAULT 0,
  medium_count int NOT NULL DEFAULT 0,
  low_count int NOT NULL DEFAULT 0,
  new_count int NOT NULL DEFAULT 0,
  resolved_count int NOT NULL DEFAULT 0,
  auto_fixed_count int NOT NULL DEFAULT 0,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  trigger text NOT NULL DEFAULT 'manual'
);

GRANT SELECT ON public.security_scans TO authenticated;
GRANT ALL ON public.security_scans TO service_role;

ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read security scans"
  ON public.security_scans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Block mutations from PostgREST (server uses service_role which bypasses RLS)
CREATE OR REPLACE FUNCTION public.security_scans_block_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'security_scans is append-only'; END; $$;

CREATE TRIGGER security_scans_no_update
  BEFORE UPDATE ON public.security_scans
  FOR EACH ROW EXECUTE FUNCTION public.security_scans_block_mutation();
CREATE TRIGGER security_scans_no_delete
  BEFORE DELETE ON public.security_scans
  FOR EACH ROW EXECUTE FUNCTION public.security_scans_block_mutation();

CREATE INDEX security_scans_created_at_idx ON public.security_scans (created_at DESC);

-- Inspector: list public tables with RLS disabled
CREATE OR REPLACE FUNCTION public.sec_tables_without_rls()
RETURNS TABLE(table_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.relname::text
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = false
$$;

-- Inspector: public tables missing service_role grants
CREATE OR REPLACE FUNCTION public.sec_tables_missing_service_grants()
RETURNS TABLE(table_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.tablename::text
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.role_table_grants g
      WHERE g.table_schema = 'public'
        AND g.table_name = t.tablename
        AND g.grantee = 'service_role'
    )
$$;

-- Safe auto-fix: enable RLS on a specific public table (admin only)
CREATE OR REPLACE FUNCTION public.sec_enable_rls(_table text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _table !~ '^[a-z_][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'invalid table name';
  END IF;
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _table);
  RETURN true;
END; $$;

REVOKE ALL ON FUNCTION public.sec_tables_without_rls() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sec_tables_missing_service_grants() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sec_enable_rls(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sec_tables_without_rls() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sec_enable_rls(text) TO authenticated, service_role;