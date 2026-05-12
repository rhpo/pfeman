import type { SessionUser } from "$lib/types/domain";
import type { IRepositories } from "$lib/server/repositories/port";
import type { AssignmentInput } from "$lib/server/validators/auth.schema";

export async function assignSupervisor(
  repos: IRepositories,
  _user: SessionUser,
  input: AssignmentInput,
) {
  const activeYear = await repos.academicYears.findActive();
  if (!activeYear) throw new Error("No active academic year found");

  await repos.subjects.updateStatus(input.subject_id, "valide");
  return repos.assignments.insert({
    subject_id: input.subject_id,
    academic_year_id: activeYear.id,
    student_id: input.student_id,
    supervisor_id: input.supervisor_id,
    co_supervisor_id: input.co_supervisor_id ?? null,
  });
}
