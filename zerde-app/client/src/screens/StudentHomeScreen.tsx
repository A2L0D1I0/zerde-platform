import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { SubjectFocus, Topic, Course, SM2MemoryCard, StudyDay } from '@/types';
import { studentService, mockTopicsList } from '@/services/studentService';
import { courseService } from '@/services/courseService';

// Component imports
import { WeekdayStudyCarousel } from '@/components/student/WeekdayStudyCarousel';
import { PinnedSubjectCard } from '@/components/student/PinnedSubjectCard';
import { QuarterTopicsList } from '@/components/student/QuarterTopicsList';
import { SpacedRepetitionCard } from '@/components/student/SpacedRepetitionCard';
import { ActivityHeatmap } from '@/components/student/ActivityHeatmap';
import { StudentPassportCard } from '@/components/student/StudentPassportCard';
import { ClassLeaderboardCard } from '@/components/student/ClassLeaderboardCard';
import { SM2ReviewQueueCard } from '@/components/student/SM2ReviewQueueCard';
import { ActiveTrainerBlock } from '@/components/student/ActiveTrainerBlock';
import { QuarterTopicsTable } from '@/components/student/QuarterTopicsTable';
import { SocraticTrainerModal } from '@/components/student/SocraticTrainerModal';

// UI imports
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Flame,
  Zap,
  Target,
  BookOpen,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Layers,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface StudentHomeScreenProps {
  onNavigateTab: (tab: 'home' | 'courses' | 'trainer' | 'progress' | 'roadmap') => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const { t, getLocalized } = useLanguage();
  const { showToast } = useToast();


  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pinnedCourses, setPinnedCourses] = useState<Course[]>([]);
  const [sm2Cards, setSm2Cards] = useState<SM2MemoryCard[]>([]);
  const [studyDays, setStudyDays] = useState<StudyDay[]>([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Socratic Trainer Modal State
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [activeTopicTitle, setActiveTopicTitle] = useState('Квадраттық теңсіздіктер (Интервалдар әдісі)');

  const mockPinnedSubject: SubjectFocus = {
    id: 'subj_math',
    title: 'Алгебра',
    titleKZ: 'Алгебра (Тереңдетілген курс)',
    titleRU: 'Алгебра (Углубленный курс)',
    titleEN: 'Algebra (Advanced Elective)',
    icon: '📐',
    subjectElo: 1435,
    predictedScore: '38/40',
    focusTopic: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
    focusTopicKZ: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
    focusTopicRU: 'Квадратные неравенства (Метод интервалов)',
    focusTopicEN: 'Quadratic Inequalities (Interval Method)',
    focusReason: '💡 Осы 1 ережені бекітсек емтихан болжамыңыз өседі.',
    focusReasonKZ: '💡 Кеше таңбаларды анықтаудан қателестіңіз. Осы 1 ережені бекітсек емтихан болжамыңыз өседі.',
    focusReasonRU: '💡 Вчера возникло затруднение со знаками интервалов. Закрепив это правило, ваш прогноз вырастет.',
    focusReasonEN: '💡 Yesterday you had friction with sign transitions. Fixing this will boost your exam forecast.',
    durationMinutes: 3,
    ctaLabel: '3 мин',
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [dash, heatmap, lboard, cards, courses] = await Promise.all([
          studentService.getDashboard(user?.id),
          studentService.getHeatmap(user?.id),
          studentService.getLeaderboard(),
          studentService.getSM2Cards(),
          courseService.getAllCourses(),
        ]);

        if (dash?.recent_topics) {
          setTopics(dash.recent_topics);
        } else {
          setTopics(mockTopicsList);
        }

        setHeatmapMatrix(heatmap?.matrix || []);
        setLeaderboard(lboard || []);
        setSm2Cards(cards || []);
        setStudyDays(studentService.getStudyDays());
        setPinnedCourses(courses.slice(0, 2));
      } catch (err) {
        console.warn('Dashboard data loaded with fallback', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleStartTrainer = (topicTitle?: string) => {
    if (topicTitle) setActiveTopicTitle(topicTitle);
    setIsTrainerModalOpen(true);
  };

  const handleSelectTopic = (top: Topic) => {
    setActiveTopicTitle(top.title);
    setIsTrainerModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 space-y-4">
      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (Visible on < md screens: PWA / Mobile Web Optimized)     */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3.5 animate-in fade-in duration-150">
        {/* Weekday Study Days Horizontal Swipe */}
        <WeekdayStudyCarousel
          days={studyDays}
          onSelectDay={(day) => {
            showToast({
              type: 'info',
              title: `${day.dayOfWeek}, ${day.dayNumber}`,
              message: day.isCompleted
                ? `${t('student.streak_count')}: ${day.tasksCount}`
                : day.isToday
                ? t('student.start_focus')
                : t('student.exam_countdown'),
            });
          }}
        />

        {/* Pinned Focus Card (3-min session + Big Green Action Button) */}
        <PinnedSubjectCard
          subject={mockPinnedSubject}
          onStartFocus={() => handleStartTrainer(mockPinnedSubject.focusTopic)}
        />

        {/* Quarter Topics Lifecycle (GitHub Issues Style) */}
        <QuarterTopicsList
          topics={topics}
          onSelectTopic={handleSelectTopic}
        />

        {/* Spaced Repetition Callout Card (> [!NOTE]) */}
        <SpacedRepetitionCard
          item={{
            available: true,
            cardsCount: sm2Cards.filter((c) => c.isDueToday).length || 3,
            timeEstimate: `1 ${t('common.minutes')}`,
            title: t('student.spaced_repetition_title'),
            description: t('student.spaced_repetition_desc'),
          }}
          onReview={() => handleStartTrainer('Интервалды қайталау')}
        />

        {/* Mobile Quick Roadmap Banner */}
        <div
          onClick={() => onNavigateTab('roadmap')}
          className="rounded-xl border border-primer-border-default bg-gradient-to-r from-primer-canvas-subtle to-primer-accent-subtle/20 p-3.5 flex items-center justify-between cursor-pointer active:scale-98 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primer-accent-emphasis text-white shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-primer-fg-default">
                {t('student.exam_countdown')}
              </div>
              <div className="text-[10px] text-primer-fg-muted">
                {t('student.predicted_grade_label')}: <strong className="text-primer-success-fg">118/140</strong>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-primer-fg-muted" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (Visible on >= md screens: 2 Columns 65% / 35%)            */}
      {/* ========================================================================= */}
      <div className="hidden md:grid grid-cols-12 gap-5 items-start animate-in fade-in duration-150">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN (65% - 8 of 12 cols): Repos Grid, Trainer, Topics, Roadmap */}
        {/* ----------------------------------------------------------------------- */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Weekday Study Carousel (Desktop Header Component) */}
          <WeekdayStudyCarousel days={studyDays} />

          {/* A. Pinned Courses Grid (Pinned Repos Style) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primer-accent-fg" />
                <h3 className="text-sm font-bold text-primer-fg-default">
                  {t('student.pinned_subjects')}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onNavigateTab('courses')}
                className="text-xs text-primer-accent-fg hover:underline gap-1"
              >
                <span>{t('student.all_courses')}</span>
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {pinnedCourses.length === 0 ? (
                <div className="col-span-2 rounded-xl border border-dashed border-primer-border-default bg-primer-canvas-subtle p-6 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primer-accent-subtle text-primer-accent-fg flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-primer-fg-default">
                    {t('common.no_data')}
                  </h4>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateTab('courses')}
                    className="gap-1 text-xs"
                  >
                    <span>{t('courses.catalog_title')}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                pinnedCourses.map((course) => {
                  const title = getLocalized(course, 'title', course.title);
                  const desc = getLocalized(course, 'description', course.description || '');
                  const nextTopic = getLocalized(course, 'next_topic', course.next_topic || '');

                  return (
                    <div
                      key={course.id}
                      onClick={() => handleStartTrainer(nextTopic || title)}
                      className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 hover:border-primer-accent-emphasis/70 transition cursor-pointer space-y-2.5 group shadow-primer-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">
                            {course.subject?.includes('Мат') || course.subject?.includes('Math') ? '📐' : course.subject?.includes('Физ') || course.subject?.includes('Phys') ? '⚡' : '📚'}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-primer-fg-default group-hover:text-primer-accent-fg transition truncate">
                              {title}
                            </h4>
                            <div className="text-[10px] text-primer-fg-muted">
                              {course.teacher_name} {course.grade ? `• ${course.grade}` : ''}
                            </div>
                          </div>
                        </div>
                        <Badge variant="done" className="text-[10px] py-0 font-mono shrink-0">
                          {course.progress_percentage || 78}%
                        </Badge>
                      </div>

                      <p className="text-[11px] text-primer-fg-muted line-clamp-2 leading-relaxed">
                        {desc}
                      </p>

                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-primer-canvas-inset rounded-full h-1.5 overflow-hidden border border-primer-border-muted">
                          <div
                            className="bg-primer-success-emphasis h-full rounded-full transition-all duration-500"
                            style={{ width: `${course.progress_percentage || 78}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-primer-fg-subtle pt-0.5">
                          <span>{t('courses.next_topic_title')}: <strong className="text-primer-fg-default">{nextTopic}</strong></span>
                          <span className="flex items-center gap-1 font-mono">
                            <Users className="w-3 h-3" />
                            {course.students_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>


          {/* B. Active Simulator / Trainer Block (Desmos & Active Canvas) */}
          <ActiveTrainerBlock
            onStartTrainer={() => handleStartTrainer(mockPinnedSubject.focusTopic)}
            topicTitle={mockPinnedSubject.focusTopic}
            subjectTitle={mockPinnedSubject.title}
          />

          {/* C. Quarter Topics Table with Filters */}
          <QuarterTopicsTable
            topics={topics}
            onSelectTopic={handleSelectTopic}
          />

          {/* D. Roadmap Preview Card */}
          <div className="rounded-xl border border-primer-border-default bg-gradient-to-r from-primer-canvas-subtle via-primer-canvas-subtle to-primer-accent-subtle/20 p-4 shadow-primer-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primer-accent-emphasis text-white shadow-xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                    {t('student.roadmap_tab')}
                  </h3>
                  <p className="text-[10px] text-primer-fg-muted">
                    {t('student.score_trajectory_desc')}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => onNavigateTab('roadmap')}
                variant="secondary"
                size="sm"
                className="gap-1 font-bold text-xs"
              >
                <span>{t('student.full_roadmap_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Step Chain Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-done-muted/40">
                <div className="flex items-center gap-1.5 text-primer-done-fg font-bold text-[11px] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. {t('student.linear_equations')}</span>
                </div>
                <div className="text-[10px] text-primer-fg-muted">100% {t('status.mastered')}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-primer-success-subtle/30 border border-primer-success-emphasis/50 ring-1 ring-primer-success-emphasis/30">
                <div className="flex items-center gap-1.5 text-primer-success-fg font-bold text-[11px] mb-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>2. {t('student.quadratic_inequalities')}</span>
                </div>
                <div className="text-[10px] text-primer-fg-default">● 68% {t('status.in_progress')}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted/50 opacity-75">
                <div className="flex items-center gap-1.5 text-primer-fg-muted font-bold text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. {t('student.rational_equations')}</span>
                </div>
                <div className="text-[10px] text-primer-fg-subtle">🔒 {t('status.queued')}</div>
              </div>
            </div>
          </div>


        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT SIDEBAR (35% - 4 of 12 cols): Passport, Heatmap, SM-2, Leaderboard*/}
        {/* ----------------------------------------------------------------------- */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* 1. Student Passport Summary Card */}
          <StudentPassportCard
            user={user}
            overallMastery={user?.overallElo ? Math.min(100, Math.round((user.overallElo / 2000) * 100)) : 0}
            totalMastered={user?.streakDays ? Math.min(24, Math.floor(user.streakDays * 1.5)) : 0}
            totalTopics={24}
          />

          {/* 2. 365-Day Activity Heatmap */}
          <ActivityHeatmap
            currentStreak={user?.streakDays || 0}
            longestStreak={user?.streakDays || 0}
          />

          {/* 3. SM-2 Spaced Repetition Memory Cards Queue */}
          <SM2ReviewQueueCard
            cards={sm2Cards}
            onReviewCard={(card) => handleStartTrainer(card.topicTitle)}
          />


          {/* 4. Class ELO Leaderboard */}
          <ClassLeaderboardCard
            leaderboard={leaderboard}
            currentUserId={user?.id}
          />

        </div>
      </div>

      {/* Socratic Drill Modal */}
      <SocraticTrainerModal
        isOpen={isTrainerModalOpen}
        onClose={() => setIsTrainerModalOpen(false)}
        topicTitle={activeTopicTitle}
      />
    </div>
  );
};
