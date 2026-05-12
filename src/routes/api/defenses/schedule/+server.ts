import { json, error, redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { constituteJury } from "$lib/server/use-cases/admin/constitute-jury";
import { scheduleDefense } from "$lib/server/use-cases/admin/schedule-defense";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
  assignment_id: z.string().min(1),
  scheduled_at: z.string().min(1),
  room: z.string().min(1),
  president_id: z.string().min(1),
  member_id: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, "Non authentifie");

  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) error(400, "Donnees invalides");

  try {
    const repos = createRepositories();

    const jury = await constituteJury(repos, locals.user, {
      assignment_id: result.data.assignment_id,
      president_id: result.data.president_id,
      member_id: result.data.member_id,
    });

    await scheduleDefense(repos, locals.user, {
      assignment_id: result.data.assignment_id,
      jury_id: jury.id,
      scheduled_at: result.data.scheduled_at,
      room: result.data.room,
    });

    return json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    error(500, message);
  }
};
