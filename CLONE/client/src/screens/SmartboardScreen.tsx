import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Brain,
  Sun,
  Moon,
  ChevronRight,
  Plus,
  Users,
  Eye,
  EyeOff,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MathText } from '@/components/ui/MathText';
import { ZvdslRenderer } from '@/components/zvdsl/ZvdslRenderer';
import { DesmosGraphCanvas } from '@/components/canvas/DesmosGraphCanvas';
import { teacherApi, LessonSignalData } from '@/api/teacherApi';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import confetti from 'canvas-confetti';

interface SmartboardScreenProps {
  classroomId?: string | number;
  onBack?: () => void;
}

export const SmartboardScreen: React.FC<SmartboardScreenProps> = ({
  classroomId = '1',
  onBack,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [signalData, setSignalData] = useState<LessonSignalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 5-Minute Timer State (300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Interactive Whiteboard Controls
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState<'zvdsl' | 'desmos'>('zvdsl');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Class Voting / Poll State (A, B, C, D)
  const [selectedVoteOption, setSelectedVoteOption] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({
    A: 16,
    B: 6,
    C: 2,
    D: 0,
  });

  // Fetch Lesson Signal & Problem Statement
  const loadSignal = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teacherApi.getLessonSignal(classroomId);
      setSignalData(data);
    } catch (e) {
      console.error('[Smartboard] Failed to load signal', e);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadSignal();
  }, [loadSignal]);

  // 5-Minute Countdown Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            showToast({
              type: 'attention',
              title: t('smartboard.intervention_done_title'),
              message: t('smartboard.intervention_done_desc'),
            });
            return 0;

          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft, showToast]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut listener for F11
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVote = (optionId: string) => {
    setSelectedVoteOption(optionId);
    setVotes((prev) => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }));
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
    setShowExplanation(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#238636', '#3fb950', '#58a6ff', '#bf8700'],
    });
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`min-h-screen transition-colors p-3 sm:p-6 select-none ${
        highContrastMode
          ? 'bg-white text-black'
          : 'bg-[#090d13] text-[#e6edf3]'
      }`}
    >
      {/* Top Smartboard Control Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primer-border-default/40">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-1 text-xs"
              title="Шығу"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Шығу</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primer-attention-emphasis text-white shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Смарт-доска: 5 минуттық интервенция студиясы
                </h1>
                <Badge variant="attention" className="text-xs font-mono py-0.5">
                  F11 Проектор режимі
                </Badge>
              </div>
              <p className="text-xs text-primer-fg-muted">
                {signalData?.classroom_name || '9 «А»'} сыныбы • Құпиялылық қорғалған (Бағалар жасырылған)
              </p>
            </div>
          </div>
        </div>

        {/* Timer, Contrast & Fullscreen Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* 5-Min Timer Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primer-canvas-inset border border-primer-border-default font-mono">
            <span
              className={`text-xl sm:text-2xl font-black ${
                timeLeft <= 60
                  ? 'text-primer-danger-fg animate-pulse'
                  : timeLeft <= 180
                  ? 'text-primer-attention-fg'
                  : 'text-primer-success-fg'
              }`}
            >
              {formatTime(timeLeft)}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant={isTimerRunning ? 'attention' : 'primary'}
                size="xs"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="h-7 w-7 p-0"
                title={isTimerRunning ? 'Пауза' : 'Бастау'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(300);
                }}
                className="h-7 w-7 p-0"
                title="Қайта қосу"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setTimeLeft((t) => Math.min(900, t + 60))}
                className="h-7 px-1.5 text-[10px] font-bold"
                title="+1 минут қосу"
              >
                +1 мин
              </Button>
            </div>
          </div>

          {/* High Contrast Whiteboard Mode Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setHighContrastMode(!highContrastMode)}
            className="h-8 gap-1.5 text-xs"
            title="Жоғары контраст / Тақта режимі"
          >
            {highContrastMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-primer-attention-fg" />}
            <span className="hidden md:inline">{highContrastMode ? 'Күңгірт' : 'Ашық тақта'}</span>
          </Button>

          {/* Fullscreen F11 Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 gap-1.5 text-xs font-bold"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Шығу (F11)' : 'Толық экран (F11)'}</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        
        {/* Left 7 Cols: Problem Statement & Interactive Canvas */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Class Deficit Focus Banner */}
          <div className="p-4 rounded-xl border-2 border-primer-attention-emphasis/80 bg-primer-attention-subtle/30 space-y-2 shadow-primer-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-primer-attention-fg">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Сыныптың ортақ кластерлік қателігі:</span>
              </div>
              <Badge variant="attention" className="text-xs font-mono font-bold">
                {signalData?.cluster_deficit?.affected_students_count || 8} оқушыда қателік (
                {signalData?.cluster_deficit?.percentage || 33}%)
              </Badge>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-primer-fg-default leading-relaxed">
              {signalData?.cluster_deficit?.misconception_kz ||
                'Бөлшек-рационал теңсіздіктерде бөлімнің нөлін шешімге қосып жіберу (выколотая точка қатесі)'}
            </p>

            <div className="text-[11px] text-primer-fg-muted pt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>
                <strong>ИИ Ұсынысы:</strong> {signalData?.smart_board_activity?.ai_recommendation_kz}
              </span>
            </div>
          </div>

          {/* Exercise Statement */}
          <div className="p-4 rounded-xl bg-primer-canvas-subtle border border-primer-border-default space-y-2">
            <div className="text-xs font-bold text-primer-accent-fg uppercase tracking-wider">
              Тақтада талданатын ортақ тапсырма:
            </div>
            <div className="text-sm sm:text-base font-bold text-primer-fg-default leading-relaxed">
              <MathText>
                {signalData?.smart_board_activity?.exercise_text_kz ||
                  'Бөлшек-рационал теңсіздікті шешіңіз: \\frac{x^2 - 4}{x - 5} \\le 0'}
              </MathText>
            </div>
          </div>

          {/* Interactive Dual Canvas: ZVDSL+ / Desmos */}
          <div className="rounded-xl border border-primer-border-default overflow-hidden bg-primer-canvas-subtle">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-primer-border-muted bg-primer-canvas-inset">
              <div className="flex items-center gap-1 bg-primer-canvas-default p-1 rounded-md border border-primer-border-muted">
                <button
                  onClick={() => setActiveCanvasTab('zvdsl')}
                  className={`px-3 py-1 text-xs font-bold rounded transition cursor-pointer ${
                    activeCanvasTab === 'zvdsl'
                      ? 'bg-primer-accent-emphasis text-white shadow-xs'
                      : 'text-primer-fg-muted hover:text-primer-fg-default'
                  }`}
                >
                  Интерактивті сан түзуі (ZVDSL+)
                </button>
                <button
                  onClick={() => setActiveCanvasTab('desmos')}
                  className={`px-3 py-1 text-xs font-bold rounded transition cursor-pointer ${
                    activeCanvasTab === 'desmos'
                      ? 'bg-primer-accent-emphasis text-white shadow-xs'
                      : 'text-primer-fg-muted hover:text-primer-fg-default'
                  }`}
                >
                  Графиктік талдау (Desmos)
                </button>
              </div>

              <span className="text-[11px] font-mono text-primer-fg-muted hidden sm:inline">
                Интерактивті тақта холсты
              </span>
            </div>

            <div className="p-3 sm:p-4">
              {activeCanvasTab === 'zvdsl' ? (
                <div className="w-full">
                  <ZvdslRenderer
                    schema={signalData?.smart_board_activity?.zvdsl_canvas}
                    className="w-full min-h-[220px]"
                  />
                  <div className="text-[11px] text-primer-fg-muted text-center mt-2">
                    💡 <strong>Мұғалімге ескертпе:</strong> $x = 5$ нүктесі ашық шеңбермен
                    (выколотая) белгіленген, себебі бөлім нөлге тең болмайды!
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <DesmosGraphCanvas
                    desmosState={signalData?.smart_board_activity?.desmos_state}
                    width={640}
                    height={300}
                    showSliders={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Interactive Class Voting & Step-by-Step Explanation */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Class Voting Poll */}
          <div className="p-4 rounded-xl border border-primer-border-default bg-primer-canvas-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primer-accent-fg" />
                <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                  Сыныптың дауыс беруі (Интерактивті опрос)
                </h3>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {totalVotes} дауыс берілді
              </Badge>
            </div>

            <p className="text-xs text-primer-fg-muted">
              Оқушылардан дұрыс жауап аралығын таңдауды сұраңыз (A, B, C, D):
            </p>

            <div className="space-y-2">
              {(
                signalData?.smart_board_activity?.options || [
                  { id: 'A', text: '(-\\infty; -2] \\cup [2; 5)', isCorrect: true, votesCount: 16 },
                  { id: 'B', text: '(-\\infty; -2] \\cup [2; 5]', isCorrect: false, votesCount: 6 },
                  { id: 'C', text: '[-2; 2] \\cup (5; +\\infty)', isCorrect: false, votesCount: 2 },
                  { id: 'D', text: '(-\\infty; 5)', isCorrect: false, votesCount: 0 },
                ]
              ).map((opt) => {
                const optVotes = votes[opt.id] || opt.votesCount || 0;
                const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                const isSelected = selectedVoteOption === opt.id;

                let borderClass = 'border-primer-border-default bg-primer-canvas-inset hover:border-primer-accent-emphasis';
                if (showSolution) {
                  if (opt.isCorrect) {
                    borderClass = 'border-primer-success-emphasis bg-primer-success-subtle/50 text-primer-success-fg ring-1 ring-primer-success-emphasis';
                  } else if (isSelected && !opt.isCorrect) {
                    borderClass = 'border-primer-danger-emphasis bg-primer-danger-subtle/50 text-primer-danger-fg';
                  }
                } else if (isSelected) {
                  borderClass = 'border-primer-accent-emphasis bg-primer-accent-subtle/30 ring-1 ring-primer-accent-emphasis';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleVote(opt.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${borderClass}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="w-5 h-5 rounded-full bg-primer-canvas-default border border-primer-border-default flex items-center justify-center font-mono text-[11px]">
                          {opt.id}
                        </span>
                        <span className="text-sm">
                          <MathText>{opt.text}</MathText>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold">{percent}%</span>
                        <span className="text-primer-fg-subtle">({optVotes} оқушы)</span>
                      </div>
                    </div>

                    {/* Voting Distribution Bar */}
                    <div className="w-full bg-primer-canvas-default h-2 rounded-full overflow-hidden border border-primer-border-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          showSolution && opt.isCorrect
                            ? 'bg-primer-success-emphasis'
                            : 'bg-primer-accent-emphasis'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reveal Answer Button */}
            {!showSolution ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleRevealSolution}
                className="w-full gap-2 font-bold text-sm mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Дұрыс шешімді тақтада ашу</span>
              </Button>
            ) : (
              <div className="p-3 rounded-lg bg-primer-success-subtle/40 border border-primer-success-muted text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-primer-success-fg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Дұрыс жауап: A. $(-\\infty; -2] \\cup [2; 5)$</span>
                </div>
                <p className="text-primer-fg-default leading-relaxed">
                  {signalData?.smart_board_activity?.explanation_kz ||
                    'Алымының нөлдері ($x = \\pm 2$) боялады, ал бөлімінің нөлі ($x = 5$) қатаң ашық жақшамен жазылады!'}
                </p>
              </div>
            )}
          </div>

          {/* Socratic Step-by-Step Resolution Guide */}
          {showExplanation && (
            <div className="p-4 rounded-xl border border-primer-border-default bg-primer-canvas-subtle space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primer-fg-default flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-primer-accent-fg" />
                  <span>Қадамдық талдау алгоритмі:</span>
                </span>
                <Badge variant="done" className="text-[10px]">
                  Меңгерілді
                </Badge>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-xs text-primer-fg-muted pl-1 leading-relaxed">
                <li>
                  <strong className="text-primer-fg-default">1-қадам:</strong> Алым мен бөлім нөлдерін табу: $x^2 - 4 = 0 \\Rightarrow x = \\pm 2$, бөлім $x \\ne 5$.
                </li>
                <li>
                  <strong className="text-primer-fg-default">2-қадам:</strong> Сан түзуіне нүктелерді салу ($x=\\pm 2$ боялған, $x=5$ боялмаған).
                </li>
                <li>
                  <strong className="text-primer-fg-default">3-қадам:</strong> Аралық таңбаларын анықтау: $(-)$, $(+)$, $(-)$, $(+)$.
                </li>
                <li>
                  <strong className="text-primer-fg-default">4-қадам:</strong> Бейқатаң $\\le 0$ шарты бойынша теріс аралықтарды біріктіру.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartboardScreen;
