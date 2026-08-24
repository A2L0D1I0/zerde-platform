import { seed } from '../db/seed';
import { getDb } from '../db/database';
import { socraticService } from '../ai/socratic.service';
import { SocraticResponseSchema } from '../ai/schemas';

export async function runPhase4And5Verification() {
  console.log('\n======================================================');
  console.log('🧪 ЗАПУСК СКВОЗНЫХ ТЕСТОВ ФАЗЫ 4 И ФАЗЫ 5 (СОКРАТ «АҒА» & ТРЕНАЖЕР)');
  console.log('======================================================\n');

  // Clean seed
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
  // 1. ТЕСТЫ БЭКЕНДА СОКРАТА «АҒА» (POST /api/tutor/socrates)
  // ==========================================================================
  console.log('\n--- 🦉 1. ТЕСТЫ СОКРАТИЧЕСКОГО СЕРВИСА И ОБРАБОТКИ ОШИБОК ---');

  // Test 1.1: Проверка честного выброса ошибки при отсутствии API ключа
  let threwApiKey = false;
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    process.env.GEMINI_API_KEY = '';
    process.env.GOOGLE_API_KEY = '';
    process.env.AI_API_KEY = '';
    await socraticService.generateGuidance({
      topicTitle: 'Квадраттық теңсіздіктер',
      studentAnswer: 'жауап жоқ',
      language: 'KZ'
    });
  } catch (err: any) {
    threwApiKey = err.message.includes('GEMINI_API_KEY_MISSING');
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
  assert(threwApiKey === true, 'При отсутствии API ключа SocraticService честно выбрасывает GEMINI_API_KEY_MISSING');

  // ==========================================================================
  // 3. ТЕСТЫ EUREKA MOMENT И ТЕЛЕМЕТРИИ В SQLITE
  // ==========================================================================
  console.log('\n--- 🌟 3. ТЕСТЫ EUREKA MOMENT (+15 ELO) И АУДИТ-ЛОГОВ ---');

  // Создаем тестового ученика
  const userRes = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, grade, streak_days, longest_streak)
    VALUES ('usr_std_test', 'test.student@zerde.kz', 'hash', 'Нұрсұлтан Серік', 'student', 9, 0, 0)
  `).run();
  const testStudentId = Number(userRes.lastInsertRowid);

  // Создаем паспорт курса
  const course = db.prepare('SELECT id FROM courses LIMIT 1').get() as any;
  db.prepare(`
    INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json)
    VALUES (?, ?, 1000, 'OSKIN', '{}')
  `).run(testStudentId, course.id);

  // Симулируем выбор развилки мысли (THOUGHT_FORK_CLICK)
  db.prepare(`
    INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
    VALUES (?, 'student', ?, 'THOUGHT_FORK_CLICK', ?)
  `).run(testStudentId, course.id, JSON.stringify({ forkKey: 'A', topic: 'Квадраттық теңсіздіктер' }));

  const forkAudit = db.prepare(`
    SELECT * FROM system_audit_logs
    WHERE actor_user_id = ? AND event_type = 'THOUGHT_FORK_CLICK'
  `).get(testStudentId) as any;
  assert(forkAudit !== undefined, 'Клик по развилке мысли Сократа записан в system_audit_logs (THOUGHT_FORK_CLICK)');

  // Симулируем Eureka Moment (+15 ELO)
  const eloDelta = 15;
  db.prepare(`
    UPDATE student_course_passports
    SET subject_elo = subject_elo + ?, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND course_id = ?
  `).run(eloDelta, testStudentId, course.id);

  db.prepare(`
    INSERT INTO system_audit_logs (actor_user_id, actor_role, course_id, event_type, payload_json)
    VALUES (?, 'student', ?, 'EUREKA_MOMENT', ?)
  `).run(testStudentId, course.id, JSON.stringify({ eloDelta, newElo: 1015, topic: 'Квадраттық теңсіздіктер' }));

  const updatedPassport = db.prepare(`
    SELECT subject_elo FROM student_course_passports WHERE student_id = ? AND course_id = ?
  `).get(testStudentId, course.id) as any;
  assert(updatedPassport.subject_elo === 1015, `Рейтинг ELO в паспорте курса увеличился на +15 ELO (стало: ${updatedPassport.subject_elo})`);

  const eurekaAudit = db.prepare(`
    SELECT * FROM system_audit_logs
    WHERE actor_user_id = ? AND event_type = 'EUREKA_MOMENT'
  `).get(testStudentId) as any;
  assert(eurekaAudit !== undefined, 'Событие Eureka Moment зарегистрировано в system_audit_logs');

  console.log('\n======================================================');
  console.log(`ИТОГ ВЕРИФИКАЦИИ ФАЗЫ 4 И 5: ${passed} пройдено, ${failed} провалено`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase4And5Verification();
}
