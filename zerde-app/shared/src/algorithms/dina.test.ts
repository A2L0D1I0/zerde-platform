import { describe, it, expect } from 'vitest';
import { estimateSkillMastery } from './dina';

describe('Zerde CDM DINA Algorithm', () => {
  it('should return prior default for zero attempts', () => {
    const res = estimateSkillMastery('ALG_09_ROOTS', []);
    expect(res.probability).toBe(0.5);
    expect(res.status).toBe('in_progress');
  });

  it('should mark skill as mastered when student answers consistently correct', () => {
    const res = estimateSkillMastery('ALG_09_ROOTS', [
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
    ]);
    expect(res.probability).toBeGreaterThanOrEqual(0.70);
    expect(res.status).toBe('mastered');
  });

  it('should mark skill as deficit when student fails repeatedly', () => {
    const res = estimateSkillMastery('ALG_09_ROOTS', [
      { isCorrect: false },
      { isCorrect: false },
      { isCorrect: false },
    ]);
    expect(res.probability).toBeLessThan(0.40);
    expect(res.status).toBe('deficit');
  });
});
