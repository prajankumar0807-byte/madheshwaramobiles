REVOKE EXECUTE ON FUNCTION public.increment_site_visits() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.increment_site_visits() TO service_role;