import React from 'react';
import { Home, BookOpen, Target, BarChart2 } from 'lucide-react';
import { Language } from '../types';

export type NavTab = 'home' | 'subjects' | 'tasks' | 'progress';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentLang: Language;
}

const navConfig: Record<Language, Array<{ id: NavTab; label: string; icon: React.ElementType }>> = {
  KZ: [
    { id: 'home', label: 'Басты', icon: Home },
    { id: 'subjects', label: 'Пәндер', icon: BookOpen },
    { id: 'tasks', label: 'Тапсырма', icon: Target },
    { id: 'progress', label: 'Прогресс', icon: BarChart2 }
  ],
  RU: [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'subjects', label: 'Предметы', icon: BookOpen },
    { id: 'tasks', label: 'Тренажер', icon: Target },
    { id: 'progress', label: 'Прогресс', icon: BarChart2 }
  ],
  EN: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tasks', label: 'Trainer', icon: Target },
    { id: 'progress', label: 'Insights', icon: BarChart2 }
  ]
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, currentLang }) => {
  const tabs = navConfig[currentLang];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur border-t border-[#d0d7de] px-4 py-2 shadow-md">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                isActive 
                  ? 'text-[#0969da]' 
                  : 'text-[#656d76] hover:text-[#1f2328]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
