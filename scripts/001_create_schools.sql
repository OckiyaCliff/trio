-- Schools table (tenants)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g., "GREENWOOD-HS"
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
