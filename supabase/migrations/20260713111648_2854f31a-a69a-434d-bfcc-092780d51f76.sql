
DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.get_advertisers(_user_ids uuid[])
RETURNS TABLE(user_id uuid, full_name text, role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name, p.role
  FROM public.profiles p
  WHERE p.user_id = ANY(_user_ids);
$$;

REVOKE ALL ON FUNCTION public.get_advertisers(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_advertisers(uuid[]) TO anon, authenticated;
