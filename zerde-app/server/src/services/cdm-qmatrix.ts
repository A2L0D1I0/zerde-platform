/**
 * ============================================================================
 * ZERDE COGNITIVE DIAGNOSTIC MODEL (CDM) & Q-MATRIX ENGINE
 * Model: DINA (Deterministic Inputs, Noisy "And" Gate)
 * 100% Local Execution | 0 AI Tokens
 * ============================================================================
 */

import { getDb } from '../db/database';

export type ErrorCategory = 'COMPUTATIONAL' | 'CONCEPTUAL' | 'CARELESSNESS' | 'FORMULA_IGNORANCE';
export type SkillMasteryStatus = 'mastered' | 'in_progress' | 'deficit';

export interface MicroSkill {
  code: string;
  nameKZ: string;
  nameRU: string;
  subject: string;
  topicId?: number;
  description?: string;
}

export interface StudentItemResponse {
  questionId: number;
  isCorrect: boolean;
  chosenOption?: string | null;
  textResponse?: string | null;
  microSkills: string[];
  difficulty?: number;
  guessingProbability?: number; // g_j (default ~0.15)
  slippingProbability?: number; // s_j (default ~0.10)
}

export interface SkillMasteryEstimate {
  skillCode: string;
  skillNameKZ: string;
  skillNameRU: string;
  subject: string;
  probability: number; // P(alpha_k = 1 | X) in [0, 1]
  status: SkillMasteryStatus;
  totalQuestions: number;
  correctQuestions: number;
}

export interface CdmProfile {
  studentId: number;
  studentName: string;
  overallMastery: number; // Average probability across all skills [0..1]
  masteredSkills: SkillMasteryEstimate[]; // P >= 0.70
  inProgressSkills: SkillMasteryEstimate[]; // 0.40 <= P < 0.70
  deficitSkills: SkillMasteryEstimate[]; // P < 0.40
  allSkills: SkillMasteryEstimate[];
  evaluatedQuestionsCount: number;
  lastEvaluatedAt: string;
}

export interface ErrorClassificationResult {
  category: ErrorCategory;
  confidence: number;
  explanationKZ: string;
  explanationRU: string;
  suggestedIntervention: string;
  relevantSkills: string[];
}

