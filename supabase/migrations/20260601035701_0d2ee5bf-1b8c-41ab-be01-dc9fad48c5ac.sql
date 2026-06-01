
ALTER FUNCTION public.audit_logs_block_mutation() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.audit_logs_hash() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_logs_block_mutation() FROM PUBLIC, anon, authenticated;
