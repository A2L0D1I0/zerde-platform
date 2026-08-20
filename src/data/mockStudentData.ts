import { StudentProfile, SubjectFocus, QuarterTopic, SpacedRepetitionItem, HeatmapDay, Language } from '../types';

export const mockStudent: StudentProfile = {
  id: 'ST_KZ_09_042',
  name: 'Азамат Қалиев',
  grade: '9 «А»',
  school: 'NIS IB Astana',
  selectedLanguage: 'KZ',
  overallElo: 1420,
  eloRank: {
    level: 'ҚЫРАН',
    symbol: '🦅',
    minElo: 1400,
    maxElo: 1599
  },
  streakDays: 12,
  quarter: 1,
  isVacation: false
};

export const mockSubjects: Record<Language, SubjectFocus[]> = {
  KZ: [
    {
      id: 'algebra_9',
      title: 'Алгебра 9 сынып',
      icon: '📐',
      subjectElo: 1435,
      predictedScore: '38/40 ⭐',
      focusTopic: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
      focusReason: '💡 Кеше таңбаларды анықтаудан қателестің. Осы 1 ережені бекітсек емтихан болжамың 39-ға өседі.',
      durationMinutes: 3,
      ctaLabel: 'Жаттығуды бастау (3 минут)'
    },
    {
      id: 'physics_9',
      title: 'Физика 9 сынып',
      icon: '⚡',
      subjectElo: 1380,
      predictedScore: '34/40 ⭐',
      focusTopic: 'Энергияның сақталу заңы',
      focusReason: '💡 Ең жоғарғы көтерілу биіктігін табу формуласын 1 рет қайталау қажет.',
      durationMinutes: 3,
      ctaLabel: 'Жаттығуды бастау (3 минут)'
    },
    {
      id: 'chemistry_9',
      title: 'Химия 9 сынып',
      icon: '🧪',
      subjectElo: 1410,
      predictedScore: '36/40 ⭐',
      focusTopic: 'Периодтық заң және электрондық орбитальдар',
      focusReason: '💡 Хунд ережесі мен Паули принципін бекіту.',
      durationMinutes: 3,
      ctaLabel: 'Жаттығуды бастау (3 минут)'
    },
    {
      id: 'kazakh_9',
      title: 'Қазақ тілі 9 сынып',
      icon: '🇰🇿',
      subjectElo: 1450,
      predictedScore: '39/40 ⭐',
      focusTopic: 'Сабақтас құрмалас сөйлемдердің түрлері',
      focusReason: '💡 Бағыныңқы сөйлемнің басыңқыға байланысу жолдарын пысықтау.',
      durationMinutes: 3,
      ctaLabel: 'Жаттығуды бастау (3 минут)'
    }
  ],
  RU: [
    {
      id: 'algebra_9',
      title: 'Алгебра 9 класс',
      icon: '📐',
      subjectElo: 1435,
      predictedScore: '38/40 ⭐',
      focusTopic: 'Квадратные неравенства (Метод интервалов)',
      focusReason: '💡 Вчера была ошибка в расстановке знаков на прямой. Закрепим это правило за 3 минуты.',
      durationMinutes: 3,
      ctaLabel: 'Начать тренировку (3 минуты)'
    },
    {
      id: 'physics_9',
      title: 'Физика 9 класс',
      icon: '⚡',
      subjectElo: 1380,
      predictedScore: '34/40 ⭐',
      focusTopic: 'Закон сохранения механической энергии',
      focusReason: '💡 Нужно освежить формулу потенциальной энергии на максимальной высоте.',
      durationMinutes: 3,
      ctaLabel: 'Начать тренировку (3 минуты)'
    },
    {
      id: 'chemistry_9',
      title: 'Химия 9 класс',
      icon: '🧪',
      subjectElo: 1410,
      predictedScore: '36/40 ⭐',
      focusTopic: 'Периодический закон и орбитали',
      focusReason: '💡 Закрепление правила Хунда и принципа Паули.',
      durationMinutes: 3,
      ctaLabel: 'Начать тренировку (3 минуты)'
    },
    {
      id: 'kazakh_9',
      title: 'Казахский язык 9 класс',
      icon: '🇰🇿',
      subjectElo: 1450,
      predictedScore: '39/40 ⭐',
      focusTopic: 'Сложноподчиненные предложения',
      focusReason: '💡 Отработка связи придаточного предложения с главным.',
      durationMinutes: 3,
      ctaLabel: 'Начать тренировку (3 минуты)'
    }
  ],
  EN: [
    {
      id: 'algebra_9',
      title: 'Algebra Grade 9',
      icon: '📐',
      subjectElo: 1435,
      predictedScore: '38/40 ⭐',
      focusTopic: 'Quadratic Inequalities (Interval Method)',
      focusReason: '💡 Yesterday you had a sign error on the number line. Let’s lock in this concept in 3 mins.',
      durationMinutes: 3,
      ctaLabel: 'Start Practice (3 mins)'
    },
    {
      id: 'physics_9',
      title: 'Physics Grade 9',
      icon: '⚡',
      subjectElo: 1380,
      predictedScore: '34/40 ⭐',
      focusTopic: 'Law of Conservation of Energy',
      focusReason: '💡 Quick refresher on potential energy equations.',
      durationMinutes: 3,
      ctaLabel: 'Start Practice (3 mins)'
    },
    {
      id: 'chemistry_9',
      title: 'Chemistry Grade 9',
      icon: '🧪',
      subjectElo: 1410,
      predictedScore: '36/40 ⭐',
      focusTopic: 'Periodic Law & Electron Orbitals',
      focusReason: '💡 Master Hund’s rule and Pauli exclusion principle.',
      durationMinutes: 3,
      ctaLabel: 'Start Practice (3 mins)'
    },
    {
      id: 'kazakh_9',
      title: 'Kazakh Language Grade 9',
      icon: '🇰🇿',
      subjectElo: 1450,
      predictedScore: '39/40 ⭐',
      focusTopic: 'Complex Sentences & Clause Syntax',
      focusReason: '💡 Review subordinating clause connectors.',
      durationMinutes: 3,
      ctaLabel: 'Start Practice (3 mins)'
    }
  ]
};

