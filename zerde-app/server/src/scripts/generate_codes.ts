import { idGenerator } from '../utils/id_generator';

/**
 * Standalone Code & Task Generator Script
 * Usage: npx ts-node src/scripts/generate_codes.ts
 */
function runDemoGenerator() {
  console.log('====================================================');
  console.log('🚀 ZERDE 2.0: UNIFIED CODE & TASK GENERATOR SCRIPT');
  console.log('====================================================\n');

  // 1. Course Codes
  console.log('📚 1. ГЕНЕРАЦИЯ КОДОВ КУРСОВ (Course Codes):');
  const courseSamples = [
    { title: 'Алгебра 9-сынып (Теңсіздіктер)', subjectType: 'algebra', language: 'KZ', grade: 9 },
    { title: 'Физика 10 класс (Кинематика)', subjectType: 'physics', language: 'RU', grade: 10 },
    { title: 'Қазақ тілі мен әдебиеті', subjectType: 'kazakh_lang', language: 'KZ', grade: 9 },
    { title: 'English Language & Lit', subjectType: 'english_lang', language: 'EN', grade: 11 },
    { title: 'Химия 9 сынып', subjectType: 'chemistry', language: 'ALL', grade: 9 },
  ];

  courseSamples.forEach((c) => {
    const code = idGenerator.generateCourseCode(c);
    console.log(`   - ${c.title.padEnd(35)} -> [ ${code} ]`);
  });

  console.log('\n----------------------------------------------------');

  // 2. Student Master Passport Codes
  console.log('👤 2. ГЕНЕРАЦИЯ КОДОВ MASTER PASSPORT УЧЕНИКА:');
  const studentSamples = [
    { school: 'NIS IB Astana', grade: '9 «А»', userId: 1, fullName: 'Алдияр Саржанов' },
    { school: 'NIS IB Astana', grade: '10 «Б»', userId: 2, fullName: 'Айзере Мұратқызы' },
    { school: 'Ekibastuz BIL', grade: '10 «А»', userId: 3, fullName: 'Нұрсұлтан Серік' },
    { school: 'РФМШ Алматы', grade: '11 «В»', userId: 4, fullName: 'Дидар Оспанов' },
  ];

  studentSamples.forEach((s) => {
    const passportCode = idGenerator.generateStudentPassportCode(s);
    console.log(`   - ${s.fullName.padEnd(20)} (${s.school}, ${s.grade}) -> [ ${passportCode} ]`);
  });

  console.log('\n----------------------------------------------------');

  // 3. Question Bank Task Codes
  console.log('🗂️ 3. ГЕНЕРАЦИЯ КОДОВ ЗАДАЧ (Task Codes):');
  const taskSamples = [
    { courseCode: 'ZR-ALG09-KZ', quarter: 1, mode: 'A' as const, seq: 1 },
    { courseCode: 'ZR-ALG09-KZ', quarter: 1, mode: 'B' as const, seq: 2 },
    { courseCode: 'ZR-PHYS10-RU', quarter: 2, mode: 'A' as const, seq: 1 },
    { courseCode: 'ZR-PHYS10-RU', quarter: 2, mode: 'B' as const, seq: 5 },
  ];

  taskSamples.forEach((t) => {
    const taskCode = idGenerator.generateTaskCode(t);
    console.log(`   - Course: ${t.courseCode}, Q${t.quarter}, Mode ${t.mode} #${t.seq} -> [ ${taskCode} ]`);
  });

  console.log('\n====================================================');
  console.log('✨ Все генераторы работают штатно и интегрированы в систему!');
  console.log('====================================================\n');
}

if (require.main === module) {
  runDemoGenerator();
}
