import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { CreateProgressReportInput } from "$lib/server/validators/progress.schema";

export async function fillProgressReport(
  repos: IRepositories,
  _user: SessionUser,
  input: CreateProgressReportInput,
) {
  return repos.progress.insert({
    assignment_id: input.assignment_id,
    meeting_date: input.meeting_date,
    student_notes: input.student_notes,
    attachments: input.attachments ?? [],
  });
}
