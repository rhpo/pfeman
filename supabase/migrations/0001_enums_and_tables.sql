-- 0001_enums_and_tables.sql
-- PFE Manager — all enums and tables

-- =============
-- ENUMS
-- =============

CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin', 'company');
CREATE TYPE public.pfe_type AS ENUM ('internal', 'external');
CREATE TYPE public.subject_status AS ENUM (
  'draft', 'submitted', 'teacher_reviewing', 'teacher_approved',
  'admin_validated', 'rejected', 'assigned', 'in_progress',
  'defended', 'archived'
);
CREATE TYPE public.level AS ENUM ('licence', 'master', 'ingenieur');
CREATE TYPE public.defense_result AS ENUM ('admitted', 'corrections_required', 'not_admitted');
CREATE TYPE public.defense_status AS ENUM ('scheduled', 'done', 'postponed');

-- =============
-- TABLES
-- =============

-- profiles: 1-to-1 with auth.users
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.user_role NOT NULL DEFAULT 'student',
  full_name  text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- students
CREATE TABLE public.students (
  profile_id     uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_number text NOT NULL UNIQUE,
  specialty      text NOT NULL,
  level          public.level NOT NULL,
  promotion_year integer NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- teachers
CREATE TABLE public.teachers (
  profile_id  uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade       text NOT NULL,
  department  text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- companies
CREATE TABLE public.companies (
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
CREATE TABLE public.pfe_subjects (
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
CREATE TABLE public.pfe_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id      uuid NOT NULL UNIQUE REFERENCES public.pfe_subjects(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES public.students(profile_id) ON DELETE RESTRICT,
  supervisor_id   uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE RESTRICT,
  co_supervisor_id uuid REFERENCES public.companies(profile_id) ON DELETE SET NULL,
  assigned_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- pfe_progress_reports (FicheSuiviPFE)
CREATE TABLE public.pfe_progress_reports (
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
CREATE TABLE public.defense_juries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.pfe_assignments(id) ON DELETE CASCADE,
  president_id  uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE RESTRICT,
  member1_id    uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE RESTRICT,
  member2_id    uuid REFERENCES public.teachers(profile_id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- defenses
CREATE TABLE public.defenses (
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
CREATE TABLE public.notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}',
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- audit_logs
CREATE TABLE public.audit_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text NOT NULL,
  metadata   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- pfe_status_history
CREATE TABLE public.pfe_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  uuid NOT NULL REFERENCES public.pfe_subjects(id) ON DELETE CASCADE,
  from_status public.subject_status,
  to_status   public.subject_status NOT NULL,
  actor_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =============
-- INDEXES
-- =============

CREATE INDEX idx_pfe_subjects_status ON public.pfe_subjects(status);
CREATE INDEX idx_pfe_subjects_proposer ON public.pfe_subjects(proposer_id);
CREATE INDEX idx_pfe_subjects_specialty ON public.pfe_subjects(specialty);
CREATE INDEX idx_pfe_assignments_student ON public.pfe_assignments(student_id);
CREATE INDEX idx_pfe_assignments_supervisor ON public.pfe_assignments(supervisor_id);
CREATE INDEX idx_pfe_progress_reports_assignment ON public.pfe_progress_reports(assignment_id);
CREATE INDEX idx_defenses_assignment ON public.defenses(assignment_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id) WHERE read_at IS NULL;
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX idx_pfe_status_history_subject ON public.pfe_status_history(subject_id);

-- =============
-- updated_at auto-update trigger function
-- =============

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pfe_subjects_updated_at BEFORE UPDATE ON public.pfe_subjects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pfe_assignments_updated_at BEFORE UPDATE ON public.pfe_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pfe_progress_reports_updated_at BEFORE UPDATE ON public.pfe_progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_defense_juries_updated_at BEFORE UPDATE ON public.defense_juries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_defenses_updated_at BEFORE UPDATE ON public.defenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
