import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { MathText } from '@/components/ui/MathText';
import { ActiveCanvasInspector } from '@/components/canvas/ActiveCanvasInspector';
import { OptionGrid, AnswerOption } from '@/components/trainer/OptionGrid';
import { NotebookUploader, UploadedPhoto } from '@/components/trainer/NotebookUploader';
import { AudioPlayerButton } from '@/components/common/AudioPlayerButton';

interface QuestionItem {
  id: number;
  subject: string;
  topic_title: string;
  mode: 'A' | 'B';
  question_kz: string;
  question_ru: string;
  question_en: string;
  zvdsl_canvas_json: string | object;
  desmos_state: string | object | null;
  options?: AnswerOption[];
  correct_answer?: string;
  explanation_kz: string;
  explanation_ru: string;
  explanation_en: string;
  thought_forks?: Array<{
    id: 'A' | 'B' | 'C';
    title: string;
    explanation: string;
    isCorrect: boolean;
  }>;
}

export const TrainerScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedForkId, setSelectedForkId] = useState<'A' | 'B' | 'C' | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isEureka, setIsEureka] = useState<boolean>(false);

  // Mode B State
  const [solutionText, setSolutionText] = useState<string>('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  // Active Canvas custom schema override from option inspect button [👁️]
  const [activeSchemaOverride, setActiveSchemaOverride] = useState<any>(null);

  // 8 Comprehensive Questions covering all subjects & ZVDSL+ renderers
  const questionBank: QuestionItem[] = [
    // 1. Algebra: Number Line + Desmos Parabola
    {
      id: 1,
      subject: 'Алгебра',
      topic_title: 'Аралықтар әдісі және квадрат теңсіздіктер',
      mode: 'A',
      question_kz: 'Теңсіздікті аралықтар әдісімен шешіңіз: $(x - 3)(x + 2) > 0$. Сан түзуіндегі дұрыс аралықты таңдаңыз.',
      question_ru: 'Решите неравенство методом интервалов: $(x - 3)(x + 2) > 0$. Выберите верный промежуток.',
      question_en: 'Solve the inequality using the interval method: $(x - 3)(x + 2) > 0$. Select the correct interval.',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Сан түзуіндегі таңбалар мен аралықтар',
        elements: [
          { type: 'axis', min: -5, max: 6, step: 1 },
          { type: 'root_point', x: -2, style: 'hollow', label: '-2' },
          { type: 'root_point', x: 3, style: 'hollow', label: '3' },
          { type: 'interval_sign', from: -5, to: -2, sign: '+', color: '#1a7f37' },
          { type: 'interval_sign', from: -2, to: 3, sign: '−', color: '#cf222e' },
          { type: 'interval_sign', from: 3, to: 6, sign: '+', color: '#1a7f37' },
          { type: 'shaded_region', intervals: [[-5, -2], [3, 6]], fill: 'rgba(26,127,55,0.15)' },
        ],
      },
      desmos_state: {
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'f(x) = (x - 3)(x + 2)', color: '#0969da', lineWidth: 2.5 },
            { id: '2', latex: 'y = 0', lineStyle: 'DASHED', color: '#6e7781' },
            { id: '3', latex: '( -2, 0 )', pointStyle: 'OPEN', color: '#cf222e' },
            { id: '4', latex: '( 3, 0 )', pointStyle: 'OPEN', color: '#1a7f37' },
          ],
        },
      },
      options: [
        {
          id: 'A',
          text_kz: '$(-\\infty; -2) \\cup (3; +\\infty)$',
          text_ru: '$(-\\infty; -2) \\cup (3; +\\infty)$',
          text_en: '$(-\\infty; -2) \\cup (3; +\\infty)$',
          is_distractor: false,
          zvdsl_preview_json: {
            canvas_type: 'NUMBER_LINE',
            elements: [
              { type: 'root_point', x: -2, style: 'hollow' },
              { type: 'root_point', x: 3, style: 'hollow' },
              { type: 'shaded_region', intervals: [[-5, -2], [3, 6]] },
            ],
          },
        },
        {
          id: 'B',
          text_kz: '$[-2; 3]$',
          text_ru: '$[-2; 3]$',
          text_en: '$[-2; 3]$',
          is_distractor: true,
          misconception: 'Түбірлер арасындағы теріс аймақты таңдады және қатаң теңсіздікте жабық жақша қолданды',
        },
        {
          id: 'C',
          text_kz: '$(-2; 3)$',
          text_ru: '$(-2; 3)$',
          text_en: '$(-2; 3)$',
          is_distractor: true,
          misconception: 'Оң таңбалы аймақ орнына теріс аймақты алды',
        },
        {
          id: 'D',
          text_kz: '$(-\\infty; 3)$',
          text_ru: '$(-\\infty; 3)$',
          text_en: '$(-\\infty; 3)$',
          is_distractor: true,
          misconception: 'Тек бір нөлдік нүктені ескерді',
        },
      ],
      correct_answer: 'A',
      explanation_kz: '1. Функцияның нөлдері: $x_1 = -2, x_2 = 3$.\n2. Сан түзуі 3 аралыққа бөлінеді.\n3. Таңбалар: (+), (-), (+). Қатаң > 0 болғандықтан жауабы: $(-\\infty; -2) \\cup (3; +\\infty)$.',
      explanation_ru: 'Нули функции: x = -2, x = 3. Знаки: (+), (-), (+). Ответ: (-∞; -2) U (3; +∞).',
      explanation_en: 'Zeros are -2 and 3. Sign test gives (+), (-), (+). Solution: (-inf, -2) U (3, +inf).',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Түбірлерді тауып, таңбаларды анықтау: (+), (-), (+)',
          explanation: 'Дұрыс қадам! Нөлдерді сан түзуіне салып, қатаң аралықты таңдаймыз.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. x > 3 немесе x > -2 деп жеке теңсіздіктерге бөлу',
          explanation: 'Когнитивтік тұзақ! Көбейтіндіні жеке-жеке салыстыруға болмайды.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Барлық өрнекті x-ке бөліп тастау',
          explanation: 'Базалық ереже бұзылды: нөлге бөлу қатесі туындайды.',
          isCorrect: false,
        },
      ],
    },

    // 2. Physics: Forces Free Body Diagram
    {
      id: 2,
      subject: 'Физика',
      topic_title: 'Ньютонның екінші заңы және үйкеліс күші',
      mode: 'A',
      question_kz: 'Массасы $m = 5\\text{ кг}$ денеге горизонт бойымен $F = 30\\text{ Н}$ тарту күші әсер етеді. Үйкеліс коэффициенті $\\mu = 0.2$, $g = 10\\text{ м/с}^2$. Дененің үдеуін ($a$) табыңыз.',
      question_ru: 'К телу массой $m = 5\\text{ кг}$ приложена горизонтальная сила $F = 30\\text{ Н}$. Коэффициент трения $\\mu = 0.2$, $g = 10\\text{ м/с}^2$. Найдите ускорение тела ($a$).',
      question_en: 'A horizontal pull force $F = 30\\text{ N}$ acts on a mass $m = 5\\text{ kg}$. Friction coefficient is $\\mu = 0.2$, $g = 10\\text{ m/s}^2$. Find acceleration ($a$).',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'FREE_BODY_DIAGRAM',
        title: 'Күштер диаграммасы (Free Body Diagram)',
        mass: '5 kg',
        elements: [
          { type: 'body_box', mass: '5 kg' },
          { type: 'force_vector', name: 'F_тяга', mag: 30, direction: 'right' },
          { type: 'force_vector', name: 'F_үйк', mag: 10, direction: 'left' },
          { type: 'force_vector', name: 'N', mag: 50, direction: 'up' },
          { type: 'force_vector', name: 'mg', mag: 50, direction: 'down' },
        ],
      },
      desmos_state: null,
      options: [
        { id: 'A', text_kz: '$a = 4\\text{ м/с}^2$', text_ru: '$a = 4\\text{ м/с}^2$', text_en: '$a = 4\\text{ m/s}^2$', is_distractor: false },
        { id: 'B', text_kz: '$a = 6\\text{ м/с}^2$', text_ru: '$a = 6\\text{ м/с}^2$', text_en: '$a = 6\\text{ m/s}^2$', is_distractor: true, misconception: 'Үйкеліс күшін ескермеді: a = F/m = 30/5 = 6' },
        { id: 'C', text_kz: '$a = 2\\text{ м/с}^2$', text_ru: '$a = 2\\text{ м/с}^2$', text_en: '$a = 2\\text{ m/s}^2$', is_distractor: true, misconception: 'Үйкеліс күшін екі есе артық есептеді' },
        { id: 'D', text_kz: '$a = 5\\text{ м/с}^2$', text_ru: '$a = 5\\text{ м/с}^2$', text_en: '$a = 5\\text{ m/s}^2$', is_distractor: true, misconception: 'Арифметикалық қате' },
      ],
      correct_answer: 'A',
      explanation_kz: '1. Үйкеліс күші: $F_{үйк} = \\mu mg = 0.2 \\cdot 5 \\cdot 10 = 10\\text{ Н}$.\n2. Теңәсерлі күш: $F_{тең} = 30 - 10 = 20\\text{ Н}$.\n3. Үдеу: $a = F_{тең} / m = 20 / 5 = 4\\text{ м/с}^2$.',
      explanation_ru: 'F_тр = 0.2 * 5 * 10 = 10 Н. F_рез = 30 - 10 = 20 Н. a = 20/5 = 4 м/с².',
      explanation_en: 'F_friction = 10 N. Net force = 20 N. Acceleration = 20/5 = 4 m/s².',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Үйкеліс күшін шегеріп, теңәсерлі күшті массаға бөлу',
          explanation: 'Дұрыс! Ньютонның 2-заңы бойынша $a = (F - F_{тр})/m$.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. Тікелей тарту күшін массаға бөлу: a = 30 / 5',
          explanation: 'Қате! Бетте үйкеліс бар екенін ұмыттыңыз.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Тарту күші мен ауырлық күшін қосу',
          explanation: 'Қате! Векторлар өзара перпендикуляр бағытталған.',
          isCorrect: false,
        },
      ],
    },

    // 3. Kazakh Language: Syntax Sentence Tree
    {
      id: 3,
      subject: 'Қазақ тілі',
      topic_title: 'Сабақтас құрмалас сөйлем және шартты бағыныңқы',
      mode: 'A',
      question_kz: '«Күн жылынса, табиғат құлпыра түседі» сөйлеміндегі бағыныңқы сөйлемнің түрін анықтаңыз.',
      question_ru: 'Определите вид придаточного в сложноподчиненном предложении: «Күн жылынса, табиғат құлпыра түседі».',
      question_en: 'Identify the subordinate clause type: «Күн жылынса, табиғат құлпыра түседі».',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'LINGUISTIC_SYNTAX_TREE',
        title: 'Синтаксистік құрылым және бағыныңқы байланыс',
        elements: [
          { type: 'subordinate_clause', text: 'Күн жылынса', marker: '-са/-се (шартты рай)', role: 'Бағыныңқы сыңар' },
          { type: 'main_clause', text: 'табиғат құлпыра түседі', role: 'Басыңқы сыңар' },
          { type: 'relation_arrow', question: 'Қайтсе? Қандай жағдайда?' },
        ],
      },
      desmos_state: null,
      options: [
        { id: 'A', text_kz: 'Шартты бағыныңқы сабақтас', text_ru: 'Придаточное условия', text_en: 'Conditional subordinate clause', is_distractor: false },
        { id: 'B', text_kz: 'Қарсылықты бағыныңқы сабақтас', text_ru: 'Придаточное уступительное', text_en: 'Concessive clause', is_distractor: true, misconception: '-са да / -се де жұрнақтарымен шатастырды' },
        { id: 'C', text_kz: 'Себеп бағыныңқы сабақтас', text_ru: 'Придаточное причины', text_en: 'Causal clause', is_distractor: true, misconception: '-ғандықтан қосымшасымен шатастырды' },
        { id: 'D', text_kz: 'Мезгіл бағыныңқы сабақтас', text_ru: 'Придаточное времени', text_en: 'Temporal clause', is_distractor: true, misconception: '-ғанда/-генде жұрнағымен шатастырды' },
      ],
      correct_answer: 'A',
      explanation_kz: 'Бағыныңқы сөйлемнің баяндауышы «жылынса» шартты рай (-са) тұлғасында келіп, «Қайтсе?» деген сұраққа жауап береді.',
      explanation_ru: 'Сказуемое «жылынса» имеет суффикс условного наклонения «-са», отвечая на вопрос условия.',
      explanation_en: 'The predicate with "-sa" marks a conditional subordinate clause.',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Баяндауыштың -са/-се қосымшасын талдап, «Қайтсе?» сұрағын қою',
          explanation: 'Өте дұрыс! Шартты рай қосымшасы істің шартын білдіреді.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. Сөйлемді салалас деп есептеп жалғаулық іздеу',
          explanation: 'Қате! Сөйлемде жалғаулық жоқ, интонация және қосымша арқылы бағыныңқы байланысқан.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Тек бірінші сөздің мағынасына қарап шешім қабылдау',
          explanation: 'Қате! Синтаксистік байланыс баяндауыштың тұлғасымен анықталады.',
          isCorrect: false,
        },
      ],
    },

    // 4. Chemistry: Organic Benzene Ring
    {
      id: 4,
      subject: 'Химия',
      topic_title: 'Ароматты көмірсутектер және бензол сақинасы',
      mode: 'A',
      question_kz: 'Бензол сақинасына гидроксил тобы ($-OH$) қосылғанда қандай органикалық қосылыс түзіледі және оның қасиеті қандай?',
      question_ru: 'Какое органическое соединение образуется при присоединении группы $-OH$ к бензольному кольцу?',
      question_en: 'What organic compound is formed when an $-OH$ group is attached to a benzene ring?',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'CHEM',
        title: 'Фенолдың құрылымдық формуласы',
        formula: 'C6H5OH',
        name: 'Фенол (Карбол қышқылы)',
        rings: [
          {
            type: 'benzene',
            center: [0, 0],
            substituents: [{ angle: 90, label: 'OH' }],
          },
        ],
      },
      desmos_state: null,
      options: [
        { id: 'A', text_kz: 'Фенол ($C_6H_5OH$)', text_ru: 'Фенол ($C_6H_5OH$)', text_en: 'Phenol ($C_6H_5OH$)', is_distractor: false },
        { id: 'B', text_kz: 'Бензой қышқылы ($C_6H_5COOH$)', text_ru: 'Бензойная кислота', text_en: 'Benzoic acid', is_distractor: true, misconception: 'Карбоксил тобымен шатастырды' },
        { id: 'C', text_kz: 'Толуол ($C_6H_5CH_3$)', text_ru: 'Толуол', text_en: 'Toluene', is_distractor: true, misconception: 'Метил тобымен шатастырды' },
        { id: 'D', text_kz: 'Анилин ($C_6H_5NH_2$)', text_ru: 'Анилин', text_en: 'Aniline', is_distractor: true, misconception: 'Амин тобымен шатастырды' },
      ],
      correct_answer: 'A',
      explanation_kz: 'Бензол сақинасындағы бір сутек атомы гидроксил тобымен ($-OH$) алмасқанда фенол ($C_6H_5OH$) түзіледі.',
      explanation_ru: 'При замещении атома водорода в бензоле на гидроксильную группу -OH образуется фенол.',
      explanation_en: 'Substituting a hydrogen in benzene with -OH produces phenol.',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Сақинадағы -OH функционалдық тобын анықтау',
          explanation: 'Дұрыс! -OH тобы спирттер мен фенолдарға тән.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. Қосылысты көмірсутектер класына жатқызу',
          explanation: 'Қате! Құрамында оттек болғандықтан оттекті органикалық қосылыс.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Барлық ароматты заттарды бірдей деп санау',
          explanation: 'Қате! Радикал мен функционалдық топ қасиетті түбегейлі өзгертеді.',
          isCorrect: false,
        },
      ],
    },

    // 5. Physics: Electric Circuit
    {
      id: 5,
      subject: 'Физика',
      topic_title: 'Тұрақты ток заңдары және электр тізбегі',
      mode: 'A',
      question_kz: 'Тізбекте кернеу $U = 12\\text{ В}$, кедергі $R = 6\\text{ Ом}$. Тізбектегі ток күшін ($I$) табыңыз.',
      question_ru: 'В цепи напряжение $U = 12\\text{ В}$, сопротивление $R = 6\\text{ Ом}$. Найдите силу тока ($I$).',
      question_en: 'Given voltage $U = 12\\text{ V}$, resistance $R = 6\\text{ \\Omega}$. Find current ($I$).',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'CIRCUIT',
        title: 'Электр тізбегінің сұлбасы',
        voltage: 'U = 12 В',
        current: 'I = ?',
      },
      desmos_state: null,
      options: [
        { id: 'A', text_kz: '$I = 2\\text{ А}$', text_ru: '$I = 2\\text{ А}$', text_en: '$I = 2\\text{ A}$', is_distractor: false },
        { id: 'B', text_kz: '$I = 72\\text{ А}$', text_ru: '$I = 72\\text{ А}$', text_en: '$I = 72\\text{ A}$', is_distractor: true, misconception: 'I = U * R деп көбейтіп тастады' },
        { id: 'C', text_kz: '$I = 0.5\\text{ А}$', text_ru: '$I = 0.5\\text{ А}$', text_en: '$I = 0.5\\text{ A}$', is_distractor: true, misconception: 'I = R / U деп бөлді' },
        { id: 'D', text_kz: '$I = 6\\text{ А}$', text_ru: '$I = 6\\text{ А}$', text_en: '$I = 6\\text{ A}$', is_distractor: true, misconception: '12 - 6 деп азайтты' },
      ],
      correct_answer: 'A',
      explanation_kz: 'Тізбек бөлігі үшін Ом заңы: $I = \\frac{U}{R} = \\frac{12\\text{ В}}{6\\text{ Ом}} = 2\\text{ А}$.',
      explanation_ru: 'Закон Ома: I = U / R = 12 / 6 = 2 А.',
      explanation_en: 'Ohm\'s law: I = V / R = 12 / 6 = 2 A.',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Ом заңы бойынша кернеуді кедергіге бөлу: I = U / R',
          explanation: 'Дұрыс қадам! Ток күші кернеуге тура, кедергіге кері пропорционал.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. Кернеу мен кедергіні көбейту: I = U · R',
          explanation: 'Қате! Бұл өлшем бірлігін бұзады.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Кедергіні кернеуге бөлу: I = R / U',
          explanation: 'Қате! Бөлімде кедергі тұруы тиіс.',
          isCorrect: false,
        },
      ],
    },

    // 6. Chemistry/Physics: Quantum Orbitals
    {
      id: 6,
      subject: 'Химия',
      topic_title: 'Атом құрылысы және кванттық ұяшықтар',
      mode: 'A',
      question_kz: 'Азот ($N, Z=7$) атомының негізгі күйіндегі $2p$-деңгейшесіндегі дара (жұптаспаған) электрондар саны қанша?',
      question_ru: 'Сколько неспаренных электронов на $2p$-подуровне у атома азота ($N, Z=7$) в основном состоянии?',
      question_en: 'How many unpaired electrons are in the $2p$ subshell of a nitrogen atom in its ground state?',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'ORBITALS',
        title: 'Азот атомының электрондық құрылысы (Z=7)',
        element_name: 'Азот (N, Z=7)',
        electron_config: '1s² 2s² 2p³',
        subshells: [
          { name: '1s', boxes: [{ spins: ['up', 'down'] }] },
          { name: '2s', boxes: [{ spins: ['up', 'down'] }] },
          {
            name: '2p',
            boxes: [
              { spins: ['up'] },
              { spins: ['up'] },
              { spins: ['up'] },
            ],
          },
        ],
      },
      desmos_state: null,
      options: [
        { id: 'A', text_kz: '3 дара электрон', text_ru: '3 неспаренных электрона', text_en: '3 unpaired electrons', is_distractor: false },
        { id: 'B', text_kz: '1 дара электрон', text_ru: '1 неспаренный электрон', text_en: '1 unpaired electron', is_distractor: true, misconception: 'Хунд ережесін ескермей электрондарды бір ұяшыққа жұптастырды' },
        { id: 'C', text_kz: '0 (барлығы жұптасқан)', text_ru: '0 (все спарены)', text_en: '0 (all paired)', is_distractor: true, misconception: 'Электрон санын шатастырды' },
        { id: 'D', text_kz: '5 дара электрон', text_ru: '5 неспаренных электронов', text_en: '5 unpaired electrons', is_distractor: true, misconception: 'Валенттік электрондарды дара деп ойлады' },
      ],
      correct_answer: 'A',
      explanation_kz: 'Хунд ережесі бойынша $2p$-деңгейшесіндегі 3 электрон әрқайсысы жеке ұяшыққа бірдей спинмен (↑ ↑ ↑) орналасады. Дара электрондар саны: 3.',
      explanation_ru: 'По правилу Хунда 3 электрона на 2p подуровне занимают по одной орбитали с параллельными спинами: 3 неспаренных электрона.',
      explanation_en: 'By Hund\'s rule, the three 2p electrons occupy separate orbitals with parallel spins: 3 unpaired electrons.',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Хунд ережесі: электрондар әуелі бос ұяшықтарды толтырады (↑ ↑ ↑)',
          explanation: 'Дұрыс! Электрондар максималды спинге ие болады.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. Алғашқы ұяшықты толық жұптастырып, соңғысына 1 электрон қою',
          explanation: 'Қате! Бұл Хунд ережесіне қайшы келеді.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Барлық электрондарды 2s деңгейіне жинау',
          explanation: 'Базалық ереже бұзылды: Паули принципі бойынша 2s ұяшығында макс 2 электрон болады.',
          isCorrect: false,
        },
      ],
    },

    // 7. Mode B Question: Kazakh Language Morpheme Breakdown
    {
      id: 7,
      subject: 'Қазақ тілі',
      topic_title: 'Морфемика және сөзжасамдық талдау',
      mode: 'B',
      question_kz: '«Отансүйгіштік» сөзіне толық морфемдік талдау жасаңыз (түбір, сөзжасамдық жұрнақтар, сөз таптары). Шешіміңізді жазыңыз немесе дәптер фотосын жүктеңіз.',
      question_ru: 'Выполните морфемный разбор слова «Отансүйгіштік». Запишите решение или загрузите фото тетради.',
      question_en: 'Perform a morphemic analysis of «Отансүйгіштік». Write solution or upload notebook photo.',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'MORPHEME_BREAKDOWN',
        title: 'Күрделі кіріккен сөздің морфемдік құрылымы',
        elements: [
          { type: 'morpheme', part: 'Отан', role: 'түбір сөз (зат есім)' },
          { type: 'morpheme', part: 'сүй', role: 'екінші түбір (етістік)' },
          { type: 'morpheme', part: '-гіш', role: 'етістіктен сын есім тудырушы жұрнақ' },
          { type: 'morpheme', part: '-тік', role: 'сын есімнен дерексіз зат есім тудырушы жұрнақ' },
        ],
      },
      desmos_state: null,
      correct_answer: 'Отан (түбір) + сүй (түбір) + -гіш (жұрнақ) + -тік (жұрнақ)',
      explanation_kz: '1. Отан (түбір) + сүй (түбір) -> Отансүй (кіріккен негіз).\n2. -гіш: сын есім тудырушы жұрнақ.\n3. -тік: абстрактілі зат есім тудырушы жұрнақ.',
      explanation_ru: 'Отан (корень) + сүй (корень) + -гіш (суффикс) + -тік (суффикс).',
      explanation_en: 'Otan (root) + suy (root) + -gish (suffix) + -tik (suffix).',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Сөзді кіріккен екі түбір мен екі туынды жұрнаққа жіктеу',
          explanation: 'Дұрыс қадам! Отан (зат есім) + сүй (етістік) + -гіш + -тік.',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. Сөзді бір ғана қарапайым түбір деп санау',
          explanation: 'Қате! Сөздің құрамында екі дербес мағыналы түбір бар.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. -тік қосымшасын көптік жалғау деп қабылдау',
          explanation: 'Қате! -тік — сөз тудырушы жұрнақ, көптік жалғау емес.',
          isCorrect: false,
        },
      ],
    },

    // 8. Mode B Question: Algebra Rational Inequality
    {
      id: 8,
      subject: 'Алгебра',
      topic_title: 'Бөлшек-рационал теңсіздіктерді шешу',
      mode: 'B',
      question_kz: 'Бөлшек-рационал теңсіздікті интервалдар әдісімен шешіңіз: $\\frac{x^2 - 4}{x - 5} \\le 0$. Тетрадьтегі шешіміңізді фотоға түсіріп жүктеңіз немесе жазыңыз.',
      question_ru: 'Решите дробно-рациональное неравенство: $\\frac{x^2 - 4}{x - 5} \\le 0$.',
      question_en: 'Solve the rational inequality: $\\frac{x^2 - 4}{x - 5} \\le 0$.',
      zvdsl_canvas_json: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Бөлшек-рационал сан түзуіндегі таңбалар',
        elements: [
          { type: 'axis', min: -5, max: 7, step: 1 },
          { type: 'root_point', x: -2, style: 'solid', label: '-2 (жабық)' },
          { type: 'root_point', x: 2, style: 'solid', label: '2 (жабық)' },
          { type: 'root_point', x: 5, style: 'hollow', label: '5 (бөлім ≠ 0)' },
          { type: 'interval_sign', from: -5, to: -2, sign: '−' },
          { type: 'interval_sign', from: -2, to: 2, sign: '+' },
          { type: 'interval_sign', from: 2, to: 5, sign: '−' },
          { type: 'interval_sign', from: 5, to: 7, sign: '+' },
          { type: 'shaded_region', intervals: [[-5, -2], [2, 5]] },
        ],
      },
      desmos_state: {
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'y = \\frac{x^2 - 4}{x - 5}', color: '#8250df' },
            { id: '2', latex: 'x = 5', lineStyle: 'DASHED', color: '#cf222e' },
          ],
        },
      },
      correct_answer: '(-∞; -2] ∪ [2; 5)',
      explanation_kz: '1. Алымы: $x = \\pm 2$ (жабық нүктелер).\n2. Бөлімі: $x \\ne 5$ (ашық нүкте).\n3. Таңбалар: (−), (+), (−), (+).\n4. Жауабы: $(-\\infty; -2] \\cup [2; 5)$.',
      explanation_ru: 'Ответ: (-∞; -2] U [2; 5).',
      explanation_en: 'Solution: (-inf, -2] U [2, 5).',
      thought_forks: [
        {
          id: 'A',
          title: 'A. Бөлімдегі x=5 нүктесін қатаң выколотая етіп, алымындағы x=±2 бояу',
          explanation: 'Дұрыс қадам! Бөлім нөлге тең болмайды ($x \\neq 5$).',
          isCorrect: true,
        },
        {
          id: 'B',
          title: 'B. x-5 өрнегін оң жаққа көбейтіп жіберу',
          explanation: 'Когнитивтік тұзақ! Таңбасы белгісіз өрнекке теңсіздікті көбейтуге болмайды.',
          isCorrect: false,
        },
        {
          id: 'C',
          title: 'C. Барлық нүктелерді жабық жақшамен алу',
          explanation: 'Қате! 5 нүктесінде бөлім нөлге айналады.',
          isCorrect: false,
        },
      ],
    },
  ];

  const currentQ = questionBank[currentQuestionIndex];

  const handleSelectOption = (id: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(id);
  };

  const handleSelectFork = (id: 'A' | 'B' | 'C') => {
    if (hasSubmitted) return;
    setSelectedForkId(id);
  };

  const handleSubmit = () => {
    if (currentQ.mode === 'A' && !selectedOptionId && !selectedForkId) return;
    if (currentQ.mode === 'B' && !solutionText && photos.length === 0 && !selectedForkId) return;

    setHasSubmitted(true);

    const isOptionCorrect = selectedOptionId === currentQ.correct_answer;
    const isForkCorrect = currentQ.thought_forks?.find((f) => f.id === selectedForkId)?.isCorrect;
    const isSuccess = currentQ.mode === 'A' ? isOptionCorrect : isForkCorrect || solutionText.length > 10 || photos.length > 0;

    if (isSuccess) {
      setIsEureka(true);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#238636', '#3fb950', '#58a6ff', '#a371f7', '#d29922'],
      });

      if (user) {
        updateUser({
          overallElo: (user.overallElo || 1420) + 15,
        });
      }

      showToast({
        type: 'success',
        title: 'Eureka Moment! 🎉 +15 ELO',
        message: 'Логикалық қадам дұрыс орындалды! Жаңа рейтинг: ' + ((user?.overallElo || 1420) + 15),
      });
    } else {
      showToast({
        type: 'attention',
        title: '«Аға» наставнигінің кеңесі',
        message: 'Қатені талдап, когнитивтік тұзақтан шығу қадамын көріңіз.',
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionBank.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setSelectedForkId(null);
      setHasSubmitted(false);
      setIsEureka(false);
      setSolutionText('');
      setPhotos([]);
      setActiveSchemaOverride(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedOptionId(null);
      setSelectedForkId(null);
      setHasSubmitted(false);
      setIsEureka(false);
      setSolutionText('');
      setPhotos([]);
      setActiveSchemaOverride(null);
    }
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setSelectedForkId(null);
    setHasSubmitted(false);
    setIsEureka(false);
    setActiveSchemaOverride(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 space-y-4">
      {/* Top Breadcrumb / Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-3.5 shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primer-accent-emphasis text-white shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-primer-fg-default">
                Сократикалық тренажер «Аға»
              </h2>
              <Badge variant="accent" className="text-[10px] font-mono">
                {currentQ.subject}
              </Badge>
              <Badge variant={currentQ.mode === 'A' ? 'secondary' : 'attention'} className="text-[10px] font-mono">
                Режим {currentQ.mode}
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              {currentQ.topic_title}
            </p>
          </div>
        </div>

        {/* Question Switcher & ELO Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-primer-canvas-inset rounded-lg border border-primer-border-muted p-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 text-xs font-mono font-bold text-primer-fg-default">
              {currentQuestionIndex + 1} / {questionBank.length}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questionBank.length - 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Badge variant="done" className="text-xs font-mono py-1 px-2.5 gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>+15 ELO</span>
          </Badge>
        </div>
      </div>

      {/* 1. Active Canvas Inspector (ZVDSL+ / Desmos) */}
      <ActiveCanvasInspector
        zvdslSchema={activeSchemaOverride || currentQ.zvdsl_canvas_json}
        desmosState={currentQ.desmos_state}
        title={`Active Canvas: ${currentQ.topic_title}`}
        topicTitle={currentQ.subject}
      />

      {/* 2. Question Prompt Card */}
      <Card className="border-primer-border-default bg-primer-canvas-subtle">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primer-accent-fg">
                Сұрақ #{currentQuestionIndex + 1}:
              </span>
              <AudioPlayerButton
                text={language === 'KZ' ? currentQ.question_kz : language === 'RU' ? currentQ.question_ru : currentQ.question_en}
                lang={language}
                variant="pill"
                size="sm"
              />
            </div>
            <span className="text-[11px] font-mono text-primer-fg-muted">
              {currentQ.mode === 'A' ? 'Вариантты таңдау' : 'Толық шешім / Фото'}
            </span>
          </div>
          <CardTitle className="text-sm sm:text-base font-semibold leading-relaxed mt-1">
            <MathText>{currentQ.question_kz}</MathText>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Socratic Hint / Question Prompt with Audio */}
          <div className="rounded-lg border-l-4 border-l-primer-attention-emphasis border-y border-r border-primer-border-default bg-primer-canvas-inset p-3 text-xs leading-relaxed">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5 font-bold text-primer-attention-fg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>«Аға» наставнигінің сократикалық наводкасы:</span>
              </div>
              <AudioPlayerButton
                text="Дайын жауапты қоюға асықпаңыз. Сызбадағы байланысты ойлау развилкасымен тексеріңіз!"
                lang="kz"
                variant="ghost"
                size="sm"
                label="Ағаны тыңдау"
              />
            </div>
            <p className="text-primer-fg-default font-medium">
              «Дайын жауапты қоюға асықпаңыз. Сызбадағы геометриялық/векторлық байланысты ойлау развилкасымен тексеріңіз!»
            </p>
          </div>

          {/* Mode A: OptionGrid (up to 8 options) */}
          {currentQ.mode === 'A' && currentQ.options && (
            <OptionGrid
              options={currentQ.options}
              selectedOptionId={selectedOptionId}
              correctOptionId={currentQ.correct_answer}
              hasSubmitted={hasSubmitted}
              onSelectOption={handleSelectOption}
              onInspectOptionSchema={(schema) => setActiveSchemaOverride(schema)}
            />
          )}

          {/* Mode B: NotebookUploader */}
          {currentQ.mode === 'B' && (
            <NotebookUploader
              solutionText={solutionText}
              onChangeSolutionText={setSolutionText}
              photos={photos}
              onAddPhotos={(newP) => setPhotos((prev) => [...prev, ...newP])}
              onRemovePhoto={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
              disabled={hasSubmitted}
            />
          )}

          {/* Socratic Thought-Forks */}
          {currentQ.thought_forks && (
            <div className="space-y-2 pt-2 border-t border-primer-border-muted">
              <div className="text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
                Ойлау развилкалары (Thought-Forks):
              </div>

              <div className="space-y-2">
                {currentQ.thought_forks.map((fork) => {
                  const isSelected = selectedForkId === fork.id;
                  let borderClass =
                    'border-primer-border-default hover:border-primer-accent-emphasis bg-primer-canvas-inset';

                  if (hasSubmitted) {
                    if (fork.isCorrect) {
                      borderClass =
                        'border-primer-success-emphasis bg-primer-success-subtle text-primer-success-fg';
                    } else if (isSelected && !fork.isCorrect) {
                      borderClass =
                        'border-primer-danger-emphasis bg-primer-danger-subtle text-primer-danger-fg';
                    }
                  } else if (isSelected) {
                    borderClass =
                      'border-primer-accent-emphasis bg-primer-accent-subtle/30 ring-1 ring-primer-accent-emphasis';
                  }

                  return (
                    <div
                      key={fork.id}
                      onClick={() => handleSelectFork(fork.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${borderClass}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-primer-fg-default">
                          <MathText>{fork.title}</MathText>
                        </div>
                        {hasSubmitted && fork.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-primer-success-fg shrink-0" />
                        )}
                        {hasSubmitted && isSelected && !fork.isCorrect && (
                          <AlertTriangle className="w-4 h-4 text-primer-danger-fg shrink-0" />
                        )}
                      </div>

                      {hasSubmitted && (
                        <p className="text-[11px] mt-1.5 text-primer-fg-muted border-t border-primer-border-muted/40 pt-1.5 leading-relaxed">
                          {fork.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation reveal when submitted */}
          {hasSubmitted && (
            <div className="p-3.5 rounded-lg border border-primer-success-emphasis/40 bg-primer-success-subtle/30 space-y-1.5 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-primer-success-fg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Толық ғылыми түсіндірме:</span>
              </div>
              <div className="text-xs text-primer-fg-default leading-relaxed whitespace-pre-line font-sans">
                <MathText>{currentQ.explanation_kz}</MathText>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Controls */}
      <div className="flex items-center justify-between p-4 bg-primer-canvas-subtle border border-primer-border-default rounded-xl shadow-primer-xs">
        <div>
          {isEureka && (
            <span className="text-xs font-bold text-primer-success-fg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Eureka Moment! +15 ELO қосылды!</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasSubmitted ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Қайта тапсыру
              </Button>
              {currentQuestionIndex < questionBank.length - 1 ? (
                <Button variant="primary" size="sm" onClick={handleNextQuestion} className="font-bold">
                  Келесі сұрақ
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleReset} className="font-bold">
                  Сессия аяқталды 🎉
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={
                currentQ.mode === 'A'
                  ? !selectedOptionId && !selectedForkId
                  : !solutionText && photos.length === 0 && !selectedForkId
              }
              className="gap-1.5 font-bold"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Жауапты тексеру</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
