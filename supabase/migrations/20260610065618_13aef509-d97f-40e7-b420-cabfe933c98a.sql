REVOKE SELECT (phone_number) ON public.properties FROM anon;
REVOKE SELECT (phone_number) ON public.shared_housing FROM anon;
-- Ensure authenticated retains explicit column access
GRANT SELECT ON public.properties TO authenticated;
GRANT SELECT ON public.shared_housing TO authenticated;
-- Grant anon access only on non-sensitive columns
GRANT SELECT (id, title, price, location, description, property_type, currency, rental_period, video_url, status, user_id, created_at) ON public.properties TO anon;
GRANT SELECT (id, title, price, location, description, gender, available_spots, video_url, status, user_id, created_at) ON public.shared_housing TO anon;