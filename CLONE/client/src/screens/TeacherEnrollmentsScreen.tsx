import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseShortCode?: string;
  grade: string;
  school: string;
  currentElo: number;
  date: string;
  avatarInitial: string;
  application_data?: {
    goal: string;
    level: string;
    weekly_hours: string;
    notes?: string;
    agreed_to_rules?: boolean;
  };
  status: string;
}

export const TeacherEnrollmentsScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal State
  const [rejectingApp, setRejectingApp] = useState<ApplicationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/courses/teacher/applications');
      setApplications(res?.applications || []);
    } catch (e) {
      console.warn('Failed to load teacher applications', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (app: ApplicationItem) => {
    setIsProcessing(true);
    try {
      await api.post(`/courses/${app.courseId}/enrollments/${app.studentId}/approve`);
      showToast({
        type: 'success',
        title: language === 'KZ' ? 'Өтініш қабылданды! 🎉' : language === 'RU' ? 'Заявка одобрена! 🎉' : 'Application Approved! 🎉',
        message: `${app.studentName} «${app.courseTitle}» тобына сәтті қосылды.`,
      });
      await loadApplications();
    } catch (e: any) {
      showToast({
        type: 'danger',
        title: t('common.error_occurred'),
        message: e?.message || t('common.failed_to_save'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingApp) return;
    setIsProcessing(true);
    try {
      await api.post(`/courses/${rejectingApp.courseId}/enrollments/${rejectingApp.studentId}/reject`, {
        reason: rejectionReason.trim(),
      });
      showToast({
        type: 'attention',
        title: language === 'KZ' ? 'Өтініш қабылданбады' : language === 'RU' ? 'Заявка отклонена' : 'Application Declined',
        message: `${rejectingApp.studentName} оқушысына хабарлама жіберілді.`,
      });
      setRejectingApp(null);
      setRejectionReason('');
      await loadApplications();
    } catch (e: any) {
      showToast({
        type: 'danger',
        title: t('common.error_occurred'),
        message: e?.message || t('common.failed_to_save'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3.5 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primer-border-muted pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primer-fg-default flex items-center gap-2">
            <Users className="w-6 h-6 text-primer-accent-fg" />
            <span>{language === 'KZ' ? 'Курсқа түскен өтініштер' : language === 'RU' ? 'Заявки на вступление в группы' : 'Course Enrollment Applications'}</span>
          </h1>
          <p className="text-xs text-primer-fg-muted mt-1">
            {language === 'KZ'
              ? 'Оқушылардың анкеталары мен деңгейін тексеріп, топқа қабылдаңыз немесе кері қайтарыңыз'
              : language === 'RU'
              ? 'Просматривайте анкеты учеников, подтверждайте зачисление или отклоняйте заявки'
              : 'Review student applications, approve enrollment or decline requests'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplications}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{language === 'KZ' ? 'Жаңарту' : language === 'RU' ? 'Обновить' : 'Refresh'}</span>
          </Button>
          <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
            {language === 'KZ' ? 'Жаңа өтініштер' : language === 'RU' ? 'Новые заявки' : 'Pending'}:{' '}
            <span className="font-bold text-primer-attention-fg ml-1">{applications.length}</span>
          </Badge>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl border border-primer-border-muted bg-primer-canvas-subtle animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primer-border-default bg-primer-canvas-subtle/50 p-8 sm:p-12 text-center space-y-3 max-w-xl mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-primer-success-subtle text-primer-success-fg flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primer-fg-default">
            {language === 'KZ' ? 'Қаралмаған өтініштер жоқ' : language === 'RU' ? 'Нет ожидающих заявок' : 'No pending applications'}
          </h3>
          <p className="text-xs text-primer-fg-muted">
            {language === 'KZ'
              ? 'Оқушылар сіздің 6 таңбалы курс кодыңыз арқылы өтініш жібергенде осында көрінеді.'
              : language === 'RU'
              ? 'Когда ученики отправят заявки по вашему 6-значному коду курса, они появятся в этом списке.'
              : 'When students submit applications using your 6-character course code, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-primer-border-default hover:border-primer-border-emphasis transition shadow-primer-xs">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Student Info & Course Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primer-border-muted/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-sm">
                      {app.avatarInitial || 'У'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-primer-fg-default">{app.studentName}</h3>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {app.grade}
                        </Badge>
                      </div>
                      <div className="text-xs text-primer-fg-muted flex items-center gap-2">
                        <span>{app.school}</span>
                        <span>•</span>
                        <span className="font-mono text-primer-success-fg font-semibold">{app.currentElo} ELO</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-primer-fg-default flex items-center sm:justify-end gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primer-accent-fg" />
                      <span>{app.courseTitle}</span>
                    </div>
                    {app.courseShortCode && (
                      <span className="font-mono text-[10px] text-primer-fg-subtle">
                        #{app.courseShortCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Google Form Responses Details */}
                {app.application_data && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-primer-canvas-subtle border border-primer-border-muted text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-primer-fg-subtle uppercase font-bold tracking-wider">
                        {language === 'KZ' ? 'Мақсаты' : language === 'RU' ? 'Цель' : 'Goal'}
                      </span>
                      <p className="font-semibold text-primer-fg-default">{app.application_data.goal}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-primer-fg-subtle uppercase font-bold tracking-wider">
                        {language === 'KZ' ? 'Деңгейі' : language === 'RU' ? 'Уровень' : 'Level'}
                      </span>
                      <p className="font-semibold text-primer-fg-default">{app.application_data.level}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-primer-fg-subtle uppercase font-bold tracking-wider">
                        {language === 'KZ' ? 'Апталық уақыт' : language === 'RU' ? 'Время' : 'Commitment'}
                      </span>
                      <p className="font-semibold text-primer-fg-default">{app.application_data.weekly_hours}</p>
                    </div>

                    {app.application_data.notes && (
                      <div className="col-span-1 sm:col-span-3 pt-2 border-t border-primer-border-muted/50 space-y-0.5">
                        <span className="text-[10px] text-primer-fg-subtle uppercase font-bold tracking-wider">
                          {language === 'KZ' ? 'Оқушының хабарламасы' : language === 'RU' ? 'Комментарий оқушы' : 'Note'}
                        </span>
                        <p className="italic text-primer-fg-muted">«{app.application_data.notes}»</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions: Approve / Reject */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectingApp(app)}
                    disabled={isProcessing}
                    className="text-xs text-primer-danger-fg hover:bg-primer-danger-subtle border-primer-border-default hover:border-primer-danger-emphasis transition"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{language === 'KZ' ? 'Қабылдамау' : language === 'RU' ? 'Отклонить' : 'Decline'}</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(app)}
                    disabled={isProcessing}
                    className="text-xs font-bold gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'KZ' ? 'Топқа қабылдау' : language === 'RU' ? 'Принять в группу' : 'Approve Enrollment'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      <Dialog
        open={Boolean(rejectingApp)}
        onOpenChange={(open) => !open && setRejectingApp(null)}
      >
        <DialogContent className="max-w-md font-sans">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-primer-danger-fg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{language === 'KZ' ? 'Өтінішті қабылдамау' : language === 'RU' ? 'Отклонение заявки' : 'Decline Application'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {rejectingApp?.studentName} — {rejectingApp?.courseTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="block text-xs font-semibold text-primer-fg-default">
              {language === 'KZ' ? 'Себебін көрсетіңіз (оқушыға хабарлама барады):' : language === 'RU' ? 'Укажите причину (будет отправлено ученику):' : 'Rejection Reason:'}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder={
                language === 'KZ'
                  ? 'Мысалы: Топ толып қалды, келесі тоқсанды күтіңіз немесе базалық топқа өтініш беріңіз.'
                  : language === 'RU'
                  ? 'Например: Группа набрана, подайте заявку на базовый курс или обратитесь к куратору.'
                  : 'E.g., Group is full or prerequisite missing.'
              }
              className="w-full text-xs rounded-md border border-primer-border-default bg-primer-canvas-inset px-3 py-2 text-primer-fg-default placeholder:text-primer-fg-subtle focus:outline-none focus:ring-1 focus:ring-primer-danger-emphasis"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingApp(null)}
              disabled={isProcessing}
            >
              {language === 'KZ' ? 'Бас тарту' : language === 'RU' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRejectConfirm}
              disabled={isProcessing}
              className="font-bold text-xs"
            >

              {isProcessing
                ? language === 'KZ' ? 'Өңделуде...' : 'Обработка...'
                : language === 'KZ' ? 'Қабылдамауды растау' : language === 'RU' ? 'Подтвердить отказ' : 'Confirm Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherEnrollmentsScreen;
