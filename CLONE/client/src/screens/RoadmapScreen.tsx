import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { StudentRoadmapData, RoadmapMilestone } from '@/types';
import { studentService } from '@/services/studentService';
import { SocraticTrainerModal } from '@/components/student/SocraticTrainerModal';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles,
  Award,
  ChevronRight,
  Play,
  Calendar,
  AlertCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';

export type ExamType = 'ent' | 'sor_soch' | 'olympiad';

export const RoadmapScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedExam, setSelectedExam] = useState<ExamType>('ent');
  const [roadmapData, setRoadmapData] = useState<StudentRoadmapData | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<RoadmapMilestone | null>(null);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const [trainerTopic, setTrainerTopic] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 74,
    hours: 14,
    minutes: 25,
    seconds: 40,
  });

  useEffect(() => {
    const loadRoadmap = async () => {
      const data = await studentService.getRoadmap(user?.id);
      setRoadmapData(data);
      if (data?.milestones?.length > 0) {
        const inProgress = data.milestones.find((m) => m.status === 'in_progress');
        setSelectedMilestone(inProgress || data.milestones[0]);
      }
    };

    loadRoadmap();
  }, [user]);

  // Live countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const examOptions = [
    {
      id: 'ent' as ExamType,
      title: 'ҰБТ / ЕНТ 2026',
      subtitle: 'Математика + Физика (140 балл)',
      days: 74,
      targetScore: 132,
      currentScore: 94,
    },
    {
      id: 'sor_soch' as ExamType,
      title: 'СОР / СОЧ 3-тоқсан',
      subtitle: 'Алгебра және Геометрия (40 балл)',
      days: 18,
      targetScore: 38,
      currentScore: 32,
    },
    {
      id: 'olympiad' as ExamType,
      title: 'Республикалық Олимпиада',
      subtitle: 'Жәутіков & Облыстық кезең',
      days: 42,
      targetScore: 95,
      currentScore: 78,
    },
  ];

  const currentExamConfig = examOptions.find((e) => e.id === selectedExam) || examOptions[0];

  const handleStartDrill = (title: string) => {
    setTrainerTopic(title);
    setIsTrainerOpen(true);
  };

  const getStatusBadge = (status: RoadmapMilestone['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="done" className="text-[10px] gap-1 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Усвоено ✓</span>
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="success" className="text-[10px] gap-1 py-0.5 animate-pulse">
            <Zap className="w-3 h-3 fill-current" />
            <span>Текущий шаг ●</span>
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="attention" className="text-[10px] gap-1 py-0.5">
            <Clock className="w-3 h-3" />
            <span>Кезекте ○</span>
          </Badge>
        );
      case 'locked':
      default:
        return (
          <Badge variant="secondary" className="text-[10px] gap-1 py-0.5">
            <Lock className="w-3 h-3" />
            <span>Құлыпталған 🔒</span>
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Exam Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-primer-canvas-subtle border border-primer-border-default rounded-xl p-4 shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primer-accent-emphasis text-white shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-primer-fg-default">
                Персоналды Интерактивті Roadmap
              </h2>
              <Badge variant="accent" className="font-mono text-xs">
                AI Trajectory Engine
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted mt-0.5">
              Емтиханға дейінгі жеке дайындық траекториясы мен микронавыктар тізбегі
            </p>
          </div>
        </div>

        {/* Exam Type Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-muted overflow-x-auto">
          {examOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedExam(opt.id);
                showToast({
                  type: 'info',
                  title: `Мақсатты емтихан таңдалды: ${opt.title}`,
                  message: `Мақсат: ${opt.targetScore} балл (${opt.days} күн қалды)`,
                });
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedExam === opt.id
                  ? 'bg-primer-accent-emphasis text-white shadow-xs'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              {opt.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Countdown Timer & Score Trajectory Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Countdown Timer Block (4 of 12 cols) */}
        <div className="md:col-span-4 rounded-xl border border-primer-border-default bg-gradient-to-br from-primer-canvas-subtle to-primer-canvas-inset p-4 shadow-primer-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primer-fg-muted flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primer-attention-fg" />
                <span>Кері санақ таймері</span>
              </span>
              <Badge variant="attention" className="text-[10px] font-mono">
                {currentExamConfig.title}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-primer-fg-default mt-1">
              Емтихан басталуына дейін:
            </h3>
          </div>

          {/* Digital Timer Clock */}
          <div className="grid grid-cols-4 gap-2 text-center py-2">
            <div className="bg-primer-canvas-default border border-primer-border-default rounded-lg p-2 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold font-mono text-primer-attention-fg">
                {timeLeft.days}
              </div>
              <div className="text-[9px] text-primer-fg-muted uppercase tracking-wider mt-0.5">Күн</div>
            </div>
            <div className="bg-primer-canvas-default border border-primer-border-default rounded-lg p-2 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold font-mono text-primer-fg-default">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-[9px] text-primer-fg-muted uppercase tracking-wider mt-0.5">Сағат</div>
            </div>
            <div className="bg-primer-canvas-default border border-primer-border-default rounded-lg p-2 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold font-mono text-primer-fg-default">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-[9px] text-primer-fg-muted uppercase tracking-wider mt-0.5">Мин</div>
            </div>
            <div className="bg-primer-canvas-default border border-primer-border-default rounded-lg p-2 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold font-mono text-primer-accent-fg">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-[9px] text-primer-fg-muted uppercase tracking-wider mt-0.5">Сек</div>
            </div>
          </div>

          <div className="text-[11px] text-primer-fg-muted flex items-center justify-between pt-1 border-t border-primer-border-muted/50">
            <span>Күнделікті қажетті уақыт:</span>
            <strong className="text-primer-success-fg font-mono">15-20 мин/күн</strong>
          </div>
        </div>

        {/* Score Trajectory Graph Block (8 of 12 cols) */}
        <div className="md:col-span-8 rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primer-success-fg" />
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                Балл траекториясы: {currentExamConfig.currentScore} → {currentExamConfig.targetScore} балл
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primer-fg-muted font-mono">
                ИИ болжам сенімділігі: <strong className="text-primer-success-fg">94%</strong>
              </span>
            </div>
          </div>

          {/* Visual SVG Trajectory Chart */}
          <div className="relative w-full h-32 bg-primer-canvas-inset rounded-lg border border-primer-border-muted p-2 overflow-hidden flex items-end">
            {/* Target & Grant Threshold Dashed Lines */}
            <div className="absolute top-4 left-0 right-0 border-b border-dashed border-primer-success-emphasis/60 flex items-center justify-end px-2">
              <span className="text-[9px] font-mono text-primer-success-fg bg-primer-canvas-default px-1.5 py-0.5 rounded border border-primer-border-muted">
                Мақсатты балл: {currentExamConfig.targetScore} (Грант шегі)
              </span>
            </div>
            <div className="absolute top-14 left-0 right-0 border-b border-dashed border-primer-attention-emphasis/40 flex items-center justify-end px-2">
              <span className="text-[9px] font-mono text-primer-attention-fg bg-primer-canvas-default px-1.5 py-0.5 rounded border border-primer-border-muted">
                Аралық меже: 110 балл
              </span>
            </div>

            {/* Trajectory Points & Polyline */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="roadmapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8250df" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#1f6feb" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#238636" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#238636" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#238636" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path
                d="M 20 85 L 120 70 L 250 55 L 370 35 L 480 15 L 480 100 L 20 100 Z"
                fill="url(#areaGrad)"
              />

              {/* Main Line */}
              <path
                d="M 20 85 L 120 70 L 250 55 L 370 35 L 480 15"
                fill="none"
                stroke="url(#roadmapGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Point 1: Baseline */}
              <circle cx="20" cy="85" r="5" fill="#8250df" stroke="#ffffff" strokeWidth="2" />
              {/* Point 2: Passed */}
              <circle cx="120" cy="70" r="5" fill="#8250df" stroke="#ffffff" strokeWidth="2" />
              {/* Point 3: Current */}
              <circle cx="250" cy="55" r="7" fill="#3fb950" stroke="#ffffff" strokeWidth="2.5" />
              {/* Point 4: Upcoming */}
              <circle cx="370" cy="35" r="5" fill="#1f6feb" stroke="#ffffff" strokeWidth="2" />
              {/* Point 5: Target */}
              <circle cx="480" cy="15" r="6" fill="#238636" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Labels below points */}
            <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-mono text-primer-fg-muted">
              <span>Бастапқы: 94</span>
              <span>СОР 1: 104</span>
              <span className="font-bold text-primer-success-fg">Қазір: 118 ●</span>
              <span>Пробный 3: 125</span>
              <span className="font-bold text-primer-done-fg">Мақсат: 132 ⭐</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Interactive Checkpoints Milestone Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Milestones Stepper List (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-primer-border-default">
            <div>
              <h3 className="text-sm font-bold text-primer-fg-default">
                Дайындық кезеңдері мен белестері
              </h3>
              <p className="text-[11px] text-primer-fg-muted">
                Рет-ретімен ашылатын бақылау нүктелері
              </p>
            </div>
            <span className="text-xs font-mono text-primer-success-fg font-bold">
              {roadmapData?.milestones.filter((m) => m.status === 'completed').length || 2} / {roadmapData?.milestones.length || 6} меңгерілді
            </span>
          </div>

          <div className="space-y-2.5">
            {roadmapData?.milestones.map((milestone, idx) => {
              const isSelected = selectedMilestone?.id === milestone.id;

              return (
                <div
                  key={milestone.id}
                  onClick={() => setSelectedMilestone(milestone)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primer-accent-emphasis bg-primer-canvas-subtle ring-1 ring-primer-accent-emphasis shadow-sm'
                      : 'border-primer-border-default bg-primer-canvas-subtle/70 hover:border-primer-border-default hover:bg-primer-canvas-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {milestone.status === 'completed' ? (
                          <div className="w-7 h-7 rounded-full bg-primer-done-subtle text-primer-done-fg border border-primer-done-muted/50 flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                        ) : milestone.status === 'in_progress' ? (
                          <div className="w-7 h-7 rounded-full bg-primer-success-subtle text-primer-success-fg border border-primer-success-muted/50 flex items-center justify-center font-bold text-xs animate-pulse">
                            ●
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primer-canvas-inset text-primer-fg-subtle border border-primer-border-muted flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                            {milestone.title}
                          </h4>
                          {getStatusBadge(milestone.status)}
                        </div>

                        <p className="text-[11px] text-primer-fg-muted mt-1 leading-relaxed line-clamp-2">
                          {milestone.description}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-primer-fg-subtle mt-2">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {milestone.deadline}
                          </span>
                          <span>•</span>
                          <span className="font-mono font-bold text-primer-success-fg">
                            +{milestone.scoreContribution || 15} балл үлесі
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-primer-fg-default">
                        {milestone.mastery}%
                      </div>
                      <div className="w-16 bg-primer-canvas-inset rounded-full h-1.5 overflow-hidden border border-primer-border-muted mt-1">
                        <div
                          className={`h-full rounded-full ${
                            milestone.mastery >= 90
                              ? 'bg-primer-done-emphasis'
                              : milestone.mastery >= 60
                              ? 'bg-primer-success-emphasis'
                              : 'bg-primer-attention-emphasis'
                          }`}
                          style={{ width: `${milestone.mastery}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Detail Inspector (5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-16">
          {selectedMilestone ? (
            <Card className="border-primer-border-default bg-primer-canvas-subtle shadow-primer-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="accent" className="text-[10px]">
                    Белес диагностикасы
                  </Badge>
                  {getStatusBadge(selectedMilestone.status)}
                </div>
                <CardTitle className="text-sm sm:text-base mt-2 font-bold">
                  {selectedMilestone.title}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {selectedMilestone.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Micro-Skills Q-Matrix Breakdown */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
                    Қажетті микронавыктар (Q-Matrix):
                  </div>

                  <div className="space-y-2">
                    {selectedMilestone.microSkills?.map((skill, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-primer-fg-default flex items-center gap-1.5">
                            {skill.mastery >= 90 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primer-done-fg" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 text-primer-attention-fg fill-current" />
                            )}
                            {skill.name}
                          </span>
                          <span className="font-mono text-primer-fg-muted">{skill.mastery}%</span>
                        </div>
                        <div className="w-full bg-primer-canvas-subtle rounded-full h-1.5 overflow-hidden border border-primer-border-muted/50">
                          <div
                            className={`h-full rounded-full ${
                              skill.mastery >= 90
                                ? 'bg-primer-done-emphasis'
                                : skill.mastery >= 60
                                ? 'bg-primer-success-emphasis'
                                : 'bg-primer-attention-emphasis'
                            }`}
                            style={{ width: `${skill.mastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Socratic Action Button */}
                <Button
                  onClick={() => handleStartDrill(selectedMilestone.title)}
                  variant="primary"
                  className="w-full gap-2 font-bold shadow-primer-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Осы тақырып бойынша жаттығуды бастау</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-xs text-primer-fg-muted rounded-xl border border-primer-border-default bg-primer-canvas-subtle">
              Толық ақпаратты көру үшін сол жақтан белесті таңдаңыз.
            </div>
          )}
        </div>

      </div>

      {/* Socratic Trainer Modal */}
      <SocraticTrainerModal
        isOpen={isTrainerOpen}
        onClose={() => setIsTrainerOpen(false)}
        topicTitle={trainerTopic}
      />
    </div>
  );
};
