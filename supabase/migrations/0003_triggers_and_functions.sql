-- 0003_triggers_and_functions.sql
-- Business-logic triggers: auto-profile, PFE code generation, status history, notifications

-- =============
-- 1. Auto-create profiles row on auth.users insert
-- =============

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'student'
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============
-- 2. Auto-generate PFE code on status → admin_validated
-- Format: PFE-XX-SPEC-YEAR where XX is a zero-padded sequence
-- =============

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

    SELECT count(*) + 1 INTO seq_num
    FROM public.pfe_subjects
    WHERE code IS NOT NULL
      AND specialty = NEW.specialty
      AND extract(year FROM created_at) = extract(year FROM now());

    NEW.code := 'PFE-' || lpad(seq_num::text, 2, '0') || '-' || spec_abbr || '-' || yr;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_pfe_code
  BEFORE UPDATE ON public.pfe_subjects
  FOR EACH ROW EXECUTE FUNCTION public.generate_pfe_code();

-- =============
-- 3. Auto-insert pfe_status_history on every status change
-- =============

CREATE OR REPLACE FUNCTION public.track_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.pfe_status_history (subject_id, from_status, to_status, actor_id)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_track_status_change
  AFTER UPDATE ON public.pfe_subjects
  FOR EACH ROW EXECUTE FUNCTION public.track_status_change();

-- =============
-- 4. Auto-create notifications on key lifecycle events
-- =============

-- 4a. Notify when a subject status changes
CREATE OR REPLACE FUNCTION public.notify_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify the proposer
    INSERT INTO public.notifications (recipient_id, type, payload)
    VALUES (
      NEW.proposer_id,
      'subject_status_changed',
      jsonb_build_object(
        'subject_id', NEW.id,
        'title', NEW.title,
        'from_status', OLD.status,
        'to_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_status_change
  AFTER UPDATE ON public.pfe_subjects
  FOR EACH ROW EXECUTE FUNCTION public.notify_status_change();

-- 4b. Notify student + supervisor when assignment is created
CREATE OR REPLACE FUNCTION public.notify_assignment_created()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, payload)
  VALUES
    (NEW.student_id, 'assignment_created', jsonb_build_object('assignment_id', NEW.id, 'subject_id', NEW.subject_id)),
    (NEW.supervisor_id, 'assignment_created', jsonb_build_object('assignment_id', NEW.id, 'subject_id', NEW.subject_id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_assignment_created
  AFTER INSERT ON public.pfe_assignments
  FOR EACH ROW EXECUTE FUNCTION public.notify_assignment_created();

-- 4c. Notify student when defense is scheduled
CREATE OR REPLACE FUNCTION public.notify_defense_scheduled()
RETURNS trigger AS $$
DECLARE
  sid uuid;
BEGIN
  SELECT a.student_id INTO sid
  FROM public.pfe_assignments a WHERE a.id = NEW.assignment_id;

  INSERT INTO public.notifications (recipient_id, type, payload)
  VALUES (
    sid,
    'defense_scheduled',
    jsonb_build_object(
      'defense_id', NEW.id,
      'scheduled_at', NEW.scheduled_at,
      'room', NEW.room
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_defense_scheduled
  AFTER INSERT ON public.defenses
  FOR EACH ROW EXECUTE FUNCTION public.notify_defense_scheduled();

-- 4d. Notify supervisor when progress report is submitted
CREATE OR REPLACE FUNCTION public.notify_progress_report()
RETURNS trigger AS $$
DECLARE
  sup_id uuid;
BEGIN
  SELECT a.supervisor_id INTO sup_id
  FROM public.pfe_assignments a WHERE a.id = NEW.assignment_id;

  INSERT INTO public.notifications (recipient_id, type, payload)
  VALUES (
    sup_id,
    'progress_report_submitted',
    jsonb_build_object(
      'report_id', NEW.id,
      'assignment_id', NEW.assignment_id,
      'meeting_date', NEW.meeting_date
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_progress_report
  AFTER INSERT ON public.pfe_progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_progress_report();

-- =============
-- 5. Storage bucket for PFE documents
-- =============

INSERT INTO storage.buckets (id, name, public)
VALUES ('pfe-documents', 'pfe-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_insert_auth ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pfe-documents' AND auth.uid() IS NOT NULL
  );

CREATE POLICY storage_select_public ON storage.objects
  FOR SELECT USING (bucket_id = 'pfe-documents');

CREATE POLICY storage_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pfe-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );
