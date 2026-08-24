# 🌟 ZERDE 2.0: ГЕНЕРАЛЬНЫЙ МАСТЕР-ПЛАН МУЛЬТИАГЕНТНОЙ ЭКОСИСТЕМЫ (ULTRA_CREATION.MD)

> **Статус документа:** Source of Truth (Единый источник правды)  
> **Дата утверждения:** 24 августа 2026 г.  
> **Целевой стек:** Node.js, Express, TypeScript, Better-SQLite3, React 18, Vite 5, Tailwind CSS, KaTeX, Google Gemini 2.5 Flash, Zod.  
> **Архитектурный манифест:** Stateless Context-Injection, Classroom Sandbox, Zero-Fake, Zero-Crash.

---

## 1. 🏛️ АРХИТЕКТУРНЫЙ МАНИФЕСТ И ФУНДАМЕНТАЛЬНЫЕ ПРИНЦИПЫ

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      МУЛЬТИАГЕНТНАЯ ЗАМКНУТАЯ ЭКОСИСТЕМА (CLOSED-LOOP AGENTIC EDTECH)            │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  [ УЧИТЕЛЬ ]                                                          [ УЧЕНИК ]                 │
│      │                                                                    │                      │
│      ▼                                                                    ▼                      │
│  ┌─────────────────────────┐                                      ┌─────────────────────────┐    │
│  │ 5 Слотов Материалов     │                                      │ Master Passport         │    │
│  │ (ГОСО, Учебники 1-2)    │                                      │ (Общий ELO, Стрик, XP)  │    │
│  └───────────┬─────────────┘                                      └───────────┬─────────────┘    │
│              │                                                                │                  │
│              ▼                                                                ▼                  │
│  ┌─────────────────────────┐                                      ┌─────────────────────────┐    │
│  │ Teacher Co-Pilot        │                                      │ Ментор «Аға»            │    │
│  │ (Second Brain Agent)    │◄─────────── Срезы Дефицитов ────────►│ (Навигатор / Оценщик /  │    │
│  │ [Генерация Плана/Задач] │                                      │  Сократический диалог)  │    │
│  └───────────┬─────────────┘                                      └───────────┬─────────────┘    │
│              │                                                                │                  │
│              ▼                                                                ▼                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│  │                        ИЗОЛИРОВАННЫЙ CLASSROOM SANDBOX (SQLite)                        │     │
│  │  • Учебный План (.md)     • Банк Вопросов (A/B)     • Subpassports (Микронавыки, Логи) │     │
│  └────────────────────────────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Принцип Stateless Context-Injection (Отказ от Vector DB)
* **Проблема:** Векторные базы (Pinecone, Chroma), эмбеддинги и stateful-треды на сервере перегружают архитектуру, вызывают задержки и создают точки отказа.
* **Решение:** Использование окна контекста **Google Gemini 2.5 Flash (1 000 000 токенов)**. Сервер при каждом запросе собирает нативный контекст:
  1. Текстовое содержимое всех утвержденных 5 слотов курса/группы;
  2. Текущий Markdown-план четверти;
  3. Агрегированные сабпаспорта учеников (`skills_progress_json`) и сырые логи последних попыток.
* **Результат:** Модель моментально видит дельту расхождений, заземлена на учебники (Grounding) и не галлюцинирует.

### 1.2. Принцип Classroom Sandbox (Строгая изоляция учебных групп)
* Каждая учебная группа учителя (`9 «А»`, `10 «Б»`, `Олимпиадники`) представляет собой **полностью изолированную песочницу**:
  - Собственный независимый Markdown-план четверти;
  - Собственный банк тематических вопросов;
  - Изолированные предметные сабпаспорта учеников (`student_course_passports`).
* Учитель одной группы физически не может повлиять на прогресс или материалы параллельного класса.

