import React from 'react';
import { Home, BookOpen, Calendar, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type NavTabId = 'home' | 'courses' | 'roadmap' | 'profile';

interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t, language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const tabs: Array<{ id: NavTabId; label: string; icon: React.ElementType }> = [
    { id: 'home', label: t('nav.home') || (lang === 'KZ' ? 'Басты бет' : lang === 'RU' ? 'Главная' : 'Home'), icon: Home },
    { id: 'courses', label: t('nav.courses') || (lang === 'KZ' ? 'Пәндер' : lang === 'RU' ? 'Предметы' : 'Courses'), icon: BookOpen },
    { id: 'roadmap', label: lang === 'KZ' ? 'Күнтізбе' : lang === 'RU' ? 'Календарь' : 'Calendar', icon: Calendar },
    { id: 'profile', label: lang === 'KZ' ? 'Профиль' : lang === 'RU' ? 'Профиль' : 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-primer-canvas-subtle/95 backdrop-blur border-t border-primer-border-default px-4 shadow-lg md:hidden">
      <div className="max-w-md mx-auto h-full grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-primer-accent-fg font-bold scale-105'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
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

export default BottomNav;
