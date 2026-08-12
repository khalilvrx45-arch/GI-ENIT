-- Fix RLS policies on activities table to allow authenticated insert, update, delete
DROP POLICY IF EXISTS "Accès complet aux utilisateurs authentifiés sur les activités" ON public.activities;
DROP POLICY IF EXISTS activities_write_lead_or_admin ON public.activities;
DROP POLICY IF EXISTS activities_select_all ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated full access to activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public select activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated insert activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated update activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated delete activities" ON public.activities;

CREATE POLICY "Allow public select activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert activities" ON public.activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update activities" ON public.activities FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete activities" ON public.activities FOR DELETE USING (auth.role() = 'authenticated');
