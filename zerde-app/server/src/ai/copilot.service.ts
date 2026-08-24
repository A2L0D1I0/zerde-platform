import dotenv from 'dotenv';
import { CoPilotQuestionGenSchema, CoPilotQuestionGenResult } from './schemas';
import { FallbackEngine } from './fallback-engine';

dotenv.config();

export interface GenerateQuizParams {
  topic_title: string;
  grade_level?: number;
  count?: number;
  focus?: string;
  language?: 'KZ' | 'RU' | 'EN';
}

export class CoPilotService {
  private apiKey: string | null = null;
  private modelName: string = 'gemini-2.5-flash';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || null;
    this.modelName = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  public getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || this.apiKey;
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
    return cleaned.trim();
  }

  /**
   * Single-Turn Quiz Generator for Teacher
   * Returns strictly validated CoPilotQuestionGenResult (Zod validated with Zero-Crash Fallback)
   */
  public async generateQuiz(params: GenerateQuizParams): Promise<CoPilotQuestionGenResult> {
    const { topic_title, grade_level = 9, count = 3, focus = '', language = 'KZ' } = params;

    // 1. If no API key configured, use deterministic Fallback Engine immediately
    if (!this.hasApiKey()) {
      return FallbackEngine.getQuestions(topic_title, language, count);
    }

    try {
      // 2. Call Google Gemini REST endpoint directly with structured prompt
      const activeKey = this.getApiKey();
      const activeModel = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || this.modelName;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;
      
      const systemPrompt = `You are Zerde Teacher Co-Pilot. Generate a structured set of multiple-choice questions for grade ${grade_level} on topic "${topic_title}".
Target language: ${language.toUpperCase()}.
Specific pedagogical focus: ${focus || 'General assessment'}.
Number of questions: ${count}.

RULES:
1. Format output as STRICT RAW JSON adhering to this exact schema:
{
  "topic_title": "${topic_title}",
  "questions": [
    {
      "question_text": "Question statement in ${language}",
      "katex_snippet": "Relevant LaTeX formula like x^2 - 4 <= 0",
      "options": [
        { "id": "A", "text": "Option A text", "latex": "Optional LaTeX" },
        { "id": "B", "text": "Option B text", "latex": "Optional LaTeX" },
        { "id": "C", "text": "Option C text", "latex": "Optional LaTeX" },
        { "id": "D", "text": "Option D text", "latex": "Optional LaTeX" }
      ],
      "correct_answer": "A",
      "explanation": "Clear step-by-step mathematical reasoning in ${language}",
      "difficulty": 2,
      "skill_code": "ALG_09_INEQ"
    }
  ]
}
2. Include at least 4 options per question. One option MUST be the correct_answer id.
3. NEVER return markdown explanations outside the JSON block. Return ONLY the JSON.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        console.warn(`[CoPilot] Gemini API error (${response.status}): falling back to FallbackEngine`);
        return FallbackEngine.getQuestions(topic_title, language, count);
      }

      const rawData = await response.json() as any;
      const textResponse = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        return FallbackEngine.getQuestions(topic_title, language, count);
      }

      const parsedJson = JSON.parse(this.cleanJson(textResponse));
      
      // 3. Strict Zod Validation
      const validated = CoPilotQuestionGenSchema.parse(parsedJson);
      return validated;

    } catch (err) {
      console.warn(`[CoPilot] Error in AI generation, activating Zero-Crash Fallback:`, (err as Error).message);
      return FallbackEngine.getQuestions(topic_title, language, count);
    }
  }

  /**
   * Generates 1 concise AI insight card for teacher based on SQL aggregated deficits
   */
  public async generateClassInsight(params: {
    classroomName: string;
    topDeficit: { skill_code: string; error_count: number } | null;
    totalStudents: number;
    language?: 'KZ' | 'RU' | 'EN';
  }): Promise<{ has_data: boolean; insight: string; top_skill?: string; error_count?: number }> {
    const { classroomName, topDeficit, totalStudents, language = 'KZ' } = params;

    if (!topDeficit || topDeficit.error_count === 0) {
      const msg = language === 'RU'
        ? `В классе «${classroomName}» (${totalStudents} уч.) пока не зафиксировано системных дефицитов.`
        : language === 'EN'
        ? `Class "${classroomName}" (${totalStudents} students) has no recorded systemic deficits yet.`
        : `«${classroomName}» сыныбында (${totalStudents} оқушы) әзірге жүйелі қателіктер тіркелмеген.`;
      
      return {
        has_data: false,
        insight: msg
      };
    }

    // Generate insight from Fallback or simple format
    const insightText = FallbackEngine.getClassInsight(topDeficit.skill_code, topDeficit.error_count, language);

    return {
      has_data: true,
      insight: insightText,
      top_skill: topDeficit.skill_code,
      error_count: topDeficit.error_count
    };
  }
}

export const copilotService = new CoPilotService();
export default copilotService;
