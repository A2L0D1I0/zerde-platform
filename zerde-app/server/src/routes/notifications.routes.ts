import { Router, Response, Request } from 'express';
import { store } from '../db/store';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { retentionService, TriggerType } from '../services/retention.service';

const router = Router();

/**
 * GET /api/notifications
 * Get user's notifications (Duolingo streak savers, Aga emotional callouts, memory burns, weekly digests)
 */
router.get('/', (req: Request, res: Response, next) => {
  try {
    // Check auth if header present, else fallback to demo student usr_student_01
    const authHeader = req.headers.authorization;
    let userId = 'usr_student_01';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zerde_secret_key_2026_dev') as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Fallback to default user for seamless client experience
      }
    }

    const notifs = store.getNotifications(userId);
    const unreadCount = notifs.filter(n => !n.is_read).length;

    res.json({
      success: true,
      count: notifs.length,
      unread_count: unreadCount,
      notifications: notifs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/weekly-digest
 * Returns Weekly Digest JSON data and HTML email template
 */
router.get('/weekly-digest', (req: Request, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'usr_student_01';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zerde_secret_key_2026_dev') as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Fallback
      }
    }

    const digest = retentionService.generateWeeklyDigest(userId);

    // If query ?format=html requested, return pure HTML for email preview
    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(digest.html_template);
    }

    res.json({
      success: true,
      data: digest
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark single notification as read
 */
router.post('/:id/read', (req: Request, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'usr_student_01';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zerde_secret_key_2026_dev') as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Fallback
      }
    }

    const { id } = req.params;
    const notif = store.markNotificationRead(userId, id);

    if (!notif) {
      throw new AppError('Хабарлама табылмады', 404);
    }

    res.json({
      success: true,
      notification: notif,
      message: 'Хабарлама оқылды деп белгіленді'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', (req: Request, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'usr_student_01';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zerde_secret_key_2026_dev') as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Fallback
      }
    }

    const count = store.markAllNotificationsRead(userId);

    res.json({
      success: true,
      marked_count: count,
      message: 'Барлық хабарламалар оқылды'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/trigger-simulation
 * Trigger a psychological notification (STREAK_SAVER, AGA_REMINDER, MEMORY_BURN, WEEKLY_DIGEST)
 */
router.post('/trigger-simulation', (req: Request, res: Response, next) => {
  try {
    const { type, customParams } = req.body as {
      type: TriggerType;
      customParams?: any;
    };

    if (!type || !['STREAK_SAVER', 'AGA_REMINDER', 'MEMORY_BURN', 'WEEKLY_DIGEST'].includes(type)) {
      throw new AppError('Жарамсыз триггер түрі (Invalid trigger type). Must be STREAK_SAVER | AGA_REMINDER | MEMORY_BURN | WEEKLY_DIGEST', 400);
    }

    const authHeader = req.headers.authorization;
    let userId = 'usr_student_01';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zerde_secret_key_2026_dev') as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Fallback
      }
    }

    const user = store.findUserById(userId) || {
      id: userId,
      email: 'student@zerde.kz',
      password_hash: '',
      full_name: 'Әлихан Нұрланұлы',
      role: 'student',
      language: 'kz',
      theme: 'dark',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const notif = retentionService.generateTrigger(type, user, customParams);
    store.addNotification(userId, notif);

    res.status(201).json({
      success: true,
      message: `Психологиялық триггер жасалды: ${type}`,
      notification: notif
    });
  } catch (error) {
    next(error);
  }
});

export default router;
