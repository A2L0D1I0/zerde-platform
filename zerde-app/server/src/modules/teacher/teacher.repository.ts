import { getDb } from '../../db/database';
import { getRankByElo, SkillMeta, ClassMatrixStudent, SkillMastery } from '@zerde/shared';

export const SKILLS_HEADER: SkillMeta[] = [
  { code: 'ALG_09_INEQ', nameKZ: 'Квадраттық теңсіздіктер', nameRU: 'Квадратные неравенства', subject: 'Алгебра' },
  { code: 'ALG_09_INTERVAL_METHOD', nameKZ: 'Интервалдар әдісі', nameRU: 'Метод интервалов', subject: 'Алгебра' },
  { code: 'ALG_09_DENOMINATOR_RESTRICTION', nameKZ: 'Бөлім нөлдері (ОДЗ)', nameRU: 'ОДЗ нулей знаменателя', subject: 'Алгебра' },
  { code: 'ALG_09_FRACTIONAL', nameKZ: 'Бөлшек-рационал', nameRU: 'Дробно-рациональные', subject: 'Алгебра' },
  { code: 'ALG_09_LINEAR', nameKZ: 'Сызықтық теңсіздік', nameRU: 'Линейные неравенства', subject: 'Алгебра' },
  { code: 'ALG_09_VIETE_THEORM', nameKZ: 'Виет теоремасы', nameRU: 'Теорема Виета', subject: 'Алгебра' },
  { code: 'PHYS_09_NEWTON_SECOND', nameKZ: 'Ньютонның II заңы', nameRU: 'Закон Ньютона II', subject: 'Физика' },
  { code: 'PHYS_09_FRICTION_FORCE', nameKZ: 'Үйкеліс күші', nameRU: 'Сила трения', subject: 'Физика' },
];

export class TeacherRepository {
  public getClassrooms(teacherId?: number | string): any[] {
    const db = getDb();
    let query = `
      SELECT c.id, c.name, c.school, c.teacher_id, COUNT(cs.student_id) as student_count
      FROM classrooms c
      LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
    `;
    const params: any[] = [];

    if (teacherId) {
      query += ` WHERE c.teacher_id = ?`;
      params.push(teacherId);
    }

    query += ` GROUP BY c.id ORDER BY c.id ASC`;

    return db.prepare(query).all(...params) as any[];
  }

  /**
   * Returns honest 2D Matrix of students enrolled in the classroom (Zero Fake SQLite)
   */
  public getClassMatrix(classroomId: string = '1'): {
    skills_header: SkillMeta[];
    matrix: ClassMatrixStudent[];
    summary_stats: Record<string, { average_probability: number; deficit_count: number; mastery_count: number }>;
  } {
    const db = getDb();

    // Query real students enrolled in this classroom
    const students = db.prepare(`
      SELECT u.id, u.full_name, u.email, COALESCE(u.streak_days, 0) as streak_days
      FROM users u
      JOIN classroom_students cs ON u.id = cs.student_id
      WHERE cs.classroom_id = ?
      ORDER BY u.id ASC
    `).all(classroomId) as any[];

    const summary_stats: Record<string, { average_probability: number; deficit_count: number; mastery_count: number }> = {};
    SKILLS_HEADER.forEach((s) => {
      summary_stats[s.code] = { average_probability: 0, deficit_count: 0, mastery_count: 0 };
    });

    // If 0 students in classroom -> Honest Empty State
    if (students.length === 0) {
      return {
        skills_header: SKILLS_HEADER,
        matrix: [],
        summary_stats
      };
    }

    const matrix: ClassMatrixStudent[] = students.map((std, idx) => {
      // 1. Get student ELO and passports
      const passport = db.prepare(`
        SELECT subject_elo, rank_tier, skills_progress_json
        FROM student_course_passports
        WHERE student_id = ?
        ORDER BY updated_at DESC LIMIT 1
      `).get(std.id) as any;

      const studentElo = passport ? passport.subject_elo : 1000;
      let passportSkills: Record<string, any> = {};
      if (passport?.skills_progress_json) {
        try {
          passportSkills = JSON.parse(passport.skills_progress_json);
        } catch {
          passportSkills = {};
        }
      }

      // 2. Query student actual attempts from student_attempts
      const attemptsRows = db.prepare(`
        SELECT qb.skill_code,
               COUNT(*) as total_attempts,
               SUM(CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
        FROM student_attempts sa
        JOIN question_bank qb ON sa.question_id = qb.id
        WHERE sa.student_id = ?
        GROUP BY qb.skill_code
      `).all(std.id) as any[];

      const attemptsMap: Record<string, { total: number; correct: number }> = {};
      attemptsRows.forEach((row) => {
        attemptsMap[row.skill_code] = { total: row.total_attempts, correct: row.correct_count };
      });

      const skills: Record<string, SkillMastery> = {};

      SKILLS_HEADER.forEach((skill) => {
        const fromPassport = passportSkills[skill.code];
        const fromAttempts = attemptsMap[skill.code];

        let prob: number | null = null;
        let attemptsCount = 0;
        let lastCorrect = false;

        if (fromPassport && typeof fromPassport.mastery_percent === 'number') {
          prob = fromPassport.mastery_percent / 100;
          attemptsCount = fromPassport.total_attempts || 1;
          lastCorrect = fromPassport.correct_answers > 0;
        } else if (fromAttempts && fromAttempts.total > 0) {
          prob = Math.round((fromAttempts.correct / fromAttempts.total) * 100) / 100;
          attemptsCount = fromAttempts.total;
          lastCorrect = fromAttempts.correct > 0;
        }

        let status: 'mastered' | 'in_progress' | 'deficit' | 'no_data' = 'no_data';
        if (prob !== null) {
          if (prob >= 0.80) {
            status = 'mastered';
            summary_stats[skill.code].mastery_count++;
          } else if (prob >= 0.50) {
            status = 'in_progress';
          } else {
            status = 'deficit';
            summary_stats[skill.code].deficit_count++;
          }
          summary_stats[skill.code].average_probability += prob;
        }

        skills[skill.code] = {
          probability: prob !== null ? prob : 0,
          status: status === 'no_data' ? 'in_progress' : status,
          attemptsCount,
          lastAttemptCorrect: lastCorrect
        };
      });

      const rankInfo = getRankByElo(studentElo);

      return {
        student_id: std.id,
        student_name: std.full_name,
        email: std.email,
        current_elo: studentElo,
        rank: `${rankInfo.symbol} ${rankInfo.nameKZ}`,
        streak_days: std.streak_days || 0,
        skills
      };
    });

    // Finalize averages
    SKILLS_HEADER.forEach((s) => {
      summary_stats[s.code].average_probability =
        Math.round((summary_stats[s.code].average_probability / Math.max(1, matrix.length)) * 100) / 100;
    });

    return {
      skills_header: SKILLS_HEADER,
      matrix,
      summary_stats
    };
  }
}

export const teacherRepository = new TeacherRepository();
