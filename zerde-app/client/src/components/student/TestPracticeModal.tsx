import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Check,
  Zap,
  RefreshCw,
  Clock,
  Flame,
  Award,
  Maximize2,
  Eye,
  Camera,
  UploadCloud,
  Send,
  Sliders,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { MathText } from '@/components/ui/MathText';
import { ZvdslRenderer } from '@/components/zvdsl/ZvdslRenderer';
import { ActiveCanvasInspector } from '@/components/canvas/ActiveCanvasInspector';
import { ThoughtForkTriad } from '@/features/socratic-tutor/ThoughtForkTriad';
import { ThoughtFork, getRankByElo } from '@zerde/shared';
import api from '@/api/client';

export interface QuizOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | string;
  text: string;
  latex?: string;
  zvdslSchema?: any;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  subject?: string;
  topicTitle?: string;
  questionText: string;
  questionLatex?: string;
  segments?: Array<{
    type: 'text' | 'latex' | 'zvdsl';
    content: any;
  }>;
  mode?: 'TYPE_A_CHOICE' | 'TYPE_B_OPEN';
  options: QuizOption[];
  socraticHint?: {
    mentorQuestion: string;
    guidingStep: string;
    thought_forks?: ThoughtFork[];
    zvdslSchema?: any;
  };
  explanation?: string;
}

interface TestPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
  subjectName?: string;
}

