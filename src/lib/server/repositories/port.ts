/**
 * Repository Port — adapter-agnostic contracts
 *
 * These interfaces are the ONLY thing the rest of the application (use-cases,
 * routes, hooks) knows about the database. Whether the implementation is
 * Drizzle+SQLite or Supabase+PostgreSQL, the shape is identical.
 *
 * ┌==============┐     implements     ┌===========┐
 * │ Repositories │ ◄=== │ DrizzleSQLiteAdapter    │  (dev)
 * │  (this file) │                    ├===========┤
 * │              │ ◄=== │ SupabaseAdapter         │  (prod)
 * └==============┘                    └===========┘
 */

// === Shared constants ==========

export const DASHBOARD_ROLE_PATHS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  company: '/company/dashboard',
};

// === Primitive types (mirrors domain.ts, kept here for repo isolation) ========

export type Level = 'licence' | 'master' | 'ingenieur';
export type UserRole = 'student' | 'teacher' | 'admin' | 'company';
export type YearType = 'licence' | 'master' | 'ingenieur';
export type PfeStatus = 'en_cours' | 'soutenance_planifiee' | 'valide' | 'refuse';
export type GroupType = 'monome' | 'binome' | 'trinome';
export type WishStatus = 'en_attente' | 'accepte' | 'refuse';
export type TeacherGrade = 'assistant' | 'mab' | 'maa' | 'mcb' | 'mca' | 'professeur';
export type DefenseStatus = 'scheduled' | 'done' | 'postponed';
export type DefenseResult = 'admitted' | 'corrections_required' | 'not_admitted';
export type SubjectStatus = 'en_attente' | 'valide' | 'refuse' | 'expire';
export type TiebreakChoice = 'president' | 'member' | 'average';
export type ReviewDecision = 'accepte' | 'accepte_sous_reserve' | 'refuse';
export type AvailabilityStatus = 'disponible' | 'indisponible' | 'indisponible_jusqu_au';
export type AcademicYearStatus = 'active' | 'cloturee';

export type AuditActionType =
  | 'SUBJECT_SUBMITTED'
  | 'SUBJECT_VALIDATED'
  | 'SUBJECT_REFUSED'
  | 'STUDENT_ASSIGNED'
  | 'JURY_ASSIGNED'
  | 'DEFENSE_SCHEDULED'
  | 'GRADE_SUBMITTED'
  | 'GRADE_VALIDATED'
  | 'COMPANY_REGISTERED'
  | 'WISH_SUBMITTED'
  | 'NOTIFICATION_SENT'
  | 'CSV_IMPORTED'
  | 'ROLE_TRANSFERRED';

