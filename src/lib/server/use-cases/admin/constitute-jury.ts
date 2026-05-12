import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { CreateJuryInput } from "$lib/server/validators/defense.schema";

export async function constituteJury(
  repos: IRepositories,
  _user: SessionUser,
  input: CreateJuryInput,
) {
  return repos.defenses.insertJury({
    assignment_id: input.assignment_id,
    president_id: input.president_id,
    member_id: input.member_id,
  });
}
