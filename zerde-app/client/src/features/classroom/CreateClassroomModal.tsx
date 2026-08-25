import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, School, Plus, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomCreated: (classroom: { id: number; name: string; school: string; student_count: number }) => void;
}

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  onClose,
  onClassroomCreated,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickPresets = ['9 «А»', '9 «Б»', '10 «А»', '10 «Б»', 'Олимпиадники'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError(t('teacher.classroom_name_label'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res: any = await api.post('/teacher/classrooms', {
        name: className.trim(),
      });

      const created = (res && res.data) ? res.data : res;
      if (created && created.id) {
        onClassroomCreated({
          id: created.id,
          name: created.name,
          school: created.school,
          student_count: 0,
        });
        setClassName('');
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to create classroom:', err);
      setError(err?.response?.data?.error || 'Сыныпты құру кезінде қате орын алды.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] bg-primer-canvas-default border-primer-border-default shadow-primer-xl">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primer-accent-emphasis text-white flex items-center justify-center font-bold shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <DialogTitle className="text-base font-bold text-primer-fg-default">
            {t('teacher.create_classroom_title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-primer-fg-muted">
            {t('teacher.create_classroom_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primer-fg-default block">
              {t('teacher.classroom_name_label')}
            </label>
            <Input
              type="text"
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('teacher.classroom_name_placeholder')}
              className="text-xs font-medium bg-primer-canvas-inset border-primer-border-default focus:border-primer-accent-emphasis"
              autoFocus
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setClassName(preset);
                    if (error) setError(null);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-mono transition cursor-pointer ${
                    className === preset
                      ? 'bg-primer-accent-emphasis text-white border-primer-accent-emphasis'
                      : 'bg-primer-canvas-subtle text-primer-fg-muted border-primer-border-default hover:text-primer-fg-default'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {error && <p className="text-[11px] text-primer-danger-fg font-medium pt-1">{error}</p>}
          </div>

          {user?.school && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-muted text-xs text-primer-fg-muted">
              <School className="w-4 h-4 text-primer-accent-fg shrink-0" />
              <span>{user.school}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-muted">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              {t('teacher.cancel_btn')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !className.trim()}
              className="text-xs gap-1.5 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('teacher.loading_data')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('teacher.create_submit_btn')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default CreateClassroomModal;
