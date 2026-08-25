import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MathText } from '@/components/ui/MathText';
import { useLanguage } from '@/context/LanguageContext';
import {
  HelpCircle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Users,
  Award,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  RefreshCw,
  Clock,
  FileText
} from 'lucide-react';
import api from '@/api/client';

export interface StudentSubmissionItem {
  attempt_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  avatar_url?: string;
  elo: number;
  rank_tier: string;
  rank_name: string;
  chosen_option?: string;
  text_response?: string;
  is_correct: boolean;
  elo_delta: number;
  submitted_at: string;
  teacher_notes_count: number;
}

export interface QuestionBankItem {
  id: number;
  topic_id: number;
  topic_title: string;
  quarter: number;
  mode: 'A' | 'B';
  mode_label: string;
  question_kz: string;
  question_ru?: string;
  question_en?: string;
  katex_snippet?: string;
  options: Array<{ id: string; text: string; isCorrect?: boolean; latex?: string }>;
  correct_answer: string;
  solution_model?: string;
  explanation_kz?: string;
  explanation_ru?: string;
  explanation_en?: string;
  difficulty: number;
  skill_code: string;
  created_at: string;
  total_submissions: number;
  correct_submissions: number;
  success_rate: number | null;
  submissions: StudentSubmissionItem[];
}

