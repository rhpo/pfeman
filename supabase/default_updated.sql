/*
  PFE Manager — Unified Migration Script (default_updated.sql)
  Combines all migrations (0001-0006) into a single execution file.
  Use this after a DB reset.
*/

-- =============
-- 1. ENUMS
-- =============
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin', 'company');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.pfe_type AS ENUM ('internal', 'external');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.subject_status AS ENUM (
      'draft', 'submitted', 'teacher_reviewing', 'teacher_approved',
      'admin_validated', 'rejected', 'assigned', 'in_progress',
      'defended', 'archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.level AS ENUM ('licence', 'master', 'ingenieur');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.defense_result AS ENUM ('admitted', 'corrections_required', 'not_admitted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.defense_status AS ENUM ('scheduled', 'done', 'postponed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============
-- 2. TABLES
-- =============

-- profiles: 1-to-1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.user_role NOT NULL DEFAULT 'student',
  full_name  text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- students (Updated with whitelist support)
CREATE TABLE IF NOT EXISTS public.students (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email          text UNIQUE,
  student_number text NOT NULL UNIQUE,
  specialty      text NOT NULL,
  level          public.level NOT NULL,
  promotion_year integer NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- teachers (Updated with whitelist support)
CREATE TABLE IF NOT EXISTS public.teachers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email       text UNIQUE,
  grade       text NOT NULL,
  department  text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- companies
CREATE TABLE IF NOT EXISTS public.companies (
  profile_id    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name  text NOT NULL,
  address       text NOT NULL DEFAULT '',
  sector        text NOT NULL DEFAULT '',
  website       text,
  contact_phone text NOT NULL DEFAULT '',
  is_verified   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- pfe_subjects
CREATE TABLE IF NOT EXISTS public.pfe_subjects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE,
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  type          public.pfe_type NOT NULL DEFAULT 'internal',
  specialty     text NOT NULL,
  level         public.level NOT NULL,
  proposer_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  proposer_role public.user_role NOT NULL,
  company_id    uuid REFERENCES public.companies(profile_id) ON DELETE SET NULL,
  status        public.subject_status NOT NULL DEFAULT 'draft',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- pfe_assignments
CREATE TABLE IF NOT EXISTS public.pfe_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id      uuid NOT NULL UNIQUE REFERENCES public.pfe_subjects(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  supervisor_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  co_supervisor_id uuid REFERENCES public.companies(profile_id) ON DELETE SET NULL,
  assigned_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- pfe_progress_reports
CREATE TABLE IF NOT EXISTS public.pfe_progress_reports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id     uuid NOT NULL REFERENCES public.pfe_assignments(id) ON DELETE CASCADE,
  meeting_date      date NOT NULL,
  student_notes     text NOT NULL DEFAULT '',
  teacher_feedback  text,
  attachments       text[] NOT NULL DEFAULT '{}',
  signed_by_teacher boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- defense_juries
CREATE TABLE IF NOT EXISTS public.defense_juries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.pfe_assignments(id) ON DELETE CASCADE,
  president_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  member1_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  member2_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- defenses
CREATE TABLE IF NOT EXISTS public.defenses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.pfe_assignments(id) ON DELETE CASCADE,
  jury_id       uuid NOT NULL REFERENCES public.defense_juries(id) ON DELETE RESTRICT,
  scheduled_at  timestamptz NOT NULL,
  room          text NOT NULL DEFAULT '',
  status        public.defense_status NOT NULL DEFAULT 'scheduled',
  result        public.defense_result,
  grade         numeric(5,2),
  comment       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}',
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text NOT NULL,
  metadata   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- pfe_status_history
CREATE TABLE IF NOT EXISTS public.pfe_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  uuid NOT NULL REFERENCES public.pfe_subjects(id) ON DELETE CASCADE,
  from_status public.subject_status,
  to_status   public.subject_status NOT NULL,
  actor_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =============
-- 3. FUNCTIONS & TRIGGERS
-- =============

-- Common: updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at to all relevant tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'students', 'teachers', 'companies', 'pfe_subjects', 'pfe_assignments', 'pfe_progress_reports', 'defense_juries', 'defenses') LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t, t);
  END LOOP;
END $$;

-- Auth: handle_new_user (Unified Logic from 0003 + 0006)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  detected_role public.user_role;
  full_nm text;
BEGIN
  -- 1. Determine role from metadata or default to student
  -- SPECIAL CASE: Hardcoded administrators
  IF NEW.email IN ('ramy.hadid@esst-sup.com', 'admin@esst-sup.com') THEN
    detected_role := 'admin';
  ELSE
    detected_role := COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'student'
    );
  END IF;
  
  full_nm := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');

  -- 2. Create Profile
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    detected_role,
    full_nm,
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    )
  );

  -- 3. Sync with domain tables
  IF detected_role = 'admin' THEN
     -- Admins who are teachers (the two hardcoded admins) should also be linked to teacher table if they exist there
     UPDATE public.teachers SET profile_id = NEW.id WHERE email = NEW.email AND profile_id IS NULL;
  ELSIF detected_role = 'company' THEN
    INSERT INTO public.companies (profile_id, company_name)
    VALUES (NEW.id, full_nm)
    ON CONFLICT (profile_id) DO NOTHING;
  ELSIF detected_role = 'student' THEN
    UPDATE public.students SET profile_id = NEW.id WHERE email = NEW.email AND profile_id IS NULL;
  ELSIF detected_role = 'teacher' THEN
    UPDATE public.teachers SET profile_id = NEW.id WHERE email = NEW.email AND profile_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============
