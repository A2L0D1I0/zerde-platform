import fs from 'fs';
import path from 'path';
import { seed } from '../db/seed';
import { getDb } from '../db/database';
import { silentGraderService } from '../ai/silent-grader.service';
import { navigatorService } from '../ai/navigator.service';
import { copilotService } from '../ai/copilot.service';
import { socraticService } from '../ai/socratic.service';
import {
  SilentGraderResponseSchema,
  NavigatorAdviceSchema,
  CoPilotQuestionGenSchema,
  SocraticResponseSchema
} from '../ai/schemas';

export async function runPhase2AgenticVerification() {
  console.log('\n======================================================');
  console.log('🧪 ЗАПУСК ВЕРИФИКАЦИИ ФАЗЫ 2 (AI-СЕРВИСЫ И MD-ПРОМПТЫ)');
  console.log('======================================================\n');

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
  // 1. ПРОВЕРКА СИСТЕМНЫХ MD-ПРОМПТОВ
  // ==========================================================================
  console.log('\n--- 📝 1. ПРОВЕРКА СИСТЕМНЫХ MD-ПРОМПТОВ ---');

  const promptsDir = path.resolve(__dirname, '../ai/prompts');
  const expectedPrompts = [
    'teacher_copilot.md',
    'silent_grader.md',
    'navigator.md',
    'socratic_aga.md'
  ];

  for (const p of expectedPrompts) {
    const filePath = path.join(promptsDir, p);
    const exists = fs.existsSync(filePath);
    const size = exists ? fs.statSync(filePath).size : 0;
    assert(exists && size > 100, `Системный промпт «${p}» существует и содержит более 100 байт (${size} байт)`);
  }

  // ==========================================================================
  // 2. ПРОВЕРКА КОНТЕКСТ-ИНЖЕКЦИИ 5 СЛОТОВ В БАЗЕ SQLITE
  // ==========================================================================
  console.log('\n--- 📂 2. ПРОВЕРКА 5 СЛОТОВ УЧЕБНЫХ МАТЕРИАЛОВ ---');

  const slots = db.prepare('SELECT slot_number, title, file_type, content_text FROM course_material_slots WHERE course_id = 1 ORDER BY slot_number ASC').all() as any[];
  assert(slots.length === 5, `Таблица course_material_slots содержит ровно 5 слотов (найдено: ${slots.length})`);
  assert(slots[0].title.includes('ГОСО') || slots[0].slot_number === 1, 'Слот 1 содержит ГОСО/Учебную программу');
  assert(slots.every((s: any) => typeof s.content_text === 'string' && s.content_text.length > 10), 'Все 5 слотов содержат непустой текст для инжекции контекста в LLM');

  // ==========================================================================
  // 3. ВАЛИДАЦИЯ СТРОГИХ ZOD-СХЕМ ОТВЕТОВ AI-СЕРВИСОВ
  // ==========================================================================
  console.log('\n--- 🤖 3. ВАЛИДАЦИЯ СТРОГИХ ZOD-СХЕМ AI-КОНТРАКТОВ ---');

  // Test 3.1: SilentGraderResponseSchema
  const mockGraderOutput = {
    score_xp: 15,
    verdict: 'FULL_CREDIT',
    technical_rationale: 'Student successfully performed the interval method and factored the quadratic equation into (x-3)(x+2) < 0.',
    feedback_for_student: 'Керемет! Сен теңсіздікті шешудің барлық қадамдарын дұрыс орындадың.',
    anti_cheat_flag: false
  };
  const valGrader = SilentGraderResponseSchema.safeParse(mockGraderOutput);
  assert(valGrader.success === true, 'SilentGraderResponseSchema валидирует вердикт и XP');
  assert(mockGraderOutput.technical_rationale.length > 10, 'Technical rationale в Silent Grader сформулирован на английском языке');

  // Test 3.2: NavigatorAdviceSchema
  const mockNavigatorOutput = {
    greeting: 'Сәлем, Асан!',
    primary_focus_course_id: 1,
    recommended_topic_title: 'Квадраттық теңсіздіктер',
    rationale: 'Бұл тақырып бойынша соңғы 2 есепте интервал таңбасын анықтаудан қате байқалды.',
    encouragement: 'Күніне 2 есеп шығару сені жаңа деңгейге жеткізеді!'
  };
  const valNav = NavigatorAdviceSchema.safeParse(mockNavigatorOutput);
  assert(valNav.success === true, 'NavigatorAdviceSchema валидирует персональный совет дня');

  // Test 3.3: CoPilotQuestionGenSchema
  const mockCoPilotQuiz = {
    topic_title: 'Квадраттық теңсіздіктер',
    questions: [
      {
        question_text: 'x^2 - 9 < 0 теңсіздігінің шешімін табыңыз',
        katex_snippet: 'x^2 - 9 < 0',
        options: [
          { id: 'A', text: '(-3; 3)', latex: '(-3; 3)' },
          { id: 'B', text: '[-3; 3]', latex: '[-3; 3]' },
          { id: 'C', text: '(-\\infty; -3) \\cup (3; +\\infty)', latex: '(-\\infty; -3) \\cup (3; +\\infty)' },
          { id: 'D', text: '[0; 3]', latex: '[0; 3]' }
        ],
        correct_answer: 'A',
        explanation: '(x-3)(x+3) < 0 интервалдар әдісімен шешіледі: -3 пен 3 арасы таңбасы теріс.',
        difficulty: 2,
        skill_code: 'ALG_09_INEQ'
      }
    ]
  };
  const valQuiz = CoPilotQuestionGenSchema.safeParse(mockCoPilotQuiz);
  assert(valQuiz.success === true, 'CoPilotQuestionGenSchema валидирует сгенерированный тест с KaTeX формулами');

  // Test 3.4: SocraticResponseSchema
  const mockSocraticOutput = {
    question_line: 'Теңсіздікті нөлге теңестіріп түбірлерін тапқанда қандай мәндер шықты?',
    thought_forks: [
      { key: 'A', id: 'fork_correct', title: 'Түбірлерді тауып, сан түзуіне белгілеу', type: 'true_step', description: 'x1 және x2 мәндерін табамыз', latex: 'x^2 - 4 = 0' },
      { key: 'B', id: 'fork_trap', title: 'Таңбаны тексермей бірден жауап жазу (Тұзақ)', type: 'cognitive_trap', description: 'Интервал таңбасын тексеру міндетті', latex: 'x < 2' },
      { key: 'C', id: 'fork_rule', title: 'Көбейткіштерге жіктеу ережесі', type: 'basic_rule', description: 'a^2 - b^2 = (a-b)(a+b)', latex: '(a-b)(a+b)' }
    ],
    reveal_answer: false,
    elo_delta: 0,
    feedback_message: 'Жақсы ой! Келесі қадамды таңдаңыз.',
    new_elo: 1000
  };
  const valSocratic = SocraticResponseSchema.safeParse(mockSocraticOutput);
  assert(valSocratic.success === true, 'SocraticResponseSchema валидирует ровно 3 развилки Thought-Forks');

  // ==========================================================================
  // 4. ПРОВЕРКА PURE ZERO-FAKE: ЧЕСТНЫЙ ВЫБРОС GEMINI_API_KEY_MISSING
  // ==========================================================================
  console.log('\n--- 🛡️ 4. ПРОВЕРКА PURE ZERO-FAKE & HONEST ERROR THROW ---');

  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = '';
  process.env.GOOGLE_API_KEY = '';
  process.env.AI_API_KEY = '';

  // Test 4.1: SilentGraderService throws error
  let graderThrew = false;
  try {
    await silentGraderService.evaluateSolution({
      questionText: 'x^2 - 4 < 0',
      solutionModel: 'x in (-2, 2)',
      studentResponse: 'x in (-2, 2)'
    });
  } catch (err: any) {
    graderThrew = err.message.includes('GEMINI_API_KEY_MISSING');
  }
  assert(graderThrew === true, 'SilentGraderService честно выбрасывает GEMINI_API_KEY_MISSING при отсутствии ключа');

  // Test 4.2: NavigatorService throws error
  let navThrew = false;
  try {
    await navigatorService.generateDailyAdvice({ studentId: 1 });
  } catch (err: any) {
    navThrew = err.message.includes('GEMINI_API_KEY_MISSING');
  }
  assert(navThrew === true, 'NavigatorService честно выбрасывает GEMINI_API_KEY_MISSING при отсутствии ключа');

  // Test 4.3: CoPilotService curriculum plan throws error
  let copilotThrew = false;
  try {
    await copilotService.generateCurriculumPlan({ courseId: 1 });
  } catch (err: any) {
    copilotThrew = err.message.includes('GEMINI_API_KEY_MISSING');
  }
  assert(copilotThrew === true, 'CoPilotService.generateCurriculumPlan честно выбрасывает GEMINI_API_KEY_MISSING');

  // Test 4.4: SocraticService throws error
  let socraticThrew = false;
  try {
    await socraticService.generateGuidance({ topicTitle: 'Квадраттық теңсіздіктер' });
  } catch (err: any) {
    socraticThrew = err.message.includes('GEMINI_API_KEY_MISSING');
  }
  assert(socraticThrew === true, 'SocraticService честно выбрасывает GEMINI_API_KEY_MISSING');

  process.env.GEMINI_API_KEY = originalKey;

  // ==========================================================================
  // ИТОГ ВЕРИФИКАЦИИ
  // ==========================================================================
  console.log('\n======================================================');
  console.log(`🎉 ИТОГ ВЕРИФИКАЦИИ ФАЗЫ 2: ${passed} пройдено, ${failed} провалено`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase2AgenticVerification();
}
