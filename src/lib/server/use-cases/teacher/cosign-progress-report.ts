import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import type { CosignProgressReportInput } from "$lib/server/validators/progress.schema";

export async function cosignProgressReport(
  repos: IRepositories,
  _user: SessionUser,
  reportId: string,
  input: CosignProgressReportInput,
) {
  return repos.progress.cosign(reportId, input.teacher_feedback);
}
