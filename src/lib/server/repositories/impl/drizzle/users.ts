import { eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { profiles, students, teachers, companies, teacherSpecialities, specialities } from '$lib/server/db/schema.js';

import type {
  IUserRepository,
  ProfileRow,
  StudentRow,
  TeacherRow,
  TeacherWithSpecialties,
  CompanyRow,
  ProfileUpdate,
  StudentInsert,
  TeacherInsert,
  TeacherAvailabilityUpdate,
  UserRole,
} from '../../port.js';

export class DrizzleUserRepo implements IUserRepository {
  // === Profiles ===============

  async findProfileById(id: string): Promise<ProfileRow | null> {
    const row = await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.id, id),
    });
    return row ?? null;
  }

  async findAllProfiles(): Promise<ProfileRow[]> {
    return await db.query.profiles.findMany({
      orderBy: (p, { desc }) => [desc(p.created_at)],
    });
  }

  async findProfilesByRole(role: string): Promise<ProfileRow[]> {
    return await db.query.profiles.findMany({
      where: (p, { eq }) => eq(p.role, role as UserRole),
      orderBy: (p, { asc }) => [asc(p.full_name)],
    });
  }

  async updateProfile(id: string, updates: ProfileUpdate): Promise<ProfileRow> {
    const [updated] = await db
      .update(profiles)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(profiles.id, id))
      .returning();
    if (!updated) throw new Error(`Profile "${id}" not found`);
    return updated;
  }

  async deleteProfile(id: string): Promise<void> {
    await db
      .update(profiles)
      .set({ is_active: false, updated_at: new Date().toISOString() })
      .where(eq(profiles.id, id));
  }

  // === Students ===============

  async findAllStudents(): Promise<StudentRow[]> {
    return await db.query.students.findMany({
      orderBy: (s, { asc }) => [asc(s.student_number)],
    });
  }

  async findStudentByProfileId(profileId: string): Promise<StudentRow | null> {
    const row = await db.query.students.findFirst({
      where: (s, { eq }) => eq(s.profile_id, profileId),
    });
    return row ?? null;
  }

  async findStudentByEmail(email: string): Promise<StudentRow | null> {
    const row = await db.query.students.findFirst({
      where: (s, { eq }) => eq(s.email, email),
    });
    return row ?? null;
  }

  async addStudentToWhitelist(student: StudentInsert): Promise<StudentRow> {
    const [inserted] = await db
      .insert(students)
      .values(student)
      .returning();
    if (!inserted) throw new Error('Failed to insert student into whitelist');
    return inserted;
  }

  // === Teachers ===============

  /**
   * Load all teachers with their specialties from the join table.
   */
  async findAllTeachers(): Promise<TeacherWithSpecialties[]> {
    const rows = await db.query.teachers.findMany({
      orderBy: (t, { asc }) => [asc(t.email)],
    });
    return await this._attachSpecialties(rows);
  }

  async findTeacherByProfileId(profileId: string): Promise<TeacherWithSpecialties | null> {
    const row = await db.query.teachers.findFirst({
      where: (t, { eq }) => eq(t.profile_id, profileId),
    });
    if (!row) return null;
    const [withSpec] = await this._attachSpecialties([row]);
    return withSpec;
  }

  /**
   * Find teachers whose specialties include the given speciality ID.
   * Uses the teacher_specialities join table.
   */
  async findTeachersBySpecialty(specialty: string): Promise<TeacherWithSpecialties[]> {
    // Find teacher IDs linked to this speciality
    const links = await db
      .select({ teacher_id: teacherSpecialities.teacher_id })
      .from(teacherSpecialities)
      .where(eq(teacherSpecialities.speciality_id, specialty));

    if (links.length === 0) return [];

    const teacherIds = links.map(l => l.teacher_id);
    const rows = await db.query.teachers.findMany({
      where: (t, { inArray }) => inArray(t.id, teacherIds),
      orderBy: (t, { asc }) => [asc(t.email)],
    });
    return await this._attachSpecialties(rows);
  }

  async addTeacherToWhitelist(teacher: TeacherInsert): Promise<TeacherRow> {
    const { id, profile_id, email, grade, department, availability_status, unavailable_until } = teacher;
    const [inserted] = await db
      .insert(teachers)
      .values({ id, profile_id, email, grade, department, availability_status, unavailable_until })
      .returning();
    if (!inserted) throw new Error('Failed to insert teacher into whitelist');
    return inserted;
  }

  async updateTeacherAvailability(profileId: string, update: TeacherAvailabilityUpdate): Promise<TeacherRow> {
    const [updated] = await db
      .update(teachers)
      .set({ ...update, updated_at: new Date().toISOString() })
      .where(eq(teachers.profile_id, profileId))
      .returning();
    if (!updated) throw new Error(`Teacher with profile "${profileId}" not found`);
    return updated;
  }

  // === Companies ==============

  async findAllCompanies(): Promise<CompanyRow[]> {
    return await db.query.companies.findMany({
      orderBy: (c, { asc }) => [asc(c.company_name)],
    });
  }

  async findCompanyByProfileId(profileId: string): Promise<CompanyRow | null> {
    const row = await db.query.companies.findFirst({
      where: (c, { eq }) => eq(c.profile_id, profileId),
    });
    return row ?? null;
  }

  async updateCompanyVerification(profileId: string, isVerified: boolean): Promise<CompanyRow> {
    const [updated] = await db
      .update(companies)
      .set({ is_verified: isVerified, updated_at: new Date().toISOString() })
      .where(eq(companies.profile_id, profileId))
      .returning();
    if (!updated) throw new Error(`Company with profile "${profileId}" not found`);
    return updated;
  }

  async updateCompany(profileId: string, data: Partial<Pick<CompanyRow, 'company_name' | 'description' | 'email' | 'address' | 'sector' | 'website' | 'contact_phone' | 'logo_url'>>): Promise<CompanyRow> {
    const [updated] = await db
      .update(companies)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(companies.profile_id, profileId))
      .returning();
    if (!updated) throw new Error(`Company with profile "${profileId}" not found`);
    return updated;
  }

  // === Helpers ================

  /**
   * Given an array of TeacherRow, load their specialties from the join table
   * and return TeacherWithSpecialties[].
   */
  private async _attachSpecialties(rows: TeacherRow[]): Promise<TeacherWithSpecialties[]> {
    if (rows.length === 0) return [];

    const teacherIds = rows.map(r => r.id);
    const links = await db
      .select()
      .from(teacherSpecialities)
      .where(inArray(teacherSpecialities.teacher_id, teacherIds));

    // Build a map: teacherId -> specialityIds[]
    const specMap = new Map<string, string[]>();
    for (const link of links) {
      const existing = specMap.get(link.teacher_id) ?? [];
      existing.push(link.speciality_id);
      specMap.set(link.teacher_id, existing);
    }

    return rows.map(r => ({
      ...r,
      specialties: specMap.get(r.id) ?? [],
    }));
  }
}