// ----------------------------------------------------------------------------
// Curated Micro-Skills Registry (9th Grade STEM & Humanities)
// ----------------------------------------------------------------------------
export const MICRO_SKILLS_REGISTRY: Record<string, MicroSkill> = {
  // ALGEBRA
  'ALG_09_INTERVAL_METHOD': {
    code: 'ALG_09_INTERVAL_METHOD',
    nameKZ: 'Аралықтар әдісі (Интервалдар әдісі)',
    nameRU: 'Метод интервалов для неравенств',
    subject: 'algebra',
    description: 'Көпмүшелер мен бөлшек-рационал өрнектердің таңба тұрақтылық аралықтарын анықтау'
  },
  'ALG_09_INEQ_SIGN_TEST': {
    code: 'ALG_09_INEQ_SIGN_TEST',
    nameKZ: 'Теңсіздік таңбаларын тексеру',
    nameRU: 'Проверка знаков на числовых промежутках',
    subject: 'algebra',
    description: 'Сынақ нүктелері арқылы әр аралықтағы оң/теріс таңбаларды анықтау'
  },
  'ALG_09_OPEN_INTERVALS': {
    code: 'ALG_09_OPEN_INTERVALS',
    nameKZ: 'Қатаң теңсіздік жақшалары',
    nameRU: 'Строгие неравенства и круглые скобки',
    subject: 'algebra',
    description: 'Қатаң теңсіздіктерде нүктелерді боямау және ашық жақша қолдану'
  },
  'ALG_09_RATIONAL_INEQ': {
    code: 'ALG_09_RATIONAL_INEQ',
    nameKZ: 'Бөлшек-рационал теңсіздіктер',
    nameRU: 'Дробно-рациональные неравенства',
    subject: 'algebra',
    description: 'Бөлімінде айнымалысы бар теңсіздіктерді көбейткіштерге жіктеу және шешу'
  },
  'ALG_09_DENOMINATOR_RESTRICTION': {
    code: 'ALG_09_DENOMINATOR_RESTRICTION',
    nameKZ: 'Бөлімнің нөлге тең еместігі',
    nameRU: 'Ограничения знаменателя (ОДЗ)',
    subject: 'algebra',
    description: 'Бөлшек бөліміндегі нөлдерді шешімнен шығарып тастау (выколотая точка)'
  },
  'ALG_09_BRACKET_DISCIPLINE': {
    code: 'ALG_09_BRACKET_DISCIPLINE',
    nameKZ: 'Жақшалар тәртібі ([, ], (, ))',
    nameRU: 'Дисциплина скобок и граничные точки',
    subject: 'algebra',
    description: 'Қатаң емес теңсіздіктерде алым нөлдеріне тік, бөлім нөлдеріне жай жақша қою'
  },
  'ALG_09_PARABOLA_VERTEX': {
    code: 'ALG_09_PARABOLA_VERTEX',
    nameKZ: 'Парабола төбесі мен тармақтары',
    nameRU: 'Вершина и направление ветвей параболы',
    subject: 'algebra',
    description: 'ax² + bx + c үшмүшесінің a коэффициенті бойынша бағытын және төбесін табу'
  },
  'ALG_09_COEFF_SIGN': {
    code: 'ALG_09_COEFF_SIGN',
    nameKZ: 'Коэффициенттер таңбасы',
    nameRU: 'Знаки коэффициентов квадратного трехчлена',
    subject: 'algebra',
    description: 'Үшмүше таңбасының дискриминант пен бас коэффициентке тәуелділігі'
  },
  'ALG_09_SUBSTITUTION_METHOD': {
    code: 'ALG_09_SUBSTITUTION_METHOD',
    nameKZ: 'Айнымалыны алмастыру әдісі',
    nameRU: 'Метод подстановки в системах',
    subject: 'algebra',
    description: 'Бір айнымалыны екіншісі арқылы өрнектеп теңдеулер жүйесін шешу'
  },
  'ALG_09_NONLINEAR_SYSTEMS': {
    code: 'ALG_09_NONLINEAR_SYSTEMS',
    nameKZ: 'Сызықтық емес теңдеулер жүйесі',
    nameRU: 'Нелинейные системы уравнений',
    subject: 'algebra',
    description: 'Екінші дәрежелі екі айнымалысы бар жүйелердің барлық түбірлер жұбын табу'
  },
  'ALG_09_INEQ_SYSTEM_OVERLAP': {
    code: 'ALG_09_INEQ_SYSTEM_OVERLAP',
    nameKZ: 'Теңсіздіктер жүйесінің қиылысуы',
    nameRU: 'Пересечение решений системы неравенств',
    subject: 'algebra',
    description: 'Бірнеше теңсіздік аралықтарының ортақ бөлігін (қиылысуын) табу'
  },
  'ALG_09_COMPOUND_CONDITIONS': {
    code: 'ALG_09_COMPOUND_CONDITIONS',
    nameKZ: 'Құрамдас шарттарды біріктіру',
    nameRU: 'Объединение составных условий',
    subject: 'algebra',
    description: 'Жиынтық пен жүйе айырмашылығын түсініп дұрыс таңбалау'
  },
  'ALG_09_EVEN_POWER_ROOTS': {
    code: 'ALG_09_EVEN_POWER_ROOTS',
    nameKZ: 'Еселі түбірлер мен таңба сақталуы',
    nameRU: 'Кратные корни четной степени',
    subject: 'algebra',
    description: 'Жұп дәрежелі жақшадан өткенде таңбаның өзгермей сақталу ережесі'
  },
  'ALG_09_INTEGER_BOUNDARY_CHECK': {
    code: 'ALG_09_INTEGER_BOUNDARY_CHECK',
    nameKZ: 'Бүтін шешімдерді тексеру',
    nameRU: 'Целочисленный анализ границ',
    subject: 'algebra',
    description: 'Аралықтағы ең кіші немесе ең үлкен бүтін шешімді дұрыс анықтау'
  },
  'ALG_09_DIFFERENCE_OF_SQUARES': {
    code: 'ALG_09_DIFFERENCE_OF_SQUARES',
    nameKZ: 'Квадраттар айырымы формуласы',
    nameRU: 'Формула разности квадратов',
    subject: 'algebra',
    description: 'a² - b² = (a - b)(a + b) формуласын түрлендірулерде қолдану'
  },
  'ALG_09_EQUATION_SYSTEM_SHORTCUTS': {
    code: 'ALG_09_EQUATION_SYSTEM_SHORTCUTS',
    nameKZ: 'Теңдеулер жүйесінің қысқа тәсілдері',
    nameRU: 'Рациональные приемы решения систем',
    subject: 'algebra',
    description: 'Қысқаша көбейту формулаларын қолданып жүйені жедел шешу'
  },

  // PHYSICS
  'PHY_09_ACCEL_DISPLACEMENT': {
    code: 'PHY_09_ACCEL_DISPLACEMENT',
    nameKZ: 'Үдемелі қозғалыстағы орын ауыстыру',
    nameRU: 'Перемещение при равноускоренном движении',
    subject: 'physics',
    description: 's = v₀t + at²/2 формуласы бойынша орын ауыстыруды есептеу'
  },
  'PHY_09_V_T_INTEGRAL_AREA': {
    code: 'PHY_09_V_T_INTEGRAL_AREA',
    nameKZ: 'v(t) графигі бойынша аудан есептеу',
    nameRU: 'Геометрический смысл перемещения (график v(t))',
    subject: 'physics',
    description: 'Жылдамдық графигі астындағы фигура ауданы арқылы жүрілген жолды табу'
  },
  'PHY_09_NEWTON_SECOND_LAW': {
    code: 'PHY_09_NEWTON_SECOND_LAW',
    nameKZ: 'Ньютонның екінші заңы',
    nameRU: 'Второй закон Ньютона',
    subject: 'physics',
    description: 'F_тең = ma теңдеуі мен үдеудің теңәсерлі күшке тәуелділігі'
  },
  'PHY_09_FRICTION_CALC': {
    code: 'PHY_09_FRICTION_CALC',
    nameKZ: 'Үйкеліс күшін есептеу',
    nameRU: 'Расчет силы трения скольжения',
    subject: 'physics',
    description: 'F_үйк = μN = μmg формуласымен үйкелісті анықтау'
  },
  'PHY_09_FORCE_VECTORS': {
    code: 'PHY_09_FORCE_VECTORS',
    nameKZ: 'Күштердің векторлық қосындысы',
    nameRU: 'Векторная сумма и проекции сил',
    subject: 'physics',
    description: 'Денеге әсер етуші күштерді координаталық осьтерге проекциялау'
  },
  'PHY_09_GRAVITY_INVERSE_SQUARE': {
    code: 'PHY_09_GRAVITY_INVERSE_SQUARE',
    nameKZ: 'Бүкіләлемдік тартылыс заңы',
    nameRU: 'Закон всемирного тяготения',
    subject: 'physics',
    description: 'Гравитациялық күштің қашықтықтың квадратына кері пропорционалдығы (F ~ 1/R²)'
  },
  'PHY_09_PROPORTIONAL_REASONING': {
    code: 'PHY_09_PROPORTIONAL_REASONING',
    nameKZ: 'Физикалық пропорционалдық талдау',
    nameRU: 'Пропорциональное мышление в физике',
    subject: 'physics',
    description: 'Параметрлер n есе өзгергенде нәтиженің қалай өзгеретінін бағалау'
  },
  'PHY_09_FREE_FALL_EQUATIONS': {
    code: 'PHY_09_FREE_FALL_EQUATIONS',
    nameKZ: 'Еркін түсу формулалары',
    nameRU: 'Формулы свободного падения',
    subject: 'physics',
    description: 'h = gt²/2 және v = gt теңдеулерімен уақыт пен соңғы жылдамдықты табу'
  },
  'PHY_09_ENERGY_KINEMATICS_CONVERSION': {
    code: 'PHY_09_ENERGY_KINEMATICS_CONVERSION',
    nameKZ: 'Энергия мен кинематика байланысы',
    nameRU: 'Связь энергии и кинематики',
    subject: 'physics',
    description: 'v² = 2gh қатынасы арқылы биіктік пен жылдамдықты жылдам байланыстыру'
  },
  'PHY_09_PATH_VS_DISPLACEMENT': {
    code: 'PHY_09_PATH_VS_DISPLACEMENT',
    nameKZ: 'Жол мен орын ауыстыру айырмашылығы',
    nameRU: 'Различие пути и перемещения',
    subject: 'physics',
    description: 'Скалярлық жол (траектория ұзындығы) мен векторлық орын ауыстыру модулі'
  },
  'PHY_09_CIRCULAR_GEOMETRY': {
    code: 'PHY_09_CIRCULAR_GEOMETRY',
    nameKZ: 'Шеңбер бойымен қозғалыс геометриясы',
    nameRU: 'Геометрия криволинейного движения',
    subject: 'physics',
    description: 'Шеңбер доғасының ұзындығы мен хорда арасындағы айырмашылық'
  },

  // KAZAKH LANGUAGE
  'KAZ_09_CONDITIONAL_CLAUSE': {
    code: 'KAZ_09_CONDITIONAL_CLAUSE',
    nameKZ: 'Шартты бағыныңқы сабақтас',
    nameRU: 'Придаточное предложение условия',
    subject: 'kazakh_lang',
    description: '-са/-се шартты рай жұрнағы арқылы жасалған сабақтас құрмалас сөйлем'
  },
  'KAZ_09_SUBORDINATE_TYPES': {
    code: 'KAZ_09_SUBORDINATE_TYPES',
    nameKZ: 'Бағыныңқы сөйлем түрлері',
    nameRU: 'Типы придаточных предложений',
    subject: 'kazakh_lang',
    description: 'Сабақтас құрмаластың 6 түрін (шартты, қарсылықты, себеп, т.б.) ажырату'
  },
  'KAZ_09_COORDINATE_CONTRAST': {
    code: 'KAZ_09_COORDINATE_CONTRAST',
    nameKZ: 'Қарсылықты салалас құрмалас',
    nameRU: 'Сложносочиненное противительное',
    subject: 'kazakh_lang',
    description: '«Бірақ, алайда, дегенмен» жалғаулықтары бар салалас сөйлемдер'
  },
  'KAZ_09_CONJUNCTIONS': {
    code: 'KAZ_09_CONJUNCTIONS',
    nameKZ: 'Жалғаулық шылаулардың қызметі',
    nameRU: 'Функции сочинительных союзов',
    subject: 'kazakh_lang',
    description: 'Ыңғайлас, қарсылықты, талғаулы жалғаулықтардың семантикасы'
  },
  'KAZ_09_MORPHEME_ANALYSIS': {
    code: 'KAZ_09_MORPHEME_ANALYSIS',
    nameKZ: 'Морфемдік талдау тәртібі',
    nameRU: 'Морфемный состав слова',
    subject: 'kazakh_lang',
    description: 'Түбір сөз, сөз тудырушы және сөз түрлендіруші қосымшаларды жіктеу'
  },
  'KAZ_09_COMPOUND_DERIVATION': {
    code: 'KAZ_09_COMPOUND_DERIVATION',
    nameKZ: 'Күрделі туынды сөздер',
    nameRU: 'Сложные производные слова',
    subject: 'kazakh_lang',
    description: 'Кіріккен немесе біріккен түбірлерден туынды сөзжасам құрылымы'
  },
  'KAZ_09_POETIC_SYNTAX': {
    code: 'KAZ_09_POETIC_SYNTAX',
    nameKZ: 'Поэтикалық синтаксис',
    nameRU: 'Синтаксис поэтической речи',
    subject: 'kazakh_lang',
    description: 'Өлең құрылымындағы көсемше тұлғалы шарттық сабақтас байланыстар'
  },
  'KAZ_09_VERBAL_ADVERB_CLAUSES': {
    code: 'KAZ_09_VERBAL_ADVERB_CLAUSES',
    nameKZ: 'Көсемшелі бағыныңқы сыңарлар',
    nameRU: 'Деепричастные придаточные конструкции',
    subject: 'kazakh_lang',
    description: '-май/-пей, -а/-е/-й жұрнақты көсемшелердің синтаксистік қызметі'
  }
};

