import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { MathText } from '@/components/ui/MathText';
import { ActiveCanvasInspector } from '@/components/canvas/ActiveCanvasInspector';

export interface QuizQuestion {
  id: string;
  subject: string;
  topicTitle: string;
  questionText: string;
  questionLatex?: string;
  mode: 'TYPE_A_CHOICE' | 'TYPE_B_OPEN';
  options: Array<{
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
    latex?: string;
    isCorrect: boolean;
  }>;
  socraticHint: {
    mentorQuestion: string;
    guidingStep: string;
    zvdslSchema?: any;
    desmosState?: any;
  };
  explanation: string;
}

interface TestPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
  subjectName?: string;
}

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    subject: 'Алгебра',
    topicTitle: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
    questionText: 'Теңсіздікті шешіңіз және шешімдер аралығын табыңыз:',
    questionLatex: 'x^2 - x - 6 < 0',
    mode: 'TYPE_A_CHOICE',
    options: [
      { id: 'A', text: '(-2; 3)', isCorrect: true },
      { id: 'B', text: '(-\\infty; -2) \\cup (3; +\\infty)', isCorrect: false },
      { id: 'C', text: '[-3; 2]', isCorrect: false },
      { id: 'D', text: '(-3; 2)', isCorrect: false },
    ],
    socraticHint: {
      mentorQuestion:
        '«Парабола тармақтары жоғары қарағанда және f(x) < 0 болғанда, шешім түбірлердің ішкі аралығында бола ма, әлде сыртқы аралығында ма?»',
      guidingStep:
        'Алдымен x² - x - 6 = 0 түбірлерін табамыз: (x - 3)(x + 2) = 0, яғни x₁ = -2, x₂ = 3. Коэффициент a = 1 > 0 болғандықтан, таңбалар: + | − | +. Теріс мәндер аралығы (-2; 3).',
      zvdslSchema: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Интервалдар әдісі сызбасы',
        elements: [
          { type: 'axis', min: -4, max: 5, step: 1 },
          { type: 'root_point', x: -2, style: 'solid', label: 'x₁ = -2' },
          { type: 'root_point', x: 3, style: 'solid', label: 'x₂ = 3' },
          { type: 'interval_sign', from: -4, to: -2, sign: '+' },
          { type: 'interval_sign', from: -2, to: 3, sign: '−' },
          { type: 'interval_sign', from: 3, to: 5, sign: '+' },
          { type: 'shaded_region', intervals: [[-2, 3]] },
        ],
      },
    },
    explanation: 'Түбірлері -2 және 3. Парабола f(x) < 0 болғандықтан, шешім: (-2; 3).',
  },
  {
    id: 'q2',
    subject: 'Алгебра',
    topicTitle: 'Виет теоремасы',
    questionText: 'Теңдеудің түбірлерінің қосындысы мен көбейтіндісін табыңыз:',
    questionLatex: '2x^2 - 8x + 6 = 0',
    mode: 'TYPE_A_CHOICE',
    options: [
      { id: 'A', text: 'x_1 + x_2 = 4, \\; x_1 \\cdot x_2 = 3', isCorrect: true },
      { id: 'B', text: 'x_1 + x_2 = -4, \\; x_1 \\cdot x_2 = 3', isCorrect: false },
      { id: 'C', text: 'x_1 + x_2 = 8, \\; x_1 \\cdot x_2 = 6', isCorrect: false },
      { id: 'D', text: 'x_1 + x_2 = 2, \\; x_1 \\cdot x_2 = 4', isCorrect: false },
    ],
    socraticHint: {
      mentorQuestion:
        '«Виет теоремасы бойынша келтірілген теңдеуде x₁ + x₂ = -b/a және x₁·x₂ = c/a болатынын есіңізге түсіріңіз. a = 2, b = -8, c = 6 болғанда не шығады?»',
      guidingStep:
        'Теңдеуді 2-ге бөлсек: x² - 4x + 3 = 0. Мұнда b = -4, c = 3. Сондықтан қосынды 4, көбейтінді 3 болады.',
    },
    explanation: 'x₁ + x₂ = -(-8)/2 = 4; x₁ · x₂ = 6/2 = 3.',
  },
  {
    id: 'q3',
    subject: 'Физика',
    topicTitle: 'Ньютонның екінші заңы',
    questionText: 'Массасы 4 кг денеге 12 Н күш әсер еткендегі үдеуді есептеңіз:',
    questionLatex: 'F = m \\cdot a \\implies a = ?',
    mode: 'TYPE_A_CHOICE',
    options: [
      { id: 'A', text: '3 \\text{ м/с}^2', isCorrect: true },
      { id: 'B', text: '48 \\text{ м/с}^2', isCorrect: false },
      { id: 'C', text: '0.33 \\text{ м/с}^2', isCorrect: false },
      { id: 'D', text: '8 \\text{ м/с}^2', isCorrect: false },
    ],
    socraticHint: {
      mentorQuestion:
        '«Ньютонның екінші заңы бойынша үдеуді табу үшін күшті массаға бөлеміз бе, әлде көбейтеміз бе?»',
      guidingStep: 'a = F / m = 12 Н / 4 кг = 3 м/с².',
    },
    explanation: 'a = F / m = 12 / 4 = 3 м/с².',
  },
];

