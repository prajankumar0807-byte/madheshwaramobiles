CREATE TABLE public.client_error_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('stylesheet_transform', 'app_error_boundary')),
  message text NOT NULL,
  stack text,
  component_stack text,
  pathname text NOT NULL DEFAULT '/',
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'ta')),
  user_id uuid,
  user_email text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_error_reports TO authenticated;
GRANT ALL ON public.client_error_reports TO service_role;
ALTER TABLE public.client_error_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read client error reports" ON public.client_error_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));