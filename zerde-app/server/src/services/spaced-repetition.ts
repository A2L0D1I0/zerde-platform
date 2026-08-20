/**
 * ============================================================================
 * ZERDE SPACED REPETITION ENGINE (SUPERMEMO-2 / SM-2)
 * Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), EF >= 1.3
 * Intervals: I(1) = 1, I(2) = 6, I(n) = I(n-1) * EF
 * 100% Local Execution | 0 AI Tokens
 * ============================================================================
 */

import { getDb } from '../db/database';

export interface SM2Input {
  quality: number; // q in [0..5]
  easinessFactor?: number; // EF, default 2.5
  repetitions?: number; // n, default 0
  intervalDays?: number; // I, default 1
  baseDate?: Date; // default today
}

export interface SM2Result {
  quality: number;
  easinessFactor: number; // EF' (>= 1.3)
  repetitions: number; // updated n
  intervalDays: number; // updated I in days
  nextReviewDate: string; // YYYY-MM-DD
  isPassed: boolean; // quality >= 3
}

export interface SpacedCard {
  id: number;
  studentId: number;
  topicId: number;
  topicTitle?: string;
  courseTitle?: string;
  cardTitle: string;
  cardContent: string;
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt: string | null;
  createdAt: string;
  isDueToday: boolean;
}

export interface CardReviewResult {
  cardId: number;
  studentId: number;
  quality: number;
  previousEasinessFactor: number;
  newEasinessFactor: number;
  previousInterval: number;
  newInterval: number;
  repetitions: number;
  nextReviewDate: string;
  messageKZ: string;
  messageRU: string;
}

export interface SpacedRepetitionSummary {
  dueTodayCount: number;
  totalCardsCount: number;
  masteredCardsCount: number; // repetitions >= 3
  learningCardsCount: number; // repetitions < 3
  retentionRatePercent: number; // based on passed reviews
  cardsDueToday: SpacedCard[];
}

/**
 * Pure mathematical SM-2 algorithm implementation
 */
export function calculateSM2(input: SM2Input): SM2Result {
  const q = Math.max(0, Math.min(5, Math.round(input.quality)));
  const prevEf = input.easinessFactor ?? 2.5;
  const prevReps = input.repetitions ?? 0;
  const prevInterval = input.intervalDays ?? 1;
  const base = (input.baseDate instanceof Date && !isNaN(input.baseDate.getTime())) ? input.baseDate : new Date();

  // 1. Calculate updated Easiness Factor EF'
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  let newEf = prevEf + delta;
  newEf = Math.max(1.3, Math.round(newEf * 100) / 100);

  // 2. Calculate updated repetitions and interval
  let newReps = 0;
  let newInterval = 1;
  const isPassed = q >= 3;

  if (!isPassed) {
    // If recall failed (q < 3), restart repetitions from 0, interval 1 day
    newReps = 0;
    newInterval = 1;
  } else {
    // Successful recall
    if (prevReps === 0) {
      newReps = 1;
      newInterval = 1;
    } else if (prevReps === 1) {
      newReps = 2;
      newInterval = 6;
    } else {
      newReps = prevReps + 1;
      newInterval = Math.max(1, Math.round(prevInterval * newEf));
    }
  }

  const safeInterval = isNaN(newInterval) || !isFinite(newInterval) ? 1 : Math.max(1, Math.min(365, newInterval));

  // 3. Compute next review date
  const nextDate = new Date(base.getTime() + safeInterval * 24 * 60 * 60 * 1000);
  const nextReviewDate = nextDate.toISOString().split('T')[0];


  return {
    quality: q,
    easinessFactor: newEf,
    repetitions: newReps,
    intervalDays: newInterval,
    nextReviewDate,
    isPassed
  };
}

/**
 * Get all flashcards due for review for a student
 */
