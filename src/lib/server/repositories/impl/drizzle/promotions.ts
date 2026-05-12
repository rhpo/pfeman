import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { promotions } from '$lib/server/db/schema.js';
import type {
  IPromotionRepository,
  PromotionRow,
  PromotionInsert,
} from '../../port.js';

export class DrizzlePromotionRepo implements IPromotionRepository {
  async findAll(): Promise<PromotionRow[]> {
    return db.query.promotions.findMany({
      orderBy: (p, { asc }) => [asc(p.label)],
    });
  }

  async findById(id: string): Promise<PromotionRow | null> {
    const row = await db.query.promotions.findFirst({
      where: (p, { eq }) => eq(p.id, id),
    });
    return row ?? null;
  }

  async findByAcademicYear(yearId: string): Promise<PromotionRow[]> {
    return db.query.promotions.findMany({
      where: (p, { eq }) => eq(p.academic_year_id, yearId),
      orderBy: (p, { asc }) => [asc(p.specialty), asc(p.label)],
    });
  }

  async insert(promotion: PromotionInsert): Promise<PromotionRow> {
    const [inserted] = await db
      .insert(promotions)
      .values(promotion)
      .returning();
    if (!inserted) throw new Error('Failed to insert promotion');
    return inserted;
  }
}
