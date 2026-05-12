-- 0006_sync_domain_tables_trigger.sql
-- Updates handle_new_user to automatically link or create domain table records.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  detected_role public.user_role;
  full_nm text;
BEGIN
  -- Determine role
  detected_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::public.user_role,
    'student'
  );
  
  full_nm := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');

  -- 1. Create Profile
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    detected_role,
    full_nm,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- 2. Sync with domain tables
  IF detected_role = 'company' THEN
    -- For companies, created via signup, create the company record
    INSERT INTO public.companies (profile_id, company_name)
    VALUES (NEW.id, full_nm)
    ON CONFLICT (profile_id) DO NOTHING;
    
  ELSIF detected_role = 'student' THEN
    -- For students, check if whitelisted by email
    UPDATE public.students 
    SET profile_id = NEW.id 
    WHERE email = NEW.email AND profile_id IS NULL;
    
  ELSIF detected_role = 'teacher' THEN
    -- For teachers, check if whitelisted by email
    UPDATE public.teachers 
    SET profile_id = NEW.id 
    WHERE email = NEW.email AND profile_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
