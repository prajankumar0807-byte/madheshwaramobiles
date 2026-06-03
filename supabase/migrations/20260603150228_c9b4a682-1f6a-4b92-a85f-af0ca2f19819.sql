-- Revoke public/anon EXECUTE on SECURITY DEFINER admin helpers.
REVOKE EXECUTE ON FUNCTION public.sec_enable_rls(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sec_tables_without_rls() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_logs_hash() FROM PUBLIC, anon, authenticated;

-- Re-grant only where needed.
GRANT EXECUTE ON FUNCTION public.sec_enable_rls(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sec_tables_without_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
-- increment_site_visits is intentionally callable by anon (public visitor counter); leave as-is.
