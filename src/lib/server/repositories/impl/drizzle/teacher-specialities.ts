import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { teacherSpecialities } from '$lib/server/db/schema.js';
import type { ITeacherSpecialityRepository } from '../../port.js';

export class DrizzleTeacherSpecialityRepo implements ITeacherSpecialityRepository {
  async findByTeacher(teacherId: string): Promise<string[]> {
    const rows = await db
      .select({ speciality_id: teacherSpecialities.speciality_id })
      .from(teacherSpecialities)
      .where(eq(teacherSpecialities.teacher_id, teacherId));
    return rows.map(r => r.speciality_id);
  }

  async setTeacherSpecialities(teacherId: string, specialityIds: string[]): Promise<void> {
    // Delete existing links
    await db
      .delete(teacherSpecialities)
      .where(eq(teacherSpecialities.teacher_id, teacherId));

    // Insert new links
    if (specialityIds.length > 0) {
      await db.insert(teacherSpecialities).values(
        specialityIds.map(speciality_id => ({
          teacher_id: teacherId,
          speciality_id,
        }))
      );
    }
  }
}
