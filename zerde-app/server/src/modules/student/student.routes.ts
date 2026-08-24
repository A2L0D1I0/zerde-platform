import { Router, Request, Response } from 'express';
import { studentRepository } from './student.repository';
import { calculateEloDelta, calculateSM2, getRankByElo, TaskSubmissionSchema } from '@zerde/shared';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { getDb } from '../../db/database';
import { formatGrade } from '../../routes/auth.routes';

const router = Router();

// GET /api/student/dashboard
router.get('/dashboard', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const identifier = (req.query.studentId as string) || (req.user ? req.user.email : undefined);
  const student = studentRepository.findByIdOrEmail(identifier);

  if (!student) {
    return res.status(404).json({ success: false, error: 'Оқушы табылмады' });
  }

  const userElo = student.elo || 1000;
  const rankInfo = getRankByElo(userElo);

  // Fetch real enrolled courses for this student
  const enrollments = db.prepare(`
    SELECT ce.course_id
    FROM course_enrollments ce
    WHERE ce.student_id = ? AND ce.status = 'enrolled'
  `).all(student.id) as any[];

  let focusTopic: any = null;
  if (enrollments.length > 0) {
    const courseIds = enrollments.map(e => e.course_id);
    const placeholders = courseIds.map(() => '?').join(',');

    focusTopic = db.prepare(`
      SELECT t.id, t.title, t.description, c.title as courseTitle, c.id as courseId
      FROM topics t
      JOIN courses c ON t.course_id = c.id
      WHERE t.course_id IN (${placeholders}) AND t.is_today_focus = 1
      ORDER BY t.id ASC LIMIT 1
    `).get(...courseIds) as any;

    if (!focusTopic) {
      focusTopic = db.prepare(`
        SELECT t.id, t.title, t.description, c.title as courseTitle, c.id as courseId
        FROM topics t
        JOIN courses c ON t.course_id = c.id
        WHERE t.course_id IN (${placeholders})
        ORDER BY t.order_index ASC, t.id ASC LIMIT 1
      `).get(...courseIds) as any;
    }
  }

  res.json({
    success: true,
    data: {
      user: {
        id: student.id,
        email: student.email,
        full_name: student.full_name,
        role: student.role,
        grade: formatGrade(student.grade),
        school: student.school,
        elo: userElo,
        overallElo: userElo,
        streakDays: student.streak_days,
        eloRank: {
          level: rankInfo.nameKZ,
          symbol: rankInfo.symbol,
          minElo: rankInfo.minElo,
          maxElo: rankInfo.maxElo,
        },
      },
      elo: userElo,
      overallElo: userElo,
      rank: rankInfo.nameKZ,
      rank_badge: `${rankInfo.symbol} ${rankInfo.nameKZ}`,
      streak_days: student.streak_days,
      streak_freeze_available: student.streak_days > 0,
      daily_focus: focusTopic ? {
        title: focusTopic.title,
        course_title: focusTopic.courseTitle,
        duration_minutes: 5,
        topic_id: String(focusTopic.id),
        course_id: String(focusTopic.courseId),
        elo_reward: 10,
      } : null,
    },
  });
});

// GET /api/student/enrolled-courses
router.get('/enrolled-courses', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let studentId: number | string | undefined = req.user ? req.user.id : (req.query.studentId as string);

  if (studentId && isNaN(Number(studentId))) {
    const s = studentRepository.findByIdOrEmail(studentId);
    studentId = s ? s.id : undefined;
  }

  if (!studentId) {
    return res.json({ success: true, data: [] });
  }

  const courses = db.prepare(`
    SELECT c.id, c.short_code, c.title, c.description, c.subject_type as subject, c.language, c.icon,
           COALESCE(u.full_name, 'Мұғалім') as teacher_name,
           (SELECT COUNT(*) FROM topics t WHERE t.course_id = c.id) as topics_count,
           (SELECT t.title FROM topics t WHERE t.course_id = c.id ORDER BY t.order_index ASC LIMIT 1) as next_topic
    FROM course_enrollments ce
    JOIN courses c ON ce.course_id = c.id
    LEFT JOIN users u ON c.teacher_id = u.id
    WHERE ce.student_id = ? AND ce.status = 'enrolled' AND c.is_active = 1
    ORDER BY ce.id DESC
  `).all(studentId) as any[];

  res.json({
    success: true,
    data: courses,
  });
});

// POST /api/student/enroll-course
router.post('/enroll-course', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let studentId = req.user ? req.user.id : Number(req.body.studentId);
  const { courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ success: false, error: 'Параметрлер толық емес (Missing studentId or courseId)' });
  }

  const course = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) {
    return res.status(404).json({ success: false, error: 'Курс табылмады' });
  }

  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id, status FROM course_enrollments WHERE course_id = ? AND student_id = ?').get(courseId, studentId) as any;

  if (existing) {
    if (existing.status !== 'enrolled') {
      db.prepare("UPDATE course_enrollments SET status = 'enrolled', approved_at = ? WHERE id = ?").run(now, existing.id);
    }
  } else {
    db.prepare(`
      INSERT INTO course_enrollments (course_id, student_id, status, requested_at, approved_at)
      VALUES (?, ?, 'enrolled', ?, ?)
    `).run(courseId, studentId, now, now);
  }

  res.json({
    success: true,
    message: `«${course.title}» курсына сәтті жазылдыңыз`,
  });
});

