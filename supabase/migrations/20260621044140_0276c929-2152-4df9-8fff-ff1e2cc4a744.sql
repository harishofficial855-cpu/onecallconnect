
-- Anyone signed in can read images (for app display)
CREATE POLICY "Authenticated read profile-images" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated read provider-images" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'provider-images');
CREATE POLICY "Authenticated read provider-logos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'provider-logos');

-- Users may write only inside their own uid folder
CREATE POLICY "Users upload profile-images to own folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own profile-images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own profile-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload provider-images to own folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'provider-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own provider-images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'provider-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own provider-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'provider-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload provider-logos to own folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'provider-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own provider-logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'provider-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own provider-logos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'provider-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
