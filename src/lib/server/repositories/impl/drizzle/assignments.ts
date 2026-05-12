import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { pfeAssignments } from '$lib/server/db/schema.js';
import type {
  IAssignmentRepository,
  AssignmentRow,
  AssignmentWithSubject,
  AssignmentInsert,
  AssignmentUpdate,
  PfeStatus,
} from '../../port.js';

export class DrizzleAssignmentRepo implements IAssignmentRepository {
  async findAll(): Promise<AssignmentRow[]> {
    return await db.query.pfeAssignments.findMany({
      orderBy: (a, { desc }) => [desc(a.assigned_at)],
    });
  }

  async findById(id: string): Promise<AssignmentRow | null> {
    const row = await db.query.pfeAssignments.findFirst({
      where: (a, { eq }) => eq(a.id, id),
    });
    return row ?? null;
  }

  async findByStudent(studentId: string): Promise<AssignmentWithSubject[]> {
    const rows = await db.query.pfeAssignments.findMany({
      where: (a, { eq }) => eq(a.student_id, studentId),
      with: { subject: true },
      orderBy: (a, { desc }) => [desc(a.assigned_at)],
    });
    return rows as unknown as AssignmentWithSubject[];
  }

  async findBySupervisor(supervisorId: string): Promise<AssignmentWithSubject[]> {
    const rows = await db.query.pfeAssignments.findMany({
      where: (a, { eq }) => eq(a.supervisor_id, supervisorId),
      with: { subject: true },
      orderBy: (a, { desc }) => [desc(a.assigned_at)],
    });
    return rows as unknown as AssignmentWithSubject[];
  }

  async findByAcademicYear(yearId: string): Promise<AssignmentRow[]> {
    return await db.query.pfeAssignments.findMany({
      where: (a, { eq }) => eq(a.academic_year_id, yearId),
      orderBy: (a, { desc }) => [desc(a.assigned_at)],
    });
  }

  async updateStatus(id: string, status: PfeStatus): Promise<AssignmentRow> {
    const [updated] = await db
      .update(pfeAssignments)
      .set({ status, updated_at: new Date().toISOString() })
      .where(eq(pfeAssignments.id, id))
      .returning();
    if (!updated) throw new Error(`Assignment "${id}" not found`);
    return updated;
  }

  async update(id: string, data: AssignmentUpdate): Promise<AssignmentRow> {
    const [updated] = await db
      .update(pfeAssignments)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(pfeAssignments.id, id))
      .returning();
    if (!updated) throw new Error(`Assignment "${id}" not found`);
    return updated;
  }

  async insert(assignment: AssignmentInsert): Promise<AssignmentRow> {
    const [inserted] = await db
      .insert(pfeAssignments)
      .values(assignment)
      .returning();
    if (!inserted) throw new Error('Failed to insert assignment');
    return inserted;
  }
}
