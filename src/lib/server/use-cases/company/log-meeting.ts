import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface CompanyLogMeetingInput {
  assignmentId: string;
  meetingDate: string;
  notes: string;
}

export async function logMeeting(
  repos: IRepositories,
  _user: SessionUser,
  input: CompanyLogMeetingInput,
) {
  return repos.progress.insert({
    assignment_id: input.assignmentId,
    meeting_date: input.meetingDate,
    student_notes: input.notes,
  });
}
