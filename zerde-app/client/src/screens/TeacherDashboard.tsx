import React, { useState, useEffect } from 'react';
import { ClassMatrixResponse, ClassMatrixStudent, DailySignal, SkillMeta } from '@zerde/shared';
import { DailySignalBanner } from '@/features/gradebook/DailySignalBanner';
import { MasteryMatrix } from '@/features/gradebook/MasteryMatrix';
import { StudentSkillModal } from '@/features/gradebook/StudentSkillModal';
import { ApplicationsModerationModal } from '@/features/admission/ApplicationsModerationModal';
import { CreateClassroomModal } from '@/features/classroom/CreateClassroomModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Users, School, Sparkles, RefreshCw, Bell, UserPlus, BookOpen, Plus, PlusCircle } from 'lucide-react';
import api from '@/api/client';

interface TeacherDashboardProps {
  onOpenSmartboard?: (classroomId: string) => void;
  onOpenCourseBuilder?: () => void;
  selectedClassroomId?: string;
  onSelectClassroom?: (id: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenSmartboard,
  onOpenCourseBuilder,
  selectedClassroomId,
  onSelectClassroom,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState<Array<{ id: number; name: string; school: string; students_count?: number; student_count?: number }>>([]);
  const [activeClassId, setActiveClassId] = useState<string>(selectedClassroomId || '');
  const [matrixData, setMatrixData] = useState<ClassMatrixResponse | null>(null);
  const [signalData, setSignalData] = useState<DailySignal | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ClassMatrixStudent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Admission applications moderation
  const [isAppsModalOpen, setIsAppsModalOpen] = useState<boolean>(false);
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0);

  // Create classroom modal
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState<boolean>(false);

  // Fetch list of real classrooms
  const fetchClassrooms = async () => {
    try {
      const res: any = await api.get('/teacher/classrooms');
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setClassrooms(list);
      if (list.length > 0 && (!activeClassId || !list.some((c: any) => String(c.id) === String(activeClassId)))) {
        setActiveClassId(String(list[0].id));
      }
    } catch (err) {
      console.warn('Failed to load classrooms', err);
      setClassrooms([]);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchApplicationsCount();
  }, []);

  // Fetch pending applications count
  const fetchApplicationsCount = async () => {
    try {
      const res: any = await api.get('/teacher/courses/1/applications');
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const pending = list.filter((a: any) => a.status === 'applied' || a.status === 'pending_approval');
      setPendingAppsCount(pending.length);
    } catch (err) {
      console.warn('Failed to load applications count', err);
      setPendingAppsCount(0);
    }
  };

