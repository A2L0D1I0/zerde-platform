import React from 'react';
import { BookOpen, CircleDot, Play, BarChart2 } from 'lucide-react';
import { Language } from '../types';

export type SubNavTab = 'overview' | 'topics' | 'trainer' | 'insights';

interface UnderlineNavProps {
  activeTab: SubNavTab;
  onTabChange: (tab: SubNavTab) => void;
  currentLang: Language;
  topicsCount: number;
}

const tabLabels: Record<Language, {
  overview: string;
  topics: string;
  trainer: string;
  insights: string;
}> = {
  KZ: {
    overview: 'Шолу (Overview)',
    topics: 'Тақырыптар',
    trainer: 'Тренажер',
    insights: 'ELO Талдау'
  },
  RU: {
    overview: 'Обзор',
    topics: 'Темы',
    trainer: 'Тренажер',
    insights: 'ELO Анализ'
  },
  EN: {
    overview: 'Overview',
    topics: 'Topics',
    trainer: 'Trainer',
    insights: 'Insights'
  }
};

export const UnderlineNav: React.FC<UnderlineNavProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  topicsCount
}) => {
  const t = tabLabels[currentLang];

  const tabs: Array<{ id: SubNavTab; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'overview', label: t.overview, icon: BookOpen },
    { id: 'topics', label: t.topics, icon: CircleDot, count: topicsCount },
    { id: 'trainer', label: t.trainer, icon: Play },
    { id: 'insights', label: t.insights, icon: BarChart2 }
  ];

  return (
    <div className="bg-[#ffffff] border-b border-[#d0d7de] px-4 pt-1">
      <div className="max-w-md mx-auto flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-[#fd8c73] text-[#1f2328]'
                  : 'border-transparent text-[#656d76] hover:text-[#1f2328] hover:border-[#d0d7de]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#eaeef2] text-[#1f2328] border border-[#d0d7de]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
