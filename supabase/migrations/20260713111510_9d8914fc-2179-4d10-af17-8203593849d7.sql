
CREATE TABLE public.dormitory_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dormitory_id UUID NOT NULL REFERENCES public.dormitories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dormitory_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dormitory_images TO authenticated;
GRANT ALL ON public.dormitory_images TO service_role;
ALTER TABLE public.dormitory_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dormitory images" ON public.dormitory_images FOR SELECT USING (true);
CREATE POLICY "Owners insert dormitory images" ON public.dormitory_images FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.dormitories d WHERE d.id = dormitory_id AND d.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners delete dormitory images" ON public.dormitory_images FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dormitories d WHERE d.id = dormitory_id AND d.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.shared_housing_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_housing_id UUID NOT NULL REFERENCES public.shared_housing(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shared_housing_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_housing_images TO authenticated;
GRANT ALL ON public.shared_housing_images TO service_role;
ALTER TABLE public.shared_housing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view shared housing images" ON public.shared_housing_images FOR SELECT USING (true);
CREATE POLICY "Owners insert shared housing images" ON public.shared_housing_images FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shared_housing s WHERE s.id = shared_housing_id AND s.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners delete shared housing images" ON public.shared_housing_images FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shared_housing s WHERE s.id = shared_housing_id AND s.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
