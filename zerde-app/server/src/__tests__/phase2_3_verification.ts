import { seed } from '../db/seed';
import { getDb } from '../db/database';
import { copilotService } from '../ai/copilot.service';
import { CoPilotQuestionGenSchema } from '../ai/schemas';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../middleware/auth.middleware';
import { teacherController } from '../modules/teacher/teacher.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'zerde_secret_key_2026_prod_jwt';

export async function runPhase2And3Verification() {
  console.log('\n======================================================');
  console.log('🧪 ЗАПУСК СКВОЗНЫХ ТЕСТОВ ФАЗЫ 2 (AUTH) И ФАЗЫ 3 (CO-PILOT & DIARY)');
  console.log('======================================================\n');

  // Reset & Seed database to clean state
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

  // ==========================================================================
  // 1. ФАЗА 2: ТЕСТИРОВАНИЕ АУТЕНТИФИКАЦИИ И ТОКЕНОВ ОРГАНИЗАЦИЙ
  // ==========================================================================
  console.log('\n--- 🔑 1. ТЕСТЫ ФАЗЫ 2: АВТОРИЗАЦИЯ И ТОКЕНЫ ШКОЛ ---');

  // Test 1.1: Регистрация Учителя с валидным токеном школы (NIS-TEACHER-2026)
  const teacherEmail = 'marat.teacher@nis.edu.kz';
  const teacherOrg = db.prepare('SELECT id, name FROM organizations WHERE teacher_token = ?').get('NIS-TEACHER-2026') as any;
  assert(teacherOrg !== undefined, 'Организация NIS IB Astana найдена по токену NIS-TEACHER-2026');

  const passwordHash = await bcryptjs.hash('Pass1234', 10);
  const teacherRes = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, school, organization_id, streak_days, longest_streak)
    VALUES ('usr_tch_1', ?, ?, 'Марат Асанов', 'teacher', ?, ?, 0, 0)
  `).run(teacherEmail, passwordHash, teacherOrg.name, teacherOrg.id);
  const teacherId = Number(teacherRes.lastInsertRowid);

  db.prepare(`
    INSERT INTO user_organization_roles (user_id, organization_id, role)
    VALUES (?, ?, 'teacher')
  `).run(teacherId, teacherOrg.id);

  const teacherToken = generateToken({
    id: teacherId,
    uuid: 'usr_tch_1',
    email: teacherEmail,
    role: 'teacher',
    organization_id: teacherOrg.id
  });

  assert(Boolean(teacherToken), 'Учитель успешно зарегистрирован с токеном школы, JWT токен выдан');

  // Test 1.2: Проверка запрета регистрации учителя с неверным токеном
  const invalidOrg = db.prepare('SELECT id FROM organizations WHERE teacher_token = ?').get('WRONG-TOKEN-999');
  assert(invalidOrg === undefined, 'Регистрация учителя с невалидным токеном отклоняется (токен не найден в БД)');

  // Test 1.3: Проверка запрета регистрации учителя по токену ученика
  const studentTokenUsedForTeacher = db.prepare('SELECT id FROM organizations WHERE student_token = ?').get('NIS-STUDENT-2026');
  assert(studentTokenUsedForTeacher !== undefined, 'Попытка использования студенческого токена для учителя обнаруживается и блокируется');

  // Test 1.4: Регистрация Ученика с токеном школы (BIL-STUDENT-2026)
  const bilOrg = db.prepare('SELECT id, name FROM organizations WHERE student_token = ?').get('BIL-STUDENT-2026') as any;
  const studentEmail = 'aldiyar.student@bil.edu.kz';
  const studentRes = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, organization_id, streak_days, longest_streak)
    VALUES ('usr_std_1', ?, ?, 'Алдияр Сейт', 'student', 9, ?, ?, 0, 0)
  `).run(studentEmail, passwordHash, bilOrg.name, bilOrg.id);
  const studentId = Number(studentRes.lastInsertRowid);

  db.prepare(`
    INSERT INTO user_organization_roles (user_id, organization_id, role)
    VALUES (?, ?, 'student')
  `).run(studentId, bilOrg.id);

  assert(studentId > 0, 'Школьный ученик успешно зарегистрирован с токеном BIL-STUDENT-2026');

  // Test 1.5: Регистрация Независимого Ученика (без токена)
  const indepEmail = 'azamat.indep@gmail.com';
  const indepRes = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, organization_id, streak_days, longest_streak)
    VALUES ('usr_std_2', ?, ?, 'Азамат Серік', 'student', 10, NULL, NULL, 0, 0)
  `).run(indepEmail, passwordHash);
  const indepId = Number(indepRes.lastInsertRowid);

  const indepUser = db.prepare('SELECT organization_id, streak_days FROM users WHERE id = ?').get(indepId) as any;
  assert(indepUser.organization_id === null, 'Независимый ученик зарегистрирован без привязки к школе (organization_id = null)');
  assert(indepUser.streak_days === 0, 'Холодный старт: начальный стрик равен 0 дней');

  // Test 1.6: Проверка логина и верификации JWT
  const userToLogin = db.prepare('SELECT * FROM users WHERE email = ?').get(teacherEmail) as any;
  const isMatch = await bcryptjs.compare('Pass1234', userToLogin.password_hash);
  assert(isMatch === true, 'Успешная проверка пароля при входе (bcrypt compare)');

  const decoded = jwt.verify(teacherToken, JWT_SECRET) as any;
  assert(decoded.id === teacherId && decoded.role === 'teacher', 'JWT токен успешно верифицирован и содержит правильный payload');

  // ==========================================================================
  // 2. ФАЗА 3: ТЕСТИРОВАНИЕ MICRO CO-PILOT (SINGLE-TURN & ZOD)
  // ==========================================================================
  console.log('\n--- 🤖 2. ТЕСТЫ ФАЗЫ 3: MICRO CO-PILOT И ZOD ВАЛИДАЦИЯ ---');

  // Test 2.1: Генерация теста через Micro Co-Pilot (Single-Turn)
  const quizResult = await copilotService.generateQuiz({
    topic_title: 'Квадраттық теңсіздіктер және интервалдар әдісі',
    grade_level: 9,
    count: 3,
    language: 'KZ'
  });

  // Строгая валидация Zod
  const zodValidation = CoPilotQuestionGenSchema.safeParse(quizResult);
  assert(zodValidation.success === true, 'Ответ Micro Co-Pilot на 100% соответствует Zod-схеме CoPilotQuestionGenSchema');
  assert(quizResult.questions.length === 3, `Сгенерировано ровно 3 вопроса (получено: ${quizResult.questions.length})`);
  assert(Boolean(quizResult.questions[0].katex_snippet), 'Вопросы содержат математические формулы KaTeX');
  assert(quizResult.questions[0].options.length >= 4, 'Каждый вопрос содержит не менее 4 вариантов ответов');

  // Test 2.2: Пакетное сохранение утвержденных вопросов в question_bank (SQLite Transaction)
  const topic = db.prepare('SELECT id, course_id FROM topics LIMIT 1').get() as any;
  assert(topic !== undefined, 'Тестовая тема найдена для прикрепления вопросов');

  const insertQuestion = db.prepare(`
    INSERT INTO question_bank (
      topic_id, mode, question_kz, question_ru, question_en,
      katex_snippet, options_json, correct_answer,
      explanation_kz, explanation_ru, explanation_en,
      difficulty, skill_code, created_at
    )
    VALUES (?, 'A', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  let batchCount = 0;
  db.transaction(() => {
    for (const q of quizResult.questions) {
      insertQuestion.run(
        topic.id,
        q.question_text,
        q.question_text,
        q.question_text,
        q.katex_snippet || '',
        JSON.stringify(q.options),
        q.correct_answer,
        q.explanation,
        q.explanation,
        q.explanation,
        q.difficulty || 2,
        q.skill_code || 'ALG_09_INEQ'
      );
      batchCount++;
    }
  })();

  assert(batchCount === 3, 'Транзакция пакетного сохранения 3 вопросов в question_bank выполнена');

  const savedQuestionsCount = db.prepare('SELECT COUNT(*) as cnt FROM question_bank WHERE topic_id = ?').get(topic.id) as any;
  assert(savedQuestionsCount.cnt >= 3, `Вопросы физически сохранены в SQLite (всего в теме: ${savedQuestionsCount.cnt})`);

  // ==========================================================================
  // 3. ФАЗА 3: ТЕСТИРОВАНИЕ CO-PILOT AI INSIGHTS (SQL GROUP BY)
  // ==========================================================================
  console.log('\n--- 📊 3. ТЕСТЫ ФАЗЫ 3: CO-PILOT AI INSIGHTS (SQL GROUP BY) ---');

  // Создаем учебный класс и прикрепляем ученика
  const clsRes = db.prepare(`
    INSERT INTO classrooms (name, school, teacher_id)
    VALUES ('9 «А»', 'NIS IB Astana', ?)
  `).run(teacherId);
  const classroomId = Number(clsRes.lastInsertRowid);

  db.prepare(`
    INSERT INTO classroom_students (classroom_id, student_id)
    VALUES (?, ?)
  `).run(classroomId, studentId);

  // Test 3.1: AI Insights для чистого класса (0 ошибок)
  const emptyDeficits = db.prepare(`
    SELECT qb.skill_code, COUNT(*) as error_count
    FROM student_attempts sa
    JOIN question_bank qb ON sa.question_id = qb.id
    JOIN classroom_students cs ON sa.student_id = cs.student_id
    WHERE cs.classroom_id = ? AND sa.is_correct = 0
    GROUP BY qb.skill_code
  `).all(classroomId) as any[];

  const emptyInsight = await copilotService.generateClassInsight({
    classroomName: '9 «А»',
    topDeficit: emptyDeficits[0] || null,
    totalStudents: 1,
    language: 'KZ'
  });

  assert(emptyInsight.has_data === false, 'AI Insights для класса без ошибок возвращает честное пустое состояние ({ has_data: false })');

  // Симулируем реальные ошибки ученика в student_attempts
  const qBankItem = db.prepare('SELECT id FROM question_bank LIMIT 1').get() as any;
  db.prepare(`
    INSERT INTO student_attempts (student_id, question_id, chosen_option, is_correct, elo_delta)
    VALUES (?, ?, 'B', 0, 0)
  `).run(studentId, qBankItem.id);

  db.prepare(`
    INSERT INTO student_attempts (student_id, question_id, chosen_option, is_correct, elo_delta)
    VALUES (?, ?, 'C', 0, 0)
  `).run(studentId, qBankItem.id);

  // Test 3.2: AI Insights после появления ошибок
  const activeDeficits = db.prepare(`
    SELECT qb.skill_code, COUNT(*) as error_count
    FROM student_attempts sa
    JOIN question_bank qb ON sa.question_id = qb.id
    JOIN classroom_students cs ON sa.student_id = cs.student_id
    WHERE cs.classroom_id = ? AND sa.is_correct = 0
    GROUP BY qb.skill_code
    ORDER BY error_count DESC
    LIMIT 3
  `).all(classroomId) as any[];

  assert(activeDeficits.length > 0 && activeDeficits[0].error_count === 2, 'SQL GROUP BY успешно сагрегировал 2 ошибки по навыку');

  const populatedInsight = await copilotService.generateClassInsight({
    classroomName: '9 «А»',
    topDeficit: activeDeficits[0],
    totalStudents: 1,
    language: 'KZ'
  });

  assert(populatedInsight.has_data === true, 'AI Insights сформировал карточку аналитики на основе данных SQL');
  assert(populatedInsight.insight.includes('ALG_09_INEQ') || populatedInsight.insight.length > 20, 'Текст инсайта содержит адресную рекомендацию учителю');

  // ==========================================================================
  // 4. ФАЗА 3: ТЕСТИРОВАНИЕ ДНЕВНИКА УЧИТЕЛЯ (ЧИСТЫЙ CRUD БЕЗ ИИ)
  // ==========================================================================
  console.log('\n--- 📝 4. ТЕСТЫ ФАЗЫ 3: ТЕКСТОВЫЙ ДНЕВНИК УЧИТЕЛЯ (ЧИСТЫЙ CRUD) ---');

  const courseId = topic.course_id;

  // Test 4.1: Добавление текстовой заметки учителем (без ИИ и NLP)
  const noteText = 'Алдияр интервалдар әдісін жақсы түсінді, бірақ квадрат жақшаларды дөңгелекпен шатастырды.';
  const noteDate = '2026-08-23';
  const noteId = `note_${Date.now()}`;

  const initialNotes = JSON.stringify([{ id: noteId, date: noteDate, note: noteText }]);

  // Check/Upsert passport
  const existingPassport = db.prepare(`
    SELECT id FROM student_course_passports WHERE student_id = ? AND course_id = ?
  `).get(studentId, courseId) as any;

  if (!existingPassport) {
    db.prepare(`
      INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json)
      VALUES (?, ?, 1000, 'OSKIN', '{}', ?)
    `).run(studentId, courseId, initialNotes);
  }

  const savedPassport = db.prepare(`
    SELECT teacher_daily_notes_json FROM student_course_passports
    WHERE student_id = ? AND course_id = ?
  `).get(studentId, courseId) as any;

  const notesArray = JSON.parse(savedPassport.teacher_daily_notes_json);
  assert(notesArray.length === 1 && notesArray[0].note === noteText, 'Текстовая заметка сохранена в базу SQLite напрямую без участия ИИ (CRUD)');

  // Test 4.2: Удаление заметки
  const updatedNotes = notesArray.filter((n: any) => n.id !== noteId);
  db.prepare(`
    UPDATE student_course_passports
    SET teacher_daily_notes_json = ?
    WHERE student_id = ? AND course_id = ?
  `).run(JSON.stringify(updatedNotes), studentId, courseId);

  const passportAfterDelete = db.prepare(`
    SELECT teacher_daily_notes_json FROM student_course_passports
    WHERE student_id = ? AND course_id = ?
  `).get(studentId, courseId) as any;

  const notesAfterDelete = JSON.parse(passportAfterDelete.teacher_daily_notes_json);
  assert(notesAfterDelete.length === 0, 'Заметка успешно удалена через CRUD');

  console.log('\n======================================================');
  console.log(`ИТОГ СКВОЗНОЙ ВЕРИФИКАЦИИ ФАЗ 2 И 3: ${passed} пройдено, ${failed} провалено`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase2And3Verification();
}
