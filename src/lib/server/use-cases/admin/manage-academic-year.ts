import type { IRepositories, AcademicYearStatus } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface CreateAcademicYearInput {
  label: string;
  submissionOpenAt: string;
  submissionCloseAt: string;
  maxWishes?: number;
}

export async function createAcademicYear(
  repos: IRepositories,
  _user: SessionUser,
  input: CreateAcademicYearInput,
) {
  return repos.academicYears.insert({
    label: input.label,
    submission_open_at: input.submissionOpenAt,
    submission_close_at: input.submissionCloseAt,
    max_wishes: input.maxWishes ?? 5,
  });
}

export async function closeAcademicYear(
  repos: IRepositories,
  _user: SessionUser,
  yearId: string,
) {
  return repos.academicYears.update(yearId, { status: "cloturee" });
}

export async function updateAcademicYearStatus(
  repos: IRepositories,
  _user: SessionUser,
  yearId: string,
  status: AcademicYearStatus,
) {
  return repos.academicYears.update(yearId, { status });
}
