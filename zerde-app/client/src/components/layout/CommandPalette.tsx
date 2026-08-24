import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  BookOpen,
  Zap,
  Moon,
  Sun,
  UserCheck,
  GraduationCap,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { role } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const items = [
    // Navigation
    {
      category: t('palette.navigation'),
      id: 'nav-home',
      title: `${t('nav.home')} / Dashboard`,
      icon: Sparkles,
      action: () => {
        onNavigateTab?.('home');
        onClose();
      },
    },
    {
      category: t('palette.navigation'),
      id: 'nav-courses',
      title: `${t('nav.courses')} (Алгебра, Физика, Химия)`,
      icon: BookOpen,
      action: () => {
        onNavigateTab?.('courses');
        onClose();
      },
    },
    {
      category: t('palette.navigation'),
      id: 'nav-trainer',
      title: `${t('nav.trainer')} & Socratic «Аға»`,
      icon: Zap,
      action: () => {
        onNavigateTab?.('trainer');
        onClose();
      },
    },
    {
      category: t('palette.navigation'),
      id: 'nav-progress',
      title: `${t('nav.progress')} & ELO Matrix`,
      icon: Flame,
      action: () => {
        onNavigateTab?.('progress');
        onClose();
      },
    },
    // Actions & Tools
    {
      category: t('palette.actions'),
      id: 'toggle-theme',
      title: `${t('palette.switch_theme')} (${theme === 'dark' ? 'Light' : 'Dark'})`,
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        showToast({
          type: 'info',
          title: language === 'KZ' ? 'Тема өзгертілді' : language === 'RU' ? 'Тема изменена' : 'Theme updated',
          message: `${theme === 'dark' ? 'Light' : 'Dark'}`,
        });
        onClose();
      },
    },
    {
      category: t('palette.actions'),
      id: 'lang-kz',
      title: 'Тілді ауыстыру: Қазақша (KZ)',
      icon: ArrowRight,
      action: () => {
        setLanguage('KZ');
        onClose();
      },
    },
    {
      category: t('palette.actions'),
      id: 'lang-ru',
      title: 'Сменить язык: Русский (RU)',
      icon: ArrowRight,
      action: () => {
        setLanguage('RU');
        onClose();
      },
    },
    {
      category: t('palette.actions'),
      id: 'lang-en',
      title: 'Change language: English (EN)',
      icon: ArrowRight,
      action: () => {
        setLanguage('EN');
        onClose();
      },
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('palette.title')}</DialogTitle>
        </DialogHeader>

        {/* Search input box */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
          <Search className="w-4 h-4 text-primer-fg-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('palette.placeholder')}
            autoFocus
            className="w-full bg-transparent text-xs text-primer-fg-default placeholder:text-primer-fg-subtle outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-primer-fg-muted bg-primer-canvas-inset border border-primer-border-default rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-primer-fg-muted">
              {t('palette.empty')}
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs text-primer-fg-default hover:bg-primer-accent-emphasis hover:text-white group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 text-primer-fg-muted group-hover:text-white shrink-0" />
                    <span className="truncate font-medium">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-primer-fg-subtle group-hover:text-white/80 shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-primer-canvas-inset border-t border-primer-border-muted text-[10px] text-primer-fg-muted">
          <span>Zerde Command Palette</span>
          <div className="flex items-center gap-2">
            <span>↑↓ шарлау</span>
            <span>↵ таңдау</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
