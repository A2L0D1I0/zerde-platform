import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { NavigatorAdviceSchema, NavigatorAdvice } from './schemas';
import { sanitizeJsonString, callGeminiApi } from './sanitize-json';
import { getDb } from '../db/database';

dotenv.config();

export interface NavigatorParams {
  studentId: number;
  language?: 'KZ' | 'RU' | 'EN';
}

export class NavigatorService {
  private apiKey: string | null = null;
  private modelName: string = 'gemini-2.5-flash';
  private systemPromptTemplate: string = '';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || null;
    this.modelName = process.env.GEMINI_NAVIGATOR_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.loadSystemPrompt();
  }

  private loadSystemPrompt(): void {
    const promptPath = path.resolve(__dirname, 'prompts/navigator.md');
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
   * Synthesizes cross-subject passports and generates 1 focal daily advice card for student dashboard
   */
  public async generateDailyAdvice(params: NavigatorParams): Promise<NavigatorAdvice> {
    const { studentId, language = 'KZ' } = params;

    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
    }

    const db = getDb();

    // 1. Fetch student info
    const student = db.prepare('SELECT id, full_name, grade, streak_days FROM users WHERE id = ?').get(studentId) as any;
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: Оқушы табылмады (Student #${studentId} not found)`);
    }

    // 2. Fetch all subpassports
    const subpassports = db.prepare(`
      SELECT scp.course_id, c.title as course_title, scp.subject_elo, scp.rank_tier, scp.skills_progress_json, scp.teacher_daily_notes_json
      FROM student_course_passports scp
      JOIN courses c ON scp.course_id = c.id
      WHERE scp.student_id = ?
    `).all(studentId) as any[];

    try {
      const activeKey = this.getApiKey();
      const activeModel = process.env.GEMINI_NAVIGATOR_MODEL || process.env.GEMINI_MODEL || this.modelName;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

      const systemPrompt = this.systemPromptTemplate || `You are Zerde Navigator ("Aga").
Synthesize student profile and course subpassports into ONE actionable daily focus recommendation.
Language: ${language.toUpperCase()}.`;

      const userContext = `STUDENT PROFILE:
- Name: ${student.full_name}
- Grade: ${student.grade || 9}
- Current Streak: ${student.streak_days} days

ENROLLED SUBJECT SUBPASSPORTS:
${subpassports.map((p, idx) => `
[Course #${p.course_id}: ${p.course_title}]
- Subject ELO: ${p.subject_elo} (${p.rank_tier})
- Skills Breakdown: ${p.skills_progress_json}
- Recent Teacher Notes: ${p.teacher_daily_notes_json}
`).join('\n') || 'No subpassports registered yet. Default subject: Course #1 (Алгебра).'}

TARGET LANGUAGE: ${language.toUpperCase()}

Generate 1 focal advice and return RAW JSON matching NavigatorAdviceSchema:
{
  "greeting": "Personal greeting in ${language}",
  "primary_focus_course_id": number,
  "recommended_topic_title": "Specific topic title",
  "rationale": "Clear why-explanation in ${language}",
  "encouragement": "Empathetic motivation quote in ${language}"
}`;

      const text = await callGeminiApi(activeModel, activeKey!, {
        contents: [{ parts: [{ text: userContext }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(sanitizeJsonString(text));
      const validated = NavigatorAdviceSchema.parse({
        ...parsed,
        primary_focus_course_id: parsed.primary_focus_course_id || subpassports[0]?.course_id || 1
      });

      return validated;

    } catch (err) {
      console.warn('[NavigatorService] Advice generation exception (using resilient fallback):', (err as Error).message);
      const courseId = subpassports[0]?.course_id || 1;
      const courseTitle = subpassports[0]?.course_title || 'Алгебра 9';

      return {
        greeting: language === 'RU' 
          ? `С возвращением, ${student.full_name || 'ученик'}! Готовы продолжить покорение вершин знаний?`
          : language === 'EN'
          ? `Welcome back, ${student.full_name || 'student'}! Ready to level up your mastery today?`
          : `Қош келдіңіз, ${student.full_name || 'оқушы'}! Бүгін білім шыңын бірге бағындырайық!`,
        primary_focus_course_id: courseId,
        recommended_topic_title: 'Квадраттық теңсіздіктерді шешу',
        rationale: language === 'RU'
          ? `Рекомендуем закрепить ключевой навык интервалов по курсу «${courseTitle}» для повышения ELO рейтинга.`
          : language === 'EN'
          ? `We recommend practicing intervals in "${courseTitle}" to boost your ELO rating.`
          : `«${courseTitle}» курсы бойынша интервалдар әдісін пысықтап, ELO рейтингіңізді көтеруді ұсынамыз.`,
        encouragement: language === 'RU'
          ? 'Каждая решенная задача приближает вас к новому рангу!'
          : language === 'EN'
          ? 'Every solved challenge brings you closer to the next mastery tier!'
          : 'Әрбір дұрыс қадам — келесі дәрежеге бастайтын даңғыл жол!'
      };
    }
  }
}

export const navigatorService = new NavigatorService();
export default navigatorService;
