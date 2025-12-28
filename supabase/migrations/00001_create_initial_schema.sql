-- Create user_role enum
CREATE TYPE public.user_role AS ENUM ('admin', 'holder');

-- Create transaction_type enum
CREATE TYPE public.transaction_type AS ENUM ('swap', 'buy', 'sell');

-- Create transaction_status enum
CREATE TYPE public.transaction_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table (synced with auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role public.user_role NOT NULL DEFAULT 'holder'::public.user_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create system_settings table (stores admin access code)
CREATE TABLE public.system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  admin_access_code text NOT NULL DEFAULT 'Muso2909',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default admin access code
INSERT INTO public.system_settings (id, admin_access_code) VALUES (1, 'Muso2909');

-- Create token_whitelist table (top 50 native coins)
CREATE TABLE public.token_whitelist (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  coingecko_id text NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create holders table
CREATE TABLE public.holders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  access_code text NOT NULL UNIQUE,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create assets table (token holdings per holder)
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid NOT NULL REFERENCES public.holders(id) ON DELETE CASCADE,
  token_symbol text NOT NULL REFERENCES public.token_whitelist(symbol) ON DELETE RESTRICT,
  amount numeric(30, 10) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(holder_id, token_symbol)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid NOT NULL REFERENCES public.holders(id) ON DELETE CASCADE,
  transaction_type public.transaction_type NOT NULL,
  from_token text REFERENCES public.token_whitelist(symbol),
  to_token text REFERENCES public.token_whitelist(symbol),
  amount numeric(30, 10) NOT NULL CHECK (amount > 0),
  fee numeric(30, 10) NOT NULL DEFAULT 0,
  net_amount numeric(30, 10) NOT NULL,
  execution_price numeric(30, 10),
  received_amount numeric(30, 10),
  status public.transaction_status NOT NULL DEFAULT 'pending'::public.transaction_status,
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_assets_holder_id ON public.assets(holder_id);
CREATE INDEX idx_transactions_holder_id ON public.transactions(holder_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'::public.user_role
  );
$$;

-- Create trigger function to sync auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'holder'::public.user_role END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync users on confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for system_settings (admin only)
CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- RLS Policies for token_whitelist (public read, admin write)
CREATE POLICY "Anyone can view token whitelist" ON public.token_whitelist
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage token whitelist" ON public.token_whitelist
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- RLS Policies for holders (admin full access)
CREATE POLICY "Admins can manage holders" ON public.holders
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- RLS Policies for assets (admin full access)
CREATE POLICY "Admins can manage assets" ON public.assets
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- RLS Policies for transactions (admin full access)
CREATE POLICY "Admins can manage transactions" ON public.transactions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));