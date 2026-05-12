import { z } from 'zod/v4';

export const createJurySchema = z.object({
  assignment_id: z.string().uuid(),
  president_id: z.string().uuid(),
  member_id: z.string().uuid(),
}).check(
  ctx => {
    if (ctx.value.president_id === ctx.value.member_id) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: 'President and member must be distinct',
        path: ['member_id']
      });
    }
  }
);

export const scheduleDefenseSchema = z.object({
  assignment_id: z.string().uuid(),
  jury_id: z.string().uuid(),
  scheduled_at: z.iso.datetime(),
  room: z.string().min(1, 'Room is required').max(100)
});

export const recordDefenseResultSchema = z.object({
  status: z.enum(['done', 'postponed']),
  result: z.enum(['admitted', 'corrections_required', 'not_admitted']).optional(),
  grade: z.number().min(0).max(20).optional(),
  comment: z.string().max(2000).optional()
});

export type CreateJuryInput = z.infer<typeof createJurySchema>;
export type ScheduleDefenseInput = z.infer<typeof scheduleDefenseSchema>;
export type RecordDefenseResultInput = z.infer<typeof recordDefenseResultSchema>;
