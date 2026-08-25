import { getDb } from '../../db/database';
import { getRankByElo } from '../../shared';

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
    if (!identifier) return null;

    const db = getDb();
    let row: any = null;

    const query = `
      SELECT u.*, 
             COALESCE(
               (SELECT subject_elo FROM student_course_passports WHERE student_id = u.id ORDER BY updated_at DESC LIMIT 1),
               1000
             ) as elo
      FROM users u
      WHERE (u.id = ? OR u.uuid = ? OR u.email = ?)
    `;

    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      row = db.prepare(query).get(Number(identifier), String(identifier), String(identifier));
    } else {
      row = db.prepare(query).get(0, identifier, identifier);
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
      SELECT u.id, u.full_name as name, u.grade, u.school,
             COALESCE(
               (SELECT MAX(subject_elo) FROM student_course_passports WHERE student_id = u.id),
               1000
             ) as elo,
             u.streak_days as streak
      FROM users u
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

  public updateEloAndStreak(studentId: number, newElo: number, streakIncrement: boolean = false, courseId: number = 1): void {
    const db = getDb();
    const sid = Number(studentId);
    const cid = Number(courseId) || 1;
    const rankInfo = getRankByElo(newElo);
    const existing = db.prepare('SELECT id FROM student_course_passports WHERE student_id = ? AND course_id = ?').get(sid, cid) as any;

    if (existing) {
      db.prepare('UPDATE student_course_passports SET subject_elo = ?, rank_tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newElo, rankInfo.code, existing.id);
    } else {
      db.prepare('INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json) VALUES (?, ?, ?, ?, ?, ?)')
        .run(sid, cid, newElo, rankInfo.code, '{}', '[]');
    }

    if (streakIncrement) {
      db.prepare(`
        UPDATE users
        SET streak_days = streak_days + 1,
            longest_streak = MAX(longest_streak, streak_days + 1),
            last_active_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(sid);
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

  /**
   * Apply for course with motivation letter
   */
  public applyForCourse(studentId: number, courseId: number, motivationText: string): any {
    const db = getDb();
    const sid = Number(studentId);
    const cid = Number(courseId);

    // Check if course exists
    const course = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(cid) as any;
    if (!course) {
      throw new Error('COURSE_NOT_FOUND: Курс табылмады (Course not found)');
    }

    // Check if already applied or enrolled
    const existing = db.prepare('SELECT id, status FROM course_enrollments WHERE student_id = ? AND course_id = ?').get(sid, cid) as any;
    if (existing && (existing.status === 'applied' || existing.status === 'enrolled' || existing.status === 'pending_approval')) {
      throw new Error('DUPLICATE_APPLICATION: Бұл курсқа өтінім берілген (Already applied or enrolled in this course)');
    }

    if (existing) {
      db.prepare(`
        UPDATE course_enrollments
        SET status = 'applied', motivation_text = ?, requested_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(motivationText, existing.id);

      return db.prepare('SELECT * FROM course_enrollments WHERE id = ?').get(existing.id);
    } else {
      const info = db.prepare(`
        INSERT INTO course_enrollments (course_id, student_id, motivation_text, status, requested_at)
        VALUES (?, ?, ?, 'applied', CURRENT_TIMESTAMP)
      `).run(cid, sid, motivationText);

      return db.prepare('SELECT * FROM course_enrollments WHERE id = ?').get(Number(info.lastInsertRowid));
    }
  }
}

export const studentRepository = new StudentRepository();
