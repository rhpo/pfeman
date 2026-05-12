import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { specialities } from '$lib/server/db/schema.js';
import type {
  ISpecialityRepository,
  SpecialityRow,
  YearType,
} from '../../port.js';

export class DrizzleSpecialityRepo implements ISpecialityRepository {
  async findAll(): Promise<SpecialityRow[]> {
    return db.query.specialities.findMany({
      orderBy: (s, { asc }) => [asc(s.name)],
    });
  }

  async findById(id: string): Promise<SpecialityRow | null> {
    const row = await db.query.specialities.findFirst({
      where: (s, { eq }) => eq(s.id, id),
    });
    return row ?? null;
  }

  async findByYearType(yearType: YearType): Promise<SpecialityRow[]> {
    return db.query.specialities.findMany({
      where: (s, { eq }) => eq(s.year_type, yearType),
      orderBy: (s, { asc }) => [asc(s.name)],
    });
  }

  async insert(speciality: { name: string; code: string; year_type: YearType }): Promise<SpecialityRow> {
    const [inserted] = await db
      .insert(specialities)
      .values(speciality)
      .returning();
    if (!inserted) throw new Error('Failed to insert speciality');
    return inserted;
  }

  async update(id: string, data: { name?: string; code?: string; year_type?: YearType }): Promise<SpecialityRow> {
    const [updated] = await db
      .update(specialities)
      .set(data)
      .where(eq(specialities.id, id))
      .returning();
    if (!updated) throw new Error(`Speciality "${id}" not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(specialities)
      .where(eq(specialities.id, id));
  }
}
