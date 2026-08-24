import React from 'react';
import { ClassMatrixStudent, SkillMeta } from '@zerde/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StudentSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: ClassMatrixStudent | null;
  skill: SkillMeta | null;
}

export const StudentSkillModal: React.FC<StudentSkillModalProps> = ({
  isOpen,
  onClose,
  student,
  skill,
}) => {
  if (!student || !skill) return null;

  const mastery = student.skills[skill.code];
  const prob = mastery ? mastery.probability : 0.5;
  const isMastered = prob >= 0.70;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primer-accent-subtle text-primer-accent-fg">
              <Brain className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-primer-fg-default">
              Микронавык диагностикасы
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted space-y-1.5">
            <div className="text-primer-fg-muted font-semibold">Оқушы:</div>
            <div className="font-bold text-primer-fg-default text-sm">{student.student_name}</div>
            <div className="text-[11px] font-mono text-primer-fg-muted">
              Рейтинг: {student.rank} ({student.current_elo} ELO)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted space-y-1.5">
            <div className="text-primer-fg-muted font-semibold">Тақырып / Навык:</div>
            <div className="font-bold text-primer-fg-default">{skill.nameKZ}</div>
            <div className="text-[11px] font-mono text-primer-fg-muted">Код: {skill.code}</div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-primer-border-default">
            <div>
              <div className="font-semibold text-primer-fg-default">Меңгеру деңгейі:</div>
              <div className="text-[11px] text-primer-fg-muted">Шығарылған есептер бойынша</div>
            </div>

            <Badge variant={isMastered ? 'default' : 'secondary'} className="text-xs font-mono font-bold">
              {Math.round(prob * 100)}% ({isMastered ? 'Меңгерілді' : 'Дефицит'})
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} size="sm" variant="outline" className="text-xs">
            Жабу
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
