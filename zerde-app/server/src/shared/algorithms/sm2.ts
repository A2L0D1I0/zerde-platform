export interface SM2Input {
  interval: number;       // Current interval in days
  repetition: number;     // Successful repetition count
  easeFactor: number;     // Ease factor (default 2.5)
  grade: number;          // Quality rating 0..5 (0-2: failure, 3-5: success)
}

export interface SM2Result {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: string;        // YYYY-MM-DD
}

export function calculateSM2(input: SM2Input, now: Date = new Date()): SM2Result {
  const { grade } = input;
  let { interval, repetition, easeFactor } = input;

  if (grade >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  const dueDate = nextDate.toISOString().split('T')[0];

  return {
    interval,
    repetition,
    easeFactor: Math.round(easeFactor * 100) / 100,
    dueDate,
  };
}
