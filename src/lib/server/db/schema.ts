/**
 * Drizzle SQLite Schema
 *
 * Single source of truth for the data model in development.
 * Change a table here, run `pnpm db:push`, and you're done.
 *
 * To migrate production (Supabase), run `pnpm db:generate` after your changes
 * to generate a SQL migration file you can apply there.
 *
 * Column naming: snake_case throughout.
 * Enums: stored as TEXT with a typed enum list (SQLite has no native enum).
 * Arrays: stored as JSON text, deserialized by Drizzle via { mode: 'json' }.
 */

import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

// === Helpers ====

const now = () => sql`(datetime('now'))`;
const uuid = () => ({ $defaultFn: () => randomUUID() });

const DOMAINS = [
  'informatique',
  'mathematiques',
  'physique',
  'chimie',
  'biologie',
  'electronique',
  'economie_gestion',
  'langues',
] as const;

// === Enum constants (TEXT columns with a fixed set of values) ===

const ROLES = ['student', 'teacher', 'admin', 'company'] as const;
const LEVELS = ['licence', 'master', 'ingenieur'] as const;

const YEAR_TYPES = ['licence', 'master', 'ingenieur'] as const;

const TEACHER_GRADES = [
  'assistant', 'mab', 'maa', 'mcb', 'mca', 'professeur',
] as const;

const AVAILABILITY_STATUSES = [
  'disponible', 'indisponible', 'indisponible_jusqu_au',
] as const;

const GROUP_TYPES = ['monome', 'binome', 'trinome'] as const;

const SUBJECT_STATUSES = [
  'en_attente', 'valide', 'refuse', 'expire',
] as const;

const REVIEW_DECISIONS = [
  'accepte', 'accepte_sous_reserve', 'refuse',
] as const;

const WISH_STATUSES = ['en_attente', 'accepte', 'refuse'] as const;

const PFE_STATUSES = [
  'en_cours', 'soutenance_planifiee', 'valide', 'refuse',
] as const;

const DEFENSE_STATUSES = ['scheduled', 'done', 'postponed'] as const;

const DEFENSE_RESULTS = [
  'admitted', 'corrections_required', 'not_admitted',
] as const;

const TIEBREAK_CHOICES = ['president', 'member', 'average'] as const;

const ACADEMIC_YEAR_STATUSES = ['active', 'cloturee'] as const;

const REPORT_TYPES = ['company_profile_correction', 'issue_report'] as const;
const REPORT_STATUSES = ['pending', 'resolved', 'rejected'] as const;

const AUDIT_ACTIONS = [
  'SUBJECT_SUBMITTED', 'SUBJECT_VALIDATED', 'SUBJECT_REFUSED',
  'STUDENT_ASSIGNED', 'JURY_ASSIGNED', 'DEFENSE_SCHEDULED',
  'GRADE_SUBMITTED', 'GRADE_VALIDATED', 'COMPANY_REGISTERED',
  'WISH_SUBMITTED', 'NOTIFICATION_SENT', 'CSV_IMPORTED', 'ROLE_TRANSFERRED',
] as const;

// === Tables =====

