import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { uploadMemoire } from "$lib/server/use-cases/student/upload-memoire";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (locals.user.role !== "student") throw error(403, "Réservé aux étudiants");

    const formData = await request.formData();
    const assignmentId = formData.get("assignmentId")?.toString();
    const file = formData.get("file") as File | null;

    if (!assignmentId || !file) throw error(400, "Données invalides");

    try {
        const buffer = await file.arrayBuffer();
        const { url } = await uploadMemoire(locals.db, locals.user, {
            assignmentId,
            fileBuffer: buffer,
            fileName: file.name,
            mimeType: file.type,
        });
        return json({ url });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};