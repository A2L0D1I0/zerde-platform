import React from 'react';
import { DailySignal } from '@zerde/shared';
import { useLanguage } from '@/context/LanguageContext';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface DailySignalBannerProps {
  signal: DailySignal | null;
  onOpenSmartboard?: () => void;
}

export const DailySignalBanner: React.FC<DailySignalBannerProps> = ({
  signal,
}) => {
  const { t, language } = useLanguage();
  if (!signal) return null;

  const cluster = signal.cluster_deficit;
  const hasDeficit = cluster && cluster.percentage > 0;

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
              <span>{t('teacher.lesson_signal_title')}</span>
            </span>

            <span className={`text-xs font-mono font-semibold ${
              hasDeficit ? 'text-primer-attention-fg' : 'text-primer-success-fg'
            }`}>
              {hasDeficit
                ? (language === 'RU' ? `${cluster.percentage}% учащихся испытывают трудности` : language === 'EN' ? `${cluster.percentage}% students struggle with this topic` : `${cluster.percentage}% оқушы осы тақырыптан қиналды`)
                : (language === 'RU' ? 'В классе нет системных дефицитов' : language === 'EN' ? 'No systemic deficits found' : 'Сыныпта жүйелі қателіктер байқалмады')}
            </span>
          </div>

          <h4 className="text-sm font-bold text-primer-fg-default">
            {cluster.skill_name_kz || signal.topic_title}
          </h4>

          <p className="text-xs text-primer-fg-muted leading-relaxed">
            {cluster.misconception_kz || (hasDeficit ? (language === 'RU' ? 'Трудности при определении интервалов или нулей знаменателя в ОДЗ.' : language === 'EN' ? 'Issues in interval sign determination or denominator zero constraints.' : 'Интервалдар әдісінде таңбаларды анықтау немесе ОДЗ нөлдерін ескеру қатесі.') : (language === 'RU' ? 'Все учащиеся успешно осваивают учебные цели.' : language === 'EN' ? 'All students are mastering the curriculum goals.' : 'Барлық оқушылар сабақ мақсаттарын сәтті орындауда.'))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailySignalBanner;
