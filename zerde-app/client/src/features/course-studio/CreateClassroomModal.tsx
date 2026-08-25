import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { Users, X, PlusCircle } from 'lucide-react';
import api from '@/api/client';

interface CreateClassroomModalProps {
  isOpen: boolean;
  courseId: number;
  courseTitle: string;
  onClose: () => void;
  onClassroomCreated: (newClassroom: any) => void;
}

const PRESET_GROUPS = [
  '9 «А»', '9 «Б»', '10 «А»', '10 «Б»', '11 «А»', '11 «Б»',
  'Олимпиадники (Advanced)', 'Интенсив (Mid-Quarter)', 'Тереңдетілген топ'
];

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  courseId,
  courseTitle,
  onClose,
  onClassroomCreated,
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [name, setName] = useState('10 «Б»');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res: any = await api.post(`/courses/${courseId}/classrooms`, {
        name: name.trim(),
      });
      const newCls = (res && res.data) ? res.data : res;
      showToast({
        title: lang === 'KZ' ? `«${name}» тобы құрылды!` : `Группа «${name}» создана!`,
        type: 'success'
      });
      onClassroomCreated(newCls);
      onClose();
    } catch (err: any) {
      showToast({
        title: lang === 'KZ' ? 'Топ құру қатесі' : 'Ошибка создания группы',
        type: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-overlay max-w-md w-full p-5 space-y-4 shadow-primer-xl text-primer-fg-default">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-primer-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center text-base">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primer-fg-default">
                {lang === 'KZ' ? 'Жаңа оқу тобын ашу' : lang === 'RU' ? 'Создать учебную группу' : 'Create Class Group'}
              </h3>
              <p className="text-[11px] text-primer-fg-muted truncate max-w-[220px]">
                {courseTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-primer-fg-muted hover:text-primer-fg-default hover:bg-primer-canvas-subtle transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-1.5 text-xs">
          <label className="text-[11px] font-bold text-primer-fg-muted">
            {lang === 'KZ' ? 'Дайын үлгілер:' : 'Быстрый выбор:'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_GROUPS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setName(preset)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                  name === preset
                    ? 'bg-primer-accent-emphasis text-white border-primer-accent-emphasis shadow-xs'
                    : 'bg-primer-canvas-subtle border-primer-border-default text-primer-fg-default hover:border-primer-accent-emphasis'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Сынып / Топ атауы:' : 'Название группы:'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Мысалы: 10 «А»..."
              required
              className="h-9 text-xs bg-primer-canvas-inset border-primer-border-default text-primer-fg-default placeholder-primer-fg-muted focus:border-primer-accent-emphasis"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-default">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              {lang === 'KZ' ? 'Бас тарту' : 'Отмена'}
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="h-8 text-xs font-bold gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (lang === 'KZ' ? 'Құрылуда...' : 'Создание...') : (lang === 'KZ' ? 'Топты ашу' : 'Создать группу')}</span>
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateClassroomModal;
