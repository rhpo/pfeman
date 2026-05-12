/**
 * Seed script for development database.
 *
 * Creates comprehensive test data covering every possible case:
 * - All 3 niveaux: Licence, Master, Ingenieur
 * - Multiple specialities per niveau
 * - All subject statuses: en_attente, valide, refuse, expire
 * - All group types: monome, binome, trinome
 * - All proposer roles: teacher, company, student
 * - Multiple academic years (active + closed)
 * - Promotions for each speciality
 * - Teachers, students, companies with various configurations
 * - Domains + teacher_domains + subject_domains
 * - Wishes (student voeux)
 * - PFE assignments (with co-supervisors)
 * - Defenses + juries + jury grades
 * - Supervisor evaluations
 * - Progress reports
 * - Notifications
 * - PFE status history
 *
 * Usage: pnpm db:seed
 */

import { db } from './client';

import {
  profiles,
  specialities,
  teachers,
  teacherSpecialities,
  students,
  companies,
  academicYears,
  promotions,
  pfeSubjects,
  domains,
  teacherDomains,
  subjectDomains,
  wishes,
  pfeAssignments,
  pfeProgressReports,
  defenseJuries,
  defenses,
  juryGrades,
  supervisorEvaluations,
  notifications,
  pfeStatusHistory,
} from './schema';

// === Helpers ====

const now = new Date().toISOString();

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function datetimeStr(y: number, m: number, d: number, h = 9, min = 0): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}

// === Seed data ===

