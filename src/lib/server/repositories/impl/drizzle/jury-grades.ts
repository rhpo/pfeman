import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { juryGrades } from '$lib/server/db/schema.js';
import type {
  IJuryGradeRepository,
  JuryGradeRow,
  JuryGradeInsert,
} from '../../port.js';

export class DrizzleJuryGradeRepo implements IJuryGradeRepository {
  async findByDefense(defenseId: string): Promise<JuryGradeRow[]> {
    return db.query.juryGrades.findMany({
      where: (g, { eq }) => eq(g.defense_id, defenseId),
      orderBy: (g, { asc }) => [asc(g.submitted_at)],
    });
  }

  async findByMember(defenseId: string, memberId: string): Promise<JuryGradeRow | null> {
    const row = await db.query.juryGrades.findFirst({
      where: (g, { and, eq }) =>
        and(eq(g.defense_id, defenseId), eq(g.jury_member_id, memberId)),
    });
    return row ?? null;
  }

  async insert(grade: JuryGradeInsert): Promise<JuryGradeRow> {
    const [inserted] = await db
      .insert(juryGrades)
      .values(grade)
      .returning();
    if (!inserted) throw new Error('Failed to insert jury grade');
    return inserted;
  }
}
