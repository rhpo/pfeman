import type { IRepositories, AvailabilityStatus } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface SetAvailabilityInput {
  status: AvailabilityStatus;
  unavailableUntil?: string | null;
}

export async function setAvailability(
  repos: IRepositories,
  user: SessionUser,
  input: SetAvailabilityInput,
) {
  return repos.users.updateTeacherAvailability(user.id, {
    availability_status: input.status,
    unavailable_until: input.unavailableUntil ?? null,
  });
}
