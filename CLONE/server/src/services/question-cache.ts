/**
 * ============================================================================
 * ZERDE QUESTION CACHE & SMART DEFICIT TASK SELECTOR
 * Smart question retrieval for student micro-skill deficits from local database.
 * 100% Local Execution | 0 AI Tokens
 * ============================================================================
 */

import { getDb } from '../db/database';
import { getStudentCdmProfile } from './cdm-qmatrix';

export interface QuestionItem {
  id: number;
  topicId: number;
  topicTitle?: string;
  courseId?: number;
  courseTitle?: string;
  mode: 'A' | 'B';
  questionKz: string;
  questionRu: string;
  questionEn: string;
  zvdslCanvasJson: string | null;
  desmosState: string | null;
  optionsJson: string | null;
  options?: any[];
  correctAnswer: string;
  explanationKz: string | null;
  explanationRu: string | null;
  explanationEn: string | null;
  difficulty: number;
  microSkills: string[];
  isSolved: boolean;
  isCorrect: boolean;
}

export interface AdaptivePracticeSession {
  studentId: number;
  deficitSkills: Array<{ code: string; nameKZ: string; probability: number }>;
  questions: QuestionItem[];
  totalCount: number;
  estimatedMinutes: number;
  targetFocusKZ: string;
  targetFocusRU: string;
}

/**
 * Parses raw database row into structured QuestionItem
 */
function parseQuestionRow(row: any, isSolved = false, isCorrect = false): QuestionItem {
  let microSkills: string[] = [];
  if (row.micro_skills_json) {
    try {
      microSkills = JSON.parse(row.micro_skills_json);
    } catch {}
  }

  let options: any[] | undefined = undefined;
  if (row.options_json) {
    try {
      options = JSON.parse(row.options_json);
    } catch {}
  }

  return {
    id: row.id,
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    courseId: row.course_id,
    courseTitle: row.course_title,
    mode: row.mode,
    questionKz: row.question_kz,
    questionRu: row.question_ru,
    questionEn: row.question_en,
    zvdslCanvasJson: row.zvdsl_canvas_json,
    desmosState: row.desmos_state,
    optionsJson: row.options_json,
    options,
    correctAnswer: row.correct_answer,
    explanationKz: row.explanation_kz,
    explanationRu: row.explanation_ru,
    explanationEn: row.explanation_en,
    difficulty: row.difficulty,
    microSkills,
    isSolved,
    isCorrect
  };
}

/**
 * Finds questions addressing a specific micro-skill deficit.
 * Prioritizes unsolved questions first.
 */
export function getQuestionsForDeficit(
  studentId: number,
  microSkillCode: string,
  options?: { limit?: number; mode?: 'A' | 'B'; maxDifficulty?: number }
): QuestionItem[] {
  const db = getDb();
  const limit = options?.limit ?? 5;

  // 1. Fetch all questions containing the target micro-skill
  let query = `
    SELECT 
      qb.*,
      t.title as topic_title,
      t.course_id,
      c.title as course_title,
      sa.is_correct as attempt_correct,
      sa.id as attempt_id
    FROM question_bank qb
    JOIN topics t ON qb.topic_id = t.id
    LEFT JOIN courses c ON t.course_id = c.id
    LEFT JOIN student_attempts sa ON qb.id = sa.question_id AND sa.student_id = ?
    WHERE qb.micro_skills_json LIKE ?
  `;
  const params: any[] = [studentId, `%"${microSkillCode}"%`];

  if (options?.mode) {
    query += ' AND qb.mode = ?';
    params.push(options.mode);
  }
  if (options?.maxDifficulty) {
    query += ' AND qb.difficulty <= ?';
    params.push(options.maxDifficulty);
  }

  // Order by unsolved first (attempt_correct IS NULL OR 0), then difficulty
  query += ' ORDER BY CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END ASC, qb.difficulty ASC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((r) => parseQuestionRow(r, r.attempt_id !== null, r.attempt_correct === 1));
}

/**
 * Finds questions for a specific topic, prioritizing unsolved
 */
