import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  label: z.string().min(2, "Libelle requis"),
  specialty: z.string().min(1, "Specialite requise"),
  academic_year_id: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    const promotion = await repos.promotions.insert({
      label: result.data.label,
      specialty: result.data.specialty,
      academic_year_id: result.data.academic_year_id,
    });
    return json({ success: true, id: promotion.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
