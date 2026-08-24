import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('Zerde SuperMemo-2 (SM-2) Algorithm', () => {
  const fixedNow = new Date('2026-08-22T12:00:00Z');

  it('should set 1-day interval on first successful recall (repetition 0)', () => {
    const res = calculateSM2({
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      grade: 4,
    }, fixedNow);

    expect(res.interval).toBe(1);
    expect(res.repetition).toBe(1);
    expect(res.dueDate).toBe('2026-08-23');
  });

  it('should set 6-day interval on second successful recall (repetition 1)', () => {
    const res = calculateSM2({
      interval: 1,
      repetition: 1,
      easeFactor: 2.5,
      grade: 4,
    }, fixedNow);

    expect(res.interval).toBe(6);
    expect(res.repetition).toBe(2);
    expect(res.dueDate).toBe('2026-08-28');
  });

  it('should reset interval to 1 on failure (grade < 3)', () => {
    const res = calculateSM2({
      interval: 15,
      repetition: 4,
      easeFactor: 2.3,
      grade: 1,
    }, fixedNow);

    expect(res.interval).toBe(1);
    expect(res.repetition).toBe(0);
    expect(res.dueDate).toBe('2026-08-23');
  });
});
