import React, { useState } from 'react';
import {
  Flame,
  Globe,
  Bell,
  Search,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  GraduationCap,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { AppLanguage } from '@/types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

import { NavTabId } from '@/components/layout/BottomNav';
import {
  Home,
  BookOpen as BookOpenIcon,
  Zap as ZapIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenTrainer?: (topicId?: string) => void;
  onOpenStreakSaver?: () => void;
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenTrainer,
  onOpenStreakSaver,
  activeTab = 'home',
  onTabChange,
}) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const studentNavTabs = [
    { id: 'home' as NavTabId, label: t('nav.home') || (lang === 'KZ' ? 'Басты бет' : lang === 'RU' ? 'Главная' : 'Home'), icon: Home },
    { id: 'courses' as NavTabId, label: t('nav.courses') || (lang === 'KZ' ? 'Пәндер' : lang === 'RU' ? 'Предметы' : 'Courses'), icon: BookOpenIcon },
    { id: 'roadmap' as NavTabId, label: lang === 'KZ' ? 'Күнтізбе' : lang === 'RU' ? 'Календарь' : 'Calendar', icon: CalendarIcon },
    { id: 'profile' as NavTabId, label: lang === 'KZ' ? 'Профиль' : lang === 'RU' ? 'Профиль' : 'Profile', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-30 bg-primer-canvas-default/95 backdrop-blur border-b border-primer-border-default px-3.5 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Brand & Search & Desktop Nav */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          {/* Brand */}
          <div
            onClick={() => onTabChange && onTabChange('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-primer-fg-default leading-none">
                {t('brand.title')}
              </span>
              <span className="text-[10px] text-primer-fg-subtle mt-0.5">
                {role === 'teacher' ? t('role.teacher') : t('role.student')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links for Students */}
          {role === 'student' && onTabChange && (
            <nav className="hidden lg:flex items-center gap-1">
              {studentNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-primer-canvas-subtle text-primer-accent-fg border border-primer-border-default shadow-xs'
                        : 'text-primer-fg-muted hover:text-primer-fg-default hover:bg-primer-canvas-subtle/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Quick Search / Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-primer-fg-muted bg-primer-canvas-subtle hover:bg-primer-border-default/30 border border-primer-border-default rounded-md transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('header.search_placeholder')}</span>
            <span className="md:hidden">Іздеу</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono bg-primer-canvas-inset border border-primer-border-default rounded text-primer-fg-subtle">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* ELO Rank & Streak Flame Pills (Students Only) */}
          {role === 'student' && (
            <>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primer-canvas-subtle border border-primer-border-default text-xs font-semibold text-primer-fg-default shadow-primer-xs">
                <span>{user?.eloRank?.symbol || '🌱'}</span>
                <span className="text-primer-success-fg font-mono font-bold">
                  {user?.elo ?? user?.overallElo ?? 1000}
                </span>
                <span className="text-primer-fg-subtle text-[10px]">XP</span>
              </div>

              <div
                onClick={onOpenStreakSaver}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primer-attention-subtle border border-primer-attention-muted/60 text-xs font-bold text-primer-attention-fg shadow-primer-xs cursor-pointer hover:bg-primer-attention-subtle/80 transition"
              >
                <Flame className="w-3.5 h-3.5 text-primer-attention-fg fill-primer-attention-fg" />
                <span className="font-mono">{user?.streakDays ?? 0}</span>
              </div>
            </>
          )}

          {/* Language Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1 px-2 h-7">
                <Globe className="w-3.5 h-3.5 text-primer-fg-muted" />
                <span className="font-mono text-xs">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Тіл / Язык</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage('KZ')} className="justify-between">
                <span>Қазақша</span>
                {language === 'KZ' && <CheckCircle2 className="w-3.5 h-3.5 text-primer-success-fg" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('RU')} className="justify-between">
                <span>Русский</span>
                {language === 'RU' && <CheckCircle2 className="w-3.5 h-3.5 text-primer-success-fg" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('EN')} className="justify-between">
                <span>English</span>
                {language === 'EN' && <CheckCircle2 className="w-3.5 h-3.5 text-primer-success-fg" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Duolingo Notification Center */}
          <NotificationCenter
            onOpenTrainer={onOpenTrainer}
            onOpenStreakSaver={onOpenStreakSaver}
          />

          {/* User Profile Avatar & Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 pl-1 pr-1.5 py-0.5 rounded-full hover:bg-primer-canvas-subtle border border-primer-border-default/50 transition cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.full_name?.charAt(0) || 'Ә'}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2.5 py-2">
                <div className="text-xs font-bold text-primer-fg-default truncate">
                  {user?.full_name || (lang === 'KZ' ? 'Оқушы' : lang === 'RU' ? 'Ученик' : 'Student')}
                </div>
                <div className="text-[11px] text-primer-fg-muted truncate">{user?.email}</div>
                <div className="mt-1 flex items-center gap-1">
                  <Badge variant={role === 'teacher' ? 'done' : 'accent'} className="text-[9px] py-0">
                    {role === 'teacher' ? t('role.teacher') : t('role.student')}
                  </Badge>
                  {user?.grade && (
                    <Badge variant="outline" className="text-[9px] py-0 font-mono">
                      {String(user.grade).includes('сынып') || String(user.grade).includes('класс') || String(user.grade).includes('Grade')
                        ? String(user.grade)
                        : `${user.grade}-сынып`}
                    </Badge>
                  )}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Theme Toggle */}
              <DropdownMenuItem onClick={toggleTheme} className="gap-2 cursor-pointer">
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-primer-attention-fg" />
                    <span>
                      {lang === 'KZ' ? 'Жарық тақырып (Light)' : lang === 'RU' ? 'Светлая тема (Light)' : 'Light Theme'}
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-primer-accent-fg" />
                    <span>
                      {lang === 'KZ' ? 'Қараңғы тақырып (Dark)' : lang === 'RU' ? 'Темная тема (Dark)' : 'Dark Theme'}
                    </span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem onClick={logout} className="gap-2 text-primer-danger-fg cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

      </div>
    </header>
  );
};
