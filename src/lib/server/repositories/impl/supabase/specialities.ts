import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
  ISpecialityRepository,
  SpecialityRow,
  YearType,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseSpecialityRepo implements ISpecialityRepository {
  private c: AnyClient;
  constructor(client: SupabaseClient<Database>) {
    this.c = client as unknown as AnyClient;
  }

  async findAll(): Promise<SpecialityRow[]> {
    const { data, error } = await this.c
      .from("specialities")
      .select("*")
      .order("name");
    if (error) throw error;
    return data as unknown as SpecialityRow[];
  }

  async findById(id: string): Promise<SpecialityRow | null> {
    const { data, error } = await this.c
      .from("specialities")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as SpecialityRow;
  }

  async findByYearType(yearType: YearType): Promise<SpecialityRow[]> {
    const { data, error } = await this.c
      .from("specialities")
      .select("*")
      .eq("year_type", yearType)
      .order("name");
    if (error) throw error;
    return data as unknown as SpecialityRow[];
  }

  async insert(speciality: { name: string; code: string; year_type: YearType }): Promise<SpecialityRow> {
    const { data, error } = await this.c
      .from("specialities")
      .insert(speciality)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SpecialityRow;
  }

  async update(id: string, data: { name?: string; code?: string; year_type?: YearType }): Promise<SpecialityRow> {
    const { data: updated, error } = await this.c
      .from("specialities")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated as unknown as SpecialityRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.c
      .from("specialities")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}
