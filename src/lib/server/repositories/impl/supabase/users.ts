import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";

type UserRoleEnum = Database["public"]["Enums"]["user_role"];
import type {
  IUserRepository,
  ProfileRow,
  ProfileUpdate,
  StudentRow,
  StudentInsert,
  TeacherRow,
  TeacherWithSpecialties,
  TeacherInsert,
  TeacherAvailabilityUpdate,
  CompanyRow,
} from "../../port.js";

export class SupabaseUserRepo implements IUserRepository {
  constructor(private readonly client: SupabaseClient<Database>) { }

  // == Profiles ===============

  async findProfileById(id: string): Promise<ProfileRow | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as ProfileRow;
  }

  async findAllProfiles(): Promise<ProfileRow[]> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as ProfileRow[];
  }

  async findProfilesByRole(role: string): Promise<ProfileRow[]> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("role", role as UserRoleEnum)
      .order("full_name");
    if (error) throw error;
    return data as unknown as ProfileRow[];
  }

  async updateProfile(id: string, updates: ProfileUpdate): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from("profiles")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as ProfileRow;
  }

  async deleteProfile(id: string): Promise<void> {
    const { error } = await this.client
      .from("profiles")
      .update({ is_active: false } as any)
      .eq("id", id);
    if (error) throw error;
  }

  // == Students ===============

  async findAllStudents(): Promise<StudentRow[]> {
    const { data, error } = await this.client
      .from("students")
      .select("*")
      .order("email");
    if (error) throw error;
    return data as unknown as StudentRow[];
  }

  async findStudentByProfileId(profileId: string): Promise<StudentRow | null> {
    const { data, error } = await this.client
      .from("students")
      .select("*")
      .eq("profile_id", profileId)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as StudentRow;
  }

  async findStudentByEmail(email: string): Promise<StudentRow | null> {
    const { data, error } = await this.client
      .from("students")
      .select("*")
      .eq("email", email)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as StudentRow;
  }

  async addStudentToWhitelist(student: StudentInsert): Promise<StudentRow> {
    const { data, error } = await this.client
      .from("students")
      .insert(student as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as StudentRow;
  }

  // == Teachers ===============

  async findAllTeachers(): Promise<TeacherWithSpecialties[]> {
    const { data: rows, error: tErr } = await this.client
      .from("teachers")
      .select("*")
      .order("email");
    if (tErr) throw tErr;

    return await this._attachSpecialties(rows as unknown as TeacherRow[]);
  }

  async findTeacherByProfileId(profileId: string): Promise<TeacherWithSpecialties | null> {
    const { data, error } = await this.client
      .from("teachers")
      .select("*")
      .eq("profile_id", profileId)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    const row = data as unknown as TeacherRow;
    const [withSpec] = await this._attachSpecialties([row]);
    return withSpec;
  }

  async findTeachersBySpecialty(specialty: string): Promise<TeacherWithSpecialties[]> {
    // Use the raw query to access the join table (not in typed schema)
    const { data: links, error: lErr } = await this.client
      .rpc('get_teacher_ids_by_specialty' as any, { p_specialty_id: specialty });
    if (lErr) {
      // Fallback: query teachers table directly (legacy)
      const { data: rows, error: tErr } = await this.client
        .from("teachers")
        .select("*")
        .order("email");
      if (tErr) throw tErr;
      return await this._attachSpecialties(rows as unknown as TeacherRow[]);
    }

    const teacherIds = (links as unknown as { teacher_id: string }[]).map(l => l.teacher_id);
    if (teacherIds.length === 0) return [];

    const { data: rows, error: tErr } = await this.client
      .from("teachers")
      .select("*")
      .in("id", teacherIds)
      .order("email");
    if (tErr) throw tErr;

    return await this._attachSpecialties(rows as unknown as TeacherRow[]);
  }

  async addTeacherToWhitelist(teacher: TeacherInsert): Promise<TeacherRow> {
    const { id, profile_id, email, grade, department, availability_status, unavailable_until } = teacher;
    const { data, error } = await this.client
      .from("teachers")
      .insert({ id, profile_id, email, grade, department, availability_status, unavailable_until } as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as TeacherRow;
  }

  async updateTeacherAvailability(profileId: string, update: TeacherAvailabilityUpdate): Promise<TeacherRow> {
    const { data, error } = await this.client
      .from("teachers")
      .update(update as any)
      .eq("profile_id", profileId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as TeacherRow;
  }

  // == Companies ==============

  async findAllCompanies(): Promise<CompanyRow[]> {
    const { data, error } = await this.client
      .from("companies")
      .select("*")
      .order("company_name");
    if (error) throw error;
    return data as unknown as CompanyRow[];
  }

  async findCompanyByProfileId(profileId: string): Promise<CompanyRow | null> {
    const { data, error } = await this.client
      .from("companies")
      .select("*")
      .eq("profile_id", profileId)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as CompanyRow;
  }

  async updateCompanyVerification(profileId: string, isVerified: boolean): Promise<CompanyRow> {
    const { data, error } = await this.client
      .from("companies")
      .update({ is_verified: isVerified } as any)
      .eq("profile_id", profileId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as CompanyRow;
  }

  async updateCompany(profileId: string, data: Partial<Pick<CompanyRow, 'company_name' | 'description' | 'email' | 'address' | 'sector' | 'website' | 'contact_phone' | 'logo_url'>>): Promise<CompanyRow> {
    const { data: result, error } = await this.client
      .from("companies")
      .update(data as any)
      .eq("profile_id", profileId)
      .select()
      .single();
    if (error) throw error;
    return result as unknown as CompanyRow;
  }

  // == Helpers ================

  private async _attachSpecialties(rows: TeacherRow[]): Promise<TeacherWithSpecialties[]> {
    if (rows.length === 0) return [];

    const teacherIds = rows.map(r => r.id);
    // Use raw query to access the join table
    const { data: links, error } = await this.client
      .rpc('get_teacher_specialities' as any, { p_teacher_ids: teacherIds });
    if (error) {
      // Fallback: return empty specialties
      return rows.map(r => ({ ...r, specialties: [] }));
    }

    const specMap = new Map<string, string[]>();
    for (const link of links as unknown as { teacher_id: string; speciality_id: string }[]) {
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
