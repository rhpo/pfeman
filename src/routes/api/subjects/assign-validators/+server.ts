import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { assignValidators } from "$lib/server/use-cases/admin/assign-validators";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  subject_id: z.string().min(1),
  validator1_id: z.string().min(1),
  validator2_id: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    await assignValidators(repos, locals.user, {
      subjectId: result.data.subject_id,
      validator1Id: result.data.validator1_id,
      validator2Id: result.data.validator2_id,
    });
    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
