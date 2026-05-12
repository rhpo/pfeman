import { z } from 'zod/v4';

export const createProgressReportSchema = z.object({
  assignment_id: z.string().uuid(),
  meeting_date: z.iso.date(),
  student_notes: z.string().min(10, 'Notes must be at least 10 characters').max(5000),
  attachments: z.array(z.string().url()).optional().default([])
});

export const cosignProgressReportSchema = z.object({
  teacher_feedback: z.string().min(5, 'Feedback is required').max(5000),
  signed_by_teacher: z.literal(true)
});

export type CreateProgressReportInput = z.infer<typeof createProgressReportSchema>;
export type CosignProgressReportInput = z.infer<typeof cosignProgressReportSchema>;
