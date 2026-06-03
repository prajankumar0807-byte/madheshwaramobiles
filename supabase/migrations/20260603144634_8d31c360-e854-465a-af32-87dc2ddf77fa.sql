REVOKE EXECUTE ON FUNCTION public.sec_tables_without_rls() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.sec_tables_without_rls() TO service_role;
GRANT EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() TO service_role;