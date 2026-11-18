DROP POLICY IF EXISTS "Signed-in users can view payment settings" ON public.payment_settings;

CREATE POLICY "Admins can view payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.get_listing_payment_instructions()
RETURNS TABLE (
  bank_name text,
  account_number text,
  account_name text,
  listing_price numeric,
  currency text,
  instructions text,
  payment_required boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT ps.bank_name, ps.account_number, ps.account_name,
         ps.listing_price, ps.currency, ps.instructions, ps.payment_required
  FROM public.payment_settings AS ps
  ORDER BY ps.created_at ASC, ps.id ASC
  LIMIT 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_listing_payment_instructions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_listing_payment_instructions() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_listing_payment_instructions() TO authenticated;

COMMENT ON FUNCTION public.get_listing_payment_instructions() IS 'Returns only the current payment instructions required by authenticated listing submitters; full payment settings remain admin-only.';
