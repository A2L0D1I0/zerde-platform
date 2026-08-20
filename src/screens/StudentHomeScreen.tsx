import React, { useState } from 'react';
import { Header } from '../components/Header';
import { UnderlineNav, SubNavTab } from '../components/UnderlineNav';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { PinnedSubjectCard } from '../components/PinnedSubjectCard';
import { QuarterTopicsList } from '../components/QuarterTopicsList';
import { SpacedRepetitionCard } from '../components/SpacedRepetitionCard';
import { BottomNav, NavTab } from '../components/BottomNav';
import { 
  mockStudent, 
  mockSubjects, 
  mockTopics, 
  mockHeatmapData, 
  mockSpacedRepetition 
} from '../data/mockStudentData';
import { Language, SubjectFocus, QuarterTopic } from '../types';
import { CheckCircle2, X, Terminal } from 'lucide-react';

export const StudentHomeScreen: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('KZ');
  const [activeSubjectIndex, setActiveSubjectIndex] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<SubNavTab>('overview');
  const [activeMobileTab, setActiveMobileTab] = useState<NavTab>('home');
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'practice' | 'topic' | 'review';
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'practice'
  });

  const student = mockStudent;
  const subjects = mockSubjects[currentLang];
  const topics = mockTopics[currentLang];
  const spacedRepetition = mockSpacedRepetition[currentLang];

  const handleStartPractice = (subject: SubjectFocus) => {
    setActiveModal({
      isOpen: true,
      title: subject.focusTopic,
      description: currentLang === 'KZ'
        ? `«Аға» наставнигі 3 минуттық экспресс-жаттығуды дайындады. 3 сұраққа жауап беріп, +15 ELO алыңыз!`
        : currentLang === 'RU'
        ? `Сократический наставник «Аға» подготовил 3-минутную экспресс-тренировку. 3 вопроса для выхода на Eureka Moment (+15 ELO)!`
        : `Socratic mentor "Aga" prepared a 3-minute drill. Answer 3 questions to unlock Eureka Moment (+15 ELO)!`,
      type: 'practice'
    });
  };

  const handleSelectTopic = (topic: QuarterTopic) => {
    setActiveModal({
      isOpen: true,
      title: `${topic.topicNumber} ${topic.title}`,
      description: currentLang === 'KZ'
        ? `Тақырып мәртебесі: ${topic.statusLabel}. ${topic.subText}. Барлық тақырыптар тоқсан аяғына дейін қайталау үшін қолжетімді.`
        : currentLang === 'RU'
        ? `Статус темы: ${topic.statusLabel}. ${topic.subText}. Все темы доступны для повторения до конца четверти.`
        : `Topic status: ${topic.statusLabel}. ${topic.subText}. All topics remain active through Q1 for revision.`,
      type: 'topic'
    });
  };

  const handleReview = () => {
    setActiveModal({
      isOpen: true,
      title: spacedRepetition.title,
      description: currentLang === 'KZ'
        ? `Интервалды қайталау жүйесі: Дискриминант формуласы $D = b^2 - 4ac$, Виет теоремасы $x_1 + x_2 = -p$, Интервал таңбалары.`
        : currentLang === 'RU'
        ? `Система интервального повторения: Дискриминант $D = b^2 - 4ac$, теорема Виета $x_1 + x_2 = -p$, метод интервалов.`
        : `Spaced repetition engine: Discriminant $D = b^2 - 4ac$, Vieta $x_1 + x_2 = -p$, interval sign rule.`,
      type: 'review'
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans antialiased pb-24 selection:bg-[#0969da] selection:text-white">
      
      {/* 1. GitHub Light Header */}
      <Header
        student={student}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
      />

      {/* 2. GitHub Light UnderlineNav */}
      <UnderlineNav
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        currentLang={currentLang}
        topicsCount={topics.length}
      />

      {/* Main Content Feed */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* 3. GitHub Contributions Activity Heatmap (Light Mode) */}
        <ActivityHeatmap
          data={mockHeatmapData}
          currentLang={currentLang}
        />

        {/* 4. GitHub Pinned Repository Focus Card (Light Mode) */}
        <PinnedSubjectCard
          subjects={subjects}
          activeIndex={activeSubjectIndex}
          onSubjectChange={setActiveSubjectIndex}
          onStartPractice={handleStartPractice}
          currentLang={currentLang}
        />

        {/* 5. GitHub Issues / Quarter Topics Lifecycle (Light Mode) */}
        <QuarterTopicsList
          topics={topics}
          currentLang={currentLang}
          onSelectTopic={handleSelectTopic}
        />

        {/* 6. GitHub Markdown Callout (Spaced Repetition Light) */}
        <SpacedRepetitionCard
          item={spacedRepetition}
          currentLang={currentLang}
          onReview={handleReview}
        />

      </main>

      {/* 7. GitHub Mobile Bottom Nav (Light Mode) */}
      <BottomNav
        activeTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
        currentLang={currentLang}
      />

      {/* Interactive Modal Demo (Light Mode) */}
      {activeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d0d7de] rounded-lg max-w-sm w-full p-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModal({ ...activeModal, isOpen: false })}
              className="absolute top-3.5 right-3.5 text-[#656d76] hover:text-[#1f2328] p-1 rounded-md hover:bg-[#f6f8fa] transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#0969da] text-xs font-semibold mb-2">
              <Terminal className="w-4 h-4 text-[#1a7f37]" />
              <span>zerde / socratic-terminal</span>
            </div>

            <h3 className="text-sm font-bold text-[#1f2328] mb-2 leading-tight">
              {activeModal.title}
            </h3>

            <p className="text-xs text-[#656d76] leading-relaxed mb-4">
              {activeModal.description}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#d0d7de]">
              <button
                onClick={() => setActiveModal({ ...activeModal, isOpen: false })}
                className="px-3 py-1.5 rounded-md bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-xs font-semibold text-[#1f2328] transition"
              >
                {currentLang === 'KZ' ? 'Жабу' : currentLang === 'RU' ? 'Закрыть' : 'Close'}
              </button>
              <button
                onClick={() => setActiveModal({ ...activeModal, isOpen: false })}
                className="px-3.5 py-1.5 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentLang === 'KZ' ? 'Түсіндім' : currentLang === 'RU' ? 'Понятно' : 'Got it'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