/**
 * Mirror of auth.users — stores app-level profile data.
 * id matches the Supabase auth user UUID.
 */
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ROLES }).notNull().default('student'),
  full_name: text('full_name').notNull().default(''),
  avatar_url: text('avatar_url'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * An academic year defines the lifecycle of a PFE cycle.
 * Subjects expire when submission_close_at is reached.
 */
export const academicYears = sqliteTable('academic_years', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  label: text('label').notNull().unique(), // ex. "2024-2025"
  status: text('status', { enum: ACADEMIC_YEAR_STATUSES }).notNull().default('active'),
  submission_open_at: text('submission_open_at').notNull(),
  submission_close_at: text('submission_close_at').notNull(),
  max_wishes: integer('max_wishes').notNull().default(5),
  memoire_deadline: text('memoire_deadline'),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * A specialty (specialite) defines a field of study.
 * Used as a foreign key reference from teachers, students, subjects, and promotions.
 * Zero string hardcoding: all specialty references use specialities.id.
 */
export const specialities = sqliteTable('specialities', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  name: text('name').notNull(), // ex. "Ingenierie des Systemes d Information et Logiciel"
  code: text('code').notNull().unique(), // ex. "ISIL"
  year_type: text('year_type', { enum: YEAR_TYPES }).notNull(), // 'licence' | 'master'
  created_at: text('created_at').notNull().default(now()),
});

/**
 * A promotion groups students of the same specialty and academic year.
 * Used for filtering and reporting.
 */
export const promotions = sqliteTable('promotions', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  label: text('label').notNull(), // ex. "Promotion ISIL 2024-2025"
  specialty: text('specialty').notNull().references(() => specialities.id, { onDelete: 'restrict' }),
  academic_year_id: text('academic_year_id')
    .notNull()
    .references(() => academicYears.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * Pre-registered student whitelist.
 * Linked to a profile once the student signs in with Google OAuth.
 */
export const students = sqliteTable('students', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  profile_id: text('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  email: text('email').unique(),
  student_number: text('student_number').notNull().unique(),
  specialty: text('specialty').notNull().references(() => specialities.id, { onDelete: 'restrict' }),
  level: text('level', { enum: LEVELS }).notNull(),
  promotion_year: integer('promotion_year').notNull(),
  promotion_id: text('promotion_id').references(
    () => promotions.id,
    { onDelete: 'set null' },
  ),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * Pre-registered teacher whitelist.
 * Linked to a profile once the teacher signs in with Google OAuth.
 */
export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  profile_id: text('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  email: text('email').unique(),
  grade: text('grade', { enum: TEACHER_GRADES }).notNull().default('assistant'),
  department: text('department').notNull(),
  availability_status: text('availability_status', { enum: AVAILABILITY_STATUSES })
    .notNull()
    .default('disponible'),
  // Only set when availability_status = 'indisponible_jusqu_au'.
  // System resets to 'disponible' once this date is passed.
  unavailable_until: text('unavailable_until'),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * Join table: teacher <-> speciality (many-to-many).
 * Replaces the old JSON array `teachers.specialties`.
 * Each row links one teacher to one speciality via FK references.
 */
export const teacherSpecialities = sqliteTable('teacher_specialities', {
  teacher_id: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  speciality_id: text('speciality_id').notNull().references(() => specialities.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.teacher_id, table.speciality_id] }),
}));

export type TeacherSpecialityInsert = typeof teacherSpecialities.$inferInsert;
export type TeacherSpecialitySelect = typeof teacherSpecialities.$inferSelect;

/**
 * Predefined domain catalog (8 fixed domains).
 * Used to categorize teachers and subjects at a higher level than specialties.
 */
export const domains = sqliteTable('domains', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

/** Many-to-many: teacher <-> domain */
export const teacherDomains = sqliteTable('teacher_domains', {
  teacher_id: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  domain_id: text('domain_id').notNull().references(() => domains.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.teacher_id, table.domain_id] }),
}));

/** Many-to-many: subject <-> domain */
export const subjectDomains = sqliteTable('subject_domains', {
  subject_id: text('subject_id').notNull().references(() => pfeSubjects.id, { onDelete: 'cascade' }),
  domain_id: text('domain_id').notNull().references(() => domains.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.subject_id, table.domain_id] }),
}));

export type DomainInsert = typeof domains.$inferInsert;
export type DomainSelect = typeof domains.$inferSelect;
export type TeacherDomainInsert = typeof teacherDomains.$inferInsert;
export type TeacherDomainSelect = typeof teacherDomains.$inferSelect;
export type SubjectDomainInsert = typeof subjectDomains.$inferInsert;
export type SubjectDomainSelect = typeof subjectDomains.$inferSelect;

