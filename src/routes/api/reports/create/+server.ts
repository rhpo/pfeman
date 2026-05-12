import { json, error } from "@sveltejs/kit";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";
import { submitReport } from "$lib/server/use-cases/company/submit-report";

const schema = z.object({
    description: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (locals.user.role !== "company") throw error(403, "Réservé aux entreprises");

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) throw error(400, "Données invalides");

    try {
        await submitReport(locals.db, locals.user, result.data);
        return json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};