import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { domains } from '$lib/server/db/schema.js';
import type {
    IDomainRepository,
    DomainRow,
    DomainInsert,
} from '../../port.js';

export class DrizzleDomainRepo implements IDomainRepository {
    async findAll(): Promise<DomainRow[]> {
        return db.query.domains.findMany();
    }

    async findById(id: string): Promise<DomainRow | null> {
        const row = await db.query.domains.findFirst({
            where: (d, { eq }) => eq(d.id, id),
        });
        return row ?? null;
    }

    async insert(data: DomainInsert): Promise<DomainRow> {
        const domain = {
            id: data.id ?? crypto.randomUUID(),
            name: data.name,
        };
        const [inserted] = await db
            .insert(domains)
            .values(domain)
            .returning();
        if (!inserted) throw new Error('Failed to insert domain');
        return inserted;
    }

    async delete(id: string): Promise<void> {
        await db.delete(domains).where(eq(domains.id, id));
    }
}