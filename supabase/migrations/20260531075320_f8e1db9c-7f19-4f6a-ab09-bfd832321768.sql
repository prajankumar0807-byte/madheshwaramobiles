CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only grant admin role to the explicitly allowlisted owner email.
  -- The previous "first user becomes admin" path has been removed to
  -- prevent privilege escalation by anyone who registers first.
  IF lower(NEW.email) = 'prajankumar0807@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;