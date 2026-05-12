import { json, error } from "@sveltejs/kit";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
    defenseId: z.string().min(1),
    hasPrintedVersion: z.boolean().optional(),
});

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (!["teacher", "admin"].includes(locals.user.role)) {
        throw error(403, "Réservé aux enseignants");
    }

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) throw error(400, "Données invalides");

    try {
        await locals.db.defenses.confirmJury(result.data.defenseId, locals.user.id, result.data.hasPrintedVersion ?? false);
        return json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};