### 1.3. Zero-Fake & Zero-Crash Policy
* **Zero-Fake:** 0 моковых массивов, 0 призрачных ботов. Любая цифра на дашборде (ELO, процент освоения, матрица успеваемости) вычисляется строго из записей SQLite (`classroom_students`, `student_attempts`, `student_course_passports`).
* **Zero-Crash:** Все вызовы AI защищены локальным модулем `FallbackEngine.ts` и строгой Zod-валидацией. При сбоях интернета, превышении квот (429) или невалидном ответе LLM система автоматически возвращает эталонный ответ. Сервер не падает никогда.

---

## 2. 🗄️ СХЕМА ДАННЫХ И DDL-ИЗМЕНЕНИЯ (SQLITE 3)

Для поддержки мультиагентной системы существующая база из 13 таблиц ядра расширяется до **14 таблиц** с добавлением критически важных полей.

```
server/src/db/
├── schema.sql           # Актуальная DDL-схема SQLite
├── database.ts         # Синглтон подключения better-sqlite3 (WAL mode)
└── seed.ts             # Чистый сид 2 школ и базового каталога
```

```sql
PRAGMA foreign_keys = ON;

-- ============================================================================
-- 1. СЛОТЫ УЧЕБНЫХ МАТЕРИАЛОВ (5 Фиксированных Слотов на Курс / Группу)
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_material_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    classroom_id INTEGER,                               -- NULL = общий для курса, либо для конкретной группы
    slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
    title TEXT NOT NULL,                                -- 'ГОСО Алгебра 9', 'Учебник Часть 1'
    file_type TEXT NOT NULL DEFAULT 'text',             -- 'text', 'pdf', 'docx'
    content_text TEXT NOT NULL,                         -- Извлеченный текстовый контент для Context-Injection
    file_size INTEGER DEFAULT 0,
    is_locked INTEGER NOT NULL DEFAULT 0,               -- 1 = заблокирован вне окна каникул/первых 2 дней
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    UNIQUE(course_id, classroom_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_mat_slots_course ON course_material_slots(course_id, classroom_id);

-- ============================================================================
-- 2. УЧЕБНЫЕ ПЛАНЫ ЧЕТВЕРТИ (Markdown Curriculum Plans)
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_curriculum_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK(quarter BETWEEN 1 AND 4) DEFAULT 1,
    markdown_plan TEXT NOT NULL,                        -- Полный Markdown-план с дескрипторами и неделями
    status TEXT NOT NULL CHECK(status IN ('DRAFT_QUESTIONNAIRE', 'APPROVED', 'ARCHIVED')) DEFAULT 'DRAFT_QUESTIONNAIRE',
    version INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    UNIQUE(course_id, classroom_id, quarter, version)
);

CREATE INDEX IF NOT EXISTS idx_curr_plans_cls ON course_curriculum_plans(classroom_id, quarter);

-- ============================================================================
-- 3. ВОРОНКА ЗАЯВОК И ЗАЧИСЛЕНИЕ (Admission Pipeline)
-- ============================================================================
-- Модификация существующей таблицы course_enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    assigned_classroom_id INTEGER,                      -- Назначенная учителем группа ('9 «А»', 'Олимпиадники')
    status TEXT NOT NULL CHECK(status IN ('pending_approval', 'enrolled', 'completed', 'expelled')) DEFAULT 'pending_approval',
    motivation_text TEXT NOT NULL DEFAULT '',           -- Мотивационное письмо ученика
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
    UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_cls ON course_enrollments(course_id, assigned_classroom_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);

-- ============================================================================
-- 4. РАСШИРЕНИЕ БАНКА ВОПРОСОВ (Question Bank with Solution Models)
-- ============================================================================
-- Добавление полей solution_model, topic_tag, target_tier, quarter_index
-- в таблицу question_bank
```

### 2.1. Формат Двухуровневого Паспорта Ученика

1. **Master Passport (Таблица `users`):**
   - Корневой глобальный профиль: `id`, `full_name`, `email`, `school`, `grade`, `streak_days`, `longest_streak`.
   - Глобальный расчет совокупного XP и списка активных курсов.

