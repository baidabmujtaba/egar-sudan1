CREATE TABLE public.dormitories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  gender TEXT NOT NULL DEFAULT 'male',
  beds_per_room INTEGER NOT NULL DEFAULT 2,
  available_spots INTEGER NOT NULL DEFAULT 1,
  meals_included BOOLEAN NOT NULL DEFAULT false,
  nearby_university TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dormitories TO authenticated;
GRANT SELECT ON public.dormitories TO anon;
GRANT ALL ON public.dormitories TO service_role;

ALTER TABLE public.dormitories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved dormitories"
  ON public.dormitories FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own dormitories"
  ON public.dormitories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dormitories or admins"
  ON public.dormitories FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own dormitories or admins"
  ON public.dormitories FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_dormitories_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_dormitories_updated_at
BEFORE UPDATE ON public.dormitories
FOR EACH ROW EXECUTE FUNCTION public.update_dormitories_updated_at();