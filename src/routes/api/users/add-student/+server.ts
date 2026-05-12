import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  email: z.string().email("Email invalide"),
  student_number: z.string().min(1, "Numero etudiant requis"),
  specialty: z.string().min(1, "Specialite requise"),
  level: z.enum(["licence", "master", "ingenieur"]),
  promotion_year: z.coerce.number().min(2020),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    await repos.users.addStudentToWhitelist({
      email: result.data.email,
      student_number: result.data.student_number,
      specialty: result.data.specialty,
      level: result.data.level,
      promotion_year: result.data.promotion_year,
    });
    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
