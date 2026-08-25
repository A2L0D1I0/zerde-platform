import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Shield,
  Flame,
  Award,
  Globe,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import api from '@/api/client';

export const StudentProfileScreen: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const isRU = language === 'RU';
  const isEN = language === 'EN';

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [grade, setGrade] = useState(user?.grade ? String(user.grade) : '');
  const [orgToken, setOrgToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setGrade(user.grade ? String(user.grade) : '');
      setOrgToken('');
    }
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get<any>(`/student/dashboard?studentId=${user?.id || user?.email || ''}`);
        if (res) setDashboardData(res);
      } catch (e) {
        console.warn('[StudentProfileScreen] Failed to load dashboard', e);
      }
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let updatedSchool = user?.school;
      let updatedOrgId = user?.organizationId;

      // If student provided an organization token, strictly validate with the server
      if (orgToken.trim()) {
        try {
          const res: any = await api.post('/auth/link-org-token', {
            org_token: orgToken.trim(),
            targetRole: 'student',
          });

          if (res && res.success) {
            updatedSchool = res.organization?.name || orgToken.trim();
            updatedOrgId = res.organization?.id;
            showToast({
              type: 'success',
              title: isEN ? 'Organization Verified! 🎉' : isRU ? 'Организация подтверждена! 🎉' : 'Ұйым расталды! 🎉',
              message: res.message || updatedSchool,
            });
          }
        } catch (err: any) {
          const errMsg =
            err?.response?.data?.error ||
            (isEN ? 'Invalid organization token' : isRU ? 'Неверный токен организации' : 'Қате ұйым токені');
          showToast({
            type: 'danger',
            title: isEN ? 'Token Error' : isRU ? 'Ошибка токена' : 'Токен қатесі',
            message: errMsg,
          });
          setIsSaving(false);
          return; // Stop saving to prevent saving gibberish as school name!
        }
      }

      const trimmedName = fullName.trim() || user?.full_name;
      const targetGrade = (typeof grade === 'string' ? grade.trim() : String(grade || '')) || user?.grade;
      const targetSchool = updatedSchool || (isEN ? 'Self-study' : isRU ? 'Самостоятельное обучение' : 'Өз бетінше оқу');

      try {
        await api.put('/auth/profile', {
          full_name: trimmedName,
          grade: targetGrade,
          school: targetSchool,
        });
      } catch (saveErr) {
        console.warn('[StudentProfileScreen] Failed to sync profile to server', saveErr);
      }

      updateUser({
        full_name: trimmedName,
        grade: targetGrade,
        school: targetSchool,
        organizationId: updatedOrgId,
      });

      setIsEditModalOpen(false);
      showToast({
        type: 'success',
        title: isEN ? 'Profile Updated' : isRU ? 'Профиль обновлен' : 'Профиль сақталды',
        message: trimmedName || '',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const elo = dashboardData?.elo ?? user?.elo ?? 1000;
  const streak = dashboardData?.streak_days ?? user?.streakDays ?? 0;

  const formatDisplayGrade = (g?: string | number | null) => {
    if (!g) return isEN ? 'Grade 10' : isRU ? '10 класс' : '10-сынып';
    const str = String(g).trim();
    if (str.includes('сынып') || str.includes('класс') || str.includes('Grade') || str.includes('Колледж') || str.includes('ВУЗ')) {
      return str;
    }
    return `${str}-сынып`;
  };

  // Localized Rank
  const getRankBadge = (eloVal: number) => {
    if (eloVal >= 1600) return { icon: '⭐', label: isEN ? 'Ascend' : isRU ? 'Взлёт' : 'Самғау' };
    if (eloVal >= 1400) return { icon: '🦅', label: isEN ? 'Eagle' : isRU ? 'Беркут' : 'Қыран' };
    if (eloVal >= 1200) return { icon: '🌿', label: isEN ? 'Base' : isRU ? 'Опора' : 'Тұғыр' };
    return { icon: '🌱', label: isEN ? 'Seedling' : isRU ? 'Росток' : 'Өскін' };
  };

  const rankInfo = getRankBadge(elo);

  return (
    <div className="max-w-3xl mx-auto px-4 py-3 space-y-4">
      {/* Profile Card */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-5 shadow-primer-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-2xl shadow-primer-sm">
              {rankInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-primer-fg-default">
                  {user?.full_name || (isEN ? 'Student' : isRU ? 'Ученик' : 'Оқушы')}
                </h2>
                <Badge variant="outline" className="text-xs font-mono">
                  {formatDisplayGrade(user?.grade)}
                </Badge>
              </div>
              <p className="text-xs text-primer-fg-muted">{user?.email}</p>
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <Building2 className="w-3.5 h-3.5 text-primer-accent-fg" />
                <span className="text-xs font-semibold text-primer-fg-default">
                  {user?.school || (isEN ? 'Self-study' : isRU ? 'Самостоятельное обучение' : 'Өз бетінше оқу')}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-700/60">
                  Master Passport: {user?.uuid?.startsWith('MP-') ? user.uuid : `MP-${user?.school?.includes('BIL') ? 'BIL' : 'NIS'}-${(String(user?.grade || '').match(/\d+/)?.[0] || '09').padStart(2, '0')}-${String(user?.id || 1).padStart(4, '0')}`}
                </span>
                {user?.organizationId && (
                  <Badge variant="accent" className="text-[9px] py-0 font-mono">
                    {isEN ? 'Verified' : isRU ? 'Верифицировано' : 'Расталған'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm" className="text-xs font-semibold">
            {isEN ? 'Edit Profile' : isRU ? 'Редактировать профиль' : 'Профильді өзгерту'}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-primer-border-muted">
          <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-center space-y-1">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>{isEN ? 'XP Rating' : isRU ? 'Рейтинг XP' : 'Рейтинг XP'}</span>
            </div>
            <div className="text-base font-bold text-primer-accent-fg font-mono">{elo}</div>
            <Badge variant="outline" className="text-[10px]">
              {rankInfo.icon} {rankInfo.label}
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-center space-y-1">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-primer-danger-fg" />
              <span>{isEN ? 'Streak (days)' : isRU ? 'Стрик (дней)' : 'Стрик (күндер)'}</span>
            </div>
            <div className="text-base font-bold text-primer-danger-fg font-mono">
              {streak} {isEN ? 'days' : isRU ? 'дней' : 'күн'}
            </div>
            <Badge variant="outline" className="text-[10px]">
              🔥 {isEN ? 'Active' : isRU ? 'Активный' : 'Үздіксіз'}
            </Badge>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-center space-y-1">
            <div className="text-[11px] text-primer-fg-muted font-medium flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEN ? 'Role' : isRU ? 'Роль' : 'Рөл'}</span>
            </div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono capitalize">
              {user?.role || 'student'}
            </div>
            <Badge variant="outline" className="text-[10px]">
              {formatDisplayGrade(user?.grade)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-5 shadow-primer-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primer-fg-muted">
          {isEN ? 'Settings' : isRU ? 'Настройки' : 'Баптаулар'}
        </h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-2 border-b border-primer-border-muted">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-primer-fg-muted" />
            <div>
              <div className="text-xs font-bold text-primer-fg-default">
                {isEN ? 'Language' : isRU ? 'Язык' : 'Тіл'}
              </div>
              <p className="text-[11px] text-primer-fg-muted">
                {isEN ? 'Interface language' : isRU ? 'Язык интерфейса' : 'Интерфейс тілі'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-primer-canvas-inset p-1 rounded-lg border border-primer-border-default">
            {(['KZ', 'RU', 'EN'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  language === lang
                    ? 'bg-primer-accent-emphasis text-white shadow-xs'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center justify-between py-2 border-b border-primer-border-muted">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-primer-fg-muted" />
            ) : (
              <Sun className="w-4 h-4 text-primer-fg-muted" />
            )}
            <div>
              <div className="text-xs font-bold text-primer-fg-default">
                {isEN ? 'Theme' : isRU ? 'Тема оформления' : 'Тақырып'}
              </div>
              <p className="text-[11px] text-primer-fg-muted">
                {isEN ? 'Light or Dark mode' : isRU ? 'Светлая или темная' : 'Ашық немесе күңгірт режим'}
              </p>
            </div>
          </div>

          <Button onClick={toggleTheme} variant="outline" size="sm" className="text-xs gap-1.5">
            {theme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>{isEN ? 'Dark' : isRU ? 'Тёмная' : 'Күңгірт'}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEN ? 'Light' : isRU ? 'Светлая' : 'Ашық'}</span>
              </>
            )}
          </Button>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full text-xs font-bold text-primer-danger-fg hover:bg-primer-danger-subtle hover:border-primer-danger-emphasis gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isEN ? 'Log out' : isRU ? 'Выйти из аккаунта' : 'Шығу'}</span>
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay rounded-2xl p-5 space-y-4">
          <DialogHeader className="pb-2 border-b border-primer-border-muted">
            <DialogTitle className="text-sm sm:text-base font-bold text-primer-fg-default">
              {isEN ? 'Edit Profile' : isRU ? 'Редактировать профиль' : 'Профильді өзгерту'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-bold text-primer-fg-default">
                {isEN ? 'Full Name:' : isRU ? 'ФИО:' : 'Толық аты-жөні:'}
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isEN ? 'e.g. Ivan Ivanov' : isRU ? 'например: Иван Иванов' : 'мысалы: Азамат Темірханов'}
                className="text-xs"
                required
              />
            </div>

            {/* Grade */}
            <div className="space-y-1">
              <label className="font-bold text-primer-fg-default">
                {isEN ? 'Grade / Class:' : isRU ? 'Класс:' : 'Сынып:'}
              </label>
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder={isEN ? 'e.g. Grade 10' : isRU ? 'например: 10-класс' : 'мысалы: 10-сынып'}
                className="text-xs"
              />
            </div>

            {/* Organization Token (Strict Student Token Verification) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-primer-fg-default flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-primer-accent-fg" />
                  <span>
                    {isEN
                      ? 'Organization Token (Student Token):'
                      : isRU
                      ? 'Токен организации (Токен ученика):'
                      : 'Ұйым токені (Оқушы токені):'}
                  </span>
                </label>
              </div>
              <Input
                value={orgToken}
                onChange={(e) => setOrgToken(e.target.value)}
                placeholder={
                  user?.school && user?.organizationId
                    ? `${user.school} (${isEN ? 'Linked' : isRU ? 'Привязано' : 'Қосылған'})`
                    : isEN
                    ? 'e.g. NIS-STUDENT-2026 or BIL-STUDENT-2026'
                    : isRU
                    ? 'например: NIS-STUDENT-2026 или BIL-STUDENT-2026'
                    : 'мысалы: NIS-STUDENT-2026 немесе BIL-STUDENT-2026'
                }
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-primer-fg-muted leading-tight">
                {isEN
                  ? 'Enter student token to link official school courses. Leave blank for self-study.'
                  : isRU
                  ? 'Введите токен ученика для доступа к закрытым курсам школы. Оставьте пустым для самостоятельного обучения.'
                  : 'Мектеп курстарына қосылу үшін оқушы токенін енгізіңіз. Өз бетінше оқу үшін бос қалдырыңыз.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-muted">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="text-xs"
              >
                {isEN ? 'Cancel' : isRU ? 'Отмена' : 'Бас тарту'}
              </Button>
              <Button type="submit" size="sm" disabled={isSaving} className="text-xs font-bold">
                {isSaving ? (
                  isEN ? 'Verifying...' : isRU ? 'Проверка...' : 'Тексерілуде...'
                ) : (
                  isEN ? 'Save' : isRU ? 'Сохранить' : 'Сақтау'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfileScreen;
