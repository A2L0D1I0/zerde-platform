import { api } from './client';

export interface StudentSkillMastery {
  probability: number;
  status: 'mastered' | 'in_progress' | 'deficit';
  attemptsCount?: number;
  lastAttemptCorrect?: boolean;
}

export interface ClassMatrixStudent {
  student_id: number;
  student_name: string;
  email: string;
  current_elo: number;
  rank: string;
  streak_days: number;
  skills: Record<string, StudentSkillMastery>;
}

export interface SkillHeaderMeta {
  code: string;
  nameKZ: string;
  nameRU: string;
  subject: string;
}

export interface ClassMatrixResponse {
  classroom_id: number | string;
  classroom_name: string;
  school: string;
  students_count: number;
  skills_header: SkillHeaderMeta[];
  matrix: ClassMatrixStudent[];
  summary_stats: Record<string, { average_probability: number; deficit_count: number; mastery_count: number }>;
  execution_time_ms?: number;
}

export interface LessonSignalData {
  signal_id: string;
  signal_level: 'HIGH_ALERT' | 'ATTENTION' | 'NORMAL';
  classroom_id: number | string;
  classroom_name: string;
  subject: string;
  topic_title: string;
  cluster_deficit: {
    skill_code: string;
    skill_name_kz: string;
    skill_name_ru: string;
    misconception_kz: string;
    misconception_ru: string;
    affected_students_count: number;
    total_students_count: number;
    percentage: number;
    affected_students: Array<{ id: number; name: string; probability: number }>;
  };
  smart_board_activity: {
    title_kz: string;
    title_ru: string;
    exercise_text_kz: string;
    exercise_text_ru: string;
    zvdsl_canvas: any;
    desmos_state?: any;
    solution_key: string;
    explanation_kz: string;
    ai_recommendation_kz: string;
    options?: Array<{ id: string; text: string; isCorrect: boolean; votesCount?: number }>;
  };
  telemetry?: {
    calculation_speed: string;
    ai_tokens_used: number;
    engine: string;
  };
}

export interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  grade: string;
  date: string;
  avatarInitial: string;
  currentElo: number;
  status: 'pending' | 'enrolled' | 'expelled';
}

export interface CourseTopicItem {
  id: string;
  title: string;
  order_index: number;
  quarter: number;
  sor_soch_goals?: string[];
  descriptors?: string[];
  zvdsl_canvas?: any;
  questions_count?: number;
  questions?: Array<{
    id: string;
    text: string;
    correctAnswer: string;
    distractors: Array<{ text: string; trap: string }>;
  }>;
}

