import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';

interface StreakSaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFocus: () => void;
  streakDays?: number;
  freezeAvailable?: boolean;
}

export const StreakSaverModal: React.FC<StreakSaverModalProps> = ({
  isOpen,
  onClose,
  onStartFocus,
  streakDays = 12,
  freezeAvailable = true,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 42,
    seconds: 15,
  });

  const [freezeUsed, setFreezeUsed] = useState(false);

  // Live countdown to midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleUseFreeze = () => {
    setFreezeUsed(true);
    showToast({
      type: 'info',
      title: '❄️ Streak Freeze белсендірілді!',
      message: 'Бүгінгі стрик сақталды. Бірақ білім дағдысын арттыру үшін 3 минуттық фокусты орындауға кеңес береміз!',
    });
  };

  const name = user?.full_name?.split(' ')[0] || 'Әлихан';

  const formatDigits = (n: number) => String(n).padStart(2, '0');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-attention-muted shadow-primer-overlay">
        {/* Top Flame Banner */}
        <div className="relative bg-gradient-to-b from-primer-attention-subtle via-primer-canvas-overlay to-primer-canvas-overlay p-6 text-center">
          {/* Animated Glow & Fire Icon */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primer-attention-fg/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Flame className="w-10 h-10 text-white fill-white animate-bounce" />
            </div>
          </div>

          {/* Title & Streak Number */}
          <div className="mt-4 space-y-1">
            <Badge variant="attention" className="text-xs font-mono py-0.5 px-3">
              🔥 Duolingo Streak Saver
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-primer-fg-default tracking-tight">
              {language === 'KZ'
                ? `Стрикті сақтап қал, ${name}!`
                : language === 'RU'
                ? `Спаси свой стрик, ${name}!`
                : `Save your streak, ${name}!`}
            </DialogTitle>
            <DialogDescription className="text-xs text-primer-attention-fg font-medium">
              {streakDays} {language === 'KZ' ? 'күндік үздіксіз білім сериясы' : 'дней непрерывного обучения'}
            </DialogDescription>
          </div>

          {/* Midnight Countdown Clock */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primer-canvas-subtle border border-primer-border-default text-xs font-mono font-bold shadow-primer-xs">
            <Clock className="w-3.5 h-3.5 text-primer-danger-fg animate-spin" />
            <span className="text-primer-fg-muted">Түн ортасына дейін:</span>
            <span className="text-primer-danger-fg">
              {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-primer-canvas-subtle border border-primer-border-default leading-relaxed text-primer-fg-muted">
            <p>
              {language === 'KZ'
                ? `Бүгінгі күнді өткізіп алсаң, ${streakDays} күндік үздіксіз еңбегің мен жиналған ELO бонустарың нөлден басталуы мүмкін! «Аға» наставнигі жеңіл 3-минуттық экспресс-фокусты дайындап қойды.`
                : `Если пропустить сегодняшний день, твой стрик в ${streakDays} дней и ELO-бонусы сгорят! Наставник «Аға» уже подготовил легкий 3-минутный фокус.`}
            </p>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-md bg-primer-success-subtle/30 border border-primer-success-muted/40 text-primer-success-fg">
              <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>+15 ELO рейтнг өсімі</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-primer-accent-subtle/30 border border-primer-accent-muted/40 text-primer-accent-fg">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Бар болғаны 3 минут</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                onClose();
                onStartFocus();
              }}
              className="w-full justify-center font-bold text-xs sm:text-sm py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border-none shadow-md gap-2"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>🔥 3 минутта стрикті құтқару (+15 ELO)</span>
            </Button>

            {freezeAvailable && !freezeUsed && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUseFreeze}
                className="w-full justify-center text-xs gap-1.5 text-primer-accent-fg border-primer-accent-muted/50 hover:bg-primer-accent-subtle/20"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Мұз қалқанын қолдану (Streak Freeze ❄️)</span>
              </Button>
            )}

            {freezeUsed && (
              <div className="text-center text-[11px] text-primer-accent-fg font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Streak Freeze белсенді (1 күнге сақталды)</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full text-center text-[11px] text-primer-fg-subtle hover:text-primer-fg-muted pt-1 cursor-pointer"
            >
              Кейінірек еске салу
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
