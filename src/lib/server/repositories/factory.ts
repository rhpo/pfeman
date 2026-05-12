/**
 * Repository Factory
 *
 * The single place that decides WHICH adapter backs each repository.
 *
 * DATABASE_ADAPTER environment variable controls the choice:
 *   "drizzle"   → SQLite via Drizzle ORM (default in development)
 *   "supabase"  → Supabase PostgreSQL via @supabase/supabase-js (default in production)
 *
 * If DATABASE_ADAPTER is not set, the factory infers from NODE_ENV:
 *   NODE_ENV=production → supabase
 *   anything else       → drizzle
 *
 * Usage in hooks.server.ts:
 *   event.locals.db = createRepositories(supabase);
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.js';
import type { IRepositories } from './port.js';

// === Drizzle implementations =================
import { DrizzleUserRepo } from './impl/drizzle/users.js';
import { DrizzleTeacherSpecialityRepo } from './impl/drizzle/teacher-specialities.js';
import { DrizzleSpecialityRepo } from './impl/drizzle/specialities.js';
import { DrizzleAcademicYearRepo } from './impl/drizzle/academic-years.js';
import { DrizzlePromotionRepo } from './impl/drizzle/promotions.js';
import { DrizzleSubjectRepo } from './impl/drizzle/subjects.js';
import { DrizzleWishRepo } from './impl/drizzle/wishes.js';
import { DrizzleAssignmentRepo } from './impl/drizzle/assignments.js';
import { DrizzleProgressRepo } from './impl/drizzle/progress.js';
import { DrizzleDefenseRepo } from './impl/drizzle/defenses.js';
import { DrizzleJuryGradeRepo } from './impl/drizzle/jury-grades.js';
import { DrizzleSupervisorEvaluationRepo } from './impl/drizzle/supervisor-evaluations.js';
import { DrizzleCompanyReportRepo } from './impl/drizzle/company-reports.js';
import { DrizzleNotificationRepo } from './impl/drizzle/notifications.js';
import { DrizzleAuditRepo } from './impl/drizzle/audit.js';
import { DrizzleDomainRepo } from './impl/drizzle/domains.js';

// === Supabase implementations ================
import { SupabaseUserRepo } from './impl/supabase/users.js';
import { SupabaseTeacherSpecialityRepo } from './impl/supabase/teacher-specialities.js';
import { SupabaseSpecialityRepo } from './impl/supabase/specialities.js';
import { SupabaseAcademicYearRepo } from './impl/supabase/academic-years.js';
import { SupabasePromotionRepo } from './impl/supabase/promotions.js';
import { SupabaseSubjectRepo } from './impl/supabase/subjects.js';
import { SupabaseWishRepo } from './impl/supabase/wishes.js';
import { SupabaseAssignmentRepo } from './impl/supabase/assignments.js';
import { SupabaseProgressRepo } from './impl/supabase/progress.js';
import { SupabaseDefenseRepo } from './impl/supabase/defenses.js';
import { SupabaseJuryGradeRepo } from './impl/supabase/jury-grades.js';
import { SupabaseSupervisorEvaluationRepo } from './impl/supabase/supervisor-evaluations.js';
import { SupabaseCompanyReportRepo } from './impl/supabase/company-reports.js';
import { SupabaseNotificationRepo } from './impl/supabase/notifications.js';
import { SupabaseAuditRepo } from './impl/supabase/audit.js';
import { SupabaseDomainRepo } from './impl/supabase/domains.js';

// === Adapter resolution ========

function resolveAdapter(): 'drizzle' | 'supabase' {
  const explicit = process.env.DATABASE_ADAPTER;
  if (explicit === 'drizzle' || explicit === 'supabase') return explicit;
  return process.env.NODE_ENV === 'production' ? 'supabase' : 'drizzle';
}

const ADAPTER = resolveAdapter();

// === Factory ====

/**
 * Creates a fully-wired Repositories bundle for the current request.
 *
 * @param supabase  The per-request Supabase client (required when adapter = "supabase").
 *                  Ignored when adapter = "drizzle".
 */
export function createRepositories(supabase?: SupabaseClient<Database>): IRepositories {
  if (ADAPTER === 'drizzle') {
    return {
      users: new DrizzleUserRepo(),
      audit: new DrizzleAuditRepo(),
      wishes: new DrizzleWishRepo(),
      domains: new DrizzleDomainRepo(),
      progress: new DrizzleProgressRepo(),
      defenses: new DrizzleDefenseRepo(),
      subjects: new DrizzleSubjectRepo(),
      promotions: new DrizzlePromotionRepo(),
      juryGrades: new DrizzleJuryGradeRepo(),
      specialities: new DrizzleSpecialityRepo(),
      assignments: new DrizzleAssignmentRepo(),
      notifications: new DrizzleNotificationRepo(),
      academicYears: new DrizzleAcademicYearRepo(),
      companyReports: new DrizzleCompanyReportRepo(),
      teacherSpecialities: new DrizzleTeacherSpecialityRepo(),
      supervisorEvaluations: new DrizzleSupervisorEvaluationRepo(),
    };
  }

  // == Supabase (production) =================
  if (!supabase) {
    throw new Error(
      '[db] DATABASE_ADAPTER=supabase but no Supabase client was provided. ' +
      'Pass event.locals.supabase to createRepositories().',
    );
  }

  return {
    users: new SupabaseUserRepo(supabase),
    audit: new SupabaseAuditRepo(supabase),
    wishes: new SupabaseWishRepo(supabase),
    domains: new SupabaseDomainRepo(supabase),
    defenses: new SupabaseDefenseRepo(supabase),
    subjects: new SupabaseSubjectRepo(supabase),
    progress: new SupabaseProgressRepo(supabase),
    promotions: new SupabasePromotionRepo(supabase),
    juryGrades: new SupabaseJuryGradeRepo(supabase),
    assignments: new SupabaseAssignmentRepo(supabase),
    specialities: new SupabaseSpecialityRepo(supabase),
    notifications: new SupabaseNotificationRepo(supabase),
    academicYears: new SupabaseAcademicYearRepo(supabase),
    companyReports: new SupabaseCompanyReportRepo(supabase),
    teacherSpecialities: new SupabaseTeacherSpecialityRepo(supabase),
    supervisorEvaluations: new SupabaseSupervisorEvaluationRepo(supabase),
  };
}
