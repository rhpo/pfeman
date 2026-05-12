import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireRole } from "$lib/server/guards/require-role";
import { createRepositories } from "$lib/server/repositories/factory";
import { assignStudent } from "$lib/server/use-cases/teacher/assign-student";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    const user = requireRole(locals.user, "teacher", "admin");

    const body = await request.json();
    const { student_ids } = body as { student_ids: string[] };

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return json(
        { error: { code: "VALIDATION_ERROR", message: "Selectionnez au moins un etudiant" } },
        { status: 400 },
      );
    }

    const repos = createRepositories();
    const activeYear = await repos.academicYears.findActive();
    if (!activeYear) {
      return json(
        { error: { code: "VALIDATION_ERROR", message: "Aucune annee universitaire active" } },
        { status: 400 },
      );
    }

    await assignStudent(repos, user, {
      subjectId: params.id,
      studentIds: student_ids,
    });

    return json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) {
      return json(
        { error: { code: "FORBIDDEN", message: e.message ?? "Forbidden" } },
        { status: e.status },
      );
    }
    return json(
      { error: { code: "INTERNAL", message: "Unexpected error" } },
      { status: 500 },
    );
  }
};