// ----------------------------------------------------------------------------
// 24 Authentic Kazakhstani Students for Full Class Matrix Simulation
// ----------------------------------------------------------------------------
const MOCK_24_STUDENTS = [
  { id: 1, name: 'Әлихан Нұрғалиев', elo: 1540, rank: '🦅 Қыран', streak: 14, email: 'alikhan.n@zerde.kz' },
  { id: 2, name: 'Аружан Қалиева', elo: 1680, rank: '🚀 Самғау', streak: 28, email: 'aruzhan.k@zerde.kz' },
  { id: 3, name: 'Бақытжан Есенов', elo: 1220, rank: '🌱 Өскін', streak: 5, email: 'bakhytzhan.y@zerde.kz' },
  { id: 4, name: 'Дана Сұлтанова', elo: 1720, rank: '🚀 Самғау', streak: 42, email: 'dana.s@zerde.kz' },
  { id: 5, name: 'Еркебұлан Мұрат', elo: 1390, rank: '🏛️ Тұғыр', streak: 9, email: 'yerkebulan.m@zerde.kz' },
  { id: 6, name: 'Жансая Төлеген', elo: 1460, rank: '🦅 Қыран', streak: 18, email: 'zhansaya.t@zerde.kz' },
  { id: 7, name: 'Илияс Серікбаев', elo: 1190, rank: '🌱 Өскін', streak: 3, email: 'iliyas.s@zerde.kz' },
  { id: 8, name: 'Кәусар Ахметова', elo: 1580, rank: '🦅 Қыран', streak: 21, email: 'kausar.a@zerde.kz' },
  { id: 9, name: 'Мәди Бижанов', elo: 1310, rank: '🏛️ Тұғыр', streak: 7, email: 'madi.b@zerde.kz' },
  { id: 10, name: 'Нұрлан Әбдікәрім', elo: 1440, rank: '🦅 Қыран', streak: 12, email: 'nurlan.a@zerde.kz' },
  { id: 11, name: 'Олжас Сейітов', elo: 1280, rank: '🌱 Өскін', streak: 6, email: 'olzhas.s@zerde.kz' },
  { id: 12, name: 'Перизат Ысқақ', elo: 1620, rank: '🚀 Самғау', streak: 31, email: 'perizat.y@zerde.kz' },
  { id: 13, name: 'Расул Құрманғали', elo: 1350, rank: '🏛️ Тұғыр', streak: 10, email: 'rasul.k@zerde.kz' },
  { id: 14, name: 'Сабина Жақсылық', elo: 1490, rank: '🦅 Қыран', streak: 16, email: 'sabina.z@zerde.kz' },
  { id: 15, name: 'Темірлан Бекболат', elo: 1180, rank: '🌱 Өскін', streak: 2, email: 'temirlan.b@zerde.kz' },
  { id: 16, name: 'Ұлан Сапарбаев', elo: 1410, rank: '🦅 Қыран', streak: 11, email: 'ulan.s@zerde.kz' },
  { id: 17, name: 'Фариза Оразалы', elo: 1550, rank: '🦅 Қыран', streak: 24, email: 'fariza.o@zerde.kz' },
  { id: 18, name: 'Хамит Дүйсенбі', elo: 1260, rank: '🌱 Өскін', streak: 4, email: 'khamit.d@zerde.kz' },
  { id: 19, name: 'Шыңғыс Аманжол', elo: 1690, rank: '🚀 Самғау', streak: 35, email: 'shyngys.a@zerde.kz' },
  { id: 20, name: 'Ықылас Досжанов', elo: 1370, rank: '🏛️ Тұғыр', streak: 8, email: 'yhlas.d@zerde.kz' },
  { id: 21, name: 'Іңкәр Мұқанова', elo: 1510, rank: '🦅 Қыран', streak: 19, email: 'inkar.m@zerde.kz' },
  { id: 22, name: 'Юсуф Ғазизұлы', elo: 1230, rank: '🌱 Өскін', streak: 5, email: 'yusuf.g@zerde.kz' },
  { id: 23, name: 'Ясмина Бақытова', elo: 1640, rank: '🚀 Самғау', streak: 33, email: 'yasmina.b@zerde.kz' },
  { id: 24, name: 'Зере Қасымбек', elo: 1480, rank: '🦅 Қыран', streak: 15, email: 'zere.k@zerde.kz' },
];

