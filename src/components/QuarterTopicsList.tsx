import React from 'react';
import { CheckCircle2, Clock, CircleDot, Circle, Tag } from 'lucide-react';
import { QuarterTopic, Language, TopicStatus } from '../types';

interface QuarterTopicsListProps {
  topics: QuarterTopic[];
  currentLang: Language;
  onSelectTopic: (topic: QuarterTopic) => void;
}

const statusConfig: Record<TopicStatus, {
  icon: React.ElementType;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  mastered: {
    icon: CheckCircle2,
    iconColor: 'text-[#8250df]', // GitHub Light Done/Merged Purple
    badgeBg: 'bg-[#fbefff]',
    badgeText: 'text-[#8250df]',
    badgeBorder: 'border-[#be8ced]/50'
  },
  pending: {
    icon: Clock,
    iconColor: 'text-[#9a6700]', // GitHub Light Attention Amber
    badgeBg: 'bg-[#fff8c5]',
    badgeText: 'text-[#9a6700]',
    badgeBorder: 'border-[#d4a72c]/50'
  },
  in_progress: {
    icon: CircleDot,
    iconColor: 'text-[#1a7f37]', // GitHub Light Open Green
    badgeBg: 'bg-[#dafbe1]',
    badgeText: 'text-[#1a7f37]',
    badgeBorder: 'border-[#4ac26b]/50'
  },
  queued: {
    icon: Circle,
    iconColor: 'text-[#656d76]',
    badgeBg: 'bg-[#f6f8fa]',
    badgeText: 'text-[#656d76]',
    badgeBorder: 'border-[#d0d7de]'
  }
};

const i18n = {
  KZ: {
    sectionTitle: 'Тақырыптар (Issues & Milestones)',
    openCount: '3 Ашық',
    closedCount: '1 Жабық (Зачтено)',
    labels: ['1-тоқсан', 'СОР', 'Мұғалімде']
  },
  RU: {
    sectionTitle: 'Темы четверти (Issues)',
    openCount: '3 Открыто',
    closedCount: '1 Закрыто (Зачтено)',
    labels: ['1-я четверть', 'СОР', 'Учитель']
  },
  EN: {
    sectionTitle: 'Quarter Topics (Issues)',
    openCount: '3 Open',
    closedCount: '1 Closed',
    labels: ['Q1', 'Exam', 'Teacher']
  }
};

export const QuarterTopicsList: React.FC<QuarterTopicsListProps> = ({
  topics,
  currentLang,
  onSelectTopic
}) => {
  const t = i18n[currentLang];

  return (
    <section className="space-y-2">
      
      {/* GitHub Issue Table Header (Light) */}
      <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-t-lg p-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
            <CircleDot className="w-4 h-4 text-[#1a7f37]" />
            {t.openCount}
          </span>
          <span className="text-[#656d76] flex items-center gap-1.5 hover:text-[#1f2328] cursor-pointer">
            <CheckCircle2 className="w-4 h-4 text-[#8250df]" />
            {t.closedCount}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-[#656d76]">
          <Tag className="w-3 h-3" />
          <span>Milestones</span>
        </div>
      </div>

      {/* GitHub Issue Rows (Light) */}
      <div className="bg-[#ffffff] border-x border-b border-[#d0d7de] rounded-b-lg divide-y divide-[#d0d7de] -mt-2">
        {topics.map((topic) => {
          const config = statusConfig[topic.status];
          const Icon = config.icon;

          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`p-3 flex items-start justify-between transition-colors cursor-pointer ${
                topic.isTodayFocus 
                  ? 'bg-[#ddf4ff]/30 hover:bg-[#f6f8fa]' 
                  : 'hover:bg-[#f6f8fa]'
              }`}
            >
              <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <div className="min-w-0">
                  
                  {/* Title & Topic Labels */}
                  <div className="flex flex-wrap items-center gap-1.5 leading-snug">
                    <span className="text-xs font-bold text-[#1f2328] hover:text-[#0969da]">
                      {topic.title}
                    </span>
                    
                    {/* GitHub Pill Labels */}
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                      {topic.statusLabel}
                    </span>
                    {topic.isTodayFocus && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/50">
                        focus
                      </span>
                    )}
                  </div>

                  {/* Issue Subtitle / Metadata */}
                  <div className="text-[11px] text-[#656d76] mt-1 flex items-center gap-1">
                    <span className="font-mono">{topic.topicNumber}</span>
                    <span>•</span>
                    <span>{topic.subText}</span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
