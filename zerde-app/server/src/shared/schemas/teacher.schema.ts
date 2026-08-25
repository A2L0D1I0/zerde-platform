import { z } from 'zod';

export const SkillStatusSchema = z.enum(['mastered', 'in_progress', 'deficit']);

export const SkillMetaSchema = z.object({
  code: z.string(),
  nameKZ: z.string(),
  nameRU: z.string(),
  subject: z.string(),
});

export const SkillMasterySchema = z.object({
  probability: z.number().min(0).max(1),
  status: SkillStatusSchema,
  attemptsCount: z.number().int().default(0),
  lastAttemptCorrect: z.boolean().optional(),
});

export const ClassMatrixStudentSchema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  email: z.string().email(),
  current_elo: z.number(),
  rank: z.string(),
  streak_days: z.number(),
  skills: z.record(z.string(), SkillMasterySchema),
});

export const ClusterDeficitSchema = z.object({
  skill_code: z.string(),
  skill_name_kz: z.string().default(''),
  skill_name_ru: z.string().default(''),
  misconception_kz: z.string().default(''),
  misconception_ru: z.string().default(''),
  affected_students_count: z.number().int(),
  total_students_count: z.number().int().default(24),
  percentage: z.number(),
  affected_students: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      probability: z.number(),
    })
  ).default([]),
});

export const SmartboardActivitySchema = z.object({
  title_kz: z.string(),
  title_ru: z.string(),
  exercise_text_kz: z.string(),
  exercise_text_ru: z.string(),
  solution_key: z.string(),
  explanation_kz: z.string().optional(),
  zvdsl_canvas: z.any().optional(),
  desmos_state: z.any().optional(),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      isCorrect: z.boolean(),
      votesCount: z.number().optional(),
    })
  ).optional(),
});

export const DailySignalSchema = z.object({
  signal_id: z.string(),
  signal_level: z.enum(['HIGH_ALERT', 'ATTENTION', 'NORMAL']),
  classroom_id: z.union([z.string(), z.number()]),
  classroom_name: z.string(),
  subject: z.string(),
  topic_title: z.string(),
  cluster_deficit: ClusterDeficitSchema,
  smart_board_activity: SmartboardActivitySchema,
});

export const ClassMatrixResponseSchema = z.object({
  classroom_id: z.union([z.string(), z.number()]),
  classroom_name: z.string(),
  school: z.string(),
  students_count: z.number(),
  skills_header: z.array(SkillMetaSchema),
  matrix: z.array(ClassMatrixStudentSchema),
  summary_stats: z.record(
    z.string(),
    z.object({
      average_probability: z.number(),
      deficit_count: z.number(),
      mastery_count: z.number(),
    })
  ),
});

export type SkillMeta = z.infer<typeof SkillMetaSchema>;
export type SkillMastery = z.infer<typeof SkillMasterySchema>;
export type ClassMatrixStudent = z.infer<typeof ClassMatrixStudentSchema>;
export type DailySignal = z.infer<typeof DailySignalSchema>;
export type ClassMatrixResponse = z.infer<typeof ClassMatrixResponseSchema>;
