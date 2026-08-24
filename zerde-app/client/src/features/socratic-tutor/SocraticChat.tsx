import React, { useState, useEffect } from 'react';
import { ThoughtFork, SocraticResponse } from '@zerde/shared';
import { ThoughtForkTriad } from './ThoughtForkTriad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MathText } from '@/components/ui/MathText';
import { Brain, Sparkles, Send, RefreshCw, Cpu, Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/client';
import confetti from 'canvas-confetti';

interface SocraticChatProps {
  studentName?: string;
  topicTitle?: string;
  courseLanguage?: 'KZ' | 'RU' | 'EN' | 'ANY';
  currentElo?: number;
  onEloUpdate?: (newElo: number, delta: number) => void;
}

export const SocraticChat: React.FC<SocraticChatProps> = ({
  studentName = 'Оқушы',
  topicTitle = 'Бөлшек-рационал теңсіздіктер және интервалдар әдісі',
  courseLanguage,
  currentElo = 1200,
  onEloUpdate,
}) => {
  const { language } = useLanguage();

  // Strict language hierarchy: Course/Teacher Language > Student UI Language
  const effectiveLang = (
    courseLanguage && courseLanguage !== 'ANY'
      ? courseLanguage
      : (language as string) || 'KZ'
  ).toLowerCase() as 'kz' | 'ru' | 'en';

  const isRU = effectiveLang === 'ru';
  const isEN = effectiveLang === 'en';

  const [messages, setMessages] = useState<Array<{ role: 'student' | 'aga'; text: string; forks?: ThoughtFork[] }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeElo, setActiveElo] = useState(currentElo);
  const [isAiConnected, setIsAiConnected] = useState<boolean>(false);

  // Load initial greeting dynamically from server on mount / topic / effectiveLang change
  useEffect(() => {
    const fetchInitialGreeting = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<any>(`/tutor/initial?studentName=${encodeURIComponent(studentName)}&topicTitle=${encodeURIComponent(topicTitle)}&language=${effectiveLang}`);
        if (res && res.greeting) {
          setIsAiConnected(Boolean(res.is_ai_connected));
          setMessages([
            {
              role: 'aga',
              text: res.greeting,
              forks: res.thought_forks,
            },
          ]);
        }
      } catch (err) {
        console.warn('[SocraticChat] Failed to load initial greeting', err);
        const firstName = studentName.split(' ')[0] || studentName;
        const fallbackForks: ThoughtFork[] = isRU
          ? [
              { key: 'A', title: 'Определить условие и область допустимых значений', type: 'true_step', description: 'Анализируем ОДЗ и начальные параметры' },
              { key: 'B', title: 'Применить поспешные выводы (Ловушка)', type: 'cognitive_trap', description: 'Поспешные действия ведут к потере знака' },
              { key: 'C', title: 'Вспомнить фундаментальное правило', type: 'basic_rule', description: 'Базовый закон данной темы' },
            ]
          : isEN
          ? [
              { key: 'A', title: 'Identify conditions and domain constraints', type: 'true_step', description: 'Analyze domain restrictions and starting values' },
              { key: 'B', title: 'Jump to premature conclusions (Trap)', type: 'cognitive_trap', description: 'Premature actions risk losing critical solutions' },
              { key: 'C', title: 'Recall foundational rule/theorem', type: 'basic_rule', description: 'Core mathematical law for this topic' },
            ]
          : [
              { key: 'A', title: 'Анықталу облысы мен бастапқы шарттарды талдау', type: 'true_step', description: 'ОДЗ мен бастапқы мәндерді тексереміз' },
              { key: 'B', title: 'Тексерусіз асығыс қорытынды жасау (Тұзақ)', type: 'cognitive_trap', description: 'Асығыс қадам түбірді жоғалтуға әкеледі' },
              { key: 'C', title: 'Негізгі қағида мен ережені еске түсіру', type: 'basic_rule', description: 'Тақырыптың базалық заңы' },
            ];

        setMessages([
          {
            role: 'aga',
            text: isRU
              ? `Привет, ${firstName}! Сегодня мы разбираем тему «${topicTitle}». С какого логического шага начнем?`
              : isEN
              ? `Hello, ${firstName}! Today we are exploring "${topicTitle}". How should we begin our investigation?`
              : `Сәлем, ${firstName}! Бүгін біз «${topicTitle}» тақырыбын талдаймыз. Талдауды қай қадамнан бастаймыз?`,
            forks: fallbackForks,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialGreeting();
  }, [studentName, topicTitle, effectiveLang]);

  useEffect(() => {
    setActiveElo(currentElo);
  }, [currentElo]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const newMsgs = [...messages, { role: 'student' as const, text: query }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post<SocraticResponse & { is_ai_connected?: boolean }>('/tutor/socratic', {
        studentAnswer: query,
        topicId: topicTitle,
        currentElo: activeElo,
        language: effectiveLang,
      });

      if (response && response.question_line) {
        if (response.is_eureka) {
          confetti({ particleCount: 50, spread: 60 });
        }

        if (typeof response.is_ai_connected === 'boolean') {
          setIsAiConnected(response.is_ai_connected);
        }

        setActiveElo(response.new_elo);
        if (onEloUpdate) {
          onEloUpdate(response.new_elo, response.elo_delta);
        }

        setMessages([
          ...newMsgs,
          {
            role: 'aga',
            text: `${response.feedback_message ? response.feedback_message + '\n\n' : ''}${response.question_line}`,
            forks: response.thought_forks,
          },
        ]);
      }
    } catch (err) {
      console.error('[SocraticChat] Request failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFork = (fork: ThoughtFork) => {
    const choiceText = isRU
      ? `Я выбираю вариант ${fork.key}: ${fork.title}`
      : isEN
      ? `I select option ${fork.key}: ${fork.title}`
      : `Мен ${fork.key} нұсқасын таңдадым: ${fork.title}`;
    handleSend(choiceText);
  };

  const mentorLabel = isRU ? '🦉 Наставник «Аға»' : isEN ? '🦉 Mentor "Aga"' : '🦉 Наставник «Аға»';
  const studentLabel = isRU ? '👤 Ваш ответ' : isEN ? '👤 Your Answer' : '👤 Сіздің жауабыңыз';
  const placeholderText = isRU ? 'Напишите свой ход мысли или ответ...' : isEN ? 'Write your thoughts or answer...' : 'Өз ойыңызды немесе қадамыңызды жазыңыз...';
  const sendButtonText = isRU ? 'Отправить' : isEN ? 'Send' : 'Жіберу';
  const thinkingText = isRU ? '«Аға» думает...' : isEN ? '"Aga" is thinking...' : '«Аға» ойланып жатыр...';

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primer-border-muted pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primer-accent-emphasis text-white flex items-center justify-center font-bold">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primer-fg-default flex items-center gap-1.5">
              <span>Сократ «Аға»</span>
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
            </h4>
            <p className="text-[11px] text-primer-fg-muted font-mono">{topicTitle}</p>
          </div>
        </div>

        {/* Engine Status Badge (Transparent & Honest) */}
        <div>
          {isAiConnected ? (
            <Badge variant="outline" className="text-[10px] gap-1 font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-3 h-3 text-emerald-500" />
              <span>Gemini AI Live</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] gap-1 font-mono text-primer-fg-muted" title="Работает локальный реляционный движок SQLite (без внешнего ключа API)">
              <Database className="w-3 h-3 text-primer-accent-fg" />
              <span>SQLite Rules</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg text-xs leading-relaxed ${
              m.role === 'aga'
                ? 'bg-primer-canvas-inset border border-primer-border-default text-primer-fg-default'
                : 'bg-primer-accent-subtle/30 border border-primer-accent-muted/40 text-primer-fg-default ml-6'
            }`}
          >
            <div className="font-semibold text-[10px] uppercase text-primer-fg-muted mb-1">
              {m.role === 'aga' ? mentorLabel : studentLabel}
            </div>
            <div className="whitespace-pre-line">
              <MathText text={m.text} />
            </div>

            {m.forks && m.forks.length > 0 && idx === messages.length - 1 && (
              <ThoughtForkTriad
                forks={m.forks}
                onSelectFork={handleSelectFork}
                disabled={isLoading}
                language={effectiveLang}
              />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-default text-xs text-primer-fg-muted flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primer-accent-fg" />
            <span>{thinkingText}</span>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-primer-border-muted"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholderText}
          className="text-xs"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="gap-1">
          <span>{sendButtonText}</span>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};

export default SocraticChat;
