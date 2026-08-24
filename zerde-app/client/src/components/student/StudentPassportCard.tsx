import React from 'react';
import { User } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Flame, School } from 'lucide-react';

interface StudentPassportCardProps {
  user: User | null;
  overallMastery?: number;
  totalMastered?: number;
  totalTopics?: number;
  onViewFullPassport?: () => void;
}

export const StudentPassportCard: React.FC<StudentPassportCardProps> = ({
  user,
  onViewFullPassport,
}) => {
  const { language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const elo = user?.overallElo ?? 1000;
  const streak = user?.streakDays ?? 0;
  const rankLevel = user?.eloRank?.level || (lang === 'KZ' ? 'Өскін' : lang === 'RU' ? 'Росток' : 'Seedling');
  const rankSymbol = user?.eloRank?.symbol || '🌱';

  const eloLabel = lang === 'KZ' ? 'Рейтинг ELO' : lang === 'RU' ? 'Рейтинг ELO' : 'ELO Rating';
  const ptsUnit = lang === 'KZ' ? 'ұпай' : lang === 'RU' ? 'pts' : 'pts';
  const streakLabel = lang === 'KZ' ? 'Оқу стригі' : lang === 'RU' ? 'Стрик учебы' : 'Study Streak';
  const streakDaysUnit = lang === 'KZ' ? 'күн' : lang === 'RU' ? 'дней' : 'days';
  const streakSub = lang === 'KZ' ? 'Үздіксіз коммит' : lang === 'RU' ? 'Непрерывный коммит' : 'Daily commits';

  return (
    <div
      onClick={onViewFullPassport}
      className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3.5 relative overflow-hidden cursor-pointer hover:border-primer-accent-emphasis/60 transition"
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primer-accent-emphasis via-primer-success-emphasis to-primer-done-emphasis" />

      {/* Header with Avatar & Basic Info */}
      <div className="flex items-center gap-3 pt-1">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-primer-border-default">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <span className="absolute -bottom-1 -right-1 text-sm bg-primer-canvas-default rounded-full p-0.5 shadow-xs">
            {rankSymbol}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-primer-fg-default truncate">
              {user?.full_name || (lang === 'KZ' ? 'Жаңа оқушы' : lang === 'RU' ? 'Новый ученик' : 'New Student')}
            </h3>
            <Badge variant="accent" className="text-[10px] py-0 font-mono">
              {user?.grade || '9 «А»'}
            </Badge>
          </div>
          <p className="text-[11px] text-primer-fg-muted flex items-center gap-1 mt-0.5 truncate">
            <School className="w-3 h-3 shrink-0" />
            <span>{user?.school || (lang === 'KZ' ? 'Жеке оқушы' : lang === 'RU' ? 'Независимый ученик' : 'Individual Learner')}</span>
          </p>
        </div>
      </div>

      {/* 2-Pillars Matrix: ELO & Streak */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* ELO Rating */}
        <div className="bg-primer-canvas-inset border border-primer-border-muted rounded-lg p-2.5">
          <div className="text-[10px] text-primer-fg-muted font-medium">{eloLabel}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base font-bold font-mono text-primer-success-fg">
              {elo}
            </span>
            <span className="text-[10px] text-primer-fg-subtle">{ptsUnit}</span>
          </div>
          <div className="text-[10px] font-semibold text-primer-accent-fg mt-0.5 flex items-center gap-1">
            <span>{rankSymbol}</span>
            <span>{rankLevel}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-primer-canvas-inset border border-primer-border-muted rounded-lg p-2.5">
          <div className="text-[10px] text-primer-fg-muted font-medium">{streakLabel}</div>
          <div className="flex items-center gap-1 mt-0.5 text-primer-attention-fg">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-base font-bold font-mono">{streak} {streakDaysUnit}</span>
          </div>
          <div className="text-[10px] text-primer-fg-subtle mt-0.5">{streakSub}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentPassportCard;
