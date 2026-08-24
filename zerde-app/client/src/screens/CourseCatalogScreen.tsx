import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, PlayCircle, ArrowRight, RefreshCw } from 'lucide-react';
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
  const isRU = language === 'RU';
  const isEN = language === 'EN';

  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<any[]>('/courses');
        if (Array.isArray(res)) {
          setCourses(res);
        }
      } catch (err) {
        console.error('[CourseCatalogScreen] Failed to load courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
                ? 'Courses Catalog & Curriculum'
                : isRU
                ? 'Каталог предметов и курсов'
                : 'Пәндер каталогы & Оқу курстары'}
            </span>
          </h2>
          <p className="text-xs text-primer-fg-muted">
            {isEN
              ? 'Official curriculum and learning tracks from SQLite'
              : isRU
              ? 'Учебная программа из базы данных'
              : 'Бекітілген оқу бағдарламасы бойынша курстар'}
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
        {filtered.map((crs) => (
          <div
            key={crs.id}
            className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl p-1.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
                  {crs.icon || '📐'}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {crs.topicsCount || (crs.topics ? crs.topics.length : 0)}{' '}
                  {isEN ? 'topics' : isRU ? 'тем' : 'тақырып'}
                </Badge>
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
                  {crs.topics.map((top: string, idx: number) => (
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

            <Button
              onClick={async () => {
                try {
                  await api.post('/student/enroll-course', { courseId: crs.id });
                } catch (e) {
                  // ignore
                }
                showToast({
                  type: 'success',
                  title: isEN ? 'Course Enrolled! 🎉' : isRU ? 'Вы записались на курс! 🎉' : 'Курсқа жазылдыңыз! 🎉',
                  message: crs.title,
                });
                if (onStartCourseTopic && crs.topics && crs.topics.length > 0) {
                  onStartCourseTopic(crs.topics[0], crs.language);
                }
              }}
              size="sm"
              className="w-full text-xs font-semibold gap-1.5 mt-2 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{isEN ? 'Enroll & Start Learning' : isRU ? 'Записаться и начать обучение' : 'Жазылу және оқуды бастау'}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCatalogScreen;