-- PRE-APPROVED ADMINS (WHITELIST)
-- =============
INSERT INTO public.teachers (email, grade, department)
VALUES 
  ('ramy.hadid@esst-sup.com', 'Professor', 'Administration'),
  ('admin@esst-sup.com', 'Director', 'Administration')
ON CONFLICT (email) DO NOTHING;

-- PFE: code generation
CREATE OR REPLACE FUNCTION public.generate_pfe_code()
RETURNS trigger AS $$
DECLARE
  seq_num integer;
  spec_abbr text;
  yr text;
BEGIN
  IF NEW.status = 'admin_validated' AND (OLD.status IS DISTINCT FROM 'admin_validated') AND NEW.code IS NULL THEN
    yr := to_char(now(), 'YYYY');
    spec_abbr := upper(left(NEW.specialty, 4));
    SELECT count(*) + 1 INTO seq_num FROM public.pfe_subjects WHERE code IS NOT NULL AND specialty = NEW.specialty AND extract(year FROM created_at) = extract(year FROM now());
    NEW.code := 'PFE-' || lpad(seq_num::text, 2, '0') || '-' || spec_abbr || '-' || yr;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_pfe_code ON public.pfe_subjects;
CREATE TRIGGER trg_generate_pfe_code BEFORE UPDATE ON public.pfe_subjects FOR EACH ROW EXECUTE FUNCTION public.generate_pfe_code();

-- Business Logic: status history
CREATE OR REPLACE FUNCTION public.track_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.pfe_status_history (subject_id, from_status, to_status, actor_id) VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_track_status_change ON public.pfe_subjects;
CREATE TRIGGER trg_track_status_change AFTER UPDATE ON public.pfe_subjects FOR EACH ROW EXECUTE FUNCTION public.track_status_change();

-- Notifications: status and assignment
CREATE OR REPLACE FUNCTION public.notify_status_change() RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (recipient_id, type, payload) VALUES (NEW.proposer_id, 'subject_status_changed', jsonb_build_object('subject_id', NEW.id, 'title', NEW.title, 'from_status', OLD.status, 'to_status', NEW.status));
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_status_change ON public.pfe_subjects;
CREATE TRIGGER trg_notify_status_change AFTER UPDATE ON public.pfe_subjects FOR EACH ROW EXECUTE FUNCTION public.notify_status_change();

-- =============
-- 4. RLS POLICIES
-- =============

-- Helper: role extraction
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING (public.get_user_role() = 'admin');

-- Other tables Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfe_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfe_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfe_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defense_juries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfe_status_history ENABLE ROW LEVEL SECURITY;

-- Basic Whitelist View Function
CREATE OR REPLACE FUNCTION public.check_user_whitelist(email_to_check text)
RETURNS TABLE(found_role public.user_role) AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.teachers t WHERE t.email = email_to_check) THEN
    RETURN QUERY SELECT 'teacher'::public.user_role;
  ELSIF EXISTS (SELECT 1 FROM public.students s WHERE s.email = email_to_check) THEN
    RETURN QUERY SELECT 'student'::public.user_role;
  END IF;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============
-- 5. VIEWS
-- =============

CREATE OR REPLACE VIEW public.v_admin_pfe_overview AS
SELECT s.status, s.specialty, s.level, extract(year FROM s.created_at)::integer AS year, count(*)::integer AS total, count(a.id)::integer AS assigned_count, count(d.id)::integer AS defended_count
FROM public.pfe_subjects s LEFT JOIN public.pfe_assignments a ON a.subject_id = s.id LEFT JOIN public.defenses d ON d.assignment_id = a.id AND d.status = 'done'
GROUP BY s.status, s.specialty, s.level, extract(year FROM s.created_at);

-- =============
-- 6. STORAGE
-- =============
INSERT INTO storage.buckets (id, name, public) VALUES ('pfe-documents', 'pfe-documents', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS storage_insert_auth ON storage.objects;
CREATE POLICY storage_insert_auth ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pfe-documents' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS storage_select_public ON storage.objects;
CREATE POLICY storage_select_public ON storage.objects FOR SELECT USING (bucket_id = 'pfe-documents');