export const TestPracticeModal: React.FC<TestPracticeModalProps> = ({
  isOpen,
  onClose,
  topicTitle = 'Квадраттық теңсіздіктер',
  subjectName = 'Математика',
}) => {
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const isRU = language === 'RU';
  const isEN = language === 'EN';
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [openAnswerText, setOpenAnswerText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSocraticMentor, setShowSocraticMentor] = useState(false);
  const [score, setScore] = useState(0);

  // Live Stopwatch / Elapsed Time
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [eloDeltaAnim, setEloDeltaAnim] = useState<number | null>(null);

  // Inspected schema modal (for [👁️] enlarge preview)
  const [inspectSchema, setInspectSchema] = useState<any | null>(null);
  const [inspectTitle, setInspectTitle] = useState<string>('');

  // Scroll-cue container ref for options
  const optionsScrollRef = useRef<HTMLDivElement>(null);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch real questions from SQLite question_bank
  useEffect(() => {
    if (!isOpen) return;

    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<QuizQuestion[]>('/questions');
        if (Array.isArray(res) && res.length > 0) {
          setQuestions(res);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.warn('Failed to load questions from SQLite', err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
    setQuestionIndex(0);
    setSelectedOption(null);
    setOpenAnswerText('');
    setUploadedPhotos([]);
    setIsSubmitted(false);
    setShowSocraticMentor(false);
    setScore(0);
  }, [isOpen, topicTitle]);

  // Scroll-Cue Animation: smoothly scroll down slightly and back up to indicate extra options
  useEffect(() => {
    if (optionsScrollRef.current) {
      const el = optionsScrollRef.current;
      setTimeout(() => {
        el.scrollTo({ top: 40, behavior: 'smooth' });
        setTimeout(() => {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
      }, 300);
    }
  }, [questionIndex]);

  const currentQ = questions[questionIndex % Math.max(1, questions.length)];

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCheckAnswer = async () => {
    if (!currentQ) return;
    const isChoiceMode = currentQ.mode !== 'TYPE_B_OPEN';
    if (isChoiceMode && !selectedOption) return;
    if (!isChoiceMode && !openAnswerText.trim() && uploadedPhotos.length === 0) return;

    setIsSubmitted(true);

    let isCorrect = false;
    if (isChoiceMode) {
      const chosen = currentQ.options?.find((o) => o.id === selectedOption);
      isCorrect = Boolean(chosen?.isCorrect);
    } else {
      isCorrect = openAnswerText.includes('-3') || openAnswerText.includes('4') || openAnswerText.length > 5;
    }

    try {
      const res: any = await api.post('/student/submit-task', {
        studentId: user?.id || 1,
        taskId: currentQ.id,
        answer: isChoiceMode ? selectedOption : openAnswerText,
        hintsUsed: showSocraticMentor ? 1 : 0,
        timeSpentSeconds: secondsElapsed,
      });

      if (isCorrect) {
        setScore((prev) => prev + 1);
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
        const delta = res?.data?.eloDelta || 10;
        setEloDeltaAnim(delta);
        if (user && res?.data?.newRating) {
          updateUser({ elo: res.data.newRating });
        }
        showToast({
          type: 'success',
          title: lang === 'KZ' ? 'Дұрыс жауап! 🎉' : lang === 'RU' ? 'Правильный ответ! 🎉' : 'Correct Answer! 🎉',
          message: `+${delta} ELO (Базаға сақталды)`,
        });
      } else {
        setShowSocraticMentor(true);
        showToast({
          type: 'attention',
          title: lang === 'KZ' ? 'Қате жауап' : lang === 'RU' ? 'Неверно' : 'Incorrect',
          message:
            lang === 'KZ'
              ? 'Сократ наставнигі қатені талдауға қосылды!'
              : lang === 'RU'
              ? 'Наставник «Аға» подключился для разбора вашей ошибки!'
              : 'Mentor "Aga" joined to help analyze your mistake!',
        });
      }
    } catch (e) {
      console.warn('Failed to record telemetry', e);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setOpenAnswerText('');
      setUploadedPhotos([]);
      setIsSubmitted(false);
      setShowSocraticMentor(false);
      setEloDeltaAnim(null);
    } else {
      onClose();
      showToast({
        type: 'success',
        title: lang === 'KZ' ? 'Тест аяқталды!' : lang === 'RU' ? 'Тест завершен!' : 'Test Completed!',
        message: `${score + (isSubmitted ? 1 : 0)}/${questions.length} ${lang === 'KZ' ? 'дұрыс' : lang === 'RU' ? 'правильно' : 'correct'}`,
      });
    }
  };

  const handleForkSelect = (fork: ThoughtFork) => {
    showToast({
      type: 'info',
      title: lang === 'KZ' ? `${fork.key} бағыты таңдалды` : lang === 'RU' ? `Выбрано направление ${fork.key}` : `Selected ${fork.key}`,
      message: fork.title,
    });
  };

  const studentName = user?.full_name || (lang === 'KZ' ? 'Оқушы' : lang === 'RU' ? 'Ученик' : 'Student');
  const currentElo = user?.elo ?? user?.overallElo ?? 1000;
  const streakDays = user?.streakDays || 0;
  const rankInfo = getRankByElo(currentElo);
  const rankSymbol = rankInfo.symbol;
  const rankLabel = lang === 'RU' ? rankInfo.nameRU : lang === 'EN' ? rankInfo.nameEN : rankInfo.nameKZ;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay rounded-2xl">
        
        {/* ========================================================================= */}
        {/* 1. БЛОК 1: ВЕРХНЯЯ ИНФОРМАЦИОННАЯ ШТОРКА (STUDENT LIVE STATUS RIBBON)      */}
        {/* ========================================================================= */}
        <div className="pl-4 pr-12 py-2.5 bg-primer-canvas-subtle border-b border-primer-border-default flex items-center justify-between gap-2 text-xs">
          {/* Student Profile Info */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{rankSymbol}</span>
            <div className="truncate">
              <span className="font-bold text-primer-fg-default mr-1.5">{studentName}</span>
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                {rankLabel}
              </Badge>
            </div>
          </div>

          {/* Live Dynamic Indicators: ELO, Streak, Timer, Question Count */}
          <div className="flex items-center gap-2 shrink-0 font-mono">
            {/* Live ELO Badge with Animation */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primer-canvas-inset border border-primer-border-default text-primer-accent-fg font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{currentElo} ELO</span>
              {eloDeltaAnim && (
                <span className="text-emerald-500 text-[10px] animate-bounce">
                  +{eloDeltaAnim}
                </span>
              )}
            </div>

            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-primer-canvas-inset border border-primer-border-default text-primer-danger-fg font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>{streakDays}d</span>
            </div>

            {/* Elapsed Timer */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primer-canvas-inset border border-primer-border-default text-primer-fg-muted font-bold">
              <Clock className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            {/* Progress Count */}
            <Badge variant="accent" className="font-mono text-xs px-2">
              {questionIndex + 1}/{Math.max(1, questions.length)}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primer-accent-fg" />
            <span>Сұрақтар жүктелуде...</span>
          </div>
        ) : !currentQ ? (
          <div className="p-12 text-center text-xs text-primer-fg-muted">
            Сұрақтар табылмады
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* ========================================================================= */}
            {/* 2. БЛОК 2: БОГАТЫЙ БЛОК ВОПРОСА (ZVDSL+ FULL POWER)                        */}
            {/* ========================================================================= */}
            <div className="relative p-4 rounded-xl bg-primer-canvas-inset border border-primer-border-default space-y-3 shadow-primer-xs group">
              {/* Question Header Tag & Fullscreen Inspect Button in corner */}
              <div className="flex items-center justify-between pb-1 border-b border-primer-border-muted/60">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" className="text-[10px] font-mono uppercase">
                    {subjectName} • {currentQ.mode === 'TYPE_B_OPEN' ? (isRU ? 'Режим Б (Тетрадь)' : 'Режим Б (Ашық жауап)') : (isRU ? 'Режим А (Выбор)' : 'Режим А (Нұсқалар)')}
                  </Badge>
                  <span className="text-[11px] font-bold text-primer-fg-muted">{topicTitle}</span>
                </div>

                {/* Inspect Button in the corner */}
                <Button
                  onClick={() => {
                    setInspectSchema(currentQ.socraticHint?.zvdslSchema || null);
                    setInspectTitle(currentQ.questionText);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px] gap-1 font-bold text-primer-accent-fg hover:bg-primer-accent-subtle/30"
                  title="Сұрақты толық экранда көру"
                >
                  <Eye className="w-3 h-3" />
                  <span>{isRU ? 'Развернуть' : isEN ? 'Enlarge' : 'Толық қарау'}</span>
                </Button>
              </div>

              {/* Multi-segment Rich Question Content (Text + LaTeX + ZVDSL+ Scheme) */}
              <div className="space-y-2.5">
                <p className="text-xs sm:text-sm font-semibold text-primer-fg-default leading-relaxed">
                  {currentQ.questionText}
                </p>

                {currentQ.questionLatex && (
                  <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-muted text-sm sm:text-base font-bold text-primer-accent-fg text-center">
                    <MathText text={`$${currentQ.questionLatex}$`} />
                  </div>
                )}

                {/* Inline ZVDSL+ Visual Schema */}
                {currentQ.socraticHint?.zvdslSchema && (
                  <div className="pt-1">
                    <ZvdslRenderer
                      schema={currentQ.socraticHint.zvdslSchema}
                      isThumbnail={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. БЛОК 3: БЛОК ОТВЕТОВ (РЕЖИМ А: ДО 8 ВАРИАНТОВ / РЕЖИМ Б: ТЕТРАДЬ)      */}
            {/* ========================================================================= */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
                  {currentQ.mode === 'TYPE_B_OPEN'
                    ? (isRU ? 'Жауапты немесе дәптер шешімін жазыңыз:' : 'Жауабыңызды немесе дәптер фотосын енгізіңіз:')
                    : (isRU ? 'Варианты ответов (до 8 опций):' : 'Жауап нұсқалары (8-ге дейін):')}
                </label>

                {currentQ.mode !== 'TYPE_B_OPEN' && currentQ.options?.length > 2 && (
                  <span className="text-[10px] text-primer-fg-subtle font-mono">
                    ↕️ {isRU ? 'Скролл арқылы барлық 8 нұсқа қолжетімді' : 'Scroll down for more'}
                  </span>
                )}
              </div>

              {/* MODE A: UP TO 8 CHOICE OPTIONS WITH 2-IN-ROW & SCROLL-CUE */}
              {currentQ.mode !== 'TYPE_B_OPEN' ? (
                <div
                  ref={optionsScrollRef}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 border border-primer-border-muted/50 rounded-xl bg-primer-canvas-subtle/30"
                >
                  {currentQ.options?.map((option) => {
                    const isSelected = selectedOption === option.id;
                    let borderClass = 'border-primer-border-default bg-primer-canvas-subtle hover:border-primer-accent-emphasis';

                    if (isSubmitted) {
                      if (option.isCorrect) {
                        borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                      } else if (isSelected && !option.isCorrect) {
                        borderClass = 'border-primer-danger-emphasis bg-primer-danger-subtle text-primer-danger-fg';
                      }
                    } else if (isSelected) {
                      borderClass = 'border-primer-accent-emphasis bg-primer-accent-subtle/30 text-primer-accent-fg font-semibold';
                    }

                    return (
                      <div
                        key={option.id}
                        onClick={() => !isSubmitted && setSelectedOption(option.id)}
                        className={`p-3 rounded-lg border text-left text-xs transition flex items-center justify-between gap-2 cursor-pointer shadow-xs ${borderClass} ${
                          isSubmitted ? 'cursor-default' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-xs bg-primer-canvas-inset border border-primer-border-muted shrink-0">
                            {option.id}
                          </span>
                          <div className="truncate">
                            {option.latex ? (
                              <MathText text={`$${option.latex}$`} />
                            ) : (
                              <span>{option.text}</span>
                            )}
                          </div>
                        </div>

                        {/* Expand Button for this option's ZVDSL+ schema if available */}
                        {option.zvdslSchema && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectSchema(option.zvdslSchema);
                              setInspectTitle(`${option.id} нұсқасының ZVDSL+ схемасы`);
                            }}
                            className="p-1 rounded hover:bg-primer-accent-subtle text-primer-accent-fg"
                            title="Схеманы үлкейту"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isSubmitted && option.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !option.isCorrect && (
                          <XCircle className="w-4 h-4 text-primer-danger-fg shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* MODE B: OPEN NOTEBOOK / TEXT AREA WITH PHOTO ATTACHMENT */
                <div className="space-y-3 p-3.5 rounded-xl border border-primer-border-default bg-primer-canvas-subtle">
                  <textarea
                    value={openAnswerText}
                    onChange={(e) => setOpenAnswerText(e.target.value)}
                    placeholder={isRU ? 'Шешімнің қадамдарын немесе толық дәлелдеуді жазыңыз (4000 таңбаға дейін)...' : 'Шешу жолын жазыңыз...'}
                    maxLength={4000}
                    rows={4}
                    disabled={isSubmitted}
                    className="w-full text-xs p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-default focus:ring-1 focus:ring-primer-accent-emphasis focus:outline-none"
                  />

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primer-canvas-inset border border-primer-border-default hover:bg-primer-accent-subtle/30 font-semibold text-primer-fg-default">
                      <Camera className="w-3.5 h-3.5 text-primer-accent-fg" />
                      <span>{isRU ? 'Фото тетради (+15 ELO)' : 'Дәптер фотосын қосу (+15 ELO)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            setUploadedPhotos((prev) => [...prev, 'photo_attached.jpg']);
                            showToast({ type: 'success', title: 'Фото қосылды', message: 'Тексеруге дайын' });
                          }
                        }}
                      />
                    </label>

                    <span className="text-[11px] text-primer-fg-muted font-mono">
                      {openAnswerText.length}/4000
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 4. СОКРАТИЧЕСКИЙ НАСТАВНИК «АҒА» (PROBLEM-DRIVEN ADAPTIVE TUTOR)          */}
            {/* ========================================================================= */}
            {currentQ.socraticHint && (
              <div className="pt-2 border-t border-primer-border-muted">
                {!showSocraticMentor ? (
                  <Button
                    onClick={() => setShowSocraticMentor(true)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5 border-dashed text-primer-accent-fg hover:bg-primer-accent-subtle/20 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'KZ'
                        ? 'Сократ наставнигінің көмегі (ZVDSL+ сызбасымен)'
                        : lang === 'RU'
                        ? 'Подсказка Сократа (Схема ZVDSL+)'
                        : 'Socratic Mentor Guidance (ZVDSL+)'}
                    </span>
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-primer-canvas-inset border border-primer-accent-emphasis/40 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primer-accent-emphasis text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-primer-fg-default flex items-center gap-1.5">
                          <span>🦉 Сократ «Аға»</span>
                          <Badge variant="accent" className="text-[9px] py-0 font-mono">Adaptive</Badge>
                        </div>
                        <p className="text-xs font-semibold text-primer-accent-fg">
                          {currentQ.socraticHint.mentorQuestion}
                        </p>
                        <p className="text-[11px] text-primer-fg-muted leading-relaxed">
                          {currentQ.socraticHint.guidingStep}
                        </p>
                      </div>
                    </div>

                    {/* Socratic Thought Forks Triad A, B, C */}
                    <ThoughtForkTriad
                      forks={currentQ.socraticHint.thought_forks || [
                        { key: 'A', title: lang === 'RU' ? 'Определить область допустимых значений (ОДЗ)' : 'Анықталу облысын (ОДЗ) тексеру', type: 'true_step', description: lang === 'RU' ? 'Бөлім нөлге тең болмауы тиіс' : 'Бөлім 0-ге тең болмауы тиіс' },
                        { key: 'B', title: lang === 'RU' ? 'Сразу умножить на знаменатель (Ловушка)' : 'Бөліміне бірден көбейту (Тұзақ)', type: 'cognitive_trap', description: lang === 'RU' ? 'Айнымалының таңбасы белгісіз' : 'Таңба белгісіз кезде көбейтуге болмайды' },
                        { key: 'C', title: lang === 'RU' ? 'Вспомнить фундаментальное правило интервалов' : 'Интервалдар әдісінің негізгі ережесі', type: 'basic_rule', description: lang === 'RU' ? 'Сан түзуінде таңбаларды қою' : 'Сан түзуіндегі таңбалар ауысуы' },
                      ]}
                      onSelectFork={handleForkSelect}
                      disabled={false}
                      language={lang.toLowerCase() as 'kz' | 'ru' | 'en'}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. ACTION BAR: ТЕКСЕРУ / КЕЛЕСІ СҰРАҚ                                      */}
            {/* ========================================================================= */}
            <div className="flex items-center justify-between pt-3 border-t border-primer-border-default">
              <Button onClick={onClose} variant="ghost" size="sm" className="text-xs">
                {lang === 'KZ' ? 'Шығу' : lang === 'RU' ? 'Выйти' : 'Close'}
              </Button>

              {!isSubmitted ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={currentQ.mode !== 'TYPE_B_OPEN' ? !selectedOption : !openAnswerText.trim() && uploadedPhotos.length === 0}
                  size="default"
                  className="text-xs font-bold gap-1.5 px-5 shadow-primer-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'KZ' ? 'Жауапты тексеру' : lang === 'RU' ? 'Проверить ответ' : 'Check Answer'}</span>
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  size="default"
                  className="text-xs font-bold gap-1.5 px-5 shadow-primer-xs cursor-pointer"
                >
                  <span>
                    {questionIndex < questions.length - 1
                      ? lang === 'KZ'
                        ? 'Келесі сұраққа өту'
                        : lang === 'RU'
                        ? 'Следующий вопрос'
                        : 'Next Question'
                      : lang === 'KZ'
                      ? 'Тестті аяқтау'
                      : lang === 'RU'
                      ? 'Завершить тест'
                      : 'Finish Test'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* ========================================================================= */}
      {/* 6. FULLSCREEN / ENLARGED ZVDSL+ INSPECTOR MODAL (FOR [👁️] BUTTONS)          */}
      {/* ========================================================================= */}
      {inspectSchema && (
        <Dialog open={!!inspectSchema} onOpenChange={(open) => !open && setInspectSchema(null)}>
          <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 flex flex-col bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay rounded-2xl">
            <DialogHeader className="px-5 py-3.5 border-b border-primer-border-default bg-primer-canvas-subtle flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-primer-fg-default">
                  ZVDSL+ Интерактивті микро-сызбасы
                </DialogTitle>
                <p className="text-xs text-primer-fg-muted">{inspectTitle || topicTitle}</p>
              </div>
              <Badge variant="accent" className="font-mono text-[10px]">
                ZVDSL+ Native Vector
              </Badge>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-primer-canvas-default">
              <div className="w-full max-w-3xl p-6 rounded-xl bg-primer-canvas-inset border border-primer-border-default shadow-sm flex items-center justify-center">
                <ZvdslRenderer
                  schema={inspectSchema}
                  isThumbnail={false}
                  width={720}
                  height={340}
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-primer-border-default bg-primer-canvas-subtle flex items-center justify-between text-xs text-primer-fg-muted">
              <span>Тінтуірмен жылжыту және қарау қолжетімді</span>
              <Button variant="secondary" size="sm" onClick={() => setInspectSchema(null)}>
                Жабу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default TestPracticeModal;
