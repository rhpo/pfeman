import { json, error } from "@sveltejs/kit";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";
import { assignCoSupervisor } from "$lib/server/use-cases/admin/assign-co-supervisor";

const schema = z.object({
    assignmentId: z.string().min(1),
    coSupervisorId: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (locals.user.role !== "admin") throw error(403, "Réservé à l'admin");

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) throw error(400, "Données invalides");

    try {
        await assignCoSupervisor(locals.db, locals.user, {
            assignmentId: result.data.assignmentId,
            coSupervisorId: result.data.coSupervisorId,
        });
        return json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};