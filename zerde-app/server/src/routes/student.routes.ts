import { Router, Response } from 'express';
import { store } from '../db/store';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

/**
 * GET /api/student/dashboard
 * Returns student dashboard overview (ELO, rank, streak, pinned course, memory cards, daily focus)
 */
router.get('/dashboard', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }

    // If teacher/admin provides studentId query, allow viewing student's dashboard
    const targetStudentId = (req.query.studentId as string) && (req.user.role === 'teacher' || req.user.role === 'admin')
      ? (req.query.studentId as string)
      : req.user.id;

    const dashboardData = store.getStudentDashboard(targetStudentId);

    if (!dashboardData) {
      throw new AppError('Оқушы деректері табылмады', 404);
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/student/heatmap
 * Returns activity heatmap matrix for 365 days, current/max streaks
 */
router.get('/heatmap', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }

    const targetStudentId = (req.query.studentId as string) && (req.user.role === 'teacher' || req.user.role === 'admin')
      ? (req.query.studentId as string)
      : req.user.id;

    const heatmapData = store.getStudentHeatmap(targetStudentId);

    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/student/roadmap
 * Returns exam milestones, deadlines, and score predictions (ҰБТ/СОР)
 */
router.get('/roadmap', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }

    const targetStudentId = (req.query.studentId as string) && (req.user.role === 'teacher' || req.user.role === 'admin')
      ? (req.query.studentId as string)
      : req.user.id;

    const roadmapData = store.getStudentRoadmap(targetStudentId);

    res.json({
      success: true,
      data: roadmapData
    });
  } catch (error) {
    next(error);
  }
});

export default router;
