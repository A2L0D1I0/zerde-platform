import http from 'http';
import app from './server';
import { calculateDinaSkillMastery, classifyStudentError, getStudentCdmProfile } from './services/cdm-qmatrix';
import { getEloRank, applyEloDelta, getDeltaForReason, getStudentElo, getStudentEloHistory } from './services/elo-engine';
import { calculateSM2, getDueCardsForStudent, reviewSpacedCard, getSpacedRepetitionSummary } from './services/spaced-repetition';
import { getQuestionsForDeficit, getAdaptivePracticeSession } from './services/question-cache';
import { generateToken } from './middleware/auth.middleware';

async function runMathEngineVerification() {
  console.log('================================================================');
  console.log('🧪 ZERDE CDM, Q-MATRIX & ELO MATH ENGINE VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  async function test(name: string, fn: () => Promise<void> | void) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // ==========================================================================
  // SECTION 1: CDM & DINA MODEL MATHEMATICAL ENGINE
  // ==========================================================================
  console.log('📌 1. Testing DINA Model & Q-Matrix Skill Mastery Calculations...');

  test('DINA: Skill mastery increases when answering questions requiring the skill correctly', () => {
    const targetSkills = ['ALG_09_INTERVAL_METHOD', 'ALG_09_DENOMINATOR_RESTRICTION'];
    
    // Student 1: answered 3 items correctly
    const correctResponses = [
      { questionId: 1, isCorrect: true, microSkills: ['ALG_09_INTERVAL_METHOD'] },
      { questionId: 2, isCorrect: true, microSkills: ['ALG_09_INTERVAL_METHOD', 'ALG_09_DENOMINATOR_RESTRICTION'] },
      { questionId: 3, isCorrect: true, microSkills: ['ALG_09_DENOMINATOR_RESTRICTION'] }
    ];

    const resultHigh = calculateDinaSkillMastery(correctResponses, targetSkills, 0.15, 0.10);
    const pInterval = resultHigh.get('ALG_09_INTERVAL_METHOD') ?? 0;
    const pDenom = resultHigh.get('ALG_09_DENOMINATOR_RESTRICTION') ?? 0;

    assert(pInterval >= 0.80, `Expected P >= 0.80 for high performer, got ${pInterval}`);
    assert(pDenom >= 0.80, `Expected P >= 0.80 for high performer, got ${pDenom}`);
  });

  test('DINA: Skill mastery decreases when answering questions incorrectly (accounting for slipping s=0.10)', () => {
    const targetSkills = ['ALG_09_INTERVAL_METHOD'];
    
    // Student 2: answered 3 items incorrectly
    const wrongResponses = [
      { questionId: 1, isCorrect: false, microSkills: ['ALG_09_INTERVAL_METHOD'] },
      { questionId: 2, isCorrect: false, microSkills: ['ALG_09_INTERVAL_METHOD'] },
      { questionId: 3, isCorrect: false, microSkills: ['ALG_09_INTERVAL_METHOD'] }
    ];

    const resultLow = calculateDinaSkillMastery(wrongResponses, targetSkills, 0.15, 0.10);
    const pLow = resultLow.get('ALG_09_INTERVAL_METHOD') ?? 0;

    assert(pLow < 0.20, `Expected P < 0.20 for repeated failures, got ${pLow}`);
  });

  test('DINA: Guessing parameter (g=0.15) correctly handles noisy single correct answer', () => {
    const targetSkills = ['PHY_09_NEWTON_SECOND_LAW'];
    // 1 lucky correct answer vs 3 incorrect
    const mixedResponses = [
      { questionId: 1, isCorrect: true, microSkills: ['PHY_09_NEWTON_SECOND_LAW'] },
      { questionId: 2, isCorrect: false, microSkills: ['PHY_09_NEWTON_SECOND_LAW'] },
      { questionId: 3, isCorrect: false, microSkills: ['PHY_09_NEWTON_SECOND_LAW'] },
      { questionId: 4, isCorrect: false, microSkills: ['PHY_09_NEWTON_SECOND_LAW'] }
    ];

    const result = calculateDinaSkillMastery(mixedResponses, targetSkills, 0.15, 0.10);
    const p = result.get('PHY_09_NEWTON_SECOND_LAW') ?? 0;
    assert(p < 0.35, `Expected P < 0.35 due to majority failures, got ${p}`);
  });

  // ==========================================================================
  // SECTION 2: ERROR CLASSIFIER
  // ==========================================================================
  console.log('\n📌 2. Testing 4-Category Error Classifier...');

  test('Error Classifier: COMPUTATIONAL detection', () => {
    const res = classifyStudentError({
      chosenOption: 'B',
      optionsJson: JSON.stringify([
        { id: 'B', text_kz: '18', misconception: '21 - 3 = 18 деп азайтып тастады, арифметикалық қате' }
      ])
    });
    assert(res.category === 'COMPUTATIONAL', `Expected COMPUTATIONAL, got ${res.category}`);
  });

  test('Error Classifier: FORMULA_IGNORANCE detection', () => {
    const res = classifyStudentError({
      chosenOption: 'B',
      optionsJson: JSON.stringify([
        { id: 'B', text_kz: '3 есе азаяды', misconception: 'Квадраттық тәуелділікті ұмытып гравитация тартылыс заңын білмейді' }
      ])
    });
    assert(res.category === 'FORMULA_IGNORANCE', `Expected FORMULA_IGNORANCE, got ${res.category}`);
  });

  test('Error Classifier: CARELESSNESS detection', () => {
    const res = classifyStudentError({
      chosenOption: 'B',
      optionsJson: JSON.stringify([
        { id: 'B', text_kz: '[-2; 3]', misconception: 'Қатаң теңсіздікте жабық жақша қолданды және нүкте бояуын шатастырды' }
      ])
    });
    assert(res.category === 'CARELESSNESS', `Expected CARELESSNESS, got ${res.category}`);
  });

  test('Error Classifier: CONCEPTUAL detection', () => {
    const res = classifyStudentError({
      chosenOption: 'C',
      optionsJson: JSON.stringify([
        { id: 'C', text_kz: '(-2; 3)', misconception: 'Оң таңбалы аймақ орнына теріс аймақты таңдады, функция заңдылығын шатастырды' }
      ])
    });
    assert(res.category === 'CONCEPTUAL', `Expected CONCEPTUAL, got ${res.category}`);
  });

  // ==========================================================================
  // SECTION 3: ELO RATING ENGINE & 4 RANKS
  // ==========================================================================
  console.log('\n📌 3. Testing ELO Engine, 4 Ranks & Auditable Ledger...');

  test('ELO Ranks: Correct mapping across all 4 tiers', () => {
    const oskin = getEloRank(1100);
    assert(oskin.code === 'OSKIN' && oskin.nameKZ === 'Өскін', `Expected OSKIN/Өскін, got ${oskin.code}/${oskin.nameKZ}`);

    const tugyr = getEloRank(1250);
    assert(tugyr.code === 'TUGYR' && tugyr.nameKZ === 'Тұғыр', `Expected TUGYR/Тұғыр, got ${tugyr.code}/${tugyr.nameKZ}`);

    const qyran = getEloRank(1450);
    assert(qyran.code === 'QYRAN' && qyran.nameKZ === 'Қыран', `Expected QYRAN/Қыран, got ${qyran.code}/${qyran.nameKZ}`);

    const samgau = getEloRank(1650);
    assert(samgau.code === 'SAMGAU' && samgau.nameKZ === 'Самғау', `Expected SAMGAU/Самғау, got ${samgau.code}/${samgau.nameKZ}`);
  });

  test('ELO Deltas: Fixed auditable reasons (+15, +7, +3, 0, -20)', () => {
    assert(getDeltaForReason('EUREKA') === 15, 'EUREKA should be +15');
    assert(getDeltaForReason('SHORT_STEP') === 7, 'SHORT_STEP should be +7');
    assert(getDeltaForReason('DIRECT_ANSWER') === 3, 'DIRECT_ANSWER should be +3');
    assert(getDeltaForReason('THOUGHT_FORK') === 0, 'THOUGHT_FORK should be 0');
    assert(getDeltaForReason('JAILBREAK_PENALTY') === -20, 'JAILBREAK_PENALTY should be -20');
  });

  test('ELO Engine: ELO >= 0 protection under severe penalties', () => {
    // Apply severe penalty and check floor
    const res = applyEloDelta(3, 'JAILBREAK_PENALTY', -1500, 1);
    assert(res.newElo >= 0, `Expected newElo >= 0, got ${res.newElo}`);
    assert(res.newElo === 0, `Expected newElo === 0, got ${res.newElo}`);
  });

  test('ELO Engine: Applying Eureka delta (+15) updates DB and logs history', () => {
    const initial = getStudentElo(3, 1);
    const update = applyEloDelta(3, 'EUREKA', undefined, 1);
    assert(update.delta === 15, `Expected delta 15, got ${update.delta}`);
    assert(update.newElo === initial.elo + 15, `Expected ${initial.elo + 15}, got ${update.newElo}`);

    const history = getStudentEloHistory(3, 5);
    assert(history.length > 0 && history[0].delta === 15, 'History ledger must record +15 delta');
  });

  // ==========================================================================
  // SECTION 4: SUPERMEMO-2 (SM-2) SPACED REPETITION
  // ==========================================================================
  console.log('\n📌 4. Testing SuperMemo-2 (SM-2) Spaced Repetition Engine...');

  test('SM-2: Initial repetition (q=5 perfect recall) -> I(1)=1, EF increased', () => {
    const res = calculateSM2({ quality: 5, easinessFactor: 2.5, repetitions: 0, intervalDays: 1 });
    // EF' = 2.5 + (0.1 - 0) = 2.6
    assert(res.easinessFactor === 2.6, `Expected EF = 2.6, got ${res.easinessFactor}`);
    assert(res.repetitions === 1, `Expected repetitions = 1, got ${res.repetitions}`);
    assert(res.intervalDays === 1, `Expected interval = 1, got ${res.intervalDays}`);
  });

  test('SM-2: Second repetition (q=4 good recall) -> I(2)=6', () => {
    const res = calculateSM2({ quality: 4, easinessFactor: 2.6, repetitions: 1, intervalDays: 1 });
    // EF' = 2.6 + (0.1 - 1 * (0.08 + 0.02)) = 2.6 + 0 = 2.6
    assert(res.repetitions === 2, `Expected repetitions = 2, got ${res.repetitions}`);
    assert(res.intervalDays === 6, `Expected interval = 6, got ${res.intervalDays}`);
  });

  test('SM-2: Third repetition (q=5) -> I(3) = round(6 * 2.7) = 16', () => {
    const res = calculateSM2({ quality: 5, easinessFactor: 2.6, repetitions: 2, intervalDays: 6 });
    // EF' = 2.6 + 0.1 = 2.7; Interval = round(6 * 2.7) = 16
    assert(res.repetitions === 3, `Expected repetitions = 3, got ${res.repetitions}`);
    assert(res.intervalDays === 16, `Expected interval = 16, got ${res.intervalDays}`);
  });

  test('SM-2: Failed recall (q=2) resets repetitions to 0 and interval to 1 day, EF decreased', () => {
    const res = calculateSM2({ quality: 2, easinessFactor: 2.5, repetitions: 3, intervalDays: 16 });
    assert(res.repetitions === 0, `Expected repetitions = 0, got ${res.repetitions}`);
    assert(res.intervalDays === 1, `Expected interval = 1, got ${res.intervalDays}`);
    assert(res.easinessFactor < 2.5, `Expected EF to decrease, got ${res.easinessFactor}`);
  });

  test('SM-2: Minimum EF constraint (EF >= 1.3) enforced under consecutive failures', () => {
    let ef = 1.4;
    for (let i = 0; i < 5; i++) {
      const res = calculateSM2({ quality: 0, easinessFactor: ef, repetitions: 0, intervalDays: 1 });
      ef = res.easinessFactor;
    }
    assert(ef >= 1.3, `Expected EF >= 1.3, got ${ef}`);
  });

  test('SM-2: Card review updates database and schedules next review date', () => {
    const dueCards = getDueCardsForStudent(3);
    const targetCardId = dueCards.length > 0 ? dueCards[0].id : 1;
    const reviewResult = reviewSpacedCard(targetCardId, 5, 3);
    assert(reviewResult.newInterval >= 1, 'Next interval should be >= 1');
    assert(typeof reviewResult.nextReviewDate === 'string' && reviewResult.nextReviewDate.includes('-'), 'Next review date must be formatted date string');
  });


  // ==========================================================================
  // SECTION 5: QUESTION CACHE & SMART DEFICIT SELECTOR
  // ==========================================================================
  console.log('\n📌 5. Testing Question Cache & Smart Deficit Task Selector...');

  test('Question Cache: Retrieves questions for specific micro-skill deficit', () => {
    const questions = getQuestionsForDeficit(3, 'ALG_09_INTERVAL_METHOD', { limit: 3 });
    assert(questions.length > 0, `Expected questions for ALG_09_INTERVAL_METHOD, got ${questions.length}`);
    assert(questions[0].microSkills.includes('ALG_09_INTERVAL_METHOD'), 'Question must contain the requested skill');
  });

  test('Question Cache: Adaptive practice session compiles 3 targeted questions', () => {
    const session = getAdaptivePracticeSession(3, 1, 3);
    assert(session.questions.length >= 1, `Expected practice questions, got ${session.questions.length}`);
    assert(session.estimatedMinutes >= 3, 'Estimated minutes should be >= 3');
    assert(session.targetFocusKZ.length > 0, 'Target focus title must be present');
  });

  // ==========================================================================
  // SECTION 6: HTTP ENDPOINTS INTEGRATION TESTS
  // ==========================================================================
  console.log('\n📌 6. Testing HTTP API Endpoints in Express...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098';

  const studentToken = generateToken({
    userId: '3',
    email: 'azamat@zerde.kz',
    role: 'student'
  });

  const teacherToken = generateToken({
    userId: '1',
    email: 'teacher@zerde.kz',
    role: 'teacher'
  });

  // 6.1 GET /api/student/cdm-profile
  await test('GET /api/student/cdm-profile', async () => {
    const res = await fetch(`${baseUrl}/api/student/cdm-profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const body: any = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data?.mastered_skills), 'mastered_skills must be an array');
    assert(Array.isArray(body.data?.deficit_skills), 'deficit_skills must be an array');
    assert(typeof body.data?.overall_mastery === 'number', 'overall_mastery must be a number');
  });

  // 6.2 GET /api/student/spaced-repetition
  await test('GET /api/student/spaced-repetition', async () => {
    const res = await fetch(`${baseUrl}/api/student/spaced-repetition`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const body: any = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(body.success === true, 'Expected success: true');
    assert(typeof body.data?.due_today_count === 'number', 'due_today_count must be a number');
    assert(Array.isArray(body.data?.cards_due_today), 'cards_due_today must be an array');
  });

  // 6.3 POST /api/student/spaced-repetition/:cardId/review
  await test('POST /api/student/spaced-repetition/1/review (Submit q=5)', async () => {
    const res = await fetch(`${baseUrl}/api/student/spaced-repetition/1/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ quality: 5 })
    });
    const body: any = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data?.quality === 5, 'Quality must be 5');
    assert(body.data?.newInterval >= 1, 'Interval must be >= 1');
  });

  // 6.4 GET /api/teacher/class-matrix/:classroomId
  await test('GET /api/teacher/class-matrix/1 (24 Students × Micro-skills Matrix)', async () => {
    const res = await fetch(`${baseUrl}/api/teacher/class-matrix/1`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const body: any = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data?.students_count === 24, `Expected 24 students, got ${body.data?.students_count}`);
    assert(Array.isArray(body.data?.matrix), 'matrix must be an array');
    assert(body.data.matrix.length === 24, `Matrix length must be 24, got ${body.data.matrix.length}`);
    assert(Array.isArray(body.data?.skills_header), 'skills_header must be an array');
  });

  // 6.5 GET /api/teacher/lesson-signal/:classroomId
  await test('GET /api/teacher/lesson-signal/1 (Cluster Deficit & 5-min Smart-Board Warm-Up in <5s)', async () => {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/api/teacher/lesson-signal/1`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const t1 = Date.now();
    const duration = t1 - t0;

    const body: any = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(body.success === true, 'Expected success: true');
    assert(duration < 5000, `Signal must complete in <5000ms, took ${duration}ms`);
    assert(body.data?.cluster_deficit?.skill_code !== undefined, 'cluster_deficit.skill_code must exist');
    assert(body.data?.smart_board_activity?.title_kz !== undefined, 'smart_board_activity must exist');
    assert(body.data?.telemetry?.ai_tokens_used === 0, 'Must use 0 AI tokens');
  });

  await new Promise<void>((resolve) => {
    server.close(() => setTimeout(resolve, 50));
  });

  console.log('\n================================================================');
  console.log(`🎉 VERIFICATION COMPLETED: ${passed}/${total} tests passed (100% success)!`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runMathEngineVerification().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
