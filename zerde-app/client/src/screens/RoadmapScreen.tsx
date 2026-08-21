import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Sparkles,
  Zap,
  Filter,
  User,
  Users,
  Award,
  Flame,
  Check,
  X,
  Layers,
  FolderPlus,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  calendarService,
  CalendarEvent,
  CategoryMeta,
  EventColorTag,
  DEFAULT_UNIVERSAL_CATEGORIES,
  AVAILABLE_VECTOR_ICONS,
} from '@/services/calendarService';
import { VectorIcon } from '@/components/common/VectorIcon';

const COLOR_MAP: Record<EventColorTag, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-900/20',
    border: 'border-purple-500/30 dark:border-purple-700/50',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dot: 'bg-purple-500',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-900/20',
    border: 'border-blue-500/30 dark:border-blue-700/50',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-900/20',
    border: 'border-emerald-500/30 dark:border-emerald-700/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-900/20',
    border: 'border-amber-500/30 dark:border-amber-700/50',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-900/20',
    border: 'border-rose-500/30 dark:border-rose-700/50',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-900/20',
    border: 'border-cyan-500/30 dark:border-cyan-700/50',
    text: 'text-cyan-700 dark:text-cyan-300',
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
};

const I18N = {
  KZ: {
    title: 'Интерактивті Роадмап-Күнтізбе',
    subtitle: 'Мұғалімнің тапсырмалары мен өзіңіз қосқан жеке оқу мақсаттарыңыздың бірыңғай кестесі',
    badgeText: 'Жеке жоспар & Дедлайндар',
    filterAll: 'Барлығы',
    filterPersonal: '🟣 Жеке мақсаттар',
    filterTeacher: '🔵 Мұғалімнен',
    addGoalBtn: 'Мақсат қосу',
    today: 'Бүгін',
    weekdays: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'],
    months: [
      'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
      'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
    ],
    legendPersonal: 'Жеке мақсат (Өзім)',
    legendTeacherGroup: 'Мұғалімнен (Сынып)',
    legendTeacherStudent: 'Жеке тапсырма',
    legendFooter: 'Күнделікті жоспарды толық орындау белсенділік пен стрикті арттырады 🔥',
    agendaTitle: 'Күн тәртібі',
    noEventsToday: 'Бұл күнге оқиғалар жоқ',
    noEventsSub: 'Өзіңізге жаңа оқу мақсатын белгілеңіз немесе демалыс жоспарлаңыз!',
    streakTitle: 'Стрик & Күнделікті бонус',
    streakBonusEarned: 'Бүгінгі +10 ELO алынды ✅',
    streakBonusPending: 'Планды жапқанда +10 ELO 🔥',
    streakDesc: 'Барлық жоспарланған мақсаттарды жапқанда күн сайын 1 рет +10 ELO және Стрик беріледі!',
    modalTitle: 'Жаңа мақсат / Оқиға қосу',
    modalSub: 'Жеке оқу кестеңізді реттеп, векторлық стиль таңдаңыз',
    fieldTitle: 'Мақсаттың атауы *',
    fieldTitlePh: 'Мысалы: Дискриминант формулаларын қайталау',
    fieldDesc: 'Қосымша түсініктеме',
    fieldDescPh: '3 формула мен 5 есепті талдау',
    fieldDate: 'Күні',
    fieldTime: 'Уақыты',
    fieldCategory: 'Санат (Категория)',
    fieldColor: 'Карточка стилі',
    addCustomCategory: '+ Жаңа санат',
    customCatTitle: 'Жаңа санат жасау',
    customCatName: 'Санат атауы *',
    customCatIcons: 'Векторлық иконкалар (1-3 таңдаңыз) *',
    saveCatBtn: 'Санатты сақтау',
    cancel: 'Бас тарту',
    submitAdd: 'Күнтізбеге қосу',
    personalBadge: 'Өзім қосқан',
    teacherGroupBadge: 'Мұғалім',
    teacherTaskBadge: 'Жеке тапсырма',
    toastTitleReq: 'Атауын жазыңыз',
    toastTitleReqMsg: 'Мақсат атауы міндетті.',
    toastGoalAdded: 'Мақсат күнтізбеге қосылды! 🚀',
    toastGoalDeleted: 'Оқиға күнтізбеден алынды',
    toastBonusEarnedTitle: 'Күнделікті әдет бонусы! 🔥',
    toastBonusEarnedMsg: 'Бүгінгі барлық мақсат орындалды! +10 ELO және Стрик қосылды!',
    toastTaskDoneTitle: 'Тапсырма орындалды! ✅',
    toastTaskDoneMsg: 'Жарайсың! Күн тәртібі бекітілді.',
    moreTasks: 'тағы...',
  },
  RU: {
    title: 'Интерактивный Роадмап-Календарь',
    subtitle: 'Единое расписание заданий от учителя и ваших личных учебных целей',
    badgeText: 'Личный план & Дедлайны',
    filterAll: 'Все',
    filterPersonal: '🟣 Личные цели',
    filterTeacher: '🔵 От учителя',
    addGoalBtn: 'Добавить цель',
    today: 'Сегодня',
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    months: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    legendPersonal: 'Личная цель (Своя)',
    legendTeacherGroup: 'От учителя (Класс)',
    legendTeacherStudent: 'Индивидуальное задание',
    legendFooter: 'Закрытие плана дня прокачивает активность и стрик 🔥',
    agendaTitle: 'Задачи на день',
    noEventsToday: 'На этот день событий нет',
    noEventsSub: 'Поставьте себе новую учебную цель или спланируйте отдых!',
    streakTitle: 'Стрик & Дневной бонус',
    streakBonusEarned: 'Бонус +10 ELO получен ✅',
    streakBonusPending: 'Закрой план дня: +10 ELO 🔥',
    streakDesc: 'При закрытии всех задач на сегодня начисляется +10 ELO (1 раз в сутки) и растет стрик!',
    modalTitle: 'Добавить новую цель / событие',
    modalSub: 'Настройте учебное расписание и выберите векторный стиль',
    fieldTitle: 'Название цели *',
    fieldTitlePh: 'Например: Повторить формулы Виета',
    fieldDesc: 'Дополнительное описание',
    fieldDescPh: 'Разобрать 3 формулы и решить 5 задач',
    fieldDate: 'Дата',
    fieldTime: 'Время',
    fieldCategory: 'Категория',
    fieldColor: 'Стиль карточки',
    addCustomCategory: '+ Новая категория',
    customCatTitle: 'Создание своей категории',
    customCatName: 'Название категории *',
    customCatIcons: 'Векторные иконки (выберите 1-3) *',
    saveCatBtn: 'Сохранить категорию',
    cancel: 'Отмена',
    submitAdd: 'Добавить в календарь',
    personalBadge: 'Личная',
    teacherGroupBadge: 'Учитель',
    teacherTaskBadge: 'Индивидуальное',
    toastTitleReq: 'Укажите название',
    toastTitleReqMsg: 'Название цели обязательно.',
    toastGoalAdded: 'Цель добавлена в календарь! 🚀',
    toastGoalDeleted: 'Событие удалено из календаря',
    toastBonusEarnedTitle: 'Дневной бонус привычки! 🔥',
    toastBonusEarnedMsg: 'Все цели на сегодня выполнены! +10 ELO и защита стрика!',
    toastTaskDoneTitle: 'Задача выполнена! ✅',
    toastTaskDoneMsg: 'Отлично! Шаг дня зафиксирован.',
    moreTasks: 'еще...',
  },
  EN: {
    title: 'Interactive Roadmap Calendar',
    subtitle: 'Unified schedule of teacher assignments and personal learning goals',
    badgeText: 'Personal Plan & Deadlines',
    filterAll: 'All',
    filterPersonal: '🟣 Personal Goals',
    filterTeacher: '🔵 From Teacher',
    addGoalBtn: 'Add Goal',
    today: 'Today',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    legendPersonal: 'Personal Goal (Self)',
    legendTeacherGroup: 'From Teacher (Class)',
    legendTeacherStudent: 'Individual Task',
    legendFooter: 'Completing daily goals builds streak & GitHub activity 🔥',
    agendaTitle: 'Daily Tasks',
    noEventsToday: 'No events scheduled for this day',
    noEventsSub: 'Set a new learning goal or schedule your rest day!',
    streakTitle: 'Streak & Daily Habit Bonus',
    streakBonusEarned: '+10 ELO Bonus Earned ✅',
    streakBonusPending: 'Complete day plan: +10 ELO 🔥',
    streakDesc: 'Completing all daily goals awards +10 ELO (once per 24h) and boosts your streak!',
    modalTitle: 'Add New Goal / Event',
    modalSub: 'Customize your study schedule with vector icon patterns',
    fieldTitle: 'Goal Title *',
    fieldTitlePh: 'E.g. Review quadratic discriminant rules',
    fieldDesc: 'Additional Notes',
    fieldDescPh: 'Review 3 formulas and solve 5 exercises',
    fieldDate: 'Date',
    fieldTime: 'Time',
    fieldCategory: 'Category',
    fieldColor: 'Card Style',
    addCustomCategory: '+ New Category',
    customCatTitle: 'Create Custom Category',
    customCatName: 'Category Name *',
    customCatIcons: 'Vector Icons (choose 1-3) *',
    saveCatBtn: 'Save Category',
    cancel: 'Cancel',
    submitAdd: 'Add to Calendar',
    personalBadge: 'Personal',
    teacherGroupBadge: 'Teacher',
    teacherTaskBadge: 'Personal Task',
    toastTitleReq: 'Title required',
    toastTitleReqMsg: 'Goal title cannot be empty.',
    toastGoalAdded: 'Goal added to calendar! 🚀',
    toastGoalDeleted: 'Event removed from calendar',
    toastBonusEarnedTitle: 'Daily Habit Bonus! 🔥',
    toastBonusEarnedMsg: 'All daily goals completed! +10 ELO awarded & streak updated!',
    toastTaskDoneTitle: 'Task Completed! ✅',
    toastTaskDoneMsg: 'Great job! Daily progress saved.',
    moreTasks: 'more...',
  },
};

