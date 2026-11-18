REVOKE ALL PRIVILEGES ON TABLE public.payment_settings FROM anon;

DROP POLICY IF EXISTS "Anyone can view payment settings" ON public.payment_settings;

CREATE POLICY "Signed-in users can view payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

GRANT SELECT ON TABLE public.payment_settings TO authenticated;
GRANT ALL ON TABLE public.payment_settings TO service_role;
