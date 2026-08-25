import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import {
  BookOpen,
  Sparkles,
  Lock,
  Globe,
  Languages,
  X,
  PlusCircle,
  FolderPlus
} from 'lucide-react';
import api from '@/api/client';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (newCourse: any) => void;
}

const SUBJECT_OPTIONS = [
  { value: 'algebra', icon: '📐', labelKZ: 'Алгебра', labelRU: 'Алгебра', labelEN: 'Algebra', category: 'stem' },
  { value: 'geometry', icon: '📏', labelKZ: 'Геометрия', labelRU: 'Геометрия', labelEN: 'Geometry', category: 'stem' },
  { value: 'physics', icon: '⚡', labelKZ: 'Физика', labelRU: 'Физика', labelEN: 'Physics', category: 'stem' },
  { value: 'chemistry', icon: '🧪', labelKZ: 'Химия', labelRU: 'Химия', labelEN: 'Chemistry', category: 'stem' },
  { value: 'biology', icon: '🧬', labelKZ: 'Биология', labelRU: 'Биология', labelEN: 'Biology', category: 'stem' },
  { value: 'informatics', icon: '💻', labelKZ: 'Информатика', labelRU: 'Информатика', labelEN: 'Computer Science', category: 'stem' },
  { value: 'kazakh_lang', icon: '📖', labelKZ: 'Қазақ тілі мен әдебиеті', labelRU: 'Казахский язык и литература', labelEN: 'Kazakh Language & Lit', category: 'lang', lockedLang: 'KZ' },
  { value: 'russian_lang', icon: '📚', labelKZ: 'Орыс тілі мен әдебиеті', labelRU: 'Русский язык и литература', labelEN: 'Russian Language & Lit', category: 'lang', lockedLang: 'RU' },
  { value: 'english_lang', icon: '🇬🇧', labelKZ: 'Ағылшын тілі (English)', labelRU: 'Английский язык', labelEN: 'English Language & Lit', category: 'lang', lockedLang: 'EN' },
];

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [title, setTitle] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [subjectType, setSubjectType] = useState('algebra');
  const [courseLang, setCourseLang] = useState<'KZ' | 'RU' | 'EN' | 'ALL'>('KZ');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📐');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentSubjectObj = SUBJECT_OPTIONS.find((s) => s.value === subjectType) || SUBJECT_OPTIONS[0];
  const isLanguageSubject = currentSubjectObj.category === 'lang';

  const handleSubjectChange = (val: string) => {
    setSubjectType(val);
    const found = SUBJECT_OPTIONS.find((s) => s.value === val);
    if (found) {
      setIcon(found.icon);
      if (found.category === 'lang' && found.lockedLang) {
        setCourseLang(found.lockedLang as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({ title: lang === 'KZ' ? 'Курс атауын енгізіңіз' : 'Введите название курса', type: 'attention' });
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedCode = shortCode.trim() || `${title.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
      const res: any = await api.post('/courses', {
        title: title.trim(),
        short_code: generatedCode,
        subject_type: subjectType,
        language: isLanguageSubject ? (currentSubjectObj.lockedLang || 'KZ') : courseLang,
        description: description.trim(),
        icon,
      });

      const newCourse = (res && res.data) ? res.data : res;
      showToast({
        title: lang === 'KZ' ? `«${title}» курсы сәтті құрылды!` : `Курс «${title}» успешно создан!`,
        type: 'success'
      });
      onCourseCreated(newCourse);
      onClose();
    } catch (err: any) {
      showToast({
        title: lang === 'KZ' ? 'Курс құру қатесі' : 'Ошибка создания курса',
        type: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-overlay max-w-xl w-full p-5 space-y-4 shadow-primer-xl text-primer-fg-default">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-primer-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primer-accent-subtle text-primer-accent-fg border border-primer-border-default flex items-center justify-center text-base">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primer-fg-default">
                {lang === 'KZ' ? 'Жаңа оқу курсын құру' : lang === 'RU' ? 'Создать новый учебный курс' : 'Create New Course'}
              </h3>
              <p className="text-[11px] text-primer-fg-muted">
                {lang === 'KZ' ? 'Пән, оқыту тілі және топтарды баптау' : 'Настройка предмета, языка преподавания и групп'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-primer-fg-muted hover:text-primer-fg-default hover:bg-primer-canvas-subtle transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Subject Field */}
          <div className="space-y-1">
            <label className="font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Пән бағыты (Subject):' : lang === 'RU' ? 'Предметная область:' : 'Subject Area:'}
            </label>
            <select
              value={subjectType}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-primer-canvas-inset border border-primer-border-default text-primer-fg-default font-medium focus:border-primer-accent-emphasis focus:outline-none cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.icon} {lang === 'KZ' ? s.labelKZ : lang === 'RU' ? s.labelRU : s.labelEN}
                </option>
              ))}
            </select>
          </div>

          {/* Title and Code */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2 space-y-1">
              <label className="font-bold text-primer-fg-default">
                {lang === 'KZ' ? 'Курс атауы *' : lang === 'RU' ? 'Название курса *' : 'Course Title *'}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'KZ' ? 'Мысалы: Алгебра 9-сынып (Теңсіздіктер)' : 'Например: Физика 10 класс (Механика)'}
                required
                className="h-8 text-xs bg-primer-canvas-inset border-primer-border-default text-primer-fg-default placeholder-primer-fg-muted focus:border-primer-accent-emphasis"
              />
            </div>

            <div className="col-span-1 space-y-1">
              <label className="font-bold text-primer-fg-default">
                {lang === 'KZ' ? 'Код (Code)' : 'Код курса'}
              </label>
              <Input
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="ALG-09"
                className="h-8 text-xs font-mono uppercase bg-primer-canvas-inset border-primer-border-default text-primer-fg-default placeholder-primer-fg-muted focus:border-primer-accent-emphasis"
              />
            </div>
          </div>

          {/* Language Selection / Locking */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-primer-fg-default flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primer-accent-fg" />
                <span>{lang === 'KZ' ? 'Оқыту және тапсырмалар тілі:' : lang === 'RU' ? 'Язык преподавания и заданий:' : 'Instruction Language:'}</span>
              </label>

              {isLanguageSubject && (
                <Badge variant="outline" className="text-[10px] font-mono text-purple-700 dark:text-purple-300 border-purple-500/30 bg-purple-500/10 gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Тілдік пән (Бекітілген)</span>
                </Badge>
              )}
            </div>

            <select
              value={isLanguageSubject ? (currentSubjectObj.lockedLang || 'KZ') : courseLang}
              onChange={(e) => !isLanguageSubject && setCourseLang(e.target.value as any)}
              disabled={isLanguageSubject}
              className={`w-full h-8 px-3 rounded-lg border font-medium focus:outline-none ${
                isLanguageSubject
                  ? 'bg-primer-canvas-subtle border-primer-border-muted text-primer-fg-muted cursor-not-allowed'
                  : 'bg-primer-canvas-inset border-primer-border-default text-primer-fg-default focus:border-primer-accent-emphasis cursor-pointer'
              }`}
            >
              <option value="KZ">🇰🇿 Қазақ тілі (Kazakh)</option>
              <option value="RU">🇷🇺 Русский язык (Russian)</option>
              <option value="EN">🇬🇧 English (Ағылшын тілі)</option>
              <option value="ALL">🌐 Көптілді (All Languages)</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Сипаттама (міндетті емес):' : 'Описание курса (опционально):'}
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Курс сипаттамасы мен мақсаттары..."
              className="h-8 text-xs bg-primer-canvas-inset border-primer-border-default text-primer-fg-default placeholder-primer-fg-muted focus:border-primer-accent-emphasis"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primer-border-default">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              {lang === 'KZ' ? 'Бас тарту' : 'Отмена'}
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="h-8 text-xs font-bold gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (lang === 'KZ' ? 'Құрылуда...' : 'Создание...') : (lang === 'KZ' ? 'Курсты құру' : 'Создать курс')}</span>
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateCourseModal;
