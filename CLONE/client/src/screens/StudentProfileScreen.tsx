import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Settings,
  Globe,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Zap,
  School,
  Edit3,
  Brain,
  Layers,
  Clock,
  ChevronRight,
  Check,
  AlertCircle,
  KeyRound,
  Users,
  Copy,
  Plus,
  Lock,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppLanguage } from '@/types';
import { userProgressService, UserProgressState, OrgMembership, FriendEntry } from '@/services/userProgressService';

export const GRADE_STATUS_OPTIONS = [
  { value: '7-сынып', labelKZ: '7-сынып', labelRU: '7 класс', labelEN: 'Grade 7' },
  { value: '8-сынып', labelKZ: '8-сынып', labelRU: '8 класс', labelEN: 'Grade 8' },
  { value: '9-сынып', labelKZ: '9-сынып', labelRU: '9 класс', labelEN: 'Grade 9' },
  { value: '10-сынып', labelKZ: '10-сынып', labelRU: '10 класс', labelEN: 'Grade 10' },
  { value: '11-сынып', labelKZ: '11-сынып', labelRU: '11 класс', labelEN: 'Grade 11' },
  { value: '12-сынып', labelKZ: '12-сынып', labelRU: '12 класс', labelEN: 'Grade 12' },
  { value: 'Колледж', labelKZ: 'Колледж', labelRU: 'Колледж', labelEN: 'College' },
  { value: 'ЖОО (ВУЗ)', labelKZ: 'ЖОО (Университет)', labelRU: 'ВУЗ (Университет)', labelEN: 'University' },
  { value: 'Басқа', labelKZ: 'Басқа (Еркін жазу)', labelRU: 'Другое', labelEN: 'Other' },
];

