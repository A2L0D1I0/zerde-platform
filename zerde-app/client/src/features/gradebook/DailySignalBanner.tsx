import React from 'react';
import { DailySignal } from '@zerde/shared';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Maximize2, CheckCircle2 } from 'lucide-react';

interface DailySignalBannerProps {
  signal: DailySignal | null;
  onOpenSmartboard?: () => void;
}

export const DailySignalBanner: React.FC<DailySignalBannerProps> = ({
  signal,
  onOpenSmartboard,
}) => {
  if (!signal) return null;

  const cluster = signal.cluster_deficit;
  const hasDeficit = cluster && cluster.percentage > 0;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className={`rounded-xl border-l-4 border-y border-r border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs ${
      hasDeficit ? 'border-l-primer-attention-emphasis' : 'border-l-primer-success-emphasis'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1 ${
              hasDeficit ? 'bg-primer-attention-emphasis' : 'bg-primer-success-emphasis'
            }`}>
              {hasDeficit ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              <span>Күн сигналы (Signal of the Day)</span>
            </span>

            <span className={`text-xs font-mono font-semibold ${
              hasDeficit ? 'text-primer-attention-fg' : 'text-primer-success-fg'
            }`}>
              {hasDeficit
                ? `${cluster.percentage}% оқушы осы тақырыптан қиналды`
                : 'Сыныпта жүйелі қателіктер байқалмады'}
            </span>
          </div>

          <h4 className="text-sm font-bold text-primer-fg-default">
            {cluster.skill_name_kz || signal.topic_title}
          </h4>

          <p className="text-xs text-primer-fg-muted leading-relaxed">
            {cluster.misconception_kz || (hasDeficit ? 'Интервалдар әдісінде таңбаларды анықтау немесе ОДЗ нөлдерін ескеру қатесі.' : 'Барлық оқушылар сабақ мақсаттарын сәтті орындауда.')}
          </p>
        </div>

        <Button
          onClick={toggleFullscreen}
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5 font-semibold text-xs cursor-pointer hover:bg-primer-canvas-inset"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Толық экран (F11)</span>
        </Button>
      </div>
    </div>
  );
};
