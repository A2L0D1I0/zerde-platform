/**
 * ============================================================================
 * ZERDE ELO RATING & AUDITABLE HISTORY ENGINE
 * 4 Ranks: Өскін (1000–1199), Тұғыр (1200–1399), Қыран (1400–1599), Самғау (1600+)
 * Auditable Deltas: Eureka (+15), Short Step (+7), Direct (+3), Fork (0), Penalty (-20)
 * 100% Local Execution | 0 AI Tokens
 * ============================================================================
 */

import { getDb } from '../db/database';
import { store } from '../db/store';

export type EloRankCode = 'OSKIN' | 'TUGYR' | 'QYRAN' | 'SAMGAU';
export type EloRankNameKZ = 'Өскін' | 'Тұғыр' | 'Қыран' | 'Самғау';

export type EloDeltaReason =
  | 'EUREKA'             // +15: Socratic breakthrough / Eureka moment
  | 'SHORT_STEP'          // +7: Concise logical deduction / step
  | 'DIRECT_ANSWER'       // +3: Direct multiple choice / fact recall
  | 'THOUGHT_FORK'        // 0: Educational branching / exploring hint
  | 'LEARNING_FORK'       // 0: Alias for educational branching
  | 'FULL_STEP'           // +10: Standard multi-step solution
  | 'JAILBREAK_PENALTY';  // -20: Prompt injection / cheat attempt (with ELO >= 0 protection)

export interface EloRankInfo {
  code: EloRankCode;
  nameKZ: EloRankNameKZ;
  nameRU: string;
  nameEN: string;
  badge: string;
  minElo: number;
  maxElo: number;
  progressPercent: number;
}

export interface EloHistoryEntry {
  id: number;
  studentId: number;
  delta: number;
  reason: EloDeltaReason;
  currentElo: number;
  createdAt: string;
}

export interface EloUpdateResult {
  studentId: number;
  previousElo: number;
  newElo: number;
  delta: number;
  reason: EloDeltaReason;
  rank: EloRankInfo;
  previousRank: EloRankInfo;
  rankChanged: boolean;
  historyEntryId: number;
}

// ----------------------------------------------------------------------------
// ELO Rank Boundaries & Config
// ----------------------------------------------------------------------------
export const ELO_RANKS_CONFIG: Record<EloRankCode, { min: number; max: number; nameKZ: EloRankNameKZ; nameRU: string; nameEN: string; badge: string }> = {
  OSKIN: {
    min: 1000,
    max: 1199,
    nameKZ: 'Өскін',
    nameRU: 'Росток (Beginner)',
    nameEN: 'Oskin (Beginner)',
    badge: '🌱 Өскін'
  },
  TUGYR: {
    min: 1200,
    max: 1399,
    nameKZ: 'Тұғыр',
    nameRU: 'Опора (Intermediate)',
    nameEN: 'Tugyr (Intermediate)',
    badge: '🌿 Тұғыр'
  },
  QYRAN: {
    min: 1400,
    max: 1599,
    nameKZ: 'Қыран',
    nameRU: 'Беркут (Advanced)',
    nameEN: 'Qyran (Advanced)',
    badge: '🦅 Қыран'
  },
  SAMGAU: {
    min: 1600,
    max: 2400,
    nameKZ: 'Самғау',
    nameRU: 'Парение (Master)',
    nameEN: 'Samgau (Master)',
    badge: '⭐ Самғау'
  }
};

/**
 * Standard fixed deltas for auditable reasons
 */
export const ELO_DELTAS: Record<EloDeltaReason, number> = {
  EUREKA: 15,
  SHORT_STEP: 7,
  DIRECT_ANSWER: 3,
  THOUGHT_FORK: 0,
  LEARNING_FORK: 0,
  FULL_STEP: 10,
  JAILBREAK_PENALTY: -20
};

/**
 * Determine ELO Rank details for a given numerical ELO rating
 */
export function getEloRank(elo: number): EloRankInfo {
  const safeElo = Math.max(0, Math.round(elo));

  let code: EloRankCode = 'OSKIN';
  if (safeElo >= 1600) {
    code = 'SAMGAU';
  } else if (safeElo >= 1400) {
    code = 'QYRAN';
  } else if (safeElo >= 1200) {
    code = 'TUGYR';
  } else {
    code = 'OSKIN';
  }

  const conf = ELO_RANKS_CONFIG[code];
  const range = conf.max - conf.min;
  let progressPercent = 0;
  if (code === 'SAMGAU') {
    progressPercent = Math.min(100, Math.round(((safeElo - 1600) / 400) * 100));
  } else {
    progressPercent = Math.min(100, Math.max(0, Math.round(((safeElo - conf.min) / range) * 100)));
  }

  return {
    code,
    nameKZ: conf.nameKZ,
    nameRU: conf.nameRU,
    nameEN: conf.nameEN,
    badge: conf.badge,
    minElo: conf.min,
    maxElo: conf.max,
    progressPercent
  };
}

/**
 * Get default delta for reason
 */
export function getDeltaForReason(reason: EloDeltaReason): number {
  return ELO_DELTAS[reason] ?? 0;
}