export function getQuestionsForTopic(
  studentId: number,
  topicId: number,
  options?: { limit?: number; mode?: 'A' | 'B' }
): QuestionItem[] {
  const db = getDb();
  const limit = options?.limit ?? 10;

  let query = `
    SELECT 
      qb.*,
      t.title as topic_title,
      t.course_id,
      c.title as course_title,
      sa.is_correct as attempt_correct,
      sa.id as attempt_id
    FROM question_bank qb
    JOIN topics t ON qb.topic_id = t.id
    LEFT JOIN courses c ON t.course_id = c.id
    LEFT JOIN student_attempts sa ON qb.id = sa.question_id AND sa.student_id = ?
    WHERE qb.topic_id = ?
  `;
  const params: any[] = [studentId, topicId];

  if (options?.mode) {
    query += ' AND qb.mode = ?';
    params.push(options.mode);
  }

  query += ' ORDER BY CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END ASC, qb.difficulty ASC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((r) => parseQuestionRow(r, r.attempt_id !== null, r.attempt_correct === 1));
}

/**
 * Automatically builds an adaptive practice session for a student based on CDM deficits.
 * 100% local, 0 AI tokens.
 */
export function getAdaptivePracticeSession(
  studentId: number,
  courseId?: number,
  questionCount = 3
): AdaptivePracticeSession {
  // 1. Run CDM to identify weakest skills
  const cdm = getStudentCdmProfile(studentId, courseId);

  // Take top deficits (or in_progress skills if deficits < 2)
  const targetDeficits = [...cdm.deficitSkills, ...cdm.inProgressSkills].slice(0, 3);

  const questions: QuestionItem[] = [];
  const pickedIds = new Set<number>();

  for (const def of targetDeficits) {
    if (questions.length >= questionCount) break;

    const candidateQuestions = getQuestionsForDeficit(studentId, def.skillCode, { limit: 2 });
    for (const q of candidateQuestions) {
      if (!pickedIds.has(q.id) && questions.length < questionCount) {
        pickedIds.add(q.id);
        questions.push(q);
      }
    }
  }

  // Fallback: If not enough questions picked, fill from topic
  if (questions.length < questionCount) {
    const db = getDb();
    let fallbackQuery = `
      SELECT qb.*, t.title as topic_title, t.course_id, c.title as course_title
      FROM question_bank qb
      JOIN topics t ON qb.topic_id = t.id
      LEFT JOIN courses c ON t.course_id = c.id
    `;
    const params: any[] = [];
    if (courseId) {
      fallbackQuery += ' WHERE t.course_id = ?';
      params.push(courseId);
    }
    fallbackQuery += ' ORDER BY RANDOM() LIMIT ?';
    params.push(questionCount - questions.length);

    const fallbackRows = db.prepare(fallbackQuery).all(...params) as any[];
    for (const fb of fallbackRows) {
      if (!pickedIds.has(fb.id)) {
        pickedIds.add(fb.id);
        questions.push(parseQuestionRow(fb, false, false));
      }
    }
  }

  const primaryDeficit = targetDeficits[0];
  const targetFocusKZ = primaryDeficit
    ? `3-минуттық экспресс-жаттығу: ${primaryDeficit.skillNameKZ}`
    : '3-минуттық экспресс-жаттығу: Тақырыптық бекіту';
  const targetFocusRU = primaryDeficit
    ? `3-минутная экспресс-тренировка: ${primaryDeficit.skillNameRU}`
    : '3-минутная экспресс-тренировка: Закрепление темы';

  return {
    studentId,
    deficitSkills: targetDeficits.map((d) => ({ code: d.skillCode, nameKZ: d.skillNameKZ, probability: d.probability })),
    questions,
    totalCount: questions.length,
    estimatedMinutes: Math.max(3, questions.length * 2),
    targetFocusKZ,
    targetFocusRU
  };
}

/**
 * Get question by ID with full details
 */
export function getQuestionById(questionId: number): QuestionItem | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT qb.*, t.title as topic_title, t.course_id, c.title as course_title
    FROM question_bank qb
    JOIN topics t ON qb.topic_id = t.id
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE qb.id = ?
  `).get(questionId) as any;

  if (!row) return null;
  return parseQuestionRow(row);
}
