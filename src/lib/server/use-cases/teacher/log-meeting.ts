import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface LogMeetingInput {
  assignmentId: string;
  meetingDate: string;
  notes: string;
  progress: string;
}

export async function logMeeting(
  repos: IRepositories,
  _user: SessionUser,
  input: LogMeetingInput,
) {
  return repos.progress.insert({
    assignment_id: input.assignmentId,
    meeting_date: input.meetingDate,
    student_notes: input.notes,
  });
}
