import type {
  IRepositories,
  SubjectStatus,
} from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { ReviewSubjectInput } from "$lib/server/validators/subject.schema";

export async function reviewSubject(
  repos: IRepositories,
  _user: SessionUser,
  subjectId: string,
  input: ReviewSubjectInput,
) {
  return repos.subjects.updateStatus(subjectId, input.status as SubjectStatus);
}