  // Fetch matrix and signal for active classroom
  useEffect(() => {
    if (!activeClassId) {
      setMatrixData(null);
      setSignalData(null);
      return;
    }

    const loadTeacherData = async () => {
      setIsLoading(true);
      try {
        const [matrixRes, signalRes]: [any, any] = await Promise.all([
          api.get(`/teacher/class-matrix?classroomId=${activeClassId}`),
          api.get(`/teacher/lesson-signal?classroomId=${activeClassId}`),
        ]);
        const matrix = matrixRes?.data || matrixRes;
        const signal = signalRes?.data || signalRes;
        setMatrixData(matrix);
        setSignalData(signal);
      } catch (err) {
        console.error('[TeacherDashboard] Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTeacherData();
  }, [activeClassId]);

  const handleClassChange = (newClassId: string) => {
    setActiveClassId(newClassId);
    if (onSelectClassroom) {
      onSelectClassroom(newClassId);
    }
  };

  const handleClassroomCreated = (newClass: { id: number; name: string; school: string; student_count: number }) => {
    setClassrooms((prev) => [...prev, newClass]);
    setActiveClassId(String(newClass.id));
    if (onSelectClassroom) {
      onSelectClassroom(String(newClass.id));
    }
  };

  const currentClass = classrooms.find((c) => String(c.id) === String(activeClassId));
  const displaySchool = user?.school || currentClass?.school || '';

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 space-y-4 py-2">
      {/* Group & Classroom Selector Toolbar */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 shadow-primer-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primer-accent-emphasis text-white flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primer-fg-default">{t('teacher.select_classroom_label')}</span>
              <select
                value={activeClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2.5 py-1 text-primer-accent-fg focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis cursor-pointer"
              >
                {classrooms.length === 0 ? (
                  <option value="">{t('teacher.no_classrooms_option')}</option>
                ) : (
                  classrooms.map((c) => {
                    const count = c.students_count ?? c.student_count ?? 0;
                    return (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} ({count} {t('common.students') || 'оқушы'})
                      </option>
                    );
                  })
                )}
              </select>
            </div>
            {displaySchool && (
              <p className="text-[11px] text-primer-fg-muted flex items-center gap-1 mt-0.5">
                <School className="w-3 h-3 text-primer-accent-fg" />
                <span>{displaySchool}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Create Classroom Quick Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateClassModalOpen(true)}
            className="text-xs gap-1.5 h-8 font-semibold shadow-xs hover:border-primer-accent-emphasis"
          >
            <Plus className="w-3.5 h-3.5 text-primer-accent-fg" />
            <span>{t('teacher.create_classroom_btn')}</span>
          </Button>

          {/* Applications Moderation Button */}
          <Button
            size="sm"
            variant={pendingAppsCount > 0 ? 'primary' : 'outline'}
            onClick={() => setIsAppsModalOpen(true)}
            className={`text-xs gap-1.5 h-8 font-semibold shadow-xs ${
              pendingAppsCount > 0 ? 'animate-pulse' : ''
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>
              {pendingAppsCount > 0 ? `${t('teacher.applications_btn')} (${pendingAppsCount})` : t('teacher.applications_btn')}
            </span>
          </Button>

          {onOpenCourseBuilder && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenCourseBuilder}
              className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>Course Studio</span>
            </Button>
          )}

          <Badge variant="outline" className="text-[11px] font-mono gap-1">
            <Users className="w-3 h-3 text-primer-accent-fg" />
            <span>{matrixData?.students_count || 0} {t('common.students') || 'оқушы'}</span>
          </Badge>
        </div>
      </div>

      {/* Zero Classrooms Friendly Banner */}
      {classrooms.length === 0 && !isLoading && (
        <div className="p-8 rounded-xl border border-dashed border-primer-border-default bg-primer-canvas-subtle text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primer-accent-emphasis/10 text-primer-accent-fg mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-primer-fg-default">
              {t('teacher.no_classrooms_banner_title')}
            </h3>
            <p className="text-xs text-primer-fg-muted">
              {t('teacher.no_classrooms_banner_desc')}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateClassModalOpen(true)}
            className="text-xs font-semibold gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('teacher.create_classroom_btn')}</span>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primer-accent-fg" />
          <span>{t('teacher.loading_data')}</span>
        </div>
      ) : classrooms.length > 0 ? (
        <>
          {/* 1. Signal of the Day Banner for Selected Group */}
          <DailySignalBanner
            signal={signalData}
            onOpenSmartboard={() => onOpenSmartboard && onOpenSmartboard(activeClassId)}
          />

          {/* 2. Live Class Mastery Matrix (Selected Class x Microcompetencies) */}
          <MasteryMatrix
            data={matrixData}
            onSelectStudentSkill={(std, skill) => {
              setSelectedStudent(std);
              setSelectedSkill(skill);
            }}
          />
        </>
      ) : null}

      {/* 3. Student Skill Detail Modal */}
      <StudentSkillModal
        isOpen={!!selectedStudent && !!selectedSkill}
        onClose={() => {
          setSelectedStudent(null);
          setSelectedSkill(null);
        }}
        student={selectedStudent}
        skill={selectedSkill}
      />

      {/* 4. Applications Moderation Modal */}
      <ApplicationsModerationModal
        isOpen={isAppsModalOpen}
        onClose={() => setIsAppsModalOpen(false)}
        courseId={1}
        classrooms={classrooms.map((c) => ({ id: c.id, name: c.name }))}
        onUpdated={fetchApplicationsCount}
      />

      {/* 5. Create Classroom Modal */}
      <CreateClassroomModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        onClassroomCreated={handleClassroomCreated}
      />
    </div>
  );
};

export default TeacherDashboard;
