-- 0002_rls_policies.sql
-- RLS policies per role for every table

-- Helper: extract role from the current user's profile
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============
-- PROFILES
-- =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- STUDENTS
-- =============
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_select_own ON public.students
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY students_select_teacher ON public.students
  FOR SELECT USING (public.get_user_role() IN ('teacher', 'admin'));

CREATE POLICY students_insert_own ON public.students
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY students_update_own ON public.students
  FOR UPDATE USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY students_update_admin ON public.students
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- TEACHERS
-- =============
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_select_all ON public.teachers
  FOR SELECT USING (true);

CREATE POLICY teachers_insert_own ON public.teachers
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY teachers_update_own ON public.teachers
  FOR UPDATE USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY teachers_update_admin ON public.teachers
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- COMPANIES
-- =============
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_select_own ON public.companies
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY companies_select_admin ON public.companies
  FOR SELECT USING (public.get_user_role() IN ('admin', 'teacher'));

CREATE POLICY companies_insert_own ON public.companies
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY companies_update_own ON public.companies
  FOR UPDATE USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY companies_update_admin ON public.companies
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- PFE_SUBJECTS
-- =============
ALTER TABLE public.pfe_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY subjects_select_own ON public.pfe_subjects
  FOR SELECT USING (proposer_id = auth.uid());

CREATE POLICY subjects_select_teacher ON public.pfe_subjects
  FOR SELECT USING (public.get_user_role() IN ('teacher', 'admin'));

CREATE POLICY subjects_select_assigned_student ON public.pfe_subjects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pfe_assignments a
      WHERE a.subject_id = pfe_subjects.id AND a.student_id = auth.uid()
    )
  );

CREATE POLICY subjects_insert_proposer ON public.pfe_subjects
  FOR INSERT WITH CHECK (proposer_id = auth.uid());

CREATE POLICY subjects_update_own_draft ON public.pfe_subjects
  FOR UPDATE USING (proposer_id = auth.uid() AND status IN ('draft', 'rejected'))
  WITH CHECK (proposer_id = auth.uid());

CREATE POLICY subjects_update_teacher ON public.pfe_subjects
  FOR UPDATE USING (public.get_user_role() = 'teacher');

CREATE POLICY subjects_update_admin ON public.pfe_subjects
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- PFE_ASSIGNMENTS
-- =============
ALTER TABLE public.pfe_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignments_select_involved ON public.pfe_assignments
  FOR SELECT USING (
    student_id = auth.uid()
    OR supervisor_id = auth.uid()
    OR co_supervisor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY assignments_insert_admin ON public.pfe_assignments
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY assignments_update_admin ON public.pfe_assignments
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- PFE_PROGRESS_REPORTS
-- =============
ALTER TABLE public.pfe_progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY progress_select_involved ON public.pfe_progress_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pfe_assignments a
      WHERE a.id = pfe_progress_reports.assignment_id
        AND (a.student_id = auth.uid() OR a.supervisor_id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY progress_insert_student ON public.pfe_progress_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pfe_assignments a
      WHERE a.id = assignment_id AND a.student_id = auth.uid()
    )
  );

CREATE POLICY progress_update_teacher ON public.pfe_progress_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pfe_assignments a
      WHERE a.id = pfe_progress_reports.assignment_id
        AND a.supervisor_id = auth.uid()
    )
  );

-- =============
-- DEFENSE_JURIES
-- =============
ALTER TABLE public.defense_juries ENABLE ROW LEVEL SECURITY;

CREATE POLICY juries_select_all_auth ON public.defense_juries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY juries_insert_admin ON public.defense_juries
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY juries_update_admin ON public.defense_juries
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =============
-- DEFENSES
-- =============
ALTER TABLE public.defenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY defenses_select_all_auth ON public.defenses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY defenses_insert_admin ON public.defenses
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY defenses_update_admin ON public.defenses
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY defenses_update_jury ON public.defenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.defense_juries j
      WHERE j.id = defenses.jury_id
        AND (j.president_id = auth.uid() OR j.member1_id = auth.uid() OR j.member2_id = auth.uid())
    )
  );

-- =============
-- NOTIFICATIONS
-- =============
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- =============
-- AUDIT_LOGS
-- =============
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_select_admin ON public.audit_logs
  FOR SELECT USING (public.get_user_role() = 'admin');

-- =============
-- PFE_STATUS_HISTORY
-- =============
ALTER TABLE public.pfe_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY status_history_select_admin ON public.pfe_status_history
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY status_history_select_proposer ON public.pfe_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pfe_subjects s
      WHERE s.id = pfe_status_history.subject_id AND s.proposer_id = auth.uid()
    )
  );
