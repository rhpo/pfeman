import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export async function transferAdminRole(
  repos: IRepositories,
  currentAdmin: SessionUser,
  targetProfileId: string,
) {
  // Demote current admin to teacher
  await repos.users.updateProfile(currentAdmin.id, { role: "teacher" });
  // Promote target to admin
  await repos.users.updateProfile(targetProfileId, { role: "admin" });
}