async function seed() {
  console.log('Seeding database...\n');

  // ═══════════════════════════════════════════════════════════════
  // 1. Profiles
  // ═══════════════════════════════════════════════════════════════

  const profileData: Array<{
    id: string;
    role: 'admin' | 'teacher' | 'student' | 'company';
    full_name: string;
  }> = [
      // Admin
      { id: 'seed-admin-001', role: 'admin', full_name: 'Administrateur PFE' },

      // == Teachers ==

      // Licence — BI
      { id: 'seed-teacher-bi-001', role: 'teacher', full_name: 'Prof. BI 1' },
      { id: 'seed-teacher-bi-002', role: 'teacher', full_name: 'Prof. BI 2' },

      // Master — SSI
      { id: 'seed-teacher-ssi-001', role: 'teacher', full_name: 'Prof. SSI 1' },
      { id: 'seed-teacher-ssi-002', role: 'teacher', full_name: 'Prof. SSI 2' },

      // Master — CYS
      { id: 'seed-teacher-cys-001', role: 'teacher', full_name: 'Prof. CYS 1' },
      { id: 'seed-teacher-cys-002', role: 'teacher', full_name: 'Prof. CYS 2' },

      // Master — BDT
      { id: 'seed-teacher-bdt-001', role: 'teacher', full_name: 'Prof. BDT 1' },
      { id: 'seed-teacher-bdt-002', role: 'teacher', full_name: 'Prof. BDT 2' },

      // Ingenieur — ISIL
      { id: 'seed-teacher-isil-001', role: 'teacher', full_name: 'Prof. ISIL 1' },
      { id: 'seed-teacher-isil-002', role: 'teacher', full_name: 'Prof. ISIL 2' },
      { id: 'seed-teacher-isil-003', role: 'teacher', full_name: 'Prof. ISIL 3' },

      // Ingenieur — CHIM
      { id: 'seed-teacher-chim-001', role: 'teacher', full_name: 'Prof. CHIM 1' },
      { id: 'seed-teacher-chim-002', role: 'teacher', full_name: 'Prof. CHIM 2' },

      // Ingenieur — ELEC
      { id: 'seed-teacher-elec-001', role: 'teacher', full_name: 'Prof. ELEC 1' },
      { id: 'seed-teacher-elec-002', role: 'teacher', full_name: 'Prof. ELEC 2' },
      { id: 'seed-teacher-elec-003', role: 'teacher', full_name: 'Prof. ELEC 3' },

      // == Students ==

      // Licence — BI
      { id: 'seed-student-bi-001', role: 'student', full_name: 'Etudiant BI 1' },
      { id: 'seed-student-bi-002', role: 'student', full_name: 'Etudiant BI 2' },

      // Master — SSI
      { id: 'seed-student-ssi-001', role: 'student', full_name: 'Etudiant SSI 1' },
      { id: 'seed-student-ssi-002', role: 'student', full_name: 'Etudiant SSI 2' },

      // Master — CYS
      { id: 'seed-student-cys-001', role: 'student', full_name: 'Etudiant CYS 1' },

      // Master — BDT
      { id: 'seed-student-bdt-001', role: 'student', full_name: 'Etudiant BDT 1' },
      { id: 'seed-student-bdt-002', role: 'student', full_name: 'Etudiant BDT 2' },

      // Ingenieur — ISIL
      { id: 'seed-student-isil-001', role: 'student', full_name: 'Etudiant ISIL 1' },
      { id: 'seed-student-isil-002', role: 'student', full_name: 'Etudiant ISIL 2' },
      { id: 'seed-student-isil-003', role: 'student', full_name: 'Etudiant ISIL 3' },

      // Ingenieur — CHIM
      { id: 'seed-student-chim-001', role: 'student', full_name: 'Etudiant CHIM 1' },
      { id: 'seed-student-chim-002', role: 'student', full_name: 'Etudiant CHIM 2' },

      // Ingenieur — ELEC
      { id: 'seed-student-elec-001', role: 'student', full_name: 'Etudiant ELEC 1' },

      // == Companies ==
      { id: 'seed-company-techcorp', role: 'company', full_name: 'TechCorp Algeria' },
      { id: 'seed-company-dataviz', role: 'company', full_name: 'DataViz Solutions' },
      { id: 'seed-company-cyberguard', role: 'company', full_name: 'CyberGuard Systems' },
    ];

  console.log('  Creating profiles...');
  for (const p of profileData) {
    await db.insert(profiles).values({
      id: p.id,
      role: p.role,
      full_name: p.full_name,
      avatar_url: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: profiles.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. Specialities
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating specialities...');

  const specBI = 'spec-bi';
  const specSSI = 'spec-ssi';
  const specCYS = 'spec-cys';
  const specBDT = 'spec-bdt';
  const specISIL = 'spec-isil';
  const specCHIM = 'spec-chim';
  const specELEC = 'spec-elec';

  const specialityData = [
    { id: specBI, name: 'Business Intelligence', code: 'BI', year_type: 'licence' as const },
    { id: specSSI, name: 'Securite des Systemes d Information', code: 'SSI', year_type: 'master' as const },
    { id: specCYS, name: 'Cybersecurite', code: 'CYS', year_type: 'master' as const },
    { id: specBDT, name: 'Big Data et Technologies', code: 'BDT', year_type: 'master' as const },
    { id: specISIL, name: 'Ingenierie des Systemes d Information et Logiciel', code: 'ISIL', year_type: 'ingenieur' as const },
    { id: specCHIM, name: 'Chimie', code: 'CHIM', year_type: 'ingenieur' as const },
    { id: specELEC, name: 'Electronique', code: 'ELEC', year_type: 'ingenieur' as const },
  ];

  for (const s of specialityData) {
    await db.insert(specialities).values({
      id: s.id,
      name: s.name,
      code: s.code,
      year_type: s.year_type,
      created_at: now,
    }).onConflictDoNothing({ target: specialities.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. Domains
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating domains...');
  const domainData = [
    { id: 'dom-informatique', name: 'informatique' },
    { id: 'dom-mathematiques', name: 'mathematiques' },
    { id: 'dom-physique', name: 'physique' },
    { id: 'dom-chimie', name: 'chimie' },
    { id: 'dom-biologie', name: 'biologie' },
    { id: 'dom-electronique', name: 'electronique' },
    { id: 'dom-economie-gestion', name: 'economie_gestion' },
    { id: 'dom-langues', name: 'langues' },
  ];

  for (const d of domainData) {
    await db.insert(domains).values({ id: d.id, name: d.name }).onConflictDoNothing();
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. Teachers
  // ═══════════════════════════════════════════════════════════════

  const teacherData: Array<{
    id: string;
    profile_id: string;
    email: string;
    grade: 'assistant' | 'mab' | 'maa' | 'mcb' | 'mca' | 'professeur';
    department: string;
    specialtyId: string;
    domainIds: string[];
    availability_status: 'disponible' | 'indisponible' | 'indisponible_jusqu_au';
    unavailable_until: string | null;
  }> = [
      // Licence — BI
      { id: 'seed-teacher-bi-001', profile_id: 'seed-teacher-bi-001', email: 'prof.bi1@esst-sup.com', grade: 'maa', department: 'BI', specialtyId: specBI, domainIds: ['dom-informatique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-bi-002', profile_id: 'seed-teacher-bi-002', email: 'prof.bi2@esst-sup.com', grade: 'mab', department: 'BI', specialtyId: specBI, domainIds: ['dom-informatique', 'dom-mathematiques'], availability_status: 'disponible', unavailable_until: null },

      // Master — SSI
      { id: 'seed-teacher-ssi-001', profile_id: 'seed-teacher-ssi-001', email: 'prof.ssi1@esst-sup.com', grade: 'mca', department: 'SSI', specialtyId: specSSI, domainIds: ['dom-informatique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-ssi-002', profile_id: 'seed-teacher-ssi-002', email: 'prof.ssi2@esst-sup.com', grade: 'maa', department: 'SSI', specialtyId: specSSI, domainIds: ['dom-informatique', 'dom-electronique'], availability_status: 'indisponible', unavailable_until: null },

      // Master — CYS
      { id: 'seed-teacher-cys-001', profile_id: 'seed-teacher-cys-001', email: 'prof.cys1@esst-sup.com', grade: 'professeur', department: 'CYS', specialtyId: specCYS, domainIds: ['dom-informatique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-cys-002', profile_id: 'seed-teacher-cys-002', email: 'prof.cys2@esst-sup.com', grade: 'mcb', department: 'CYS', specialtyId: specCYS, domainIds: ['dom-informatique', 'dom-mathematiques'], availability_status: 'indisponible_jusqu_au', unavailable_until: dateStr(2026, 8, 1) },

      // Master — BDT
      { id: 'seed-teacher-bdt-001', profile_id: 'seed-teacher-bdt-001', email: 'prof.bdt1@esst-sup.com', grade: 'mca', department: 'BDT', specialtyId: specBDT, domainIds: ['dom-informatique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-bdt-002', profile_id: 'seed-teacher-bdt-002', email: 'prof.bdt2@esst-sup.com', grade: 'assistant', department: 'BDT', specialtyId: specBDT, domainIds: ['dom-informatique', 'dom-mathematiques'], availability_status: 'disponible', unavailable_until: null },

      // Ingenieur — ISIL
      { id: 'seed-teacher-isil-001', profile_id: 'seed-teacher-isil-001', email: 'prof.isil1@esst-sup.com', grade: 'professeur', department: 'ISIL', specialtyId: specISIL, domainIds: ['dom-informatique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-isil-002', profile_id: 'seed-teacher-isil-002', email: 'prof.isil2@esst-sup.com', grade: 'mca', department: 'ISIL', specialtyId: specISIL, domainIds: ['dom-informatique'], availability_status: 'indisponible', unavailable_until: null },
      { id: 'seed-teacher-isil-003', profile_id: 'seed-teacher-isil-003', email: 'prof.isil3@esst-sup.com', grade: 'mcb', department: 'ISIL', specialtyId: specISIL, domainIds: ['dom-informatique', 'dom-mathematiques'], availability_status: 'indisponible_jusqu_au', unavailable_until: dateStr(2026, 8, 1) },

      // Ingenieur — CHIM
      { id: 'seed-teacher-chim-001', profile_id: 'seed-teacher-chim-001', email: 'prof.chim1@esst-sup.com', grade: 'mca', department: 'CHIM', specialtyId: specCHIM, domainIds: ['dom-chimie'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-chim-002', profile_id: 'seed-teacher-chim-002', email: 'prof.chim2@esst-sup.com', grade: 'maa', department: 'CHIM', specialtyId: specCHIM, domainIds: ['dom-chimie', 'dom-physique'], availability_status: 'disponible', unavailable_until: null },

      // Ingenieur — ELEC
      { id: 'seed-teacher-elec-001', profile_id: 'seed-teacher-elec-001', email: 'prof.elec1@esst-sup.com', grade: 'professeur', department: 'ELEC', specialtyId: specELEC, domainIds: ['dom-electronique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-elec-002', profile_id: 'seed-teacher-elec-002', email: 'prof.elec2@esst-sup.com', grade: 'assistant', department: 'ELEC', specialtyId: specELEC, domainIds: ['dom-electronique', 'dom-physique'], availability_status: 'disponible', unavailable_until: null },
      { id: 'seed-teacher-elec-003', profile_id: 'seed-teacher-elec-003', email: 'prof.elec3@esst-sup.com', grade: 'mcb', department: 'ELEC', specialtyId: specELEC, domainIds: ['dom-electronique', 'dom-informatique'], availability_status: 'disponible', unavailable_until: null },
    ];

  console.log('  Creating teachers...');
  for (const t of teacherData) {
    await db.insert(teachers).values({
      id: t.id,
      profile_id: t.profile_id,
      email: t.email,
      grade: t.grade,
      department: t.department,
      availability_status: t.availability_status,
      unavailable_until: t.unavailable_until,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: teachers.id });

    await db.insert(teacherSpecialities).values({
      teacher_id: t.id,
      speciality_id: t.specialtyId,
    }).onConflictDoNothing();

    for (const domainId of t.domainIds) {
      await db.insert(teacherDomains).values({
        teacher_id: t.id,
        domain_id: domainId,
      }).onConflictDoNothing();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. Students
  // ═══════════════════════════════════════════════════════════════

  const studentData: Array<{
    id: string;
    profile_id: string;
    email: string;
    student_number: string;
    specialty: string;
    level: 'licence' | 'master' | 'ingenieur';
    promotion_year: number;
  }> = [
      // Licence — BI
      { id: 'seed-student-bi-001', profile_id: 'seed-student-bi-001', email: 'etudiant.bi1@esst-sup.com', student_number: 'STU-BI-001', specialty: specBI, level: 'licence', promotion_year: 2025 },
      { id: 'seed-student-bi-002', profile_id: 'seed-student-bi-002', email: 'etudiant.bi2@esst-sup.com', student_number: 'STU-BI-002', specialty: specBI, level: 'licence', promotion_year: 2025 },

      // Master — SSI
      { id: 'seed-student-ssi-001', profile_id: 'seed-student-ssi-001', email: 'etudiant.ssi1@esst-sup.com', student_number: 'STU-SSI-001', specialty: specSSI, level: 'master', promotion_year: 2025 },
      { id: 'seed-student-ssi-002', profile_id: 'seed-student-ssi-002', email: 'etudiant.ssi2@esst-sup.com', student_number: 'STU-SSI-002', specialty: specSSI, level: 'master', promotion_year: 2025 },

      // Master — CYS
      { id: 'seed-student-cys-001', profile_id: 'seed-student-cys-001', email: 'etudiant.cys1@esst-sup.com', student_number: 'STU-CYS-001', specialty: specCYS, level: 'master', promotion_year: 2025 },

      // Master — BDT
      { id: 'seed-student-bdt-001', profile_id: 'seed-student-bdt-001', email: 'etudiant.bdt1@esst-sup.com', student_number: 'STU-BDT-001', specialty: specBDT, level: 'master', promotion_year: 2025 },
      { id: 'seed-student-bdt-002', profile_id: 'seed-student-bdt-002', email: 'etudiant.bdt2@esst-sup.com', student_number: 'STU-BDT-002', specialty: specBDT, level: 'master', promotion_year: 2025 },

      // Ingenieur — ISIL
      { id: 'seed-student-isil-001', profile_id: 'seed-student-isil-001', email: 'etudiant.isil1@esst-sup.com', student_number: 'STU-ISIL-001', specialty: specISIL, level: 'ingenieur', promotion_year: 2025 },
      { id: 'seed-student-isil-002', profile_id: 'seed-student-isil-002', email: 'etudiant.isil2@esst-sup.com', student_number: 'STU-ISIL-002', specialty: specISIL, level: 'ingenieur', promotion_year: 2025 },
      { id: 'seed-student-isil-003', profile_id: 'seed-student-isil-003', email: 'etudiant.isil3@esst-sup.com', student_number: 'STU-ISIL-003', specialty: specISIL, level: 'ingenieur', promotion_year: 2025 },

      // Ingenieur — CHIM
      { id: 'seed-student-chim-001', profile_id: 'seed-student-chim-001', email: 'etudiant.chim1@esst-sup.com', student_number: 'STU-CHIM-001', specialty: specCHIM, level: 'ingenieur', promotion_year: 2025 },
      { id: 'seed-student-chim-002', profile_id: 'seed-student-chim-002', email: 'etudiant.chim2@esst-sup.com', student_number: 'STU-CHIM-002', specialty: specCHIM, level: 'ingenieur', promotion_year: 2025 },

      // Ingenieur — ELEC
      { id: 'seed-student-elec-001', profile_id: 'seed-student-elec-001', email: 'etudiant.elec1@esst-sup.com', student_number: 'STU-ELEC-001', specialty: specELEC, level: 'ingenieur', promotion_year: 2025 },
    ];

  console.log('  Creating students...');
  for (const s of studentData) {
    await db.insert(students).values({
      id: s.id,
      profile_id: s.profile_id,
      email: s.email,
      student_number: s.student_number,
      specialty: s.specialty,
      level: s.level,
      promotion_year: s.promotion_year,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: students.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. Companies
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating companies...');
  const companyData = [
    { profile_id: 'seed-company-techcorp', company_name: 'TechCorp Algeria', sector: 'Technology', website: 'https://techcorp-dz.com', contact_phone: '+213-555-123456', is_verified: true },
    { profile_id: 'seed-company-dataviz', company_name: 'DataViz Solutions', sector: 'Data Analytics', website: 'https://dataviz-dz.com', contact_phone: '+213-555-789012', is_verified: false },
    { profile_id: 'seed-company-cyberguard', company_name: 'CyberGuard Systems', sector: 'Cybersecurite', website: 'https://cyberguard-dz.com', contact_phone: '+213-555-345678', is_verified: true },
  ];

  for (const c of companyData) {
    await db.insert(companies).values({
      profile_id: c.profile_id,
      company_name: c.company_name,
      address: '',
      sector: c.sector,
      website: c.website,
      contact_phone: c.contact_phone,
      is_verified: c.is_verified,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: companies.profile_id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 7. Academic Years
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating academic years...');
  const ayClosed = 'seed-ay-2023-2024';
  const ayActive = 'seed-ay-2024-2025';

  await db.insert(academicYears).values({
    id: ayClosed,
    label: '2023-2024',
    status: 'cloturee',
    submission_open_at: dateStr(2023, 9, 1),
    submission_close_at: dateStr(2024, 6, 30),
    max_wishes: 5,
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: academicYears.id });

  await db.insert(academicYears).values({
    id: ayActive,
    label: '2024-2025',
    status: 'active',
    submission_open_at: dateStr(2024, 9, 1),
    submission_close_at: dateStr(2025, 6, 30),
    max_wishes: 5,
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: academicYears.id });

  // ═══════════════════════════════════════════════════════════════
  // 8. Promotions
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating promotions...');
  const promotionData = [
    { id: 'seed-promo-bi-2025', label: 'Promotion BI 2024-2025', specialty: specBI, academic_year_id: ayActive },
    { id: 'seed-promo-ssi-2025', label: 'Promotion SSI 2024-2025', specialty: specSSI, academic_year_id: ayActive },
    { id: 'seed-promo-cys-2025', label: 'Promotion CYS 2024-2025', specialty: specCYS, academic_year_id: ayActive },
    { id: 'seed-promo-bdt-2025', label: 'Promotion BDT 2024-2025', specialty: specBDT, academic_year_id: ayActive },
    { id: 'seed-promo-isil-2025', label: 'Promotion ISIL 2024-2025', specialty: specISIL, academic_year_id: ayActive },
    { id: 'seed-promo-chim-2025', label: 'Promotion CHIM 2024-2025', specialty: specCHIM, academic_year_id: ayActive },
    { id: 'seed-promo-elec-2025', label: 'Promotion ELEC 2024-2025', specialty: specELEC, academic_year_id: ayActive },
  ];

  for (const p of promotionData) {
    await db.insert(promotions).values({
      id: p.id,
      label: p.label,
      specialty: p.specialty,
      academic_year_id: p.academic_year_id,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: promotions.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 9. PFE Subjects
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating PFE subjects...');

  function subject(
    id: string,
    code: string,
    title: string,
    description: string,
    groupType: 'monome' | 'binome' | 'trinome',
    specialty: string,
    level: 'licence' | 'master' | 'ingenieur',
    proposerId: string,
    proposerRole: 'teacher' | 'company' | 'student',
    status: 'en_attente' | 'valide' | 'refuse' | 'expire',
    academicYearId: string,
    domainId: string | null = null,
  ) {
    return {
      id,
      code,
      title,
      description,
      group_type: groupType,
      specialty,
      level,
      proposer_id: proposerId,
      proposer_role: proposerRole,
      academic_year_id: academicYearId,
      status,
      created_at: now,
      updated_at: now,
      domainId,
    };
  }

  const subjects = [
    // == Licence — BI ==
    subject('seed-subject-bi-001', 'PFE-BI-2025-001', 'Analyse predictive des ventes avec Power BI', 'Developpement d un tableau de bord interactif.', 'monome', specBI, 'licence', 'seed-teacher-bi-001', 'teacher', 'en_attente', ayActive, 'dom-informatique'),
    subject('seed-subject-bi-002', 'PFE-BI-2025-002', 'Systeme de recommandation e-commerce', 'Conception d un systeme de recommandation base sur les donnees clients.', 'binome', specBI, 'licence', 'seed-teacher-bi-002', 'teacher', 'valide', ayActive, 'dom-informatique'),
    subject('seed-subject-bi-003', 'PFE-BI-2025-003', 'Optimisation de la supply chain par la data', 'Application de methodes d analyse de donnees.', 'trinome', specBI, 'licence', 'seed-company-dataviz', 'company', 'en_attente', ayActive, 'dom-informatique'),

    // == Master — SSI ==
    subject('seed-subject-ssi-001', 'PFE-SSI-2025-001', 'Audit de securite d une infrastructure cloud', 'Realisation d un audit de securite.', 'monome', specSSI, 'master', 'seed-teacher-ssi-001', 'teacher', 'en_attente', ayActive, 'dom-informatique'),
    subject('seed-subject-ssi-002', 'PFE-SSI-2025-002', 'Solution SIEM pour la detection d intrusions', 'Mise en place d une solution SIEM open source.', 'binome', specSSI, 'master', 'seed-teacher-ssi-002', 'teacher', 'refuse', ayActive, 'dom-informatique'),

    // == Master — CYS ==
    subject('seed-subject-cys-001', 'PFE-CYS-2025-001', 'Plateforme de pentesting automatise', 'Developpement d une plateforme web.', 'binome', specCYS, 'master', 'seed-teacher-cys-001', 'teacher', 'en_attente', ayActive, 'dom-informatique'),
    subject('seed-subject-cys-002', 'PFE-CYS-2025-002', 'Analyse de malwares avec l IA', 'Utilisation de techniques d apprentissage automatique.', 'monome', specCYS, 'master', 'seed-company-cyberguard', 'company', 'valide', ayActive, 'dom-informatique'),

    // == Master — BDT ==
    subject('seed-subject-bdt-001', 'PFE-BDT-2025-001', 'Pipeline Big Data avec Spark et Kafka', 'Conception et implementation d un pipeline de traitement.', 'trinome', specBDT, 'master', 'seed-teacher-bdt-001', 'teacher', 'en_attente', ayActive, 'dom-informatique'),
    subject('seed-subject-bdt-002', 'PFE-BDT-2025-002', 'Entrepot de donnees pour la BI', 'Conception d un entrepot de donnees.', 'binome', specBDT, 'master', 'seed-teacher-bdt-002', 'teacher', 'expire', ayClosed, 'dom-informatique'),

    // == Ingenieur — ISIL ==
    subject('seed-subject-isil-001', 'PFE-ISIL-2025-001', 'Application web de gestion des PFE', 'Developpement d une plateforme web.', 'binome', specISIL, 'ingenieur', 'seed-teacher-isil-001', 'teacher', 'en_attente', ayActive, 'dom-informatique'),
    subject('seed-subject-isil-002', 'PFE-ISIL-2025-002', 'Application mobile de suivi de sante', 'Conception d une application mobile.', 'monome', specISIL, 'ingenieur', 'seed-teacher-isil-002', 'teacher', 'valide', ayActive, 'dom-informatique'),
    subject('seed-subject-isil-003', 'PFE-ISIL-2025-003', 'Plateforme collaborative pour chercheurs', 'Developpement d une plateforme collaborative.', 'trinome', specISIL, 'ingenieur', 'seed-company-techcorp', 'company', 'en_attente', ayActive, 'dom-informatique'),

    // == Ingenieur — CHIM ==
    subject('seed-subject-chim-001', 'PFE-CHIM-2025-001', 'Synthese de nouveaux materiaux polymeres', 'Etude et synthese de polymeres biodegradables.', 'monome', specCHIM, 'ingenieur', 'seed-teacher-chim-001', 'teacher', 'en_attente', ayActive, 'dom-chimie'),
    subject('seed-subject-chim-002', 'PFE-CHIM-2025-002', 'Analyse de la qualite de l eau par spectroscopie', 'Developpement d une methode d analyse.', 'binome', specCHIM, 'ingenieur', 'seed-teacher-chim-002', 'teacher', 'refuse', ayActive, 'dom-chimie'),

    // == Ingenieur — ELEC ==
    subject('seed-subject-elec-001', 'PFE-ELEC-2025-001', 'Systeme de controle intelligent pour drones', 'Conception d un systeme de navigation autonome.', 'trinome', specELEC, 'ingenieur', 'seed-teacher-elec-001', 'teacher', 'en_attente', ayActive, 'dom-electronique'),
    subject('seed-subject-elec-002', 'PFE-ELEC-2025-002', 'Station meteorologique IoT', 'Conception d une station meteorologique connectee.', 'monome', specELEC, 'ingenieur', 'seed-teacher-elec-002', 'teacher', 'valide', ayActive, 'dom-electronique'),
    subject('seed-subject-elec-003', 'PFE-ELEC-2025-003', 'Systeme de reconnaissance vocale embarquee', 'Implementation d un systeme de reconnaissance vocale.', 'binome', specELEC, 'ingenieur', 'seed-teacher-elec-003', 'teacher', 'expire', ayClosed, 'dom-electronique'),
  ];

  for (const s of subjects) {
    await db.insert(pfeSubjects).values({
      id: s.id,
      code: s.code,
      title: s.title,
      description: s.description,
      group_type: s.group_type,
      specialty: s.specialty,
      level: s.level,
      proposer_id: s.proposer_id,
      proposer_role: s.proposer_role,
      academic_year_id: s.academic_year_id,
      status: s.status,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }).onConflictDoNothing({ target: pfeSubjects.id });

    if (s.domainId) {
      await db.insert(subjectDomains).values({
        subject_id: s.id,
        domain_id: s.domainId,
      }).onConflictDoNothing();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 10. Wishes (voeux)
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating wishes...');

  const wishData = [
    // Student SSI-001 wishes on SSI subjects
    { student_id: 'seed-student-ssi-001', subject_id: 'seed-subject-ssi-001', status: 'en_attente' as const },
    { student_id: 'seed-student-ssi-001', subject_id: 'seed-subject-cys-001', status: 'en_attente' as const },
    // Student SSI-002
    { student_id: 'seed-student-ssi-002', subject_id: 'seed-subject-ssi-001', status: 'en_attente' as const },
    { student_id: 'seed-student-ssi-002', subject_id: 'seed-subject-ssi-002', status: 'accepte' as const },
    // Student CYS-001
    { student_id: 'seed-student-cys-001', subject_id: 'seed-subject-cys-001', status: 'accepte' as const },
    { student_id: 'seed-student-cys-001', subject_id: 'seed-subject-cys-002', status: 'en_attente' as const },
    // Student BDT-001
    { student_id: 'seed-student-bdt-001', subject_id: 'seed-subject-bdt-001', status: 'en_attente' as const },
    { student_id: 'seed-student-bdt-001', subject_id: 'seed-subject-bdt-002', status: 'refuse' as const },
    // Student BDT-002
    { student_id: 'seed-student-bdt-002', subject_id: 'seed-subject-bdt-001', status: 'accepte' as const },
    // Student ISIL-001, 002, 003
    { student_id: 'seed-student-isil-001', subject_id: 'seed-subject-isil-001', status: 'accepte' as const },
    { student_id: 'seed-student-isil-001', subject_id: 'seed-subject-isil-003', status: 'en_attente' as const },
    { student_id: 'seed-student-isil-002', subject_id: 'seed-subject-isil-001', status: 'accepte' as const },
    { student_id: 'seed-student-isil-003', subject_id: 'seed-subject-isil-002', status: 'accepte' as const },
    // Student CHIM
    { student_id: 'seed-student-chim-001', subject_id: 'seed-subject-chim-001', status: 'accepte' as const },
    { student_id: 'seed-student-chim-002', subject_id: 'seed-subject-chim-001', status: 'en_attente' as const },
    // Student ELEC
    { student_id: 'seed-student-elec-001', subject_id: 'seed-subject-elec-001', status: 'en_attente' as const },
    { student_id: 'seed-student-elec-001', subject_id: 'seed-subject-elec-002', status: 'accepte' as const },
    // Student BI
    { student_id: 'seed-student-bi-001', subject_id: 'seed-subject-bi-002', status: 'accepte' as const },
    { student_id: 'seed-student-bi-002', subject_id: 'seed-subject-bi-002', status: 'en_attente' as const },
  ];

  for (const w of wishData) {
    await db.insert(wishes).values({
      id: `seed-wish-${w.student_id}-${w.subject_id}`,
      student_id: w.student_id,
      subject_id: w.subject_id,
      academic_year_id: ayActive,
      status: w.status,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: wishes.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 11. PFE Assignments
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating PFE assignments...');

  const assignmentData: Array<{
    id: string;
    subject_id: string;
    student_id: string;
    student2_id?: string;
    student3_id?: string;
    supervisor_id: string;
    co_supervisor_id?: string;
    pfe_code: string;
    status: 'en_cours' | 'soutenance_planifiee' | 'valide' | 'refuse';
  }> = [
      // BI-002: valide, binome → assign both BI students
      { id: 'seed-assign-bi-002', subject_id: 'seed-subject-bi-002', student_id: 'seed-student-bi-001', student2_id: 'seed-student-bi-002', supervisor_id: 'seed-teacher-bi-002', pfe_code: 'PFE-ASSIGN-BI-2025-002', status: 'en_cours' },
      // CYS-002: valide, monome → CYS student
      { id: 'seed-assign-cys-002', subject_id: 'seed-subject-cys-002', student_id: 'seed-student-cys-001', supervisor_id: 'seed-teacher-cys-001', pfe_code: 'PFE-ASSIGN-CYS-2025-002', status: 'en_cours' },
      // ISIL-002: valide, monome → ISIL student with co-supervisor
      { id: 'seed-assign-isil-002', subject_id: 'seed-subject-isil-002', student_id: 'seed-student-isil-003', supervisor_id: 'seed-teacher-isil-001', co_supervisor_id: 'seed-teacher-isil-003', pfe_code: 'PFE-ASSIGN-ISIL-2025-002', status: 'soutenance_planifiee' },
      // ELEC-002: valide, monome → ELEC student
      { id: 'seed-assign-elec-002', subject_id: 'seed-subject-elec-002', student_id: 'seed-student-elec-001', supervisor_id: 'seed-teacher-elec-002', pfe_code: 'PFE-ASSIGN-ELEC-2025-002', status: 'en_cours' },
      // CHIM-001: en_attente but we simulate an early assignment for demo
      { id: 'seed-assign-chim-001', subject_id: 'seed-subject-chim-001', student_id: 'seed-student-chim-001', supervisor_id: 'seed-teacher-chim-001', pfe_code: 'PFE-ASSIGN-CHIM-2025-001', status: 'en_cours' },
      // BDT-001: en_attente → assigned as demo
      { id: 'seed-assign-bdt-001', subject_id: 'seed-subject-bdt-001', student_id: 'seed-student-bdt-002', student2_id: 'seed-student-bdt-001', supervisor_id: 'seed-teacher-bdt-001', pfe_code: 'PFE-ASSIGN-BDT-2025-001', status: 'valide' },
    ];

  for (const a of assignmentData) {
    await db.insert(pfeAssignments).values({
      id: a.id,
      subject_id: a.subject_id,
      academic_year_id: ayActive,
      student_id: a.student_id,
      student2_id: a.student2_id ?? null,
      student3_id: a.student3_id ?? null,
      supervisor_id: a.supervisor_id,
      co_supervisor_id: a.co_supervisor_id ?? null,
      pfe_code: a.pfe_code,
      status: a.status,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: pfeAssignments.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 12. PFE Progress Reports
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating progress reports...');

  const progressData = [
    { assignment_id: 'seed-assign-bi-002', meeting_date: dateStr(2025, 1, 15), student_notes: 'Premiere reunion. Discussion du cahier des charges.', teacher_feedback: 'Bon debut, poursuivre les recherches.', signed_by_teacher: true },
    { assignment_id: 'seed-assign-bi-002', meeting_date: dateStr(2025, 2, 28), student_notes: 'Avancement sur le modele de recommandation.', teacher_feedback: null, signed_by_teacher: false },
    { assignment_id: 'seed-assign-cys-002', meeting_date: dateStr(2025, 1, 20), student_notes: 'Collecte de datasets de malwares pour l entrainement.', teacher_feedback: 'Dataset pertinent, continuer.', signed_by_teacher: true },
    { assignment_id: 'seed-assign-isil-002', meeting_date: dateStr(2025, 1, 10), student_notes: 'Architecture de l application mobile definie.', teacher_feedback: 'Valide. Passez au developpement.', signed_by_teacher: true },
    { assignment_id: 'seed-assign-isil-002', meeting_date: dateStr(2025, 3, 5), student_notes: 'Module de synchronisation cloud termine.', teacher_feedback: 'Excellent travail.', signed_by_teacher: true },
    { assignment_id: 'seed-assign-elec-002', meeting_date: dateStr(2025, 2, 10), student_notes: 'Choix des capteurs et microcontroleurs.', teacher_feedback: 'Revue de la liste de composants a faire.', signed_by_teacher: false },
  ];

  for (const pr of progressData) {
    await db.insert(pfeProgressReports).values({
      id: `seed-pr-${pr.assignment_id}-${pr.meeting_date}`,
      assignment_id: pr.assignment_id,
      meeting_date: pr.meeting_date,
      student_notes: pr.student_notes,
      teacher_feedback: pr.teacher_feedback,
      signed_by_teacher: pr.signed_by_teacher,
      created_at: now,
      updated_at: now,
    }).onConflictDoNothing({ target: pfeProgressReports.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 13. Defenses, Juries & Grades
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating defenses, juries & grades...');

  // Defense 1: ISIL-002 (soutenance_planifiee → done)
  const juryId1 = 'seed-jury-isil-002';
  const defenseId1 = 'seed-defense-isil-002';

  await db.insert(defenseJuries).values({
    id: juryId1,
    assignment_id: 'seed-assign-isil-002',
    president_id: 'seed-teacher-elec-001',  // Prof. ELEC 1 (different from supervisor)
    member_id: 'seed-teacher-chim-002',      // Prof. CHIM 2
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: defenseJuries.id });

  await db.insert(defenses).values({
    id: defenseId1,
    assignment_id: 'seed-assign-isil-002',
    jury_id: juryId1,
    scheduled_at: datetimeStr(2025, 5, 20, 14, 0),
    room: 'Salle 301',
    status: 'done',
    result: 'admitted',
    final_grade: 16.5,
    grade_gap: 0.5,
    comment: 'Excellente presentation. Application fonctionnelle et bien structuree.',
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: defenses.id });

  // President grade
  await db.insert(juryGrades).values({
    id: 'seed-jg-isil-002-president',
    defense_id: defenseId1,
    jury_member_id: 'seed-teacher-elec-001',
    criterion1: 4.5,
    criterion2: 4.0,
    criterion3: 4.0,
    criterion4: 4.5,
    total: 17.0,
    submitted_at: datetimeStr(2025, 5, 20, 15, 30),
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: juryGrades.id });

  // Member grade
  await db.insert(juryGrades).values({
    id: 'seed-jg-isil-002-member',
    defense_id: defenseId1,
    jury_member_id: 'seed-teacher-chim-002',
    criterion1: 4.0,
    criterion2: 3.5,
    criterion3: 4.0,
    criterion4: 4.5,
    total: 16.0,
    submitted_at: datetimeStr(2025, 5, 20, 15, 45),
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: juryGrades.id });

  // Defense 2: BI-002 (scheduled but not done yet)
  const juryId2 = 'seed-jury-bi-002';
  const defenseId2 = 'seed-defense-bi-002';

  await db.insert(defenseJuries).values({
    id: juryId2,
    assignment_id: 'seed-assign-bi-002',
    president_id: 'seed-teacher-ssi-001',
    member_id: 'seed-teacher-bdt-001',
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: defenseJuries.id });

  await db.insert(defenses).values({
    id: defenseId2,
    assignment_id: 'seed-assign-bi-002',
    jury_id: juryId2,
    scheduled_at: datetimeStr(2025, 6, 15, 10, 0),
    room: 'Salle 102',
    status: 'scheduled',
    result: null,
    final_grade: null,
    grade_gap: null,
    comment: null,
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: defenses.id });

  // ═══════════════════════════════════════════════════════════════
  // 14. Supervisor Evaluations
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating supervisor evaluations...');

  // Supervisor evaluates ISIL-003 student in assignment ISIL-002
  await db.insert(supervisorEvaluations).values({
    id: 'seed-eval-isil-002-supervisor',
    assignment_id: 'seed-assign-isil-002',
    evaluator_id: 'seed-teacher-isil-001',  // supervisor
    student_id: 'seed-student-isil-003',
    technical_quality: 4.5,
    methodology: 4.0,
    autonomy: 4.0,
    presentation: 5.0,
    total: 17.5,
    comment: 'Etudiant autonome et tres bon travail technique.',
    submitted_at: datetimeStr(2025, 5, 10, 0, 0),
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: supervisorEvaluations.id });

  // Co-supervisor evaluates same student
  await db.insert(supervisorEvaluations).values({
    id: 'seed-eval-isil-002-co-supervisor',
    assignment_id: 'seed-assign-isil-002',
    evaluator_id: 'seed-teacher-isil-003',  // co-supervisor
    student_id: 'seed-student-isil-003',
    technical_quality: 4.0,
    methodology: 3.5,
    autonomy: 3.5,
    presentation: 4.0,
    total: 15.0,
    comment: 'Bon travail, peut encore progresser en methodologie.',
    submitted_at: datetimeStr(2025, 5, 12, 0, 0),
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: supervisorEvaluations.id });

  // Supervisor evaluates BI-001 student in assignment BI-002
  await db.insert(supervisorEvaluations).values({
    id: 'seed-eval-bi-002-supervisor',
    assignment_id: 'seed-assign-bi-002',
    evaluator_id: 'seed-teacher-bi-002',
    student_id: 'seed-student-bi-001',
    technical_quality: 3.5,
    methodology: 3.0,
    autonomy: 3.5,
    presentation: 3.0,
    total: 13.0,
    comment: 'Travail correct, doit ameliorer la presentation.',
    submitted_at: datetimeStr(2025, 4, 20, 0, 0),
    created_at: now,
    updated_at: now,
  }).onConflictDoNothing({ target: supervisorEvaluations.id });

  // ═══════════════════════════════════════════════════════════════
  // 15. Notifications
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating notifications...');

  const notificationData = [
    { recipient_id: 'seed-student-isil-003', type: 'defense_scheduled', payload: { defense_id: defenseId1, date: datetimeStr(2025, 5, 20, 14, 0) }, read_at: datetimeStr(2025, 5, 15, 0, 0) },
    { recipient_id: 'seed-student-isil-003', type: 'defense_result', payload: { defense_id: defenseId1, result: 'admitted', grade: 16.5 }, read_at: null },
    { recipient_id: 'seed-student-bi-001', type: 'defense_scheduled', payload: { defense_id: defenseId2, date: datetimeStr(2025, 6, 15, 10, 0) }, read_at: null },
    { recipient_id: 'seed-student-bi-002', type: 'defense_scheduled', payload: { defense_id: defenseId2, date: datetimeStr(2025, 6, 15, 10, 0) }, read_at: null },
    { recipient_id: 'seed-teacher-isil-001', type: 'jury_assigned', payload: { defense_id: defenseId1, role: 'supervisor' }, read_at: datetimeStr(2025, 5, 5, 0, 0) },
    { recipient_id: 'seed-teacher-elec-001', type: 'jury_assigned', payload: { defense_id: defenseId1, role: 'president' }, read_at: datetimeStr(2025, 5, 3, 0, 0) },
    { recipient_id: 'seed-student-cys-001', type: 'subject_validated', payload: { subject_id: 'seed-subject-cys-002' }, read_at: null },
    { recipient_id: 'seed-student-elec-001', type: 'subject_validated', payload: { subject_id: 'seed-subject-elec-002' }, read_at: null },
    { recipient_id: 'seed-company-dataviz', type: 'company_verified', payload: {}, read_at: null },
    { recipient_id: 'seed-company-cyberguard', type: 'company_verified', payload: {}, read_at: datetimeStr(2025, 3, 1, 0, 0) },
  ];

  for (let i = 0; i < notificationData.length; i++) {
    const n = notificationData[i];
    await db.insert(notifications).values({
      id: `seed-notif-${String(i + 1).padStart(3, '0')}`,
      recipient_id: n.recipient_id,
      type: n.type,
      payload: n.payload,
      read_at: n.read_at,
      created_at: now,
    }).onConflictDoNothing({ target: notifications.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // 16. PFE Status History
  // ═══════════════════════════════════════════════════════════════

  console.log('  Creating PFE status history...');

  const historyData = [
    { subject_id: 'seed-subject-isil-002', from_status: 'en_attente', to_status: 'valide', actor_id: 'seed-admin-001', reason: 'Sujet conforme aux exigences.' },
    { subject_id: 'seed-subject-bi-002', from_status: 'en_attente', to_status: 'valide', actor_id: 'seed-admin-001', reason: 'Valide par les deux validateurs.' },
    { subject_id: 'seed-subject-cys-002', from_status: 'en_attente', to_status: 'valide', actor_id: 'seed-admin-001', reason: 'Propose par une entreprise, valide.' },
    { subject_id: 'seed-subject-elec-002', from_status: 'en_attente', to_status: 'valide', actor_id: 'seed-admin-001', reason: 'Sujet technique pertinent.' },
    { subject_id: 'seed-subject-ssi-002', from_status: 'en_attente', to_status: 'refuse', actor_id: 'seed-admin-001', reason: 'Trop similaire a un sujet existant.' },
    { subject_id: 'seed-subject-chim-002', from_status: 'en_attente', to_status: 'refuse', actor_id: 'seed-admin-001', reason: 'Portee trop large.' },
  ];

  for (let i = 0; i < historyData.length; i++) {
    const h = historyData[i];
    await db.insert(pfeStatusHistory).values({
      subject_id: h.subject_id,
      from_status: h.from_status as "refuse" | "en_attente" | "valide" | "expire" | null | undefined,
      to_status: h.to_status as "en_attente" | "valide" | "refuse" | "expire",
      actor_id: h.actor_id,
      reason: h.reason,
      created_at: now,
    } satisfies typeof pfeStatusHistory.$inferInsert).onConflictDoNothing({ target: pfeStatusHistory.id });
  }

  // ═══════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════

  console.log('\n══╡ Seed complete! ╞══════════════════════════════════');
  console.log('  Profiles:         26 (1 admin, 17 teachers, 13 students, 3 companies)');
  console.log('  Specialities:      7 (BI, SSI, CYS, BDT, ISIL, CHIM, ELEC)');
  console.log('  Domains:           8 (informatique, mathematiques, physique, ...)');
  console.log('  Teachers:         17');
  console.log('  Teacher_specialities: 17');
  console.log('  Teacher_domains:  23');
  console.log('  Students:         13');
  console.log('  Companies:         3');
  console.log('  Academic Years:    2 (1 active, 1 closed)');
  console.log('  Promotions:        7');
  console.log('  Subjects:         18 (all statuses, group types, proposer roles)');
  console.log('  Subject_domains:  18');
  console.log('  Wishes:           19');
  console.log('  Assignments:       6');
  console.log('  Progress Reports:  6');
  console.log('  Defense Juries:    2');
  console.log('  Defenses:          2 (1 done, 1 scheduled)');
  console.log('  Jury Grades:       2');
  console.log('  Supervisor Evals:  3');
  console.log('  Notifications:    10');
  console.log('  Status History:    6');
  console.log();
  console.log('  Admin:         pfe@esst-sup.com');
  console.log('  Teachers:      prof.*@esst-sup.com');
  console.log('  Students:      etudiant.*@esst-sup.com');
  console.log('  Companies:     contact@techcorp-dz.com / dataviz-dz / cyberguard-dz');
  console.log();
  console.log('  Defense ready: ISIL-002 (done, grade 16.5)');
  console.log('  Upcoming:      BI-002 (scheduled Jun 15)');
}

seed().then(() => process.exit(0));