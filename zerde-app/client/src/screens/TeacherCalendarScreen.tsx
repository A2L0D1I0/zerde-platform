import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Users,
  User,
  Sparkles,
  AlertCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Check,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  calendarService,
  CalendarEvent,
  EventColorTag,
  CategoryMeta,
  DEFAULT_UNIVERSAL_CATEGORIES,
} from '@/services/calendarService';
import { VectorIcon } from '@/components/common/VectorIcon';

const COLOR_MAP: Record<EventColorTag, { bg: string; border: string; text: string; badge: string }> = {
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-900/20',
    border: 'border-purple-500/30 dark:border-purple-700/50',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-900/20',
    border: 'border-blue-500/30 dark:border-blue-700/50',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-900/20',
    border: 'border-emerald-500/30 dark:border-emerald-700/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-900/20',
    border: 'border-amber-500/30 dark:border-amber-700/50',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-900/20',
    border: 'border-rose-500/30 dark:border-rose-700/50',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-900/20',
    border: 'border-cyan-500/30 dark:border-cyan-700/50',
    text: 'text-cyan-700 dark:text-cyan-300',
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
};

const I18N = {
  KZ: {
    title: 'Мұғалімнің бірыңғай Роадмап-Күнтізбесі',
    subtitle: 'Барлық сыныптардың СОР/СОЧ кестесі, жеке тапсырмалар және мұғалімнің жұмыс жоспары',
    badgeText: 'Unified Classes Schedule',
    classLabel: 'Сынып:',
    allClasses: 'Барлық сыныптар',
    addPersonalEvent: 'Жеке оқиға (Педсовет/Жоспар)',
    today: 'Бүгін',
    weekdays: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'],
    months: [
      'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
      'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
    ],
    noticeText: 'Ескертпе: Бұл бет мұғалімге барлық сыныптардың бірыңғай жүктемесін шолу үшін арналған (Read-Only). Сыныпқа жаңа СОР/СОЧ тағайындау үшін «Сынып журналы» немесе оқушының «Диагностика» карточкасына өтіңіз.',
    selectedDayTitle: 'Таңдалған күн',
    noEventsDay: 'Бұл күнге жоспарланған оқиға жоқ',
    noEventsSub: 'Педсовет немесе әдістемелік жиналыс қосқыңыз келсе, батырманы басыңыз.',
    verificationQueueTitle: 'Дедлайн верификациясы (Оқушылардың орындалуы)',
    verifyApprove: 'Растау (+ELO)',
    verifyReject: 'Орындалмады',
    noPendingVerifications: 'Барлық дедлайндар тексерілді ✅',
    modalTitle: 'Мұғалімнің жеке оқиғасын қосу',
    modalSub: 'Педсовет, әдістемелік жиын, консультация немесе есеп беру күні',
    fieldTitle: 'Оқиға атауы *',
    fieldDesc: 'Түсініктеме',
    fieldDate: 'Күні',
    fieldTime: 'Уақыты',
    cancel: 'Бас тарту',
    submit: 'Кестеге қосу',
  },
  RU: {
    title: 'Единый Роадмап-Календарь Учителя',
    subtitle: 'Сводное расписание СОР/СОЧ всех классов, индивидуальные задания и личный план',
    badgeText: 'Unified Classes Schedule',
    classLabel: 'Класс:',
    allClasses: 'Все классы',
    addPersonalEvent: 'Личное событие (Педсовет/План)',
    today: 'Сегодня',
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    months: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    noticeText: 'Примечание: Эта вкладка предназначена для сводного обзора нагрузки всех классов (Read-Only). Чтобы назначить новый СОР/СОЧ или задание, перейдите в «Журнал класса» или карточку ученика.',
    selectedDayTitle: 'Выбранный день',
    noEventsDay: 'На этот день запланированных событий нет',
    noEventsSub: 'Если хотите добавить педсовет или методдень, нажмите кнопку добавления.',
    verificationQueueTitle: 'Верификация дедлайнов (Проверка выполнения)',
    verifyApprove: 'Подтвердить (+ELO)',
    verifyReject: 'Не выполнено',
    noPendingVerifications: 'Все дедлайны проверены ✅',
    modalTitle: 'Добавить событие учителя',
    modalSub: 'Педсовет, методическое собрание, консультация или отчетный день',
    fieldTitle: 'Название события *',
    fieldDesc: 'Описание',
    fieldDate: 'Дата',
    fieldTime: 'Время',
    cancel: 'Отмена',
    submit: 'Добавить в расписание',
  },
  EN: {
    title: 'Unified Teacher Roadmap Calendar',
    subtitle: 'Consolidated schedule of all class exams, individual assignments, and teacher schedule',
    badgeText: 'Unified Classes Schedule',
    classLabel: 'Class:',
    allClasses: 'All Classes',
    addPersonalEvent: 'Teacher Event (Meeting/Plan)',
    today: 'Today',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    noticeText: 'Note: This unified view is for workload overview (Read-Only). To assign class milestones or student drills, use the "Class Journal" or student profile.',
    selectedDayTitle: 'Selected Day',
    noEventsDay: 'No events scheduled for this day',
    noEventsSub: 'Click the button above to add a staff meeting or personal memo.',
    verificationQueueTitle: 'Deadline Verification Queue',
    verifyApprove: 'Verify (+ELO)',
    verifyReject: 'Incomplete',
    noPendingVerifications: 'All deadlines verified ✅',
    modalTitle: 'Add Teacher Event',
    modalSub: 'Staff meeting, consultation, or personal planning day',
    fieldTitle: 'Event Title *',
    fieldDesc: 'Notes',
    fieldDate: 'Date',
    fieldTime: 'Time',
    cancel: 'Cancel',
    submit: 'Add to Schedule',
  },
};

