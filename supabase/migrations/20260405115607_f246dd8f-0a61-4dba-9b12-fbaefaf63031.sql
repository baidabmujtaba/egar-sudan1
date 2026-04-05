
DROP POLICY "Auth users can insert images" ON public.property_images;
CREATE POLICY "Users can insert images for own properties" ON public.property_images
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