interface QuestionBankManagerProps {
  courseId: number;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ courseId }) => {
  const { t, language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Filters
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'ALL'>('ALL');
  const [selectedMode, setSelectedMode] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      let url = `/teacher/courses/${courseId}/question-bank`;
      const queryParams: string[] = [];
      if (selectedQuarter !== 'ALL') queryParams.push(`quarter=${selectedQuarter}`);
      if (selectedMode !== 'ALL') queryParams.push(`mode=${selectedMode}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

      const res: any = await api.get(url);
      const list = (res && Array.isArray(res.questions))
        ? res.questions
        : (res && res.data && Array.isArray(res.data.questions))
        ? res.data.questions
        : Array.isArray(res)
        ? res
        : [];

      setQuestions(list);
      if (list.length > 0 && expandedQuestionId === null) {
        setExpandedQuestionId(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching question bank:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId, selectedQuarter, selectedMode]);

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question_kz.toLowerCase().includes(query) ||
      q.topic_title.toLowerCase().includes(query) ||
      q.skill_code.toLowerCase().includes(query) ||
      String(q.id).includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter & Toolbar */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 shadow-primer-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter Pills */}
          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted text-xs">
            <button
              onClick={() => setSelectedQuarter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                selectedQuarter === 'ALL'
                  ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs font-bold border border-primer-border-default'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              {lang === 'RU' ? 'Все четверти' : lang === 'EN' ? 'All Quarters' : 'Барлық тоқсан'}
            </button>
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-2.5 py-1 rounded font-mono transition cursor-pointer ${
                  selectedQuarter === q
                    ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs font-bold border border-primer-border-default'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                {q}-тоқсан
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted text-xs">
            <button
              onClick={() => setSelectedMode('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                selectedMode === 'ALL'
                  ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs font-bold border border-primer-border-default'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              {lang === 'RU' ? 'Все типы' : lang === 'EN' ? 'All Types' : 'Барлық түр'}
            </button>
            <button
              onClick={() => setSelectedMode('A')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                selectedMode === 'A'
                  ? 'bg-primer-accent-subtle text-primer-accent-fg shadow-xs font-bold border border-primer-accent-muted'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Mode A (Тест)
            </button>
            <button
              onClick={() => setSelectedMode('B')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                selectedMode === 'B'
                  ? 'bg-purple-950/40 text-purple-300 shadow-xs font-bold border border-purple-800/60'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Mode B (Ашық)
            </button>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-primer-fg-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'RU' ? 'Поиск по тексту, ID, навыку...' : lang === 'EN' ? 'Search question, ID...' : 'Сұрақ, ID, дағды бойынша іздеу...'}
              className="text-xs h-8 pl-8 w-48 sm:w-64"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchQuestions}
            disabled={isLoading}
            className="text-xs h-8 px-2.5"
            title="Жаңарту"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Questions Micro-blocks List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-primer-fg-muted space-y-2">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-primer-accent-fg" />
          <p>Сұрақтар банкі жүктелуде...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-primer-border-default bg-primer-canvas-default p-12 text-center text-xs text-primer-fg-muted space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-primer-fg-muted/60" />
          <h4 className="font-bold text-primer-fg-default text-sm">Сұрақтар табылмады</h4>
          <p className="text-[11px] max-w-md mx-auto">
            Бұл сүзгі бойынша әзірге сұрақтар жоқ. «AI CoPilot & Тест Генераторы» бөлімінде жаңа сұрақтар жасаңыз.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const hasSubmissions = q.submissions.length > 0;

            return (
              <div
                key={q.id}
                className={`rounded-xl border transition shadow-primer-xs overflow-hidden ${
                  isExpanded
                    ? 'border-primer-accent-emphasis/70 bg-primer-canvas-default'
                    : 'border-primer-border-default bg-primer-canvas-default hover:border-primer-border-muted'
                }`}
              >
                {/* Micro-Block Summary Row (Click to toggle) */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                  className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-primer-canvas-subtle/50 select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* ID Badge */}
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primer-canvas-inset border border-primer-border-default text-primer-fg-muted shrink-0">
                      #{q.id}
                    </span>

                    {/* Mode Badge */}
                    <Badge
                      variant={q.mode === 'A' ? 'accent' : 'outline'}
                      className={`text-[10px] font-mono shrink-0 ${
                        q.mode === 'B' ? 'border-purple-500/40 text-purple-400 bg-purple-950/20' : ''
                      }`}
                    >
                      {q.mode === 'A' ? 'Mode A (Тест)' : 'Mode B (Ашық)'}
                    </Badge>

                    {/* Skill Code */}
                    <Badge variant="outline" className="text-[10px] font-mono hidden md:inline-flex shrink-0">
                      {q.skill_code}
                    </Badge>

                    {/* Preview snippet */}
                    <div className="font-semibold text-xs text-primer-fg-default truncate flex-1 min-w-0">
                      {q.question_kz.replace(/\$/g, '').slice(0, 110) + (q.question_kz.length > 110 ? '...' : '')}
                    </div>
                  </div>

                  {/* Right Metadata */}
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    {/* Difficulty */}
                    <span className="text-[11px] text-primer-fg-muted font-mono hidden sm:inline-flex">
                      ★ {q.difficulty}/5
                    </span>

                    {/* Quarter */}
                    <span className="text-[11px] text-primer-fg-muted font-mono hidden lg:inline-flex">
                      {q.quarter}-тоқсан
                    </span>

                    {/* Submissions Badge */}
                    <Badge
                      variant={hasSubmissions ? 'success' : 'outline'}
                      className="text-[10px] font-mono gap-1"
                    >
                      <Users className="w-3 h-3" />
                      <span>{q.total_submissions} {lang === 'RU' ? 'решили' : lang === 'EN' ? 'solved' : 'оқушы'}</span>
                    </Badge>

                    {/* Expand Chevron */}
                    <div className="p-1 rounded text-primer-fg-muted hover:text-primer-fg-default">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Question Details & Student Subpassport Submissions */}
                {isExpanded && (
                  <div className="border-t border-primer-border-muted p-4 sm:p-5 bg-primer-canvas-inset/40 space-y-4 text-xs animate-in fade-in duration-150">
                    {/* Full Question & Topic Header */}
                    <div className="space-y-2 p-3.5 rounded-lg bg-primer-canvas-default border border-primer-border-default">
                      <div className="flex items-center justify-between text-[11px] text-primer-fg-muted border-b border-primer-border-muted pb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-primer-accent-fg" />
                          <span className="font-semibold text-primer-fg-default">{q.topic_title}</span>
                          <span>({q.quarter}-тоқсан)</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(q.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Full Question Text */}
                      <div className="font-semibold text-sm text-primer-fg-default leading-relaxed pt-1">
                        <MathText text={q.question_kz} />
                      </div>

                      {/* KaTeX Snippet Box if available */}
                      {q.katex_snippet && (
                        <div className="p-2.5 rounded bg-primer-canvas-inset border border-primer-border-muted text-center font-mono text-xs">
                          <MathText text={`$$${q.katex_snippet}$$`} />
                        </div>
                      )}

                      {/* Mode A Options */}
                      {q.mode === 'A' && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {q.options.map((opt: any) => {
                            const isCorrect = String(opt.id).toUpperCase() === String(q.correct_answer).toUpperCase();
                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-md border flex items-center gap-2 text-xs ${
                                  isCorrect
                                    ? 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300 font-bold'
                                    : 'border-primer-border-muted bg-primer-canvas-inset text-primer-fg-default'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-current shrink-0">
                                  {opt.id}
                                </span>
                                <div className="truncate">
                                  <MathText text={opt.latex ? `$${opt.latex}$` : opt.text} />
                                </div>
                                {isCorrect && (
                                  <span className="ml-auto text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-200">
                                    Дұрыс
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Mode B Model Solution */}
                      {q.mode === 'B' && q.solution_model && (
                        <div className="p-3 rounded bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-purple-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Silent Grader Эталон шешімі (Solution Model):</span>
                          </div>
                          <div className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                            <MathText text={q.solution_model} />
                          </div>
                        </div>
                      )}

                      {/* Pedagogical Explanation */}
                      {q.explanation_kz && (
                        <div className="p-2.5 rounded bg-primer-canvas-inset border border-primer-border-muted text-[11px] text-primer-fg-muted">
                          <span className="font-bold text-primer-fg-default">Түсіндірме: </span>
                          <MathText text={q.explanation_kz} />
                        </div>
                      )}
                    </div>

                    {/* Student Submissions Subpassport Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-primer-fg-default">
                          <Users className="w-4 h-4 text-primer-accent-fg" />
                          <span>Оқушылардың жауаптары мен Subpassport деректері:</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {q.submissions.length} жауап
                          </Badge>
                        </div>

                        {q.success_rate !== null && (
                          <span className="text-[11px] font-mono text-primer-fg-muted">
                            Табыстылық: <strong className="text-primer-fg-default">{q.success_rate}%</strong>
                          </span>
                        )}
                      </div>

                      {q.submissions.length === 0 ? (
                        <div className="p-4 rounded-lg bg-primer-canvas-default border border-primer-border-default text-center text-xs text-primer-fg-muted">
                          Бұл тапсырма бойынша оқушылар әлі жауап жіберген жоқ.
                        </div>
                      ) : (
                        <div className="rounded-lg border border-primer-border-default bg-primer-canvas-default overflow-hidden">
                          <div className="divide-y divide-primer-border-muted">
                            {q.submissions.map((sub) => (
                              <div
                                key={sub.attempt_id}
                                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-primer-canvas-subtle/40 text-xs"
                              >
                                {/* Student Info & Rank */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-primer-canvas-inset border border-primer-border-default flex items-center justify-center font-bold text-[11px] text-primer-accent-fg shrink-0">
                                    {sub.student_name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-primer-fg-default flex items-center gap-2">
                                      <span>{sub.student_name}</span>
                                      <Badge variant="outline" className="text-[10px] font-mono py-0">
                                        {sub.rank_name} ({sub.elo} XP)
                                      </Badge>
                                    </div>
                                    <div className="text-[11px] text-primer-fg-muted">
                                      {sub.student_email}
                                    </div>
                                  </div>
                                </div>

                                {/* Student Answer & Result */}
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right text-[11px] font-mono">
                                    <span className="text-primer-fg-muted">Жауабы: </span>
                                    <strong className="text-primer-fg-default">
                                      {sub.chosen_option ? `Вариант [${sub.chosen_option}]` : sub.text_response ? sub.text_response.slice(0, 30) : '—'}
                                    </strong>
                                  </div>

                                  <Badge
                                    variant={sub.is_correct ? 'success' : 'danger'}
                                    className="text-[10px] font-mono gap-1"
                                  >
                                    {sub.is_correct ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    <span>{sub.is_correct ? `+${sub.elo_delta} XP` : '0 XP'}</span>
                                  </Badge>

                                  <span className="text-[10px] text-primer-fg-muted font-mono hidden md:inline">
                                    {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
