-- 0004_views.sql
-- Admin dashboard views for stats aggregation

-- =============
-- v_admin_pfe_overview — aggregate PFEs by status, specialty, level, year
-- =============

CREATE OR REPLACE VIEW public.v_admin_pfe_overview AS
SELECT
  s.status,
  s.specialty,
  s.level,
  extract(year FROM s.created_at)::integer AS year,
  count(*)::integer AS total,
  count(a.id)::integer AS assigned_count,
  count(d.id)::integer AS defended_count
FROM public.pfe_subjects s
LEFT JOIN public.pfe_assignments a ON a.subject_id = s.id
LEFT JOIN public.defenses d ON d.assignment_id = a.id AND d.status = 'done'
GROUP BY s.status, s.specialty, s.level, extract(year FROM s.created_at);

-- =============
-- v_subject_details — enriched subject view with proposer + assignment info
-- =============

CREATE OR REPLACE VIEW public.v_subject_details AS
SELECT
  s.*,
  p.full_name AS proposer_name,
  p.avatar_url AS proposer_avatar,
  a.student_id,
  a.supervisor_id,
  a.co_supervisor_id,
  sp.full_name AS student_name,
  tp.full_name AS supervisor_name
FROM public.pfe_subjects s
JOIN public.profiles p ON p.id = s.proposer_id
LEFT JOIN public.pfe_assignments a ON a.subject_id = s.id
LEFT JOIN public.profiles sp ON sp.id = a.student_id
LEFT JOIN public.profiles tp ON tp.id = a.supervisor_id;

-- =============
-- v_defense_schedule — defense calendar with jury and student info
-- =============

CREATE OR REPLACE VIEW public.v_defense_schedule AS
SELECT
  d.id AS defense_id,
  d.scheduled_at,
  d.room,
  d.status AS defense_status,
  d.result,
  d.grade,
  s.title AS subject_title,
  s.code AS subject_code,
  sp.full_name AS student_name,
  tp.full_name AS supervisor_name,
  pp.full_name AS president_name,
  m1p.full_name AS member1_name,
  m2p.full_name AS member2_name
FROM public.defenses d
JOIN public.pfe_assignments a ON a.id = d.assignment_id
JOIN public.pfe_subjects s ON s.id = a.subject_id
JOIN public.profiles sp ON sp.id = a.student_id
JOIN public.profiles tp ON tp.id = a.supervisor_id
JOIN public.defense_juries j ON j.id = d.jury_id
JOIN public.profiles pp ON pp.id = j.president_id
JOIN public.profiles m1p ON m1p.id = j.member1_id
LEFT JOIN public.profiles m2p ON m2p.id = j.member2_id;

-- =============
-- v_teacher_workload — how many PFEs each teacher supervises
-- =============

CREATE OR REPLACE VIEW public.v_teacher_workload AS
SELECT
  t.profile_id,
  p.full_name,
  t.grade,
  t.department,
  count(a.id)::integer AS supervised_count,
  count(j.id)::integer AS jury_count
FROM public.teachers t
JOIN public.profiles p ON p.id = t.profile_id
LEFT JOIN public.pfe_assignments a ON a.supervisor_id = t.profile_id
LEFT JOIN public.defense_juries j ON j.president_id = t.profile_id
  OR j.member1_id = t.profile_id
  OR j.member2_id = t.profile_id
GROUP BY t.profile_id, p.full_name, t.grade, t.department;
