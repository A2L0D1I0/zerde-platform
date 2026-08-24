import { Router, Request, Response } from 'express';
import { getDb } from '../../db/database';
import { authenticate, requireRole, AuthRequest } from '../../middleware/auth.middleware';
import { teacherController } from './teacher.controller';
import { teacherRepository } from './teacher.repository';
import { copilotService } from '../../ai/copilot.service';

const router = Router();

// ============================================================================
// MICRO CO-PILOT ENDPOINTS (Phase 3)
// ============================================================================

/**
 * POST /api/teacher/copilot/generate-quiz
 * Single-Turn AI Question Generation with strict Zod validation & Zero-Crash Fallback
 */
router.post(
  '/copilot/generate-quiz',
  authenticate,
  requireRole('teacher'),
  (req, res, next) => teacherController.generateQuiz(req, res, next)
);

/**
 * POST /api/teacher/courses/:courseId/topics/:topicId/questions/batch
 * Batch saves approved questions into question_bank within SQLite transaction
 */
router.post(
  '/courses/:courseId/topics/:topicId/questions/batch',
  authenticate,
  requireRole('teacher'),
  (req, res, next) => teacherController.batchSaveQuestions(req, res, next)
);

/**
 * GET /api/teacher/classrooms/:classroomId/ai-insights
 * Aggregates classroom deficits via SQL GROUP BY and generates 1 AI advice card
 */
router.get(
  '/classrooms/:classroomId/ai-insights',
  authenticate,
  requireRole('teacher'),
  (req, res, next) => teacherController.getClassAiInsights(req, res, next)
);

// ============================================================================
// TEACHER CLASSROOM DIARY (PURE CRUD — 0 AI / 0 NLP) (Phase 3)
// ============================================================================

/**
 * GET /api/teacher/courses/:courseId/students/:studentId/notes
 * Reads notes for student from isolated passport
 */
router.get(
  '/courses/:courseId/students/:studentId/notes',
  authenticate,
  requireRole('teacher'),
  (req, res, next) => teacherController.getStudentNotes(req, res, next)
);

/**
 * POST /api/teacher/courses/:courseId/students/:studentId/notes
 * Saves teacher text note directly to SQLite
 */
router.post(
  '/courses/:courseId/students/:studentId/notes',
  authenticate,
  requireRole('teacher'),
  (req, res, next) => teacherController.addStudentNote(req, res, next)
);

/**
 * DELETE /api/teacher/courses/:courseId/students/:studentId/notes/:noteId
 * Deletes teacher note from isolated passport
 */
router.delete(
  '/courses/:courseId/students/:studentId/notes/:noteId',
  authenticate,
  requireRole('teacher'),
  (req, res, next) => teacherController.deleteStudentNote(req, res, next)
);

// ============================================================================
// CLASSROOMS & 2D MASTERY MATRIX (Phase 6)
// ============================================================================

/**
 * GET /api/teacher/classrooms
 * Returns all classrooms for authenticated teacher
 */
router.get('/classrooms', authenticate, requireRole('teacher'), (req: AuthRequest, res: Response) => {
  const teacherId = req.user?.id;
  const classrooms = teacherRepository.getClassrooms(teacherId);

  res.json({
    success: true,
    data: classrooms
  });
});

/**
 * GET /api/teacher/class-matrix
 * Returns honest 2D Matrix of students enrolled in the classroom (Zero Fake SQLite)
 */
router.get('/class-matrix', authenticate, requireRole('teacher'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const classroomId = (req.query.classroomId as string) || '1';
  const courseId = Number(req.query.courseId) || 1;
  const cls = db.prepare('SELECT id, name, school FROM classrooms WHERE id = ?').get(classroomId) as any;

  const data = teacherRepository.getClassMatrix(classroomId, courseId);

  res.json({
    success: true,
    data: {
      classroom_id: classroomId,
      classroom_name: cls ? cls.name : 'Сынып',
      school: cls ? cls.school : '',
      students_count: data.matrix.length,
      skills_header: data.skills_header,
      matrix: data.matrix,
      summary_stats: data.summary_stats
    }
  });
});

