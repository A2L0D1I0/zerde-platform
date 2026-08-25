import { z } from 'zod';

export const ThoughtForkTypeSchema = z.enum([
  'true_step',       // Развилка A: истинный следующий шаг
  'cognitive_trap',  // Развилка B: когнитивная ловушка/заблуждение
  'basic_rule',      // Развилка C: базовое правило/определение
]);

export const ThoughtForkSchema = z.object({
  key: z.enum(['A', 'B', 'C']),
  title: z.string(),
  type: ThoughtForkTypeSchema,
  description: z.string(),
  latex: z.string().optional(),
  zvdsl: z.any().optional(),
});

export const SocraticDialogueMessageSchema = z.object({
  role: z.enum(['student', 'aga', 'system']),
  text: z.string(),
  forkKey: z.string().optional(),
});

export const SocraticRequestSchema = z.object({
  topicId: z.string().default('general'),
  questionId: z.string().optional(),
  studentAnswer: z.string(),
  dialogueHistory: z.array(SocraticDialogueMessageSchema).default([]),
  currentElo: z.number().default(1200),
  language: z.enum(['kz', 'ru', 'en']).default('kz'),
  consecutiveErrors: z.number().default(0),
});

export const SocraticResponseSchema = z.object({
  question_line: z.string(),
  thought_forks: z.array(ThoughtForkSchema).length(3), // Строго 3 развилки!
  elo_delta: z.number().int(),
  is_eureka: z.boolean().default(false),
  is_jailbreak: z.boolean().default(false),
  anti_stuck_active: z.boolean().default(false),
  explanation: z.string().optional(),
  feedback_message: z.string(),
  new_elo: z.number().int(),
});

export const CopilotTopicItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  order_index: z.number(),
  quarter: z.number().min(1).max(4).default(3),
  sor_soch_goals: z.array(z.string()).default([]),
  descriptors: z.array(z.string()).default([]),
  zvdsl_canvas: z.any().optional(),
  questions_count: z.number().default(0),
});

export type ThoughtForkType = z.infer<typeof ThoughtForkTypeSchema>;
export type ThoughtFork = z.infer<typeof ThoughtForkSchema>;
export type SocraticDialogueMessage = z.infer<typeof SocraticDialogueMessageSchema>;
export type SocraticRequest = z.infer<typeof SocraticRequestSchema>;
export type SocraticResponse = z.infer<typeof SocraticResponseSchema>;
export type CopilotTopicItem = z.infer<typeof CopilotTopicItemSchema>;
