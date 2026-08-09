-- ==============================================================================
-- MIGRATION: ADD MULTI-PHOTO SUPPORT & TIGHTEN RLS ON ACTIVITIES
-- ==============================================================================

-- Add photo_urls array column (multi-photo carousel support)
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- Add created_by if it doesn't exist (safety; already present in previous migration)
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop overly-permissive existing RLS policies
DROP POLICY IF EXISTS "Accès public en lecture aux activités" ON public.activities;
DROP POLICY IF EXISTS "Accès complet aux utilisateurs authentifiés sur les activités" ON public.activities;

-- Re-create granular RLS policies
-- 1. Public read (published only for anon, all for authenticated)
CREATE POLICY "Public read published activities"
  ON public.activities FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

-- 2. Insert: admin and bureau roles only
CREATE POLICY "Admin/bureau can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'bureau')
    )
  );

-- 3. Update: admin (any), bureau (own posts only)
CREATE POLICY "Admin can update any activity"
  ON public.activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Bureau can update own activities"
  ON public.activities FOR UPDATE
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'bureau'
    )
  );

-- 4. Delete: admin (any), bureau (own posts only)
CREATE POLICY "Admin can delete any activity"
  ON public.activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Bureau can delete own activities"
  ON public.activities FOR DELETE
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'bureau'
    )
  );

-- Storage policies for activity-images bucket (ensure delete is scoped)
DROP POLICY IF EXISTS "Authenticated Upload activity-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access activity-images" ON storage.objects;

CREATE POLICY "Public read activity-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-images');

CREATE POLICY "Admin/bureau upload activity-images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admin/bureau delete activity-images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'activity-images'
    AND auth.role() = 'authenticated'
  );
