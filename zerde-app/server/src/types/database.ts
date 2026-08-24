/**
 * Zerde SQLite Database Models & Type Definitions (Phase 1 Core MVP)
 * Location: zerde-app/server/src/types/database.ts
 */

export interface DbOrganization {
  id: number;
  name: string;
  teacher_token: string;
  student_token: string;
  type: 'school' | 'university' | 'college';
  created_at: string;
}

export interface DbUserOrganizationRole {
  id: number;
  user_id: number;
  organization_id: number;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
}

export interface DbUser {
  id: number;
  uuid: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  grade?: number;
  school?: string;
  organization_id?: number;
  streak_days: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface DbClassroom {
  id: number;
  name: string;
  school: string;
  teacher_id: number;
  created_at: string;
}

export interface DbClassroomStudent {
  id: number;
  classroom_id: number;
  student_id: number;
  created_at: string;
}

export interface DbCourse {
  id: number;
  short_code: string;
  title: string;
  description?: string;
  subject_type: string;
  language: 'KZ' | 'RU' | 'EN' | 'ALL';
  icon?: string;
  teacher_id?: number;
  organization_id?: number;
  is_active: number;
  created_at: string;
}

export interface DbCourseSlot {
  id: number;
  course_id: number;
  slot_number: number;
  file_name: string;
  file_url?: string;
  file_size?: number;
  summary?: string;
  uploaded_at: string;
}

export interface DbCourseEnrollment {
  id: number;
  course_id: number;
  student_id: number;
  status: 'pending_approval' | 'enrolled' | 'completed' | 'expelled';
  requested_at: string;
  approved_at?: string;
}

export interface DbTopic {
  id: number;
  course_id: number;
  quarter: number;
  topic_number: number;
  title: string;
  description?: string;
  is_today_focus: number;
  order_index: number;
  created_at: string;
}

export interface DbQuestionOption {
  id: string;
  text: string;
  latex?: string;
}

export interface DbQuestion {
  id: number;
  topic_id: number;
  mode: 'A' | 'B';
  question_kz: string;
  question_ru: string;
  question_en: string;
  katex_snippet?: string;
  options_json?: string;
  correct_answer: string;
  explanation_kz?: string;
  explanation_ru?: string;
  explanation_en?: string;
  difficulty: number;
  skill_code: string;
  created_at: string;
}

export interface DbStudentAttempt {
  id: number;
  student_id: number;
  question_id: number;
  chosen_option?: string;
  text_response?: string;
  photo_urls_json?: string;
  is_correct: number;
  elo_delta: number;
  socratic_dialogue_json?: string;
  created_at: string;
}

export type SkillMasteryStatus = 'MASTERED' | 'DEVELOPING' | 'DEFICIENT';

export interface SkillProgressItem {
  title?: string;
  total_attempts: number;
  correct_answers: number;
  mastery_percent: number; // (correct_answers / total_attempts) * 100
  status: SkillMasteryStatus;
}

export interface TeacherDailyNoteItem {
  date: string;
  note: string;
}

export interface DbStudentCoursePassport {
  id: number;
  student_id: number;
  course_id: number;
  subject_elo: number;
  rank_tier: 'OSKIN' | 'TUGYR' | 'KYRAN' | 'SAMGHAU';
  skills_progress_json: string; // Record<string, SkillProgressItem>
  teacher_daily_notes_json: string; // TeacherDailyNoteItem[]
  updated_at: string;
}

export type SystemAuditEventType = 
  | 'TEST_ATTEMPT'
  | 'THOUGHT_FORK_CLICK'
  | 'EUREKA_MOMENT'
  | 'COURSE_CREATED'
  | 'SLOT_UPLOADED'
  | 'COPILOT_GENERATION'
  | 'ENROLLMENT_CHANGE'
  | 'NOTE_ADDED';

export interface DbSystemAuditLog {
  id: number;
  actor_user_id?: number;
  actor_role?: 'student' | 'teacher' | 'admin' | 'system' | 'ai';
  target_user_id?: number;
  course_id?: number;
  event_type: SystemAuditEventType;
  payload_json: string;
  elo_delta?: number;
  ip_address?: string;
  created_at: string;
}
