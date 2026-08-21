export type UserRole = 'student' | 'teacher' | 'admin';
export type AppLanguage = 'KZ' | 'RU' | 'EN';
export type AppTheme = 'light' | 'dark' | 'system';
export type EnrollmentStatus = 'pending_approval' | 'enrolled' | 'expelled' | 'completed';
export type EloRankLevel = 'Өскін' | 'Тұғыр' | 'Қыран' | 'Самғау';
export type TopicStatus = 'mastered' | 'pending' | 'in_progress' | 'queued' | 'locked';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  grade?: string;
  school?: string;
  language: AppLanguage;
  theme: AppTheme;
  avatar_url?: string;
  overallElo: number;
  streakDays: number;
  eloRank: {
    level: EloRankLevel;
    symbol: string;
    minElo: number;
    maxElo: number;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  grade: string;
  language: AppLanguage | 'ALL';
  is_active: boolean;
  students_count: number;
  progress_percentage?: number;
  next_topic?: string;
  enrollment_status?: 'enrolled' | 'pending_approval' | 'none' | 'expelled' | 'completed';
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
}

export interface Topic {
  id: string;
  course_id: string;
  topic_number?: string;
  title: string;
  title_kz?: string;
  title_ru?: string;
  title_en?: string;
  order_index: number;
  description?: string;
  description_kz?: string;
  description_ru?: string;
  description_en?: string;
  quarter?: number;
  status: TopicStatus;
  status_label?: string;
  sub_text?: string;
  mastery_percentage: number;
  is_today_focus?: boolean;
}

export interface HeatmapDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  tasksCompleted: number;
  dayOfWeek?: number;
  topicsMastered?: number;
  details?: string;
}

export interface SubjectFocus {
  id: string;
  title: string;
  title_kz?: string;
  title_ru?: string;
  title_en?: string;
  icon: string;
  subjectElo: number;
  predictedScore: string;
  predictedScore_kz?: string;
  predictedScore_ru?: string;
  predictedScore_en?: string;
  focusTopic: string;
  focusTopic_kz?: string;
  focusTopic_ru?: string;
  focusTopic_en?: string;
  focusReason: string;
  focusReason_kz?: string;
  focusReason_ru?: string;
  focusReason_en?: string;
  durationMinutes: number;
  ctaLabel: string;
}

export interface SpacedRepetitionItem {
  available: boolean;
  cardsCount: number;
  timeEstimate: string;
  title: string;
  description: string;
}

export interface SM2MemoryCard {
  id: string;
  subject: string;
  topicTitle: string;
  formulaLatex: string;
  question: string;
  answer: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
  isDueToday: boolean;
}

export interface StudyDay {
  date: string;
  dayOfWeek: string;
  dayNumber: number;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  tasksCount: number;
  streakActive: boolean;
}

export interface StudentDashboardData {
  user: User;
  elo: number;
  rank: string;
  rank_badge: string;
  streak_days: number;
  streak_freeze_available: boolean;
  pinned_course?: Course | null;
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

export interface StudentHeatmapData {
  year: number;
  total_contributions: number;
  current_streak: number;
  longest_streak: number;
  matrix: HeatmapDay[];
}

export interface StudentRoadmapMilestone {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'locked';
  mastery: number;
  scoreContribution: number;
  description: string;
  microSkills?: Array<{
    name: string;
    mastery: number;
    isKey: boolean;
  }>;
}

export interface StudentRoadmapData {
  target_exam: string;
  target_date: string;
  days_remaining: number;
  current_score: number;
  predicted_score: number;
  target_score: number;
  current_elo: number;
  milestones: StudentRoadmapMilestone[];
}

export interface ClassLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  grade: string;
  school: string;
  elo: number;
  eloRankLevel: EloRankLevel;
  streakDays: number;
  masteredCount: number;
  avatar_url?: string;
  isCurrentUser?: boolean;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  type?: any;
  trigger_type?: string;
  title: string;
  message: string;
  created_at: string;
  is_read?: boolean;
  read?: boolean;
  action_url?: string;
  action_cta?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent' | string;
  payload?: any;
  metadata?: any;
  data?: any;
}

export interface WeeklyDigestData {
  user_id?: string;
  student_name?: string;
  week_range: string;
  total_study_minutes?: number;
  mastered_skills: string[];
  elo_growth?: number;
  elo_earned?: number;
  current_elo?: number;
  class_rank?: number;
  total_students?: number;
  streak_maintained?: number;
  current_streak?: number;
  mentor_quote: string;
  next_week_target?: string;
  focus_next_week?: string;
  total_problems_solved?: number;
  tasks_completed?: number;
  retention_rate?: number;
  html_template?: string;
}
