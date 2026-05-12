import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { academicYears } from '$lib/server/db/schema.js';
import type {
  IAcademicYearRepository,
  AcademicYearRow,
  AcademicYearInsert,
  AcademicYearUpdate,
} from '../../port.js';

export class DrizzleAcademicYearRepo implements IAcademicYearRepository {
  async findAll(): Promise<AcademicYearRow[]> {
    return db.query.academicYears.findMany({
      orderBy: (y, { desc }) => [desc(y.submission_open_at)],
    });
  }

  async findById(id: string): Promise<AcademicYearRow | null> {
    const row = await db.query.academicYears.findFirst({
      where: (y, { eq }) => eq(y.id, id),
    });
    return row ?? null;
  }

  async findActive(): Promise<AcademicYearRow | null> {
    const row = await db.query.academicYears.findFirst({
      where: (y, { eq }) => eq(y.status, 'active'),
      orderBy: (y, { desc }) => [desc(y.submission_open_at)],
    });
    return row ?? null;
  }

  async insert(year: AcademicYearInsert): Promise<AcademicYearRow> {
    const [inserted] = await db
      .insert(academicYears)
      .values(year)
      .returning();
    if (!inserted) throw new Error('Failed to insert academic year');
    return inserted;
  }

  async update(id: string, data: AcademicYearUpdate): Promise<AcademicYearRow> {
    const [updated] = await db
      .update(academicYears)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(academicYears.id, id))
      .returning();
    if (!updated) throw new Error(`Academic year "${id}" not found`);
    return updated;
  }
}
