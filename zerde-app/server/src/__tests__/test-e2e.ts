import assert from 'node:assert';
import app from '../server';
import { seed } from '../db/seed';

async function runE2ETests() {
  console.log('🧪 Resetting clean SQLite database for tests...');
  seed();

  console.log('🧪 Starting Zerde 10-Scenario Organization & Security Test Suite...\n');

  const server = app.listen(5011);

  try {
    const baseUrl = 'http://localhost:5011';
    const uid = Date.now();

    // -------------------------------------------------------------
    // SCENARIO 1: Student with Teacher Token (Must Fail with 400)
    // -------------------------------------------------------------
    console.log('1. Testing Scenario 1: Student registering with Teacher Token (NIS-TEACHER-2026)...');
    const s1Res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test_std_fail_${uid}@zerde.kz`,
        password: 'password123',
        full_name: 'Студент Сынақ',
        role: 'student',
        org_token: 'NIS-TEACHER-2026',
      }),
    });
    assert.strictEqual(s1Res.status, 400, 'Student with Teacher token must return 400 Bad Request');
    const s1Json = (await s1Res.json()) as any;
    assert.ok(s1Json.error.includes('тек мұғалімдерге') || s1Json.error.includes('преподавателей'));
    console.log('   ✅ Scenario 1 Passed (Properly rejected with 400)!');

    // -------------------------------------------------------------
    // SCENARIO 2: Teacher with Student Token (Must Fail with 400)
    // -------------------------------------------------------------
    console.log('2. Testing Scenario 2: Teacher registering with Student Token (NIS-STUDENT-2026)...');
    const s2Res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test_tchr_fail_${uid}@zerde.kz`,
        password: 'password123',
        full_name: 'Мұғалім Сынақ',
        role: 'teacher',
        org_token: 'NIS-STUDENT-2026',
      }),
    });
    assert.strictEqual(s2Res.status, 400, 'Teacher with Student token must return 400 Bad Request');
    const s2Json = (await s2Res.json()) as any;
    assert.ok(s2Json.error.includes('тек оқушыларға') || s2Json.error.includes('учеников'));
    console.log('   ✅ Scenario 2 Passed (Properly rejected with 400)!');

    // -------------------------------------------------------------
    // SCENARIO 3: Invalid / Random Token (Must Fail with 404)
    // -------------------------------------------------------------
    console.log('3. Testing Scenario 3: Registering with Invalid Token (FAKE-TOKEN-999)...');
    const s3Res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test_fake_token_${uid}@zerde.kz`,
        password: 'password123',
        full_name: 'Беймәлім Қолданушы',
        role: 'student',
        org_token: 'FAKE-TOKEN-999',
      }),
    });
    assert.strictEqual(s3Res.status, 404, 'Invalid token must return 404 Not Found');
    console.log('   ✅ Scenario 3 Passed (Properly rejected with 404)!');

    // -------------------------------------------------------------
    // SCENARIO 4: Student without Token (Must Succeed, No Organization)
    // -------------------------------------------------------------
    console.log('4. Testing Scenario 4: Student registering WITHOUT token...');
    const s4Res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `independent_std_${uid}@zerde.kz`,
        password: 'password123',
        full_name: 'Еркін Оқушы',
        role: 'student',
      }),
    });
    assert.strictEqual(s4Res.status, 200, 'Student without token must succeed');
    const s4Json = (await s4Res.json()) as any;
    assert.strictEqual(s4Json.user.organizationId, null);
    const independentStudentToken = s4Json.token;
    console.log(`   ✅ Scenario 4 Passed (Independent student created: ${s4Json.user.school})!`);

    // -------------------------------------------------------------
    // SCENARIO 5: Teacher without Token (Must Fail with 400)
    // -------------------------------------------------------------
    console.log('5. Testing Scenario 5: Teacher registering WITHOUT token...');
    const s5Res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `freelance_tchr_${uid}@zerde.kz`,
        password: 'password123',
        full_name: 'Токенсіз Мұғалім',
        role: 'teacher',
      }),
    });
    assert.strictEqual(s5Res.status, 400, 'Teacher without token must be rejected with 400');
    console.log('   ✅ Scenario 5 Passed (Teacher without token rejected with 400)!');

    // -------------------------------------------------------------
    // SCENARIO 6: Teacher with NIS Token (Must Succeed)
    // -------------------------------------------------------------
    console.log('6. Testing Scenario 6: Teacher registering with valid NIS Token (NIS-TEACHER-2026)...');
    const s6Res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `nis_teacher_${uid}@zerde.kz`,
        password: 'password123',
        full_name: 'Айгүл Бақытқызы (NIS)',
        role: 'teacher',
        org_token: 'NIS-TEACHER-2026',
      }),
    });
    assert.strictEqual(s6Res.status, 200);
    const s6Json = (await s6Res.json()) as any;
    assert.strictEqual(s6Json.user.school, 'NIS IB Astana');
    const teacherToken = s6Json.token;
    console.log(`   ✅ Scenario 6 Passed (Teacher linked to ${s6Json.user.school})!`);

    // -------------------------------------------------------------
    // SCENARIO 7: Conflict of Interest (NIS Teacher tries to be NIS Student)
    // -------------------------------------------------------------
    console.log('7. Testing Scenario 7: NIS Teacher linking NIS Student Token (Conflict of Interest)...');
    const s7Res = await fetch(`${baseUrl}/api/auth/link-org-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({
        org_token: 'NIS-STUDENT-2026',
        targetRole: 'student',
      }),
    });
    assert.strictEqual(s7Res.status, 403, 'Conflict of interest must return 403 Forbidden');
    const s7Json = (await s7Res.json()) as any;
    assert.ok(s7Json.error.includes('Мүдделер қақтығысы') || s7Json.error.includes('Конфликт'));
    console.log('   ✅ Scenario 7 Passed (Conflict of Interest blocked with 403)!');

    // -------------------------------------------------------------
    // SCENARIO 8: Teacher switches to Independent Student profile
    // -------------------------------------------------------------
    console.log('8. Testing Scenario 8: Teacher switching to Student role...');
    const s8Res = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({ role: 'student' }),
    });
    assert.strictEqual(s8Res.status, 200);
    const s8Json = (await s8Res.json()) as any;
    assert.strictEqual(s8Json.user.role, 'student');
    console.log('   ✅ Scenario 8 Passed (Role switched to student)!');

    // -------------------------------------------------------------
    // SCENARIO 9: NIS Teacher linking Ekibastuz BIL Student Token (Cross-Org)
    // -------------------------------------------------------------
    console.log('9. Testing Scenario 9: NIS Teacher linking BIL Student Token (Cross-Organization)...');
    const s9Res = await fetch(`${baseUrl}/api/auth/link-org-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({
        org_token: 'BIL-STUDENT-2026',
        targetRole: 'student',
      }),
    });
    assert.strictEqual(s9Res.status, 200, 'Cross-org student link must succeed');
    const s9Json = (await s9Res.json()) as any;
    assert.strictEqual(s9Json.organization.name, 'Ekibastuz BIL');
    console.log(`   ✅ Scenario 9 Passed (Cross-org linked to ${s9Json.organization.name})!`);

    // -------------------------------------------------------------
    // SCENARIO 10: Independent Student linking NIS Student Token later
    // -------------------------------------------------------------
    console.log('10. Testing Scenario 10: Independent Student linking NIS Token via Settings...');
    const s10Res = await fetch(`${baseUrl}/api/auth/link-org-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${independentStudentToken}`,
      },
      body: JSON.stringify({
        org_token: 'NIS-STUDENT-2026',
        targetRole: 'student',
      }),
    });
    assert.strictEqual(s10Res.status, 200);
    const s10Json = (await s10Res.json()) as any;
    assert.strictEqual(s10Json.organization.name, 'NIS IB Astana');
    console.log(`   ✅ Scenario 10 Passed (Student upgraded to ${s10Json.organization.name})!`);

    console.log('\n🎉 ALL 10 ORGANIZATION SECURITY & IDENTITY SCENARIOS PASSED (10/10)!');
  } finally {
    server.close();
  }
}

runE2ETests().catch((err) => {
  console.error('❌ E2E Tests Failed:', err);
  process.exit(1);
});
