import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export async function submitWish(
  repos: IRepositories,
  user: SessionUser,
  subjectId: string,
) {
  const activeYear = await repos.academicYears.findActive();
  if (!activeYear) throw new Error("No active academic year found");

  // Check if student already has this subject in wishes
  const existingWishes = await repos.wishes.findByStudent(user.id, activeYear.id);
  const alreadyWished = existingWishes.some(w => w.subject_id === subjectId);
  if (alreadyWished) throw new Error("Subject already in your wish list");

  // Check max wishes
  if (existingWishes.length >= activeYear.max_wishes) {
    throw new Error(`Maximum ${activeYear.max_wishes} wishes allowed`);
  }

  return repos.wishes.insert({
    student_id: user.id,
    subject_id: subjectId,
    academic_year_id: activeYear.id,
    status: "en_attente",
  });
}
