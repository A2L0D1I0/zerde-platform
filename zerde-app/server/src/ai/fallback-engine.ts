import { CoPilotQuestionGenResult, SocraticResponse } from './schemas';

/**
 * Deterministic Zero-Crash Fallback Engine for Zerde Platform
 * Provides pre-calibrated, high-quality pedagogical questions and insights when LLM API is unavailable.
 */
export class FallbackEngine {
  /**
   * Generates deterministic questions adhering to CoPilotQuestionGenSchema
   */
  public static getQuestions(topicTitle: string, language: string = 'KZ', count: number = 3): CoPilotQuestionGenResult {
    const lang = language.toUpperCase();

    if (lang === 'RU') {
      return {
        topic_title: topicTitle,
        questions: [
          {
            question_text: `Решите квадратное неравенство по теме «${topicTitle}»: $x^2 - 5x + 6 \\le 0$`,
            katex_snippet: 'x^2 - 5x + 6 \\le 0 \\implies (x-2)(x-3) \\le 0',
            options: [
              { id: 'A', text: '[2; 3]', latex: '[2; 3]' },
              { id: 'B', text: '(-\\infty; 2] \\cup [3; +\\infty)', latex: '(-\\infty; 2] \\cup [3; +\\infty)' },
              { id: 'C', text: '(2; 3)', latex: '(2; 3)' },
              { id: 'D', text: 'x \\le 2', latex: 'x \\le 2' }
            ],
            correct_answer: 'A',
            explanation: 'Корни $x_1 = 2, x_2 = 3$. Так как знак $\\le 0$ и коэффициент при $x^2$ положителен, решением является отрезок между корнями: $[2; 3]$.',
            difficulty: 2,
            skill_code: 'ALG_09_INEQ'
          },
          {
            question_text: `Определите область допустимых значений (ОДЗ) для неравенства: $\\frac{x - 4}{x + 1} > 0$`,
            katex_snippet: 'x + 1 \\neq 0 \\implies x \\neq -1',
            options: [
              { id: 'A', text: '(-\\infty; -1) \\cup (4; +\\infty)', latex: '(-\\infty; -1) \\cup (4; +\\infty)' },
              { id: 'B', text: '(-1; 4)', latex: '(-1; 4)' },
              { id: 'C', text: 'x > 4', latex: 'x > 4' },
              { id: 'D', text: 'x \\neq -1', latex: 'x \\neq -1' }
            ],
            correct_answer: 'A',
            explanation: 'Нули числителя и знаменателя разбивают числовую прямую на интервалы. Решение: $(-\\infty; -1) \\cup (4; +\\infty)$. Знаменатель $x=-1$ выкалывается.',
            difficulty: 3,
            skill_code: 'ALG_09_FRACTIONAL'
          },
          {
            question_text: `Найдите наименьшее целое решение неравенства: $2x - 7 < 3x + 1$`,
            katex_snippet: '2x - 3x < 1 + 7 \\implies -x < 8 \\implies x > -8',
            options: [
              { id: 'A', text: '-7', latex: '-7' },
              { id: 'B', text: '-8', latex: '-8' },
              { id: 'C', text: '0', latex: '0' },
              { id: 'D', text: '-9', latex: '-9' }
            ],
            correct_answer: 'A',
            explanation: 'Преобразуем: $-x < 8 \\implies x > -8$. Наименьшее целое число, строго большее $-8$, это $-7$.',
            difficulty: 1,
            skill_code: 'ALG_09_LINEAR'
          }
        ].slice(0, count)
      };
    }

    if (lang === 'EN') {
      return {
        topic_title: topicTitle,
        questions: [
          {
            question_text: `Solve the quadratic inequality for "${topicTitle}": $x^2 - 5x + 6 \\le 0$`,
            katex_snippet: 'x^2 - 5x + 6 \\le 0 \\implies (x-2)(x-3) \\le 0',
            options: [
              { id: 'A', text: '[2; 3]', latex: '[2; 3]' },
              { id: 'B', text: '(-\\infty; 2] \\cup [3; +\\infty)', latex: '(-\\infty; 2] \\cup [3; +\\infty)' },
              { id: 'C', text: '(2; 3)', latex: '(2; 3)' },
              { id: 'D', text: 'x \\le 2', latex: 'x \\le 2' }
            ],
            correct_answer: 'A',
            explanation: 'Roots are $x_1=2, x_2=3$. Because the parabola opens upwards and $\\le 0$, solution is $[2; 3]$.',
            difficulty: 2,
            skill_code: 'ALG_09_INEQ'
          },
          {
            question_text: `Determine domain restrictions for: $\\frac{x - 4}{x + 1} > 0$`,
            katex_snippet: 'x + 1 \\neq 0 \\implies x \\neq -1',
            options: [
              { id: 'A', text: '(-\\infty; -1) \\cup (4; +\\infty)', latex: '(-\\infty; -1) \\cup (4; +\\infty)' },
              { id: 'B', text: '(-1; 4)', latex: '(-1; 4)' },
              { id: 'C', text: 'x > 4', latex: 'x > 4' },
              { id: 'D', text: 'x \\neq -1', latex: 'x \\neq -1' }
            ],
            correct_answer: 'A',
            explanation: 'Signs method gives $(-\\infty; -1) \\cup (4; +\\infty)$ with $x=-1$ excluded.',
            difficulty: 3,
            skill_code: 'ALG_09_FRACTIONAL'
          }
        ].slice(0, count)
      };
    }

    // Default KZ
    return {
      topic_title: topicTitle,
      questions: [
        {
          question_text: `«${topicTitle}» тақырыбы бойынша квадраттық теңсіздікті шешіңіз: $x^2 - 5x + 6 \\le 0$`,
          katex_snippet: 'x^2 - 5x + 6 \\le 0 \\implies (x-2)(x-3) \\le 0',
          options: [
            { id: 'A', text: '[2; 3]', latex: '[2; 3]' },
            { id: 'B', text: '(-\\infty; 2] \\cup [3; +\\infty)', latex: '(-\\infty; 2] \\cup [3; +\\infty)' },
            { id: 'C', text: '(2; 3)', latex: '(2; 3)' },
            { id: 'D', text: 'x \\le 2', latex: 'x \\le 2' }
          ],
          correct_answer: 'A',
          explanation: 'Түбірлері $x_1 = 2, x_2 = 3$. Парабола тармақтары жоғары және таңбасы $\\le 0$ болғандықтан, шешім кесіндісі: $[2; 3]$.',
          difficulty: 2,
          skill_code: 'ALG_09_INEQ'
        },
        {
          question_text: `Теңсіздікті интервалдар әдісімен шешіп, ОДЗ ескеріңіз: $\\frac{x - 4}{x + 1} > 0$`,
          katex_snippet: 'x + 1 \\neq 0 \\implies x \\neq -1',
          options: [
            { id: 'A', text: '(-\\infty; -1) \\cup (4; +\\infty)', latex: '(-\\infty; -1) \\cup (4; +\\infty)' },
            { id: 'B', text: '(-1; 4)', latex: '(-1; 4)' },
            { id: 'C', text: 'x > 4', latex: 'x > 4' },
            { id: 'D', text: 'x \\neq -1', latex: 'x \\neq -1' }
          ],
          correct_answer: 'A',
          explanation: 'Бөлшектің нөлдері $x=-1$ және $x=4$. Сан түзуіндегі таңбалар: $+ - +$. Шешімі: $(-\\infty; -1) \\cup (4; +\\infty)$. Бөлімі нөлге тең болмайды.',
          difficulty: 3,
          skill_code: 'ALG_09_FRACTIONAL'
        },
        {
          question_text: `Теңсіздіктің ең кіші бүтін шешімін табыңыз: $2x - 7 < 3x + 1$`,
          katex_snippet: '2x - 3x < 1 + 7 \\implies -x < 8 \\implies x > -8',
          options: [
            { id: 'A', text: '-7', latex: '-7' },
            { id: 'B', text: '-8', latex: '-8' },
            { id: 'C', text: '0', latex: '0' },
            { id: 'D', text: '-9', latex: '-9' }
          ],
          correct_answer: 'A',
          explanation: 'Теңсіздікті түрлендіреміз: $-x < 8 \\implies x > -8$. $-8$-ден үлкен ең кіші бүтін сан — бұл $-7$.',
          difficulty: 1,
          skill_code: 'ALG_09_LINEAR'
        }
      ].slice(0, count)
    };
  }

