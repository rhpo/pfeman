-- 0005_whitelist_and_domain_restriction.sql
-- Modifies students and teachers tables to allow pre-registration by email
-- and adds domain restriction triggers.

-- 1. Modify students table
-- First, add an email column and make profile_id nullable
ALTER TABLE public.students ADD COLUMN email text UNIQUE;
ALTER TABLE public.students ALTER COLUMN profile_id DROP NOT NULL;

-- 2. Modify teachers table
-- Add an email column and make profile_id nullable
ALTER TABLE public.teachers ADD COLUMN email text UNIQUE;
ALTER TABLE public.teachers ALTER COLUMN profile_id DROP NOT NULL;

-- 3. Update the handle_new_user trigger to NOT auto-assign roles from nowhere
-- It should just create a "guest" profile if not found, or ideally we handle 
-- the actual role assignment in the callback logic for more control.
-- Actually, let's make the trigger smarter or just leave it for now and 
-- handle the restriction in SvelteKit.

-- 4. Function to check if an email is whitelisted
CREATE OR REPLACE FUNCTION public.check_user_whitelist(email_to_check text)
RETURNS TABLE(found_role public.user_role) AS $$
BEGIN
  -- Check teachers first
  IF EXISTS (SELECT 1 FROM public.teachers t WHERE t.email = email_to_check) THEN
    RETURN QUERY SELECT 'teacher'::public.user_role;
    RETURN;
  END IF;
  
  -- Check students
  IF EXISTS (SELECT 1 FROM public.students s WHERE s.email = email_to_check) THEN
    RETURN QUERY SELECT 'student'::public.user_role;
    RETURN;
  END IF;
  
  -- Check if they are already in profiles as admin (superadmins added manually)
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT id FROM auth.users WHERE email = email_to_check) AND p.role = 'admin') THEN
    RETURN QUERY SELECT 'admin'::public.user_role;
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
