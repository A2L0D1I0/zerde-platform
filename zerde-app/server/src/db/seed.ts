import bcrypt from 'bcryptjs';
import { getDb, resetDatabase } from './database';

export function seed() {
  console.log('🌱 Starting Zerde database seeding...');
  const db = resetDatabase();

  const passwordHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  // Helper for generating UUID-like strings
  const genUuid = (prefix: string, id: number) => `zerde-${prefix}-${String(id).padStart(4, '0')}`;

  // ==========================================================================
  // 1. USERS (Teacher & 24 Students & Admin)
  // ==========================================================================
  console.log('👤 Seeding users...');

  // 1.1. Teacher: Gulnara Serikovna
  const insertUser = db.prepare(`
    INSERT INTO users (uuid, email, password_hash, full_name, role, grade, school, curator_id, parent_contact, notify_on_risk, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const teacherResult = insertUser.run(
    genUuid('usr-tchr', 1),
    'teacher@zerde.kz',
    passwordHash,
    'Гульнара Сериковна Алимжанова',
    'teacher',
    9,
    'РФМШ Алматы',
    null,
    '+7 701 555 0101',
    1,
    now,
    now
  );
  const teacherId = Number(teacherResult.lastInsertRowid);

  // 1.2. Admin
  insertUser.run(
    genUuid('usr-adm', 1),
    'admin@zerde.kz',
    passwordHash,
    'Әкімші / Zerde Admin',
    'admin',
    null,
    'РФМШ Алматы',
    null,
    '+7 777 000 0001',
    0,
    now,
    now
  );

  // 1.3. 24 Realistic Students of Class 9 «А»
  const studentNames = [
    { name: 'Азамат Темірханов', email: 'azamat@zerde.kz', parent: '+7 777 123 4567 (Айгүл анасы)', elo: 1420, rank: 'QYRAN', streak: 12 },
    { name: 'Аружан Болатбек', email: 'aruzhan.b@zerde.kz', parent: '+7 777 234 5678 (Бақыт әкесі)', elo: 1490, rank: 'QYRAN', streak: 15 },
    { name: 'Данияр Сәбитов', email: 'daniyar.s@zerde.kz', parent: '+7 777 345 6789 (Динара анасы)', elo: 1340, rank: 'TUGYR', streak: 8 },
    { name: 'Меруерт Қасымова', email: 'meruert.k@zerde.kz', parent: '+7 777 456 7890 (Қанат әкесі)', elo: 1520, rank: 'SAMGAU', streak: 21 },
    { name: 'Әлихан Нұрланов', email: 'alikhan.n@zerde.kz', parent: '+7 777 567 8901 (Гүлнар анасы)', elo: 1280, rank: 'TUGYR', streak: 5 },
    { name: 'Айдана Серғазина', email: 'aidana.s@zerde.kz', parent: '+7 777 678 9012 (Серік әкесі)', elo: 1410, rank: 'QYRAN', streak: 11 },
    { name: 'Батырхан Жақсылық', email: 'batyrkhan.zh@zerde.kz', parent: '+7 777 789 0123 (Сәуле анасы)', elo: 1150, rank: 'OSKIN', streak: 3 },
    { name: 'Дильназ Омарова', email: 'dilnaz.o@zerde.kz', parent: '+7 777 890 1234 (Марат әкесі)', elo: 1380, rank: 'TUGYR', streak: 9 },
    { name: 'Санжар Ержанов', email: 'sanzhar.ye@zerde.kz', parent: '+7 777 901 2345 (Әсем анасы)', elo: 1460, rank: 'QYRAN', streak: 14 },
    { name: 'Камила Мұхтарова', email: 'kamila.m@zerde.kz', parent: '+7 777 012 3456 (Болат әкесі)', elo: 1290, rank: 'TUGYR', streak: 6 },
    { name: 'Расул Байжанов', email: 'rasul.b@zerde.kz', parent: '+7 771 111 2233 (Нұргүл анасы)', elo: 1120, rank: 'OSKIN', streak: 2 },
    { name: 'Зере Амангелді', email: 'zere.a@zerde.kz', parent: '+7 771 222 3344 (Асқар әкесі)', elo: 1550, rank: 'SAMGAU', streak: 25 },
    { name: 'Бексұлтан Тоқтаров', email: 'beksultan.t@zerde.kz', parent: '+7 771 333 4455 (Жанар анасы)', elo: 1210, rank: 'TUGYR', streak: 4 },
    { name: 'Томирис Кәрімова', email: 'tomiris.k@zerde.kz', parent: '+7 771 444 5566 (Талғат әкесі)', elo: 1440, rank: 'QYRAN', streak: 13 },
    { name: 'Нұрсұлтан Асылбеков', email: 'nursultan.a@zerde.kz', parent: '+7 771 555 6677 (Ләззат анасы)', elo: 1080, rank: 'OSKIN', streak: 1 },
    { name: 'Алина Теміржанова', email: 'alina.t@zerde.kz', parent: '+7 771 666 7788 (Ерлан әкесі)', elo: 1360, rank: 'TUGYR', streak: 7 },
    { name: 'Темірлан Дәулетов', email: 'temirlan.d@zerde.kz', parent: '+7 771 777 8899 (Қарлығаш анасы)', elo: 1470, rank: 'QYRAN', streak: 16 },
    { name: 'Мәдина Ысмайылова', email: 'madina.i@zerde.kz', parent: '+7 771 888 9900 (Мұрат әкесі)', elo: 1250, rank: 'TUGYR', streak: 4 },
    { name: 'Арсен Қуандықов', email: 'arsen.k@zerde.kz', parent: '+7 775 111 2222 (Алма анасы)', elo: 1190, rank: 'OSKIN', streak: 3 },
    { name: 'Жания Бекболатова', email: 'zhaniya.b@zerde.kz', parent: '+7 775 222 3333 (Берік әкесі)', elo: 1430, rank: 'QYRAN', streak: 10 },
    { name: 'Алдияр Маратов', email: 'aldiyar.m@zerde.kz', parent: '+7 775 333 4444 (Райхан анасы)', elo: 1320, rank: 'TUGYR', streak: 6 },
    { name: 'Сабина Асқарова', email: 'sabina.a@zerde.kz', parent: '+7 775 444 5555 (Нұрлан әкесі)', elo: 1510, rank: 'SAMGAU', streak: 19 },
    { name: 'Ерасыл Нариманов', email: 'yerasyl.n@zerde.kz', parent: '+7 775 555 6666 (Шолпан анасы)', elo: 1160, rank: 'OSKIN', streak: 2 },
    { name: 'Даяна Сейтқалиева', email: 'dayana.s@zerde.kz', parent: '+7 775 666 7777 (Дәурен әкесі)', elo: 1390, rank: 'TUGYR', streak: 8 }
  ];

  const studentIds: number[] = [];
  let azamatUserId = 0;

  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const res = insertUser.run(
      genUuid('usr-std', i + 1),
      s.email,
      passwordHash,
      s.name,
      'student',
      9,
      'РФМШ Алматы',
      teacherId,
      s.parent,
      1,
      now,
      now
    );
    const sid = Number(res.lastInsertRowid);
    studentIds.push(sid);
    if (s.email === 'azamat@zerde.kz') {
      azamatUserId = sid;
    }
  }

  // ==========================================================================
  // 2. CLASSROOMS
  // ==========================================================================
  console.log('🏫 Seeding classrooms...');
  const insertClass = db.prepare(`
    INSERT INTO classrooms (name, school, teacher_id, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const class9AResult = insertClass.run('9 «А»', 'РФМШ Алматы', teacherId, now);
  const class9AId = Number(class9AResult.lastInsertRowid);

  insertClass.run('9 «Б»', 'РФМШ Алматы', teacherId, now);

  const insertClassStudent = db.prepare(`
    INSERT INTO classroom_students (classroom_id, student_id, created_at)
    VALUES (?, ?, ?)
  `);

  for (const sid of studentIds) {
    insertClassStudent.run(class9AId, sid, now);
  }

  // ==========================================================================
  // 3. COURSES (3 Full 9th Grade Courses)
  // ==========================================================================
  console.log('📚 Seeding courses...');
  const insertCourse = db.prepare(`
    INSERT INTO courses (title, description, subject_type, language, icon, teacher_id, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const algebraCourseId = Number(insertCourse.run(
    'Алгебра (9 сынып)',
    '9-сыныпқа арналған алгебра: Теңсіздіктер, екі айнымалысы бар теңдеулер жүйесі және сандық тізбектер',
    'algebra',
    'KZ',
    '📐',
    teacherId,
    1,
    now
  ).lastInsertRowid);

  const physicsCourseId = Number(insertCourse.run(
    'Физика (9 сынып)',
    '9-сынып физикасы: Кинематика, динамика негіздері, Ньютон заңдары және сақталу заңдары',
    'physics',
    'KZ',
    '⚡',
    teacherId,
    1,
    now
  ).lastInsertRowid);

  const kazakhCourseId = Number(insertCourse.run(
    'Қазақ тілі (9 сынып)',
    '9-сынып қазақ тілі: Құрмалас сөйлемдер синтаксисі, сөзжасам және мәтінтану',
    'kazakh_lang',
    'KZ',
    '🇰🇿',
    teacherId,
    1,
    now
  ).lastInsertRowid);

  const courseIds = [algebraCourseId, physicsCourseId, kazakhCourseId];

  // Enroll all 24 students in all 3 courses
  const insertEnrollment = db.prepare(`
    INSERT INTO course_enrollments (course_id, student_id, status, requested_at, approved_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const cid of courseIds) {
    for (const sid of studentIds) {
      insertEnrollment.run(cid, sid, 'enrolled', now, now);
    }
  }

  // ==========================================================================
  // 4. TOPICS (Quarter 1 Topics for each course)
  // ==========================================================================
  console.log('📖 Seeding course topics...');
  const insertTopic = db.prepare(`
    INSERT INTO topics (course_id, quarter, topic_number, title, description, is_today_focus, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 4.1. Algebra Topics
  const algTopics = [
    { num: 1, title: 'Екі айнымалысы бар сызықтық емес теңдеулер жүйесі', desc: 'Екінші дәрежелі теңдеулерден құралған жүйелерді шешу әдістері (алмастыру, қосу)', focus: 0 },
    { num: 2, title: 'Квадрат теңсіздіктер және парабола қасиеттері', desc: 'ax² + bx + c > 0 түріндегі теңсіздіктерді парабола графигінің көмегімен шешу', focus: 0 },
    { num: 3, title: 'Аралықтар әдісі (Интервалдар әдісі)', desc: 'Көпмүшелер мен бөлшек-рационал өрнектердің таңба тұрақтылық аралықтарын анықтау', focus: 1 },
    { num: 4, title: 'Бөлшек-рационал теңсіздіктер', desc: 'Бөлімінде айнымалысы бар теңсіздіктерді аралықтар әдісіне келтіру және нөлдерін анықтау', focus: 0 },
    { num: 5, title: 'Теңсіздіктер жүйесі мен жиынтығы', desc: 'Бірнеше бір немесе екі айнымалысы бар теңсіздіктердің ортақ шешімдерін табу', focus: 0 }
  ];

  const algTopicIds: number[] = [];
  for (let i = 0; i < algTopics.length; i++) {
    const t = algTopics[i];
    const res = insertTopic.run(algebraCourseId, 1, t.num, t.title, t.desc, t.focus, i + 1, now);
    algTopicIds.push(Number(res.lastInsertRowid));
  }

  // 4.2. Physics Topics
  const phyTopics = [
    { num: 1, title: 'Материялық нүкте. Түзусызықты бірқалыпты және бірқалыпсыз қозғалыс', desc: 'Санақ жүйесі, орын ауыстыру және жылдамдық векторлары', focus: 0 },
    { num: 2, title: 'Бірқалыпты үдемелі қозғалыс кезіндегі жылдамдық пен орын ауыстыру', desc: 'Үдеу формуласы, v(t) және s(t) графиктерімен жұмыс', focus: 1 },
    { num: 3, title: 'Ньютонның екінші заңы және күштерді қосу', desc: 'F_net = ma формуласы, күштердің векторлық қосындысы мен денеге әсер етуші күштер', focus: 0 },
    { num: 4, title: 'Бүкіләлемдік тартылыс заңы. Ауырлық күші', desc: 'Гравитациялық өзара әрекеттесу, еркін түсу үдеуі және салмақсыздық', focus: 0 },
    { num: 5, title: 'Денелердің еркін түсуі және көлбеу лақтырылған дене қозғалысы', desc: 'Ауырлық күші өрісіндегі қозғалыс траекториясы, ұшу қашықтығы мен биіктігі', focus: 0 }
  ];

  const phyTopicIds: number[] = [];
  for (let i = 0; i < phyTopics.length; i++) {
    const t = phyTopics[i];
    const res = insertTopic.run(physicsCourseId, 1, t.num, t.title, t.desc, t.focus, i + 1, now);
    phyTopicIds.push(Number(res.lastInsertRowid));
  }

  // 4.3. Kazakh Language Topics
  const kazTopics = [
    { num: 1, title: 'Салалас құрмалас сөйлемнің түрлері мен тыныс белгілері', desc: 'Ыңғайлас, себеп-салдар, қарсылықты, кезектес, талғаулы және түсіндірмелі салалас', focus: 0 },
    { num: 2, title: 'Сабақтас құрмалас сөйлем және бағыныңқы сыңарлар', desc: 'Шартты, қарсылықты, себеп, қимыл-сын, мезгіл, мақсат бағыныңқы сөйлемдер', focus: 1 },
    { num: 3, title: 'Құрмалас сөйлемдердің синтаксистік талдауы', desc: 'Жай сөйлемдердің байланысу тәсілдері, жалғаулықтар және интонация', focus: 0 },
    { num: 4, title: 'Сөзжасам: Туынды сөздер және жұрнақтардың мағыналық қызметі', desc: 'Сөзжасамдық ұя, туынды түбір, сөз тудырушы және сөз түрлендіруші жұрнақтар', focus: 0 },
    { num: 5, title: 'Мәтін стилистикасы және терминологиялық нормалар', desc: 'Ғылыми және публицистикалық стиль ерекшеліктері, академиялық жазылым', focus: 0 }
  ];

  const kazTopicIds: number[] = [];
  for (let i = 0; i < kazTopics.length; i++) {
    const t = kazTopics[i];
    const res = insertTopic.run(kazakhCourseId, 1, t.num, t.title, t.desc, t.focus, i + 1, now);
    kazTopicIds.push(Number(res.lastInsertRowid));
  }

  // ==========================================================================
  // 5. STUDENT TOPIC STATUS & CLASSROOM DEFICITS
  // ==========================================================================
  console.log('📊 Seeding student topic statuses & deficits...');
  const insertTopicStatus = db.prepare(`
    INSERT INTO student_topic_status (student_id, topic_id, status, success_streak, mastered_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const allTopicIds = [...algTopicIds, ...phyTopicIds, ...kazTopicIds];

  for (const sid of studentIds) {
    const isAzamat = sid === azamatUserId;
    for (const tid of allTopicIds) {
      let status = 'in_progress';
      let streak = 1;
      let masteredAt = null;

      if (isAzamat) {
        if (tid === algTopicIds[0] || tid === algTopicIds[1] || tid === phyTopicIds[0] || tid === kazTopicIds[0]) {
          status = 'mastered';
          streak = 5;
          masteredAt = now;
        } else if (tid === algTopicIds[2] || tid === phyTopicIds[1] || tid === kazTopicIds[1]) {
          status = 'in_progress';
          streak = 3;
        } else {
          status = 'queued';
          streak = 0;
        }
      } else {
        const hash = (sid * 17 + tid * 31) % 100;
        if (hash < 35) {
          status = 'mastered';
          streak = 4;
          masteredAt = now;
        } else if (hash < 65) {
          status = 'in_progress';
          streak = 2;
        } else if (hash < 82) {
          status = 'pending_teacher';
          streak = 0;
        } else {
          status = 'queued';
          streak = 0;
        }
      }

      insertTopicStatus.run(sid, tid, status, streak, masteredAt);
    }
  }

  // ==========================================================================
  // 6. QUESTION BANK (16 Rich Questions with ZVDSL+ Canvas & Desmos)
  // ==========================================================================
  console.log('💡 Seeding rich question bank with ZVDSL+ & Desmos...');
  const insertQuestion = db.prepare(`
    INSERT INTO question_bank (
      topic_id, mode, question_kz, question_ru, question_en,
      zvdsl_canvas_json, desmos_state, options_json, correct_answer,
      explanation_kz, explanation_ru, explanation_en, difficulty, micro_skills_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const questionsData = [
    // 1. Algebra - Topic 3: Аралықтар әдісі
    {
      topic_id: algTopicIds[2],
      mode: 'A',
      question_kz: 'Теңсіздікті аралықтар әдісімен шешіңіз: $(x - 3)(x + 2) > 0$. Сан түзуіндегі дұрыс аралықты таңдаңыз.',
      question_ru: 'Решите неравенство методом интервалов: $(x - 3)(x + 2) > 0$. Выберите верный числовой промежуток.',
      question_en: 'Solve the inequality using the interval method: $(x - 3)(x + 2) > 0$. Select the correct interval.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Сан түзуіндегі таңбалар',
        elements: [
          { type: 'axis', min: -5, max: 6, step: 1 },
          { type: 'root_point', x: -2, style: 'hollow', label: '-2' },
          { type: 'root_point', x: 3, style: 'hollow', label: '3' },
          { type: 'interval_sign', from: -5, to: -2, sign: '+', color: '#1a7f37' },
          { type: 'interval_sign', from: -2, to: 3, sign: '−', color: '#cf222e' },
          { type: 'interval_sign', from: 3, to: 6, sign: '+', color: '#1a7f37' },
          { type: 'shaded_region', intervals: [[-5, -2], [3, 6]], fill: 'rgba(26,127,55,0.15)' }
        ]
      }),
      desmos_state: JSON.stringify({
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'f(x) = (x - 3)(x + 2)', color: '#0969da', lineWidth: 2.5 },
            { id: '2', latex: 'y = 0', lineStyle: 'DASHED', color: '#6e7781' },
            { id: '3', latex: '( -2, 0 )', pointStyle: 'OPEN', color: '#cf222e' },
            { id: '4', latex: '( 3, 0 )', pointStyle: 'OPEN', color: '#1a7f37' }
          ]
        }
      }),
      options_json: JSON.stringify([
        { id: 'A', text_kz: '(-∞; -2) ∪ (3; +∞)', text_ru: '(-∞; -2) ∪ (3; +∞)', text_en: '(-∞; -2) ∪ (3; +∞)', is_distractor: false },
        { id: 'B', text_kz: '[-2; 3]', text_ru: '[-2; 3]', text_en: '[-2; 3]', is_distractor: true, misconception: 'Түбірлер арасындағы теріс аймақты таңдады және қатаң теңсіздікте жабық жақша қолданды' },
        { id: 'C', text_kz: '(-2; 3)', text_ru: '(-2; 3)', text_en: '(-2; 3)', is_distractor: true, misconception: 'Оң таңбалы аймақ орнына теріс аймақты таңдады' },
        { id: 'D', text_kz: '(-∞; 3)', text_ru: '(-∞; 3)', text_en: '(-∞; 3)', is_distractor: true, misconception: 'Тек бір нөлдік нүктені ескерді' }
      ]),
      correct_answer: 'A',
      explanation_kz: '1. Функцияның нөлдері: x₁ = -2, x₂ = 3.\n2. Бұл нүктелер сан түзуін 3 аралыққа бөледі: (-∞; -2), (-2; 3), (3; +∞).\n3. Таңбаларын анықтаймыз: (+), (-), (+).\n4. Теңсіздік қатаң (> 0), сондықтан жауабы: (-∞; -2) ∪ (3; +∞).',
      explanation_ru: '1. Нули функции: x₁ = -2, x₂ = 3.\n2. Точки делят прямую на 3 интервала: (-∞; -2), (-2; 3), (3; +∞).\n3. Знаки: (+), (-), (+). Неравенство строго больше нуля, поэтому ответ: (-∞; -2) ∪ (3; +∞).',
      explanation_en: '1. Zeros: x = -2, x = 3.\n2. Intervals: (-∞, -2), (-2, 3), (3, +∞).\n3. Testing signs gives (+), (-), (+). Solution: (-∞, -2) ∪ (3, +∞).',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['ALG_09_INTERVAL_METHOD', 'ALG_09_INEQ_SIGN_TEST', 'ALG_09_OPEN_INTERVALS'])
    },

    // 2. Algebra - Topic 3: Бөлшек-рационал теңсіздік (Режим Б)
    {
      topic_id: algTopicIds[2],
      mode: 'B',
      question_kz: 'Бөлшек-рационал теңсіздікті шешіңіз және шешім жолын жазыңыз: $\\frac{x^2 - 4}{x - 5} \\le 0$. Тетрадьтегі шешіміңізді фотоға түсіріп жүктеңіз немесе толық шешімін жазыңыз.',
      question_ru: 'Решите дробно-рациональное неравенство: $\\frac{x^2 - 4}{x - 5} \\le 0$. Запишите решение или прикрепите фото тетради.',
      question_en: 'Solve the rational inequality: $\\frac{x^2 - 4}{x - 5} \\le 0$. Write down the complete step-by-step solution.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'RATIONAL_FRACTION_SIGN',
        title: 'Бөлшек-рационал таңбалар кестесі',
        elements: [
          { type: 'fraction_analysis', numerator: '(x-2)(x+2)', denominator: 'x-5' },
          { type: 'roots', numerator_roots: [-2, 2], denominator_poles: [5] }
        ]
      }),
      desmos_state: JSON.stringify({
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'y = \\frac{x^2 - 4}{x - 5}', color: '#8250df' },
            { id: '2', latex: 'x = 5', lineStyle: 'DASHED', color: '#cf222e' }
          ]
        }
      }),
      options_json: null,
      correct_answer: '(-inf, -2] U [2, 5)',
      explanation_kz: 'Алымы: (x - 2)(x + 2) = 0 => x = ±2 (жабық нүктелер).\nБөлімі: x - 5 ≠ 0 => x = 5 (ашық нүкте).\nИнтервалдар: (-∞; -2], [-2; 2], [2; 5), (5; +∞).\nТаңбалар: (−), (+), (−), (+).\n≤ 0 болғандықтан: (-∞; -2] ∪ [2; 5). 5 нүктесі бөлімде болғандықтан кірмейді!',
      explanation_ru: 'Нули числителя: x = ±2 (включительно). Нули знаменателя: x ≠ 5 (выколотая точка). Знаки: (-), (+), (-), (+). Ответ: (-∞; -2] ∪ [2; 5).',
      explanation_en: 'Numerator zeros: x = ±2 (included). Denominator pole: x = 5 (excluded). Solution: (-∞, -2] ∪ [2, 5).',
      difficulty: 3,
      micro_skills_json: JSON.stringify(['ALG_09_RATIONAL_INEQ', 'ALG_09_DENOMINATOR_RESTRICTION', 'ALG_09_BRACKET_DISCIPLINE'])
    },

    // 3. Algebra - Topic 2: Парабола және квадрат теңсіздік
    {
      topic_id: algTopicIds[1],
      mode: 'A',
      question_kz: '$y = -x^2 + 4x - 3$ параболасы берілген. Парабола тармақтары қайда бағытталған және $y > 0$ болатын аралық қандай?',
      question_ru: 'Дана парабола $y = -x^2 + 4x - 3$. Куда направлены ветви параболы и при каких $x$ значение $y > 0$?',
      question_en: 'Given parabola $y = -x^2 + 4x - 3$. Where do the branches point and what is the interval for $y > 0$?',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'PARABOLA_ANALYSIS',
        elements: [
          { type: 'parabola', a: -1, b: 4, c: -3, vertex: [2, 1], roots: [1, 3], branch_direction: 'down' }
        ]
      }),
      desmos_state: JSON.stringify({
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'y = -x^2 + 4x - 3', color: '#0969da' },
            { id: '2', latex: '(2, 1)', pointStyle: 'POINT', color: '#1a7f37' }
          ]
        }
      }),
      options_json: JSON.stringify([
        { id: 'A', text_kz: 'Тармақтары төмен, (1; 3)', text_ru: 'Ветви вниз, (1; 3)', text_en: 'Branches down, (1; 3)', is_distractor: false },
        { id: 'B', text_kz: 'Тармақтары жоғары, (1; 3)', text_ru: 'Ветви вверх, (1; 3)', text_en: 'Branches up, (1; 3)', is_distractor: true, misconception: 'a = -1 теріс екенін ескермеді' },
        { id: 'C', text_kz: 'Тармақтары төмен, (-∞; 1) ∪ (3; +∞)', text_ru: 'Ветви вниз, (-∞; 1) ∪ (3; +∞)', text_en: 'Branches down, (-∞; 1) ∪ (3; +∞)', is_distractor: true, misconception: 'y > 0 орнына y < 0 аймағын алды' },
        { id: 'D', text_kz: 'Тармақтары жоғары, [1; 3]', text_ru: 'Ветви вверх, [1; 3]', text_en: 'Branches up, [1; 3]', is_distractor: true, misconception: 'Коэффициентті де, қатаң теңсіздікті де шатастырды' }
      ]),
      correct_answer: 'A',
      explanation_kz: 'a = -1 < 0 болғандықтан тармақтары төмен бағытталған. -x² + 4x - 3 = 0 түбірлері: x₁ = 1, x₂ = 3. Парабола төбесі (2, 1) Ox осінен жоғары, сондықтан (1; 3) аралығында y > 0.',
      explanation_ru: 'Так как a = -1 < 0, ветви направлены вниз. Корни: x = 1, x = 3. Между корнями функция положительна: (1; 3).',
      explanation_en: 'Since a = -1 < 0, branches face downwards. Roots are 1 and 3. Function is positive strictly inside (1, 3).',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['ALG_09_PARABOLA_VERTEX', 'ALG_09_COEFF_SIGN'])
    },

    // 4. Algebra - Topic 1: Теңдеулер жүйесі
    {
      topic_id: algTopicIds[0],
      mode: 'A',
      question_kz: 'Теңдеулер жүйесін шешіңіз: $\\begin{cases} x + y = 5 \\\\ x^2 + y^2 = 13 \\end{cases}$. Шешімдер жұбының бірін табыңыз.',
      question_ru: 'Решите систему уравнений: $\\begin{cases} x + y = 5 \\\\ x^2 + y^2 = 13 \\end{cases}$. Найдите одну из пар решений.',
      question_en: 'Solve the system of equations: $\\begin{cases} x + y = 5 \\\\ x^2 + y^2 = 13 \\end{cases}$. Find one of the solution pairs.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'SYSTEM_GEOMETRIC_INTERSECTION',
        elements: [
          { type: 'circle', center: [0, 0], radius: 3.605, label: 'x² + y² = 13' },
          { type: 'line', slope: -1, intercept: 5, label: 'x + y = 5' },
          { type: 'intersection_points', points: [[2, 3], [3, 2]] }
        ]
      }),
      desmos_state: JSON.stringify({
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'x + y = 5', color: '#0969da' },
            { id: '2', latex: 'x^2 + y^2 = 13', color: '#bf8700' }
          ]
        }
      }),
      options_json: JSON.stringify([
        { id: 'A', text_kz: '(2; 3) және (3; 2)', text_ru: '(2; 3) и (3; 2)', text_en: '(2, 3) and (3, 2)', is_distractor: false },
        { id: 'B', text_kz: '(1; 4) және (4; 1)', text_ru: '(1; 4) и (4; 1)', text_en: '(1; 4) and (4; 1)', is_distractor: true, misconception: '1² + 4² = 17 ≠ 13' },
        { id: 'C', text_kz: '(-2; 7) және (7; -2)', text_ru: '(-2; 7) и (7; -2)', text_en: '(-2, 7) and (7, -2)', is_distractor: true, misconception: '(-2)² + 7² = 53 ≠ 13' },
        { id: 'D', text_kz: '(0; 5) және (5; 0)', text_ru: '(0; 5) и (5; 0)', text_en: '(0, 5) and (5, 0)', is_distractor: true, misconception: '0² + 5² = 25 ≠ 13' }
      ]),
      correct_answer: 'A',
      explanation_kz: 'y = 5 - x алмастыруын екінші теңдеуге қоямыз: x² + (5 - x)² = 13 => 2x² - 10x + 12 = 0 => x² - 5x + 6 = 0 => (x - 2)(x - 3) = 0. Осыдан (2; 3) және (3; 2).',
      explanation_ru: 'Подставляем y = 5 - x во 2-е уравнение: 2x² - 10x + 12 = 0 => x² - 5x + 6 = 0 => x₁=2, y₁=3; x₂=3, y₂=2.',
      explanation_en: 'Substitute y = 5 - x into x² + y² = 13 to get x² - 5x + 6 = 0. Roots are x = 2 and x = 3.',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['ALG_09_SUBSTITUTION_METHOD', 'ALG_09_NONLINEAR_SYSTEMS'])
    },

    // 5. Algebra - Topic 5: Теңсіздіктер жүйесі
    {
      topic_id: algTopicIds[4],
      mode: 'A',
      question_kz: 'Теңсіздіктер жүйесінің шешімін табыңыз: $\\begin{cases} 2x - 4 \\ge 0 \\\\ x^2 - 9 < 0 \\end{cases}$.',
      question_ru: 'Найдите решение системы неравенств: $\\begin{cases} 2x - 4 \\ge 0 \\\\ x^2 - 9 < 0 \\end{cases}$.',
      question_en: 'Find the solution to the system of inequalities: $\\begin{cases} 2x - 4 \\ge 0 \\\\ x^2 - 9 < 0 \\end{cases}$.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'SYSTEM_INTERVAL_OVERLAP',
        elements: [
          { type: 'number_line_layer', name: '2x - 4 >= 0', interval: [2, Infinity], bracket: 'closed', color: '#0969da' },
          { type: 'number_line_layer', name: 'x^2 - 9 < 0', interval: [-3, 3], bracket: 'open', color: '#1a7f37' },
          { type: 'intersection_highlight', interval: [2, 3], left_bracket: '[', right_bracket: ')' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: '[2; 3)', text_ru: '[2; 3)', text_en: '[2; 3)', is_distractor: false },
        { id: 'B', text_kz: '(2; 3)', text_ru: '(2; 3)', text_en: '(2; 3)', is_distractor: true, misconception: 'x = 2 нүктесінің қатаң еместігін ескермеді' },
        { id: 'C', text_kz: '[-3; 2]', text_ru: '[-3; 2]', text_en: '[-3; 2]', is_distractor: true, misconception: 'Қиылысу орнына бірінші теңсіздіктің теріс бөлігін алды' },
        { id: 'D', text_kz: '[2; +∞)', text_ru: '[2; +∞)', text_en: '[2; +∞)', is_distractor: true, misconception: 'Екінші теңсіздіктің оң жақ шегін ескермеді' }
      ]),
      correct_answer: 'A',
      explanation_kz: '1) 2x ≥ 4 => x ≥ 2 (аралығы [2; +∞)).\n2) x² - 9 < 0 => (x - 3)(x + 3) < 0 => (-3; 3).\n3) Қиылысуы: [2; +∞) ∩ (-3; 3) = [2; 3).',
      explanation_ru: '1) x ≥ 2.\n2) -3 < x < 3.\n3) Пересечение: [2; 3).',
      explanation_en: '1) x >= 2.\n2) -3 < x < 3.\n3) Intersection is [2, 3).',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['ALG_09_INEQ_SYSTEM_OVERLAP', 'ALG_09_COMPOUND_CONDITIONS'])
    },

    // 6. Algebra - Topic 3: Еселі түбірлер мен таңба сақталуы
    {
      topic_id: algTopicIds[2],
      mode: 'A',
      question_kz: '$\\frac{(x - 1)^2 (x + 4)}{x - 3} \\ge 0$ теңсіздігінің ең кіші бүтін оң шешімін табыңыз.',
      question_ru: 'Найдите наименьшее целое положительное решение неравенства $\\frac{(x - 1)^2 (x + 4)}{x - 3} \\ge 0$.',
      question_en: 'Find the smallest positive integer solution to $\\frac{(x - 1)^2 (x + 4)}{x - 3} \\ge 0$.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE_DOUBLE_ROOT',
        elements: [
          { type: 'double_root', x: 1, note: 'Жұп дәреже (таңба өзгермейді)' },
          { type: 'pole', x: 3, note: 'Бөлім (выколотая)' },
          { type: 'root', x: -4, note: 'Алым (боялған)' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: '1', text_ru: '1', text_en: '1', is_distractor: false },
        { id: 'B', text_kz: '4', text_ru: '4', text_en: '4', is_distractor: true, misconception: 'x = 1 нүктесінде өрнек 0-ге тең болып теңсіздікті қанағаттандыратынын ұмытып, тек (3; +∞) аралығынан іздеді' },
        { id: 'C', text_kz: '2', text_ru: '2', text_en: '2', is_distractor: true, misconception: 'x = 2 қойғанда таңба теріс болады' },
        { id: 'D', text_kz: '3', text_ru: '3', text_en: '3', is_distractor: true, misconception: 'Бөлімдегі x = 3 нүктесі анықталмаған' }
      ]),
      correct_answer: 'A',
      explanation_kz: 'x = 1 кезінде алымы 0 болады, яғни 0 ≥ 0 дұрыс теңдік. 1 — бүтін оң сан! Сондықтан ең кіші бүтін оң шешім: x = 1.',
      explanation_ru: 'При x = 1 числитель обращается в 0, что удовлетворяет нестрогому знаку ≥ 0. Число 1 положительное и целое, поэтому наименьшее решение x = 1.',
      explanation_en: 'At x = 1, numerator is 0, satisfying >= 0. Since 1 is positive integer, smallest answer is 1.',
      difficulty: 3,
      micro_skills_json: JSON.stringify(['ALG_09_EVEN_POWER_ROOTS', 'ALG_09_INTEGER_BOUNDARY_CHECK'])
    },

    // 7. Algebra - Topic 1: Қысқаша көбейту формуласы мен теңдеулер жүйесі
    {
      topic_id: algTopicIds[0],
      mode: 'A',
      question_kz: 'Егер $x^2 - y^2 = 21$ және $x - y = 3$ болса, $x + y$ өрнегінің мәні неге тең?',
      question_ru: 'Если $x^2 - y^2 = 21$ и $x - y = 3$, то чему равно значение выражения $x + y$?',
      question_en: 'If $x^2 - y^2 = 21$ and $x - y = 3$, what is the value of $x + y$?',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'ALGEBRAIC_IDENTITY',
        elements: [
          { type: 'identity_box', formula: 'x² - y² = (x - y)(x + y)' },
          { type: 'substitution', left: '21', factors: ['3', '(x + y)'] }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: '7', text_ru: '7', text_en: '7', is_distractor: false },
        { id: 'B', text_kz: '18', text_ru: '18', text_en: '18', is_distractor: true, misconception: '21 - 3 = 18 деп азайтып тастады' },
        { id: 'C', text_kz: '63', text_ru: '63', text_en: '63', is_distractor: true, misconception: '21 * 3 = 63 деп көбейтті' },
        { id: 'D', text_kz: '4', text_ru: '4', text_en: '4', is_distractor: true, misconception: 'x-тің мәнін таптым деп шатасты' }
      ]),
      correct_answer: 'A',
      explanation_kz: '$x^2 - y^2 = (x - y)(x + y)$. Мәндерін қоямыз: $21 = 3 \\cdot (x + y) \\Rightarrow x + y = 21 / 3 = 7$.',
      explanation_ru: 'Разложим разность квадратов: $x^2 - y^2 = (x - y)(x + y)$. Получаем $21 = 3(x + y) \\Rightarrow x + y = 7$.',
      explanation_en: 'Factoring gives $x^2 - y^2 = (x - y)(x + y) \\Rightarrow 21 = 3(x + y) \\Rightarrow x + y = 7$.',
      difficulty: 1,
      micro_skills_json: JSON.stringify(['ALG_09_DIFFERENCE_OF_SQUARES', 'ALG_09_EQUATION_SYSTEM_SHORTCUTS'])
    },

    // 8. Physics - Topic 2: Бірқалыпты үдемелі қозғалыс
    {
      topic_id: phyTopicIds[1],
      mode: 'A',
      question_kz: 'Дене бастапқы $v_0 = 4\\text{ м/с}$ жылдамдықпен түзу сызықты $a = 2\\text{ м/с}^2$ тұрақты үдеумен қозғалады. $t = 3\\text{ с}$ уақыттан кейінгі дененің жүрген жолын ($s$) анықтаңыз.',
      question_ru: 'Тело движется прямолинейно с начальной скоростью $v_0 = 4\\text{ м/с}$ и постоянным ускорением $a = 2\\text{ м/с}^2$. Определите перемещение тела за $t = 3\\text{ с}$.',
      question_en: 'An object moves in a straight line with initial velocity $v_0 = 4\\text{ m/s}$ and constant acceleration $a = 2\\text{ m/s}^2$. Calculate displacement after $t = 3\\text{ s}$.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'V_T_KINEMATICS_GRAPH',
        elements: [
          { type: 'coordinate_grid', x_label: 't (с)', y_label: 'v (м/с)' },
          { type: 'line_segment', from: [0, 4], to: [3, 10], color: '#0969da', label: 'v(t) = 4 + 2t' },
          { type: 'shaded_trapezoid', points: [[0, 0], [0, 4], [3, 10], [3, 0]], color: 'rgba(9,105,218,0.2)', label: 'S = S_прямоугольник + S_треугольник' }
        ]
      }),
      desmos_state: JSON.stringify({
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'v(t) = 4 + 2t \\{0 \\le t \\le 3\\}', color: '#0969da' },
            { id: '2', latex: 's(t) = 4t + \\frac{1}{2}(2)t^2', color: '#1a7f37' }
          ]
        }
      }),
      options_json: JSON.stringify([
        { id: 'A', text_kz: '21 м', text_ru: '21 м', text_en: '21 m', is_distractor: false },
        { id: 'B', text_kz: '18 м', text_ru: '18 м', text_en: '18 m', is_distractor: true, misconception: 's = at²/2 бөлігінде 1/2 коэффициентін ұмытып, тек at²/2 есептеді немесе v0-ді қоспады' },
        { id: 'C', text_kz: '30 м', text_ru: '30 м', text_en: '30 m', is_distractor: true, misconception: 's = v_соңғы * t деп есептеді (10 * 3 = 30)' },
        { id: 'D', text_kz: '15 м', text_ru: '15 м', text_en: '15 m', is_distractor: true, misconception: 'Арифметикалық қате' }
      ]),
      correct_answer: 'A',
      explanation_kz: 'Орын ауыстыру формуласы: $s = v_0 t + \\frac{a t^2}{2}$.\nМәндерін қоямыз: $s = 4 \\cdot 3 + \\frac{2 \\cdot 3^2}{2} = 12 + 9 = 21\\text{ м}$.\nНемесе v(t) графигі бойынша трапеция ауданы: $S = \\frac{4 + 10}{2} \\cdot 3 = 7 \\cdot 3 = 21\\text{ м}$.',
      explanation_ru: 'Формула перемещения: $s = v_0 t + \\frac{at^2}{2} = 4 \\cdot 3 + \\frac{2 \\cdot 9}{2} = 12 + 9 = 21\\text{ м}$.',
      explanation_en: 'Displacement equation: $s = v_0 t + \\frac{1}{2}at^2 = 4(3) + 0.5(2)(9) = 12 + 9 = 21\\text{ m}$.',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['PHY_09_ACCEL_DISPLACEMENT', 'PHY_09_V_T_INTEGRAL_AREA'])
    },

    // 9. Physics - Topic 3: Ньютонның екінші заңы
    {
      topic_id: phyTopicIds[2],
      mode: 'A',
      question_kz: 'Массасы $m = 5\\text{ кг}$ денеге горизонт бойымен $F = 30\\text{ Н}$ тарту күші әсер етеді. Үйкеліс коэффициенті $\\mu = 0.2$, $g = 10\\text{ м/с}^2$. Дененің үдеуін ($a$) табыңыз.',
      question_ru: 'К телу массой $m = 5\\text{ кг}$ приложена горизонтальная сила тяги $F = 30\\text{ Н}$. Коэффициент трения $\\mu = 0.2$, $g = 10\\text{ м/с}^2$. Найдите ускорение тела ($a$).',
      question_en: 'A horizontal pull force of $F = 30\\text{ N}$ acts on a mass of $m = 5\\text{ kg}$. The friction coefficient is $\\mu = 0.2$, $g = 10\\text{ м/с}^2$. Find the acceleration ($a$).',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'FREE_BODY_DIAGRAM',
        elements: [
          { type: 'body_box', mass: '5 kg', center: [0, 0] },
          { type: 'force_vector', name: 'F_тяга', direction: 'right', mag: 30, color: '#0969da' },
          { type: 'force_vector', name: 'F_үйкеліс', direction: 'left', mag: 10, color: '#cf222e' },
          { type: 'force_vector', name: 'N', direction: 'up', mag: 50, color: '#1a7f37' },
          { type: 'force_vector', name: 'mg', direction: 'down', mag: 50, color: '#6e7781' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: '4 м/с²', text_ru: '4 м/с²', text_en: '4 m/s²', is_distractor: false },
        { id: 'B', text_kz: '6 м/с²', text_ru: '6 м/с²', text_en: '6 m/s²', is_distractor: true, misconception: 'Үйкеліс күшін ескермеді: a = F/m = 30/5 = 6' },
        { id: 'C', text_kz: '2 м/с²', text_ru: '2 м/с²', text_en: '2 m/s²', is_distractor: true, misconception: 'Үйкеліс күшін екі есе артық есептеді' },
        { id: 'D', text_kz: '5 м/с²', text_ru: '5 м/с²', text_en: '5 m/s²', is_distractor: true, misconception: 'Арифметикалық қате' }
      ]),
      correct_answer: 'A',
      explanation_kz: '1. Үйкеліс күші: $F_{үйк} = \\mu N = \\mu m g = 0.2 \\cdot 5 \\cdot 10 = 10\\text{ Н}$.\n2. Теңәсерлі күш: $F_{тең} = F - F_{үйк} = 30 - 10 = 20\\text{ Н}$.\n3. Ньютонның 2-заңы: $a = \\frac{F_{тең}}{m} = \\frac{20}{5} = 4\\text{ м/с}^2$.',
      explanation_ru: '1. Сила трения: $F_{тр} = \\mu mg = 0.2 \\cdot 5 \\cdot 10 = 10\\text{ Н}$.\n2. Результирующая сила: $F_{рез} = 30 - 10 = 20\\text{ Н}$.\n3. Ускорение: $a = 20 / 5 = 4\\text{ м/с}^2$.',
      explanation_en: '1. Friction force: $F_f = \\mu m g = 10\\text{ N}$.\n2. Net force: $F_{net} = 30 - 10 = 20\\text{ N}$.\n3. Acceleration: $a = F_{net}/m = 20/5 = 4\\text{ m/s}^2$.',
      difficulty: 3,
      micro_skills_json: JSON.stringify(['PHY_09_NEWTON_SECOND_LAW', 'PHY_09_FRICTION_CALC', 'PHY_09_FORCE_VECTORS'])
    },

    // 10. Physics - Topic 4: Бүкіләлемдік тартылыс заңы
    {
      topic_id: phyTopicIds[3],
      mode: 'A',
      question_kz: 'Екі дене арасындағы қашықтықты 3 есе арттырса, олардың арасындағы гравитациялық тартылыс күші қалай өзгереді?',
      question_ru: 'Как изменится сила гравитационного притяжения между двумя телами, если расстояние между ними увеличить в 3 раза?',
      question_en: 'How does the gravitational attraction between two bodies change if the distance between them is tripled?',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'GRAVITATIONAL_FIELD',
        elements: [
          { type: 'planet', name: 'M1', pos: [-3, 0], radius: 1.2 },
          { type: 'planet', name: 'M2', pos: [3, 0], radius: 0.8 },
          { type: 'distance_arrow', r: 'R -> 3R', force_relation: 'F ~ 1/R^2' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: '9 есе азаяды', text_ru: 'Уменьшится в 9 раз', text_en: 'Decreases by 9 times', is_distractor: false },
        { id: 'B', text_kz: '3 есе азаяды', text_ru: 'Уменьшится в 3 раза', text_en: 'Decreases by 3 times', is_distractor: true, misconception: 'Квадраттық тәуелділікті ұмытып, сызықтық деп ойлады' },
        { id: 'C', text_kz: '9 есе артады', text_ru: 'Увеличится в 9 раз', text_en: 'Increases by 9 times', is_distractor: true, misconception: 'Кері пропорционалдықты тура пропорционалдықпен шатастырды' },
        { id: 'D', text_kz: 'Өзгермейді', text_ru: 'Не изменится', text_en: 'Remains unchanged', is_distractor: true, misconception: 'Гравитация заңын білмейді' }
      ]),
      correct_answer: 'A',
      explanation_kz: 'Бүкіләлемдік тартылыс заңы: $F = G \\frac{m_1 m_2}{R^2}$. Тартылыс күші қашықтықтың квадратына кері пропорционал. Қашықтық 3 есе артса ($R\' = 3R$), күш $3^2 = 9$ есе азаяды.',
      explanation_ru: 'Закон тяготения: $F = G \\frac{m_1 m_2}{R^2}$. Сила обратно пропорциональна квадрату расстояния. При увеличении расстояния в 3 раза сила уменьшится в $3^2 = 9$ раз.',
      explanation_en: 'By Newton\'s Law of Universal Gravitation, $F \\propto 1/R^2$. Tripling the distance reduces the force by a factor of $3^2 = 9$.',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['PHY_09_GRAVITY_INVERSE_SQUARE', 'PHY_09_PROPORTIONAL_REASONING'])
    },

    // 11. Physics - Topic 5: Еркін түсу (Режим Б)
    {
      topic_id: phyTopicIds[4],
      mode: 'B',
      question_kz: 'Дене $h = 45\\text{ м}$ биіктіктен бастапқы жылдамдықсыз еркін түседі ($g = 10\\text{ м/с}^2$). Дененің жерге жету уақытын ($t$) және жерге соғылар кездегі жылдамдығын ($v$) анықтаңыз.',
      question_ru: 'Тело свободно падает с высоты $h = 45\\text{ м}$ без начальной скорости ($g = 10\\text{ м/с}^2$). Найдите время падения ($t$) и скорость в момент удара о землю ($v$).',
      question_en: 'A body falls freely from height $h = 45\\text{ m}$ without initial velocity ($g = 10\\text{ m/s}^2$). Find the time of fall ($t$) and impact speed ($v$).',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'FREE_FALL_MOTION',
        elements: [
          { type: 'vertical_axis', height: 45, unit: 'm' },
          { type: 'falling_body', initial_v: 0, g: 10, final_v_vector: true }
        ]
      }),
      desmos_state: null,
      options_json: null,
      correct_answer: 't = 3 s, v = 30 m/s',
      explanation_kz: '1. Еркін түсу уақыты: $h = \\frac{gt^2}{2} \\Rightarrow t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\cdot 45}{10}} = \\sqrt{9} = 3\\text{ с}$.\n2. Жерге соғылу жылдамдығы: $v = gt = 10 \\cdot 3 = 30\\text{ м/с}$.',
      explanation_ru: '1. Время падения: $t = \\sqrt{2h/g} = \\sqrt{90/10} = 3\\text{ с}$.\n2. Скорость падения: $v = gt = 10 \\cdot 3 = 30\\text{ м/с}$.',
      explanation_en: '1. Time: $t = \\sqrt{2h/g} = 3\\text{ s}$.\n2. Final velocity: $v = gt = 30\\text{ m/s}$.',
      difficulty: 3,
      micro_skills_json: JSON.stringify(['PHY_09_FREE_FALL_EQUATIONS', 'PHY_09_ENERGY_KINEMATICS_CONVERSION'])
    },

    // 12. Physics - Topic 1: Кинематика графиктері
    {
      topic_id: phyTopicIds[0],
      mode: 'A',
      question_kz: 'Материялық нүкте радиусы $R = 10\\text{ м}$ шеңбер бойымен бір жарты айналым жасады. Жүрген жолы ($l$) мен орын ауыстыру модулін ($s$) анықтаңыз.',
      question_ru: 'Материальная точка совершила половину оборота по окружности радиуса $R = 10\\text{ м}$. Найдите путь ($l$) и модуль перемещения ($s$).',
      question_en: 'A point moves along half of a circle of radius $R = 10\\text{ m}$. Find distance ($l$) and displacement ($s$).',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'CIRCULAR_KINEMATICS',
        elements: [
          { type: 'circle', radius: 10, start_angle: 180, end_angle: 0, arc_color: '#0969da', label: 'Жол l = πR' },
          { type: 'chord_vector', from: [-10, 0], to: [10, 0], color: '#cf222e', label: 'Орын ауыстыру s = 2R' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: 'l = 31.4 м, s = 20 м', text_ru: 'l = 31.4 м, s = 20 м', text_en: 'l = 31.4 m, s = 20 m', is_distractor: false },
        { id: 'B', text_kz: 'l = 20 м, s = 31.4 м', text_ru: 'l = 20 м, s = 31.4 м', text_en: 'l = 20 m, s = 31.4 m', is_distractor: true, misconception: 'Жол мен орын ауыстыруды шатастырды' },
        { id: 'C', text_kz: 'l = 62.8 м, s = 0 м', text_ru: 'l = 62.8 м, s = 0 м', text_en: 'l = 62.8 m, s = 0 m', is_distractor: true, misconception: 'Толық айналым деп қателесті' },
        { id: 'D', text_kz: 'l = 10 м, s = 10 м', text_ru: 'l = 10 м, s = 10 м', text_en: 'l = 10 m, s = 10 m', is_distractor: true, misconception: 'Радиусты жол деп есептеді' }
      ]),
      correct_answer: 'A',
      explanation_kz: '1. Жол — траектория ұзындығы: $l = \\pi R = 3.14 \\cdot 10 = 31.4\\text{ м}$.\n2. Орын ауыстыру — бастапқы және соңғы нүктелерді қосатын вектор: диаметрге тең $s = 2R = 20\\text{ м}$.',
      explanation_ru: 'Путь по полуокружности: $l = \\pi R = 31.4\\text{ м}$. Перемещение — диаметр: $s = 2R = 20\\text{ м}$.',
      explanation_en: 'Distance is half circumference $\\pi R = 31.4\\text{ m}$. Displacement is straight line diameter $2R = 20\\text{ m}$.',
      difficulty: 1,
      micro_skills_json: JSON.stringify(['PHY_09_PATH_VS_DISPLACEMENT', 'PHY_09_CIRCULAR_GEOMETRY'])
    },

    // 13. Kazakh Language - Topic 2: Сабақтас құрмалас
    {
      topic_id: kazTopicIds[1],
      mode: 'A',
      question_kz: '«Күн жылынса, табиғат құлпыра түседі» сөйлеміндегі бағыныңқы сөйлемнің түрін анықтаңыз.',
      question_ru: 'Определите вид придаточного предложения в сложноподчиненном предложении: «Күн жылынса, табиғат құлпыра түседі».',
      question_en: 'Identify the type of subordinate clause in the sentence: «Күн жылынса, табиғат құлпыра түседі».',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'LINGUISTIC_SYNTAX_TREE',
        elements: [
          { type: 'subordinate_clause', text: 'Күн жылынса', marker: '-са/-се (шартты рай)', role: 'Бағыныңқы (Шарт бағыныңқы)' },
          { type: 'main_clause', text: 'табиғат құлпыра түседі', role: 'Басыңқы сыңар' },
          { type: 'relation_arrow', from: 'Бағыныңқы', to: 'Басыңқы', question: 'Қайтсе? Қандай жағдайда?' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: 'Шартты бағыныңқы сабақтас', text_ru: 'Придаточное условия', text_en: 'Conditional subordinate clause', is_distractor: false },
        { id: 'B', text_kz: 'Қарсылықты бағыныңқы сабақтас', text_ru: 'Придаточное уступительное', text_en: 'Concessive subordinate clause', is_distractor: true, misconception: '-са да / -се де жұрнақтарымен шатастырды' },
        { id: 'C', text_kz: 'Себеп бағыныңқы сабақтас', text_ru: 'Придаточное причины', text_en: 'Causal subordinate clause', is_distractor: true, misconception: '-ғандықтан қосымшасын шатастырды' },
        { id: 'D', text_kz: 'Мезгіл бағыныңқы сабақтас', text_ru: 'Придаточное времени', text_en: 'Temporal subordinate clause', is_distractor: true, misconception: '-ғанда/-генде жұрнағымен шатастырды' }
      ]),
      correct_answer: 'A',
      explanation_kz: 'Бағыныңқы сөйлемнің баяндауышы «жылынса» шартты рай қосымшасы (-са) арқылы жасалып, басыңқы сөйлемдегі іс-әрекеттің орындалу шартын білдіріп тұр. Сондықтан бұл — шартты бағыныңқы сабақтас құрмалас сөйлем.',
      explanation_ru: 'Сказуемое придаточной части имеет суффикс условного наклонения «-са», отвечает на вопрос «Қайтсе?» (при каком условии?), выражая условие действия главного предложения.',
      explanation_en: 'The predicate of the subordinate clause has the conditional mood suffix "-sa", indicating the condition for the main action.',
      difficulty: 2,
      micro_skills_json: JSON.stringify(['KAZ_09_CONDITIONAL_CLAUSE', 'KAZ_09_SUBORDINATE_TYPES'])
    },

    // 14. Kazakh Language - Topic 1: Салалас құрмалас
    {
      topic_id: kazTopicIds[0],
      mode: 'A',
      question_kz: 'Берілген сөйлемдердің ішінен қарсылықты салалас құрмалас сөйлемді табыңыз:',
      question_ru: 'Найдите сложносочиненное предложение с противительными отношениями:',
      question_en: 'Find the compound sentence with an adversative relationship:',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'SENTENCE_STRUCTURE_DIAGRAM',
        elements: [
          { type: 'clause_box', clause_1: '[ Жаңбыр басылды ]', conjunction: 'бірақ', clause_2: '[ күн ашылмады ]' },
          { type: 'contrast_marker', symbol: '↔', meaning: 'Қарама-қайшылық' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: 'Жаңбыр басылды, бірақ күн ашылмады.', text_ru: 'Дождь утих, но солнце не вышло.', text_en: 'The rain stopped, but the sun did not come out.', is_distractor: false },
        { id: 'B', text_kz: 'Қоңырау соғылды және оқушылар сыныпқа кірді.', text_ru: 'Прозвенел звонок, и ученики вошли в класс.', text_en: 'The bell rang and students entered the class.', is_distractor: true, misconception: 'Ыңғайлас салалас (және жалғаулығы)' },
        { id: 'C', text_kz: 'Не мен барамын, не сен келесің.', text_ru: 'Либо я пойду, либо ты придешь.', text_en: 'Either I will go or you will come.', is_distractor: true, misconception: 'Талғаулы салалас' },
        { id: 'D', text_kz: 'Біресе қар жауады, біресе күн шығады.', text_ru: 'То снег идет, то солнце светит.', text_en: 'Now it snows, now the sun shines.', is_distractor: true, misconception: 'Кезектес салалас' }
      ]),
      correct_answer: 'A',
      explanation_kz: '«Бірақ, алайда, дегенмен» жалғаулықтары құрамындағы жай сөйлемдердің мағынасын бір-біріне қарама-қарсы қойып, қарсылықты салалас құрмалас сөйлем жасайды.',
      explanation_ru: 'Союзы «бірақ, алайда, дегенмен» связывают части сложносочиненного предложения с противительным значением.',
      explanation_en: 'Conjunctions like «бірақ» (but) connect clauses with contrasting meanings.',
      difficulty: 1,
      micro_skills_json: JSON.stringify(['KAZ_09_COORDINATE_CONTRAST', 'KAZ_09_CONJUNCTIONS'])
    },

    // 15. Kazakh Language - Topic 4: Морфемдік талдау (Режим Б)
    {
      topic_id: kazTopicIds[3],
      mode: 'B',
      question_kz: '«Отансүйгіштік» сөзіне толық морфемдік талдау жасаңыз (түбір, сөзжасамдық жұрнақ, мағыналық қызметі). Шешіміңізді жазыңыз.',
      question_ru: 'Выполните полный морфемный разбор слова «Отансүйгіштік» (корень, словообразовательные аффиксы). Запишите ответ.',
      question_en: 'Perform a complete morphemic analysis of the word «Отансүйгіштік» (root, derivational suffixes). Write your analysis.',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'MORPHEME_BREAKDOWN',
        elements: [
          { type: 'morpheme', part: 'Отан', role: 'түбір сөз (зат есім)' },
          { type: 'morpheme', part: 'сүй', role: 'екінші түбір (етістік)' },
          { type: 'morpheme', part: '-гіш', role: 'етістіктен сын есім тудырушы жұрнақ' },
          { type: 'morpheme', part: '-тік', role: 'сын есімнен дерексіз зат есім тудырушы жұрнақ' }
        ]
      }),
      desmos_state: null,
      options_json: null,
      correct_answer: 'Отан + сүй + -гіш + -тік (Күрделі кіріккен туынды сөз)',
      explanation_kz: '1. Отан (түбір) + сүй (түбір) -> Отансүй (кіріккен сөз негізі).\n2. -гіш: етістіктен сын есім жасаушы жұрнақ.\n3. -тік: сын есімнен абстрактілі зат есім жасаушы жұрнақ.',
      explanation_ru: '1. Отан + сүй (сложная основа).\n2. -гіш: суффикс образования прилагательного.\n3. -тік: суффикс образования абстрактного существительного.',
      explanation_en: 'Compound derivative: Otan (root) + suy (root) + -gish (adj suffix) + -tik (abstract noun suffix).',
      difficulty: 3,
      micro_skills_json: JSON.stringify(['KAZ_09_MORPHEME_ANALYSIS', 'KAZ_09_COMPOUND_DERIVATION'])
    },

    // 16. Kazakh Language - Topic 2: Абай өлеңдерінің синтаксисі
    {
      topic_id: kazTopicIds[2],
      mode: 'A',
      question_kz: '«Ғылым таппай мақтанба, орын таппай баптанба» (Абай) сөйлемінің құрылымдық түрін анықтаңыз.',
      question_ru: 'Определите структуру предложения Абая: «Ғылым таппай мақтанба, орын таппай баптанба».',
      question_en: 'Identify the structural type of Abai\'s sentence: «Ғылым таппай мақтанба, орын таппай баптанба».',
      zvdsl_canvas_json: JSON.stringify({
        schema_version: '1.0',
        canvas_type: 'POETIC_SYNTAX',
        elements: [
          { type: 'parallel_clause_1', text: '[ Ғылым таппай ] -> [ мақтанба ]' },
          { type: 'parallel_clause_2', text: '[ орын таппай ] -> [ баптанба ]' }
        ]
      }),
      desmos_state: null,
      options_json: JSON.stringify([
        { id: 'A', text_kz: 'Шартты бағыныңқылы сабақтас құрмалас', text_ru: 'Сложноподчиненное предложение с придаточным условия', text_en: 'Conditional complex sentence', is_distractor: false },
        { id: 'B', text_kz: 'Ыңғайлас салалас құрмалас', text_ru: 'Сложносочиненное соединительное', text_en: 'Compound sentence', is_distractor: true, misconception: 'Құрмаласу тәсілін шатастырды' },
        { id: 'C', text_kz: 'Жай жалаң сөйлем', text_ru: 'Простое нераспространенное', text_en: 'Simple sentence', is_distractor: true, misconception: 'Сөйлемде бірнеше предикативтік орталық бар' },
        { id: 'D', text_kz: 'Түсіндірмелі салалас', text_ru: 'Сложносочиненное пояснительное', text_en: 'Explanatory compound', is_distractor: true, misconception: 'Интонацияны шатастырды' }
      ]),
      correct_answer: 'A',
      explanation_kz: '«Таппай» (тап-па-й) — көсемше тұлғалы шарттық мәндегі бағыныңқы сөйлем: Ғылым таппасаң — мақтанба. Сабақтас құрмалас сөйлем.',
      explanation_ru: 'Деепричастная форма на «-май/-пей» здесь имеет значение условия («если не найдешь»), образуя сложноподчиненное предложение.',
      explanation_en: 'The verbal adverb form carries conditional meaning, forming a subordinate conditional complex sentence.',
      difficulty: 3,
      micro_skills_json: JSON.stringify(['KAZ_09_POETIC_SYNTAX', 'KAZ_09_VERBAL_ADVERB_CLAUSES'])
    }
  ];

  const questionIds: number[] = [];
  for (const q of questionsData) {
    const res = insertQuestion.run(
      q.topic_id,
      q.mode,
      q.question_kz,
      q.question_ru,
      q.question_en,
      q.zvdsl_canvas_json,
      q.desmos_state,
      q.options_json,
      q.correct_answer,
      q.explanation_kz,
      q.explanation_ru,
      q.explanation_en,
      q.difficulty,
      q.micro_skills_json,
      now
    );
    questionIds.push(Number(res.lastInsertRowid));
  }

  // ==========================================================================
  // 7. STUDENT ELO & ELO HISTORY
  // ==========================================================================
  console.log('🦅 Seeding ELO ratings & history ledger...');
  const insertElo = db.prepare(`
    INSERT INTO student_elo (student_id, course_id, current_elo, rank, highest_elo, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertEloHistory = db.prepare(`
    INSERT INTO student_elo_history (student_id, delta, reason, current_elo, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Course ELOs for Azamat
  insertElo.run(azamatUserId, algebraCourseId, 1440, 'QYRAN', 1455, now);
  insertElo.run(azamatUserId, physicsCourseId, 1420, 'QYRAN', 1420, now);
  insertElo.run(azamatUserId, kazakhCourseId, 1400, 'QYRAN', 1410, now);

  // ELOs for other students
  for (let i = 0; i < studentIds.length; i++) {
    const sid = studentIds[i];
    if (sid === azamatUserId) continue;
    const baseElo = studentNames[i].elo;
    const rank = studentNames[i].rank;
    insertElo.run(sid, algebraCourseId, baseElo, rank, baseElo + 25, now);
    insertElo.run(sid, physicsCourseId, baseElo - 20, rank, baseElo, now);
    insertElo.run(sid, kazakhCourseId, baseElo + 10, rank, baseElo + 30, now);
  }

  // ELO History Ledger for Azamat (simulating progression to 1420)
  const historyEvents = [
    { delta: 15, reason: 'EUREKA', elo: 1370, daysAgo: 10 },
    { delta: 7, reason: 'SHORT_STEP', elo: 1377, daysAgo: 8 },
    { delta: 15, reason: 'FULL_STEP', elo: 1392, daysAgo: 6 },
    { delta: 15, reason: 'EUREKA', elo: 1407, daysAgo: 4 },
    { delta: 3, reason: 'DIRECT_ANSWER', elo: 1410, daysAgo: 2 },
    { delta: 10, reason: 'FULL_STEP', elo: 1420, daysAgo: 0 }
  ];

  for (const ev of historyEvents) {
    const d = new Date();
    d.setDate(d.getDate() - ev.daysAgo);
    insertEloHistory.run(azamatUserId, ev.delta, ev.reason, ev.elo, d.toISOString());
  }

  // ==========================================================================
  // 8. STUDENT ATTEMPTS & SOCRATIC DIALOGUE
  // ==========================================================================
  console.log('💬 Seeding student attempts & Socratic dialogues...');
  const insertAttempt = db.prepare(`
    INSERT INTO student_attempts (
      student_id, question_id, chosen_option, text_response, photo_urls_json,
      is_correct, elo_delta, socratic_dialogue_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  if (questionIds.length > 0) {
    // Attempt 1: Azamat solved question 1 with Eureka
    insertAttempt.run(
      azamatUserId,
      questionIds[0],
      'A',
      '(-∞; -2) ∪ (3; +∞)',
      null,
      1,
      15,
      JSON.stringify({
        session_id: 'soc-sess-001',
        turns: [
          { role: 'aga', text: 'Керемет бастама! Сан түзуіндегі нөлдік нүктелерді тексеріп көрейік. x = 4 болғанда өрнек таңбасы қандай болады?', thought_forks: ['Оң (+)', 'Теріс (-)', 'Нөл (0)'] },
          { role: 'student', chosen_fork: 'Оң (+)', text: 'x = 4 кезінде (4-3)(4+2) = 1*6 = 6 > 0, яғни таңбасы оң!' },
          { role: 'aga', text: 'Дәл солай! Ал (-2; 3) аралығында x = 0 нүктесінде ше?', thought_forks: ['(0-3)(0+2) = -6 < 0', '(0-3)(0+2) = +6', 'Таңба өзгермейді'] },
          { role: 'student', chosen_fork: '(0-3)(0+2) = -6 < 0', text: 'Теріс болады. Демек шешімі шеткі оң аралықтар.' },
          { role: 'aga', text: '💡 Eureka Moment! Сен аралықтар әдісінің заңдылығын толық ұғындың! +15 ELO', is_eureka: true }
        ]
      }),
      now
    );

    // Attempt 2: Mode B notebook attempt
    insertAttempt.run(
      azamatUserId,
      questionIds[1],
      null,
      'Бөлшектің нөлдері: x = -2, x = 2, x = 5 (бөлімде). Таңбалар: (-), (+), (-), (+). Шешімі: (-∞; -2] ∪ [2; 5).',
      JSON.stringify(['/uploads/azamat_notebook_alg_p1.jpg']),
      1,
      15,
      JSON.stringify({
        session_id: 'soc-sess-002',
        ai_verification: 'Толық дұрыс шығарылған. Бөліміндегі 5 нүктесінің ашық қалдырылуы дәл көрсетілген.'
      }),
      now
    );
  }

  // ==========================================================================
  // 9. STUDENT HEATMAP (60+ Days Activity Matrix for Azamat with 12-day streak)
  // ==========================================================================
  console.log('🔥 Seeding student heatmap & 12-day streak...');
  const insertHeatmap = db.prepare(`
    INSERT INTO student_heatmap (student_id, date, activity_count, level, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const today = new Date();
  for (let d = 60; d >= 0; d--) {
    const curDate = new Date();
    curDate.setDate(today.getDate() - d);
    const dateStr = curDate.toISOString().split('T')[0];

    let count = 0;
    let level = 0;

    if (d <= 11) {
      count = 4 + ((d * 3 + 7) % 8);
      level = count > 8 ? 4 : count > 5 ? 3 : 2;
    } else {
      if (d % 3 === 0 || d % 5 === 0) {
        count = 2 + (d % 4);
        level = count > 4 ? 2 : 1;
      }
    }

    if (count > 0) {
      insertHeatmap.run(azamatUserId, dateStr, count, level, now);
    }
  }

  // ==========================================================================
  // 10. SPACED REPETITION CARDS (SM-2 Flashcards)
  // ==========================================================================
  console.log('🗂️ Seeding spaced repetition cards...');
  const insertCard = db.prepare(`
    INSERT INTO spaced_repetition_cards (
      student_id, topic_id, card_title, card_content,
      easiness_factor, interval_days, repetitions, next_review_date, last_reviewed_at, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cards = [
    {
      topic_id: algTopicIds[2],
      title: 'Аралықтар әдісінің алгоритмі',
      content: '1. Теңдеуді f(x) > 0 түріне келтіру\n2. f(x) нөлдерін табу\n3. Нүктелерді сан түзуіне белгілеу\n4. Әр аралықтағы таңбаны анықтау\n5. Қажетті таңбалы аралықтарды жазу',
      ef: 2.6,
      interval: 3,
      rep: 2,
      daysOffset: 1
    },
    {
      topic_id: phyTopicIds[1],
      title: 'Бірқалыпты үдемелі қозғалыс формулалары',
      content: 'v = v₀ + at\ns = v₀t + at²/2\nv² - v₀² = 2as\ns = ((v₀ + v)/2) * t',
      ef: 2.5,
      interval: 1,
      rep: 1,
      daysOffset: 0
    },
    {
      topic_id: phyTopicIds[2],
      title: 'Ньютонның 2-заңы және үйкеліс күші',
      content: 'F_тең = m · a\nF_үйк = μ · N = μ · m · g (көлденең жазықтықта)\nN = mg',
      ef: 2.7,
      interval: 6,
      rep: 3,
      daysOffset: 3
    },
    {
      topic_id: kazTopicIds[1],
      title: 'Сабақтас құрмалас сөйлемнің бағыныңқы түрлері',
      content: '1. Шартты (-са/-се)\n2. Қарсылықты (-са да/-се де, -ғанмен)\n3. Себеп (-ғандықтан/-гендіктен)\n4. Мезгіл (-ғанда/-генде)\n5. Қимыл-сын (-ып/-іп/-п, -а/-е/-й)\n6. Мақсат (-у үшін, -пақ болып)',
      ef: 2.4,
      interval: 2,
      rep: 2,
      daysOffset: 0
    }
  ];

  for (const c of cards) {
    const reviewDate = new Date();
    reviewDate.setDate(today.getDate() + c.daysOffset);
    const reviewDateStr = reviewDate.toISOString().split('T')[0];

    insertCard.run(
      azamatUserId,
      c.topic_id,
      c.title,
      c.content,
      c.ef,
      c.interval,
      c.rep,
      reviewDateStr,
      now,
      now
    );
  }

  // ==========================================================================
  // 11. RETENTION NOTIFICATIONS (Duolingo-style)
  // ==========================================================================
  console.log('🔔 Seeding retention notifications...');
  const insertNotification = db.prepare(`
    INSERT INTO retention_notifications (student_id, type, title, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const notifications = [
    {
      type: 'STREAK_SAVER',
      title: '🔥 Стрик қауіпте! 12 күндік нәтижеңді сақтап қал!',
      message: 'Бүгінгі күн аяқталуға жақын. 3 минуттық фокус-жаттығуды орындап, стрикіңді 13 күнге жеткіз!',
      is_read: 0
    },
    {
      type: 'AGA_REMINDER',
      title: '🦉 «Аға» сені тренажерде күтуде',
      message: '«Аралықтар әдісі» бойынша 2 жаңа күрделі сұрақ дайын. Өз ELO ұпайыңды +15-ке өсір!',
      is_read: 0
    },
    {
      type: 'MEMORY_BURN',
      title: '⚡ Формула қайталау уақыты',
      message: '«Бірқалыпты үдемелі қозғалыс» формулаларын ұмытпас үшін 1 минуттық қайталау картасын аш.',
      is_read: 1
    },
    {
      type: 'WEEKLY_DIGEST',
      title: '📈 Апталық жеңіс дайджесті',
      message: 'Осы аптада: +45 ELO жинадың, 18 есеп шығардың. Сыныпта 3-орында келесің 🦅!',
      is_read: 1
    }
  ];

  for (const n of notifications) {
    insertNotification.run(azamatUserId, n.type, n.title, n.message, n.is_read, now);
  }

  console.log('✅ Zerde database seeding completed successfully!');
  console.log(`   - 1 Teacher (Гульнара Сериковна, teacher@zerde.kz)`);
  console.log(`   - 1 Admin (admin@zerde.kz)`);
  console.log(`   - 24 Students in 9 «А» (Primary: Азамат Темірханов, azamat@zerde.kz, ELO 1420, 12-day streak)`);
  console.log(`   - 3 Courses (Алгебра, Физика, Қазақ тілі)`);
  console.log(`   - 15 Topics (Quarter 1)`);
  console.log(`   - ${questionsData.length} Rich Questions with ZVDSL+ Canvas & Desmos`);
  console.log(`   - Spaced Repetition Cards, Heatmap & Retention Notifications`);
}

// If executed directly via `ts-node src/db/seed.ts`
if (require.main === module) {
  try {
    seed();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}
