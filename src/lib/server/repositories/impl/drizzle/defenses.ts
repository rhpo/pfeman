import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { defenseJuries, defenses, notifications } from '$lib/server/db/schema.js';
import type {
  IDefenseRepository,
  JuryRow,
  DefenseRow,
  DefenseWithJury,
  JuryInsert,
  DefenseInsert,
  DefenseUpdate,
} from '../../port.js';

export class DrizzleDefenseRepo implements IDefenseRepository {
  async insertJury(jury: JuryInsert): Promise<JuryRow> {
    const [inserted] = await db
      .insert(defenseJuries)
      .values(jury)
      .returning();
    if (!inserted) throw new Error('Failed to insert defense jury');
    return inserted;
  }

  async insertDefense(defense: DefenseInsert): Promise<DefenseRow> {
    const [inserted] = await db
      .insert(defenses)
      .values(defense)
      .returning();
    if (!inserted) throw new Error('Failed to insert defense');
    return inserted;
  }

  async updateDefenseResult(id: string, updates: DefenseUpdate): Promise<DefenseRow> {
    const [updated] = await db
      .update(defenses)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(defenses.id, id))
      .returning();
    if (!updated) throw new Error(`Defense "${id}" not found`);
    return updated;
  }

  async findByAssignment(assignmentId: string): Promise<DefenseWithJury | null> {
    const row = await db.query.defenses.findFirst({
      where: (d, { eq }) => eq(d.assignment_id, assignmentId),
      with: { jury: true },
    });
    if (!row || !row.jury) return null;
    return row as unknown as DefenseWithJury;
  }

  async findAll(): Promise<DefenseRow[]> {
    return await db.query.defenses.findMany({
      orderBy: (d, { desc }) => [desc(d.scheduled_at)],
    });
  }

  async confirmJury(defenseId: string, userId: string, hasPrintedVersion: boolean): Promise<void> {
    const defense = await db.query.defenses.findFirst({
      where: (d, { eq }) => eq(d.id, defenseId),
      with: { jury: true },
    });
    if (!defense) throw new Error(`Defense "${defenseId}" not found`);

    const isPresident = defense.jury?.president_id === userId;
    const isMember = defense.jury?.member_id === userId;

    if (!isPresident && !isMember) throw new Error("You are not a jury member for this defense");

    if (hasPrintedVersion && isPresident) {
      const assignment = await db.query.pfeAssignments.findFirst({
        where: (a, { eq }) => eq(a.id, defense.assignment_id),
      });
      if (assignment) {
        const studentProfiles = [assignment.student_id, assignment.student2_id, assignment.student3_id].filter(Boolean);
        for (const studentId of studentProfiles) {
          if (studentId) {
            await db.insert(notifications).values({
              recipient_id: studentId,
              type: 'DEFENSE_PRINTED_VERSION',
              payload: { defense_id: defenseId },
            });
          }
        }
      }
    }
  }

  async declineJury(defenseId: string, userId: string): Promise<void> {
    const defense = await db.query.defenses.findFirst({
      where: (d, { eq }) => eq(d.id, defenseId),
      with: { jury: true },
    });
    if (!defense) throw new Error(`Defense "${defenseId}" not found`);

    const isPresident = defense.jury?.president_id === userId;
    const isMember = defense.jury?.member_id === userId;

    if (!isPresident && !isMember) throw new Error("You are not a jury member for this defense");

    const adminProfiles = await db.query.profiles.findMany({
      where: (p, { eq }) => eq(p.role, 'admin'),
    });
    for (const admin of adminProfiles) {
      await db.insert(notifications).values({
        recipient_id: admin.id,
        type: 'JURY_DECLINED',
        payload: { defense_id: defenseId, declined_by: userId },
      });
    }
  }
}