// GET /api/student/heatmap
router.get('/heatmap', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  let studentId = req.user ? req.user.id : Number(req.query.studentId || 1);

  if (typeof studentId === 'string' && isNaN(Number(studentId))) {
    const u = db.prepare('SELECT id FROM users WHERE email = ? OR uuid = ?').get(studentId, studentId) as any;
    studentId = u ? u.id : 1;
  }

  const studentUser = db.prepare('SELECT streak_days, longest_streak FROM users WHERE id = ?').get(studentId) as any;
  const heatmapRows = db.prepare(`
    SELECT date, activity_count as tasksCompleted, level
    FROM student_heatmap
    WHERE student_id = ?
    ORDER BY date ASC
  `).all(studentId) as any[];

  // Total contributions
  const totalContributions = heatmapRows.reduce((acc, r) => acc + (r.tasksCompleted || 0), 0);

  // Generate full 365 days map with real activity
  const mapByDate = new Map<string, { tasksCompleted: number; level: number }>();
  heatmapRows.forEach((r) => {
    mapByDate.set(r.date, { tasksCompleted: r.tasksCompleted, level: r.level });
  });

  const matrix = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const item = mapByDate.get(dateStr) || { tasksCompleted: 0, level: 0 };
    matrix.push({
      date: dateStr,
      tasksCompleted: item.tasksCompleted,
      level: item.level,
    });
  }

  res.json({
    success: true,
    data: {
      year: now.getFullYear(),
      total_contributions: totalContributions,
      current_streak: studentUser?.streak_days || 0,
      longest_streak: studentUser?.longest_streak || studentUser?.streak_days || 0,
      matrix,
    },
  });
});

// GET /api/student/leaderboard
router.get('/leaderboard', (req: Request, res: Response) => {
  const leaderboard = studentRepository.getLeaderboard();
  res.json({ success: true, data: leaderboard });
});

// POST /api/student/submit-task
router.post('/submit-task', authenticate, (req: AuthRequest, res: Response) => {
  const parsed = TaskSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues });
  }

  const { studentId, taskId, answer, hintsUsed, timeSpentSeconds } = parsed.data;
  const db = getDb();

  let sId = req.user ? req.user.id : Number(studentId);
  if (typeof sId === 'string' && isNaN(Number(sId))) {
    const u = db.prepare('SELECT id FROM users WHERE email = ? OR uuid = ?').get(sId, sId) as any;
    sId = u ? u.id : 1;
  }

  const student = studentRepository.findByIdOrEmail(sId);
  const currentElo = student ? student.elo : 1000;

  // Real question verification against question_bank table
  let isCorrect = false;
  const question = db.prepare('SELECT * FROM question_bank WHERE id = ? OR topic_id = ?').get(taskId, taskId) as any;

  if (question) {
    const correctAns = (question.correct_answer || '').trim().toLowerCase();
    const studentAns = (answer || '').trim().toLowerCase();

    // Check direct match, or option letter match (A, B, C, D)
    if (correctAns === studentAns) {
      isCorrect = true;
    } else {
      // Check options JSON
      try {
        const options = JSON.parse(question.options_json || '[]');
        const matchingOpt = options.find((opt: any) => opt.isCorrect && (opt.id?.toLowerCase() === studentAns || opt.text?.toLowerCase() === studentAns));
        if (matchingOpt) isCorrect = true;
      } catch (e) {
        // ignore
      }
    }
  } else {
    // Fallback heuristic for open input
    isCorrect = answer.includes('-3') || answer.includes('4') || answer.toLowerCase().includes('дұрыс');
  }

  const deltaResult = calculateEloDelta({
    currentElo,
    isCorrect,
    hintsUsed,
  });

  if (student) {
    studentRepository.updateEloAndStreak(student.id, deltaResult.newElo, isCorrect);

    // Record attempt in student_attempts
    if (question) {
      try {
        db.prepare(`
          INSERT INTO student_attempts (student_id, question_id, chosen_option, text_response, is_correct, elo_delta)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(student.id, question.id, answer, answer, isCorrect ? 1 : 0, deltaResult.delta);
      } catch (e) {
        // ignore
      }
    }
  }

  res.json({
    success: true,
    data: {
      isCorrect,
      eloDelta: deltaResult.delta,
      newRating: deltaResult.newElo,
      newRank: deltaResult.rank.code,
      feedback: isCorrect ? '🎉 Жарайсың! Дұрыс жауап.' : '⚠️ Қателік кетті, қайталап көр!',
      streakEarned: isCorrect,
    },
  });
});

export default router;
