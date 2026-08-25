import { z } from 'zod';

export const EloRankCodeSchema = z.enum(['OSKIN', 'TUGYR', 'QYRAN', 'SAMGAU']);

export const StudentProfileSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.literal('student'),
  grade: z.string().default(''),
  school: z.string().default(''),
  elo: z.number().int().default(1000),
  rank: EloRankCodeSchema.default('OSKIN'),
  streak_days: z.number().int().default(0),
  longest_streak: z.number().int().default(0),
  coins: z.number().int().default(0),
  avatar_url: z.string().optional(),
});

export const TaskSubmissionSchema = z.object({
  taskId: z.string(),
  studentId: z.union([z.string(), z.number()]),
  answer: z.string().min(1),
  hintsUsed: z.number().int().nonnegative().default(0),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
});

export const TaskResultSchema = z.object({
  isCorrect: z.boolean(),
  eloDelta: z.number().int(),
  newRating: z.number().int(),
  newRank: EloRankCodeSchema,
  feedback: z.string(),
  streakEarned: z.boolean(),
});

export const HeatmapDaySchema = z.object({
  date: z.string(), // YYYY-MM-DD
  tasksCompleted: z.number().int().default(0),
  level: z.number().int().min(0).max(4).default(0),
});

export const LeaderboardEntrySchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  grade: z.string(),
  school: z.string(),
  elo: z.number(),
  rankCode: EloRankCodeSchema,
  streakDays: z.number(),
  masteredCount: z.number().default(0),
  isCurrentUser: z.boolean().default(false),
  rank: z.number().int().positive(),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type TaskSubmission = z.infer<typeof TaskSubmissionSchema>;
export type TaskResult = z.infer<typeof TaskResultSchema>;
export type HeatmapDay = z.infer<typeof HeatmapDaySchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