/**
 * Helper to get or fallback micro-skill metadata
 */
export function getSkillMetadata(code: string): MicroSkill {
  if (MICRO_SKILLS_REGISTRY[code]) {
    return MICRO_SKILLS_REGISTRY[code];
  }
  return {
    code,
    nameKZ: code.replace(/_/g, ' '),
    nameRU: code.replace(/_/g, ' '),
    subject: code.startsWith('ALG') ? 'algebra' : code.startsWith('PHY') ? 'physics' : 'kazakh_lang',
    description: `Micro-skill ${code}`
  };
}

// ----------------------------------------------------------------------------
// DINA Cognitive Diagnostic Mathematical Engine
// ----------------------------------------------------------------------------

/**
 * Calculates marginal posterior skill mastery probabilities P(\alpha_k = 1 | X)
 * using the DINA (Deterministic Inputs, Noisy "And" gate) model.
 *
 * @param responses Array of student item responses
 * @param targetSkills Target micro-skill codes to evaluate
 * @param defaultGuess Guessing probability g_j (default 0.15)
 * @param defaultSlip Slipping probability s_j (default 0.10)
 * @returns Map of skillCode -> mastery probability in [0, 1]
 */
export function calculateDinaSkillMastery(
  responses: StudentItemResponse[],
  targetSkills: string[],
  defaultGuess = 0.15,
  defaultSlip = 0.10
): Map<string, number> {
  const K = targetSkills.length;
  const result = new Map<string, number>();

  if (K === 0) {
    return result;
  }

  // If K is small (<= 12), we compute exact posterior over all 2^K latent profiles
  if (K <= 12) {
    const numProfiles = 1 << K; // 2^K
    const logLikelihoods = new Float64Array(numProfiles);

    // Build Q-matrix vectors for answered items
    const itemData = responses.map((resp) => {
      let qMask = 0;
      for (let k = 0; k < K; k++) {
        if (resp.microSkills.includes(targetSkills[k])) {
          qMask |= (1 << k);
        }
      }
      return {
        qMask,
        isCorrect: resp.isCorrect ? 1 : 0,
        g: resp.guessingProbability ?? defaultGuess,
        s: resp.slippingProbability ?? defaultSlip
      };
    });

    // Compute log-likelihood for each profile c in {0..2^K-1}
    for (let c = 0; c < numProfiles; c++) {
      let logL = 0;
      for (const item of itemData) {
        if (item.qMask === 0) continue; // Item doesn't test any of the target skills

        // eta_{jc} = 1 if profile c possesses all skills required by item j
        const eta = (c & item.qMask) === item.qMask ? 1 : 0;

        let p: number;
        if (item.isCorrect === 1) {
          p = eta === 1 ? (1 - item.s) : item.g;
        } else {
          p = eta === 1 ? item.s : (1 - item.g);
        }

        // Clamp to prevent log(0)
        p = Math.max(1e-6, Math.min(1 - 1e-6, p));
        logL += Math.log(p);
      }
      logLikelihoods[c] = logL;
    }

    // Log-Sum-Exp trick to compute normalized posterior probabilities
    let maxLogL = -Infinity;
    for (let c = 0; c < numProfiles; c++) {
      if (logLikelihoods[c] > maxLogL) {
        maxLogL = logLikelihoods[c];
      }
    }

    let sumExp = 0;
    const weights = new Float64Array(numProfiles);
    for (let c = 0; c < numProfiles; c++) {
      const w = Math.exp(logLikelihoods[c] - maxLogL);
      weights[c] = w;
      sumExp += w;
    }

    // Calculate marginal probability P(alpha_k = 1 | X) for each skill k
    for (let k = 0; k < K; k++) {
      let sumProbSkill = 0;
      const bitMask = 1 << k;
      for (let c = 0; c < numProfiles; c++) {
        if ((c & bitMask) !== 0) {
          sumProbSkill += weights[c];
        }
      }
      const pMarginal = sumProbSkill / sumExp;
      result.set(targetSkills[k], Math.round(pMarginal * 1000) / 1000);
    }
  } else {
    // If K > 12, partition skills by relevant subsets or evaluate each skill with DINA localized likelihood
    for (const skill of targetSkills) {
      const relevantResponses = responses.filter((r) => r.microSkills.includes(skill));
      if (relevantResponses.length === 0) {
        result.set(skill, 0.50); // Uniform prior
        continue;
      }

      // 1D DINA likelihood with Laplace prior
      let logL1 = 0; // alpha_k = 1
      let logL0 = 0; // alpha_k = 0

      for (const r of relevantResponses) {
        const g = r.guessingProbability ?? defaultGuess;
        const s = r.slippingProbability ?? defaultSlip;

        if (r.isCorrect) {
          logL1 += Math.log(1 - s);
          logL0 += Math.log(g);
        } else {
          logL1 += Math.log(s);
          logL0 += Math.log(1 - g);
        }
      }

      const maxL = Math.max(logL1, logL0);
      const w1 = Math.exp(logL1 - maxL);
      const w0 = Math.exp(logL0 - maxL);
      const prob = w1 / (w1 + w0);

      result.set(skill, Math.round(prob * 1000) / 1000);
    }
  }

  return result;
}

