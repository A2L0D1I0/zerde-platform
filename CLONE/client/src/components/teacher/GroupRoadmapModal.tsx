import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  calendarService,
  CalendarEvent,
  EventColorTag,
  DEFAULT_UNIVERSAL_CATEGORIES,
} from '@/services/calendarService';
import { VectorIcon } from '@/components/common/VectorIcon';

interface GroupRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export const GroupRoadmapModal: React.FC<GroupRoadmapModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [groupEvents, setGroupEvents] = useState<CalendarEvent[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [categoryId, setCategoryId] = useState('deadline');
  const [colorTag, setColorTag] = useState<EventColorTag>('blue');
  const [eloReward, setEloReward] = useState(25);

  const loadEvents = () => {
    const all = calendarService.getEventsForTeacher(user?.id, groupId);
    const filtered = all.filter((e) => e.type === 'teacher_group' && e.targetGroupId === groupId);
    setGroupEvents(filtered);
  };

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen, groupId]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cat = DEFAULT_UNIVERSAL_CATEGORIES.find((c) => c.id === categoryId) || DEFAULT_UNIVERSAL_CATEGORIES[0];

    calendarService.addEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time,
      type: 'teacher_group',
      authorId: user?.id || 'tch_01',
      authorName: user?.full_name || 'Мұғалім',
      authorRole: 'teacher',
      targetGroupId: groupId,
      targetGroupName: groupName,
      isCompleted: false,
      categoryId,
      colorTag,
      vectorIcons: cat.vectorIcons,
      eloReward,
      verificationStatus: 'pending',
    });

    showToast({
      type: 'success',
      title: `${groupName}: Тапсырма тағайындалды! 🚀`,
      message: `${title} — ${date}`,
    });

    setIsAdding(false);
    setTitle('');
    setDescription('');
    loadEvents();
  };

  const handleDelete = (id: string) => {
    calendarService.deleteEvent(id);
    showToast({
      type: 'info',
      title: 'Тапсырма алынып тасталды',
      message: '',
    });
    loadEvents();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 bg-primer-canvas-overlay border border-primer-border-default">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primer-accent-emphasis text-white shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm sm:text-base font-bold text-primer-fg-default">
                  {groupName} сыныбының Роадмапын басқару
                </DialogTitle>
                <Badge variant="accent" className="text-[10px] font-mono">
                  {groupEvents.length} тапсырма
                </Badge>
              </div>
              <DialogDescription className="text-[11px] text-primer-fg-muted mt-0.5">
                Мұнда қосылған СОР, СОЧ және ортақ дедлайндар тек осы {groupName} сыныбының оқушыларында автоматты белгіленеді
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Action Bar */}
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primer-fg-default">
                Жоспарланған топтық бақылаулар:
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="gap-1.5 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Жаңа тапсырма / СОР қосу</span>
              </Button>
            </div>
          ) : (
            /* Add Event Form */
            <form onSubmit={handleAddEvent} className="p-3.5 rounded-xl border border-primer-accent-emphasis/50 bg-primer-canvas-inset space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted">
                <span className="text-xs font-bold text-primer-accent-fg">
                  {groupName} сыныбына жаңа тапсырма тағайындау
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-primer-fg-muted hover:text-primer-fg-default cursor-pointer"
                >
                  Жабу
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  Тапсырма немесе СОР атауы *
                </label>
                <Input
                  type="text"
                  placeholder="Мысалы: СОР 2: Тригонометриялық функциялар"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  Түсініктеме / Ескертпе
                </label>
                <Input
                  type="text"
                  placeholder="3-тоқсан бағдарламасы бойынша 5 есеп"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primer-fg-default mb-1">
                    Өткізу күні
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primer-fg-default mb-1">
                    Уақыты
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primer-fg-default">Сыйақы:</span>
                  <select
                    value={eloReward}
                    onChange={(e) => setEloReward(Number(e.target.value))}
                    className="bg-primer-canvas-subtle border border-primer-border-default rounded px-2 py-1 text-xs font-mono font-bold text-primer-success-fg cursor-pointer"
                  >
                    <option value={15}>+15 ELO</option>
                    <option value={20}>+20 ELO</option>
                    <option value={25}>+25 ELO</option>
                    <option value={30}>+30 ELO</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => setIsAdding(false)}
                  >
                    Бас тарту
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="xs"
                    className="font-bold"
                  >
                    Сақтау және Тағайындау
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* List of Group Events */}
          <div className="space-y-2">
            {groupEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-primer-fg-muted rounded-lg border border-dashed border-primer-border-muted bg-primer-canvas-subtle">
                Бұл сыныпқа әзірге ортақ тапсырмалар қосылмаған.
              </div>
            ) : (
              groupEvents.map((evt) => {
                const primaryIcon = evt.vectorIcons?.[0] || 'Clock';

                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-primer-border-default bg-primer-canvas-subtle flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-primer-accent-subtle/40 border border-primer-accent-emphasis/30 text-primer-accent-fg shrink-0 mt-0.5">
                        <VectorIcon name={primaryIcon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-primer-fg-default">
                          {evt.title}
                        </h4>
                        {evt.description && (
                          <p className="text-[11px] text-primer-fg-muted mt-0.5">
                            {evt.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2.5 text-[10px] text-primer-fg-muted mt-1.5 font-mono">
                          <span className="flex items-center gap-1 text-primer-accent-fg font-bold">
                            <CalendarIcon className="w-3 h-3" />
                            {evt.date}
                          </span>
                          {evt.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {evt.time}
                            </span>
                          )}
                          <span className="text-primer-success-fg font-bold">
                            +{evt.eloReward || 25} ELO
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="text-primer-fg-muted hover:text-primer-danger-fg p-1.5 rounded transition cursor-pointer"
                      title="Өшіру"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupRoadmapModal;
