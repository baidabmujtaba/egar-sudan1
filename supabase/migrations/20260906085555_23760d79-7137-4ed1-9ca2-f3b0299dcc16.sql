CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL DEFAULT 'بنك الخرطوم (بنكك)',
  account_number text NOT NULL DEFAULT '2816133',
  account_name text NOT NULL DEFAULT 'محمد المجتبى عبدالإله محمد عبدالرحمن',
  listing_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SDG',
  instructions text,
  payment_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment settings"
ON public.payment_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment settings"
ON public.payment_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment settings"
ON public.payment_settings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_dormitories_updated_at();

INSERT INTO public.payment_settings (listing_price, instructions)
VALUES (0, 'بعد التحويل، الرجاء إرفاق صورة إشعار الدفع لتأكيد الطلب.');