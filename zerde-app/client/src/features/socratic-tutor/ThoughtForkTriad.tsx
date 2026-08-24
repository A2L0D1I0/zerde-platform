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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {forks.map((fork) => {
          const isA = fork.key === 'A' || fork.type === 'true_step';
          const isB = fork.key === 'B' || fork.type === 'cognitive_trap';

          return (
            <button
              key={fork.key}
              onClick={() => !disabled && onSelectFork(fork)}
              disabled={disabled}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between group cursor-pointer ${
                isA
                  ? 'bg-primer-canvas-subtle border-primer-accent-emphasis/40 hover:border-primer-accent-emphasis hover:bg-primer-accent-subtle/20'
                  : isB
                  ? 'bg-primer-canvas-subtle border-primer-attention-emphasis/40 hover:border-primer-attention-emphasis hover:bg-primer-attention-subtle/20'
                  : 'bg-primer-canvas-subtle border-primer-border-default hover:border-primer-fg-muted hover:bg-primer-canvas-inset'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold font-mono ${
                    isA
                      ? 'bg-primer-accent-emphasis text-white'
                      : isB
                      ? 'bg-primer-attention-emphasis text-white'
                      : 'bg-primer-canvas-inset text-primer-fg-muted border border-primer-border-default'
                  }`}>
                    {fork.key}
                  </span>

                  <span className="text-[10px] font-semibold text-primer-fg-muted uppercase flex items-center gap-1">
                    {isA && <CheckCircle2 className="w-3 h-3 text-primer-accent-fg" />}
                    {isB && <AlertTriangle className="w-3 h-3 text-primer-attention-fg" />}
                    {!isA && !isB && <BookOpen className="w-3 h-3 text-primer-fg-muted" />}
                    {getBadgeLabel(fork.type, isA, isB)}
                  </span>
                </div>

                <h5 className="text-xs font-semibold text-primer-fg-default group-hover:text-primer-accent-fg transition-colors">
                  {fork.title}
                </h5>

                {fork.latex && (
                  <div className="my-1.5 py-1 px-2 rounded bg-primer-canvas-inset border border-primer-border-muted text-xs font-mono">
                    <MathText text={`$${fork.latex}$`} />
                  </div>
                )}

                <p className="text-[11px] text-primer-fg-muted leading-snug mt-1">
                  {fork.description}
                </p>
              </div>

              <div className="mt-2.5 pt-1.5 border-t border-primer-border-muted/50 flex items-center justify-end text-[11px] text-primer-accent-fg font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>{selectLabel}</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
