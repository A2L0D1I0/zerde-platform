import { api } from '@/api/client';
import {
  StudentDashboardData,
  StudentHeatmapData,
  StudentRoadmapData,
  ClassLeaderboardEntry,
  SM2MemoryCard,
  StudyDay,
  HeatmapDay,
  Topic,
  Course,
} from '@/types';

// Mock/Fallback Data Constants
export const mockTopicsList: (Topic & {
  titleKZ?: string;
  titleRU?: string;
  titleEN?: string;
  sub_textKZ?: string;
  sub_textRU?: string;
  sub_textEN?: string;
})[] = [
  {
    id: 'top_1',
    course_id: 'math',
    topic_number: '#1.1',
    title: 'Квадрат үшмүше түбірлері және Виет теоремасы',
    titleKZ: 'Квадрат үшмүше түбірлері және Виет теоремасы',
    titleRU: 'Корни квадратного трехчлена и теорема Виета',
    titleEN: 'Roots of Quadratic Trinomial and Vieta Theorem',
    order_index: 1,
    status: 'in_progress',
    is_today_focus: true,
    mastery_percentage: 68,
    sub_text: '«Аға» наставнигімен 12 қадам орындалды • 3 мин жаттығу',
    sub_textKZ: '«Аға» наставнигімен 12 қадам орындалды • 3 мин жаттығу',
    sub_textRU: 'Пройдено 12 шагов с наставником «Аға» • 3 мин тренировки',
    sub_textEN: '12 steps completed with "Aga" mentor • 3 min practice',
  },
  {
    id: 'top_2',
    course_id: 'math',
    topic_number: '#1.2',
    title: 'Бөлшек-рационал теңдеулер мен ОДЗ есебі',
    titleKZ: 'Бөлшек-рационал теңдеулер мен ОДЗ есебі',
    titleRU: 'Дробно-рациональные уравнения и учет ОДЗ',
    titleEN: 'Fractional Rational Equations and Domain Restrictions',
    order_index: 2,
    status: 'pending',
    mastery_percentage: 85,
    sub_text: 'ИИ қабылдады • Мұғалімнің қорытынды зачетін күтуде',
    sub_textKZ: 'ИИ қабылдады • Мұғалімнің қорытынды зачетін күтуде',
    sub_textRU: 'Принято ИИ • Ожидает финального зачета преподавателя',
    sub_textEN: 'Accepted by AI • Pending final teacher assessment',
  },
  {
    id: 'top_3',
    course_id: 'math',
    topic_number: '#1.3',
    title: 'Интервалдар әдісі және теңсіздіктер жүйесі',
    titleKZ: 'Интервалдар әдісі және теңсіздіктер жүйесі',
    titleRU: 'Метод интервалов и системы неравенств',
    titleEN: 'Method of Intervals and Systems of Inequalities',
    order_index: 3,
    status: 'mastered',
    mastery_percentage: 100,
    sub_text: 'Мұғалім бекітті ✓ • СОР 1 толық тапсырылды (10/10 балл)',
    sub_textKZ: 'Мұғалім бекітті ✓ • СОР 1 толық тапсырылды (10/10 балл)',
    sub_textRU: 'Утверждено преподавателем ✓ • СОР 1 сдан на 10/10 баллов',
    sub_textEN: 'Approved by teacher ✓ • Summative assessment passed (10/10)',
  },
  {
    id: 'top_4',
    course_id: 'math',
    topic_number: '#1.4',
    title: 'Иррационал теңдеулер мен модульдік теңдеулер',
    titleKZ: 'Иррационал теңдеулер мен модульдік теңдеулер',
    titleRU: 'Иррациональные уравнения и уравнения с модулем',
    titleEN: 'Irrational Equations and Absolute Value Equations',
    order_index: 4,
    status: 'queued',
    mastery_percentage: 0,
    sub_text: '1-тоқсан жоспарында • Келесі аптада ашылады',
    sub_textKZ: '1-тоқсан жоспарында • Келесі аптада ашылады',
    sub_textRU: 'В плане 1-й четверти • Откроется на следующей неделе',
    sub_textEN: 'In Quarter 1 syllabus • Unlocks next week',
  },
  {
    id: 'top_5',
    course_id: 'phys',
    topic_number: '#2.1',
    title: 'Ньютонның екінші заңы және күштер векторлары',
    titleKZ: 'Ньютонның екінші заңы және күштер векторлары',
    titleRU: 'Второй закон Ньютона и векторы сил',
    titleEN: 'Newton Second Law and Force Vectors',
    order_index: 5,
    status: 'mastered',
    mastery_percentage: 95,
    sub_text: 'Active Canvas зертханалық жұмысы қорғалды',
    sub_textKZ: 'Active Canvas зертханалық жұмысы қорғалды',
    sub_textRU: 'Лабораторная работа Active Canvas успешно защищена',
    sub_textEN: 'Active Canvas interactive lab completed successfully',
  },
  {
    id: 'top_6',
    course_id: 'phys',
    topic_number: '#2.2',
    title: 'Бүкіләлемдік тартылыс заңы және гравитация',
    titleKZ: 'Бүкіләлемдік тартылыс заңы және гравитация',
    titleRU: 'Закон всемирного тяготения и гравитация',
    titleEN: 'Universal Law of Gravitation',
    order_index: 6,
    status: 'queued',
    mastery_percentage: 10,
    sub_text: 'Алдын ала шолу қолжетімді',
    sub_textKZ: 'Алдын ала шолу қолжетімді',
    sub_textRU: 'Предварительный просмотр доступен',
    sub_textEN: 'Preview is available',
  },
];


