import app from '../server';
import http from 'http';

interface ApiResponse {
  success?: boolean;
  status?: string;
  token?: string;
  user?: any;
  course?: any;
  courses?: any[];
  enrollment?: any;
  pending_count?: number;
  topics?: any[];
  data?: any;
  notifications?: any[];
  notification?: any;
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  console.log('🧪 Starting API Verification Tests against', baseUrl);

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health check
  await test('GET /api/health', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || data.status !== 'healthy') {
      throw new Error(`Expected status healthy, got: ${JSON.stringify(data)}`);
    }
  });

  // 2. Auth: Register
  let studentToken = '';
  let studentId = '';
  await test('POST /api/auth/register (Student)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_student@zerde.kz',
        password: 'password123',
        full_name: 'Сынақ Оқушы',
        role: 'student',
        grade: '10 «Б»',
        school: 'НЗМ Алматы',
        language: 'kz'
      })
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 201 || !data.token) {
      throw new Error(`Register failed: ${JSON.stringify(data)}`);
    }
    studentToken = data.token;
    studentId = data.user.id;
  });

  // 3. Auth: Login
  let teacherToken = '';
  await test('POST /api/auth/login (Teacher)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@zerde.kz',
        password: 'zerde2026'
      })
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !data.token || data.user?.role !== 'teacher') {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    teacherToken = data.token;
  });

  // 4. Auth: Me
  await test('GET /api/auth/me (with student token)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || data.user?.email !== 'test_student@zerde.kz') {
      throw new Error(`Auth me failed: ${JSON.stringify(data)}`);
    }
  });

  // 5. Auth: Update profile
  await test('PUT /api/auth/profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        full_name: 'Сынақ Оқушы (Жаңартылған)',
        language: 'kz',
        theme: 'dark'
      })
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || data.user?.full_name !== 'Сынақ Оқушы (Жаңартылған)') {
      throw new Error(`Profile update failed: ${JSON.stringify(data)}`);
    }
  });

  // 6. Course: List courses
  let courseId = '';
  await test('GET /api/courses', async () => {
    const res = await fetch(`${baseUrl}/api/courses`);
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(data.courses) || data.courses.length === 0) {
      throw new Error(`Courses list failed: ${JSON.stringify(data)}`);
    }
    courseId = data.courses[0].id;
  });

  // 7. Course: Create course (Teacher)
  let createdCourseId = '';
  await test('POST /api/courses (Teacher only)', async () => {
    const res = await fetch(`${baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        title: 'Олимпиадалық Физика: Термодинамика',
        description: 'Күрделі олимпиадалық есептер мен ZVDSL+ схемалық үлгілері',
        subject: 'Физика',
        grade: '10-11',
        language: 'kz'
      })
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 201 || !data.course?.id) {
      throw new Error(`Create course failed: ${JSON.stringify(data)}`);
    }
    createdCourseId = data.course.id;
  });

  // 8. Course: Student enrolls
  await test('POST /api/courses/:id/enroll (Student)', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 201 || data.enrollment?.status !== 'pending_approval') {
      throw new Error(`Enrollment failed: ${JSON.stringify(data)}`);
    }
  });

  // 9. Course: Teacher views enrollments
  await test('GET /api/courses/:id/enrollments (Teacher)', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enrollments`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || (data.pending_count ?? 0) < 1) {
      throw new Error(`View enrollments failed: ${JSON.stringify(data)}`);
    }
  });

  // 10. Course: Teacher approves student
  await test('POST /api/courses/:id/enrollments/:studentId/approve (Teacher)', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enrollments/${studentId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || data.enrollment?.status !== 'enrolled') {
      throw new Error(`Approve enrollment failed: ${JSON.stringify(data)}`);
    }
  });

  // 11. Course: Topics
  await test('GET /api/courses/:id/topics', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${courseId}/topics`);
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(data.topics)) {
      throw new Error(`Course topics failed: ${JSON.stringify(data)}`);
    }
  });

  // 12. Student: Dashboard
  await test('GET /api/student/dashboard', async () => {
    const res = await fetch(`${baseUrl}/api/student/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !data.data?.rank || typeof data.data?.elo !== 'number') {
      throw new Error(`Student dashboard failed: ${JSON.stringify(data)}`);
    }
  });

  // 13. Student: Heatmap
  await test('GET /api/student/heatmap', async () => {
    const res = await fetch(`${baseUrl}/api/student/heatmap`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(data.data?.matrix) || data.data.matrix.length !== 365) {
      throw new Error(`Student heatmap failed: ${JSON.stringify(data)}`);
    }
  });

  // 14. Student: Roadmap
  await test('GET /api/student/roadmap', async () => {
    const res = await fetch(`${baseUrl}/api/student/roadmap`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !data.data?.target_exam || !Array.isArray(data.data?.milestones)) {
      throw new Error(`Student roadmap failed: ${JSON.stringify(data)}`);
    }
  });

  // 15. Notifications: List
  let notifId = '';
  await test('GET /api/notifications', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || !Array.isArray(data.notifications)) {
      throw new Error(`Notifications failed: ${JSON.stringify(data)}`);
    }
    if (data.notifications.length > 0) {
      notifId = data.notifications[0].id;
    }
  });

  // 16. Notifications: Read
  if (notifId) {
    await test('POST /api/notifications/:id/read', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/${notifId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const data = (await res.json()) as ApiResponse;
      if (res.status !== 200 || !data.notification?.is_read) {
        throw new Error(`Mark read failed: ${JSON.stringify(data)}`);
      }
    });
  }

  // 17. Notifications: Weekly Digest
  await test('GET /api/notifications/weekly-digest', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/weekly-digest`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = (await res.json()) as any;
    if (res.status !== 200 || !data.data?.html_template || !data.data?.student_name) {
      throw new Error(`Weekly digest failed: ${JSON.stringify(data)}`);
    }
  });

  // 18. Notifications: Trigger simulation
  await test('POST /api/notifications/trigger-simulation (STREAK_SAVER)', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/trigger-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        type: 'STREAK_SAVER',
        customParams: { streak_days: 14 }
      })
    });
    const data = (await res.json()) as any;
    if (res.status !== 201 || data.notification?.type !== 'STREAK_SAVER') {
      throw new Error(`Trigger simulation failed: ${JSON.stringify(data)}`);
    }
  });

  // 19. TTS: List voices
  await test('GET /api/tts/voices', async () => {
    const res = await fetch(`${baseUrl}/api/tts/voices`);
    const data = (await res.json()) as any;
    if (res.status !== 200 || !data.voices?.kk || !data.voices?.ru) {
      throw new Error(`TTS voices list failed: ${JSON.stringify(data)}`);
    }
  });

  // 20. TTS: Synthesize audio
  await test('GET /api/tts/synthesize (Kazakh Neural Voice)', async () => {
    const res = await fetch(`${baseUrl}/api/tts/synthesize?text=Сәлем+Zerde&lang=kk`);
    const contentType = res.headers.get('Content-Type') || '';
    if (res.status !== 200) {
      throw new Error(`TTS synthesize failed with status ${res.status}`);
    }
    if (!contentType.includes('audio/mpeg') && !contentType.includes('application/json')) {
      throw new Error(`Unexpected Content-Type: ${contentType}`);
    }
  });

  // 21. Course: Teacher expels student
  await test('POST /api/courses/:id/enrollments/:studentId/expel (Teacher)', async () => {
    const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enrollments/${studentId}/expel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = (await res.json()) as ApiResponse;
    if (res.status !== 200 || data.enrollment?.status !== 'expelled') {
      throw new Error(`Expel student failed: ${JSON.stringify(data)}`);
    }
  });

  server.close();
  console.log(`\n🎉 Verification Summary: ${passed}/${total} tests passed!`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
