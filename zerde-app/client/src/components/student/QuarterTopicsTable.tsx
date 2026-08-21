import React, { useState } from 'react';
import { Topic, TopicStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  CircleDot,
  Search,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface QuarterTopicsTableProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}

export const QuarterTopicsTable: React.FC<QuarterTopicsTableProps> = ({
  topics,
  onSelectTopic,
}) => {
  const { t, language, getLocalized } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'mastered' | 'in_progress' | 'pending' | 'queued'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const filteredTopics = topics.filter((t) => {
    const title = getLocalized(t, 'title', t.title);
    const desc = getLocalized(t, 'description', t.sub_text || t.description || '');
    const matchesFilter = filter === 'all' ? true : t.status === filter;
    const matchesQuery =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.topic_number && t.topic_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const getStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#271052] text-[#a371f7] border border-[#a371f7]/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('status.mastered')}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3b2300] text-[#d29922] border border-[#d29922]/40">
            <Clock className="w-3 h-3" />
            <span>{t('status.pending')}</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0f351d] text-[#3fb950] border border-[#3fb950]/40">
            <CircleDot className="w-3 h-3" />
            <span>{t('status.in_progress')}</span>
          </span>
        );
      case 'queued':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#21262d] text-[#8b949e] border border-[#30363d]">
            <CircleDot className="w-3 h-3" />
            <span>{t('status.queued')}</span>
          </span>
        );
    }
  };

  const headerTitle =
    lang === 'KZ'
      ? 'Тоқсан тақырыптары (Quarter Topics Lifecycle)'
      : lang === 'RU'
      ? 'Темы четверти (Quarter Topics Lifecycle)'
      : 'Quarter Topics Lifecycle (Quarter I)';

  const headerSub =
    lang === 'KZ'
      ? 'GitHub Issues стиліндегі екі факторлы зачет пен оқу матрицасы'
      : lang === 'RU'
      ? 'Матрица навыков и зачетов в стиле GitHub Issues'
      : 'GitHub Issues-style two-factor skill mastery matrix';

  const filterAllLabel =
    lang === 'KZ' ? 'Барлығы' : lang === 'RU' ? 'Все' : 'All';

  const searchPlaceholder =
    lang === 'KZ'
      ? 'Тақырыптарды сүзу...'
      : lang === 'RU'
      ? 'Фильтр тем...'
      : 'Filter topics...';

  const todayFocusBadge =
    lang === 'KZ'
      ? 'Бүгінгі фокус'
      : lang === 'RU'
      ? 'Фокус дня'
      : 'Today Focus';

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-primer-border-muted/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primer-canvas-inset border border-primer-border-muted">
            <Layers className="w-4 h-4 text-primer-accent-fg" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
              {headerTitle}
            </h3>
            <p className="text-[10px] text-primer-fg-muted">
              {headerSub}
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-primer-fg-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8 pr-3 py-1 text-xs bg-primer-canvas-inset border border-primer-border-muted rounded-md text-primer-fg-default placeholder:text-primer-fg-subtle outline-none focus:border-primer-accent-emphasis w-full sm:w-48"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-primer-accent-emphasis text-white'
              : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
          }`}
        >
          {filterAllLabel} ({topics.length})
        </button>
        <button
          onClick={() => setFilter('mastered')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
            filter === 'mastered'
              ? 'bg-primer-done-emphasis text-white'
              : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>{t('status.mastered')} ({topics.filter((t) => t.status === 'mastered').length})</span>
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
            filter === 'in_progress'
              ? 'bg-primer-success-emphasis text-white'
              : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
          }`}
        >
          <CircleDot className="w-3 h-3" />
          <span>{t('status.in_progress')} ({topics.filter((t) => t.status === 'in_progress').length})</span>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
            filter === 'pending'
              ? 'bg-primer-attention-emphasis text-white'
              : 'bg-primer-canvas-inset text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-muted'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>{t('status.pending')} ({topics.filter((t) => t.status === 'pending').length})</span>
        </button>
      </div>

      {/* Topics List / Rows */}
      <div className="divide-y divide-primer-border-muted/50 border border-primer-border-muted rounded-lg overflow-hidden bg-primer-canvas-inset/40">
        {filteredTopics.length === 0 ? (
          <div className="py-8 text-center text-xs text-primer-fg-muted">
            {lang === 'KZ'
              ? 'Бұл сүзгі бойынша тақырыптар табылмады.'
              : lang === 'RU'
              ? 'По данному фильтру тем не найдено.'
              : 'No topics found for this filter.'}
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const title = getLocalized(topic, 'title', topic.title);
            const desc = getLocalized(topic, 'description', topic.sub_text || topic.description || '');

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="p-3 flex items-center justify-between gap-3 hover:bg-primer-canvas-inset transition cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-primer-fg-muted">
                      {topic.topic_number || `#${topic.order_index}`}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-primer-fg-default group-hover:text-primer-accent-fg transition truncate">
                      {title}
                    </h4>
                    {topic.is_today_focus && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/60">
                        {todayFocusBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-primer-fg-muted">
                    <span className="truncate">{desc}</span>
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono">{topic.mastery_percentage}%</span>
                      <div className="w-16 bg-primer-canvas-subtle rounded-full h-1.5 overflow-hidden border border-primer-border-muted">
                        <div
                          className="bg-primer-success-emphasis h-full rounded-full"
                          style={{ width: `${topic.mastery_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(topic.status)}
                  <ChevronRight className="w-4 h-4 text-primer-fg-subtle group-hover:text-primer-fg-default transition" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuarterTopicsTable;
