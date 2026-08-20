import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DesmosGraphCanvas } from '@/components/canvas/DesmosGraphCanvas';
import { Zap, Play, Sparkles, Brain, Sliders, ExternalLink } from 'lucide-react';

interface ActiveTrainerBlockProps {
  onStartTrainer: () => void;
  topicTitle?: string;
  subjectTitle?: string;
}

export const ActiveTrainerBlock: React.FC<ActiveTrainerBlockProps> = ({
  onStartTrainer,
  topicTitle = 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
  subjectTitle = 'Алгебра 9 сынып',
}) => {
  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-primer-border-muted/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primer-success-subtle text-primer-success-fg border border-primer-success-muted/40">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                Active Canvas & Desmos Интерактивті блогы
              </h3>
              <Badge variant="accent" className="text-[10px] py-0 font-mono">
                {subjectTitle}
              </Badge>
            </div>
            <p className="text-[11px] text-primer-fg-muted mt-0.5">
              {topicTitle}
            </p>
          </div>
        </div>

        <Badge variant="done" className="text-[10px] font-mono py-0.5 px-2">
          +15 ELO Eureka
        </Badge>
      </div>

      {/* Embedded Mini Desmos Canvas */}
      <div className="rounded-lg overflow-hidden border border-primer-border-muted">
        <DesmosGraphCanvas
          initialA={1}
          initialB={-1}
          initialC={-6}
          height={200}
          showSliders={true}
        />
      </div>

      {/* Socratic callout and Launch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-primer-fg-muted leading-relaxed">
          <span className="font-bold text-primer-fg-default">«Аға» наставнигі: </span>
          «Парабола тармақтары мен нөлдерін өзгертіп, таңбалардың ауысу заңдылығын зерттеңіз!»
        </div>

        <Button
          onClick={onStartTrainer}
          variant="primary"
          size="sm"
          className="shrink-0 gap-1.5 font-bold shadow-primer-xs"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Начать тренировку (3 мин)</span>
        </Button>
      </div>
    </div>
  );
};