/**
 * GET /api/teacher/lesson-signal
 * Returns AI Signal of the Day based on real SQL aggregated deficits
 */
router.get('/lesson-signal', authenticate, requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const classroomId = (req.query.classroomId as string) || '1';
  const cls = db.prepare('SELECT id, name, school FROM classrooms WHERE id = ?').get(classroomId) as any;

  const topDeficits = db.prepare(`
    SELECT qb.skill_code, COUNT(*) as error_count
    FROM student_attempts sa
    JOIN question_bank qb ON sa.question_id = qb.id
    JOIN classroom_students cs ON sa.student_id = cs.student_id
    WHERE cs.classroom_id = ? AND sa.is_correct = 0
    GROUP BY qb.skill_code
    ORDER BY error_count DESC
    LIMIT 1
  `).all(classroomId) as { skill_code: string; error_count: number }[];

  const studentCountRow = db.prepare('SELECT COUNT(*) as count FROM classroom_students WHERE classroom_id = ?').get(classroomId) as any;
  const totalStudents = studentCountRow?.count || 0;

  const topDeficit = topDeficits.length > 0 ? topDeficits[0] : null;

  const insightResult = await copilotService.generateClassInsight({
    classroomName: cls ? cls.name : '9 «А»',
    topDeficit,
    totalStudents,
    language: 'KZ'
  });

  res.json({
    success: true,
    data: {
      classroom_id: classroomId,
      classroom_name: cls ? cls.name : '9 «А»',
      signal_level: topDeficit ? 'HIGH_ALERT' : 'NORMAL',
      cluster_deficit: {
        skill_code: topDeficit?.skill_code || 'ALG_09_INEQ',
        skill_name_kz: topDeficit ? `Қателік байқалған дағды: ${topDeficit.skill_code}` : 'Жүйелі қателік жоқ',
        percentage: totalStudents > 0 && topDeficit ? Math.min(100, Math.round((topDeficit.error_count / totalStudents) * 100)) : 0,
        misconception_kz: insightResult.insight
      },
      has_data: insightResult.has_data,
      insight: insightResult.insight
    }
  });
});

// ============================================================================
// 5 MATERIAL SLOTS & CURRICULUM PLANNING (Phase 3)
// ============================================================================

/**
 * GET /api/teacher/courses/:id/slots
 */
router.get(
  '/courses/:id/slots',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.getCourseSlots(req, res, next)
);

/**
 * POST /api/teacher/courses/:id/slots/:slotNumber
 */
router.post(
  '/courses/:id/slots/:slotNumber',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.upsertCourseSlot(req, res, next)
);

/**
 * POST /api/teacher/courses/:id/plan/generate
 */
router.post(
  '/courses/:id/plan/generate',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.generateCurriculumPlan(req, res, next)
);

/**
 * POST /api/teacher/courses/:id/plan/approve
 */
router.post(
  '/courses/:id/plan/approve',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.approveCurriculumPlan(req, res, next)
);

/**
 * GET /api/teacher/courses/:id/plan
 */
router.get(
  '/courses/:id/plan',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.getCurriculumPlan(req, res, next)
);

// ============================================================================
// ADMISSION PIPELINE & APPLICATIONS MODERATION (Phase 3)
// ============================================================================

/**
 * GET /api/teacher/courses/:id/applications
 */
router.get(
  '/courses/:id/applications',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.getCourseApplications(req, res, next)
);

/**
 * POST /api/teacher/courses/:id/applications/:appId/moderate
 */
router.post(
  '/courses/:id/applications/:appId/moderate',
  authenticate,
  requireRole('teacher'),
  (req: AuthRequest, res: Response, next) => teacherController.moderateApplication(req, res, next)
);

export default router;

