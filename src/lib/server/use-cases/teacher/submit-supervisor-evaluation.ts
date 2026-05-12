/**
 * Submit Supervisor Evaluation (Teacher) use-case
 *
 * A teacher/encadrant submits the 5th evaluation criterion (/4) for a PFE
 * they supervise. This is stored in supervisor_evaluations.
 */
import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import { error } from "@sveltejs/kit";
import { sendNotification } from "../shared/send-notification";

export interface SubmitSupervisorEvaluationInput {
    assignmentId: string;
    criterion5: number; // /4
}

export async function submitSupervisorEvaluation(
    repos: IRepositories,
    user: SessionUser,
    input: SubmitSupervisorEvaluationInput,
): Promise<void> {
    // Validate rating range
    if (input.criterion5 < 0 || input.criterion5 > 4) {
        throw error(400, "La note doit être comprise entre 0 et 4.");
    }

    const assignment = await repos.assignments.findById(input.assignmentId);
    if (!assignment) {
        throw error(404, "Assignment not found");
    }

    if (assignment.supervisor_id !== user.id) {
        throw error(403, "Vous n'êtes pas l'encadrant de ce PFE.");
    }

    // Check if evaluation already exists
    const existing = await repos.supervisorEvaluations.findByEvaluator(
        user.id,
        input.assignmentId,
    );
    if (existing) {
        throw error(400, "Vous avez déjà soumis votre évaluation pour ce PFE.");
    }

    await repos.supervisorEvaluations.insert({
        assignment_id: input.assignmentId,
        evaluator_id: user.id,
        student_id: assignment.student_id,
        technical_quality: input.criterion5,
        total: input.criterion5,
    });

    // Notify admin
    const admins = await repos.users.findProfilesByRole("admin");
    if (admins.length > 0) {
        await sendNotification(repos, {
            recipientId: admins[0].id,
            type: "supervisor_evaluation_submitted",
            payload: { assignmentId: input.assignmentId },
            emailSubject: "Évaluation de l'encadrant soumise",
            emailBody: `<p>L'encadrant a soumis son évaluation (critère 5) pour le PFE.</p>`,
        });
    }
}