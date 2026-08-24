import React, { useState, useEffect } from 'react';
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
  FileCheck
} from 'lucide-react';
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

export interface GeneratedQuestionItem {
  id?: string;
  mode: 'A' | 'B';
  question_kz: string;
  question_ru?: string;
  question_en?: string;
  katex_snippet?: string;
  options: Array<{ id: string; text: string; isCorrect: boolean; latex?: string }>;
  correct_answer: string;
  explanation_kz?: string;
  explanation_ru?: string;
  explanation_en?: string;
  difficulty: number;
  skill_code: string;
}

const DEFAULT_SLOT_TITLES = [
  'ГОСО: Мемлекеттік жалпыға міндетті стандарт (Силлабус)',
  'Негізгі оқулық (1-бөлім)',
  'Негізгі оқулық (2-бөлім) / Анықтамалық',
  'Мұғалімнің әдістемелік нұсқаулығы мен жазбалары',
  'Олимпиадалық және тереңдетілген деңгей тапсырмалары'
];

export const CourseBuilderScreen: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  // Active Main Tab: 'slots' | 'plan' | 'quiz'
  const [activeTab, setActiveTab] = useState<'slots' | 'plan' | 'quiz'>('slots');

  // Course & Classroom state
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [existingTopics, setExistingTopics] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);

  // 1. Slots State
  const [slots, setSlots] = useState<MaterialSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<MaterialSlot | null>(null);
  const [isSavingSlot, setIsSavingSlot] = useState<boolean>(false);

  // 2. Curriculum Plan State
  const [activeQuarter, setActiveQuarter] = useState<number>(1);
  const [currentPlan, setCurrentPlan] = useState<CurriculumPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [isApprovingPlan, setIsApprovingPlan] = useState<boolean>(false);

  // 3. Quiz Generator State
  const [topicTitle, setTopicTitle] = useState('Квадраттық теңсіздіктерді шешу (Интервалдар әдісі)');
  const [gradeLevel, setGradeLevel] = useState<number>(9);
  const [count, setCount] = useState<number>(3);
  const [focus, setFocus] = useState('Бөлшек бөлімінің нөлдерін ескеру және сан түзуіндегі таңбалар');
  const [selectedLang, setSelectedLang] = useState<'KZ' | 'RU' | 'EN'>('KZ');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);

  // Load topics & slots on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const resTopics: any = await api.get('/courses/1/topics');
        const topicList = Array.isArray(resTopics) ? resTopics : Array.isArray(resTopics?.data) ? resTopics.data : [];
        if (topicList.length > 0) {
          setExistingTopics(topicList);
          setSelectedTopicId(topicList[0].id);
        }
      } catch (err) {
        console.warn('Failed to fetch topics', err);
      }
    };
    loadInitialData();
    fetchSlots();
    fetchPlan();
  }, [selectedCourseId, activeQuarter]);

  // Fetch 5 material slots
  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const res: any = await api.get(`/teacher/courses/${selectedCourseId}/slots`);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      
      // Ensure all 5 slots are populated
      const slotMap = new Map<number, MaterialSlot>();
      list.forEach((s: MaterialSlot) => slotMap.set(s.slot_number, s));

      const filledSlots: MaterialSlot[] = [1, 2, 3, 4, 5].map((num) => {
        return slotMap.get(num) || {
          course_id: selectedCourseId,
          slot_number: num,
          title: DEFAULT_SLOT_TITLES[num - 1],
          file_type: 'text',
          content_text: '',
          is_locked: 0
        };
      });

      setSlots(filledSlots);
    } catch (err) {
      console.error('[CourseBuilder] Failed to load slots', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Save single slot
  const handleSaveSlot = async () => {
    if (!editingSlot) return;
    setIsSavingSlot(true);
    try {
      await api.post(`/teacher/courses/${selectedCourseId}/slots/${editingSlot.slot_number}`, {
        title: editingSlot.title,
        content_text: editingSlot.content_text,
        file_type: editingSlot.file_type || 'text',
        is_locked: editingSlot.is_locked || 0
      });

      showToast({
        title: `Слот #${editingSlot.slot_number} сәтті сақталды!`,
        type: 'success'
      });

      setEditingSlot(null);
      await fetchSlots();
    } catch (err: any) {
      console.error('[CourseBuilder] Save slot failed', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Слотты сақтау қатесі';
      showToast({ title: errMsg, type: 'danger' });
    } finally {
      setIsSavingSlot(false);
    }
  };

  // Fetch Curriculum Plan
  const fetchPlan = async () => {
    try {
      const res: any = await api.get(`/teacher/courses/${selectedCourseId}/plan?quarter=${activeQuarter}`);
      const data = res?.data || res;
      setCurrentPlan(data || null);
    } catch (err) {
      console.warn('Failed to fetch plan', err);
      setCurrentPlan(null);
    }
  };

  // Generate Curriculum Plan via CoPilot
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res: any = await api.post(`/teacher/courses/${selectedCourseId}/plan/generate`, {
        quarter: activeQuarter,
        language: lang
      });

      const planData = res?.data || res;
      setCurrentPlan(planData);
      showToast({
        title: '4-тоқсандық КТП жоспары сәтті құрастырылды!',
        type: 'success'
      });
    } catch (err: any) {
      console.error('[CourseBuilder] Plan gen failed', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Жоспар құрастыру қатесі орын алды';
      showToast({ title: errMsg, type: 'danger' });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Approve Curriculum Plan
  const handleApprovePlan = async () => {
    if (!currentPlan) return;
    setIsApprovingPlan(true);
    try {
      await api.post(`/teacher/courses/${selectedCourseId}/plan/approve`, {
        plan_id: currentPlan.id,
        quarter: activeQuarter
      });

      setCurrentPlan((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
      showToast({
        title: 'Оқу жоспары ресми бекітілді (APPROVED)!',
        type: 'success'
      });
    } catch (err: any) {
      console.error('[CourseBuilder] Plan approve failed', err);
      showToast({ title: 'Жоспарды бекіту қатесі', type: 'danger' });
    } finally {
      setIsApprovingPlan(false);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    if (!topicTitle.trim()) {
      showToast({ title: 'Тақырып атауын енгізіңіз', type: 'danger' });
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const res: any = await api.post('/teacher/copilot/generate-quiz', {
        topic_title: topicTitle.trim(),
        grade_level: gradeLevel,
        count: count,
        focus: focus.trim(),
        language: selectedLang
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        showToast({
          title: lang === 'KZ' ? 'Сұрақтар сәтті құрастырылды!' : 'Вопросы успешно сгенерированы!',
          type: 'success'
        });
      } else {
        throw new Error('Бос жауап алынды');
      }
    } catch (err: any) {
      console.error('[CoPilot] Generation failed', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Сұрақтарды құрастыру қатесі орын алды';
      showToast({ title: errMsg, type: 'danger' });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Batch Save Questions
  const handleSaveToDatabase = async () => {
    if (generatedQuestions.length === 0) return;

    setIsSavingQuiz(true);
    try {
      await api.post(`/teacher/courses/${selectedCourseId}/topics/${selectedTopicId}/questions/batch`, {
        questions: generatedQuestions
      });

      showToast({
        title: lang === 'KZ' ? 'Сұрақтар базаға (SQLite) сәтті сақталды!' : 'Вопросы успешно сохранены в базу!',
        type: 'success'
      });
      setGeneratedQuestions([]);
    } catch (err: any) {
      console.error('[CoPilot] Save failed', err);
      showToast({
        title: lang === 'KZ' ? 'Базаға сақтау қатесі' : 'Ошибка сохранения в базу',
        type: 'danger'
      });
    } finally {
      setIsSavingQuiz(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 space-y-6 py-2">
      {/* Header & Main Tabs */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 sm:p-5 shadow-primer-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primer-accent-emphasis text-white flex items-center justify-center font-bold shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-primer-fg-default">
                  Course Studio — Мұғалімнің Екінші Миы (Teacher Co-Pilot)
                </h2>
                <Badge variant="accent" className="text-[10px] font-mono">
                  Context-Injection Grounding
                </Badge>
              </div>
              <p className="text-xs text-primer-fg-muted mt-0.5">
                5 оқу материалын басқару, тоқсандық КТП құрастыру және KaTeX тестілерін генерациялау
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Switcher */}
        <div className="flex items-center gap-2 border-t border-primer-border-muted pt-3">
          <Button
            size="sm"
            variant={activeTab === 'slots' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('slots')}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. 5 Слотов Материалов</span>
          </Button>

          <Button
            size="sm"
            variant={activeTab === 'plan' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('plan')}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Учебный План (КТП)</span>
          </Button>

          <Button
            size="sm"
            variant={activeTab === 'quiz' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('quiz')}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Генератор Тестов KaTeX</span>
          </Button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: 5 MATERIAL SLOTS (Grounding)                                  */}
      {/* ==================================================================== */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primer-accent-fg" />
              <span>Курстың 5 негізгі оқу материалы (Grounding Context)</span>
            </h3>
            <Button size="sm" variant="outline" onClick={fetchSlots} disabled={isLoadingSlots} className="text-xs gap-1 h-7">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSlots ? 'animate-spin' : ''}`} />
              <span>Жаңарту</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const hasContent = Boolean(slot.content_text && slot.content_text.trim().length > 0);
              const isLocked = slot.is_locked === 1;

              return (
                <div
                  key={slot.slot_number}
                  className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 space-y-3 shadow-primer-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={hasContent ? 'success' : 'outline'} className="text-[10px] font-mono">
                        Слот #{slot.slot_number}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {isLocked ? (
                          <Badge variant="attention" className="text-[10px] gap-1 font-mono">
                            <Lock className="w-3 h-3 text-primer-attention-fg" />
                            Бұғатталған
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1 font-mono text-primer-success-fg">
                            <Unlock className="w-3 h-3" />
                            Ашық
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-primer-fg-default line-clamp-2">
                      {slot.title}
                    </h4>

                    <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-[11px] space-y-1">
                      <div className="text-primer-fg-muted flex items-center justify-between">
                        <span>Мәтін көлемі:</span>
                        <span className="font-mono font-bold text-primer-fg-default">
                          {slot.content_text?.length || 0} таңба
                        </span>
                      </div>
                      <div className="text-primer-fg-muted flex items-center justify-between">
                        <span>Формат:</span>
                        <span className="font-mono uppercase text-primer-fg-default">{slot.file_type || 'TEXT'}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-primer-fg-muted line-clamp-3 italic">
                      {hasContent ? slot.content_text : 'Слот бос. Мұнда оқулық немесе ГОСО мәтінін енгізіңіз.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-primer-border-muted flex items-center justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSlot(slot)}
                      className="text-xs gap-1.5 h-7 w-full font-semibold"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{hasContent ? 'Өзгерту / Толықтыру' : 'Мәтінді енгізу'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slot Edit Modal */}
          {editingSlot && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="rounded-xl border border-primer-border-default bg-primer-canvas-default max-w-2xl w-full p-5 space-y-4 shadow-primer-lg">
                <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primer-accent-subtle text-primer-accent-fg">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-primer-fg-default">
                      Слот #{editingSlot.slot_number} редакторы
                    </h3>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditingSlot(null)} className="h-7 text-xs">
                    Жабу
                  </Button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-primer-fg-default">Слот атауы / Құжат атауы:</label>
                    <Input
                      value={editingSlot.title}
                      onChange={(e) => setEditingSlot({ ...editingSlot, title: e.target.value })}
                      placeholder="Мысалы: ГОСО Алгебра 9..."
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-primer-fg-default">
                      Оқу материалының толық мәтіні (Context-Injection):
                    </label>
                    <textarea
                      value={editingSlot.content_text}
                      onChange={(e) => setEditingSlot({ ...editingSlot, content_text: e.target.value })}
                      placeholder="Мұнда ГОСО, оқулық параграфының мәтінін немесе теоремаларды енгізіңіз..."
                      rows={10}
                      className="w-full text-xs font-mono bg-primer-canvas-inset border border-primer-border-default rounded-lg p-3 text-primer-fg-default focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_locked_check"
                        checked={editingSlot.is_locked === 1}
                        onChange={(e) => setEditingSlot({ ...editingSlot, is_locked: e.target.checked ? 1 : 0 })}
                        className="rounded border-primer-border-default text-primer-accent-fg cursor-pointer"
                      />
                      <label htmlFor="is_locked_check" className="font-semibold text-primer-fg-default cursor-pointer">
                        Слотты бұғаттау (Оқу тоқсаны кезінде өзгерістерді жабу)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-muted">
                  <Button size="sm" variant="outline" onClick={() => setEditingSlot(null)} className="text-xs h-8">
                    Бас тарту
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSavingSlot}
                    onClick={handleSaveSlot}
                    className="text-xs h-8 gap-1.5 shadow-xs"
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
      {/* TAB 2: CURRICULUM PLAN (КТП)                                         */}
      {/* ==================================================================== */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-primer-fg-default">Оқу тоқсаны:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant={activeQuarter === q ? 'primary' : 'outline'}
                    onClick={() => setActiveQuarter(q)}
                    className="text-xs h-7 px-3 font-mono"
                  >
                    {q}-тоқсан
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingPlan}
                onClick={handleGeneratePlan}
                className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
                <span>{isGeneratingPlan ? 'CoPilot генерациялауда...' : 'CoPilot КТП құрастыру'}</span>
              </Button>

              {currentPlan && (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isApprovingPlan || currentPlan.status === 'APPROVED'}
                  onClick={handleApprovePlan}
                  className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>
                    {currentPlan.status === 'APPROVED' ? 'Жоспар бекітілген' : 'Жоспарды ресми бекіту'}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Markdown Plan Display Card */}
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-default p-5 shadow-primer-xs space-y-3">
            <div className="flex items-center justify-between border-b border-primer-border-muted pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primer-accent-fg" />
                <h3 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider">
                  {activeQuarter}-тоқсан бойынша күнтізбелік-тақырыптық жоспар (КТП)
                </h3>
              </div>

              {currentPlan ? (
                <Badge
                  variant={currentPlan.status === 'APPROVED' ? 'success' : 'attention'}
                  className="text-[10px] font-mono gap-1"
                >
                  {currentPlan.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {currentPlan.status} (v{currentPlan.version})
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Жоспар құрастырылмаған
                </Badge>
              )}
            </div>

            {currentPlan?.markdown_plan ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed font-sans whitespace-pre-wrap p-4 bg-primer-canvas-inset rounded-lg border border-primer-border-muted">
                {currentPlan.markdown_plan}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-primer-fg-muted space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-primer-fg-muted/60" />
                <p className="font-semibold text-primer-fg-default">Бұл тоқсанға арналған КТП әзірге жоқ</p>
                <p className="text-[11px]">
                  «CoPilot КТП құрастыру» түймесін басып, 5 слот материалдары негізінде толық жоспар жасаңыз.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: QUIZ GENERATOR WITH KATEX                                     */}
      {/* ==================================================================== */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generator Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-4">
              <h3 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider flex items-center gap-1.5 border-b border-primer-border-muted pb-2">
                <Brain className="w-4 h-4 text-primer-accent-fg" />
                <span>Параметрлерді енгізу</span>
              </h3>

              {/* Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primer-fg-default">Сабақ тақырыбы:</label>
                <textarea
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Мысалы: Квадраттық теңсіздіктерді шешу..."
                  rows={3}
                  className="w-full text-xs bg-primer-canvas-inset border border-primer-border-default rounded-lg p-2.5 text-primer-fg-default focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis resize-none"
                />
              </div>

              {/* Pedagogical Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primer-fg-default">
                  Педагогикалық фокус / ОДЗ ескерту:
                </label>
                <Input
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Мысалы: Бөлім нөлдері және таңбалар..."
                  className="text-xs h-8"
                />
              </div>

              {/* Controls Row: Grade, Count, Language */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-primer-fg-muted">Сынып:</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2 py-1.5 text-primer-fg-default focus:outline-none"
                  >
                    <option value={7}>7-сынып</option>
                    <option value={8}>8-сынып</option>
                    <option value={9}>9-сынып</option>
                    <option value={10}>10-сынып</option>
                    <option value={11}>11-сынып</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-primer-fg-muted">Саны:</label>
                  <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2 py-1.5 text-primer-fg-default focus:outline-none"
                  >
                    <option value={2}>2 сұрақ</option>
                    <option value={3}>3 сұрақ</option>
                    <option value={4}>4 сұрақ</option>
                    <option value={5}>5 сұрақ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-primer-fg-muted">Тіл:</label>
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value as any)}
                    className="w-full text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2 py-1.5 text-primer-fg-default focus:outline-none"
                  >
                    <option value="KZ">Қазақша</option>
                    <option value="RU">Русский</option>
                    <option value="EN">English</option>
                  </select>
                </div>
              </div>

              {/* Target Topic Selection for DB Save */}
              {existingTopics.length > 0 && (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-primer-fg-muted">
                    Сақталатын тақырып бөлімі (SQLite):
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2 py-1.5 text-primer-fg-default focus:outline-none"
                  >
                    {existingTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Button */}
              <Button
                variant="primary"
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="w-full text-xs font-semibold gap-2 py-2.5 shadow-xs"
              >
                {isGeneratingQuiz ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Сұрақтар құрастырылуда...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Сұрақтарды генерациялау</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Generated Questions Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
              <div className="flex items-center justify-between border-b border-primer-border-muted pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primer-accent-fg" />
                  <h3 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider">
                    Сұрақтардың нәтижесі ({generatedQuestions.length})
                  </h3>
                </div>

                {generatedQuestions.length > 0 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveToDatabase}
                    disabled={isSavingQuiz}
                    className="text-xs gap-1.5 h-7 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingQuiz ? 'Сақталуда...' : '1-Click Базаға сақтау'}</span>
                  </Button>
                )}
              </div>

              {generatedQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-primer-fg-muted space-y-2">
                  <Database className="w-8 h-8 mx-auto text-primer-fg-muted/60" />
                  <p className="font-semibold text-primer-fg-default">Сұрақтар әзірге құрастырылмаған</p>
                  <p className="text-[11px]">
                    Сол жақтағы батырманы басып, Gemini 2.5 Flash көмегімен жаңа тест сұрақтарын алыңыз.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedQuestions.map((q: any, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-primer-border-default bg-primer-canvas-default p-4 space-y-3 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          Тапсырма #{idx + 1}
                        </Badge>
                        <Badge variant="accent" className="text-[10px] font-mono">
                          {q.skill_code || 'ALG_09_INEQ'} (Қиындығы: {q.difficulty || 2}/5)
                        </Badge>
                      </div>

                      {/* Question Text with KaTeX */}
                      <div className="font-semibold text-primer-fg-default text-sm leading-relaxed">
                        <MathText text={q.question_kz || q.question_text || ''} />
                      </div>

                      {/* LaTeX Snippet Preview if present */}
                      {q.katex_snippet && (
                        <div className="p-2 rounded bg-primer-canvas-inset border border-primer-border-muted text-center font-mono">
                          <MathText text={`$$${q.katex_snippet}$$`} />
                        </div>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt: any) => {
                          const isCorrect = String(opt.id).toUpperCase() === String(q.correct_answer).toUpperCase();
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-md border flex items-center gap-2 ${
                                isCorrect
                                  ? 'border-primer-success-emphasis bg-primer-success-subtle text-primer-success-fg font-bold'
                                  : 'border-primer-border-muted bg-primer-canvas-inset text-primer-fg-default'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-current shrink-0">
                                {opt.id}
                              </span>
                              <div className="truncate">
                                <MathText text={opt.latex ? `$${opt.latex}$` : opt.text} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(q.explanation_kz || q.explanation) && (
                        <div className="p-2 rounded bg-primer-canvas-inset border border-primer-border-muted text-[11px] text-primer-fg-muted">
                          <span className="font-bold text-primer-fg-default">Шешім негіздемесі: </span>
                          <MathText text={q.explanation_kz || q.explanation} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilderScreen;