export const StudentProfileScreen: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const lang = (language as 'KZ' | 'RU' | 'EN') || 'KZ';

  const [progressState, setProgressState] = useState<UserProgressState>(userProgressService.getState());

  useEffect(() => {
    const unsub = userProgressService.subscribe((state) => {
      setProgressState(state);
    });
    return () => unsub();
  }, []);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [grade, setGrade] = useState(user?.grade || '10-сынып');
  const [school, setSchool] = useState(user?.school || '');

  // Add Org Token Modal
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [newTokenInput, setNewTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Add Friend Modal
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [friendError, setFriendError] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      full_name: fullName.trim(),
      grade: grade.trim(),
      school: school.trim(),
    });
    setIsEditModalOpen(false);
    showToast({
      type: 'success',
      title: lang === 'KZ' ? 'Профиль жаңартылды!' : lang === 'RU' ? 'Профиль обновлен!' : 'Profile updated!',
      message: fullName.trim(),
    });
  };

  const handleAddOrgToken = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    const res = userProgressService.addOrgToken(newTokenInput);
    if (!res.success) {
      if (res.error === 'CANNOT_BE_STUDENT_IN_TEACHER_ORG') {
        setTokenError(
          lang === 'KZ'
            ? 'Сіз бұл ұйымда мұғалімсіз! Бір ұйымда бір уақытта мұғалім әрі оқушы болуға болмайды.'
            : lang === 'RU'
            ? 'Вы уже состоите в этой организации как учитель! Нельзя быть учеником и учителем в одной организации.'
            : 'You are an educator in this organization. Role exclusivity applies.'
        );
      } else if (res.error === 'ALREADY_LINKED') {
        setTokenError(
          lang === 'KZ'
            ? 'Бұл токен немесе ұйым бұрыннан қосылған'
            : lang === 'RU'
            ? 'Эта организация уже привязана к аккаунту'
            : 'Organization already linked'
        );
      } else {
        setTokenError(
          lang === 'KZ'
            ? 'Жарамсыз токен пішімі (мысалы: STD-ORG-NIS-77)'
            : lang === 'RU'
            ? 'Неверный формат токена (например: STD-ORG-NIS-77)'
            : 'Invalid token format (e.g. STD-ORG-NIS-77)'
        );
      }
      return;
    }

    setNewTokenInput('');
    setIsAddTokenModalOpen(false);
    showToast({
      type: 'success',
      title: lang === 'KZ' ? 'Ұйым қосылды!' : lang === 'RU' ? 'Организация привязана!' : 'Organization linked!',
      message: res.membership?.orgName || '',
    });
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    setFriendError(null);

    const res = userProgressService.addFriend(friendCodeInput, friendNameInput);
    if (!res.success) {
      if (res.error === 'CANNOT_ADD_SELF') {
        setFriendError(
          lang === 'KZ'
            ? 'Өз жеке кодыңызды дос ретінде қоса алмайсыз'
            : lang === 'RU'
            ? 'Нельзя добавить свой собственный код'
            : 'Cannot add yourself'
        );
      } else if (res.error === 'ALREADY_FRIENDS') {
        setFriendError(
          lang === 'KZ' ? 'Бұл студент бұрыннан достарыңызда' : 'Этот студент уже у вас в друзьях'
        );
      } else {
        setFriendError(
          lang === 'KZ'
            ? 'Жарамсыз студент коды (мысалы: ST-7K4M2)'
            : 'Неверный код студента (например: ST-7K4M2)'
        );
      }
      return;
    }

    setFriendCodeInput('');
    setFriendNameInput('');
    setIsAddFriendModalOpen(false);
    showToast({
      type: 'success',
      title: lang === 'KZ' ? 'Дос қосылды!' : lang === 'RU' ? 'Друг добавлен!' : 'Friend added!',
      message: res.friend?.name || '',
    });
  };

  const handleCopyStudentCode = () => {
    if (progressState.studentCode) {
      navigator.clipboard.writeText(progressState.studentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast({
        type: 'info',
        title: lang === 'KZ' ? 'Код көшірілді!' : 'Код скопирован!',
        message: progressState.studentCode,
      });
    }
  };

  const eloLevel =
    progressState.elo >= 1600 ? 'Самғау' : progressState.elo >= 1400 ? 'Қыран' : progressState.elo >= 1200 ? 'Тұғыр' : 'Өскін';
  const eloSymbol =
    progressState.elo >= 1600 ? '⭐' : progressState.elo >= 1400 ? '🦅' : progressState.elo >= 1200 ? '🌿' : '🌱';

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Profile Banner Card */}
      <div className="rounded-2xl border border-primer-border-default bg-primer-canvas-subtle p-4 sm:p-6 shadow-primer-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-primer-xs shrink-0">
              {user?.full_name?.charAt(0) || 'О'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-primer-fg-default">
                  {user?.full_name || 'Оқушы'}
                </h1>
                <Badge variant="accent" className="font-mono text-xs">
                  {user?.grade || '10-сынып'}
                </Badge>
              </div>
              <p className="text-xs text-primer-fg-muted flex items-center gap-1.5 mt-1">
                <School className="w-3.5 h-3.5" />
                <span>{user?.school || (lang === 'KZ' ? 'Жеке оқушы' : lang === 'RU' ? 'Независимый ученик' : 'Individual Learner')}</span>
              </p>
              <p className="text-[11px] text-primer-fg-subtle font-mono mt-0.5">
                {user?.email || 'student@school.kz'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-1.5 font-semibold text-xs shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'KZ' ? 'Өңдеу' : lang === 'RU' ? 'Редактировать' : 'Edit Profile'}</span>
          </Button>
        </div>
      </div>

      {/* 2. ELO & Rank Progression Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left: ELO League Card (7 cols) */}
        <div className="md:col-span-7 rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primer-accent-subtle text-primer-accent-fg border border-primer-accent-muted/40">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                  {lang === 'KZ' ? 'Академиялық ELO дәрежесі' : lang === 'RU' ? 'Академический ELO ранг' : 'Academic ELO Rank'}
                </h3>
                <p className="text-[10px] text-primer-fg-muted">
                  {lang === 'KZ' ? 'Сократикалық модель бойынша когнитивті даму' : 'Когнитивное развитие по модели CDM'}
                </p>
              </div>
            </div>

            <Badge variant="accent" className="font-mono text-xs">
              {eloSymbol} {eloLevel}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted/40 text-center">
              <div className="text-[10px] text-primer-fg-muted font-semibold uppercase">
                {lang === 'KZ' ? 'Рейтинг' : 'Рейтинг'}
              </div>
              <div className="text-lg font-extrabold font-mono text-primer-success-fg mt-0.5">
                {progressState.elo}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted/40 text-center">
              <div className="text-[10px] text-primer-fg-muted font-semibold uppercase">
                {lang === 'KZ' ? 'Стрик' : 'Стрик'}
              </div>
              <div className="text-lg font-extrabold font-mono text-primer-attention-fg mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
                <span>{progressState.streakDays}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted/40 text-center">
              <div className="text-[10px] text-primer-fg-muted font-semibold uppercase">
                {lang === 'KZ' ? 'Рекорд' : 'Рекорд'}
              </div>
              <div className="text-lg font-extrabold font-mono text-primer-fg-default mt-0.5">
                {progressState.longestStreak}к
              </div>
            </div>
          </div>
        </div>

        {/* Right: Streak Saver Protection Card (5 cols) */}
        <div className="md:col-span-5 rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-primer-border-muted/60">
            <div className="p-1.5 rounded-lg bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/40">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                {lang === 'KZ' ? 'Стрикті қорғау' : lang === 'RU' ? 'Заморозка стрика' : 'Streak Protection'}
              </h3>
              <p className="text-[10px] text-primer-fg-muted">
                {lang === 'KZ' ? 'Күнделікті ырғақты үзбеу токендері' : 'Токены сохранения серии'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primer-fg-default">
                {lang === 'KZ' ? 'Қолжетімді токендер:' : 'Доступные токены:'}
              </span>
              <Badge variant="attention" className="font-mono text-xs">
                🛡️ {progressState.streakFreezeTokens} / 2
              </Badge>
            </div>
            <p className="text-[10px] text-primer-fg-muted">
              {lang === 'KZ'
                ? 'Әр 7 күндік үздіксіз стрик үшін 1 қорғау токені беріледі (активация үшін стрик 3+ күн болуы қажет).'
                : 'За каждые 7 дней непрерывной серии выдается 1 токен заморозки (требуется стрик от 3 дней).'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. MULTI-ORGANIZATION TOKENS CARD */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primer-done-subtle text-primer-done-fg border border-primer-done-muted/40">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                {lang === 'KZ'
                  ? 'Байланыстырылған Ұйымдар мен Токендер'
                  : lang === 'RU'
                  ? 'Организации и токены аккредитации'
                  : 'Linked Organizations & Tokens'}
              </h3>
              <p className="text-[10px] text-primer-fg-muted">
                {lang === 'KZ'
                  ? 'Школа, ВУЗ, колледж немесе репетиторлық орталықтардың расталған токендері'
                  : 'Подтвержденные токены школы, колледжа, ВУЗа или учебных центров'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={() => setIsAddTokenModalOpen(true)}
            className="gap-1 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'KZ' ? 'Токен қосу' : lang === 'RU' ? 'Добавить токен' : 'Add Token'}</span>
          </Button>
        </div>

        {/* Organizations List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {progressState.orgMemberships.map((org) => (
            <div
              key={org.tokenId}
              className="p-3 rounded-lg border border-primer-border-muted bg-primer-canvas-inset flex items-start justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-primer-accent-fg shrink-0" />
                  <span className="text-xs font-bold text-primer-fg-default truncate">
                    {org.orgName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-mono py-0">
                    {org.tokenId}
                  </Badge>
                  <span className="text-[10px] text-primer-fg-muted">
                    {org.roleInOrg === 'teacher' ? 'Преподаватель' : 'Ученик'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-primer-fg-subtle shrink-0">
                <Lock className="w-3 h-3" />
                <span title="Токенді өшіру үшін ұйым әкімшісіне хабарласыңыз">Бекітілген</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-primer-fg-muted flex items-center gap-1 pt-1">
          <Lock className="w-3 h-3 text-primer-attention-fg shrink-0" />
          <span>
            {lang === 'KZ'
              ? 'Токенді жою немесе өзгерту академиялық есептілік үшін ұйым әкімшісі арқылы ғана орындалады.'
              : 'Отвязка токена выполняется через обращение к администрации организации для сохранения академической истории.'}
          </span>
        </p>
      </div>

      {/* 4. ACADEMIC SOCIAL & FRIENDS SYSTEM CARD */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-primer-border-muted/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primer-sponsors-subtle text-primer-sponsors-fg border border-primer-sponsors-muted/40">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
                {lang === 'KZ'
                  ? 'Академиялық достар мен Сокурсниктер'
                  : lang === 'RU'
                  ? 'Друзья и сокурсники'
                  : 'Study Buddies & Peer Network'}
              </h3>
              <p className="text-[10px] text-primer-fg-muted">
                {lang === 'KZ' ? 'Бірге оқу, стрик салыстыру және Socratic дуэльдер' : 'Совместное обучение и сравнение стриков'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={() => setIsAddFriendModalOpen(true)}
            className="gap-1 text-xs font-bold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'KZ' ? 'Дос қосу' : lang === 'RU' ? 'Добавить друга' : 'Add Friend'}</span>
          </Button>
        </div>

        {/* Shareable Student Code Banner */}
        <div className="p-3 rounded-lg bg-primer-accent-subtle/30 border border-primer-accent-muted flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primer-accent-fg">
              {lang === 'KZ' ? 'Сіздің жеке студенттік кодыңыз:' : 'Ваш персональный код студента:'}
            </div>
            <div className="text-sm font-extrabold font-mono text-primer-fg-default">
              {progressState.studentCode}
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={handleCopyStudentCode}
            className="gap-1 text-xs font-bold shrink-0"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-primer-success-fg" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? (lang === 'KZ' ? 'Көшірілді' : 'Скопировано') : (lang === 'KZ' ? 'Көшіру' : 'Копировать')}</span>
          </Button>
        </div>

        {/* Friends List */}
        {progressState.friends.length === 0 ? (
          <div className="text-center py-4 text-xs text-primer-fg-muted space-y-1">
            <p>
              {lang === 'KZ'
                ? 'Сізде әзірге қосылған достар жоқ.'
                : 'У вас пока нет добавленных друзей.'}
            </p>
            <p className="text-[10px]">
              {lang === 'KZ'
                ? 'Студенттік код арқылы сыныптастарыңызды қосып, олардың прогресін бақылаңыз.'
                : 'Добавьте сокурсников по их коду (ST-XXXXX), чтобы соревноваться в рейтинге.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {progressState.friends.map((friend) => (
              <div
                key={friend.id}
                className="p-2.5 rounded-lg border border-primer-border-muted bg-primer-canvas-inset flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primer-accent-emphasis text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {friend.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primer-fg-default">{friend.name}</span>
                      <span className="text-[9px] font-mono text-primer-fg-muted">({friend.studentCode})</span>
                    </div>
                    <div className="text-[10px] text-primer-fg-muted flex items-center gap-1.5">
                      <span>{friend.gradeOrStatus}</span>
                      <span>•</span>
                      <span className="text-primer-attention-fg flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        {friend.streakDays}к
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-primer-success-fg">
                    {friend.elo} ELO
                  </div>
                  <div className="text-[9px] text-primer-fg-subtle">
                    {friend.isStudyingNow ? (
                      <span className="text-primer-success-fg font-semibold flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-primer-success-fg animate-pulse" />
                        Оқуда
                      </span>
                    ) : (
                      'Офлайн'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. System Settings Card */}
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-primer-border-muted/60">
          <div className="p-1.5 rounded-lg bg-primer-canvas-inset text-primer-fg-muted border border-primer-border-muted">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Жүйелік баптаулар' : lang === 'RU' ? 'Системные настройки' : 'System Settings'}
            </h3>
            <p className="text-[10px] text-primer-fg-muted">
              {lang === 'KZ' ? 'Тіл мен интерфейс көрінісі' : 'Язык и тема приложения'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Language Selector */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primer-accent-fg" />
              <div>
                <div className="font-bold text-primer-fg-default">
                  {lang === 'KZ' ? 'Интерфейс тілі' : lang === 'RU' ? 'Язык интерфейса' : 'Language'}
                </div>
                <div className="text-[10px] text-primer-fg-muted">
                  {language === 'KZ' ? 'Қазақша (KZ)' : language === 'RU' ? 'Русский (RU)' : 'English (EN)'}
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              {(['KZ', 'RU', 'EN'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition cursor-pointer ${
                    language === l
                      ? 'bg-primer-accent-emphasis text-white shadow-xs'
                      : 'bg-primer-canvas-subtle text-primer-fg-muted hover:text-primer-fg-default border border-primer-border-default'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-primer-canvas-inset border border-primer-border-muted text-xs">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-primer-attention-fg" />
              ) : (
                <Sun className="w-4 h-4 text-primer-attention-fg" />
              )}
              <div>
                <div className="font-bold text-primer-fg-default">
                  {lang === 'KZ' ? 'Тема (Түс реңкі)' : lang === 'RU' ? 'Тема оформления' : 'Theme Mode'}
                </div>
                <div className="text-[10px] text-primer-fg-muted">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="xs"
              onClick={toggleTheme}
              className="text-xs font-semibold"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>
        </div>

        {/* Logout Action */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-primer-danger-fg hover:bg-primer-danger-subtle/20 gap-1.5 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'KZ' ? 'Шығу' : lang === 'RU' ? 'Выйти из аккаунта' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>

      {/* MODAL 1: Edit Profile */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default">
              {lang === 'KZ' ? 'Профильді өңдеу' : lang === 'RU' ? 'Редактирование профиля' : 'Edit Profile'}
            </DialogTitle>
          </div>

          <form onSubmit={handleSaveProfile} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Аты-жөні' : lang === 'RU' ? 'ФИО' : 'Full Name'}
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  {lang === 'KZ' ? 'Сынып / Деңгей' : lang === 'RU' ? 'Класс / Статус' : 'Grade / Level'}
                </label>
                <select
                  value={GRADE_STATUS_OPTIONS.some((o) => o.value === grade) ? grade : 'Басқа'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'Басқа') {
                      setGrade(val);
                    } else {
                      setGrade('');
                    }
                  }}
                  className="w-full text-xs p-2 rounded-lg bg-primer-canvas-default border border-primer-border-default text-primer-fg-default mb-1.5"
                >
                  {GRADE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'KZ' ? opt.labelKZ : lang === 'RU' ? opt.labelRU : opt.labelEN}
                    </option>
                  ))}
                </select>

                {(!GRADE_STATUS_OPTIONS.some((o) => o.value === grade) || grade === '' || grade === 'Басқа') && (
                  <Input
                    type="text"
                    value={grade === 'Басқа' ? '' : grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder={lang === 'KZ' ? 'Мысалы: 10 «А»' : lang === 'RU' ? 'Например: 10 «А»' : 'e.g. 10th Grade'}
                    required
                    className="w-full text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-primer-fg-default mb-1">
                  {lang === 'KZ' ? 'Мектеп / Оқу орны' : lang === 'RU' ? 'Школа / Учебное заведение' : 'School / Institution'}
                </label>
                <Input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                {lang === 'KZ' ? 'Бас тарту' : lang === 'RU' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold"
              >
                {lang === 'KZ' ? 'Сақтау' : lang === 'RU' ? 'Сохранить' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Add Organization Token */}
      <Dialog open={isAddTokenModalOpen} onOpenChange={setIsAddTokenModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primer-done-fg" />
              <span>
                {lang === 'KZ'
                  ? 'Ұйым токенін қосу'
                  : lang === 'RU'
                  ? 'Добавить токен организации'
                  : 'Link Organization Token'}
              </span>
            </DialogTitle>
          </div>

          <form onSubmit={handleAddOrgToken} className="p-4 space-y-3">
            {tokenError && (
              <div className="p-3 rounded-lg bg-primer-danger-subtle/20 border border-primer-danger-muted text-primer-danger-fg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tokenError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Ұйым токені (STD-ORG-XXXXX)' : 'Токен организации (STD-ORG-XXXXX)'}
              </label>
              <Input
                type="text"
                value={newTokenInput}
                onChange={(e) => setNewTokenInput(e.target.value)}
                placeholder="STD-ORG-DOSTYK-2026"
                required
                className="w-full text-xs font-mono uppercase"
              />
              <p className="text-[10px] text-primer-fg-muted mt-1">
                {lang === 'KZ'
                  ? 'Токен мектеп, орталық немесе репетитор тарапынан беріледі. Ол курс мазмұнын бірден ашады.'
                  : 'Токен выдается учебным заведением или центром. Он открывает доступ ко всем материалам организации.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAddTokenModalOpen(false);
                  setTokenError(null);
                }}
              >
                {lang === 'KZ' ? 'Бас тарту' : 'Отмена'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold"
              >
                {lang === 'KZ' ? 'Растау' : 'Подтвердить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Add Friend */}
      <Dialog open={isAddFriendModalOpen} onOpenChange={setIsAddFriendModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          <div className="px-4 py-3 border-b border-primer-border-default bg-primer-canvas-subtle">
            <DialogTitle className="text-sm font-bold text-primer-fg-default flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primer-sponsors-fg" />
              <span>
                {lang === 'KZ' ? 'Дос қосу' : lang === 'RU' ? 'Добавить друга' : 'Add Study Buddy'}
              </span>
            </DialogTitle>
          </div>

          <form onSubmit={handleAddFriend} className="p-4 space-y-3">
            {friendError && (
              <div className="p-3 rounded-lg bg-primer-danger-subtle/20 border border-primer-danger-muted text-primer-danger-fg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{friendError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Студенттің жеке коды (ST-XXXXX) *' : 'Код студента (ST-XXXXX) *'}
              </label>
              <Input
                type="text"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                placeholder="ST-8K9P2"
                required
                className="w-full text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primer-fg-default mb-1">
                {lang === 'KZ' ? 'Есімі (Қосымша)' : 'Имя сокурсника (Необязательно)'}
              </label>
              <Input
                type="text"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                placeholder={lang === 'KZ' ? 'Мысалы: Батырхан' : 'Например: Батырхан'}
                className="w-full text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-primer-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAddFriendModalOpen(false);
                  setFriendError(null);
                }}
              >
                {lang === 'KZ' ? 'Бас тарту' : 'Отмена'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold"
              >
                {lang === 'KZ' ? 'Қосу' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfileScreen;
