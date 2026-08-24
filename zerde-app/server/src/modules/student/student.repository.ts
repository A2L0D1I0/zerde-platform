import { getDb } from '../../db/database';
import { getRankByElo } from '@zerde/shared';

export interface DbStudent {
  id: number;
  uuid: string;
  email: string;
  full_name: string;
  role: string;
  grade: string;
  school: string;
  elo: number;
  streak_days: number;
  longest_streak: number;
  parent_contact?: string;
}

export class StudentRepository {
  public findByIdOrEmail(identifier?: string | number): DbStudent | null {
    const db = getDb();
    let row: any = null;

    const query = `
      SELECT u.*, COALESCE(se.current_elo, 1000) as elo
      FROM users u
      LEFT JOIN student_elo se ON u.id = se.student_id
      WHERE (u.id = ? OR u.uuid = ? OR u.email = ?)
    `;

    if (identifier) {
      if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
        row = db.prepare(query).get(Number(identifier), String(identifier), String(identifier));
      } else {
        row = db.prepare(query).get(0, identifier, identifier);
      }
    }

    if (!row && !identifier) {
      // Default to first student in db only if no identifier was specified at all
      row = db.prepare(`
        SELECT u.*, COALESCE(se.current_elo, 1000) as elo
        FROM users u
        LEFT JOIN student_elo se ON u.id = se.student_id
        WHERE u.role = 'student'
        ORDER BY u.id ASC LIMIT 1
      `).get();
    }

    if (!row) return null;

    return {
      id: row.id,
      uuid: row.uuid,
      email: row.email,
      full_name: row.full_name || '',
      role: row.role || 'student',
      grade: row.grade || '',
      school: row.school || '',
      elo: row.elo || 1000,
      streak_days: row.streak_days || 0,
      longest_streak: Math.max(row.streak_days || 0, row.longest_streak || 0),
      parent_contact: row.parent_contact,
    };
  }

  public getLeaderboard(): Array<{ id: number; name: string; grade: string; school: string; elo: number; streak: number; rankCode: string; rank: number }> {
    const db = getDb();
    const rows = db.prepare(`
      SELECT u.id, u.full_name as name, u.grade, u.school, COALESCE(se.current_elo, 1000) as elo, u.streak_days as streak
      FROM users u
      LEFT JOIN student_elo se ON u.id = se.student_id
      WHERE u.role = 'student'
      ORDER BY elo DESC LIMIT 25
    `).all() as any[];

    return rows.map((r, idx) => ({
      id: r.id,
      name: r.name || 'Оқушы',
      grade: r.grade || '',
      school: r.school || '',
      elo: r.elo,
      streak: r.streak || 0,
      rankCode: getRankByElo(r.elo).code,
      rank: idx + 1,
    }));
  }

  public updateEloAndStreak(studentId: number, newElo: number, streakIncrement: boolean = false): void {
    const db = getDb();
    const rankInfo = getRankByElo(newElo);
    const existing = db.prepare('SELECT id FROM student_elo WHERE student_id = ?').get(studentId) as any;

    if (existing) {
      db.prepare('UPDATE student_elo SET current_elo = ?, rank = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?')
        .run(newElo, rankInfo.code, studentId);
    } else {
      db.prepare('INSERT INTO student_elo (student_id, course_id, current_elo, rank) VALUES (?, 1, ?, ?)')
        .run(studentId, newElo, rankInfo.code);
    }

    if (streakIncrement) {
      db.prepare(`
        UPDATE users
        SET streak_days = streak_days + 1,
            longest_streak = MAX(longest_streak, streak_days + 1),
            last_active_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(studentId);
    }
  }

  public recordTelemetry(studentId: number, taskId: string | number, isCorrect: boolean, timeSpentSeconds: number = 30): void {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    try {
      const existing = db.prepare('SELECT id, activity_count FROM student_heatmap WHERE student_id = ? AND date = ?').get(studentId, today) as any;
      if (existing) {
        const count = existing.activity_count + 1;
        const level = count > 10 ? 4 : count > 5 ? 3 : count > 2 ? 2 : 1;
        db.prepare('UPDATE student_heatmap SET activity_count = ?, level = ? WHERE id = ?').run(count, level, existing.id);
      } else {
        db.prepare('INSERT INTO student_heatmap (student_id, date, activity_count, level) VALUES (?, ?, 1, 1)').run(studentId, today);
      }
    } catch (e) {
      // ignore
    }
  }
}

export const studentRepository = new StudentRepository();