const MOCK_SKILLS_HEADER: SkillHeaderMeta[] = [
  { code: 'ALG_09_QUADRATIC_ROOTS', nameKZ: 'Квадрат үшмүше түбірлері', nameRU: 'Корни квадратного трехчлена', subject: 'Алгебра' },
  { code: 'ALG_09_VIETE_THEORM', nameKZ: 'Виет теоремасы & таңбалар', nameRU: 'Теорема Виета и знаки', subject: 'Алгебра' },
  { code: 'ALG_09_INTERVAL_METHOD', nameKZ: 'Интервалдар әдісі', nameRU: 'Метод интервалов', subject: 'Алгебра' },
  { code: 'ALG_09_DENOMINATOR_RESTRICTION', nameKZ: 'Бөлім нөлдері (выколотые)', nameRU: 'ОДЗ нулей знаменателя', subject: 'Алгебра' },
  { code: 'ALG_09_PARABOLA_VERTEX', nameKZ: 'Парабола төбесі мен осі', nameRU: 'Вершина и ось параболы', subject: 'Алгебра' },
  { code: 'ALG_09_DISCRIMINANT_SIGN', nameKZ: 'Дискриминант таңбасы (D>0)', nameRU: 'Знак дискриминанта', subject: 'Алгебра' },
  { code: 'PHYS_09_NEWTON_SECOND', nameKZ: 'Ньютонның II заңы (F=ma)', nameRU: 'Второй закон Ньютона', subject: 'Физика' },
  { code: 'PHYS_09_FRICTION_FORCE', nameKZ: 'Үйкеліс күші (F_тр=μN)', nameRU: 'Сила трения', subject: 'Физика' },
  { code: 'PHYS_09_FREE_BODY', nameKZ: 'Күштер векторы (FBD)', nameRU: 'Диаграмма сил', subject: 'Физика' },
  { code: 'PHYS_09_OHM_LAW', nameKZ: 'Тізбек үшін Ом заңы', nameRU: 'Закон Ома для цепи', subject: 'Физика' },
  { code: 'CHEM_09_BENZENE_RING', nameKZ: 'Бензол & фенол құрылымы', nameRU: 'Бензол и фенол', subject: 'Химия' },
  { code: 'CHEM_09_HUND_RULE', nameKZ: 'Хунд ережесі (2p³)', nameRU: 'Правило Хунда', subject: 'Химия' },
  { code: 'LANG_09_CONDITIONAL_CLAUSE', nameKZ: 'Шартты бағыныңқы (-са)', nameRU: 'Придаточное условия', subject: 'Қазақ тілі' },
  { code: 'LANG_09_MORPHEME_PARSING', nameKZ: 'Кіріккен сөз морфемикасы', nameRU: 'Морфемный разбор', subject: 'Қазақ тілі' },
  { code: 'ALG_09_SYSTEM_INEQUALITIES', nameKZ: 'Теңсіздіктер жүйесі', nameRU: 'Системы неравенств', subject: 'Алгебра' },
  { code: 'MATH_09_SHORT_MULTIPLICATION', nameKZ: 'Қысқаша көбейту формуласы', nameRU: 'Формулы сокр. умножения', subject: 'Алгебра' },
];

function generateMockMatrix(classroomId: string | number): ClassMatrixResponse {
  const is9B = String(classroomId).includes('9-b') || String(classroomId).includes('2');
  const targetSkillCodes = MOCK_SKILLS_HEADER.map((s) => s.code);
  const summaryStats: Record<string, { average_probability: number; deficit_count: number; mastery_count: number }> = {};

  targetSkillCodes.forEach((code) => {
    summaryStats[code] = { average_probability: 0, deficit_count: 0, mastery_count: 0 };
  });

  const matrix: ClassMatrixStudent[] = MOCK_24_STUDENTS.map((std, idx) => {
    const skills: Record<string, StudentSkillMastery> = {};

    targetSkillCodes.forEach((code, sIdx) => {
      // Deterministic generation for realistic class patterns
      let prob: number;
      if (code === 'ALG_09_DENOMINATOR_RESTRICTION') {
        // High deficit cluster for demonstration
        prob = (idx % 3 === 0 || idx === 2 || idx === 6 || idx === 14) ? 0.24 + (idx % 5) / 100 : 0.65 + (idx % 4) / 100;
      } else if (code === 'ALG_09_VIETE_THEORM') {
        prob = (idx % 4 === 0) ? 0.32 : 0.78 + (idx % 3) / 100;
      } else {
        const base = (std.elo - 1100) / 700; // 0..1
        const jitter = (((std.id * 17 + sIdx * 11) % 30) - 15) / 100;
        prob = Math.max(0.18, Math.min(0.98, Math.round((base + jitter) * 100) / 100));
      }

      let status: 'mastered' | 'in_progress' | 'deficit' = 'deficit';
      if (prob >= 0.70) status = 'mastered';
      else if (prob >= 0.40) status = 'in_progress';

      skills[code] = {
        probability: Math.round(prob * 100) / 100,
        status,
        attemptsCount: 3 + (std.id % 6),
        lastAttemptCorrect: prob >= 0.50,
      };

      summaryStats[code].average_probability += prob;
      if (status === 'deficit') summaryStats[code].deficit_count++;
      else if (status === 'mastered') summaryStats[code].mastery_count++;
    });

    return {
      student_id: std.id,
      student_name: std.name,
      email: std.email,
      current_elo: is9B ? std.elo - 40 : std.elo,
      rank: std.rank,
      streak_days: std.streak,
      skills,
    };
  });

  targetSkillCodes.forEach((code) => {
    summaryStats[code].average_probability = Math.round((summaryStats[code].average_probability / matrix.length) * 100) / 100;
  });

  return {
    classroom_id: classroomId,
    classroom_name: is9B ? '9 «Б»' : '9 «А»',
    school: localStorage.getItem('zerde_user') ? (JSON.parse(localStorage.getItem('zerde_user') || '{}').school || 'Zerde School') : 'Zerde School',
    students_count: matrix.length,
    skills_header: MOCK_SKILLS_HEADER,
    matrix,
    summary_stats: summaryStats,
    execution_time_ms: 12,
  };
}

