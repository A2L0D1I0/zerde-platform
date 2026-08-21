import { Router, Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Validation Schemas
const createCourseSchema = z.object({
  title: z.string().min(3, 'Курс атауы кемінде 3 таңбадан тұруы керек'),
  description: z.string().min(5, 'Курс сипаттамасы кемінде 5 таңбадан тұруы керек'),
  subject: z.string().min(2, 'Пән атауын көрсетіңіз'),
  grade: z.string().min(1, 'Сыныпты көрсетіңіз (мысалы, 9 «А»)'),
  language: z.enum(['kz', 'ru', 'en', 'all']).default('kz'),
  is_active: z.boolean().optional().default(true)
});

const createTopicSchema = z.object({
  title: z.string().min(3, 'Тақырып атауы кемінде 3 таңбадан тұруы керек'),
  order_index: z.number().int().min(1),
  description: z.string().optional(),
  quarter: z.number().int().min(1).max(4).optional().default(3),
  status_theory: z.enum(['locked', 'available', 'in_progress', 'completed']).optional().default('available'),
  status_practice: z.enum(['locked', 'available', 'in_progress', 'completed']).optional().default('available'),
  mastery_percentage: z.number().min(0).max(100).optional().default(0)
});

/**
 * GET /api/courses/by-code/:shortCode
 * Find course by short code (e.g. 7X9K2M)
 */
router.get('/by-code/:shortCode', (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const course = store.findCourseByShortCode(shortCode);
    if (!course) {
      throw new AppError('Бұл кодпен курс табылмады (Course not found with this code)', 404);
    }
    const topics = store.getCourseTopics(course.id);
    res.json({
      success: true,
      course,
      topics
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/invitations/my
 * Get current student's pending invitations
 */
router.get('/invitations/my', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }
    const invitations = store.getStudentInvitations(req.user.email);
    res.json({
      success: true,
      count: invitations.length,
      invitations
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/invitations/:id/accept
 * Accept an invitation and join the course group
 */
router.post('/invitations/:id/accept', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }
    const { id } = req.params;
    const enrollment = store.acceptCourseInvitation(id, req.user);
    if (!enrollment) {
      throw new AppError('Шақыру жарамсыз немесе қабылданып қойған', 400);
    }
    res.json({
      success: true,
      enrollment,
      message: 'Курс тобына сәтті қосылдыңыз! 🎉'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses
 * List all active courses (with optional filters)
 */
router.get('/', (req, res, next) => {
  try {
    const { subject, grade, search, language } = req.query;

    const courses = store.getAllCourses({
      subject: typeof subject === 'string' ? subject : undefined,
      grade: typeof grade === 'string' ? grade : undefined,
      search: typeof search === 'string' ? search : undefined,
      language: typeof language === 'string' ? language : undefined
    });

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id
 * Get single course by ID
 */
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const course = store.getCourseById(id);

    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const topics = store.getCourseTopics(id);

    res.json({
      success: true,
      course,
      topics
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/invite
 * Teacher invites student to course group by email
 */
router.post('/:id/invite', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { student_name, student_email } = req.body;
    if (!student_email || !student_name) {
      throw new AppError('Оқушының аты-жөні мен email поштасын енгізіңіз', 400);
    }

    const course = store.getCourseById(id);
    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const invitation = store.createCourseInvitation(id, req.user!.id, student_name, student_email);

    // Send in-app notification if student user exists
    const studentUser = store.findUserByEmail(student_email);
    if (studentUser) {
      store.addNotification(studentUser.id, {
        id: `notif_${Date.now()}`,
        user_id: studentUser.id,
        type: 'COURSE_ANNOUNCEMENT',
        title: 'Жаңа курсқа шақыру 🎓',
        message: `${req.user!.full_name} сізді «${course.title}» курсына қосылуға шақырды (Код: ${course.short_code})`,
        is_read: false,
        created_at: new Date().toISOString()
      });

    }

    res.status(201).json({
      success: true,
      invitation,
      message: `«${student_name}» (${student_email}) оқушысына шақыру сәтті жіберілді`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses
 * Create a new course (Teacher/Admin only)
 */
router.post('/', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }

    const validated = createCourseSchema.parse(req.body);

    const newCourse = store.createCourse({
      ...validated,
      teacher_id: req.user.id,
      teacher_name: req.user.full_name
    });

    res.status(201).json({
      success: true,
      course: newCourse,
      message: 'Жаңа курс сәтті құрылды'
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/courses/my-courses
 * Student gets their interacted courses (enrolled, pending, rejected)
 */
router.get('/my-courses', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }
    const myCourses = store.getStudentCourses(req.user.id);
    res.json({
      success: true,
      count: myCourses.length,
      courses: myCourses
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/teacher/applications
 * Teacher views all pending applications for their courses
 */
router.get('/teacher/applications', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }
    const requests = store.getTeacherEnrollmentRequests(req.user.id);
    res.json({
      success: true,
      count: requests.length,
      applications: requests
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/enroll
 * POST /api/courses/:id/apply
 * Student applies for course enrollment with Google Form style data -> status: pending_approval
 */
router.post(['/:id/enroll', '/:id/apply'], authenticate, requireRole('student'), (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }

    const { id: courseId } = req.params;
    const course = store.getCourseById(courseId);

    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    if (course.teacher_id === req.user.id) {
      throw new AppError('Мұғалім өзі жасаған курсына оқушы ретінде өтініш бере алмайды (Teacher cannot apply to own course)', 400);
    }

    const existingUser = store.findUserById(req.user.id);
    if (!existingUser) {
      throw new AppError('Оқушы табылмады', 404);
    }

    const applicationData = req.body?.application_data || {
      goal: req.body?.goal || 'ҰБТ / ЕНТ-ға дайындық',
      level: req.body?.level || 'Орташа',
      weekly_hours: req.body?.weekly_hours || '4-6 сағат',
      notes: req.body?.notes || '',
      agreed_to_rules: req.body?.agreed_to_rules ?? true
    };

    const enrollment = store.createEnrollment(courseId, existingUser, applicationData);

    res.status(201).json({
      success: true,
      enrollment,
      message: 'Өтінішіңіз мұғалімге сәтті жіберілді! 📋'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/cancel-application
 * Student cancels their pending application
 */
router.post('/:id/cancel-application', authenticate, requireRole('student'), (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }
    const { id: courseId } = req.params;
    const cancelled = store.cancelApplication(courseId, req.user.id);
    if (!cancelled) {
      throw new AppError('Қайтарып алатын белсенді өтініш табылмады', 400);
    }
    res.json({
      success: true,
      message: 'Курсқа берілген өтініш кері қайтарылды'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/courses/:id/dismiss
 * Student dismisses rejected course from their list
 */
router.delete('/:id/dismiss', authenticate, requireRole('student'), (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Авторизация қажет', 401);
    }
    const { id: courseId } = req.params;
    store.dismissRejectedCourse(courseId, req.user.id);
    res.json({
      success: true,
      message: 'Курс тізімнен өшірілді'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id/enrollments
 * Teacher views list of enrollment applications for course
 */
router.get('/:id/enrollments', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    const { id: courseId } = req.params;
    const course = store.getCourseById(courseId);

    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const enrollments = store.getEnrollmentsByCourse(courseId);

    res.json({
      success: true,
      course_id: courseId,
      course_title: course.title,
      total: enrollments.length,
      pending_count: enrollments.filter(e => e.status === 'pending_approval').length,
      enrolled_count: enrollments.filter(e => e.status === 'enrolled').length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/enrollments/:studentId/approve
 * Teacher approves enrollment application -> status: enrolled
 */
router.post('/:id/enrollments/:studentId/approve', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    const { id: courseId, studentId } = req.params;

    const course = store.getCourseById(courseId);
    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const student = store.findUserById(studentId);
    if (!student) {
      throw new AppError('Оқушы табылмады', 404);
    }

    const updated = store.updateEnrollmentStatus(courseId, studentId, 'enrolled');
    if (!updated) {
      throw new AppError('Өтініш табылмады', 404);
    }

    res.json({
      success: true,
      enrollment: updated,
      message: 'Оқушы курсқа сәтті қабылданды (enrolled)'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/enrollments/:studentId/reject
 * Teacher rejects enrollment application -> status: rejected + push notification
 */
router.post('/:id/enrollments/:studentId/reject', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    const { id: courseId, studentId } = req.params;
    const { reason } = req.body;

    const course = store.getCourseById(courseId);
    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const student = store.findUserById(studentId);
    if (!student) {
      throw new AppError('Оқушы табылмады', 404);
    }

    const updated = store.updateEnrollmentStatus(courseId, studentId, 'rejected', reason);
    if (!updated) {
      throw new AppError('Өтініш табылмады', 404);
    }

    res.json({
      success: true,
      enrollment: updated,
      message: 'Өтініш қабылданбады (rejected)'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/enrollments/:studentId/expel
 * Teacher expels student or finishes course for student
 */
router.post('/:id/enrollments/:studentId/expel', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    const { id: courseId, studentId } = req.params;

    const course = store.getCourseById(courseId);
    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const student = store.findUserById(studentId);
    if (!student) {
      throw new AppError('Оқушы табылмады', 404);
    }

    const updated = store.updateEnrollmentStatus(courseId, studentId, 'expelled');
    if (!updated) {
      throw new AppError('Өтініш табылмады', 404);
    }

    res.json({
      success: true,
      enrollment: updated,
      message: 'Оқушы курстан шығарылды (expelled)'
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/courses/:id/topics
 * Get topics of the course with two-factor status
 */
router.get('/:id/topics', (req, res, next) => {
  try {
    const { id: courseId } = req.params;

    const course = store.getCourseById(courseId);
    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const topics = store.getCourseTopics(courseId);

    res.json({
      success: true,
      course_id: courseId,
      course_title: course.title,
      count: topics.length,
      topics
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses/:id/topics
 * Add a topic to the course (Teacher/Admin)
 */
router.post('/:id/topics', authenticate, requireRole('teacher', 'admin'), (req: AuthRequest, res: Response, next) => {
  try {
    const { id: courseId } = req.params;

    const course = store.getCourseById(courseId);
    if (!course) {
      throw new AppError('Курс табылмады', 404);
    }

    const validated = createTopicSchema.parse(req.body);

    const newTopic = store.addTopic({
      ...validated,
      course_id: courseId
    });

    res.status(201).json({
      success: true,
      topic: newTopic,
      message: 'Жаңа тақырып курсқа қосылды'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
