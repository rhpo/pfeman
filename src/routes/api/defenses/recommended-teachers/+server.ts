import { json } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const assignmentId = url.searchParams.get("assignment_id");
  if (!assignmentId) {
    return json({ teachers: [] });
  }

  const repos = createRepositories();

  // Load the PFE assignment to get the subject and supervisor
  const assignment = await repos.assignments.findById(assignmentId);
  if (!assignment) {
    return json({ teachers: [] });
  }

  // Load the subject to know the specialty
  const subject = await repos.subjects.findById(assignment.subject_id);
  if (!subject) {
    return json({ teachers: [] });
  }

  // Load all teachers and their profiles
  const [teacherRows, teacherProfiles] = await Promise.all([
    repos.users.findAllTeachers(),
    repos.users.findProfilesByRole("teacher"),
  ]);

  // Build a map of profile_id -> teacher row for quick lookup
  const teacherMap = new Map(teacherRows.map((t) => [t.profile_id, t]));

  // Filter according to criteria 1, 2, and 4:
  // Criterion 1: availability_status === "disponible"
  // Criterion 2: specialty compatible (teacher's specialties include the subject's specialty)
  // Criterion 4: not the supervisor of the PFE
  const eligible = teacherProfiles.filter((profile) => {
    const teacher = teacherMap.get(profile.id);
    if (!teacher) return false;

    // Criterion 1: available
    if (teacher.availability_status !== "disponible") return false;

    // Criterion 2: specialty compatible
    const subjectSpecialty = subject.specialty;
    if (!teacher.specialties.includes(subjectSpecialty)) return false;

    // Criterion 4: not the supervisor of the PFE
    if (profile.id === assignment.supervisor_id) return false;

    return true;
  });

  const teachers = eligible.map((p) => ({
    id: p.id,
    full_name: p.full_name,
  }));

  return json({ teachers });
};
