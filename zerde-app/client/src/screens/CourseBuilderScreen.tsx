import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/context/LanguageContext';
import { MathText } from '@/components/ui/MathText';
import {
  Sparkles,
  CheckCircle2,
  Brain,
  RefreshCw,
  Database,
  Layers,
  Save,
  BookOpen,
  Plus,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Calendar,
  Check,
  Edit3,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  RotateCcw,
  Bot,
  FolderOpen,
  Globe,
  Languages,
  BookMarked,
  Users,
  PlusCircle,
  Paperclip,
  FileCode,
  FileSpreadsheet,
  FileImage,
  BellRing,
  X
} from 'lucide-react';
import { TeacherCopilotChat } from '@/features/copilot/TeacherCopilotChat';
import { QuestionBankManager } from '@/features/course-studio/QuestionBankManager';
import { CreateCourseModal } from '@/features/course-studio/CreateCourseModal';
import { CreateClassroomModal } from '@/features/course-studio/CreateClassroomModal';
import api from '@/api/client';

export interface MaterialSlot {
  id?: number;
  course_id: number;
  classroom_id?: number | null;
  slot_number: number;
  title: string;
  file_type: string;
  content_text: string;
  file_size?: number;
  is_locked: number;
  uploaded_at?: string;
}

export interface ClassroomInfo {
  id: number;
  name: string;
  school?: string;
  student_count?: number;
}

export interface CourseInfo {
  id: number;
  short_code: string;
  title: string;
  description?: string;
  subject_type: string;
  language: 'KZ' | 'RU' | 'EN' | 'ALL';
  icon?: string;
  topicsCount?: number;
}

export interface CurriculumPlan {
  id: number;
  course_id: number;
  classroom_id?: number | null;
  quarter: number;
  markdown_plan: string;
  status: 'DRAFT_QUESTIONNAIRE' | 'APPROVED' | 'ARCHIVED';
  version: number;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SLOT_TITLES = [
  'ГОСО: Мемлекеттік жалпыға міндетті стандарт (Силлабус)',
  'Негізгі оқулық (1-бөлім - Шыныбеков)',
  'Негізгі оқулық (2-бөлім - Әбілқасымова)',
  'Мұғалімнің әдістемелік нұсқаулығы мен критериалды бағалау',
  'Олимпиадалық және тереңдетілген деңгей тапсырмалары'
];

export const CourseBuilderScreen: React.FC = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  // 3 Streamlined Main Tabs: 'slots' | 'curriculum' | 'copilot'
  const [activeTab, setActiveTab] = useState<'slots' | 'curriculum' | 'copilot'>('slots');
  const [curriculumSubTab, setCurriculumSubTab] = useState<'plan' | 'questions'>('plan');

  // Courses and Classrooms
  const [coursesList, setCoursesList] = useState<CourseInfo[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [classroomsList, setClassroomsList] = useState<ClassroomInfo[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);

  // Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);

  // 1. Slots State
  const [slots, setSlots] = useState<MaterialSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<MaterialSlot | null>(null);
  const [isSavingSlot, setIsSavingSlot] = useState<boolean>(false);
  const [uploadingSlotNum, setUploadingSlotNum] = useState<number | null>(null);

  // 2. Curriculum Plan State
  const [activeQuarter, setActiveQuarter] = useState<number>(1);
  const [currentPlan, setCurrentPlan] = useState<CurriculumPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [isApprovingPlan, setIsApprovingPlan] = useState<boolean>(false);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Fetch Teacher's Courses
  const fetchCourses = async () => {
    try {
      const res: any = await api.get('/courses');
      const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list && list.length > 0) {
        setCoursesList(list);
        if (!selectedCourseId || !list.some((c: any) => c.id === selectedCourseId)) {
          setSelectedCourseId(list[0].id);
        }
      }
    } catch (e) {
      console.warn('Failed to load courses', e);
    }
  };

