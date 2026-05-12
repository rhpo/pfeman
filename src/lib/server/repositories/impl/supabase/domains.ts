import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
    IDomainRepository,
    DomainRow,
    DomainInsert,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseDomainRepo implements IDomainRepository {
    private c: AnyClient;
    constructor(client: SupabaseClient<Database>) {
        this.c = client as unknown as AnyClient;
    }

    async findAll(): Promise<DomainRow[]> {
        const { data, error } = await this.c
            .from("domains")
            .select("*");
        if (error) throw error;
        return data as unknown as DomainRow[];
    }

    async findById(id: string): Promise<DomainRow | null> {
        const { data, error } = await this.c
            .from("domains")
            .select("*")
            .eq("id", id)
            .single();
        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }
        return data as unknown as DomainRow;
    }

    async insert(domain: DomainInsert): Promise<DomainRow> {
        const { data, error } = await this.c
            .from("domains")
            .insert(domain)
            .select()
            .single();
        if (error) throw error;
        return data as unknown as DomainRow;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.c
            .from("domains")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }
}