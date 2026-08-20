export type Language = 'KZ' | 'RU' | 'EN';

export type EloRankLevel = 'ӨСКІН' | 'ТҰҒЫР' | 'ҚЫРАН' | 'САМҒАУ';

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  school: string;
  selectedLanguage: Language;
  overallElo: number;
  eloRank: {
    level: EloRankLevel;
    symbol: string;
    minElo: number;
    maxElo: number;
  };
  streakDays: number;
  quarter: number;
  isVacation: boolean;
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

export type TopicStatus = 'mastered' | 'pending' | 'in_progress' | 'queued';

export interface QuarterTopic {
  id: string;
  topicNumber: string;
  title: string;
  status: TopicStatus;
  statusLabel: string;
  subText: string;
  isTodayFocus?: boolean;
}

export interface SpacedRepetitionItem {
  available: boolean;
  cardsCount: number;
  timeEstimate: string;
  title: string;
  description: string;
}

export * from './studentPassport';

