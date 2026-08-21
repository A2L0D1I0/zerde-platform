import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  CircleDot,
  Plus,
  PlayCircle,
  Clock,
  Award,
  Flame,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  School,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Course, HeatmapDay, ClassLeaderboardEntry, StudyDay } from '@/types';
import { courseService } from '@/services/courseService';
import { studentService, generateWeeklyStudyDays } from '@/services/studentService';
import { calendarService, CalendarEvent, CategoryMeta } from '@/services/calendarService';
import { userProgressService, UserProgressState } from '@/services/userProgressService';

import { WeekdayStudyCarousel } from '@/components/student/WeekdayStudyCarousel';
import { StudentPassportCard } from '@/components/student/StudentPassportCard';
import { ActivityHeatmap } from '@/components/student/ActivityHeatmap';
import { ClassLeaderboardCard } from '@/components/student/ClassLeaderboardCard';
import { TestPracticeModal } from '@/components/student/TestPracticeModal';
import { NavTabId } from '@/components/layout/BottomNav';

interface StudentHomeScreenProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onNavigateTab,
}) => {
  const { user, updateUser } = useAuth();
  const { language, t, getLocalized } = useLanguage();
  const { showToast } = useToast();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState<HeatmapDay[]>([]);
  const [leaderboard, setLeaderboard] = useState<ClassLeaderboardEntry[]>([]);
  const [studyDays, setStudyDays] = useState<StudyDay[]>([]);
  const [progressState, setProgressState] = useState<UserProgressState>(userProgressService.getState());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Test Solver State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Алгебра');
  const [selectedTopic, setSelectedTopic] = useState('Квадраттық теңсіздіктер');

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('study');
  const [selectedLeaderboardCourseId, setSelectedLeaderboardCourseId] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allCourses, heatmap, lboard] = await Promise.all([
          courseService.getAllCourses(),
          studentService.getHeatmap(),
          studentService.getLeaderboard(),
        ]);

        const currentProg = userProgressService.getState();
        const enrolled = allCourses.filter((c) => currentProg.enrolledCourseIds.includes(c.id));
        setCourses(enrolled);
        if (enrolled.length > 0 && !selectedLeaderboardCourseId) {
          setSelectedLeaderboardCourseId(enrolled[0].id);
        }

        setCalendarEvents(calendarService.getAll());
        setCategories(calendarService.getCategories());
        setHeatmapMatrix(heatmap?.matrix || []);
        setLeaderboard(lboard || []);
        setStudyDays(generateWeeklyStudyDays(lang));
        setProgressState(currentProg);
      } catch (err) {
        console.warn('Data load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to progress & calendar changes
    const unsubCalendar = calendarService.subscribe(() => {
      setCalendarEvents(calendarService.getAll());
      setCategories(calendarService.getCategories());
    });

    const unsubProgress = userProgressService.subscribe(async (newProg) => {
      setProgressState(newProg);
      const allCourses = await courseService.getAllCourses();
      const enrolled = allCourses.filter((c) => newProg.enrolledCourseIds.includes(c.id));
      setCourses(enrolled);

      const heatmap = await studentService.getHeatmap();
      const lboard = await studentService.getLeaderboard(selectedLeaderboardCourseId);
      setHeatmapMatrix(heatmap?.matrix || []);
      setLeaderboard(lboard || []);
      setStudyDays(generateWeeklyStudyDays(lang));

      if (user) {
        updateUser({
          overallElo: newProg.elo,
          streakDays: newProg.streakDays,
        });
      }
    });

    return () => {
      unsubCalendar();
      unsubProgress();
    };
  }, [user, lang]);

  const todayEvents = calendarEvents.filter((e) => e.date === todayStr);
  const completedTasksCount = todayEvents.filter((e) => e.isCompleted).length;

  const tasksProgressText =
    todayEvents.length > 0
      ? lang === 'KZ'
        ? `${completedTasksCount}/${todayEvents.length} тапсырма орындалды`
        : lang === 'RU'
        ? `${completedTasksCount}/${todayEvents.length} задач выполнено`
        : `${completedTasksCount}/${todayEvents.length} tasks completed`
      : lang === 'KZ'
      ? 'Бүгінге жоспарланған міндеттер жоқ'
      : lang === 'RU'
      ? 'Нет задач на сегодня'
      : 'No goals scheduled for today';

  const handleToggleEvent = (eventId: string) => {
    const result = calendarService.toggleEventCompleted(eventId);
    if (result) {
      setCalendarEvents(calendarService.getAll());
      if (result.earnedDailyBonus) {
        showToast({
          type: 'success',
          title: lang === 'KZ' ? 'Күндік бонус берілді! 🎯' : lang === 'RU' ? 'Ежедневный бонус начислен! 🎯' : 'Daily Habit Bonus! 🎯',
          message: '+10 ELO!',
        });
      }
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    calendarService.addEvent({
      date: todayStr,
      title: newTaskTitle.trim(),
      type: 'student_personal',
      authorId: user?.id || 'guest',
      authorName: user?.full_name || 'Оқушы',
      authorRole: 'student',
      categoryId: newTaskCategory,
      colorTag: 'purple',
      vectorIcons: ['BookOpen'],
      isCompleted: false,
    });

    setCalendarEvents(calendarService.getAll());
    setNewTaskTitle('');
    setIsAddTaskModalOpen(false);

    showToast({
      type: 'success',
      title: lang === 'KZ' ? 'Тапсырма қосылды!' : lang === 'RU' ? 'Задача добавлена!' : 'Task added!',
      message: newTaskTitle.trim(),
    });
  };

  const handleStartPractice = (courseTitle: string, nextTopic?: string) => {
    setSelectedSubject(courseTitle);
    setSelectedTopic(nextTopic || (lang === 'KZ' ? 'Негізгі тақырыптар' : lang === 'RU' ? 'Базовые темы' : 'Core Topics'));
    setIsTestModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
      {/* 1. Header & Weekly Rhythm Carousel */}
      <WeekdayStudyCarousel days={studyDays} />

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* LEFT COLUMN: Real Today's Agenda & Enrolled Courses (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* SECTION A: Today's Actionable Agenda (Күнтізбе тапсырмалары) */}
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/40">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                    {lang === 'KZ' ? 'Бүгінгі тапсырмалар' : lang === 'RU' ? 'Задачи на сегодня' : "Today's Tasks"}
                  </h2>
                  <p className="text-[10px] text-primer-fg-muted">
                    {tasksProgressText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="gap-1 font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'KZ' ? 'Мақсат' : lang === 'RU' ? 'Цель' : 'Goal'}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onNavigateTab('roadmap')}
                  className="text-[11px] text-primer-accent-fg font-semibold hover:underline"
                >
                  {lang === 'KZ' ? 'Күнтізбе ➔' : lang === 'RU' ? 'Календарь ➔' : 'Calendar ➔'}
                </Button>
              </div>
            </div>

            {/* Today's Tasks List */}
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((ev) => {
                  const cat = categories.find((c) => c.id === ev.categoryId);
                  const catName = cat ? (lang === 'KZ' ? cat.nameKZ : lang === 'RU' ? cat.nameRU : cat.nameEN) : '';

                  return (
                    <div
                      key={ev.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        ev.isCompleted
                          ? 'border-primer-success-muted/50 bg-primer-success-subtle/20 opacity-80'
                          : 'border-primer-border-muted/60 bg-primer-canvas-inset/60 hover:bg-primer-canvas-inset'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleEvent(ev.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                            ev.isCompleted
                              ? 'bg-primer-success-emphasis border-primer-success-emphasis text-white'
                              : 'border-primer-border-default bg-primer-canvas-default hover:border-primer-accent-emphasis'
                          }`}
                        >
                          {ev.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`text-xs font-semibold text-primer-fg-default truncate block ${
                              ev.isCompleted ? 'line-through text-primer-fg-muted' : ''
                            }`}
                          >
                            {ev.title}
                          </span>
                          {ev.description && (
                            <span className="text-[10px] text-primer-fg-muted truncate block">
                              {ev.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {cat && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border bg-primer-canvas-subtle border-primer-border-default text-primer-fg-default">
                          {catName}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 border border-dashed border-primer-border-muted rounded-xl bg-primer-canvas-inset/30 space-y-2">
                <CalendarIcon className="w-6 h-6 text-primer-fg-muted mx-auto" />
                <p className="text-xs text-primer-fg-muted">
                  {lang === 'KZ'
                    ? 'Бүгінге мақсат белгіленбеген. Жаңа тапсырма қосыңыз!'
                    : lang === 'RU'
                    ? 'На сегодня целей нет. Добавьте задачу в календарь!'
                    : 'No goals set for today. Add a new task to stay on track!'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="text-xs font-bold gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'KZ' ? 'Бүгінгі мақсатты қосу' : lang === 'RU' ? 'Добавить цель на сегодня' : 'Add Today Goal'}</span>
                </Button>
              </div>
            )}
          </div>

          {/* SECTION B: My Enrolled Courses & Direct Test Solving (Менің пәндерім) */}
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primer-done-subtle text-primer-done-fg border border-primer-done-muted/40">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                    {lang === 'KZ' ? 'Менің пәндерім және Тесттер' : lang === 'RU' ? 'Мои предметы и тесты' : 'My Courses & Practice Tests'}
                  </h2>
                  <p className="text-[10px] text-primer-fg-muted">
                    {lang === 'KZ'
                      ? 'Тақырып бойынша тест тапсырып, Сократ наставнигінен көмек алыңыз'
                      : lang === 'RU'
                      ? 'Решайте тесты по темам и вызывайте Сократа при необходимости'
                      : 'Solve topic quizzes and ask Socratic Mentor for guidance'}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => onNavigateTab('courses')}
                className="text-[11px] text-primer-accent-fg font-semibold hover:underline"
              >
                {lang === 'KZ' ? 'Барлық курстар ➔' : lang === 'RU' ? 'Все предметы ➔' : 'All Courses ➔'}
              </Button>
            </div>

            {/* Courses Grid or Empty State */}
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-primer-border-muted/70 bg-primer-canvas-inset p-3.5 space-y-3 flex flex-col justify-between hover:border-primer-accent-emphasis/50 transition-all shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <Badge variant="accent" className="font-mono text-[10px] py-0">
                          {course.subject}
                        </Badge>
                        <span className="text-[10px] text-primer-fg-muted font-semibold">
                          {course.grade}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default leading-snug line-clamp-1">
                        {course.title}
                      </h3>

                      {course.next_topic && (
                        <p className="text-[11px] text-primer-fg-muted line-clamp-2">
                          <strong>{lang === 'KZ' ? 'Келесі тақырып:' : lang === 'RU' ? 'Тема:' : 'Topic:'}</strong> {course.next_topic}
                        </p>
                      )}
                    </div>

                    {/* Action Button: Solve Tests */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartPractice(course.title, course.next_topic)}
                      className="w-full font-bold text-xs gap-1.5 shadow-sm"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'KZ' ? 'Тест тапсыру' : lang === 'RU' ? 'Пройти тест' : 'Solve Test'}</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-primer-border-muted rounded-xl bg-primer-canvas-inset/30 space-y-2.5">
                <BookOpen className="w-6 h-6 text-primer-fg-muted mx-auto" />
                <p className="text-xs text-primer-fg-muted font-medium">
                  {lang === 'KZ'
                    ? 'Сіз әлі ешқандай пәнге жазылмадыңыз.'
                    : lang === 'RU'
                    ? 'Вы еще не записаны ни на один предмет.'
                    : 'You are not enrolled in any courses yet.'}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigateTab('courses')}
                  className="text-xs font-bold gap-1.5"
                >
                  <span>{lang === 'KZ' ? 'Курстар каталогына өту' : lang === 'RU' ? 'Перейти в каталог курсов' : 'Browse Courses'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Real Passport, Heatmap & Leaderboard (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          <StudentPassportCard
            user={{
              ...(user || {
                id: 'guest',
                email: 'student@school.kz',
                full_name: 'Оқушы',
                role: 'student',
                grade: '10-сынып',
                school: 'NIS IB Astana',
                language: 'KZ',
                theme: 'dark',
                overallElo: progressState.elo,
                streakDays: progressState.streakDays,
                eloRank: {
                  level: progressState.elo >= 1600 ? 'Самғау' : progressState.elo >= 1400 ? 'Қыран' : progressState.elo >= 1200 ? 'Тұғыр' : 'Өскін',
                  symbol: progressState.elo >= 1600 ? '⭐' : progressState.elo >= 1400 ? '🦅' : progressState.elo >= 1200 ? '🌿' : '🌱',
                  minElo: 1000,
                  maxElo: 1600,
                },
              }),
              overallElo: progressState.elo,
              streakDays: progressState.streakDays,
            }}
            onViewFullPassport={() => onNavigateTab('profile')}
          />

          {/* 2. GitHub-Style Learning Contributions Heatmap */}
          <ActivityHeatmap
            data={heatmapMatrix}
            currentStreak={progressState.streakDays}
            longestStreak={progressState.longestStreak}
          />

          {/* 3. Dynamic Course-Scoped Leaderboard Card */}
          <ClassLeaderboardCard
            leaderboard={leaderboard}
            enrolledCourses={courses}
            activeCourseId={selectedLeaderboardCourseId}
            onSelectCourse={async (courseId) => {
              setSelectedLeaderboardCourseId(courseId);
              const lboard = await studentService.getLeaderboard(courseId);
              setLeaderboard(lboard || []);
            }}
            onOpenCatalog={() => onNavigateTab('courses')}
            currentUserId={user?.id}
          />

        </div>
      </div>

      {/* Real Test Practice Modal with on-demand Socratic Mentor */}
      <TestPracticeModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        subjectName={selectedSubject}
        topicTitle={selectedTopic}
      />

      {/* Add Task Modal */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Бүгінге жаңа мақсат қосу' : lang === 'RU' ? 'Новая цель на сегодня' : 'Add Goal for Today'}
            </DialogTitle>
          </div>

          <form onSubmit={handleCreateTask} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Тапсырма атауы' : lang === 'RU' ? 'Название задачи' : 'Task Title'}
              </label>
              <Input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={lang === 'KZ' ? 'Мысалы: Физика 3 есеп шығару' : lang === 'RU' ? 'Например: Решить 3 задачи по физике' : 'e.g. Solve 3 physics problems'}
                required
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Санат' : lang === 'RU' ? 'Категория' : 'Category'}
              </label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-primer-canvas-default border border-primer-border-default text-primer-fg-default"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'KZ' ? c.nameKZ : lang === 'RU' ? c.nameRU : c.nameEN}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddTaskModalOpen(false)}
              >
                {lang === 'KZ' ? 'Бас тарту' : lang === 'RU' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold"
              >
                {lang === 'KZ' ? 'Қосу' : lang === 'RU' ? 'Добавить' : 'Add Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentHomeScreen;
