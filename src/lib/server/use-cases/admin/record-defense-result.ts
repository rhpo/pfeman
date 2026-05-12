import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { RecordDefenseResultInput } from "$lib/server/validators/defense.schema";

export async function recordDefenseResult(
  repos: IRepositories,
  _user: SessionUser,
  defenseId: string,
  input: RecordDefenseResultInput,
) {
  return repos.defenses.updateDefenseResult(defenseId, {
    status: input.status,
    result: input.result,
    final_grade: input.grade,
    comment: input.comment,
  });
}