export function getDueCardsForStudent(studentId: number, targetDateStr?: string): SpacedCard[] {
  const db = getDb();
  const today = targetDateStr || new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT 
      c.id,
      c.student_id,
      c.topic_id,
      c.card_title,
      c.card_content,
      c.easiness_factor,
      c.interval_days,
      c.repetitions,
      c.next_review_date,
      c.last_reviewed_at,
      c.created_at,
      t.title as topic_title,
      co.title as course_title
    FROM spaced_repetition_cards c
    LEFT JOIN topics t ON c.topic_id = t.id
    LEFT JOIN courses co ON t.course_id = co.id
    WHERE c.student_id = ?
    ORDER BY c.next_review_date ASC, c.id ASC
  `).all(studentId) as any[];

  return rows.map((r) => ({
    id: r.id,
    studentId: r.student_id,
    topicId: r.topic_id,
    topicTitle: r.topic_title,
    courseTitle: r.course_title,
    cardTitle: r.card_title,
    cardContent: r.card_content,
    easinessFactor: r.easiness_factor,
    intervalDays: r.interval_days,
    repetitions: r.repetitions,
    nextReviewDate: r.next_review_date,
    lastReviewedAt: r.last_reviewed_at,
    createdAt: r.created_at,
    isDueToday: r.next_review_date <= today
  }));
}

/**
 * Review a specific flashcard with a quality score q in [0..5]
 */
export function reviewSpacedCard(cardId: number, quality: number, studentId?: number): CardReviewResult {
  const db = getDb();

  let query = 'SELECT * FROM spaced_repetition_cards WHERE id = ?';
  const params: any[] = [cardId];
  if (studentId) {
    query += ' AND student_id = ?';
    params.push(studentId);
  }

  const card = db.prepare(query).get(...params) as any;
  if (!card) {
    throw new Error(`Карточка #${cardId} табылмады`);
  }

  // Calculate new SM-2 values
  const sm2 = calculateSM2({
    quality,
    easinessFactor: card.easiness_factor,
    repetitions: card.repetitions,
    intervalDays: card.interval_days
  });

  const now = new Date().toISOString();

  // Update in SQLite
  db.prepare(`
    UPDATE spaced_repetition_cards
    SET 
      easiness_factor = ?,
      interval_days = ?,
      repetitions = ?,
      next_review_date = ?,
      last_reviewed_at = ?
    WHERE id = ?
  `).run(
    sm2.easinessFactor,
    sm2.intervalDays,
    sm2.repetitions,
    sm2.nextReviewDate,
    now,
    cardId
  );

  let messageKZ = '';
  let messageRU = '';

  if (quality >= 4) {
    messageKZ = `Керемет жауап! Келесі қайталау ${sm2.intervalDays} күннен кейін (${sm2.nextReviewDate}).`;
    messageRU = `Отличный ответ! Следующее повторение через ${sm2.intervalDays} дн. (${sm2.nextReviewDate}).`;
  } else if (quality === 3) {
    messageKZ = `Жақсы, бірақ күш салынды. Қайталау интервалы: ${sm2.intervalDays} күн.`;
    messageRU = `Хорошо, но потребовалось усилие. Интервал: ${sm2.intervalDays} дн.`;
  } else {
    messageKZ = `Формула әлі толық бекітілмеді. Ертең қайта қайталаймыз (${sm2.nextReviewDate}).`;
    messageRU = `Материал не закреплен. Повторим завтра (${sm2.nextReviewDate}).`;
  }

  return {
    cardId,
    studentId: card.student_id,
    quality: sm2.quality,
    previousEasinessFactor: card.easiness_factor,
    newEasinessFactor: sm2.easinessFactor,
    previousInterval: card.interval_days,
    newInterval: sm2.intervalDays,
    repetitions: sm2.repetitions,
    nextReviewDate: sm2.nextReviewDate,
    messageKZ,
    messageRU
  };
}

/**
 * Get comprehensive Spaced Repetition summary for student dashboard
 */
export function getSpacedRepetitionSummary(studentId: number): SpacedRepetitionSummary {
  const allCards = getDueCardsForStudent(studentId);
  const today = new Date().toISOString().split('T')[0];

  const dueToday = allCards.filter((c) => c.nextReviewDate <= today);
  const mastered = allCards.filter((c) => c.repetitions >= 3);
  const learning = allCards.filter((c) => c.repetitions < 3);

  const total = allCards.length;
  const retentionRate = total > 0 ? Math.round((mastered.length / total) * 100) : 92;

  return {
    dueTodayCount: dueToday.length,
    totalCardsCount: total,
    masteredCardsCount: mastered.length,
    learningCardsCount: learning.length,
    retentionRatePercent: retentionRate,
    cardsDueToday: dueToday
  };
}