/**
 * Apply ELO Delta to student rating with auditable ledger entry.
 * Enforces ELO >= 0 protection at all times.
 *
 * @param studentId Student user ID (number)
 * @param reason Reason code for the delta
 * @param customDelta Optional override for delta value
 * @param courseId Optional course ID (defaults to primary course or global)
 * @returns EloUpdateResult with previous and new ELO and ranks
 */
export function applyEloDelta(
  studentId: number,
  reason: EloDeltaReason,
  customDelta?: number,
  courseId?: number
): EloUpdateResult {
  const db = getDb();
  const rawDelta = customDelta !== undefined ? customDelta : getDeltaForReason(reason);

  // 1. Fetch current student ELO
  let currentElo = 1000;
  let highestElo = 1000;
  let targetCourseId = courseId;

  if (!targetCourseId) {
    // Find student's first course or default
    const firstCourse = db.prepare('SELECT course_id FROM student_elo WHERE student_id = ? LIMIT 1').get(studentId) as { course_id: number } | undefined;
    targetCourseId = firstCourse ? firstCourse.course_id : 1;
  }

  const eloRow = db.prepare('SELECT current_elo, highest_elo FROM student_elo WHERE student_id = ? AND course_id = ?').get(studentId, targetCourseId) as { current_elo: number; highest_elo: number } | undefined;

  if (eloRow) {
    currentElo = eloRow.current_elo;
    highestElo = eloRow.highest_elo;
  } else {
    // Check if student has any ELO row
    const anyEloRow = db.prepare('SELECT current_elo, highest_elo FROM student_elo WHERE student_id = ? LIMIT 1').get(studentId) as { current_elo: number; highest_elo: number } | undefined;
    if (anyEloRow) {
      currentElo = anyEloRow.current_elo;
      highestElo = anyEloRow.highest_elo;
    }
  }

  const prevElo = currentElo;
  const previousRank = getEloRank(prevElo);

  // 2. Compute new ELO with ELO >= 0 protection
  const newElo = Math.max(0, currentElo + rawDelta);
  const newHighest = Math.max(highestElo, newElo);
  const newRank = getEloRank(newElo);
  const rankChanged = newRank.code !== previousRank.code;
  const now = new Date().toISOString();

  // 3. Upsert student_elo
  const existingRow = db.prepare('SELECT id FROM student_elo WHERE student_id = ? AND course_id = ?').get(studentId, targetCourseId) as { id: number } | undefined;

  if (existingRow) {
    db.prepare(`
      UPDATE student_elo 
      SET current_elo = ?, rank = ?, highest_elo = ?, updated_at = ?
      WHERE student_id = ? AND course_id = ?
    `).run(newElo, newRank.code, newHighest, now, studentId, targetCourseId);
  } else {
    db.prepare(`
      INSERT INTO student_elo (student_id, course_id, current_elo, rank, highest_elo, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(studentId, targetCourseId, newElo, newRank.code, newHighest, now);
  }

  // 4. Record into auditable student_elo_history ledger
  // Map reason to schema-valid CHECK value if needed
  let schemaReason = reason;
  if (reason === 'THOUGHT_FORK' || reason === 'LEARNING_FORK') {
    schemaReason = 'DIRECT_ANSWER'; // Compatible fallback or store 0 delta
  } else if (reason === 'JAILBREAK_PENALTY') {
    schemaReason = 'JAILBREAK_PENALTY';
  }

  const histRes = db.prepare(`
    INSERT INTO student_elo_history (student_id, delta, reason, current_elo, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentId, rawDelta, schemaReason, newElo, now);

  const historyEntryId = Number(histRes.lastInsertRowid);

  return {
    studentId,
    previousElo: prevElo,
    newElo,
    delta: rawDelta,
    reason,
    rank: newRank,
    previousRank,
    rankChanged,
    historyEntryId
  };
}

/**
 * Get current ELO rating and rank for student
 */
export function getStudentElo(studentId: number, courseId?: number): { elo: number; rank: EloRankInfo; highestElo: number } {
  const db = getDb();

  let query = 'SELECT current_elo, highest_elo FROM student_elo WHERE student_id = ?';
  const params: any[] = [studentId];
  if (courseId) {
    query += ' AND course_id = ?';
    params.push(courseId);
  }
  query += ' ORDER BY course_id ASC LIMIT 1';

  const row = db.prepare(query).get(...params) as { current_elo: number; highest_elo: number } | undefined;
  const elo = row ? row.current_elo : 1000;
  const highest = row ? row.highest_elo : elo;

  return {
    elo,
    rank: getEloRank(elo),
    highestElo: highest
  };
}

/**
 * Get auditable ELO history ledger for student
 */
export function getStudentEloHistory(studentId: number, limit = 20): EloHistoryEntry[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, student_id, delta, reason, current_elo, created_at
    FROM student_elo_history
    WHERE student_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).all(studentId, limit) as any[];

  return rows.map((r) => ({
    id: r.id,
    studentId: r.student_id,
    delta: r.delta,
    reason: r.reason as EloDeltaReason,
    currentElo: r.current_elo,
    createdAt: r.created_at
  }));
}