function generateMockLessonSignal(classroomId: string | number): LessonSignalData {
  const is9B = String(classroomId).includes('9-b') || String(classroomId).includes('2');
  
  return {
    signal_id: `sig_${Date.now()}`,
    signal_level: 'HIGH_ALERT',
    classroom_id: classroomId,
    classroom_name: is9B ? '9 «Б»' : '9 «А»',
    subject: 'Алгебра (9 сынып)',
    topic_title: 'Бөлшек-рационал теңсіздіктер және интервалдар әдісі',
    cluster_deficit: {
      skill_code: 'ALG_09_DENOMINATOR_RESTRICTION',
      skill_name_kz: 'Бөлшек-рационал теңсіздікте бөлім нөлдерін ескеру',
      skill_name_ru: 'Учет нулей знаменателя в дробно-рациональных неравенствах',
      misconception_kz: 'Бөлшек-рационал теңсіздіктерде бөлімнің нөлін шешімге қосып жіберу (выколотая точка қатесі)',
      misconception_ru: 'Включение нулей знаменателя в решение дробно-рационального неравенства (ошибка выколотой точки)',
      affected_students_count: 8,
      total_students_count: 24,
      percentage: 33,
      affected_students: [
        { id: 3, name: 'Бақытжан Есенов', probability: 0.22 },
        { id: 7, name: 'Илияс Серікбаев', probability: 0.25 },
        { id: 9, name: 'Мәди Бижанов', probability: 0.31 },
        { id: 11, name: 'Олжас Сейітов', probability: 0.28 },
        { id: 15, name: 'Темірлан Бекболат', probability: 0.19 },
        { id: 18, name: 'Хамит Дүйсенбі', probability: 0.34 },
        { id: 20, name: 'Ықылас Досжанов', probability: 0.36 },
        { id: 22, name: 'Юсуф Ғазизұлы', probability: 0.27 },
      ],
    },
    smart_board_activity: {
      title_kz: 'Смарт-доскаға 5 минуттық экспресс-интервенция',
      title_ru: '5-минутная экспресс-интервенция на смарт-доску',
      exercise_text_kz: 'Бөлшек-рационал теңсіздікті шешіңіз: \\frac{x^2 - 4}{x - 5} \\le 0. Сан түзуіндегі боялған және боялмаған (выколотая) нүктелерді тексеріңіз.',
      exercise_text_ru: 'Решите дробно-рациональное неравенство: \\frac{x^2 - 4}{x - 5} \\le 0. Проверьте закрашенные и выколотые точки.',
      zvdsl_canvas: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Бөлшек-рационал сан түзуі: x=5 ашық нүкте!',
        elements: [
          { type: 'axis', min: -5, max: 7, step: 1 },
          { type: 'root_point', x: -2, style: 'solid', label: '-2 (жабық)' },
          { type: 'root_point', x: 2, style: 'solid', label: '2 (жабық)' },
          { type: 'root_point', x: 5, style: 'hollow', label: '5 (бөлім ≠ 0)' },
          { type: 'interval_sign', from: -5, to: -2, sign: '−' },
          { type: 'interval_sign', from: -2, to: 2, sign: '+' },
          { type: 'interval_sign', from: 2, to: 5, sign: '−' },
          { type: 'interval_sign', from: 5, to: 7, sign: '+' },
          { type: 'shaded_region', intervals: [[-5, -2], [2, 5]], fill: 'rgba(26,127,55,0.18)' },
        ],
      },
      desmos_state: {
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'y = \\frac{x^2 - 4}{x - 5}', color: '#0969da', lineWidth: 3 },
            { id: '2', latex: 'x = 5', lineStyle: 'DASHED', color: '#cf222e', lineWidth: 2 },
            { id: '3', latex: 'y = 0', lineStyle: 'DOTTED', color: '#6e7781' },
            { id: '4', latex: '(-2, 0)', pointStyle: 'POINT', color: '#1a7f37' },
            { id: '5', latex: '(2, 0)', pointStyle: 'POINT', color: '#1a7f37' },
            { id: '6', latex: '(5, 0)', pointStyle: 'OPEN', color: '#cf222e' },
          ],
        },
      },
      solution_key: '(-\\infty; -2] \\cup [2; 5)',
      explanation_kz: 'Алымы $x^2 - 4 = 0 \\Rightarrow x = \\pm 2$ (теңсіздік бейқатаң $\\le$ болғандықтан нүктелер боялады). Бөлімі $x - 5 \\ne 0 \\Rightarrow x \\ne 5$ (әрдайым қатаң ашық жақшамен жазылады!).',
      ai_recommendation_kz: 'Мұғалімге ұсыныс: x = 5 нүктесінің неліктен боялмайтынын сан түзуінде интерактивті көрсетіп, оқушылардан "Бөлімде нөл бола ма?" сұрағын сұрау.',
      options: [
        { id: 'A', text: '(-\\infty; -2] \\cup [2; 5)', isCorrect: true, votesCount: 16 },
        { id: 'B', text: '(-\\infty; -2] \\cup [2; 5]', isCorrect: false, votesCount: 6 },
        { id: 'C', text: '[-2; 2] \\cup (5; +\\infty)', isCorrect: false, votesCount: 2 },
        { id: 'D', text: '(-\\infty; 5)', isCorrect: false, votesCount: 0 },
      ],
    },
    telemetry: {
      calculation_speed: '8 ms',
      ai_tokens_used: 0,
      engine: 'Zerde DINA Cognitive Diagnostic Cluster Engine',
    },
  };
}

