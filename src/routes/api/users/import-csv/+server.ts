import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { importTeachersCsv, importStudentsCsv } from "$lib/server/use-cases/admin/import-csv";
import { z } from "zod/v4";
import type { TeacherGrade, Level } from "$lib/types/domain";
import type { RequestHandler } from "./$types";

const schema = z.object({
  type: z.enum(["teachers", "students"]),
  rows: z.array(z.record(z.string(), z.any())).min(1, "Au moins une ligne"),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    if (result.data.type === "teachers") {
      const teachers = result.data.rows.map((r) => ({
        email: r.email as string,
        firstName: r.firstName as string,
        lastName: r.lastName as string,
        specialty: r.specialty as string,
        grade: r.grade as TeacherGrade,
      }));
      await importTeachersCsv(repos, locals.user, teachers);
    } else {
      const students = result.data.rows.map((r) => ({
        email: r.email as string,
        firstName: r.firstName as string,
        lastName: r.lastName as string,
        specialty: r.specialty as string,
        promotionId: r.promotionId as string,
      }));
      await importStudentsCsv(repos, locals.user, students);
    }
    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
