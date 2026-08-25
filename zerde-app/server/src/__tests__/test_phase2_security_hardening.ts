import http from 'http';
import express from 'express';
import { seed } from '../db/seed';
import { getDb } from '../db/database';
import authRoutes from '../routes/auth.routes';
import teacherRoutes from '../modules/teacher/teacher.routes';
import studentRoutes from '../modules/student/student.routes';
import tutorRoutes from '../modules/tutor/tutor.routes';
import courseRoutes from '../modules/courses/course.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import calendarRoutes from '../modules/calendar/calendar.routes';

async function runSecurityHardeningTests() {
  console.log('\n========================================================================');
  console.log('🛡️ ЗАПУСК ВЕРИФИКАЦИИ УСТРАНЕНИЯ 7 УЯЗВИМОСТЕЙ БЕЗОПАСНОСТИ (ЭТАП 2)');
  console.log('========================================================================\n');

  // Reset and seed database
  seed();
  const db = getDb();

  // Create Express app
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/tutor', tutorRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/calendar', calendarRoutes);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function apiRequest(method: string, path: string, token?: string, body?: any): Promise<{ status: number; body: any }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data: any = null;
    try {
      data = await response.json();
    } catch (e) {
      // not json
    }
    return { status: response.status, body: data };
  }

  let passed = 0;
  let failed = 0;
  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Setup NIS Teacher, BIL Teacher, NIS Student
    const resNisTeacher = await apiRequest('POST', '/api/auth/register', undefined, {
      email: 'teacher_nis_test@zerde.kz',
      password: 'Password123!',
      full_name: 'NIS Мұғалімі',
      schoolToken: 'NIS-TEACHER-2026',
      role: 'teacher',
    });
    const nisTeacherToken = resNisTeacher.body?.token;

    const resBilTeacher = await apiRequest('POST', '/api/auth/register', undefined, {
      email: 'teacher_bil_test@zerde.kz',
      password: 'Password123!',
      full_name: 'BIL Мұғалімі',
      schoolToken: 'BIL-TEACHER-2026',
      role: 'teacher',
    });
    const bilTeacherToken = resBilTeacher.body?.token;

    const resStudent = await apiRequest('POST', '/api/auth/register', undefined, {
      email: 'student_test@zerde.kz',
      password: 'Password123!',
      full_name: 'Сынақ Оқушысы',
      schoolToken: 'NIS-STUDENT-2026',
      role: 'student',
    });
    const studentToken = resStudent.body?.token;
    const studentId = resStudent.body?.user?.id;

    // Create classroom in NIS
    const resClass = await apiRequest('POST', '/api/teacher/classrooms', nisTeacherToken, {
      name: '9 «А»',
    });
    const nisClassId = resClass.body?.data?.id;

    console.log('--- 🛡️ ТЕСТ 1: Изоляция школ (Multi-Tenancy Protection) ---');
    // BIL teacher tries to view NIS class matrix
    const resCrossMatrix = await apiRequest('GET', `/api/teacher/class-matrix?classroomId=${nisClassId}`, bilTeacherToken);
    assert(resCrossMatrix.status === 403, 'Межшкольный доступ к матрице отклонен с кодом 403 Forbidden');

    // NIS teacher has access to own class
    const resOwnMatrix = await apiRequest('GET', `/api/teacher/class-matrix?classroomId=${nisClassId}`, nisTeacherToken);
    assert(resOwnMatrix.status === 200, 'Учитель NIS успешно видит свой класс (200 OK)');

    console.log('\n--- 🛡️ ТЕСТ 2: Защита от накрутки ELO (Anti-Race / 20 Parallel Requests) ---');
    // Ensure passport exists
    db.prepare(`
      INSERT OR IGNORE INTO student_course_passports (student_id, course_id, subject_elo, rank_tier)
      VALUES (?, 1, 1000, 'OSKIN')
    `).run(studentId);

    const passportBefore = db.prepare('SELECT subject_elo FROM student_course_passports WHERE student_id = ? AND course_id = 1').get(studentId) as any;
    const initialElo = passportBefore.subject_elo;

    // Send 20 concurrent Socrates requests with isEurekaChoice: true
    const parallelPromises = Array.from({ length: 20 }, () =>
      apiRequest('POST', '/api/tutor/socrates', studentToken, {
        topicTitle: 'Квадраттық теңсіздіктер',
        currentElo: initialElo,
        isSecondMistake: false,
        selectedForkKey: 'A',
        isEurekaChoice: true,
      })
    );

    await Promise.all(parallelPromises);
    const updatedPassport = db.prepare('SELECT subject_elo FROM student_course_passports WHERE student_id = ? AND course_id = 1').get(studentId) as any;
    const eloGain = updatedPassport.subject_elo - initialElo;

    assert(eloGain === 15, `20 параллельных вызовов Сократа начислили ELO ровно 1 раз (+15), фактический прирост: +${eloGain}`);

    console.log('\n--- 🛡️ ТЕСТ 3: RBAC Авторизация на добавление тем (POST /topics) ---');
    // Student tries to add a topic to course 1
    const resStudentTopic = await apiRequest('POST', '/api/courses/1/topics', studentToken, {
      title: 'Hacked Topic by Student',
    });
    assert(resStudentTopic.status === 403, 'Ученику запрещено создавать темы курса (403 Forbidden)');

    // Teacher is allowed to add topic
    const resTeacherTopic = await apiRequest('POST', '/api/courses/1/topics', nisTeacherToken, {
      title: 'Легитимная тема учителя',
    });
    assert(resTeacherTopic.status === 200, 'Учитель успешно создал тему курса (200 OK)');

    console.log('\n--- 🛡️ ТЕСТ 4: Zod-предвалидация четверти (Quarter 1..4 Validation) ---');
    const resInvalidQuarter = await apiRequest('POST', '/api/teacher/courses/1/plan/generate', nisTeacherToken, {
      quarter: 5,
      language: 'KZ',
    });
    assert(resInvalidQuarter.status === 400, 'Запрос генерации плана для 5-й четверти отклонен с 400 Bad Request без вызова LLM');

    console.log('\n--- 🛡️ ТЕСТ 5: Защита от сдачи задач без зачисления на курс ---');
    // Register another student who is NOT enrolled
    const resUnenrolledStudent = await apiRequest('POST', '/api/auth/register', undefined, {
      email: 'unenrolled@zerde.kz',
      password: 'Password123!',
      full_name: 'Незачисленный ученик',
      schoolToken: 'NIS-STUDENT-2026',
      role: 'student',
    });
    const unenrolledToken = resUnenrolledStudent.body?.token;

    const resGradeUnenrolled = await apiRequest('POST', '/api/student/tasks/grade-type-b', unenrolledToken, {
      question_id: 1,
      student_response: 'x in (2, 3)',
      language: 'KZ',
    });
    assert(resGradeUnenrolled.status === 403, 'Сдача задач без зачисления на курс заблокирована (403 Forbidden)');

    console.log('\n--- 🛡️ ТЕСТ 6: Санитизация контента слотов от XSS ---');
    const resSlotXss = await apiRequest('POST', '/api/teacher/courses/1/slots/1', nisTeacherToken, {
      title: 'XSS Test Slot',
      content_text: 'Hello World <script>alert("hacked")</script> Safe Content',
      file_type: 'text',
    });
    assert(resSlotXss.status === 200, 'Слот сохранен (200 OK)');
    const savedSlot = db.prepare('SELECT content_text FROM course_material_slots WHERE course_id = 1 AND slot_number = 1').get() as any;
    assert(!savedSlot.content_text.includes('<script>'), 'Скрипты вырезаны из контента слота (XSS Sanitized)');

    console.log('\n--- 🛡️ ТЕСТ 7: Защита от сбоев в legacy эндпоинтах (/notifications & /calendar) ---');
    const resNotifs = await apiRequest('GET', '/api/notifications', studentToken);
    assert(resNotifs.status === 200, 'GET /api/notifications вернул 200 OK');

    const resCalendar = await apiRequest('GET', '/api/calendar', studentToken);
    assert(resCalendar.status === 200, 'GET /api/calendar вернул 200 OK');

    console.log('\n========================================================================');
    console.log(`🎉 ИТОГ ТЕСТИРОВАНИЯ ЭТАПА 2: ${passed} тестов пройдено, ${failed} провалено`);
    console.log('========================================================================\n');
  } finally {
    server.close();
  }
}

runSecurityHardeningTests().catch((err) => {
  console.error('❌ Ошибка тестирования:', err);
  process.exit(1);
});
