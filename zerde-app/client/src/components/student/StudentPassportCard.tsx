import React from 'react';
import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, Award, School, Sparkles, CheckCircle2, TrendingUp, QrCode } from 'lucide-react';

interface StudentPassportCardProps {
  user: User | null;
  overallMastery?: number;
  totalMastered?: number;
  totalTopics?: number;
}

export const StudentPassportCard: React.FC<StudentPassportCardProps> = ({
  user,
  overallMastery = 75,
  totalMastered = 18,
  totalTopics = 24,
}) => {
  const { t } = useLanguage();
  const elo = user?.overallElo || 1420;
  const streak = user?.streakDays || 12;
  const rankLevel = user?.eloRank?.level || 'Қыран';
  const rankSymbol = user?.eloRank?.symbol || '🦅';

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3.5 relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primer-accent-emphasis via-primer-success-emphasis to-primer-done-emphasis" />

      {/* Header with Avatar & Basic Info */}
      <div className="flex items-center gap-3 pt-1">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-primer-border-default">
            {user?.full_name?.charAt(0) || 'А'}
          </div>
          <span className="absolute -bottom-1 -right-1 text-sm bg-primer-canvas-default rounded-full p-0.5 shadow-xs">
            {rankSymbol}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-primer-fg-default truncate">
              {user?.full_name || 'Азамат Темірханов'}
            </h3>
            {user?.grade && (
              <Badge variant="accent" className="text-[10px] py-0 font-mono">
                {user.grade}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-primer-fg-muted flex items-center gap-1 mt-0.5 truncate">
            <School className="w-3 h-3 shrink-0" />
            <span>{user?.school || 'NIS IB Astana / Zerde Lab'}</span>
          </p>
        </div>
      </div>

      {/* 4 Pillars Matrix */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* ELO Rating */}
        <div className="bg-primer-canvas-inset border border-primer-border-muted rounded-lg p-2.5">
          <div className="text-[10px] text-primer-fg-muted font-medium">{t('student.elo_rating_label')}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base font-bold font-mono text-primer-success-fg">
              {elo}
            </span>
            <span className="text-[10px] text-primer-fg-subtle">ELO</span>
          </div>
          <div className="text-[10px] font-semibold text-primer-accent-fg mt-0.5 flex items-center gap-1">
            <span>{rankSymbol}</span>
            <span>{rankLevel}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-primer-canvas-inset border border-primer-border-muted rounded-lg p-2.5">
          <div className="text-[10px] text-primer-fg-muted font-medium">{t('student.streak_days_label')}</div>
          <div className="flex items-center gap-1 mt-0.5 text-primer-attention-fg">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-base font-bold font-mono">{streak} {t('student.days_unit')}</span>
          </div>
          <div className="text-[10px] text-primer-fg-subtle mt-0.5">{t('student.consecutive_commits')}</div>
        </div>
      </div>

      {/* Overall Mastery Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-primer-fg-default font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primer-done-fg" />
            <span>{t('student.quarter_goal_label')}</span>
          </span>
          <span className="font-mono font-bold text-primer-fg-default">
            {totalMastered}/{totalTopics} ({overallMastery}%)
          </span>
        </div>
        <div className="w-full bg-primer-canvas-inset rounded-full h-2 overflow-hidden border border-primer-border-muted">
          <div
            className="bg-gradient-to-r from-primer-accent-emphasis to-primer-success-emphasis h-full rounded-full transition-all duration-500"
            style={{ width: `${overallMastery}%` }}
          />
        </div>
      </div>

      {/* Footer Passport Verification Badge */}
      <div className="pt-2 border-t border-primer-border-muted/60 flex items-center justify-between text-[10px] text-primer-fg-muted">
        <span className="font-mono">ID: ZERDE-2026-STU</span>
        <span className="flex items-center gap-1 text-primer-success-fg font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>{t('student.verified_passport')}</span>
        </span>
      </div>
    </div>
  );
};

