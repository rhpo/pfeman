/*
  Seed Test Data for PFE Manager
  Inserts 6 students, 4 teachers, and 2 company accounts.
  Includes avatar URLs and correctly links with whitelists.
*/

-- 1. WHITELIST TEACHERS
INSERT INTO public.teachers (email, grade, department, specialties)
VALUES 
  ('m.henni@esst-sup.com', 'Associate Professor', 'Computer Science', '{AI, Machine Learning}'),
  ('s.belkacem@esst-sup.com', 'Professor', 'Computer Science', '{Cybersecurity, Networks}'),
  ('a.tahar@esst-sup.com', 'Lecturer', 'Mathematics', '{Statistics, Optimization}'),
  ('f.zara@esst-sup.com', 'Associate Professor', 'Information Systems', '{Databases, ERP}')
ON CONFLICT (email) DO NOTHING;

-- 2. WHITELIST STUDENTS
INSERT INTO public.students (email, student_number, specialty, level, promotion_year)
VALUES 
  ('s.amine@esst-sup.com', '2024001', 'Computer Science', 'master', 2025),
  ('l.karima@esst-sup.com', '2024002', 'Cybersecurity', 'master', 2025),
  ('y.omar@esst-sup.com', '2024003', 'Software Engineering', 'ingenieur', 2026),
  ('h.meriem@esst-sup.com', '2024004', 'Data Science', 'master', 2025),
  ('r.aniss@esst-sup.com', '2024005', 'Networks', 'licence', 2025),
  ('n.selma@esst-sup.com', '2024006', 'AI', 'ingenieur', 2026)
ON CONFLICT (email) DO NOTHING;

-- 3. INSERT INTO AUTH.USERS
-- Using a subquery approach to avoid ON CONFLICT issues with auth schema
DO $$
DECLARE
  pwd_hash text := '$2a$10$7Z8V8Y8Y8Y8Y8Y8Y8Y8Y8OQY8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8'; -- dummy
BEGIN
  -- Teachers
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'm.henni@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'm.henni@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mohamed Henni", "role":"teacher", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 's.belkacem@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 's.belkacem@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sofia Belkacem", "role":"teacher", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'a.tahar@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'a.tahar@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmed Tahar", "role":"teacher", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'f.zara@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'f.zara@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatima Zara", "role":"teacher", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  -- Students
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 's.amine@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 's.amine@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amine Saidani", "role":"student", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Amine"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'l.karima@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'l.karima@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karima Louail", "role":"student", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Karima"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'y.omar@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'y.omar@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Omar Yacef", "role":"student", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Omar"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'h.meriem@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'h.meriem@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meriem Hamidi", "role":"student", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Meriem"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'r.aniss@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'r.aniss@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aniss Rahmani", "role":"student", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Aniss"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'n.selma@esst-sup.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'n.selma@esst-sup.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Selma Nait", "role":"student", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=Selma"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  -- Companies
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'contact@tech-solutions.dz') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'contact@tech-solutions.dz', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tech Solutions DZ", "role":"company", "avatar_url":"https://api.dicebear.com/7.x/initials/svg?seed=TS"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hr@algeria-systems.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
    VALUES (gen_random_uuid(), 'hr@algeria-systems.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Algeria Systems", "role":"company", "avatar_url":"https://api.dicebear.com/7.x/initials/svg?seed=AS"}', now(), now(), 'authenticated', '00000000-0000-0000-0000-000000000000');
  END IF;
END $$;
