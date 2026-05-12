import { json, error } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const { submission_open_at, submission_close_at, max_wishes } = body;

  if (!submission_open_at || !submission_close_at) {
    error(400, "Les dates d'ouverture et de clôture sont requises");
  }

  try {
    const repos = createRepositories();

    // Find the active academic year, or the first one if none is active
    let year = await repos.academicYears.findActive();
    if (!year) {
      const years = await repos.academicYears.findAll();
      year = years[0] ?? null;
    }

    if (!year) {
      error(400, "Aucune annee universitaire trouvée. Veuillez d'abord en creer une.");
    }

    await repos.academicYears.update(year.id, {
      submission_open_at,
      submission_close_at,
      max_wishes: max_wishes ?? 5,
    });

    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