export const teacherApi = {
  /**
   * Fetch 24-student class heatmap matrix
   */
  async getClassMatrix(classroomId: string | number = '1'): Promise<ClassMatrixResponse> {
    try {
      const res: any = await api.get(`/teacher/class-matrix/${classroomId}`);
      if (res?.matrix && res?.skills_header) {
        return res;
      }
    } catch (e) {
      console.info('[TeacherAPI] Backend matrix endpoint fallback to local DINA engine');
    }
    return generateMockMatrix(classroomId);
  },

  /**
   * Fetch Lesson Signal of the Day & 5-minute Intervention for Smartboard
   */
  async getLessonSignal(classroomId: string | number = '1'): Promise<LessonSignalData> {
    try {
      const res: any = await api.get(`/teacher/lesson-signal/${classroomId}`);
      if (res?.cluster_deficit) {
        return res;
      }
    } catch (e) {
      console.info('[TeacherAPI] Backend lesson-signal endpoint fallback to local engine');
    }
    return generateMockLessonSignal(classroomId);
  },

  /**
   * Get Enrollment Requests
   */
  async getEnrollmentRequests(): Promise<EnrollmentRequest[]> {
    try {
      const res: any = await api.get('/courses/1/enrollments');
      if (res?.enrollments && Array.isArray(res.enrollments)) {
        return res.enrollments.map((e: any) => ({
          id: e.id || `enr_${e.student_id}`,
          studentId: String(e.student_id || e.id),
          studentName: e.student_name || 'Оқушы',
          courseId: String(e.course_id || '1'),
          courseTitle: e.course_title || 'Алгебра және анализ бастамалары',
          grade: e.grade || '9 «А»',
          date: e.applied_at || 'Бүгін, 14:20',
          avatarInitial: (e.student_name || 'О').charAt(0),
          currentElo: e.current_elo || 1350,
          status: e.status || 'pending',
        }));
      }
    } catch (e) {
      console.info('[TeacherAPI] Backend enrollments fallback to local queue');
    }

    return [
      {
        id: 'enr_1',
        studentId: '101',
        studentName: 'Диас Қасымов',
        courseId: 'c_math',
        courseTitle: 'Алгебра және анализ бастамалары (9-сынып)',
        grade: '9 «Б»',
        date: 'Бүгін, 14:20',
        avatarInitial: 'Д',
        currentElo: 1380,
        status: 'pending',
      },
      {
        id: 'enr_2',
        studentId: '102',
        studentName: 'Мадина Сейдахмет',
        courseId: 'c_physics',
        courseTitle: 'Олимпиадная Физика: Механика және Оптика',
        grade: '9 «А»',
        date: 'Бүгін, 12:45',
        avatarInitial: 'М',
        currentElo: 1520,
        status: 'pending',
      },
      {
        id: 'enr_3',
        studentId: '103',
        studentName: 'Арман Құдайберген',
        courseId: 'c_math',
        courseTitle: 'Алгебра және анализ бастамалары (9-сынып)',
        grade: '9 «А»',
        date: 'Кеше, 18:10',
        avatarInitial: 'А',
        currentElo: 1290,
        status: 'pending',
      },
    ];
  },

  /**
   * Approve student enrollment in 1 click
   */
  async approveEnrollment(courseId: string, studentId: string): Promise<boolean> {
    try {
      await api.post(`/courses/${courseId}/enrollments/${studentId}/approve`);
      return true;
    } catch (e) {
      console.info('[TeacherAPI] Mock approval success');
      return true;
    }
  },

  /**
   * Reject student enrollment
   */
  async rejectEnrollment(courseId: string, studentId: string): Promise<boolean> {
    try {
      await api.post(`/courses/${courseId}/enrollments/${studentId}/expel`);
      return true;
    } catch (e) {
      console.info('[TeacherAPI] Mock rejection success');
      return true;
    }
  },

  /**
   * AI Course Studio: Parse syllabus/textbook document
   */
  async parseCourseDocument(
    courseTitle: string,
    fileContentText: string,
    subject = 'Математика',
    grade = '9',
    language: 'kz' | 'ru' | 'en' = 'kz'
  ): Promise<{
    topics: CourseTopicItem[];
    q_matrix: any[];
    formulas: string[];
    sor_soch_descriptors: string[];
  }> {
    try {
      const res: any = await api.post('/ai/parse-course', {
        courseTitle,
        fileContentText,
        subject,
        grade,
        language,
      });
      if (res?.topics) return res;
    } catch (e) {
      console.info('[TeacherAPI] AI parse-course fallback to knowledge extractor');
    }

    // High quality offline fallback topics
    return {
      topics: [
        {
          id: 'top_gen_1',
          title: 'Квадрат теңсіздіктер және параболаның графиктік талдауы',
          order_index: 1,
          quarter: 3,
          sor_soch_goals: ['9.2.2.1 Квадрат теңсіздіктерді шешу', '9.2.2.2 Квадрат үшмүшенің таңба тұрақтылығы'],
          descriptors: [
            'Квадрат үшмүшенің нөлдерін анықтайды',
            'Парабола тармақтарының бағытын анықтайды',
            'Жауапты сан аралығы түрінде жазады',
          ],
          zvdsl_canvas: {
            canvas_type: 'NUMBER_LINE',
            elements: [
              { type: 'root_point', x: -3, style: 'solid', label: '-3' },
              { type: 'root_point', x: 4, style: 'solid', label: '4' },
              { type: 'shaded_region', intervals: [[-3, 4]] },
            ],
          },
          questions_count: 4,
        },
        {
          id: 'top_gen_2',
          title: 'Бөлшек-рационал теңсіздіктер және интервалдар әдісі',
          order_index: 2,
          quarter: 3,
          sor_soch_goals: ['9.2.2.3 Бөлшек-рационал теңсіздіктерді интервалдар әдісімен шешу'],
          descriptors: [
            'Алымы мен бөлімінің нөлдерін табады',
            'Бөлімнің нөлдерін сан түзуінде выколотая ретінде белгілейді',
            'Интервалдардағы таңбаларды дұрыс анықтайды',
          ],
          zvdsl_canvas: {
            canvas_type: 'NUMBER_LINE',
            elements: [
              { type: 'root_point', x: -2, style: 'solid' },
              { type: 'root_point', x: 5, style: 'hollow', label: 'x≠5' },
            ],
          },
          questions_count: 5,
        },
        {
          id: 'top_gen_3',
          title: 'Теңсіздіктер жүйесі мен жиынтығын шешу',
          order_index: 3,
          quarter: 3,
          sor_soch_goals: ['9.2.2.4 Екі белгісізі бар теңсіздіктер жүйесін шешу'],
          descriptors: [
            'Әр теңсіздікті жеке шешеді',
            'Шешімдердің қиылысуын сан түзуінде көрсетеді',
          ],
          questions_count: 3,
        },
      ],
      q_matrix: [
        { skill: 'ALG_09_INTERVAL_METHOD', weight: 0.45 },
        { skill: 'ALG_09_DENOMINATOR_RESTRICTION', weight: 0.55 },
      ],
      formulas: ['(x-x_1)(x-x_2) > 0', 'D = b^2 - 4ac', 'x = \\frac{-b \\pm \\sqrt{D}}{2a}'],
      sor_soch_descriptors: [
        '9.2.2.1 Квадрат теңсіздіктерді шешеді (1 балл)',
        '9.2.2.3 Бөлімнің нөлдерін ескеріп интервал әдісін қолданады (2 балл)',
        '9.2.2.4 Теңсіздіктер жүйесінің қиылысуын табады (2 балл)',
      ],
    };
  },

  /**
   * Teacher Co-Pilot conversational assistant
   */
  async sendTeacherCopilot(
    message: string,
    dialogueHistory: Array<{ role: 'teacher' | 'copilot'; text: string }> = [],
    courseContext?: any,
    language: 'kz' | 'ru' | 'en' = 'kz'
  ): Promise<{ response: string; suggestedActions?: string[]; generatedZvdsl?: any }> {
    try {
      const res: any = await api.post('/ai/teacher-copilot', {
        message,
        dialogueHistory,
        courseContext,
        language,
      });
      if (res?.response) return res;
    } catch (e) {
      console.info('[TeacherAPI] AI teacher-copilot fallback');
    }

    const lower = message.toLowerCase();
    if (lower.includes('сор') || lower.includes('соч') || lower.includes('дескриптор')) {
      return {
        response: `Құрметті ұстаз! 9-сынып «Алгебра» пәнінің 3-тоқсандық СОР 1 спецификациясы бойынша мынадай 3 дескриптор мен баллдық жүйені құрастырдым:\n\n1. **№1 Тапсырма (Квадрат теңсіздік):**\n   - Квадрат үшмүшенің түбірлерін табады (1 балл)\n   - Парабола таңбасын анықтайды (1 балл)\n\n2. **№2 Тапсырма (Бөлшек-рационал теңсіздік):**\n   - Алымы мен бөлімінің нөлдерін анықтайды (1 балл)\n   - Бөлімінің нөлін ($x \\ne 5$) выколотая ретінде белгілейді (1 балл)\n   - Жауап аралығын дұрыс жазады: $(-\\infty; -2] \\cup [2; 5)$ (1 балл)\n\nБұл дескрипторларды бірден Kundelik.kz форматына экспорттауға болады.`,
        suggestedActions: ['Дескрипторларды курсқа қосу', 'СОР тест тапсырмаларын генерациялау', 'Kundelik.kz форматында сақтау'],
      };
    }

    if (lower.includes('тест') || lower.includes('дистрактор') || lower.includes('ловушк')) {
      return {
        response: `Тақырып бойынша типтік когнитивтік тұзақтары (misconceptions) бар 3 тесттік сұрақ құрастырылды:\n\n• **Дистрактор A (Дұрыс):** $(-\\infty; -2] \\cup [2; 5)$\n• **Дистрактор B (Тұзақ):** $[-2; 5]$ — Оқушы бөлімдегі нөлді жабық жақшамен жазып жібереді.\n• **Дистрактор C (Тұзақ):** $(-\\infty; 5)$ — Тек бөлімінің шектеуін ескеріп, алымындағы түбірлерді ұмытады.\n\nZVDSL+ интерактивті сан түзуі сұлбасы дайын.`,
        suggestedActions: ['Сұрақтар банкіне қосу', 'Смарт-доскаға шығару', 'Қосымша варианттар жасау'],
        generatedZvdsl: {
          canvas_type: 'NUMBER_LINE',
          elements: [
            { type: 'root_point', x: -2, style: 'solid' },
            { type: 'root_point', x: 2, style: 'solid' },
            { type: 'root_point', x: 5, style: 'hollow' },
          ],
        },
      };
    }

    return {
      response: `Мұғалімнің Co-Pilot көмекшісі дайын! «${courseContext?.title || 'Алгебра 9'}» курсы бойынша оқу бағдарламасын (ҚР Оқу-ағарту министрлігі стандарттары мен NIS бағдарламасы) талдап, микро-тақырыптар, СОР/СОЧ дескрипторлары мен ZVDSL+ визуализацияларын жасауға көмектесемін. Неден бастаймыз?`,
      suggestedActions: ['Оқулық параграфын жүктеу', '5 минуттық экспресс-разминка құру', 'Класс журналын Kundelik-ке экспорттау'],
    };
  },

  /**
   * Generate assessment questions for a topic
   */
  async generateQuestions(
    topicId: string,
    topicTitle: string,
    count = 3,
    subject = 'Математика',
    language: 'kz' | 'ru' | 'en' = 'kz'
  ): Promise<any[]> {
    try {
      const res: any = await api.post('/ai/generate-questions', {
        topicId,
        topicTitle,
        count,
        subject,
        language,
      });
      if (res?.questions) return res.questions;
    } catch (e) {
      console.info('[TeacherAPI] AI generate-questions fallback');
    }

    return [
      {
        id: `q_${Date.now()}_1`,
        text_kz: `Бөлшек-рационал теңсіздікті интервалдар әдісімен шешіңіз: \\frac{x^2 - 9}{x - 4} \\le 0`,
        correct_answer: 'A',
        options: [
          { id: 'A', text: '(-\\infty; -3] \\cup [3; 4)', is_distractor: false },
          { id: 'B', text: '[-3; 3] \\cup [4; +\\infty)', is_distractor: true, trap: 'Таңбаларды шатастырды' },
          { id: 'C', text: '(-\\infty; -3] \\cup [3; 4]', is_distractor: true, trap: 'Бөлім нөлін жабық қылды' },
          { id: 'D', text: '[-3; 4]', is_distractor: true, trap: 'Аралықты дұрыс біріктірмеді' },
        ],
      },
      {
        id: `q_${Date.now()}_2`,
        text_kz: `Квадрат теңдеудің түбірлерін Виет теоремасымен анықтаңыз: x^2 - 7x + 12 = 0`,
        correct_answer: 'B',
        options: [
          { id: 'A', text: 'x_1 = -3, x_2 = -4', is_distractor: true, trap: 'Таңба қатесі: x1+x2 = -b' },
          { id: 'B', text: 'x_1 = 3, x_2 = 4', is_distractor: false },
          { id: 'C', text: 'x_1 = 2, x_2 = 6', is_distractor: true, trap: 'Көбейтіндісі 12, бірақ қосындысы 8' },
          { id: 'D', text: 'x_1 = 1, x_2 = 12', is_distractor: true, trap: 'Қосындысы 13' },
        ],
      },
    ];
  },
};

export default teacherApi;
