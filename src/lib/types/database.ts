export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "student" | "teacher" | "admin" | "company";
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "student" | "teacher" | "admin" | "company";
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "student" | "teacher" | "admin" | "company";
          full_name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          profile_id: string | null;
          email: string | null;
          student_number: string;
          specialty: string;
          level: "licence" | "master" | "ingenieur";
          promotion_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          email?: string | null;
          student_number: string;
          specialty: string;
          level: "licence" | "master" | "ingenieur";
          promotion_year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string | null;
          email?: string | null;
          student_number?: string;
          specialty?: string;
          level?: "licence" | "master" | "ingenieur";
          promotion_year?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      teachers: {
        Row: {
          id: string;
          profile_id: string | null;
          email: string | null;
          grade: string;
          department: string;
          specialties: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          email?: string | null;
          grade: string;
          department: string;
          specialties?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string | null;
          email?: string | null;
          grade?: string;
          department?: string;
          specialties?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          profile_id: string;
          company_name: string;
          address: string;
          sector: string;
          website: string | null;
          contact_phone: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          company_name: string;
          address?: string;
          sector?: string;
          website?: string | null;
          contact_phone?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          address?: string;
          sector?: string;
          website?: string | null;
          contact_phone?: string;
          is_verified?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      pfe_subjects: {
        Row: {
          id: string;
          code: string | null;
          title: string;
          description: string;
          type: "internal" | "external";
          specialty: string;
          level: "licence" | "master" | "ingenieur";
          proposer_id: string;
          proposer_role: "student" | "teacher" | "admin" | "company";
          company_id: string | null;
          status:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string | null;
          title: string;
          description?: string;
          type?: "internal" | "external";
          specialty: string;
          level: "licence" | "master" | "ingenieur";
          proposer_id: string;
          proposer_role: "student" | "teacher" | "admin" | "company";
          company_id?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          title?: string;
          description?: string;
          type?: "internal" | "external";
          specialty?: string;
          level?: "licence" | "master" | "ingenieur";
          company_id?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived";
          updated_at?: string;
        };
        Relationships: [];
      };
      pfe_assignments: {
        Row: {
          id: string;
          subject_id: string;
          student_id: string;
          supervisor_id: string;
          co_supervisor_id: string | null;
          assigned_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          student_id: string;
          supervisor_id: string;
          co_supervisor_id?: string | null;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          supervisor_id?: string;
          co_supervisor_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pfe_progress_reports: {
        Row: {
          id: string;
          assignment_id: string;
          meeting_date: string;
          student_notes: string;
          teacher_feedback: string | null;
          attachments: string[];
          signed_by_teacher: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          meeting_date: string;
          student_notes?: string;
          teacher_feedback?: string | null;
          attachments?: string[];
          signed_by_teacher?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_notes?: string;
          teacher_feedback?: string | null;
          attachments?: string[];
          signed_by_teacher?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      defense_juries: {
        Row: {
          id: string;
          assignment_id: string;
          president_id: string;
          member1_id: string;
          member2_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          president_id: string;
          member1_id: string;
          member2_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          president_id?: string;
          member1_id?: string;
          member2_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      defenses: {
        Row: {
          id: string;
          assignment_id: string;
          jury_id: string;
          scheduled_at: string;
          room: string;
          status: "scheduled" | "done" | "postponed";
          result: "admitted" | "corrections_required" | "not_admitted" | null;
          grade: number | null;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          jury_id: string;
          scheduled_at: string;
          room?: string;
          status?: "scheduled" | "done" | "postponed";
          result?: "admitted" | "corrections_required" | "not_admitted" | null;
          grade?: number | null;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scheduled_at?: string;
          room?: string;
          status?: "scheduled" | "done" | "postponed";
          result?: "admitted" | "corrections_required" | "not_admitted" | null;
          grade?: number | null;
          comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: string;
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: string;
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          entity: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          entity: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      pfe_status_history: {
        Row: {
          id: string;
          subject_id: string;
          from_status:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived"
            | null;
          to_status:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived";
          actor_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          from_status?:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived"
            | null;
          to_status:
            | "draft"
            | "submitted"
            | "teacher_reviewing"
            | "teacher_approved"
            | "admin_validated"
            | "rejected"
            | "assigned"
            | "in_progress"
            | "defended"
            | "archived";
          actor_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      v_admin_pfe_overview: {
        Row: {
          status: string;
          specialty: string;
          level: string;
          year: number;
          total: number;
          assigned_count: number;
          defended_count: number;
        };
        Relationships: [];
      };
      v_subject_details: {
        Row: {
          id: string;
          code: string | null;
          title: string;
          description: string;
          type: string;
          specialty: string;
          level: string;
          proposer_id: string;
          proposer_role: string;
          company_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          proposer_name: string;
          proposer_avatar: string | null;
          student_id: string | null;
          supervisor_id: string | null;
          co_supervisor_id: string | null;
          student_name: string | null;
          supervisor_name: string | null;
        };
        Relationships: [];
      };
      v_defense_schedule: {
        Row: {
          defense_id: string;
          scheduled_at: string;
          room: string;
          defense_status: string;
          result: string | null;
          grade: number | null;
          subject_title: string;
          subject_code: string | null;
          student_name: string;
          supervisor_name: string;
          president_name: string;
          member1_name: string;
          member2_name: string | null;
        };
        Relationships: [];
      };
      v_teacher_workload: {
        Row: {
          profile_id: string;
          full_name: string;
          grade: string;
          department: string;
          supervised_count: number;
          jury_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: "student" | "teacher" | "admin" | "company";
      };
      check_user_whitelist: {
        Args: { email_to_check: string };
        Returns: { found_role: "student" | "teacher" | "admin" | "company" }[];
      };
    };
    Enums: {
      user_role: "student" | "teacher" | "admin" | "company";
      pfe_type: "internal" | "external";
      subject_status:
        | "draft"
        | "submitted"
        | "teacher_reviewing"
        | "teacher_approved"
        | "admin_validated"
        | "rejected"
        | "assigned"
        | "in_progress"
        | "defended"
        | "archived";
      level: "licence" | "master" | "ingenieur";
      defense_result: "admitted" | "corrections_required" | "not_admitted";
      defense_status: "scheduled" | "done" | "postponed";
    };
  };
}
