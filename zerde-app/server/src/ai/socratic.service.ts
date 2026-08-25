import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { SocraticResponseSchema, SocraticResponse } from './schemas';
import { sanitizeJsonString, callGeminiApi } from './sanitize-json';

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
  private systemPromptTemplate: string = '';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || null;
    this.modelName = process.env.GEMINI_STUDENT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.loadSystemPrompt();
  }

  private loadSystemPrompt(): void {
    const promptPath = path.resolve(__dirname, 'prompts/socratic_aga.md');
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

    // 1. Honest error if no valid API key
    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
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

      const text = await callGeminiApi(activeModel, activeKey!, {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(sanitizeJsonString(text));
      
      // Strict Zod Validation
      const validated = SocraticResponseSchema.parse({
        ...parsed,
        new_elo: currentElo
      });

      return validated;

    } catch (err) {
      console.warn('[SocraticService] AI generation exception (using resilient fallback):', (err as Error).message);
      return {
        question_line: language === 'RU' 
          ? `Давайте проанализируем шаги решения по теме «${topicTitle}». В каком месте возникло сомнение?` 
          : language === 'EN'
          ? `Let's analyze the steps for "${topicTitle}". Where did the difficulty arise?`
          : `«${topicTitle}» тақырыбы бойынша шешім қадамдарын талдайық. Қай жерден қателестіңіз?`,
        thought_forks: [
          {
            key: 'A',
            id: 'fork_correct',
            title: language === 'RU' ? 'Ключевая подсказка' : language === 'EN' ? 'Key Hint' : 'Негізгі бағыттаушы көмек',
            type: 'true_step',
            description: language === 'RU' ? 'Проверьте знаки коэффициентов и интервалы' : language === 'EN' ? 'Check coefficient signs and intervals' : 'Коэффициенттердің таңбасын және аралықтарды тексеріңіз',
            latex: 'D = b^2 - 4ac'
          },
          {
            key: 'B',
            id: 'fork_trap',
            title: language === 'RU' ? 'Типичная ловушка' : language === 'EN' ? 'Common Pitfall' : 'Жиі кездесетін қате',
            type: 'cognitive_trap',
            description: language === 'RU' ? 'Осторожно с делением на отрицательное число' : language === 'EN' ? 'Be careful when dividing by negative numbers' : 'Теріс санға бөлгенде теңсіздік таңбасы өзгереді',
            latex: '-x < 5 \\implies x > -5'
          },
          {
            key: 'C',
            id: 'fork_rule',
            title: language === 'RU' ? 'Правило из учебника' : language === 'EN' ? 'Standard Rule' : 'Оқулық ережесі',
            type: 'basic_rule',
            description: language === 'RU' ? 'Интервалы определяются корнями трехчлена' : language === 'EN' ? 'Intervals are determined by polynomial roots' : 'Интервалдар нөлдер арқылы анықталады',
            latex: 'f(x) = 0'
          }
        ],
        reveal_answer: Boolean(isSecondMistake),
        correct_answer_explanation: isSecondMistake ? 'Дұрыс шешім интервалдар әдісі арқылы анықталады.' : '',
        is_eureka: false,
        elo_delta: 0,
        feedback_message: (err as any)?.message?.includes('429')
          ? (language === 'RU'
              ? '⚠️ Модель gemini-2.5-flash временно недоступна (Превышен лимит запросов, Код ошибки: 429 Too Many Requests).'
              : language === 'EN'
              ? '⚠️ Model gemini-2.5-flash is temporarily unavailable (Rate limit exceeded, Error code: 429 Too Many Requests).'
              : '⚠️ Модель gemini-2.5-flash уақытша қолжетімсіз (Сұраныстар шегі асып кетті, Қате коды: 429 Too Many Requests).')
          : (language === 'RU' ? 'Продолжайте размышлять!' : language === 'EN' ? 'Keep thinking!' : 'Ойлануды жалғастырыңыз!'),
        new_elo: currentElo
      };
    }
  }
}

export const socraticService = new SocraticService();
export default socraticService;
