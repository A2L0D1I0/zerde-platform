# 📘 Спецификация Системы Паспорта Ученика «Zerde» (Student Passport System)

> **Версия:** 1.0.0 (Production Data Architecture)  
> **Платформа:** Zerde (Национальная когнитивная EdTech-платформа Казахстана)  
> **Стандарты:** ZVDSL+, CDM (DINA Model), SM-2 Spaced Repetition, ELO Rating Engine, KaTeX, SQLite 3 / TypeScript 5.5+  
> **Целевая аудитория:** Ученики 7–11 классов РК, Кураторы, Учителя-предметники, Родители.

---

## 📑 Оглавление
1. [Архитектурный обзор и концепция Паспорта Ученика](#1-архитектурный-обзор-и-концепция-паспорта-ученика)
2. [8 Ключевых Модулей Паспорта](#2-8-ключевых-модулей-паспорта)
   - [2.1. Идентификация и академическая привязка](#21-идентификация-и-академическая-привязка)
   - [2.2. Языковой профиль и локализация](#22-языковой-профиль-и-локализация)
   - [2.3. Рейтинговая система ELO и 4 ранга](#23-рейтинговая-система-elo-и-4-ранга)
   - [2.4. Когнитивный профиль и Q-Matrix компетенций (CDM)](#24-когнитивный-профиль-и-q-matrix-компетенций-cdm)
   - [2.5. Жизненный цикл курсов и предметов (Enrollment & 2-Factor Topics)](#25-жизненный-цикл-курсов-и-предметов-enrollment--2-factor-topics)
   - [2.6. Трекинг активности и учебных привычек](#26-трекинг-активности-и-учебных-привычек)
   - [2.7. Центр интервального повторения памяти (SM-2 Spaced Repetition)](#27-центр-интервального-повторения-памяти-sm-2-spaced-repetition)
   - [2.8. Персональный Roadmap и целевой экзамен](#28-персональный-roadmap-и-целевой-экзамен)
3. [Строгие TypeScript Интерфейсы и Типы](#3-строгие-typescript-интерфейсы-и-типы)
4. [Реляционная схема базы данных SQLite (DDL)](#4-реляционная-схема-базы-данных-sqlite-ddl)
5. [JSON Payload & API Контракты](#5-json-payload--api-контракты)
6. [Математические модели и формулы](#6-математические-модели-и-формулы)
   - [6.1. Алгоритм ELO и Ledger Дельт](#61-алгоритм-elo-и-ledger-дельт)
   - [6.2. CDM (DINA) Обновление апостериорных вероятностей](#62-cdm-dina-обновление-апостериорных-вероятностей)
   - [6.3. Модель SM-2 Интервального повторения](#63-модель-sm-2-интервального-повторения)
   - [6.4. Предиктор баллов ЕНТ / СОР / СОЧ](#64-предиктор-баллов-ент--сор--соч)

---

## 1. Архитектурный обзор и концепция Паспорта Ученика

**Паспорт Ученика Zerde (Student Passport)** — это динамический когнитивно-академический цифровой профиль школьника, объединяющий в едином реактивном реестре:
1. **Академическую телеметрию** (школа, класс, куратор, четверть, оценки);
2. **Динамический когнитивный портрет** (вектор освоения микронавыков $\boldsymbol{\alpha}$, классификатор мыслительных ловушек);
3. **Геймифицированный рейтинг ELO** с жестким анти-чит аудитом и защитой от джейлбрейков;
4. **Долговременную память** на базе алгоритма SuperMemo-2 (SM-2);
5. **Траекторию достижения цели** (Roadmap к ЕНТ/ҰБТ или олимпиадам).

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Z E R D E   P A S S P O R T                             │
├──────────────────────────────────────┬──────────────────────────────────────────────────┤
│ 1. ИДЕНТИФИКАЦИЯ И АКАДЕМИЯ          │ 2. ЯЗЫКОВОЙ ПРОФИЛЬ                              │
│ • UUID: ST_KZ_09_042                 │ • Язык интерфейса: KZ (Қазақша)                  │
│ • Азамат Қалиев, 9 «А»               │ • Родной язык: KZ, Язык обучения: KZ             │
│ • NIS IB Astana • Куратор: С. Батыр  │ • Билингвальные глоссарии: Вкл                   │
├──────────────────────────────────────┼──────────────────────────────────────────────────┤
│ 3. РЕЙТИНГОВАЯ СИСТЕМА ELO           │ 4. КОГНИТИВНЫЙ ПРОФИЛЬ & Q-MATRIX (CDM)          │
│ • Общий ELO: 1420 (🦅 ҚЫРАН)         │ • Освоено: 18 микронавыков | Дефицит: 3 навыка   │
│ • Алгебра: 1435 | Физика: 1380       │ • Классификатор ошибок: 60% Вычисл., 25% ОДЗ     │
│ • Дельты: +15 Eureka, -20 Jailbreak  │ • DINA Posterior Mastery Probabilities           │
├──────────────────────────────────────┼──────────────────────────────────────────────────┤
│ 5. КУРСЫ И ТЕМЫ ЧЕТВЕРТИ             │ 6. АКТИВНОСТЬ & ТЕЛЕМЕТРИЯ                       │
│ • 4 активных курса (enrolled)        │ • Стрик: 12 дней 🔥 | Heatmap: Level 4           │
│ • Двухфакторный статус:              │ • Ср. время: 94 сек | Eureka Rate: 78.4%        │
│   [В работе] ➔ [Ожидает] ➔ [Усвоено] │ • Anti-Stuck триггеры: 2 за неделю               │
├──────────────────────────────────────┼──────────────────────────────────────────────────┤
│ 7. ЦЕНТР ПОВТОРЕНИЯ ПАМЯТИ (SM-2)    │ 8. ROADMAP И ЦЕЛЕВОЙ ЭКЗАМЕН                     │
│ • 3 карточки на сегодня (Дискриминант)│ • Цель: ЕНТ 2026 (Математика + Физика)           │
│ • Коэффициенты EF: 2.50, Интервал: 6д │ • Целевой балл: 135/140 | Прогноз: 118 ➔ 128     │
│ • Retention Rate: 91.2%              │ • Граф зависимостей тем (DAG)                    │
└──────────────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 2. 8 Ключевых Модулей Паспорта

### 2.1. Идентификация и академическая привязка
- **Уникальный ID**: `ST_KZ_09_042` (Префикс страны, класса, уникальный порядковый номер) + внутренний `UUIDv4`.
- **ФИО**: Полное разделение (`firstName`, `lastName`, `middleName`).
- **Школа**: Наименование, ID школы в едином реестре МОН РК/NIS, тип школы (`NIS`, `BIL`, `GIMNAZIYA`, `GENERAL_SECONDARY`, `RSHOMBS`), регион.
- **Класс**: Числовой уровень (7–11) и литера (например, `9 «А»`).
- **Куратор / Классный руководитель**: ID, ФИО, контактный телефон, email, рабочий Telegram.
- **Учителя-предметники**: Справочник учителей, привязанных к предметам ученика.
- **Контакты родителей (Законных представителей)**: ФИО, степень родства (`father`, `mother`, `guardian`), телефон, Telegram для дайджестов успеваемости, флаг согласия на уведомления об академических рисках (`notifyOnRisk`).

### 2.2. Языковой профиль и локализация
- **Выбранный язык интерфейса**: `'KZ'` | `'RU'` | `'EN'` (мгновенная реактивная смена).
- **Родной язык (Native Language)**: Для оптимизации подсказок ИИ-наставника «Аға».
- **Язык обучения в школе (Instruction Language)**: `'KZ'` | `'RU'` | `'EN'`.
- **Билингвальный режим подсказок (Bilingual Mode)**: Показ терминов на двух языках (например: `Квадраттық теңсіздік / Квадратное неравенство / Quadratic Inequality`).
- **Голосовой профиль TTS**: Настройки синтеза речи для Сократического диалога (`kz_male_aga`, `kz_female_dana`, `ru_male_aga`, `ru_female_dana`, `en_male_aga`).

### 2.3. Рейтинговая система ELO и 4 ранга
- **Шкала 4 рангов Zerde**:
  1. 🌱 **ӨСКІН** (`OSKIN`): `1000 – 1199 ELO` — Начало пути, закрытие базовых понятий ГОСО.
  2. 🌿 **ТҰҒЫР** (`TUGYR`): `1200 – 1399 ELO` — Уверенная база, стабильное решение стандартных задач.
  3. 🦅 **ҚЫРАН** (`KYRAN`): `1400 – 1599 ELO` — Твердый отличник, глубокое системное понимание, решение задач уровня СОР/СОЧ на максимум.
  4. ⭐ **САМҒАУ** (`SAMGHAU`): `1600+ ELO` — Высокий олимпиадный уровень, претендент на образовательный грант и 130+ баллов ЕНТ.
- **Формула расчета общего рейтинга**:
  $$\text{Global ELO} = \left( \frac{1}{N} \sum_{i=1}^N \text{Subject ELO}_i \right) \times K_{\text{quarter}}$$
  где $K_{\text{quarter}} = 1.0 + 0.05 \times (\text{QuarterProgress} - 0.5)$ — коэффициент активности текущей четверти.
- **Гранулярный ELO**: Независимый рейтинг по каждому предмету (Алгебра, Геометрия, Физика, Химия, Қазақ тілі, Биология, Информатика).
- **Аудируемый Ledger дельт ELO**:
  - `+15 ELO`: **Eureka Moment 🎉** — самостоятельное распутывание сложной задачи через развилки «Аға».
  - `+7 ELO`: **Краткое правильное решение** с выбором аргументации.
  - `+3 ELO`: **Прямой ответ** без развернутого обоснования.
  - `0 ELO`: Ошибка на обучающей развилке мысли (без демотивации).
  - `-20 ELO`: **Anti-Jailbreak Guard ⚠️** — штраф за попытку внедрения промпт-инъекций, вымогательства ответов у ИИ или обхода правил.
  - *Нижний порог*: Рейтинг не может опуститься ниже `0 ELO` (минимальная планка новичка `1000 ELO` калибруется на старте).

### 2.4. Когнитивный профиль и Q-Matrix компетенций (CDM)
- **Модель когнитивной диагностики (Cognitive Diagnostic Model - DINA)**:
  - Вектор скрытых качеств $\boldsymbol{\alpha}_i = (\alpha_{i1}, \alpha_{i2}, \dots, \alpha_{iK})$, где $\alpha_{ik} \in [0, 1]$ — вероятность владения $k$-м микронавыком.
  - Q-матрица $Q \in \{0, 1\}^{J \times K}$, связывающая $J$ задач с $K$ микрокомпетенциями.
- **Гранулярные статусы микронавыков**:
  - `MASTERED` ($P \ge 0.85$): Навык устойчиво закреплен.
  - `DEVELOPING` ($0.50 \le P < 0.85$): Навык в процессе формирования.
  - `DEFICIENT` ($P < 0.50$): Выявлен системный пробел, требующий интервенции.
- **Классификатор когнитивных ошибок (Cognitive Misconception Taxonomy)**:
  1. `COMPUTATIONAL` (Вычислительная): Ошибка в арифметике, знаках $+/-$, степенях.
  2. `CONCEPTUAL` (Концептуальная): Неверное понимание фундаментального закона (например, не учтен закон сохранения импульса).
  3. `CARELESSNESS` (Невнимательность): Пропуск ОДЗ, неверно прочитанный вопрос, не переведены единицы в СИ.
  4. `FORMULA_IGNORANCE` (Незнание формулы): Применение неприменимой формулы или искажение констант.

### 2.5. Жизненный цикл курсов и предметов (Enrollment & 2-Factor Topics)
- **Enrollment Lifecycle курсов**:
  - `pending_approval`: Подана заявка (на электив, олимпиадный спецкурс), ожидает одобрения учителя.
  - `enrolled`: Обучение активно, доступ к тренажерам и материалам открыт.
  - `completed`: Курс завершен, выдан сертификат и зафиксирован итоговый ELO.
  - `expelled`: Обучение приостановлено / архив.
- **Двухфакторный жизненный цикл тем четверти (Two-Factor Quarter Topic Verification)**:
  $$\text{[queued]} \xrightarrow{\text{Старт}} \text{[in\_progress]} \xrightarrow{\text{ИИ зафиксировал } \ge 3 \text{ побед}} \text{[pending\_teacher]} \xrightarrow{\text{Учитель нажал «Зачесть»}} \text{[mastered]}$$
  - Все темы четверти сохраняются в базе до последнего дня четверти для подготовки к СОР/СОЧ.
  - Очистка и переход на новые темы происходят строго в 1-й день следующей четверти.

### 2.6. Трекинг активности и учебных привычек
- **Стрик (Streak)**: Количество дней непрерывных занятий подряд (с поддержкой механизма заморозки `streak_freeze`).
- **Тепловая карта активности (Activity Heatmap - 5 уровней)**:
  - `0`: 0 задач (серый `#ebedf0`)
  - `1`: 1–2 задачи (светло-зеленый `#9be9a8`)
  - `2`: 3–5 задач (зеленый `#40c463`)
  - `3`: 6–8 задач (насыщенный зеленый `#30a14e`)
  - `4`: 9+ задач (глубокий лесной зеленый `#216e39`)
- **Метрики учебного темпа**:
  - Среднее время решения одной задачи (норма: 60–180 сек).
  - Коэффициент самостоятельного озарения (Eureka Conversion Rate, %).
  - First-Attempt Accuracy (% решений без подсказок).

### 2.7. Центр интервального повторения памяти (SM-2 Spaced Repetition)
- Алгоритм **SuperMemo-2 (SM-2)**:
  - $EF$ (Easiness Factor) — фактор легкости (базовый $2.5$, нижний порог $1.3$).
  - $I(n)$ — интервал повторения в днях ($I(1)=1$, $I(2)=6$, $I(n)=I(n-1) \times EF$).
  - Оценка качества ответа $q \in [0..5]$:
    - $q \ge 3$: Успешное повторение, $EF$ корректируется, интервал увеличивается.
    - $q < 3$: Ошибка, сброс $n=0$, интервал возвращается на 1 день.
- Карточки содержат формулы LaTeX и микро-схемы ZVDSL+.

### 2.8. Персональный Roadmap и целевой экзамен
- **Целевые экзамены**: ЕНТ / ҰБТ (140 баллов), СОР/СОЧ (40/40), Олимпиада, Поступление в НИШ/БИЛ.
- **Дедлайн**: Дата экзамена.
- **Целевой балл vs Текущий прогноз**:
  - Текущий прогноз рассчитывается байесовским ансамблем на основе ELO, Q-Matrix и результатов пробных срезов.
- **Граф зависимостей (DAG)**: Дерево тем с подсветкой критического пути («Ликвидация 2 пробелов в тригонометрии даст $+7$ баллов к прогнозу ЕНТ»).

---

## 3. Строгие TypeScript Интерфейсы и Типы

```typescript
/**
 * Zerde Student Passport System - Unified Type Definitions
 * Location: d:/future-minds-mvp/src/types/studentPassport.ts
 */

// ==========================================
// 1. БАЗОВЫЕ ТИПЫ И ЯЗЫКОВОЙ ПРОФИЛЬ
// ==========================================

export type LanguageCode = 'KZ' | 'RU' | 'EN';
export type SchoolType = 'NIS' | 'BIL' | 'GIMNAZIYA' | 'GENERAL_SECONDARY' | 'RSHOMBS';
export type ParentRelationship = 'father' | 'mother' | 'guardian';

export interface LanguageProfile {
  selectedLanguage: LanguageCode;
  nativeLanguage: LanguageCode;
  instructionLanguage: LanguageCode;
  bilingualMode: boolean;
  audioTtsVoice: 'kz_male_aga' | 'kz_female_dana' | 'ru_male_aga' | 'ru_female_dana' | 'en_male_aga';
  mathNotationStyle: 'KZ_GOST' | 'INTERNATIONAL';
}

// ==========================================
// 2. ИДЕНТИФИКАЦИЯ И АКАДЕМИЧЕСКАЯ ПРИВЯЗКА
// ==========================================

export interface SchoolInfo {
  id: string;
  name: string;
  code: string;
  region: string;
  type: SchoolType;
}

export interface TeacherContact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  telegram?: string;
  subjectSpecialization?: string;
}

export interface ParentContact {
  id: string;
  relationship: ParentRelationship;
  fullName: string;
  phone: string;
  email?: string;
  telegramChatId?: string;
  preferredContactMethod: 'phone' | 'telegram' | 'whatsapp' | 'sms';
  notifyOnRisk: boolean;
}

export interface AcademicIdentity {
  uuid: string;              // UUIDv4
  studentId: string;         // 'ST_KZ_09_042'
  userId: string;            // Auth foreign key
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  avatarUrl: string;
  gradeLevel: 7 | 8 | 9 | 10 | 11;
  gradeClass: string;        // '9 «А»'
  school: SchoolInfo;
  curator: TeacherContact;
  primaryTeachers: TeacherContact[];
  parentContacts: ParentContact[];
  academicYear: string;      // '2025-2026'
  currentQuarter: 1 | 2 | 3 | 4;
  isVacation: boolean;
  createdAt: string;         // ISO 8601
  updatedAt: string;
}

// ==========================================
// 3. РЕЙТИНГОВАЯ СИСТЕМА ELO И РАНГИ
// ==========================================

export type EloRankTier = 'OSKIN' | 'TUGYR' | 'KYRAN' | 'SAMGHAU';

export interface EloRankConfig {
  tier: EloRankTier;
  labelKz: 'ӨСКІН' | 'ТҰҒЫР' | 'ҚЫРАН' | 'САМҒАУ';
  labelRu: 'ӨСКІН' | 'ТҰҒЫР' | 'ҚЫРАН' | 'САМҒАУ';
  labelEn: 'OSKIN' | 'TUGYR' | 'KYRAN' | 'SAMGHAU';
  symbol: string;            // '🌱' | '🌿' | '🦅' | '⭐'
  minElo: number;
  maxElo: number;
}

export type EloDeltaReason = 
  | 'EUREKA_MOMENT'        // +15
  | 'SHORT_EXPLANATION'    // +7
  | 'DIRECT_ANSWER'        // +3
  | 'THOUGHT_FORK_LEARN'   // 0
  | 'JAILBREAK_PENALTY'    // -20
  | 'DAILY_DRILL_BONUS'    // +5
  | 'EXAM_SIMULATION';     // Variable

export interface EloHistoryEntry {
  id: string;
  timestamp: string;
  subjectId: string;
  courseId?: string;
  previousElo: number;
  delta: number;
  newElo: number;
  reason: EloDeltaReason;
  actionDescription: string;
  contextQuestionId?: string;
  contextSessionId?: string;
}

export interface SubjectEloRating {
  subjectId: string;
  subjectTitle: string;
  icon: string;
  currentElo: number;
  rank: EloRankConfig;
  predictedScore: string;    // '38/40 ⭐'
  historyCount: number;
  lastUpdated: string;
}

export interface EloProfile {
  overallElo: number;
  currentRank: EloRankConfig;
  quarterCoefficient: number;
  subjectRatings: Record<string, SubjectEloRating>;
  recentHistory: EloHistoryEntry[];
}

// ==========================================
// 4. КОГНИТИВНЫЙ ПРОФИЛЬ И Q-MATRIX (CDM)
// ==========================================

export type CompetencyMasteryStatus = 'MASTERED' | 'DEVELOPING' | 'DEFICIENT';

export type ErrorMisconceptionType = 
  | 'COMPUTATIONAL'      // Арифметикалық қате / Вычислительная
  | 'CONCEPTUAL'         // Концептуалдық түсінбеушілік / Концептуальная
  | 'CARELESSNESS'       // Зейінсіздік, ОДЗ ұмыту / Невнимательность
  | 'FORMULA_IGNORANCE'; // Формуланы білмеу / Незнание формулы

export interface MicroCompetency {
  skillCode: string;         // 'ALG_09_INEQ_INTERVAL'
  domain: string;            // 'Алгебра'
  subdomain: string;         // 'Теңсіздіктер'
  titleKz: string;
  titleRu: string;
  titleEn: string;
  masteryProbability: number;// [0.00 .. 1.00] (DINA posterior)
  status: CompetencyMasteryStatus;
  testedCount: number;
  successCount: number;
  lastTestedAt: string;
}

export interface MisconceptionStats {
  type: ErrorMisconceptionType;
  label: string;
  count: number;
  percentage: number;
  remediationAdvice: string;
}

export interface CognitiveProfile {
  overallMasteryRate: number; // % освоенных навыков
  totalSkillsCount: number;
  masteredCount: number;
  developingCount: number;
  deficientCount: number;
  qMatrixCompetencies: MicroCompetency[];
  errorClassification: MisconceptionStats[];
  radarAttributes: {
    attribute: string;
    score: number; // 0..100
  }[];
}

// ==========================================
// 5. ЖИЗНЕННЫЙ ЦИКЛ КУРСОВ И ТЕМ
// ==========================================

export type CourseEnrollmentStatus = 'pending_approval' | 'enrolled' | 'completed' | 'expelled';

export interface EnrolledCourse {
  courseId: string;
  title: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  enrollmentStatus: CourseEnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  currentScorePercent: number;
  courseElo: number;
}

export type TwoFactorTopicStatus = 'queued' | 'in_progress' | 'pending_teacher' | 'mastered';

export interface QuarterTopicItem {
  id: string;
  topicNumber: string;       // '#01'
  title: string;
  subjectId: string;
  status: TwoFactorTopicStatus;
  statusLabel: string;
  subText: string;
  isTodayFocus: boolean;
  aiVerifiedCount: number;   // e.g. 3 successful problems
  teacherApprovedAt?: string;
  teacherApproverId?: string;
}

// ==========================================
// 6. ТРЕКИНГ АКТИВНОСТИ И УЧЕБНЫХ ПРИВЫЧЕК
// ==========================================

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapRecord {
  date: string;              // 'YYYY-MM-DD'
  level: HeatmapLevel;
  tasksCompleted: number;
  minutesSpent: number;
  eurekaCount: number;
}

export interface ActivityTrackingProfile {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  streakFreezeAvailable: number;
  heatmapHistory: HeatmapRecord[];
  averageSolveTimeSeconds: number;
  eurekaConversionRate: number; // e.g. 78.4%
  firstAttemptAccuracy: number; // e.g. 82.0%
  totalSessionsCount: number;
  totalTimeSpentMinutes: number;
}

// ==========================================
// 7. ИНТЕРВАЛЬНОЕ ПОВТОРЕНИЕ ПАМЯТИ (SM-2)
// ==========================================

export interface SpacedRepetitionCard {
  cardId: string;
  studentId: string;
  topicId: string;
  subjectId: string;
  frontPrompt: string;       // Markdown + LaTeX + ZVDSL+
  backSolution: string;
  easinessFactor: number;    // EF >= 1.3, default 2.5
  repetitionNumber: number;  // n
  intervalDays: number;      // I
  dueDate: string;           // 'YYYY-MM-DD'
  lastReviewedAt?: string;
  lastQualityRating?: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface SpacedRepetitionOverview {
  available: boolean;
  cardsDueTodayCount: number;
  cardsDueThisWeekCount: number;
  timeEstimateFormatted: string; // '1 мин'
  title: string;
  description: string;
  retentionRatePercent: number;
  activeCards: SpacedRepetitionCard[];
}

// ==========================================
// 8. ПЕРСОНАЛЬНЫЙ ROADMAP И ЦЕЛЕВОЙ ЭКЗАМЕН
// ==========================================

export type TargetExamType = 'UNT' | 'SOR_SOCH' | 'OLYMPIAD' | 'NIS_ENTRANCE';

export interface MilestoneTopicNode {
  nodeId: string;
  title: string;
  subjectId: string;
  estimatedHours: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  scoreImpact: number;       // '+3.5 балла к ЕНТ'
  prerequisiteNodeIds: string[];
}

export interface PersonalRoadmap {
  targetExam: TargetExamType;
  examTitle: string;         // 'ҰБТ 2026 / ЕНТ 2026'
  deadlineDate: string;      // '2026-06-15'
  daysRemaining: number;
  targetScore: number;       // 135 (из 140)
  currentPredictedScore: number; // 118
  scoreProgressHistory: {
    date: string;
    predictedScore: number;
  }[];
  criticalPathNodes: MilestoneTopicNode[];
  topRecommendations: string[];
}

// ==========================================
// 🌟 ЕДИНЫЙ ПАСПОРТ УЧЕНИКА (ROOT CONTRACT)
// ==========================================

export interface StudentPassport {
  identity: AcademicIdentity;
  language: LanguageProfile;
  elo: EloProfile;
  cognitive: CognitiveProfile;
  courses: EnrolledCourse[];
  quarterTopics: QuarterTopicItem[];
  activity: ActivityTrackingProfile;
  spacedRepetition: SpacedRepetitionOverview;
  roadmap: PersonalRoadmap;
}
```

---

## 4. Реляционная схема базы данных SQLite (DDL)

Ниже представлена чистая, нормализованная схема базы данных SQLite с внешними ключами, индексами, каскадными ограничениями и триггерами.

```sql
-- ============================================================================
-- ZERDE STUDENT PASSPORT SYSTEM - SQLITE 3 PRODUCTION DDL SCHEMA
-- File: d:/future-minds-mvp/server/src/db/schema_passport.sql
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Справочник школ и учебных заведений
CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL,
    school_type TEXT CHECK(school_type IN ('NIS', 'BIL', 'GIMNAZIYA', 'GENERAL_SECONDARY', 'RSHOMBS')) NOT NULL DEFAULT 'NIS',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Пользователи и роли платформы
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('student', 'teacher', 'curator', 'parent', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Профиль Ученика (Основная сущность Паспорта)
CREATE TABLE IF NOT EXISTS student_profiles (
    id TEXT PRIMARY KEY,                       -- 'ST_KZ_09_042'
    user_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    avatar_url TEXT DEFAULT '/avatars/default.png',
    grade_level INTEGER CHECK(grade_level BETWEEN 7 AND 11) NOT NULL,
    grade_class TEXT NOT NULL,                 -- '9 «А»'
    school_id TEXT NOT NULL,
    curator_user_id TEXT,
    
    -- Языковой профиль
    selected_language TEXT CHECK(selected_language IN ('KZ', 'RU', 'EN')) NOT NULL DEFAULT 'KZ',
    native_language TEXT CHECK(native_language IN ('KZ', 'RU', 'EN')) NOT NULL DEFAULT 'KZ',
    instruction_language TEXT CHECK(instruction_language IN ('KZ', 'RU', 'EN')) NOT NULL DEFAULT 'KZ',
    bilingual_mode BOOLEAN NOT NULL DEFAULT 1,
    audio_tts_voice TEXT NOT NULL DEFAULT 'kz_male_aga',
    math_notation_style TEXT NOT NULL DEFAULT 'KZ_GOST',
    
    -- Академический календарь
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    current_quarter INTEGER CHECK(current_quarter BETWEEN 1 AND 4) NOT NULL DEFAULT 1,
    is_vacation BOOLEAN NOT NULL DEFAULT 0,
    
    -- Рейтинг ELO
    overall_elo INTEGER NOT NULL DEFAULT 1000,
    elo_rank_tier TEXT CHECK(elo_rank_tier IN ('OSKIN', 'TUGYR', 'KYRAN', 'SAMGHAU')) NOT NULL DEFAULT 'OSKIN',
    quarter_coefficient REAL NOT NULL DEFAULT 1.0,
    
    -- Активность
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    streak_freeze_available INTEGER NOT NULL DEFAULT 2,
    avg_solve_time_seconds REAL NOT NULL DEFAULT 0.0,
    eureka_conversion_rate REAL NOT NULL DEFAULT 0.0,
    first_attempt_accuracy REAL NOT NULL DEFAULT 0.0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    FOREIGN KEY (curator_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_student_school_grade ON student_profiles(school_id, grade_level, grade_class);
CREATE INDEX IF NOT EXISTS idx_student_elo ON student_profiles(overall_elo DESC);

-- 4. Контакты родителей (Законных представителей)
CREATE TABLE IF NOT EXISTS student_parent_contacts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    relationship TEXT CHECK(relationship IN ('father', 'mother', 'guardian')) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    telegram_chat_id TEXT,
    preferred_contact_method TEXT CHECK(preferred_contact_method IN ('phone', 'telegram', 'whatsapp', 'sms')) NOT NULL DEFAULT 'telegram',
    notify_on_risk BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parent_student ON student_parent_contacts(student_id);

-- 5. Предметы и Рейтинги ELO по предметам
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,                       -- 'algebra', 'physics', 'kazakh_lang'
    title_kz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📐',
    base_color TEXT NOT NULL DEFAULT '#0969da'
);

CREATE TABLE IF NOT EXISTS student_subject_elo (
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_elo INTEGER NOT NULL DEFAULT 1000,
    elo_rank_tier TEXT CHECK(elo_rank_tier IN ('OSKIN', 'TUGYR', 'KYRAN', 'SAMGHAU')) NOT NULL DEFAULT 'OSKIN',
    predicted_score_text TEXT NOT NULL DEFAULT '30/40',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 6. Аудируемый Ledger истории изменений ELO
CREATE TABLE IF NOT EXISTS elo_history_ledger (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    previous_elo INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    new_elo INTEGER NOT NULL,
    reason TEXT CHECK(reason IN ('EUREKA_MOMENT', 'SHORT_EXPLANATION', 'DIRECT_ANSWER', 'THOUGHT_FORK_LEARN', 'JAILBREAK_PENALTY', 'DAILY_DRILL_BONUS', 'EXAM_SIMULATION')) NOT NULL,
    action_description TEXT NOT NULL,
    context_question_id TEXT,
    context_session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_elo_history_student ON elo_history_ledger(student_id, created_at DESC);

-- 7. Когнитивные микронавыки (Q-Matrix / CDM DINA)
CREATE TABLE IF NOT EXISTS micro_competencies (
    skill_code TEXT PRIMARY KEY,               -- 'ALG_09_INEQ_INTERVAL'
    subject_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    subdomain TEXT NOT NULL,
    title_kz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_competency_mastery (
    student_id TEXT NOT NULL,
    skill_code TEXT NOT NULL,
    mastery_probability REAL NOT NULL DEFAULT 0.0, -- [0.0 .. 1.0]
    status TEXT CHECK(status IN ('MASTERED', 'DEVELOPING', 'DEFICIENT')) NOT NULL DEFAULT 'DEFICIENT',
    tested_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    last_tested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, skill_code),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_code) REFERENCES micro_competencies(skill_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mastery_student_status ON student_competency_mastery(student_id, status);

-- 8. Журнал когнитивных ошибок (Misconception Diagnostics)
CREATE TABLE IF NOT EXISTS student_misconception_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    skill_code TEXT NOT NULL,
    error_type TEXT CHECK(error_type IN ('COMPUTATIONAL', 'CONCEPTUAL', 'CARELESSNESS', 'FORMULA_IGNORANCE')) NOT NULL,
    context_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_code) REFERENCES micro_competencies(skill_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_misconceptions_student ON student_misconception_logs(student_id, error_type);

-- 9. Жизненный цикл курсов (Enrollment Lifecycle)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_enrollments (
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending_approval', 'enrolled', 'completed', 'expelled')) NOT NULL DEFAULT 'pending_approval',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    current_score_percent REAL DEFAULT 0.0,
    course_elo INTEGER DEFAULT 1000,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 10. Темы четверти и Двухфакторная верификация
CREATE TABLE IF NOT EXISTS quarter_topics (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    topic_number TEXT NOT NULL,                -- '#01'
    title_kz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    quarter INTEGER CHECK(quarter BETWEEN 1 AND 4) NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_topic_progress (
    student_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('queued', 'in_progress', 'pending_teacher', 'mastered')) NOT NULL DEFAULT 'queued',
    ai_verified_count INTEGER NOT NULL DEFAULT 0,
    is_today_focus BOOLEAN NOT NULL DEFAULT 0,
    teacher_approved_at DATETIME,
    teacher_approver_id TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, topic_id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES quarter_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_approver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. Тепловая карта активности (Activity Heatmap)
CREATE TABLE IF NOT EXISTS student_activity_heatmap (
    student_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    level INTEGER CHECK(level BETWEEN 0 AND 4) NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    minutes_spent INTEGER NOT NULL DEFAULT 0,
    eureka_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (student_id, activity_date),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- 12. Интервальное повторение памяти (SM-2 Spaced Repetition)
CREATE TABLE IF NOT EXISTS spaced_repetition_cards (
    card_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    front_prompt TEXT NOT NULL,                -- LaTeX / ZVDSL+
    back_solution TEXT NOT NULL,
    easiness_factor REAL NOT NULL DEFAULT 2.50,
    repetition_number INTEGER NOT NULL DEFAULT 0,
    interval_days INTEGER NOT NULL DEFAULT 1,
    due_date DATE NOT NULL,
    last_reviewed_at DATETIME,
    last_quality_rating INTEGER CHECK(last_quality_rating BETWEEN 0 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES quarter_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sm2_due ON spaced_repetition_cards(student_id, due_date);

-- 13. Персональный Roadmap и Целевой Экзамен
CREATE TABLE IF NOT EXISTS student_roadmaps (
    student_id TEXT PRIMARY KEY,
    target_exam TEXT CHECK(target_exam IN ('UNT', 'SOR_SOCH', 'OLYMPIAD', 'NIS_ENTRANCE')) NOT NULL DEFAULT 'UNT',
    exam_title TEXT NOT NULL DEFAULT 'ҰБТ / ЕНТ 2026',
    deadline_date DATE NOT NULL,
    target_score INTEGER NOT NULL,
    current_predicted_score INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- 14. Триггер автоматического обновления общего ELO и ранга при изменении предметного ELO
CREATE TRIGGER IF NOT EXISTS trg_update_student_overall_elo
AFTER UPDATE OF subject_elo ON student_subject_elo
BEGIN
    UPDATE student_profiles
    SET overall_elo = (
        SELECT CAST(AVG(subject_elo) * quarter_coefficient AS INTEGER)
        FROM student_subject_elo
        WHERE student_id = NEW.student_id
    ),
    elo_rank_tier = CASE
        WHEN (SELECT CAST(AVG(subject_elo) * quarter_coefficient AS INTEGER) FROM student_subject_elo WHERE student_id = NEW.student_id) >= 1600 THEN 'SAMGHAU'
        WHEN (SELECT CAST(AVG(subject_elo) * quarter_coefficient AS INTEGER) FROM student_subject_elo WHERE student_id = NEW.student_id) >= 1400 THEN 'KYRAN'
        WHEN (SELECT CAST(AVG(subject_elo) * quarter_coefficient AS INTEGER) FROM student_subject_elo WHERE student_id = NEW.student_id) >= 1200 THEN 'TUGYR'
        ELSE 'OSKIN'
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.student_id;
END;
```

---

## 5. JSON Payload & API Контракты

### 5.1. GET `/api/v1/student/passport` (Полный снапшот профиля)

```json
{
  "status": "success",
  "data": {
    "identity": {
      "uuid": "a7b3c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "studentId": "ST_KZ_09_042",
      "userId": "usr_student_042",
      "firstName": "Азамат",
      "lastName": "Қалиев",
      "middleName": "Ерланұлы",
      "fullName": "Азамат Қалиев",
      "avatarUrl": "/avatars/azamat.png",
      "gradeLevel": 9,
      "gradeClass": "9 «А»",
      "school": {
        "id": "sch_nis_ib_astana",
        "name": "NIS IB Astana",
        "code": "NIS-AST-01",
        "region": "г. Астана",
        "type": "NIS"
      },
      "curator": {
        "id": "usr_teacher_batyr",
        "fullName": "Батыр Серікұлы",
        "email": "batyr.s@nis.edu.kz",
        "phone": "+7 701 555 12 34",
        "telegram": "@batyr_teacher",
        "subjectSpecialization": "Математика"
      },
      "parentContacts": [
        {
          "id": "par_01",
          "relationship": "father",
          "fullName": "Ерлан Қалиев",
          "phone": "+7 777 123 45 67",
          "email": "erlan.k@gmail.com",
          "telegramChatId": "tg_78912345",
          "preferredContactMethod": "telegram",
          "notifyOnRisk": true
        }
      ],
      "academicYear": "2025-2026",
      "currentQuarter": 1,
      "isVacation": false,
      "createdAt": "2025-09-01T08:00:00.000Z",
      "updatedAt": "2026-08-20T03:00:00.000Z"
    },
    "language": {
      "selectedLanguage": "KZ",
      "nativeLanguage": "KZ",
      "instructionLanguage": "KZ",
      "bilingualMode": true,
      "audioTtsVoice": "kz_male_aga",
      "mathNotationStyle": "KZ_GOST"
    },
    "elo": {
      "overallElo": 1420,
      "currentRank": {
        "tier": "KYRAN",
        "labelKz": "ҚЫРАН",
        "labelRu": "ҚЫРАН",
        "labelEn": "KYRAN",
        "symbol": "🦅",
        "minElo": 1400,
        "maxElo": 1599
      },
      "quarterCoefficient": 1.0,
      "subjectRatings": {
        "algebra_9": {
          "subjectId": "algebra_9",
          "subjectTitle": "Алгебра 9 сынып",
          "icon": "📐",
          "currentElo": 1435,
          "rank": {
            "tier": "KYRAN",
            "labelKz": "ҚЫРАН",
            "labelRu": "ҚЫРАН",
            "labelEn": "KYRAN",
            "symbol": "🦅",
            "minElo": 1400,
            "maxElo": 1599
          },
          "predictedScore": "38/40 ⭐",
          "historyCount": 48,
          "lastUpdated": "2026-08-20T02:45:00.000Z"
        },
        "physics_9": {
          "subjectId": "physics_9",
          "subjectTitle": "Физика 9 сынып",
          "icon": "⚡",
          "currentElo": 1380,
          "rank": {
            "tier": "TUGYR",
            "labelKz": "ТҰҒЫР",
            "labelRu": "ТҰҒЫР",
            "labelEn": "TUGYR",
            "symbol": "🌿",
            "minElo": 1200,
            "maxElo": 1399
          },
          "predictedScore": "34/40 ⭐",
          "historyCount": 32,
          "lastUpdated": "2026-08-19T18:20:00.000Z"
        }
      },
      "recentHistory": [
        {
          "id": "elo_tx_9981",
          "timestamp": "2026-08-20T02:45:00.000Z",
          "subjectId": "algebra_9",
          "previousElo": 1420,
          "delta": 15,
          "newElo": 1435,
          "reason": "EUREKA_MOMENT",
          "actionDescription": "Өз бетімен интервалдар әдісіндегі таңбаларды анықтады 🎉",
          "contextQuestionId": "q_alg_ineq_032"
        }
      ]
    },
    "cognitive": {
      "overallMasteryRate": 85.7,
      "totalSkillsCount": 21,
      "masteredCount": 18,
      "developingCount": 2,
      "deficientCount": 1,
      "qMatrixCompetencies": [
        {
          "skillCode": "ALG_09_INEQ_INTERVAL",
          "domain": "Алгебра",
          "subdomain": "Квадраттық теңсіздіктер",
          "titleKz": "Интервалдар әдісімен таңбаларды табу",
          "titleRu": "Определение знаков методом интервалов",
          "titleEn": "Interval Sign Determination",
          "masteryProbability": 0.92,
          "status": "MASTERED",
          "testedCount": 14,
          "successCount": 13,
          "lastTestedAt": "2026-08-20T02:45:00.000Z"
        },
        {
          "skillCode": "PHYS_09_ENERGY_CONS",
          "domain": "Физика",
          "subdomain": "Механика",
          "titleKz": "Толық механикалық энергияның сақталу заңы",
          "titleRu": "Закон сохранения полной механической энергии",
          "titleEn": "Law of Conservation of Mechanical Energy",
          "masteryProbability": 0.68,
          "status": "DEVELOPING",
          "testedCount": 8,
          "successCount": 5,
          "lastTestedAt": "2026-08-19T18:20:00.000Z"
        }
      ],
      "errorClassification": [
        {
          "type": "COMPUTATIONAL",
          "label": "Вычислительные ошибки (знаки/арифметика)",
          "count": 12,
          "percentage": 57.1,
          "remediationAdvice": "Қосу/азайту таңбаларын бақылау үшін 3-минуттық экспресс-жаттығу"
        },
        {
          "type": "CARELESSNESS",
          "label": "Невнимательность (ОДЗ / интервалы)",
          "count": 5,
          "percentage": 23.8,
          "remediationAdvice": "Боялған және выколотая нүктелерді қайталау"
        },
        {
          "type": "CONCEPTUAL",
          "label": "Концептуальные неточности",
          "count": 3,
          "percentage": 14.3,
          "remediationAdvice": "Энергия сақталу заңының графиктік моделін көру"
        },
        {
          "type": "FORMULA_IGNORANCE",
          "label": "Незнание формулы",
          "count": 1,
          "percentage": 4.8,
          "remediationAdvice": "SM-2 карточкасын қайталау"
        }
      ],
      "radarAttributes": [
        { "attribute": "Логика", "score": 92 },
        { "attribute": "Алгебра", "score": 88 },
        { "attribute": "Геометрия", "score": 82 },
        { "attribute": "Физика", "score": 76 },
        { "attribute": "Химия", "score": 84 },
        { "attribute": "Тілдік талдау", "score": 95 }
      ]
    },
    "courses": [
      {
        "courseId": "crs_alg_9_nis",
        "title": "Алгебра 9 сынып (Тереңдетілген)",
        "subjectCode": "algebra",
        "teacherId": "usr_teacher_batyr",
        "teacherName": "Батыр Серікұлы",
        "enrollmentStatus": "enrolled",
        "enrolledAt": "2025-09-01T08:00:00.000Z",
        "currentScorePercent": 95.0,
        "courseElo": 1435
      }
    ],
    "quarterTopics": [
      {
        "id": "topic_01",
        "topicNumber": "#01",
        "title": "Сызықтық теңдеулер мен теңсіздіктер жүйесі",
        "subjectId": "algebra_9",
        "status": "mastered",
        "statusLabel": "Усвоено",
        "subText": "Мұғалім бекітті • СОР-ға дайын",
        "isTodayFocus": false,
        "aiVerifiedCount": 5,
        "teacherApprovedAt": "2025-09-15T10:30:00.000Z"
      },
      {
        "id": "topic_02",
        "topicNumber": "#02",
        "title": "Виет теоремасы және квадрат үшмүше",
        "subjectId": "algebra_9",
        "status": "pending_teacher",
        "statusLabel": "Ожидает",
        "subText": "ИИ қабылдады • Мұғалім растауын күтуде",
        "isTodayFocus": false,
        "aiVerifiedCount": 4
      },
      {
        "id": "topic_03",
        "topicNumber": "#03",
        "title": "Квадраттық теңсіздіктер (Интервалдар әдісі)",
        "subjectId": "algebra_9",
        "status": "in_progress",
        "statusLabel": "В работе",
        "subText": "● Бүгінгі сабақ • 3 мин жаттығу",
        "isTodayFocus": true,
        "aiVerifiedCount": 2
      },
      {
        "id": "topic_04",
        "topicNumber": "#04",
        "title": "Бөлшек-рационал теңсіздіктерді шешу",
        "subjectId": "algebra_9",
        "status": "queued",
        "statusLabel": "Кезекте",
        "subText": "1-тоқсан жоспарында",
        "isTodayFocus": false,
        "aiVerifiedCount": 0
      }
    ],
    "activity": {
      "currentStreakDays": 12,
      "longestStreakDays": 24,
      "lastActiveDate": "2026-08-20",
      "streakFreezeAvailable": 2,
      "heatmapHistory": [
        { "date": "2026-08-09", "level": 3, "tasksCompleted": 5, "minutesSpent": 15, "eurekaCount": 2 },
        { "date": "2026-08-10", "level": 4, "tasksCompleted": 8, "minutesSpent": 22, "eurekaCount": 4 },
        { "date": "2026-08-11", "level": 2, "tasksCompleted": 3, "minutesSpent": 9,  "eurekaCount": 1 },
        { "date": "2026-08-12", "level": 4, "tasksCompleted": 7, "minutesSpent": 18, "eurekaCount": 3 },
        { "date": "2026-08-13", "level": 3, "tasksCompleted": 4, "minutesSpent": 12, "eurekaCount": 2 },
        { "date": "2026-08-14", "level": 4, "tasksCompleted": 9, "minutesSpent": 25, "eurekaCount": 5 },
        { "date": "2026-08-15", "level": 4, "tasksCompleted": 8, "minutesSpent": 20, "eurekaCount": 4 },
        { "date": "2026-08-16", "level": 2, "tasksCompleted": 3, "minutesSpent": 8,  "eurekaCount": 1 },
        { "date": "2026-08-17", "level": 3, "tasksCompleted": 5, "minutesSpent": 14, "eurekaCount": 2 },
        { "date": "2026-08-18", "level": 4, "tasksCompleted": 8, "minutesSpent": 21, "eurekaCount": 4 },
        { "date": "2026-08-19", "level": 4, "tasksCompleted": 7, "minutesSpent": 19, "eurekaCount": 3 },
        { "date": "2026-08-20", "level": 4, "tasksCompleted": 6, "minutesSpent": 16, "eurekaCount": 3 }
      ],
      "averageSolveTimeSeconds": 94.2,
      "eurekaConversionRate": 78.4,
      "firstAttemptAccuracy": 82.0,
      "totalSessionsCount": 142,
      "totalTimeSpentMinutes": 620
    },
    "spacedRepetition": {
      "available": true,
      "cardsDueTodayCount": 3,
      "cardsDueThisWeekCount": 7,
      "timeEstimateFormatted": "1 мин",
      "title": "Жадты бекіту (Spaced Repetition)",
      "description": "1-тоқсанның 3 формуласы қайталауды күтуде (Дискриминант, Виет, Интервалдар)",
      "retentionRatePercent": 91.2,
      "activeCards": [
        {
          "cardId": "card_sm2_01",
          "studentId": "ST_KZ_09_042",
          "topicId": "topic_01",
          "subjectId": "algebra_9",
          "frontPrompt": "Квадрат теңдеудің дискриминанты мен түбірлер формуласы: $ax^2 + bx + c = 0$",
          "backSolution": "$D = b^2 - 4ac$, $x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}$",
          "easinessFactor": 2.6,
          "repetitionNumber": 3,
          "intervalDays": 6,
          "dueDate": "2026-08-20"
        }
      ]
    },
    "roadmap": {
      "targetExam": "UNT",
      "examTitle": "ҰБТ 2026 (Математика + Физика)",
      "deadlineDate": "2026-06-15",
      "daysRemaining": 298,
      "targetScore": 135,
      "currentPredictedScore": 118,
      "scoreProgressHistory": [
        { "date": "2026-06-01", "predictedScore": 94 },
        { "date": "2026-07-01", "predictedScore": 106 },
        { "date": "2026-08-01", "predictedScore": 114 },
        { "date": "2026-08-20", "predictedScore": 118 }
      ],
      "criticalPathNodes": [
        {
          "nodeId": "node_trig_01",
          "title": "Тригонометриялық теңдеулер мен түрлендірулер",
          "subjectId": "algebra_9",
          "estimatedHours": 3.5,
          "isUnlocked": true,
          "isCompleted": false,
          "scoreImpact": 4.5,
          "prerequisiteNodeIds": ["node_ineq_01"]
        }
      ],
      "topRecommendations": [
        "Тригонометриядағы 2 негізгі формуланы жабу ЕНТ болжамын 118-ден 122-ге көтереді.",
        "Физикадағы механикалық жұмыс пен қуат тақырыбы бойынша 3-минуттық экспресс-тренинг өтіңіз."
      ]
    }
  }
}
```

---

## 6. Математические модели и формулы

### 6.1. Алгоритм ELO и Ledger Дельт

Рейтинг ученика обновляется дискретными начислениями в зависимости от когнитивной траектории решения:

$$\text{ELO}_{\text{new}} = \max\left(0, \text{ELO}_{\text{prev}} + \Delta_{\text{action}}\right)$$

Где $\Delta_{\text{action}}$ определяется по строгому регламенту платформы Zerde:

| Событие / Действие | $\Delta_{\text{action}}$ | Описание и педагогическое обоснование |
| :--- | :---: | :--- |
| **Eureka Moment 🎉** | `+15` | Ученик преодолел затруднение, прошел развилки мысли «Аға» и самостоятельно открыл решение. |
| **Краткое решение** | `+7` | Выбран верный ответ с корректным выбором аргументации/шага. |
| **Прямой ответ** | `+3` | Выбран верный ответ без развернутого объяснения. |
| **Обучающая развилка (Thought-Fork)** | `0` | Ошибка на пути к пониманию. Штраф отсутствует во избежание боязни ошибок (No-Stress). |
| **Anti-Jailbreak Penalty ⚠️** | `-20` | Зафиксирована попытка взлома промпта или требование готового ответа. |

**Общий ELO за четверть**:
$$\text{Overall ELO} = \left( \frac{1}{M} \sum_{m=1}^M \text{Subject ELO}_m \right) \times K_Q$$

---

### 6.2. CDM (DINA) Обновление апостериорных вероятностей

В рамках **Детерминированной модели входных данных, шума и операции «И» (DINA Model)**:

1. **Идеальный отклик** $\eta_{ij}$ для ученика $i$ на задачу $j$:
   $$\eta_{ij} = \prod_{k=1}^K \alpha_{ik}^{q_{jk}}$$
   Ученик справляется с задачей, только если освоил **все** необходимые навыки, для которых $q_{jk} = 1$.

2. **Вероятность правильного ответа** с учетом промаха (slip $s_j$) и угадывания (guess $g_j$):
   $$P(Y_{ij} = 1 | \boldsymbol{\alpha}_i) = g_j^{1 - \eta_{ij}} (1 - s_j)^{\eta_{ij}}$$

3. **Байесовское обновление** апостериорной вероятности профиля навыков после ответа $Y_{ij}$:
   $$P(\boldsymbol{\alpha}_i | \mathbf{Y}_i) \propto P(\boldsymbol{\alpha}_i) \prod_{j=1}^J P(Y_{ij} | \boldsymbol{\alpha}_i)$$

4. **Маргинальная вероятность владения навыком $k$**:
   $$P(\alpha_{ik} = 1 | \mathbf{Y}_i) = \sum_{\boldsymbol{\alpha}: \alpha_k = 1} P(\boldsymbol{\alpha} | \mathbf{Y}_i)$$

---

### 6.3. Модель SM-2 Интервального повторения

Для долговременного удержания формул и определений используется модифицированный алгоритм **SuperMemo-2**:

1. **Фактор легкости (Easiness Factor)**:
   $$EF' = EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)$$
   $$EF = \max(1.3, EF')$$
   где $q \in \{0, 1, 2, 3, 4, 5\}$ — оценка качества вспоминания.

2. **Интервал следующего повторения $I(n)$ (в днях)**:
   $$I(n) = \begin{cases} 
   1, & n = 1 \\ 
   6, & n = 2 \\ 
   \mathrm{round}(I(n-1) \times EF), & n > 2 
   \end{cases}$$

3. **При ошибке ($q < 3$)**:
   $$n = 0, \quad I = 1 \quad (\text{карточка ставится на повторение сегодня})$$

---

### 6.4. Предиктор баллов ЕНТ / СОР / СОЧ

Прогноз итогового балла $\hat{S}_{\text{exam}}$ рассчитывается как линейно-байесовская комбинация:

$$\hat{S}_{\text{exam}} = S_{\max} \times \left( w_1 \cdot \frac{\text{Subject ELO} - 1000}{600} + w_2 \cdot \bar{P}_{\text{mastery}} + w_3 \cdot \text{Accuracy}_{\text{drill}} \right)$$

где:
- $w_1 = 0.50$ (Вес текущего ELO)
- $w_2 = 0.35$ (Вес когнитивного покрытия микронавыков Q-Matrix)
- $w_3 = 0.15$ (Вес темпа и точности первого ответа)
- $S_{\max}$ — максимальный балл (140 для ЕНТ, 40 для четвертного СОР/СОЧ).
