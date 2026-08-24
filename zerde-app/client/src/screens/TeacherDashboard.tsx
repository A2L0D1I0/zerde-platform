import React, { useState, useEffect } from 'react';
import { ClassMatrixResponse, ClassMatrixStudent, DailySignal, SkillMeta } from '@zerde/shared';
import { DailySignalBanner } from '@/features/gradebook/DailySignalBanner';
import { MasteryMatrix } from '@/features/gradebook/MasteryMatrix';
import { StudentSkillModal } from '@/features/gradebook/StudentSkillModal';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Users, School, Sparkles, RefreshCw } from 'lucide-react';
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
  const [classrooms, setClassrooms] = useState<Array<{ id: number; name: string; school: string; students_count?: number; student_count?: number }>>([]);
  const [activeClassId, setActiveClassId] = useState<string>(selectedClassroomId || '');
  const [matrixData, setMatrixData] = useState<ClassMatrixResponse | null>(null);
  const [signalData, setSignalData] = useState<DailySignal | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ClassMatrixStudent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch list of real classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res: any = await api.get('/teacher/classrooms');
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setClassrooms(list);
        if (list.length > 0 && !activeClassId) {
          setActiveClassId(String(list[0].id));
        }
      } catch (err) {
        console.warn('Failed to load classrooms', err);
        setClassrooms([]);
      }
    };
    fetchClassrooms();
  }, []);

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
              <span className="text-xs font-bold text-primer-fg-default">Сыныпты таңдау (Группа):</span>
              <select
                value={activeClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2.5 py-1 text-primer-accent-fg focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis cursor-pointer"
              >
                {classrooms.length === 0 ? (
                  <option value="">Сыныптар жоқ</option>
                ) : (
                  classrooms.map((c) => {
                    const count = c.students_count ?? c.student_count ?? 0;
                    return (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} ({count} оқушы)
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

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-mono gap-1">
            <Users className="w-3 h-3 text-primer-accent-fg" />
            <span>{matrixData?.students_count || 0} оқушы</span>
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primer-accent-fg" />
          <span>Журнал мәліметтері жүктелуде...</span>
        </div>
      ) : (
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
      )}

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
    </div>
  );
};

export default TeacherDashboard;
