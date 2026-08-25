import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MathText } from '@/components/ui/MathText';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  ArrowRight,
  Sliders,
  X
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

  // --- Mode B Open Response & Silent Grader State ---
  const [openSolutionText, setOpenSolutionText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSilentGrading, setIsSilentGrading] = useState(false);
  const [silentGraderResult, setSilentGraderResult] = useState<any | null>(null);
  const [silentGradingError, setSilentGradingError] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
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

  // Rank badge label with XP
  const getRankBadge = (xp: number) => {
    if (xp >= 1600) return { label: 'Самғау (1600+ XP)', color: 'text-purple-400 bg-purple-950/40 border-purple-800' };
    if (xp >= 1400) return { label: 'Қыран (1400+ XP)', color: 'text-amber-400 bg-amber-950/40 border-amber-800' };
    if (xp >= 1200) return { label: 'Тұғыр (1200+ XP)', color: 'text-blue-400 bg-blue-950/40 border-blue-800' };
    return { label: 'Өскін (1000+ XP)', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
  };

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load questions on mount: strictly 4 questions per session
  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    setLoadError(null);
    try {
      const res = await api.get<any[]>(`/questions?topic=${encodeURIComponent(topicTitle)}&language=${lang}`);
      if (Array.isArray(res) && res.length > 0) {
        // Enforce exactly up to 4 questions per training session
        setQuestions(res.slice(0, 4));
      } else {
        setQuestions([]);
        setLoadError(lang === 'KZ' ? 'Бұл тақырып бойынша әзірге сұрақтар табылмады' : lang === 'RU' ? 'Вопросы по данной теме не найдены' : 'No questions found for this topic');
      }
    } catch (err: any) {
      console.warn('[TaskTrainerScreen] Failed to load questions', err);
      setQuestions([]);
      setLoadError(err?.message || (lang === 'KZ' ? 'Сұрақтарды жүктеу сәтсіз аяқталды' : 'Ошибка загрузки вопросов'));
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [topicTitle, lang]);

  const currentQuestion = questions[currentIndex] || null;

  // Auto-sync mode and reset form on question change
  useEffect(() => {
    if (currentQuestion) {
      if (currentQuestion.options && currentQuestion.options.length > 0) {
        setMode('A');
      } else {
        setMode('B');
      }
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrect(false);
      setOpenSolutionText('');
      setSilentGraderResult(null);
      setIsSocratesOpen(false);
    }
  }, [currentIndex, currentQuestion]);

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

    const opt = currentQuestion.options?.find((o: any) => o.id === selectedOption);
    const correct = Boolean(
      opt?.isCorrect === true ||
      currentQuestion.correctAnswer === selectedOption ||
      currentQuestion.correct_answer === selectedOption
    );

    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      const reward = 10;
      setEloGain(reward);
      setCurrentElo((prev) => prev + reward);
      setConsecutiveErrors(0);
    } else {
      setConsecutiveErrors((prev) => prev + 1);
      // Socrates is strictly voluntary: no auto-popup
    }
  };

  // --- Submit Mode B Open Solution via Silent Grader ---
  const handleSubmitOpenSolution = async () => {
    if (!openSolutionText.trim() && uploadedPhotos.length === 0) return;

    const currentQ = questions[currentIndex];
    const qid = currentQ?.id || 1;

    setIsSilentGrading(true);
    setSilentGradingError(null);

    try {
      const res: any = await api.post('/student/tasks/grade-type-b', {
        question_id: qid,
        student_response: openSolutionText.trim() || 'Тетрадтағы жазбаша шешу фотосы жүктелді',
        language: lang
      });

      const data = res?.data || res;
      setSilentGraderResult(data);
      setIsSubmitted(true);
      setIsCorrect(data.verdict === 'FULL_CREDIT' || data.verdict === 'PARTIAL_CREDIT');
      setEloGain(data.score_xp || 0);

      if (data.new_subject_elo) {
        setCurrentElo(data.new_subject_elo);
        if (updateUser) {
          updateUser({ elo: data.new_subject_elo });
        }
      }
    } catch (err: any) {
      console.error('[TaskTrainer] Silent Grader failed', err);
      setSilentGradingError(
        err?.response?.data?.error ||
        err?.message ||
        (lang === 'KZ' ? 'Шешімді тексеру қатесі орын алды' : 'Ошибка проверки решения Silent Grader')
      );
    } finally {
      setIsSilentGrading(false);
    }
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
    setSilentGraderResult(null);
    setSilentGradingError(null);
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
            {/* XP Rank */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentRank.color}`}>
              {currentRank.label} • {currentElo} XP
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
                      <span>Керемет озарение (Eureka Moment)! +15 XP қосылды!</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* БЛОК 2 & 3: ХОЛСТ ВОПРОСА И ВАРИАНТЫ ОТВЕТОВ / EMPTY & ERROR STATE       */}
      {/* ========================================================================= */}
      {isLoadingQuestions ? (
        <div className="bg-primer-canvas-subtle border border-primer-border-default rounded-2xl p-12 text-center space-y-3 shadow-primer-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primer-accent-fg" />
          <p className="text-xs font-semibold text-primer-fg-muted">
            {lang === 'KZ' ? 'Сұрақтар жүктелуде...' : lang === 'RU' ? 'Загрузка вопросов...' : 'Loading questions...'}
          </p>
        </div>
      ) : !currentQuestion ? (
        <div className="bg-primer-canvas-subtle border border-primer-border-default rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-primer-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-primer-canvas-inset border border-primer-border-muted flex items-center justify-center text-primer-fg-muted">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Сұрақтар табылмады' : lang === 'RU' ? 'Вопросы не найдены' : 'No questions found'}
            </h3>
            <p className="text-xs text-primer-fg-muted max-w-sm mx-auto">
              {loadError || (lang === 'KZ' ? 'Бұл тақырып бойынша әзірге сұрақтар енгізілмеген.' : 'По данной теме пока нет доступных вопросов.')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={loadQuestions}
              className="px-4 py-2 rounded-xl bg-primer-accent-emphasis text-white font-bold text-xs hover:bg-primer-accent-emphasis/90 transition shadow-primer-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'KZ' ? 'Қайталау' : lang === 'RU' ? 'Повторить попытку' : 'Retry'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primer-canvas-inset border border-primer-border-default hover:bg-primer-canvas-subtle font-bold text-xs transition cursor-pointer"
            >
              {lang === 'KZ' ? 'Артқа қайту' : lang === 'RU' ? 'Назад' : 'Back'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* БЛОК 2: ХОЛСТ ВОПРОСА (Markdown + KaTeX + ZVDSL+ Primitives) */}
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

          {/* БЛОК 3: ИНТЕРАКТИВНЫЕ ОТВЕТЫ (РЕЖИМ А или РЕЖИМ Б) */}
          <div ref={answersGridRef} className="bg-primer-canvas-subtle border border-primer-border-default rounded-2xl p-5 shadow-primer-sm space-y-4">
            {/* Header: Task Type (Automatic from CoPilot / Question Model) */}
            <div className="flex items-center justify-between border-b border-primer-border-muted pb-3">
              <span className="text-xs font-bold text-primer-fg-muted uppercase tracking-wider">
                {lang === 'KZ' ? 'Жауап беру формасы' : 'Форма ответа'}
              </span>

              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primer-canvas-inset border border-primer-border-muted text-primer-accent-fg">
                {(currentQuestion.mode === 'B' || currentQuestion.mode === 'TYPE_B_OPEN' || !currentQuestion.options || currentQuestion.options.length === 0)
                  ? (lang === 'KZ' ? '✍️ Ашық шешім (Тип Б)' : '✍️ Развернутое решение (Тип Б)')
                  : (lang === 'KZ' ? '🎯 Тесттік тапсырма (Тип А)' : '🎯 Тестовое задание (Тип А)')}
              </span>
            </div>

            {/* РЕЖИМ А: Тестовая сетка */}
            {!(currentQuestion.mode === 'B' || currentQuestion.mode === 'TYPE_B_OPEN' || !currentQuestion.options || currentQuestion.options.length === 0) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options?.map((opt: any) => {
                    const isSelected = selectedOption === opt.id;
                    const isOptCorrect = Boolean(
                      opt.isCorrect === true ||
                      currentQuestion.correctAnswer === opt.id ||
                      currentQuestion.correct_answer === opt.id
                    );

                    let cardStyle = 'bg-primer-canvas-inset border-primer-border-default hover:border-primer-accent-emphasis hover:bg-primer-accent-subtle/10';

                    if (isSubmitted) {
                      if (isOptCorrect) {
                        cardStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-300';
                      } else if (isSelected && !isOptCorrect) {
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

                        {isSubmitted && isOptCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !isOptCorrect && (
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
                      <span>{lang === 'KZ' ? 'Жауапты тексеру' : 'Проверить ответ'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCallSocrates(false)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-500/20 transition shadow-primer-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🦉</span>
                        <span>{lang === 'KZ' ? 'Сократты шақыру' : 'Вызвать Сократа'}</span>
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        className="px-5 py-2 rounded-xl bg-primer-accent-emphasis text-white font-bold text-xs hover:bg-primer-accent-emphasis/90 transition shadow-primer-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{lang === 'KZ' ? 'Келесі есеп' : 'Следующая задача'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* РЕЖИМ Б: Открытый ответ / Фото тетради / Silent Grader */}
            {(currentQuestion.mode === 'B' || currentQuestion.mode === 'TYPE_B_OPEN' || !currentQuestion.options || currentQuestion.options.length === 0) && (
              <div className="space-y-3">
                {isSilentGrading ? (
                  <div className="p-8 rounded-xl bg-primer-canvas-inset border border-primer-accent-emphasis/40 text-center space-y-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-primer-accent-emphasis/20 text-primer-accent-fg flex items-center justify-center mx-auto text-xl">
                      🦉
                    </div>
                    <h4 className="text-sm font-bold text-primer-fg-default">
                      Аға шешіміңізді тексеруде...
                    </h4>
                    <p className="text-xs text-primer-fg-muted">
                      Математикалық логика мен әрбір қадамды AI Silent Grader арқылы талдау
                    </p>
                  </div>
                ) : isSubmitted && silentGraderResult ? (
                  <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 space-y-3 shadow-primer-xs">
                    <div className="flex items-center justify-between border-b border-primer-border-muted pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🦉</span>
                        <h4 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider">
                          Ағаның бағалау вердикті (Silent Grader)
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            silentGraderResult.verdict === 'FULL_CREDIT'
                              ? 'success'
                              : silentGraderResult.verdict === 'PARTIAL_CREDIT'
                              ? 'accent'
                              : silentGraderResult.verdict === 'CHEAT_PENALTY'
                              ? 'danger'
                              : 'attention'
                          }
                          className="text-xs font-mono font-bold"
                        >
                          {silentGraderResult.verdict} ({silentGraderResult.score_xp >= 0 ? `+${silentGraderResult.score_xp}` : silentGraderResult.score_xp} XP)
                        </Badge>
                      </div>
                    </div>

                    {/* Student Pedagogical Feedback with KaTeX */}
                    <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted space-y-1.5 text-xs">
                      <div className="font-bold text-primer-accent-fg flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Оқушыға пікір (Педагогикалық түсіндірме):</span>
                      </div>
                      <div className="text-primer-fg-default leading-relaxed">
                        <MathText text={silentGraderResult.feedback_for_student || ''} />
                      </div>
                    </div>

                    {/* Technical Rationale */}
                    {silentGraderResult.technical_rationale && (
                      <div className="p-2.5 rounded-lg bg-primer-canvas-inset/60 border border-primer-border-muted text-[11px] text-primer-fg-muted space-y-1">
                        <span className="font-semibold text-primer-fg-default">Талдау негіздемесі: </span>
                        <span>{silentGraderResult.technical_rationale}</span>
                      </div>
                    )}

                    {/* Next Question Button */}
                    <div className="flex items-center justify-end pt-2">
                      <button
                        onClick={handleNextQuestion}
                        className="px-5 py-2 rounded-xl bg-primer-accent-emphasis text-white font-bold text-xs hover:bg-primer-accent-emphasis/90 transition shadow-primer-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Келесі есепке өту</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {silentGradingError && (
                      <div className="p-3 rounded-lg bg-primer-danger-subtle border border-primer-danger-emphasis/30 text-xs text-primer-danger-fg flex items-center justify-between">
                        <span>{silentGradingError}</span>
                        <button
                          onClick={handleSubmitOpenSolution}
                          className="font-bold underline cursor-pointer"
                        >
                          Қайталау
                        </button>
                      </div>
                    )}

                    {/* Textarea for written steps */}
                    <div>
                      <label className="text-xs font-semibold text-primer-fg-muted mb-1 block">
                        Шешу жолын жазыңыз (формулалар, дәлелдеме):
                      </label>
                      <textarea
                        value={openSolutionText}
                        onChange={(e) => setOpenSolutionText(e.target.value)}
                        placeholder="Мысалы: (x-2)(x-3) <= 0 түбірлерін тауып, сан түзуінде интервалдар әдісімен таңбаларды анықтадым..."
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
                            onClick={() => setIsPhotoModalOpen(true)}
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
                        {lang === 'KZ'
                          ? 'ИИ-бағалау: толық дәлелдемеге +15 XP, қысқа шешімге +7 XP'
                          : 'ИИ-оценка: полное решение +15 XP, краткое +7 XP'}
                      </span>

                      <button
                        onClick={handleSubmitOpenSolution}
                        disabled={!openSolutionText.trim() && uploadedPhotos.length === 0}
                        className="px-5 py-2 rounded-xl bg-primer-accent-emphasis text-white font-bold text-xs hover:bg-primer-accent-emphasis/90 transition shadow-primer-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'KZ' ? 'Шешімді тексеруге жіберу' : 'Отправить решение'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Vision OCR Paid API Budget Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-primer-border-default bg-primer-canvas-overlay max-w-md w-full p-5 space-y-4 shadow-primer-xl text-primer-fg-default">
            <div className="flex items-center justify-between pb-3 border-b border-primer-border-default">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">
                  {lang === 'KZ' ? 'Қолжазба фотосын тану (Vision OCR)' : 'Распознавание рукописного текста (Vision OCR)'}
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-primer-canvas-subtle text-primer-fg-muted hover:text-primer-fg-default cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-primer-fg-muted leading-relaxed">
              {lang === 'KZ'
                ? 'Бұл функцияны іске асыру үшін бізге Vision OCR API кілтіне қаражат қажет. Сондықтан дәлелдемеңіз бен есептің шешу қадамдарын жоғарыдағы өріске мәтін түрінде қолмен жазыңыз.'
                : 'Для реализации распознавания рукописного текста по фото требуется дополнительный бюджет/API ключ для Vision OCR. Пожалуйста, введите текстовое решение вручную в поле выше.'}
            </p>

            <div className="flex justify-end pt-2 border-t border-primer-border-default">
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-primer-accent-emphasis text-white text-xs font-bold shadow-xs hover:bg-primer-accent-emphasis/90 transition cursor-pointer"
              >
                {lang === 'KZ' ? 'Түсінікті' : 'Понятно'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTrainerScreen;
