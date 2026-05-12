import { eq, and, count } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { wishes } from '$lib/server/db/schema.js';
import type {
  IWishRepository,
  WishRow,
  WishInsert,
  WishStatus,
} from '../../port.js';

export class DrizzleWishRepo implements IWishRepository {
  async findByStudent(studentId: string, yearId: string): Promise<WishRow[]> {
    return db.query.wishes.findMany({
      where: (w, { and, eq }) =>
        and(eq(w.student_id, studentId), eq(w.academic_year_id, yearId)),
      orderBy: (w, { asc }) => [asc(w.created_at)],
    });
  }

  async findBySubject(subjectId: string): Promise<WishRow[]> {
    return db.query.wishes.findMany({
      where: (w, { eq }) => eq(w.subject_id, subjectId),
      orderBy: (w, { asc }) => [asc(w.created_at)],
    });
  }

  async findById(id: string): Promise<WishRow | null> {
    const row = await db.query.wishes.findFirst({
      where: (w, { eq }) => eq(w.id, id),
    });
    return row ?? null;
  }

  async countByStudent(studentId: string, yearId: string): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(wishes)
      .where(
        and(
          eq(wishes.student_id, studentId),
          eq(wishes.academic_year_id, yearId),
        ),
      );
    return result?.total ?? 0;
  }

  async insert(wish: WishInsert): Promise<WishRow> {
    const [inserted] = await db
      .insert(wishes)
      .values(wish)
      .returning();
    if (!inserted) throw new Error('Failed to insert wish');
    return inserted;
  }

  async updateStatus(id: string, status: WishStatus): Promise<WishRow> {
    const [updated] = await db
      .update(wishes)
      .set({ status, updated_at: new Date().toISOString() })
      .where(eq(wishes.id, id))
      .returning();
    if (!updated) throw new Error(`Wish "${id}" not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(wishes).where(eq(wishes.id, id));
  }
}
