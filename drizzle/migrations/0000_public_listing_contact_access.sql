REVOKE ALL PRIVILEGES ON TABLE public.properties FROM anon;
GRANT SELECT (id, title, price, location, description, phone_number, property_type, user_id, status, created_at, currency, video_url, rental_period) ON TABLE public.properties TO anon;
REVOKE ALL PRIVILEGES ON TABLE public.shared_housing FROM anon;
GRANT SELECT ON TABLE public.shared_housing TO anon;
REVOKE ALL PRIVILEGES ON TABLE public.dormitories FROM anon;
GRANT SELECT ON TABLE public.dormitories TO anon;