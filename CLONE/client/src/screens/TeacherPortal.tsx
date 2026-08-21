import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  BookPlus,
  Maximize2,
  Users,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { TeacherDashboard } from './TeacherDashboard';
import { CourseBuilderScreen } from './CourseBuilderScreen';
import { SmartboardScreen } from './SmartboardScreen';

export type TeacherPortalTab = 'dashboard' | 'builder' | 'smartboard' | 'enrollments';

export const TeacherPortal: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TeacherPortalTab>('dashboard');
  const [activeSmartboardClassId, setActiveSmartboardClassId] = useState<string>('1');

  // If in Smartboard full studio mode
  if (activeTab === 'smartboard') {
    return (
      <SmartboardScreen
        classroomId={activeSmartboardClassId}
        onBack={() => setActiveTab('dashboard')}
      />
    );
  }

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
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs border border-primer-border-default/60'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>{t('teacher.tab_ai_studio')}</span>
            </button>

            <button
              onClick={() => {
                setActiveSmartboardClassId('1');
                setActiveTab('smartboard');
              }}
              className="px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap text-primer-attention-fg hover:bg-primer-attention-subtle/30 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t('teacher.tab_smartboard')}</span>
            </button>
          </div>


          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-mono py-1">
              {user?.school || 'NIS IB Astana'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="animate-in fade-in duration-150">
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            onOpenSmartboard={(classId) => {
              setActiveSmartboardClassId(classId);
              setActiveTab('smartboard');
            }}
            onOpenCourseBuilder={() => setActiveTab('builder')}
          />
        )}

        {activeTab === 'builder' && <CourseBuilderScreen />}
      </main>
    </div>
  );
};

export default TeacherPortal;
