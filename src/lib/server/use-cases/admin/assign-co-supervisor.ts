/**
 * Assign Co-Supervisor use-case
 *
 * Admin assigns an internal co-supervisor to a company-proposed subject.
 * The co-supervisor is a teacher (profile) who acts as the internal point of
 * contact for the externally-supervised PFE.
 */
import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import { error } from "@sveltejs/kit";
import { sendNotification } from "../shared/send-notification";

export interface AssignCoSupervisorInput {
    assignmentId: string;
    coSupervisorId: string;
}

export async function assignCoSupervisor(
    repos: IRepositories,
    _user: SessionUser,
    input: AssignCoSupervisorInput,
): Promise<void> {
    const assignment = await repos.assignments.findById(input.assignmentId);
    if (!assignment) {
        throw error(404, "Assignment not found");
    }

    // Verify the co-supervisor is a valid teacher profile
    const teacher = await repos.users.findTeacherByProfileId(input.coSupervisorId);
    if (!teacher) {
        throw error(400, "Le co-encadrant sélectionné n'est pas un enseignant valide.");
    }

    await repos.assignments.update(input.assignmentId, {
        co_supervisor_id: input.coSupervisorId,
    });

    // Notify the newly-assigned co-supervisor
    await sendNotification(repos, {
        recipientId: input.coSupervisorId,
        type: "co_supervisor_assigned",
        payload: { assignmentId: input.assignmentId },
        emailSubject: "Vous avez été désigné co-encadrant d'un PFE",
        emailBody: `<p>Vous avez été désigné co-encadrant pour un projet de fin d'études proposé par une entreprise.</p>`,
    });
}