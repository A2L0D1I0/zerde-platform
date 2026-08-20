import React, { useState } from 'react';
import { SM2MemoryCard } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MathText } from '@/components/ui/MathText';
import { Brain, Sparkles, ArrowRight, RotateCw, CheckCircle2, ThumbsUp, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/context/LanguageContext';

interface SM2ReviewQueueCardProps {
  cards: SM2MemoryCard[];
  onReviewCard?: (card: SM2MemoryCard) => void;
}

export const SM2ReviewQueueCard: React.FC<SM2ReviewQueueCardProps> = ({
  cards,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [selectedCard, setSelectedCard] = useState<SM2MemoryCard | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const [activeCards, setActiveCards] = useState<SM2MemoryCard[]>(cards);

  const dueCards = activeCards.filter((c) => c.isDueToday);

  const handleStartCard = (card: SM2MemoryCard) => {
    setSelectedCard(card);
    setIsAnswerRevealed(false);
  };

  const handleAnswerRating = (grade: 'easy' | 'good' | 'hard') => {
    if (!selectedCard) return;

    let bonusElo = grade === 'easy' ? 5 : grade === 'good' ? 3 : 1;
    showToast({
      type: 'success',
      title: 'Карточка бекітілді! 🎉',
      message: `SM-2 алгоритмі бойынша келесі қайталау мерзімі жаңартылды. (+${bonusElo} ELO)`,
    });

    // Remove from due today list
    setActiveCards((prev) =>
      prev.map((c) => (c.id === selectedCard.id ? { ...c, isDueToday: false } : c))
    );
    setSelectedCard(null);
  };

  return (
    <>
      <div className="rounded-xl border-l-4 border-l-primer-accent-emphasis border-y border-r border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs space-y-3">
        {/* GitHub Primer Callout Header */}
        <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/40">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                  {t('student.spaced_repetition_title')}
                </h4>
                <Badge variant="accent" className="text-[10px] py-0 font-mono">
                  {dueCards.length} {t('student.formulas_unit')}
                </Badge>
              </div>
              <p className="text-[10px] text-primer-fg-muted">
                {t('student.spaced_repetition_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Due Cards List */}
        <div className="space-y-2">
          {dueCards.length === 0 ? (
            <div className="py-4 text-center text-xs text-primer-success-fg font-medium bg-primer-success-subtle/20 rounded-lg border border-primer-success-muted/30">
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-primer-success-fg" />
              {t('student.sm2_all_completed')}
            </div>
          ) : (
            dueCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleStartCard(card)}
                className="p-2.5 rounded-lg border border-primer-border-muted bg-primer-canvas-inset hover:border-primer-accent-emphasis/60 transition cursor-pointer flex items-center justify-between gap-2 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-[9px] py-0 font-mono">
                      {card.subject}
                    </Badge>
                    <span className="text-xs font-bold text-primer-fg-default group-hover:text-primer-accent-fg transition truncate">
                      {card.topicTitle}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-primer-accent-fg truncate">
                    <MathText>{card.formulaLatex}</MathText>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="secondary"
                  className="shrink-0 gap-1 text-[11px] font-semibold group-hover:bg-primer-accent-emphasis group-hover:text-white transition"
                >
                  <span>{t('student.review_card_btn')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}

        </div>
      </div>

      {/* SM-2 Interactive Flip Modal */}
      {selectedCard && (
        <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-md bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay p-4 sm:p-5">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge variant="accent" className="text-xs font-mono">
                  {selectedCard.subject} • SM-2
                </Badge>
                <span className="text-xs text-primer-fg-muted font-mono">
                  Қайталау интервалы: {selectedCard.intervalDays} күн
                </span>
              </div>
              <DialogTitle className="text-sm sm:text-base font-bold mt-2">
                {selectedCard.topicTitle}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Интервалды қайталау карточкасы
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Formula & Question Box */}
              <div className="bg-primer-canvas-inset border border-primer-border-muted rounded-xl p-4 text-center space-y-2">
                <div className="text-lg sm:text-xl font-mono text-primer-accent-fg py-2 font-bold">
                  <MathText>{selectedCard.formulaLatex}</MathText>
                </div>
                <p className="text-xs text-primer-fg-default font-medium">
                  {selectedCard.question}
                </p>
              </div>

              {/* Answer Box (Revealed on click) */}
              {!isAnswerRevealed ? (
                <Button
                  onClick={() => setIsAnswerRevealed(true)}
                  variant="primary"
                  className="w-full gap-2 font-bold"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Жауапты тексеру</span>
                </Button>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 rounded-lg bg-primer-success-subtle/30 border border-primer-success-muted/50 text-xs text-primer-fg-default leading-relaxed">
                    <div className="font-bold text-primer-success-fg mb-1">
                      Дұрыс тұжырым мен ереже:
                    </div>
                    {selectedCard.answer}
                  </div>

                  <div className="text-[11px] font-semibold text-primer-fg-muted text-center">
                    Өз жауабыңызды бағалаңыз (SM-2 бағалауы):
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleAnswerRating('hard')}
                      variant="outline"
                      size="sm"
                      className="text-primer-danger-fg hover:bg-primer-danger-subtle text-xs"
                    >
                      Қиын (1 күн)
                    </Button>
                    <Button
                      onClick={() => handleAnswerRating('good')}
                      variant="secondary"
                      size="sm"
                      className="text-primer-attention-fg text-xs"
                    >
                      Жақсы (3 күн)
                    </Button>
                    <Button
                      onClick={() => handleAnswerRating('easy')}
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold"
                    >
                      Оңай (7 күн)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
