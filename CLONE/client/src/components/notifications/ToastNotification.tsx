import React, { useEffect, useState } from 'react';
import {
  Flame,
  Brain,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Zap,
  Volume2,
} from 'lucide-react';
import { NotificationItem } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ToastNotificationProps {
  notification: NotificationItem;
  onClose: (id: string) => void;
  onAction?: (notification: NotificationItem) => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  onAction,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose(notification.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, notification.id, onClose]);

  const getIcon = () => {
    const t = notification.trigger_type || notification.type;
    switch (t) {
      case 'STREAK_SAVER':
      case 'streak_saver':
        return <Flame className="w-5 h-5 text-primer-attention-fg fill-primer-attention-fg animate-bounce" />;
      case 'AGA_REMINDER':
        return <Brain className="w-5 h-5 text-primer-accent-fg animate-pulse" />;
      case 'MEMORY_BURN':
        return <Layers className="w-5 h-5 text-primer-attention-fg" />;
      case 'WEEKLY_DIGEST':
        return <Award className="w-5 h-5 text-primer-success-fg" />;
      default:
        return <Info className="w-5 h-5 text-primer-accent-fg" />;
    }
  };

  const getBorderColor = () => {
    const t = notification.trigger_type || notification.type;
    switch (t) {
      case 'STREAK_SAVER':
      case 'streak_saver':
        return 'border-primer-attention-emphasis/80 bg-primer-attention-subtle/30 shadow-lg';
      case 'AGA_REMINDER':
        return 'border-primer-accent-emphasis/80 bg-primer-accent-subtle/30';
      case 'MEMORY_BURN':
        return 'border-amber-500/80 bg-amber-500/10';
      case 'WEEKLY_DIGEST':
        return 'border-primer-success-emphasis/80 bg-primer-success-subtle/30';
      default:
        return 'border-primer-border-default bg-primer-canvas-overlay';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-3.5 shadow-primer-overlay text-primer-fg-default animate-in slide-in-from-right-4 fade-in duration-200 backdrop-blur-md max-w-sm w-full pointer-events-auto',
        getBorderColor()
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5 shrink-0">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-bold leading-tight truncate">
              {notification.title}
            </span>
            <button
              onClick={() => onClose(notification.id)}
              className="text-primer-fg-muted hover:text-primer-fg-default p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-primer-fg-muted leading-tight mt-0.5">
            {notification.message}
          </p>

          {onAction && (
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAction(notification)}
                className="h-6 text-[10px] px-2 py-0 font-bold gap-1"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Бастау</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Countdown progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primer-border-muted/30">
          <div
            className="h-full bg-primer-accent-emphasis transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
