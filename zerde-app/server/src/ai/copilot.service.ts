import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { CoPilotQuestionGenSchema, CoPilotQuestionGenResult } from './schemas';
import { sanitizeJsonString, callGeminiApi } from './sanitize-json';
import { getDb } from '../db/database';

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
   * Single-Turn Quiz Generator for Teacher
   * Returns strictly validated CoPilotQuestionGenResult (Zod validated with Zero-Fake Honest Throw)
   */
  public async generateQuiz(params: GenerateQuizParams): Promise<CoPilotQuestionGenResult> {
    const { topic_title, grade_level = 9, count = 3, focus = '', language = 'KZ' } = params;

    // 1. Honest error if no API key configured
    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
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

      const textResponse = await callGeminiApi(activeModel, activeKey!, {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });

      const parsedJson = JSON.parse(sanitizeJsonString(textResponse));
      
      // 3. Strict Zod Validation
      const validated = CoPilotQuestionGenSchema.parse(parsedJson);
      return validated;

    } catch (err) {
      console.error(`[CoPilot] Error in AI generation:`, (err as Error).message);
      throw err;
    }
  }

  /**
   * Generates 4-quarter Markdown curriculum plan (КТП) grounded in the 5 uploaded course material slots
   */
  public async generateCurriculumPlan(params: {
    courseId: number;
    classroomId?: number;
    quarter?: number;
    language?: 'KZ' | 'RU' | 'EN';
  }): Promise<{
    markdown_plan: string;
    quarter: number;
    version: number;
    slots_used_count: number;
  }> {
    const { courseId, classroomId, quarter = 1, language = 'KZ' } = params;

    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
    }

    const db = getDb();
    const cid = Number(courseId);

    // 1. Fetch course
    const course = db.prepare('SELECT id, title, subject_type FROM courses WHERE id = ?').get(cid) as any;
    if (!course) {
      throw new Error(`COURSE_NOT_FOUND: Курс табылмады (Course #${courseId} not found)`);
    }

    // 2. Fetch 5 material slots
    const slots = db.prepare(`
      SELECT slot_number, title, file_type, content_text
      FROM course_material_slots
      WHERE course_id = ? AND (classroom_id = ? OR classroom_id IS NULL)
      ORDER BY slot_number ASC
    `).all(cid, classroomId || null) as any[];

    const slotsContext = slots.map(s => `
=== SLOT ${s.slot_number}: ${s.title} (${s.file_type}) ===
${s.content_text || '[Empty slot]'}
`).join('\n\n');

    try {
      const activeKey = this.getApiKey();
      const activeModel = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || this.modelName;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

      const systemPrompt = `You are Zerde Teacher Co-Pilot (Second Brain Agent).
Ground your planning strictly on the uploaded material slots.
Language: ${language.toUpperCase()}.
Task: Generate a detailed, highly professional academic curriculum plan (КТП) in Markdown format for Course "${course.title}", Quarter ${quarter}.
Include:
- Course Overview & Objectives
- Week-by-week topic schedule (Weeks 1 to 10)
- Learning descriptors (ГОСО goals)
- Formative & Summative assessment dates (БЖБ / ТЖБ)
- Descriptors of expected outcomes.`;

      const userContent = `COURSE: "${course.title}" (${course.subject_type})
QUARTER: ${quarter}

UPLOADED MATERIAL SLOTS:
${slotsContext || 'No custom materials uploaded. Use standard national curriculum (ГОСО Республики Казахстан).'}

Generate complete structured Markdown curriculum plan.`;

      const markdownPlan = await callGeminiApi(activeModel, activeKey!, {
        contents: [{ parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.2
        }
      });

      return {
        markdown_plan: markdownPlan.trim(),
        quarter,
        version: 1,
        slots_used_count: slots.length
      };

    } catch (err) {
      console.error('[CoPilotService] Curriculum plan generation error:', (err as Error).message);
      throw err;
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

    const skillName = topDeficit.skill_code.replace(/_/g, ' ');
    const insightText = language === 'RU'
      ? `Дефицит «${skillName}»: зафиксировано ${topDeficit.error_count} ошибок. Рекомендуется разобрать типовые решения на уроке.`
      : language === 'EN'
      ? `Deficit "${skillName}": recorded ${topDeficit.error_count} errors. Recommended to review foundational principles in class.`
      : `«${skillName}» бойынша ${topDeficit.error_count} қате тіркелді. Келесі сабақта осы тақырыптың негізгі ережелерін қайталау ұсынылады.`;

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
