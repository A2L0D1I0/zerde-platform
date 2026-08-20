import React from 'react';
import { ClassLeaderboardEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Award, Crown, ChevronRight } from 'lucide-react';

interface ClassLeaderboardCardProps {
  leaderboard: ClassLeaderboardEntry[];
  currentUserId?: string;
  onViewFull?: () => void;
}

export const ClassLeaderboardCard: React.FC<ClassLeaderboardCardProps> = ({
  leaderboard,
  currentUserId = 'usr_student_01',
  onViewFull,
}) => {
  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shadow-xs">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center shadow-xs">
            3
          </div>
        );
      default:
        return (
          <span className="w-5 text-center text-xs font-mono font-semibold text-primer-fg-muted">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 sm:p-4 shadow-primer-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-primer-border-muted/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/40">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
              Сынып Лидерборды (9 «А»)
            </h3>
            <p className="text-[10px] text-primer-fg-muted">
              Апталық ELO және стрик рейтингі
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono">
          Топ-5
        </Badge>
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-1.5">
        {leaderboard.slice(0, 5).map((entry) => {
          const isCurrent = entry.isCurrentUser || entry.id === currentUserId;

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-primer-accent-emphasis/60 bg-primer-accent-subtle/30 ring-1 ring-primer-accent-emphasis/50'
                  : 'border-primer-border-muted/40 bg-primer-canvas-inset/50 hover:bg-primer-canvas-inset'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getRankMedal(entry.rank)}

                <div className="w-7 h-7 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    entry.name.charAt(0)
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-primer-accent-fg font-bold' : 'text-primer-fg-default'}`}>
                      {entry.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-primer-accent-emphasis text-white font-mono font-bold">
                        Сен
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-primer-fg-muted flex items-center gap-1.5">
                    <span>{entry.eloRankLevel}</span>
                    <span>•</span>
                    <span className="text-primer-attention-fg flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      {entry.streakDays}к
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-bold text-primer-success-fg">
                  {entry.elo}
                </div>
                <div className="text-[9px] text-primer-fg-subtle">
                  {entry.masteredCount} тақырып
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
