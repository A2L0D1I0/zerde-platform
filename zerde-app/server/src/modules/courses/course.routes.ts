import { Router, Request, Response } from 'express';
import { getDb } from '../../db/database';
import { authenticate, requireRole, AuthRequest } from '../../middleware/auth.middleware';
import { idGenerator } from '../../utils/id_generator';

const router = Router();

// GET /api/courses
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const orgId = req.query.orgId as string;
  const teacherId = req.query.teacherId as string;

  let query = `
    SELECT c.id, c.short_code, c.title, c.description, c.subject_type, c.language, c.icon, c.teacher_id,
           COALESCE(u.full_name, 'Оқытушы') as teacherName,
           COUNT(t.id) as topicsCount
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.id
    LEFT JOIN topics t ON c.id = t.course_id
    WHERE c.is_active = 1
  `;
  const params: any[] = [];

  if (teacherId) {
    query += ` AND c.teacher_id = ?`;
    params.push(teacherId);
  }

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
      id: crs.id,
      short_code: crs.short_code,
      title: crs.title,
      description: crs.description,
      subject_type: crs.subject_type || 'algebra',
      subject: crs.subject_type === 'exact_sciences' ? 'Математика' : crs.subject_type === 'linguistics' ? 'Қазақ тілі' : crs.title,
      language: crs.language || 'KZ',
      icon: crs.icon || '📐',
      teacherId: crs.teacher_id,
      teacherName: crs.teacherName,
      topicsCount: crs.topicsCount,
      topics: topics.map((t) => t.title),
      topicDetails: topics,
    };
  });

  res.json({ success: true, data: result });
});

// POST /api/courses (Create a new course)
router.post('/', authenticate, requireRole('teacher'), (req: AuthRequest, res: Response) => {
  const {
    title,
    short_code,
    description = '',
    subject_type = 'algebra',
    language = 'KZ',
    icon = '📐',
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Курс атауын енгізіңіз (Title is required)' });
  }

  const db = getDb();
  const teacherId = req.user!.id;
  const now = new Date().toISOString();

  // If subject is language/literature, lock language to the appropriate one
  let finalLang = language;
  if (/kazakh/i.test(subject_type)) finalLang = 'KZ';
  else if (/russian/i.test(subject_type)) finalLang = 'RU';
  else if (/english/i.test(subject_type)) finalLang = 'EN';

  const code = (short_code && short_code.trim()) || idGenerator.generateCourseCode({
    title: title.trim(),
    subjectType: subject_type,
    language: finalLang
  });

  const result = db.prepare(`
    INSERT INTO courses (short_code, title, description, subject_type, language, icon, teacher_id, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(code, title.trim(), description.trim(), subject_type, finalLang, icon, teacherId, now);

  const courseId = Number(result.lastInsertRowid);

  // Auto-create initial default group '9 «А»'
  const clsResult = db.prepare(`
    INSERT INTO classrooms (name, school, teacher_id, created_at)
    VALUES (?, ?, ?, ?)
  `).run('9 «А»', req.user!.school || 'NIS IB Astana', teacherId, now);
  const classroomId = Number(clsResult.lastInsertRowid);

  return res.status(201).json({
    success: true,
    data: {
      id: courseId,
      short_code: code,
      title: title.trim(),
      description: description.trim(),
      subject_type,
      language: finalLang,
      icon,
      teacher_id: teacherId,
      default_classroom_id: classroomId,
    }
  });
});

// GET /api/courses/:id/classrooms (List isolated classrooms for this course)
router.get('/:id/classrooms', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const teacherId = req.user!.id;

  const classrooms = db.prepare(`
    SELECT c.id, c.name, c.school, c.teacher_id,
           COUNT(cs.student_id) as student_count
    FROM classrooms c
    LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
    WHERE (c.teacher_id = ? OR c.school IN (SELECT school FROM users WHERE id = ?))
    GROUP BY c.id
    ORDER BY c.id ASC
  `).all(teacherId, teacherId) as any[];

  res.json({ success: true, data: classrooms });
});

// POST /api/courses/:id/classrooms (Create isolated classroom group e.g. '10 «Б»', 'Олимпиадники')
router.post('/:id/classrooms', authenticate, requireRole('teacher'), (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Сынып/топ атауын енгізіңіз (Classroom name is required)' });
  }

  const db = getDb();
  const teacherId = req.user!.id;
  const school = req.user!.school || 'NIS IB Astana';
  const now = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO classrooms (name, school, teacher_id, created_at)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), school, teacherId, now);

  res.status(201).json({
    success: true,
    data: {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      school,
      teacher_id: teacherId,
    }
  });
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
      id: t.id,
      title: t.title,
      description: t.description,
      quarter: t.quarter,
      isTodayFocus: Boolean(t.is_today_focus),
    })),
  });
});

// POST /api/courses/:id/topics (Add topic dynamically)
router.post('/:id/topics', authenticate, requireRole('teacher'), (req: AuthRequest, res: Response) => {
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
      id: result.lastInsertRowid,
      title,
      description,
      quarter: 1,
      isTodayFocus: false,
    },
  });
});

// PATCH /api/courses/:id/language (Update Course Language: KZ, RU, EN, ALL)
router.patch('/:id/language', authenticate, requireRole('teacher'), (req: AuthRequest, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  const { language } = req.body;
  const validLanguages = ['KZ', 'RU', 'EN', 'ALL'];

  if (!language || !validLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      error: 'Жарамсыз тіл форматы (Valid languages: KZ, RU, EN, ALL)'
    });
  }

  const db = getDb();
  const course = db.prepare('SELECT id, subject_type FROM courses WHERE id = ?').get(courseId) as any;

  if (!course) {
    return res.status(404).json({ success: false, error: 'Курс табылмады (Course not found)' });
  }

  // If subject is fixed language discipline, enforce locking
  if (/kazakh/i.test(course.subject_type) && language !== 'KZ') {
    return res.status(400).json({ success: false, error: 'Қазақ тілі курсы тек KZ режимінде бекітілген' });
  }
  if (/russian/i.test(course.subject_type) && language !== 'RU') {
    return res.status(400).json({ success: false, error: 'Русский язык зафиксирован строго на RU' });
  }
  if (/english/i.test(course.subject_type) && language !== 'EN') {
    return res.status(400).json({ success: false, error: 'English course is locked strictly to EN' });
  }

  db.prepare('UPDATE courses SET language = ? WHERE id = ?').run(language, courseId);

  return res.json({
    success: true,
    message: `Курс тілі «${language}» болып жаңартылды`,
    data: { id: courseId, language }
  });
});

export default router;
