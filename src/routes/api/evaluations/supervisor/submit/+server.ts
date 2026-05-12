import { json, error } from "@sveltejs/kit";
import { z } from "zod/v4";
import type { RequestHandler } from "./$types";
import { submitSupervisorEvaluation as teacherSubmit } from "$lib/server/use-cases/teacher/submit-supervisor-evaluation";
import { submitSupervisorEvaluation as companySubmit } from "$lib/server/use-cases/company/submit-supervisor-evaluation";

const schema = z.object({
    assignmentId: z.string().min(1),
    criterion5: z.number().min(0).max(4),
});

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (!["teacher", "company"].includes(locals.user.role)) {
        throw error(403, "Réservé aux encadrants");
    }

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) throw error(400, "Données invalides");

    try {
        if (locals.user.role === "teacher") {
            await teacherSubmit(locals.db, locals.user, result.data);
        } else {
            await companySubmit(locals.db, locals.user, result.data);
        }
        return json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};