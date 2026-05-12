/**
 * Upload Memoire use-case
 *
 * A student uploads their final thesis PDF to Supabase Storage (bucket "memoires")
 * and the URL is saved on the PFE assignment record.
 */
import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import { error } from "@sveltejs/kit";
import { sendNotification } from "../shared/send-notification";
import { supabaseAdmin } from "$lib/server/supabase/admin";

export interface UploadMemoireInput {
    assignmentId: string;
    fileBuffer: ArrayBuffer;
    fileName: string;
    mimeType: string;
}

export async function uploadMemoire(
    repos: IRepositories,
    user: SessionUser,
    input: UploadMemoireInput,
): Promise<{ url: string }> {
    const assignment = await repos.assignments.findById(input.assignmentId);
    if (!assignment) {
        throw error(404, "Assignment not found");
    }

    // Verify the uploader is a student on this PFE
    const isStudent =
        assignment.student_id === user.id ||
        assignment.student2_id === user.id ||
        assignment.student3_id === user.id;
    if (!isStudent) {
        throw error(403, "Vous n'êtes pas membre de ce PFE.");
    }

    // Upload to Supabase Storage bucket "memoires"
    const filePath = `${input.assignmentId}/${Date.now()}_${input.fileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
        .from("memoires")
        .upload(filePath, input.fileBuffer, {
            contentType: input.mimeType,
            upsert: false,
        });

    if (uploadError) {
        throw error(500, `Erreur lors du téléchargement du fichier: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage.from("memoires").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Save URL on assignment
    await repos.assignments.update(input.assignmentId, {
        memoire_url: publicUrl,
    });

    // Notify supervisor and admin
    if (assignment.supervisor_id) {
        await sendNotification(repos, {
            recipientId: assignment.supervisor_id,
            type: "memoire_submitted",
            payload: { assignmentId: input.assignmentId, url: publicUrl },
            emailSubject: "Un mémoire a été soumis",
            emailBody: `<p>Un étudiant a soumis son mémoire de PFE.</p>`,
        });
    }

    const admins = await repos.users.findProfilesByRole("admin");
    for (const admin of admins) {
        await sendNotification(repos, {
            recipientId: admin.id,
            type: "memoire_submitted",
            payload: { assignmentId: input.assignmentId, url: publicUrl },
            emailSubject: "Un mémoire a été soumis",
            emailBody: `<p>Un étudiant a soumis son mémoire de PFE.</p>`,
        });
    }

    return { url: publicUrl };
}