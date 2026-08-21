import React from 'react';
import { Home, BookOpen, Zap, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type NavTabId = 'home' | 'courses' | 'trainer' | 'progress' | 'roadmap';

interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs: Array<{ id: NavTabId; label: string; icon: React.ElementType }> = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'courses', label: t('nav.courses'), icon: BookOpen },
    { id: 'trainer', label: t('nav.trainer'), icon: Zap },
    { id: 'roadmap', label: 'Roadmap', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-primer-canvas-subtle/95 backdrop-blur border-t border-primer-border-default px-4 shadow-lg md:hidden">
      <div className="max-w-md mx-auto h-full grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'roadmap' && activeTab === 'progress');

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
