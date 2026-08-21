import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { MathText } from '@/components/ui/MathText';
import { ActiveCanvasInspector } from '@/components/canvas/ActiveCanvasInspector';
import { AudioPlayerButton } from '@/components/common/AudioPlayerButton';

interface SocraticStep {
  stepNumber: number;
  stepTitle: string;
  mentorQuestion: string;
  audioPrompt: string;
  zvdslSchema: any;
  desmosState: any;
  thoughtForks: Array<{
    id: 'A' | 'B' | 'C';
    type: 'correct_step' | 'cognitive_trap' | 'base_rule';
    title: string;
    explanation: string;
    isCorrect: boolean;
  }>;
}

interface SocraticTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
  zvdslSchema?: any;
  desmosState?: any;
}

export const SocraticTrainerModal: React.FC<SocraticTrainerModalProps> = ({
  isOpen,
  onClose,
  topicTitle = 'Квадрат теңдеулер және Виет теоремасы',
}) => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedFork, setSelectedFork] = useState<'A' | 'B' | 'C' | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isEureka, setIsEureka] = useState<boolean>(false);

  // 3 sequential Socratic steps for active discovery
  const socraticSteps: SocraticStep[] = [
    {
      stepNumber: 1,
      stepTitle: '1-қадам: Гипотеза және түсінік',
      mentorQuestion:
        '«Теңдеудің түбірлерін таппас бұрын, олардың көбейтіндісі мен қосындысын бірден байланыстыру үшін қай заңдылықты қолданамыз?»',
      audioPrompt:
        'Теңдеудің түбірлерін таппас бұрын, олардың көбейтіндісі мен қосындысын бірден байланыстыру үшін қай заңдылықты қолданамыз?',
      zvdslSchema: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Парабола нөлдері мен таңбалары',
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
      desmosState: {
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'f(x) = x^2 - x - 6', color: '#0969da', lineWidth: 2.5 },
            { id: '2', latex: '(-2, 0)', pointStyle: 'POINT', color: '#cf222e' },
            { id: '3', latex: '(3, 0)', pointStyle: 'POINT', color: '#1a7f37' },
          ],
        },
      },
      thoughtForks: [
        {
          id: 'A',
          type: 'correct_step',
          title: 'A. Виет теоремасы: x₁ + x₂ = -b/a, x₁ · x₂ = c/a',
          explanation:
            'Дұрыс қадам! Коэффициенттерді анықтап, түбірлердің көбейтіндісі мен қосындысын бірден байланыстырамыз.',
          isCorrect: true,
        },
        {
          id: 'B',
          type: 'cognitive_trap',
          title: 'B. Дискриминант D < 0 болса да екі нақты түбір бар',
          explanation:
            'Когнитивтік тұзақ! Егер D < 0 болса, нақты сандар жиынында түбір жоқ.',
          isCorrect: false,
        },
        {
          id: 'C',
          type: 'base_rule',
          title: 'C. Барлық коэффициенттерді x-ке бөліп тастау',
          explanation:
            'Базалық ереже бұзылды: x = 0 болуы мүмкін болғандықтан, нөлге бөлу қатесі туындайды.',
          isCorrect: false,
        },
      ],
    },
    {
      stepNumber: 2,
      stepTitle: '2-қадам: Холстты зерттеу және таңбалар ауысуы',
      mentorQuestion:
        '«Холсттағы параболаға қараңыз: $x_1 = -2$ мен $x_2 = 3$ түбірлерінің арасындағы интервалда $f(x)$ функциясының таңбасы неліктен теріс (минус) болады?»',
      audioPrompt:
        'Холсттағы параболаға қараңыз: минус 2 мен 3 түбірлерінің арасындағы интервалда функция таңбасы неліктен теріс болады?',
      zvdslSchema: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Интервалдағы парабола орналасуы',
        elements: [
          { type: 'axis', min: -4, max: 5, step: 1 },
          { type: 'root_point', x: -2, style: 'solid', label: '-2' },
          { type: 'root_point', x: 3, style: 'solid', label: '3' },
          { type: 'interval_sign', from: -2, to: 3, sign: '− (y < 0)', color: '#cf222e' },
        ],
      },
      desmosState: {
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'f(x) = x^2 - x - 6', color: '#0969da', lineWidth: 2.5 },
            { id: '2', latex: 'y = 0', lineStyle: 'DASHED', color: '#6e7781' },
            { id: '3', latex: '(0.5, -6.25)', pointStyle: 'POINT', color: '#cf222e' },
          ],
        },
      },
      thoughtForks: [
        {
          id: 'A',
          type: 'correct_step',
          title: 'A. Парабола тармақтары жоғары қарағандықтан, түбірлер арасында график Ox осінен төмен жатыр',
          explanation:
            'Тамаша инсайт! a > 0 болғанда парабола төбесі төмен орналасады, сондықтан (-2; 3) аралығында f(x) < 0.',
          isCorrect: true,
        },
        {
          id: 'B',
          type: 'cognitive_trap',
          title: 'B. Себебі кез келген теңсіздікте ортаңғы таңба әрқашан минус болады',
          explanation:
            'Жалған стереотип! Егер a < 0 (тармақтар төмен) болса, түбірлер арасында плюс болар еді.',
          isCorrect: false,
        },
        {
          id: 'C',
          type: 'base_rule',
          title: 'C. Себебі -2 теріс сан, ал 3 оң сан',
          explanation:
            'Қате логика: интервал таңбасы түбірлердің таңбасына емес, бүкіл функция мәнінің Ox осіне қатысты орнына байланысты.',
          isCorrect: false,
        },
      ],
    },
    {
      stepNumber: 3,
      stepTitle: '3-қадам: Қорытынды Синтез & Шешім',
      mentorQuestion:
        '«Олай болса, $x^2 - x - 6 \\le 0$ теңсіздігінің қатаң емес шешім аралығын қалай жазамыз?»',
      audioPrompt:
        'Олай болса, берілген теңсіздіктің қатаң емес шешім аралығын қалай жазамыз?',
      zvdslSchema: {
        schema_version: '1.0',
        canvas_type: 'NUMBER_LINE',
        title: 'Қорытынды шешім жиыны',
        elements: [
          { type: 'axis', min: -4, max: 5, step: 1 },
          { type: 'root_point', x: -2, style: 'solid', label: '[-2' },
          { type: 'root_point', x: 3, style: 'solid', label: '3]' },
          { type: 'shaded_region', intervals: [[-2, 3]], fill: 'rgba(35,134,54,0.25)' },
        ],
      },
      desmosState: {
        version: 11,
        expressions: {
          list: [
            { id: '1', latex: 'f(x) = x^2 - x - 6', color: '#238636', lineWidth: 3 },
            { id: '2', latex: '[-2, 3]', color: '#238636' },
          ],
        },
      },
      thoughtForks: [
        {
          id: 'A',
          type: 'correct_step',
          title: 'A. x ∈ [-2; 3] (түбірлер кіреді, жабық жақша)',
          explanation:
            'Eureka! Теңсіздік кіші немесе тең болғандықтан, нөлдер шешімге енеді және жабық жақшамен жазылады.',
          isCorrect: true,
        },
        {
          id: 'B',
          type: 'cognitive_trap',
          title: 'B. x ∈ (-∞; -2] ∪ [3; +∞)',
          explanation:
            'Бұл f(x) ≥ 0 жағдайының шешімі. Бізге f(x) ≤ 0 қажет еді.',
          isCorrect: false,
        },
        {
          id: 'C',
          type: 'base_rule',
          title: 'C. x ∈ (-2; 3) (дөңгелек жақша)',
          explanation:
            'Теңсіздік қатаң емес (≤) болғандықтан, түбірлерді шешімнен алып тастауға болмайды.',
          isCorrect: false,
        },
      ],
    },
  ];

  const currentStep = socraticSteps[currentStepIndex];

  const handleSelect = (id: 'A' | 'B' | 'C') => {
    if (hasSubmitted) return;
    setSelectedFork(id);
  };

  const handleSubmit = () => {
    if (!selectedFork) return;
    setHasSubmitted(true);

    const chosen = currentStep.thoughtForks.find((f) => f.id === selectedFork);
    if (chosen?.isCorrect) {
      if (currentStepIndex === socraticSteps.length - 1) {
        // Final step reached!
        setIsEureka(true);
        confetti({
          particleCount: 100,
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
          title: 'Eureka Moment! Барлық 3 қадам сәтті өтті! 🎉',
          message: '+15 ELO қосылды! Жаңа рейтинг: ' + ((user?.overallElo || 1420) + 15),
        });
      } else {
        showToast({
          type: 'success',
          title: `${currentStepIndex + 1}-қадам дұрыс орындалды! 💡`,
          message: 'Келесі наводящий сұраққа өту үшін «Жалғастыру» басыңыз.',
        });
      }
    } else {
      showToast({
        type: 'attention',
        title: '«Аға» наставнигінің ескертпесі',
        message: 'Қатені талдап, қайтадан дұрыс логикалық қадамды таңдаңыз.',
      });
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < socraticSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedFork(null);
      setHasSubmitted(false);
      setIsEureka(false);
    } else {
      // Completed all steps
      onClose();
    }
  };

  const handleResetCurrentStep = () => {
    setSelectedFork(null);
    setHasSubmitted(false);
    setIsEureka(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primer-success-subtle text-primer-success-fg border border-primer-success-muted/50">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xs sm:text-sm font-bold text-primer-fg-default">
                  Сократикалық наставник «Аға»
                </DialogTitle>
                <Badge variant="accent" className="text-[10px] py-0 font-mono">
                  ZVDSL+ & Desmos
                </Badge>
              </div>
              <DialogDescription className="text-[10px] text-primer-fg-muted mt-0.5">
                {topicTitle} • {currentStep.stepTitle}
              </DialogDescription>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 pr-6">
            {socraticSteps.map((s, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'bg-primer-accent-emphasis ring-2 ring-primer-accent-emphasis/40 scale-125'
                    : idx < currentStepIndex
                    ? 'bg-primer-success-emphasis'
                    : 'bg-primer-border-default'
                }`}
                title={`${idx + 1}-қадам`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active Canvas Inspector */}
          <ActiveCanvasInspector
            zvdslSchema={currentStep.zvdslSchema}
            desmosState={currentStep.desmosState}
            title={`Active Canvas — ${currentStep.stepTitle}`}
            topicTitle={topicTitle}
          />

          {/* Socratic Mentor Question Prompt */}
          <div className="rounded-lg border-l-4 border-l-primer-attention-emphasis border-y border-r border-primer-border-default bg-primer-canvas-subtle p-3 text-xs leading-relaxed">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5 font-bold text-primer-attention-fg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>«Аға» наводящий вопрос (Сократ принципі):</span>
              </div>
              <AudioPlayerButton
                text={currentStep.audioPrompt}
                lang="kz"
                variant="ghost"
                size="sm"
                label="Ағаны тыңдау"
              />
            </div>
            <p className="text-primer-fg-default font-medium">
              {currentStep.mentorQuestion}
            </p>
          </div>

          {/* 3 Visual Thought-Forks */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
              Ойлау развилкалары (Thought-Forks):
            </div>

            <div className="space-y-2">
              {currentStep.thoughtForks.map((fork) => {
                const isSelected = selectedFork === fork.id;
                let borderClass =
                  'border-primer-border-default hover:border-primer-accent-emphasis bg-primer-canvas-subtle';

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
                    onClick={() => handleSelect(fork.id)}
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
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-primer-border-default bg-primer-canvas-subtle">
          <div>
            {isEureka && (
              <span className="text-xs font-bold text-primer-success-fg flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Eureka Moment! +15 ELO қосылды! 🎉</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasSubmitted ? (
              <>
                <Button variant="secondary" size="sm" onClick={handleResetCurrentStep}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Қайтадан көру
                </Button>
                <Button variant="primary" size="sm" onClick={handleNextStep} className="gap-1.5 font-bold">
                  {currentStepIndex < socraticSteps.length - 1 ? (
                    <>
                      <span>Келесі қадамға өту</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Аяқтау (+15 ELO)</span>
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={onClose}>
                  {t('action.close')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!selectedFork}
                  className="gap-1.5 font-bold"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Жауапты тексеру</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