2. **Subpassport Группы (Таблица `student_course_passports`):**
   ```json
   {
     "subject_elo": 1025,
     "rank_tier": "OSKIN",
     "skills": {
       "ALG_09_INEQ": {
         "title": "Квадраттық теңсіздіктер",
         "total_attempts": 4,
         "correct_answers": 3,
         "mastery_percent": 75,
         "status": "DEVELOPING",
         "last_assessed_at": "2026-08-24T10:00:00.000Z"
       }
     },
     "teacher_daily_notes": [
       {
         "id": "note_1724493000",
         "date": "2026-08-24",
         "note": "Қанат бөлшек-рационал теңсіздікте бөлім нөлдерін ескеруде қателесті."
       }
     ],
     "raw_recent_attempts": [
       {
         "attempt_id": 104,
         "question_id": 12,
         "skill_code": "ALG_09_INEQ",
         "mode": "A",
         "is_correct": true,
         "timestamp": "2026-08-24T09:45:00.000Z"
       }
     ]
   }
   ```

### 2.2. Защита от Перезаписи Паспортов через Транзакции
Все модификации JSON-паспортов производятся строго внутри атомарного блока:
```typescript
const updatePassportTx = db.transaction((studentId: number, courseId: number, updateFn: (current: any) => any) => {
  const row = db.prepare('SELECT skills_progress_json, subject_elo FROM student_course_passports WHERE student_id = ? AND course_id = ?').get(studentId, courseId) as any;
  const current = row ? JSON.parse(row.skills_progress_json) : { skills: {}, raw_recent_attempts: [] };
  const updated = updateFn(current);
  db.prepare(`
    UPDATE student_course_passports
    SET skills_progress_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND course_id = ?
  `).run(JSON.stringify(updated), studentId, courseId);
});
```

---

## 3. 🤖 AI-ЭКОСИСТЕМА И ZOD-КОНТРАКТЫ

### 3.1. Учитель: Co-Pilot Group Agent (Second Brain)

```
server/src/ai/
├── schemas.ts                  # Строгие Zod-схемы входных/выходных контрактов
├── fallback-engine.ts          # Детерминированный Zero-Crash Fallback
├── copilot.service.ts          # Интеграция 5 слотов, плана четверти и генерации тестов
├── socratic.service.ts         # Наставник «Аға» (Сократический диалог)
├── silent-grader.service.ts    # Оценщик развернутых ответов Типа Б
└── prompts/
    ├── teacher_copilot.md      # Системная личность и Anti-Prompt Injection
    ├── socratic_aga.md         # Сократические правила и развилки мысли
    └── silent_grader.md        # Критерии оценивания Типа Б на английском
```

#### Zod-Схема Co-Pilot Ответа (`CoPilotAgentResponseSchema`):
```typescript
export const CoPilotAgentResponseSchema = z.object({
  chat_reply: z.string().min(5),
  suggested_plan_markdown: z.string().optional(),
  generated_quiz: z.object({
    topic_title: z.string(),
    target_student_ids: z.array(z.number()).optional(),
    questions: z.array(z.object({
      question_kz: z.string(),
      question_ru: z.string().optional(),
      katex_snippet: z.string().optional().default(''),
      options: z.array(z.object({ id: z.string(), text: z.string(), isCorrect: boolean, latex: z.string().optional() })),
      correct_answer: z.string(),
      explanation_kz: z.string(),
      difficulty: z.number().int().min(1).max(5),
      skill_code: z.string()
    }))
  }).optional()
});
```

### 3.2. Ученик: Единый Ментор «Аға» (3 Режима)

#### Режим 1: Навигатор (Dashboard Mode)
* **Назначение:** Персональный компаньон на главном экране. Анализирует дефициты из всех сабпаспортов ученика и подсказывает 1 ключевой приоритет дня на языке интерфейса.
* **Zod-Схема:**
  ```typescript
  export const NavigatorAdviceSchema = z.object({
    greeting: z.string(),
    primary_focus_course_id: z.number(),
    recommended_topic_title: z.string(),
    rationale: z.string(),
    encouragement: z.string()
  });
  ```

