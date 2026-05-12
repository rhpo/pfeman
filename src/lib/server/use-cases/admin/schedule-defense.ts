import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { ScheduleDefenseInput } from "$lib/server/validators/defense.schema";

export async function scheduleDefense(
  repos: IRepositories,
  _user: SessionUser,
  input: ScheduleDefenseInput,
) {
  return repos.defenses.insertDefense({
    assignment_id: input.assignment_id,
    jury_id: input.jury_id,
    scheduled_at: input.scheduled_at,
    room: input.room,
  });
}
