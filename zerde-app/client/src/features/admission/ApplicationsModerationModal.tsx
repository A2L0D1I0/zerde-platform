import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Flame,
  BookOpen,
  MessageSquare,
  School,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '@/api/client';

export interface ApplicationItem {
  application_id: number;
  course_id: number;
  student_id: number;
  status: 'applied' | 'pending_approval' | 'enrolled' | 'rejected' | 'completed';
  motivation_text: string;
  assigned_classroom_id: number | null;
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  student_name: string;
  student_email: string;
  grade: number;
  school: string;
  streak_days: number;
  subject_elo: number;
  rank_tier: string;
}

interface ApplicationsModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: number;
  classrooms?: Array<{ id: number; name: string }>;
  onUpdated?: () => void;
}

export const ApplicationsModerationModal: React.FC<ApplicationsModerationModalProps> = ({
  isOpen,
  onClose,
  courseId = 1,
  classrooms = [],
  onUpdated
}) => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedClassMap, setSelectedClassMap] = useState<Record<number, number>>({});
  const [rejectionPromptId, setRejectionPromptId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const loadApplications = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const res: any = await api.get(`/teacher/courses/${courseId}/applications`);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setApplications(list);

      // Initialize default classroom selections
      const defaultClsId = classrooms.length > 0 ? classrooms[0].id : 1;
      const map: Record<number, number> = {};
      list.forEach((app: ApplicationItem) => {
        map[app.application_id] = app.assigned_classroom_id || defaultClsId;
      });
      setSelectedClassMap(map);
    } catch (err) {
      console.error('[ApplicationsModal] Load failed', err);
      showToast({ title: 'Өтінімдерді жүктеу қатесі', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, courseId]);

  const handleModerate = async (appId: number, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(appId);
    try {
      const targetClassroomId = selectedClassMap[appId] || (classrooms[0]?.id || 1);
      await api.post(`/teacher/courses/${courseId}/applications/${appId}/moderate`, {
        action,
        assigned_classroom_id: action === 'approve' ? targetClassroomId : undefined,
        rejection_reason: reason || ''
      });

      showToast({
        title: action === 'approve' ? 'Оқушы курсқа сәтті зачислялся!' : 'Өтінім қабылданбады',
        type: action === 'approve' ? 'success' : 'attention'
      });

      setRejectionPromptId(null);
      setRejectionReason('');
      await loadApplications();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      console.error('[ApplicationsModal] Moderate failed', err);
      showToast({ title: 'Модерация қатесі орын алды', type: 'danger' });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApps = applications.filter((a) => a.status === 'applied' || a.status === 'pending_approval');
  const processedApps = applications.filter((a) => a.status === 'enrolled' || a.status === 'rejected');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primer-accent-subtle text-primer-accent-fg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-primer-fg-default">
                  Курсқа қабылдау өтінімдері (Воронка заявок)
                </DialogTitle>
                <p className="text-xs text-primer-fg-muted">
                  Мотивациялық хаттарды тексеру, топқа (сыныпқа) бөлу және зачисление
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={loadApplications} disabled={isLoading} className="text-xs gap-1">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Жаңарту</span>
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-primer-fg-muted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primer-accent-fg" />
            <span>Өтінімдер жүктелуде...</span>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* 1. Pending Applications Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primer-attention-fg" />
                  <span>Қаралуды күтудегі өтінімдер ({pendingApps.length})</span>
                </h4>
                {pendingApps.length > 0 && (
                  <Badge variant="attention" className="text-[10px]">
                    Жаңа соискательдер
                  </Badge>
                )}
              </div>

              {pendingApps.length === 0 ? (
                <div className="p-6 rounded-xl bg-primer-canvas-subtle border border-primer-border-muted text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-primer-success-fg mx-auto" />
                  <p className="text-xs font-semibold text-primer-fg-default">Қарастырылмаған өтінімдер жоқ</p>
                  <p className="text-[11px] text-primer-fg-muted">Барлық соискательдер модерациядан өткен.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApps.map((app) => {
                    const isRejecting = rejectionPromptId === app.application_id;
                    const isCurrentProcessing = processingId === app.application_id;

                    return (
                      <div
                        key={app.application_id}
                        className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 space-y-3 shadow-primer-xs"
                      >
                        {/* Student Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primer-border-muted pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primer-fg-default">{app.student_name}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {app.grade}-сынып
                              </Badge>
                              <Badge variant="accent" className="text-[10px] font-mono gap-1">
                                <Award className="w-3 h-3" />
                                {app.subject_elo} ELO ({app.rank_tier})
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-primer-fg-muted mt-1">
                              <span className="flex items-center gap-1">
                                <School className="w-3 h-3" />
                                {app.school || 'Мектеп көрсетілмеген'}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-primer-attention-fg">
                                <Flame className="w-3 h-3" />
                                Стрик: {app.streak_days} күн
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-primer-fg-muted font-mono">
                            {new Date(app.requested_at).toLocaleDateString('kk-KZ')}
                          </div>
                        </div>

                        {/* Motivation Text */}
                        <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted space-y-1">
                          <div className="text-[11px] font-semibold text-primer-fg-muted flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-primer-accent-fg" />
                            <span>Мотивациялық хат (Өтінім негіздемесі):</span>
                          </div>
                          <p className="text-xs text-primer-fg-default leading-relaxed italic">
                            «{app.motivation_text || 'Мотивациялық мәтін бос.'}»
                          </p>
                        </div>

                        {/* Moderation Controls */}
                        {isRejecting ? (
                          <div className="p-3 rounded-lg bg-primer-danger-subtle border border-primer-danger-emphasis/30 space-y-2">
                            <div className="text-xs font-semibold text-primer-danger-fg flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Өтінімді қабылдамау себебін жазыңыз:</span>
                            </div>
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Мысалы: Басқа топ толып қалды немесе деңгей сәйкес келмеді..."
                              className="w-full text-xs bg-primer-canvas-inset border border-primer-border-default rounded-md px-2.5 py-1.5 text-primer-fg-default focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectionPromptId(null);
                                  setRejectionReason('');
                                }}
                                className="text-xs h-7"
                              >
                                Бас тарту
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isCurrentProcessing}
                                onClick={() => handleModerate(app.application_id, 'reject', rejectionReason)}
                                className="text-xs h-7 gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Растау</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primer-fg-muted">Топқа тағайындау:</span>
                              <select
                                value={selectedClassMap[app.application_id] || ''}
                                onChange={(e) =>
                                  setSelectedClassMap((prev) => ({
                                    ...prev,
                                    [app.application_id]: Number(e.target.value)
                                  }))
                                }
                                className="text-xs font-bold bg-primer-canvas-inset border border-primer-border-default rounded-md px-2.5 py-1 text-primer-fg-default focus:outline-none"
                              >
                                {classrooms.length === 0 ? (
                                  <option value={1}>Негізгі топ</option>
                                ) : (
                                  classrooms.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isCurrentProcessing}
                                onClick={() => setRejectionPromptId(app.application_id)}
                                className="text-xs text-primer-danger-fg hover:bg-primer-danger-subtle gap-1 h-8"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Қабылдамау</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={isCurrentProcessing}
                                onClick={() => handleModerate(app.application_id, 'approve')}
                                className="text-xs gap-1 h-8 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Қабылдау және Зачислить</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Processed History Section */}
            {processedApps.length > 0 && (
              <div className="pt-4 border-t border-primer-border-muted">
                <h4 className="text-xs font-bold text-primer-fg-muted uppercase tracking-wider mb-2.5">
                  Модерация тарихы ({processedApps.length})
                </h4>
                <div className="divide-y divide-primer-border-muted rounded-xl border border-primer-border-muted bg-primer-canvas-subtle overflow-hidden">
                  {processedApps.map((item) => (
                    <div key={item.application_id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-primer-fg-default">{item.student_name}</span>
                        <span className="text-[11px] text-primer-fg-muted ml-2">({item.grade}-сынып)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'enrolled' ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Қабылданды
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] gap-1">
                            <XCircle className="w-3 h-3" />
                            Қабылданбады
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