export const mockLeaderboardData: ClassLeaderboardEntry[] = [
  {
    id: 'usr_lead_1',
    rank: 1,
    name: 'Дана Сұлтанова',
    grade: '9 «А»',
    school: 'NIS IB Astana',
    elo: 1680,
    eloRankLevel: 'Самғау',
    streakDays: 35,
    masteredCount: 24,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'usr_lead_2',
    rank: 2,
    name: 'Аружан Қалиева',
    grade: '9 «А»',
    school: 'NIS IB Astana',
    elo: 1530,
    eloRankLevel: 'Қыран',
    streakDays: 21,
    masteredCount: 22,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'usr_student_01',
    rank: 3,
    name: 'Әлихан Нұрғалиев',
    grade: '9 «А»',
    school: 'NIS IB Astana',
    elo: 1420,
    eloRankLevel: 'Қыран',
    streakDays: 12,
    masteredCount: 18,
    isCurrentUser: true,
  },
  {
    id: 'usr_lead_4',
    rank: 4,
    name: 'Еркебұлан Мұрат',
    grade: '9 «А»',
    school: 'NIS IB Astana',
    elo: 1350,
    eloRankLevel: 'Тұғыр',
    streakDays: 9,
    masteredCount: 16,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'usr_lead_5',
    rank: 5,
    name: 'Бақытжан Есенов',
    grade: '9 «А»',
    school: 'NIS IB Astana',
    elo: 1210,
    eloRankLevel: 'Тұғыр',
    streakDays: 5,
    masteredCount: 12,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
];

export const mockSM2MemoryCards: SM2MemoryCard[] = [
  {
    id: 'card_1',
    subject: 'Алгебра',
    topicTitle: 'Виет теоремасы',
    formulaLatex: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a}',
    question: 'Квадрат теңдеудің түбірлерінің қосындысы мен көбейтіндісі қандай?',
    answer: 'Түбірлер қосындысы екінші коэффициенттің таңбасына қарама-қарсы қатынасына, көбейтіндісі бос мүше қатынасына тең.',
    intervalDays: 1,
    repetitions: 3,
    easeFactor: 2.5,
    nextReviewDate: 'Бүгін',
    isDueToday: true,
  },
  {
    id: 'card_2',
    subject: 'Физика',
    topicTitle: 'Ньютонның 2-заңы',
    formulaLatex: '\\vec{F}_{тең} = m \\cdot \\vec{a}',
    question: 'Массасы 5 кг денеге 30 Н тарту және 10 Н үйкеліс әсер етсе, үдеу неше?',
    answer: 'a = (30 - 10) / 5 = 4 м/с²',
    intervalDays: 3,
    repetitions: 5,
    easeFactor: 2.6,
    nextReviewDate: 'Бүгін',
    isDueToday: true,
  },
  {
    id: 'card_3',
    subject: 'Алгебра',
    topicTitle: 'Дискриминант',
    formulaLatex: 'D = b^2 - 4ac',
    question: 'D > 0, D = 0, D < 0 болғанда түбірлер саны қалай өзгереді?',
    answer: 'D > 0: екі нақты түбір; D = 0: бір түбір (еселі); D < 0: нақты түбір жоқ.',
    intervalDays: 7,
    repetitions: 8,
    easeFactor: 2.8,
    nextReviewDate: 'Бүгін',
    isDueToday: true,
  },
  {
    id: 'card_4',
    subject: 'Қазақ тілі',
    topicTitle: 'Шартты бағыныңқы',
    formulaLatex: '\\text{Бағыныңқы } (-са/-се) \\rightarrow \\text{ Басыңқы}',
    question: 'Шартты рай тұлғасындағы бағыныңқы сөйлемнің сұрағы қандай?',
    answer: '«Қайтсе?», «Қандай жағдайда?» деген сұрақтарға жауап береді.',
    intervalDays: 14,
    repetitions: 12,
    easeFactor: 2.9,
    nextReviewDate: 'Келесі апта',
    isDueToday: false,
  },
];

