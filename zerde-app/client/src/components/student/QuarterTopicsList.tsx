import React from 'react';
import { Topic, TopicStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, PlayCircle, CircleDot, ChevronRight, Zap } from 'lucide-react';

interface QuarterTopicsListProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}

export const QuarterTopicsList: React.FC<QuarterTopicsListProps> = ({
  topics,
  onSelectTopic,
}) => {
  const { t, language, getLocalized } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const getStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <Badge variant="done" className="text-[10px] gap-1 py-0 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('status.mastered')}</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="attention" className="text-[10px] gap-1 py-0 shrink-0">
            <Clock className="w-3 h-3" />
            <span>{t('status.pending')}</span>
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="success" className="text-[10px] gap-1 py-0 shrink-0">
            <PlayCircle className="w-3 h-3" />
            <span>{t('status.in_progress')}</span>
          </Badge>
        );
      case 'queued':
      default:
        return (
          <Badge variant="secondary" className="text-[10px] gap-1 py-0 shrink-0">
            <CircleDot className="w-3 h-3" />
            <span>{t('status.queued')}</span>
          </Badge>
        );
    }
  };

  const focusLabel = lang === 'KZ' ? 'Фокус' : lang === 'RU' ? 'Фокус' : 'Focus';

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs">
      <div className="flex items-center justify-between pb-2.5 border-b border-primer-border-muted/60 mb-2">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-primer-accent-fg" />
          <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
            {t('student.quarter_topics')} ({t('student.quarter_one_label')})
          </h3>
        </div>
        <span className="text-[10px] text-primer-fg-muted font-mono font-semibold">
          {topics.filter((t) => t.status === 'mastered').length}/{topics.length} {t('status.mastered')}
        </span>
      </div>

      <div className="divide-y divide-primer-border-muted/40">
        {topics.map((topic) => {
          const title = getLocalized(topic, 'title', topic.title);
          const desc = getLocalized(topic, 'description', topic.sub_text || topic.description || '');

          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-primer-canvas-inset/50 px-2 rounded-lg transition cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-primer-fg-muted">
                    {topic.topic_number || `#${topic.order_index}`}
                  </span>
                  <span className="text-xs font-semibold text-primer-fg-default group-hover:text-primer-accent-fg transition truncate">
                    {title}
                  </span>
                  {topic.is_today_focus && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/60">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>{focusLabel}</span>
                    </span>
                  )}
                </div>
                {desc && (
                  <p className="text-[11px] text-primer-fg-muted truncate">
                    {desc}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {getStatusBadge(topic.status)}
                <ChevronRight className="w-3.5 h-3.5 text-primer-fg-subtle group-hover:text-primer-fg-default transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuarterTopicsList;