// ----------------------------------------------------------------------------
// Four-Category Error Classifier
// ----------------------------------------------------------------------------

export interface ErrorClassificationInput {
  questionId?: number;
  questionText?: string;
  chosenOption?: string | null;
  correctAnswer?: string;
  optionsJson?: string | null;
  textResponse?: string | null;
  microSkills?: string[];
  studentSkillProbabilities?: Map<string, number>;
}

/**
 * Classifies an incorrect student answer into one of 4 diagnostic categories:
 * - COMPUTATIONAL: Calculation / arithmetic / sign error
 * - CONCEPTUAL: Fundamental theoretical misunderstanding or inverse logic
 * - CARELESSNESS: Slip on boundary conditions, bracket conventions, or distraction
 * - FORMULA_IGNORANCE: Missing or misapplying the foundational formula / theorem
 */
export function classifyStudentError(input: ErrorClassificationInput): ErrorClassificationResult {
  const { chosenOption, optionsJson, textResponse, microSkills = [], studentSkillProbabilities } = input;

  let misconception = '';
  let chosenOptionText = '';

  // 1. Analyze chosen distractor misconception from Mode A options if available
  if (optionsJson && chosenOption) {
    try {
      const options = JSON.parse(optionsJson);
      const selectedOpt = options.find((o: any) => o.id === chosenOption);
      if (selectedOpt) {
        misconception = selectedOpt.misconception || '';
        chosenOptionText = selectedOpt.text_kz || selectedOpt.text_ru || selectedOpt.text_en || '';
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  const combinedText = `${misconception} ${chosenOptionText} ${textResponse || ''}`.toLowerCase();

  // 2. Keyword heuristic patterns
  const computationalKeywords = [
    'есептеу', 'арифметика', 'қосу', 'көбейту', 'азайту', 'бөлу', 'сан', 'қате есептеді',
    'арифметикалық қате', 'calculation', 'arithmetic', '21 - 3', '21 * 3', '1^2 + 4^2'
  ];

  const formulaKeywords = [
    'формула', '1/2', 'коэффициентін ұмытып', 'квадрат', 'квадраттық тәуелділік', 'тартылыс заңы',
    'заңын білмейді', 'formula', 'заң', 'теорема', 's = at', 'v_соңғы * t', 'a = f/m'
  ];

  const carelessnessKeywords = [
    'жақша', 'қатаң', 'нүкте', 'бояу', 'шекара', 'выколотая', 'кірмейді', 'кіреді',
    'жабық жақша', 'ашық жақша', 'bracket', 'boundary', 'ұмытып', 'тек бір нөлдік'
  ];

  const conceptualKeywords = [
    'шатастырды', 'кері', 'тура', 'анықтама', 'түсінік', 'ұғым', 'терріс', 'оң таңбалы аймақ орнына',
    'тармақтары жоғары', 'төмен', 'жол мен орын ауыстыру', 'қарсылықты', 'себеп', 'concept', 'inverted'
  ];

  let compScore = 0;
  let formScore = 0;
  let careScore = 0;
  let concScore = 0;

  for (const kw of computationalKeywords) {
    if (combinedText.includes(kw)) compScore += 2;
  }
  for (const kw of formulaKeywords) {
    if (combinedText.includes(kw)) formScore += 2;
  }
  for (const kw of carelessnessKeywords) {
    if (combinedText.includes(kw)) careScore += 2;
  }
  for (const kw of conceptualKeywords) {
    if (combinedText.includes(kw)) concScore += 2;
  }

  // 3. Prior Skill Mastery Modulation
  if (studentSkillProbabilities && microSkills.length > 0) {
    let avgSkillProb = 0;
    let count = 0;
    for (const sk of microSkills) {
      if (studentSkillProbabilities.has(sk)) {
        avgSkillProb += studentSkillProbabilities.get(sk)!;
        count++;
      }
    }
    if (count > 0) {
      avgSkillProb /= count;
      if (avgSkillProb >= 0.75) {
        // High mastery student making mistake -> likely carelessness or computational slip
        careScore += 1.5;
        compScore += 1.0;
      } else if (avgSkillProb < 0.40) {
        // Low mastery student -> likely conceptual or formula ignorance
        concScore += 1.5;
        formScore += 1.0;
      }
    }
  }

  // Default tie-break logic
  const scores = [
    { cat: 'FORMULA_IGNORANCE' as ErrorCategory, score: formScore },
    { cat: 'CONCEPTUAL' as ErrorCategory, score: concScore },
    { cat: 'CARELESSNESS' as ErrorCategory, score: careScore },
    { cat: 'COMPUTATIONAL' as ErrorCategory, score: compScore }
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0].score > 0 ? scores[0].cat : 'CONCEPTUAL';

  const explanations: Record<ErrorCategory, { kz: string; ru: string; intervention: string }> = {
    COMPUTATIONAL: {
      kz: 'Есептеудегі арифметикалық немесе таңбалық дәлсіздік.',
      ru: 'Вычислительная или арифметическая ошибка в знаках.',
      intervention: 'Қарапайым арифметикалық өрнектерді микро-қадаммен тексеру жаттығуын беру.'
    },
    CONCEPTUAL: {
      kz: 'Тақырыптың негізгі ұғымы немесе функционалдық заңдылығы толық түсінілмеген.',
      ru: 'Концептуальное непонимание базового принципа или функциональной зависимости.',
      intervention: '«Аға» Сократикалық диалогы арқылы негізгі ұғымды мысалдармен қайта қарау.'
    },
    CARELESSNESS: {
      kz: 'Зейінсіздік немесе шекаралық шарттарды (жақшаларды) ескермеу.',
      ru: 'Невнимательность или ошибка в граничных условиях (скобках, выколотых точках).',
      intervention: 'Жақшалар мен шекара нүктелерін салыстыруға арналған 1 минуттық фокус-карта.'
    },
    FORMULA_IGNORANCE: {
      kz: 'Негізгі формула немесе теорема қате қолданылған немесе ескерілмеген.',
      ru: 'Незнание или неверное применение фундаментальной формулы/теоремы.',
      intervention: 'Формула құрастырушы SM-2 интервалымен жады карточкасын қайталау.'
    }
  };

  const info = explanations[best];

  return {
    category: best,
    confidence: Math.min(0.95, 0.65 + scores[0].score * 0.08),
    explanationKZ: info.kz,
    explanationRU: info.ru,
    suggestedIntervention: info.intervention,
    relevantSkills: microSkills
  };
}

// ----------------------------------------------------------------------------
// High-Level Student CDM Profile Aggregator
// ----------------------------------------------------------------------------

/**
 * Retrieves the comprehensive CDM Profile for a student from SQLite database.
 * Computes DINA posterior probabilities across all curriculum micro-skills.
 */
export function getStudentCdmProfile(studentId: number, courseId?: number): CdmProfile {
  const db = getDb();

  // 1. Get student user info
  const user = db.prepare('SELECT id, full_name FROM users WHERE id = ?').get(studentId) as { id: number; full_name: string } | undefined;
  const studentName = user ? user.full_name : `Оқушы #${studentId}`;

  // 2. Fetch all student attempts with question micro-skills
  let attemptsQuery = `
    SELECT 
      sa.question_id,
      sa.is_correct,
      sa.chosen_option,
      sa.text_response,
      qb.micro_skills_json,
      qb.difficulty,
      qb.options_json,
      t.course_id
    FROM student_attempts sa
    JOIN question_bank qb ON sa.question_id = qb.id
    JOIN topics t ON qb.topic_id = t.id
    WHERE sa.student_id = ?
  `;
  const queryParams: any[] = [studentId];

  if (courseId) {
    attemptsQuery += ' AND t.course_id = ?';
    queryParams.push(courseId);
  }

  const rows = db.prepare(attemptsQuery).all(...queryParams) as any[];

  const studentResponses: StudentItemResponse[] = [];
  const skillAttemptCounts: Record<string, { total: number; correct: number }> = {};

  for (const row of rows) {
    let skills: string[] = [];
    if (row.micro_skills_json) {
      try {
        skills = JSON.parse(row.micro_skills_json);
      } catch {
        skills = [];
      }
    }

    for (const sk of skills) {
      if (!skillAttemptCounts[sk]) {
        skillAttemptCounts[sk] = { total: 0, correct: 0 };
      }
      skillAttemptCounts[sk].total++;
      if (row.is_correct === 1) {
        skillAttemptCounts[sk].correct++;
      }
    }

    studentResponses.push({
      questionId: row.question_id,
      isCorrect: row.is_correct === 1,
      chosenOption: row.chosen_option,
      textResponse: row.text_response,
      microSkills: skills,
      difficulty: row.difficulty,
      guessingProbability: 0.15,
      slippingProbability: 0.10
    });
  }

  // 3. Determine target skills (either by course or all curriculum skills)
  let targetSkillCodes: string[] = [];
  if (courseId) {
    const courseQuestions = db.prepare(`
      SELECT DISTINCT qb.micro_skills_json 
      FROM question_bank qb
      JOIN topics t ON qb.topic_id = t.id
      WHERE t.course_id = ?
    `).all(courseId) as { micro_skills_json: string }[];

    const courseSkillSet = new Set<string>();
    for (const cq of courseQuestions) {
      if (cq.micro_skills_json) {
        try {
          const parsed = JSON.parse(cq.micro_skills_json);
          for (const s of parsed) courseSkillSet.add(s);
        } catch {}
      }
    }
    targetSkillCodes = Array.from(courseSkillSet);
  }

  if (targetSkillCodes.length === 0) {
    targetSkillCodes = Object.keys(MICRO_SKILLS_REGISTRY);
  }

  // 4. Run DINA model to calculate posterior mastery probabilities
  const masteryProbMap = calculateDinaSkillMastery(studentResponses, targetSkillCodes);

  // 5. Construct SkillMasteryEstimate objects
  const allSkills: SkillMasteryEstimate[] = [];
  const masteredSkills: SkillMasteryEstimate[] = [];
  const inProgressSkills: SkillMasteryEstimate[] = [];
  const deficitSkills: SkillMasteryEstimate[] = [];

  let sumProb = 0;

  for (const code of targetSkillCodes) {
    const meta = getSkillMetadata(code);
    let prob = masteryProbMap.get(code) ?? 0.50;

    // If student has no attempts on this skill, apply baseline
    const counts = skillAttemptCounts[code] || { total: 0, correct: 0 };

    let status: SkillMasteryStatus;
    if (prob >= 0.70) {
      status = 'mastered';
    } else if (prob >= 0.40) {
      status = 'in_progress';
    } else {
      status = 'deficit';
    }

    const estimate: SkillMasteryEstimate = {
      skillCode: code,
      skillNameKZ: meta.nameKZ,
      skillNameRU: meta.nameRU,
      subject: meta.subject,
      probability: prob,
      status,
      totalQuestions: counts.total,
      correctQuestions: counts.correct
    };

    allSkills.push(estimate);
    sumProb += prob;

    if (status === 'mastered') masteredSkills.push(estimate);
    else if (status === 'in_progress') inProgressSkills.push(estimate);
    else deficitSkills.push(estimate);
  }

  const overallMastery = allSkills.length > 0 ? Math.round((sumProb / allSkills.length) * 100) / 100 : 0.50;

  // Sort deficits by lowest probability first
  deficitSkills.sort((a, b) => a.probability - b.probability);
  inProgressSkills.sort((a, b) => a.probability - b.probability);
  masteredSkills.sort((a, b) => b.probability - a.probability);

  return {
    studentId,
    studentName,
    overallMastery,
    masteredSkills,
    inProgressSkills,
    deficitSkills,
    allSkills,
    evaluatedQuestionsCount: studentResponses.length,
    lastEvaluatedAt: new Date().toISOString()
  };
}
