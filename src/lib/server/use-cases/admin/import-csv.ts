import type { IRepositories, TeacherGrade } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface CsvTeacherRow {
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  grade: TeacherGrade;
}

export interface CsvStudentRow {
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  promotionId: string;
}

export async function importTeachersCsv(
  repos: IRepositories,
  _user: SessionUser,
  teachers: CsvTeacherRow[],
) {
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const teacher of teachers) {
    try {
      const inserted = await repos.users.addTeacherToWhitelist({
        email: teacher.email,
        grade: teacher.grade,
        department: teacher.specialty,
      });
      // Link the teacher to their specialty
      if (inserted.id) {
        await repos.teacherSpecialities.setTeacherSpecialities(inserted.id, [teacher.specialty]);
      }
      results.push({ email: teacher.email, success: true });
    } catch (err) {
      results.push({
        email: teacher.email,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function importStudentsCsv(
  repos: IRepositories,
  _user: SessionUser,
  students: CsvStudentRow[],
) {
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const student of students) {
    try {
      await repos.users.addStudentToWhitelist({
        email: student.email,
        student_number: "",
        specialty: student.specialty,
        level: "master",
        promotion_year: new Date().getFullYear(),
        promotion_id: student.promotionId,
      });
      results.push({ email: student.email, success: true });
    } catch (err) {
      results.push({
        email: student.email,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}
