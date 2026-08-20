-- ==============================================================================
-- SCRIPT DE CONFIGURATION DE LA BASE DE DONNÉES SUPABASE POUR LE CGI ENIT
-- Copiez-collez ce script dans le "SQL Editor" de votre tableau de bord Supabase
-- ==============================================================================

-- 1. TABLE PROFILES (Stockage des membres et de leurs rôles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  year TEXT,
  birth_date DATE,
  phone TEXT,
  linkedin_url TEXT,
  bio TEXT,
  age INTEGER,
  gender TEXT,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  fitness_goal TEXT,
  injuries TEXT,
  training_availability TEXT,
  role TEXT DEFAULT 'membre_actif' CHECK (role IN ('admin', 'membre_bureau', 'membre_actif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE INVITATIONS (Système d'invitation sécurisé)
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('membre_actif', 'membre_bureau')),
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- 3. TABLE HERO_IMAGES (Carrousel d'images de la page d'accueil)
CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVATION DE LA SÉCURITÉ PAR LIGNE (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- 5. POLITIQUES DE SÉCURITÉ (POLICIES)

-- Profiles
CREATE POLICY "Accès public en lecture aux profils" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les profils" 
  ON public.profiles FOR ALL USING (auth.role() = 'authenticated');

-- Invitations
CREATE POLICY "Accès public en lecture pour la vérification de token" 
  ON public.invitations FOR SELECT USING (true);

CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les invitations" 
  ON public.invitations FOR ALL USING (auth.role() = 'authenticated');

-- Hero Images
CREATE POLICY "Accès public en lecture aux images hero" 
  ON public.hero_images FOR SELECT USING (true);

CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les images hero" 
  ON public.hero_images FOR ALL USING (auth.role() = 'authenticated');

-- 4. TABLE SITE_SETTINGS (Paramètres globaux du site & Logo)
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès public en lecture aux paramètres du site" 
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les paramètres du site" 
  ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('site_logo', '/logo-cgi.jpg')
ON CONFLICT (setting_key) DO NOTHING;

-- 5. CRÉATION AUTOMATIQUE DES BUCKETS SUPABASE STORAGE (Logo & Hero)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-carousel', 'hero-carousel', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de sécurité pour le stockage des logos et images
CREATE POLICY "Public Read Access brand-assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated Upload brand-assets"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brand-assets');

CREATE POLICY "Public Read Access hero-carousel"
  ON storage.objects FOR SELECT USING (bucket_id = 'hero-carousel');

CREATE POLICY "Authenticated Upload hero-carousel"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-carousel');

-- 6. TABLE ACTIVITIES (Activités récentes du club)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Workshop' CHECK (category IN ('Workshop', 'Hackathon', 'Visite', 'Formation', 'Conférence', 'Autre')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès public en lecture aux activités"
  ON public.activities FOR SELECT USING (true);

CREATE POLICY "Accès complet aux utilisateurs authentifiés sur les activités"
  ON public.activities FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access activity-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated Upload activity-images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'activity-images');

-- 7. BUCKET STORAGE AVATARS (Photos de profil membres)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access avatars"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated Upload avatars"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated Update avatars"
  ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

-- Refresh PostgREST API schema cache
NOTIFY pgrst, 'reload schema';
