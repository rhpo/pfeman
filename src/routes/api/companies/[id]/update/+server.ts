import { json, error } from "@sveltejs/kit";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";

const schema = z.object({
    company_name: z.string().min(1).optional(),
    description: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    domain_id: z.string().optional(),
    logo_url: z.string().optional(),
});

export const POST: RequestHandler = async ({ request, params, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (locals.user.role !== "admin") throw error(403, "Réservé à l'admin");

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) throw error(400, "Données invalides");

    try {
        await locals.db.users.updateCompany(params.id, result.data);
        return json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};