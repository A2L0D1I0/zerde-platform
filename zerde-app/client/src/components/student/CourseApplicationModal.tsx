import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Course, CourseApplicationData } from '@/types';
import { GraduationCap, Sparkles, CheckCircle2, Clock, Target, BookOpen } from 'lucide-react';

interface CourseApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSubmit: (courseId: string, applicationData: CourseApplicationData) => Promise<void>;
  isLoading?: boolean;
}

export const CourseApplicationModal: React.FC<CourseApplicationModalProps> = ({
  isOpen,
  onClose,
  course,
  onSubmit,
  isLoading = false,
}) => {
  const { t, language, getLocalized } = useLanguage();

  const [goal, setGoal] = useState<string>('ent_prep');
  const [level, setLevel] = useState<string>('intermediate');
  const [weeklyHours, setWeeklyHours] = useState<string>('4_6_hours');
  const [notes, setNotes] = useState<string>('');
  const [agreedToRules, setAgreedToRules] = useState<boolean>(true);

  if (!course) return null;

  const title = getLocalized(course, 'title', course.title);
  const subject = getLocalized(course, 'subject', course.subject);

  const goalOptions = [
    {
      id: 'ent_prep',
      labelKZ: 'ҰБТ / ЕНТ-ға жүйелі дайындық',
      labelRU: 'Системная подготовка к ЕНТ',
      labelEN: 'Systematic UNT / ENT preparation',
      icon: '🎯',
    },
    {
      id: 'school_grades',
      labelKZ: 'Мектеп бағдарламасын күшейту және СОР / СОЧ',
      labelRU: 'Улучшение школьной успеваемости и СОР/СОЧ',
      labelEN: 'School curriculum enhancement & summative assessments',
      icon: '📈',
    },
    {
      id: 'olympiad',
      labelKZ: 'Олимпиадалар мен тереңдетілген тақырыптар',
      labelRU: 'Олимпиады и углубленное изучение предмета',
      labelEN: 'Olympiads and advanced topic exploration',
      icon: '🏆',
    },
    {
      id: 'self_interest',
      labelKZ: 'Жеке қызығушылық және өз бетінше даму',
      labelRU: 'Личный интерес и самостоятельное развитие',
      labelEN: 'Personal interest and self-paced growth',
      icon: '💡',
    },
  ];

  const levelOptions = [
    {
      id: 'beginner',
      labelKZ: '🌱 Бастапқы (Негізгі формулалар мен ережелерді қайталау қажет)',
      labelRU: '🌱 Начальный (Нужно повторить базовые формулы и правила)',
      labelEN: '🌱 Beginner (Need to refresh core formulas and rules)',
    },
    {
      id: 'intermediate',
      labelKZ: '🏔️ Орташа (Стандартты есептерді шығара аламын, күрделісіне көмек керек)',
      labelRU: '🏔️ Средний (Решаю типовые задачи, требуется разбор сложных)',
      labelEN: '🏔️ Intermediate (Solve standard problems, need help with complex ones)',
    },
    {
      id: 'advanced',
      labelKZ: '🦅 Жоғары (Олимпиадалық деңгей, стандартты есептерді оңай шешемін)',
      labelRU: '🦅 Продвинутый (Олимпиадный уровень, высокий темп)',
      labelEN: '🦅 Advanced (Olympiad level, fast-paced mastery)',
    },
  ];

  const weeklyHourOptions = [
    {
      id: '2_3_hours',
      labelKZ: '2–3 сағат / апта',
      labelRU: '2–3 часа в неделю',
      labelEN: '2–3 hours / week',
    },
    {
      id: '4_6_hours',
      labelKZ: '4–6 сағат / апта (Ұсынылады)',
      labelRU: '4–6 часов в неделю (Рекомендуется)',
      labelEN: '4–6 hours / week (Recommended)',
    },
    {
      id: '7_plus_hours',
      labelKZ: '7+ сағат / апта (Интенсив)',
      labelRU: '7+ часов в неделю (Интенсив)',
      labelEN: '7+ hours / week (Intensive)',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToRules) return;

    const selectedGoalObj = goalOptions.find((g) => g.id === goal);
    const selectedLevelObj = levelOptions.find((l) => l.id === level);
    const selectedHoursObj = weeklyHourOptions.find((h) => h.id === weeklyHours);

    const localizedGoal = language === 'KZ' ? selectedGoalObj?.labelKZ : language === 'RU' ? selectedGoalObj?.labelRU : selectedGoalObj?.labelEN;
    const localizedLevel = language === 'KZ' ? selectedLevelObj?.labelKZ : language === 'RU' ? selectedLevelObj?.labelRU : selectedLevelObj?.labelEN;
    const localizedHours = language === 'KZ' ? selectedHoursObj?.labelKZ : language === 'RU' ? selectedHoursObj?.labelRU : selectedHoursObj?.labelEN;

    await onSubmit(course.id, {
      goal: localizedGoal || goal,
      level: localizedLevel || level,
      weekly_hours: localizedHours || weeklyHours,
      notes: notes.trim(),
      agreed_to_rules: agreedToRules,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto font-sans p-6">
        <DialogHeader className="space-y-2 border-b border-primer-border-muted pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="text-xs font-mono">
              {subject}
            </Badge>
            {course.short_code && (
              <span className="text-[11px] font-mono text-primer-fg-muted">
                #{course.short_code}
              </span>
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-primer-fg-default">
            {language === 'KZ'
              ? 'Курсқа жазылу сауалнамасы'
              : language === 'RU'
              ? 'Анкета-заявка на курс'
              : 'Course Application Form'}
          </DialogTitle>
          <DialogDescription className="text-xs text-primer-fg-muted">
            <span className="font-semibold text-primer-fg-default">{title}</span> • {course.teacher_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Question 1: Goal */}
          <div className="space-y-2.5 p-3.5 rounded-lg border border-primer-border-default bg-primer-canvas-subtle">
            <label className="block text-xs font-bold text-primer-fg-default">
              1. {language === 'KZ' ? 'Оқу мақсатыңызды таңдаңыз *' : language === 'RU' ? 'Выберите вашу основную цель *' : 'Select your primary learning goal *'}
            </label>
            <div className="space-y-1.5">
              {goalOptions.map((opt) => {
                const optText = language === 'KZ' ? opt.labelKZ : language === 'RU' ? opt.labelRU : opt.labelEN;
                const isSelected = goal === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-primer-accent-emphasis bg-primer-accent-subtle/40 text-primer-fg-default font-semibold'
                        : 'border-primer-border-muted hover:border-primer-border-default text-primer-fg-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="application_goal"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setGoal(opt.id)}
                      className="text-primer-accent-emphasis focus:ring-primer-accent-emphasis"
                    />
                    <span className="text-sm">{opt.icon}</span>
                    <span className="flex-1">{optText}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question 2: Knowledge Level */}
          <div className="space-y-2.5 p-3.5 rounded-lg border border-primer-border-default bg-primer-canvas-subtle">
            <label className="block text-xs font-bold text-primer-fg-default">
              2. {language === 'KZ' ? 'Пән бойынша ағымдағы деңгейіңіз *' : language === 'RU' ? 'Ваш текущий уровень знаний по предмету *' : 'Your current subject mastery level *'}
            </label>
            <div className="space-y-1.5">
              {levelOptions.map((opt) => {
                const optText = language === 'KZ' ? opt.labelKZ : language === 'RU' ? opt.labelRU : opt.labelEN;
                const isSelected = level === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-primer-accent-emphasis bg-primer-accent-subtle/40 text-primer-fg-default font-semibold'
                        : 'border-primer-border-muted hover:border-primer-border-default text-primer-fg-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="application_level"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setLevel(opt.id)}
                      className="mt-0.5 text-primer-accent-emphasis focus:ring-primer-accent-emphasis"
                    />
                    <span className="flex-1 leading-snug">{optText}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question 3: Weekly Time Commitment */}
          <div className="space-y-2.5 p-3.5 rounded-lg border border-primer-border-default bg-primer-canvas-subtle">
            <label className="block text-xs font-bold text-primer-fg-default">
              3. {language === 'KZ' ? 'Аптасына бөлетін уақытыңыз *' : language === 'RU' ? 'Сколько времени в неделю готовы уделять? *' : 'Weekly time commitment *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {weeklyHourOptions.map((opt) => {
                const optText = language === 'KZ' ? opt.labelKZ : language === 'RU' ? opt.labelRU : opt.labelEN;
                const isSelected = weeklyHours === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition text-center justify-center ${
                      isSelected
                        ? 'border-primer-accent-emphasis bg-primer-accent-subtle/40 text-primer-fg-default font-semibold'
                        : 'border-primer-border-muted hover:border-primer-border-default text-primer-fg-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="application_weekly_hours"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setWeeklyHours(opt.id)}
                      className="sr-only"
                    />
                    <span>{optText}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question 4: Additional Notes / Message to Teacher */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primer-fg-default">
              4. {language === 'KZ' ? 'Мұғалімге қосымша хабарлама немесе сұрақтарыңыз' : language === 'RU' ? 'Дополнительное сообщение преподавателю (пожелания, сложные темы)' : 'Additional note / questions to teacher'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={
                language === 'KZ'
                  ? 'Мысалы: «Интервалдар әдісі мен стереометрия формулаларын тереңірек түсінгім келеді...»'
                  : language === 'RU'
                  ? 'Например: «Хочу подтянуть тригонометрию и метод интервалов перед СОР...»'
                  : 'E.g., I want to focus on interval method and stereometry...'
              }
              className="w-full text-xs rounded-md border border-primer-border-default bg-primer-canvas-inset px-3 py-2 text-primer-fg-default placeholder:text-primer-fg-subtle focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis"
            />
          </div>

          {/* Checkbox: Agreement to Rules */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-primer-fg-default select-none">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-0.5 rounded border-primer-border-default text-primer-accent-emphasis focus:ring-primer-accent-emphasis"
              />
              <span className="leading-snug">
                {language === 'KZ'
                  ? 'Оқу тәртібін сақтауға, күнделікті стрик пен үй тапсырмаларын уақытылы орындауға міндеттенемін.'
                  : language === 'RU'
                  ? 'Обязуюсь соблюдать учебную дисциплину, поддерживать стрик и вовремя выполнять задания.'
                  : 'I commit to following the study rhythm, maintaining my streak, and completing assignments on time.'}
              </span>
            </label>
          </div>

          <DialogFooter className="pt-3 border-t border-primer-border-muted flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              {language === 'KZ' ? 'Бас тарту' : language === 'RU' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!agreedToRules || isLoading}
              className="gap-1.5 font-bold"
            >
              {isLoading ? (
                <span>{language === 'KZ' ? 'Жіберілуде...' : language === 'RU' ? 'Отправка...' : 'Submitting...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'KZ' ? 'Өтінішті жіберу' : language === 'RU' ? 'Отправить заявку' : 'Submit Application'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
