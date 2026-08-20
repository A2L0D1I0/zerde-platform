export type UserRole = 'student' | 'teacher' | 'admin';
export type AppLanguage = 'kz' | 'ru' | 'en';
export type AppTheme = 'light' | 'dark' | 'system';
export type EnrollmentStatus = 'pending_approval' | 'enrolled' | 'expelled' | 'completed';
export type EloRank = 'Өскін' | 'Тұғыр' | 'Қыран' | 'Самғау';
export type TopicStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface Organization {
  id: string;
  name: string;
  org_token: string; // e.g. 'ORG-8F3K9A', 'ZK-7492-X'
  type: 'school' | 'university' | 'college' | 'academy' | 'tutoring';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  bio?: string;
  grade?: string;
  school?: string;
  organization_id?: string;
  language: AppLanguage;
  theme: AppTheme;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface Course {
  id: string;
  short_code: string; // Unique random short token, e.g. '7X9K2M', 'K8F42A'
  title: string;
  description: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  grade: string;
  language: AppLanguage | 'all';
  is_active: boolean;
  students_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseInvitation {
  id: string;
  course_id: string;
  course_title?: string;
  course_short_code?: string;
  teacher_id: string;
  teacher_name: string;
  student_name: string;
  student_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  description?: string;
  quarter?: number;
  status_theory: TopicStatus;
  status_practice: TopicStatus;
  mastery_percentage: number;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  grade?: string;
  status: EnrollmentStatus;
  applied_at: string;

  updated_at: string;
}

export type NotificationTriggerType = 
  | 'STREAK_SAVER' 
  | 'AGA_REMINDER' 
  | 'MEMORY_BURN' 
  | 'WEEKLY_DIGEST' 
  | 'COURSE_ANNOUNCEMENT'
  | 'course_enrollment' 
  | 'teacher_feedback' 
  | 'system'
  | 'streak_saver';


export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationTriggerType;
  trigger_type?: 'STREAK_SAVER' | 'AGA_REMINDER' | 'MEMORY_BURN' | 'WEEKLY_DIGEST';
  is_read: boolean;
  action_url?: string;
  priority?: 'urgent' | 'high' | 'normal';
  created_at: string;
  metadata?: {
    streak_days?: number;
    expires_in_minutes?: number;
    elo_reward?: number;
    formulas_count?: number;
    top_rank?: number;
    topic_id?: string;
    topic_title?: string;
  };
}

export interface WeeklyDigestData {
  user_id: string;
  student_name: string;
  week_range: string;
  elo_earned: number;
  current_elo: number;
  class_rank: number;
  total_students: number;
  streak_maintained: number;
  tasks_completed: number;
  retention_rate: number;
  mastered_skills: string[];
  focus_next_week: string;
  mentor_quote: string;
  html_template: string;
}

export interface TTSRequestQuery {
  text: string;
  lang?: 'kk' | 'ru' | 'en' | 'de';
  voice?: string;
}

export interface StudentDashboardData {
  user: SafeUser;
  elo: number;
  rank: EloRank;
  rank_badge: string;
  streak_days: number;
  streak_freeze_available: boolean;
  pinned_course: (Course & { progress_percentage: number; next_topic: string }) | null;
  recent_topics: Topic[];
  memory_cards: {
    due_today: number;
    total_reviewed: number;
    retention_rate: number;
  };
  daily_focus: {
    title: string;
    duration_minutes: number;
    topic_id: string;
    elo_reward: number;
  };
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface StudentHeatmapData {
  year: number;
  total_contributions: number;
  current_streak: number;
  longest_streak: number;
  matrix: HeatmapDay[];
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  mastery: number;
}

export interface StudentRoadmapData {
  target_exam: string;
  target_date: string;
  days_remaining: number;
  predicted_score: number;
  target_score: number;
  current_elo: number;
  milestones: RoadmapMilestone[];
}

// ==========================================
// AI & Socratic Orchestrator Types
// ==========================================

export interface ThoughtFork {
  key: 'A' | 'B' | 'C';
  title: string;
  type: 'true_step' | 'cognitive_trap' | 'basic_rule';
  zvdsl?: string;
  latex?: string;
  description: string;
}

export interface SocraticResponse {
  question_line: string;
  thought_forks: [ThoughtFork, ThoughtFork, ThoughtFork];
  elo_delta: number;
  is_eureka: boolean;
  is_jailbreak: boolean;
  anti_stuck_active: boolean;
  explanation?: string;
  feedback_message: string;
  new_elo?: number;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: 'concept' | 'formula' | 'skill' | 'rule';
  mastery_level?: number;
  importance: 'high' | 'medium' | 'low';
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  relation: 'prerequisite' | 'component_of' | 'related_to';
}

export interface MicroSkill {
  code: string;
  name: string;
  description: string;
  difficulty: number;
  bloom_level: string;
}

export interface MicroTopic {
  id: string;
  title: string;
  quarter: number;
  order_index: number;
  description: string;
  estimated_minutes: number;
  skills_covered: string[];
  sor_soch_objective: string;
  kundelik_descriptor: string;
}

export interface CourseParseResult {
  course_title: string;
  subject: string;
  grade: string;
  topics: MicroTopic[];
  knowledge_graph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
  micro_skills: MicroSkill[];
  key_formulas: { name: string; formula: string; explanation: string }[];
  quarter_goals: { quarter: number; goal: string; sor_criteria: string[] }[];
}

export interface QuestionDistractor {
  option_id: string;
  text: string;
  latex?: string;
  zvdsl?: string;
  is_correct: boolean;
  misconception_explained?: string;
  cognitive_trap_type?: 'sign_error' | 'formula_inversion' | 'unit_mismatch' | 'domain_error' | 'none';
}

export interface GeneratedQuestion {
  id: string;
  topic_id: string;
  mode: 'A' | 'B';
  question_text: {
    kz: string;
    ru: string;
    en: string;
  };
  difficulty: number;
  zvdsl_schema?: string;
  desmos_expression?: string;
  options?: QuestionDistractor[];
  correct_answer: string;
  rubric?: {
    bare_answer_score: number;
    short_step_score: number;
    full_proof_score: number;
    criteria: string[];
  };
  micro_skills: string[];
  explanation: {
    kz: string;
    ru: string;
    en: string;
  };
}

export interface NotebookEvaluationResult {
  score_type: 'direct_answer' | 'short_step' | 'full_proof' | 'incorrect' | 'jailbreak';
  elo_delta: number;
  is_jailbreak: boolean;
  score_points: number;
  feedback: {
    kz: string;
    ru: string;
    en: string;
  };
  criteria_breakdown: {
    correctness: { score: number; max: number; comment: string };
    reasoning_steps: { score: number; max: number; comment: string };
    math_notation: { score: number; max: number; comment: string };
  };
  detected_steps: string[];
  cognitive_gaps: string[];
  recommendation: string;
}

export interface ClassStudentTelemetry {
  student_id: string;
  student_name: string;
  current_elo: number;
  mastered_skills: string[];
  struggling_skills: string[];
  error_cluster: string;
}

export interface ClassTelemetryDiagnosis {
  class_name: string;
  total_students: number;
  average_elo: number;
  lesson_signal: {
    title: string;
    severity: 'critical' | 'moderate' | 'low';
    top_misconception: string;
    affected_students_count: number;
    affected_students_names: string[];
  };
  warmup_5min_smartboard: {
    title: string;
    scenario: string;
    zvdsl_diagram?: string;
    levels: {
      level_a: { label: string; task: string; hint: string };
      level_b: { label: string; task: string; hint: string };
      level_c: { label: string; task: string; hint: string };
    };
    teacher_script: string;
  };
  kundelik_descriptors: {
    learning_objective: string;
    descriptor_kz: string;
    descriptor_ru: string;
    max_score: number;
  }[];
}

