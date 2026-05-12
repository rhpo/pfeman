import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export async function archivePfe(
  repos: IRepositories,
  _user: SessionUser,
  assignmentId: string,
) {
  return repos.assignments.updateStatus(assignmentId, "valide");
}