#### Режим 2: Silent Grader Mode (Оценщик Задач Типа Б)
* **Назначение:** Фоновый оценщик развернутых решений ученика (текст до 4000 знаков и/или фото) против эталона `solution_model`.
* **Правило:** Вердикт и техническая причина формируются **строго на английском языке (`EN`)** для исключения галлюцинаций в JSON.
* **Начисление XP:**
  - `FULL_CREDIT` (+15 XP): Полное пошаговое математическое доказательство с исключением нулей знаменателя.
  - `PARTIAL_CREDIT` (+7 XP): Правильный ход решения, но есть вычислительная погрешность в конце.
  - `MINIMAL_CREDIT` (+3 XP): Записан только голый ответ без промежуточных шагов.
  - `CHEAT_PENALTY` (-20 XP): Попытка джейлбрейка, списанный бессмысленный текст или спам.
* **Zod-Схема:**
  ```typescript
  export const SilentGraderResponseSchema = z.object({
    score_xp: z.number().int(),
    verdict: z.enum(['FULL_CREDIT', 'PARTIAL_CREDIT', 'MINIMAL_CREDIT', 'CHEAT_PENALTY']),
    technical_rationale: z.string().min(5),
    feedback_for_student: z.string().min(5),
    anti_cheat_flag: z.boolean().default(false)
  });
  ```

#### Режим 3: Socratic Mode (Сократический диалог)
* **Назначение:** Интерактивная верхняя шторка в тренажере. При ошибке выдает 1 строку наводящего вопроса и 3 развилки мысли (`true_step`, `cognitive_trap`, `basic_rule`).
* **Zod-Схема:** `SocraticResponseSchema` (полностью реализована и верифицирована).

---

## 4. 🚪 ВОРОНКА ЗАЯВОК И ЖИЗНЕННЫЙ ЦИКЛ ЧЕТВЕРТИ

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            ВОРОНКА ЗАЯВОК УЧЕНИКОВ (ADMISSION FLOW)                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. [Ученик]  Выбирает курс из каталога школы ➔ Нажимает [ Өтініш беру / Подать заявку ].   │
│ 2. [Ученик]  Заполняет мотивационное поле: «Неліктен бұл курсқа жазылғыңыз келеді?».        │
│ 3. [Система] Создает запись course_enrollments со статусом 'pending_approval'.             │
│ 4. [Учитель] Открывает вкладку «Өтініштер / Модерация заявок» в панели курса.              │
│ 5. [Учитель] Видит карточку соискателя: Master Passport (ФИО, школа, общий ELO, стрик)     │
│              + текст мотивации.                                                             │
│ 6. [Учитель] Нажимает [ Қабылдау / Принять ] и выбирает целевую группу: '9 «А»'             │
│              или 'Олимпиадники'.                                                            │
│ 7. [Система] Атомарно переводит статус в 'enrolled', добавляет в classroom_students         │
│              и инициализирует изолированный student_course_passports.                       │
│ 8. [Ученик]  В разделе «Менің курстарым» видит активный статус и кнопку [ Тренажер ].      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Окно Редактирования 5 Слотов и Архивация
* **Окно изменений:** Поле `is_locked` в `course_material_slots` активируется на сервере. Изменение и перезагрузка файлов разрешена **только во время официальных каникул и в первые 2 дня новой четверти**. В остальное время учебный план защищен от случайных сбоев.
* **Архивация вопросов:** В первый день следующей четверти активные вопросы переходят в статус архивных для сохранения исторической аналитики.

---

