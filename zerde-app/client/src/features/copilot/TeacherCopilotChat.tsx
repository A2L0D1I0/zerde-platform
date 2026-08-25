import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MathText } from '@/components/ui/MathText';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Layers, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  User, 
  Loader2,
  FileCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import api from '@/api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface TeacherCopilotChatProps {
  courseId?: number;
  classroomId?: number;
  courseTitle?: string;
}

export const TeacherCopilotChat: React.FC<TeacherCopilotChatProps> = ({
  courseId = 1,
  classroomId,
  courseTitle = 'Алгебра 9',
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const storageKey = `zerde_copilot_chat_${courseId}_${classroomId || 'all'}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groundedSlotsCount, setGroundedSlotsCount] = useState<number>(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Initial welcome message or restore
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }

    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: language === 'KZ'
          ? `Сәлеметсіз бе! Мен **${courseTitle}** курсының Академиялық AI CoPilot көмекшісімін. Сіз жүктеген 5 оқу материалына сүйене отырып, 1-4 тоқсан КТП жоспарын құрастыруға, сұрақтар банкіне KaTeX есептерін қосуға және оқушылардың subpassport дефициттерін оңтайландыруға дайынмын.`
          : language === 'RU'
          ? `Здравствуйте! Я академический AI CoPilot для курса **${courseTitle}**. Опираясь на загруженные материалы в 5 слотах, я готов составить КТП на любую четверть, наполнить банк задач KaTeX-формулами и оптимизировать субпаспорта учеников.`
          : `Hello! I am your Academic AI CoPilot for **${courseTitle}**. Grounded in your 5 uploaded materials, I am ready to co-create your quarterly plan, generate rigorous question banks, and optimize student subpassports.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [storageKey, language, courseTitle]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = language === 'RU' ? [
    'Я загрузил материалы в слоты, давай составим план КТП на 1-ю четверть',
    'Сгенерируй пачку задач по утвержденному плану КТП в банк вопросов',
    'Проанализируй дефициты учеников по subpassports и проведи вечернюю оптимизацию'
  ] : language === 'EN' ? [
    'I uploaded the syllabus into slots, let us co-create the Q1 curriculum plan',
    'Generate a batch of KaTeX questions for the question bank based on approved KTP',
    'Analyze student subpassports and perform nightly competency optimization'
  ] : [
    'Слоттарға материалдарды сақтадым, 1-тоқсан КТП жоспарын бірге талқылайық',
    'Бекітілген КТП бойынша сұрақтар банкіне 5 KaTeX есебін генерацияла',
    'Subpassport дефициттерін талдап, оқушыларға кешкі тапсырмаларды бейімде'
  ];

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const res: any = await api.post('/teacher/copilot/chat', {
        message: text,
        courseId,
        classroomId,
        language: language as 'KZ' | 'RU' | 'EN',
        conversationHistory: messages.slice(-6).map((m) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.text,
        })),
      });

      const replyText =
        res?.data?.reply ||
        res?.reply ||
        res?.data?.message ||
        res?.message ||
        (language === 'KZ'
          ? 'Жауап дайындалды.'
          : 'Ответ сформирован на основе загруженных 5 слотов.');

      const modelMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If user requested generating KTP or questions, trigger toast
      if (text.toLowerCase().includes('ктп') || text.toLowerCase().includes('план')) {
        showToast({
          title: language === 'KZ' ? '💡 КТП жобасы қалыптастырылды!' : '💡 Проект КТП сформирован!',
          type: 'info'
        });
      }
    } catch (err: any) {
      console.error('CoPilot error:', err);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text: language === 'KZ'
          ? 'Кешіріңіз, AI қызметіне қосылуда қате орын алды. Қайталап көріңіз.'
          : 'Произошла ошибка при обращении к AI CoPilot. Пожалуйста, повторите попытку.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: language === 'KZ'
          ? `Сәлеметсіз бе! Мен **${courseTitle}** курсының Академиялық AI CoPilot көмекшісімін. Қандай сұрағыңыз немесе тапсырмаңыз бар?`
          : `Здравствуйте! Я академический AI CoPilot для курса **${courseTitle}**. Чем я могу помочь?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-default shadow-primer-xs overflow-hidden flex flex-col h-[650px] text-primer-fg-default">
      
      {/* Header */}
      <div className="p-3.5 border-b border-primer-border-default bg-primer-canvas-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primer-accent-subtle text-primer-accent-fg border border-primer-border-default flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                {language === 'KZ' ? 'Бірыңғай AI CoPilot Кеңістігі' : 'Единый AI CoPilot Ассистент'}
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono text-primer-success-fg border-primer-success-muted bg-primer-success-subtle gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primer-success-fg animate-pulse" />
                <span>Active Grounding (5 Slots)</span>
              </Badge>
            </div>
            <p className="text-[11px] text-primer-fg-muted">
              {courseTitle} • Gemini 2.5 Flash Persona
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs h-7.5 px-2.5 shadow-xs"
            title="Чатты тазалау"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs bg-primer-canvas-default">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
            >
              {isModel && (
                <div className="w-7 h-7 rounded-lg bg-primer-accent-subtle text-primer-accent-fg border border-primer-border-default flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2.5 shadow-primer-xs ${
                  isModel
                    ? 'bg-primer-canvas-subtle border border-primer-border-default text-primer-fg-default'
                    : 'bg-primer-accent-emphasis text-white font-medium'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">
                  <MathText text={msg.text} />
                </div>
                <div
                  className={`text-[9px] mt-1 font-mono text-right ${
                    isModel ? 'text-primer-fg-subtle' : 'text-blue-100'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isModel && (
                <div className="w-7 h-7 rounded-lg bg-primer-accent-emphasis text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-primer-accent-subtle text-primer-accent-fg border border-primer-border-default flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-primer-canvas-subtle border border-primer-border-default text-primer-fg-muted flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primer-accent-fg" />
              <span>{language === 'KZ' ? '5 оқу слоты мен КТП талдануда...' : 'Анализирую слоты материалов и КТП...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3.5 py-2 bg-primer-canvas-subtle border-t border-primer-border-default flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-bold text-primer-fg-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{language === 'KZ' ? 'Қолдану сценарийлері:' : 'Сценарии:'}</span>
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[10px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-md bg-primer-canvas-default text-primer-fg-default border border-primer-border-default hover:border-primer-accent-emphasis hover:text-primer-accent-fg transition cursor-pointer shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-primer-border-default bg-primer-canvas-default flex items-center gap-2"
      >
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            language === 'KZ'
              ? 'Оқу материалдары, КТП жоспары немесе сұрақтар генерациясы туралы жазыңыз...'
              : 'Напишите запрос по материалам, КТП или генерации задач...'
          }
          disabled={isLoading}
          className="text-xs h-9 bg-primer-canvas-inset border-primer-border-default text-primer-fg-default placeholder-primer-fg-muted focus:border-primer-accent-emphasis rounded-lg shadow-xs"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !inputMessage.trim()}
          className="h-9 px-3.5 rounded-lg font-bold text-xs gap-1.5 shrink-0 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{language === 'KZ' ? 'Жіберу' : 'Отправить'}</span>
        </Button>
      </form>
    </div>
  );
};

export default TeacherCopilotChat;
