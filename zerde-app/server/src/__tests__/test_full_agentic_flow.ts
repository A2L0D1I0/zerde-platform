import http from 'http';
import express from 'express';
import { seed } from '../db/seed';
import { getDb } from '../db/database';
import authRoutes from '../routes/auth.routes';
import teacherRoutes from '../modules/teacher/teacher.routes';
import studentRoutes from '../modules/student/student.routes';
import tutorRoutes from '../modules/tutor/tutor.routes';

export async function runFullAgenticFlowTest() {
  console.log('\n========================================================================');
  console.log('🏆 ЗАПУСК СКВОЗНОГО E2E ТЕСТА МУЛЬТИАГЕНТНОГО ЦИКЛА (ФАЗА 6)');
  console.log('========================================================================\n');

  // 1. Reset and seed SQLite database
  seed();
  const db = getDb();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` — (${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — (${detail})` : ''}`);
      failed++;
    }
  }

  // 2. Create Express App & Native HTTP Server
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/tutor', tutorRoutes);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

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
    // ========================================================================
    // ШАГ 1: АВТОРИЗАЦИЯ УЧИТЕЛЯ И УЧЕНИКА
    // ========================================================================
    console.log('\n--- 🔑 ШАГ 1: Авторизация по школьным токенам NIS IB ---');

    // 1.1. Register Teacher with NIS token
    const resRegTeacher = await apiRequest('POST', '/api/auth/register', undefined, {
      email: 'teacher.aisulu@nis.edu.kz',
      password: 'SecurePassword2026',
      full_name: 'Айсұлу Мұғалім',
      role: 'teacher',
      schoolToken: 'NIS-TEACHER-2026'
    });
    assert(resRegTeacher.status === 201 && !!resRegTeacher.body?.token, 'Регистрация учителя с токеном NIS IB');
    const teacherToken = resRegTeacher.body.token;
    const teacherId = resRegTeacher.body.user.id;

    // 1.2. Register Student with NIS token
    const resRegStudent = await apiRequest('POST', '/api/auth/register', undefined, {
      email: 'student.arman@nis.edu.kz',
      password: 'SecurePassword2026',
      full_name: 'Арман Оқушы',
      role: 'student',
      grade: 9,
      schoolToken: 'NIS-STUDENT-2026'
    });
    assert(resRegStudent.status === 201 && !!resRegStudent.body?.token, 'Регистрация ученика с токеном NIS IB');
    const studentToken = resRegStudent.body.token;
    const studentId = resRegStudent.body.user.id;

    // 1.3. Create Teacher Classroom
    const clsInfo = db.prepare(`
      INSERT INTO classrooms (name, school, teacher_id)
      VALUES ('9 «А»', 'NIS IB Astana', ?)
    `).run(teacherId);
    const classroomId = Number(clsInfo.lastInsertRowid);
    assert(classroomId > 0, 'Создана группа «9 «А»» учителя в NIS IB Astana');

    // ========================================================================
    // ШАГ 2: УПРАВЛЕНИЕ 5 СЛОТАМИ МАТЕРИАЛОВ (TEACHER)
    // ========================================================================
    console.log('\n--- 📂 ШАГ 2: Управление 5 слотами материалов курса ---');

    // 2.1. Retrieve 5 slots
    const resSlots = await apiRequest('GET', '/api/teacher/courses/1/slots', teacherToken);
    assert(resSlots.status === 200 && resSlots.body.data.length === 5, 'GET /slots возвращает ровно 5 слотов курса');

    // 2.2. Update Slot 2 (Учебник Часть 1)
    const resUpdateSlot = await apiRequest('POST', '/api/teacher/courses/1/slots/2', teacherToken, {
      title: 'Алгебра 9: Квадраттық теңсіздіктер және функциялар',
      content_text: 'Параграф 4: Интервалдар әдісі. Нөлдерді табу және таңбаларды анықтау алгоритмі.',
      file_type: 'pdf',
      is_locked: 0
    });
    assert(resUpdateSlot.status === 200 && resUpdateSlot.body.data.title.includes('Алгебра 9'), 'POST /slots/2 обновляет текст учебника');

    // 2.3. Lock Slot 5 and test 403 guard
    await apiRequest('POST', '/api/teacher/courses/1/slots/5', teacherToken, {
      title: 'Олимпиадалық есептер 2026',
      content_text: 'Тереңдетілген тапсырмалар',
      is_locked: 1
    });

    const resLockGuard = await apiRequest('POST', '/api/teacher/courses/1/slots/5', teacherToken, {
      title: 'Рұқсатсыз түзету',
      content_text: 'Жаңа мәтін'
    });
    assert(resLockGuard.status === 403, 'Попытка изменения заблокированного слота отклонена (403 Forbidden)');

    // ========================================================================
    // ШАГ 3: ГЕНЕРАЦИЯ И УТВЕРЖДЕНИЕ КТП (COPILOT)
    // ========================================================================
    console.log('\n--- 📋 ШАГ 3: Утверждение КТП четверти (Curriculum Plan) ---');

    const draftPlan = db.prepare(`
      INSERT INTO course_curriculum_plans (course_id, classroom_id, quarter, markdown_plan, status, version)
      VALUES (1, ?, 1, '# 1-тоқсан КТП: 10 апталық жоспар', 'DRAFT_QUESTIONNAIRE', 1)
    `).run(classroomId);
    const planId = Number(draftPlan.lastInsertRowid);

    const resApprovePlan = await apiRequest('POST', '/api/teacher/courses/1/plan/approve', teacherToken, {
      plan_id: planId,
      classroom_id: classroomId,
      quarter: 1
    });
    assert(resApprovePlan.status === 200 && resApprovePlan.body.data.status === 'APPROVED', 'Учитель утвердил КТП со статусом APPROVED');

    // ========================================================================
    // ШАГ 4: ПОДАЧА ЗАЯВКИ УЧЕНИКОМ (ADMISSION PIPELINE)
    // ========================================================================
    console.log('\n--- 🎓 ШАГ 4: Подача заявки на курс соискателем ---');

    const resApply = await apiRequest('POST', '/api/student/courses/1/apply', studentToken, {
      motivation_text: 'Мен NIS оқушысы ретінде алгебра мен квадраттық теңсіздіктерді олимпиадалық деңгейде меңгергім келеді.'
    });
    assert(resApply.status === 201 && resApply.body.data.status === 'applied', 'Ученик подал заявку с мотивационным письмом (status: applied)');
    const appId = resApply.body.data.id;

    const resDup = await apiRequest('POST', '/api/student/courses/1/apply', studentToken, {
      motivation_text: 'Екінші рет өтінім жіберу әрекеті'
    });
    assert(resDup.status === 400, 'Защита от дубликатов заявок сработала (400 Bad Request)');

    // ========================================================================
    // ШАГ 5: МОДЕРАЦИЯ ЗАЯВКИ И ЗАЧИСЛЕНИЕ (TEACHER)
    // ========================================================================
    console.log('\n--- 👨‍🏫 ШАГ 5: Модерация заявки учителем и зачисление ---');

    const resGetApps = await apiRequest('GET', '/api/teacher/courses/1/applications', teacherToken);
    assert(resGetApps.status === 200 && resGetApps.body.data.length >= 1, 'Учитель видит входящую заявку в воронке');

    const resModerate = await apiRequest('POST', `/api/teacher/courses/1/applications/${appId}/moderate`, teacherToken, {
      action: 'approve',
      assigned_classroom_id: classroomId
    });
    assert(resModerate.status === 200 && resModerate.body.data.status === 'enrolled', 'Учитель одобрил заявку (status: enrolled)');

    const inClass = db.prepare('SELECT * FROM classroom_students WHERE classroom_id = ? AND student_id = ?').get(classroomId, studentId);
    const passport = db.prepare('SELECT * FROM student_course_passports WHERE student_id = ? AND course_id = 1').get(studentId) as any;
    assert(inClass !== undefined, 'Ученик зачислен в таблицу classroom_students');
    assert(passport !== undefined && passport.subject_elo === 1000, 'Субпаспорт student_course_passports атомарно создан с 1000 ELO');

    // ========================================================================
    // ШАГ 6: ПЕРСОНАЛЬНАЯ ДИАГНОСТИКА «АҒА НАВИГАТОР»
    // ========================================================================
    console.log('\n--- 🧭 ШАГ 6: Персональный совет дня от «Аға Навигатор» ---');

    const resNav = await apiRequest('GET', '/api/student/navigator-advice?language=KZ', studentToken);
    assert(resNav.status === 200 && resNav.body.success === true, 'GET /api/student/navigator-advice возвращает 200 OK');
    assert(typeof resNav.body.data.greeting === 'string' && !!resNav.body.data.recommended_topic_title, 'Контракт NavigatorAdvice валидирован (greeting, recommended_topic_title)');

    // ========================================================================
    // ШАГ 7: РЕЖИМ ТИПА А & СОКРАТ «АҒА» (THOUGHT-FORKS & EUREKA)
    // ========================================================================
    console.log('\n--- 🦉 ШАГ 7: Сократический диалог и Эврика-момент (+15 ELO) ---');

    const resSocrates = await apiRequest('POST', '/api/tutor/socrates', studentToken, {
      topicTitle: 'Квадраттық теңсіздіктерді шешу',
      courseId: 1,
      currentElo: 1000,
      language: 'KZ',
      selectedForkKey: 'A'
    });
    assert(resSocrates.status === 200 && resSocrates.body.data.is_eureka === true, 'Выбор истинной развилки мысли Thought-Fork A зафиксировал Eureka Moment');
    assert(resSocrates.body.data.elo_delta === 15 && resSocrates.body.data.new_elo === 1015, 'Рейтинг ученика увеличился до 1015 ELO');

    // ========================================================================
    // ШАГ 8: РЕЖИМ ТИПА Б & SILENT GRADER (+15 XP)
    // ========================================================================
    console.log('\n--- 🎯 ШАГ 8: Сдача решения Типа Б и оценка Silent Grader ---');

    const resGrader = await apiRequest('POST', '/api/student/tasks/grade-type-b', studentToken, {
      question_id: 1,
      student_response: 'x^2 - 5x + 6 <= 0 теңсіздігін шешу үшін (x-2)(x-3) <= 0 түбірлерін тауып, сан түзуінде белгіледім. Жауабы: x in [2; 3]',
      language: 'KZ'
    });
    assert(resGrader.status === 200 && resGrader.body.success === true, 'POST /tasks/grade-type-b возвращает 200 OK');
    assert(resGrader.body.data.score_xp > 0 && typeof resGrader.body.data.verdict === 'string', `Silent Grader выставил ${resGrader.body.data.verdict} (+${resGrader.body.data.score_xp} XP)`);
    assert(resGrader.body.data.new_subject_elo >= 1015, `Субпаспорт обновлен атомарной транзакцией (${resGrader.body.data.new_subject_elo} ELO)`);

    // ========================================================================
    // ШАГ 9: 2D-МАТРИЦА УСПЕВАЕМОСТИ УЧИТЕЛЯ
    // ========================================================================
    console.log('\n--- 📊 ШАГ 9: Live 2D-Матрица успеваемости учителя ---');

    const resMatrix = await apiRequest('GET', `/api/teacher/class-matrix?classroomId=${classroomId}`, teacherToken);
    assert(resMatrix.status === 200 && resMatrix.body.success === true, 'GET /api/teacher/class-matrix возвращает 200 OK');
    
    const matrixStudent = resMatrix.body.data.matrix.find((s: any) => s.student_name === 'Арман Оқушы');
    assert(matrixStudent !== undefined, 'Ученик отображается в матрице класса «9 «А»»');
    assert(matrixStudent?.current_elo >= 1015, `Рейтинг в матрице учителя синхронизирован: ${matrixStudent?.current_elo} ELO (${matrixStudent?.rank})`);

  } finally {
    server.close();
  }

  // ========================================================================
  // ИТОГИ СКВОЗНОГО E2E ТЕСТА
  // ========================================================================
  console.log('\n========================================================================');
  console.log(`🎉 ИТОГ СКВОЗНОГО E2E ТЕСТА: ${passed} проверок пройдено, ${failed} провалено`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runFullAgenticFlowTest();
}
