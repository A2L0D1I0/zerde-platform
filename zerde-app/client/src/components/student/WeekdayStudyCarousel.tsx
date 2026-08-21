import React from 'react';
import { StudyDay } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Flame, Lock, Sparkles } from 'lucide-react';

interface WeekdayStudyCarouselProps {
  days: StudyDay[];
  selectedDate?: string;
  onSelectDay?: (day: StudyDay) => void;
}

const WEEKDAYS_MAP = {
  KZ: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'],
  RU: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  EN: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const WeekdayStudyCarousel: React.FC<WeekdayStudyCarouselProps> = ({
  days,
  selectedDate,
  onSelectDay,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';
  const weekdayNames = WEEKDAYS_MAP[lang] || WEEKDAYS_MAP.KZ;

  const headerTitle =
    lang === 'KZ'
      ? 'Апталық оқу ырғағы'
      : lang === 'RU'
      ? 'Недельный ритм учебы'
      : 'Weekly Study Rhythm';

  const streak = user?.streakDays ?? 0;

  const streakText =
    streak === 0
      ? lang === 'KZ'
        ? 'Стрикті бүгін бастаңыз'
        : lang === 'RU'
        ? 'Начните стрик сегодня'
        : 'Start streak today'
      : lang === 'KZ'
      ? `${streak} күндік стрик белсенді`
      : lang === 'RU'
      ? `${streak} дней стрик активен`
      : `${streak} day streak active`;

  const taskUnit =
    lang === 'KZ' ? 'тап.' : lang === 'RU' ? 'зад.' : 'tasks';

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3 sm:p-3.5 shadow-primer-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-primer-border-muted/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primer-fg-default">
          <Sparkles className="w-3.5 h-3.5 text-primer-attention-fg" />
          <span>{headerTitle}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-primer-success-fg font-semibold">
          <Flame className="w-3.5 h-3.5 fill-current text-primer-attention-fg" />
          <span>{streakText}</span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isSelected = selectedDate === day.date;

          return (
            <div
              key={day.date}
              onClick={() => onSelectDay && onSelectDay(day)}
              className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-primer-accent-emphasis ring-2 ring-primer-accent-emphasis/40 bg-primer-canvas-inset'
                  : day.isToday
                  ? 'border-primer-accent-emphasis/70 bg-primer-accent-subtle/20'
                  : day.isCompleted
                  ? 'border-primer-success-muted/60 bg-primer-success-subtle/20 hover:bg-primer-success-subtle/30'
                  : day.isFuture
                  ? 'border-primer-border-muted/30 bg-primer-canvas-inset/30 opacity-60'
                  : 'border-primer-border-muted/40 bg-primer-canvas-inset/50 hover:bg-primer-canvas-inset'
              }`}
            >
              {/* Day of Week */}
              <span
                className={`text-[10px] font-bold ${
                  day.isToday ? 'text-primer-accent-fg' : 'text-primer-fg-muted'
                }`}
              >
                {weekdayNames[idx] || day.dayOfWeek}
              </span>

              {/* Day of Month */}
              <span
                className={`text-xs sm:text-sm font-bold font-mono my-0.5 ${
                  day.isToday
                    ? 'text-primer-accent-fg font-extrabold'
                    : day.isCompleted
                    ? 'text-primer-success-fg'
                    : 'text-primer-fg-default'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Status Indicator Icon / Task Count */}
              <div className="mt-0.5">
                {day.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primer-success-fg fill-primer-success-subtle/60" />
                ) : day.isToday ? (
                  <Flame className="w-3.5 h-3.5 text-primer-attention-fg animate-pulse" />
                ) : day.isFuture ? (
                  <Lock className="w-3 h-3 text-primer-fg-subtle opacity-50" />
                ) : (
                  <span className="text-[9px] font-mono text-primer-fg-subtle">-</span>
                )}
              </div>

              {/* Task count */}
              <span className="text-[9px] font-mono text-primer-fg-muted mt-0.5">
                {day.isCompleted
                  ? `${day.tasksCount} ${taskUnit}`
                  : day.isToday
                  ? `${day.tasksCount > 0 ? `${day.tasksCount} ${taskUnit}` : '-'}`
                  : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekdayStudyCarousel;
