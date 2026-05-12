import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const teacherId = locals.user.id;

  const activeYear = await repos.academicYears.findActive();
  const yearId = activeYear?.id ?? "";

  const [
    supervisedPfes,
    subjectsToValidate,
    allDefenses,
    notifications,
    teacherProfile,
    proposedSubjects,
  ] = await Promise.all([
    repos.assignments.findBySupervisor(teacherId),
    repos.subjects.findByValidator(teacherId),
    repos.defenses.findAll(),
    repos.notifications.findByRecipient(teacherId),
    repos.users.findTeacherByProfileId(teacherId),
    repos.subjects.findByProposer(teacherId),
  ]);

  // Find jury duties: load all juries and check if teacher is president or member
  const juryDuties = allDefenses.filter((d) => {
    return d.jury_id === teacherId;
  });

  // Actually we need to load juries separately since DefenseRow has jury_id but it's a FK to defense_juries
  // Let's load all juries and match
  const allJuries = await Promise.all(
    allDefenses.map((d) => repos.defenses.findByAssignment(d.assignment_id))
  );

  const teacherJuryDefenses = allDefenses.filter((_, i) => {
    const jury = allJuries[i];
    if (!jury?.defense_juries) return false;
    return (
      jury.defense_juries.president_id === teacherId ||
      jury.defense_juries.member_id === teacherId
    );
  });

  const upcomingJuryDuties = teacherJuryDefenses
    .filter((d) => d.status === "scheduled")
    .slice(0, 2)
    .map((d) => ({
      id: d.id,
      scheduled_at: formatDate(d.scheduled_at),
      room: d.room ?? "-",
    }));

  const pendingValidation = subjectsToValidate.filter(
    (s) => s.status === "en_attente"
  );

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return {
    supervisedCount: supervisedPfes.length,
    pendingValidationCount: pendingValidation.length,
    proposedCount: proposedSubjects.length,
    upcomingJuryDuties,
    availabilityStatus: teacherProfile?.availability_status ?? "disponible",
    unavailableUntil: teacherProfile?.unavailable_until ?? null,
    unreadCount,
    yearId,
  };
};
