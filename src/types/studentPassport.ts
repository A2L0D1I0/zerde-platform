/**
 * Zerde Student Passport System - Unified Type Definitions
 * Location: src/types/studentPassport.ts
 */

// ==========================================
// 1. БАЗОВЫЕ ТИПЫ И ЯЗЫКОВОЙ ПРОФИЛЬ
// ==========================================

export type LanguageCode = 'KZ' | 'RU' | 'EN';
export type SchoolType = 'NIS' | 'BIL' | 'GIMNAZIYA' | 'GENERAL_SECONDARY' | 'RSHOMBS';
export type ParentRelationship = 'father' | 'mother' | 'guardian';

export interface LanguageProfile {
  selectedLanguage: LanguageCode;
  nativeLanguage: LanguageCode;
  instructionLanguage: LanguageCode;
  bilingualMode: boolean;
  audioTtsVoice: 'kz_male_aga' | 'kz_female_dana' | 'ru_male_aga' | 'ru_female_dana' | 'en_male_aga';
  mathNotationStyle: 'KZ_GOST' | 'INTERNATIONAL';
}

// ==========================================
// 2. ИДЕНТИФИКАЦИЯ И АКАДЕМИЧЕСКАЯ ПРИВЯЗКА
// ==========================================

export interface SchoolInfo {
  id: string;
  name: string;
  code: string;
  region: string;
  type: SchoolType;
}

export interface TeacherContact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  telegram?: string;
  subjectSpecialization?: string;
}

export interface ParentContact {
  id: string;
  relationship: ParentRelationship;
  fullName: string;
  phone: string;
  email?: string;
  telegramChatId?: string;
  preferredContactMethod: 'phone' | 'telegram' | 'whatsapp' | 'sms';
  notifyOnRisk: boolean;
}

export interface AcademicIdentity {
  uuid: string;              // UUIDv4
  studentId: string;         // 'ST_KZ_09_042'
  userId: string;            // Auth foreign key
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  avatarUrl: string;
  gradeLevel: 7 | 8 | 9 | 10 | 11;
  gradeClass: string;        // '9 «А»'
  school: SchoolInfo;
  curator: TeacherContact;
  primaryTeachers: TeacherContact[];
  parentContacts: ParentContact[];
  academicYear: string;      // '2025-2026'
  currentQuarter: 1 | 2 | 3 | 4;
  isVacation: boolean;
  createdAt: string;         // ISO 8601
  updatedAt: string;
}

// ==========================================
// 3. РЕЙТИНГОВАЯ СИСТЕМА ELO И РАНГИ
// ==========================================

export type EloRankTier = 'OSKIN' | 'TUGYR' | 'KYRAN' | 'SAMGHAU';

export interface EloRankConfig {
  tier: EloRankTier;
  labelKz: 'ӨСКІН' | 'ТҰҒЫР' | 'ҚЫРАН' | 'САМҒАУ';
  labelRu: 'ӨСКІН' | 'ТҰҒЫР' | 'ҚЫРАН' | 'САМҒАУ';
  labelEn: 'OSKIN' | 'TUGYR' | 'KYRAN' | 'SAMGHAU';
  symbol: string;            // '🌱' | '🌿' | '🦅' | '⭐'
  minElo: number;
  maxElo: number;
}

export type EloDeltaReason = 
  | 'EUREKA_MOMENT'        // +15
  | 'SHORT_EXPLANATION'    // +7
  | 'DIRECT_ANSWER'        // +3
  | 'THOUGHT_FORK_LEARN'   // 0
  | 'JAILBREAK_PENALTY'    // -20
  | 'DAILY_DRILL_BONUS'    // +5
  | 'EXAM_SIMULATION';     // Variable

export interface EloHistoryEntry {
  id: string;
  timestamp: string;
  subjectId: string;
  courseId?: string;
  previousElo: number;
  delta: number;
  newElo: number;
  reason: EloDeltaReason;
  actionDescription: string;
  contextQuestionId?: string;
  contextSessionId?: string;
}

export interface SubjectEloRating {
  subjectId: string;
  subjectTitle: string;
  icon: string;
  currentElo: number;
  rank: EloRankConfig;
  predictedScore: string;    // '38/40 ⭐'
  historyCount: number;
  lastUpdated: string;
}

export interface EloProfile {
  overallElo: number;
  currentRank: EloRankConfig;
  quarterCoefficient: number;
  subjectRatings: Record<string, SubjectEloRating>;
  recentHistory: EloHistoryEntry[];
}

// ==========================================
// 4. КОГНИТИВНЫЙ ПРОФИЛЬ И Q-MATRIX (CDM)
// ==========================================

export type CompetencyMasteryStatus = 'MASTERED' | 'DEVELOPING' | 'DEFICIENT';

export type ErrorMisconceptionType = 
  | 'COMPUTATIONAL'      // Арифметикалық қате / Вычислительная
  | 'CONCEPTUAL'         // Концептуалдық түсінбеушілік / Концептуальная
  | 'CARELESSNESS'       // Зейінсіздік, ОДЗ ұмыту / Невнимательность
  | 'FORMULA_IGNORANCE'; // Формуланы білмеу / Незнание формулы

