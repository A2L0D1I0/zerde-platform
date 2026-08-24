import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { tutorController } from './tutor.controller';
import { socraticService } from '../../ai/socratic.service';

const router = Router();

/**
 * POST /api/tutor/socrates
 * Main Socratic dialogue engine endpoint with Zod-validation & Eureka ELO updates
 */
router.post('/socrates', authenticate, (req: AuthRequest, res: Response, next) => {
  tutorController.handleSocraticSession(req, res, next);
});

/**
 * GET /api/tutor/initial
 * Quick initial Socratic greeting and Thought-Forks on topic opening
 */
router.get('/initial', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const studentName = req.user ? req.user.full_name : (req.query.studentName as string) || 'Оқушы';
    const topicTitle = (req.query.topicTitle as string) || 'Квадраттық теңсіздіктер';
    const language = ((req.query.language as string) || 'KZ').toUpperCase() as 'KZ' | 'RU' | 'EN';
    const currentElo = req.query.currentElo ? parseInt(req.query.currentElo as string, 10) : 1000;

    const guidance = await socraticService.generateGuidance({
      studentAnswer: '',
      topicTitle,
      currentElo,
      language,
      isSecondMistake: false
    });

    res.json({
      success: true,
      data: {
        student_name: studentName,
        topic_title: topicTitle,
        ...guidance
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
