import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export async function viewMyPfe(repos: IRepositories, user: SessionUser) {
  return repos.assignments.findByStudent(user.id);
}
