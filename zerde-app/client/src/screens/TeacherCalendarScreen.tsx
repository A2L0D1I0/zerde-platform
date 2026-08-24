import React from 'react';
import { CalendarRoadmap } from '@/features/roadmap/CalendarRoadmap';

interface TeacherCalendarScreenProps {
  onOpenClassJournal?: (classId: string) => void;
}

export const TeacherCalendarScreen: React.FC<TeacherCalendarScreenProps> = () => {
  return <CalendarRoadmap role="teacher" />;
};

export default TeacherCalendarScreen;
