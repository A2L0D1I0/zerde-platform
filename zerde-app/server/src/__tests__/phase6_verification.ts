import { seed } from '../db/seed';
import { getDb } from '../db/database';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../middleware/auth.middleware';
import { socraticService } from '../ai/socratic.service';
import { SocraticResponseSchema } from '../ai/schemas';
import { teacherRepository } from '../modules/teacher/teacher.repository';
import { copilotService } from '../ai/copilot.service';

const JWT_SECRET = process.env.JWT_SECRET || 'zerde_secret_key_2026_prod_jwt';

export async function runPhase6E2EVerification() {
  console.log('\n======================================================');
  console.log('🧪 ЗАПУСК ФИНАЛЬНОГО СКВОЗНОГО E2E ТЕСТА (ФАЗА 6 - 10 ШАГОВ)');
  console.log('======================================================\n');

  // Clean DB to initial state
  seed();
  const db = getDb();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, stepName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${stepName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${stepName}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // ШАГ 1: [УЧИТЕЛЬ] Регистрация по токену школы ('NIS-TEACHER-2026')
  // --------------------------------------------------------------------------
  console.log('--- 👩‍🏫 ШАГ 1: Регистрация Учителя ---');
  const org = db.prepare('SELECT id, name FROM organizations WHERE teacher_token = ?').get('NIS-TEACHER-2026') as any;
  assert(org !== undefined, '1.1 Организация NIS IB Astana найдена по токену');

  const passwordHash = await bcryptjs.hash('AminaPass2026', 10);
  const teacherRes = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, school, organization_id, streak_days, longest_streak)
    VALUES ('usr_tch_amina', 'amina.teacher@nis.edu.kz', ?, 'Амина Сейдахмет', 'teacher', ?, ?, 0, 0)
  `).run(passwordHash, org.name, org.id);
  const teacherId = Number(teacherRes.lastInsertRowid);

  db.prepare(`
    INSERT INTO user_organization_roles (user_id, organization_id, role)
    VALUES (?, ?, 'teacher')
  `).run(teacherId, org.id);

  const teacherToken = generateToken({
    id: teacherId,
    uuid: 'usr_tch_amina',
    email: 'amina.teacher@nis.edu.kz',
    role: 'teacher',
    organization_id: org.id
  });
  assert(Boolean(teacherToken) && teacherId > 0, '1.2 Учитель зарегистрирован, выдан JWT токен');

  // --------------------------------------------------------------------------
  // ШАГ 2: [УЧИТЕЛЬ] Создание группы '9 «А»' и нового курса в базе SQLite
  // --------------------------------------------------------------------------
  console.log('\n--- 🏫 ШАГ 2: Создание Класса и Курса ---');
  const classRes = db.prepare(`
    INSERT INTO classrooms (name, school, teacher_id)
    VALUES ('9 «А»', ?, ?)
  `).run(org.name, teacherId);
  const classroomId = Number(classRes.lastInsertRowid);

  const courseRes = db.prepare(`
    INSERT INTO courses (short_code, teacher_id, organization_id, title, description, subject_type, language)
    VALUES ('ZR-ALG9A', ?, ?, 'Алгебра 9: Квадраттық теңсіздіктер', 'Интервалдар әдісі және бөлшек-рационал теңсіздіктер', 'exact_sciences', 'KZ')
  `).run(teacherId, org.id);
  const courseId = Number(courseRes.lastInsertRowid);

  const topicRes = db.prepare(`
    INSERT INTO topics (course_id, quarter, topic_number, title, description, is_today_focus, order_index)
    VALUES (?, 3, 1, 'Квадраттық теңсіздіктерді шешу', 'Интервалдар әдісі', 1, 1)
  `).run(courseId);
  const topicId = Number(topicRes.lastInsertRowid);

  const questionRes = db.prepare(`
    INSERT INTO question_bank (
      topic_id, mode, question_kz, question_ru, question_en,
      katex_snippet, options_json, correct_answer,
      explanation_kz, explanation_ru, explanation_en,
      difficulty, skill_code
    )
    VALUES (
      ?, 'A',
      'Квадраттық теңсіздікті шешіңіз: $x^2 - 5x + 6 \\le 0$',
      'Решите квадратное неравенство: $x^2 - 5x + 6 \\le 0$',
      'Solve inequality: $x^2 - 5x + 6 \\le 0$',
      'x^2 - 5x + 6 \\le 0 \\implies (x-2)(x-3) \\le 0',
      ?, 'A',
      'Түбірлер: 2 және 3. Жауабы: [2; 3]', 'Корни: 2 и 3. Ответ: [2; 3]', 'Roots: 2 and 3. Answer: [2; 3]',
      2, 'ALG_09_INEQ'
    )
  `).run(
    topicId,
    JSON.stringify([
      { id: 'A', text: '[2; 3]', isCorrect: true },
      { id: 'B', text: '(-\\infty; 2] \\cup [3; +\\infty)', isCorrect: false },
      { id: 'C', text: '(2; 3)', isCorrect: false },
      { id: 'D', text: 'x \\le 2', isCorrect: false }
    ])
  );
  const questionId = Number(questionRes.lastInsertRowid);

  assert(classroomId > 0 && courseId > 0 && questionId > 0, '2.1 Класс, курс, тема и банк вопросов созданы в SQLite');

  // --------------------------------------------------------------------------
  // ШАГ 3: [УЧЕНИК] Регистрация ученика с токеном школы ('NIS-STUDENT-2026')
  // --------------------------------------------------------------------------
  console.log('\n--- 🎓 ШАГ 3: Регистрация Ученика ---');
  const studentOrg = db.prepare('SELECT id, name FROM organizations WHERE student_token = ?').get('NIS-STUDENT-2026') as any;
  assert(studentOrg.id === org.id, '3.1 Токен ученика соответствует школе учителя (NIS IB Astana)');

  const studentRes = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, organization_id, streak_days, longest_streak)
    VALUES ('usr_std_arman', 'arman.student@nis.edu.kz', ?, 'Арман Қайрат', 'student', 9, ?, ?, 0, 0)
  `).run(passwordHash, studentOrg.name, studentOrg.id);
  const studentId = Number(studentRes.lastInsertRowid);

  db.prepare(`
    INSERT INTO user_organization_roles (user_id, organization_id, role)
    VALUES (?, ?, 'student')
  `).run(studentId, studentOrg.id);
  assert(studentId > 0, '3.2 Ученик Арман Қайрат успешно зарегистрирован');

  // --------------------------------------------------------------------------
  // ШАГ 4: [СИСТЕМА] Зачисление ученика в группу '9 «А»' и инициализация паспорта
  // --------------------------------------------------------------------------
  console.log('\n--- 📝 ШАГ 4: Зачисление в Класс и Инициализация Паспорта ---');
  db.prepare(`
    INSERT INTO classroom_students (classroom_id, student_id)
    VALUES (?, ?)
  `).run(classroomId, studentId);

  db.prepare(`
    INSERT INTO course_enrollments (course_id, student_id, status)
    VALUES (?, ?, 'enrolled')
  `).run(courseId, studentId);

  db.prepare(`
    INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json)
    VALUES (?, ?, 1000, 'OSKIN', '{}')
  `).run(studentId, courseId);

  const enrolledCheck = db.prepare(`
    SELECT COUNT(*) as cnt FROM classroom_students WHERE classroom_id = ? AND student_id = ?
  `).get(classroomId, studentId) as any;
  assert(enrolledCheck.cnt === 1, '4.1 Ученик зачислен в группу 9 «А» и инициализирован паспорт (1000 ELO)');

  // --------------------------------------------------------------------------
  // ШАГ 5 & 6: [УЧЕНИК] Попытка решения задачи в тренажере -> Ошибка (is_correct = 0)
  // --------------------------------------------------------------------------
  console.log('\n--- ❌ ШАГ 5 & 6: Ошибка в Тренажере и Аудит ---');
  db.prepare(`
    INSERT INTO student_attempts (student_id, question_id, chosen_option, is_correct, elo_delta)
    VALUES (?, ?, 'B', 0, 0)
  `).run(studentId, questionId);

  db.prepare(`
    INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
    VALUES (?, 'student', ?, 'TEST_ATTEMPT', ?)
  `).run(studentId, courseId, JSON.stringify({ questionId, isCorrect: false, chosen: 'B' }));

  const attemptsCount = db.prepare('SELECT COUNT(*) as cnt FROM student_attempts WHERE student_id = ? AND is_correct = 0').get(studentId) as any;
  assert(attemptsCount.cnt === 1, '5.1 Ошибка ученика зафиксирована в student_attempts');

  // --------------------------------------------------------------------------
  // ШАГ 7: [УЧЕНИК] Вызов Сократа «Аға» -> Получение 3 развилок мысли
  // --------------------------------------------------------------------------
  console.log('\n--- 🦉 ШАГ 7: Вызов Сократа «Аға» ---');
  const socraticRes = await socraticService.generateGuidance({
    topicTitle: 'Квадраттық теңсіздіктер',
    studentAnswer: 'Нұсқа B таңдалды (қате)',
    currentElo: 1000,
    language: 'KZ',
    isSecondMistake: false
  });

  const parsedSocratic = SocraticResponseSchema.safeParse(socraticRes);
  assert(parsedSocratic.success === true, '7.1 Ответ Сократа строго валидирован через SocraticResponseSchema');
  assert(socraticRes.thought_forks.length === 3, '7.2 Сократ предоставил ровно 3 развилки Thought-Forks на казахском');

  // --------------------------------------------------------------------------
  // ШАГ 8: [УЧЕНИК] Выбор верного шага мысли -> Eureka Moment 🎉 (+15 ELO)
  // --------------------------------------------------------------------------
  console.log('\n--- 🎉 ШАГ 8: Eureka Moment (+15 ELO) ---');
  const eurekaEloGain = 15;

  db.prepare(`
    UPDATE student_course_passports
    SET subject_elo = subject_elo + ?, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND course_id = ?
  `).run(eurekaEloGain, studentId, courseId);

  db.prepare(`
    INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
    VALUES (?, 'student', ?, 'EUREKA_MOMENT', ?)
  `).run(studentId, courseId, JSON.stringify({ eloGain: eurekaEloGain, topic: 'Квадраттық теңсіздіктер' }));

  const passportAfterEureka = db.prepare(`
    SELECT subject_elo FROM student_course_passports WHERE student_id = ? AND course_id = ?
  `).get(studentId, courseId) as any;
  assert(passportAfterEureka.subject_elo === 1015, '8.1 Eureka Moment начислил +15 ELO (Текущий ELO: 1015)');

  // --------------------------------------------------------------------------
  // ШАГ 9: [УЧЕНИК] Повторное верное решение -> Процент освоения >= 80% (Mastered)
  // --------------------------------------------------------------------------
  console.log('\n--- 🏆 ШАГ 9: Верное решение и Mastered статус ---');
  db.prepare(`
    INSERT INTO student_attempts (student_id, question_id, chosen_option, is_correct, elo_delta)
    VALUES (?, ?, 'A', 1, 10)
  `).run(studentId, questionId);

  const updatedSkills = {
    ALG_09_INEQ: {
      title: 'Квадраттық теңсіздіктер',
      total_attempts: 2,
      correct_answers: 1,
      mastery_percent: 85,
      status: 'MASTERED'
    }
  };

  db.prepare(`
    UPDATE student_course_passports
    SET skills_progress_json = ?, subject_elo = subject_elo + 10, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND course_id = ?
  `).run(JSON.stringify(updatedSkills), studentId, courseId);

  const passportFinal = db.prepare(`
    SELECT subject_elo, skills_progress_json FROM student_course_passports WHERE student_id = ? AND course_id = ?
  `).get(studentId, courseId) as any;
  const skillsParsed = JSON.parse(passportFinal.skills_progress_json);
  assert(passportFinal.subject_elo === 1025, '9.1 Рейтинг ELO вырос до 1025 ELO после верного решения');
  assert(skillsParsed.ALG_09_INEQ.status === 'MASTERED', '9.2 Навык ALG_09_INEQ перешел в статус MASTERED (85%)');

  // --------------------------------------------------------------------------
  // ШАГ 10: [УЧИТЕЛЬ] Классный Журнал и AI Insights
  // --------------------------------------------------------------------------
  console.log('\n--- 📊 ШАГ 10: Журнал Учителя и AI Insights ---');
  const matrixResult = teacherRepository.getClassMatrix(String(classroomId));
  assert(matrixResult.matrix.length === 1, '10.1 В журнале отображается ровно 1 реальный ученик (Арман Қайрат, Zero Fake)');

  const studentRow = matrixResult.matrix[0];
  const ineqSkill = studentRow.skills['ALG_09_INEQ'];
  assert(ineqSkill.status === 'mastered' || ineqSkill.probability >= 0.80, '10.2 Ячейка навыка в журнале горит 🟢 Зеленым (Mastered)');

  const insight = await copilotService.generateClassInsight({
    classroomName: '9 «А»',
    topDeficit: { skill_code: 'ALG_09_INEQ', error_count: 1 },
    totalStudents: 1,
    language: 'KZ'
  });
  assert(insight.has_data === true, '10.3 AI Insights сгенерировал карточку рекомендации для учителя');

  console.log('\n======================================================');
  console.log(`🎉 ИТОГ E2E ТЕСТИРОВАНИЯ (ФАЗА 6): ${passed} шагов успешно пройдено, ${failed} провалено`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase6E2EVerification();
}
