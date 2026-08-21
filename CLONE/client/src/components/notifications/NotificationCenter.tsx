import React, { useState, useEffect } from 'react';
import {
  Bell,
  Flame,
  Brain,
  Layers,
  Award,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Mail,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { NotificationItem, WeeklyDigestData } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { userProgressService } from '@/services/userProgressService';
import api from '@/api/client';

interface NotificationCenterProps {
  onOpenTrainer?: (topicId?: string) => void;
  onOpenStreakSaver?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onOpenTrainer,
  onOpenStreakSaver,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'triggers'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Weekly Digest Modal state
  const [isDigestOpen, setIsDigestOpen] = useState<boolean>(false);
  const [digestData, setDigestData] = useState<WeeklyDigestData | null>(null);
  const [isLoadingDigest, setIsLoadingDigest] = useState<boolean>(false);

  // Fallback initial data in case server is not running
  const initialFallbackNotifs: NotificationItem[] = [
    {
      id: 'notif_streak_01',
      title: '🔥 Стрикті сақтап қал! (Streak Saver)',
      message: 'Әлихан, сенің 12 күндік стригің түн ортасында сөнеді! 3 минутта экспресс-жаттығуды орындап, оқу серияңды сақтап қал!',
      type: 'STREAK_SAVER',
      trigger_type: 'STREAK_SAVER',
      priority: 'urgent',
      is_read: false,
      action_url: '/trainer',
      metadata: { streak_days: 12, elo_reward: 15 },
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'notif_aga_02',
      title: '🧠 «Аға» наставнигі шақырады',
      message: '«Аға» саған интервалдар әдісі және Ньютон заңдары бойынша 3-минуттық экспресс-фокус дайындап қойды!',
      type: 'AGA_REMINDER',
      trigger_type: 'AGA_REMINDER',
      priority: 'high',
      is_read: false,
      action_url: '/trainer',
      metadata: { topic_title: 'Ньютонның екінші заңы' },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'notif_memory_03',
      title: '🎴 Формулалар жадыңнан өшуде! (Memory Burn)',
      message: '1-тоқсандағы 3 негізгі формула жадыңнан өшуге жақын! Қайталауға небәрі 1 минут жеткілікті.',
      type: 'MEMORY_BURN',
      trigger_type: 'MEMORY_BURN',
      priority: 'high',
      is_read: false,
      action_url: '/student',
      metadata: { formulas_count: 3 },
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'notif_digest_04',
      title: '🏆 Апталық оқу дайджесті',
      message: 'Осы аптада сен +45 ELO жинап, сыныптағы ТОП-3 қатарына ендің! Нәтижеңді тексер.',
      type: 'WEEKLY_DIGEST',
      trigger_type: 'WEEKLY_DIGEST',
      priority: 'normal',
      is_read: false,
      action_url: '/student',
      metadata: { elo_reward: 45, top_rank: 3 },
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ notifications: NotificationItem[]; unread_count: number }>('/notifications');
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count || 0);
      } else {
        setNotifications(initialFallbackNotifs);
        setUnreadCount(initialFallbackNotifs.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.warn('[NotificationCenter] Using local fallback notifications');
      setNotifications(initialFallbackNotifs);
      setUnreadCount(initialFallbackNotifs.filter((n) => !n.is_read).length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (_) {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
    } catch (_) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    showToast({
      type: 'info',
      title: 'Барлық хабарламалар оқылды',
      message: 'Все уведомления отмечены как прочитанные',
    });
  };

  const handleOpenDigest = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsLoadingDigest(true);
      setIsDigestOpen(true);
      const res = await api.get<WeeklyDigestData>('/notifications/weekly-digest');
      if (res) {
        setDigestData(res);
      }
    } catch (err) {
      const p = userProgressService.getState();
      setDigestData({
        user_id: user?.id || 'current_user',
        student_name: user?.full_name || 'Оқушы',
        week_range: new Date().toLocaleDateString(),
        elo_earned: 10,
        current_elo: p.elo || 1000,
        class_rank: 1,
        total_students: 1,
        streak_maintained: p.streakDays || 0,
        tasks_completed: p.solvedTasksCount || 0,
        retention_rate: 100,
        mastered_skills: p.masteredTopicIds.length > 0 ? p.masteredTopicIds : ['Негізгі академиялық дағдылар'],
        focus_next_week: 'Академиялық оқу бағдарламасының жаңа тақырыптары',
        mentor_quote: '«Табандылық пен күнделікті 3 минуттық фокус — үлкен жеңістердің баспалдағы. Алға ұмтыл!» — «Аға» наставнигі',
        html_template: '',
      });
    } finally {
      setIsLoadingDigest(false);
    }
  };

  const handleSimulateTrigger = async (type: 'STREAK_SAVER' | 'AGA_REMINDER' | 'MEMORY_BURN' | 'WEEKLY_DIGEST') => {
    try {
      const res = await api.post<{ notification: NotificationItem }>('/notifications/trigger-simulation', { type });
      if (res && res.notification) {
        setNotifications((prev) => [res.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        showToast({
          type: type === 'STREAK_SAVER' ? 'attention' : 'success',
          title: res.notification.title,
          message: res.notification.message,
        });
      }
    } catch (err) {
      showToast({
        type: 'attention',
        title: `Триггер: ${type}`,
        message: 'Психологиялық хабарлама симуляцияланды',
      });
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }

    if (notif.trigger_type === 'STREAK_SAVER' || notif.type === 'STREAK_SAVER') {
      if (onOpenStreakSaver) {
        onOpenStreakSaver();
      } else if (onOpenTrainer) {
        onOpenTrainer();
      }
    } else if (notif.trigger_type === 'AGA_REMINDER') {
      if (onOpenTrainer) onOpenTrainer();
    } else if (notif.trigger_type === 'WEEKLY_DIGEST') {
      handleOpenDigest();
    } else if (notif.trigger_type === 'MEMORY_BURN') {
      if (onOpenTrainer) onOpenTrainer();
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'triggers') {
      return ['STREAK_SAVER', 'AGA_REMINDER', 'MEMORY_BURN', 'WEEKLY_DIGEST', 'streak_saver'].includes(n.type || n.trigger_type || '');
    }
    return true;
  });

  const getTriggerIcon = (notif: NotificationItem) => {
    const t = notif.trigger_type || notif.type;
    switch (t) {
      case 'STREAK_SAVER':
      case 'streak_saver':
        return <Flame className="w-4 h-4 text-primer-attention-fg fill-primer-attention-fg shrink-0" />;
      case 'AGA_REMINDER':
        return <Brain className="w-4 h-4 text-primer-accent-fg shrink-0" />;
      case 'MEMORY_BURN':
        return <Layers className="w-4 h-4 text-primer-attention-fg shrink-0" />;
      case 'WEEKLY_DIGEST':
        return <Award className="w-4 h-4 text-primer-success-fg shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-primer-fg-muted shrink-0" />;
    }
  };

  const getTriggerBadge = (notif: NotificationItem) => {
    const t = notif.trigger_type || notif.type;
    switch (t) {
      case 'STREAK_SAVER':
      case 'streak_saver':
        return <Badge variant="attention" className="text-[9px] py-0">🔥 Streak Saver</Badge>;
      case 'AGA_REMINDER':
        return <Badge variant="accent" className="text-[9px] py-0">🧠 «Аға» шақыруы</Badge>;
      case 'MEMORY_BURN':
        return <Badge variant="secondary" className="text-[9px] py-0">🎴 Memory Burn</Badge>;
      case 'WEEKLY_DIGEST':
        return <Badge variant="done" className="text-[9px] py-0">🏆 Дайджест</Badge>;
      default:
        return null;
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Жаңа';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Дәл қазір';
    if (mins < 60) return `${mins} мин бұрын`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} сағ бұрын`;
    const days = Math.floor(hours / 24);
    return `${days} күн бұрын`;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-primer-fg-muted hover:text-primer-fg-default focus:ring-1 focus:ring-primer-accent-emphasis"
            aria-label="Хабарламалар орталығы (Notifications)"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primer-attention-fg text-primer-canvas-default text-[10px] font-bold font-mono flex items-center justify-center ring-2 ring-primer-canvas-default animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-primer-overlay">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-primer-canvas-subtle border-b border-primer-border-default">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primer-fg-default">
                Хабарламалар орталығы
              </span>
              {unreadCount > 0 && (
                <Badge variant="attention" className="text-[10px] py-0 font-mono">
                  {unreadCount} жаңа
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-primer-accent-fg hover:underline cursor-pointer font-medium"
                >
                  Оқылды деп белгілеу
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-primer-canvas-inset border-b border-primer-border-muted text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded transition ${
                filter === 'all'
                  ? 'bg-primer-canvas-default font-bold text-primer-fg-default shadow-primer-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Барлығы ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 py-0.5 rounded transition ${
                filter === 'unread'
                  ? 'bg-primer-canvas-default font-bold text-primer-fg-default shadow-primer-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Оқылмаған ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('triggers')}
              className={`px-2 py-0.5 rounded transition ${
                filter === 'triggers'
                  ? 'bg-primer-canvas-default font-bold text-primer-fg-default shadow-primer-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              🔥 Duolingo Триггерлер
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-primer-border-muted/50 p-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-primer-fg-muted">
                <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>Хабарламалар жоқ</p>
                <p className="text-[10px] text-primer-fg-subtle mt-0.5">Сізде барлық тапсырмалар жаңартылған</p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const isStreak = notif.trigger_type === 'STREAK_SAVER' || notif.type === 'STREAK_SAVER';
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-2.5 rounded-md text-xs transition cursor-pointer flex items-start gap-2.5 ${
                      notif.is_read
                        ? 'bg-transparent hover:bg-primer-canvas-subtle text-primer-fg-muted'
                        : isStreak
                        ? 'bg-primer-attention-subtle/40 border border-primer-attention-muted/60 text-primer-fg-default font-medium'
                        : 'bg-primer-canvas-subtle hover:bg-primer-canvas-inset text-primer-fg-default font-medium border border-primer-border-muted/40'
                    }`}
                  >
                    <div className="pt-0.5">{getTriggerIcon(notif)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[11px] text-primer-fg-default truncate">
                            {notif.title}
                          </span>
                          {getTriggerBadge(notif)}
                        </div>
                        <span className="text-[9px] text-primer-fg-subtle shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-primer-fg-muted leading-tight line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Action buttons embedded */}
                      <div className="mt-1.5 flex items-center justify-between">
                        {isStreak && (
                          <span className="text-[10px] text-primer-attention-fg font-bold flex items-center gap-0.5">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>3 мин қалды • +15 ELO</span>
                          </span>
                        )}

                        {notif.trigger_type === 'WEEKLY_DIGEST' && (
                          <button
                            onClick={handleOpenDigest}
                            className="text-[10px] text-primer-success-fg font-bold hover:underline flex items-center gap-0.5"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Дайджест хатын ашу</span>
                          </button>
                        )}

                        {!notif.is_read && (
                          <button
                            onClick={(e) => markAsRead(notif.id, e)}
                            className="text-[10px] text-primer-fg-subtle hover:text-primer-fg-default ml-auto"
                          >
                            Оқылды
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DropdownMenuSeparator className="m-0" />

          {/* Quick Simulation Bar (Duolingo Trigger Playground) */}
          <div className="p-2 bg-primer-canvas-subtle border-t border-primer-border-default">
            <div className="text-[10px] font-bold text-primer-fg-subtle uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Симуляция триггеров:</span>
              <span className="text-[9px] font-normal text-primer-fg-muted">тест үшін</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => handleSimulateTrigger('STREAK_SAVER')}
                className="px-1.5 py-1 text-[10px] rounded bg-primer-canvas-default hover:bg-primer-attention-subtle border border-primer-border-default text-primer-attention-fg font-bold text-center transition"
                title="Стрикті сақтау қаупі"
              >
                🔥 Стрик
              </button>
              <button
                onClick={() => handleSimulateTrigger('AGA_REMINDER')}
                className="px-1.5 py-1 text-[10px] rounded bg-primer-canvas-default hover:bg-primer-accent-subtle border border-primer-border-default text-primer-accent-fg font-bold text-center transition"
                title="«Аға» наставнигінің шақыруы"
              >
                🧠 «Аға»
              </button>
              <button
                onClick={() => handleSimulateTrigger('MEMORY_BURN')}
                className="px-1.5 py-1 text-[10px] rounded bg-primer-canvas-default hover:bg-primer-attention-subtle border border-primer-border-default text-primer-attention-fg font-bold text-center transition"
                title="Формулалардың сөнуі"
              >
                🎴 Жады
              </button>
              <button
                onClick={() => handleSimulateTrigger('WEEKLY_DIGEST')}
                className="px-1.5 py-1 text-[10px] rounded bg-primer-canvas-default hover:bg-primer-success-subtle border border-primer-border-default text-primer-success-fg font-bold text-center transition"
                title="Апталық дайджест"
              >
                🏆 Дайджест
              </button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Weekly Digest Email Modal */}
      <Dialog open={isDigestOpen} onOpenChange={setIsDigestOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="bg-gradient-to-r from-primer-accent-emphasis to-primer-success-emphasis text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-white/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-sm sm:text-base font-bold text-white">
                    🚀 ZERDE • Апталық Оқу Дайджесті
                  </DialogTitle>
                  <DialogDescription className="text-xs text-white/80">
                    {digestData?.week_range || 'Соңғы 7 күннің қорытындысы'}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            {isLoadingDigest ? (
              <div className="py-8 text-center text-primer-fg-muted">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Дайджест деректері жүктелуде...</p>
              </div>
            ) : digestData ? (
              <>
                <div className="text-sm font-semibold text-primer-fg-default">
                  Сәлем, {digestData.student_name}! 👋
                </div>
                <p className="text-primer-fg-muted leading-relaxed">
                  Өткен аптадағы білім жетістіктерің мен «Аға» наставнигімен бірге орындалған 3-минуттық фокустарыңның қорытындысы:
                </p>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-default text-center">
                    <div className="text-base font-bold font-mono text-primer-accent-fg">
                      +{digestData.elo_earned}
                    </div>
                    <div className="text-[10px] text-primer-fg-subtle uppercase mt-0.5">ELO Өсімі</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-default text-center">
                    <div className="text-base font-bold font-mono text-primer-success-fg">
                      {digestData.current_elo}
                    </div>
                    <div className="text-[10px] text-primer-fg-subtle uppercase mt-0.5">Рейтинг</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-default text-center">
                    <div className="text-base font-bold font-mono text-primer-attention-fg">
                      {digestData.class_rank} / {digestData.total_students}
                    </div>
                    <div className="text-[10px] text-primer-fg-subtle uppercase mt-0.5">Сыныптағы ТОП</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-default text-center">
                    <div className="text-base font-bold font-mono text-primer-attention-fg flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>{digestData.streak_maintained}</span>
                    </div>
                    <div className="text-[10px] text-primer-fg-subtle uppercase mt-0.5">Стрик (күн)</div>
                  </div>
                </div>

                {/* Mastered Skills List */}
                <div className="p-3 rounded-lg bg-primer-success-subtle/30 border border-primer-success-muted/50 space-y-1.5">
                  <div className="font-bold text-primer-success-fg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Осы аптада толық меңгерілген дағдылар:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-primer-fg-default pl-1">
                    {digestData.mastered_skills.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Mentor Quote */}
                <div className="p-3 rounded-lg bg-primer-canvas-subtle border-l-4 border-l-primer-attention-emphasis border-y border-r border-primer-border-default text-primer-attention-fg italic">
                  {digestData.mentor_quote}
                </div>

                {/* Next Week Focus */}
                <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-default">
                  <span className="font-bold text-primer-fg-default">Келесі аптадағы басты фокус: </span>
                  <span className="text-primer-fg-muted">{digestData.focus_next_week}</span>
                </div>
              </>
            ) : null}
          </div>

          <div className="p-3 bg-primer-canvas-subtle border-t border-primer-border-default flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsDigestOpen(false)}>
              Жабу
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDigestOpen(false);
                if (onOpenTrainer) onOpenTrainer();
              }}
              className="gap-1.5 font-bold"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Оқуды жалғастыру (+15 ELO)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