export const companies = sqliteTable('companies', {
  profile_id: text('profile_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  company_name: text('company_name').notNull(),
  logo_url: text('logo_url'),
  description: text('description').notNull().default(''),
  email: text('email').notNull().default(''),
  address: text('address').notNull().default(''),
  sector: text('sector').notNull().default(''),
  website: text('website'),
  contact_phone: text('contact_phone').notNull().default(''),
  is_verified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * A PFE subject proposed by a teacher or company.
 * Status flow: en_attente -> valide / refuse / expire
 *
 * Validation is done by two teachers (validator1 + validator2) assigned by admin.
 * Subject becomes valide only when both decisions are 'accepte' or 'accepte_sous_reserve'.
 */
export const pfeSubjects = sqliteTable('pfe_subjects', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  code: text('code').unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  group_type: text('group_type', { enum: GROUP_TYPES }).notNull().default('monome'),
  specialty: text('specialty').notNull().references(() => specialities.id, { onDelete: 'restrict' }),
  level: text('level', { enum: LEVELS }).notNull(),
  proposer_id: text('proposer_id').notNull().references(() => profiles.id),
  proposer_role: text('proposer_role', { enum: ROLES }).notNull(),
  company_id: text('company_id').references(() => companies.profile_id, { onDelete: 'set null' }),
  academic_year_id: text('academic_year_id').references(() => academicYears.id, { onDelete: 'set null' }),
  // Validators assigned by admin
  validator1_id: text('validator1_id').references(() => profiles.id, { onDelete: 'set null' }),
  validator2_id: text('validator2_id').references(() => profiles.id, { onDelete: 'set null' }),
  validator1_decision: text('validator1_decision', { enum: REVIEW_DECISIONS }),
  validator2_decision: text('validator2_decision', { enum: REVIEW_DECISIONS }),
  validator1_comment: text('validator1_comment'),
  validator2_comment: text('validator2_comment'),
  status: text('status', { enum: SUBJECT_STATUSES }).notNull().default('en_attente'),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * A student wish (voeu) for a given subject in a given academic year.
 * Students submit wishes without priority; supervisors choose among applicants.
 * Capped per student by academic_years.max_wishes.
 */
export const wishes = sqliteTable('wishes', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  student_id: text('student_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  subject_id: text('subject_id').notNull().references(() => pfeSubjects.id, { onDelete: 'cascade' }),
  academic_year_id: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  status: text('status', { enum: WISH_STATUSES }).notNull().default('en_attente'),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * A PFE assignment links a validated subject to 1–3 students and a supervisor.
 * - monome  : student_id only
 * - binome  : student_id + student2_id
 * - trinome : student_id + student2_id + student3_id
 */
export const pfeAssignments = sqliteTable('pfe_assignments', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  subject_id: text('subject_id').notNull().unique().references(() => pfeSubjects.id, { onDelete: 'cascade' }),
  academic_year_id: text('academic_year_id').notNull().references(() => academicYears.id),
  student_id: text('student_id').notNull().references(() => profiles.id),
  student2_id: text('student2_id').references(() => profiles.id, { onDelete: 'set null' }),
  student3_id: text('student3_id').references(() => profiles.id, { onDelete: 'set null' }),
  supervisor_id: text('supervisor_id').notNull().references(() => profiles.id),
  co_supervisor_id: text('co_supervisor_id').references(() => profiles.id, { onDelete: 'set null' }),
  pfe_code: text('pfe_code').unique(),
  memoire_url: text('memoire_url'),
  status: text('status', { enum: PFE_STATUSES }).notNull().default('en_cours'),
  assigned_at: text('assigned_at').notNull().default(now()),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

export const pfeProgressReports = sqliteTable('pfe_progress_reports', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  assignment_id: text('assignment_id').notNull().references(() => pfeAssignments.id, { onDelete: 'cascade' }),
  meeting_date: text('meeting_date').notNull(),  // ISO date "YYYY-MM-DD"
  student_notes: text('student_notes').notNull().default(''),
  teacher_feedback: text('teacher_feedback'),
  attachments: text('attachments', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  signed_by_teacher: integer('signed_by_teacher', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * Jury for a defense: exactly two members (president + one member).
 * Neither can be the student's own supervisor.
 */
export const defenseJuries = sqliteTable('defense_juries', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  assignment_id: text('assignment_id').notNull().unique().references(() => pfeAssignments.id, { onDelete: 'cascade' }),
  president_id: text('president_id').notNull().references(() => profiles.id),
  member_id: text('member_id').notNull().references(() => profiles.id),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * An individual jury member's grade for a defense.
 * 4 criteria, each scored 0–5; total is the sum (max 20).
 * Each member submits their grade independently.
 */
export const juryGrades = sqliteTable('jury_grades', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  defense_id: text('defense_id').notNull().references(() => defenses.id, { onDelete: 'cascade' }),
  jury_member_id: text('jury_member_id').notNull().references(() => profiles.id),
  criterion1: real('criterion1').notNull().default(0),  // /5
  criterion2: real('criterion2').notNull().default(0),  // /5
  criterion3: real('criterion3').notNull().default(0),  // /5
  criterion4: real('criterion4').notNull().default(0),  // /5
  total: real('total').notNull().default(0),       // /20, auto-computed
  submitted_at: text('submitted_at').notNull().default(now()),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * A scheduled defense session.
 *
 * Grade resolution rules:
 * - gap = |president_total - member_total|
 * - gap <= 1 : final_grade = average, validated automatically
 * - gap >  1 : president chooses tiebreak_choice:
 *              'president' -> use president's grade
 *              'member'    -> use member's grade
 *              'average'   -> use the average
 */
export const defenses = sqliteTable('defenses', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  assignment_id: text('assignment_id').notNull().unique().references(() => pfeAssignments.id, { onDelete: 'cascade' }),
  jury_id: text('jury_id').notNull().references(() => defenseJuries.id),
  scheduled_at: text('scheduled_at').notNull(),
  room: text('room').notNull().default(''),
  status: text('status', { enum: DEFENSE_STATUSES }).notNull().default('scheduled'),
  result: text('result', { enum: DEFENSE_RESULTS }),
  final_grade: real('final_grade'),
  grade_gap: real('grade_gap'),
  tiebreak_choice: text('tiebreak_choice', { enum: TIEBREAK_CHOICES }),
  comment: text('comment'),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  recipient_id: text('recipient_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  payload: text('payload', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  read_at: text('read_at'),
  created_at: text('created_at').notNull().default(now()),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  actor_id: text('actor_id').notNull().references(() => profiles.id),
  action: text('action', { enum: AUDIT_ACTIONS }).notNull(),
  entity: text('entity').notNull(),
  entity_id: text('entity_id').notNull(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  created_at: text('created_at').notNull().default(now()),
});

export const pfeStatusHistory = sqliteTable('pfe_status_history', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  subject_id: text('subject_id').notNull().references(() => pfeSubjects.id, { onDelete: 'cascade' }),
  from_status: text('from_status', { enum: SUBJECT_STATUSES }),
  to_status: text('to_status', { enum: SUBJECT_STATUSES }).notNull(),
  actor_id: text('actor_id').notNull().references(() => profiles.id),
  reason: text('reason'),
  created_at: text('created_at').notNull().default(now()),
});

/**
 * Supervisor evaluation of a student for a specific PFE assignment.
 * Each supervisor (internal or company co-supervisor) can submit one evaluation per assignment.
 */
export const supervisorEvaluations = sqliteTable('supervisor_evaluations', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  assignment_id: text('assignment_id').notNull().references(() => pfeAssignments.id, { onDelete: 'cascade' }),
  evaluator_id: text('evaluator_id').notNull().references(() => profiles.id),
  student_id: text('student_id').notNull().references(() => profiles.id),
  technical_quality: real('technical_quality').notNull().default(0),   // /5
  methodology: real('methodology').notNull().default(0),               // /5
  autonomy: real('autonomy').notNull().default(0),                     // /5
  presentation: real('presentation').notNull().default(0),             // /5
  total: real('total').notNull().default(0),                           // /20
  comment: text('comment'),
  submitted_at: text('submitted_at').notNull().default(now()),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

/**
 * Reports submitted by companies (profile corrections, issues, etc.).
 * Reviewed and resolved by the admin.
 */
export const companyReports = sqliteTable('company_reports', {
  id: text('id').primaryKey().$defaultFn(randomUUID),
  company_id: text('company_id').notNull().references(() => companies.profile_id, { onDelete: 'cascade' }),
  reporter_id: text('reporter_id').notNull().references(() => profiles.id),
  report_type: text('report_type', { enum: REPORT_TYPES }).notNull(),
  status: text('status', { enum: REPORT_STATUSES }).notNull().default('pending'),
  description: text('description').notNull(),
  admin_response: text('admin_response'),
  resolved_by: text('resolved_by').references(() => profiles.id),
  resolved_at: text('resolved_at'),
  created_at: text('created_at').notNull().default(now()),
  updated_at: text('updated_at').notNull().default(now()),
});

// === Relations ==

export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  promotions: many(promotions),
  pfe_subjects: many(pfeSubjects),
  pfe_assignments: many(pfeAssignments),
  wishes: many(wishes),
}));

export const promotionsRelations = relations(promotions, ({ one, many }) => ({
  academic_year: one(academicYears, {
    fields: [promotions.academic_year_id],
    references: [academicYears.id],
  }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [students.profile_id],
    references: [profiles.id],
  }),
  promotion: one(promotions, {
    fields: [students.promotion_id],
    references: [promotions.id],
  }),
  wishes: many(wishes),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [teachers.profile_id],
    references: [profiles.id],
  }),
  domainLinks: many(teacherDomains),
}));

export const domainsRelations = relations(domains, ({ many }) => ({
  teacherLinks: many(teacherDomains),
  subjectLinks: many(subjectDomains),
}));

export const teacherDomainsRelations = relations(teacherDomains, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherDomains.teacher_id],
    references: [teachers.id],
  }),
  domain: one(domains, {
    fields: [teacherDomains.domain_id],
    references: [domains.id],
  }),
}));

export const subjectDomainsRelations = relations(subjectDomains, ({ one }) => ({
  subject: one(pfeSubjects, {
    fields: [subjectDomains.subject_id],
    references: [pfeSubjects.id],
  }),
  domain: one(domains, {
    fields: [subjectDomains.domain_id],
    references: [domains.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one }) => ({
  profile: one(profiles, {
    fields: [companies.profile_id],
    references: [profiles.id],
  }),
}));

export const pfeSubjectsRelations = relations(pfeSubjects, ({ one, many }) => ({
  proposer: one(profiles, {
    fields: [pfeSubjects.proposer_id],
    references: [profiles.id],
  }),
  academic_year: one(academicYears, {
    fields: [pfeSubjects.academic_year_id],
    references: [academicYears.id],
  }),
  pfe_assignments: many(pfeAssignments),
  pfe_status_history: many(pfeStatusHistory),
  wishes: many(wishes),
}));

export const wishesRelations = relations(wishes, ({ one }) => ({
  student: one(profiles, {
    fields: [wishes.student_id],
    references: [profiles.id],
  }),
  subject: one(pfeSubjects, {
    fields: [wishes.subject_id],
    references: [pfeSubjects.id],
  }),
  academic_year: one(academicYears, {
    fields: [wishes.academic_year_id],
    references: [academicYears.id],
  }),
}));

export const pfeAssignmentsRelations = relations(pfeAssignments, ({ one, many }) => ({
  subject: one(pfeSubjects, {
    fields: [pfeAssignments.subject_id],
    references: [pfeSubjects.id],
  }),
  academic_year: one(academicYears, {
    fields: [pfeAssignments.academic_year_id],
    references: [academicYears.id],
  }),
  pfe_progress_reports: many(pfeProgressReports),
  defense_juries: one(defenseJuries, {
    fields: [pfeAssignments.id],
    references: [defenseJuries.assignment_id],
  }),
  defense: one(defenses, {
    fields: [pfeAssignments.id],
    references: [defenses.assignment_id],
  }),
}));

export const pfeProgressReportsRelations = relations(pfeProgressReports, ({ one }) => ({
  assignment: one(pfeAssignments, {
    fields: [pfeProgressReports.assignment_id],
    references: [pfeAssignments.id],
  }),
}));

export const defenseJuriesRelations = relations(defenseJuries, ({ one }) => ({
  assignment: one(pfeAssignments, {
    fields: [defenseJuries.assignment_id],
    references: [pfeAssignments.id],
  }),
  defense: one(defenses, {
    fields: [defenseJuries.id],
    references: [defenses.jury_id],
  }),
}));

export const defensesRelations = relations(defenses, ({ one, many }) => ({
  jury: one(defenseJuries, {
    fields: [defenses.jury_id],
    references: [defenseJuries.id],
  }),
  jury_grades: many(juryGrades),
}));

export const juryGradesRelations = relations(juryGrades, ({ one }) => ({
  defense: one(defenses, {
    fields: [juryGrades.defense_id],
    references: [defenses.id],
  }),
  jury_member: one(profiles, {
    fields: [juryGrades.jury_member_id],
    references: [profiles.id],
  }),
}));

// === Inferred Types ============
// Use these at the Drizzle layer only; use domain.ts interfaces everywhere else.

export type SpecialityInsert = typeof specialities.$inferInsert;
export type SpecialitySelect = typeof specialities.$inferSelect;
export type ProfileInsert = typeof profiles.$inferInsert;
export type ProfileSelect = typeof profiles.$inferSelect;
export type AcademicYearInsert = typeof academicYears.$inferInsert;
export type AcademicYearSelect = typeof academicYears.$inferSelect;
export type PromotionInsert = typeof promotions.$inferInsert;
export type PromotionSelect = typeof promotions.$inferSelect;
export type StudentInsert = typeof students.$inferInsert;
export type StudentSelect = typeof students.$inferSelect;
export type TeacherInsert = typeof teachers.$inferInsert;
export type TeacherSelect = typeof teachers.$inferSelect;
export type CompanyInsert = typeof companies.$inferInsert;
export type CompanySelect = typeof companies.$inferSelect;
export type SubjectInsert = typeof pfeSubjects.$inferInsert;
export type SubjectSelect = typeof pfeSubjects.$inferSelect;
export type WishInsert = typeof wishes.$inferInsert;
export type WishSelect = typeof wishes.$inferSelect;
export type AssignmentInsert = typeof pfeAssignments.$inferInsert;
export type AssignmentSelect = typeof pfeAssignments.$inferSelect;
export type ProgressReportInsert = typeof pfeProgressReports.$inferInsert;
export type ProgressReportSelect = typeof pfeProgressReports.$inferSelect;
export type JuryInsert = typeof defenseJuries.$inferInsert;
export type JurySelect = typeof defenseJuries.$inferSelect;
export type JuryGradeInsert = typeof juryGrades.$inferInsert;
export type JuryGradeSelect = typeof juryGrades.$inferSelect;
export type DefenseInsert = typeof defenses.$inferInsert;
export type DefenseSelect = typeof defenses.$inferSelect;
export type SupervisorEvaluationInsert = typeof supervisorEvaluations.$inferInsert;
export type SupervisorEvaluationSelect = typeof supervisorEvaluations.$inferSelect;
export type CompanyReportInsert = typeof companyReports.$inferInsert;
export type CompanyReportSelect = typeof companyReports.$inferSelect;
