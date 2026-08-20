import React from 'react';
import { HeatmapDay } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, GitCommit, Award } from 'lucide-react';

interface ActivityHeatmapProps {
  data?: HeatmapDay[];
  currentStreak?: number;
  longestStreak?: number;
}

// Generate realistic 90 days heatmap data if not passed
export const generateDefaultHeatmapData = (): HeatmapDay[] => {
  const result: HeatmapDay[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // realistic distribution
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    let count = 0;
    const rand = Math.random();

    if (i < 14) {
      // recent streak
      level = (Math.floor(Math.random() * 3) + 2) as 2 | 3 | 4;
      count = level * 2 + 1;
    } else if (rand > 0.35) {
      level = (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4;
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
  data = generateDefaultHeatmapData(),
  currentStreak = 14,
  longestStreak = 28,
}) => {
  const { t } = useLanguage();
  const totalCompleted = data.reduce((sum, d) => sum + d.tasksCompleted, 0);

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
          {data.map((day, idx) => (
            <div
              key={idx}
              title={`${day.date}: ${day.tasksCompleted} тапсырма`}
              className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${
                levelColors[day.level] || levelColors[0]
              }`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-primer-border-muted/40 text-[10px] text-primer-fg-muted">
        <span>Соңғы 3 ай</span>
        <div className="flex items-center gap-1">
          <span>Аз</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-0" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-1" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-2" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-3" />
            <div className="w-2.5 h-2.5 rounded-xs bg-primer-heatmap-4" />
          </div>
          <span>Көп</span>
        </div>
      </div>
    </div>
  );
};
