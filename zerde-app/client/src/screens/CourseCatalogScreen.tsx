import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Course, CourseApplicationData } from '@/types';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CourseApplicationModal } from '@/components/student/CourseApplicationModal';
import {
  BookOpen,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  GraduationCap,
  X,
  AlertCircle,
  HelpCircle,
  QrCode,
  Check,
} from 'lucide-react';

interface CourseCatalogScreenProps {
  onStartCourseTopic?: (topicTitle: string) => void;
}

export const CourseCatalogScreen: React.FC<CourseCatalogScreenProps> = ({
  onStartCourseTopic,
}) => {
  const { t, language, getLocalized } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Single Unified Search Input (Code or Name)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedCourse, setSearchedCourse] = useState<Course | null>(null);
  const [isSearchingCode, setIsSearchingCode] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Application Modal
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedCourseForApp, setSelectedCourseForApp] = useState<Course | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Course Details Preview Modal
  const [selectedCoursePreview, setSelectedCoursePreview] = useState<Course | null>(null);

  // Action loaders
  const [cancelingCourseId, setCancelingCourseId] = useState<string | null>(null);
  const [dismissingCourseId, setDismissingCourseId] = useState<string | null>(null);

  const loadMyCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getMyCourses();
      setMyCourses(data);
    } catch (e) {
      console.warn('Failed to load my courses', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyCourses();
  }, []);

  // Search logic on query change
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchedCourse(null);
      setSearchNotFound(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCode(true);
      setSearchNotFound(false);
      try {
        const found = await courseService.searchCourseByCodeOrTitle(trimmed);
        if (found) {
          // Check if already in myCourses with current status
          const existing = myCourses.find((c) => c.id === found.id);
          setSearchedCourse(existing ? { ...found, enrollment_status: existing.enrollment_status } : found);
          setSearchNotFound(false);
        } else {
          setSearchedCourse(null);
          setSearchNotFound(true);
        }
      } catch (e) {
        setSearchedCourse(null);
        setSearchNotFound(true);
      } finally {
        setIsSearchingCode(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, myCourses]);

  const handleOpenApplication = (course: Course) => {
    setSelectedCourseForApp(course);
    setIsAppModalOpen(true);
  };

  const handleApplicationSubmit = async (courseId: string, appData: CourseApplicationData) => {
    setIsSubmittingApp(true);
    try {
      const res = await courseService.applyToCourse(courseId, appData);
      showToast({
        type: 'success',
        title: language === 'KZ' ? 'Өтініш жіберілді! 📋' : language === 'RU' ? 'Заявка отправлена! 📋' : 'Application Submitted! 📋',
        message: res.message,
      });
      setIsAppModalOpen(false);
      setSelectedCourseForApp(null);
      setSearchQuery('');
      setSearchedCourse(null);
      await loadMyCourses();
    } catch (e: any) {
      showToast({
        type: 'danger',
        title: t('common.error_occurred'),
        message: e?.message || t('common.failed_to_save'),
      });
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleCancelApplication = async (courseId: string, courseTitle: string) => {
    setCancelingCourseId(courseId);
    try {
      const res = await courseService.cancelApplication(courseId);
      showToast({
        type: 'attention',
        title: language === 'KZ' ? 'Өтініш қайтарылды' : language === 'RU' ? 'Заявка отозвана' : 'Application Cancelled',
        message: res.message,
      });
      await loadMyCourses();
    } catch (e: any) {
      showToast({
        type: 'danger',
        title: t('common.error_occurred'),
        message: e?.message || 'Қате орын алды',
      });
    } finally {
      setCancelingCourseId(null);
    }
  };

  const handleDismissRejected = async (courseId: string) => {
    setDismissingCourseId(courseId);
    try {
      await courseService.dismissRejectedCourse(courseId);
      showToast({
        type: 'info',
        title: language === 'KZ' ? 'Тізімнен өшірілді' : language === 'RU' ? 'Удалено из списка' : 'Dismissed from list',
        message: '',
      });
      await loadMyCourses();
    } catch (e) {
      // ignore
    } finally {
      setDismissingCourseId(null);
    }
  };

  // Filter student's existing courses if searching
  const filteredMyCourses = myCourses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = getLocalized(c, 'title', c.title).toLowerCase();
    const subject = getLocalized(c, 'subject', c.subject).toLowerCase();
    const shortCode = (c.short_code || '').toLowerCase();
    return title.includes(q) || subject.includes(q) || shortCode.includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3.5 sm:px-6 animate-in fade-in duration-200">
      {/* 1. Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primer-border-muted pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primer-fg-default flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primer-accent-fg" />
            <span>{language === 'KZ' ? 'Менің пәндерім & Курстарым' : language === 'RU' ? 'Мои предметы и курсы' : 'My Subjects & Courses'}</span>
          </h1>
          <p className="text-xs text-primer-fg-muted mt-1">
            {language === 'KZ'
              ? 'Сіз тіркелген және өтініш жіберген барлық оқу топтары'
              : language === 'RU'
              ? 'Все учебные группы, в которых вы состоите или подали заявку'
              : 'All study groups you are enrolled in or applied to'}
          </p>
        </div>

        {/* Enrolled counter badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
            {language === 'KZ' ? 'Белсенді курстар' : language === 'RU' ? 'Активные курсы' : 'Active Courses'}:{' '}
            <span className="font-bold text-primer-accent-fg ml-1">
              {myCourses.filter((c) => c.enrollment_status === 'enrolled').length}
            </span>
          </Badge>
        </div>
      </div>

      {/* 2. Unified Single Search & Code Entry Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primer-fg-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'KZ'
                ? '6 таңбалы курс кодын енгізіңіз (мысалы, 7X9K2M) немесе өз пәндеріңізден іздеңіз...'
                : language === 'RU'
                ? 'Введите 6-значный код курса (например, 7X9K2M) или ищите по своим курсам...'
                : 'Enter 6-character course code (e.g. 7X9K2M) or search your courses...'
            }
            className="w-full text-xs sm:text-sm pl-10 pr-24 py-2.5 rounded-xl border border-primer-border-default bg-primer-canvas-default text-primer-fg-default shadow-primer-xs placeholder:text-primer-fg-subtle focus:outline-none focus:ring-2 focus:ring-primer-accent-emphasis/30 focus:border-primer-accent-emphasis transition font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchedCourse(null);
                setSearchNotFound(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primer-fg-subtle hover:text-primer-fg-default p-1 rounded hover:bg-primer-canvas-subtle"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Live Found Course Result (if student searched by code or new title) */}
      {searchedCourse && (
        <div className="rounded-xl border-2 border-primer-accent-emphasis/60 bg-primer-accent-subtle/20 p-4 sm:p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primer-accent-fg uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'KZ' ? 'Табылған курс' : language === 'RU' ? 'Найденный курс' : 'Course Found'}
              </span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {getLocalized(searchedCourse, 'subject', searchedCourse.subject)}
              </Badge>
            </div>
            {searchedCourse.short_code && (
              <span className="text-xs font-mono font-bold text-primer-accent-fg bg-primer-canvas-default px-2 py-0.5 rounded border border-primer-border-default">
                #{searchedCourse.short_code}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-primer-fg-default">
              {getLocalized(searchedCourse, 'title', searchedCourse.title)}
            </h3>
            <p className="text-xs text-primer-fg-muted leading-relaxed">
              {getLocalized(searchedCourse, 'description', searchedCourse.description)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-primer-border-muted/60">
            <div className="flex items-center gap-2 text-xs text-primer-fg-subtle">
              <GraduationCap className="w-4 h-4" />
              <span>{searchedCourse.teacher_name}</span>
              {searchedCourse.grade && <span>• {searchedCourse.grade}</span>}
            </div>

            <div>
              {searchedCourse.enrollment_status === 'enrolled' ? (
                <Badge variant="done" className="gap-1 py-1 px-3">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'KZ' ? 'Сіз бұл топта оқисыз' : language === 'RU' ? 'Вы уже в этой группе' : 'Already Enrolled'}</span>
                </Badge>
              ) : searchedCourse.enrollment_status === 'pending_approval' ? (
                <div className="flex items-center gap-2">
                  <Badge variant="attention" className="gap-1 py-1 px-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'KZ' ? 'Өтініш қаралуда' : language === 'RU' ? 'На рассмотрении' : 'Pending Approval'}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelApplication(searchedCourse.id, searchedCourse.title)}
                    className="text-xs text-primer-danger-fg hover:bg-primer-danger-subtle"
                  >
                    {language === 'KZ' ? 'Қайтарып алу' : language === 'RU' ? 'Отозвать' : 'Cancel'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenApplication(searchedCourse)}
                  className="gap-1.5 font-bold shadow-primer-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'KZ' ? 'Өтініш беру (Анкета)' : language === 'RU' ? 'Подать заявку (Анкета)' : 'Apply to Enroll'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3.1 Search Not Found Message */}
      {searchNotFound && searchQuery.trim() && !searchedCourse && (
        <div className="rounded-xl border border-dashed border-primer-border-default bg-primer-canvas-subtle p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-primer-fg-subtle" />
          <h4 className="text-sm font-bold text-primer-fg-default">
            {language === 'KZ' ? 'Бұл код немесе атау бойынша курс табылмады' : language === 'RU' ? 'Курс по данному коду или названию не найден' : 'No course found with this code or title'}
          </h4>
          <p className="text-xs text-primer-fg-muted max-w-md mx-auto">
            {language === 'KZ'
              ? 'Мұғаліміңізден 6 таңбалы курс кодын (мысалы: 7X9K2M) нақтылап, қайта теріп көріңіз.'
              : language === 'RU'
              ? 'Уточните у преподавателя 6-значный код курса (например: 7X9K2M) и повторите попытку.'
              : 'Please check the 6-character course code with your teacher and try again.'}
          </p>
        </div>
      )}

      {/* 4. Student's Interacted Courses Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-primer-fg-default uppercase tracking-wider font-mono">
          {language === 'KZ' ? 'Менің пәндерім мен өтініштерім' : language === 'RU' ? 'Мои предметы и поданные заявки' : 'My Subjects & Applications'}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-xl border border-primer-border-muted bg-primer-canvas-subtle animate-pulse" />
            ))}
          </div>
        ) : filteredMyCourses.length === 0 ? (
          /* Clean Empty State */
          <div className="rounded-2xl border-2 border-dashed border-primer-border-default bg-primer-canvas-subtle/50 p-8 sm:p-12 text-center space-y-3 max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-full bg-primer-accent-subtle text-primer-accent-fg flex items-center justify-center shadow-primer-xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-primer-fg-default">
              {language === 'KZ' ? 'Сізде әлі курстар жоқ' : language === 'RU' ? 'У вас пока нет курсов' : 'You have no courses yet'}
            </h3>
            <p className="text-xs text-primer-fg-muted max-w-md mx-auto leading-relaxed">
              {language === 'KZ'
                ? 'Мұғалім берген 6 таңбалы курс кодын жоғарыдағы іздеу өрісіне жазып, топқа қосылуға өтініш жіберіңіз.'
                : language === 'RU'
                ? 'Введите 6-значный код от преподавателя в поле поиска выше, чтобы найти группу и отправить анкету-заявку.'
                : 'Enter the 6-character code from your instructor in the search box above to find the group and apply.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyCourses.map((course) => {
              const title = getLocalized(course, 'title', course.title);
              const desc = getLocalized(course, 'description', course.description || '');
              const subject = getLocalized(course, 'subject', course.subject);
              const isEnrolled = course.enrollment_status === 'enrolled';
              const isPending = course.enrollment_status === 'pending_approval';
              const isRejected = course.enrollment_status === 'rejected';

              return (
                <Card
                  key={course.id}
                  className={`flex flex-col justify-between transition-all shadow-primer-xs hover:shadow-primer-sm cursor-pointer group ${
                    isRejected
                      ? 'border-primer-danger-emphasis/40 bg-primer-danger-subtle/10'
                      : isPending
                      ? 'border-primer-attention-emphasis/40 bg-primer-attention-subtle/10'
                      : 'hover:border-primer-border-default'
                  }`}
                  onClick={() => setSelectedCoursePreview(course)}
                >
                  <CardHeader className="p-4 pb-2 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {subject}
                      </Badge>

                      {/* Status / Short Code Badges */}
                      <div className="flex items-center gap-1.5">
                        {isEnrolled && (
                          <Badge variant="done" className="text-[10px] py-0 font-bold">
                            🟢 {language === 'KZ' ? 'Қосылған' : language === 'RU' ? 'Обучение активно' : 'Enrolled'}
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="attention" className="text-[10px] py-0 font-bold">
                            ⏳ {language === 'KZ' ? 'Күтілуде' : language === 'RU' ? 'На рассмотрении' : 'Pending'}
                          </Badge>
                        )}
                        {isRejected && (
                          <div className="flex items-center gap-1">
                            <Badge variant="danger" className="text-[10px] py-0 font-bold">
                              ❌ {language === 'KZ' ? 'Қабылданбады' : language === 'RU' ? 'Отклонено' : 'Declined'}
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissRejected(course.id);
                              }}
                              title={language === 'KZ' ? 'Тізімнен өшіру' : language === 'RU' ? 'Удалить из списка' : 'Dismiss'}
                              className="p-1 rounded text-primer-danger-fg hover:bg-primer-danger-subtle/60 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-sm font-bold group-hover:text-primer-accent-fg transition leading-snug line-clamp-2">
                      {title}
                    </CardTitle>

                    <CardDescription className="text-xs line-clamp-2">
                      {desc}
                    </CardDescription>

                    {/* Rejection Note if present */}
                    {isRejected && (course as any).rejection_reason && (
                      <div className="p-2 rounded bg-primer-danger-subtle/30 text-[11px] text-primer-danger-fg border border-primer-danger-emphasis/30">
                        <span className="font-semibold">{language === 'KZ' ? 'Себебі:' : language === 'RU' ? 'Причина:' : 'Reason:'}</span>{' '}
                        {(course as any).rejection_reason}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="flex items-center justify-between text-xs text-primer-fg-muted pt-2 border-t border-primer-border-muted">
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{course.teacher_name}</span>
                      </div>
                      {course.short_code && (
                        <span className="font-mono text-[10px] text-primer-fg-subtle">
                          #{course.short_code}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      {isEnrolled ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-between font-bold"
                          onClick={() => {
                            if (onStartCourseTopic) {
                              onStartCourseTopic(course.next_topic || course.title);
                            }
                          }}
                        >
                          <span>{language === 'KZ' ? 'Оқуды жалғастыру' : language === 'RU' ? 'Продолжить обучение' : 'Continue Learning'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      ) : isPending ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-primer-danger-fg hover:bg-primer-danger-subtle border-primer-border-default hover:border-primer-danger-emphasis transition font-semibold"
                          disabled={cancelingCourseId === course.id}
                          onClick={() => handleCancelApplication(course.id, course.title)}
                        >
                          {cancelingCourseId === course.id
                            ? language === 'KZ'
                              ? 'Қайтарылуда...'
                              : language === 'RU'
                              ? 'Отмена...'
                              : 'Canceling...'
                            : language === 'KZ'
                            ? 'Өтінішті қайтарып алу'
                            : language === 'RU'
                            ? 'Отозвать заявку'
                            : 'Cancel Application'}
                        </Button>
                      ) : isRejected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-primer-fg-muted hover:text-primer-fg-default"
                          disabled={dismissingCourseId === course.id}
                          onClick={() => handleDismissRejected(course.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          <span>{language === 'KZ' ? 'Тізімнен тазалау' : language === 'RU' ? 'Убрать из списка' : 'Dismiss'}</span>
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Google Form Application Modal */}
      <CourseApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setSelectedCourseForApp(null);
        }}
        course={selectedCourseForApp}
        onSubmit={handleApplicationSubmit}
        isLoading={isSubmittingApp}
      />

      {/* 6. Course Details Preview Modal */}
      <Dialog
        open={Boolean(selectedCoursePreview)}
        onOpenChange={(open) => !open && setSelectedCoursePreview(null)}
      >
        <DialogContent className="max-w-md font-sans">
          {selectedCoursePreview && (
            <>
              <DialogHeader className="space-y-2 border-b border-primer-border-muted pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {getLocalized(selectedCoursePreview, 'subject', selectedCoursePreview.subject)}
                  </Badge>
                  {selectedCoursePreview.short_code && (
                    <span className="font-mono text-xs text-primer-accent-fg font-bold">
                      #{selectedCoursePreview.short_code}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-base font-bold">
                  {getLocalized(selectedCoursePreview, 'title', selectedCoursePreview.title)}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {getLocalized(selectedCoursePreview, 'description', selectedCoursePreview.description)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-primer-canvas-subtle border border-primer-border-muted">
                  <span className="text-primer-fg-muted">{language === 'KZ' ? 'Оқытушы:' : language === 'RU' ? 'Преподаватель:' : 'Instructor:'}</span>
                  <span className="font-bold text-primer-fg-default">{selectedCoursePreview.teacher_name}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-primer-canvas-subtle border border-primer-border-muted">
                  <span className="text-primer-fg-muted">{language === 'KZ' ? 'Сынып / Деңгей:' : language === 'RU' ? 'Класс / Уровень:' : 'Grade / Level:'}</span>
                  <span className="font-bold text-primer-fg-default">{selectedCoursePreview.grade || '9-11'}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseCatalogScreen;
