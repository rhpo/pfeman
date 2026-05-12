import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface AssignValidatorsInput {
  subjectId: string;
  validator1Id: string;
  validator2Id: string;
}

export async function assignValidators(
  repos: IRepositories,
  _user: SessionUser,
  input: AssignValidatorsInput,
) {
  return repos.subjects.updateValidators(input.subjectId, {
    validator1_id: input.validator1Id,
    validator2_id: input.validator2Id,
  });
}
