import { getDb } from '../../db/database';
import { getRankByElo, SkillMeta, ClassMatrixStudent, SkillMastery } from '../../shared';

export class TeacherRepository {
  /**
   * Dynamically loads skill headers for the course from question_bank and topics
   * Zero-Fake: returns empty array if no topics or questions are registered for this course
   */
  public getSkillsHeaderForCourse(courseId: number | string = 1): SkillMeta[] {
    const db = getDb();
    const cid = Number(courseId) || 1;
    const rows = db.prepare(`
      SELECT DISTINCT 
        qb.skill_code as code, 
        COALESCE(t.title, qb.skill_code) as nameKZ, 
        COALESCE(t.title, qb.skill_code) as nameRU, 
        COALESCE(c.title, 'Математика') as subject
      FROM question_bank qb
      LEFT JOIN topics t ON qb.topic_id = t.id
      LEFT JOIN courses c ON t.course_id = c.id
      WHERE t.course_id = ? OR c.id = ?
      ORDER BY qb.id ASC
    `).all(cid, cid) as any[];

    if (rows.length === 0) {
      // Return empty array for honest zero-fake
      return [];
    }

    return rows.map((r) => ({
      code: r.code,
      nameKZ: r.nameKZ,
      nameRU: r.nameRU,
      subject: r.subject
    }));
  }

  public getClassrooms(teacherId?: number | string): any[] {
    const db = getDb();
    let query = `
      SELECT c.id, c.name, c.school, c.teacher_id, COUNT(cs.student_id) as student_count
      FROM classrooms c
      LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
    `;
    const params: any[] = [];

    if (teacherId) {
      query += ` WHERE (c.teacher_id = ? OR c.school IN (SELECT school FROM users WHERE id = ?))`;
      params.push(teacherId, teacherId);
    }

    query += ` GROUP BY c.id ORDER BY c.id ASC`;

    return db.prepare(query).all(...params) as any[];
  }

  public createClassroom(params: { name: string; school: string; teacherId: number }): {
    id: number;
    name: string;
    school: string;
    teacher_id: number;
  } {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO classrooms (name, school, teacher_id)
      VALUES (?, ?, ?)
    `).run(params.name, params.school, params.teacherId);

    return {
      id: Number(result.lastInsertRowid),
      name: params.name,
      school: params.school,
      teacher_id: params.teacherId
    };
  }

  /**
   * Returns honest 2D Matrix of students enrolled in the classroom (Zero Fake SQLite)
   */
  public getClassMatrix(classroomId: string = '1', courseId: number | string = 1): {
    skills_header: SkillMeta[];
    matrix: ClassMatrixStudent[];
    summary_stats: Record<string, { average_probability: number; deficit_count: number; mastery_count: number }>;
  } {
    const db = getDb();
    const cid = Number(courseId) || 1;
    const skills_header = this.getSkillsHeaderForCourse(cid);

    // Query real students enrolled in this classroom
    const students = db.prepare(`
      SELECT u.id, u.full_name, u.email, COALESCE(u.streak_days, 0) as streak_days
      FROM users u
      JOIN classroom_students cs ON u.id = cs.student_id
      WHERE cs.classroom_id = ?
      ORDER BY u.id ASC
    `).all(classroomId) as any[];

    const summary_stats: Record<string, { average_probability: number; deficit_count: number; mastery_count: number }> = {};
    skills_header.forEach((s) => {
      summary_stats[s.code] = { average_probability: 0, deficit_count: 0, mastery_count: 0 };
    });

    // If 0 students in classroom or 0 skills -> Honest Empty State
    if (students.length === 0 || skills_header.length === 0) {
      return {
        skills_header,
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

      skills_header.forEach((skill) => {
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
    skills_header.forEach((s) => {
      summary_stats[s.code].average_probability =
        Math.round((summary_stats[s.code].average_probability / Math.max(1, matrix.length)) * 100) / 100;
    });

    return {
      skills_header,
      matrix,
      summary_stats
    };
  }

  /**
   * Fetch all 5 material slots for course/classroom
   */
  public getCourseSlots(courseId: number | string, classroomId?: number | string | null): any[] {
    const db = getDb();
    const cid = Number(courseId) || 1;
    const clsId = classroomId ? Number(classroomId) : null;

    if (clsId) {
      const slots = db.prepare(`
        SELECT id, course_id, classroom_id, slot_number, title, file_type, content_text, file_size, is_locked, uploaded_at
        FROM course_material_slots
        WHERE course_id = ? AND (classroom_id = ? OR classroom_id IS NULL)
        ORDER BY (CASE WHEN classroom_id = ? THEN 0 ELSE 1 END) ASC, slot_number ASC
      `).all(cid, clsId, clsId) as any[];

      const map = new Map<number, any>();
      for (const s of slots) {
        if (!map.has(s.slot_number)) {
          map.set(s.slot_number, s);
        }
      }
      return Array.from(map.values()).sort((a, b) => a.slot_number - b.slot_number);
    }

    return db.prepare(`
      SELECT id, course_id, classroom_id, slot_number, title, file_type, content_text, file_size, is_locked, uploaded_at
      FROM course_material_slots
      WHERE course_id = ? AND classroom_id IS NULL
      ORDER BY slot_number ASC
    `).all(cid) as any[];
  }

  /**
   * Upsert course material slot with is_locked verification
   */
  public upsertCourseSlot(slotData: {
    courseId: number;
    classroomId?: number | null;
    slotNumber: number;
    title: string;
    contentText: string;
    fileType?: string;
    fileSize?: number;
    isLocked?: number;
  }): any {
    const db = getDb();
    const {
      courseId,
      classroomId = null,
      slotNumber,
      title,
      contentText,
      fileType = 'text',
      fileSize = 0,
      isLocked = 0
    } = slotData;

    // Check if slot exists and is locked
    const existing = db.prepare(`
      SELECT id, is_locked FROM course_material_slots
      WHERE course_id = ? AND (classroom_id = ? OR (classroom_id IS NULL AND ? IS NULL)) AND slot_number = ?
    `).get(courseId, classroomId, classroomId, slotNumber) as any;

    if (existing && existing.is_locked === 1) {
      throw new Error('SLOT_LOCKED: Слот бұғатталған (Material slot is locked outside edit window)');
    }

    if (existing) {
      db.prepare(`
        UPDATE course_material_slots
        SET title = ?, content_text = ?, file_type = ?, file_size = ?, is_locked = ?, uploaded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, contentText, fileType, fileSize, isLocked, existing.id);

