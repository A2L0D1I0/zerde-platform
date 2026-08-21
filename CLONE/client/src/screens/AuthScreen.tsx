import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  UserCheck,
  KeyRound,
  Info,
  AlertCircle,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
  School,
  BookOpen,
  Brain,
  Zap,
  Flame,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

const VERIFIED_ORGANIZATIONS = [
  'NIS IB Astana',
  'РФМШ Астана / РФМШ Алматы',
  'БИЛ (BIL) Лицей',
  '№17 IT-Лицей',
  '№10 IT Мектеп-лицейі',
  'Басқа / Другая школа',
];

const GRADE_OPTIONS = [
  { value: '7-сынып', labelKZ: '7-сынып', labelRU: '7 класс', labelEN: 'Grade 7' },
  { value: '8-сынып', labelKZ: '8-сынып', labelRU: '8 класс', labelEN: 'Grade 8' },
  { value: '9-сынып', labelKZ: '9-сынып', labelRU: '9 класс', labelEN: 'Grade 9' },
  { value: '10-сынып', labelKZ: '10-сынып', labelRU: '10 класс', labelEN: 'Grade 10' },
  { value: '11-сынып', labelKZ: '11-сынып', labelRU: '11 класс', labelEN: 'Grade 11' },
  { value: '12-сынып', labelKZ: '12-сынып (NIS/IB)', labelRU: '12 класс (NIS/IB)', labelEN: 'Grade 12 (NIS/IB)' },
  { value: 'Колледж', labelKZ: 'Колледж', labelRU: 'Колледж', labelEN: 'College' },
  { value: 'ЖОО (ВУЗ)', labelKZ: 'ЖОО (Университет)', labelRU: 'ВУЗ (Университет)', labelEN: 'University' },
  { value: 'Басқа', labelKZ: 'Басқа (Еркін жазу)', labelRU: 'Другое', labelEN: 'Other' },
];

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [school, setSchool] = useState(VERIFIED_ORGANIZATIONS[0]);
  const [customSchool, setCustomSchool] = useState('');
  const [grade, setGrade] = useState('10-сынып');
  const [customGrade, setCustomGrade] = useState('');
  const [subject, setSubject] = useState('Информатика (ICT)');
  const [bio, setBio] = useState('');
  const [orgToken, setOrgToken] = useState('ORG-8F3K9A');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Showcase Interactive State
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'socratic' | 'elo' | 'tokens' | 'math'>('socratic');
  const [socraticChoice, setSocraticChoice] = useState<number | null>(null);

  // Auto-cycle showcase tabs for subtle presentation animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveShowcaseTab((prev) => {
        if (prev === 'socratic') return 'elo';
        if (prev === 'elo') return 'math';
        if (prev === 'math') return 'tokens';
        return 'socratic';
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMsg(t('auth.name_required') || 'Аты-жөніңізді енгізіңіз');
          return;
        }

        const finalGrade = grade === 'Басқа' ? (customGrade.trim() || '10-сынып') : grade;
        const finalSchool = school === 'Басқа / Другая школа' ? (customSchool.trim() || 'NIS IB Astana') : school;

        await register({
          email: email.trim(),
          password,
          full_name: name.trim(),
          role,
          school: finalSchool,
          grade: role === 'student' ? finalGrade : undefined,
          bio: bio.trim(),
          org_token: role === 'teacher' ? orgToken.trim() : undefined,
        });
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMsg(
            lang === 'KZ'
              ? 'Email және құпия сөзді енгізіңіз'
              : lang === 'RU'
              ? 'Введите email и пароль'
              : 'Please enter your email and password'
          );
          return;
        }
        await login(email.trim(), password, role);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('common.error_occurred');
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-primer-canvas-default text-primer-fg-default flex flex-col justify-between selection:bg-primer-accent-emphasis selection:text-white">
      
      {/* 1. TOP NAV BAR */}
      <header className="border-b border-primer-border-muted/80 bg-primer-canvas-default/80 backdrop-blur px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primer-canvas-subtle border border-primer-border-default flex items-center justify-center font-bold text-xs text-primer-fg-default shadow-primer-xs">
              <BookOpen className="w-4 h-4 text-primer-accent-fg" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-primer-fg-default">
                {t('brand.title')}
              </span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-primer-canvas-subtle text-primer-accent-fg border border-primer-border-default font-bold">
                v1.0 SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-primer-canvas-subtle p-1 rounded-xl border border-primer-border-default shadow-primer-xs">
              <Globe className="w-3.5 h-3.5 text-primer-fg-muted ml-1 mr-0.5 shrink-0" />
              {(['KZ', 'RU', 'EN'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    language === l
                      ? 'bg-primer-accent-emphasis text-white shadow-xs'
                      : 'text-primer-fg-muted hover:text-primer-fg-default'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN SPLIT-SCREEN CONTENT */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: Interactive Presentation & Animations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hero Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-primer-accent-subtle/40 border border-primer-accent-muted text-primer-accent-fg shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-emphasis animate-spin" />
              <span>
                {lang === 'KZ'
                  ? 'Интеллектуалды білім беру экожүйесі'
                  : lang === 'RU'
                  ? 'Интеллектуальная образовательная экосистема'
                  : 'Intelligent Educational Ecosystem'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primer-fg-default tracking-tight leading-tight">
              {lang === 'KZ' ? (
                <>
                  Білімді жаттанды емес, <br />
                  <span className="text-primer-accent-fg bg-clip-text">терең түсінікпен меңгеріңіз.</span>
                </>
              ) : lang === 'RU' ? (
                <>
                  Обучение через <br />
                  <span className="text-primer-accent-fg bg-clip-text">глубокое понимание и практику.</span>
                </>
              ) : (
                <>
                  Master skills through <br />
                  <span className="text-primer-accent-fg bg-clip-text">active discovery & reasoning.</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-primer-fg-muted max-w-xl leading-relaxed">
              {lang === 'KZ'
                ? 'Сократикалық ИИ («Аға»), адаптивті ELO-рейтинг, когнитивті диагностика (CDM) және мектептен жоғары оқу орындарына дейінгі біртұтас платформа.'
                : lang === 'RU'
                ? 'Сократический ИИ («Аға»), адаптивный ELO-рейтинг, когнитивная диагностика (CDM) и единая платформа от 7 класса до вузов.'
                : 'Socratic AI Mentor ("Aga"), adaptive ELO rating, cognitive diagnostic modeling (CDM), and unified platform for schools to universities.'}
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-primer-canvas-subtle border border-primer-border-default w-fit">
              <button
                type="button"
                onClick={() => setActiveShowcaseTab('socratic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeShowcaseTab === 'socratic'
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{lang === 'KZ' ? '🧠 Сократ ИИ' : lang === 'RU' ? '🧠 Сократ ИИ' : '🧠 Socratic AI'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShowcaseTab('elo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeShowcaseTab === 'elo'
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-primer-attention-fg" />
                <span>{lang === 'KZ' ? '🔥 ELO және Стрик' : lang === 'RU' ? '🔥 ELO и Стрик' : '🔥 ELO & Streak'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShowcaseTab('math')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeShowcaseTab === 'math'
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'KZ' ? '📐 KaTeX & Графиктер' : lang === 'RU' ? '📐 KaTeX & Графики' : '📐 Math & Graphs'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShowcaseTab('tokens')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeShowcaseTab === 'tokens'
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'KZ' ? '🏛️ Ұйымдар токені' : lang === 'RU' ? '🏛️ Токены организаций' : '🏛️ Org Tokens'}</span>
              </button>
            </div>

            {/* Showcase Interactive Card */}
            <div className="rounded-2xl border border-primer-border-default bg-primer-canvas-subtle p-5 shadow-primer-md transition-all">
              
              {activeShowcaseTab === 'socratic' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primer-accent-subtle text-primer-accent-fg flex items-center justify-center font-bold text-xs">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primer-fg-default">
                          {lang === 'KZ' ? 'Сократикалық наставник «Аға»' : lang === 'RU' ? 'Сократический наставник «Аға»' : 'Socratic Mentor "Aga"'}
                        </h4>
                        <p className="text-[10px] text-primer-fg-muted">
                          {lang === 'KZ' ? 'Тікелей дайын жауап бермейді — ойлауға жетелейді' : lang === 'RU' ? 'Не дает готовый ответ — направляет ход мысли' : 'Guides student reasoning without spoiling direct answers'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="accent" className="text-[10px] py-0 font-mono">
                      Active Discovery
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-primer-canvas-inset border border-primer-border-muted space-y-2.5">
                    <div className="text-xs font-semibold text-primer-fg-default flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primer-accent-fg shrink-0 mt-0.5" />
                      <span>
                        {lang === 'KZ'
                          ? '«Квадрат теңсіздікті шешу үшін алдымен оның нөлдерін қалай табамыз?»'
                          : lang === 'RU'
                          ? '«Чтобы решить квадратное неравенство, с чего мы начнем поиск корней?»'
                          : '"To solve a quadratic inequality, how do we find its roots first?"'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {[
                        { id: 1, kz: 'Дискриминант D арқылы', ru: 'Через дискриминант D', en: 'Via discriminant D' },
                        { id: 2, kz: 'Виет теоремасымен', ru: 'По теореме Виета', en: 'Via Vieta theorem' },
                        { id: 3, kz: 'График параболасымен', ru: 'Графиком параболы', en: 'By parabola graph' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSocraticChoice(opt.id)}
                          className={`p-2 rounded-lg text-left text-[11px] font-bold border transition cursor-pointer flex items-center justify-between ${
                            socraticChoice === opt.id
                              ? 'bg-primer-accent-subtle/50 border-primer-accent-emphasis text-primer-accent-fg'
                              : 'bg-primer-canvas-default border-primer-border-default text-primer-fg-muted hover:border-primer-accent-muted hover:text-primer-fg-default'
                          }`}
                        >
                          <span>{lang === 'KZ' ? opt.kz : lang === 'RU' ? opt.ru : opt.en}</span>
                          {socraticChoice === opt.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>

                    {socraticChoice && (
                      <div className="p-2.5 rounded-lg bg-primer-success-subtle/30 border border-primer-success-muted text-primer-success-fg text-[11px] font-medium flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {lang === 'KZ'
                            ? 'Өте дұрыс! Түбірлерін анықтап, сан түзуіндегі интервалдар таңбасын қоямыз.'
                            : lang === 'RU'
                            ? 'Отлично! Определяем корни и расставляем знаки на интервалах числовой прямой.'
                            : 'Excellent! We determine the roots and place interval signs on the number line.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'elo' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primer-attention-subtle text-primer-attention-fg flex items-center justify-center font-bold text-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primer-fg-default">
                          {lang === 'KZ' ? 'Адаптивті ELO Рейтинг және Ранктер' : lang === 'RU' ? 'Адаптивный ELO Рейтинг и Ранги' : 'Adaptive ELO Rating & Ranks'}
                        </h4>
                        <p className="text-[10px] text-primer-fg-muted">
                          {lang === 'KZ' ? 'Шахмат жүйесі бойынша қиындыққа қарай өседі' : lang === 'RU' ? 'Растет в зависимости от сложности задач' : 'Progresses dynamically based on problem difficulty'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-primer-attention-fg">
                      1000 ➔ 1600+
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { rank: '🌱 Өскін', range: '1000 ELO', desc: 'Бастаушы' },
                      { rank: '🌿 Тұғыр', range: '1200 ELO', desc: 'Орта деңгей' },
                      { rank: '🦅 Қыран', range: '1400 ELO', desc: 'Жоғары қарқын' },
                      { rank: '⭐ Самғау', range: '1600+ ELO', desc: 'Олимпиада' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-center space-y-1 ${
                          idx === 1
                            ? 'bg-primer-accent-subtle/30 border-primer-accent-muted text-primer-fg-default'
                            : 'bg-primer-canvas-inset border-primer-border-muted/70 text-primer-fg-muted'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.rank}</div>
                        <div className="text-[10px] font-mono font-bold text-primer-accent-fg">{item.range}</div>
                        <div className="text-[9px]">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'math' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primer-done-subtle text-primer-done-fg flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primer-fg-default">
                          {lang === 'KZ' ? 'KaTeX Формулалар & Сан түзуі' : lang === 'RU' ? 'KaTeX Формулы & Числовая прямая' : 'KaTeX Formulas & Visual Canvas'}
                        </h4>
                        <p className="text-[10px] text-primer-fg-muted">
                          {lang === 'KZ' ? 'Теңдеулер мен геометриялық сызбалар' : lang === 'RU' ? 'Наглядные математические графики' : 'Clear mathematical formulas and graphs'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-primer-canvas-inset border border-primer-border-muted flex items-center justify-around font-mono text-xs">
                    <div className="text-center">
                      <span className="text-primer-accent-fg font-bold">x² - 5x + 6 = 0</span>
                      <p className="text-[10px] text-primer-fg-muted mt-0.5">x₁ = 2, x₂ = 3</p>
                    </div>
                    <div className="h-6 w-px bg-primer-border-muted" />
                    <div className="text-center">
                      <span className="text-primer-attention-fg font-bold">D = b² - 4ac</span>
                      <p className="text-[10px] text-primer-fg-muted mt-0.5">Дискриминант</p>
                    </div>
                    <div className="h-6 w-px bg-primer-border-muted" />
                    <div className="text-center">
                      <span className="text-primer-done-fg font-bold">(-2; 3)</span>
                      <p className="text-[10px] text-primer-fg-muted mt-0.5">Интервал</p>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'tokens' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primer-accent-subtle text-primer-accent-fg flex items-center justify-center font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primer-fg-default">
                          {lang === 'KZ' ? 'Ұйымдар мен Токендер жүйесі' : lang === 'RU' ? 'Система токенов организаций' : 'Organization Tokens Network'}
                        </h4>
                        <p className="text-[10px] text-primer-fg-muted">
                          {lang === 'KZ' ? 'Мектептер, Колледждер, ВУЗ-дар және Репетиторлар' : lang === 'RU' ? 'Школы, Колледжи, ВУЗы и Центры' : 'Schools, Colleges, Universities & Tutors'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-primer-canvas-inset border border-primer-border-muted space-y-1">
                      <div className="text-xs font-bold text-primer-accent-fg font-mono">STD-ORG-8K9M2</div>
                      <div className="text-[11px] font-semibold text-primer-fg-default">Оқушы токені (Student Token)</div>
                      <p className="text-[10px] text-primer-fg-muted">Ұйымның барлық курстары мен топтық рейтингін ашады</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-primer-canvas-inset border border-primer-border-muted space-y-1">
                      <div className="text-xs font-bold text-primer-done-fg font-mono">TCH-ORG-4P1X9</div>
                      <div className="text-[11px] font-semibold text-primer-fg-default">Оқытушы токені (Teacher Token)</div>
                      <p className="text-[10px] text-primer-fg-muted">Курс құрастырушы мен журнал құқығын береді</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Metrics Footer */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-primer-canvas-subtle/60 border border-primer-border-muted">
              <div className="text-sm sm:text-base font-black text-primer-fg-default font-mono">100%</div>
              <div className="text-[10px] text-primer-fg-muted font-medium">
                {lang === 'KZ' ? 'Сократтық оқу' : lang === 'RU' ? 'Сократовское обучение' : 'Socratic Learning'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primer-canvas-subtle/60 border border-primer-border-muted">
              <div className="text-sm sm:text-base font-black text-primer-accent-fg font-mono">365 күн</div>
              <div className="text-[10px] text-primer-fg-muted font-medium">
                {lang === 'KZ' ? 'Белсенділік матрицасы' : lang === 'RU' ? 'Матрица активности' : 'Activity Heatmap'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primer-canvas-subtle/60 border border-primer-border-muted">
              <div className="text-sm sm:text-base font-black text-primer-done-fg font-mono">7-12 + ВУЗ</div>
              <div className="text-[10px] text-primer-fg-muted font-medium">
                {lang === 'KZ' ? 'Кез келген білім деңгейі' : lang === 'RU' ? 'Любой уровень образования' : 'Multi-Grade Scope'}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Clean, Focused Auth Card (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border border-primer-border-default shadow-primer-overlay bg-primer-canvas-subtle overflow-hidden rounded-2xl">
            <CardHeader className="pb-3 border-b border-primer-border-muted/60 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isRegister ? t('auth.sign_up') : t('auth.sign_in')}
                </CardTitle>

                {/* Segmented Role Switcher */}
                <div className="flex gap-1 bg-primer-canvas-inset p-1 rounded-xl border border-primer-border-muted">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      role === 'student'
                        ? 'bg-primer-accent-emphasis text-white shadow-xs'
                        : 'text-primer-fg-muted hover:text-primer-fg-default'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t('auth.role_switcher_student')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      role === 'teacher'
                        ? 'bg-primer-accent-emphasis text-white shadow-xs'
                        : 'text-primer-fg-muted hover:text-primer-fg-default'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{t('auth.role_switcher_teacher')}</span>
                  </button>
                </div>
              </div>

              <CardDescription className="text-xs text-primer-fg-muted">
                {role === 'student'
                  ? t('auth.student_subtitle')
                  : t('auth.teacher_subtitle')}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3.5 pt-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-primer-danger-subtle/20 border border-primer-danger-muted text-primer-danger-fg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">{errorMsg}</span>
                  </div>
                )}

                {/* Full Name on Registration */}
                {isRegister && (
                  <div>
                    <label className="text-xs font-bold text-primer-fg-default block mb-1">
                      {t('auth.name_label')} *
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        role === 'student'
                          ? t('auth.name_placeholder_student')
                          : t('auth.name_placeholder_teacher')
                      }
                      required
                      className="w-full text-xs h-9"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-primer-fg-default block mb-1">
                    {t('auth.email_label')} *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email_placeholder')}
                    required
                    className="w-full text-xs h-9"
                  />
                </div>

                {/* Password with Show/Hide */}
                <div>
                  <label className="text-xs font-bold text-primer-fg-default block mb-1">
                    {t('auth.password_label')} *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.password_placeholder')}
                      required
                      className="w-full text-xs h-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primer-fg-muted hover:text-primer-fg-default"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Registration Extra Fields */}
                {isRegister && (
                  <div className="space-y-3 pt-1 border-t border-primer-border-muted/50">
                    
                    {/* Educational Institution / School */}
                    <div>
                      <label className="text-xs font-bold text-primer-fg-default block mb-1 flex items-center gap-1">
                        <School className="w-3.5 h-3.5 text-primer-accent-fg" />
                        <span>{t('auth.school_label')}</span>
                      </label>
                      <select
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full text-xs h-9 rounded-lg border border-primer-border-default bg-primer-canvas-default text-primer-fg-default px-2.5 focus:outline-none focus:border-primer-accent-emphasis"
                      >
                        {VERIFIED_ORGANIZATIONS.map((org) => (
                          <option key={org} value={org}>
                            {org}
                          </option>
                        ))}
                      </select>

                      {school === 'Басқа / Другая школа' && (
                        <div className="mt-1.5">
                          <Input
                            type="text"
                            value={customSchool}
                            onChange={(e) => setCustomSchool(e.target.value)}
                            placeholder={t('auth.custom_school_placeholder')}
                            className="w-full text-xs h-8"
                          />
                        </div>
                      )}
                    </div>

                    {/* Grade / Academic Status (For Students) */}
                    {role === 'student' && (
                      <div>
                        <label className="text-xs font-bold text-primer-fg-default block mb-1">
                          {t('auth.grade_label')}
                        </label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full text-xs h-9 rounded-lg border border-primer-border-default bg-primer-canvas-default text-primer-fg-default px-2.5 focus:outline-none focus:border-primer-accent-emphasis"
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g.value} value={g.value}>
                              {lang === 'KZ' ? g.labelKZ : lang === 'RU' ? g.labelRU : g.labelEN}
                            </option>
                          ))}
                        </select>

                        {grade === 'Басқа' && (
                          <div className="mt-1.5">
                            <Input
                              type="text"
                              value={customGrade}
                              onChange={(e) => setCustomGrade(e.target.value)}
                              placeholder="мысалы: IT Bootcamp / 6-сынып..."
                              className="w-full text-xs h-8"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Teacher Org Token */}
                    {role === 'teacher' && (
                      <div>
                        <label className="text-xs font-bold text-primer-fg-default block mb-1 flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-primer-accent-fg" />
                          <span>{t('auth.org_token_label')} *</span>
                        </label>
                        <Input
                          type="text"
                          value={orgToken}
                          onChange={(e) => setOrgToken(e.target.value)}
                          placeholder="ORG-8F3K9A"
                          required
                          className="w-full text-xs h-9 font-mono"
                        />
                        <p className="text-[10px] text-primer-fg-muted mt-1">
                          {lang === 'KZ'
                            ? 'Ресми мұғалім аккредитациясы үшін мектептен берілген токен'
                            : 'Официальный токен аккредитации преподавателя'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                  disabled={isLoading}
                  className="w-full font-bold text-xs h-9 shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('auth.processing')}
                    </span>
                  ) : isRegister ? (
                    t('auth.submit_register')
                  ) : (
                    t('auth.submit_login')
                  )}
                </Button>

                <div className="text-center w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setErrorMsg(null);
                    }}
                    className="text-xs text-primer-accent-fg hover:underline font-semibold cursor-pointer"
                  >
                    {isRegister ? t('auth.switch_to_login') : t('auth.switch_to_register')}
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-primer-border-muted/60 py-3 px-4 text-center text-xs text-primer-fg-muted font-mono">
        © 2026 Zerde Intelligent Educational Platform • Real SQLite + Express Cognitive Architecture
      </footer>

    </div>
  );
};
