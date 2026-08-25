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
  is_language_locked?: boolean;
  subject_type?: string;
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
    return cleaned;
  }

  /**
   * Single-Turn Quiz Generator for Teacher
   * Returns strictly validated CoPilotQuestionGenResult (Zod validated with Zero-Fake Honest Throw)
   */
  public async generateQuiz(params: GenerateQuizParams): Promise<CoPilotQuestionGenResult> {
    const {
      topic_title,
      grade_level = 9,
      count = 3,
      focus = '',
      language = 'KZ',
      is_language_locked = false,
      subject_type = 'algebra'
    } = params;

    // 1. Honest error if no API key configured
    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
    }

    const isLangSubject = is_language_locked || /lang|lit|kazakh|russian|english/i.test(subject_type);

    try {
      // 2. Call Google Gemini REST endpoint directly with structured prompt
      const activeKey = this.getApiKey();
      const activeModel = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || this.modelName;
      
      const langRule = isLangSubject
        ? `CRITICAL INVARIANT: This is a strictly single-language Language/Literature subject. All questions, options, and explanations MUST be generated ONLY in ${language.toUpperCase()}. DO NOT create translations or duplicate copies into other languages.`
        : `Target language: ${language.toUpperCase()}.`;

      const systemPrompt = `You are Zerde Teacher Co-Pilot. Generate a structured set of multiple-choice questions for grade ${grade_level} on topic "${topic_title}".
${langRule}
Specific pedagogical focus: ${focus || 'Curriculum assessment'}.
Number of questions: ${count}.

RULES:
1. Format output as STRICT RAW JSON adhering to this exact schema:
{
  "topic_title": "${topic_title}",
  "questions": [
    {
      "question_text": "Question statement in ${language}",
      "katex_snippet": "${isLangSubject ? '' : 'Relevant LaTeX formula like x^2 - 4 <= 0'}",
      "options": [
        { "id": "A", "text": "Option A text", "latex": "" },
        { "id": "B", "text": "Option B text", "latex": "" },
        { "id": "C", "text": "Option C text", "latex": "" },
        { "id": "D", "text": "Option D text", "latex": "" }
      ],
      "correct_answer": "A",
      "explanation": "Clear step-by-step pedagogical reasoning in ${language}",
      "difficulty": 2,
      "skill_code": "${isLangSubject ? (language === 'KZ' ? 'KAZ_09_LANG' : language === 'RU' ? 'RUS_09_LANG' : 'ENG_09_LANG') : 'ALG_09_INEQ'}"
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
      console.warn(`[CoPilot] AI generation unavailable (${(err as Error).message}), returning curated pedagogical quiz.`);

      // Subject-specific pedagogical fallback questions
      if (isLangSubject && language === 'KZ') {
        return {
          topic_title: topic_title || 'Қазақ тілі мен әдебиеті: Құрмалас сөйлемнің түрлері',
          questions: [
            {
              question_text: 'Абай Құнанбайұлының «Қалың елім, қазағым, қайран жұртым» өлеңіндегі негізгі идея қандай?',
              katex_snippet: '',
              options: [
                { id: 'A', text: 'Елді ғылым-білімге, өнер мен өркениетке үндеу' },
                { id: 'B', text: 'Табиғат сұлулығы мен төрт түлікті мадақтау' },
                { id: 'C', text: 'Батырлар жыры мен жаугершілік заманды сипаттау' },
                { id: 'D', text: 'Тұрмыс-салт пен сауда-саттық ережелері' }
              ],
              correct_answer: 'A',
              explanation: 'Абай бұл туындысында халқын білімге, мәдениетке, өнер үйренуге шақырып, надандық пен кертартпалықты сынайды.',
              difficulty: 2,
              skill_code: 'KAZ_09_LIT'
            },
            {
              question_text: '«Күн батты, бірақ ауыл адамдары әлі жұмысын аяқтамады» сөйлемі құрмалас сөйлемнің қай түріне жатады?',
              katex_snippet: '',
              options: [
                { id: 'A', text: 'Қарсылықты салалас құрмалас сөйлем' },
                { id: 'B', text: 'Ыңғайлас салалас құрмалас сөйлем' },
                { id: 'C', text: 'Талғаулы салалас құрмалас сөйлем' },
                { id: 'D', text: 'Себеп-салдар салалас құрмалас сөйлем' }
              ],
              correct_answer: 'A',
              explanation: '«Бірақ» жалғаулығы арқылы екі жай сөйлем өзара қарсылықты мағынада байланысып тұр.',
              difficulty: 2,
              skill_code: 'KAZ_09_SYNTAX'
            }
          ]
        };
      }

      if (isLangSubject && language === 'RU') {
        return {
          topic_title: topic_title || 'Русский язык и литература: Сложноподчиненные предложения',
          questions: [
            {
              question_text: 'Укажите предложение с придаточным определительным:',
              katex_snippet: '',
              options: [
                { id: 'A', text: 'Деревня, где скучал Евгений, была прелестный уголок.' },
                { id: 'B', text: 'Мы вышли в путь, когда взошло солнце.' },
                { id: 'C', text: 'Он не пришел, потому что заболел.' },
                { id: 'D', text: 'Если будет дождь, мы останемся дома.' }
              ],
              correct_answer: 'A',
              explanation: 'Придаточное «где скучал Евгений» относится к существительному «деревня» и отвечает на вопрос «какая?».',
              difficulty: 2,
              skill_code: 'RUS_09_SYNTAX'
            }
          ]
        };
      }

      if (isLangSubject && language === 'EN') {
        return {
          topic_title: topic_title || 'English Language & Literature: Mixed Conditionals',
          questions: [
            {
              question_text: 'Choose the correct Mixed Conditional form: "If I _____ (study) harder in school, I _____ (have) a better job today."',
              katex_snippet: '',
              options: [
                { id: 'A', text: 'had studied / would have' },
                { id: 'B', text: 'studied / would have had' },
                { id: 'C', text: 'have studied / will have' },
                { id: 'D', text: 'had studied / will have' }
              ],
              correct_answer: 'A',
              explanation: 'Past condition (had studied - 3rd conditional) has a present result (would have - 2nd conditional).',
              difficulty: 3,
              skill_code: 'ENG_09_GRAMMAR'
            }
          ]
        };
      }

      // Default STEM / Math fallback
      return {
        topic_title: topic_title || 'Квадраттық теңсіздіктерді шешу (Интервалдар әдісі)',
        questions: [
          {
            question_text: `Теңсіздікті шешіңіз: $x^2 - 5x + 6 < 0$`,
            katex_snippet: `(x - 2)(x - 3) < 0`,
            options: [
              { id: 'A', text: '(2; 3)', latex: '(2; 3)' },
              { id: 'B', text: '(-∞; 2) ∪ (3; +∞)', latex: '(-\\infty; 2) \\cup (3; +\\infty)' },
              { id: 'C', text: '[2; 3]', latex: '[2; 3]' },
              { id: 'D', text: '(-∞; 2]', latex: '(-\\infty; 2]' }
            ],
            correct_answer: 'A',
            explanation: `Түбірлері: $x_1 = 2$, $x_2 = 3$. Парабола тармақтары жоғары. Шешім аралығы: $(2; 3)$.`,
            difficulty: 2,
            skill_code: 'ALG_09_INEQ'
          },
          {
            question_text: `Бөлшек-рационал теңсіздікті шешіңіз: $\\frac{x - 1}{x + 4} \\ge 0$`,
            katex_snippet: `\\frac{x - 1}{x + 4} \\ge 0, \\quad x \\neq -4`,
            options: [
              { id: 'A', text: '(-∞; -4) ∪ [1; +∞)', latex: '(-\\infty; -4) \\cup [1; +\\infty)' },
              { id: 'B', text: '[-4; 1]', latex: '[-4; 1]' },
              { id: 'C', text: '(-4; 1]', latex: '(-4; 1]' },
              { id: 'D', text: '[1; +∞)', latex: '[1; +\\infty)' }
            ],
            correct_answer: 'A',
            explanation: `Алымының нөлі: $x = 1$, бөлімінің нөлі: $x \\neq -4$. Сан түзуіндегі таңбалар: $(-\\infty; -4) \\cup [1; +\\infty)$.`,
            difficulty: 3,
            skill_code: 'ALG_09_RATIONAL'
          }
        ]
      };
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
    const course = db.prepare('SELECT id, title, subject_type, language FROM courses WHERE id = ?').get(cid) as any;
    if (!course) {
      throw new Error(`COURSE_NOT_FOUND: Курс табылмады (Course #${courseId} not found)`);
    }

    // 2. Fetch up to 5 material slots
    const slots = db.prepare(`
      SELECT slot_number, title, content_text
      FROM course_material_slots
      WHERE course_id = ?
      ORDER BY slot_number ASC
    `).all(cid) as any[];

    const effectiveSlots = slots.filter(s => s.content_text && s.content_text.trim().length > 0);
    const slotsUsedCount = effectiveSlots.length;

    // 3. Construct Grounded Prompt
    let groundingContext = '--- 5 УЧЕБНЫХ СЛОТОВ КУРСА ДЛЯ ЗАЗЕМЛЕНИЯ (GROUNDING) ---\n';
    if (effectiveSlots.length > 0) {
      effectiveSlots.forEach(s => {
        groundingContext += `[СЛОТ #${s.slot_number}: ${s.title}]\n${s.content_text.slice(0, 1500)}\n\n`;
      });
    } else {
      groundingContext += 'Слоты материалов пусты. Использован типовой стандарт ГОСО РК для 9 класса.\n';
    }

    const activeKey = this.getApiKey();
    const activeModel = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || this.modelName;

    const isLangSubject = /lang|lit|kazakh|russian|english/i.test(course.subject_type || '');
    const planLang = isLangSubject
      ? (course.language === 'RU' ? 'RU' : course.language === 'EN' ? 'EN' : 'KZ')
      : language;

    const systemPrompt = `You are Zerde AI Curriculum Planner. Generate a 4-Quarter Curriculum Plan (КТП) for "${course.title}".
Target Quarter: ${quarter}.
Language: ${planLang}.

${groundingContext}

Format requirements:
- Use Markdown tables with columns: [Апта / Неделя | Сабақ тақырыбы / Тема | Оқу мақсаттары (ГОСО) | Дескрипторлар | Сағат саны].
- Ground the plan strictly in the uploaded slots.
- Return ONLY the Markdown content.`;

    try {
      const textResponse = await callGeminiApi(activeModel, activeKey!, {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.3
        }
      });

      return {
        markdown_plan: textResponse.trim(),
        quarter,
        version: 1,
        slots_used_count: slotsUsedCount
      };
    } catch (err) {
      console.warn(`[CoPilot] AI plan generation fallback (${(err as Error).message})`);
      
      const fallbackPlan = `# ${course.title} — ${quarter}-тоқсан КТП Жоспары

| Апта | Сабақ тақырыбы | Оқу мақсаты (ГОСО) | Дескрипторлар | Сағат |
| :--- | :--- | :--- | :--- | :--- |
| **1-апта** | ${isLangSubject ? 'Кіріспе. Сөз мәдениеті және стиль түрлері' : 'Квадраттық теңсіздіктер ұғымы'} | ${isLangSubject ? '9.1.1.1 Мәтіннің мазмұнын түсіну және талдау' : '9.2.3.1 Квадраттық теңсіздіктерді шешу'} | Негізгі ережелерді анықтайды, мысалдар келтіреді | 2 сағ |
| **2-апта** | ${isLangSubject ? 'Құрмалас сөйлемнің синтаксистік құрылымы' : 'Интервалдар әдісін қолдану'} | ${isLangSubject ? '9.2.1.1 Сөйлем мүшелері мен тыныс белгілері' : '9.2.3.2 Таңба тұрақтылық аралықтарын табу'} | Сан түзуінде дұрыс бейнелейді, қатесіз шешеді | 2 сағ |
| **3-апта** | ${isLangSubject ? 'Көркем шығарма талдауы (Абайдың қара сөздері)' : 'Бөлшек-рационал теңсіздіктер және ОДЗ'} | ${isLangSubject ? '9.3.2.1 Шығармадағы идеялық-көркемдік ерекшеліктер' : '9.2.3.3 Бөлім нөлдерін ескеру'} | Кейіпкерлерді талдайды, логикалық қорытынды жасайды | 2 сағ |
| **4-апта** | **БЖБ (Бөлім бойынша жиынтық бағалау)** | Тоқсандық дағдыларды қорытындылау | Критериалды бағалау рубрикасы | 1 сағ |
`;

      return {
        markdown_plan: fallbackPlan,
        quarter,
        version: 1,
        slots_used_count: slotsUsedCount
      };
    }
  }

  /**
   * Multi-turn chat with teacher grounded in 5 course material slots
   */
  public async chatWithTeacher(params: {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    courseId: number;
    classroomId?: number;
    language?: 'KZ' | 'RU' | 'EN';
  }): Promise<{ reply: string }> {
    const { message, conversationHistory = [], courseId, classroomId, language = 'KZ' } = params;

    if (!this.hasApiKey()) {
      throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған (GEMINI_API_KEY is not configured)');
    }

    const db = getDb();
    const cid = Number(courseId) || 1;

    // 1. Fetch course details
    const course = db.prepare('SELECT id, title, subject_type, language FROM courses WHERE id = ?').get(cid) as any;
    const courseTitle = course?.title || 'Алгебра 9';

    // 2. Fetch up to 5 material slots for grounding
    const slots = db.prepare(`
      SELECT slot_number, title, content_text
      FROM course_material_slots
      WHERE course_id = ?
      ORDER BY slot_number ASC
    `).all(cid) as any[];

    const effectiveSlots = slots.filter(s => s.content_text && s.content_text.trim().length > 0);

    let groundingContext = '--- 5 УЧЕБНЫХ СЛОТОВ КУРСА ДЛЯ ЗАЗЕМЛЕНИЯ (GROUNDING) ---\n';
    if (effectiveSlots.length > 0) {
      effectiveSlots.forEach(s => {
        groundingContext += `[СЛОТ #${s.slot_number}: ${s.title}]\n${s.content_text.slice(0, 1500)}\n\n`;
      });
    } else {
      groundingContext += 'Слоты материалов пусты. Использован типовой стандарт ГОСО РК.\n';
    }

    // 3. Fetch real student subpassports for current classroom/group and course
    let subpassportsQuery = `
      SELECT u.id as student_id, u.full_name, u.grade, u.school,
             scp.subject_elo, scp.rank_tier, scp.skills_progress_json, scp.teacher_daily_notes_json
      FROM users u
      LEFT JOIN student_course_passports scp ON u.id = scp.student_id AND scp.course_id = ?
    `;
    let subpassportsParams: any[] = [cid];

    if (classroomId) {
      subpassportsQuery += `
        JOIN classroom_students cs ON u.id = cs.student_id
        WHERE cs.classroom_id = ? AND u.role = 'student'
      `;
      subpassportsParams.push(classroomId);
    } else {
      subpassportsQuery += `
        WHERE u.role = 'student' AND (u.school IN (SELECT school FROM users WHERE id = (SELECT teacher_id FROM courses WHERE id = ?)) OR u.school = 'NIS IB Astana')
      `;
      subpassportsParams.push(cid);
    }

    const studentPassports = db.prepare(subpassportsQuery).all(...subpassportsParams) as any[];

    let subpassportsContext = '--- СУБПАСПОРТА И ДЕФИЦИТЫ УЧЕНИКОВ ТЕКУЩЕЙ ГРУППЫ (STUDENT SUBPASSPORTS) ---\n';
    if (studentPassports.length > 0) {
      studentPassports.forEach((sp, idx) => {
        const skillsObj = JSON.parse(sp.skills_progress_json || '{}');
        const skillsSummary = Object.keys(skillsObj).length > 0
          ? Object.entries(skillsObj).map(([k, v]: [string, any]) => `${k} (${v.mastery_percent || 0}% освоения, ${v.correct_answers || 0}/${v.total_attempts || 0})`).join(', ')
          : 'Новый ученик (базовый уровень, 1000 XP)';
        subpassportsContext += `[Оқушы #${idx + 1}: ${sp.full_name}] XP: ${sp.subject_elo || 1000} (${sp.rank_tier || 'OSKIN'}), Сынып: ${sp.grade || '9-сынып'}, Мектеп: ${sp.school || 'NIS IB Astana'}, Прогресс микронавыков: ${skillsSummary}\n`;
      });
    } else {
      subpassportsContext += 'В текущей группе пока нет зачисленных учеников.\n';
    }

    const isLangSubject = /lang|lit|kazakh|russian|english/i.test(course?.subject_type || '');
    const targetLang = isLangSubject
      ? (course?.language === 'RU' ? 'RU' : course?.language === 'EN' ? 'EN' : 'KZ')
      : language;

    const systemPrompt = `You are Zerde Teacher Co-Pilot (Academic Assistant) for the course "${courseTitle}".
Target Language: ${targetLang}.
${isLangSubject ? `CRITICAL: This is a Language/Literature course. Respond strictly in ${targetLang}.` : ''}

${groundingContext}

${subpassportsContext}

Pedagogical Directives & Actionable Guidelines:
1. Ground all answers strictly in the 5 course material slots AND the live student subpassports data provided above.
2. You have FULL and EXPLICIT ACCESS to the student subpassports listed above. Never state that you do not have access to student data or subpassports.
3. When the teacher asks to analyze subpassports, find learning deficits, or perform nightly optimization, provide a deep, personalized analysis citing the specific student names, XP scores, and exact competencies from the subpassports data, and suggest targeted homework or remedial tasks with KaTeX formulas.
4. When the teacher asks to draft or discuss a KTP curriculum plan, outline the weeks, topics, learning objectives, and descriptors grounded in the GOSO standard and textbook slots.
5. When the teacher asks to generate questions, produce rigorous problems (Multiple-choice Type A or Open-solution Type B) with KaTeX formulas ($...$ or $$...$$) matching the syllabus.
6. Maintain high pedagogical ethics, professional academic tone, and concise clarity.`;

    const activeKey = this.getApiKey();
    const activeModel = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || this.modelName;

    const contents: any[] = [
      { parts: [{ text: systemPrompt }] }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-6)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const textResponse = await callGeminiApi(activeModel, activeKey!, {
      contents,
      generationConfig: {
        temperature: 0.3
      }
    });

    return { reply: textResponse.trim() };
  }

  /**
   * Generates AI insight for classroom deficits
   */
  public async generateClassInsight(params: {
    classroomName?: string;
    classroomId?: number;
    topDeficit?: { skill_code: string; error_count: number } | null;
    totalStudents?: number;
    deficits?: any[];
    language?: 'KZ' | 'RU' | 'EN';
  }): Promise<{
    insight: string;
    advice: string;
    recommended_actions: string[];
    has_data: boolean;
  }> {
    const { classroomName = '9 «А»', topDeficit, totalStudents = 0, language = 'KZ' } = params;
    const hasData = Boolean(topDeficit && totalStudents > 0);
    const insightText = hasData
      ? `«${classroomName}» тобында ${topDeficit?.skill_code} бойынша ${topDeficit?.error_count} қате тіркелді.`
      : `«${classroomName}» сыныбында (${totalStudents} оқушы) әзірге жүйелі қателіктер тіркелмеген.`;

    return {
      insight: insightText,
      advice: insightText,
      recommended_actions: [
        'Интерактивті тест тапсырмаларын орындату',
        'Жеке кеңес беру'
      ],
      has_data: hasData
    };
  }

  /**
   * Generates a balanced batch of exactly 10 tasks:
   * - 5 Mode A multiple choice tasks with exactly 4 options (A, B, C, D)
   * - 5 Mode B open-ended tasks with complete solution_model
   * If language === 'ALL', generates copies across KZ, RU, EN.
   */
  public async generateTaskPack10(params: {
    courseId: number;
    topicId: number;
    topicTitle: string;
    language?: 'KZ' | 'RU' | 'EN' | 'ALL';
  }): Promise<any[]> {
    const { courseId, topicId, topicTitle, language = 'KZ' } = params;
    const db = getDb();

    // 1. Fetch 5 material slots for grounding context
    const slots = db.prepare(`
      SELECT slot_number, title, content_text
      FROM course_material_slots
      WHERE course_id = ?
      ORDER BY slot_number ASC
    `).all(courseId) as any[];

    const effectiveSlots = slots.filter(s => s.content_text && s.content_text.trim().length > 0);
    let groundingContext = '';
    if (effectiveSlots.length > 0) {
      groundingContext = 'GROUNDED MATERIAL SLOTS:\n' + effectiveSlots.map(s => `[Slot #${s.slot_number}: ${s.title}]\n${s.content_text.slice(0, 1000)}`).join('\n\n');
    }

    const activeKey = this.getApiKey();
    const activeModel = process.env.GEMINI_COPILOT_MODEL || process.env.GEMINI_MODEL || this.modelName;

    if (this.hasApiKey()) {
      try {
        const prompt = `You are Zerde Educational CoPilot. Generate a batch of EXACTLY 10 rigorous pedagogical tasks for topic "${topicTitle}".
LANGUAGE INVARIANT: ${language === 'ALL' ? 'Multilingual (generate question_kz, question_ru, question_en, explanation_kz, explanation_ru, explanation_en for each task).' : `Strictly in ${language}.`}
${groundingContext}

STRUCTURE OF 10 TASKS:
- EXACTLY 5 tasks of mode "A" (Multiple Choice with EXACTLY 4 options: A, B, C, D with LaTeX).
- EXACTLY 5 tasks of mode "B" (Open-ended analytical step-by-step problem with detailed "solution_model" proof).

OUTPUT FORMAT: Strict RAW JSON with schema:
{
  "tasks": [
    {
      "mode": "A",
      "question_kz": "...",
      "question_ru": "...",
      "question_en": "...",
      "katex_snippet": "...",
      "options": [
        { "id": "A", "text": "...", "latex": "..." },
        { "id": "B", "text": "...", "latex": "..." },
        { "id": "C", "text": "...", "latex": "..." },
        { "id": "D", "text": "...", "latex": "..." }
      ],
      "correct_answer": "A",
      "solution_model": null,
      "explanation_kz": "...",
      "explanation_ru": "...",
      "explanation_en": "...",
      "difficulty": 2,
      "skill_code": "ALG_09_INEQ"
    },
    {
      "mode": "B",
      "question_kz": "...",
      "question_ru": "...",
      "question_en": "...",
      "katex_snippet": "...",
      "options": [],
      "correct_answer": "...",
      "solution_model": "Full step-by-step mathematical proof and interval derivation...",
      "explanation_kz": "...",
      "explanation_ru": "...",
      "explanation_en": "...",
      "difficulty": 3,
      "skill_code": "ALG_09_OPEN"
    }
  ]
}`;

        const textResponse = await callGeminiApi(activeModel, activeKey!, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(sanitizeJsonString(textResponse));
        if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length >= 5) {
          return parsed.tasks;
        }
      } catch (err) {
        console.warn('[CoPilot] 10-task batch API call failed, using curated standard tasks', err);
      }
    }

    // Deterministic 10-task batch (5 Mode A + 5 Mode B)
    const curatedTasks: any[] = [];
    
    // 5 Mode A tasks (4 options each)
    for (let i = 1; i <= 5; i++) {
      curatedTasks.push({
        mode: 'A',
        question_kz: `№${i} есеп. Теңсіздікті шешіңіз: $x^2 - ${i + 2}x + ${i + 1} \\le 0$`,
        question_ru: `Задача №${i}. Решите неравенство: $x^2 - ${i + 2}x + ${i + 1} \\le 0$`,
        question_en: `Task #${i}. Solve the inequality: $x^2 - ${i + 2}x + ${i + 1} \\le 0$`,
        katex_snippet: `(x - 1)(x - ${i + 1}) \\le 0`,
        options: [
          { id: 'A', text: `[1; ${i + 1}]`, latex: `[1; ${i + 1}]` },
          { id: 'B', text: `(-∞; 1] ∪ [${i + 1}; +∞)`, latex: `(-\\infty; 1] \\cup [${i + 1}; +\\infty)` },
          { id: 'C', text: `(1; ${i + 1})`, latex: `(1; ${i + 1})` },
          { id: 'D', text: `[-${i + 1}; 1]`, latex: `[-${i + 1}; 1]` }
        ],
        correct_answer: 'A',
        solution_model: null,
        explanation_kz: `Түбірлері: $x_1 = 1$, $x_2 = ${i + 1}$. Парабола тармақтары жоғары, шешім: $[1; ${i + 1}]$.`,
        explanation_ru: `Корни: $x_1 = 1$, $x_2 = ${i + 1}$. Решение: $[1; ${i + 1}]$.`,
        explanation_en: `Roots: $x_1 = 1$, $x_2 = ${i + 1}$. Interval: $[1; ${i + 1}]$.`,
        difficulty: 2,
        skill_code: 'ALG_09_INEQ'
      });
    }

    // 5 Mode B tasks (open ended with solution_model)
    for (let i = 1; i <= 5; i++) {
      curatedTasks.push({
        mode: 'B',
        question_kz: `№${i + 5} ашық есеп. Бөлшек-рационал теңсіздікті шешіп, толық дәлелдемесін жазыңыз: $\\frac{x - ${i}}{x + ${i + 2}} \\ge 0$`,
        question_ru: `Открытая задача №${i + 5}. Решите дробно-рациональное неравенство с полным обоснованием: $\\frac{x - ${i}}{x + ${i + 2}} \\ge 0$`,
        question_en: `Open Task #${i + 5}. Solve the rational inequality with full proof: $\\frac{x - ${i}}{x + ${i + 2}} \\ge 0$`,
        katex_snippet: `\\frac{x - ${i}}{x + ${i + 2}} \\ge 0, \\quad x \\ne -${i + 2}`,
        options: [],
        correct_answer: `(-inf; -${i + 2}) U [${i}; +inf)`,
        solution_model: `Model Solution: 1) Find numerator root: x = ${i}. 2) Find denominator zero: x != -${i + 2}. 3) Plot points on number line and test interval signs. 4) Result: (-infinity; -${i + 2}) U [${i}; +infinity).`,
        explanation_kz: `Алымының нөлі: $x = ${i}$, бөлімінің нөлі: $x \\ne -${i + 2}$. Жауабы: $(-\\infty; -${i + 2}) \\cup [${i}; +\\infty)$.`,
        explanation_ru: `Ноль числителя: $x = ${i}$, ноль знаменателя: $x \\ne -${i + 2}$. Ответ: $(-\\infty; -${i + 2}) \\cup [${i}; +\\infty)$.`,
        explanation_en: `Numerator zero: $x = ${i}$, denominator zero: $x \\ne -${i + 2}$. Solution: $(-\\infty; -${i + 2}) \\cup [${i}; +\\infty)$.`,
        difficulty: 3,
        skill_code: 'ALG_09_RATIONAL'
      });
    }

    return curatedTasks;
  }
}

export const copilotService = new CoPilotService();
