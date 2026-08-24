import React, { useState, useEffect, useRef } from 'react';
import { DailySignal } from '@zerde/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MathText } from '@/components/ui/MathText';
import { Maximize2, Play, Pause, RotateCcw, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartboardViewProps {
  signal: DailySignal | null;
  onBack?: () => void;
}

export const SmartboardView: React.FC<SmartboardViewProps> = ({
  signal,
  onBack,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            confetti({ particleCount: 80, spread: 70 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activity = signal?.smart_board_activity;

  return (
    <div className="min-h-screen bg-primer-canvas-default p-4 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-primer-border-default pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm" className="gap-1 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Артқа қайту</span>
            </Button>
          )}
          <div>
            <h2 className="text-lg font-bold text-primer-fg-default flex items-center gap-2">
              <span>Смарт-доска (Проектор режимі)</span>
              <Badge variant="default" className="text-xs bg-primer-attention-emphasis text-white">F11 Ready</Badge>
            </h2>
            <p className="text-xs text-primer-fg-muted">9 «А» сыныбына арналған 5 минуттық интерактивті разминка</p>
          </div>
        </div>

        {/* 5-Min Timer */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold text-xl ${
            timeLeft <= 60 ? 'bg-primer-danger-subtle text-primer-danger-fg border-primer-danger-muted' : 'bg-primer-canvas-inset text-primer-accent-fg border-primer-border-default'
          }`}>
            ⏱️ {formatTime(timeLeft)}
          </div>

          <Button
            onClick={() => setIsRunning((prev) => !prev)}
            size="sm"
            className="gap-1 text-xs"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Кідірту' : 'Бастау'}</span>
          </Button>

          <Button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(300);
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Board Canvas */}
      <div className="max-w-4xl mx-auto rounded-2xl border border-primer-border-default bg-primer-canvas-subtle p-6 sm:p-8 shadow-primer-md space-y-6 text-center">
        <Badge variant="outline" className="text-xs font-semibold py-1 px-3">
          {activity?.title_kz || '5-минуттық разминка'}
        </Badge>

        <div className="text-xl sm:text-2xl font-bold text-primer-fg-default leading-relaxed">
          <MathText text={activity?.exercise_text_kz || 'Теңсіздікті шешіңіз: $\\frac{x - 3}{x + 2} \\le 0$'} />
        </div>

        <div className="p-4 rounded-xl bg-primer-canvas-inset border border-primer-border-muted text-xs text-primer-fg-muted max-w-xl mx-auto">
          💡 <strong>Нұсқау:</strong> Оқушылар өз дәптерлеріне жауапты жазады немесе қол көтеріп жауап береді.
        </div>

        {/* Reveal Solution */}
        <div className="pt-4 border-t border-primer-border-muted">
          {!showSolution ? (
            <Button onClick={() => setShowSolution(true)} size="lg" className="text-sm font-bold gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Дұрыс шешімді көрсету</span>
            </Button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-2 max-w-xl mx-auto animate-in fade-in">
              <div className="font-bold text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Шешім кілті:</span>
              </div>
              <div className="text-xs font-mono font-semibold">
                <MathText text={`$${activity?.solution_key || 'x \\in (-2; 3]'}$`} />
              </div>
              <p className="text-[11px] text-primer-fg-muted">{activity?.explanation_kz || 'Бөлім нөлі $x = -2$ шешімге кірмейді.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
