import React from 'react';
import { HeatmapDay } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, GitCommit, Award } from 'lucide-react';

interface ActivityHeatmapProps {
  data?: HeatmapDay[];
  currentStreak?: number;
  longestStreak?: number;
}

// Generate realistic 90 days heatmap data based on actual user streak
export const generateDefaultHeatmapData = (streak: number = 0): HeatmapDay[] => {
  const result: HeatmapDay[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    let count = 0;

    if (streak > 0 && i < streak) {
      level = Math.min(4, Math.max(1, (i % 3) + 1)) as 1 | 2 | 3 | 4;
      count = level * 2;
    }

    result.push({
      date: dateStr,
      level,
      tasksCompleted: count,
    });
  }

  return result;
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  currentStreak = 0,
  longestStreak = 0,
}) => {
  const { t } = useLanguage();
  const heatmapData = data && data.length > 0 ? data : generateDefaultHeatmapData(currentStreak);
  const totalCompleted = heatmapData.reduce((sum, d) => sum + d.tasksCompleted, 0);


  const levelColors: Record<number, string> = {
    0: 'bg-primer-heatmap-0 border-transparent',
    1: 'bg-primer-heatmap-1 border-primer-success-muted/30',
    2: 'bg-primer-heatmap-2 border-primer-success-muted/50',
    3: 'bg-primer-heatmap-3 border-primer-success-muted/70',
    4: 'bg-primer-heatmap-4 border-primer-success-muted',
  };

  return (
    <div className="rounded-lg border border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-primer-border-muted/60 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primer-fg-default">
            <GitCommit className="w-3.5 h-3.5 text-primer-success-fg" />
            <span>{t('student.activity_title')}</span>
          </div>
          <p className="text-[11px] text-primer-fg-muted mt-0.5">
            {totalCompleted} {t('student.contributions')}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1 text-primer-attention-fg">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{currentStreak} {t('header.streak')}</span>
          </div>
          <div className="flex items-center gap-1 text-primer-fg-muted">
            <Award className="w-3.5 h-3.5 text-primer-done-fg" />
            <span>{longestStreak} {t('header.streak')} (max)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid grid-flow-col grid-rows-7 gap-1 min-w-[280px]">
          {heatmapData.map((day, idx) => (
            <div
              key={idx}
              title={`${day.date}: ${day.tasksCompleted}`}
              className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${
                levelColors[day.level] || levelColors[0]
              }`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-primer-border-muted/40 text-[10px] text-primer-fg-muted">
        <span>{t('student.last_3_months')}</span>
        <div className="flex items-center gap-1">
          <span>{t('student.less')}</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-0" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-1 border border-primer-success-muted/30" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-2 border border-primer-success-muted/50" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-3 border border-primer-success-muted/70" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-4 border border-primer-success-muted" />
          </div>
          <span>{t('student.more')}</span>
        </div>
      </div>

    </div>
  );
};
