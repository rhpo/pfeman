import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export async function removeWish(
  repos: IRepositories,
  user: SessionUser,
  wishId: string,
) {
  const wish = await repos.wishes.findById(wishId);
  if (!wish) throw new Error("Wish not found");
  if (wish.student_id !== user.id) throw new Error("Not your wish to remove");
  if (wish.status !== "en_attente") throw new Error("Cannot remove a wish that has been decided");

  await repos.wishes.delete(wishId);
}
