
CREATE TABLE public.site_stats (
  id int PRIMARY KEY DEFAULT 1,
  visits bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.site_stats (id, visits) VALUES (1, 0);

GRANT SELECT ON public.site_stats TO anon, authenticated;
GRANT ALL ON public.site_stats TO service_role;

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site stats"
ON public.site_stats FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.increment_site_visits()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.site_stats
    SET visits = visits + 1, updated_at = now()
    WHERE id = 1
    RETURNING visits INTO new_count;
  RETURN new_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_site_visits() FROM public;
GRANT EXECUTE ON FUNCTION public.increment_site_visits() TO anon, authenticated;
