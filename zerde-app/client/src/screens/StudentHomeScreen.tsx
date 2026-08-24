import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Award, PlayCircle, BookOpen, Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { TestPracticeModal } from '@/components/student/TestPracticeModal';
import api from '@/api/client';

interface StudentHomeScreenProps {
  onNavigateTab?: (tab: any) => void;
  activeTopic?: string;
  courseLanguage?: 'KZ' | 'RU' | 'EN' | 'ANY';
  onStartTrainer?: (topic: string, subject?: string) => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onNavigateTab,
  activeTopic,
  courseLanguage,
  onStartTrainer,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRU = language === 'RU';
  const isEN = language === 'EN';

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [currentElo, setCurrentElo] = useState<number>(user?.elo ?? user?.overallElo ?? 1000);
  const [streakDays, setStreakDays] = useState<number>(user?.streakDays || 0);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState(activeTopic || '');
  const [practiceSubject, setPracticeSubject] = useState('Математика');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<any>(`/student/dashboard?studentId=${user?.id || user?.email || ''}`);
        if (res && res.user) {
          setDashboardData(res);
          setCurrentElo(res.elo ?? res.user?.elo ?? 1000);
          setStreakDays(res.streak_days || 0);
          if (res.daily_focus?.title && !activeTopic) {
            setPracticeTopic(res.daily_focus.title);
            setPracticeSubject(res.daily_focus.course_title || 'Математика');
          }
        }
      } catch (e) {
        console.warn('[StudentHomeScreen] Failed to load dashboard', e);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        const res = await api.get<any[]>('/student/enrolled-courses');
        if (Array.isArray(res)) {
          setEnrolledCourses(res);
        }
      } catch (e) {
        console.warn('[StudentHomeScreen] Failed to load enrolled courses', e);
      }
    };

    fetchDashboard();
    fetchEnrolledCourses();
  }, [user, activeTopic]);

  const formatDisplayGrade = (g?: string | null) => {
    if (!g) return '';
    const str = String(g).trim();
    if (str.includes('сынып') || str.includes('класс') || str.includes('Grade') || str.includes('Колледж') || str.includes('ВУЗ')) {
      return str;
    }
    return `${str}-сынып`;
  };

  const studentName = user?.full_name || (isEN ? 'Student' : isRU ? 'Ученик' : 'Оқушы');
  const schoolName = user?.school || dashboardData?.user?.school || (isEN ? 'Self-study' : isRU ? 'Самостоятельное обучение' : 'Өз бетінше оқу');
  const gradeName = formatDisplayGrade(user?.grade || dashboardData?.user?.grade);
  const rankLabel = dashboardData?.rank || (isEN ? 'Seedling' : isRU ? 'Росток' : 'Өскін');
  const streakSuffix = isEN ? 'day streak' : isRU ? 'дней стрик' : 'күн стрик';

  const dailyFocus = dashboardData?.daily_focus;
  const eloReward = dailyFocus?.elo_reward || 10;

  const handleStartPractice = (topic: string, subject: string = 'Математика') => {
    setPracticeTopic(topic);
    setPracticeSubject(subject);
    if (onStartTrainer) {
      onStartTrainer(topic, subject);
    } else {
      setIsPracticeModalOpen(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-3 space-y-4">
      {/* 1. Student Dynamic Banner */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-base shadow-primer-sm">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-primer-fg-default">
                {studentName}
              </h2>
              {gradeName && <Badge variant="outline" className="text-[11px] font-mono">{gradeName}</Badge>}
            </div>
            <p className="text-xs text-primer-fg-muted">{schoolName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primer-canvas-inset border border-primer-border-default text-xs font-mono font-bold">
            <Flame className="w-4 h-4 text-primer-danger-fg" />
            <span>{streakDays} {streakSuffix}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primer-canvas-inset border border-primer-border-default text-xs font-mono font-bold text-primer-accent-fg">
            <Award className="w-4 h-4" />
            <span>{currentElo} ELO ({rankLabel})</span>
          </div>
        </div>
      </div>

      {/* 2. Daily Learning Focus / Practice Launch Card */}
      {dailyFocus ? (
        <div className="rounded-xl border border-primer-accent-emphasis/30 bg-gradient-to-r from-primer-accent-subtle/20 via-primer-canvas-subtle to-primer-canvas-subtle p-5 shadow-primer-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="accent" className="text-[10px] uppercase font-bold tracking-wider">
                  {isRU ? 'Фокус дня' : isEN ? 'Daily Focus' : 'Бүгінгі мақсат'}
                </Badge>
                <span className="text-xs text-primer-fg-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>5 {isRU ? 'минут' : isEN ? 'min' : 'минут'}</span>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-primer-fg-default leading-snug">
                {dailyFocus.title}
              </h3>

              <p className="text-xs text-primer-fg-muted">
                {isRU
                  ? 'Решите задачу для закрепления темы. При ошибке Сократ «Аға» автоматически подключится для разбора.'
                  : isEN
                  ? 'Solve the task to reinforce understanding. If you make a mistake, Mentor "Aga" will join automatically.'
                  : 'Тақырыпты бекіту үшін есепті шығарыңыз. Қате болған жағдайда Сократ «Аға» көмекке келеді.'}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primer-canvas-inset border border-primer-border-default font-mono font-bold text-xs text-primer-accent-fg shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{eloReward} ELO</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              onClick={() => handleStartPractice(dailyFocus.title, dailyFocus.course_title || 'Математика')}
              size="default"
              className="text-xs font-bold gap-2 px-5 shadow-primer-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isRU ? 'Начать практику' : isEN ? 'Start Practice' : 'Есеп шығаруды бастау'}</span>
            </Button>

            {onNavigateTab && (
              <Button
                onClick={() => onNavigateTab('courses')}
                variant="outline"
                size="default"
                className="text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isRU ? 'Все предметы' : isEN ? 'All Courses' : 'Барлық пәндер'}</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-5 shadow-primer-xs space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
              {isRU ? 'Фокус дня' : isEN ? 'Daily Focus' : 'Бүгінгі мақсат'}
            </Badge>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-primer-fg-default">
            {isEN ? 'No active assignments for today' : isRU ? 'На сегодня нет активных заданий' : 'Бүгінге белсенді тапсырмалар жоқ'}
          </h3>
          <p className="text-xs text-primer-fg-muted">
            {isEN
              ? 'Enroll in a course from the catalog to start practicing and earning ELO.'
              : isRU
              ? 'Запишитесь на курс из каталога, чтобы начать практику и повышать свой рейтинг ELO.'
              : 'Жаттығуды бастап, ELO рейтингіңізді көтеру үшін каталогтан курсқа жазылыңыз.'}
          </p>
          {onNavigateTab && (
            <Button onClick={() => onNavigateTab('courses')} size="sm" className="text-xs font-bold gap-1.5 cursor-pointer">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEN ? 'Choose Course from Catalog' : isRU ? 'Выбрать курс в каталоге' : 'Каталогтан курс таңдау'}</span>
            </Button>
          )}
        </div>
      )}

      {/* 3. Real Enrolled Courses Overview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-primer-fg-default flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primer-accent-fg" />
            <span>{isRU ? 'Мои курсы' : isEN ? 'Enrolled Courses' : 'Менің курстарым'}</span>
          </h4>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('courses')}
              className="text-xs text-primer-accent-fg hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{isRU ? 'Каталог' : isEN ? 'Catalog' : 'Каталог'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {enrolledCourses.map((crs) => (
              <div
                key={crs.id}
                onClick={() => handleStartPractice(crs.next_topic || crs.title, crs.title)}
                className="p-3.5 rounded-xl border border-primer-border-default bg-primer-canvas-subtle hover:border-primer-accent-emphasis cursor-pointer transition shadow-primer-xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{crs.icon || '📐'}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {crs.topics_count || 0} {isRU ? 'тем' : isEN ? 'topics' : 'тақырып'}
                  </Badge>
                </div>
                <div className="font-bold text-xs text-primer-fg-default group-hover:text-primer-accent-fg transition-colors">
                  {crs.title}
                </div>
                <p className="text-[11px] text-primer-fg-muted truncate">
                  {crs.next_topic || crs.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-primer-border-default bg-primer-canvas-subtle p-6 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-primer-canvas-inset border border-primer-border-default flex items-center justify-center text-primer-fg-muted">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-primer-fg-default">
                {isEN ? 'No enrolled courses yet' : isRU ? 'Вы пока не записаны ни на один курс' : 'Сіз әлі ешқандай курсқа жазылмадыңыз'}
              </h4>
              <p className="text-[11px] text-primer-fg-muted mt-1 max-w-sm mx-auto">
                {isEN
                  ? 'Browse the official course catalog to choose your subjects and start studying with AI Mentor.'
                  : isRU
                  ? 'Перейдите в каталог курсов, чтобы выбрать предметы и начать обучение с ИИ-ментором.'
                  : 'Пәндерді таңдап, оқуды бастау үшін ресми каталогты ашыңыз.'}
              </p>
            </div>
            {onNavigateTab && (
              <Button onClick={() => onNavigateTab('courses')} size="sm" variant="outline" className="text-xs gap-1.5 font-semibold cursor-pointer">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isEN ? 'Browse Catalog' : isRU ? 'Открыть каталог' : 'Каталогты ашу'}</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 4. Interactive Test & Socratic Practice Modal */}
      <TestPracticeModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        topicTitle={practiceTopic || 'Бөлшек-рационал теңсіздіктер'}
        subjectName={practiceSubject}
      />
    </div>
  );
};

export default StudentHomeScreen;
