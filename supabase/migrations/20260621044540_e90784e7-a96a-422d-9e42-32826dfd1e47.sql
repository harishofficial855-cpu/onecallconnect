
-- Tighten booking update policy: prevent reassigning user_id/provider_id
DROP POLICY "Users update their own bookings" ON public.bookings;
CREATE POLICY "Users or provider owners update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.owner_id = auth.uid())
  )
  WITH CHECK (
    (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.owner_id = auth.uid()))
    AND user_id = (SELECT user_id FROM public.bookings b WHERE b.id = bookings.id)
    AND provider_id = (SELECT provider_id FROM public.bookings b WHERE b.id = bookings.id)
  );

-- Restrict profile-images reads to the owning user
DROP POLICY "Authenticated read profile-images" ON storage.objects;
CREATE POLICY "Users read own profile-images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
