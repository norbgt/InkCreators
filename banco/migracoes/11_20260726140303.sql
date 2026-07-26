DROP POLICY IF EXISTS "Avatar owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;

CREATE POLICY "Avatar owner insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Public read portfolio" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'portfolio');