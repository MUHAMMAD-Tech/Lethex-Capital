-- Drop existing policy on holders
DROP POLICY IF EXISTS "Admins can manage holders" ON public.holders;

-- Allow anyone to read holders (needed for login verification)
CREATE POLICY "Anyone can view holders" ON public.holders
  FOR SELECT USING (true);

-- Only authenticated admins can insert, update, delete
CREATE POLICY "Admins can insert holders" ON public.holders
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update holders" ON public.holders
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete holders" ON public.holders
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));