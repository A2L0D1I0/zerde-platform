import React from 'react';
import { NavTabId } from '@/components/layout/BottomNav';
import { StudentHomeScreen } from '@/screens/StudentHomeScreen';
import { CourseCatalogScreen } from '@/screens/CourseCatalogScreen';
import { TrainerScreen } from '@/screens/TrainerScreen';
import { RoadmapScreen } from '@/screens/RoadmapScreen';

interface StudentPortalProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-full">
      {/* 1. Home Dashboard View */}
      {activeTab === 'home' && (
        <StudentHomeScreen onNavigateTab={onTabChange} />
      )}

      {/* 2. Courses Catalog View */}
      {activeTab === 'courses' && (
        <CourseCatalogScreen
          onStartCourseTopic={(topicTitle) => {
            onTabChange('trainer');
          }}
        />
      )}

      {/* 3. Socratic AI Trainer View */}
      {activeTab === 'trainer' && (
        <div className="animate-in fade-in duration-150">
          <TrainerScreen />
        </div>
      )}

      {/* 4. Roadmap & Progress View */}
      {(activeTab === 'progress' || activeTab === 'roadmap') && (
        <RoadmapScreen />
      )}
    </div>
  );
};

export default StudentPortal;