export const RoadmapScreen: React.FC = () => {
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const langKey = (language as 'KZ' | 'RU' | 'EN') || 'KZ';
  const tStr = I18N[langKey] || I18N.KZ;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'teacher'>('all');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);

  // Add Event Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(selectedDate);
  const [eventTime, setEventTime] = useState('18:00');
  const [selectedCatId, setSelectedCatId] = useState<string>('study');
  const [eventColorTag, setEventColorTag] = useState<EventColorTag>('purple');

  // Custom Category Creation Modal State
  const [isCustomCatModalOpen, setIsCustomCatModalOpen] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [customCatColor, setCustomCatColor] = useState<EventColorTag>('cyan');
  const [customCatIcons, setCustomCatIcons] = useState<string[]>(['Star']);

  const loadData = () => {
    const studentGroup = user?.grade?.includes('9') ? '1' : '1';
    const studentEvents = calendarService.getEventsForStudent(user?.id, studentGroup);
    setEvents(studentEvents);
    setCategories(calendarService.getCategories());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = calendarService.subscribe(loadData);
    return () => unsubscribe();
  }, [user]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleToggleComplete = (event: CalendarEvent) => {
    const res = calendarService.toggleEventCompleted(event.id);

    if (res.completed) {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.7 },
      });

      if (res.earnedDailyBonus) {
        // Award +10 ELO Daily Habit Bonus
        if (user) {
          updateUser({
            overallElo: (user.overallElo || 1420) + 10,
            streakDays: Math.max(user.streakDays || 1, (user.streakDays || 1) + 1),
          });
        }

        showToast({
          type: 'success',
          title: tStr.toastBonusEarnedTitle,
          message: tStr.toastBonusEarnedMsg,
        });
      } else {
        showToast({
          type: 'success',
          title: tStr.toastTaskDoneTitle,
          message: tStr.toastTaskDoneMsg,
        });
      }
    }
  };

  const handleCreatePersonalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      showToast({
        type: 'attention',
        title: tStr.toastTitleReq,
        message: tStr.toastTitleReqMsg,
      });
      return;
    }

    const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

    calendarService.addEvent({
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
      date: eventDate,
      time: eventTime,
      type: 'student_personal',
      authorId: user?.id || 'usr_student_1',
      authorName: user?.full_name || 'Оқушы',
      authorRole: 'student',
      isCompleted: false,
      categoryId: selectedCategory.id,
      colorTag: eventColorTag,
      vectorIcons: selectedCategory.vectorIcons || ['BookOpen'],
    });

    showToast({
      type: 'success',
      title: tStr.toastGoalAdded,
      message: `${eventTitle} — ${eventDate}`,
    });

    setIsAddModalOpen(false);
    setEventTitle('');
    setEventDescription('');
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCatName.trim() || customCatIcons.length === 0) return;

    const newCat = calendarService.addCustomCategory({
      nameKZ: customCatName.trim(),
      nameRU: customCatName.trim(),
      nameEN: customCatName.trim(),
      colorTag: customCatColor,
      vectorIcons: customCatIcons,
    });

    setSelectedCatId(newCat.id);
    setEventColorTag(newCat.colorTag);
    setIsCustomCatModalOpen(false);
    setCustomCatName('');
    setCustomCatIcons(['Star']);

    showToast({
      type: 'success',
      title: 'Жаңа санат қосылды! ✅',
      message: customCatName.trim(),
    });
  };

  const toggleIconSelection = (iconName: string) => {
    if (customCatIcons.includes(iconName)) {
      if (customCatIcons.length > 1) {
        setCustomCatIcons(customCatIcons.filter((i) => i !== iconName));
      }
    } else {
      if (customCatIcons.length < 3) {
        setCustomCatIcons([...customCatIcons, iconName]);
      } else {
        setCustomCatIcons([customCatIcons[1], customCatIcons[2], iconName]);
      }
    }
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    calendarService.deleteEvent(id);
    showToast({
      type: 'info',
      title: tStr.toastGoalDeleted,
      message: '',
    });
  };

  // Filtered events
  const filteredEvents = events.filter((evt) => {
    if (filterType === 'personal') return evt.type === 'student_personal';
    if (filterType === 'teacher') return evt.type === 'teacher_group' || evt.type === 'teacher_student';
    return true;
  });

  const selectedDayEvents = filteredEvents.filter((evt) => evt.date === selectedDate);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAllEvents = events.filter((e) => e.date === todayStr);
  const todayCompletedCount = todayAllEvents.filter((e) => e.isCompleted).length;
  const isBonusEarnedToday = calendarService.isDailyBonusClaimedToday();

  const getCategoryName = (cat: CategoryMeta) => {
    if (langKey === 'RU') return cat.nameRU;
    if (langKey === 'EN') return cat.nameEN;
    return cat.nameKZ;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 animate-in fade-in duration-150">
      {/* 1. Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-4 shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primer-accent-emphasis text-white shadow-sm shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-primer-fg-default">
                {tStr.title}
              </h2>
              <Badge variant="accent" className="font-mono text-xs">
                {tStr.badgeText}
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              {tStr.subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-primer-accent-emphasis text-white shadow-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              {tStr.filterAll} ({events.length})
            </button>
            <button
              onClick={() => setFilterType('personal')}
              className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                filterType === 'personal'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              {tStr.filterPersonal}
            </button>
            <button
              onClick={() => setFilterType('teacher')}
              className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                filterType === 'teacher'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              {tStr.filterTeacher}
            </button>
          </div>

          <Button
            onClick={() => {
              setEventDate(selectedDate);
              setIsAddModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="gap-1.5 font-bold shadow-primer-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{tStr.addGoalBtn}</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Calendar & Day Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Calendar Grid (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-4 shadow-primer-xs">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-primer-border-default">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-primer-fg-default">
                {tStr.months[month]} {year}
              </h3>
              <Button
                variant="secondary"
                size="xs"
                onClick={handleToday}
                className="text-xs font-semibold px-2 py-0.5"
              >
                {tStr.today}
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="p-1 h-8 w-8 text-primer-fg-muted hover:text-primer-fg-default"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="p-1 h-8 w-8 text-primer-fg-muted hover:text-primer-fg-default"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-primer-fg-muted py-1.5 border-b border-primer-border-muted/40">
            {tStr.weekdays.map((wd, i) => (
              <span key={wd} className={i >= 5 ? 'text-primer-attention-fg' : ''}>
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar Month Matrix Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty Offset Days */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[78px] sm:min-h-[92px] rounded-lg bg-primer-canvas-inset/30 border border-transparent p-1.5 opacity-40"
              />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = todayStr === dateStr;

              const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
              const completedCount = dayEvents.filter((e) => e.isCompleted).length;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[78px] sm:min-h-[92px] rounded-lg p-1.5 transition-all cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'border-primer-accent-emphasis bg-primer-accent-subtle/25 ring-1 ring-primer-accent-emphasis shadow-sm'
                      : isToday
                      ? 'border-primer-attention-muted bg-primer-attention-subtle/20'
                      : 'border-primer-border-muted/60 bg-primer-canvas-inset hover:border-primer-border-default hover:bg-primer-canvas-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-primer-accent-emphasis text-white shadow-xs'
                          : isSelected
                          ? 'text-primer-accent-fg font-extrabold'
                          : 'text-primer-fg-default'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-primer-fg-muted">
                        {completedCount}/{dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Chips List with Vector Icon */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const colors = COLOR_MAP[evt.colorTag] || COLOR_MAP.purple;
                      const primaryIcon = evt.vectorIcons?.[0] || 'Target';

                      return (
                        <div
                          key={evt.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 border ${
                            evt.isCompleted
                              ? 'line-through opacity-60 bg-primer-canvas-subtle text-primer-fg-muted border-primer-border-muted'
                              : `${colors.bg} ${colors.border} ${colors.text}`
                          }`}
                          title={`${evt.title} (${evt.time || ''})`}
                        >
                          <VectorIcon name={primaryIcon} className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-primer-fg-muted font-bold text-center">
                        +{dayEvents.length - 2} {tStr.moreTasks}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-primer-border-muted/40 text-[11px] text-primer-fg-muted flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>{tStr.legendPersonal}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>{tStr.legendTeacherGroup}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{tStr.legendTeacherStudent}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono">
              {tStr.legendFooter}
            </span>
          </div>
        </div>

        {/* Selected Day Agenda & Inspector (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-16">
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-primer-border-default">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primer-fg-muted">
                  {tStr.agendaTitle}
                </span>
                <h3 className="text-sm font-bold text-primer-fg-default font-mono mt-0.5">
                  📅 {selectedDate}
                </h3>
              </div>

              <Button
                variant="secondary"
                size="xs"
                onClick={() => {
                  setEventDate(selectedDate);
                  setIsAddModalOpen(true);
                }}
                className="gap-1 text-xs font-bold"
              >
                <Plus className="w-3 h-3" />
                <span>{tStr.addGoalBtn}</span>
              </Button>
            </div>

            {/* Events for Selected Date */}
            {selectedDayEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-primer-fg-muted rounded-lg border border-dashed border-primer-border-muted bg-primer-canvas-inset space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-primer-canvas-subtle flex items-center justify-center border border-primer-border-muted">
                  <CalendarIcon className="w-5 h-5 text-primer-fg-muted" />
                </div>
                <p className="font-semibold text-primer-fg-default">{tStr.noEventsToday}</p>
                <p className="text-[11px]">{tStr.noEventsSub}</p>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    setEventDate(selectedDate);
                    setIsAddModalOpen(true);
                  }}
                  className="mt-2 text-xs font-bold"
                >
                  + {tStr.addGoalBtn}
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayEvents.map((evt) => {
                  const colors = COLOR_MAP[evt.colorTag] || COLOR_MAP.purple;
                  const isPersonal = evt.type === 'student_personal';
                  const categoryMeta = categories.find((c) => c.id === evt.categoryId);
                  const iconList = evt.vectorIcons?.length ? evt.vectorIcons : categoryMeta?.vectorIcons || ['Target'];

                  return (
                    <div
                      key={evt.id}
                      className={`relative p-3.5 rounded-xl border transition-all overflow-hidden space-y-2 ${
                        evt.isCompleted
                          ? 'bg-primer-canvas-inset/60 border-primer-border-muted opacity-75'
                          : `${colors.bg} ${colors.border}`
                      }`}
                    >
                      {/* Vector SVG Background Watermark Pattern (1 to 3 icons) */}
                      <div className="absolute right-2 bottom-1 flex items-center gap-1.5 opacity-10 dark:opacity-15 pointer-events-none select-none">
                        {iconList.map((iconName, idx) => (
                          <VectorIcon key={idx} name={iconName} className="w-8 h-8 text-current stroke-[1.5]" />
                        ))}
                      </div>

                      <div className="relative z-10 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Complete Checkbox Button */}
                          <button
                            onClick={() => handleToggleComplete(evt)}
                            className="mt-0.5 text-primer-fg-muted hover:text-primer-success-fg transition cursor-pointer shrink-0"
                          >
                            {evt.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-primer-success-fg fill-primer-success-subtle" />
                            ) : (
                              <Circle className="w-5 h-5 hover:scale-110 transition" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <div className="p-1 rounded-md bg-primer-canvas-subtle border border-primer-border-default/60 shrink-0">
                                <VectorIcon name={iconList[0]} className="w-3.5 h-3.5 text-primer-fg-default" />
                              </div>
                              <h4
                                className={`text-xs font-bold ${
                                  evt.isCompleted
                                    ? 'line-through text-primer-fg-muted'
                                    : 'text-primer-fg-default'
                                }`}
                              >
                                {evt.title}
                              </h4>
                            </div>

                            {evt.description && (
                              <p className="text-[11px] text-primer-fg-muted mt-1 leading-relaxed line-clamp-2">
                                {evt.description}
                              </p>
                            )}

                            {/* Badges & Meta */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                              {/* Source Badge */}
                              {evt.type === 'student_personal' && (
                                <Badge variant="secondary" className="text-[9px] py-0 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
                                  <User className="w-2.5 h-2.5 mr-0.5" />
                                  <span>{tStr.personalBadge}</span>
                                </Badge>
                              )}

                              {evt.type === 'teacher_group' && (
                                <Badge variant="accent" className="text-[9px] py-0 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                  <Users className="w-2.5 h-2.5 mr-0.5" />
                                  <span>{tStr.teacherGroupBadge}: {evt.targetGroupName || '9 «А»'}</span>
                                </Badge>
                              )}

                              {evt.type === 'teacher_student' && (
                                <Badge variant="attention" className="text-[9px] py-0 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                  <span>{tStr.teacherTaskBadge}</span>
                                </Badge>
                              )}

                              {/* Category Name */}
                              {categoryMeta && (
                                <span className="font-medium text-primer-fg-muted">
                                  • {getCategoryName(categoryMeta)}
                                </span>
                              )}

                              {evt.time && (
                                <span className="flex items-center gap-1 text-primer-fg-muted font-mono">
                                  <Clock className="w-3 h-3" />
                                  {evt.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete for Personal Events */}
                        {isPersonal && (
                          <button
                            onClick={(e) => handleDeleteEvent(evt.id, e)}
                            className="relative z-10 text-primer-fg-muted hover:text-primer-danger-fg p-1 rounded transition cursor-pointer"
                            title="Мақсатты өшіру"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gamification & Daily Habit Bonus Banner */}
          <div className="rounded-xl border border-primer-border-default bg-gradient-to-br from-primer-canvas-subtle to-primer-accent-subtle/20 p-4 shadow-primer-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primer-fg-default flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-primer-attention-fg fill-current" />
                <span>{tStr.streakTitle}</span>
              </span>
              <Badge variant={isBonusEarnedToday ? 'done' : 'attention'} className="text-[10px] font-mono">
                {isBonusEarnedToday ? tStr.streakBonusEarned : tStr.streakBonusPending}
              </Badge>
            </div>
            <p className="text-[11px] text-primer-fg-muted leading-relaxed">
              {tStr.streakDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Add Personal Event Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <div>
              <DialogTitle className="text-sm font-bold text-primer-fg-default">
                {tStr.modalTitle}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-primer-fg-muted mt-0.5">
                {tStr.modalSub}
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleCreatePersonalEvent} className="p-4 space-y-3.5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.fieldTitle}
              </label>
              <Input
                type="text"
                placeholder={tStr.fieldTitlePh}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.fieldDesc}
              </label>
              <Input
                type="text"
                placeholder={tStr.fieldDescPh}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  {tStr.fieldDate}
                </label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  {tStr.fieldTime}
                </label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>

            {/* Universal Categories Selector + Add Custom Category Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-primer-fg-default">
                  {tStr.fieldCategory}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCatModalOpen(true)}
                  className="text-xs font-bold text-primer-accent-fg hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{tStr.addCustomCategory}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {categories.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  const primaryIcon = cat.vectorIcons?.[0] || 'Target';

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCatId(cat.id);
                        setEventColorTag(cat.colorTag);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? 'border-primer-accent-emphasis bg-primer-accent-subtle text-primer-accent-fg font-bold shadow-xs'
                          : 'border-primer-border-muted bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default'
                      }`}
                    >
                      <VectorIcon name={primaryIcon} className="w-3 h-3 shrink-0" />
                      <span className="truncate">{getCategoryName(cat)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette Picker */}
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.fieldColor}
              </label>
              <div className="flex items-center gap-2">
                {(['purple', 'blue', 'emerald', 'amber', 'rose', 'cyan'] as EventColorTag[]).map((color) => {
                  const isSelected = eventColorTag === color;
                  const colorBgClass: Record<EventColorTag, string> = {
                    purple: 'bg-purple-500',
                    blue: 'bg-blue-500',
                    emerald: 'bg-emerald-500',
                    amber: 'bg-amber-500',
                    rose: 'bg-rose-500',
                    cyan: 'bg-cyan-500',
                  };

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEventColorTag(color)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        colorBgClass[color]
                      } ${isSelected ? 'ring-2 ring-primer-accent-emphasis scale-110' : 'opacity-80 hover:opacity-100'}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                {tStr.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tStr.submitAdd}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Custom Category Creation Modal */}
      <Dialog open={isCustomCatModalOpen} onOpenChange={setIsCustomCatModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default">
              {tStr.customCatTitle}
            </DialogTitle>
          </div>

          <form onSubmit={handleSaveCustomCategory} className="p-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.customCatName}
              </label>
              <Input
                type="text"
                placeholder="Мысалы: Олимпиада, Спорт, Тіл үйрену"
                value={customCatName}
                onChange={(e) => setCustomCatName(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            {/* Vector Icons Selector (Pick 1 to 3) */}
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.customCatIcons} ({customCatIcons.length}/3 таңдалды)
              </label>
              <div className="grid grid-cols-6 gap-2 p-2 bg-primer-canvas-inset rounded-lg border border-primer-border-muted max-h-36 overflow-y-auto">
                {AVAILABLE_VECTOR_ICONS.map((iconName: string) => {
                  const isPicked = customCatIcons.includes(iconName);

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => toggleIconSelection(iconName)}
                      className={`p-2 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isPicked
                          ? 'border-primer-accent-emphasis bg-primer-accent-subtle text-primer-accent-fg scale-105 shadow-xs'
                          : 'border-primer-border-muted bg-primer-canvas-subtle text-primer-fg-muted hover:text-primer-fg-default'
                      }`}
                      title={iconName}
                    >
                      <VectorIcon name={iconName} className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Tag */}
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.fieldColor}
              </label>
              <div className="flex items-center gap-2">
                {(['purple', 'blue', 'emerald', 'amber', 'rose', 'cyan'] as EventColorTag[]).map((color) => {
                  const isSelected = customCatColor === color;
                  const colorBgClass: Record<EventColorTag, string> = {
                    purple: 'bg-purple-500',
                    blue: 'bg-blue-500',
                    emerald: 'bg-emerald-500',
                    amber: 'bg-amber-500',
                    rose: 'bg-rose-500',
                    cyan: 'bg-cyan-500',
                  };

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCustomCatColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        colorBgClass[color]
                      } ${isSelected ? 'ring-2 ring-primer-accent-emphasis scale-110' : 'opacity-80 hover:opacity-100'}`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCustomCatModalOpen(false)}
              >
                {tStr.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold"
              >
                {tStr.saveCatBtn}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoadmapScreen;