// === Row Types ==

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademicYearRow = {
  id: string;
  label: string;
  status: AcademicYearStatus;
  submission_open_at: string;
  submission_close_at: string;
  max_wishes: number;
  memoire_deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type SpecialityRow = {
  id: string;
  name: string;
  code: string;
  year_type: YearType;
  created_at: string;
};

export type DomainRow = {
  id: string;
  name: string;
};

export type PromotionRow = {
  id: string;
  label: string;
  specialty: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
};

export type StudentRow = {
  id: string;
  profile_id: string | null;
  email: string | null;
  student_number: string;
  specialty: string;
  level: Level;
  promotion_year: number;
  promotion_id: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherRow = {
  id: string;
  profile_id: string | null;
  email: string | null;
  grade: TeacherGrade;
  department: string;
  availability_status: AvailabilityStatus;
  unavailable_until: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherWithSpecialties = TeacherRow & {
  specialties: string[];
};

export type CompanyRow = {
  profile_id: string;
  company_name: string;
  logo_url: string | null;
  description: string;
  email: string;
  address: string;
  sector: string;
  website: string | null;
  contact_phone: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type SubjectRow = {
  id: string;
  code: string | null;
  title: string;
  description: string;
  group_type: GroupType;
  specialty: string;
  level: Level;
  proposer_id: string;
  proposer_role: UserRole;
  company_id: string | null;
  academic_year_id: string | null;
  validator1_id: string | null;
  validator2_id: string | null;
  validator1_decision: ReviewDecision | null;
  validator2_decision: ReviewDecision | null;
  validator1_comment: string | null;
  validator2_comment: string | null;
  status: SubjectStatus;
  created_at: string;
  updated_at: string;
  proposer_name?: string | null;
};

export type WishRow = {
  id: string;
  student_id: string;
  subject_id: string;
  academic_year_id: string;
  status: WishStatus;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  student_specialty?: string | null;
  subject_title?: string | null;
};

export type WishWithDetails = WishRow & {
  student_name?: string | null;
  student_specialty?: string | null;
  subject_title?: string | null;
};

export type AssignmentRow = {
  id: string;
  subject_id: string;
  academic_year_id: string;
  student_id: string;
  student2_id: string | null;
  student3_id: string | null;
  supervisor_id: string;
  co_supervisor_id: string | null;
  pfe_code: string | null;
  memoire_url: string | null;
  status: PfeStatus;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  student2_name?: string | null;
  student3_name?: string | null;
  supervisor_name?: string | null;
  co_supervisor_name?: string | null;
};

export type AssignmentWithSubject = AssignmentRow & {
  pfe_subjects: SubjectRow | null;
  subject_title?: string | null;
  defense?: {
    scheduled_at: string;
    room: string;
    status: DefenseStatus;
  } | null;
};

export type ProgressReportRow = {
  id: string;
  assignment_id: string;
  meeting_date: string;
  student_notes: string;
  teacher_feedback: string | null;
  attachments: string[];
  signed_by_teacher: boolean;
  created_at: string;
  updated_at: string;
  supervisor_notes?: string | null;
};

export type JuryRow = {
  id: string;
  assignment_id: string;
  president_id: string;
  member_id: string;
  created_at: string;
  updated_at: string;
};

export type JuryGradeRow = {
  id: string;
  defense_id: string;
  jury_member_id: string;
  criterion1: number;
  criterion2: number;
  criterion3: number;
  criterion4: number;
  total: number;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  jury_member_name?: string | null;
};

export type DefenseRow = {
  id: string;
  assignment_id: string;
  jury_id: string;
  scheduled_at: string;
  room: string;
  status: DefenseStatus;
  result: DefenseResult | null;
  final_grade: number | null;
  grade_gap: number | null;
  tiebreak_choice: TiebreakChoice | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  president_name?: string | null;
  member_name?: string | null;
};

export type DefenseWithJury = DefenseRow & {
  defense_juries: JuryRow;
};

export type NotificationRow = {
  id: string;
  recipient_id: string;
  type: string;
  payload: Record<string, unknown>;
  message?: string | null;
  read_at: string | null;
  created_at: string;
};

export type AuditLogRow = {
  id: string;
  actor_id: string;
  actor_name: string;
  action: AuditActionType;
  target: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type ReportType = 'company_profile_correction' | 'issue_report';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export type SupervisorEvaluationRow = {
  id: string;
  assignment_id: string;
  evaluator_id: string;
  student_id: string;
  technical_quality: number;
  methodology: number;
  autonomy: number;
  presentation: number;
  total: number;
  comment: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

export type CompanyReportRow = {
  id: string;
  company_id: string;
  reporter_id: string;
  report_type: ReportType;
  status: ReportStatus;
  description: string;
  admin_response: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

// === Insert / Update Types ===

export type ProfileUpdate = Partial<Pick<ProfileRow, 'role' | 'full_name' | 'avatar_url' | 'is_active'>>;

export type AcademicYearInsert = {
  id?: string;
  label: string;
  status?: AcademicYearStatus;
  submission_open_at: string;
  submission_close_at: string;
  max_wishes?: number;
};

export type AcademicYearUpdate = Partial<AcademicYearInsert>;

export type SpecialityInsert = {
  id?: string;
  name: string;
  code: string;
  year_type: YearType;
};

export type SpecialityUpdate = Partial<SpecialityInsert>;

export type DomainInsert = {
  id?: string;
  name: string;
};

export type PromotionInsert = {
  id?: string;
  label: string;
  specialty: string;
  academic_year_id: string;
};

export type PromotionUpdate = Partial<PromotionInsert>;

export type SubjectInsert = {
  id?: string;
  code?: string;
  title: string;
  description: string;
  group_type: GroupType;
  specialty: string;
  level: Level;
  proposer_id: string;
  proposer_role: UserRole;
  company_id?: string | null;
  academic_year_id?: string | null;
  validator1_id?: string | null;
  validator2_id?: string | null;
  status?: SubjectStatus;
};

export type SubjectUpdate = Partial<SubjectInsert>;

export type SubjectValidatorUpdate = Partial<{
  validator1_id: string | null;
  validator2_id: string | null;
  validator1_decision: ReviewDecision | null;
  validator2_decision: ReviewDecision | null;
  validator1_comment: string | null;
  validator2_comment: string | null;
  status: SubjectStatus;
}>;

export type StudentInsert = {
  id?: string;
  profile_id?: string | null;
  email: string;
  student_number: string;
  specialty: string;
  level: Level;
  promotion_year: number;
  promotion_id?: string | null;
};

export type TeacherInsert = {
  id?: string;
  profile_id?: string | null;
  email: string;
  grade: TeacherGrade;
  department: string;
  availability_status?: AvailabilityStatus;
  unavailable_until?: string | null;
};

export type TeacherAvailabilityUpdate = Partial<{
  availability_status: AvailabilityStatus;
  unavailable_until: string | null;
}>;

export type AssignmentInsert = {
  id?: string;
  subject_id: string;
  academic_year_id: string;
  student_id: string;
  student2_id?: string | null;
  student3_id?: string | null;
  supervisor_id: string;
  co_supervisor_id?: string | null;
  pfe_code?: string | null;
  memoire_url?: string | null;
};

export type AssignmentUpdate = Partial<
  AssignmentInsert & {
    status?: PfeStatus;
  }
>;

export type ProgressReportInsert = {
  id?: string;
  assignment_id: string;
  meeting_date: string;
  student_notes: string;
  attachments?: string[];
};

export type ProgressReportUpdate = Partial<
  ProgressReportInsert & {
    teacher_feedback?: string | null;
    signed_by_teacher?: boolean;
  }
>;

export type WishInsert = {
  id?: string;
  student_id: string;
  subject_id: string;
  academic_year_id: string;
  status?: WishStatus;
};

export type JuryInsert = {
  id?: string;
  assignment_id: string;
  president_id: string;
  member_id: string;
};

export type DefenseInsert = {
  id?: string;
  assignment_id: string;
  jury_id: string;
  scheduled_at: string;
  room: string;
};

export type DefenseUpdate = Partial<
  DefenseInsert & {
    status?: DefenseStatus;
    result?: DefenseResult | null;
    final_grade?: number | null;
    grade_gap?: number | null;
    tiebreak_choice?: TiebreakChoice | null;
    comment?: string | null;
  }
>;

export type JuryGradeInsert = {
  id?: string;
  defense_id: string;
  jury_member_id: string;
  criterion1: number;
  criterion2: number;
  criterion3: number;
  criterion4: number;
  total?: number;
};

export type JuryGradeUpdate = Partial<
  JuryGradeInsert & {
    total?: number;
  }
>;

export type NotificationInsert = {
  id?: string;
  recipient_id: string;
  type: string;
  payload?: Record<string, unknown>;
  message?: string;
};

export type AuditLogInsert = {
  id?: string;
  actor_id: string;
  actor_name: string;
  action: AuditActionType;
  target: string;
  details?: Record<string, unknown> | null;
};

export type SupervisorEvaluationInsert = {
  id?: string;
  assignment_id: string;
  evaluator_id: string;
  student_id: string;
  technical_quality?: number;
  methodology?: number;
  autonomy?: number;
  presentation?: number;
  total?: number;
  comment?: string | null;
};

export type SupervisorEvaluationUpdate = Partial<SupervisorEvaluationInsert>;

export type CompanyReportInsert = {
  id?: string;
  company_id: string;
  reporter_id: string;
  report_type: ReportType;
  description: string;
};

export type CompanyReportUpdate = Partial<{
  status: ReportStatus;
  admin_response: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
}>;

// === Repository Interfaces ===

export interface IAcademicYearRepository {
  findAll(): Promise<AcademicYearRow[]>;
  findById(id: string): Promise<AcademicYearRow | null>;
  findActive(): Promise<AcademicYearRow | null>;
  insert(data: AcademicYearInsert): Promise<AcademicYearRow>;
  update(id: string, data: AcademicYearUpdate): Promise<AcademicYearRow>;
}

export interface ISpecialityRepository {
  findAll(): Promise<SpecialityRow[]>;
  findById(id: string): Promise<SpecialityRow | null>;
  findByYearType(yearType: YearType): Promise<SpecialityRow[]>;
  insert(data: SpecialityInsert): Promise<SpecialityRow>;
  update(id: string, data: SpecialityUpdate): Promise<SpecialityRow>;
  delete(id: string): Promise<void>;
}

export interface IPromotionRepository {
  findAll(): Promise<PromotionRow[]>;
  findById(id: string): Promise<PromotionRow | null>;
  findByAcademicYear(academicYearId: string): Promise<PromotionRow[]>;
  insert(data: PromotionInsert): Promise<PromotionRow>;
}

export interface ISubjectRepository {
  findAll(): Promise<SubjectRow[]>;
  findById(id: string): Promise<SubjectRow | null>;
  findByProposer(proposerId: string): Promise<SubjectRow[]>;
  findByStatus(status: string): Promise<SubjectRow[]>;
  findByAcademicYear(yearId: string): Promise<SubjectRow[]>;
  findByValidator(validatorProfileId: string): Promise<SubjectRow[]>;
  findValidatedBySpecialty(specialty: string, yearId: string): Promise<SubjectRow[]>;
  insert(data: SubjectInsert): Promise<SubjectRow>;
  updateStatus(id: string, status: SubjectStatus): Promise<SubjectRow>;
  updateValidators(id: string, data: SubjectValidatorUpdate): Promise<SubjectRow>;
}

export interface IWishRepository {
  findByStudent(studentId: string, yearId: string): Promise<WishRow[]>;
  findBySubject(subjectId: string): Promise<WishRow[]>;
  findById(id: string): Promise<WishRow | null>;
  countByStudent(studentId: string, yearId: string): Promise<number>;
  insert(data: WishInsert): Promise<WishRow>;
  updateStatus(id: string, status: WishStatus): Promise<WishRow>;
  delete(id: string): Promise<void>;
}

export interface IAssignmentRepository {
  findAll(): Promise<AssignmentRow[]>;
  findById(id: string): Promise<AssignmentRow | null>;
  findByStudent(studentId: string): Promise<AssignmentWithSubject[]>;
  findBySupervisor(supervisorId: string): Promise<AssignmentWithSubject[]>;
  findByAcademicYear(yearId: string): Promise<AssignmentRow[]>;
  updateStatus(id: string, status: PfeStatus): Promise<AssignmentRow>;
  update(id: string, data: AssignmentUpdate): Promise<AssignmentRow>;
  insert(data: AssignmentInsert): Promise<AssignmentRow>;
}

export interface IProgressReportRepository {
  findByAssignment(assignmentId: string): Promise<ProgressReportRow[]>;
  insert(data: ProgressReportInsert): Promise<ProgressReportRow>;
  cosign(id: string, feedback: string): Promise<ProgressReportRow>;
}

export interface IJuryRepository {
  // Jury management is done through IDefenseRepository
}

export interface IDefenseRepository {
  insertJury(data: JuryInsert): Promise<JuryRow>;
  insertDefense(data: DefenseInsert): Promise<DefenseRow>;
  updateDefenseResult(id: string, data: DefenseUpdate): Promise<DefenseRow>;
  findByAssignment(assignmentId: string): Promise<DefenseWithJury | null>;
  findAll(): Promise<DefenseRow[]>;
  confirmJury(defenseId: string, userId: string, hasPrintedVersion: boolean): Promise<void>;
  declineJury(defenseId: string, userId: string): Promise<void>;
}

export interface IJuryGradeRepository {
  findByDefense(defenseId: string): Promise<JuryGradeRow[]>;
  findByMember(defenseId: string, memberId: string): Promise<JuryGradeRow | null>;
  insert(data: JuryGradeInsert): Promise<JuryGradeRow>;
}

export interface INotificationRepository {
  findByRecipient(recipientId: string, unreadOnly?: boolean): Promise<NotificationRow[]>;
  markRead(id: string): Promise<void>;
  markAllRead(recipientId: string): Promise<void>;
  insert(recipientId: string, type: string, payload: Record<string, unknown>): Promise<void>;
  countUnread(recipientId: string): Promise<number>;
}

export interface IAuditLogRepository {
  log(
    actorId: string,
    action: AuditActionType,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  findAll(filters?: {
    action?: AuditActionType;
    actorId?: string;
  }): Promise<{
    id: string;
    actor_id: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }[]>;
}

export interface IUserRepository {
  findProfileById(profileId: string): Promise<ProfileRow | null>;
  findAllProfiles(): Promise<ProfileRow[]>;
  findProfilesByRole(role: string): Promise<ProfileRow[]>;
  updateProfile(id: string, data: ProfileUpdate): Promise<ProfileRow>;
  deleteProfile(id: string): Promise<void>;
  findStudentByProfileId(profileId: string): Promise<StudentRow | null>;
  findStudentByEmail(email: string): Promise<StudentRow | null>;
  findAllStudents(): Promise<StudentRow[]>;
  addStudentToWhitelist(data: StudentInsert): Promise<StudentRow>;
  findTeacherByProfileId(profileId: string): Promise<TeacherWithSpecialties | null>;
  findAllTeachers(): Promise<TeacherWithSpecialties[]>;
  findTeachersBySpecialty(specialty: string): Promise<TeacherWithSpecialties[]>;
  addTeacherToWhitelist(data: TeacherInsert): Promise<TeacherRow>;
  updateTeacherAvailability(profileId: string, data: TeacherAvailabilityUpdate): Promise<TeacherRow>;
  findCompanyByProfileId(profileId: string): Promise<CompanyRow | null>;
  findAllCompanies(): Promise<CompanyRow[]>;
  updateCompanyVerification(profileId: string, isVerified: boolean): Promise<CompanyRow>;
  updateCompany(
    profileId: string,
    data: Partial<
      Pick<
        CompanyRow,
        | 'company_name'
        | 'description'
        | 'email'
        | 'address'
        | 'sector'
        | 'website'
        | 'contact_phone'
        | 'logo_url'
      >
    >,
  ): Promise<CompanyRow>;
}

export interface ITeacherSpecialityRepository {
  findByTeacher(teacherId: string): Promise<string[]>;
  setTeacherSpecialities(teacherId: string, specialityIds: string[]): Promise<void>;
}

export interface ISupervisorEvaluationRepository {
  findByAssignment(assignmentId: string): Promise<SupervisorEvaluationRow[]>;
  findByStudent(studentId: string): Promise<SupervisorEvaluationRow[]>;
  findByEvaluator(evaluatorId: string, assignmentId: string): Promise<SupervisorEvaluationRow | null>;
  insert(data: SupervisorEvaluationInsert): Promise<SupervisorEvaluationRow>;
  update(id: string, data: SupervisorEvaluationUpdate): Promise<SupervisorEvaluationRow>;
}

export interface ICompanyReportRepository {
  findAll(): Promise<CompanyReportRow[]>;
  findByCompany(companyId: string): Promise<CompanyReportRow[]>;
  findByStatus(status: ReportStatus): Promise<CompanyReportRow[]>;
  findById(id: string): Promise<CompanyReportRow | null>;
  insert(data: CompanyReportInsert): Promise<CompanyReportRow>;
  update(id: string, data: CompanyReportUpdate): Promise<CompanyReportRow>;
}

export interface IDomainRepository {
  findAll(): Promise<DomainRow[]>;
  findById(id: string): Promise<DomainRow | null>;
  insert(data: DomainInsert): Promise<DomainRow>;
  delete(id: string): Promise<void>;
}

export interface IRepositories {
  academicYears: IAcademicYearRepository;
  specialities: ISpecialityRepository;
  promotions: IPromotionRepository;
  domains: IDomainRepository;
  subjects: ISubjectRepository;
  assignments: IAssignmentRepository;
  progress: IProgressReportRepository;
  defenses: IDefenseRepository;
  juryGrades: IJuryGradeRepository;
  supervisorEvaluations: ISupervisorEvaluationRepository;
  companyReports: ICompanyReportRepository;
  notifications: INotificationRepository;
  audit: IAuditLogRepository;
  users: IUserRepository;
  teacherSpecialities: ITeacherSpecialityRepository;
  wishes: IWishRepository;
}