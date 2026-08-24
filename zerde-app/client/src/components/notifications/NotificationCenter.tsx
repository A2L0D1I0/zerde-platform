import React, { useState, useEffect } from 'react';
import { Bell, Flame, Brain, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/client';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  time: string;
}

interface NotificationCenterProps {
  onOpenTrainer?: (topicId?: string) => void;
  onOpenStreakSaver?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onOpenTrainer,
  onOpenStreakSaver,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRU = language === 'RU';
  const isEN = language === 'EN';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.get<NotificationItem[]>(`/notifications?userId=${user.id}`);
      if (Array.isArray(res)) {
        setNotifications(res);
      }
    } catch (err) {
      console.warn('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.post('/notifications/mark-all-read', { userId: user?.id });
    } catch (e) {
      // ignore
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch (e) {
        // ignore
      }
    }

    if (n.type === 'streak' && onOpenStreakSaver) onOpenStreakSaver();
    if (n.type === 'tutor' && onOpenTrainer) onOpenTrainer();
  };

  const titleText = isRU ? 'Уведомления' : isEN ? 'Notifications' : 'Хабарландырулар';
  const markReadText = isRU ? 'Отметить все как прочитанные' : isEN ? 'Mark all as read' : 'Оқылды деп белгілеу';
  const emptyText = isRU ? 'Нет новых уведомлений' : isEN ? 'No new notifications' : 'Жаңа хабарландыру жоқ';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-1.5 rounded-lg text-primer-fg-muted hover:text-primer-fg-default hover:bg-primer-canvas-subtle transition-colors cursor-pointer"
          title={titleText}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primer-danger-fg ring-2 ring-primer-canvas-default" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-2 space-y-1.5">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-primer-border-muted">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-primer-fg-default">{titleText}</span>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] h-4 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-primer-accent-fg hover:underline cursor-pointer"
            >
              {markReadText}
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pt-1">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Жүктелуде...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-primer-fg-muted">
              {emptyText}
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-2.5 rounded-lg text-xs transition cursor-pointer border ${
                  n.isRead
                    ? 'bg-primer-canvas-inset/40 border-transparent text-primer-fg-muted'
                    : 'bg-primer-canvas-subtle border-primer-border-default text-primer-fg-default hover:border-primer-accent-emphasis'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                  {n.type === 'streak' ? <Flame className="w-3.5 h-3.5 text-primer-danger-fg" /> : <Brain className="w-3.5 h-3.5 text-primer-accent-fg" />}
                  <span>{n.title}</span>
                </div>
                <p className="text-[11px] text-primer-fg-muted leading-tight">{n.message}</p>
                <span className="text-[10px] text-primer-fg-subtle font-mono mt-1 block">{n.time}</span>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