  /**
   * Generates deterministic pedagogical insight for teacher based on top error code
   */
  public static getClassInsight(skillCode: string, errorCount: number, language: string = 'KZ'): string {
    const lang = language.toUpperCase();

    if (lang === 'RU') {
      return `Анализ класса: зафиксировано ${errorCount} ошибок по навыку [${skillCode}]. Рекомендуется провести 5-минутную экспресс-разминку по расстановке знаков на числовой прямой перед новой темой.`;
    }
    if (lang === 'EN') {
      return `Class analytics: ${errorCount} mistakes recorded for skill [${skillCode}]. Recommended action: 5-minute whiteboard warm-up focusing on signs intervals.`;
    }

    return `Сынып аналитикасы: [${skillCode}] дағдысы бойынша ${errorCount} қателік тіркелді. Ұсыныс: жаңа тақырып алдында сан түзуінде таңбаларды анықтау бойынша 5 минуттық экспресс-жаттығу өткізу.`;
  }

  /**
   * Generates deterministic Socratic "Aga" response with 3 Thought-Forks
   */
  public static getSocraticResponse(
    topicTitle: string = 'Квадраттық теңсіздіктер',
    language: string = 'KZ',
    currentElo: number = 1000,
    isSecondMistake: boolean = false
  ): SocraticResponse {
    const lang = language.toUpperCase();

    if (lang === 'RU') {
      return {
        question_line: isSecondMistake
          ? 'Давай подведем итог: когда мы делим на отрицательное число, знак неравенства переворачивается!'
          : `Внимательно посмотри на знак неравенства в теме «${topicTitle}»: с какого логического шага начнем проверку?`,
        thought_forks: [
          {
            key: 'A',
            id: 'fork_correct',
            title: 'Найти нули функции (корни уравнения)',
            type: 'true_step',
            description: 'Приравниваем левую часть к нулю и находим граничные точки на числовой прямой.',
            latex: 'x^2 - 5x + 6 = 0 \\implies x_1=2, x_2=3'
          },
          {
            key: 'B',
            id: 'fork_trap',
            title: 'Забыть сменить знак при делении на минус (Ловушка)',
            type: 'cognitive_trap',
            description: 'При умножении или делении неравенства на отрицательное число знак меняется на противоположный.',
            latex: '-2x \\le 6 \\implies x \\ge -3'
          },
          {
            key: 'C',
            id: 'fork_rule',
            title: 'Базовое правило метода интервалов',
            type: 'basic_rule',
            description: 'Строгий знак (<, >) — точка выколотая (круглая скобка); нестрогий (<=, >=) — закрашенная (квадратная скобка).',
            latex: 'x \\in [a; b] \\iff a \\le x \\le b'
          }
        ],
        reveal_answer: isSecondMistake,
        correct_answer_explanation: isSecondMistake ? 'Верный ответ получается путем разложения на множители и расстановки знаков на интервалах.' : undefined,
        is_eureka: false,
        elo_delta: 0,
        feedback_message: 'Жарайсың! Ой тармағын таңдап, келесі қадамға өт.',
        new_elo: currentElo
      };
    }

    if (lang === 'EN') {
      return {
        question_line: isSecondMistake
          ? 'Here is the fundamental key: dividing by a negative number reverses the inequality direction!'
          : `Look closely at the expression in "${topicTitle}": which mathematical step should we take first?`,
        thought_forks: [
          {
            key: 'A',
            id: 'fork_correct',
            title: 'Find function roots / critical points',
            type: 'true_step',
            description: 'Set expression to zero and plot roots on the real number line.',
            latex: 'x^2 - 5x + 6 = 0 \\implies x_1=2, x_2=3'
          },
          {
            key: 'B',
            id: 'fork_trap',
            title: 'Neglecting sign flip when dividing by negative (Trap)',
            type: 'cognitive_trap',
            description: 'Multiplying or dividing by a negative constant strictly reverses the inequality sign.',
            latex: '-2x \\le 6 \\implies x \\ge -3'
          },
          {
            key: 'C',
            id: 'fork_rule',
            title: 'Fundamental interval method rule',
            type: 'basic_rule',
            description: 'Strict inequality yields open brackets; non-strict yields closed brackets.',
            latex: 'x \\in [a; b] \\iff a \\le x \\le b'
          }
        ],
        reveal_answer: isSecondMistake,
        correct_answer_explanation: isSecondMistake ? 'The correct interval is determined by factoring into linear terms and testing test points.' : undefined,
        is_eureka: false,
        elo_delta: 0,
        feedback_message: 'Great thinking! Choose a thought-fork to proceed.',
        new_elo: currentElo
      };
    }

    // Default KZ (Pristine Literary Kazakh)
    return {
      question_line: isSecondMistake
        ? 'Есіңде сақта: теріс санға бөлген кезде теңсіздік таңбасы қарама-қарсы бағытқа өзгереді!'
        : `«${topicTitle}» есебіне мұқият қарашы: талдауды қай логикалық қадамнан бастаймыз?`,
      thought_forks: [
        {
          key: 'A',
          id: 'fork_correct',
          title: 'Функцияның нөлдерін (түбірлерін) табу',
          type: 'true_step',
          description: 'Өрнекті нөлге теңестіріп, сан түзуіндегі шекаралық нүктелерді анықтаймыз.',
          latex: 'x^2 - 5x + 6 = 0 \\implies x_1=2, x_2=3'
        },
        {
          key: 'B',
          id: 'fork_trap',
          title: 'Теріс санға бөлгенде таңбаны ұмыту (Тұзақ)',
          type: 'cognitive_trap',
          description: 'Теріс санға көбейткенде немесе бөлгенде теңсіздік таңбасы қарама-қарсыға ауысады.',
          latex: '-2x \\le 6 \\implies x \\ge -3'
        },
        {
          key: 'C',
          id: 'fork_rule',
          title: 'Интервалдар әдісінің негізгі ережесі',
          type: 'basic_rule',
          description: 'Қатаң теңсіздікте нүкте боялмайды (дөңгелек жақша), қатаң емес теңсіздікте боялады (квадрат жақша).',
          latex: 'x \\in [a; b] \\iff a \\le x \\le b'
        }
      ],
      reveal_answer: isSecondMistake,
      correct_answer_explanation: isSecondMistake ? 'Дұрыс жауап: түбірлерді тауып, сан түзуінде таңбаларды анықтау арқылы табылады.' : undefined,
      is_eureka: false,
      elo_delta: 0,
      feedback_message: 'Жарайсың! Ой тармағын таңдап, дұрыс шешімге бірге жетейік.',
      new_elo: currentElo
    };
  }
}
