import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { SilentGraderResponseSchema, SilentGraderResponse } from './schemas';
import { sanitizeJsonString, callGeminiApi } from './sanitize-json';
import { getDb } from '../db/database';

dotenv.config();

export interface SilentGraderParams {
  studentId?: number;
  questionId?: number;
  questionText: string;
  solutionModel: string;
  studentResponse: string;
  language?: 'KZ' | 'RU' | 'EN';
}

export class SilentGraderService {
  private apiKey: string | null = null;
  private modelName: string = 'gemini-2.5-flash';
  private systemPromptTemplate: string = '';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || null;
    this.modelName = process.env.GEMINI_GRADER_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.loadSystemPrompt();
  }

  private loadSystemPrompt(): void {
    const promptPath = path.resolve(__dirname, 'prompts/silent_grader.md');
    try {
      if (fs.existsSync(promptPath)) {
        this.systemPromptTemplate = fs.readFileSync(promptPath, 'utf-8');
      }
    } catch (e) {
      this.systemPromptTemplate = '';
    }
  }

  public getApiKey(): string | null {
    const envKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? process.env.AI_API_KEY;
    if (envKey !== undefined) return envKey;
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 5 && !key.includes('placeholder') && !key.includes('your_'));
  }

  private cleanJson(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    cleaned = cleaned.trim();
    // Fix unescaped backslashes in LaTeX strings inside JSON (e.g. \in, \le, \ge, \frac)
    cleaned = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
    return cleaned;
  }

  /**
   * Evaluates student's open-ended Type B solution against the reference solution_model.
   * Generates technical_rationale strictly in English for neural precision.
   */
  public async evaluateSolution(params: SilentGraderParams): Promise<SilentGraderResponse> {
    const {
      studentId,
      questionId,
      questionText,
      solutionModel,
      studentResponse,
      language = 'KZ'
    } = params;

    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
    }

    try {
      const activeKey = this.getApiKey();
      const activeModel = process.env.GEMINI_GRADER_MODEL || process.env.GEMINI_MODEL || this.modelName;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

      const systemPrompt = this.systemPromptTemplate || `You are Zerde Silent Grader.
Compare student solution against reference solution_model.
technical_rationale MUST BE IN PURE ENGLISH.
feedback_for_student in ${language}.
XP: FULL_CREDIT=15, PARTIAL_CREDIT=7, MINIMAL_CREDIT=3, CHEAT_PENALTY=-20.`;

      const userContent = `TASK STATEMENT:
${questionText}

REFERENCE SOLUTION MODEL:
${solutionModel}

STUDENT SUBMITTED SOLUTION:
${studentResponse}

TARGET LANGUAGE FOR STUDENT FEEDBACK: ${language.toUpperCase()}

Evaluate thoroughly and return RAW JSON matching SilentGraderResponseSchema:
{
  "score_xp": number,
  "verdict": "FULL_CREDIT" | "PARTIAL_CREDIT" | "MINIMAL_CREDIT" | "CHEAT_PENALTY",
  "technical_rationale": "Detailed mathematical justification in English",
  "feedback_for_student": "Encouraging feedback in ${language}",
  "anti_cheat_flag": boolean
}`;

      const text = await callGeminiApi(activeModel, activeKey!, {
        contents: [{ parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(sanitizeJsonString(text));
      const validated = SilentGraderResponseSchema.parse(parsed);

      // Log in system_audit_logs if db available
      try {
        const db = getDb();
        db.prepare(`
          INSERT INTO system_audit_logs (actor_user_id, actor_role, target_user_id, event_type, payload_json, elo_delta)
          VALUES (?, 'ai', ?, 'SILENT_GRADER_EVAL', ?, ?)
        `).run(
          studentId || null,
          studentId || null,
          JSON.stringify({
            questionId,
            verdict: validated.verdict,
            score_xp: validated.score_xp,
            technical_rationale: validated.technical_rationale
          }),
          validated.score_xp
        );
      } catch (e) {
        // Non-blocking log
      }

      return validated;

    } catch (err) {
      console.error('[SilentGraderService] Evaluation error:', (err as Error).message);
      throw err;
    }
  }
}

export const silentGraderService = new SilentGraderService();
export default silentGraderService;
