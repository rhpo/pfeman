import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { CreateSubjectInput } from "$lib/server/validators/subject.schema";

export async function proposeSubject(
  repos: IRepositories,
  user: SessionUser,
  input: CreateSubjectInput,
) {
  const activeYear = await repos.academicYears.findActive();
  if (!activeYear) throw new Error("No active academic year found");

  return repos.subjects.insert({
    title: input.title,
    description: input.description,
    group_type: "binome",
    specialty: input.specialty,
    level: input.level,
    proposer_id: user.id,
    proposer_role: "company",
    company_id: user.id,
    academic_year_id: activeYear.id,
    status: "en_attente",
  });
}
