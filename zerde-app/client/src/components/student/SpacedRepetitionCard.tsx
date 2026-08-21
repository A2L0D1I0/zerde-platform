import React from 'react';
import { SpacedRepetitionItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';

interface SpacedRepetitionCardProps {
  item: SpacedRepetitionItem;
  onReview: () => void;
}

export const SpacedRepetitionCard: React.FC<SpacedRepetitionCardProps> = ({
  item,
  onReview,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border-l-4 border-l-primer-accent-emphasis border-y border-r border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-md bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/40 shrink-0 mt-0.5">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-primer-accent-fg">
                {t('student.spaced_repetition')}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-primer-canvas-inset border border-primer-border-default text-primer-fg-muted">
                {item.cardsCount} {t('student.due_cards')}
              </span>
            </div>
            <p className="text-[11px] text-primer-fg-muted leading-relaxed mt-1">
              {item.description}
            </p>
          </div>
        </div>

        <Button
          onClick={onReview}
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1 font-semibold text-xs"
        >
          <span>{t('student.start_review')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default SpacedRepetitionCard;
