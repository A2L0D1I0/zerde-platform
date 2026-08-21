import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, GraduationCap, UserCheck, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('10 «A»');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      await register({
        email,
        full_name: name || (role === 'teacher' ? 'Гульнара Сериковна Алимжанова' : 'Азамат Темірханов'),
        role,
        grade,
      });
    } else {
      await login(email || (role === 'teacher' ? 'teacher@zerde.kz' : 'azamat@zerde.kz'), 'password123', role);
    }
  };

  const handleQuickDemoLogin = async (targetRole: 'student' | 'teacher') => {
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
            Zerde білім беру экожүйесіне қош келдіңіз
          </h1>
          <p className="text-xs text-primer-fg-muted">
            GitHub Primer негізіндегі Сократикалық білім беру платформасы
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="border-primer-border-default shadow-primer-overlay">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isRegister ? t('action.register') : t('action.login')}</CardTitle>
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
                  {t('role.student')}
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
                  {t('role.teacher')}
                </button>
              </div>
            </div>
            <CardDescription>
              {role === 'student'
                ? 'Оқушы ретінде кіріп, «Аға» наставнигімен ELO рейтингіңізді көтеріңіз'
                : 'Мұғалім ретінде кіріп, курстар құрыңыз және сынып аналитикасын бақылаңыз'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3">
              {isRegister && (
                <div>
                  <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                    Толық аты-жөні
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'student' ? 'Азамат Темірханов' : 'Гульнара Сериковна Алимжанова'}
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'azamat@zerde.kz' : 'teacher@zerde.kz'}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                  Құпиясөз
                </label>
                <Input
                  type="password"
                  defaultValue="password123"
                  placeholder="••••••••"
                  required
                />
              </div>

              {isRegister && role === 'student' && (
                <div>
                  <label className="text-[11px] font-semibold text-primer-fg-muted block mb-1">
                    Сынып
                  </label>
                  <Input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="9 «A»"
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-2.5">
              <Button type="submit" variant="primary" className="w-full font-bold" disabled={isLoading}>
                {isRegister ? t('action.register') : t('action.login')}
              </Button>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-primer-accent-fg hover:underline cursor-pointer"
              >
                {isRegister
                  ? 'Аккаунтыңыз бар ма? Кіру'
                  : 'Аккаунтыңыз жоқ па? Тіркелу'}
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
                <div className="text-[9px] text-primer-fg-muted font-mono">24 оқушы • 3 курс</div>
              </div>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
