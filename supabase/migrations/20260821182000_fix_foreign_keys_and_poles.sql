-- ==============================================================================
-- MIGRATION: FIX RESOURCES POLE_ID & ACTIVITIES PROFILES FOREIGN KEY
-- ==============================================================================

-- 1. Fix resources table columns & foreign keys
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS pole_id UUID REFERENCES public.poles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Sync created_by and uploaded_by on resources safely if created_by exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='created_by') THEN
    EXECUTE 'UPDATE public.resources SET uploaded_by = COALESCE(uploaded_by, created_by)';
  END IF;
END $$;

-- Ensure resources has clean foreign keys to profiles
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_uploaded_by_fkey;
ALTER TABLE public.resources ADD CONSTRAINT resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Fix activities foreign key to profiles safely
UPDATE public.activities
SET created_by = NULL
WHERE created_by IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = activities.created_by);

ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_created_by_fkey;
ALTER TABLE public.activities ADD CONSTRAINT activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Ensure profiles foreign key to poles constraint exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pole_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pole_id_fkey FOREIGN KEY (pole_id) REFERENCES public.poles(id) ON DELETE SET NULL;
