import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ApplyCourseModal } from '@/features/admission/ApplyCourseModal';
import {
  BookOpen,
  Search,
  PlayCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';
import api from '@/api/client';

export interface CourseCatalogScreenProps {
  onStartCourseTopic?: (topicTitle: string, courseLang?: 'KZ' | 'RU' | 'EN' | 'ANY') => void;
}

export const CourseCatalogScreen: React.FC<CourseCatalogScreenProps> = ({
  onStartCourseTopic,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';
  const isRU = language === 'RU';
  const isEN = language === 'EN';

  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admission application modal
  const [selectedApplyCourse, setSelectedApplyCourse] = useState<any | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchCoursesAndStatus = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, enrolledRes]: [any, any] = await Promise.all([
        api.get<any[]>('/courses'),
        api.get<any[]>('/student/enrolled-courses').catch(() => [])
      ]);

      const courseList = Array.isArray(coursesRes) ? coursesRes : Array.isArray(coursesRes?.data) ? coursesRes.data : [];
      const enrolledList = Array.isArray(enrolledRes) ? enrolledRes : Array.isArray(enrolledRes?.data) ? enrolledRes.data : [];

      setCourses(courseList);
      setEnrolledCourses(enrolledList);
    } catch (err) {
      console.error('[CourseCatalogScreen] Failed to load courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndStatus();
  }, []);

  const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id || c.course_id));

  const filtered = courses.filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primer-border-default pb-3">
        <div>
          <h2 className="text-base font-bold text-primer-fg-default flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primer-accent-fg" />
            <span>
              {isEN
                ? 'Courses Catalog & Admission'
                : isRU
                ? 'Каталог курсов и зачисление'
                : 'Пәндер каталогы & Қабылдау'}
            </span>
          </h2>
          <p className="text-xs text-primer-fg-muted">
            {isEN
              ? 'Select a course, submit motivation letter and start learning'
              : isRU
              ? 'Выберите курс, отправьте заявку с мотивационным письмом и приступайте к обучению'
              : 'Курсты таңдап, мотивациялық хат жазыңыз және оқуды бастаңыз'}
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isEN
                ? 'Search course or topic...'
                : isRU
                ? 'Поиск курса или темы...'
                : 'Пәнді немесе тақырыпты іздеу...'
            }
            className="text-xs h-8"
          />
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primer-accent-fg" />
          <span>{isEN ? 'Loading courses...' : isRU ? 'Загрузка курсов...' : 'Курстар жүктелуде...'}</span>
        </div>
      )}

      {/* Courses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((crs) => {
          const isEnrolled = enrolledCourseIds.has(crs.id);

          return (
            <div
              key={crs.id}
              className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl p-1.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
                    {crs.icon || '📐'}
                  </span>
                  <div className="flex items-center gap-1">
                    {isEnrolled ? (
                      <Badge variant="success" className="text-[10px] gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        {isEN ? 'Enrolled' : isRU ? 'Зачислен' : 'Қабылданды'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {crs.topicsCount || (crs.topics ? crs.topics.length : 0)}{' '}
                        {isEN ? 'topics' : isRU ? 'тем' : 'тақырып'}
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-primer-fg-default leading-snug">
                  {crs.title}
                </h3>

                <p className="text-[11px] text-primer-fg-muted">
                  {isEN ? 'Teacher:' : isRU ? 'Преподаватель:' : 'Оқытушы:'}{' '}
                  {crs.teacherName || (isEN ? 'Faculty Teacher' : isRU ? 'Преподаватель' : 'Пән мұғалімі')}
                </p>

                {crs.topics && crs.topics.length > 0 && (
                  <div className="pt-2 border-t border-primer-border-muted/50 space-y-1.5">
                    <div className="text-[10px] font-semibold text-primer-fg-muted uppercase">
                      {isEN ? 'Topics:' : isRU ? 'Темы:' : 'Тақырыптар:'}
                    </div>
                    {crs.topics.slice(0, 3).map((top: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => onStartCourseTopic && onStartCourseTopic(top, crs.language)}
                        className="p-1.5 rounded bg-primer-canvas-inset border border-primer-border-muted/40 text-[11px] text-primer-fg-default hover:border-primer-accent-emphasis cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate pr-1">{top}</span>
                        <ArrowRight className="w-3 h-3 text-primer-accent-fg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                {isEnrolled ? (
                  <Button
                    onClick={() => {
                      if (onStartCourseTopic && crs.topics && crs.topics.length > 0) {
                        onStartCourseTopic(crs.topics[0], crs.language);
                      }
                    }}
                    size="sm"
                    variant="primary"
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{isEN ? 'Start Learning' : isRU ? 'Начать обучение' : 'Оқуды бастау'}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setSelectedApplyCourse(crs);
                      setIsApplyModalOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer hover:border-primer-accent-emphasis hover:text-primer-accent-fg"
                  >
                    <Send className="w-3.5 h-3.5 text-primer-accent-fg" />
                    <span>
                      {isEN
                        ? 'Apply for Course'
                        : isRU
                        ? 'Подать заявку на курс'
                        : 'Курсқа өтінім беру'}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Application Modal */}
      <ApplyCourseModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedApplyCourse(null);
        }}
        course={selectedApplyCourse}
        onApplied={fetchCoursesAndStatus}
      />
    </div>
  );
};

export default CourseCatalogScreen;
