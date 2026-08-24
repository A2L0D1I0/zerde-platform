import React, { useState } from 'react';
import { NavTabId } from '@/components/layout/BottomNav';
import { StudentHomeScreen } from '@/screens/StudentHomeScreen';
import { CourseCatalogScreen } from '@/screens/CourseCatalogScreen';
import { RoadmapScreen } from '@/screens/RoadmapScreen';
import { StudentProfileScreen } from '@/screens/StudentProfileScreen';
import { TaskTrainerScreen } from '@/screens/TaskTrainerScreen';

interface StudentPortalProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Бөлшек-рационал теңсіздіктер және интервалдар әдісі');
  const [selectedCourseLanguage, setSelectedCourseLanguage] = useState<'KZ' | 'RU' | 'EN' | 'ANY'>('ANY');

  // Active 3-Block Task Trainer State
  const [activeTrainerTopic, setActiveTrainerTopic] = useState<{
    topicTitle: string;
    subjectName?: string;
    courseId?: number;
  } | null>(null);

  // If Task Trainer is active, render the dedicated 3-block trainer screen
  if (activeTrainerTopic) {
    return (
      <TaskTrainerScreen
        topicTitle={activeTrainerTopic.topicTitle}
        subjectName={activeTrainerTopic.subjectName || 'Математика'}
        courseId={activeTrainerTopic.courseId || 1}
        onClose={() => setActiveTrainerTopic(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {/* 1. Home Dashboard View */}
      {activeTab === 'home' && (
        <StudentHomeScreen
          onNavigateTab={onTabChange}
          activeTopic={selectedTopic}
          courseLanguage={selectedCourseLanguage}
          onStartTrainer={(topic, subject) => {
            setActiveTrainerTopic({
              topicTitle: topic,
              subjectName: subject || 'Математика'
            });
          }}
        />
      )}

      {/* 2. Courses Catalog View */}
      {activeTab === 'courses' && (
        <CourseCatalogScreen
          onStartCourseTopic={(topicTitle, courseLang) => {
            setSelectedTopic(topicTitle);
            if (courseLang) {
              setSelectedCourseLanguage(courseLang);
            }
            setActiveTrainerTopic({
              topicTitle,
              subjectName: 'Математика'
            });
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
