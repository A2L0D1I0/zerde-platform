import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/context/LanguageContext';
import {
  BookOpen,
  Send,
  CheckCircle2,
  FileText,
  AlertCircle,
  School,
  Sparkles
} from 'lucide-react';
import api from '@/api/client';

interface ApplyCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any | null;
  onApplied?: () => void;
}

export const ApplyCourseModal: React.FC<ApplyCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onApplied
}) => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [motivationText, setMotivationText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!course) return null;

  const charCount = motivationText.trim().length;
  const isValid = charCount >= 10;

  const handleSubmit = async () => {
    if (!isValid) {
      showToast({
        title:
          lang === 'KZ'
            ? 'Мотивациялық хат кем дегенде 10 таңбадан тұруы керек'
            : lang === 'RU'
            ? 'Мотивационное письмо должно содержать минимум 10 символов'
            : 'Motivation letter must be at least 10 characters',
        type: 'attention'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/student/courses/${course.id}/apply`, {
        motivation_text: motivationText.trim()
      });

      showToast({
        title:
          lang === 'KZ'
            ? 'Өтініміңіз оқытушыға сәтті жіберілді! 🎉'
            : lang === 'RU'
            ? 'Заявка успешно отправлена преподавателю! 🎉'
            : 'Application submitted successfully! 🎉',
        type: 'success'
      });

      setMotivationText('');
      onClose();
      if (onApplied) onApplied();
    } catch (err: any) {
      console.error('[ApplyCourseModal] Submit failed', err);
      const errMsg =
        err?.response?.data?.error ||
        err?.message ||
        (lang === 'KZ' ? 'Өтінім жіберу қатесі орын алды' : 'Ошибка отправки заявки');
      showToast({ title: errMsg, type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 pb-2 border-b border-primer-border-muted">
            <div className="p-2 rounded-lg bg-primer-accent-subtle text-primer-accent-fg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-primer-fg-default">
                {lang === 'KZ'
                  ? 'Курсқа қабылдауға өтінім беру'
                  : lang === 'RU'
                  ? 'Подача заявки на зачисление'
                  : 'Course Admission Application'}
              </DialogTitle>
              <p className="text-xs text-primer-fg-muted">
                {lang === 'KZ'
                  ? 'Оқытушы өтінімді қарап, сізді тиісті топқа тағайындайды'
                  : lang === 'RU'
                  ? 'Преподаватель рассмотрит заявку и распределит вас в группу'
                  : 'The teacher will review your application and assign you to a classroom'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Course Summary Card */}
          <div className="p-3.5 rounded-xl bg-primer-canvas-inset border border-primer-border-muted space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{course.icon || '📐'}</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {course.subject || 'Пән'}
              </Badge>
            </div>
            <h4 className="text-sm font-bold text-primer-fg-default">{course.title}</h4>
            <p className="text-[11px] text-primer-fg-muted line-clamp-2">
              {course.description || 'Оқу бағдарламасы бойынша стандартты курс.'}
            </p>
          </div>

          {/* Motivation Letter Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-primer-fg-default flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primer-accent-fg" />
                <span>
                  {lang === 'KZ'
                    ? 'Мотивациялық хат (Неге осы курсқа жазылғыңыз келеді?):'
                    : lang === 'RU'
                    ? 'Мотивационное письмо (Почему вы хотите на этот курс?):'
                    : 'Motivation Statement:'}
                </span>
              </label>
              <span
                className={`text-[10px] font-mono ${
                  isValid ? 'text-primer-success-fg font-bold' : 'text-primer-fg-muted'
                }`}
              >
                {charCount}/10 мин.
              </span>
            </div>

            <textarea
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              placeholder={
                lang === 'KZ'
                  ? 'Мысалы: Олимпиадаға дайындалу үшін теңсіздіктер мен функцияларды терең меңгергім келеді...'
                  : lang === 'RU'
                  ? 'Например: Хочу подтянуть алгебру и подготовиться к олимпиаде...'
                  : 'Explain your motivation to join this course...'
              }
              rows={4}
              maxLength={1000}
              className="w-full text-xs bg-primer-canvas-inset border border-primer-border-default rounded-lg p-3 text-primer-fg-default placeholder-primer-fg-subtle focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-muted">
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs h-8">
              {lang === 'KZ' ? 'Бас тарту' : lang === 'RU' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
              className="text-xs font-bold gap-1.5 h-8 px-4 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? lang === 'KZ'
                    ? 'Жіберілуде...'
                    : 'Отправка...'
                  : lang === 'KZ'
                  ? 'Өтінімді жіберу'
                  : lang === 'RU'
                  ? 'Отправить заявку'
                  : 'Submit Application'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
