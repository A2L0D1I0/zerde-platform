import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  School,
  Lock,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { UserRole } from '@/types';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';
  const isDark = theme === 'dark';

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('NIS IB Astana');
  const [grade, setGrade] = useState('9-сынып');
  const [orgToken, setOrgToken] = useState('NIS-STUDENT-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMsg(null);
    if (newRole === 'teacher') {
      setOrgToken('NIS-TEACHER-2026');
      if (email.includes('student')) setEmail('teacher.nis@nis.kz');
    } else {
      setOrgToken('NIS-STUDENT-2026');
      if (email.includes('teacher')) setEmail('student.nis@nis.kz');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register({
          email: email.trim(),
          password,
          full_name: fullName.trim() || (role === 'teacher' ? 'Мұғалім' : 'Оқушы'),
          role,
          school: school.trim(),
          grade: role === 'student' ? grade : undefined,
          org_token: orgToken.trim() || undefined,
        });
      } else {
        await login(email.trim(), password, role);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const message =
        err?.response?.data?.error ||
        err?.message ||
        (lang === 'KZ' ? 'Авторизация қатесі' : 'Ошибка авторизации');
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Ambient Background Layer */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      
      {/* Glowing Mesh Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none animate-ambient-glow" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none animate-ambient-glow" style={{ animationDelay: '4s' }} />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none animate-ambient-glow" style={{ animationDelay: '2s' }} />

      {/* 2. Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30 ring-1 ring-white/20">
            Z
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                ZERDE
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-900/50 text-blue-300 border border-blue-700/50">
                2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Cognitive Educational Architecture
            </p>
          </div>
        </div>

        {/* Language & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            {(['KZ', 'RU', 'EN'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === l
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
            title="Тақырыпты ауыстыру"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </header>

      {/* 3. Main Center Container (2-Column Split Hub) */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: Cognitive Telemetry & Platform Invariants */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 hidden sm:block"
          >
            {/* Mission Hero Header */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Жаңа буын зияткерлік білім жүйесі</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Мемлекеттік стандартқа заземленген оқыту.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
                5 оқулықтық слот, нақты ELO рейтингі, күнделікті коммиттер стригі және AI CoPilot көмегімен сабақ жоспарлау.
              </p>
            </div>

            {/* Telemetry Live Cards Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              
              {/* ELO Card */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-2 backdrop-blur-xs">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ELO Динамикасы</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">+15 XP</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-white">1000</span>
                  <span className="text-xs text-slate-400">🌱 Өскін</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Әр дұрыс шығарылған есеп үшін объективті ELO есептеледі
                </p>
              </div>

              {/* Study Streak Card */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-2 backdrop-blur-xs">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />
                    <span>Оқу стригі</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">15 күн</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-white">100%</span>
                  <span className="text-xs text-slate-400">Үздіксіз</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Күн сайын кемінде 1 тапсырма орындау арқылы отты сақтаңыз
                </p>
              </div>

            </div>

            {/* Invariant Badge Strip */}
            <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-white block font-semibold">Gemini 2.5 Flash Grounding</strong>
                0% галлюцинация • 5 оқулық слоты бойынша қатаң заземление
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Interactive Glassmorphic Auth Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full max-w-md mx-auto"
          >
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 sm:p-7 shadow-2xl backdrop-blur-md relative space-y-5 text-slate-200">
              
              {/* Role Switcher Pill Tab */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {lang === 'KZ' ? 'Портал рөлін таңдаңыз:' : lang === 'RU' ? 'Выберите роль:' : 'Select Portal Role:'}
                </label>
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
                  {(['student', 'teacher'] as const).map((r) => {
                    const isActive = role === r;
                    const isStudent = r === 'student';
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`relative z-10 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="role-pill"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30"
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
                          <span>{isStudent ? (lang === 'KZ' ? 'Оқушы' : 'Ученик') : (lang === 'KZ' ? 'Мұғалім' : 'Учитель')}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isRegister
                    ? (lang === 'KZ' ? 'Жаңа аккаунт ашу' : lang === 'RU' ? 'Создать аккаунт' : 'Create Account')
                    : (lang === 'KZ' ? 'Жүйеге кіру' : lang === 'RU' ? 'Вход в систему' : 'Sign In')}
                </h2>
                <p className="text-xs text-slate-400 pt-0.5">
                  {role === 'teacher'
                    ? (lang === 'KZ' ? 'Мұғалімдердің басқару кабинеті' : 'Кабинет учителя и методиста')
                    : (lang === 'KZ' ? 'Оқушының дербес тренажеры' : 'Индивидуальный тренажер ученика')}
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium flex items-start gap-2"
                >
                  <span className="text-base leading-none">⚠️</span>
                  <div className="flex-1 leading-snug">{errorMsg}</div>
                </motion.div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {/* Full Name for Registration */}
                {isRegister && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">
                      {lang === 'KZ' ? 'Толық аты-жөніңіз (ФИО) *' : 'Полное имя (ФИО) *'}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Саржанов Алдияр"
                      required
                      className="w-full h-10 px-3 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Email / Username */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">
                    {lang === 'KZ' ? 'Электрондық пошта (Email) *' : 'Электронная почта *'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'teacher' ? 'teacher.nis@nis.kz' : 'student.nis@nis.kz'}
                    required
                    className="w-full h-10 px-3 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Password with View Toggle */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">
                    {lang === 'KZ' ? 'Құпиясөз *' : 'Пароль *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password2026!"
                      required
                      className="w-full h-10 pl-3 pr-10 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Extra Fields for Registration */}
                {isRegister && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Мектеп / Ұйым:</label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="NIS IB Astana"
                        className="w-full h-9 px-3 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-white"
                      />
                    </div>

                    {role === 'student' ? (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">Сынып:</label>
                        <input
                          type="text"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          placeholder="9-сынып"
                          className="w-full h-9 px-3 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-white"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">Токен (Токен школы):</label>
                        <input
                          type="text"
                          value={orgToken}
                          onChange={(e) => setOrgToken(e.target.value)}
                          placeholder="NIS-TEACHER-2026"
                          className="w-full h-9 px-3 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-700 text-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 rounded-xl font-bold text-xs sm:text-sm text-white tracking-wide transition shadow-lg shadow-blue-600/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'KZ' ? 'Тексерілуде...' : 'Проверка...'}</span>
                    </span>
                  ) : isRegister ? (
                    <span>{lang === 'KZ' ? 'Тіркелу' : 'Зарегистрироваться'}</span>
                  ) : (
                    <span>{lang === 'KZ' ? 'Жүйеге кіру' : 'Войти в систему'}</span>
                  )}
                </motion.button>
              </form>

              {/* Demo Account Quick-Fill Pills */}
              {!isRegister && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'KZ' ? '1-шертумен жылдам кіру (Демо):' : 'Быстрый вход в 1 клик (Демо):'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role === 'teacher' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('teacher.nis@nis.kz');
                            setPassword('Password2026!');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60 hover:text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <School className="w-3 h-3 text-purple-400" />
                          <span>teacher.nis@nis.kz</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('aldiyar.teacher@nis.kz');
                            setPassword('Password2026!');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-950/40 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60 hover:text-white transition cursor-pointer"
                        >
                          aldiyar.teacher@nis.kz
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('student.nis@nis.kz');
                            setPassword('Password2026!');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 hover:text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <GraduationCap className="w-3 h-3 text-emerald-400" />
                          <span>student.nis@nis.kz</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('aldiyar.student@nis.kz');
                            setPassword('Password2026!');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-950/40 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60 hover:text-white transition cursor-pointer"
                        >
                          aldiyar.student@nis.kz
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Toggle Switch (Sign In vs Register) */}
              <div className="text-center pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <span>
                    {isRegister
                      ? (lang === 'KZ' ? 'Аккаунтыңыз бар ма? Кіру ➔' : 'Уже есть аккаунт? Войти ➔')
                      : (lang === 'KZ' ? 'Жаңа аккаунт тіркеу ➔' : 'Создать новый аккаунт ➔')}
                  </span>
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-3 text-center text-xs text-slate-500 font-mono border-t border-slate-800/60">
        © 2026 Zerde Intelligent Educational Platform • Real SQLite + Express Cognitive Architecture
      </footer>

    </div>
  );
};

export default AuthScreen;
