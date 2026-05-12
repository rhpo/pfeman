import { z } from 'zod/v4';

export const createSubjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  type: z.enum(['internal', 'external']),
  specialty: z.string().min(2, 'Specialty is required'),
  level: z.enum(['licence', 'master', 'ingenieur']),
  company_id: z.string().uuid().optional()
});

export const reviewSubjectSchema = z.object({
  status: z.enum(['accepte', 'accepte_sous_reserve', 'refuse']),
  reason: z.string().max(1000).optional()
});

export const validateSubjectSchema = z.object({
  status: z.enum(['valide', 'refuse']),
  reason: z.string().max(1000).optional()
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type ReviewSubjectInput = z.infer<typeof reviewSubjectSchema>;
export type ValidateSubjectInput = z.infer<typeof validateSubjectSchema>;
