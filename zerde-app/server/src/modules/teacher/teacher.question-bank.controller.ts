import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getDb } from '../../db/database';
import { getRankByElo } from '../../shared';

export class TeacherQuestionBankController {
  /**
   * GET /api/teacher/courses/:id/question-bank
   * Returns all questions for the course with student submissions from Subpassports
   */
  public async getCourseQuestionBank(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = Number(req.params.id) || 1;
      const quarter = req.query.quarter ? Number(req.query.quarter) : undefined;
      const mode = req.query.mode ? String(req.query.mode).toUpperCase() : undefined;
      const db = getDb();

      // 1. Fetch questions for this course
      let query = `
        SELECT qb.*, t.title as topic_title, t.quarter as topic_quarter
        FROM question_bank qb
        JOIN topics t ON qb.topic_id = t.id
        WHERE t.course_id = ?
      `;
      const params: any[] = [courseId];

      if (quarter) {
        query += ` AND (qb.quarter_index = ? OR t.quarter = ?)`;
        params.push(quarter, quarter);
      }

      if (mode && (mode === 'A' || mode === 'B')) {
        query += ` AND qb.mode = ?`;
        params.push(mode);
      }

      query += ` ORDER BY qb.created_at DESC, qb.id DESC`;

      const rawQuestions = db.prepare(query).all(...params) as any[];

      // 2. For each question, query real student attempts and student subpassports
      const questions = rawQuestions.map((q) => {
        let options: any[] = [];
        try {
          options = q.options_json ? JSON.parse(q.options_json) : [];
        } catch {
          options = [];
        }

        // Fetch student attempts for this question
        const attemptsRows = db.prepare(`
          SELECT sa.id as attempt_id,
                 sa.student_id,
                 sa.chosen_option,
                 sa.text_response,
                 sa.is_correct,
                 sa.elo_delta,
                 sa.created_at,
                 u.full_name as student_name,
                 u.email as student_email,
                 p.subject_elo,
                 p.rank_tier,
                 p.teacher_daily_notes_json
          FROM student_attempts sa
          JOIN users u ON sa.student_id = u.id
          LEFT JOIN student_course_passports p ON (p.student_id = u.id AND p.course_id = ?)
          WHERE sa.question_id = ?
          ORDER BY sa.created_at DESC
        `).all(courseId, q.id) as any[];

        const submissions = attemptsRows.map((att) => {
          const elo = att.subject_elo || 1000;
          const rankInfo = getRankByElo(elo);

          let notes: any[] = [];
          try {
            notes = att.teacher_daily_notes_json ? JSON.parse(att.teacher_daily_notes_json) : [];
          } catch {
            notes = [];
          }

          return {
            attempt_id: att.attempt_id,
            student_id: att.student_id,
            student_name: att.student_name,
            student_email: att.student_email,
            avatar_url: att.avatar_url,
            elo,
            rank_tier: att.rank_tier || 'OSKIN',
            rank_name: `${rankInfo.symbol} ${rankInfo.nameKZ}`,
            chosen_option: att.chosen_option,
            text_response: att.text_response,
            is_correct: Boolean(att.is_correct),
            elo_delta: att.elo_delta || 0,
            submitted_at: att.created_at,
            teacher_notes_count: notes.length,
          };
        });

        const totalAttempts = submissions.length;
        const correctCount = submissions.filter((s) => s.is_correct).length;
        const successRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : null;

        return {
          id: q.id,
          topic_id: q.topic_id,
          topic_title: q.topic_title,
          quarter: q.quarter_index || q.topic_quarter || 1,
          mode: q.mode === 'B' ? 'B' : 'A',
          mode_label: q.mode === 'B' ? 'Режим Б (Ашық шешім)' : 'Режим А (Тест)',
          question_kz: q.question_kz,
          question_ru: q.question_ru || q.question_kz,
          question_en: q.question_en || q.question_kz,
          katex_snippet: q.katex_snippet,
          options,
          correct_answer: q.correct_answer,
          solution_model: q.solution_model,
          explanation_kz: q.explanation_kz,
          explanation_ru: q.explanation_ru,
          explanation_en: q.explanation_en,
          difficulty: q.difficulty || 2,
          skill_code: q.skill_code || 'ALG_09_INEQ',
          created_at: q.created_at,
          total_submissions: totalAttempts,
          correct_submissions: correctCount,
          success_rate: successRate,
          submissions,
        };
      });

      res.json({
        success: true,
        data: {
          course_id: courseId,
          total_questions: questions.length,
          questions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const teacherQuestionBankController = new TeacherQuestionBankController();
