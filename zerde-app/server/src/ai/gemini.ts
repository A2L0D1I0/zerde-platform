import dotenv from 'dotenv';
import { SOCRATIC_AGA_SYSTEM_PROMPT, TEACHER_COPILOT_SYSTEM_PROMPT } from './prompts';
import { getDb } from '../db/database';

dotenv.config();

export class GeminiClient {
  private apiKey: string | null = null;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || null;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  private cleanJson(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned;
  }

  public getInitialGreeting(params: {
    studentName: string;
    topicTitle?: string;
    language?: 'kz' | 'ru' | 'en';
  }): { greeting: string; thought_forks: any[]; is_ai_connected: boolean } {
    const { studentName, topicTitle = 'Тақырып', language = 'kz' } = params;
    const firstName = studentName.split(' ')[0] || studentName;
    const db = getDb();
    const isAi = this.hasApiKey();

    let forks = [];
    if (language === 'ru') {
      forks = [
        { key: 'A', title: 'Определить исходные данные и условия', type: 'true_step', description: 'Внимательно анализируем условие задачи' },
        { key: 'B', title: 'Применить поспешные выводы (Ловушка)', type: 'cognitive_trap', description: 'Формула должна строго соответствовать условию' },
        { key: 'C', title: 'Вспомнить фундаментальное определение', type: 'basic_rule', description: 'Базовое правило раздела' },
      ];
    } else if (language === 'en') {
      forks = [
        { key: 'A', title: 'Identify given conditions and parameters', type: 'true_step', description: 'Carefully analyze problem constraints' },
        { key: 'B', title: 'Jump to premature conclusions (Trap)', type: 'cognitive_trap', description: 'Formula must match specific problem type' },
        { key: 'C', title: 'Recall fundamental rule/theorem', type: 'basic_rule', description: 'Core domain definition' },
      ];
    } else {
      forks = [
        { key: 'A', title: 'Есептің бастапқы шарттарын анықтау', type: 'true_step', description: 'Есептің берілгенін мұқият талдаймыз' },
        { key: 'B', title: 'Кездейсоқ формуланы қолдану (Тұзақ)', type: 'cognitive_trap', description: 'Формула тақырыпқа сай болуы керек' },
        { key: 'C', title: 'Негізгі анықтама мен ережені еске түсіру', type: 'basic_rule', description: 'Тақырыптың базалық қағидасы' },
      ];
    }

    let greeting = '';
    if (language === 'ru') {
      greeting = `Привет, ${firstName}! Сегодня мы разбираем тему «${topicTitle}». С какого логического шага начнем исследование?`;
    } else if (language === 'en') {
      greeting = `Hello, ${firstName}! Today we are exploring "${topicTitle}". How should we approach this step?`;
    } else {
      greeting = `Сәлем, ${firstName}! Бүгін біз «${topicTitle}» тақырыбын талдаймыз. Талдауды қай қадамнан бастаймыз?`;
    }

    return {
      greeting,
      thought_forks: forks,
      is_ai_connected: isAi,
    };
  }

