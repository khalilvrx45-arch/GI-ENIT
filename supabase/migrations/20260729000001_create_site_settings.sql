-- Migration: Create site_settings table and storage buckets with policies

CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access for site_settings" 
ON public.site_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated access on site_settings" ON public.site_settings;
CREATE POLICY "Allow authenticated access on site_settings" 
ON public.site_settings FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert default logo value
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('site_logo', '/logo-cgi.jpg')
ON CONFLICT (setting_key) DO NOTHING;

-- Storage buckets setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-carousel', 'hero-carousel', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
DROP POLICY IF EXISTS "Public Read Access brand-assets" ON storage.objects;
CREATE POLICY "Public Read Access brand-assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Authenticated Upload brand-assets" ON storage.objects;
CREATE POLICY "Authenticated Upload brand-assets"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Public Read Access hero-carousel" ON storage.objects;
CREATE POLICY "Public Read Access hero-carousel"
  ON storage.objects FOR SELECT USING (bucket_id = 'hero-carousel');

DROP POLICY IF EXISTS "Authenticated Upload hero-carousel" ON storage.objects;
CREATE POLICY "Authenticated Upload hero-carousel"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-carousel');
