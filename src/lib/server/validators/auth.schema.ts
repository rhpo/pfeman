import { z } from 'zod/v4';

export const companyLoginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const companyRegisterSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
  company_name: z.string().min(2, 'Company name is required').max(200).optional()
}).check(
  ctx => {
    if (ctx.value.password !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
        input: ctx.value,
      });
    }
  }
);

export const assignmentSchema = z.object({
  subject_id: z.string().uuid(),
  student_id: z.string().uuid(),
  supervisor_id: z.string().uuid(),
  co_supervisor_id: z.string().uuid().optional()
});

export type CompanyLoginInput = z.infer<typeof companyLoginSchema>;
export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
