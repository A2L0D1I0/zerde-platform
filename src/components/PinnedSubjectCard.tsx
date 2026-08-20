import React from 'react';
import { Play, ChevronLeft, ChevronRight, Bookmark, Star, Sparkles } from 'lucide-react';
import { SubjectFocus, Language } from '../types';

interface PinnedSubjectCardProps {
  subjects: SubjectFocus[];
  activeIndex: number;
  onSubjectChange: (index: number) => void;
  onStartPractice: (subject: SubjectFocus) => void;
  currentLang: Language;
}

const subjectLangColors: Record<string, string> = {
  algebra_9: 'bg-[#b07219]', // Math / Amber
  physics_9: 'bg-[#3572A5]', // Physics / Blue
  chemistry_9: 'bg-[#e34c26]', // Chemistry / Red
  kazakh_9: 'bg-[#008080]', // Language / Teal
};

const i18n = {
  KZ: {
    pinnedTitle: 'Бекітілген пән (Pinned Subject)',
    publicBadge: 'Public',
    todayFocus: 'Бүгінгі 3 минуттық фокус:',
    examPredict: 'Болжам:',
    updated: 'Өңделді: Бүгін'
  },
  RU: {
    pinnedTitle: 'Закрепленный предмет (Pinned)',
    publicBadge: 'Public',
    todayFocus: 'Сегодняшний 3-минутный фокус:',
    examPredict: 'Прогноз:',
    updated: 'Обновлено: Сегодня'
  },
  EN: {
    pinnedTitle: 'Pinned Subject',
    publicBadge: 'Public',
    todayFocus: 'Today’s 3-minute focus:',
    examPredict: 'Predicted:',
    updated: 'Updated today'
  }
};

export const PinnedSubjectCard: React.FC<PinnedSubjectCardProps> = ({
  subjects,
  activeIndex,
  onSubjectChange,
  onStartPractice,
  currentLang
}) => {
  const currentSubject = subjects[activeIndex] || subjects[0];
  const t = i18n[currentLang];
  const langColor = subjectLangColors[currentSubject.id] || 'bg-[#0969da]';

  const handlePrev = () => {
    onSubjectChange((activeIndex - 1 + subjects.length) % subjects.length);
  };

  const handleNext = () => {
    onSubjectChange((activeIndex + 1) % subjects.length);
  };

  return (
    <section className="space-y-2">
      
      {/* Section Header: GitHub Pinned header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#656d76]">
          <Bookmark className="w-3.5 h-3.5" />
          <span>{t.pinnedTitle}</span>
        </div>
        <span className="text-[11px] font-mono text-[#656d76]">
          {activeIndex + 1} / {subjects.length}
        </span>
      </div>

      {/* GitHub Light Repo Card Container */}
      <div className="bg-[#ffffff] border border-[#d0d7de] rounded-lg p-4 space-y-3 shadow-2xs">
        
        {/* Repo Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-base leading-none p-1 rounded bg-[#f6f8fa] border border-[#d0d7de]">
              {currentSubject.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#0969da] hover:underline cursor-pointer truncate">
                  zerde / {currentSubject.id.replace('_', '-')}
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium text-[#656d76] border border-[#d0d7de]">
                  {t.publicBadge}
                </span>
              </div>
              <div className="text-[11px] text-[#656d76] mt-0.5">
                {currentSubject.title}
              </div>
            </div>
          </div>

          {/* Star / Exam Score */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#f6f8fa] border border-[#d0d7de] text-xs font-mono font-semibold text-[#1f2328]">
            <Star className="w-3 h-3 text-[#d4a72c] fill-[#d4a72c]" />
            <span>{currentSubject.predictedScore.replace(' ⭐', '')}</span>
          </div>
        </div>

        {/* Focus Socratic Box */}
        <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-3 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1f2328]">
            <Sparkles className="w-3.5 h-3.5 text-[#9a6700]" />
            <span>{t.todayFocus}</span>
          </div>
          
          <div className="text-xs font-bold text-[#0969da] leading-snug">
            {currentSubject.focusTopic}
          </div>

          <p className="text-[11px] text-[#656d76] leading-relaxed pt-1 border-t border-[#d0d7de]">
            {currentSubject.focusReason}
          </p>
        </div>

        {/* GitHub Primary Green Action Button */}
        <button
          onClick={() => onStartPractice(currentSubject)}
          className="w-full py-2.5 px-4 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] active:bg-[#187532] text-white text-xs font-bold flex items-center justify-center space-x-2 transition border border-[rgba(31,35,40,0.15)] shadow-[0_1px_0_rgba(27,31,36,0.1),inset_0_1px_0_rgba(255,255,255,0.03)] cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{currentSubject.ctaLabel}</span>
        </button>

        {/* Repo Footer Metadata */}
        <div className="flex items-center justify-between text-[11px] text-[#656d76] pt-2 border-t border-[#d0d7de]">
          <div className="flex items-center space-x-3">
            {/* Language Color Dot */}
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${langColor}`} />
              <span className="text-[#1f2328] font-medium">{currentSubject.title.split(' ')[0]}</span>
            </div>

            {/* ELO Tag */}
            <span className="font-mono text-[#1a7f37] font-semibold">
              {currentSubject.subjectElo} ELO
            </span>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-[#1f2328] transition"
              aria-label="Previous subject"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-[#1f2328] transition"
              aria-label="Next subject"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};
