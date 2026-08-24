import dotenv from 'dotenv';
import { SocraticResponseSchema, SocraticResponse } from './schemas';
import { FallbackEngine } from './fallback-engine';

dotenv.config();

export interface SocraticPromptParams {
  studentAnswer?: string;
  topicTitle: string;
  currentElo?: number;
  language?: 'KZ' | 'RU' | 'EN';
  isSecondMistake?: boolean;
  selectedForkKey?: 'A' | 'B' | 'C';
}

export class SocraticService {
  private apiKey: string | null = null;
  private modelName: string = 'gemini-2.5-flash';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || null;
    this.modelName = process.env.GEMINI_STUDENT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
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
   * Generates Socratic guidance from "Aga" with 3 Thought-Forks in pure literary Kazakh/Russian
   */
  public async generateGuidance(params: SocraticPromptParams): Promise<SocraticResponse> {
    const {
      studentAnswer = '',
      topicTitle = 'Квадраттық теңсіздіктер',
      currentElo = 1000,
      language = 'KZ',
      isSecondMistake = false,
      selectedForkKey
    } = params;

    const lang = language.toUpperCase() as 'KZ' | 'RU' | 'EN';

    // 1. Immediate Fallback if no valid API key
    if (!this.hasApiKey()) {
      return FallbackEngine.getSocraticResponse(topicTitle, lang, currentElo, isSecondMistake);
    }

    try {
      const activeKey = this.getApiKey();
      const activeModel = process.env.GEMINI_STUDENT_MODEL || process.env.GEMINI_MODEL || this.modelName;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

      const systemPrompt = `You are "Aga" (Аға), a wise Socratic mentor for Kazakhstan school students on Zerde platform.
Language: ${lang === 'KZ' ? 'Pristine literary Kazakh (Қазақ тілі, без машинного перевода)' : lang === 'RU' ? 'Russian with academic clarity' : 'English'}.
Topic: "${topicTitle}".
Student's prior response/error: "${studentAnswer || 'Сұраққа жауап іздеуде'}".
Is second mistake after guidance: ${isSecondMistake}.
Selected thought-fork: ${selectedForkKey || 'None'}.

RULES:
1. NEVER give direct answers or write out the complete calculation unless isSecondMistake is true.
2. Structure output as STRICT RAW JSON adhering to this exact format:
{
  "question_line": "1-2 short lines of encouraging guiding question in ${lang}",
  "thought_forks": [
    {
      "key": "A",
      "id": "fork_correct",
      "title": "True next logical step title",
      "type": "true_step",
      "description": "Clear explanation of this step in ${lang}",
      "latex": "Formula like x^2 - 5x + 6 = 0"
    },
    {
      "key": "B",
      "id": "fork_trap",
      "title": "Common cognitive misconception/trap title",
      "type": "cognitive_trap",
      "description": "Explanation why this is a common pitfall in ${lang}",
      "latex": "Negative sign trap formula"
    },
    {
      "key": "C",
      "id": "fork_rule",
      "title": "Fundamental textbook rule title",
      "type": "basic_rule",
      "description": "Core definition or theorem in ${lang}",
      "latex": "Definition formula"
    }
  ],
  "reveal_answer": ${isSecondMistake},
  "correct_answer_explanation": "${isSecondMistake ? 'Short summary of correct logic' : ''}",
  "is_eureka": false,
  "elo_delta": 0,
  "feedback_message": "Ынталандыру сөзі (Encouragement in ${lang})",
  "new_elo": ${currentElo}
}
3. Always include LaTeX formulas enclosed without extra escapes.
4. Output ONLY valid JSON, no markdown outside the JSON block.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        console.warn(`[SocraticService] Gemini error (${response.status}), switching to Zero-Crash Fallback`);
        return FallbackEngine.getSocraticResponse(topicTitle, lang, currentElo, isSecondMistake);
      }

      const rawData = await response.json() as any;
      const text = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return FallbackEngine.getSocraticResponse(topicTitle, lang, currentElo, isSecondMistake);
      }

      const parsed = JSON.parse(this.cleanJson(text));
      
      // Strict Zod Validation
      const validated = SocraticResponseSchema.parse({
        ...parsed,
        new_elo: currentElo
      });

      return validated;

    } catch (err) {
      console.warn('[SocraticService] AI generation exception, activating Zero-Crash Fallback:', (err as Error).message);
      return FallbackEngine.getSocraticResponse(topicTitle, lang, currentElo, isSecondMistake);
    }
  }
}

export const socraticService = new SocraticService();
export default socraticService;
