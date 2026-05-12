import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { supervisorEvaluations } from '$lib/server/db/schema.js';
import type {
    ISupervisorEvaluationRepository,
    SupervisorEvaluationRow,
    SupervisorEvaluationInsert,
    SupervisorEvaluationUpdate,
} from '../../port.js';

export class DrizzleSupervisorEvaluationRepo implements ISupervisorEvaluationRepository {
    async findByAssignment(assignmentId: string): Promise<SupervisorEvaluationRow[]> {
        return db.query.supervisorEvaluations.findMany({
            where: (e, { eq }) => eq(e.assignment_id, assignmentId),
            orderBy: (e, { desc }) => [desc(e.submitted_at)],
        });
    }

    async findByStudent(studentId: string): Promise<SupervisorEvaluationRow[]> {
        return db.query.supervisorEvaluations.findMany({
            where: (e, { eq }) => eq(e.student_id, studentId),
            orderBy: (e, { desc }) => [desc(e.submitted_at)],
        });
    }

    async findByEvaluator(evaluatorId: string, assignmentId: string): Promise<SupervisorEvaluationRow | null> {
        const row = await db.query.supervisorEvaluations.findFirst({
            where: (e, { and, eq }) =>
                and(eq(e.evaluator_id, evaluatorId), eq(e.assignment_id, assignmentId)),
        });
        return row ?? null;
    }

    async insert(data: SupervisorEvaluationInsert): Promise<SupervisorEvaluationRow> {
        const [inserted] = await db
            .insert(supervisorEvaluations)
            .values(data)
            .returning();
        if (!inserted) throw new Error('Failed to insert supervisor evaluation');
        return inserted;
    }

    async update(id: string, data: SupervisorEvaluationUpdate): Promise<SupervisorEvaluationRow> {
        const [updated] = await db
            .update(supervisorEvaluations)
            .set(data)
            .where(eq(supervisorEvaluations.id, id))
            .returning();
        if (!updated) throw new Error(`SupervisorEvaluation not found: ${id}`);
        return updated;
    }
}