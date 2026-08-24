import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getDb } from '../../db/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { socraticService } from '../../ai/socratic.service';
import { SocraticResponseSchema } from '../../ai/schemas';

const socratesRequestSchema = z.object({
  studentAnswer: z.string().optional().default(''),
  questionId: z.union([z.number(), z.string()]).optional(),
  topicTitle: z.string().min(2, 'Тақырып атауы қажет (Topic title is required)'),
  courseId: z.union([z.number(), z.string()]).optional(),
  currentElo: z.number().optional().default(1000),
  language: z.enum(['KZ', 'RU', 'EN']).optional().default('KZ'),
  isSecondMistake: z.boolean().optional().default(false),
  selectedForkKey: z.enum(['A', 'B', 'C']).optional(),
  isEurekaChoice: z.boolean().optional().default(false)
});

export class TutorController {
  /**
   * POST /api/tutor/socrates
   * Generates Socratic guidance with Thought-Forks and handles Eureka ELO adjustments
   */
  public async handleSocraticSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = socratesRequestSchema.parse(req.body);
      const studentId = req.user?.id || 1;
      const db = getDb();

      const parsedQuestionId = body.questionId ? parseInt(String(body.questionId), 10) : undefined;
      const parsedCourseId = body.courseId ? parseInt(String(body.courseId), 10) : undefined;

      // 1. Generate Socratic Guidance
      const guidance = await socraticService.generateGuidance({
        studentAnswer: body.studentAnswer,
        topicTitle: body.topicTitle,
        currentElo: body.currentElo,
        language: body.language,
        isSecondMistake: body.isSecondMistake,
        selectedForkKey: body.selectedForkKey
      });

      let eloDelta = 0;
      let isEureka = false;

      // 2. Check if student achieved Eureka Moment
      if (body.isEurekaChoice || body.selectedForkKey === 'A') {
        isEureka = true;
        eloDelta = 15; // +15 ELO for Eureka Moment
      }

      const newElo = Math.max(0, body.currentElo + eloDelta);
      guidance.is_eureka = isEureka;
      guidance.elo_delta = eloDelta;
      guidance.new_elo = newElo;

      // 3. Update SQLite if Eureka or fork selection
      if (req.user) {
        if (body.selectedForkKey) {
          // Log THOUGHT_FORK_CLICK
          db.prepare(`
            INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
            VALUES (?, 'student', ?, 'THOUGHT_FORK_CLICK', ?)
          `).run(
            studentId,
            parsedCourseId || null,
            JSON.stringify({
              forkKey: body.selectedForkKey,
              topic: body.topicTitle,
              questionId: parsedQuestionId
            })
          );
        }

        if (isEureka && eloDelta > 0) {
          // Log EUREKA_MOMENT in system_audit_logs
          db.prepare(`
            INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
            VALUES (?, 'student', ?, 'EUREKA_MOMENT', ?)
          `).run(
            studentId,
            parsedCourseId || null,
            JSON.stringify({
              eloDelta,
              newElo,
              topic: body.topicTitle
            })
          );

          const targetCourseId = parsedCourseId || 1;
          const passport = db.prepare(`
            SELECT id, subject_elo FROM student_course_passports
            WHERE student_id = ? AND course_id = ?
          `).get(studentId, targetCourseId) as any;

          if (passport) {
            db.prepare(`
              UPDATE student_course_passports
              SET subject_elo = subject_elo + ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(eloDelta, passport.id);
          }
        }
      }

      res.json({
        success: true,
        data: guidance
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
        return;
      }
      next(error);
    }
  }
}

export const tutorController = new TutorController();
