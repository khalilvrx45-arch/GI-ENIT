-- Migration: Create hero_images table and RLS policies

CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Accès public en lecture aux images hero" ON public.hero_images;
CREATE POLICY "Accès public en lecture aux images hero" 
  ON public.hero_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Accès complet aux utilisateurs authentifiés sur les images hero" ON public.hero_images;
CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les images hero" 
  ON public.hero_images FOR ALL USING (auth.role() = 'authenticated');
