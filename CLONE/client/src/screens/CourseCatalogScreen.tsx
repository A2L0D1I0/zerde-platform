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
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<(Course & { enrollment_status?: 'enrolled' | 'pending_approval' | 'none' })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Course Details Modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);

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
        title: 'Өтініш жіберілді! 🎉',
        message: result.message,
      });
      // Refresh local list
      await loadCourses();
    } catch (e) {
      showToast({
        type: 'attention',
        title: 'Қате орын алды',
        message: 'Курсқа жазылу кезінде ақау шықты.',
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

  const subjects = ['Барлығы', 'Математика', 'Физика', 'Қазақ тілі', 'Химия', 'Информатика'];

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
                Курстар каталогы & Оқу бағдарламалары
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {courses.length} курс
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              Мұғалімдер жасаған динамикалық силлабустар, спецкурстар мен олимпиадалық бағыттар
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
            Барлық курстар ({courses.length})
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
            <span>Менің курстарым ({courses.filter((c) => c.enrollment_status === 'enrolled').length})</span>
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
            <span>Өтініштер ({courses.filter((c) => c.enrollment_status === 'pending_approval').length})</span>
          </button>
        </div>
      </div>

      {/* Search & Subject Badges Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-3.5 shadow-primer-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-primer-fg-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Курс немесе мұғалім аты бойынша іздеу..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-primer-canvas-inset border border-primer-border-muted rounded-md text-primer-fg-default placeholder:text-primer-fg-subtle outline-none focus:border-primer-accent-emphasis"
          />
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((subj) => {
            const key = subj === 'Барлығы' ? 'all' : subj;
            const isSelected = selectedSubject === key;

            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(key)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-primer-accent-emphasis text-white'
                    : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-primer-fg-muted rounded-xl border border-primer-border-default bg-primer-canvas-subtle">
            Таңдалған санат бойынша курстар табылмады.
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = course.enrollment_status === 'enrolled';
            const isPending = course.enrollment_status === 'pending_approval';

            return (
              <Card
                key={course.id}
                className="flex flex-col justify-between border-primer-border-default bg-primer-canvas-subtle hover:border-primer-accent-emphasis/60 transition shadow-primer-xs group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="accent" className="text-[10px]">
                      {course.subject}
                    </Badge>
                    <span className="text-[10px] font-mono text-primer-fg-muted bg-primer-canvas-inset px-2 py-0.5 rounded border border-primer-border-muted">
                      {course.grade}
                    </span>
                  </div>

                  <CardTitle className="text-sm font-bold mt-2 group-hover:text-primer-accent-fg transition line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Progress or Next Topic */}
                  {isEnrolled ? (
                    <div className="space-y-1.5 p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-primer-fg-muted">Прогресс:</span>
                        <span className="font-mono font-bold text-primer-success-fg">
                          {course.progress_percentage || 78}%
                        </span>
                      </div>
                      <div className="w-full bg-primer-canvas-subtle rounded-full h-1.5 overflow-hidden border border-primer-border-muted/50">
                        <div
                          className="bg-primer-success-emphasis h-full rounded-full"
                          style={{ width: `${course.progress_percentage || 78}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-primer-fg-subtle truncate pt-0.5">
                        Ағымдағы: <strong className="text-primer-fg-default">{course.next_topic || 'Виет теоремасы'}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-[11px] text-primer-fg-muted space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Оқытушы:</span>
                        <strong className="text-primer-fg-default">{course.teacher_name}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Оқушылар саны:</span>
                        <span className="font-mono">{course.students_count} оқушы</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-1 flex items-center gap-2">
                    {isEnrolled ? (
                      <Button
                        onClick={() => onStartCourseTopic?.(course.next_topic || course.title)}
                        variant="primary"
                        size="sm"
                        className="w-full gap-1.5 font-bold shadow-primer-xs text-xs"
                      >
                        <span>Перейти к обучению</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : isPending ? (
                      <Button
                        disabled
                        variant="secondary"
                        size="sm"
                        className="w-full gap-1.5 text-xs text-primer-attention-fg bg-primer-attention-subtle/40 border-primer-attention-muted/50 font-semibold"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Күтілуде (pending_approval)</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course)}
                        disabled={isApplying === course.id}
                        variant="secondary"
                        size="sm"
                        className="w-full gap-1.5 text-xs font-bold hover:bg-primer-accent-emphasis hover:text-white transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isApplying === course.id ? 'Жіберілуде...' : 'Подать заявку'}</span>
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
