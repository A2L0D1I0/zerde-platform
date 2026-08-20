import React from 'react';
import { GitCommit } from 'lucide-react';
import { HeatmapDay, Language } from '../types';

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  currentLang: Language;
}

// GitHub Light Contributions Color Scale
const levelBgMap: Record<number, string> = {
  0: 'bg-[#ebedf0] border-[#d0d7de]',
  1: 'bg-[#9be9a8] border-[#40c463]/50',
  2: 'bg-[#40c463] border-[#30a14e]/50',
  3: 'bg-[#30a14e] border-[#216e39]/50',
  4: 'bg-[#216e39] border-[#195229]/60 shadow-[0_0_4px_rgba(33,110,57,0.3)]',
};

const i18n = {
  KZ: {
    title: '84 оқу жаттығуы (2026 ж. 1-тоқсан)',
    streak: '🔥 12 күн қатарынан',
    less: 'Less',
    more: 'More',
    dayPrefix: 'Күн'
  },
  RU: {
    title: '84 учебных действия (2026 г. 1-я четверть)',
    streak: '🔥 12 дней подряд',
    less: 'Меньше',
    more: 'Больше',
    dayPrefix: 'День'
  },
  EN: {
    title: '84 study contributions in 2026 (Q1)',
    streak: '🔥 12-day streak',
    less: 'Less',
    more: 'More',
    dayPrefix: 'Day'
  }
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, currentLang }) => {
  const t = i18n[currentLang];

  return (
    <section className="bg-[#ffffff] border border-[#d0d7de] rounded-lg p-3.5 space-y-2.5 shadow-2xs">
      
      {/* GitHub Contribution Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
          <GitCommit className="w-3.5 h-3.5 text-[#1a7f37]" />
          {t.title}
        </span>
        <span className="text-xs font-semibold text-[#9a6700] font-mono">{t.streak}</span>
      </div>

      {/* Heatmap Grid (Weeks / Days) */}
      <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-2.5">
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {data.map((day, idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-xs border transition-transform hover:scale-125 cursor-pointer flex-shrink-0 ${levelBgMap[day.level]}`}
              title={`${t.dayPrefix} ${idx + 1}: ${day.tasksCompleted} tasks`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-[#656d76] mt-2 pt-1 border-t border-[#d0d7de]">
          <span>Learn activity overview</span>
          <div className="flex items-center gap-1">
            <span>{t.less}</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#ebedf0] border border-[#d0d7de] inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#9be9a8] inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#40c463] inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#30a14e] inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#216e39] inline-block" />
            <span>{t.more}</span>
          </div>
        </div>
      </div>

    </section>
  );
};