export const generate365DaysHeatmap = (): HeatmapDay[] => {
  const result: HeatmapDay[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    let count = 0;

    if (i < 12) {
      // High active streak for last 12 days
      level = (Math.floor(Math.random() * 2) + 3) as 3 | 4;
      count = level * 3 + Math.floor(Math.random() * 3);
    } else if (Math.random() > 0.3) {
      level = isWeekend
        ? ((Math.floor(Math.random() * 3)) as 0 | 1 | 2)
        : ((Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4);
      count = level * 2 + 1;
    }

    result.push({
      date: dateStr,
      level,
      tasksCompleted: count,
    });
  }

  return result;
};

export const generateCurrentWeekStudyDays = (): StudyDay[] => {
  const days: StudyDay[] = [];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const dayNamesKZ = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'];

  // Start from Monday of this week
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayIndex);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isCompleted = i < currentDayIndex || (i === currentDayIndex);
    const isToday = i === currentDayIndex;
    const isFuture = i > currentDayIndex;

    days.push({
      date: d.toISOString().split('T')[0],
      dayOfWeek: dayNamesKZ[i],
      dayNumber: d.getDate(),
      isCompleted,
      isToday,
      isFuture,
      tasksCount: isFuture ? 0 : Math.floor(Math.random() * 4) + 2,
      streakActive: isCompleted,
    });
  }

  return days;
};

export const mockDefaultRoadmapData: StudentRoadmapData = {
  target_exam: 'ҰБТ / ЕНТ 2026 (Математика + Физика)',
  target_date: '2026-06-15',
  days_remaining: 74,
  current_score: 94,
  predicted_score: 118,
  target_score: 132,
  current_elo: 1420,
  milestones: [
    {
      id: 'ms_01',
      title: '1. Алгебралық өрнектер мен сызықтық теңдеулер жүйесі',
      subject: 'Математика',
      deadline: '2026-01-20',
      status: 'completed',
      mastery: 100,
      scoreContribution: 18,
      description: 'Сызықтық теңдеулер, графиктік шешу әдістері және пропорциялар.',
      microSkills: [
        { name: 'Сызықтық теңдеулер шешу', mastery: 100, isKey: true },
        { name: 'Екі белгісізі бар теңдеулер жүйесі', mastery: 95, isKey: true },
        { name: 'Графиктік интерпретация', mastery: 100, isKey: false },
      ],
    },
    {
      id: 'ms_02',
      title: '2. Квадраттық теңдеулер, Виет теоремасы және интервалдар әдісі',
      subject: 'Математика',
      deadline: '2026-02-15',
      status: 'completed',
      mastery: 92,
      scoreContribution: 22,
      description: 'Квадрат теңдеу түбірлері, дискриминант және теңсіздік таңбалары.',
      microSkills: [
        { name: 'Дискриминант формуласы', mastery: 100, isKey: true },
        { name: 'Виет теоремасы', mastery: 88, isKey: true },
        { name: 'Интервалдардағы таңбаны анықтау', mastery: 90, isKey: true },
      ],
    },
    {
      id: 'ms_03',
      title: '3. Бөлшек-рационал теңсіздіктер және ОДЗ (Ағымдағы қадам)',
      subject: 'Математика',
      deadline: '2026-03-05',
      status: 'in_progress',
      mastery: 68,
      scoreContribution: 25,
      description: 'Алымы мен бөлімін талдау, выколотая нүктелер, қатаң/қатаң емес теңсіздіктер.',
      microSkills: [
        { name: 'ОДЗ (Бөлім нөлге тең емес)', mastery: 75, isKey: true },
        { name: 'Көбейткіштерге жіктеу', mastery: 80, isKey: false },
        { name: 'Таңбалар ауысу ережесі', mastery: 55, isKey: true },
      ],
    },
    {
      id: 'ms_04',
      title: '4. Тригонометриялық теңдеулер және функциялар қасиеттері',
      subject: 'Математика',
      deadline: '2026-03-25',
      status: 'upcoming',
      mastery: 20,
      scoreContribution: 25,
      description: 'Тригонометриялық шеңбер, негізгі теңбе-теңдіктер және формулалар.',
      microSkills: [
        { name: 'Тригонометриялық шеңбер', mastery: 40, isKey: true },
        { name: 'Келтіру формулалары', mastery: 15, isKey: true },
        { name: 'Қарапайым тригонометриялық теңдеулер', mastery: 10, isKey: false },
      ],
    },
    {
      id: 'ms_05',
      title: '5. Стереометрия және кеңістіктегі векторлар',
      subject: 'Геометрия',
      deadline: '2026-04-20',
      status: 'locked',
      mastery: 0,
      scoreContribution: 20,
      description: 'Призма, пирамида, цилиндр көлемдері және векторлық координаталар.',
      microSkills: [
        { name: 'Кеңістіктегі түзу мен жазықтық', mastery: 0, isKey: true },
        { name: 'Көпжақтардың беті мен көлемі', mastery: 0, isKey: true },
      ],
    },
    {
      id: 'ms_06',
      title: '6. ҰБТ 2026 Негізгі Ұлттық Бірыңғай Тестілеу',
      subject: 'Кешенді тест',
      deadline: '2026-06-15',
      status: 'locked',
      mastery: 0,
      scoreContribution: 140,
      description: 'Барлық пәндер бойынша қорытынды 140 сұрақтық ресми емтихан.',
    },
  ],
};

