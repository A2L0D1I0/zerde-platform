import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Users,
  Sparkles,
  TrendingUp,
  Brain,
  Layers,
  Flame,
  Check,
  X,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  BookPlus,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { MathText } from '@/components/ui/MathText';
import {
  teacherApi,
  ClassMatrixResponse,
  ClassMatrixStudent,
  SkillHeaderMeta,
  LessonSignalData,
  EnrollmentRequest,
  StudentSkillMastery,
} from '@/api/teacherApi';
import { StudentSkillDetailModal } from '@/components/teacher/StudentSkillDetailModal';
import { KundelikExportModal } from '@/components/teacher/KundelikExportModal';

interface TeacherDashboardProps {
  onOpenSmartboard?: (classroomId: string) => void;
  onOpenCourseBuilder?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenSmartboard,
  onOpenCourseBuilder,
}) => {
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();

  const { showToast } = useToast();

  // Selected Classroom (9 «А», 9 «Б», 10 «А», 10 «Б»)
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('1');
  const [classroomData, setClassroomData] = useState<ClassMatrixResponse | null>(null);
  const [lessonSignal, setLessonSignal] = useState<LessonSignalData | null>(null);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Search & Filter in Class Matrix
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'deficit_only' | 'mastered_only'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'elo' | 'deficits'>('elo');

  // Modal State for Student Skill Details
  const [selectedStudent, setSelectedStudent] = useState<ClassMatrixStudent | null>(null);
  const [selectedSkillMeta, setSelectedSkillMeta] = useState<SkillHeaderMeta | null>(null);
  const [selectedSkillData, setSelectedSkillData] = useState<StudentSkillMastery | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Kundelik Export Modal State
  const [isKundelikModalOpen, setIsKundelikModalOpen] = useState<boolean>(false);

  // Load Data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [matrixRes, signalRes, enrollmentsRes] = await Promise.all([
        teacherApi.getClassMatrix(selectedClassroomId),
        teacherApi.getLessonSignal(selectedClassroomId),
        teacherApi.getEnrollmentRequests(),
      ]);

      setClassroomData(matrixRes);
      setLessonSignal(signalRes);
      setEnrollmentRequests(enrollmentsRes);
    } catch (e) {
      console.error('[TeacherDashboard] Failed to fetch data', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Live Sync trigger
  const handleLiveSync = async () => {
    setIsSyncing(true);
    try {
      const matrixRes = await teacherApi.getClassMatrix(selectedClassroomId);
      setClassroomData(matrixRes);
      showToast({
        type: 'success',
        title: 'Синхрондалды ✅',
        message: 'Оқушылардың соңғы коммиттері мен ELO көрсеткіштері жаңартылды.',
      });
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Express 1-click Approval
  const handleApproveEnrollment = async (req: EnrollmentRequest) => {
    await teacherApi.approveEnrollment(req.courseId, req.studentId);
    setEnrollmentRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast({
      type: 'success',
      title: 'Өтініш мақұлданды! 🚀',
      message: `${req.studentName} курсқа сәтті қабылданды (1-Click Enrolled).`,
    });
  };

  // Express Reject
  const handleRejectEnrollment = async (req: EnrollmentRequest) => {
    await teacherApi.rejectEnrollment(req.courseId, req.studentId);
    setEnrollmentRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast({
      type: 'attention',
      title: 'Өтініш қайтарылды',
      message: `${req.studentName} оқушының өтініші кері қайтарылды.`,
    });
  };

  // Cell Click Handler
  const handleCellClick = (
    student: ClassMatrixStudent,
    skill: SkillHeaderMeta,
    skillData: StudentSkillMastery
  ) => {
    setSelectedStudent(student);
    setSelectedSkillMeta(skill);
    setSelectedSkillData(skillData);
    setIsDetailModalOpen(true);
  };

  // Filtered & Sorted Student Matrix
  const filteredStudents = useMemo(() => {
    if (!classroomData?.matrix) return [];

    let list = [...classroomData.matrix];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.student_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }

    if (statusFilter === 'deficit_only') {
      list = list.filter((s) =>
        Object.values(s.skills).some((sk) => sk.status === 'deficit')
      );
    } else if (statusFilter === 'mastered_only') {
      list = list.filter((s) =>
        Object.values(s.skills).every((sk) => sk.status === 'mastered')
      );
    }

    if (sortBy === 'elo') {
      list.sort((a, b) => b.current_elo - a.current_elo);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.student_name.localeCompare(b.student_name));
    } else if (sortBy === 'deficits') {
      list.sort((a, b) => {
        const defA = Object.values(a.skills).filter((s) => s.status === 'deficit').length;
        const defB = Object.values(b.skills).filter((s) => s.status === 'deficit').length;
        return defB - defA;
      });
    }

    return list;
  }, [classroomData, searchQuery, statusFilter, sortBy]);

  // Traffic Light Class Stats Calculation
  const trafficLightStats = useMemo(() => {
    if (!classroomData?.matrix || classroomData.matrix.length === 0) {
      return { mastered: 0, inProgress: 0, deficit: 0, avgElo: 1420, avgStreak: 14 };
    }

    let totalMastered = 0;
    let totalInProgress = 0;
    let totalDeficit = 0;
    let totalSkillsCount = 0;
    let totalElo = 0;
    let totalStreak = 0;

    classroomData.matrix.forEach((std) => {
      totalElo += std.current_elo;
      totalStreak += std.streak_days;

      Object.values(std.skills).forEach((sk) => {
        totalSkillsCount++;
        if (sk.status === 'mastered') totalMastered++;
        else if (sk.status === 'in_progress') totalInProgress++;
        else totalDeficit++;
      });
    });

    return {
      mastered: Math.round((totalMastered / Math.max(1, totalSkillsCount)) * 100),
      inProgress: Math.round((totalInProgress / Math.max(1, totalSkillsCount)) * 100),
      deficit: Math.round((totalDeficit / Math.max(1, totalSkillsCount)) * 100),
      avgElo: Math.round(totalElo / classroomData.matrix.length),
      avgStreak: Math.round(totalStreak / classroomData.matrix.length),
    };
  }, [classroomData]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-3.5 sm:px-6 py-2">
      {/* ========================================================================= */}
      {/* 1. TOP CONTROLS & CLASS SELECTOR BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-primer-canvas-subtle border border-primer-border-default shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primer-done-emphasis text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            {user?.full_name?.charAt(0) || 'А'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-primer-fg-default">
                {user?.full_name || 'Айгүл Серікқызы'}
              </h2>
              <Badge variant="done" className="text-[10px] py-0 font-mono">
                Мұғалім
              </Badge>
            </div>
            <p className="text-[11px] text-primer-fg-muted">
              {user?.school || 'NIS IB Astana'} • 24 оқушы • 16 микронавык
            </p>
          </div>
        </div>

        {/* Desktop & Mobile Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-primer-canvas-inset px-2.5 py-1 rounded-lg border border-primer-border-muted text-xs">
            <span className="font-semibold text-primer-fg-muted">Сынып:</span>
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="bg-transparent font-bold text-primer-fg-default outline-none cursor-pointer"
            >
              <option value="1">9 «А» (24 оқушы)</option>
              <option value="2">9 «Б» (24 оқушы)</option>
              <option value="3">10 «А» (22 оқушы)</option>
              <option value="4">10 «Б» (25 оқушы)</option>
            </select>
          </div>

          {/* 1-Click Kundelik Export Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsKundelikModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-primer-accent-fg" />
            <span>Kundelik Экспорт</span>
          </Button>

          {/* Smartboard F11 Mode Button */}
          {onOpenSmartboard && (
            <Button
              variant="attention"
              size="sm"
              onClick={() => onOpenSmartboard(selectedClassroomId)}
              className="gap-1.5 font-bold text-xs shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Смарт-доска (F11)</span>
            </Button>
          )}

          {/* Live Sync Indicator */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLiveSync}
            disabled={isSyncing}
            className="text-primer-fg-muted hover:text-primer-fg-default"
            title="Live-синхронизация"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primer-accent-fg' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. «СИГНАЛ ДНЯ» — КЛАСТЕРНЫЙ ДЕФИЦИТ ЗА 5 СЕКУНД (Mobile & Desktop) */}
      {/* ========================================================================= */}
      {lessonSignal && (
        <div className="rounded-xl border-2 border-primer-attention-emphasis/70 bg-primer-attention-subtle/30 p-3.5 sm:p-4 space-y-2.5 shadow-primer-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-primer-attention-fg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>«Сигнал дня» — Басты кластерлік дефицит ({classroomData?.classroom_name || '9 «А»'})</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="attention" className="text-xs font-mono font-bold">
                {lessonSignal.cluster_deficit.affected_students_count} оқушыда ортақ қате ({lessonSignal.cluster_deficit.percentage}%)
              </Badge>
            </div>
          </div>

          <div className="text-xs text-primer-fg-default leading-relaxed font-medium">
            <strong>Тақырып:</strong> {lessonSignal.topic_title} — {lessonSignal.cluster_deficit.misconception_kz}
          </div>

          {/* Affected students preview badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-primer-fg-muted">Қате жібергендер:</span>
            {lessonSignal.cluster_deficit.affected_students.slice(0, 6).map((std) => (
              <Badge key={std.id} variant="outline" className="text-[10px] font-mono py-0">
                {std.name} ({Math.round(std.probability * 100)}%)
              </Badge>
            ))}
            {lessonSignal.cluster_deficit.affected_students.length > 6 && (
              <span className="text-[10px] text-primer-fg-subtle">
                +{lessonSignal.cluster_deficit.affected_students.length - 6} оқушы
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-primer-attention-muted/40">
            <span className="text-[11px] text-primer-fg-muted flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>ИИ ұсынысы: Сабақ басында смарт-доскаға 5 минуттық экспресс-разминка шығару.</span>
            </span>

            {onOpenSmartboard && (
              <Button
                variant="attention"
                size="xs"
                onClick={() => onOpenSmartboard(selectedClassroomId)}
                className="font-bold gap-1 self-end sm:self-auto"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Смарт-доскаға шығару</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. СВЕТОФОРНАЯ СВОДКА УСПЕВАЕМОСТИ & ЭКСПРЕСС-ОДОБРЕНИЕ ЗАЯВОК */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 8 Cols: Traffic Light Class Overview */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Green: Mastered */}
          <Card className="p-3 bg-primer-canvas-subtle border-primer-border-default">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primer-success-fg" />
              <span>🟢 Усвоено (≥70%)</span>
            </div>
            <div className="text-xl font-bold font-mono text-primer-success-fg mt-1">
              {trafficLightStats.mastered}%
            </div>
            <div className="text-[10px] text-primer-fg-subtle mt-0.5">Кластерлік меңгеру</div>
          </Card>

          {/* Yellow: In Progress */}
          <Card className="p-3 bg-primer-canvas-subtle border-primer-border-default">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primer-attention-fg" />
              <span>🟡 В процессе (40-69%)</span>
            </div>
            <div className="text-xl font-bold font-mono text-primer-attention-fg mt-1">
              {trafficLightStats.inProgress}%
            </div>
            <div className="text-[10px] text-primer-fg-subtle mt-0.5">Пысықтау үстінде</div>
          </Card>

          {/* Red: Deficit */}
          <Card className="p-3 bg-primer-canvas-subtle border-primer-border-default">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primer-danger-fg" />
              <span>🔴 Пробел (&lt;40%)</span>
            </div>
            <div className="text-xl font-bold font-mono text-primer-danger-fg mt-1">
              {trafficLightStats.deficit}%
            </div>
            <div className="text-[10px] text-primer-fg-subtle mt-0.5">Интервенция қажет</div>
          </Card>

          {/* Class ELO & Streak */}
          <Card className="p-3 bg-primer-canvas-subtle border-primer-border-default">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-primer-attention-fg" />
              <span>Орташа ELO & Стрик</span>
            </div>
            <div className="text-xl font-bold font-mono text-primer-fg-default mt-1">
              {trafficLightStats.avgElo} ELO
            </div>
            <div className="text-[10px] text-primer-attention-fg font-mono mt-0.5">
              🔥 {trafficLightStats.avgStreak} күн орташа
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: 1-Click Express Enrollment Approvals */}
        <div className="lg:col-span-4 rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-primer-border-muted/50">
            <div className="flex items-center gap-1.5 font-bold text-xs text-primer-fg-default">
              <Users className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>Экспресс-өтініштер</span>
            </div>
            <Badge variant="accent" className="text-[10px] font-mono">
              {enrollmentRequests.length} күтуде
            </Badge>
          </div>

          {enrollmentRequests.length === 0 ? (
            <div className="py-4 text-center text-xs text-primer-fg-muted">
              {t('common.no_data')}
            </div>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {enrollmentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-primer-fg-default truncate">{req.studentName}</div>
                    <div className="text-[10px] text-primer-fg-muted truncate">{req.courseTitle}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRejectEnrollment(req)}
                      className="text-primer-danger-fg hover:bg-primer-danger-subtle h-6 w-6"
                      title={t('teacher.reject_request')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleApproveEnrollment(req)}
                      className="h-6 px-2 font-bold text-[11px] gap-0.5"
                    >
                      <Check className="w-3 h-3" />
                      <span>{t('teacher.approve_request')}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ЖУРНАЛ КЛАССА: ТЕПЛОВАЯ МАТРИЦА 24 УЧЕНИКА × 16 МИКРОНАВЫКОВ */}
      {/* ========================================================================= */}
      <Card className="border-primer-border-default bg-primer-canvas-subtle overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs sm:text-sm font-bold">
                {t('teacher.tab_gradebook')}
              </CardTitle>
              <Badge variant="done" className="text-[9px] font-mono">
                Live DINA Sync
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Когнитивтік Q-Matrix диагностикасы: ұяшыққа басып оқушының қателер логын ашыңыз
            </CardDescription>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-primer-fg-muted" />
              <Input
                type="text"
                placeholder={t('header.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs w-36 sm:w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-7 px-2 bg-primer-canvas-inset border border-primer-border-default rounded text-[11px] text-primer-fg-default font-semibold cursor-pointer"
            >
              <option value="all">{t('teacher.filter_all')}</option>
              <option value="deficit_only">{t('teacher.filter_deficits')} 🔴</option>
              <option value="mastered_only">{t('teacher.filter_mastered')} 🟢</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-7 px-2 bg-primer-canvas-inset border border-primer-border-default rounded text-[11px] text-primer-fg-default font-semibold cursor-pointer"
            >
              <option value="elo">{t('teacher.sort_by_elo')}</option>
              <option value="deficits">{t('teacher.sort_by_deficits')}</option>
              <option value="name">{t('teacher.sort_by_name')}</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-primer-border-muted/50">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header Row with 16 Micro-skills */}
              <thead className="bg-primer-canvas-inset text-primer-fg-muted text-[10px] uppercase tracking-wider sticky top-0 z-20">
                <tr className="border-b border-primer-border-default">
                  <th className="px-3 py-2.5 sticky left-0 z-30 bg-primer-canvas-inset font-bold text-primer-fg-default min-w-[160px] border-r border-primer-border-muted">
                    {t('role.student')} ({filteredStudents.length})
                  </th>
                  <th className="px-2 py-2.5 text-center min-w-[70px] border-r border-primer-border-muted font-mono">
                    ELO
                  </th>
                  {classroomData?.skills_header.map((skill) => (
                    <th
                      key={skill.code}
                      title={`${getLocalized(skill, 'name')}`}
                      className="px-2 py-2 text-center min-w-[85px] border-r border-primer-border-muted/60 font-semibold truncate max-w-[110px]"
                    >
                      <div className="truncate font-bold text-primer-fg-default">{getLocalized(skill, 'name')}</div>
                      <div className="text-[9px] text-primer-fg-subtle font-mono">{skill.code.split('_')[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body: 24 Students Rows */}
              <tbody className="divide-y divide-primer-border-muted/40 font-sans">
                {filteredStudents.map((std, idx) => (
                  <tr
                    key={std.student_id}
                    className="hover:bg-primer-canvas-inset/50 transition group"
                  >
                    {/* Sticky Student Name & Rank */}
                    <td className="px-3 py-2 sticky left-0 z-10 bg-primer-canvas-subtle group-hover:bg-primer-canvas-inset/90 border-r border-primer-border-muted font-semibold text-primer-fg-default whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-primer-fg-subtle w-4">
                          {idx + 1}.
                        </span>
                        <span className="truncate">{std.student_name}</span>
                      </div>
                    </td>

                    {/* ELO Rating */}
                    <td className="px-2 py-2 text-center font-mono font-bold text-primer-success-fg border-r border-primer-border-muted whitespace-nowrap">
                      {std.current_elo}
                    </td>


                    {/* 16 Micro-skill Heatmap Cells */}
                    {classroomData?.skills_header.map((skill) => {
                      const mastery = std.skills[skill.code] || {
                        probability: 0.5,
                        status: 'in_progress',
                      };
                      const probPercent = Math.round(mastery.probability * 100);

                      let bgClass = 'bg-primer-danger-subtle text-primer-danger-fg hover:bg-primer-danger-emphasis hover:text-white';
                      let icon = '🔴';
                      if (mastery.status === 'mastered') {
                        bgClass = 'bg-primer-success-subtle text-primer-success-fg hover:bg-primer-success-emphasis hover:text-white';
                        icon = '🟢';
                      } else if (mastery.status === 'in_progress') {
                        bgClass = 'bg-primer-attention-subtle text-primer-attention-fg hover:bg-primer-attention-emphasis hover:text-white';
                        icon = '🟡';
                      }

                      return (
                        <td
                          key={skill.code}
                          onClick={() => handleCellClick(std, skill, mastery)}
                          className="px-1.5 py-1.5 text-center border-r border-primer-border-muted/30 cursor-pointer"
                        >
                          <div
                            className={`px-1.5 py-1 rounded text-[11px] font-mono font-bold transition-all shadow-2xs ${bgClass}`}
                            title={`${std.student_name} • ${skill.nameKZ}: ${probPercent}% (${mastery.status}) - басып логты көріңіз`}
                          >
                            <span>{probPercent}%</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>

              {/* Class Summary Stats Footer Row */}
              {classroomData?.summary_stats && (
                <tfoot className="bg-primer-canvas-inset border-t-2 border-primer-border-default font-mono text-[10px] font-bold">
                  <tr>
                    <td className="px-3 py-2 sticky left-0 z-10 bg-primer-canvas-inset border-r border-primer-border-muted text-primer-fg-default">
                      СЫНЫП ОРТАШАСЫ
                    </td>
                    <td className="px-2 py-2 text-center text-primer-success-fg border-r border-primer-border-muted">
                      {trafficLightStats.avgElo}
                    </td>
                    {classroomData.skills_header.map((skill) => {
                      const stat = classroomData.summary_stats[skill.code];
                      const avgPct = stat ? Math.round(stat.average_probability * 100) : 50;
                      return (
                        <td
                          key={skill.code}
                          className="px-1 py-2 text-center border-r border-primer-border-muted/30"
                        >
                          <span
                            className={
                              avgPct >= 70
                                ? 'text-primer-success-fg'
                                : avgPct >= 40
                                ? 'text-primer-attention-fg'
                                : 'text-primer-danger-fg'
                            }
                          >
                            {avgPct}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 5. MODALS INTEGRATION */}
      {/* ========================================================================= */}

      {/* Student Micro-skill Attempt Log Modal */}
      <StudentSkillDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
        skillMeta={selectedSkillMeta}
        skillData={selectedSkillData}
        onAssignDrill={(studentName, skillName) => {
          showToast({
            type: 'success',
            title: 'Экспресс-жаттығу тағайындалды! 🚀',
            message: `${studentName} үшін «${skillName}» бойынша 3 минуттық Сократикалық жаттығу жіберілді.`,
          });
        }}
        onAddToSmartboard={(skillName) => {
          showToast({
            type: 'attention',
            title: 'Смарт-доскаға қосылды 📌',
            message: `«${skillName}» тақырыбы интерактивті тақта кезегіне қойылды.`,
          });
        }}
      />

      {/* 1-Click Kundelik Export Modal */}
      <KundelikExportModal
        isOpen={isKundelikModalOpen}
        onClose={() => setIsKundelikModalOpen(false)}
        students={classroomData?.matrix || []}
        className={classroomData?.classroom_name || '9 «А»'}
        subjectName="Алгебра"
      />
    </div>
  );
};

export default TeacherDashboard;