## 5. 📋 ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ ПО 6 ФАЗАМ

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          ГРАФИК ПОШАГОВОГО ВЫПОЛНЕНИЯ (6 ФАЗ)                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  ФАЗА 1: Схема БД, Миграции и Zod-контракты (DDL, course_material_slots, plans, admission)  │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 2: AI-сервисы, Системные MD-промпты и FallbackEngine (Grader, Navigator, 5 слотов)    │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 3: API Роуты и Контроллеры (Admission, Slots, Plans, Copilot Chat, Grader)           │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 4: Фронтенд Учителя (Студия 5 слотов, Чат Копилота, Модерация заявок)                │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 5: Фронтенд Ученика (Виджет Навигатора, Режим Типа Б с Silent Grader, Сократ)        │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 6: Сквозной E2E Тест (test_full_agentic_flow.ts) и Финальная Полировка               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 ФАЗА 1: Схема БД, Миграции и Zod-Контракты
* **Цель:** Подготовить базу данных и строгие типизированные структуры для поддержки 5 слотов, планов четверти и воронки заявок.
* **Файлы к изменению/созданию:**
  - `server/src/db/schema.sql` (добавление таблиц `course_material_slots`, `course_curriculum_plans`, обновление `course_enrollments` и `question_bank`).
  - `server/src/db/database.ts` (добавление транзакционного хелпера `updatePassportTransaction`).
  - `server/src/db/seed.ts` (сид слотов материалов и начальных заявок).
  - `server/src/ai/schemas.ts` (Zod-схемы для `CoPilotAgentResponse`, `SilentGraderResponse`, `NavigatorAdvice`).
  - `server/src/__tests__/phase1_agentic_verification.ts` (автотест целостности DDL и транзакций).
* **Definition of Done (DoD):**
  - Все 14 таблиц успешно создаются в SQLite с WAL-режимом.
  - Тестовый скрипт подтверждает атомарность транзакций паспорта и корректность Zod-схем.
* **Команда проверки:** `npx ts-node src/__tests__/phase1_agentic_verification.ts`

---

### 🔹 ФАЗА 2: AI-Сервисы, Системные MD-Промпты и FallbackEngine
* **Цель:** Реализовать бэкенд-движки для Копилота Учителя (5 слотов Context-Injection), Оценщика Типа Б (Silent Grader) и Навигатора Ученика.
* **Файлы к изменению/созданию:**
  - `server/src/ai/prompts/teacher_copilot.md` (системный промпт Копилота с anti-injection).
  - `server/src/ai/prompts/silent_grader.md` (системный промпт Grader на английском).
  - `server/src/ai/prompts/navigator.md` (системный промпт Навигатора).
  - `server/src/ai/copilot.service.ts` (генерация плана четверти и контекстный чат).
  - `server/src/ai/silent-grader.service.ts` (оценка Типа Б с расчетом XP).
  - `server/src/ai/fallback-engine.ts` (детерминированные фоллбеки для всех 3 новых AI-сервисов).
  - `server/src/__tests__/phase2_agentic_verification.ts` (тест вызовов Gemini 2.5 Flash и Zero-Crash Fallback).
* **Definition of Done (DoD):**
  - Сервисы корректно парсят и инжектят текст 5 слотов в промпт.
  - Silent Grader возвращает строгий валидный JSON на английском языке.
  - При отключении API-ключа срабатывает FallbackEngine без падений.
* **Команда проверки:** `npx ts-node src/__tests__/phase2_agentic_verification.ts`

---

### 🔹 ФАЗА 3: API Роуты и Контроллеры (Express)
* **Цель:** Связать клиентский слой с новыми сервисами через защищенные маршруты Express.
* **Файлы к изменению/созданию:**
  - `server/src/modules/teacher/teacher.routes.ts` & `teacher.controller.ts`:
    - `POST /api/teacher/courses/:id/slots/:slotNumber` (сохранение текста в слот).
    - `GET /api/teacher/courses/:id/slots` (получение слотов).
    - `POST /api/teacher/courses/:id/plan/generate` (генерация плана четверти).
    - `POST /api/teacher/courses/:id/plan/approve` (утверждение плана).
    - `GET /api/teacher/courses/:id/applications` (список заявок учеников).
    - `POST /api/teacher/courses/:id/applications/:appId/moderate` (принятие/отклонение заявки с назначением группы).
  - `server/src/modules/student/student.routes.ts` & `student.controller.ts`:
    - `POST /api/student/courses/:id/apply` (подача заявки с мотивационным письмом).
    - `GET /api/student/navigator-advice` (получение фокуса дня от «Аға»).
    - `POST /api/student/tasks/grade-type-b` (отправка Типа Б на проверку в Silent Grader).
  - `server/src/__tests__/phase3_agentic_verification.ts` (тестирование всех новых эндпоинтов через супертест).
