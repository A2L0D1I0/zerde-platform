import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Flame,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';

export interface CalendarRoadmapProps {
  role?: 'student' | 'teacher';
}

export const CalendarRoadmap: React.FC<CalendarRoadmapProps> = ({
  role = 'student',
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRU = language === 'RU';
  const isEN = language === 'EN';

  const [currentMonthIndex, setCurrentMonthIndex] = useState(7); // August = 7

  const monthsKZ = ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'];
  const monthsRU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekdaysKZ = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'];
  const weekdaysRU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weekdaysEN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const monthLabels = isEN ? monthsEN : isRU ? monthsRU : monthsKZ;
  const weekdayLabels = isEN ? weekdaysEN : isRU ? weekdaysRU : weekdaysKZ;

  const [events, setEvents] = useState<Array<{ id: string; title: string; date: string; time: string; isCompleted: boolean; color: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-08-22');
  const [newTime, setNewTime] = useState('15:00');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any[]>('/calendar');
      if (Array.isArray(res)) {
        setEvents(res);
      }
    } catch (err) {
      console.warn('[CalendarRoadmap] Failed to load calendar events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const toggleEvent = async (id: string) => {
    try {
      const res = await api.patch<any>(`/calendar/${id}/toggle`);
      if (res) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isCompleted: res.isCompleted } : e))
        );
      }
    } catch (err) {
      console.error('Failed to toggle event', err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.post<any>('/calendar', {
        title: newTitle.trim(),
        event_date: newDate,
        event_time: newTime,
        color: 'purple',
      });

      if (res) {
        setEvents((prev) => [...prev, res]);
        setNewTitle('');
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/calendar/${id}`);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primer-border-default pb-3">
        <div>
          <h2 className="text-base font-bold text-primer-fg-default flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primer-accent-fg" />
            <span>
              {role === 'teacher'
                ? isEN
                  ? 'Teacher Central Calendar'
                  : isRU
                  ? 'Единый календарь учителя'
                  : 'Мұғалімнің бірыңғай күнтізбесі'
                : isEN
                ? 'Study Roadmap & Schedule'
                : isRU
                ? 'Учебный роадмап и расписание'
                : 'Оқу роадмапы & Күн тәртібі'}
            </span>
          </h2>
          <p className="text-xs text-primer-fg-muted">
            {role === 'teacher'
              ? isEN
                ? 'Formative/Summative assessment deadlines and lesson plans'
                : isRU
                ? 'Дедлайны СОР/СОЧ и расписание уроков'
                : 'СОР/СОЧ дедлайндары мен сабақ кестесі'
              : isEN
              ? 'Personal study goals and milestones from SQLite database'
              : isRU
              ? 'Персональные задачи и цели обучения из базы SQLite'
              : 'SQLite базасындағы жеке оқу мақсаттарыңыз'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-bold text-primer-fg-default px-2 min-w-[90px] text-center">
            {monthLabels[currentMonthIndex]} 2026
          </span>
          <Button
            onClick={() => setCurrentMonthIndex((prev) => Math.min(11, prev + 1))}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar Mini Grid */}
        <div className="md:col-span-2 rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-primer-fg-muted pb-2 border-b border-primer-border-muted">
            {weekdayLabels.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-08-${day < 10 ? '0' : ''}${day}`;
              const dayEvents = events.filter((e) => e.date === dateStr);
              const isToday = day === 22;

              return (
                <div
                  key={day}
                  onClick={() => {
                    setNewDate(dateStr);
                    setShowAddForm(true);
                  }}
                  className={`p-2 rounded-lg transition font-mono flex flex-col items-center justify-between min-h-[52px] cursor-pointer ${
                    isToday
                      ? 'bg-primer-accent-subtle border border-primer-accent-emphasis font-bold text-primer-accent-fg'
                      : 'bg-primer-canvas-inset border border-primer-border-muted/60 text-primer-fg-default hover:border-primer-accent-muted'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.map((ev, eIdx) => (
                        <span
                          key={eIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            ev.isCompleted ? 'bg-emerald-500' : 'bg-primer-accent-emphasis'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda Events List */}
        <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-primer-border-muted pb-2">
            <h4 className="text-xs font-bold text-primer-fg-default flex items-center gap-1.5">
              <span>{isEN ? 'Agenda' : isRU ? 'Повестка дня' : 'Күн тәртібі'}</span>
              <Flame className="w-3.5 h-3.5 text-primer-danger-fg" />
            </h4>
            <Button
              onClick={() => setShowAddForm((prev) => !prev)}
              size="sm"
              variant="outline"
              className="h-6 text-[10px] gap-1 px-2"
            >
              <Plus className="w-3 h-3" />
              <span>{isEN ? '+ Add' : isRU ? '+ Добавить' : '+ Қосу'}</span>
            </Button>
          </div>

          {/* Add Event Form */}
          {showAddForm && (
            <form onSubmit={handleAddEvent} className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-default space-y-2 text-xs">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={isEN ? 'Task description...' : isRU ? 'Название задачи...' : 'Тапсырма атауы...'}
                className="text-xs h-7"
                autoFocus
              />
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="text-xs h-7"
                />
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="text-xs h-7 w-24"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <Button onClick={() => setShowAddForm(false)} type="button" variant="ghost" size="sm" className="h-6 text-[10px]">
                  {isEN ? 'Cancel' : isRU ? 'Отмена' : 'Бас тарту'}
                </Button>
                <Button type="submit" size="sm" className="h-6 text-[10px]">
                  {isEN ? 'Save' : isRU ? 'Сохранить' : 'Сақтау'}
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="p-4 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isEN ? 'Loading...' : isRU ? 'Загрузка...' : 'Жүктелуде...'}</span>
            </div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-xs text-primer-fg-muted">
              {isEN ? 'No scheduled events' : isRU ? 'Нет запланированных задач' : 'Сақталған оқиғалар жоқ'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => toggleEvent(evt.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start justify-between gap-2 group ${
                    evt.isCompleted
                      ? 'bg-primer-canvas-inset border-primer-border-muted text-primer-fg-muted line-through opacity-70'
                      : 'bg-primer-canvas-inset border-primer-border-default text-primer-fg-default hover:border-primer-accent-emphasis'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${evt.isCompleted ? 'text-emerald-500' : 'text-primer-border-default'}`} />
                    <div className="space-y-0.5">
                      <div className="font-semibold">{evt.title}</div>
                      <div className="text-[10px] font-mono text-primer-fg-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteEvent(evt.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-primer-danger-fg p-1 hover:bg-primer-danger-subtle/30 rounded transition-opacity"
                    title={isEN ? 'Delete' : isRU ? 'Удалить' : 'Жою'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarRoadmap;
