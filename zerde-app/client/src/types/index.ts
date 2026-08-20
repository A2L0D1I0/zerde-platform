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
  password?: string;
  org_token?: string;
  bio?: string;
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
  short_code?: string;
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


export interface Topic {
  id: string;
  course_id: string;
  topic_number?: string;
  title: string;
  order_index: number;
  description?: string;
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
}

export interface SubjectFocus {
  id: string;
  title: string;
  icon: string;
  subjectElo: number;
  predictedScore: string;
  focusTopic: string;
  focusReason: string;
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

export interface RoadmapMilestone {
  id: string;
  title: string;
  subject?: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'locked' | 'upcoming';
  mastery: number;
  scoreContribution?: number;
  description?: string;
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
  milestones: RoadmapMilestone[];
}

export interface ClassLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar_url?: string;
  grade: string;
  school: string;
  elo: number;
  eloRankLevel: EloRankLevel;
  streakDays: number;
  masteredCount: number;
  isCurrentUser?: boolean;
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

export interface StudentDashboardData {
  user: User;
  elo: number;
  rank: EloRankLevel;
  rank_badge: string;
  streak_days: number;
  streak_freeze_available: boolean;
  pinned_course: Course | null;
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

export type NotificationTriggerType = 
  | 'STREAK_SAVER' 
  | 'AGA_REMINDER' 
  | 'MEMORY_BURN' 
  | 'WEEKLY_DIGEST' 
  | 'course_enrollment' 
  | 'teacher_feedback' 
  | 'system'
  | 'streak_saver';

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationTriggerType;
  trigger_type?: 'STREAK_SAVER' | 'AGA_REMINDER' | 'MEMORY_BURN' | 'WEEKLY_DIGEST';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  priority?: 'urgent' | 'high' | 'normal';
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