export interface MicroCompetency {
  skillCode: string;         // 'ALG_09_INEQ_INTERVAL'
  domain: string;            // 'Алгебра'
  subdomain: string;         // 'Теңсіздіктер'
  titleKz: string;
  titleRu: string;
  titleEn: string;
  masteryProbability: number;// [0.00 .. 1.00] (DINA posterior)
  status: CompetencyMasteryStatus;
  testedCount: number;
  successCount: number;
  lastTestedAt: string;
}

export interface MisconceptionStats {
  type: ErrorMisconceptionType;
  label: string;
  count: number;
  percentage: number;
  remediationAdvice: string;
}

export interface CognitiveProfile {
  overallMasteryRate: number; // % освоенных навыков
  totalSkillsCount: number;
  masteredCount: number;
  developingCount: number;
  deficientCount: number;
  qMatrixCompetencies: MicroCompetency[];
  errorClassification: MisconceptionStats[];
  radarAttributes: {
    attribute: string;
    score: number; // 0..100
  }[];
}

// ==========================================
// 5. ЖИЗНЕННЫЙ ЦИКЛ КУРСОВ И ТЕМ
// ==========================================

export type CourseEnrollmentStatus = 'pending_approval' | 'enrolled' | 'completed' | 'expelled';

export interface EnrolledCourse {
  courseId: string;
  title: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  enrollmentStatus: CourseEnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  currentScorePercent: number;
  courseElo: number;
}

export type TwoFactorTopicStatus = 'queued' | 'in_progress' | 'pending_teacher' | 'mastered';

export interface QuarterTopicItem {
  id: string;
  topicNumber: string;       // '#01'
  title: string;
  subjectId: string;
  status: TwoFactorTopicStatus;
  statusLabel: string;
  subText: string;
  isTodayFocus: boolean;
  aiVerifiedCount: number;   // e.g. 3 successful problems
  teacherApprovedAt?: string;
  teacherApproverId?: string;
}

// ==========================================
// 6. ТРЕКИНГ АКТИВНОСТИ И УЧЕБНЫХ ПРИВЫЧЕК
// ==========================================

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapRecord {
  date: string;              // 'YYYY-MM-DD'
  level: HeatmapLevel;
  tasksCompleted: number;
  minutesSpent: number;
  eurekaCount: number;
}

export interface ActivityTrackingProfile {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  streakFreezeAvailable: number;
  heatmapHistory: HeatmapRecord[];
  averageSolveTimeSeconds: number;
  eurekaConversionRate: number; // e.g. 78.4%
  firstAttemptAccuracy: number; // e.g. 82.0%
  totalSessionsCount: number;
  totalTimeSpentMinutes: number;
}

// ==========================================
// 7. ИНТЕРВАЛЬНОЕ ПОВТОРЕНИЕ ПАМЯТИ (SM-2)
// ==========================================

export interface SpacedRepetitionCard {
  cardId: string;
  studentId: string;
  topicId: string;
  subjectId: string;
  frontPrompt: string;       // Markdown + LaTeX + ZVDSL+
  backSolution: string;
  easinessFactor: number;    // EF >= 1.3, default 2.5
  repetitionNumber: number;  // n
  intervalDays: number;      // I
  dueDate: string;           // 'YYYY-MM-DD'
  lastReviewedAt?: string;
  lastQualityRating?: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface SpacedRepetitionOverview {
  available: boolean;
  cardsDueTodayCount: number;
  cardsDueThisWeekCount: number;
  timeEstimateFormatted: string; // '1 мин'
  title: string;
  description: string;
  retentionRatePercent: number;
  activeCards: SpacedRepetitionCard[];
}

// ==========================================
// 8. ПЕРСОНАЛЬНЫЙ ROADMAP И ЦЕЛЕВОЙ ЭКЗАМЕН
// ==========================================

export type TargetExamType = 'UNT' | 'SOR_SOCH' | 'OLYMPIAD' | 'NIS_ENTRANCE';

export interface MilestoneTopicNode {
  nodeId: string;
  title: string;
  subjectId: string;
  estimatedHours: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  scoreImpact: number;       // '+3.5 балла к ЕНТ'
  prerequisiteNodeIds: string[];
}

export interface PersonalRoadmap {
  targetExam: TargetExamType;
  examTitle: string;         // 'ҰБТ 2026 / ЕНТ 2026'
  deadlineDate: string;      // '2026-06-15'
  daysRemaining: number;
  targetScore: number;       // 135 (из 140)
  currentPredictedScore: number; // 118
  scoreProgressHistory: {
    date: string;
    predictedScore: number;
  }[];
  criticalPathNodes: MilestoneTopicNode[];
  topRecommendations: string[];
}

// ==========================================
// 🌟 ЕДИНЫЙ ПАСПОРТ УЧЕНИКА (ROOT CONTRACT)
// ==========================================

export interface StudentPassport {
  identity: AcademicIdentity;
  language: LanguageProfile;
  elo: EloProfile;
  cognitive: CognitiveProfile;
  courses: EnrolledCourse[];
  quarterTopics: QuarterTopicItem[];
  activity: ActivityTrackingProfile;
  spacedRepetition: SpacedRepetitionOverview;
  roadmap: PersonalRoadmap;
}
