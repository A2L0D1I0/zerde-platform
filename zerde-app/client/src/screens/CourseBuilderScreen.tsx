import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  BookPlus,
  Send,
  Plus,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  Brain,
  HelpCircle,
  Eye,
  Check,
  Zap,
  Download,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { MathText } from '@/components/ui/MathText';
import { ZvdslRenderer } from '@/components/zvdsl/ZvdslRenderer';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { teacherApi, CourseTopicItem } from '@/api/teacherApi';

export const CourseBuilderScreen: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [courseTitle, setCourseTitle] = useState('Алгебра және анализ бастамалары (9-сынып)');
  const [subjectName, setSubjectName] = useState('Математика');
  const [grade, setGrade] = useState('9 «А»');

  // Co-Pilot Chat State
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'teacher' | 'copilot'; text: string }>>([
    {
      role: 'copilot',
      text: 'Сәлеметсіз бе, ұстаз! Мен сіздің AI Co-Pilot көмекшіңізбін. Оқулық немесе конспект файлын жүктеңіз (PDF/DOCX) немесе маған қалаған тақырыбыңызды жазыңыз. Мен автоматты түрде микро-тақырыптар, СОР/СОЧ дескрипторлары мен тесттер құрастырып беремін.',
    },
  ]);

  // Document Upload State
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generated Course Tree & Topics
  const [topics, setTopics] = useState<CourseTopicItem[]>([
    {
      id: 'top_1',
      title: 'Квадрат теңсіздіктер және параболаның графиктік талдауы',
      order_index: 1,
      quarter: 3,
      sor_soch_goals: ['9.2.2.1 Квадрат теңсіздіктерді графиктік тәсілмен шешу'],
      descriptors: [
        'Параболаның тармақтарының бағытын анықтайды (a > 0, a < 0)',
        'Дискриминант таңбасына байланысты нөлдер санын табады',
        'Шешім аралығын сан түзуінде дұрыс көрсетеді',
      ],
      zvdsl_canvas: {
        canvas_type: 'NUMBER_LINE',
        title: 'Парабола нөлдері және аралықтар',
        elements: [
          { type: 'root_point', x: -3, style: 'solid', label: '-3' },
          { type: 'root_point', x: 4, style: 'solid', label: '4' },
          { type: 'shaded_region', intervals: [[-3, 4]] },
        ],
      },
      questions_count: 4,
      questions: [
        {
          id: 'q_1_1',
          text: 'Теңсіздікті шешіңіз: x^2 - x - 12 \\le 0',
          correctAnswer: '[-3; 4]',
          distractors: [
            { text: '(-3; 4)', trap: 'Қатаң емес теңсіздікте ашық жақша қолданды' },
            { text: '(-\\infty; -3] \\cup [4; +\\infty)', trap: 'Параболаның оң таңбалы аймағын алды' },
          ],
        },
      ],
    },
    {
      id: 'top_2',
      title: 'Бөлшек-рационал теңсіздіктер және интервалдар әдісі',
      order_index: 2,
      quarter: 3,
      sor_soch_goals: ['9.2.2.3 Бөлшек-рационал теңсіздіктерді интервалдар әдісімен шешу'],
      descriptors: [
        'Алымы мен бөлімінің нөлдерін анықтайды',
        'Бөлімнің нөлдерін сан түзуінде қатаң выколотая етіп белгілейді',
        'Интервалдардағы таңбаларды дұрыс тексереді',
      ],
      zvdsl_canvas: {
        canvas_type: 'NUMBER_LINE',
        title: 'Бөлшек-рационал сан түзуі: x=5 ашық нүкте',
        elements: [
          { type: 'root_point', x: -2, style: 'solid', label: '-2' },
          { type: 'root_point', x: 2, style: 'solid', label: '2' },
          { type: 'root_point', x: 5, style: 'hollow', label: '5 (ашық)' },
          { type: 'shaded_region', intervals: [[-5, -2], [2, 5]] },
        ],
      },
      questions_count: 5,
    },
    {
      id: 'top_3',
      title: 'Теңсіздіктер жүйесі мен жиынтығын шешу',
      order_index: 3,
      quarter: 3,
      sor_soch_goals: ['9.2.2.4 Екі айнымалысы бар сызықтық емес теңсіздіктер жүйесін шешу'],
      descriptors: [
        'Әр теңсіздіктің шешімін жеке табады',
        'Сан түзуінде шешімдердің қиылысуын көрсетеді',
      ],
      questions_count: 3,
    },
  ]);

  // Topic expansion state
  const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>(['top_1', 'top_2']);

  // Add Topic Modal State
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicGoals, setNewTopicGoals] = useState('');
  const [newTopicQuarter, setNewTopicQuarter] = useState<number>(3);

  // Toggle topic accordion
  const toggleTopic = (id: string) => {
    setExpandedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Handle Co-Pilot Message Send
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || copilotInput;
    if (!textToSend.trim()) return;

    const newHistory = [...chatMessages, { role: 'teacher' as const, text: textToSend }];
    setChatMessages(newHistory);
    setCopilotInput('');
    setIsCopilotLoading(true);

    try {
      const res = await teacherApi.sendTeacherCopilot(textToSend, newHistory, {
        title: courseTitle,
        subject: subjectName,
        grade,
      });

      setChatMessages((prev) => [
        ...prev,
        { role: 'copilot' as const, text: res.response },
      ]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'copilot' as const, text: 'Кешіріңіз, сұранысты өңдеуде қате болды.' },
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // Handle File Upload Simulation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsingDoc(true);

    showToast({
      type: 'attention',
      title: 'Құжат жүктелді 📄',
      message: `«${file.name}» файлынан Knowledge Graph пен тақырыптар талдануда...`,
    });

    try {
      const result = await teacherApi.parseCourseDocument(
        courseTitle,
        `Конспект файлы: ${file.name}. Тақырыптар: Квадрат теңсіздіктер, Бөлшек-рационал, Интервал әдісі.`,
        subjectName,
        grade
      );

      if (result?.topics && result.topics.length > 0) {
        setTopics(result.topics);
        setExpandedTopicIds(result.topics.map((t) => t.id));
        showToast({
          type: 'success',
          title: 'ИИ Талдау аяқталды! 🚀',
          message: `${result.topics.length} жаңа микро-тақырып пен СОР/СОЧ дескрипторлары құрастырылды.`,
        });
      }
    } finally {
      setIsParsingDoc(false);
    }
  };

  // Add Custom Topic
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic: CourseTopicItem = {
      id: `top_${Date.now()}`,
      title: newTopicTitle.trim(),
      order_index: topics.length + 1,
      quarter: newTopicQuarter,
      sor_soch_goals: newTopicGoals ? [newTopicGoals] : ['Оқу мақсаты енгізілді'],
      descriptors: ['Негізгі ұғымдарды біледі', 'Шешу алгоритмін дұрыс қолданады'],
      questions_count: 3,
    };

    setTopics((prev) => [...prev, newTopic]);
    setExpandedTopicIds((prev) => [...prev, newTopic.id]);
    setIsAddTopicModalOpen(false);
    setNewTopicTitle('');
    setNewTopicGoals('');

    showToast({
      type: 'success',
      title: 'Жаңа тақырып қосылды ✅',
      message: `«${newTopic.title}» курстың оқу жоспарына енгізілді.`,
    });
  };

  // Generate Tests for topic
  const handleGenerateTests = async (topicId: string, topicTitle: string) => {
    showToast({
      type: 'attention',
      title: 'ИИ Генерация басталуда... 🪄',
      message: `«${topicTitle}» бойынша когнитивтік ловушкалары бар тесттер құрылуда.`,
    });

    const generated = await teacherApi.generateQuestions(topicId, topicTitle, 3, subjectName);

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            questions_count: (t.questions_count || 0) + generated.length,
          };
        }
        return t;
      })
    );

    showToast({
      type: 'success',
      title: 'Тесттер генерацияланды! 🎉',
      message: `3 жаңа сұрақ пен дистракторлар банкіне қосылды.`,
    });
  };

  // Invite Student to Group Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteStudentName, setInviteStudentName] = useState('');
  const [inviteStudentEmail, setInviteStudentEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const shortCode = '7X9K2M';

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteStudentEmail || !inviteStudentName) return;
    setIsSendingInvite(true);
    try {
      showToast({
        type: 'success',
        title: t('courses.invite_student_title'),
        message: `«${inviteStudentName}» (${inviteStudentEmail}) оқушысына шақыру сәтті жіберілді! 🎉`,
      });
      setInviteStudentName('');
      setInviteStudentEmail('');
      setIsInviteModalOpen(false);
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: t('common.error_occurred'),
        message: err.message || t('common.failed_to_save'),
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Publish Course
  const handlePublishCourse = () => {
    showToast({
      type: 'success',
      title: 'Курс сәтті жарияланды! 🚀',
      message: `«${courseTitle}» курсы ${grade} тобының жеке кабинетінде қолжетімді.`,
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-3.5 sm:px-6 py-2">
      {/* Top Studio Header & Course Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primer-canvas-subtle border border-primer-border-default shadow-primer-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primer-accent-emphasis text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-primer-fg-default">
                AI Co-Pilot Course Studio
              </h2>
              <Badge variant="accent" className="text-[10px] font-mono">
                Knowledge Graph Engine
              </Badge>
            </div>
            <p className="text-xs text-primer-fg-muted">
              {subjectName} • {grade} • {topics.length} микро-тақырып • СОР/СОЧ дескрипторлары
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Automatic Short Code Badge with 1-Click Copy */}
          <div
            onClick={() => {
              navigator.clipboard.writeText(shortCode);
              showToast({
                type: 'success',
                title: t('courses.code_copied_toast'),
                message: shortCode,
              });
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primer-canvas-inset border border-primer-accent-muted/40 font-mono text-xs font-bold text-primer-accent-fg cursor-pointer hover:border-primer-accent-emphasis shadow-primer-xs"
            title={t('courses.copy_code_tooltip')}
          >
            <span className="text-[10px] text-primer-fg-muted">{t('courses.short_code_badge')}</span>
            <span>{shortCode}</span>
            <span>📋</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('courses.invite_student_title')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddTopicModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('common.add')}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePublishCourse}
            className="gap-1.5 text-xs font-bold shadow-primer-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Жариялау</span>
          </Button>
        </div>
      </div>

      {/* Invite Student Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primer-accent-fg" />
              <span>{t('courses.invite_student_title')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Оқушыға осы топқа қосылу үшін ресми шақыру жіберіңіз
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-3 py-2">
            <div>
              <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                {t('courses.invite_student_name')}
              </label>
              <Input
                type="text"
                value={inviteStudentName}
                onChange={(e) => setInviteStudentName(e.target.value)}
                placeholder="Мысалы: Азамат Темірханов"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                {t('courses.invite_student_email')}
              </label>
              <Input
                type="email"
                value={inviteStudentEmail}
                onChange={(e) => setInviteStudentEmail(e.target.value)}
                placeholder="azamat@zerde.kz"
                required
              />
            </div>

            <div className="p-2.5 rounded-lg bg-primer-canvas-subtle border border-primer-border-muted text-[11px] text-primer-fg-muted space-y-1">
              <div className="font-semibold text-primer-fg-default">
                Курс тобының кодпен қосылу мүмкіндігі:
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-primer-accent-fg">
                <span>{shortCode}</span>
                <span className="text-[10px] text-primer-fg-subtle">(Оқушы тікелей осы кодты жазып кіре алады)</span>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsInviteModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSendingInvite}>
                {isSendingInvite ? '...' : t('courses.send_invite_btn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>



      {/* Split-View Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ========================================================================= */}
        {/* Left Pane (5 cols): Teacher Co-Pilot Chat & Document Drag-and-Drop */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Drag & Drop Document Uploader */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primer-border-default hover:border-primer-accent-emphasis/70 rounded-xl p-4 text-center bg-primer-canvas-subtle transition cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <UploadCloud className="w-7 h-7 text-primer-accent-fg mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-primer-fg-default">
              {uploadedFileName ? (
                <span className="text-primer-success-fg flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {uploadedFileName}
                </span>
              ) : (
                'Оқулық немесе Силлабус жүктеу (PDF, DOCX)'
              )}
            </div>
            <p className="text-[11px] text-primer-fg-muted mt-0.5">
              ИИ файлды талдап, Q-Matrix пен ZVDSL+ сызбаларын автоматты шығарады
            </p>
            {isParsingDoc && (
              <div className="mt-2 text-xs font-bold text-primer-attention-fg animate-pulse">
                Талдау жүріп жатыр...
              </div>
            )}
          </div>

          {/* 2. Teacher Co-Pilot Interactive Chat */}
          <div className="border border-primer-border-default rounded-xl bg-primer-canvas-subtle overflow-hidden flex flex-col h-[480px]">
            <div className="px-3.5 py-2.5 border-b border-primer-border-muted bg-primer-canvas-inset flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primer-accent-fg" />
                <span className="text-xs font-bold text-primer-fg-default">
                  Teacher Co-Pilot көмекшісі
                </span>
              </div>
              <Badge variant="done" className="text-[9px] font-mono">
                Online
              </Badge>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.role === 'teacher' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'teacher'
                        ? 'bg-primer-accent-emphasis text-white'
                        : 'bg-primer-canvas-inset border border-primer-border-muted text-primer-fg-default'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isCopilotLoading && (
                <div className="text-[11px] text-primer-fg-muted animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
                  <span>Co-Pilot ойлануда...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-1.5 border-t border-primer-border-muted bg-primer-canvas-inset/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleSendMessage('СОР үшін 3 дескриптор құрастыр')}
                className="px-2 py-0.5 rounded bg-primer-canvas-default border border-primer-border-default text-primer-fg-muted hover:text-primer-fg-default whitespace-nowrap cursor-pointer"
              >
                📝 СОР дескрипторлары
              </button>
              <button
                onClick={() => handleSendMessage('Ловушка-дистракторлары бар тест жаса')}
                className="px-2 py-0.5 rounded bg-primer-canvas-default border border-primer-border-default text-primer-fg-muted hover:text-primer-fg-default whitespace-nowrap cursor-pointer"
              >
                🎯 Тест ловушкалары
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2 border-t border-primer-border-muted bg-primer-canvas-default flex items-center gap-2"
            >
              <Input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Co-Pilot-қа сұраныс жазыңыз..."
                className="text-xs h-8"
              />
              <Button type="submit" variant="primary" size="sm" className="h-8 px-2.5">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Right Pane (7 cols): Interactive Course Tree & Micro-topic Descriptors */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold text-primer-fg-default uppercase tracking-wider">
              Курс құрылымы және микро-тақырыптар ағашы ({topics.length})
            </h3>
            <span className="text-[11px] text-primer-fg-muted">
              СОР / СОЧ критерийлері мен ZVDSL+ сұлбалары
            </span>
          </div>

          <div className="space-y-3">
            {topics.map((topic, index) => {
              const isExpanded = expandedTopicIds.includes(topic.id);

              return (
                <div
                  key={topic.id}
                  className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle overflow-hidden shadow-primer-xs transition"
                >
                  {/* Topic Header */}
                  <div
                    onClick={() => toggleTopic(topic.id)}
                    className="p-3.5 flex items-center justify-between gap-3 bg-primer-canvas-inset/50 hover:bg-primer-canvas-inset transition cursor-pointer border-b border-primer-border-muted/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-primer-fg-muted shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-primer-fg-muted shrink-0" />
                      )}
                      <span className="font-mono text-xs font-bold text-primer-accent-fg">
                        #{index + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-primer-fg-default truncate">
                        {topic.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {topic.quarter}-тоқсан
                      </Badge>
                      <Badge variant="done" className="text-[10px] font-mono">
                        {topic.questions_count || 3} сұрақ
                      </Badge>
                    </div>
                  </div>

                  {/* Expanded Topic Details */}
                  {isExpanded && (
                    <div className="p-3.5 space-y-3 text-xs animate-in fade-in duration-150">
                      {/* СОР/СОЧ Goals & Descriptors */}
                      <div className="p-3 rounded-lg bg-primer-canvas-default border border-primer-border-muted space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primer-accent-fg uppercase tracking-wider">
                            🎯 СОР / СОЧ Бағалау критерийлері мен дескрипторлары
                          </span>
                          <span className="text-[10px] text-primer-fg-subtle">Kundelik.kz сәйкес</span>
                        </div>

                        {topic.sor_soch_goals && (
                          <div className="text-[11px] text-primer-fg-default font-semibold">
                            {topic.sor_soch_goals.map((g, i) => (
                              <div key={i}>• {g}</div>
                            ))}
                          </div>
                        )}

                        {topic.descriptors && (
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-primer-fg-muted pl-1">
                            {topic.descriptors.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* ZVDSL+ Schema Preview */}
                      {topic.zvdsl_canvas && (
                        <div className="p-2.5 rounded-lg bg-primer-canvas-default border border-primer-border-muted space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primer-fg-subtle uppercase tracking-wider">
                              ZVDSL+ Интерактивті сұлбасы
                            </span>
                            <Badge variant="accent" className="text-[9px]">
                              {topic.zvdsl_canvas.canvas_type || 'NUMBER_LINE'}
                            </Badge>
                          </div>

                          <ZvdslRenderer
                            schema={topic.zvdsl_canvas}
                            height={90}
                            isThumbnail={true}
                          />
                        </div>
                      )}

                      {/* Action Bar for Topic */}
                      <div className="flex items-center justify-between pt-1 border-t border-primer-border-muted/50 text-[11px]">
                        <span className="text-primer-fg-muted">
                          Банкте: <strong className="text-primer-fg-default">{topic.questions_count || 3} тапсырма</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleGenerateTests(topic.id, topic.title)}
                            className="gap-1 font-semibold"
                          >
                            <Sparkles className="w-3 h-3 text-primer-accent-fg" />
                            <span>Сгенерировать тесты</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Topic Modal */}
      <Dialog open={isAddTopicModalOpen} onOpenChange={setIsAddTopicModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Жаңа микро-тақырып қосу</DialogTitle>
            <DialogDescription className="text-xs">
              Курс ағашына жаңа тақырып және оқу мақсаттарын енгізіңіз
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTopic} className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                Тақырып атауы
              </label>
              <Input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Мысалы: Иррационал теңдеулерді шешу"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                Оқу мақсаты (СОР / СОЧ)
              </label>
              <Input
                type="text"
                value={newTopicGoals}
                onChange={(e) => setNewTopicGoals(e.target.value)}
                placeholder="Мысалы: 9.2.2.5 Иррационал теңдеулерді шешу"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                Тоқсан
              </label>
              <select
                value={newTopicQuarter}
                onChange={(e) => setNewTopicQuarter(Number(e.target.value))}
                className="w-full h-8 px-2 bg-primer-canvas-default border border-primer-border-default rounded text-xs text-primer-fg-default cursor-pointer"
              >
                <option value={1}>1-тоқсан</option>
                <option value={2}>2-тоқсан</option>
                <option value={3}>3-тоқсан</option>
                <option value={4}>4-тоқсан</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTopicModalOpen(false)}>
                Бас тарту
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                Қосу
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseBuilderScreen;
