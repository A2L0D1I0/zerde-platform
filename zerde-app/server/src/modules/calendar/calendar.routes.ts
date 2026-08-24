import { Router, Request, Response } from 'express';
import { getDb } from '../../db/database';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/calendar
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let userId = req.user ? req.user.id : Number(req.query.userId || 1);

  // If userId is string email or not a number, find user id
  if (typeof userId === 'string' && isNaN(Number(userId))) {
    const u = db.prepare('SELECT id FROM users WHERE email = ? OR uuid = ?').get(userId, userId) as any;
    userId = u ? u.id : 1;
  }

  const events = db.prepare(`
    SELECT id, title, event_date as date, event_time as time, is_completed as isCompleted, color, created_at
    FROM calendar_events
    WHERE user_id = ?
    ORDER BY event_date ASC, event_time ASC
  `).all(userId) as any[];

  res.json({
    success: true,
    data: events.map(e => ({
      ...e,
      id: String(e.id),
      isCompleted: Boolean(e.isCompleted),
    })),
  });
});

// POST /api/calendar
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let userId = req.user ? req.user.id : Number(req.body.userId || 1);

  if (typeof userId === 'string' && isNaN(Number(userId))) {
    const u = db.prepare('SELECT id FROM users WHERE email = ? OR uuid = ?').get(userId, userId) as any;
    userId = u ? u.id : 1;
  }

  const { title, event_date, event_time, color = 'purple' } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ success: false, error: 'Title and event_date are required' });
  }

  const result = db.prepare(`
    INSERT INTO calendar_events (user_id, title, event_date, event_time, color)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, title, event_date, event_time || '12:00', color);

  res.json({
    success: true,
    data: {
      id: String(result.lastInsertRowid),
      title,
      date: event_date,
      time: event_time || '12:00',
      isCompleted: false,
      color,
    },
  });
});

// PATCH /api/calendar/:id/toggle
router.patch('/:id/toggle', (req: Request, res: Response) => {
  const db = getDb();
  const eventId = req.params.id;

  const current = db.prepare('SELECT is_completed FROM calendar_events WHERE id = ?').get(eventId) as any;
  if (!current) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  const newStatus = current.is_completed ? 0 : 1;
  db.prepare('UPDATE calendar_events SET is_completed = ? WHERE id = ?').run(newStatus, eventId);

  res.json({
    success: true,
    data: {
      id: eventId,
      isCompleted: Boolean(newStatus),
    },
  });
});

// DELETE /api/calendar/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const eventId = req.params.id;
  db.prepare('DELETE FROM calendar_events WHERE id = ?').run(eventId);

  res.json({ success: true, message: 'Event deleted' });
});

export default router;
