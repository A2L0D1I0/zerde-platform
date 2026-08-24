import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database';
import { DbUser } from '../types/database';

export interface AuthUser {
  id: number;
  uuid: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  grade?: number;
  school?: string;
  organization_id?: number;
  streak_days: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  id: number;
  uuid: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  organization_id?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'zerde_secret_key_2026_prod_jwt';

/**
 * Generate JWT token for authenticated user (valid for 7 days)
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware: Verify Bearer JWT and load user from database
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Авторизация қажет (Authentication token required)' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, error: 'Токен табылмады (Token missing)' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const db = getDb();
    const dbUser = db.prepare('SELECT id, uuid, email, full_name, role, grade, school, organization_id, streak_days FROM users WHERE id = ?').get(decoded.id) as DbUser | undefined;

    if (!dbUser) {
      res.status(401).json({ success: false, error: 'Пайдаланушы табылмады (User not found or session expired)' });
      return;
    }

    req.user = {
      id: dbUser.id,
      uuid: dbUser.uuid,
      email: dbUser.email,
      full_name: dbUser.full_name,
      role: dbUser.role,
      grade: dbUser.grade,
      school: dbUser.school,
      organization_id: dbUser.organization_id,
      streak_days: dbUser.streak_days || 0
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Жарамсыз немесе мерзімі өткен токен (Invalid or expired token)' });
  }
};

/**
 * Middleware: Enforce specific role access
 */
export const requireRole = (role: 'student' | 'teacher' | 'admin') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Авторизация қажет (Authentication required)' });
      return;
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: `Рұқсат шектелген: тек ${role} рөліне арналған (Forbidden: Requires ${role} role)` 
      });
      return;
    }

    next();
  };
};
