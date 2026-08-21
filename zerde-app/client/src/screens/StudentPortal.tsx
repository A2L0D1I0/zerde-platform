import React from 'react';
import { NavTabId } from '@/components/layout/BottomNav';
import { StudentHomeScreen } from '@/screens/StudentHomeScreen';
import { CourseCatalogScreen } from '@/screens/CourseCatalogScreen';
import { RoadmapScreen } from '@/screens/RoadmapScreen';
import { StudentProfileScreen } from '@/screens/StudentProfileScreen';

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
            // Can open topic practice modal directly on home or courses
            onTabChange('home');
          }}
        />
      )}

      {/* 3. Calendar & Roadmap View */}
      {activeTab === 'roadmap' && (
        <RoadmapScreen />
      )}

      {/* 4. Student Profile View */}
      {activeTab === 'profile' && (
        <StudentProfileScreen />
      )}
    </div>
  );
};

export default StudentPortal;
