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
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { MathText } from '@/components/ui/MathText';
import { ActiveCanvasInspector } from '@/components/canvas/ActiveCanvasInspector';
import { AudioPlayerButton } from '@/components/common/AudioPlayerButton';

interface ThoughtFork {
  id: 'A' | 'B' | 'C';
  type: 'correct_step' | 'cognitive_trap' | 'base_rule';
  title: string;
  explanation: string;
  isCorrect: boolean;
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
  zvdslSchema,
  desmosState,
}) => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [selectedFork, setSelectedFork] = useState<'A' | 'B' | 'C' | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEureka, setIsEureka] = useState(false);

  // Default dynamic ZVDSL Schema & Desmos simulation state for quadratic equations
  const defaultZvdslSchema = {
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
  };

  const defaultDesmosState = {
    version: 11,
    expressions: {
      list: [
        { id: '1', latex: 'f(x) = x^2 - x - 6', color: '#0969da', lineWidth: 2.5 },
        { id: '2', latex: '(-2, 0)', pointStyle: 'POINT', color: '#cf222e' },
        { id: '3', latex: '(3, 0)', pointStyle: 'POINT', color: '#1a7f37' },
        { id: '4', latex: '(0.5, -6.25)', pointStyle: 'POINT', color: '#bf8700' },
      ],
    },
  };

  const thoughtForks: ThoughtFork[] = [
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
  ];

  const handleSelect = (id: 'A' | 'B' | 'C') => {
    if (hasSubmitted) return;
    setSelectedFork(id);
  };

  const handleSubmit = () => {
    if (!selectedFork) return;
    setHasSubmitted(true);

    const chosen = thoughtForks.find((f) => f.id === selectedFork);
    if (chosen?.isCorrect) {
      setIsEureka(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#238636', '#3fb950', '#58a6ff', '#a371f7', '#d29922'],
      });

      if (user) {
        const newElo = (user.overallElo ?? 1000) + 15;
        updateUser({
          overallElo: newElo,
        });

        showToast({
          type: 'success',
          title: 'Eureka Moment! 🎉',
          message: '+15 ELO! ' + newElo,
        });
      }

    } else {
      showToast({
        type: 'attention',
        title: '«Аға» наставнигінің кеңесі',
        message: 'Қатені талдап, келесі логикалық қадамды қайта бағамдаңыз.',
      });
    }
  };

  const handleReset = () => {
    setSelectedFork(null);
    setHasSubmitted(false);
    setIsEureka(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
          <div className="flex items-center gap-2">
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
                {topicTitle}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <Badge variant="done" className="text-[10px] font-mono">
              +15 ELO Eureka
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active Canvas Inspector */}
          <ActiveCanvasInspector
            zvdslSchema={zvdslSchema || defaultZvdslSchema}
            desmosState={desmosState || defaultDesmosState}
            title="Active Canvas / Desmos Simulation"
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
                text="Теңдеудің түбірлерін таппас бұрын, олардың көбейтіндісі мен қосындысын формуласыз бірден байланыстыру үшін қай заңдылықты қолданамыз?"
                lang="kz"
                variant="ghost"
                size="sm"
                label="Ағаны тыңдау"
              />
            </div>
            <p className="text-primer-fg-default font-medium">
              «Теңдеудің түбірлерін таппас бұрын, олардың көбейтіндісі мен қосындысын формуласыз бірден байланыстыру үшін қай заңдылықты қолданамыз?»
            </p>
          </div>

          {/* 3 Visual Thought-Forks */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
              Ойлау развилкалары (Thought-Forks):
            </div>

            <div className="space-y-2">
              {thoughtForks.map((fork) => {
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

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-primer-border-default bg-primer-canvas-subtle">
          <div>
            {isEureka && (
              <span className="text-xs font-bold text-primer-success-fg flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Eureka Moment! +15 ELO!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasSubmitted ? (
              <>
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Қайтадан көру
                </Button>
                <Button variant="primary" size="sm" onClick={onClose}>
                  Жалғастыру
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
