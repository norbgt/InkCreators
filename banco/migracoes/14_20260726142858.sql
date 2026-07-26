DROP POLICY IF EXISTS "Avatar owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio owner update" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Users update own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own portfolio" ON storage.objects;

CREATE POLICY "Avatar owner insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar owner update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar owner delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio owner insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio owner update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio owner delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
);