import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";

type SubjectStatusEnum = Database["public"]["Enums"]["subject_status"];
import type {
  ISubjectRepository,
  SubjectRow,
  SubjectInsert,
  SubjectStatus,
  SubjectValidatorUpdate,
} from "../../port.js";

export class SupabaseSubjectRepo implements ISubjectRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll(): Promise<SubjectRow[]> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SubjectRow[];
  }

  async findById(id: string): Promise<SubjectRow | null> {

    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as SubjectRow;
  }

  async findByProposer(proposerId: string): Promise<SubjectRow[]> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .eq("proposer_id", proposerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SubjectRow[];
  }

  async findByStatus(status: string): Promise<SubjectRow[]> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .eq("status", status as SubjectStatusEnum)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SubjectRow[];
  }

  async findByAcademicYear(yearId: string): Promise<SubjectRow[]> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .eq("academic_year_id" as any, yearId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SubjectRow[];
  }

  async findByValidator(validatorProfileId: string): Promise<SubjectRow[]> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .or(`validator1_id.eq.${validatorProfileId},validator2_id.eq.${validatorProfileId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SubjectRow[];
  }

  async findValidatedBySpecialty(specialty: string, yearId: string): Promise<SubjectRow[]> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .select("*")
      .eq("specialty", specialty)
      .eq("academic_year_id" as any, yearId)
      .eq("status", "valide" as SubjectStatusEnum)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SubjectRow[];
  }

  async insert(subject: SubjectInsert): Promise<SubjectRow> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .insert(subject as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SubjectRow;
  }

  async updateStatus(id: string, status: SubjectStatus): Promise<SubjectRow> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .update({ status: status as SubjectStatusEnum })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SubjectRow;
  }

  async updateValidators(id: string, update: SubjectValidatorUpdate): Promise<SubjectRow> {
    const { data, error } = await this.client
      .from("pfe_subjects")
      .update(update as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SubjectRow;
  }
}
