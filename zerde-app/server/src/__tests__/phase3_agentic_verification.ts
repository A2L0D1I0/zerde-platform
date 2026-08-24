import http from 'http';
import express from 'express';
import { seed } from '../db/seed';
import { getDb } from '../db/database';
import { generateToken } from '../middleware/auth.middleware';
import teacherRoutes from '../modules/teacher/teacher.routes';
import studentRoutes from '../modules/student/student.routes';

export async function runPhase3AgenticVerification() {
  console.log('\n======================================================');
  console.log('🧪 ЗАПУСК ВЕРИФИКАЦИИ ФАЗЫ 3 (EXPRESS API РОУТЫ)');
  console.log('======================================================\n');

  // 1. Reset and seed SQLite database
  seed();
  const db = getDb();

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

  // 2. Create Express App & HTTP Server
  const app = express();
  app.use(express.json());
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/student', studentRoutes);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  // Helper function for API requests
  async function apiRequest(method: string, path: string, token?: string, body?: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, body: data };
  }

  try {
    // 3. Create real test users
    const teacherUser = db.prepare(`
      INSERT INTO users (uuid, email, password_hash, full_name, role, school, organization_id)
      VALUES ('usr-teacher-01', 'teacher.marat@nis.edu.kz', 'hash123', 'Марат Мұғалім', 'teacher', 'NIS IB Astana', 1)
    `).run();
    const teacherId = Number(teacherUser.lastInsertRowid);

    const studentUser = db.prepare(`
      INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, organization_id, streak_days)
      VALUES ('usr-student-01', 'student.arman@nis.edu.kz', 'hash123', 'Арман Оқушы', 'student', 9, 'NIS IB Astana', 1, 5)
    `).run();
    const studentId = Number(studentUser.lastInsertRowid);

    // Create classroom
    const cls = db.prepare(`
      INSERT INTO classrooms (name, school, teacher_id)
      VALUES ('9 «А»', 'NIS IB Astana', ?)
    `).run(teacherId);
    const classroomId = Number(cls.lastInsertRowid);

    const teacherToken = generateToken({ id: teacherId, uuid: 'usr-teacher-01', email: 'teacher.marat@nis.edu.kz', role: 'teacher' });
    const studentToken = generateToken({ id: studentId, uuid: 'usr-student-01', email: 'student.arman@nis.edu.kz', role: 'student' });

    // ==========================================================================
    // 1. ТЕСТИРОВАНИЕ 5 СЛОТОВ МАТЕРИАЛОВ (TEACHER)
    // ==========================================================================
    console.log('\n--- 📂 1. ТЕСТИРОВАНИЕ СЛОТОВ МАТЕРИАЛОВ ---');

    // 1.1. Get existing slots
    const resGetSlots = await apiRequest('GET', '/api/teacher/courses/1/slots', teacherToken);
    assert(resGetSlots.status === 200 && resGetSlots.body.success === true, 'GET /api/teacher/courses/1/slots возвращает 200 OK');
    assert(Array.isArray(resGetSlots.body.data) && resGetSlots.body.data.length === 5, 'Возвращены все 5 слотов курса');

    // 1.2. Update slot 3
    const resUpdateSlot = await apiRequest('POST', '/api/teacher/courses/1/slots/3', teacherToken, {
      title: 'Жаңартылған 9-сынып Оқулығы 2-бөлім',
      content_text: 'Жаңа тарау: Теңсіздіктер жүйесі және графиктік тәсілдер.',
      file_type: 'docx',
      is_locked: 0
    });
    assert(resUpdateSlot.status === 200 && resUpdateSlot.body.data.title.includes('Жаңартылған'), 'POST /api/teacher/courses/1/slots/3 успешно обновляет слот');

    // 1.3. Test is_locked slot rejection (403 Forbidden)
    await apiRequest('POST', '/api/teacher/courses/1/slots/5', teacherToken, {
      title: 'Бұғатталған олимпиадалық слот',
      content_text: 'Контент',
      is_locked: 1
    });

    const resLockedEdit = await apiRequest('POST', '/api/teacher/courses/1/slots/5', teacherToken, {
      title: 'Рұқсатсыз өзгерту әрекеті',
      content_text: 'Жаңа контент'
    });
    assert(resLockedEdit.status === 403, 'POST на заблокированный слот возвращает 403 Forbidden (SLOT_LOCKED)');

    // ==========================================================================
    // 2. ТЕСТИРОВАНИЕ УЧЕБНЫХ ПЛАНОВ ЧЕТВЕРТИ (КТП)
    // ==========================================================================
    console.log('\n--- 📋 2. ТЕСТИРОВАНИЕ КТП (КУРРИКУЛУМ-ПЛАНОВ) ---');

    // 2.1. Save draft plan directly to db for approval test
    const planInfo = db.prepare(`
      INSERT INTO course_curriculum_plans (course_id, classroom_id, quarter, markdown_plan, status, version)
      VALUES (1, ?, 1, '# 1-тоқсан КТП: Алгебра 9', 'DRAFT_QUESTIONNAIRE', 1)
    `).run(classroomId);
    const planId = Number(planInfo.lastInsertRowid);

    // 2.2. Approve plan
    const resApprove = await apiRequest('POST', '/api/teacher/courses/1/plan/approve', teacherToken, {
      plan_id: planId,
      classroom_id: classroomId,
      quarter: 1
    });
    assert(resApprove.status === 200 && resApprove.body.data.status === 'APPROVED', 'POST /api/teacher/courses/1/plan/approve переводит план в статус APPROVED');

    // 2.3. Get active plan
    const resGetPlan = await apiRequest('GET', `/api/teacher/courses/1/plan?classroomId=${classroomId}&quarter=1`, teacherToken);
    assert(resGetPlan.status === 200 && resGetPlan.body.data.id === planId, 'GET /api/teacher/courses/1/plan возвращает утвержденный план');

    // ==========================================================================
    // 3. ТЕСТИРОВАНИЕ ВОРОНКИ ЗАЯВОК (ADMISSION PIPELINE)
    // ==========================================================================
    console.log('\n--- 🎓 3. ТЕСТИРОВАНИЕ ВОРОНКИ ЗАЯВОК И ЗАЧИСЛЕНИЯ ---');

    // 3.1. Student applies for course
    const resApply = await apiRequest('POST', '/api/student/courses/1/apply', studentToken, {
      motivation_text: 'Маған осы курс өте қатты қажет, олимпиадаға дайындалғым келеді!'
    });
    assert(resApply.status === 201 && resApply.body.data.status === 'applied', 'POST /api/student/courses/1/apply создает заявку со статусом applied');
    const appId = resApply.body.data.id;

    // 3.2. Duplicate apply check (400 Bad Request)
    const resDupApply = await apiRequest('POST', '/api/student/courses/1/apply', studentToken, {
      motivation_text: 'Екінші рет өтінім жіберу әрекеті'
    });
    assert(resDupApply.status === 400, 'Повторная подача заявки отклоняется с кодом 400');

    // 3.3. Teacher views applications
    const resGetApps = await apiRequest('GET', '/api/teacher/courses/1/applications', teacherToken);
    assert(resGetApps.status === 200 && resGetApps.body.data.length >= 1, 'GET /api/teacher/courses/1/applications возвращает заявки соискателей');
    assert(resGetApps.body.data[0].student_name === 'Арман Оқушы', 'Заявка содержит имя соискателя и мотивационное письмо');

    // 3.4. Teacher moderates and approves application
    const resModerate = await apiRequest('POST', `/api/teacher/courses/1/applications/${appId}/moderate`, teacherToken, {
      action: 'approve',
      assigned_classroom_id: classroomId
    });
    assert(resModerate.status === 200 && resModerate.body.data.status === 'enrolled', 'POST /api/teacher/.../moderate переводит заявку в status enrolled');

    // 3.5. Verify student joined classroom_students & student_course_passports initialized
    const clsStudent = db.prepare('SELECT * FROM classroom_students WHERE classroom_id = ? AND student_id = ?').get(classroomId, studentId);
    const passport = db.prepare('SELECT * FROM student_course_passports WHERE student_id = ? AND course_id = 1').get(studentId);
    assert(clsStudent !== undefined, 'Ученик успешно добавлен в таблицу classroom_students');
    assert(passport !== undefined && (passport as any).subject_elo === 1000, 'Сабпаспорт student_course_passports атомарно инициализирован с 1000 ELO');

    // ==========================================================================
    // 4. ТЕСТИРОВАНИЕ RBAC ЗАЩИТЫ
    // ==========================================================================
    console.log('\n--- 🛡️ 4. ТЕСТИРОВАНИЕ RBAC АВТОРИЗАЦИИ ---');

    // 4.1. Student tries to access teacher endpoint -> 403 Forbidden
    const resForbidden = await apiRequest('GET', '/api/teacher/courses/1/applications', studentToken);
    assert(resForbidden.status === 403, 'Ученик при вызове учительского роута получает 403 Forbidden');

    // 4.2. Unauthenticated request -> 401 Unauthorized
    const resUnauthorized = await apiRequest('GET', '/api/teacher/courses/1/applications');
    assert(resUnauthorized.status === 401, 'Запрос без токена отклоняется с кодом 401 Unauthorized');

  } finally {
    server.close();
  }

  // ==========================================================================
  // ИТОГ ВЕРИФИКАЦИИ
  // ==========================================================================
  console.log('\n======================================================');
  console.log(`🎉 ИТОГ ВЕРИФИКАЦИИ ФАЗЫ 3: ${passed} пройдено, ${failed} провалено`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase3AgenticVerification();
}