  public async generateSocratic(params: {
    studentAnswer: string;
    topicTitle?: string;
    currentElo?: number;
    language?: 'kz' | 'ru' | 'en';
  }): Promise<any> {
    const { studentAnswer, topicTitle = 'Алгебра', currentElo = 1420, language = 'kz' } = params;

    // Fast Anti-Jailbreak check
    const lower = studentAnswer.toLowerCase();
    if (lower.includes('дай ответ') || lower.includes('жауабын айт') || lower.includes('tell me the answer') || lower.includes('write the full code')) {
      return {
        question_line: language === 'ru'
          ? '⚠️ Попробуй дойти до верного решения своими размышлениями!'
          : language === 'en'
          ? '⚠️ Try to reach the solution through your own reasoning!'
          : '⚠️ Дұрыс шешімге өз ойыңмен жетуге тырысып көр!',
        thought_forks: [
          { key: 'A', title: language === 'ru' ? 'Вернуться к условию' : language === 'en' ? 'Return to problem premise' : 'Есептің шартына оралу', type: 'true_step', description: language === 'ru' ? 'Внимательно прочитайте условие' : language === 'en' ? 'Review given parameters' : 'Шарттарды мұқият оқыңыз' },
          { key: 'B', title: language === 'ru' ? 'Просить готовый ответ (Ловушка)' : language === 'en' ? 'Demand direct solution (Trap)' : 'Дайын жауап сұрау (Тұзақ)', type: 'cognitive_trap', description: language === 'ru' ? 'Готовый ответ не развивает понимание' : language === 'en' ? 'Direct answer stops cognitive growth' : 'Дайын жауап дамуға кедергі жасайды' },
          { key: 'C', title: language === 'ru' ? 'Вспомнить определение' : language === 'en' ? 'Recall definition' : 'Негізгі формула мен ереже', type: 'basic_rule', description: language === 'ru' ? 'Вспомните базовое правило' : language === 'en' ? 'Check core theorem' : 'Тақырыптық ережені еске түсіріңіз' },
        ],
        elo_delta: -20,
        is_eureka: false,
        is_jailbreak: true,
        anti_stuck_active: false,
        feedback_message: language === 'ru' ? '⚠️ Anti-Jailbreak: «Аға» не дает готовых ответов! (-20 ELO)' : language === 'en' ? '⚠️ Anti-Jailbreak: "Aga" never provides direct answers! (-20 ELO)' : '⚠️ Anti-Jailbreak: «Аға» дайын жауап бермейді! (-20 ELO)',
        new_elo: Math.max(400, currentElo - 20),
        is_ai_connected: this.hasApiKey(),
      };
    }

    if (!this.apiKey) {
      // Deterministic pedagogical response from SQLite logic
      return {
        question_line: language === 'ru'
          ? `Как мы можем применить свойства темы «${topicTitle}» к этому шагу?`
          : language === 'en'
          ? `How can we apply principles of "${topicTitle}" to verify this step?`
          : `«${topicTitle}» қасиеттерін осы қадамға қалай қолданамыз?`,
        thought_forks: [
          { key: 'A', title: language === 'ru' ? 'Проверить логическую корректность' : language === 'en' ? 'Verify logical consistency' : 'Логикалық дұрыстығын тексеру', type: 'true_step', description: language === 'ru' ? 'Шаг обоснован математически' : language === 'en' ? 'Step is mathematically sound' : 'Қадам теорияға сай' },
          { key: 'B', title: language === 'ru' ? 'Поспешный вывод без проверки' : language === 'en' ? 'Hasty conclusion without proof' : 'Тексерусіз асығыс тұжырым (Тұзақ)', type: 'cognitive_trap', description: language === 'ru' ? 'Возможна потеря корней или смена знака' : language === 'en' ? 'Risk of extraneous roots' : 'Түбірді жоғалту қаупі бар' },
          { key: 'C', title: language === 'ru' ? 'Сверить с базовой теоремой' : language === 'en' ? 'Check foundational theorem' : 'Негізгі теоремаға сүйену', type: 'basic_rule', description: language === 'ru' ? 'Опорный закон темы' : language === 'en' ? 'Core rule reference' : 'Тақырыптың тірек ережесі' },
        ],
        elo_delta: 10,
        is_eureka: false,
        is_jailbreak: false,
        anti_stuck_active: false,
        feedback_message: language === 'ru' ? 'Хороший ход! Выберите следующий шаг.' : language === 'en' ? 'Good reasoning! Choose next step.' : 'Жақсы ой! Келесі бағытты таңдаңыз.',
        new_elo: currentElo + 10,
        is_ai_connected: false,
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const systemPrompt = SOCRATIC_AGA_SYSTEM_PROMPT(language);
      const userPrompt = `Тақырып: ${topicTitle}. Оқушының жауабы: "${studentAnswer}". Ағымдағы ELO: ${currentElo}.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}`);
      }

      const data = (await response.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(this.cleanJson(rawText));
      return {
        ...parsed,
        is_ai_connected: true,
      };
    } catch (err) {
      console.warn('[GeminiClient] API error, falling back to pedagogical rules:', err);
      return {
        question_line: language === 'ru'
          ? `Как мы можем применить свойства темы «${topicTitle}» к этому шагу?`
          : language === 'en'
          ? `How can we apply principles of "${topicTitle}" to verify this step?`
          : `«${topicTitle}» қасиеттерін осы қадамға қалай қолданамыз?`,
        thought_forks: [
          { key: 'A', title: language === 'ru' ? 'Проверить логическую корректность' : language === 'en' ? 'Verify logical consistency' : 'Логикалық дұрыстығын тексеру', type: 'true_step', description: language === 'ru' ? 'Шаг обоснован' : language === 'en' ? 'Step is verified' : 'Қадам теорияға сай' },
          { key: 'B', title: language === 'ru' ? 'Поспешный вывод без проверки' : language === 'en' ? 'Hasty conclusion without proof' : 'Тексерусіз асығыс тұжырым (Тұзақ)', type: 'cognitive_trap', description: language === 'ru' ? 'Возможна ошибка' : language === 'en' ? 'Risk of error' : 'Түбірді жоғалту қаупі бар' },
          { key: 'C', title: language === 'ru' ? 'Сверить с базовой теоремой' : language === 'en' ? 'Check foundational theorem' : 'Негізгі теоремаға сүйену', type: 'basic_rule', description: language === 'ru' ? 'Опорный закон темы' : language === 'en' ? 'Core rule reference' : 'Тақырыптың тірек ережесі' },
        ],
        elo_delta: 5,
        is_eureka: false,
        is_jailbreak: false,
        anti_stuck_active: false,
        feedback_message: language === 'ru' ? 'Продолжим!' : language === 'en' ? 'Let us continue!' : 'Жалғастырайық!',
        new_elo: currentElo + 5,
        is_ai_connected: false,
      };
    }
  }
}

export const geminiClient = new GeminiClient();
