import { getDb } from '../db/database';

export function runPhase1Verification() {
  console.log('\n======================================================');
  console.log('🧪 ЗАПУСК ВЕРИФИКАЦИОННЫХ ТЕСТОВ ФАЗЫ 1 (ZERO-FAKE MVP)');
  console.log('======================================================\n');

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

  // 1. Проверка наличия ровно 13 требуемых таблиц
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];
  const tableNames = tables.map(t => t.name);

  const requiredTables = [
    'organizations',
    'user_organization_roles',
    'users',
    'classrooms',
    'classroom_students',
    'courses',
    'course_slots',
    'course_enrollments',
    'topics',
    'question_bank',
    'student_attempts',
    'student_course_passports',
    'system_audit_logs'
  ];

  assert(
    requiredTables.every(t => tableNames.includes(t)),
    `Все 13 таблиц ядра присутствуют в SQLite (${tableNames.length} таблиц найдено)`
  );

  // 2. Проверка ОТСУТСТВИЯ удаленных таблиц
  const forbiddenTables = ['calendar_events', 'spaced_repetition_cards', 'retention_notifications'];
  const hasForbidden = forbiddenTables.some(t => tableNames.includes(t));
  assert(!hasForbidden, 'Таблицы calendar_events, spaced_repetition_cards, retention_notifications полностью отсутствуют');

  // 3. Проверка сида: ровно 2 организации с токенами
  const orgs = db.prepare('SELECT * FROM organizations').all() as any[];
  assert(orgs.length === 2, `В базе ровно 2 школы (найдено: ${orgs.length})`);
  assert(orgs.some(o => o.teacher_token === 'NIS-TEACHER-2026'), 'Токен NIS-TEACHER-2026 присутствует');
  assert(orgs.some(o => o.teacher_token === 'BIL-TEACHER-2026'), 'Токен BIL-TEACHER-2026 присутствует');

  // 4. Проверка Anti-Demo: 0 фейковых учеников
  const studentCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as { count: number };
  assert(studentCount.count === 0, `0 фейковых учеников в базе (найдено: ${studentCount.count})`);

  // 5. Проверка работы student_course_passports (Упрощенный % навыков + ELO)
  // Создаем тестового пользователя и курс
  const testUser = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role)
    VALUES ('test-uuid-1', 'student@test.kz', 'hash123', 'Тест Студент', 'student')
  `).run();
  const testUserId = Number(testUser.lastInsertRowid);

  const course = db.prepare('SELECT id FROM courses LIMIT 1').get() as { id: number };
  const testCourseId = course.id;

  const skillsJson = JSON.stringify({
    ALG_09_INEQ: {
      title: 'Квадратные неравенства',
      total_attempts: 10,
      correct_answers: 8,
      mastery_percent: 80.0,
      status: 'MASTERED'
    }
  });

  db.prepare(`
    INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json)
    VALUES (?, ?, 1120, 'OSKIN', ?)
  `).run(testUserId, testCourseId, skillsJson);

  const passport = db.prepare('SELECT * FROM student_course_passports WHERE student_id = ?').get(testUserId) as any;
  assert(passport !== undefined, 'Изолированный паспорт курса успешно создан');
  assert(passport.subject_elo === 1120, 'ELO в паспорте сохранен корректно (1120)');
  const parsedSkills = JSON.parse(passport.skills_progress_json);
  assert(parsedSkills.ALG_09_INEQ.mastery_percent === 80.0, 'Процент освоения навыка рассчитан и сохранен (80%)');

  // 6. Проверка записи в system_audit_logs (Без Anti-Jailbreak)
  db.prepare(`
    INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json, elo_delta)
    VALUES (?, 'student', ?, 'EUREKA_MOMENT', '{"question_id": 1}', 15)
  `).run(testUserId, testCourseId);

  const audit = db.prepare('SELECT * FROM system_audit_logs WHERE actor_user_id = ?').get(testUserId) as any;
  assert(audit !== undefined && audit.event_type === 'EUREKA_MOMENT', 'Запись в system_audit_logs создана (EUREKA_MOMENT)');
  assert(audit.elo_delta === 15, 'Дельта ELO в аудите зафиксирована (+15)');

  // 7. Проверка Foreign Keys (Каскадное удаление)
  db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);
  const passportAfterDelete = db.prepare('SELECT * FROM student_course_passports WHERE student_id = ?').get(testUserId);
  assert(passportAfterDelete === undefined, 'Каскадное удаление паспорта при удалении пользователя работает (Foreign Keys ON)');

  console.log('\n======================================================');
  console.log(`ИТОГ ВЕРИФИКАЦИИ ФАЗЫ 1: ${passed} пройдено, ${failed} провалено`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase1Verification();
}
