-- Drop existing policies on system_settings
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;

-- Allow anyone to read system_settings (needed for login verification)
CREATE POLICY "Anyone can view system settings" ON public.system_settings
  FOR SELECT USING (true);

-- Only authenticated admins can update
CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));