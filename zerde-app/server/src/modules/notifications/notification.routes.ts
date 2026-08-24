import { Router, Request, Response } from 'express';
import { getDb } from '../../db/database';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let studentId = req.user ? req.user.id : Number(req.query.userId || 1);

  if (typeof studentId === 'string' && isNaN(Number(studentId))) {
    const u = db.prepare('SELECT id FROM users WHERE email = ? OR uuid = ?').get(studentId, studentId) as any;
    studentId = u ? u.id : 1;
  }

  const rows = db.prepare(`
    SELECT id, title, message, type, is_read as isRead, created_at as time
    FROM retention_notifications
    WHERE student_id = ?
    ORDER BY id DESC LIMIT 20
  `).all(studentId) as any[];

  res.json({
    success: true,
    data: rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      message: r.message,
      type: r.type?.toLowerCase()?.includes('streak') ? 'streak' : 'tutor',
      isRead: Boolean(r.isRead),
      time: r.time,
    })),
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req: Request, res: Response) => {
  const db = getDb();
  const notifId = req.params.id;

  db.prepare('UPDATE retention_notifications SET is_read = 1 WHERE id = ?').run(notifId);

  res.json({ success: true, message: 'Notification marked as read' });
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let studentId = req.user ? req.user.id : Number(req.body.userId || 1);

  if (typeof studentId === 'string' && isNaN(Number(studentId))) {
    const u = db.prepare('SELECT id FROM users WHERE email = ? OR uuid = ?').get(studentId, studentId) as any;
    studentId = u ? u.id : 1;
  }

  db.prepare('UPDATE retention_notifications SET is_read = 1 WHERE student_id = ?').run(studentId);

  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
