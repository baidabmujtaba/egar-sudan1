
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT user_id, full_name, role FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
