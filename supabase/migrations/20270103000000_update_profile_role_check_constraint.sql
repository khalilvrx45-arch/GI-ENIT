-- Ensure role check constraint accepts all active system roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'membre_bureau', 'membre_actif', 'bureau', 'membre', 'pole_lead'));
