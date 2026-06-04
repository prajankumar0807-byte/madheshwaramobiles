
CREATE POLICY "Anyone can view offer images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'offer-images');
CREATE POLICY "Admins upload offer images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'offer-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update offer images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'offer-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete offer images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'offer-images' AND public.has_role(auth.uid(), 'admin'));