export const TeacherCalendarScreen: React.FC<{
  onOpenClassJournal?: (classId: string) => void;
}> = ({ onOpenClassJournal }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const langKey = (language as 'KZ' | 'RU' | 'EN') || 'KZ';
  const tStr = I18N[langKey] || I18N.KZ;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterClass, setFilterClass] = useState<string>('all');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<CalendarEvent[]>([]);

  // Teacher Personal Event Modal
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(selectedDate);
  const [eventTime, setEventTime] = useState('14:00');
  const [eventColorTag, setEventColorTag] = useState<EventColorTag>('rose');

  const loadEvents = () => {
    const teacherEvents = calendarService.getEventsForTeacher(user?.id, filterClass);
    setEvents(teacherEvents);
    const verifications = calendarService.getPendingVerificationsForTeacher(user?.id, filterClass);
    setPendingVerifications(verifications);
  };

  useEffect(() => {
    loadEvents();
    const unsubscribe = calendarService.subscribe(loadEvents);
    return () => unsubscribe();
  }, [filterClass, user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleCreatePersonalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    calendarService.addEvent({
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
      date: eventDate,
      time: eventTime,
      type: 'teacher_personal',
      authorId: user?.id || 'tch_01',
      authorName: user?.full_name || 'Мұғалім',
      authorRole: 'teacher',
      isCompleted: false,
      categoryId: 'personal',
      colorTag: eventColorTag,
      vectorIcons: ['User', 'Star', 'Heart'],
    });

    showToast({
      type: 'success',
      title: 'Мұғалім оқиғасы қосылды',
      message: `${eventTitle} — ${eventDate}`,
    });

    setIsPersonalModalOpen(false);
    setEventTitle('');
    setEventDescription('');
  };

  const handleVerifyEvent = (evt: CalendarEvent, isApproved: boolean) => {
    const res = calendarService.verifyEvent(evt.id, isApproved, user?.id || 'tch_01');
    if (isApproved) {
      showToast({
        type: 'success',
        title: 'Дедлайн расталды! ✅',
        message: `${evt.targetStudentName || evt.targetGroupName} үшін +${res.eloAwarded} ELO бекітілді.`,
      });
    } else {
      showToast({
        type: 'attention',
        title: 'Дедлайн қабылданбады ❌',
        message: 'Тапсырма орындалмаған ретінде белгіленді.',
      });
    }
  };

  const selectedDayEvents = events.filter((evt) => evt.date === selectedDate);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3 space-y-4 animate-in fade-in duration-150">
      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-4 shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primer-accent-emphasis text-white shadow-sm shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-primer-fg-default">
                {tStr.title}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {tStr.badgeText}
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              {tStr.subtitle}
            </p>
          </div>
        </div>

        {/* Group Filter & Teacher Personal Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-primer-canvas-inset px-2.5 py-1.5 rounded-lg border border-primer-border-muted text-xs">
            <Filter className="w-3.5 h-3.5 text-primer-fg-muted" />
            <span className="font-bold text-primer-fg-default">{tStr.classLabel}</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-transparent text-xs font-semibold text-primer-fg-default focus:outline-hidden cursor-pointer"
            >
              <option value="all">{tStr.allClasses}</option>
              <option value="1">9 «А»</option>
              <option value="2">9 «Б»</option>
              <option value="3">10 «А»</option>
              <option value="4">10 «Б»</option>
            </select>
          </div>

          <Button
            onClick={() => {
              setEventDate(selectedDate);
              setIsPersonalModalOpen(true);
            }}
            variant="secondary"
            size="sm"
            className="gap-1.5 font-bold shadow-primer-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{tStr.addPersonalEvent}</span>
          </Button>
        </div>
      </div>

      {/* 2. Teacher Deadline Verification Queue Section */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-3.5 shadow-primer-xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-primer-border-muted">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primer-attention-fg" />
            <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
              {tStr.verificationQueueTitle}
            </h3>
          </div>
          <Badge variant={pendingVerifications.length > 0 ? 'attention' : 'outline'} className="text-[10px] font-mono">
            {pendingVerifications.length} күтуде
          </Badge>
        </div>

        {pendingVerifications.length === 0 ? (
          <div className="py-2 text-center text-xs text-primer-fg-muted">
            {tStr.noPendingVerifications}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pendingVerifications.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-lg border border-primer-border-default bg-primer-canvas-inset flex flex-col justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-primer-fg-default truncate">{evt.title}</span>
                    <Badge variant="accent" className="text-[9px] py-0 shrink-0">
                      +{evt.eloReward || 20} ELO
                    </Badge>
                  </div>
                  <div className="text-[11px] text-primer-fg-muted line-clamp-1">
                    {evt.targetStudentName ? `Оқушы: ${evt.targetStudentName}` : `Сынып: ${evt.targetGroupName}`}
                  </div>
                  <div className="text-[10px] text-primer-fg-subtle font-mono mt-0.5">
                    Дедлайн: {evt.date} {evt.time || ''}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-primer-border-muted/50">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleVerifyEvent(evt, false)}
                    className="text-primer-danger-fg text-[11px] h-6 px-2"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    <span>{tStr.verifyReject}</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleVerifyEvent(evt, true)}
                    className="font-bold text-[11px] h-6 px-2 gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{tStr.verifyApprove}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Calendar Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Calendar Grid (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-4 shadow-primer-xs">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-primer-border-default">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-primer-fg-default">
                {tStr.months[month]} {year}
              </h3>
              <Button
                variant="secondary"
                size="xs"
                onClick={handleToday}
                className="text-xs font-semibold px-2 py-0.5"
              >
                {tStr.today}
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="p-1 h-8 w-8 text-primer-fg-muted hover:text-primer-fg-default"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="p-1 h-8 w-8 text-primer-fg-muted hover:text-primer-fg-default"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-primer-fg-muted py-1.5 border-b border-primer-border-muted/40">
            {tStr.weekdays.map((wd, i) => (
              <span key={wd} className={i >= 5 ? 'text-primer-attention-fg' : ''}>
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[78px] sm:min-h-[92px] rounded-lg bg-primer-canvas-inset/30 border border-transparent p-1.5 opacity-40"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = todayStr === dateStr;

              const dayEvents = events.filter((e) => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[78px] sm:min-h-[92px] rounded-lg p-1.5 transition-all cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'border-primer-accent-emphasis bg-primer-accent-subtle/25 ring-1 ring-primer-accent-emphasis shadow-sm'
                      : isToday
                      ? 'border-primer-attention-muted bg-primer-attention-subtle/20'
                      : 'border-primer-border-muted/60 bg-primer-canvas-inset hover:border-primer-border-default hover:bg-primer-canvas-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-primer-accent-emphasis text-white shadow-xs'
                          : isSelected
                          ? 'text-primer-accent-fg font-extrabold'
                          : 'text-primer-fg-default'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-primer-fg-muted font-bold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const colors = COLOR_MAP[evt.colorTag] || COLOR_MAP.blue;
                      const primaryIcon = evt.vectorIcons?.[0] || 'Target';

                      return (
                        <div
                          key={evt.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 border ${colors.bg} ${colors.border} ${colors.text}`}
                          title={`${evt.title} (${evt.targetGroupName || 'Жалпы'})`}
                        >
                          <VectorIcon name={primaryIcon} className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">
                            {evt.targetGroupName ? `[${evt.targetGroupName}] ` : ''}
                            {evt.title}
                          </span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-primer-fg-muted font-bold text-center">
                        +{dayEvents.length - 2} тағы...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Notice */}
          <div className="p-3 rounded-lg border border-primer-border-muted bg-primer-canvas-inset flex items-start gap-2.5 text-xs text-primer-fg-muted">
            <AlertCircle className="w-4 h-4 text-primer-accent-fg shrink-0 mt-0.5" />
            <span>{tStr.noticeText}</span>
          </div>
        </div>

        {/* Selected Day Agenda (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-16">
          <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-primer-border-default">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primer-fg-muted">
                  {tStr.selectedDayTitle}
                </span>
                <h3 className="text-sm font-bold text-primer-fg-default font-mono mt-0.5">
                  📅 {selectedDate}
                </h3>
              </div>

              <Badge variant="outline" className="text-xs font-mono">
                {selectedDayEvents.length} оқиға
              </Badge>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-primer-fg-muted rounded-lg border border-dashed border-primer-border-muted bg-primer-canvas-inset space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-primer-canvas-subtle flex items-center justify-center border border-primer-border-muted">
                  <CalendarIcon className="w-5 h-5 text-primer-fg-muted" />
                </div>
                <p className="font-semibold text-primer-fg-default">{tStr.noEventsDay}</p>
                <p className="text-[11px]">{tStr.noEventsSub}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayEvents.map((evt) => {
                  const colors = COLOR_MAP[evt.colorTag] || COLOR_MAP.blue;
                  const isPersonal = evt.type === 'teacher_personal';
                  const iconList = evt.vectorIcons || ['Target'];

                  return (
                    <div
                      key={evt.id}
                      className={`relative p-3.5 rounded-xl border space-y-2 overflow-hidden ${colors.bg} ${colors.border}`}
                    >
                      {/* Watermark */}
                      <div className="absolute right-2 bottom-1 flex items-center gap-1.5 opacity-10 dark:opacity-15 pointer-events-none select-none">
                        {iconList.map((iconName, idx) => (
                          <VectorIcon key={idx} name={iconName} className="w-8 h-8 text-current stroke-[1.5]" />
                        ))}
                      </div>

                      <div className="relative z-10 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="p-1 rounded-md bg-primer-canvas-subtle border border-primer-border-default/60 shrink-0 mt-0.5">
                            <VectorIcon name={iconList[0]} className="w-3.5 h-3.5 text-primer-fg-default" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-primer-fg-default">
                              {evt.title}
                            </h4>
                            {evt.description && (
                              <p className="text-[11px] text-primer-fg-muted mt-0.5 leading-relaxed">
                                {evt.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                              {evt.type === 'teacher_group' && (
                                <Badge variant="accent" className="text-[9px] py-0">
                                  <Users className="w-2.5 h-2.5 mr-0.5" />
                                  <span>Сынып: {evt.targetGroupName || '9 «А»'}</span>
                                </Badge>
                              )}

                              {evt.type === 'teacher_student' && (
                                <Badge variant="attention" className="text-[9px] py-0">
                                  <User className="w-2.5 h-2.5 mr-0.5" />
                                  <span>Оқушы: {evt.targetStudentName || 'Жеке'}</span>
                                </Badge>
                              )}

                              {evt.type === 'teacher_personal' && (
                                <Badge variant="secondary" className="text-[9px] py-0">
                                  <span>Мұғалімнің жеке жоспары</span>
                                </Badge>
                              )}

                              {evt.time && (
                                <span className="flex items-center gap-1 text-primer-fg-muted font-mono">
                                  <Clock className="w-3 h-3" />
                                  {evt.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete for teacher personal */}
                        {isPersonal && (
                          <button
                            onClick={() => calendarService.deleteEvent(evt.id)}
                            className="relative z-10 text-primer-fg-muted hover:text-primer-danger-fg p-1 transition cursor-pointer"
                            title="Өшіру"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Teacher Personal Event Modal */}
      <Dialog open={isPersonalModalOpen} onOpenChange={setIsPersonalModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default">
              {tStr.modalTitle}
            </DialogTitle>
          </div>

          <form onSubmit={handleCreatePersonalEvent} className="p-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.fieldTitle}
              </label>
              <Input
                type="text"
                placeholder="Мысалы: 9-сыныптар бойынша әдістемелік жиналыс"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {tStr.fieldDesc}
              </label>
              <Input
                type="text"
                placeholder="Күн тәртібі: 3-тоқсан СОР/СОЧ қорытындылары"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  {tStr.fieldDate}
                </label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  {tStr.fieldTime}
                </label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsPersonalModalOpen(false)}
              >
                {tStr.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tStr.submit}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherCalendarScreen;
