export type EloRankCode = 'OSKIN' | 'TUGYR' | 'QYRAN' | 'SAMGAU';

export interface RankInfo {
  code: EloRankCode;
  nameKZ: string;
  nameRU: string;
  nameEN: string;
  symbol: string;
  minElo: number;
  maxElo: number;
}

export const RANKS_CONFIG: Record<EloRankCode, RankInfo> = {
  OSKIN:  { code: 'OSKIN',  nameKZ: 'Өскін',  nameRU: 'Росток',  nameEN: 'Sprout',  symbol: '🌱', minElo: 1000, maxElo: 1199 },
  TUGYR:  { code: 'TUGYR',  nameKZ: 'Тұғыр',  nameRU: 'Опора',   nameEN: 'Base',    symbol: '🏛️', minElo: 1200, maxElo: 1399 },
  QYRAN:  { code: 'QYRAN',  nameKZ: 'Қыран',  nameRU: 'Беркут',  nameEN: 'Eagle',   symbol: '🦅', minElo: 1400, maxElo: 1599 },
  SAMGAU: { code: 'SAMGAU', nameKZ: 'Самғау', nameRU: 'Полет',   nameEN: 'Soaring', symbol: '🚀', minElo: 1600, maxElo: 3000 },
};

export function getRankByElo(elo: number): RankInfo {
  if (elo >= 1600) return RANKS_CONFIG.SAMGAU;
  if (elo >= 1400) return RANKS_CONFIG.QYRAN;
  if (elo >= 1200) return RANKS_CONFIG.TUGYR;
  return RANKS_CONFIG.OSKIN;
}

export interface EloDeltaInput {
  currentElo: number;
  isCorrect: boolean;
  isEureka?: boolean;
  hintsUsed?: number;
  isJailbreak?: boolean;
}

export interface EloDeltaResult {
  newElo: number;
  delta: number;
  rank: RankInfo;
}

export function calculateEloDelta(params: EloDeltaInput): EloDeltaResult {
  const { currentElo, isCorrect, isEureka = false, hintsUsed = 0, isJailbreak = false } = params;

  if (isJailbreak) {
    const delta = -20; // Anti-Jailbreak Guard penalty
    const newElo = Math.max(400, currentElo + delta);
    return { newElo, delta, rank: getRankByElo(newElo) };
  }

  let delta = 0;
  if (isEureka) {
    delta = 15; // Eureka Moment bonus
  } else if (isCorrect) {
    delta = Math.max(3, 10 - hintsUsed * 2);
  } else {
    delta = -5;
  }

  const newElo = Math.max(400, currentElo + delta);
  return { newElo, delta, rank: getRankByElo(newElo) };
}
