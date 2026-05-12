import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { pfeSubjects } from '$lib/server/db/schema.js';
import type {
  ISubjectRepository,
  SubjectRow,
  SubjectInsert,
  SubjectStatus,
  SubjectValidatorUpdate,
} from '../../port.js';

export class DrizzleSubjectRepo implements ISubjectRepository {
  async findAll(): Promise<SubjectRow[]> {
    return await db.query.pfeSubjects.findMany({
      orderBy: (s, { desc }) => [desc(s.created_at)],
    });
  }

  async findById(id: string): Promise<SubjectRow | null> {

    const row = await db.query.pfeSubjects.findFirst({
      where: (s, { eq }) => eq(s.id, id),
    });
    return row ?? null;
  }

  async findByProposer(proposerId: string): Promise<SubjectRow[]> {
    return await db.query.pfeSubjects.findMany({
      where: (s, { eq }) => eq(s.proposer_id, proposerId),
      orderBy: (s, { desc }) => [desc(s.created_at)],
    });
  }

  async findByStatus(status: string): Promise<SubjectRow[]> {
    return await db.query.pfeSubjects.findMany({
      where: (s, { eq }) => eq(s.status, status as SubjectStatus),
      orderBy: (s, { desc }) => [desc(s.created_at)],
    });
  }

  async findByAcademicYear(yearId: string): Promise<SubjectRow[]> {
    return await db.query.pfeSubjects.findMany({
      where: (s, { eq }) => eq(s.academic_year_id, yearId),
      orderBy: (s, { desc }) => [desc(s.created_at)],
    });
  }

  async findByValidator(validatorProfileId: string): Promise<SubjectRow[]> {
    return await db.query.pfeSubjects.findMany({
      where: (s, { or }) =>
        or(eq(s.validator1_id, validatorProfileId), eq(s.validator2_id, validatorProfileId)),
      orderBy: (s, { desc }) => [desc(s.created_at)],
    });
  }

  async findValidatedBySpecialty(specialty: string, yearId: string): Promise<SubjectRow[]> {
    return await db.query.pfeSubjects.findMany({
      where: (s, { and, eq }) =>
        and(
          eq(s.specialty, specialty),
          eq(s.academic_year_id, yearId),
          eq(s.status, 'valide' as SubjectStatus),
        ),
      orderBy: (s, { desc }) => [desc(s.created_at)],
    });
  }

  async insert(subject: SubjectInsert): Promise<SubjectRow> {
    const [inserted] = await db
      .insert(pfeSubjects)
      .values(subject)
      .returning();
    if (!inserted) throw new Error('Failed to insert subject');
    return inserted;
  }

  async updateStatus(id: string, status: SubjectStatus): Promise<SubjectRow> {
    const [updated] = await db
      .update(pfeSubjects)
      .set({ status, updated_at: new Date().toISOString() })
      .where(eq(pfeSubjects.id, id))
      .returning();
    if (!updated) throw new Error(`Subject "${id}" not found`);
    return updated;
  }

  async updateValidators(id: string, update: SubjectValidatorUpdate): Promise<SubjectRow> {
    const [updated] = await db
      .update(pfeSubjects)
      .set({ ...update, updated_at: new Date().toISOString() })
      .where(eq(pfeSubjects.id, id))
      .returning();
    if (!updated) throw new Error(`Subject "${id}" not found`);
    return updated;
  }
}
