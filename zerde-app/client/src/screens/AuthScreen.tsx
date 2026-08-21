import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles, GraduationCap, UserCheck, KeyRound, Info, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('9-сынып');
  const [city, setCity] = useState('');
  const [targetGoal, setTargetGoal] = useState('ҰБТ / ЕНТ 2026');
  const [subject, setSubject] = useState('Математика');
  const [bio, setBio] = useState('');
  const [orgToken, setOrgToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: name || (role === 'teacher' ? 'Гульнара Сериковна Алимжанова' : 'Азамат Темірханов'),
          role,
          school: school || (role === 'teacher' ? 'Zerde Lab' : ''),
          grade: role === 'student' ? grade : undefined,
          bio: bio || (targetGoal ? `${city ? city + ' • ' : ''}${targetGoal}` : ''),
          org_token: role === 'teacher' ? orgToken : undefined,
        });
      } else {
        await login(email || (role === 'teacher' ? 'teacher@zerde.kz' : 'azamat@zerde.kz'), password, role);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || t('common.error_occurred'));
    }
  };

  const handleQuickDemoLogin = async (targetRole: 'student' | 'teacher') => {
    setErrorMsg(null);
    if (targetRole === 'student') {
      await login('azamat@zerde.kz', 'password123', 'student');
    } else {
      await login('teacher@zerde.kz', 'password123', 'teacher');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primer-canvas-subtle border border-primer-border-default shadow-primer-xs mb-2">
            <svg height="28" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="28" fill="currentColor" className="text-primer-fg-default">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-primer-fg-default tracking-tight">
            {t('brand.title')} — {t('brand.subtitle')}
          </h1>
          <p className="text-xs text-primer-fg-muted">
            {t('brand.tagline')}
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="border-primer-border-default shadow-primer-overlay">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isRegister ? t('action.register') : t('action.login')}</CardTitle>
              
              {/* Universal Role Switcher */}
              <div className="flex gap-1 bg-primer-canvas-inset p-0.5 rounded-md border border-primer-border-muted">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    role === 'student'
                      ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs'
                      : 'text-primer-fg-muted hover:text-primer-fg-default'
                  }`}
                >
                  {t('auth.role_switcher_student')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    role === 'teacher'
                      ? 'bg-primer-canvas-subtle text-primer-fg-default shadow-xs'
                      : 'text-primer-fg-muted hover:text-primer-fg-default'
                  }`}
                >
                  {t('auth.role_switcher_teacher')}
                </button>
              </div>
            </div>
            <CardDescription>
              {role === 'student'
                ? t('student.passport_title')
                : t('teacher.portal_title')}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 rounded-md bg-primer-danger-subtle border border-primer-danger-muted text-primer-danger-fg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                    {t('common.name')} *
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'student' ? 'Алдияр Саржанов' : 'Гульнара Сериковна Алимжанова'}
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'student@zerde.kz' : 'teacher@zerde.kz'}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                  {t('auth.password')} *
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Extended Profile Fields on Registration */}
              {isRegister && role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                        {t('auth.grade_label')}
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full h-8 px-2 rounded-md border border-primer-border-default bg-primer-canvas-inset text-xs text-primer-fg-default focus:outline-none focus:ring-1 focus:ring-primer-accent-emphasis"
                      >
                        <option value="7-сынып">7-сынып</option>
                        <option value="8-сынып">8-сынып</option>
                        <option value="9-сынып">9-сынып</option>
                        <option value="10-сынып">10-сынып</option>
                        <option value="11-сынып">11-сынып</option>
                        <option value="Студент">Студент</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                        {t('auth.city_label')}
                      </label>
                      <Input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('auth.city_placeholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                      {t('auth.school_label')}
                    </label>
                    <Input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder={t('auth.school_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                      {t('auth.target_exam_label')}
                    </label>
                    <Input
                      type="text"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value)}
                      placeholder={t('auth.target_exam_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                      {t('auth.bio_label')}
                    </label>
                    <Input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t('auth.bio_placeholder')}
                    />
                  </div>
                </>
              )}

              {/* Extended Profile Fields for Teacher Registration */}
              {isRegister && role === 'teacher' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                      {t('auth.subject_label')}
                    </label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t('auth.subject_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                      {t('auth.school_label')}
                    </label>
                    <Input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="РФМШ, NIS, Гимназия..."
                    />
                  </div>

                  {/* Organization Security Token for Teacher Registration */}
                  <div className="space-y-1 pt-1 border-t border-primer-border-muted">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-primer-fg-default flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-primer-attention-fg" />
                        {t('auth.org_token_label')} *
                      </label>
                    </div>
                    <Input
                      type="text"
                      value={orgToken}
                      onChange={(e) => setOrgToken(e.target.value)}
                      placeholder={t('auth.org_token_placeholder')}
                      required
                    />
                    <div className="text-[10px] text-primer-fg-muted flex items-center gap-1 mt-1">
                      <Info className="w-3 h-3 text-primer-accent-fg shrink-0" />
                      <span>{t('auth.org_token_hint')} (Демо: <code className="bg-primer-canvas-inset px-1 py-0.2 rounded font-mono text-[9px]">ORG-8F3K9A</code> немесе <code className="bg-primer-canvas-inset px-1 py-0.2 rounded font-mono text-[9px]">ZK-7492-X</code>)</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-2.5">
              <Button type="submit" variant="primary" className="w-full font-bold" disabled={isLoading}>
                {isRegister ? t('action.register') : t('action.login')}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                }}
                className="text-xs text-primer-accent-fg hover:underline cursor-pointer"
              >
                {isRegister
                  ? t('auth.has_account')
                  : t('auth.no_account')}
              </button>
            </CardFooter>
          </form>
        </Card>


        {/* Quick Demo Logins Box */}
        <div className="rounded-lg border border-primer-border-muted bg-primer-canvas-subtle p-3 space-y-2">
          <div className="text-[11px] font-bold text-primer-fg-muted flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primer-attention-fg" />
            <span>Демо-режимде жылдам кіру (1-клик):</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickDemoLogin('student')}
              className="justify-start gap-1.5 text-left h-auto py-2"
            >
              <UserCheck className="w-4 h-4 text-primer-success-fg shrink-0" />
              <div className="truncate">
                <div className="font-bold text-[11px]">Оқушы (Азамат)</div>
                <div className="text-[9px] text-primer-fg-muted font-mono">1420 ELO • 12 күн</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickDemoLogin('teacher')}
              className="justify-start gap-1.5 text-left h-auto py-2"
            >
              <GraduationCap className="w-4 h-4 text-primer-accent-fg shrink-0" />
              <div className="truncate">
                <div className="font-bold text-[11px]">Мұғалім (Гульнара С.)</div>
                <div className="text-[9px] text-primer-fg-muted font-mono">24 оқушы • 4 курс</div>
              </div>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

