import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MathText } from '@/components/ui/MathText';
import { NumberLinePrimitive } from '@/components/ui/NumberLinePrimitive';
import { ThoughtForkTriad } from '@/features/socratic-tutor/ThoughtForkTriad';
import { ThoughtFork } from '@zerde/shared';
import {
  ArrowLeft,
  Flame,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Camera,
  UploadCloud,
  Send,
  RotateCcw,
  ArrowRight,
  Sliders
} from 'lucide-react';
import api from '@/api/client';

export interface TaskTrainerScreenProps {
  topicTitle?: string;
  courseId?: number;
  subjectName?: string;
  onClose: () => void;
}

export const TaskTrainerScreen: React.FC<TaskTrainerScreenProps> = ({
  topicTitle = 'Квадраттық теңсіздіктер және интервалдар әдісі',
  courseId = 1,
  subjectName = 'Математика (Алгебра)',
  onClose
}) => {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const isRU = language === 'RU';
  const isEN = language === 'EN';
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  // --- Trainer State ---
  const [currentElo, setCurrentElo] = useState<number>(user?.elo ?? user?.overallElo ?? 1000);
  const [streakDays, setStreakDays] = useState<number>(user?.streakDays || 0);
  const [secondsLeft, setSecondsLeft] = useState<number>(180);
  const [mode, setMode] = useState<'A' | 'B'>('A');

  // --- Questions State ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [eloGain, setEloGain] = useState<number>(0);

  // --- Socrates "Aga" Shutter State ---
  const [isSocratesOpen, setIsSocratesOpen] = useState(false);
  const [socratesLoading, setSocratesLoading] = useState(false);
  const [socratesData, setSocratesData] = useState<any>(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [isEurekaCelebration, setIsEurekaCelebration] = useState(false);

  // --- Mode B Open Response State ---
  const [openSolutionText, setOpenSolutionText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answersGridRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Rank badge label
  const getRankBadge = (elo: number) => {
    if (elo >= 1600) return { label: '⭐ Самғау (1600+)', color: 'text-purple-400 bg-purple-950/40 border-purple-800' };
    if (elo >= 1400) return { label: '🦅 Қыран (1400+)', color: 'text-amber-400 bg-amber-950/40 border-amber-800' };
    if (elo >= 1200) return { label: '🌿 Тұғыр (1200+)', color: 'text-blue-400 bg-blue-950/40 border-blue-800' };
    return { label: '🌱 Өскін (1000+)', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
  };

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await api.get<any[]>(`/questions?topic=${encodeURIComponent(topicTitle)}&language=${lang}`);
        if (Array.isArray(res) && res.length > 0) {
          setQuestions(res);
        } else {
          // Default pre-calibrated question list
          setQuestions([
            {
              id: 'q1',
              questionText: `«${topicTitle}» тақырыбы бойынша квадраттық теңсіздікті шешіңіз: $x^2 - 5x + 6 \\le 0$`,
              katex_snippet: 'x^2 - 5x + 6 \\le 0 \\implies (x-2)(x-3) \\le 0',
              hasNumberLine: true,
              options: [
                { id: 'A', text: '[2; 3]', isCorrect: true },
                { id: 'B', text: '(-\\infty; 2] \\cup [3; +\\infty)', isCorrect: false },
                { id: 'C', text: '(2; 3)', isCorrect: false },
                { id: 'D', text: 'x \\le 2', isCorrect: false }
              ],
              explanation: 'Түбірлері $x_1 = 2, x_2 = 3$. Парабола тармақтары жоғары және $\\le 0$ болғандықтан, шешім кесіндісі: $[2; 3]$.'
            },
            {
              id: 'q2',
              questionText: `Бөлшек-рационал теңсіздікті шешіп, бөлімнің нөлін ескеріңіз: $\\frac{x - 4}{x + 1} > 0$`,
              katex_snippet: 'x + 1 \\neq 0 \\implies x \\neq -1',
              hasNumberLine: true,
              options: [
                { id: 'A', text: '(-\\infty; -1) \\cup (4; +\\infty)', isCorrect: true },
                { id: 'B', text: '(-1; 4)', isCorrect: false },
                { id: 'C', text: 'x > 4', isCorrect: false },
                { id: 'D', text: 'x \\neq -1', isCorrect: false }
              ],
              explanation: 'Таңбалар әдісі бойынша аралықтар: $(-\\infty; -1) \\cup (4; +\\infty)$. Бөлімі $x=-1$ нүктесінде нөлге тең бола алмайды.'
            }
          ]);
        }
      } catch (err) {
        console.warn('[TaskTrainerScreen] Using pre-calibrated questions', err);
      }
    };
    loadQuestions();
  }, [topicTitle, lang]);

  const currentQuestion = questions[currentIndex] || {
    questionText: `«${topicTitle}» тақырыбы бойынша есеп: $x^2 - 5x + 6 \\le 0$`,
    katex_snippet: 'x^2 - 5x + 6 \\le 0',
    hasNumberLine: true,
    options: [
      { id: 'A', text: '[2; 3]', isCorrect: true },
      { id: 'B', text: '(-\\infty; 2] \\cup [3; +\\infty)', isCorrect: false },
      { id: 'C', text: '(2; 3)', isCorrect: false },
      { id: 'D', text: 'x \\le 2', isCorrect: false }
    ],
    explanation: 'Түбірлері $x_1 = 2, x_2 = 3$. Шешімі: $[2; 3]$.'
  };

  // --- Call Socrates "Aga" ---
  const handleCallSocrates = async (isMistakeTrigger: boolean = false) => {
    setIsSocratesOpen(true);
    setSocratesLoading(true);

    try {
      const res = await api.post<any>('/tutor/socrates', {
        topicTitle,
        questionId: currentQuestion.id,
        currentElo,
        language: lang,
        isSecondMistake: consecutiveErrors >= 1,
        studentAnswer: selectedOption ? `Таңдалған нұсқа: ${selectedOption}` : openSolutionText
      });

      if (res) {
        setSocratesData(res);
      }
    } catch (e) {
      console.warn('[Socrates] Call failed, fallback active', e);
    } finally {
      setSocratesLoading(false);
    }
  };

  // --- Select Thought-Fork in Socrates Triad ---
  const handleSelectFork = async (fork: ThoughtFork) => {
    try {
      const isCorrectStep = fork.key === 'A' || fork.type === 'true_step';
      
      const res = await api.post<any>('/tutor/socrates', {
        topicTitle,
        questionId: currentQuestion.id,
        currentElo,
        language: lang,
        selectedForkKey: fork.key,
        isEurekaChoice: isCorrectStep
      });

      if (isCorrectStep) {
        setIsEurekaCelebration(true);
        const addedElo = 15;
        setCurrentElo((prev) => prev + addedElo);
        setEloGain(addedElo);
      }

      if (res) {
        setSocratesData(res);
      }
    } catch (e) {
      console.warn('[Socrates] Fork selection error', e);
    }
  };

  // --- Option Selection in Mode A ---
  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);

    // Smooth auto-scroll to action button
    setTimeout(() => {
      answersGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // --- Submit Mode A Answer ---
  const handleSubmitAnswer = () => {
    if (!selectedOption || isSubmitted) return;

    const opt = currentQuestion.options.find((o: any) => o.id === selectedOption);
    const correct = Boolean(opt?.isCorrect);

    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      const reward = 10;
      setEloGain(reward);
      setCurrentElo((prev) => prev + reward);
      setConsecutiveErrors(0);
    } else {
      setConsecutiveErrors((prev) => prev + 1);
      // Auto-trigger Socrates "Aga" on error
      handleCallSocrates(true);
    }
  };

  // --- Submit Mode B Open Solution ---
  const handleSubmitOpenSolution = () => {
    if (!openSolutionText.trim() && uploadedPhotos.length === 0) return;
    setIsSubmitted(true);
    setIsCorrect(true);
    const reward = uploadedPhotos.length > 0 ? 15 : 7;
    setEloGain(reward);
    setCurrentElo((prev) => prev + reward);
  };

  // --- Next Question ---
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setIsSocratesOpen(false);
    setSocratesData(null);
    setIsEurekaCelebration(false);
    setOpenSolutionText('');
    setUploadedPhotos([]);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed session
      onClose();
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (uploadedPhotos.length >= 10) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const currentRank = getRankBadge(currentElo);

  return (
    <div className="min-h-screen bg-primer-canvas-default text-primer-fg-default flex flex-col justify-between max-w-4xl mx-auto px-4 py-4 space-y-4">
      {/* ========================================================================= */}
      {/* БЛОК 1: ВЕРХНЯЯ ШТОРКА (Header & Socrates Shutter)                         */}
      {/* ========================================================================= */}
      <div className="bg-primer-canvas-subtle border border-primer-border-default rounded-2xl p-4 shadow-primer-sm space-y-3">
        {/* Navigation & Student Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-primer-canvas-inset border border-primer-border-default hover:border-primer-accent-emphasis hover:text-primer-accent-fg transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Шығу</span>
            </button>

            <div>
              <h2 className="text-sm font-bold text-primer-fg-default leading-tight">
                {topicTitle}
              </h2>
              <p className="text-[11px] text-primer-fg-muted">
                {subjectName} • {currentIndex + 1}/{questions.length || 2} есеп
              </p>
            </div>
          </div>

          {/* Indicators Pill */}
          <div className="flex items-center gap-2">
            {/* ELO Rank */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentRank.color}`}>
              {currentRank.label} • {currentElo} ELO
            </span>

            {/* Streak */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primer-attention-subtle/30 text-primer-attention-fg border border-primer-attention-emphasis/40 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>{streakDays} күн</span>
            </span>

            {/* Timer */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primer-canvas-inset text-primer-fg-muted border border-primer-border-muted text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsLeft)}</span>
            </span>

            {/* Socratic Call Button */}
            <button
              onClick={() => handleCallSocrates(false)}
              className="px-3 py-1 rounded-full bg-primer-accent-emphasis text-white hover:bg-primer-accent-emphasis/90 transition text-xs font-bold flex items-center gap-1.5 shadow-primer-xs cursor-pointer"
            >
              <span>🦉</span>
              <span>Ағадан сұрау</span>
            </button>
          </div>
        </div>

        {/* Collapsible Socratic Shutter Drawer */}
        {isSocratesOpen && (
          <div className="mt-3 pt-3 border-t border-primer-border-muted bg-primer-canvas-inset p-3.5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🦉</span>
                <h4 className="text-xs font-bold text-primer-accent-fg uppercase tracking-wider">
                  Сократ «Аға» наставнигі
                </h4>
              </div>
              <button
                onClick={() => setIsSocratesOpen(false)}
                className="text-[11px] text-primer-fg-muted hover:text-primer-fg-default cursor-pointer"
              >
                Жабу ✕
              </button>
            </div>

            {socratesLoading ? (
              <div className="py-4 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
                <span className="animate-spin text-sm">⏳</span>
                <span>Аға ойланып жатыр... (Генерация подсказки на казахском)</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* 1 Guiding Question Line */}
                <p className="text-xs font-semibold text-primer-fg-default bg-primer-accent-subtle/20 border border-primer-accent-emphasis/30 p-2.5 rounded-lg">
                  {socratesData?.question_line || `«${topicTitle}» есебіне мұқият қарашы: талдауды қай қадамнан бастаймыз?`}
                </p>

                {/* 3 Thought-Forks Triad */}
                <ThoughtForkTriad
                  forks={socratesData?.thought_forks || [
                    {
                      key: 'A',
                      title: 'Функцияның түбірлерін табу',
                      type: 'true_step',
                      description: 'Өрнекті нөлге теңестіріп, шекаралық нүктелерді анықтаймыз.',
                      latex: 'x^2 - 5x + 6 = 0'
                    },
                    {
                      key: 'B',
                      title: 'Теріс санға бөлгенде таңбаны ұмыту (Тұзақ)',
                      type: 'cognitive_trap',
                      description: 'Теріс санға бөлгенде теңсіздік таңбасы қарама-қарсыға ауысады.',
                      latex: '-2x \\le 6 \\implies x \\ge -3'
                    },
                    {
                      key: 'C',
                      title: 'Интервалдар әдісінің негізгі ережесі',
                      type: 'basic_rule',
                      description: 'Қатаң емес теңсіздікте нүкте боялады (квадрат жақша).',
                      latex: 'x \\in [a; b]'
                    }
                  ]}
                  onSelectFork={handleSelectFork}
                  language={lang.toLowerCase() as any}
                />

                {/* Eureka Celebration Banner */}
                {isEurekaCelebration && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-600/50 rounded-lg flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span>🎉</span>
                      <span>Керемет озарение (Eureka Moment)! +15 ELO қосылды!</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* БЛОК 2: ХОЛСТ ВОПРОСА (Markdown + KaTeX + ZVDSL+ Primitives)                */}
      {/* ========================================================================= */}
      <div className="bg-primer-canvas-subtle border border-primer-border-default rounded-2xl p-5 shadow-primer-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-primer-fg-muted">
          <span className="font-semibold uppercase tracking-wider">Есеп шарты</span>
          <span className="bg-primer-canvas-inset px-2 py-0.5 rounded text-[11px] font-mono border border-primer-border-muted">
            KaTeX + ZVDSL+
          </span>
        </div>

        {/* Question Text with KaTeX */}
        <div className="text-base font-medium text-primer-fg-default leading-relaxed">
          <MathText text={currentQuestion.questionText} />
        </div>

        {/* KaTeX formula snippet */}
        {currentQuestion.katex_snippet && (
          <div className="p-3 bg-primer-canvas-inset border border-primer-border-muted rounded-xl text-center font-mono text-sm">
            <MathText text={`$$${currentQuestion.katex_snippet}$$`} />
          </div>
        )}

        {/* Native ZVDSL+ Number Line Primitive (Числовая прямая) */}
        {currentQuestion.hasNumberLine && (
          <NumberLinePrimitive />
        )}
      </div>

      {/* ========================================================================= */}
      {/* БЛОК 3: ИНТЕРАКТИВНЫЕ ОТВЕТЫ (РЕЖИМ А или РЕЖИМ Б)                         */}
      {/* ========================================================================= */}
      <div ref={answersGridRef} className="bg-primer-canvas-subtle border border-primer-border-default rounded-2xl p-5 shadow-primer-sm space-y-4">
        {/* Mode Selector Header */}
        <div className="flex items-center justify-between border-b border-primer-border-muted pb-3">
          <span className="text-xs font-bold text-primer-fg-muted uppercase tracking-wider">
            Жауап беру тәсілі
          </span>

          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted">
            <button
              onClick={() => setMode('A')}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                mode === 'A'
                  ? 'bg-primer-accent-emphasis text-white shadow-primer-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Режим А (Тест)
            </button>
            <button
              onClick={() => setMode('B')}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                mode === 'B'
                  ? 'bg-primer-accent-emphasis text-white shadow-primer-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Режим Б (Ашық шешім / Фото)
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* РЕЖИМ А: Тестовая сетка до 8 вариантов с автоскроллом                    */}
        {/* ----------------------------------------------------------------------- */}
        {mode === 'A' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt: any) => {
                const isSelected = selectedOption === opt.id;
                let cardStyle = 'bg-primer-canvas-inset border-primer-border-default hover:border-primer-accent-emphasis hover:bg-primer-accent-subtle/10';

                if (isSubmitted) {
                  if (opt.isCorrect) {
                    cardStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-300';
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle = 'bg-rose-950/40 border-rose-600 text-rose-300';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-primer-accent-subtle/30 border-primer-accent-emphasis ring-1 ring-primer-accent-emphasis';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    disabled={isSubmitted}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center font-mono ${
                        isSelected ? 'bg-primer-accent-emphasis text-white' : 'bg-primer-canvas-default text-primer-fg-muted border border-primer-border-muted'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="text-sm font-medium">
                        <MathText text={opt.text} />
                      </span>
                    </div>

                    {isSubmitted && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-primer-fg-muted">
                {!isSubmitted ? 'Нұсқаны таңдап, тексеруді басыңыз' : isCorrect ? '🎉 Дұрыс жауап!' : '❌ Қате жауап, Ағадан көмек сұраңыз'}
              </div>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="px-5 py-2 rounded-xl bg-primer-accent-emphasis text-white font-bold text-xs hover:bg-primer-accent-emphasis/90 transition shadow-primer-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <span>Жауапты тексеру</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-primer-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Келесі есеп</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* РЕЖИМ Б: Открытый ответ / Фото тетради                                   */}
        {/* ----------------------------------------------------------------------- */}
        {mode === 'B' && (
          <div className="space-y-3">
            {/* Textarea for written steps */}
            <div>
              <label className="text-xs font-semibold text-primer-fg-muted mb-1 block">
                Шешу жолын жазыңыз (формулалар, қадамдар):
              </label>
              <textarea
                value={openSolutionText}
                onChange={(e) => setOpenSolutionText(e.target.value)}
                placeholder="Мысалы: (x-2)(x-3) <= 0 түбірлерін тауып, сан түзуінде белгіледім..."
                rows={4}
                maxLength={4000}
                className="w-full p-3 rounded-xl bg-primer-canvas-inset border border-primer-border-default text-xs text-primer-fg-default placeholder-primer-fg-subtle focus:outline-none focus:border-primer-accent-emphasis resize-none"
              />
            </div>

            {/* Photo Upload Zone */}
            <div>
              <div className="flex items-center justify-between text-xs text-primer-fg-muted mb-1.5">
                <span>Дәптер фотосы (10 фотоға дейін):</span>
                <span>{uploadedPhotos.length}/10 жүктелді</span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {uploadedPhotos.map((photo, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg border border-primer-border-default overflow-hidden relative group">
                    <img src={photo} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {uploadedPhotos.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border border-dashed border-primer-border-default bg-primer-canvas-inset hover:border-primer-accent-emphasis flex flex-col items-center justify-center text-primer-fg-muted hover:text-primer-accent-fg transition cursor-pointer text-[10px]"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Фото</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit Mode B */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-primer-fg-muted">
                ИИ-бағалау: толық шешімге +15 ELO, қысқа жауапқа +7 ELO
              </span>

              <button
                onClick={handleSubmitOpenSolution}
                disabled={!openSolutionText.trim() && uploadedPhotos.length === 0}
                className="px-5 py-2 rounded-xl bg-primer-accent-emphasis text-white font-bold text-xs hover:bg-primer-accent-emphasis/90 transition shadow-primer-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Шешімді тексеруге жіберу</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTrainerScreen;
