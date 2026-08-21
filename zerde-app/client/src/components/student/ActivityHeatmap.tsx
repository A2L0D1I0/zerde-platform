import React from 'react';
import { HeatmapDay } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, GitCommit, Award } from 'lucide-react';

interface ActivityHeatmapProps {
  data?: HeatmapDay[];
  currentStreak?: number;
  longestStreak?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data = [],
  currentStreak = 0,
  longestStreak = 0,
}) => {
  const { language, t } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  // Safely compute total completed without NaN
  const totalCompleted = Array.isArray(data)
    ? data.reduce((sum, d) => sum + (Number(d.tasksCompleted) || 0), 0)
    : 0;

  const levelColors: Record<number, string> = {
    0: 'bg-primer-canvas-inset border-primer-border-muted/30',
    1: 'bg-primer-heatmap-1 border-primer-success-muted/30',
    2: 'bg-primer-heatmap-2 border-primer-success-muted/50',
    3: 'bg-primer-heatmap-3 border-primer-success-muted/70',
    4: 'bg-primer-heatmap-4 border-primer-success-muted',
  };

  const activityTitle =
    lang === 'KZ' ? 'Оқу белсенділігі' : lang === 'RU' ? 'Учебная активность' : 'Learning Activity';

  const solvedLabel =
    lang === 'KZ'
      ? `${totalCompleted} тапсырма орындалды`
      : lang === 'RU'
      ? `${totalCompleted} задач решено`
      : `${totalCompleted} tasks solved`;

  const streakDaysUnit = lang === 'KZ' ? 'күн' : lang === 'RU' ? 'дней' : 'days';
  const rangeLabel = lang === 'KZ' ? 'Соңғы 3 ай' : lang === 'RU' ? 'Последние 3 месяца' : 'Last 3 months';
  const lessLabel = lang === 'KZ' ? 'Аз' : lang === 'RU' ? 'Меньше' : 'Less';
  const moreLabel = lang === 'KZ' ? 'Көп' : lang === 'RU' ? 'Больше' : 'More';

  // If data is empty, generate an initial clean 7x13 matrix
  const displayMatrix =
    data.length > 0
      ? data
      : Array.from({ length: 91 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (90 - i));
          return {
            date: d.toISOString().split('T')[0],
            level: 0 as const,
            tasksCompleted: 0,
          };
        });

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-primer-border-muted/60 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primer-fg-default">
            <GitCommit className="w-3.5 h-3.5 text-primer-success-fg" />
            <span>{activityTitle}</span>
          </div>
          <p className="text-[11px] text-primer-fg-muted mt-0.5">
            {solvedLabel}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1 text-primer-attention-fg">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{currentStreak} {streakDaysUnit}</span>
          </div>
          <div className="flex items-center gap-1 text-primer-fg-muted">
            <Award className="w-3.5 h-3.5 text-primer-done-fg" />
            <span>{longestStreak} {streakDaysUnit} (max)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid grid-flow-col grid-rows-7 gap-1 min-w-[280px]">
          {displayMatrix.map((day, idx) => (
            <div
              key={idx}
              title={`${day.date}: ${day.tasksCompleted || 0} tasks`}
              className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${
                levelColors[day.level] || levelColors[0]
              }`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-primer-border-muted/40 text-[10px] text-primer-fg-muted">
        <span>{rangeLabel}</span>
        <div className="flex items-center gap-1">
          <span>{lessLabel}</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-canvas-inset border border-primer-border-muted/30" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-1" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-2" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-3" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-4" />
          </div>
          <span>{moreLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
