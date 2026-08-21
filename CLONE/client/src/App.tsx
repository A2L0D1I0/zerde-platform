import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import { Header } from '@/components/layout/Header';
import { BottomNav, NavTabId } from '@/components/layout/BottomNav';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { AuthScreen } from '@/screens/AuthScreen';
import { StudentPortal } from '@/screens/StudentPortal';
import { TeacherPortal } from '@/screens/TeacherPortal';
import { StreakSaverModal } from '@/components/notifications/StreakSaverModal';

const MainLayout: React.FC = () => {
  const { isAuthenticated, role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStreakSaverOpen, setIsStreakSaverOpen] = useState(false);

  // Global keydown for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-primer-canvas-default text-primer-fg-default font-sans antialiased pb-20 md:pb-6 transition-colors selection:bg-primer-accent-emphasis selection:text-white">
      {/* 1. GitHub Primer Header */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTrainer={(topicId) => setActiveTab('trainer')}
        onOpenStreakSaver={() => setIsStreakSaverOpen(true)}
      />

      {/* 2. Main Portal Routing */}
      <main className="py-2 sm:py-4">
        {role === 'teacher' ? (
          <TeacherPortal />
        ) : (
          <StudentPortal
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </main>

      {/* 3. Mobile Bottom Nav (56px) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 4. Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab: string) => {
          if (['home', 'courses', 'trainer', 'progress', 'roadmap'].includes(tab)) {
            setActiveTab(tab as NavTabId);
          }
        }}
      />

      {/* 5. Duolingo Streak Saver Modal */}
      <StreakSaverModal
        isOpen={isStreakSaverOpen}
        onClose={() => setIsStreakSaverOpen(false)}
        onStartFocus={() => {
          setIsStreakSaverOpen(false);
          setActiveTab('trainer');
        }}
        streakDays={user?.streakDays || 12}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <MainLayout />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
