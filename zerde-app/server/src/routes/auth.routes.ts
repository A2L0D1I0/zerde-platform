import { Router, Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../db/database';
import { authenticate, generateToken, AuthRequest } from '../middleware/auth.middleware';
import { DbOrganization, DbUser } from '../types/database';

const router = Router();

export function formatGrade(grade?: string | number | null): string {
  if (!grade) return 'Сынып көрсетілмеген';
  const str = String(grade).trim();
  if (
    str.includes('сынып') ||
    str.includes('класс') ||
    str.includes('Grade') ||
    str.includes('Колледж') ||
    str.includes('ЖОО') ||
    str.includes('ВУЗ') ||
    str.includes('Басқа')
  ) {
    return str;
  }
  return `${str}-сынып`;
}

const loginSchema = z.object({
  email: z.string().email('Жарамсыз email форматы (Invalid email format)'),
  password: z.string().min(1, 'Құпиясөз бос болмауы керек (Password is required)')
});

const registerSchema = z.object({
  email: z.string().email('Жарамсыз email форматы (Invalid email format)'),
  password: z.string().min(4, 'Құпиясөз кемінде 4 таңбадан тұруы керек (Password must be at least 4 chars)'),
  full_name: z.string().min(2, 'Толық аты-жөніңізді енгізіңіз (Full name is required)'),
  role: z.enum(['student', 'teacher', 'admin']),
  grade: z.union([z.number(), z.string()]).optional(),
  schoolToken: z.string().optional(),
  org_token: z.string().optional() // backwards-compatible alias
});

/**
 * POST /api/auth/register
 * Register Teacher (mandatory school token) or Student (optional school token)
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);
    const { email, password, full_name, role } = body;
    const rawToken = (body.schoolToken || body.org_token || '').trim();
    const parsedGrade = body.grade ? parseInt(String(body.grade).replace(/\D/g, ''), 10) || undefined : undefined;

    const db = getDb();

    // 1. Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Бұл email бойынша аккаунт тіркелген (User with this email already exists)'
      });
    }

    let organizationId: number | null = null;
    let schoolName: string = '';

    // 2. Role-specific School Token Verification
    if (role === 'teacher') {
      // Teacher MUST provide a valid teacher token
      if (!rawToken) {
        return res.status(400).json({
          success: false,
          error: 'Мұғалімді тіркеу үшін ұйымның ресми токені қажет (Teacher registration requires an official school token, e.g. NIS-TEACHER-2026)'
        });
      }

      // Check if student token was mistakenly entered
      const studentTokenOrg = db.prepare('SELECT id, name FROM organizations WHERE student_token = ?').get(rawToken) as DbOrganization | undefined;
      if (studentTokenOrg) {
        return res.status(400).json({
          success: false,
          error: 'Бұл токен тек оқушыларға арналған (This token is designated only for students)'
        });
      }

      // Check valid teacher token
      const teacherOrg = db.prepare('SELECT id, name FROM organizations WHERE teacher_token = ?').get(rawToken) as DbOrganization | undefined;
      if (!teacherOrg) {
        return res.status(400).json({
          success: false,
          error: 'Жарамсыз мұғалім токені (Invalid teacher school token)'
        });
      }

      organizationId = teacherOrg.id;
      schoolName = teacherOrg.name;

    } else if (role === 'student') {
      if (rawToken) {
        // Check if teacher token was mistakenly entered for student
        const isTeacherToken = db.prepare('SELECT id, name FROM organizations WHERE teacher_token = ?').get(rawToken) as DbOrganization | undefined;
        if (isTeacherToken) {
          return res.status(400).json({
            success: false,
            error: 'Мұғалім токенімен оқушы ретінде тіркелуге болмайды (Teacher token cannot be used for student registration)'
          });
        }

        const studentOrg = db.prepare('SELECT id, name FROM organizations WHERE student_token = ?').get(rawToken) as DbOrganization | undefined;
        if (!studentOrg) {
          return res.status(400).json({
            success: false,
            error: 'Жарамсыз оқушы токені (Invalid student school token)'
          });
        }

        organizationId = studentOrg.id;
        schoolName = studentOrg.name;
      }
      // If rawToken is empty -> Independent student (organizationId = null)
    }

    // 3. Hash password
    const passwordHash = await bcryptjs.hash(password, 10);
    const userUuid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 4. Atomic Insert into SQLite
    const insertUser = db.prepare(`
      INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, organization_id, streak_days, longest_streak)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    const result = insertUser.run(
      userUuid,
      email,
      passwordHash,
      full_name,
      role,
      parsedGrade || null,
      schoolName || null,
      organizationId
    );

    const userId = Number(result.lastInsertRowid);

    // 5. If attached to organization, record role in user_organization_roles (Anti-Conflict matrix)
    if (organizationId) {
      db.prepare(`
        INSERT INTO user_organization_roles (user_id, organization_id, role)
        VALUES (?, ?, ?)
      `).run(userId, organizationId, role);
    }

    // 6. Generate JWT Token
    const token = generateToken({
      id: userId,
      uuid: userUuid,
      email,
      role,
      organization_id: organizationId || undefined
    });

    return res.status(201).json({
      success: true,
      message: 'Тіркелу сәтті аяқталды (Registration successful)',
      token,
      user: {
        id: userId,
        uuid: userUuid,
        email,
        full_name,
        role,
        grade: parsedGrade,
        school: schoolName || undefined,
        organization_id: organizationId || undefined,
        streak_days: 0
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Standard email + password login
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const db = getDb();

    const user = db.prepare(`
      SELECT id, uuid, email, password_hash, full_name, role, grade, school, organization_id, streak_days
      FROM users WHERE email = ?
    `).get(email) as DbUser | undefined;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email немесе құпиясөз қате (Invalid email or password)'
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Email немесе құпиясөз қате (Invalid email or password)'
      });
    }

    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id || undefined
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        grade: user.grade,
        school: user.school,
        organization_id: user.organization_id,
        streak_days: user.streak_days || 0
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Returns authenticated user profile
 */
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Авторизация қажет' });
  }

  const db = getDb();
  const user = db.prepare(`
    SELECT id, uuid, email, full_name, role, grade, school, organization_id, streak_days, longest_streak, created_at
    FROM users WHERE id = ?
  `).get(req.user.id) as DbUser | undefined;

  if (!user) {
    return res.status(404).json({ success: false, error: 'Пайдаланушы табылмады' });
  }

  let organization: DbOrganization | undefined;
  if (user.organization_id) {
    organization = db.prepare('SELECT id, name, type FROM organizations WHERE id = ?').get(user.organization_id) as DbOrganization | undefined;
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      grade: user.grade,
      school: user.school,
      organization_id: user.organization_id,
      organization_name: organization?.name,
      streak_days: user.streak_days || 0,
      longest_streak: user.longest_streak || 0,
      created_at: user.created_at
    }
  });
});

export default router;
