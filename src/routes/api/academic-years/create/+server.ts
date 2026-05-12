import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  label: z.string().min(2, "Libelle requis"),
  submission_open_at: z.string().min(1),
  submission_close_at: z.string().min(1),
  max_wishes: z.coerce.number().min(1).default(5),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();
    const year = await repos.academicYears.insert({
      label: result.data.label,
      submission_open_at: result.data.submission_open_at,
      submission_close_at: result.data.submission_close_at,
      max_wishes: result.data.max_wishes,
      status: "active",
    });
    return json({ success: true, id: year.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
