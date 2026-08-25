import React from 'react';
import { ThoughtFork } from '@zerde/shared';
import { MathText } from '@/components/ui/MathText';
import { ArrowRight, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

interface ThoughtForkTriadProps {
  forks: ThoughtFork[];
  onSelectFork: (fork: ThoughtFork) => void;
  disabled?: boolean;
  language?: 'kz' | 'ru' | 'en';
}

export const ThoughtForkTriad: React.FC<ThoughtForkTriadProps> = ({
  forks,
  onSelectFork,
  disabled = false,
  language = 'kz',
}) => {
  const isRU = language === 'ru';
  const isEN = language === 'en';

  const headerTitle = isRU
    ? 'Развилки мысли (Thought-Forks):'
    : isEN
    ? 'Thought Forks:'
    : 'Ой тармақтары (Thought-Forks):';

  const selectLabel = isRU ? 'Выбрать' : isEN ? 'Select' : 'Таңдау';

  const getBadgeLabel = (type: string, isA: boolean, isB: boolean) => {
    if (isA) return isRU ? 'Верный шаг' : isEN ? 'True step' : 'Дұрыс қадам';
    if (isB) return isRU ? 'Ловушка' : isEN ? 'Trap' : 'Тұзақ';
    return isRU ? 'Правило' : isEN ? 'Rule' : 'Ереже';
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-bold text-primer-fg-muted uppercase tracking-wider flex items-center gap-1.5">
        <span>{headerTitle}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {forks.map((fork) => {
          const isA = fork.key === 'A' || fork.type === 'true_step';
          const isB = fork.key === 'B' || fork.type === 'cognitive_trap';

          return (
            <button
              key={fork.key}
              onClick={() => !disabled && onSelectFork(fork)}
              disabled={disabled}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-primer-xs active:scale-[0.98] ${
                isA
                  ? 'bg-primer-canvas-subtle border-primer-success-emphasis/40 hover:border-primer-success-emphasis hover:bg-primer-success-subtle/25'
                  : isB
                  ? 'bg-primer-canvas-subtle border-primer-attention-emphasis/40 hover:border-primer-attention-emphasis hover:bg-primer-attention-subtle/25'
                  : 'bg-primer-canvas-subtle border-primer-accent-emphasis/40 hover:border-primer-accent-emphasis hover:bg-primer-accent-subtle/25'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold font-mono shadow-xs ${
                    isA
                      ? 'bg-primer-success-emphasis text-white'
                      : isB
                      ? 'bg-primer-attention-emphasis text-white'
                      : 'bg-primer-accent-emphasis text-white'
                  }`}>
                    {fork.key}
                  </span>

                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded-md ${
                    isA
                      ? 'text-primer-success-fg bg-primer-success-subtle/50'
                      : isB
                      ? 'text-primer-attention-fg bg-primer-attention-subtle/50'
                      : 'text-primer-accent-fg bg-primer-accent-subtle/50'
                  }`}>
                    {isA && <CheckCircle2 className="w-3 h-3" />}
                    {isB && <AlertTriangle className="w-3 h-3" />}
                    {!isA && !isB && <BookOpen className="w-3 h-3" />}
                    {getBadgeLabel(fork.type, isA, isB)}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-primer-fg-default group-hover:text-primer-accent-fg transition-colors">
                  {fork.title}
                </h5>

                {fork.latex && (
                  <div className="my-2 py-1.5 px-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-xs font-mono">
                    <MathText text={`$${fork.latex}$`} />
                  </div>
                )}

                <p className="text-[11px] text-primer-fg-muted leading-relaxed mt-1">
                  {fork.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-primer-border-muted/60 flex items-center justify-end text-[11px] font-bold group-hover:translate-x-0.5 transition-transform text-primer-fg-default group-hover:text-primer-accent-fg">
                <span>{selectLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-primer-accent-fg" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
