export type SkillMasteryStatus = 'mastered' | 'in_progress' | 'deficit';

export interface StudentSkillResponse {
  isCorrect: boolean;
  slippingProb?: number; // s_j (default 0.10)
  guessingProb?: number; // g_j (default 0.20)
}

export interface DinaSkillEstimateResult {
  skillCode: string;
  probability: number;   // 0.0 - 1.0
  status: SkillMasteryStatus;
  totalAttempts: number;
  correctAttempts: number;
}

export function estimateSkillMastery(
  skillCode: string,
  responses: StudentSkillResponse[]
): DinaSkillEstimateResult {
  const total = responses.length;
  if (total === 0) {
    return {
      skillCode,
      probability: 0.5,
      status: 'in_progress',
      totalAttempts: 0,
      correctAttempts: 0,
    };
  }

  const correct = responses.filter((r) => r.isCorrect).length;

  // DINA likelihood updating with Laplace smoothing
  let priorMastery = 0.5;
  for (const resp of responses) {
    const s = resp.slippingProb ?? 0.10;
    const g = resp.guessingProb ?? 0.20;

    const pCorrectIfMastered = 1 - s;
    const pCorrectIfUnmastered = g;

    const likelihood = resp.isCorrect ? pCorrectIfMastered : s;
    const likelihoodNot = resp.isCorrect ? pCorrectIfUnmastered : 1 - g;

    const numerator = likelihood * priorMastery;
    const denominator = numerator + likelihoodNot * (1 - priorMastery);
    priorMastery = denominator > 0 ? numerator / denominator : priorMastery;
  }

  const probability = Math.round(Math.min(0.99, Math.max(0.01, priorMastery)) * 100) / 100;

  let status: SkillMasteryStatus = 'deficit';
  if (probability >= 0.70) {
    status = 'mastered';
  } else if (probability >= 0.40) {
    status = 'in_progress';
  }

  return {
    skillCode,
    probability,
    status,
    totalAttempts: total,
    correctAttempts: correct,
  };
}
