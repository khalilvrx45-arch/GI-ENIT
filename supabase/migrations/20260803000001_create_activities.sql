-- ==============================================================================
-- MIGRATION: CRÉATION DE LA TABLE ACTIVITIES & STORAGE BUCKET
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'Workshop' CHECK (category IN ('Workshop', 'Hackathon', 'Visite', 'Formation', 'Conférence', 'Autre')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la sécurité par ligne (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Accès public en lecture aux activités"
  ON public.activities FOR SELECT USING (true);

CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les activités"
  ON public.activities FOR ALL USING (auth.role() = 'authenticated');

-- Bucket Supabase Storage pour les images des activités
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage
CREATE POLICY "Public Read Access activity-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated Upload activity-images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'activity-images');
