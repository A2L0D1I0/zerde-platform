import { resetDatabase } from './database';
import bcryptjs from 'bcryptjs';

export function seed() {
  console.log('🧹 Очистка и сброс базы данных SQLite к чистому состоянию...');
  const db = resetDatabase();
  const now = new Date().toISOString();

  // ==========================================================================
  // 1. ТОЛЬКО 2 ВЕРИФИЦИРОВАННЫЕ ОРГАНИЗАЦИИ С ТОКЕНАМИ
  // ==========================================================================
  console.log('🏫 Сид 2 организаций (NIS IB Astana и Ekibastuz BIL)...');
  const insertOrg = db.prepare(`
    INSERT INTO organizations (name, teacher_token, student_token, type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertOrg.run(
    'NIS IB Astana',
    'NIS-TEACHER-2026',
    'NIS-STUDENT-2026',
    'school',
    now
  );

  insertOrg.run(
    'Ekibastuz BIL',
    'BIL-TEACHER-2026',
    'BIL-STUDENT-2026',
    'school',
    now
  );

  // ==========================================================================
  // 1.1. РЕАЛЬНЫЕ ПОЛЬЗОВАТЕЛИ (Учитель и Ученик)
  // ==========================================================================
  console.log('👤 Сид реальных пользователей (NIS IB Astana)...');
  const insertUser = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, streak_days, longest_streak, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const passwordHash = bcryptjs.hashSync('Password2026!', 10);

  const uTeacher = insertUser.run(
    'teacher-uuid-nis-1',
    'aldiyar.teacher@nis.kz',
    passwordHash,
    'Саржанов Алдияр Мұғалім',
    'teacher',
    '10-сынып',
    'NIS IB Astana',
    15,
    15,
    now,
    now
  );
  const teacherId = Number(uTeacher.lastInsertRowid);

  // Also support teacher.nis@nis.kz and teacher@nis.kz aliases
  insertUser.run(
    'teacher-uuid-nis-2',
    'teacher.nis@nis.kz',
    passwordHash,
    'NIS Мұғалімі',
    'teacher',
    '10-сынып',
    'NIS IB Astana',
    10,
    10,
    now,
    now
  );

  insertUser.run(
    'teacher-uuid-nis-3',
    'teacher@nis.kz',
    passwordHash,
    'NIS Мұғалім Аккаунты',
    'teacher',
    '10-сынып',
    'NIS IB Astana',
    10,
    10,
    now,
    now
  );

  const uStudent = insertUser.run(
    'student-uuid-nis-1',
    'aldiyar.student@nis.kz',
    passwordHash,
    'Саржанов Алдияр',
    'student',
    '9-сынып',
    'NIS IB Astana',
    5,
    7,
    now,
    now
  );
  const studentId = Number(uStudent.lastInsertRowid);

  // Also support student.nis@nis.kz and student@nis.kz aliases
  insertUser.run(
    'student-uuid-nis-2',
    'student.nis@nis.kz',
    passwordHash,
    'NIS Оқушысы',
    'student',
    '9-сынып',
    'NIS IB Astana',
    3,
    5,
    now,
    now
  );

  insertUser.run(
    'student-uuid-nis-3',
    'student@nis.kz',
    passwordHash,
    'NIS Оқушы Аккаунты',
    'student',
    '9-сынып',
    'NIS IB Astana',
    3,
    5,
    now,
    now
  );

  // Classroom
  const insertClassroom = db.prepare(`
    INSERT INTO classrooms (name, school, teacher_id, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const cls1 = insertClassroom.run('10 «А»', 'NIS IB Astana', teacherId, now);
  const classroomId = Number(cls1.lastInsertRowid);

  db.prepare(`
    INSERT INTO classroom_students (classroom_id, student_id, created_at)
    VALUES (?, ?, ?)
  `).run(classroomId, studentId, now);

  // ==========================================================================
  // 2. БАЗОВЫЙ КАТАЛОГ КУРСОВ И ТЕМ
  // ==========================================================================
  console.log('📚 Сид базового каталога курсов...');
  const insertCourse = db.prepare(`
    INSERT INTO courses (short_code, title, description, subject_type, language, icon, teacher_id, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const c1 = insertCourse.run(
    'ALG-09',
    'Алгебра 9-сынып (Теңсіздіктер мен функциялар)',
    'Квадраттық теңсіздіктер және интервалдар әдісі',
    'algebra',
    'KZ',
    '',
    teacherId,
    1,
    now
  );
  const course1Id = Number(c1.lastInsertRowid);

  // Student Passports (Isolated to course1Id)
  const insertPassport = db.prepare(`
    INSERT OR REPLACE INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json, updated_at)
    VALUES (?, ?, ?, 'OSKIN', '{}', '[]', ?)
  `);
  insertPassport.run(studentId, course1Id, 1015, now);
  insertPassport.run(5, course1Id, 1000, now);
  insertPassport.run(6, course1Id, 1000, now);

  // Enrollments in Algebra 9 (Status: enrolled)
  const insertEnrollment = db.prepare(`
    INSERT OR REPLACE INTO course_enrollments (course_id, student_id, assigned_classroom_id, status, motivation_text, requested_at, approved_at)
    VALUES (?, ?, ?, 'enrolled', 'NIS IB Astana 9-сынып математика курсына қабылданды', ?, ?)
  `);
  insertEnrollment.run(course1Id, studentId, classroomId, now, now);
  insertEnrollment.run(course1Id, 5, classroomId, now, now);
  insertEnrollment.run(course1Id, 6, classroomId, now, now);

  // ==========================================================================
  // 3. СЛОТЫ МАТЕРИАЛОВ (5 Слотов для Context-Injection)
  // ==========================================================================
  console.log('📂 Сид 5 слотов учебных материалов...');
  const insertSlot = db.prepare(`
    INSERT INTO course_material_slots (
      course_id, classroom_id, slot_number, title, file_type, 
      content_text, file_size, is_locked, uploaded_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSlot.run(
    course1Id,
    null,
    1,
    'ГОСО: Алгебра 9-сынып бойынша стандарт',
    'text',
    '9.2.3.1 Квадраттық теңсіздіктерді интервалдар әдісімен шешу. 9.2.3.2 Бөлшек-рационал теңсіздіктерді шешуде бөлімнің нөлдерін ескеру және шешімді сан түзуінде бейнелеу.',
    1240,
    0,
    now
  );

  insertSlot.run(
    course1Id,
    null,
    2,
    'Оқулық: 9-сынып Алгебра 1-бөлім (Шыныбеков)',
    'text',
    '1-тарау. Теңсіздіктер. Квадраттық функцияның графигі парабола болып табылады. Егер a > 0 болса, тармақтары жоғары қарайды. Функцияның нөлдері теңдеудің түбірлері болып табылады.',
    2800,
    0,
    now
  );

  insertSlot.run(
    course1Id,
    null,
    3,
    'Оқулық: 9-сынып Алгебра 2-бөлім (Абылкасымова)',
    'text',
    '2-тарау. Теңсіздіктер жүйесі және интервалдар әдісін бөлшек-рационал функцияларға қолдану.',
    3100,
    0,
    now
  );

  insertSlot.run(
    course1Id,
    null,
    4,
    'Әдістемелік нұсқаулық: 9-сынып Мұғалімге арналған құрал',
    'text',
    'Мұғалімге ұсыныс: Оқушылар көбінесе бөлшек бөлімінің нөлдерін теңсіздіктің шешіміне қосып қояды (ОДЗ қатесі). Бұған ерекше назар аудару керек.',
    1950,
    0,
    now
  );

  insertSlot.run(
    course1Id,
    null,
    5,
    'Олимпиадалық есептер мен тереңдетілген деңгей',
    'text',
    'Параметрлі квадраттық теңсіздіктер және модуль таңбасы бар күрделі теңсіздіктерді шешу.',
    4200,
    0,
    now
  );

  // Темы для курса Алгебры
  const insertTopic = db.prepare(`
    INSERT INTO topics (course_id, quarter, topic_number, title, description, is_today_focus, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const t1 = insertTopic.run(
    course1Id,
    1,
    1,
    'Аралықтар әдісі (Интервалдар әдісі)',
    '9.2.3.1 Квадраттық теңсіздіктерді интервалдар әдісімен шешу',
    1,
    1,
    now
  );
  const topic1Id = Number(t1.lastInsertRowid);

  insertTopic.run(
    course1Id,
    1,
    2,
    'Бөлшек-рационал теңсіздіктер және ОДЗ',
    '9.2.3.2 Бөлшек бөлімінің нөлдерін ескеру және шешімді сан түзуінде бейнелеу',
    0,
    2,
    now
  );

  // ==========================================================================
  // 4. БАНК ВОПРОСОВ С KATEX И SOLUTION MODEL (Тип А и Тип Б)
  // ==========================================================================
  console.log('❓ Сид банка вопросов с KaTeX и Solution Models...');
  const insertQuestion = db.prepare(`
    INSERT INTO question_bank (
      topic_id, mode, question_kz, question_ru, question_en, 
      katex_snippet, options_json, correct_answer, solution_model,
      explanation_kz, explanation_ru, explanation_en, 
      difficulty, skill_code, topic_tag, target_tier, quarter_index, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const optionsJsonA = JSON.stringify([
    { id: 'A', text: '(-2; 3)', latex: '(-2; 3)' },
    { id: 'B', text: '(-\\infty; -2) \\cup (3; +\\infty)', latex: '(-\\infty; -2) \\cup (3; +\\infty)' },
    { id: 'C', text: '[-3; 2]', latex: '[-3; 2]' },
    { id: 'D', text: '(-3; 2]', latex: '(-3; 2]' }
  ]);

  // Вопрос Тип А (Тест)
  insertQuestion.run(
    topic1Id,
    'A',
    'Теңсіздікті шешіңіз: $x^2 - x - 6 < 0$',
    'Решите неравенство: $x^2 - x - 6 < 0$',
    'Solve the inequality: $x^2 - x - 6 < 0$',
    'x^2 - x - 6 < 0 \\implies (x+2)(x-3) < 0',
    optionsJsonA,
    'A',
    null,
    'Түбірлері $x_1 = -2$ және $x_2 = 3$. Парабола тармақтары жоғары, шешім аралығы: $(-2; 3)$.',
    'Корни $x_1 = -2$ и $x_2 = 3$. Ветви параболы направлены вверх, интервал решения: $(-2; 3)$.',
    'Roots are $x_1 = -2$ and $x_2 = 3$. Solution interval is $(-2; 3)$.',
    2,
    'ALG_09_INEQ',
    'inequalities_quadratic',
    'INTERMEDIATE',
    1,
    now
  );

  const optionsJsonB = JSON.stringify([
    { id: 'A', text: '[-2; 2] ∪ (3; +∞)', isCorrect: true },
    { id: 'B', text: '(-∞; -2] ∪ [2; 3)', isCorrect: false },
    { id: 'C', text: '[-2; 3)', isCorrect: false },
    { id: 'D', text: '[2; 3) ∪ (3; +∞)', isCorrect: false }
  ]);

  // Вопрос Тип Б (Развернутое решение для Silent Grader)
  insertQuestion.run(
    topic1Id,
    'B',
    'Бөлшек-рационал теңсіздікті қадам бойынша шешіп, шешімін сан түзуінде көрсетіңіз: $\\frac{x^2 - 4}{x - 3} \\ge 0$',
    'Решите дробно-рациональное неравенство пошагово: $\\frac{x^2 - 4}{x - 3} \\ge 0$',
    'Solve the rational inequality step-by-step: $\\frac{x^2 - 4}{x - 3} \\ge 0$',
    '\\frac{(x-2)(x+2)}{x-3} \\ge 0',
    optionsJsonB,
    'A',
    'Model Solution: 1) Factor numerator: (x-2)(x+2). 2) Exclude denominator zero: x != 3. 3) Critical points: -2, 2, 3. 4) Apply sign intervals test: [-2, 2] U (3, +infinity).',
    'Алымның түбірлері $x = \\pm 2$, бөлімнің нөлі $x \\ne 3$. Аралықтар әдісі бойынша жауабы: $[-2; 2] \\cup (3; +\\infty)$.',
    'Корни числителя $x = \\pm 2$, ноль знаменателя $x \\ne 3$. Ответ методом интервалов: $[-2; 2] \\cup (3; +\\infty)$.',
    'Numerator roots $x = \\pm 2$, denominator zero $x \\ne 3$. Result: $[-2; 2] \\cup (3; +\\infty)$.',
    3,
    'ALG_09_RATIONAL',
    'inequalities_rational',
    'ADVANCED',
    1,
    now
  );

  // 5. Сдача студента для отображения в Question Bank Subpassport
  db.prepare(`
    INSERT INTO student_attempts (student_id, question_id, chosen_option, text_response, is_correct, elo_delta, created_at)
    VALUES (?, 1, 'A', '(-2; 3)', 1, 15, ?)
  `).run(studentId, now);

  console.log('✨ База данных успешно инициализирована: только Алгебра 9-сынып, 0 эмодзи!');
}

if (require.main === module) {
  seed();
}
