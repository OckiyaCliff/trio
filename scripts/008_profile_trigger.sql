-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    CASE 
      WHEN (new.raw_user_meta_data ->> 'role') = 'super_admin' THEN 'student'::user_role
      ELSE COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'student')
    END,
    CASE 
      WHEN new.raw_user_meta_data ->> 'school_id' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'school_id')::uuid
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
