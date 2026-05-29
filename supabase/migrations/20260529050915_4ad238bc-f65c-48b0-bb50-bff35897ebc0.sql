CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- First admin bootstrap
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Always grant admin to owner's email
  IF lower(NEW.email) = 'prajankumar0807@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- Also grant admin to the email if the user already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'prajankumar0807@gmail.com'
ON CONFLICT DO NOTHING;