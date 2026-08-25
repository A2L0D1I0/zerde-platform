import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { TeacherDashboard } from './TeacherDashboard';
import { CourseBuilderScreen } from './CourseBuilderScreen';
import { TeacherCalendarScreen } from './TeacherCalendarScreen';

export type TeacherPortalTab = 'dashboard' | 'calendar' | 'builder';

export const TeacherPortal: React.FC = () => {
  const { t, language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TeacherPortalTab>('dashboard');

  return (
    <div className="space-y-4">
      {/* Teacher Hub Subnavigation Tabs */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-2 border-b border-primer-border-default pb-2">
          {/* Tabs Group */}
          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs border border-primer-border-default/60'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('teacher.tab_gradebook')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs border border-primer-border-default/60'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>{t('teacher.tab_calendar')}</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs border border-primer-border-default/60'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>{lang === 'RU' ? 'AI Студия & CoPilot' : lang === 'EN' ? 'AI Studio & CoPilot' : 'AI Студия & CoPilot'}</span>
            </button>
          </div>

          {user?.school && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-mono py-1">
                {user.school}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="animate-in fade-in duration-150">
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            onOpenCourseBuilder={() => setActiveTab('builder')}
          />
        )}

        {activeTab === 'calendar' && (
          <TeacherCalendarScreen
            onOpenClassJournal={() => {
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'builder' && <CourseBuilderScreen />}
      </main>
    </div>
  );
};

export default TeacherPortal;
