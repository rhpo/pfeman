import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export async function listOwnSubjects(repos: IRepositories, user: SessionUser) {
  return repos.subjects.findByProposer(user.id);
}