export const TestPracticeModal: React.FC<TestPracticeModalProps> = ({
  isOpen,
  onClose,
  topicTitle = 'Квадраттық теңсіздіктер',
  subjectName = 'Математика',
}) => {
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSocraticMentor, setShowSocraticMentor] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = mockQuestions[questionIndex % mockQuestions.length];

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    const chosen = currentQ.options.find((o) => o.id === selectedOption);

    if (chosen?.isCorrect) {
      setScore((prev) => prev + 1);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      if (user) {
        updateUser({ overallElo: (user.overallElo || 1420) + 10 });
      }
      showToast({
        type: 'success',
        title: lang === 'KZ' ? 'Дұрыс жауап! 🎉' : lang === 'RU' ? 'Правильный ответ! 🎉' : 'Correct Answer! 🎉',
        message: '+10 ELO',
      });
    } else {
      showToast({
        type: 'attention',
        title: lang === 'KZ' ? 'Қате жауап' : lang === 'RU' ? 'Неверно' : 'Incorrect',
        message:
          lang === 'KZ'
            ? 'Сократ наставнигінің подсказкасын көріңіз!'
            : lang === 'RU'
            ? 'Воспользуйтесь подсказкой Сократа!'
            : 'Check the Socratic Hint below!',
      });
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < mockQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowSocraticMentor(false);
    } else {
      onClose();
      showToast({
        type: 'success',
        title: lang === 'KZ' ? 'Тест аяқталды!' : lang === 'RU' ? 'Тест завершен!' : 'Test Completed!',
        message: `${score + 1}/${mockQuestions.length} ${lang === 'KZ' ? 'дұрыс' : lang === 'RU' ? 'правильно' : 'correct'}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="font-mono text-xs">
              {subjectName}
            </Badge>
            <DialogTitle className="text-xs sm:text-sm font-bold text-primer-fg-default">
              {topicTitle}
            </DialogTitle>
          </div>
          <span className="text-xs font-mono font-bold text-primer-fg-muted">
            {questionIndex + 1}/{mockQuestions.length}
          </span>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Question Box */}
          <div className="p-4 rounded-xl bg-primer-canvas-inset border border-primer-border-muted space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-primer-fg-default">
              {currentQ.questionText}
            </p>
            {currentQ.questionLatex && (
              <div className="py-2 px-3 bg-primer-canvas-default rounded-lg border border-primer-border-default text-sm font-mono text-center">
                <MathText>{`$$${currentQ.questionLatex}$$`}</MathText>
              </div>
            )}
          </div>

          {/* Socratic Mentor Toggle Button */}
          <div className="flex justify-end">
            <Button
              variant={showSocraticMentor ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowSocraticMentor((prev) => !prev)}
              className="gap-1.5 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-primer-attention-fg" />
              <span>
                {showSocraticMentor
                  ? lang === 'KZ'
                    ? 'Сократ «Ағаны» жабу'
                    : lang === 'RU'
                    ? 'Скрыть подсказку Сократа'
                    : 'Hide Socratic Mentor'
                  : lang === 'KZ'
                  ? '🤖 Сократ «Ағадан» көмек сұрау'
                  : lang === 'RU'
                  ? '🤖 Позвать Сократа «Аға»'
                  : '🤖 Ask Socratic Mentor'}
              </span>
            </Button>
          </div>

          {/* Socratic Mentor Step Box */}
          {showSocraticMentor && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-primer-canvas-inset border border-purple-500/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                <Brain className="w-4 h-4" />
                <span>
                  {lang === 'KZ'
                    ? 'Сократ наставнигінің бағыттаушы сұрағы:'
                    : lang === 'RU'
                    ? 'Наводящий вопрос Сократа:'
                    : 'Socratic Guiding Question:'}
                </span>
              </div>
              <p className="text-xs text-primer-fg-default italic font-medium bg-primer-canvas-default p-2.5 rounded-lg border border-primer-border-muted">
                {currentQ.socraticHint.mentorQuestion}
              </p>

              {currentQ.socraticHint.zvdslSchema && (
                <div className="pt-1">
                  <ActiveCanvasInspector
                    zvdslSchema={currentQ.socraticHint.zvdslSchema}
                    title="Графикалық талдау"
                  />
                </div>
              )}

              <p className="text-[11px] text-primer-fg-muted">
                💡 <strong>{lang === 'KZ' ? 'Қадамдық түсіндірме:' : lang === 'RU' ? 'Шаг решения:' : 'Step:'}</strong>{' '}
                {currentQ.socraticHint.guidingStep}
              </p>
            </div>
          )}

          {/* Answer Options (Mode A) */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-primer-fg-muted uppercase">
              {lang === 'KZ' ? 'Жауап нұсқалары (A, B, C, D):' : lang === 'RU' ? 'Варианты ответа (A, B, C, D):' : 'Options:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                let btnStyle = 'border-primer-border-default bg-primer-canvas-subtle hover:border-primer-accent-emphasis/60';

                if (isSelected) {
                  btnStyle = 'border-primer-accent-emphasis bg-primer-accent-subtle/30 ring-2 ring-primer-accent-emphasis/50';
                }

                if (isSubmitted) {
                  if (opt.isCorrect) {
                    btnStyle = 'border-primer-success-emphasis bg-primer-success-subtle/40 text-primer-success-fg ring-2 ring-primer-success-emphasis/50';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'border-primer-danger-emphasis bg-primer-danger-subtle/40 text-primer-danger-fg';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-md bg-primer-canvas-inset border border-primer-border-default flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      {opt.id}
                    </span>
                    <span className="text-xs font-semibold flex-1">
                      {opt.latex ? <MathText>{`$${opt.latex}$`}</MathText> : opt.text}
                    </span>
                    {isSubmitted && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-primer-success-fg shrink-0" />
                    )}
                    {isSubmitted && isSelected && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-primer-danger-fg shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-primer-border-default bg-primer-canvas-subtle">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {lang === 'KZ' ? 'Шығу' : lang === 'RU' ? 'Выйти' : 'Close'}
          </Button>

          {!isSubmitted ? (
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedOption}
              onClick={handleCheckAnswer}
              className="font-bold gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'KZ' ? 'Жауапты тексеру' : lang === 'RU' ? 'Проверить ответ' : 'Check Answer'}</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextQuestion}
              className="font-bold gap-1.5 bg-primer-success-emphasis hover:bg-primer-success-emphasis/90"
            >
              <span>{questionIndex < mockQuestions.length - 1 ? (lang === 'KZ' ? 'Келесі сұрақ' : lang === 'RU' ? 'Следующий вопрос' : 'Next Question') : (lang === 'KZ' ? 'Аяқтау' : lang === 'RU' ? 'Завершить' : 'Finish')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestPracticeModal;
