import { describe, it, expect } from 'vitest';
import { calculateEloDelta, getRankByElo, RANKS_CONFIG } from './elo';

describe('Zerde ELO Algorithm', () => {
  it('should correctly map ELO to canonical 4 ranks', () => {
    expect(getRankByElo(1050).code).toBe('OSKIN');
    expect(getRankByElo(1199).code).toBe('OSKIN');
    expect(getRankByElo(1200).code).toBe('TUGYR');
    expect(getRankByElo(1399).code).toBe('TUGYR');
    expect(getRankByElo(1400).code).toBe('QYRAN');
    expect(getRankByElo(1420).code).toBe('QYRAN'); // Azamat Temirkhanov
    expect(getRankByElo(1599).code).toBe('QYRAN');
    expect(getRankByElo(1600).code).toBe('SAMGAU');
    expect(getRankByElo(1850).code).toBe('SAMGAU');
  });

  it('should increase ELO on correct answer', () => {
    const res = calculateEloDelta({
      currentElo: 1400,
      isCorrect: true,
      hintsUsed: 0,
    });
    expect(res.delta).toBe(10);
    expect(res.newElo).toBe(1410);
    expect(res.rank.code).toBe('QYRAN');
  });

  it('should award +15 ELO on Eureka Moment', () => {
    const res = calculateEloDelta({
      currentElo: 1400,
      isCorrect: true,
      isEureka: true,
    });
    expect(res.delta).toBe(15);
    expect(res.newElo).toBe(1415);
  });

  it('should penalize -20 ELO on Anti-Jailbreak Guard trigger', () => {
    const res = calculateEloDelta({
      currentElo: 1420,
      isCorrect: false,
      isJailbreak: true,
    });
    expect(res.delta).toBe(-20);
    expect(res.newElo).toBe(1400);
  });
});
