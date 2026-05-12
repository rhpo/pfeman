import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  email: z.string().email("Email invalide"),
  grade: z.enum(["assistant", "mab", "maa", "mcb", "mca", "professeur"]),
  department: z.string().min(1, "Departement requis"),
  specialty_ids: z.array(z.string()).optional(),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    const inserted = await repos.users.addTeacherToWhitelist({
      email: result.data.email,
      grade: result.data.grade,
      department: result.data.department,
    });
    // Link specialties if provided
    if (result.data.specialty_ids && result.data.specialty_ids.length > 0 && inserted.id) {
      await repos.teacherSpecialities.setTeacherSpecialities(inserted.id, result.data.specialty_ids);
    }
    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
