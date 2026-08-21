import React from 'react';
import { ClassLeaderboardEntry, Course } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, BookOpen, ChevronRight, Layers } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ClassLeaderboardCardProps {
  leaderboard: ClassLeaderboardEntry[];
  enrolledCourses?: Course[];
  activeCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
  onOpenCatalog?: () => void;
  currentUserId?: string;
}

export const ClassLeaderboardCard: React.FC<ClassLeaderboardCardProps> = ({
  leaderboard,
  enrolledCourses = [],
  activeCourseId,
  onSelectCourse,
  onOpenCatalog,
  currentUserId = '',
}) => {
  const { language, t } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const hasCourses = enrolledCourses.length > 0;
  const activeCourse = enrolledCourses.find((c) => c.id === activeCourseId) || enrolledCourses[0];

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shadow-xs">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center shadow-xs">
            3
          </div>
        );
      default:
        return (
          <span className="w-5 text-center text-xs font-mono font-semibold text-primer-fg-muted">
            {rank}
          </span>
        );
    }
  };

  // 1. EMPTY STATE: When student is not enrolled in any course
  if (!hasCourses) {
    return (
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-primer-border-muted/60">
          <div className="p-1.5 rounded-lg bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/40">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Курс рейтингі' : lang === 'RU' ? 'Рейтинг курсов' : 'Course Leaderboard'}
            </h3>
            <p className="text-[10px] text-primer-fg-muted">
              {lang === 'KZ' ? 'Сокурсниктер арасындағы ELO рейтингі' : lang === 'RU' ? 'Рейтинг ELO среди сокурсников' : 'Peer ELO ranking'}
            </p>
          </div>
        </div>

        <div className="py-4 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-primer-canvas-inset flex items-center justify-center text-primer-fg-muted border border-primer-border-muted">
            <BookOpen className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-xs font-semibold text-primer-fg-default">
            {lang === 'KZ'
              ? 'Сіз әлі ешқандай курсқа жазылмадыңыз'
              : lang === 'RU'
              ? 'Вы еще не записаны на курсы'
              : 'You are not enrolled in any courses yet'}
          </p>
          <p className="text-[11px] text-primer-fg-muted max-w-xs mx-auto">
            {lang === 'KZ'
              ? 'Рейтингке қатысып, сокурсниктермен нәтижелерді салыстыру үшін каталогтан курс таңдаңыз'
              : lang === 'RU'
              ? 'Запишитесь на курс, чтобы участвовать в рейтинге сокурсников и отслеживать прогресс'
              : 'Enroll in a course to participate in peer rankings and track your progress'}
          </p>

          {onOpenCatalog && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCatalog}
                className="font-bold text-xs gap-1.5 mx-auto"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === 'KZ' ? 'Каталогты ашу' : lang === 'RU' ? 'Открыть каталог' : 'Browse Catalog'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. ACTIVE LEADERBOARD: When student is enrolled in courses
  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-primer-border-muted/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/40">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default truncate max-w-[170px] sm:max-w-xs">
              {activeCourse ? activeCourse.title : (lang === 'KZ' ? 'Курс рейтингі' : 'Рейтинг курса')}
            </h3>
            <p className="text-[10px] text-primer-fg-muted">
              {lang === 'KZ' ? 'Академиялық ELO және стрик' : lang === 'RU' ? 'Академический ELO и стрик' : 'Academic ELO & streak'}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono">
          Топ-{leaderboard.length || 1}
        </Badge>
      </div>

      {/* Multi-Course Switcher (if > 1 enrolled course) */}
      {enrolledCourses.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {enrolledCourses.map((c) => {
            const isSelected = activeCourse && activeCourse.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCourse && onSelectCourse(c.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
                }`}
              >
                {c.title.split(' ')[0]} {c.grade || ''}
              </button>
            );
          })}
        </div>
      )}

      {/* Leaderboard rows */}
      <div className="space-y-1.5">
        {leaderboard.length === 0 ? (
          <div className="text-center py-3 text-xs text-primer-fg-muted">
            {lang === 'KZ' ? 'Бұл курста рейтинг әлі қалыптасуда' : 'В этом курсе рейтинг формируется'}
          </div>
        ) : (
          leaderboard.slice(0, 5).map((entry) => {
            const isCurrent = entry.isCurrentUser || entry.id === currentUserId || entry.id === 'current_user';

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-primer-accent-emphasis/60 bg-primer-accent-subtle/30 ring-1 ring-primer-accent-emphasis/50'
                    : 'border-primer-border-muted/40 bg-primer-canvas-inset/50 hover:bg-primer-canvas-inset'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getRankMedal(entry.rank)}

                  <div className="w-7 h-7 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
                    ) : (
                      entry.name.charAt(0)
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-primer-accent-fg font-bold' : 'text-primer-fg-default'}`}>
                        {entry.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-primer-accent-emphasis text-white font-mono font-bold">
                          Сен
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-primer-fg-muted flex items-center gap-1.5">
                      <span>{entry.eloRankLevel}</span>
                      <span>•</span>
                      <span className="text-primer-attention-fg flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        {entry.streakDays}к
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-primer-success-fg">
                    {entry.elo}
                  </div>
                  <div className="text-[9px] text-primer-fg-subtle">
                    {entry.masteredCount} тақырып
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClassLeaderboardCard;
