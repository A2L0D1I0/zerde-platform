import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Search,
  CheckCircle2,
  PlayCircle,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  BookMarked,
  Clock,
  Send,
  Check,
  School,
  FileText,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { courseService, MultilingualCourse } from '@/services/courseService';
import { userProgressService, UserProgressState } from '@/services/userProgressService';
import { TestPracticeModal } from '@/components/student/TestPracticeModal';

export interface CourseCatalogScreenProps {
  onStartCourseTopic?: (topicTitle: string) => void;
}

export const CourseCatalogScreen: React.FC<CourseCatalogScreenProps> = ({
  onStartCourseTopic,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [courses, setCourses] = useState<MultilingualCourse[]>([]);
  const [progressState, setProgressState] = useState<UserProgressState>(userProgressService.getState());
  const [activeFilter, setActiveFilter] = useState<'recommendations' | 'enrolled' | 'applications' | 'all'>('recommendations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Application Modal for Elective Courses
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyingCourse, setApplyingCourse] = useState<MultilingualCourse | null>(null);
  const [applicationReason, setApplicationReason] = useState('');

  // Unenroll Confirmation Modal for Elective Courses
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [unenrollingCourse, setUnenrollingCourse] = useState<MultilingualCourse | null>(null);

  // Test Solver Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [currentTestSubject, setCurrentTestSubject] = useState('');
  const [currentTestTopic, setCurrentTestTopic] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const all = await courseService.getAllCourses({
        search: searchQuery || undefined,
      });
      setCourses(all);
    } catch (e) {
      console.warn('Failed to load courses', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = userProgressService.subscribe((state) => {
      setProgressState(state);
    });
    return () => unsub();
  }, [searchQuery]);

  const userGrade = user?.grade || '10-сынып';



  const handleOpenApplyModal = (course: MultilingualCourse) => {
    setApplyingCourse(course);
    setApplicationReason('');
    setIsApplyModalOpen(true);
  };

  const handleConfirmApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingCourse) return;

    courseService.apply(applyingCourse.id);
    setIsApplyModalOpen(false);

    showToast({
      type: 'success',
      title: lang === 'KZ' ? 'Өтініш кураторға жіберілді! 📋' : lang === 'RU' ? 'Заявка отправлена куратору! 📋' : 'Application submitted! 📋',
      message: `${applyingCourse.course_code}: ${lang === 'KZ' ? applyingCourse.title_kz : lang === 'RU' ? applyingCourse.title_ru : applyingCourse.title_en}`,
    });
  };

  const handleCancelApplication = (course: MultilingualCourse) => {
    courseService.cancelApplication(course.id);
    showToast({
      type: 'attention',
      title: lang === 'KZ' ? 'Өтініш қайтарылды' : lang === 'RU' ? 'Заявка отозвана' : 'Application withdrawn',
      message: course.course_code,
    });
  };

  const handleOpenUnenrollModal = (course: MultilingualCourse) => {
    setUnenrollingCourse(course);
    setIsUnenrollModalOpen(true);
  };

  const handleConfirmUnenroll = () => {
    if (!unenrollingCourse) return;
    courseService.unenroll(unenrollingCourse.id);
    setIsUnenrollModalOpen(false);

    showToast({
      type: 'attention',
      title: lang === 'KZ' ? 'Спецкурстан шығарылды' : lang === 'RU' ? 'Отчислен со спецкурса' : 'Unenrolled from elective',
      message: unenrollingCourse.course_code,
    });
  };

  const handleOpenPractice = (course: MultilingualCourse) => {
    const title = (lang === 'KZ' ? course.title_kz : lang === 'RU' ? course.title_ru : course.title_en) || course.title || 'Пән';
    const topic = (lang === 'KZ' ? course.next_topic_kz : lang === 'RU' ? course.next_topic_ru : course.next_topic_en) || 'Негізгі тақырып';
    setCurrentTestSubject(title);
    setCurrentTestTopic(topic);
    setIsTestModalOpen(true);
  };

  const enrolledCourseIds = progressState.enrolledCourseIds || [];
  const appliedCourseIds = progressState.appliedCourseIds || [];

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    if (activeFilter === 'recommendations') {
      const rec = c.recommended_grade || c.grade || '';
      const isGradeMatch = userGrade.includes('10') ? rec.includes('10') : rec === userGrade;
      return isGradeMatch || c.grade === userGrade;
    }
    if (activeFilter === 'enrolled') {
      return enrolledCourseIds.includes(c.id);
    }
    if (activeFilter === 'applications') {
      return appliedCourseIds.includes(c.id);
    }
    return true;
  });

  const recommendedCount = courses.filter((c) => {
    const rec = c.recommended_grade || c.grade || '';
    return userGrade.includes('10') ? rec.includes('10') : rec === userGrade;
  }).length || 0;

  // UI Strings
  const tStr = {
    headerTitle: lang === 'KZ' ? 'Академиялық оқу бағдарламасы' : lang === 'RU' ? 'Учебная программа и спецкурсы' : 'Academic Curriculum & Courses',
    headerSub:
      lang === 'KZ'
        ? `${userGrade} бекітілген мемлекеттік стандарты және олимпиадалық спецкурстар`
        : lang === 'RU'
        ? `Официальная программа для ${userGrade} и элективные спецкурсы`
        : `Official curriculum subjects for ${userGrade} and elective courses`,
    searchPh:
      lang === 'KZ'
        ? 'Курс коды (мысалы: ZR-7K9M2) немесе атауы бойынша іздеу...'
        : lang === 'RU'
        ? 'Поиск по коду курса (например: ZR-7K9M2) или названию...'
        : 'Search by course code (e.g. ZR-7K9M2) or title...',
    recommendationsTab: lang === 'KZ' ? `Ұсыныстар (${recommendedCount})` : lang === 'RU' ? `Рекомендации (${recommendedCount})` : `Recommendations (${recommendedCount})`,
    enrolledTab: lang === 'KZ' ? `Жазылғандар (${enrolledCourseIds.length})` : lang === 'RU' ? `Записанные (${enrolledCourseIds.length})` : `Enrolled (${enrolledCourseIds.length})`,
    applicationsTab: lang === 'KZ' ? `Өтініштер (${appliedCourseIds.length})` : lang === 'RU' ? `Заявки (${appliedCourseIds.length})` : `Applications (${appliedCourseIds.length})`,
    allTab: lang === 'KZ' ? `Барлығы (${courses.length})` : lang === 'RU' ? `Все (${courses.length})` : `All (${courses.length})`,
    topicLabel: lang === 'KZ' ? 'Ағымдағы тақырып:' : lang === 'RU' ? 'Текущая тема:' : 'Current Topic:',
    solveTestBtn: lang === 'KZ' ? 'Тест тапсыру ➔' : lang === 'RU' ? 'Пройти тест ➔' : 'Solve Test ➔',
    applyBtn: lang === 'KZ' ? 'Өтініш беру' : lang === 'RU' ? 'Подать заявку' : 'Apply for Course',
    appliedBadge: lang === 'KZ' ? 'Өтініш қаралуда' : lang === 'RU' ? 'Заявка на рассмотрении' : 'Pending Approval',
    coreBadge: lang === 'KZ' ? 'Міндетті пән' : lang === 'RU' ? 'Обязательный' : 'Core Subject',
    electiveBadge: lang === 'KZ' ? 'Спецкурс' : lang === 'RU' ? 'Спецкурс' : 'Elective',
    unenrollBtn: lang === 'KZ' ? 'Курстан шығу' : lang === 'RU' ? 'Отчисление' : 'Drop Course',
    cancelAppBtn: lang === 'KZ' ? 'Өтінішті қайтару' : lang === 'RU' ? 'Отозвать' : 'Withdraw',
    noCourses: lang === 'KZ' ? 'Курстар табылмады' : lang === 'RU' ? 'Курсы не найдены' : 'No courses found',
    noCoursesSub:
      lang === 'KZ'
        ? 'Бұл санатта әзірше пәндер жоқ. Басқа санатты таңдаңыз немесе іздеуді тексеріңіз.'
        : lang === 'RU'
        ? 'В этой категории пока нет курсов. Выберите другую вкладку или проверьте код поиска.'
        : 'No courses found in this category. Select another tab or check your search query.',
  };

  const filterTabs = [
    { key: 'recommendations', label: tStr.recommendationsTab, icon: Sparkles },
    { key: 'enrolled', label: tStr.enrolledTab, icon: CheckCircle2 },
    { key: 'applications', label: tStr.applicationsTab, icon: Clock },
    { key: 'all', label: tStr.allTab, icon: BookOpen },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 animate-in fade-in duration-150">
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-primer-border-default bg-primer-canvas-subtle p-4 sm:p-6 shadow-primer-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-primer-fg-default">
                {tStr.headerTitle}
              </h1>
              <p className="text-xs text-primer-fg-muted mt-0.5">
                {tStr.headerSub}
              </p>
            </div>
          </div>

          <Badge variant="accent" className="font-mono text-xs px-3 py-1 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5" />
            <span>{userGrade} • {user?.school || 'NIS IB Astana'}</span>
          </Badge>
        </div>

        {/* Search Bar with Unique Code Support */}
        <div className="mt-4 pt-3 border-t border-primer-border-muted/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-primer-fg-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tStr.searchPh}
              className="pl-9 text-xs h-9 font-mono"
            />
          </div>

          {/* Micro-block Filter Subtabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primer-accent-emphasis text-white shadow-xs'
                      : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const isApplied = appliedCourseIds.includes(course.id);
            const isCore = course.course_type === 'core';

            const title = lang === 'KZ' ? course.title_kz : lang === 'RU' ? course.title_ru : course.title_en;
            const desc = lang === 'KZ' ? course.desc_kz : lang === 'RU' ? course.desc_ru : course.desc_en;
            const subj = lang === 'KZ' ? course.subject_kz : lang === 'RU' ? course.subject_ru : course.subject_en;
            const nextTop = (lang === 'KZ' ? course.next_topic_kz : lang === 'RU' ? course.next_topic_ru : course.next_topic_en) || course.next_topic;

            return (
              <div
                key={course.id}
                className={`rounded-xl border p-4 space-y-3.5 flex flex-col justify-between transition-all ${
                  isCore
                    ? 'border-primer-accent-emphasis/50 bg-primer-canvas-subtle shadow-primer-xs'
                    : isEnrolled
                    ? 'border-primer-success-muted/60 bg-primer-success-subtle/10'
                    : isApplied
                    ? 'border-primer-attention-muted/60 bg-primer-attention-subtle/10'
                    : 'border-primer-border-default bg-primer-canvas-inset/60 hover:border-primer-border-default hover:bg-primer-canvas-subtle'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* Unique Deterministic Course Code Badge */}
                      <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/60 tracking-wider">
                        {course.course_code}
                      </span>

                      <Badge
                        variant={isCore ? 'accent' : 'secondary'}
                        className="font-mono text-[10px] py-0"
                      >
                        {isCore ? tStr.coreBadge : tStr.electiveBadge}
                      </Badge>
                    </div>

                    <span className="text-[11px] text-primer-fg-muted font-bold">
                      {course.grade}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-primer-fg-default">
                    {title}
                  </h3>

                  <p className="text-xs text-primer-fg-muted line-clamp-2 leading-relaxed">
                    {desc}
                  </p>

                  {nextTop && (
                    <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted/70 text-xs">
                      <span className="text-primer-fg-muted font-medium block text-[10px]">
                        {tStr.topicLabel}
                      </span>
                      <span className="font-semibold text-primer-fg-default mt-0.5 block">
                        {nextTop}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions (Serious Academic Rules) */}
                <div className="pt-2.5 border-t border-primer-border-muted/60 flex items-center justify-between gap-2">
                  {isCore ? (
                    // Core Subject: Mandatory & Non-Droppable
                    <div className="w-full flex items-center justify-between gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenPractice(course)}
                        className="flex-1 font-bold text-xs gap-1.5 shadow-sm"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{tStr.solveTestBtn}</span>
                      </Button>

                      <span className="text-[10px] font-bold text-primer-fg-muted px-2 py-1 bg-primer-canvas-inset rounded-md border border-primer-border-muted flex items-center gap-1">
                        <Lock className="w-3 h-3 text-primer-fg-subtle" />
                        <span>{lang === 'KZ' ? 'Бекітілген' : lang === 'RU' ? 'Закреплен' : 'Mandatory'}</span>
                      </span>
                    </div>
                  ) : isEnrolled ? (
                    // Enrolled Elective Course
                    <div className="w-full flex items-center justify-between gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenPractice(course)}
                        className="flex-1 font-bold text-xs gap-1.5 shadow-sm"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{tStr.solveTestBtn}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenUnenrollModal(course)}
                        className="text-primer-fg-muted hover:text-primer-danger-fg text-xs"
                      >
                        {tStr.unenrollBtn}
                      </Button>
                    </div>
                  ) : isApplied ? (
                    // Application Pending Review
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-primer-attention-fg flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{tStr.appliedBadge}</span>
                      </span>

                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleCancelApplication(course)}
                        className="text-xs font-medium"
                      >
                        {tStr.cancelAppBtn}
                      </Button>
                    </div>
                  ) : (
                    // Elective Course: Formal Application Submission
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenApplyModal(course)}
                      className="w-full font-bold text-xs gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{tStr.applyBtn}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-primer-border-muted rounded-2xl bg-primer-canvas-subtle space-y-3">
          <BookMarked className="w-8 h-8 text-primer-fg-muted mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-primer-fg-default">{tStr.noCourses}</h4>
            <p className="text-xs text-primer-fg-muted max-w-sm mx-auto">
              {tStr.noCoursesSub}
            </p>
          </div>
          {activeFilter !== 'all' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="text-xs font-bold"
            >
              {tStr.allTab}
            </Button>
          )}
        </div>
      )}

      {/* Formal Academic Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default flex items-center gap-2">
              <FileText className="w-4 h-4 text-primer-accent-fg" />
              <span>{lang === 'KZ' ? 'Спецкурсқа ресми өтініш беру' : lang === 'RU' ? 'Подача официальной заявки на спецкурс' : 'Elective Course Application'}</span>
            </DialogTitle>
            <DialogDescription className="text-[11px] text-primer-fg-muted mt-0.5 font-mono">
              {applyingCourse?.course_code} • {applyingCourse?.subject}
            </DialogDescription>
          </div>

          <form onSubmit={handleConfirmApplication} className="p-4 space-y-3.5">
            <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-xs space-y-1.5">
              <div className="font-bold text-primer-fg-default">
                {lang === 'KZ' ? applyingCourse?.title_kz : lang === 'RU' ? applyingCourse?.title_ru : applyingCourse?.title_en}
              </div>
              <div className="text-primer-fg-muted text-[11px]">
                {lang === 'KZ' ? 'Өтініш беруші:' : lang === 'RU' ? 'Заявитель:' : 'Applicant:'}{' '}
                <strong className="text-primer-fg-default">{user?.full_name} ({userGrade})</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Қатысу мақсаты мен мотивация (міндетті)' : lang === 'RU' ? 'Цель участия и мотивация (обязательно)' : 'Purpose of Study & Motivation'}
              </label>
              <textarea
                value={applicationReason}
                onChange={(e) => setApplicationReason(e.target.value)}
                placeholder={
                  lang === 'KZ'
                    ? 'Мысалы: Республикалық олимпиадаға дайындық және пәнді тереңдетіп оқу...'
                    : lang === 'RU'
                    ? 'Например: Подготовка к олимпиадам и углубленное изучение тем...'
                    : 'E.g. Olympiad preparation and advanced topic research...'
                }
                required
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg bg-primer-canvas-default border border-primer-border-default text-primer-fg-default focus:ring-1 focus:ring-primer-accent-emphasis"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsApplyModalOpen(false)}
              >
                {lang === 'KZ' ? 'Бас тарту' : lang === 'RU' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'KZ' ? 'Өтінішті жіберу' : lang === 'RU' ? 'Отправить заявку' : 'Submit Application'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formal Unenroll Confirmation Modal */}
      <Dialog open={isUnenrollModalOpen} onOpenChange={setIsUnenrollModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="px-4 py-3 border-b border-primer-border-default bg-primer-danger-subtle/20">
            <DialogTitle className="text-sm font-bold text-primer-danger-fg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{lang === 'KZ' ? 'Спецкурстан шығуды растау' : lang === 'RU' ? 'Подтверждение отчисления со спецкурса' : 'Confirm Course Withdrawal'}</span>
            </DialogTitle>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <p className="text-primer-fg-default leading-relaxed">
              {lang === 'KZ'
                ? `Сіз шынымен «${unenrollingCourse?.title_kz}» спецкурсынан шыққыңыз келе ме? Жиналған рейтинг пен орындалған тапсырмалар архивтенеді.`
                : lang === 'RU'
                ? `Вы действительно хотите отчислиться со спецкурса «${unenrollingCourse?.title_ru}»? Прогресс и результаты будут архивированы.`
                : `Are you sure you want to withdraw from «${unenrollingCourse?.title_en}»? Your current progress will be archived.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsUnenrollModalOpen(false)}
              >
                {lang === 'KZ' ? 'Қалу' : lang === 'RU' ? 'Остаться на курсе' : 'Stay Enrolled'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmUnenroll}
                className="font-bold"
              >
                {lang === 'KZ' ? 'Шығуды растау' : lang === 'RU' ? 'Подтвердить отчисление' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Practice Test Modal with Socratic Mentor */}
      <TestPracticeModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        subjectName={currentTestSubject}
        topicTitle={currentTestTopic}
      />
    </div>
  );
};

export default CourseCatalogScreen;
