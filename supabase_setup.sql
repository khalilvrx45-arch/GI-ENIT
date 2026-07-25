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
  role TEXT DEFAULT 'membre_actif' CHECK (role IN ('membre_actif', 'membre_bureau', 'admin', 'bureau', 'membre')),
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

-- 3. ACTIVATION DE LA SÉCURITÉ PAR LIGNE (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 4. POLITIQUES DE SÉCURITÉ (POLICIES)

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