      return db.prepare('SELECT * FROM course_material_slots WHERE id = ?').get(existing.id);
    } else {
      const info = db.prepare(`
        INSERT INTO course_material_slots (
          course_id, classroom_id, slot_number, title, file_type, content_text, file_size, is_locked, uploaded_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(courseId, classroomId, slotNumber, title, fileType, contentText, fileSize, isLocked);

      return db.prepare('SELECT * FROM course_material_slots WHERE id = ?').get(Number(info.lastInsertRowid));
    }
  }

  /**
   * Save or update draft curriculum plan
   */
  public saveCurriculumPlan(planData: {
    courseId: number;
    classroomId?: number | null;
    quarter: number;
    markdownPlan: string;
    status?: 'DRAFT_QUESTIONNAIRE' | 'APPROVED' | 'ARCHIVED';
    version?: number;
  }): any {
    const db = getDb();
    const {
      courseId,
      classroomId = null,
      quarter,
      markdownPlan,
      status = 'DRAFT_QUESTIONNAIRE',
      version = 1
    } = planData;

    // Fetch target classroom id or pick default classroom
    let targetClsId = classroomId;
    if (!targetClsId) {
      const cls = db.prepare('SELECT id FROM classrooms WHERE teacher_id = (SELECT teacher_id FROM courses WHERE id = ?) LIMIT 1').get(courseId) as any;
      targetClsId = cls ? cls.id : 1;
    }

    const existing = db.prepare(`
      SELECT id, version FROM course_curriculum_plans
      WHERE course_id = ? AND classroom_id = ? AND quarter = ?
      ORDER BY version DESC LIMIT 1
    `).get(courseId, targetClsId, quarter) as any;

    const nextVersion = existing ? existing.version + 1 : version;

    const info = db.prepare(`
      INSERT INTO course_curriculum_plans (
        course_id, classroom_id, quarter, markdown_plan, status, version, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(courseId, targetClsId, quarter, markdownPlan, status, nextVersion);

    return db.prepare('SELECT * FROM course_curriculum_plans WHERE id = ?').get(Number(info.lastInsertRowid));
  }

  /**
   * Approve curriculum plan
   */
  public approveCurriculumPlan(planId: number, courseId?: number, classroomId?: number | null): any {
    const db = getDb();
    const tx = db.transaction(() => {
      const plan = db.prepare('SELECT * FROM course_curriculum_plans WHERE id = ?').get(planId) as any;
      if (!plan) {
        throw new Error('PLAN_NOT_FOUND: Оқу жоспары табылмады (Curriculum plan not found)');
      }

      // Archive previous versions
      db.prepare(`
        UPDATE course_curriculum_plans
        SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP
        WHERE course_id = ? AND classroom_id = ? AND quarter = ? AND id != ?
      `).run(plan.course_id, plan.classroom_id, plan.quarter, planId);

      // Approve current
      db.prepare(`
        UPDATE course_curriculum_plans
        SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(planId);

      return db.prepare('SELECT * FROM course_curriculum_plans WHERE id = ?').get(planId);
    });

    return tx();
  }

  /**
   * Get active curriculum plan
   */
  public getCurriculumPlan(courseId: number | string, classroomId?: number | string | null, quarter: number = 1): any {
    const db = getDb();
    const cid = Number(courseId) || 1;
    const q = Number(quarter) || 1;

    let query = `
      SELECT id, course_id, classroom_id, quarter, markdown_plan, status, version, created_at, updated_at
      FROM course_curriculum_plans
      WHERE course_id = ? AND quarter = ?
    `;
    const params: any[] = [cid, q];

    if (classroomId) {
      query += ` AND (classroom_id = ? OR classroom_id IS NULL)`;
      params.push(Number(classroomId));
    }

    query += ` ORDER BY CASE WHEN status = 'APPROVED' THEN 1 WHEN status = 'DRAFT_QUESTIONNAIRE' THEN 2 ELSE 3 END, version DESC LIMIT 1`;

    return db.prepare(query).get(...params) || null;
  }

  /**
   * Get student applications for course admission
   */
  public getCourseApplications(courseId: number | string): any[] {
    const db = getDb();
    const cid = Number(courseId) || 1;

    const rows = db.prepare(`
      SELECT 
        ce.id as application_id,
        ce.course_id,
        ce.student_id,
        ce.status,
        ce.motivation_text,
        ce.assigned_classroom_id,
        ce.rejection_reason,
        ce.requested_at,
        ce.approved_at,
        u.full_name as student_name,
        u.email as student_email,
        u.grade,
        u.school,
        COALESCE(u.streak_days, 0) as streak_days,
        COALESCE(scp.subject_elo, 1000) as subject_elo,
        COALESCE(scp.rank_tier, 'OSKIN') as rank_tier
      FROM course_enrollments ce
      JOIN users u ON ce.student_id = u.id
      LEFT JOIN student_course_passports scp ON ce.student_id = scp.student_id AND ce.course_id = scp.course_id
      WHERE ce.course_id = ?
      ORDER BY ce.requested_at DESC
    `).all(cid) as any[];

    return rows;
  }

  /**
   * Moderate student application (Approve or Reject)
   */
  public moderateApplication(params: {
    applicationId: number;
    action: 'approve' | 'reject';
    assignedClassroomId?: number | null;
    rejectionReason?: string;
  }): any {
    const { applicationId, action, assignedClassroomId = null, rejectionReason = '' } = params;
    const db = getDb();

    const tx = db.transaction(() => {
      const app = db.prepare('SELECT * FROM course_enrollments WHERE id = ?').get(applicationId) as any;
      if (!app) {
        throw new Error('APPLICATION_NOT_FOUND: Өтінім табылмады (Application not found)');
      }

      if (action === 'approve') {
        db.prepare(`
          UPDATE course_enrollments
          SET status = 'enrolled', assigned_classroom_id = ?, approved_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(assignedClassroomId, applicationId);

        // Add to classroom_students if group assigned
        if (assignedClassroomId) {
          db.prepare(`
            INSERT OR IGNORE INTO classroom_students (classroom_id, student_id)
            VALUES (?, ?)
          `).run(assignedClassroomId, app.student_id);
        }

        // Initialize passport if not exists
        db.prepare(`
          INSERT OR IGNORE INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json)
          VALUES (?, ?, 1000, 'OSKIN', '{}', '[]')
        `).run(app.student_id, app.course_id);

        return {
          application_id: applicationId,
          status: 'enrolled',
          assigned_classroom_id: assignedClassroomId,
          student_id: app.student_id,
          course_id: app.course_id
        };
      } else {
        db.prepare(`
          UPDATE course_enrollments
          SET status = 'rejected', rejection_reason = ?, approved_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(rejectionReason, applicationId);

        return {
          application_id: applicationId,
          status: 'rejected',
          rejection_reason: rejectionReason,
          student_id: app.student_id,
          course_id: app.course_id
        };
      }
    });

    return tx();
  }
}

export const teacherRepository = new TeacherRepository();
