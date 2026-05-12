import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
  IAcademicYearRepository,
  AcademicYearRow,
  AcademicYearInsert,
  AcademicYearUpdate,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseAcademicYearRepo implements IAcademicYearRepository {
  private c: AnyClient;
  constructor(client: SupabaseClient<Database>) {
    this.c = client as unknown as AnyClient;
  }

  async findAll(): Promise<AcademicYearRow[]> {
    const { data, error } = await this.c
      .from("academic_years")
      .select("*")
      .order("submission_open_at", { ascending: false });
    if (error) throw error;
    return data as unknown as AcademicYearRow[];
  }

  async findById(id: string): Promise<AcademicYearRow | null> {
    const { data, error } = await this.c
      .from("academic_years")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as AcademicYearRow;
  }

  async findActive(): Promise<AcademicYearRow | null> {
    const { data, error } = await this.c
      .from("academic_years")
      .select("*")
      .eq("status", "active")
      .order("submission_open_at", { ascending: false })
      .limit(1)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as AcademicYearRow;
  }

  async insert(year: AcademicYearInsert): Promise<AcademicYearRow> {
    const { data, error } = await this.c
      .from("academic_years")
      .insert(year)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AcademicYearRow;
  }

  async update(id: string, updates: AcademicYearUpdate): Promise<AcademicYearRow> {
    const { data, error } = await this.c
      .from("academic_years")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AcademicYearRow;
  }
}
