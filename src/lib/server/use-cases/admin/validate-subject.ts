import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { ValidateSubjectInput } from "$lib/server/validators/subject.schema";

export async function validateSubject(
  repos: IRepositories,
  _user: SessionUser,
  subjectId: string,
  input: ValidateSubjectInput,
) {
  return repos.subjects.updateStatus(subjectId, input.status);
}
