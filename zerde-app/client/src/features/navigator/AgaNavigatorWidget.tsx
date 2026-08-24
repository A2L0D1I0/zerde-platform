import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  Compass,
  PlayCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Target
} from 'lucide-react';
import api from '@/api/client';

export interface NavigatorAdviceData {
  greeting: string;
  primary_focus_course_id: number;
  recommended_topic_title: string;
  rationale: string;
  encouragement: string;
}

interface AgaNavigatorWidgetProps {
  onStartPractice?: (topicTitle: string, courseId?: number) => void;
}

export const AgaNavigatorWidget: React.FC<AgaNavigatorWidgetProps> = ({ onStartPractice }) => {
  const { language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [advice, setAdvice] = useState<NavigatorAdviceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await api.get(`/student/navigator-advice?language=${lang}`);
      const data = res?.data || res;
      if (data && data.recommended_topic_title) {
        setAdvice(data);
      } else {
        throw new Error('Бос жауап алынды');
      }
    } catch (err: any) {
      console.warn('[AgaNavigatorWidget] Failed to load advice', err);
      setError(
        lang === 'KZ'
          ? 'Аға Навигатор кеңесін жүктеу мүмкін болмады'
          : lang === 'RU'
          ? 'Не удалось загрузить совет Навигатора'
          : 'Failed to load Navigator advice'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [lang]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-primer-accent-emphasis/30 bg-gradient-to-r from-primer-accent-subtle/20 via-primer-canvas-subtle to-primer-canvas-subtle p-5 shadow-primer-xs space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primer-accent-emphasis/30 flex items-center justify-center">
              🦉
            </div>
            <div className="h-4 w-36 bg-primer-border-default rounded"></div>
          </div>
          <div className="h-4 w-20 bg-primer-border-default rounded"></div>
        </div>
        <div className="space-y-2 py-2">
          <div className="h-5 w-3/4 bg-primer-border-default rounded"></div>
          <div className="h-3.5 w-full bg-primer-border-default rounded"></div>
          <div className="h-3.5 w-2/3 bg-primer-border-default rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !advice) {
    return (
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-primer-fg-muted">
            🦉
          </div>
          <div>
            <h4 className="text-xs font-bold text-primer-fg-default">Аға Навигатор</h4>
            <p className="text-[11px] text-primer-fg-muted">
              {error || 'Кеңес әзірге қолжетімсіз'}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={fetchAdvice} className="text-xs gap-1 h-7">
          <RefreshCw className="w-3 h-3" />
          <span>Қайталау</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primer-accent-emphasis/40 bg-gradient-to-br from-primer-accent-subtle/25 via-primer-canvas-subtle to-primer-canvas-subtle p-5 shadow-primer-sm space-y-4 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primer-accent-emphasis/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            🦉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primer-accent-fg flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Аға Навигатор — Фокус Дня</span>
              </h3>
              <Badge variant="accent" className="text-[10px] font-mono">
                AI Diagnostic
              </Badge>
            </div>
            <p className="text-xs font-semibold text-primer-fg-default mt-0.5">
              {advice.greeting}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={fetchAdvice}
          title="Жаңарту"
          className="h-7 w-7 p-0 text-primer-fg-muted hover:text-primer-fg-default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Recommended Topic & Rationale */}
      <div className="p-3.5 rounded-xl bg-primer-canvas-inset border border-primer-border-muted space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-primer-fg-muted uppercase flex items-center gap-1">
            <Target className="w-3 h-3 text-primer-accent-fg" />
            <span>Ұсынылатын тақырып:</span>
          </span>
          <span className="text-[11px] font-mono text-primer-attention-fg font-bold">
            +15 XP мақсаты
          </span>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-primer-fg-default leading-snug">
          {advice.recommended_topic_title}
        </h4>

        <p className="text-xs text-primer-fg-muted leading-relaxed">
          {advice.rationale}
        </p>
      </div>

      {/* Encouragement Quote & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-xs italic text-primer-fg-default flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>«{advice.encouragement}»</span>
        </p>

        <Button
          size="sm"
          variant="primary"
          onClick={() => onStartPractice && onStartPractice(advice.recommended_topic_title, advice.primary_focus_course_id)}
          className="text-xs font-bold gap-2 px-4 h-8 shrink-0 shadow-xs cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Осы тақырыпты бастау</span>
        </Button>
      </div>
    </div>
  );
};
