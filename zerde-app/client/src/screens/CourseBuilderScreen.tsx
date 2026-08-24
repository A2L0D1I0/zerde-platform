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
  Trash2
} from 'lucide-react';
import api from '@/api/client';

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

export const CourseBuilderScreen: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [topicTitle, setTopicTitle] = useState('Квадраттық теңсіздіктерді шешу (Интервалдар әдісі)');
  const [gradeLevel, setGradeLevel] = useState<number>(9);
  const [count, setCount] = useState<number>(3);
  const [focus, setFocus] = useState('Бөлшек бөлімінің нөлдерін ескеру және сан түзуіндегі таңбалар');
  const [selectedLang, setSelectedLang] = useState<'KZ' | 'RU' | 'EN'>('KZ');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [existingTopics, setExistingTopics] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);

  // Load existing topics
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res: any = await api.get('/courses/1/topics');
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (list.length > 0) {
          setExistingTopics(list);
          setSelectedTopicId(list[0].id);
        }
      } catch (err) {
        console.warn('Failed to fetch topics', err);
      }
    };
    loadTopics();
  }, []);

  // 1. Call Single-Turn Micro Co-Pilot
  const handleGenerateQuiz = async () => {
    if (!topicTitle.trim()) {
      showToast({ title: 'Тақырып атауын енгізіңіз', type: 'danger' });
      return;
    }

    setIsGenerating(true);
    try {
      const res: any = await api.post('/teacher/copilot/generate-quiz', {
        topic_title: topicTitle.trim(),
        grade_level: gradeLevel,
        count: count,
        focus: focus.trim(),
        language: selectedLang,
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        showToast({
          title: lang === 'KZ' ? 'Сұрақтар сәтті құрастырылды!' : 'Вопросы успешно сгенерированы!',
          type: 'success',
        });
      } else {
        throw new Error('Бос жауап алынды');
      }
    } catch (err: any) {
      console.error('[CoPilot] Generation failed', err);
      showToast({
        title: lang === 'KZ' ? 'Генерация қатесі. Fallback қолданылды.' : 'Ошибка генерации. Применен Fallback.',
        type: 'attention',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Batch Save Generated Questions to SQLite Database
  const handleSaveToDatabase = async () => {
    if (generatedQuestions.length === 0) return;

    setIsSaving(true);
    try {
      await api.post(`/teacher/courses/${selectedCourseId}/topics/${selectedTopicId}/questions/batch`, {
        questions: generatedQuestions,
      });

      showToast({
        title: lang === 'KZ' ? 'Сұрақтар базаға (SQLite) сәтті сақталды!' : 'Вопросы успешно сохранены в базу!',
        type: 'success',
      });
      setGeneratedQuestions([]);
    } catch (err: any) {
      console.error('[CoPilot] Save failed', err);
      showToast({
        title: lang === 'KZ' ? 'Базаға сақтау қатесі' : 'Ошибка сохранения в базу',
        type: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 space-y-6 py-2">
      {/* Header */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 sm:p-5 shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primer-accent-emphasis text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-primer-fg-default">
                AI Course Studio — Мұғалімнің Micro Co-Pilot көмекшісі
              </h2>
              <Badge variant="accent" className="text-[10px] font-mono">
                Single-Turn Quiz Gen
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              Тақырып бойынша KaTeX формулаларымен жабдықталған сапалы тест сұрақтарын 1 кликпен құрастыру және базаға сақтау
            </p>
          </div>
        </div>
      </div>

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
              <label className="text-xs font-semibold text-primer-fg-default">
                Сабақ тақырыбы:
              </label>
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
                  className="w-full text-xs bg-primer-canvas-inset border border-primer-border-default rounded-md px-2.5 py-1.5 text-primer-accent-fg focus:outline-none"
                >
                  {existingTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}. {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="w-full gap-2 bg-primer-accent-emphasis hover:bg-primer-accent-emphasis/90 text-white font-bold text-xs py-2 cursor-pointer shadow-xs"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI сұрақтарды құрастыруда...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Сұрақтар құрастыру (Сгенерировать)</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Generated Questions Preview & Save (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-4 min-h-[360px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primer-border-muted pb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primer-accent-fg" />
                  <h3 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider">
                    Сұрақтарды алдын ала қарау ({generatedQuestions.length})
                  </h3>
                </div>

                {generatedQuestions.length > 0 && (
                  <Button
                    onClick={handleSaveToDatabase}
                    disabled={isSaving}
                    size="sm"
                    className="gap-1.5 bg-primer-success-emphasis hover:bg-primer-success-emphasis/90 text-white font-bold text-xs cursor-pointer"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Банкке сақтау (Сохранить в базу)</span>
                  </Button>
                )}
              </div>

              {generatedQuestions.length === 0 ? (
                <div className="p-12 text-center text-xs text-primer-fg-muted space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primer-canvas-inset border border-primer-border-muted flex items-center justify-center mx-auto text-primer-fg-muted">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-primer-fg-default">
                    Әзірге сұрақтар генерацияланбаған
                  </p>
                  <p className="max-w-md mx-auto text-[11px]">
                    Сол жақтағы формаға тақырыпты енгізіп, «Сұрақтар құрастыру» түймесін басыңыз. Gemini AI KaTeX формулаларымен тест тапсырмаларын дайындайды.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {generatedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-primer-border-default bg-primer-canvas-inset space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {q.skill_code || 'ALG_09_INEQ'}
                          </Badge>
                        </div>
                        <Badge variant="default" className="text-[10px]">
                          Дұрыс жауап: {q.correct_answer}
                        </Badge>
                      </div>

                      {/* Question Text with KaTeX */}
                      <div className="text-xs font-semibold text-primer-fg-default leading-relaxed">
                        <MathText text={q.question_kz || q.question_ru || ''} />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = opt.id === q.correct_answer || opt.isCorrect;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded border text-xs flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-primer-success-subtle/40 border-primer-success-muted text-primer-success-fg font-bold'
                                  : 'bg-primer-canvas-subtle border-primer-border-muted text-primer-fg-muted'
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0">
                                {opt.id}
                              </span>
                              <span>
                                <MathText text={opt.latex || opt.text} />
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(q.explanation_kz || q.explanation_ru) && (
                        <p className="text-[11px] text-primer-fg-muted bg-primer-canvas-subtle p-2 rounded border border-primer-border-muted/60 leading-relaxed">
                          💡 <strong>Түсіндірме:</strong>{' '}
                          <MathText text={q.explanation_kz || q.explanation_ru || ''} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {generatedQuestions.length > 0 && (
              <div className="pt-3 border-t border-primer-border-muted flex items-center justify-end">
                <Button
                  onClick={handleSaveToDatabase}
                  disabled={isSaving}
                  className="gap-1.5 bg-primer-success-emphasis hover:bg-primer-success-emphasis/90 text-white font-bold text-xs cursor-pointer"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Банкке сақтау (Сохранить в базу)</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderScreen;