export const mockTopics: Record<Language, QuarterTopic[]> = {
  KZ: [
    {
      id: 'topic_01',
      topicNumber: '#01',
      title: 'Сызықтық теңдеулер мен теңсіздіктер жүйесі',
      status: 'mastered',
      statusLabel: 'Усвоено',
      subText: 'Мұғалім бекітті • СОР-ға дайын'
    },
    {
      id: 'topic_02',
      topicNumber: '#02',
      title: 'Виет теоремасы және квадрат үшмүше',
      status: 'pending',
      statusLabel: 'Ожидает',
      subText: 'ИИ қабылдады • Мұғалім растауын күтуде'
    },
    {
      id: 'topic_03',
      topicNumber: '#03',
      title: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
      status: 'in_progress',
      statusLabel: 'В работе',
      subText: '● Бүгінгі сабақ • 3 мин жаттығу',
      isTodayFocus: true
    },
    {
      id: 'topic_04',
      topicNumber: '#04',
      title: 'Бөлшек-рационал теңсіздіктерді шешу',
      status: 'queued',
      statusLabel: 'Кезекте',
      subText: '1-тоқсан жоспарында'
    }
  ],
  RU: [
    {
      id: 'topic_01',
      topicNumber: '#01',
      title: 'Системы линейных уравнений и неравенств',
      status: 'mastered',
      statusLabel: 'Усвоено',
      subText: 'Учитель подтвердил • Готов к СОР'
    },
    {
      id: 'topic_02',
      topicNumber: '#02',
      title: 'Теорема Виета и квадратный трехчлен',
      status: 'pending',
      statusLabel: 'Ожидает',
      subText: 'ИИ проверил • Ожидает подтверждения учителя'
    },
    {
      id: 'topic_03',
      topicNumber: '#03',
      title: 'Квадратные неравенства (Метод интервалов)',
      status: 'in_progress',
      statusLabel: 'В работе',
      subText: '● Сегодняшний фокус • 3 мин тренировка',
      isTodayFocus: true
    },
    {
      id: 'topic_04',
      topicNumber: '#04',
      title: 'Дробно-рациональные неравенства',
      status: 'queued',
      statusLabel: 'В очереди',
      subText: 'В плане 1-й четверти'
    }
  ],
  EN: [
    {
      id: 'topic_01',
      topicNumber: '#01',
      title: 'Systems of Linear Equations and Inequalities',
      status: 'mastered',
      statusLabel: 'Mastered',
      subText: 'Teacher approved • Ready for Exam'
    },
    {
      id: 'topic_02',
      topicNumber: '#02',
      title: 'Vieta’s Theorem & Quadratic Trinomials',
      status: 'pending',
      statusLabel: 'Pending',
      subText: 'AI verified • Awaiting teacher confirmation'
    },
    {
      id: 'topic_03',
      topicNumber: '#03',
      title: 'Quadratic Inequalities (Interval Method)',
      status: 'in_progress',
      statusLabel: 'In Progress',
      subText: '● Today’s focus • 3 min drill',
      isTodayFocus: true
    },
    {
      id: 'topic_04',
      topicNumber: '#04',
      title: 'Rational Fractional Inequalities',
      status: 'queued',
      statusLabel: 'Queued',
      subText: 'Q1 syllabus'
    }
  ]
};

export const mockHeatmapData: HeatmapDay[] = [
  { date: '1-күн', level: 3, tasksCompleted: 5 },
  { date: '2-күн', level: 4, tasksCompleted: 8 },
  { date: '3-күн', level: 2, tasksCompleted: 3 },
  { date: '4-күн', level: 4, tasksCompleted: 7 },
  { date: '5-күн', level: 3, tasksCompleted: 4 },
  { date: '6-күн', level: 4, tasksCompleted: 9 },
  { date: '7-күн', level: 4, tasksCompleted: 8 },
  { date: '8-күн', level: 2, tasksCompleted: 3 },
  { date: '9-күн', level: 3, tasksCompleted: 5 },
  { date: '10-күн', level: 4, tasksCompleted: 8 },
  { date: '11-күн', level: 4, tasksCompleted: 7 },
  { date: '12-күн', level: 4, tasksCompleted: 6 },
  { date: '13-күн', level: 0, tasksCompleted: 0 },
  { date: '14-күн', level: 0, tasksCompleted: 0 },
];

export const mockSpacedRepetition: Record<Language, SpacedRepetitionItem> = {
  KZ: {
    available: true,
    cardsCount: 3,
    timeEstimate: '1 мин',
    title: 'Жадты бекіту (Spaced Repetition)',
    description: '1-тоқсанның 3 формуласы қайталауды күтуде (Дискриминант, Виет, Интервалдар)'
  },
  RU: {
    available: true,
    cardsCount: 3,
    timeEstimate: '1 мин',
    title: 'Интервальное повторение памяти (Spaced Repetition)',
    description: '3 формулы 1-й четверти готовы к повторению (Дискриминант, Виета, Интервалы)'
  },
  EN: {
    available: true,
    cardsCount: 3,
    timeEstimate: '1 min',
    title: 'Spaced Memory Repetition',
    description: '3 formulas from Q1 are due for review (Discriminant, Vieta, Interval signs)'
  }
};
