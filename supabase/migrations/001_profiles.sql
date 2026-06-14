-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- is_admin() MUST be defined before policies that use it
-- SECURITY DEFINER bypasses RLS inside the function — prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.check_email_registered(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = email_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_invite_status(email_input TEXT)
RETURNS TEXT AS $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  SELECT * INTO user_record FROM auth.users WHERE email = email_input LIMIT 1;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF user_record.last_sign_in_at IS NULL AND user_record.encrypted_password = '' THEN RETURN 'invited'; END IF;
  RETURN 'registered';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
