import { eq, asc } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { pfeProgressReports } from '$lib/server/db/schema.js';
import type {
  IProgressReportRepository,
  ProgressReportRow,
  ProgressReportInsert,
} from '../../port.js';

export class DrizzleProgressRepo implements IProgressReportRepository {
  async findByAssignment(assignmentId: string): Promise<ProgressReportRow[]> {
    return await db.query.pfeProgressReports.findMany({
      where: (r, { eq }) => eq(r.assignment_id, assignmentId),
      // Chronological order so the UI can render a timeline
      orderBy: (r, { asc }) => [asc(r.meeting_date)],
    });
  }

  async insert(report: ProgressReportInsert): Promise<ProgressReportRow> {
    const [inserted] = await db
      .insert(pfeProgressReports)
      .values({ attachments: [], ...report })
      .returning();
    if (!inserted) throw new Error('Failed to insert progress report');
    return inserted;
  }

  async cosign(id: string, feedback: string): Promise<ProgressReportRow> {
    const [updated] = await db
      .update(pfeProgressReports)
      .set({
        teacher_feedback: feedback,
        signed_by_teacher: true,
        updated_at: new Date().toISOString(),
      })
      .where(eq(pfeProgressReports.id, id))
      .returning();
    if (!updated) throw new Error(`Progress report "${id}" not found`);
    return updated;
  }
}
