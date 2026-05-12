import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface CompanyAssignStudentInput {
  subjectId: string;
  studentIds: string[];
  coSupervisorId?: string;
}

export async function assignStudent(
  repos: IRepositories,
  _user: SessionUser,
  input: CompanyAssignStudentInput,
) {
  const activeYear = await repos.academicYears.findActive();
  if (!activeYear) throw new Error("No active academic year found");

  const subject = await repos.subjects.findById(input.subjectId);
  if (!subject) throw new Error("Subject not found");

  const maxStudents =
    subject.group_type === "monome" ? 1
    : subject.group_type === "binome" ? 2
    : 3;

  if (input.studentIds.length > maxStudents) {
    throw new Error(`This subject accepts at most ${maxStudents} student(s)`);
  }

  const results = [];
  for (const studentId of input.studentIds) {
    const assignment = await repos.assignments.insert({
      subject_id: input.subjectId,
      academic_year_id: activeYear.id,
      student_id: studentId,
      supervisor_id: _user.id,
      co_supervisor_id: input.coSupervisorId ?? null,
    });
    results.push(assignment);
  }

  return results;
}
