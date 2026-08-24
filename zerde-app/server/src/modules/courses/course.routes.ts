import { Router, Request, Response } from 'express';
import { getDb } from '../../db/database';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/courses
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const orgId = req.query.orgId as string;

  let query = `
    SELECT c.id, c.short_code, c.title, c.description, c.subject_type as subject, c.language, c.icon,
           COALESCE(u.full_name, 'Оқытушы') as teacherName,
           COUNT(t.id) as topicsCount
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.id
    LEFT JOIN topics t ON c.id = t.course_id
    WHERE c.is_active = 1
  `;
  const params: any[] = [];

  if (orgId) {
    query += ` AND (c.organization_id = ? OR c.organization_id IS NULL)`;
    params.push(orgId);
  }

  query += `
    GROUP BY c.id
    ORDER BY c.id ASC
  `;

  const courses = db.prepare(query).all(...params) as any[];

  // Also fetch the preview topics for each course
  const result = courses.map((crs) => {
    const topics = db.prepare(`
      SELECT id, title, description, is_today_focus
      FROM topics
      WHERE course_id = ?
      ORDER BY order_index ASC, id ASC
      LIMIT 5
    `).all(crs.id) as any[];

    return {
      id: String(crs.id),
      shortCode: crs.short_code,
      title: crs.title,
      description: crs.description,
      subject: crs.subject === 'exact_sciences' ? 'Математика' : crs.subject === 'linguistics' ? 'Қазақ тілі' : 'Пән',
      icon: crs.icon || '📐',
      teacherName: crs.teacherName,
      topicsCount: crs.topicsCount,
      topics: topics.map((t) => t.title),
      topicDetails: topics,
    };
  });

  res.json({ success: true, data: result });
});

// GET /api/courses/:id/topics
router.get('/:id/topics', (req: Request, res: Response) => {
  const db = getDb();
  const courseId = req.params.id;

  const topics = db.prepare(`
    SELECT id, course_id, quarter, topic_number, title, description, is_today_focus, order_index
    FROM topics
    WHERE course_id = ?
    ORDER BY order_index ASC, id ASC
  `).all(courseId) as any[];

  res.json({
    success: true,
    data: topics.map((t) => ({
      id: String(t.id),
      title: t.title,
      description: t.description,
      quarter: t.quarter,
      isTodayFocus: Boolean(t.is_today_focus),
    })),
  });
});

// POST /api/courses/:id/topics (Add topic dynamically)
router.post('/:id/topics', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const courseId = req.params.id;
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Тақырып атауы қажет' });
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM topics WHERE course_id = ?').get(courseId) as any;
  const nextOrder = (countRow?.count || 0) + 1;
  const now = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO topics (course_id, quarter, topic_number, title, description, is_today_focus, order_index, created_at)
    VALUES (?, 1, ?, ?, ?, 0, ?, ?)
  `).run(courseId, nextOrder, title, description || '', nextOrder, now);

  res.json({
    success: true,
    data: {
      id: String(result.lastInsertRowid),
      title,
      description,
      orderIndex: nextOrder,
    },
  });
});

export default router;
