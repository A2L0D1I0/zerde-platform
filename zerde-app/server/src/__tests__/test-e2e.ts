import app from '../server';
import http from 'http';

interface ApiResponse<T = any> {
  success?: boolean;
  status?: string;
  token?: string;
  user?: any;
  course?: any;
  courses?: any[];
  enrollment?: any;
  enrollments?: any[];
  pending_count?: number;
  topics?: any[];
  data?: T;
  notifications?: any[];
  notification?: any;
  voices?: any;
  message?: string;
  error?: string;
  [key: string]: any;
}

async function runE2ETests() {
  const PORT = 5098;
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}`;

  console.log('================================================================');
  console.log('🚀 ZERDE ECOSYSTEM • FULL END-TO-END INTEGRATION TEST SUITE');
  console.log(`📍 Testing against live server on: ${baseUrl}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name: string, fn: () => Promise<void>) {
    process.stdout.write(`  ▶ ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err: any) {
      console.log('❌ FAIL');
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Tokens & Identifiers for session testing
  let studentToken = '';
  let studentUser: any = null;
  let teacherToken = '';
  let teacherUser: any = null;
  let newStudentToken = '';
  let createdCourseId = '';
  let studentId = '';

  // --------------------------------------------------------------------------
  // SUITE 1: PLATFORM HEALTH & CONNECTIVITY
  // --------------------------------------------------------------------------
  console.log('📦 [SUITE 1] Platform Health & Server Connectivity');
  
  await testStep('GET /api/health - Server health & platform metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || json.status !== 'healthy') {
      throw new Error(`Invalid health response: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 2: AUTHENTICATION & ROLE-BASED ACCESS CONTROL
  // --------------------------------------------------------------------------
  console.log('\n🔐 [SUITE 2] Authentication, Roles & Persona Verification');

  await testStep('POST /api/auth/login - Student (Azamat Temirkhanov)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'azamat@zerde.kz',
        password: 'password123'
      })
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.token || json.user?.role !== 'student') {
      throw new Error(`Student login failed: ${JSON.stringify(json)}`);
    }
    studentToken = json.token;
    studentUser = json.user;
    studentId = json.user.id;
  });

  await testStep('POST /api/auth/login - Teacher (Gulnara Serikovna Alimzhanova)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@zerde.kz',
        password: 'password123'
      })
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.token || json.user?.role !== 'teacher') {
      throw new Error(`Teacher login failed: ${JSON.stringify(json)}`);
    }
    teacherToken = json.token;
    teacherUser = json.user;
  });

  await testStep('POST /api/auth/register - Register new student account', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `e2e_student_${Date.now()}@zerde.kz`,
        password: 'password123',
        full_name: 'Жаңа Студент',
        role: 'student',
        grade: '9 «А»',
        school: 'РФМШ Алматы',
        language: 'kz'
      })
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 201 || !json.token || json.user?.role !== 'student') {
      throw new Error(`Registration failed: ${JSON.stringify(json)}`);
    }
    newStudentToken = json.token;
  });

  await testStep('GET /api/auth/me - Verify authenticated profile (JWT validation)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.user?.email) {
      throw new Error(`Profile retrieval failed: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 3: STUDENT PORTAL & COGNITIVE PROGRESS
  // --------------------------------------------------------------------------
  console.log('\n🎓 [SUITE 3] Student Portal, Heatmap & Cognitive Diagnostics');

  await testStep('GET /api/student/dashboard - Dashboard metrics, ELO & Pinned Course', async () => {
    const res = await fetch(`${baseUrl}/api/student/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.data?.rank || typeof json.data?.elo !== 'number') {
      throw new Error(`Dashboard data invalid: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/student/heatmap - 365-day activity contribution matrix', async () => {
    const res = await fetch(`${baseUrl}/api/student/heatmap`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(json.data?.matrix) || json.data.matrix.length !== 365) {
      throw new Error(`Heatmap data invalid: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/student/roadmap - Personal Exam Trajectory (ENT 2026)', async () => {
    const res = await fetch(`${baseUrl}/api/student/roadmap`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.data?.target_exam || !Array.isArray(json.data?.milestones)) {
      throw new Error(`Roadmap data invalid: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/student/cdm-profile - Cognitive Diagnostic Q-Matrix Profile', async () => {
    const res = await fetch(`${baseUrl}/api/student/cdm-profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.data?.all_skills || typeof json.data?.overall_mastery !== 'number') {
      throw new Error(`CDM profile failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/student/spaced-repetition - SM-2 Memory Cards Queue', async () => {
    const res = await fetch(`${baseUrl}/api/student/spaced-repetition`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || typeof json.data?.due_today_count !== 'number') {
      throw new Error(`Spaced repetition summary failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('POST /api/student/spaced-repetition/:cardId/review - SM-2 Card Quality Review (Quality 5)', async () => {
    const res = await fetch(`${baseUrl}/api/student/spaced-repetition/1/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ quality: 5 })
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || (json.data?.newInterval === undefined && json.data?.nextIntervalDays === undefined)) {
      throw new Error(`SM-2 review failed: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 4: COURSES, SYLLABI & ENROLLMENT LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n📚 [SUITE 4] Course Catalog, Syllabi & 1-Click Enrollment');

  await testStep('GET /api/courses - List published courses with search & filter', async () => {
    const res = await fetch(`${baseUrl}/api/courses`);
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(json.courses) || json.courses.length === 0) {
      throw new Error(`Courses list failed: ${JSON.stringify(json)}`);
    }
    createdCourseId = json.courses[0].id;
  });

  await testStep('GET /api/courses/:id/topics - Fetch course quarter topics', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/topics`);
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(json.topics)) {
      throw new Error(`Course topics failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('POST /api/courses/:id/enroll - Student enrollment request', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newStudentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Enrollment request failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/courses/:id/enrollments - Teacher views pending requests', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enrollments`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(json.enrollments)) {
      throw new Error(`Teacher enrollments view failed: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 5: TEACHER DASHBOARD, 24-STUDENT HEATMAP & SMARTBOARD
  // --------------------------------------------------------------------------
  console.log('\n📊 [SUITE 5] Teacher Gradebook, 24-Student Heatmap & Smartboard');

  await testStep('GET /api/teacher/class-matrix/1 - Heatmap Matrix 24 students × 16 micro-skills', async () => {
    const res = await fetch(`${baseUrl}/api/teacher/class-matrix/1`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (
      res.status !== 200 ||
      !Array.isArray(json.data?.matrix) ||
      json.data.matrix.length === 0 ||
      !json.data?.skills_header
    ) {
      throw new Error(`Class matrix failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/teacher/lesson-signal/1 - «Сигнал дня» 5-sec cluster deficit & Smartboard activity', async () => {
    const res = await fetch(`${baseUrl}/api/teacher/lesson-signal/1`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (
      res.status !== 200 ||
      !json.data?.cluster_deficit ||
      !json.data?.smart_board_activity
    ) {
      throw new Error(`Lesson signal failed: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 6: RETENTION TRIGGERS & NOTIFICATION CENTER
  // --------------------------------------------------------------------------
  console.log('\n🔥 [SUITE 6] Duolingo Retention Triggers & Notification Center');

  await testStep('GET /api/notifications - List active student notifications', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(json.notifications)) {
      throw new Error(`Notifications failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('POST /api/notifications/trigger-simulation - STREAK_SAVER psychological alert', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/trigger-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        type: 'STREAK_SAVER',
        customParams: { streak_days: 12 }
      })
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 201 || json.notification?.type !== 'STREAK_SAVER') {
      throw new Error(`Streak Saver trigger failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('POST /api/notifications/trigger-simulation - AGA_REMINDER Socratic callout', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/trigger-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        type: 'AGA_REMINDER',
        customParams: { topic_title: 'Интервалдар әдісі' }
      })
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 201 || json.notification?.type !== 'AGA_REMINDER') {
      throw new Error(`Aga reminder trigger failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/notifications/weekly-digest - Weekly Digest HTML email template', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/weekly-digest`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.data?.student_name) {
      throw new Error(`Weekly digest retrieval failed: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 7: EDGE NEURAL TTS (KAZAKH, RUSSIAN, ENGLISH)
  // --------------------------------------------------------------------------
  console.log('\n🔊 [SUITE 7] Edge Neural TTS Audio Voice Engine');

  await testStep('GET /api/tts/voices - List supported neural voices (kk, ru, en, de)', async () => {
    const res = await fetch(`${baseUrl}/api/tts/voices`);
    const json = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !json.voices?.kk || !json.voices?.ru) {
      throw new Error(`TTS voices catalog failed: ${JSON.stringify(json)}`);
    }
  });

  await testStep('GET /api/tts/synthesize - Synthesize Kazakh speech (kk-KZ-DauletNeural / Web Speech fallback)', async () => {
    const res = await fetch(`${baseUrl}/api/tts/synthesize?text=Сәлем+Zerde+экожүйесі&lang=kk`);
    const contentType = res.headers.get('Content-Type') || '';
    if (res.status !== 200) {
      throw new Error(`TTS synthesize failed with status ${res.status}`);
    }
    if (!contentType.includes('audio/mpeg') && !contentType.includes('application/json')) {
      throw new Error(`Unexpected Content-Type: ${contentType}`);
    }
  });

  server.close();

  console.log('\n================================================================');
  console.log(`🏁 E2E VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch((e) => {
  console.error('Fatal E2E test runner error:', e);
  process.exit(1);
});
