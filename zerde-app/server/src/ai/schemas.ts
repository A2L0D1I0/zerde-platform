import { z } from 'zod';

/**
 * Zod Schema for individual question option in Micro Co-Pilot
 */
export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  latex: z.string().optional()
});

/**
 * Zod Schema for a single generated question item in Micro Co-Pilot (Single-Turn)
 */
export const CoPilotQuestionItemSchema = z.object({
  question_text: z.string().min(5, 'Question text must be at least 5 characters'),
  katex_snippet: z.string().optional().default(''),
  options: z.array(QuestionOptionSchema).min(2).max(8),
  correct_answer: z.string().min(1, 'Correct answer identifier or text is required'),
  explanation: z.string().min(5, 'Explanation must be at least 5 characters'),
  difficulty: z.number().int().min(1).max(5).default(2),
  skill_code: z.string().default('ALG_09_INEQ')
});

/**
 * Zod Schema for Micro Co-Pilot Single-Turn Quiz Generation response
 */
export const CoPilotQuestionGenSchema = z.object({
  topic_title: z.string().min(2),
  questions: z.array(CoPilotQuestionItemSchema).min(1).max(5)
});

export type CoPilotQuestionItem = z.infer<typeof CoPilotQuestionItemSchema>;
export type CoPilotQuestionGenResult = z.infer<typeof CoPilotQuestionGenSchema>;

/**
 * Zod Schema for Co-Pilot Agent Response (Second Brain with 5 Slots & Markdown Plan)
 */
export const CoPilotGeneratedQuestionItemSchema = z.object({
  question_kz: z.string().min(5),
  question_ru: z.string().optional(),
  katex_snippet: z.string().optional().default(''),
  options: z.array(QuestionOptionSchema).min(2).max(8),
  correct_answer: z.string().min(1),
  explanation_kz: z.string().min(5),
  difficulty: z.number().int().min(1).max(5).default(2),
  skill_code: z.string().default('ALG_09_INEQ')
});

export const CoPilotAgentResponseSchema = z.object({
  chat_reply: z.string().min(5),
  suggested_plan_markdown: z.string().optional(),
  generated_quiz: z.object({
    topic_title: z.string().min(2),
    target_student_ids: z.array(z.number()).optional(),
    questions: z.array(CoPilotGeneratedQuestionItemSchema)
  }).optional()
});

export type CoPilotAgentResponse = z.infer<typeof CoPilotAgentResponseSchema>;

/**
 * Zod Schema for Silent Grader (Mode B Evaluator against Solution Model)
 * Note: technical_rationale is strictly in English
 */
export const SilentGraderResponseSchema = z.object({
  score_xp: z.number().int(),
  verdict: z.enum(['FULL_CREDIT', 'PARTIAL_CREDIT', 'MINIMAL_CREDIT', 'CHEAT_PENALTY']),
  technical_rationale: z.string().min(5),
  feedback_for_student: z.string().min(5),
  anti_cheat_flag: z.boolean().default(false)
});

export type SilentGraderResponse = z.infer<typeof SilentGraderResponseSchema>;

/**
 * Zod Schema for Student Navigator Companion («Аға» Dashboard Mode)
 */
export const NavigatorAdviceSchema = z.object({
  greeting: z.string().min(3),
  primary_focus_course_id: z.number().int(),
  recommended_topic_title: z.string().min(2),
  rationale: z.string().min(5),
  encouragement: z.string().min(3)
});

export type NavigatorAdvice = z.infer<typeof NavigatorAdviceSchema>;

/**
 * Zod Schema for individual Thought-Fork in Socrates "Aga"
 */
export const ThoughtForkSchema = z.object({
  key: z.enum(['A', 'B', 'C']),
  id: z.enum(['fork_correct', 'fork_trap', 'fork_rule']).optional(),
  title: z.string().min(2),
  type: z.enum(['true_step', 'cognitive_trap', 'basic_rule']),
  description: z.string().min(3),
  latex: z.string().optional()
});

export type ThoughtFork = z.infer<typeof ThoughtForkSchema>;

/**
 * Zod Schema for Socrates "Aga" Thought-Forks response
 */
export const SocraticResponseSchema = z.object({
  question_line: z.string().min(5),
  thought_forks: z.array(ThoughtForkSchema).length(3),
  reveal_answer: z.boolean().default(false),
  correct_answer_explanation: z.string().optional(),
  is_eureka: z.boolean().default(false),
  elo_delta: z.number().int().default(0),
  feedback_message: z.string().optional().default(''),
  new_elo: z.number().int().optional()
});

export type SocraticResponse = z.infer<typeof SocraticResponseSchema>;
