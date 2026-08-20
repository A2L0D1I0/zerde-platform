import React from 'react';
import { ChevronRight, BookmarkCheck } from 'lucide-react';
import { SpacedRepetitionItem, Language } from '../types';

interface SpacedRepetitionCardProps {
  item: SpacedRepetitionItem;
  currentLang: Language;
  onReview: () => void;
}

const i18n = {
  KZ: {
    badge: 'Жадты бекіту (Spaced Repetition)',
    btn: 'Қайталау',
    cardsLabel: 'карта'
  },
  RU: {
    badge: 'Интервальное повторение (Spaced Repetition)',
    btn: 'Повторить',
    cardsLabel: 'карточки'
  },
  EN: {
    badge: 'Spaced Memory Repetition',
    btn: 'Review',
    cardsLabel: 'cards'
  }
};

export const SpacedRepetitionCard: React.FC<SpacedRepetitionCardProps> = ({
  item,
  currentLang,
  onReview
}) => {
  const t = i18n[currentLang];

  return (
    <section className="bg-[#ffffff] border-l-4 border-l-[#0969da] border border-[#d0d7de] rounded-r-lg rounded-l-xs p-3.5 flex items-center justify-between shadow-2xs">
      <div className="space-y-1 pr-3">
        <div className="text-xs font-bold text-[#0969da] flex items-center gap-1.5">
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>{t.badge}</span>
        </div>
        <p className="text-[11px] text-[#656d76] leading-relaxed">
          {item.description}
        </p>
      </div>

      <button
        onClick={onReview}
        className="px-3 py-1.5 rounded-md bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-xs font-semibold text-[#1f2328] flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer shadow-xs active:scale-95"
      >
        <span>{t.btn}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#656d76]" />
      </button>
    </section>
  );
};
