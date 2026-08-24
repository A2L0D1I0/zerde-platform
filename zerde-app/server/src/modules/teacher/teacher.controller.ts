import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getDb } from '../../db/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { copilotService } from '../../ai/copilot.service';
import { CoPilotQuestionItemSchema } from '../../ai/schemas';
import { teacherRepository } from './teacher.repository';

const generateQuizRequestSchema = z.object({
  topic_title: z.string().min(2, 'Тақырып атауын енгізіңіз (Topic title is required)'),
  grade_level: z.number().int().min(1).max(12).optional().default(9),
  count: z.number().int().min(1).max(5).optional().default(3),
  focus: z.string().optional().default(''),
  language: z.enum(['KZ', 'RU', 'EN']).optional().default('KZ')
});

const batchSaveQuestionsSchema = z.object({
  questions: z.array(CoPilotQuestionItemSchema).min(1, 'At least 1 question is required')
});

const noteCreateSchema = z.object({
  note: z.string().min(1, 'Жазба мәтінін енгізіңіз (Note text is required)'),
  date: z.string().optional()
});

export class TeacherController {
  /**
   * POST /api/teacher/copilot/generate-quiz
   * Single-turn AI generation of quiz questions with Zod validation
   */
  public async generateQuiz(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = generateQuizRequestSchema.parse(req.body);
      const result = await copilotService.generateQuiz(params);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/teacher/courses/:courseId/topics/:topicId/questions/batch
   * Batch inserts approved questions into question_bank
   */
  public batchSaveQuestions(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.courseId, 10);
      const topicId = parseInt(req.params.topicId, 10);
      const { questions } = batchSaveQuestionsSchema.parse(req.body);

      const db = getDb();

      // Check if topic exists
      const topic = db.prepare('SELECT id, course_id FROM topics WHERE id = ?').get(topicId) as any;
      if (!topic) {
        res.status(404).json({ success: false, error: 'Тақырып табылмады (Topic not found)' });
        return;
      }

      const insertQuestion = db.prepare(`
        INSERT INTO question_bank (
          topic_id, mode, question_kz, question_ru, question_en,
          katex_snippet, options_json, correct_answer,
          explanation_kz, explanation_ru, explanation_en,
          difficulty, skill_code, created_at
        )
        VALUES (?, 'A', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      // SQLite transaction for batch insert
      const insertTransaction = db.transaction((items: typeof questions) => {
        let count = 0;
        for (const q of items) {
          const optionsJson = JSON.stringify(q.options);
          insertQuestion.run(
            topicId,
            q.question_text, // kz
            q.question_text, // ru fallback
            q.question_text, // en fallback
            q.katex_snippet || '',
            optionsJson,
            q.correct_answer,
            q.explanation,
            q.explanation,
            q.explanation,
            q.difficulty || 2,
            q.skill_code || 'GENERAL'
          );
          count++;
        }
        return count;
      });

      const insertedCount = insertTransaction(questions);

      // Audit Log
      db.prepare(`
        INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
        VALUES (?, 'teacher', ?, 'COPILOT_GENERATION', ?)
      `).run(
        req.user?.id || null,
        courseId,
        JSON.stringify({ topic_id: topicId, questions_count: insertedCount })
      );

      res.status(201).json({
        success: true,
        message: `${insertedCount} сұрақ сәтті сақталды (Questions saved successfully)`,
        count: insertedCount
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/teacher/classrooms/:classroomId/ai-insights
   * Aggregates real error statistics via SQL GROUP BY and generates an AI insight card
   */
  public async getClassAiInsights(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const classroomId = parseInt(req.params.classroomId, 10);
      const language = (req.query.language as 'KZ' | 'RU' | 'EN') || 'KZ';
      const db = getDb();

      // Check classroom
      const classroom = db.prepare('SELECT id, name, school FROM classrooms WHERE id = ?').get(classroomId) as any;
      const classroomName = classroom ? classroom.name : `Сынып #${classroomId}`;

      // Count students in class
      const studentCountRow = db.prepare('SELECT COUNT(*) as count FROM classroom_students WHERE classroom_id = ?').get(classroomId) as any;
      const totalStudents = studentCountRow?.count || 0;

      // Real SQL GROUP BY query for errors
      const topDeficits = db.prepare(`
        SELECT qb.skill_code, COUNT(*) as error_count
        FROM student_attempts sa
        JOIN question_bank qb ON sa.question_id = qb.id
        JOIN classroom_students cs ON sa.student_id = cs.student_id
        WHERE cs.classroom_id = ? AND sa.is_correct = 0
        GROUP BY qb.skill_code
        ORDER BY error_count DESC
        LIMIT 3
      `).all(classroomId) as { skill_code: string; error_count: number }[];

      const topDeficit = topDeficits.length > 0 ? topDeficits[0] : null;

      const insightResult = await copilotService.generateClassInsight({
        classroomName,
        topDeficit,
        totalStudents,
        language
      });

      res.json({
        success: true,
        data: {
          classroom_id: classroomId,
          classroom_name: classroomName,
          total_students: totalStudents,
          top_deficits: topDeficits,
          ...insightResult
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher/courses/:courseId/students/:studentId/notes
   * Retrieves notes for student from isolated passport
   */
  public getStudentNotes(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.courseId, 10);
      const studentId = parseInt(req.params.studentId, 10);
      const db = getDb();

      const passport = db.prepare(`
        SELECT teacher_daily_notes_json FROM student_course_passports
        WHERE student_id = ? AND course_id = ?
      `).get(studentId, courseId) as any;

      const notes = passport?.teacher_daily_notes_json ? JSON.parse(passport.teacher_daily_notes_json) : [];

      res.json({
        success: true,
        data: notes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/teacher/courses/:courseId/students/:studentId/notes
   * Pure CRUD: Saves teacher text note directly to SQLite WITHOUT any AI/NLP
   */
  public addStudentNote(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.courseId, 10);
      const studentId = parseInt(req.params.studentId, 10);
      const { note, date } = noteCreateSchema.parse(req.body);
      const db = getDb();

      const noteDate = date || new Date().toISOString().split('T')[0];
      const newNoteItem = {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: noteDate,
        note: note.trim()
      };

      // Check if passport exists; if not, create initial passport
      const existing = db.prepare(`
        SELECT id, teacher_daily_notes_json FROM student_course_passports
        WHERE student_id = ? AND course_id = ?
      `).get(studentId, courseId) as any;

      if (!existing) {
        const initialNotes = JSON.stringify([newNoteItem]);
        db.prepare(`
          INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json)
          VALUES (?, ?, 1000, 'OSKIN', '{}', ?)
        `).run(studentId, courseId, initialNotes);
      } else {
        const currentNotes = existing.teacher_daily_notes_json ? JSON.parse(existing.teacher_daily_notes_json) : [];
        currentNotes.unshift(newNoteItem);
        db.prepare(`
          UPDATE student_course_passports
          SET teacher_daily_notes_json = ?, updated_at = CURRENT_TIMESTAMP
          WHERE student_id = ? AND course_id = ?
        `).run(JSON.stringify(currentNotes), studentId, courseId);
      }

      // Log NOTE_ADDED in system_audit_logs
      db.prepare(`
        INSERT INTO system_audit_logs (actor_user_id, actor_role, target_user_id, course_id, event_type, payload_json)
        VALUES (?, 'teacher', ?, ?, 'NOTE_ADDED', ?)
      `).run(
        req.user?.id || null,
        studentId,
        courseId,
        JSON.stringify({ note: newNoteItem.note, date: noteDate })
      );

      res.status(201).json({
        success: true,
        message: 'Жазба сәтті қосылды (Note added successfully)',
        data: newNoteItem
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/teacher/courses/:courseId/students/:studentId/notes/:noteId
   * Pure CRUD: Deletes note by ID
   */
  public deleteStudentNote(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.courseId, 10);
      const studentId = parseInt(req.params.studentId, 10);
      const noteId = req.params.noteId;
      const db = getDb();

      const existing = db.prepare(`
        SELECT teacher_daily_notes_json FROM student_course_passports
        WHERE student_id = ? AND course_id = ?
      `).get(studentId, courseId) as any;

      if (!existing || !existing.teacher_daily_notes_json) {
        res.status(404).json({ success: false, error: 'Жазба табылмады (Note not found)' });
        return;
      }

      const notes = JSON.parse(existing.teacher_daily_notes_json);
      const filtered = notes.filter((n: any) => n.id !== noteId);

      db.prepare(`
        UPDATE student_course_passports
        SET teacher_daily_notes_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ? AND course_id = ?
      `).run(JSON.stringify(filtered), studentId, courseId);

      res.json({
        success: true,
        message: 'Жазба жойылды (Note deleted successfully)'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher/courses/:id/slots
   */
  public getCourseSlots(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.id, 10);
      const classroomId = req.query.classroomId ? parseInt(req.query.classroomId as string, 10) : undefined;
      const slots = teacherRepository.getCourseSlots(courseId, classroomId);

      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/teacher/courses/:id/slots/:slotNumber
   */
  public upsertCourseSlot(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.id, 10);
      const slotNumber = parseInt(req.params.slotNumber, 10);
      const { title, content_text, file_type, file_size, is_locked, classroom_id } = req.body;

      if (!title || typeof content_text !== 'string') {
        res.status(400).json({ success: false, error: 'Тақырып және мәтін міндетті (Title and content are required)' });
        return;
      }

      if (slotNumber < 1 || slotNumber > 5) {
        res.status(400).json({ success: false, error: 'Слот нөмірі 1 мен 5 арасында болуы тиіс (Slot number must be between 1 and 5)' });
        return;
      }

      const slot = teacherRepository.upsertCourseSlot({
        courseId,
        classroomId: classroom_id ? parseInt(classroom_id, 10) : null,
        slotNumber,
        title,
        contentText: content_text,
        fileType: file_type || 'text',
        fileSize: file_size || content_text.length,
        isLocked: is_locked ? 1 : 0
      });

      // Audit Log
      const db = getDb();
      db.prepare(`
        INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
        VALUES (?, 'teacher', ?, 'SLOT_UPLOADED', ?)
      `).run(
        req.user?.id || null,
        courseId,
        JSON.stringify({ slot_number: slotNumber, title })
      );

      res.json({
        success: true,
        message: `Слот ${slotNumber} сәтті сақталды (Slot saved successfully)`,
        data: slot
      });
    } catch (error: any) {
      if (error.message && error.message.includes('SLOT_LOCKED')) {
        res.status(403).json({ success: false, error: 'Слот оқу кезеңінде бұғатталған (Slot is locked outside edit window)' });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/teacher/courses/:id/plan/generate
   */
  public async generateCurriculumPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = parseInt(req.params.id, 10);
      const { classroom_id, quarter = 1, language = 'KZ' } = req.body;

      const planResult = await copilotService.generateCurriculumPlan({
        courseId,
        classroomId: classroom_id ? parseInt(classroom_id, 10) : undefined,
        quarter: Number(quarter) || 1,
        language
      });

      const savedPlan = teacherRepository.saveCurriculumPlan({
        courseId,
        classroomId: classroom_id ? parseInt(classroom_id, 10) : null,
        quarter: Number(quarter) || 1,
        markdownPlan: planResult.markdown_plan,
        status: 'DRAFT_QUESTIONNAIRE',
        version: planResult.version
      });

      // Audit Log
      const db = getDb();
      db.prepare(`
        INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
        VALUES (?, 'teacher', ?, 'COPILOT_GENERATION', ?)
      `).run(
        req.user?.id || null,
        courseId,
        JSON.stringify({ quarter, slots_used: planResult.slots_used_count })
      );

      res.json({
        success: true,
        message: 'Оқу жоспары (КТП) сәтті жасалды (Curriculum plan generated)',
        data: savedPlan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/teacher/courses/:id/plan/approve
   */
  public approveCurriculumPlan(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.id, 10);
      const { plan_id, classroom_id } = req.body;

      if (!plan_id) {
        res.status(400).json({ success: false, error: 'plan_id міндетті (plan_id is required)' });
        return;
      }

      const approved = teacherRepository.approveCurriculumPlan(
        Number(plan_id),
        courseId,
        classroom_id ? Number(classroom_id) : null
      );

      res.json({
        success: true,
        message: 'Оқу жоспары ресми бекітілді (Curriculum plan approved)',
        data: approved
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher/courses/:id/plan
   */
  public getCurriculumPlan(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.id, 10);
      const classroomId = req.query.classroomId ? parseInt(req.query.classroomId as string, 10) : undefined;
      const quarter = req.query.quarter ? parseInt(req.query.quarter as string, 10) : 1;

      const plan = teacherRepository.getCurriculumPlan(courseId, classroomId, quarter);

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher/courses/:id/applications
   */
  public getCourseApplications(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const courseId = parseInt(req.params.id, 10);
      const applications = teacherRepository.getCourseApplications(courseId);

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/teacher/courses/:id/applications/:appId/moderate
   */
  public moderateApplication(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const appId = parseInt(req.params.appId, 10);
      const { action, assigned_classroom_id, rejection_reason } = req.body;

      if (!action || (action !== 'approve' && action !== 'reject')) {
        res.status(400).json({ success: false, error: 'action "approve" немесе "reject" болуы керек' });
        return;
      }

      const result = teacherRepository.moderateApplication({
        applicationId: appId,
        action,
        assignedClassroomId: assigned_classroom_id ? Number(assigned_classroom_id) : null,
        rejectionReason: rejection_reason || ''
      });

      // Audit Log
      const db = getDb();
      db.prepare(`
        INSERT INTO system_audit_logs (actor_user_id, actor_role, target_user_id, course_id, event_type, payload_json)
        VALUES (?, 'teacher', ?, ?, 'ENROLLMENT_CHANGE', ?)
      `).run(
        req.user?.id || null,
        result.student_id,
        result.course_id,
        JSON.stringify({ action, assigned_classroom_id, status: result.status })
      );

      res.json({
        success: true,
        message: action === 'approve' ? 'Өтінім қабылданды (Application approved)' : 'Өтінім қабылданбады (Application rejected)',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const teacherController = new TeacherController();
