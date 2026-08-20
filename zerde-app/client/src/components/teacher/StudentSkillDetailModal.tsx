import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MathText } from '@/components/ui/MathText';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';
import { ClassMatrixStudent, SkillHeaderMeta, StudentSkillMastery } from '@/api/teacherApi';

interface StudentSkillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: ClassMatrixStudent | null;
  skillMeta: SkillHeaderMeta | null;
  skillData: StudentSkillMastery | null;
  onAssignDrill?: (studentName: string, skillName: string) => void;
  onAddToSmartboard?: (skillName: string) => void;
}

export const StudentSkillDetailModal: React.FC<StudentSkillDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  skillMeta,
  skillData,
  onAssignDrill,
  onAddToSmartboard,
}) => {
  if (!student || !skillMeta || !skillData) return null;

  const probPercent = Math.round((skillData.probability || 0) * 100);
  const status = skillData.status;

  // Mock attempts history based on student ID and skill
  const mockAttempts = [
    {
      id: 'att_1',
      date: 'Бүгін, 11:42',
      question: 'Бөлшек-рационал теңсіздікті шешіңіз: \\frac{x^2 - 4}{x - 5} \\le 0',
      studentAnswer: '[-2; 2] \\cup [5; +\\infty)',
      correctAnswer: '(-\\infty; -2] \\cup [2; 5)',
      isCorrect: probPercent >= 70,
      mistakeAnalysis:
        probPercent < 70
          ? 'Когнитивтік қате: x = 5 нүктесі бөлімде орналасқанын ұмытып, жабық жақшамен жазды және интервал таңбасын теріс анықтады.'
          : 'Тапсырма қатесіз орындалды. Бөлімнің нөлдері ескерілді.',
      timeSpent: '1 мин 18 сек',
    },
    {
      id: 'att_2',
      date: 'Кеше, 16:15',
      question: 'Теңсіздік нөлдерін табыңыз: (x - 3)(x + 2) > 0',
      studentAnswer: '(-\\infty; -2) \\cup (3; +\\infty)',
      correctAnswer: '(-\\infty; -2) \\cup (3; +\\infty)',
      isCorrect: true,
      mistakeAnalysis: 'Дұрыс қадам: Квадрат үшмүше нөлдерін сан түзуіне салып, қатаң аралықтарды тапты.',
      timeSpent: '45 сек',
    },
    {
      id: 'att_3',
      date: '3 күн бұрын',
      question: 'Квадрат теңдеуде Виет теоремасын қолдану: x^2 - 5x + 6 = 0',
      studentAnswer: 'x_1 = -2, x_2 = -3',
      correctAnswer: 'x_1 = 2, x_2 = 3',
      isCorrect: probPercent >= 50,
      mistakeAnalysis:
        probPercent < 50
          ? 'Таңба қатесі: x_1 + x_2 = -b/a формуласындағы минус таңбасын жоғалтып алды.'
          : 'Коэффициенттер қатынасы дұрыс анықталды.',
      timeSpent: '52 сек',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-primer-border-muted">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-sm">
                {student.student_name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-primer-fg-default">
                  {student.student_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-primer-fg-muted">
                  {student.email} • {student.rank} • ELO: <strong className="font-mono text-primer-success-fg">{student.current_elo}</strong> • 🔥 {student.streak_days} күн
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant={
                status === 'mastered'
                  ? 'success'
                  : status === 'in_progress'
                  ? 'attention'
                  : 'danger'
              }
              className="text-xs font-mono py-1 px-2.5"
            >
              {status === 'mastered'
                ? '🟢 Усвоено'
                : status === 'in_progress'
                ? '🟡 В процессе'
                : '🔴 Пробел'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Micro-skill Header & Progress Bar */}
          <div className="p-3 bg-primer-canvas-inset border border-primer-border-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primer-fg-subtle">
                  {skillMeta.subject} • {skillMeta.code}
                </span>
                <h4 className="font-bold text-sm text-primer-fg-default">{skillMeta.nameKZ}</h4>
                <p className="text-[11px] text-primer-fg-muted">{skillMeta.nameRU}</p>
              </div>
              <div className="text-right font-mono">
                <div className="text-xl font-bold text-primer-fg-default">{probPercent}%</div>
                <div className="text-[10px] text-primer-fg-subtle">DINA Probability</div>
              </div>
            </div>

            {/* Probability Progress Bar */}
            <div className="w-full bg-primer-canvas-default h-2 rounded-full overflow-hidden border border-primer-border-default">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === 'mastered'
                    ? 'bg-primer-success-emphasis'
                    : status === 'in_progress'
                    ? 'bg-primer-attention-emphasis'
                    : 'bg-primer-danger-emphasis'
                }`}
                style={{ width: `${Math.max(5, probPercent)}%` }}
              />
            </div>
          </div>

          {/* AI Aga Socratic Diagnosis & Recommendation */}
          <div className="p-3 rounded-lg border border-primer-attention-muted/60 bg-primer-attention-subtle/30 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-primer-attention-fg">
              <Brain className="w-4 h-4" />
              <span>ИИ Диагностикасы және «Аға» наставнигінің кеңесі:</span>
            </div>
            <p className="text-primer-fg-default leading-relaxed">
              {status === 'deficit'
                ? `Оқушыда «${skillMeta.nameKZ}» бойынша жүйелі қателік байқалады. Ұсыныс: Таңбалар ережесін сан түзуінде қайталау үшін 3 минуттық Сократикалық микро-сессия тағайындау.`
                : status === 'in_progress'
                ? `Оқушы дағдының 60%-ын меңгерген. Жақында өткен тесттерде уақыт тапшылығынан шатасқан. Жаттығу нәтижесінде ELO өсімі күтіледі.`
                : `Дағды толық бекітілген (Mastered). Оқушы олимпиадалық немесе күрделі деңгейдегі есептерге дайын.`}
            </p>
          </div>

          {/* Attempt Log Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
              <span>Соңғы тапсырмалар мен қателер журналы</span>
              <span>{mockAttempts.length} әрекет</span>
            </div>

            <div className="space-y-2">
              {mockAttempts.map((att, i) => (
                <div
                  key={att.id}
                  className="p-3 rounded-lg border border-primer-border-default bg-primer-canvas-subtle space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {att.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-primer-success-fg" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-primer-danger-fg" />
                      )}
                      <span className="font-bold text-primer-fg-default">Әрекет #{mockAttempts.length - i}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-primer-fg-subtle font-mono">
                      <span>{att.timeSpent}</span>
                      <span>•</span>
                      <span>{att.date}</span>
                    </div>
                  </div>

                  {/* Question snippet */}
                  <div className="p-2 rounded bg-primer-canvas-inset border border-primer-border-muted font-medium text-primer-fg-default">
                    <MathText>{att.question}</MathText>
                  </div>

                  {/* Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-1.5 rounded bg-primer-canvas-default border border-primer-border-muted">
                      <span className="text-primer-fg-subtle block text-[10px]">Оқушы жауабы:</span>
                      <span className={att.isCorrect ? 'text-primer-success-fg font-bold' : 'text-primer-danger-fg font-bold'}>
                        <MathText>{att.studentAnswer}</MathText>
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-primer-canvas-default border border-primer-border-muted">
                      <span className="text-primer-fg-subtle block text-[10px]">Дұрыс жауап:</span>
                      <span className="text-primer-success-fg font-bold">
                        <MathText>{att.correctAnswer}</MathText>
                      </span>
                    </div>
                  </div>

                  {/* Mistake analysis */}
                  <div className="text-[11px] text-primer-fg-muted bg-primer-canvas-inset/50 p-2 rounded border border-primer-border-muted/50 leading-relaxed">
                    <strong>Талдау:</strong> {att.mistakeAnalysis}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-primer-border-muted">
          <Button variant="outline" size="sm" onClick={onClose}>
            Жабу
          </Button>

          {onAddToSmartboard && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onAddToSmartboard(skillMeta.nameKZ);
                onClose();
              }}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>Смарт-доскаға шығару</span>
            </Button>
          )}

          {onAssignDrill && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onAssignDrill(student.student_name, skillMeta.nameKZ);
                onClose();
              }}
              className="gap-1.5 font-bold"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Экспресс-жаттығу тағайындау (+15 ELO)</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSkillDetailModal;