  // Fetch Classrooms for Selected Course
  const fetchClassrooms = async (crsId: number) => {
    try {
      const res: any = await api.get(`/courses/${crsId}/classrooms`);
      const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      setClassroomsList(list);
      if (list.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(list[0].id);
      }
    } catch (e) {
      console.warn('Failed to load classrooms', e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchClassrooms(selectedCourseId);
      fetchSlots();
      fetchCurriculumPlan();
    }
  }, [selectedCourseId, selectedClassroomId, activeQuarter]);

  // Selected Course Object
  const selectedCourse = coursesList.find((c) => c.id === selectedCourseId) || coursesList[0] || {
    id: 1,
    short_code: 'ALG-09',
    title: 'Алгебра 9-сынып',
    subject_type: 'algebra',
    language: 'KZ',
    icon: '📐'
  };

  // Language Locking Detection
  const isLanguageSubject = /lang|lit|kazakh|russian|english/i.test(selectedCourse.subject_type || '') ||
    selectedCourse.title.toLowerCase().includes('тілі') ||
    selectedCourse.title.toLowerCase().includes('язык') ||
    selectedCourse.title.toLowerCase().includes('literature');

  const lockedLang: 'KZ' | 'RU' | 'EN' = isLanguageSubject
    ? (selectedCourse.title.toLowerCase().includes('орыс') || selectedCourse.title.toLowerCase().includes('русск')
        ? 'RU'
        : selectedCourse.title.toLowerCase().includes('ағылш') || selectedCourse.title.toLowerCase().includes('english')
        ? 'EN'
        : 'KZ')
    : (selectedCourse.language === 'ALL' ? 'KZ' : (selectedCourse.language as 'KZ' | 'RU' | 'EN') || 'KZ');

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const params = selectedClassroomId ? `?classroomId=${selectedClassroomId}` : '';
      const res: any = await api.get(`/teacher/courses/${selectedCourseId}/slots${params}`);
      const data = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      if (data && data.length > 0) {
        setSlots(data);
      } else {
        const initialSlots: MaterialSlot[] = Array.from({ length: 5 }, (_, i) => ({
          course_id: selectedCourseId,
          classroom_id: selectedClassroomId,
          slot_number: i + 1,
          title: DEFAULT_SLOT_TITLES[i] || `Слот #${i + 1}`,
          file_type: 'text',
          content_text: '',
          file_size: 0,
          is_locked: 0,
        }));
        setSlots(initialSlots);
      }
    } catch (err) {
      console.warn('Failed to load slots', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchCurriculumPlan = async () => {
    try {
      const res: any = await api.get(`/teacher/courses/${selectedCourseId}/plan?quarter=${activeQuarter}`);
      const data = (res && res.data) ? res.data : res;
      setCurrentPlan(data && data.id ? data : null);
    } catch (err) {
      setCurrentPlan(null);
    }
  };

  const handleFileUpload = async (slotNumber: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlotNum(slotNumber);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedClassroomId) formData.append('classroomId', String(selectedClassroomId));

      const res: any = await api.post(`/teacher/courses/${selectedCourseId}/slots/${slotNumber}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedSlot = (res && res.data) ? res.data : res;
      showToast({
        title: lang === 'KZ' ? `«${file.name}» сәтті жүктелді!` : `Файл «${file.name}» успешно загружен!`,
        type: 'success'
      });

      setSlots((prev) =>
        prev.map((s) => (s.slot_number === slotNumber ? { ...s, ...updatedSlot } : s))
      );
    } catch (err: any) {
      showToast({
        title: lang === 'KZ' ? 'Файл жүктеу қатесі' : 'Ошибка загрузки файла',
        type: 'danger'
      });
    } finally {
      setUploadingSlotNum(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveSlot = async () => {
    if (!editingSlot) return;
    setIsSavingSlot(true);
    try {
      await api.post(`/teacher/courses/${selectedCourseId}/slots/${editingSlot.slot_number}`, {
        title: editingSlot.title,
        content_text: editingSlot.content_text,
        file_type: editingSlot.file_type || 'text',
        file_size: editingSlot.content_text.length,
        is_locked: editingSlot.is_locked,
      });

      showToast({
        title: lang === 'KZ' ? `Слот #${editingSlot.slot_number} сақталды!` : `Слот #${editingSlot.slot_number} сохранен!`,
        type: 'success'
      });

      setTimeout(() => {
        showToast({
          title: lang === 'KZ'
            ? '🔔 Материалдар бекітілді! AI CoPilot чатына өтіп, КТП жоспарын талқылаңыз.'
            : '🔔 Материалы зафиксированы! Перейдите в чат CoPilot для составления КТП.',
          type: 'info'
        });
      }, 800);

      setEditingSlot(null);
      fetchSlots();
    } catch (err: any) {
      showToast({ title: 'Слотты сақтау қатесі', type: 'danger' });
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleClearSlot = async (slot: MaterialSlot) => {
    try {
      await api.post(`/teacher/courses/${selectedCourseId}/slots/${slot.slot_number}`, {
        title: DEFAULT_SLOT_TITLES[slot.slot_number - 1] || `Слот #${slot.slot_number}`,
        content_text: '',
        file_type: 'text',
        file_size: 0,
        is_locked: slot.is_locked,
      });
      showToast({ title: `${slot.slot_number}-слот тазаланды`, type: 'success' });
      fetchSlots();
    } catch (err: any) {
      showToast({ title: 'Слотты тазалау қатесі', type: 'danger' });
    }
  };

  const handleApprovePlan = async () => {
    if (!currentPlan) return;
    setIsApprovingPlan(true);
    try {
      const res: any = await api.post(`/teacher/courses/${selectedCourseId}/plan/approve`, {
        quarter: activeQuarter,
      });
      const data = (res && res.data) ? res.data : res;
      setCurrentPlan(data);
      showToast({
        title: lang === 'KZ' ? 'КТП ресми бекітілді! Сұрақтар банкі генерацияланды.' : 'КТП официально утвержден!',
        type: 'success'
      });
    } catch (err: any) {
      showToast({ title: 'Бекіту қатесі', type: 'danger' });
    } finally {
      setIsApprovingPlan(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (fileType.includes('doc')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (fileType.includes('png') || fileType.includes('jpg') || fileType.includes('webp')) return <FileImage className="w-4 h-4 text-amber-500" />;
    return <FileCode className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 space-y-4">
      
      {/* 1. TOP BAR: Course Selector + Group Selector + New Course Button */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 shadow-primer-xs flex flex-wrap items-center justify-between gap-3 text-primer-fg-default">
        
        {/* Left: Course & Classroom Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primer-accent-fg" />
            <span className="text-xs font-bold">{lang === 'KZ' ? 'Курс:' : 'Курс:'}</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="text-xs font-semibold bg-primer-canvas-default border border-primer-border-default rounded-lg px-2.5 py-1.5 text-primer-fg-default focus:outline-none focus:border-primer-accent-emphasis cursor-pointer shadow-xs"
            >
              {coursesList.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.title} ({crs.short_code})
                </option>
              ))}
            </select>
          </div>

          {/* Classroom Group Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-primer-border-muted">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold">{lang === 'KZ' ? 'Топ:' : 'Группа:'}</span>
            <select
              value={selectedClassroomId || ''}
              onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
              className="text-xs font-semibold bg-primer-canvas-default border border-primer-border-default rounded-lg px-2.5 py-1.5 text-primer-fg-default focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
            >
              {classroomsList.length > 0 ? (
                classroomsList.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.student_count || 0} оқушы)
                  </option>
                ))
              ) : (
                <option value="">9 «А» (Негізгі топ)</option>
              )}
            </select>

            <button
              onClick={() => setIsCreateClassroomOpen(true)}
              className="p-1.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition cursor-pointer text-xs flex items-center gap-1 font-bold"
              title="Жаңа топ қосу"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'KZ' ? 'Топ ашу' : '+ Группа'}</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Language Switcher + Create Course Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-primer-canvas-default border border-primer-border-default rounded-lg p-1 text-xs font-mono">
            <span className="text-[10px] font-bold text-primer-fg-muted uppercase px-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-primer-accent-fg" />
              <span>Тіл:</span>
            </span>
            {(['KZ', 'RU', 'EN', 'ALL'] as const).map((l) => (
              <button
                key={l}
                onClick={async () => {
                  try {
                    await api.patch(`/courses/${selectedCourseId}/language`, { language: l });
                    setCoursesList((prev) =>
                      prev.map((c) => (c.id === selectedCourseId ? { ...c, language: l } : c))
                    );
                    showToast({
                      title: lang === 'KZ' ? `Курс тілі: ${l}` : `Язык курса: ${l}`,
                      type: 'success'
                    });
                  } catch (err: any) {
                    showToast({
                      title: err?.response?.data?.error || 'Тілді өзгерту қатесі',
                      type: 'danger'
                    });
                  }
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  (selectedCourse.language || 'KZ') === l
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateCourseOpen(true)}
            className="h-8 text-xs font-bold gap-1.5 shadow-primer-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{lang === 'KZ' ? 'Жаңа курс' : '+ Создать курс'}</span>
          </Button>
        </div>
      </div>

      {/* 2. MAIN COURSE BANNER & NAVIGATION TABS */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primer-accent-subtle text-primer-accent-fg border border-primer-border-default flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5 text-primer-accent-fg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-primer-fg-default tracking-tight">
                  {selectedCourse.title}
                </h2>
                <Badge variant="outline" className="text-[10px] font-mono text-primer-accent-fg border-primer-border-default bg-primer-canvas-default">
                  {selectedCourse.short_code}
                </Badge>
              </div>
              <p className="text-xs text-primer-fg-muted">
                {lang === 'KZ'
                  ? '5 құжаттық слот, КТП жоспары және бірыңғай AI CoPilot жұмыс кеңістігі'
                  : '5 слотов документов, КТП и единый интеллектуальный чат CoPilot'}
              </p>
            </div>
          </div>

          {/* 3 Main Segmented Navigation Tabs */}
          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted overflow-x-auto text-xs shrink-0">
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'slots'
                  ? 'bg-primer-canvas-default text-primer-fg-default shadow-xs border border-primer-border-default'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>1. 📁 {lang === 'KZ' ? '5 Оқу Слоты' : '5 Слотов Материалов'}</span>
            </button>

            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'curriculum'
                  ? 'bg-primer-canvas-default text-primer-fg-default shadow-xs border border-primer-border-default'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>2. 📋 {lang === 'KZ' ? 'КТП Жоспары & Банк' : 'КТП и Банк задач'}</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3 py-1.5 font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'copilot'
                  ? 'bg-primer-accent-emphasis text-white shadow-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3. 🤖 {lang === 'KZ' ? 'AI CoPilot Кеңістігі' : 'Единый AI CoPilot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: 5 MATERIAL SLOTS WITH REAL FILE UPLOAD (PDF, DOCX, IMAGES)    */}
      {/* ==================================================================== */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 shadow-primer-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-primer-fg-default">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-primer-fg-default">
                <Layers className="w-4 h-4 text-primer-accent-fg" />
                <span>«{selectedCourse.title}» 5 құжаттық оқу слоты (Grounding Context)</span>
              </h3>
              <p className="text-[11px] text-primer-fg-muted pt-0.5">
                {lang === 'KZ'
                  ? 'PDF оқулықтар, ГОСО және конспектілерді жүктеңіз. ИИ тек осы файлдарға негізделеді.'
                  : 'Загрузите PDF учебники, ГОСО и методички. Копилот будет строго опираться на эти файлы.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSlots}
                disabled={isLoadingSlots}
                className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSlots ? 'animate-spin' : ''}`} />
                <span>{lang === 'KZ' ? 'Жаңарту' : 'Обновить'}</span>
              </Button>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {slots.map((slot) => {
              const hasContent = Boolean(slot.content_text && slot.content_text.trim().length > 0);
              const isUploading = uploadingSlotNum === slot.slot_number;

              return (
                <div
                  key={slot.slot_number}
                  className={`rounded-xl border p-4 space-y-3 shadow-primer-xs transition flex flex-col justify-between ${
                    hasContent
                      ? 'border-primer-border-default bg-primer-canvas-default'
                      : 'border-dashed border-primer-border-default bg-primer-canvas-subtle'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primer-canvas-inset border border-primer-border-default text-primer-fg-default">
                          Слот #{slot.slot_number}
                        </span>
                        {hasContent ? (
                          <Badge variant="accent" className="text-[10px] font-mono gap-1">
                            {getFileIcon(slot.file_type)}
                            <span className="uppercase">{slot.file_type || 'TEXT'}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-primer-fg-muted font-mono">
                            {lang === 'KZ' ? '📭 Бос слот' : '📭 Пустой слот'}
                          </Badge>
                        )}
                      </div>

                      <div className="text-[10px] font-mono">
                        {slot.is_locked === 1 ? (
                          <span className="flex items-center gap-1 text-primer-attention-fg font-semibold">
                            <Lock className="w-3 h-3" /> Бекітілген
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-primer-success-fg font-semibold">
                            <Unlock className="w-3 h-3" /> Ашық
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-xs text-primer-fg-default line-clamp-1">
                      {slot.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-primer-fg-muted font-mono bg-primer-canvas-inset p-2 rounded-lg border border-primer-border-muted">
                      <div>Көлемі: <strong className="text-primer-fg-default">{slot.file_size ? `${(slot.file_size / 1024).toFixed(1)} KB` : `${slot.content_text?.length || 0} таңба`}</strong></div>
                      <div>Формат: <strong className="text-primer-fg-default uppercase">{slot.file_type || 'TXT'}</strong></div>
                    </div>

                    <p className="text-[11px] text-primer-fg-muted line-clamp-3 leading-relaxed">
                      {hasContent ? slot.content_text : 'Құжатты жүктеңіз (PDF, DOCX, TXT, сурет) немесе қолмен мәтінді жазыңыз.'}
                    </p>
                  </div>

                  {/* Slot Actions: File Upload Input + Edit/Clear */}
                  <div className="pt-2.5 border-t border-primer-border-muted flex items-center justify-between gap-1.5">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[slot.slot_number] = el)}
                      onChange={(e) => handleFileUpload(slot.slot_number, e)}
                      accept=".pdf,.docx,.txt,.md,.json,.csv,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[slot.slot_number]?.click()}
                      className="text-xs h-7.5 px-2.5 gap-1 font-semibold text-primer-accent-fg hover:bg-primer-accent-subtle shadow-xs"
                      title="Файл жүктеу (PDF, DOCX, TXT, IMG)"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{isUploading ? '...' : 'Файл'}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSlot(slot)}
                      className="text-xs gap-1 h-7.5 font-semibold flex-1 justify-center shadow-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{hasContent ? 'Мәтін' : 'Жазу'}</span>
                    </Button>

                    {hasContent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClearSlot(slot)}
                        title="Слотты тазалау"
                        className="text-xs h-7.5 px-2 text-primer-danger-fg hover:bg-primer-danger-subtle border-primer-danger-muted shadow-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slot Edit Modal */}
          {editingSlot && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="rounded-xl border border-primer-border-default bg-primer-canvas-overlay max-w-2xl w-full p-5 space-y-4 shadow-primer-xl text-primer-fg-default">
                <div className="flex items-center justify-between pb-2 border-b border-primer-border-default">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primer-accent-subtle text-primer-accent-fg">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-primer-fg-default">
                      Слот #{editingSlot.slot_number} редакторы
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingSlot(null)}
                    className="p-1 text-primer-fg-muted hover:text-primer-fg-default transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-primer-fg-default">Слот атауы:</label>
                    <Input
                      value={editingSlot.title}
                      onChange={(e) => setEditingSlot({ ...editingSlot, title: e.target.value })}
                      placeholder="Оқу құралының атауы..."
                      className="text-xs h-8 bg-primer-canvas-default text-primer-fg-default border-primer-border-default"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-primer-fg-default">Мазмұны немесе мәтіні (Markdown / Text):</label>
                    <textarea
                      value={editingSlot.content_text}
                      onChange={(e) => setEditingSlot({ ...editingSlot, content_text: e.target.value })}
                      rows={12}
                      placeholder="Оқулық мәтінін, силлабусты немесе ГОСО талаптарын осында жазыңыз немесе көшіріп қойыңыз..."
                      className="w-full p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-default text-primer-fg-default font-mono text-xs focus:border-primer-accent-emphasis focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-default">
                  <Button variant="outline" size="sm" onClick={() => setEditingSlot(null)}>
                    Бас тарту
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveSlot}
                    disabled={isSavingSlot}
                    className="gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingSlot ? 'Сақталуда...' : 'Слотты сақтау'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CURRICULUM PLAN (KTP) & QUESTION BANK                         */}
      {/* ==================================================================== */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-primer-border-default pb-2">
            <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted text-xs">
              <button
                onClick={() => setCurriculumSubTab('plan')}
                className={`px-3 py-1 font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  curriculumSubTab === 'plan'
                    ? 'bg-primer-canvas-default text-primer-fg-default shadow-xs border border-primer-border-default'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>КТП Оқу жоспары</span>
              </button>

              <button
                onClick={() => setCurriculumSubTab('questions')}
                className={`px-3 py-1 font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  curriculumSubTab === 'questions'
                    ? 'bg-primer-canvas-default text-primer-fg-default shadow-xs border border-primer-border-default'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Сұрақтар Банкі (Subpassports)</span>
              </button>
            </div>

            {curriculumSubTab === 'plan' && (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    onClick={() => setActiveQuarter(q)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition cursor-pointer ${
                      activeQuarter === q
                        ? 'bg-primer-accent-emphasis text-white shadow-xs'
                        : 'bg-primer-canvas-subtle text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-default'
                    }`}
                  >
                    {q}-тоқсан
                  </button>
                ))}
              </div>
            )}
          </div>

          {curriculumSubTab === 'plan' ? (
            <div className="rounded-xl border border-primer-border-default bg-primer-canvas-default p-5 space-y-4 shadow-primer-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primer-border-default">
                <div>
                  <h3 className="text-sm font-bold text-primer-fg-default flex items-center gap-2">
                    <span>{activeQuarter}-тоқсанның Күнтізбелік-тақырыптық жоспары (КТП)</span>
                    {currentPlan?.status === 'APPROVED' ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Бекітілген
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-primer-attention-fg border-primer-attention-muted bg-primer-attention-subtle">
                        Жоба (Draft)
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-primer-fg-muted">
                    {lang === 'KZ'
                      ? 'AI CoPilot арқылы жүктелген 5 оқулық слотына қатаң сәйкес жасалған жоспар'
                      : 'План КТП, основанный на 5 материалах курса'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('copilot')}
                    className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
                  >
                    <Bot className="w-3.5 h-3.5 text-primer-accent-fg" />
                    <span>CoPilot-пен өңдеу</span>
                  </Button>

                  {currentPlan?.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleApprovePlan}
                      disabled={isApprovingPlan}
                      className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isApprovingPlan ? 'Бекітілуде...' : 'КТП-ны бекіту'}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Plan View Area */}
              <div className="p-4 rounded-lg bg-primer-canvas-inset border border-primer-border-default font-mono text-xs text-primer-fg-default leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {currentPlan?.markdown_plan || (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-primer-fg-muted">Бұл тоқсанға әлі КТП жоспары бекітілмеген.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('copilot')}
                      className="text-xs gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
                      <span>CoPilot-та КТП құрастыру</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <QuestionBankManager courseId={selectedCourseId} />
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: UNIFIED AI COPILOT WORKSPACE (PERSONA MD)                     */}
      {/* ==================================================================== */}
      {activeTab === 'copilot' && (
        <TeacherCopilotChat
          courseId={selectedCourseId}
          classroomId={selectedClassroomId || undefined}
          courseTitle={selectedCourse.title}
        />
      )}

      {/* Modals */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onCourseCreated={(newC) => {
          fetchCourses();
          if (newC && newC.id) setSelectedCourseId(newC.id);
        }}
      />

      <CreateClassroomModal
        isOpen={isCreateClassroomOpen}
        courseId={selectedCourseId}
        courseTitle={selectedCourse.title}
        onClose={() => setIsCreateClassroomOpen(false)}
        onClassroomCreated={() => {
          fetchClassrooms(selectedCourseId);
        }}
      />
    </div>
  );
};

export default CourseBuilderScreen;
