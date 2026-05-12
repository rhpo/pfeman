import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type { ITeacherSpecialityRepository } from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseTeacherSpecialityRepo implements ITeacherSpecialityRepository {
  private c: AnyClient;
  constructor(client: SupabaseClient<Database>) {
    this.c = client as unknown as AnyClient;
  }

  async findByTeacher(teacherId: string): Promise<string[]> {
    const { data, error } = await this.c
      .from("teacher_specialities")
      .select("speciality_id")
      .eq("teacher_id", teacherId);
    if (error) throw error;
    return (data as { speciality_id: string }[]).map(r => r.speciality_id);
  }

  async setTeacherSpecialities(teacherId: string, specialityIds: string[]): Promise<void> {
    // Delete existing links
    const { error: delErr } = await this.c
      .from("teacher_specialities")
      .delete()
      .eq("teacher_id", teacherId);
    if (delErr) throw delErr;

    // Insert new links
    if (specialityIds.length > 0) {
      const { error: insErr } = await this.c
        .from("teacher_specialities")
        .insert(specialityIds.map(speciality_id => ({
          teacher_id: teacherId,
          speciality_id,
        })));
      if (insErr) throw insErr;
    }
  }
}