* **Definition of Done (DoD):**
  - Полный цикл модерации заявок и управления 5 слотами доступен через REST API.
  - Авторизация строго проверяет токен учителя школы для закрытых эндпоинтов.
* **Команда проверки:** `npx ts-node src/__tests__/phase3_agentic_verification.ts`

---

### 🔹 ФАЗА 4: Фронтенд Учителя (Студия 5 Слотов, Чат Копилота, Модерация)
* **Цель:** Предоставить учителю эргономичный интерфейс управления курсом и группой.
* **Файлы к изменению/созданию:**
  - `client/src/screens/CourseBuilderScreen.tsx` (вкладка 5 слотов материалов, просмотр Markdown-плана с утверждением, чат со Вторым Мозгом).
  - `client/src/features/admission/ApplicationsModerationModal.tsx` (модальное окно модерации входящих заявок с просмотром Master Passport соискателя).
  - `client/src/screens/TeacherDashboard.tsx` (интеграция счетчика новых заявок и селектора изолированных групп).
* **Definition of Done (DoD):**
  - Учитель может вставить текст ГОСО/учебника в слот, сгенерировать план четверти и утвердить его.
  - Учитель видит заявки учеников и распределяет их по группам `9 «А»` / `Олимпиадники`.
* **Команда проверки:** `npm run build --prefix client`

---

### 🔹 ФАЗА 5: Фронтенд Ученика (Виджет Навигатора, Режим Типа Б, Сократ)
* **Цель:** Реализовать персональный опыт обучения для школьника.
* **Файлы к изменению/созданию:**
  - `client/src/screens/StudentHomeScreen.tsx` (интеграция виджета «Аға Навигатор» с персональным советом дня).
  - `client/src/screens/CourseCatalogScreen.tsx` (модалка подачи заявки с мотивационным текстом).
  - `client/src/screens/TaskTrainerScreen.tsx` (интеграция мгновенной проверки Типа Б через Silent Grader с отображением начисленного XP и критериев).
* **Definition of Done (DoD):**
  - Ученик подает заявку с мотивацией на курс.
  - В тренажере работает отправка развернутого ответа с получением структурированного вердикта.
* **Команда проверки:** `npm run build --prefix client`

---

### 🔹 ФАЗА 6: Сквозной E2E Тест и Финальная Полировка
* **Цель:** Провести полную сквозную верификацию всей агентной экосистемы.
* **Файлы к изменению/созданию:**
  - `server/src/__tests__/test_full_agentic_flow.ts` (автоматический прогон всех 8 шагов: регистрация $\rightarrow$ слоты $\rightarrow$ план $\rightarrow$ заявка $\rightarrow$ зачисление $\rightarrow$ решение Типа А с Сократом $\rightarrow$ решение Типа Б с Grader $\rightarrow$ обновление светофора журнала).
  - Обновление документации `walkthrough.md`.
* **Definition of Done (DoD):**
  - Все тесты проходят с кодом 0 (`100% pass`).
  - `npm run typecheck` на сервере и `npm run build` на клиенте завершаются без предупреждений.
* **Команда проверки:** `npm test --prefix server`

---

## 🏁 ЗАКЛЮЧЕНИЕ
Документ **ULTRA_CREATION.MD** зафиксирован как фундаментальный план развития Zerde 2.0.  
Любые дальнейшие модификации исходного кода должны строго следовать описанным фазам и критериям приемки.
