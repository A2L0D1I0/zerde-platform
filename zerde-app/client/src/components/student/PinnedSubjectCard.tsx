import React from 'react';
import { SubjectFocus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, Zap, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface PinnedSubjectCardProps {
  subject: SubjectFocus;
  onStartFocus: (subject: SubjectFocus) => void;
}

export const PinnedSubjectCard: React.FC<PinnedSubjectCardProps> = ({
  subject,
  onStartFocus,
}) => {
  const { t, getLocalized } = useLanguage();

  const title = getLocalized(subject, 'title', subject.title);
  const focusTopic = getLocalized(subject, 'focusTopic', subject.focusTopic);
  const focusReason = getLocalized(subject, 'focusReason', subject.focusReason);
  const predictedScore = getLocalized(subject, 'predictedScore', subject.predictedScore);

  return (
    <div className="rounded-lg border border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs">
      {/* Header: Pinned Pin + Title */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-primer-border-muted/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/40">
            <Pin className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default truncate">
                {title}
              </h3>
              <Badge variant="accent" className="text-[10px] py-0 font-mono">
                {subject.subjectElo} ELO
              </Badge>
            </div>
            <p className="text-[10px] text-primer-fg-muted mt-0.5">
              {t('student.predicted_grade_label') || 'Predicted Grade:'}{' '}
              <span className="font-semibold text-primer-success-fg">{predictedScore}</span>
            </p>
          </div>
        </div>

        <div className="hidden xs:flex items-center gap-1 text-[11px] font-mono text-primer-fg-muted bg-primer-canvas-inset px-2 py-0.5 rounded border border-primer-border-muted">
          <Clock className="w-3 h-3 text-primer-attention-fg" />
          <span>{subject.durationMinutes} {t('common.minutes') || 'min'}</span>
        </div>
      </div>

      {/* Focus Body */}
      <div className="pt-3 pb-3 space-y-2">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primer-attention-fg shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-primer-fg-default">
              {focusTopic}
            </div>
            <p className="text-[11px] text-primer-fg-muted leading-relaxed mt-0.5">
              {focusReason}
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 border-t border-primer-border-muted/50 flex items-center justify-between gap-2">
        <span className="text-[10px] text-primer-fg-subtle flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-primer-success-fg" />
          <span>{t('student.eureka_reward_tag') || '+15 ELO Eureka Reward'}</span>
        </span>

        <Button
          onClick={() => onStartFocus(subject)}
          variant="primary"
          size="sm"
          className="gap-1.5 font-bold shadow-primer-xs"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{t('student.start_focus') || 'Start Focus'} ({subject.durationMinutes} {t('common.minutes') || 'min'})</span>
        </Button>
      </div>
    </div>
  );
};

export default PinnedSubjectCard;
