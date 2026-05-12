import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  code: z.string().min(1, "Code requis"),
  year_type: z.enum(["licence", "master", "ingenieur"]),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    const speciality = await repos.specialities.insert({
      name: result.data.name,
      code: result.data.code,
      year_type: result.data.year_type,
    });
    return json({ success: true, id: speciality.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
