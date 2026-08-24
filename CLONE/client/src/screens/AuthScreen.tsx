import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  GraduationCap,
  UserCheck,
  KeyRound,
  AlertCircle,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Brain,
  Award,
  Layers,
  BookOpen,
  Calendar,
  Flame,
  Users,
} from 'lucide-react';

const GRADE_OPTIONS = [
  { value: '7-сынып', labelKZ: '7-сынып', labelRU: '7 класс', labelEN: 'Grade 7' },
  { value: '8-сынып', labelKZ: '8-сынып', labelRU: '8 класс', labelEN: 'Grade 8' },
  { value: '9-сынып', labelKZ: '9-сынып', labelRU: '9 класс', labelEN: 'Grade 9' },
  { value: '10-сынып', labelKZ: '10-сынып', labelRU: '10 класс', labelEN: 'Grade 10' },
  { value: '11-сынып', labelKZ: '11-сынып', labelRU: '11 класс', labelEN: 'Grade 11' },
  { value: '12-сынып', labelKZ: '12-сынып (NIS/IB)', labelRU: '12 класс (NIS/IB)', labelEN: 'Grade 12 (NIS/IB)' },
  { value: 'Колледж', labelKZ: 'Колледж студенті', labelRU: 'Студент колледжа', labelEN: 'College Student' },
  { value: 'ЖОО (ВУЗ)', labelKZ: 'Университет (ВУЗ)', labelRU: 'Университет (ВУЗ)', labelEN: 'University' },
  { value: 'Басқа', labelKZ: 'Басқа (Еркін жазу)', labelRU: 'Другое', labelEN: 'Other' },
];

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('10-сынып');
  const [customGrade, setCustomGrade] = useState('');
  const [orgToken, setOrgToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMsg(t('auth.name_required') || 'Аты-жөніңізді енгізіңіз');
          setIsSubmitting(false);
          return;
        }

        if (role === 'teacher' && !orgToken.trim()) {
          setErrorMsg(
            lang === 'KZ'
              ? 'Қате токен'
              : lang === 'RU'
              ? 'Неверный токен'
              : 'Invalid security token'
          );
          setIsSubmitting(false);
          return;
        }

        const finalGrade = grade === 'Басқа' ? (customGrade.trim() || '10-сынып') : grade;

        await register({
          email: email.trim(),
          password,
          full_name: name.trim(),
          role,
          grade: role === 'student' ? finalGrade : undefined,
          org_token: orgToken.trim() ? orgToken.trim() : undefined,
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
          setIsSubmitting(false);
          return;
        }
        await login(email.trim(), password, role);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (lang === 'KZ' ? 'Қате орын алды' : 'Произошла ошибка');
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-500 font-sans select-none overflow-x-hidden ${
        isDark
          ? 'bg-[#0b101b] text-white'
          : 'bg-[#f4f6fb] text-slate-900'
      }`}
    >
      {/* 1. TOP HEADER */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-600/30">
            Z
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black tracking-tight font-mono text-blue-600 dark:text-blue-400">
              ZERDE
            </span>
            <span className="text-xs font-bold opacity-80">Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
            title="Теманы ауыстыру / Сменить тему"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Language Switcher */}
          <div
            className={`inline-flex items-center gap-1 p-1 rounded-xl border ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <Globe className="w-3.5 h-3.5 opacity-50 ml-1.5 mr-0.5" />
            {(['KZ', 'RU', 'EN'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  language === l
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'opacity-60 hover:opacity-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN HERO & AUTH SECTION */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        
        {/* LEFT COLUMN: Dual Floating Perspective Isometric Dashboard Mockups */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center relative min-h-[500px] perspective-[1200px]">
          
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

          {/* Top Isometric Dashboard Card */}
          <div
            className={`w-[540px] rounded-2xl p-5 border transition-all duration-500 shadow-2xl transform rotate-[-7deg] skew-y-[4deg] translate-y-[-20px] translate-x-[10px] hover:translate-y-[-25px] hover:rotate-[-5deg] ${
              isDark
                ? 'bg-[#151c2e] border-slate-700/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-slate-200'
                : 'bg-white border-slate-200/90 shadow-[0_25px_50px_-12px_rgba(30,58,138,0.12)] text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="text-[11px] font-bold font-mono text-blue-600 dark:text-blue-400 ml-2">
                  ZERDE Learning Space
                </span>
              </div>
              <div className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 space-y-2 border-r border-slate-100 dark:border-slate-800/80 pr-2">
                <div className="h-6 rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center px-2 text-[10px] font-bold gap-1.5">
                  <BookOpen className="w-3 h-3" />
                  <span>Курстар</span>
                </div>
                <div className="h-5 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center px-2 text-[9px] text-slate-400 gap-1.5">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Күнтізбе</span>
                </div>
                <div className="h-5 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center px-2 text-[9px] text-slate-400 gap-1.5">
                  <Flame className="w-2.5 h-2.5" />
                  <span>Стрик</span>
                </div>
                <div className="h-5 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center px-2 text-[9px] text-slate-400 gap-1.5">
                  <Brain className="w-2.5 h-2.5" />
                  <span>Сократ ИИ</span>
                </div>
              </div>

              <div className="col-span-9 space-y-3">
                <div className="p-3 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Ағымдағы сабақ
                    </div>
                    <div className="text-xs font-black">Алгебра 10 • Тригонометрия</div>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-white/20 text-[10px] font-bold backdrop-blur-xs">
                    94% Mastery
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        Физика 10
                      </span>
                      <span className="text-[9px] font-mono font-bold text-blue-500">1420 ELO</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-3/4 rounded-full" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        Информатика
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-500">1510 ELO</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Overlapping Isometric Card */}
          <div
            className={`w-[520px] rounded-2xl p-4 border transition-all duration-500 shadow-xl transform rotate-[-4deg] skew-y-[2deg] translate-y-[20px] translate-x-[60px] hover:translate-y-[15px] hover:rotate-[-2deg] ${
              isDark
                ? 'bg-[#101726]/95 border-slate-800 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8)] text-slate-200'
                : 'bg-white/95 border-slate-200/80 shadow-[0_20px_45px_-10px_rgba(30,58,138,0.1)] text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NIS IB Astana • Академиялық журнал</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                10 «А» сынып
              </span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="grid grid-cols-12 font-bold opacity-60 px-1">
                <div className="col-span-6">Оқушы</div>
                <div className="col-span-3 text-center">Дәреже (ELO)</div>
                <div className="col-span-3 text-right">Стрик 🔥</div>
              </div>
              <div className="grid grid-cols-12 items-center p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                <div className="col-span-6 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">
                    1
                  </div>
                  <span>Саржанов Алдияр</span>
                </div>
                <div className="col-span-3 text-center font-mono">1420 pts</div>
                <div className="col-span-3 text-right font-mono">12 күн</div>
              </div>
              <div className="grid grid-cols-12 items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-medium">
                <div className="col-span-6 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[8px]">
                    2
                  </div>
                  <span>Ахметов Данияр</span>
                </div>
                <div className="col-span-3 text-center font-mono">1380 pts</div>
                <div className="col-span-3 text-right font-mono">9 күн</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Clean Auth Card */}
        <div className="lg:col-span-5 w-full max-w-[420px] mx-auto">
          <div
            className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
              isDark
                ? 'bg-[#151c2e] border-slate-800 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]'
                : 'bg-white border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(30,58,138,0.08)]'
            }`}
          >
            {/* Header: Brand Box + Role Switcher */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs border border-blue-200 dark:border-blue-800/50">
                  ZERDE <span className="font-semibold text-slate-700 dark:text-slate-300">Platform</span>
                </div>
              </div>

              {/* Role Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    role === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'opacity-60 hover:opacity-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>{t('auth.role_switcher_student')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    role === 'teacher'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'opacity-60 hover:opacity-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>{t('auth.role_switcher_teacher')}</span>
                </button>
              </div>
            </div>

            {/* Card Title */}
            <div className="mb-4">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isRegister
                  ? lang === 'KZ'
                    ? 'Жаңа аккаунт ашу'
                    : lang === 'RU'
                    ? 'Создать аккаунт'
                    : 'Create Account'
                  : lang === 'KZ'
                  ? 'Жүйеге кіру'
                  : lang === 'RU'
                  ? 'Вход в систему'
                  : 'Sign In'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {role === 'student'
                  ? t('auth.student_subtitle')
                  : t('auth.teacher_subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* Name field for Registration */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    {t('auth.name_label')} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      role === 'student'
                        ? t('auth.name_placeholder_student')
                        : t('auth.name_placeholder_teacher')
                    }
                    required
                    className={`w-full text-xs h-10 px-3 rounded-xl border transition-all outline-none ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20'
                    }`}
                  />
                </div>
              )}

              {/* Email / Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {lang === 'KZ' ? 'Пайдаланушы аты немесе Email *' : lang === 'RU' ? 'Имя пользователя или Email *' : 'Username or Email *'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  required
                  className={`w-full text-xs h-10 px-3 rounded-xl border transition-all outline-none ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20'
                  }`}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {t('auth.password_label')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password_placeholder')}
                    required
                    className={`w-full text-xs h-10 pl-3 pr-9 rounded-xl border transition-all outline-none ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Registration Extra Fields (Only Token + Grade, NO School select) */}
              {isRegister && (
                <div className="space-y-2.5 pt-1">
                  
                  {/* Organization Security Token */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        {t('auth.org_token_label')} {role === 'teacher' ? '*' : `(${lang === 'KZ' ? 'міндетті емес' : lang === 'RU' ? 'необязательно' : 'optional'})`}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={orgToken}
                      onChange={(e) => setOrgToken(e.target.value)}
                      placeholder={role === 'teacher' ? 'TCH-NIS-8F3K9A' : 'STD-NIS-4N9P1A'}
                      required={role === 'teacher'}
                      className={`w-full text-xs h-10 px-3 rounded-xl border font-mono uppercase tracking-wider outline-none ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  {/* Grade for student */}
                  {role === 'student' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        {t('auth.grade_label')}
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className={`w-full text-xs h-10 px-2.5 rounded-xl border transition-all outline-none cursor-pointer ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-700 text-white focus:border-blue-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                            {lang === 'KZ' ? g.labelKZ : lang === 'RU' ? g.labelRU : g.labelEN}
                          </option>
                        ))}
                      </select>

                      {grade === 'Басқа' && (
                        <input
                          type="text"
                          value={customGrade}
                          onChange={(e) => setCustomGrade(e.target.value)}
                          placeholder="мысалы: IT Bootcamp / 6-сынып..."
                          className={`w-full text-xs h-9 px-3 rounded-xl border mt-1 outline-none ${
                            isDark
                              ? 'bg-slate-900/80 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Action Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-xl font-bold text-xs sm:text-sm text-white tracking-wide transition-all duration-200 transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('auth.processing')}</span>
                    </span>
                  ) : isRegister ? (
                    <span>{t('auth.submit_register')}</span>
                  ) : (
                    <span>{t('auth.submit_login')}</span>
                  )}
                </button>
              </div>

              {/* Forgot password */}
              {!isRegister && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => alert(lang === 'KZ' ? 'Құпия сөзді қалпына келтіру үшін кураторға хабарласыңыз' : 'Для восстановления пароля обратитесь к куратору')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline transition cursor-pointer font-medium"
                  >
                    {lang === 'KZ' ? 'Құпия сөзді ұмыттыңыз ба?' : lang === 'RU' ? 'Забыли пароль?' : 'Forgot Password?'}
                  </button>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                    * Telegram ID немесе электрондық пошта арқылы расталады
                  </p>
                </div>
              )}

              {/* Switch to Register / Sign In */}
              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <span>{isRegister ? t('auth.switch_to_login') : t('auth.switch_to_register')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-3 text-center text-xs text-slate-400 dark:text-slate-500 font-mono border-t border-slate-200/60 dark:border-slate-800/60">
        © 2026 Zerde Intelligent Educational Platform • Real SQLite + Express Cognitive Architecture
      </footer>

    </div>
  );
};
