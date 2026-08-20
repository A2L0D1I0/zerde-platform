import React from 'react';
import { StudyDay } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Flame, Lock, Sparkles } from 'lucide-react';

interface WeekdayStudyCarouselProps {
  days: StudyDay[];
  streakDays?: number;
  selectedDate?: string;
  onSelectDay?: (day: StudyDay) => void;
}

export const WeekdayStudyCarousel: React.FC<WeekdayStudyCarouselProps> = ({
  days,
  streakDays = 0,
  selectedDate,
  onSelectDay,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3 sm:p-3.5 shadow-primer-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-primer-border-muted/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primer-fg-default">
          <Sparkles className="w-3.5 h-3.5 text-primer-attention-fg" />
          <span>{t('student.study_rhythm_title')}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-primer-success-fg">
          <Flame className="w-3.5 h-3.5 fill-current text-primer-attention-fg" />
          <span>
            {streakDays > 0
              ? `${streakDays} ${t('student.streak_active_label')}`
              : t('student.streak_start_today')}
          </span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isSelected = selectedDate === day.date;

          let containerClass =
            'border-primer-border-muted bg-primer-canvas-inset text-primer-fg-muted hover:border-primer-border-default';
          let badgeColor = 'text-primer-fg-subtle';

          if (day.isToday) {
            containerClass =
              'border-primer-accent-emphasis bg-primer-accent-subtle/30 text-primer-fg-default ring-1 ring-primer-accent-emphasis shadow-sm';
            badgeColor = 'text-primer-accent-fg font-bold';
          } else if (day.isCompleted) {
            containerClass =
              'border-primer-success-muted/50 bg-primer-success-subtle/20 text-primer-fg-default';
            badgeColor = 'text-primer-success-fg';
          } else if (day.isFuture) {
            containerClass = 'border-primer-border-muted/30 bg-primer-canvas-inset/50 opacity-60';
          }

          if (isSelected) {
            containerClass += ' ring-2 ring-primer-accent-emphasis';
          }

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay?.(day)}
              className={`flex flex-col items-center justify-between py-2 px-1 rounded-lg border text-center transition-all cursor-pointer select-none ${containerClass}`}
            >
              <span className={`text-[10px] font-semibold ${badgeColor}`}>{day.dayOfWeek}</span>
              <span className="text-xs sm:text-sm font-bold font-mono my-0.5 text-primer-fg-default">
                {day.dayNumber}
              </span>

              <div className="mt-0.5 flex items-center justify-center h-4">
                {day.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primer-success-fg" />
                ) : day.isToday ? (
                  <Flame className="w-3.5 h-3.5 text-primer-attention-fg fill-current animate-pulse" />
                ) : (
                  <Lock className="w-3 h-3 text-primer-fg-subtle" />
                )}
              </div>

              <span className="text-[9px] font-mono text-primer-fg-subtle mt-0.5">
                {day.tasksCount > 0 ? `${day.tasksCount} ${t('common.tasks_short')}` : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

