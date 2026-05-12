import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Nom requis").optional(),
  code: z.string().min(1, "Code requis").optional(),
  year_type: z.enum(["licence", "master", "ingenieur"]).optional(),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    const { id, ...data } = result.data;
    await repos.specialities.update(id, data);
    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
