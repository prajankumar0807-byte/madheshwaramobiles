REVOKE EXECUTE ON FUNCTION public.sec_enable_rls(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.sec_tables_without_rls() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sec_enable_rls(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sec_tables_without_rls() TO service_role;
GRANT EXECUTE ON FUNCTION public.sec_tables_missing_service_grants() TO service_role;