class StudentService {
  public async getDashboard(studentId?: string): Promise<StudentDashboardData | null> {
    try {
      const url = studentId ? `/student/dashboard?studentId=${studentId}` : '/student/dashboard';
      const data = await api.get<StudentDashboardData>(url);
      if (data) return data;
    } catch (e) {
      console.warn('[StudentService] Offline/Mock fallback for dashboard');
    }

    return {
      user: {
        id: studentId || 'usr_student_01',
        email: 'student@zerde.kz',
        full_name: 'Әлихан Нұрғалиев',
        role: 'student',
        grade: '9 «А»',
        school: 'NIS IB Astana',
        language: 'KZ',
        theme: 'dark',
        overallElo: 1420,
        streakDays: 12,
        eloRank: {
          level: 'Қыран',
          symbol: '🦅',
          minElo: 1300,
          maxElo: 1600,
        },
      },
      elo: 1420,
      rank: 'Қыран',
      rank_badge: '🦅 Қыран (Expert)',
      streak_days: 12,
      streak_freeze_available: true,
      pinned_course: {
        id: 'crs_math_9',
        title: 'Алгебра және анализ бастамалары (9-сынып)',
        subject: 'Математика',
        description: 'Квадрат теңдеулер, теңсіздіктер және функциялар',
        teacher_id: 'usr_teacher_01',
        teacher_name: 'Айгүл Серікқызы',
        grade: '9 «А»',
        language: 'KZ',
        is_active: true,
        students_count: 24,
        progress_percentage: 78,
        next_topic: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
      },
      recent_topics: mockTopicsList.slice(0, 4),
      memory_cards: {
        due_today: 3,
        total_reviewed: 180,
        retention_rate: 94,
      },
      daily_focus: {
        title: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
        duration_minutes: 3,
        topic_id: 'top_1',
        elo_reward: 15,
      },
    };
  }

  public async getHeatmap(studentId?: string): Promise<StudentHeatmapData> {
    try {
      const url = studentId ? `/student/heatmap?studentId=${studentId}` : '/student/heatmap';
      const data = await api.get<StudentHeatmapData>(url);
      if (data && data.matrix && data.matrix.length > 0) return data;
    } catch (e) {
      console.warn('[StudentService] Offline/Mock fallback for heatmap');
    }

    const matrix = generate365DaysHeatmap();
    const totalContributions = matrix.reduce((acc, curr) => acc + curr.tasksCompleted, 0);

    return {
      year: new Date().getFullYear(),
      total_contributions: totalContributions,
      current_streak: 12,
      longest_streak: 28,
      matrix,
    };
  }

  public async getRoadmap(studentId?: string): Promise<StudentRoadmapData> {
    try {
      const url = studentId ? `/student/roadmap?studentId=${studentId}` : '/student/roadmap';
      const data = await api.get<StudentRoadmapData>(url);
      if (data && data.milestones) return data;
    } catch (e) {
      console.warn('[StudentService] Offline/Mock fallback for roadmap');
    }

    return mockDefaultRoadmapData;
  }

  public async getLeaderboard(): Promise<ClassLeaderboardEntry[]> {
    return mockLeaderboardData;
  }

  public async getSM2Cards(): Promise<SM2MemoryCard[]> {
    return mockSM2MemoryCards;
  }

  public getStudyDays(): StudyDay[] {
    return generateCurrentWeekStudyDays();
  }
}

export const studentService = new StudentService();
export default studentService;
