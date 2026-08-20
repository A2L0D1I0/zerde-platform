import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../db/store';
import { SafeUser, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: SafeUser;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || 'zerde_secret_key_2026';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Авторизация қажет: Токен табылмады (Bearer token missing)'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Жарамсыз токен пішімі (Invalid token format)'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    let user = store.findUserById(decoded.userId);

    if (!user && decoded.email) {
      user = store.findUserByEmail(decoded.email);
    }

    if (!user) {
      try {
        const { getDb } = require('../db/database');
        const db = getDb();
        const dbUser = db.prepare('SELECT * FROM users WHERE id = ? OR uuid = ? OR email = ?').get(decoded.userId, decoded.userId, decoded.email || decoded.userId) as any;
        if (dbUser) {
          user = {
            id: String(dbUser.id),
            email: dbUser.email,
            password_hash: dbUser.password_hash,
            full_name: dbUser.full_name,
            role: dbUser.role as UserRole,
            grade: dbUser.grade ? `${dbUser.grade} сынып` : undefined,
            school: dbUser.school,
            language: 'kz',
            theme: 'dark',
            created_at: dbUser.created_at,
            updated_at: dbUser.updated_at
          };
        }
      } catch {}
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Пайдаланушы табылмады немесе сессия мерзімі аяқталды'
      });
      return;
    }

    req.user = store.toSafeUser(user);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Сессия мерзімі аяқталды (Token expired). Қайта кіріңіз.'
      });
      return;
    }
    res.status(401).json({
      success: false,
      error: 'Жарамсыз токен (Invalid or corrupted token)'
    });
    return;
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Авторизацияланбаған пайдаланушы'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Қолжетімділік шектелген. Рұқсат етілген рөлдер: [${allowedRoles.join(', ')}]. Сіздің рөліңіз: ${req.user.role}`
      });
      return;
    }

    next();
  };
};
