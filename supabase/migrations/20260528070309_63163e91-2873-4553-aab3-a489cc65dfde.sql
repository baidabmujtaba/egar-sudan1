
-- 1. PROFILES: restrict SELECT to self + admins
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- INSERT restricted to authenticated, role forced to 'tenant'
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'tenant'::app_role);

-- UPDATE: cannot change role
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- Admins can update any profile (including roles)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure handle_new_user trigger bypass works: it runs as SECURITY DEFINER, no RLS impact.

-- 2. STORAGE: cleanup duplicate/broad policies, enforce per-user folder
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images storage" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete own property images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Uploads must go under a folder named after the user's uid
CREATE POLICY "Users can upload own property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own property images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Revoke has_role from anon (RLS policies under authenticated still work)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
