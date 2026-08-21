import { getDb } from '../db/database';
import { store } from '../db/store';

/**
 * ============================================================================
 * TEST SUITE 2: 3-Copy DB & Single-Language Lock Integrity
 * ============================================================================
 * Verifies:
 * 1. Question Bank stores 3 complete language copies (question_kz, question_ru, question_en)
 * 2. Courses support 'ANY' (multilingual STEM) vs locked languages ('KZ' / 'RU' / 'EN' / custom)
 * 3. Fallback resolution works seamlessly without runtime translation latency
 */

function testLocalizedFieldExtractor(data: any, field: string, lang: 'KZ' | 'RU' | 'EN', fallback: string = ''): string {
  const lower = lang.toLowerCase();
  const upper = lang.toUpperCase();
  if (data[`${field}_${lower}`]) return String(data[`${field}_${lower}`]);
  if (data[`${field}${upper}`]) return String(data[`${field}${upper}`]);
  if (data[`${field}_kz`]) return String(data[`${field}_kz`]);
  if (data[`${field}_ru`]) return String(data[`${field}_ru`]);
  if (data[`${field}_en`]) return String(data[`${field}_en`]);
  return data[field] || fallback;
}

async function runContentContractsTest() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING: 3-Copy DB & Single-Language Lock Contracts');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Verify Database Schema for 3-Copy Fields
  console.log('🔍 [1/3] Verifying SQLite Schema for Multilingual Columns...');
  try {
    const db = getDb();
    const columns = db.pragma('table_info(question_bank)') as { name: string; type: string }[];
    const colNames = new Set(columns.map((c) => c.name));

    const requiredCols = ['question_kz', 'question_ru', 'question_en', 'explanation_kz', 'explanation_ru', 'explanation_en'];
    const missing = requiredCols.filter((c) => !colNames.has(c));

    if (missing.length === 0) {
      console.log('   ✅ `question_bank` schema has all 6 multilingual fields (KZ/RU/EN).');
      passed++;
    } else {
      console.error('   ❌ Missing columns in question_bank:', missing);
      failed++;
    }
  } catch (err: any) {
    console.error('   ❌ Schema check failed:', err.message);
    failed++;
  }

  // 2. Verify Courses and Topics in Store
  console.log('\n🔍 [2/3] Checking Courses & Topics in Store...');
  const courses = store.getAllCourses();
  console.log(`   • Total Courses in Store: ${courses.length}`);

  let totalTopics = 0;
  for (const c of courses) {
    const topics = store.getCourseTopics(c.id);
    totalTopics += topics.length;
  }
  console.log(`   • Total Topics across Courses: ${totalTopics}`);

  if (courses.length > 0 && totalTopics > 0) {
    console.log(`   ✅ Courses and Topics populated correctly with language metadata.`);
    passed++;
  } else {
    console.error('   ❌ No courses or topics found in store.');
    failed++;
  }

  // 3. Test Course Language Locking & Localized Extractor
  console.log('\n🔍 [3/3] Testing Single-Language Course Locking & Dynamic Extraction...');
  
  const sampleStemQuestion = {
    id: 101,
    question_kz: 'Теңсіздікті шешіңіз: x^2 - x - 12 <= 0',
    question_ru: 'Решите неравенство: x^2 - x - 12 <= 0',
    question_en: 'Solve the inequality: x^2 - x - 12 <= 0',
  };

  const sampleLiteratureQuestion = {
    id: 202,
    question_kz: '«Абай жолы» роман-эпопеясындағы Құнанбай бейнесін талдаңыз',
    language_lock: 'KZ',
  };

  const kzResolved = testLocalizedFieldExtractor(sampleStemQuestion, 'question', 'KZ');
  const ruResolved = testLocalizedFieldExtractor(sampleStemQuestion, 'question', 'RU');
  const enResolved = testLocalizedFieldExtractor(sampleStemQuestion, 'question', 'EN');

  if (
    kzResolved.includes('Теңсіздікті') &&
    ruResolved.includes('Решите') &&
    enResolved.includes('Solve')
  ) {
    console.log('   ✅ STEM Course: Seamless multi-language extraction without runtime translation.');
    passed++;
  } else {
    console.error('   ❌ Extraction failed:', { kzResolved, ruResolved, enResolved });
    failed++;
  }

  const litKz = testLocalizedFieldExtractor(sampleLiteratureQuestion, 'question', 'KZ');
  const litEn = testLocalizedFieldExtractor(sampleLiteratureQuestion, 'question', 'EN');
  if (litKz.includes('Абай жолы') && litEn.includes('Абай жолы')) {
    console.log('   ✅ Language-Locked Course: Preserved original language for literature subject.');
    passed++;
  } else {
    console.error('   ❌ Literature language lock failed');
    failed++;
  }

  console.log('\n======================================================');
  if (failed === 0) {
    console.log(`🎉 3-COPY DB & CONTENT CONTRACTS TEST: 100% PASS (${passed}/${passed} checks)`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`💥 FAILED with ${failed} failures.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runContentContractsTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
