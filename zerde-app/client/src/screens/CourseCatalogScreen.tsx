import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Course } from '@/types';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  BookOpen,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Send,
  BookMarked,
  Layers,
  GraduationCap,
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

  const [courses, setCourses] = useState<(Course & { enrollment_status?: 'enrolled' | 'pending_approval' | 'none' })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Join by Short Code
  const [joinCode, setJoinCode] = useState('');
  const [isJoiningCode, setIsJoiningCode] = useState(false);


  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoiningCode(true);
    try {
      const res = await courseService.joinByShortCode(joinCode.trim());
      showToast({
        type: 'success',
        title: t('courses.join_by_code_title'),
        message: res.message,
      });
      setJoinCode('');
      await loadCourses();
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: t('common.error_occurred'),
        message: err.message,
      });
    } finally {
      setIsJoiningCode(false);
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getAllCourses({
        search: searchQuery || undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        grade: selectedGrade !== 'all' ? selectedGrade : undefined,
      });
      setCourses(data as any);
    } catch (e) {
      console.warn('Failed to load courses from API, fallback used', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [searchQuery, selectedSubject, selectedGrade]);

  const handleEnroll = async (course: Course) => {
    setIsApplying(course.id);
    try {
      const result = await courseService.enroll(course.id);
      showToast({
        type: 'success',
        title: t('common.saved'),
        message: result.message,
      });
      await loadCourses();
    } catch (e) {
      showToast({
        type: 'attention',
        title: t('common.error_occurred'),
        message: t('common.failed_to_save'),
      });
    } finally {
      setIsApplying(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (activeTab === 'enrolled') return c.enrollment_status === 'enrolled';
    if (activeTab === 'pending') return c.enrollment_status === 'pending_approval';
    return true;
  });

  const subjectList: Record<string, { label: string; key: string }[]> = {
    KZ: [
      { label: 'Барлығы', key: 'all' },
      { label: 'Математика', key: 'algebra' },
      { label: 'Физика', key: 'physics' },
      { label: 'Қазақ тілі', key: 'kazakh_lang' },
      { label: 'Химия', key: 'chemistry' },
      { label: 'Информатика', key: 'cs' },
    ],
    RU: [
      { label: 'Все', key: 'all' },
      { label: 'Математика', key: 'algebra' },
      { label: 'Физика', key: 'physics' },
      { label: 'Казахский язык', key: 'kazakh_lang' },
      { label: 'Химия', key: 'chemistry' },
      { label: 'Информатика', key: 'cs' },
    ],
    EN: [
      { label: 'All', key: 'all' },
      { label: 'Mathematics', key: 'algebra' },
      { label: 'Physics', key: 'physics' },
      { label: 'Kazakh Language', key: 'kazakh_lang' },
      { label: 'Chemistry', key: 'chemistry' },
      { label: 'Computer Science', key: 'cs' },
    ],
  };
  const subjects = subjectList[language] || subjectList.KZ;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-4 shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primer-accent-emphasis text-white shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-primer-fg-default">
                {t('courses.catalog_title')}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {courses.length}
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              {t('courses.catalog_subtitle')}
            </p>
          </div>
        </div>

        {/* Tab filters: All / Enrolled / Pending */}
        <div className="flex items-center gap-1.5 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primer-accent-emphasis text-white shadow-xs'
                : 'text-primer-fg-muted hover:text-primer-fg-default'
            }`}
          >
            {t('common.all')} ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'enrolled'
                ? 'bg-primer-done-emphasis text-white shadow-xs'
                : 'text-primer-fg-muted hover:text-primer-fg-default'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('courses.enrolled_filter')} ({courses.filter((c) => c.enrollment_status === 'enrolled').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'pending'
                ? 'bg-primer-attention-emphasis text-white shadow-xs'
                : 'text-primer-fg-muted hover:text-primer-fg-default'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('courses.pending_filter')} ({courses.filter((c) => c.enrollment_status === 'pending_approval').length})</span>
          </button>
        </div>
      </div>

      {/* Join Course by Short Code Bar */}
      <form
        onSubmit={handleJoinByCode}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-primer-canvas-subtle via-primer-canvas-default to-primer-canvas-subtle border border-primer-accent-muted/40 rounded-xl p-3.5 shadow-primer-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primer-accent-subtle text-primer-accent-fg shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-primer-fg-default">
              {t('courses.join_by_code_title')}
            </div>
            <div className="text-[10px] text-primer-fg-muted">
              {t('courses.join_by_code_desc')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={t('courses.join_by_code_placeholder')}
            maxLength={8}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase bg-primer-canvas-inset border border-primer-border-default rounded-md text-primer-fg-default placeholder:text-primer-fg-subtle outline-none focus:border-primer-accent-emphasis w-full sm:w-48 text-center tracking-wider"
          />
          <Button type="submit" variant="primary" size="sm" disabled={isJoiningCode || !joinCode.trim()} className="whitespace-nowrap font-bold">
            {isJoiningCode ? '...' : t('courses.join_by_code_btn')}
          </Button>
        </div>
      </form>

      {/* Search & Subject Badges Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-3.5 shadow-primer-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primer-fg-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('courses.search_placeholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-primer-canvas-inset border border-primer-border-default rounded-md text-primer-fg-default placeholder:text-primer-fg-subtle outline-none focus:border-primer-accent-emphasis"
          />
        </div>

        {/* Subjects Horizontal Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((item) => {
            const isSelected = selectedSubject === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedSubject(item.key)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-primer-accent-emphasis text-white'
                    : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-primer-fg-muted rounded-xl border border-primer-border-default bg-primer-canvas-subtle">
            {t('common.no_data')}
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = course.enrollment_status === 'enrolled';
            const isPending = course.enrollment_status === 'pending_approval';
            const title = getLocalized(course, 'title', course.title);
            const desc = getLocalized(course, 'description', course.description || '');

            return (

              <Card
                key={course.id}
                className="flex flex-col justify-between hover:border-primer-border-default transition-all shadow-primer-xs hover:shadow-primer-sm cursor-pointer group"
                onClick={() => setSelectedCourse(course)}
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {course.subject}
                    </Badge>

                    {/* Short Code Badge with 1-Click Copy */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(course.short_code || 'ZK-2026');
                        showToast({
                          type: 'success',
                          title: t('courses.code_copied_toast'),
                          message: course.short_code || '',
                        });
                      }}
                      title={t('courses.copy_code_tooltip')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-primer-canvas-inset border border-primer-border-muted text-[10px] font-mono font-bold text-primer-accent-fg hover:border-primer-accent-emphasis transition"
                    >
                      <span className="text-primer-fg-subtle text-[9px]">{t('courses.short_code_badge')}</span>
                      <span>{course.short_code || 'ZK-2026'}</span>
                      <span className="text-[9px]">📋</span>
                    </div>
                  </div>

                  <CardTitle className="text-sm font-bold group-hover:text-primer-accent-fg transition leading-snug line-clamp-2">
                    {title}
                  </CardTitle>

                  <CardDescription className="text-xs line-clamp-2">
                    {desc}
                  </CardDescription>
                </CardHeader>


                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs text-primer-fg-muted pt-2 border-t border-primer-border-muted">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{course.teacher_name}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{course.students_count || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1">
                    {isEnrolled ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-between"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onStartCourseTopic) {
                            onStartCourseTopic(course.next_topic || course.title);
                          }
                        }}
                      >
                        <span>{t('student.continue_learning')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : isPending ? (
                      <Button variant="secondary" size="sm" className="w-full gap-1.5 cursor-default text-primer-attention-fg" disabled>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('courses.enrollment_pending')}</span>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-1.5"
                        disabled={isApplying === course.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course);
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isApplying === course.id ? '...' : t('courses.apply_enroll')}</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};


