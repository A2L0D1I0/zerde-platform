import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiOrchestrator } from '../services/ai-orchestrator';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Validation Schemas
const socraticSchema = z.object({
  topicId: z.string().optional().default('general'),
  questionId: z.string().optional(),
  studentAnswer: z.string().min(1, 'Оқушы жауабы немесе таңдалған қадам бос болмауы керек'),
  dialogueHistory: z.array(
    z.object({
      role: z.enum(['student', 'aga']),
      text: z.string(),
      forkKey: z.string().optional()
    })
  ).optional().default([]),
  currentElo: z.number().optional().default(1200),
  language: z.enum(['kz', 'ru', 'en']).optional().default('kz'),
  consecutiveErrors: z.number().int().min(0).optional().default(0)
});

const parseCourseSchema = z.object({
  courseTitle: z.string().min(2, 'Курс атауын көрсетіңіз'),
  fileContentText: z.string().min(5, 'Талдау үшін құжат мәтіні қажет'),
  subject: z.string().optional().default('Физика'),
  grade: z.string().optional().default('9'),
  language: z.enum(['kz', 'ru', 'en']).optional().default('kz')
});

const generateQuestionsSchema = z.object({
  topicId: z.string().min(1, 'Тақырып идентификаторы қажет'),
  topicTitle: z.string().optional(),
  count: z.number().int().min(1).max(20).optional().default(3),
  difficulty: z.number().int().min(1).max(5).optional().default(2),
  mode: z.enum(['A', 'B', 'both']).optional().default('A'),
  subject: z.string().optional().default('Физика'),
  language: z.enum(['kz', 'ru', 'en']).optional().default('kz')
});

const evaluateNotebookSchema = z.object({
  questionId: z.string().optional(),
  topicId: z.string().optional(),
  questionText: z.string().optional(),
  studentText: z.string().min(1, 'Жауап мәтіні немесе фото сипаттамасы бос болмауы керек'),
  photoUrls: z.array(z.string()).optional().default([]),
  language: z.enum(['kz', 'ru', 'en']).optional().default('kz'),
  currentElo: z.number().optional().default(1200)
});

const teacherCopilotSchema = z.object({
  message: z.string().min(1, 'Мұғалім сұранысы бос болмауы керек'),
  dialogueHistory: z.array(
    z.object({
      role: z.enum(['teacher', 'copilot']),
      text: z.string()
    })
  ).optional().default([]),
  courseContext: z.object({
    title: z.string().optional(),
    subject: z.string().optional(),
    grade: z.string().optional()
  }).optional(),
  language: z.enum(['kz', 'ru', 'en']).optional().default('kz')
});

const classTelemetrySchema = z.object({
  className: z.string().optional().default('9 «А»'),
  subject: z.string().optional().default('Физика'),
  studentsCount: z.number().int().min(1).max(50).optional().default(24),
  telemetryData: z.array(z.any()).optional().default([]),
  language: z.enum(['kz', 'ru', 'en']).optional().default('kz')
});

/**
 * GET /api/ai/status
 * Check active AI provider & fallback engine status
 */
router.get('/status', (req: Request, res: Response) => {
  const status = aiOrchestrator.getProviderStatus();
  res.json({
    success: true,
    engine: 'Zerde 5-Prompts AI Orchestrator',
    status
  });
});

/**
 * POST /api/ai/socratic
 * Агент 1: Сократический «Аға» (Thought-Forks, Anti-Jailbreak, Anti-Stuck, Eureka)
 */
router.post('/socratic', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = socraticSchema.parse(req.body);
    const result = await aiOrchestrator.socraticAga(validated);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/parse-course
 * Агент 3: File Parser & Knowledge Graph Extractor (Q-Matrix, темы, формулы)
 */
router.post('/parse-course', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = parseCourseSchema.parse(req.body);
    const result = await aiOrchestrator.parseCourse(validated);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/generate-questions
 * Агент 4: Assessment & Distractor Generator (Режимы А и Б, ZVDSL+ схемы)
 */
router.post('/generate-questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = generateQuestionsSchema.parse(req.body);
    const result = await aiOrchestrator.generateAssessment(validated);

    res.json({
      success: true,
      count: result.count,
      questions: result.questions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/evaluate-notebook
 * Режим Б: Оценка развернутого ответа / фото тетради (+3 / +7 / +15 ELO)
 */
router.post('/evaluate-notebook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = evaluateNotebookSchema.parse(req.body);
    const { result, new_elo } = await aiOrchestrator.evaluateNotebook(validated);

    res.json({
      success: true,
      result,
      new_elo
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/teacher-copilot
 * Агент 2: Teacher Co-Pilot & Course Architect (Диалог, цели СОР/СОЧ)
 */
router.post('/teacher-copilot', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = teacherCopilotSchema.parse(req.body);
    const result = await aiOrchestrator.teacherCopilot(validated);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/class-telemetry
 * Агент 5: Class Telemetry & Misconception Diagnostics (24 ученика, 5-минутка F11)
 */
router.post('/class-telemetry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = classTelemetrySchema.parse(req.body);
    const diagnosis = await aiOrchestrator.diagnoseClassTelemetry(validated);

    res.json({
      success: true,
      diagnosis
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/morning-briefing
 * Утренний проактивный брифинг учителя (Co-Pilot)
 */
router.post('/morning-briefing', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacherId = 1, classroomId, className, language = 'kz' } = req.body;
    const briefing = await aiOrchestrator.generateMorningBriefing({
      teacherId,
      classroomId,
      className,
      language
    });
    res.json({ success: true, briefing });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/student-passport
 * Генерация когнитивного паспорта ученика
 */
router.post('/student-passport', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, studentName = 'Оқушы', eloHistory = [], dinaSkillsMastered = [], dinaSkillsGaps = [], language = 'kz' } = req.body;
    const passport = await aiOrchestrator.generateStudentPassport({
      studentId,
      studentName,
      eloHistory,
      dinaSkillsMastered,
      dinaSkillsGaps,
      language
    });
    res.json({ success: true, passport });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/presets
 * Создание пресета курса
 */
router.post('/presets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacherId = 1, name, description, subjectType, syllabus } = req.body;
    const result = await aiOrchestrator.createCoursePreset({
      teacherId,
      name,
      description,
      subjectType,
      syllabus
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/presets
 * Список сохраненных пресетов учителя
 */
router.get('/presets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = Number(req.query.teacherId) || 1;
    const presets = await aiOrchestrator.getCoursePresets(teacherId);
    res.json({ success: true, presets });
  } catch (error) {
    next(error);
  }
});

export default router;
