CREATE POLICY "anyone can submit feedback" ON public.feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    rating BETWEEN 1 AND 5
    AND char_length(message) BETWEEN 3 AND 1000
    AND (name IS NULL OR char_length(name) <= 80)
    AND (phone IS NULL OR char_length(phone) <= 20)
    AND (sentiment IS NULL OR sentiment IN ('positive','neutral','negative'))
  );

GRANT INSERT ON public.feedback TO anon, authenticated;