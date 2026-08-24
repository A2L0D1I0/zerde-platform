import { resetDatabase, initDatabase, getDb, updatePassportTransaction } from '../db/database';
import { seed } from '../db/seed';
import {
  CoPilotAgentResponseSchema,
  SilentGraderResponseSchema,
  NavigatorAdviceSchema,
  SocraticResponseSchema
} from '../ai/schemas';

async function runPhase1Verification() {
  console.log('======================================================');
  console.log('🧪 ЗАПУСК ВЕРИФИКАЦИИ ФАЗЫ 1 (DDL, TRANSACTIONS & ZOD)');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // ШАГ 1: Сброс и Инициализация Базы Данных SQLite (14 Таблиц)
    // ------------------------------------------------------------------------
    console.log('--- 🗄️ ШАГ 1: Проверка DDL Схемы и Таблиц SQLite ---');
    seed();
    const db = getDb();

    const expectedTables = [
      'organizations',
      'user_organization_roles',
      'users',
      'classrooms',
      'classroom_students',
      'courses',
      'course_material_slots',
      'course_curriculum_plans',
      'course_enrollments',
      'topics',
      'question_bank',
      'student_attempts',
      'student_course_passports',
      'system_audit_logs'
    ];

    const tablesInDb = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];
    const tableNames = new Set(tablesInDb.map((t) => t.name));

    for (const table of expectedTables) {
      assert(tableNames.has(table), `Таблица «${table}» успешно создана в SQLite`);
    }

    // ------------------------------------------------------------------------
    // ШАГ 2: Проверка полей новых таблиц
    // ------------------------------------------------------------------------
    console.log('\n--- 📋 ШАГ 2: Проверка структуры новых колонок ---');
    
    // Проверка course_material_slots
    const slotColumns = db.prepare("PRAGMA table_info(course_material_slots)").all() as any[];
    const slotColNames = slotColumns.map(c => c.name);
    assert(slotColNames.includes('content_text'), 'course_material_slots содержит поле content_text');
    assert(slotColNames.includes('is_locked'), 'course_material_slots содержит поле is_locked');

    // Проверка course_enrollments
    const enrollColumns = db.prepare("PRAGMA table_info(course_enrollments)").all() as any[];
    const enrollColNames = enrollColumns.map(c => c.name);
    assert(enrollColNames.includes('motivation_text'), 'course_enrollments содержит поле motivation_text');
    assert(enrollColNames.includes('assigned_classroom_id'), 'course_enrollments содержит поле assigned_classroom_id');

    // Проверка question_bank
    const qColumns = db.prepare("PRAGMA table_info(question_bank)").all() as any[];
    const qColNames = qColumns.map(c => c.name);
    assert(qColNames.includes('solution_model'), 'question_bank содержит поле solution_model');
    assert(qColNames.includes('topic_tag'), 'question_bank содержит поле topic_tag');
    assert(qColNames.includes('target_tier'), 'question_bank содержит поле target_tier');

    // ------------------------------------------------------------------------
    // ШАГ 3: Проверка Атомарных Транзакций updatePassportTransaction
    // ------------------------------------------------------------------------
    console.log('\n--- 🔐 ШАГ 3: Тестирование Атомарных Транзакций Паспорта ---');
    
    // 1. Создаем тестового ученика
    const insertUser = db.prepare(`
      INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const studentRes = insertUser.run(
      'uuid-test-student-1',
      'test.student1@nis.edu.kz',
      'hashed_pass',
      'Бақытжан Нұрлан',
      'student',
      9,
      'NIS IB Astana'
    );
    const testStudentId = Number(studentRes.lastInsertRowid);
    const testCourseId = 1;

    // 2. Инициализация и первичное обновление через транзакцию
    const initialPassport = updatePassportTransaction(testStudentId, testCourseId, (curr) => {
      return {
        subject_elo: 1000,
        rank_tier: 'OSKIN',
        skills: {
          ALG_09_INEQ: {
            total_attempts: 1,
            correct_answers: 0,
            mastery_percent: 0,
            status: 'DEFICIENT'
          }
        },
        teacher_daily_notes: [
          { id: 'note_1', date: '2026-08-24', note: 'Қажеттілік: интервалдар әдісі' }
        ]
      };
    });

    assert(initialPassport.subject_elo === 1000, 'Транзакция создала начальный паспорт с 1000 ELO');
    assert(initialPassport.skills.ALG_09_INEQ.status === 'DEFICIENT', 'Статус навыка DEFICIENT записан в JSON');

    // 3. Последующий мердж через транзакцию (ученик решил задачу)
    const updatedPassport = updatePassportTransaction(testStudentId, testCourseId, (curr) => {
      const skills = { ...curr.skills };
      skills.ALG_09_INEQ = {
        total_attempts: 2,
        correct_answers: 1,
        mastery_percent: 50,
        status: 'DEVELOPING'
      };
      return {
        subject_elo: curr.subject_elo + 15,
        skills
      };
    });

    assert(updatedPassport.subject_elo === 1015, 'Атомарный инкремент ELO через транзакцию (+15 = 1015 ELO)');
    assert(updatedPassport.skills.ALG_09_INEQ.status === 'DEVELOPING', 'Мердж навыка: статус обновился до DEVELOPING');
    assert(updatedPassport.teacher_daily_notes.length === 1, 'Заметки учителя сохранены при мердже (защита от перезаписи)');

    // ------------------------------------------------------------------------
    // ШАГ 4: Валидация Zod-схем Новых AI-Контрактов
    // ------------------------------------------------------------------------
    console.log('\n--- 🤖 ШАГ 4: Валидация Zod-Контрактов AI-Сервисов ---');

    // 1. CoPilotAgentResponseSchema
    const mockCoPilotResponse = {
      chat_reply: 'Сәлеметсіз бе! 9-сынып бойынша 1-тоқсанның оқу жоспарын ГОСО және оқулыққа сәйкес дайындадым.',
      suggested_plan_markdown: '# 1-тоқсан: Теңсіздіктер\n- 1-апта: Квадраттық теңсіздіктер\n- 2-апта: Бөлшек-рационал теңсіздіктер',
      generated_quiz: {
        topic_title: 'Квадраттық теңсіздіктер',
        questions: [
          {
            question_kz: 'Теңсіздікті шешіңіз: $x^2 - 9 < 0$',
            katex_snippet: 'x^2 - 9 < 0',
            options: [
              { id: 'A', text: '(-3; 3)' },
              { id: 'B', text: '[-3; 3]' }
            ],
            correct_answer: 'A',
            explanation_kz: 'Түбірлері -3 және 3. Аралық: (-3; 3).',
            difficulty: 2,
            skill_code: 'ALG_09_INEQ'
          }
        ]
      }
    };
    const parsedCopilot = CoPilotAgentResponseSchema.safeParse(mockCoPilotResponse);
    assert(parsedCopilot.success, 'CoPilotAgentResponseSchema успешно валидирует ответ Копилота');

    // 2. SilentGraderResponseSchema
    const mockGraderResponse = {
      score_xp: 15,
      verdict: 'FULL_CREDIT',
      technical_rationale: 'Student demonstrated rigorous step-by-step factorization and correctly excluded denominator zeros from the interval.',
      feedback_for_student: 'Жарайсың! Бөлшек бөлімінің нөлін дұрыс ескеріп, аралықты дәл анықтадың.',
      anti_cheat_flag: false
    };
    const parsedGrader = SilentGraderResponseSchema.safeParse(mockGraderResponse);
    assert(parsedGrader.success, 'SilentGraderResponseSchema валидирует структурированный вердикт Типа Б на EN');

    // 3. NavigatorAdviceSchema
    const mockNavigatorResponse = {
      greeting: 'Сәлем, Бақытжан! Бүгінгі оқу мақсатың дайын.',
      primary_focus_course_id: 1,
      recommended_topic_title: 'Аралықтар әдісі',
      rationale: 'Алгебра курсында «ALG_09_INEQ» микронавыгы бойынша рейтингіңді көтеру қажет.',
      encouragement: 'Күніне 10 минут жаттығу сені келесі рангке жеткізеді!'
    };
    const parsedNavigator = NavigatorAdviceSchema.safeParse(mockNavigatorResponse);
    assert(parsedNavigator.success, 'NavigatorAdviceSchema валидирует персональный совет дня ученику');

    // ------------------------------------------------------------------------
    // ИТОГИ ВЕРИФИКАЦИИ
    // ------------------------------------------------------------------------
    console.log('\n======================================================');
    console.log(`🎉 ИТОГ ВЕРИФИКАЦИИ ФАЗЫ 1: ${passed} тестов пройдено, ${failed} провалено`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Непредвиденная ошибка верификации Фазы 1:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase1Verification();
}
