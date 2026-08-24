# 🌟 ZERDE 2.0: ГЕНЕРАЛЬНЫЙ МАСТЕР-ПЛАН МУЛЬТИАГЕНТНОЙ ЭКОСИСТЕМЫ (ULTRA_CREATION.MD)

> **Статус документа:** Source of Truth (Единый источник правды)  
> **Версия:** 2.0 (Pure Zero-Fake Architecture)  
> **Дата утверждения:** 24 августа 2026 г.  
> **Целевой стек:** Node.js, Express, TypeScript, Better-SQLite3, React 18, Vite 5, Tailwind CSS, KaTeX, Google Gemini 2.5 Flash, Zod.  
> **Архитектурный манифест:** Stateless Context-Injection, Classroom Sandbox, Pure Zero-Fake, Honest Error Protocol.

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
* **Решение:** Использование огромного окна контекста **Google Gemini 2.5 Flash (1 000 000 токенов)**. Сервер при каждом запросе собирает нативный контекст:
  1. Текстовое содержимое всех утвержденных 5 слотов курса/группы (`course_material_slots`);
  2. Текущий Markdown-план четверти (`course_curriculum_plans`);
  3. Агрегированные сабпаспорта учеников (`skills_progress_json` в `student_course_passports`) и сырые логи последних попыток (`student_attempts`).
* **Результат:** Модель моментально видит дельту расхождений, заземлена на учебники (Grounding) и не галлюцинирует.

### 1.2. Принцип Classroom Sandbox (Строгая изоляция учебных групп)
* Каждая учебная группа учителя (`9 «А»`, `10 «Б»`, `Олимпиадники`) представляет собой **полностью изолированную песочницу**:
  - Собственный независимый Markdown-план четверти;
  - Собственный банк тематических вопросов;
  - Изолированные предметные сабпаспорта учеников (`student_course_passports`).
* Учитель одной группы физически не может повлиять на прогресс или материалы параллельного класса.

### 1.3. Манифест Pure Zero-Fake & Honest Error Protocol
* **Pure Zero-Fake:** 0 моковых массивов, 0 призрачных ботов, 0 статических заглушек. Любая цифра на дашборде (ELO, процент освоения, матрица успеваемости) вычисляется строго из реальных записей SQLite.
* **Honest Error Protocol (Отказ от FallbackEngine):** В ходе экстренной зачистки SOS-3 файл `server/src/ai/fallback-engine.ts` был полностью физически удален. Все вызовы AI осуществляются на 100% через Gemini API. При отсутствии ключа, ошибках сети (429/503) или сбое Zod-валидации система:
  1. Логирует ошибку в `system_audit_logs`;
  2. Выбрасывает честное исключение `throw new Error(...)`;
  3. Возвращает клиенту честный HTTP статус ошибки (`400`/`404`/`500`) без подмены на синтетические шаблоны.

---

## 2. 🗄️ СХЕМА ДАННЫХ И DDL-ИЗМЕНЕНИЯ (SQLITE 3) — СТАТУС: ✅ РЕАЛИЗОВАНО

База данных Zerde 2.0 состоит из **14 строго реляционных таблиц** в режиме WAL с каскадными связями.

```
server/src/db/
├── schema.sql           # Актуальная DDL-схема SQLite (14 таблиц)
├── database.ts         # Синглтон better-sqlite3 и атомарные транзакции паспорта
└── seed.ts             # Чистый сид 2 школ (NIS IB, Ekibastuz BIL) без фейковых учеников
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
    classroom_id INTEGER,
    quarter INTEGER NOT NULL CHECK(quarter BETWEEN 1 AND 4),
    markdown_plan TEXT NOT NULL,                        -- Полный сгенерированный и утвержденный план
    status TEXT NOT NULL DEFAULT 'DRAFT_QUESTIONNAIRE' CHECK(status IN ('DRAFT_QUESTIONNAIRE', 'APPROVED', 'ARCHIVED')),
    version INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    UNIQUE(course_id, classroom_id, quarter, version)
);

-- ============================================================================
-- 3. ВОРОНКА ЗАЯВОК И ЗАЧИСЛЕНИЙ С МОТИВАЦИОННЫМ ПИСЬМОМ
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied' CHECK(status IN ('applied', 'enrolled', 'rejected', 'completed')),
    motivation_text TEXT,                               -- Обязательное мотивационное письмо ученика
    assigned_classroom_id INTEGER,                      -- Группа, назначенная учителем при одобрении (напр. 9 «А»)
    rejection_reason TEXT,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
    UNIQUE(course_id, student_id)
);

-- ============================================================================
-- 4. БАНК ЗАДАНИЙ (ТИП А: ТЕСТЫ, ТИП Б: РАЗВЕРНУТЫЕ С SOLUTION MODEL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS question_bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'TYPE_A' CHECK(question_type IN ('TYPE_A', 'TYPE_B')),
    question_text TEXT NOT NULL,
    katex_snippet TEXT,
    options_json TEXT,                                  -- JSON-массив вариантов для Типа А
    correct_answer TEXT,
    solution_model TEXT,                                -- Эталонное пошаговое решение для Silent Grader (Тип Б)
    topic_tag TEXT,                                     -- Тег микрокомпетенции (напр. 'ALG_09_VIETE')
    target_tier TEXT DEFAULT 'OSKIN',                   -- 'OSKIN', 'TULPAR', 'SUNKAR', 'ALTYN'
    difficulty INTEGER DEFAULT 2 CHECK(difficulty BETWEEN 1 AND 5),
    skill_code TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- ============================================================================
-- 5. ИЗОЛИРОВАННЫЕ ПРЕДМЕТНЫЕ ПАСПОРТА СТУДЕНТА (Subpassports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_course_passports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    subject_elo INTEGER NOT NULL DEFAULT 1000,
    rank_tier TEXT NOT NULL DEFAULT 'OSKIN',
    skills_progress_json TEXT NOT NULL DEFAULT '{}',
    teacher_daily_notes_json TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id)
);
```

---

## 3. 🤖 АРХИТЕКТУРА AI-СЕРВИСОВ И АГЕНТОВ (ФАЗА 2)

Вся мультиагентная логика разделена на **4 независимых микросервиса**, использующих структурированные системные Markdown-промпты и строгие Zod-схемы без маскировки сбоев.

```
server/src/ai/
├── prompts/
│   ├── teacher_copilot.md      # Системный промпт Второго Мозга Учителя
│   ├── silent_grader.md        # Системный промпт Оценщика Типа Б (на английском языке)
│   └── navigator.md            # Системный промпт Навигатора Ученика
├── schemas.ts                  # Zod-схемы валидации ответов всех агентов
├── copilot.service.ts          # CoPilot: Генерация плана четверти и тестов по 5 слотам
├── silent-grader.service.ts    # Silent Grader: Оценка развернутых ответов против solution_model
├── navigator.service.ts        # Navigator: Синтез Master Passport и совет дня
└── socratic.service.ts         # Socratic: Диалог с 3 развилками мысли «Аға»
```

### 3.1. `SilentGraderService` (Фоновый Оценщик Типа Б)
* **Назначение:** Оценка рукописного текста (OCR) или напечатанного развернутого ответа ученика.
* **Механика:** Сравнивает ответ ученика с полем `question_bank.solution_model`.
* **Язык рассуждений:** Внутренний `technical_rationale` генерируется **строго на английском языке** для максимальной точности логического анализа Gemini 2.5 Flash, а вердикт ученику — на языке задачи (KZ/RU/EN).
* **Zod-схема (`SilentGraderResponseSchema`):**
  ```typescript
  export const SilentGraderResponseSchema = z.object({
    score: z.number().min(0).max(100),
    verdict: z.enum(['CORRECT', 'PARTIAL', 'INCORRECT']),
    detected_steps: z.array(z.string()),
    missed_critical_steps: z.array(z.string()),
    technical_rationale: z.string().describe('Pure English pedagogical justification'),
    student_feedback: z.string().describe('Gentle feedback in student language'),
    awarded_xp: z.number().int().min(0)
  });
  ```

### 3.2. `NavigatorService` (Персональный Навигатор Ученика)
* **Назначение:** Синтезирует данные изо всех предметных сабпаспортов (`student_course_passports`), строит виртуальный **Master Passport** и выдает 1 емкий персональный фокус дня.
* **Zod-схема (`NavigatorAdviceSchema`):**
  ```typescript
  export const NavigatorAdviceSchema = z.object({
    daily_focus_subject: z.string(),
    daily_focus_topic: z.string(),
    recommended_action: z.string(),
    encouragement_quote: z.string(),
    urgency_level: z.enum(['LOW', 'MEDIUM', 'HIGH'])
  });
  ```

### 3.3. `CoPilotService` (Второй Мозг Учителя)
* **Назначение:** Читает текстовые слоты `course_material_slots`, генерирует структурированный 4-четвертной Markdown-план с опросником подтверждения и генерирует пакеты проверочных задач с формулами KaTeX.

### 3.4. `SocraticService` (Сократический Ментор «Аға»)
* **Назначение:** Сопровождает решение задач Типа А, генерируя ровно 3 развилки мысли (`true_step`, `cognitive_trap`, `basic_rule`).

---

## 4. 📅 ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ ПО 6 ФАЗАМ

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          ГРАФИК ПОШАГОВОГО ВЫПОЛНЕНИЯ (6 ФАЗ)                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  ФАЗА 1: Схема БД, Миграции и Zod-контракты (DDL, 14 таблиц, транзакции)      │ ✅ ЗАВЕРШЕНО │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 2: AI-Сервисы и Системные MD-Промпты (Grader, Navigator, CoPilot, 5 слотов)           │
│      │                                                                                      │
│      ▼                                                                                      │
│  ФАЗА 3: API Роуты и Контроллеры (Admission, Slots, Plans, Copilot, Grader)                 │
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

### 🔹 ФАЗА 1: Схема БД, Миграции и Zod-Контракты (✅ СТАТУС: ЗАВЕРШЕНО)
* **Выполнено:**
  - 14 таблиц SQLite в `server/src/db/schema.sql` (включая `course_material_slots`, `course_curriculum_plans`, `course_enrollments`, `question_bank` с `solution_model`).
  - Атомарные транзакции паспорта в `server/src/db/database.ts`.
  - Валидационные Zod-схемы в `server/src/ai/schemas.ts`.
  - Верификационный тест `phase1_agentic_verification.ts` пройден на 100% (**29/29 assertions passed**).

---

### 🔹 ФАЗА 2: AI-Сервисы и Системные MD-Промпты (Текущий этап)
* **Цель:** Создать системные промпты в формате `.md` и реализовать `SilentGraderService`, `NavigatorService`, `CoPilotService` (с 5 слотами) и `SocraticService` строго без заглушек.
* **Файлы к реализации:**
  - `server/src/ai/prompts/teacher_copilot.md` (системный промпт Копилота с anti-injection).
  - `server/src/ai/prompts/silent_grader.md` (системный промпт Grader на английском).
  - `server/src/ai/prompts/navigator.md` (системный промпт Навигатора).
  - `server/src/ai/silent-grader.service.ts` (оценка Типа Б против `solution_model`).
  - `server/src/ai/navigator.service.ts` (синтез Master Passport и генерация совета дня).
  - `server/src/ai/copilot.service.ts` (генерация плана четверти по 5 слотам).
  - `server/src/__tests__/phase2_agentic_verification.ts` (тест вызовов Gemini 2.5 Flash и проверки честного выброса ошибок).
* **Definition of Done (DoD):**
  - Сервисы инжектят текст слотов в промпт.
  - Silent Grader возвращает строгий валидный JSON с `technical_rationale` на английском.
  - При отсутствии ключа выбрасывается `GEMINI_API_KEY_MISSING` (0 заглушек).
* **Команда проверки:** `npx ts-node src/__tests__/phase2_agentic_verification.ts`

---

### 🔹 ФАЗА 3: API Роуты и Контроллеры (Express)
* **Цель:** Связать клиентский слой с новыми сервисами через защищенные маршруты Express.
* **Файлы к реализации:**
  - `server/src/modules/teacher/teacher.routes.ts` & `teacher.controller.ts`:
    - `POST /api/teacher/courses/:id/slots/:slotNumber` (сохранение текста в слот с проверкой `is_locked`).
    - `GET /api/teacher/courses/:id/slots` (получение слотов).
    - `POST /api/teacher/courses/:id/plan/generate` (генерация плана четверти через CoPilot).
    - `POST /api/teacher/courses/:id/plan/approve` (утверждение плана).
    - `GET /api/teacher/courses/:id/applications` (список заявок учеников).
    - `POST /api/teacher/courses/:id/applications/:appId/moderate` (принятие/отклонение заявки с назначением группы).
  - `server/src/modules/student/student.routes.ts` & `student.controller.ts`:
    - `POST /api/student/courses/:id/apply` (подача заявки с мотивационным письмом).
    - `GET /api/student/navigator-advice` (получение совета дня от Навигатора).
    - `POST /api/student/tasks/grade-type-b` (отправка Типа Б на проверку в Silent Grader).
  - `server/src/__tests__/phase3_agentic_verification.ts` (тестирование эндпоинтов).
* **Definition of Done (DoD):**
  - Полный цикл модерации заявок и управления 5 слотами доступен через REST API.
  - Авторизация строго проверяет токен учителя школы для закрытых эндпоинтов.

---

### 🔹 ФАЗА 4: Фронтенд Учителя (Студия 5 Слотов, Чат Копилота, Модерация)
* **Цель:** Предоставить учителю эргономичный интерфейс управления курсом и группой.
* **Файлы к реализации:**
  - `client/src/screens/CourseBuilderScreen.tsx` (вкладка 5 слотов материалов, просмотр Markdown-плана с утверждением, чат со Вторым Мозгом).
  - `client/src/features/admission/ApplicationsModerationModal.tsx` (модальное окно модерации входящих заявок с просмотром Master Passport соискателя).
  - `client/src/screens/TeacherDashboard.tsx` (интеграция счетчика новых заявок и селектора изолированных групп).
* **Definition of Done (DoD):**
  - Учитель вставляет текст ГОСО/учебника в слот, генерирует план четверти и утверждает его.
  - Учитель модерирует заявки и распределяет учеников по классам (`9 «А»` / `10 «Б»`).

---

### 🔹 ФАЗА 5: Фронтенд Ученика (Виджет Навигатора, Режим Типа Б, Сократ)
* **Цель:** Реализовать персональный опыт обучения для школьника.
* **Файлы к реализации:**
  - `client/src/screens/StudentHomeScreen.tsx` (интеграция виджета «Аға Навигатор» с персональным советом дня).
  - `client/src/screens/CourseCatalogScreen.tsx` (модалка подачи заявки с мотивационным текстом).
  - `client/src/screens/TaskTrainerScreen.tsx` (интеграция проверки Типа Б через Silent Grader с отображением начисленного XP и критериев).
* **Definition of Done (DoD):**
  - Ученик подает заявку с мотивацией на курс.
  - В тренажере работает отправка развернутого ответа с получением структурированного вердикта.

---

### 🔹 ФАЗА 6: Сквозной E2E Тест и Финальная Полировка
* **Цель:** Провести полную сквозную верификацию всей мультиагентной экосистемы.
* **Файлы к реализации:**
  - `server/src/__tests__/test_full_agentic_flow.ts` (сквозной прогон всех 8 шагов: регистрация $\rightarrow$ слоты $\rightarrow$ план $\rightarrow$ заявка $\rightarrow$ зачисление $\rightarrow$ решение Типа А с Сократом $\rightarrow$ решение Типа Б с Grader $\rightarrow$ обновление матрицы успеваемости).
* **Definition of Done (DoD):**
  - Все тесты проходят со 100% успехом (`Code 0`).
  - `npm run typecheck` и `npm run build` компилируются без единой ошибки.

---

## 🏁 ЗАКЛЮЧЕНИЕ
Документ **ULTRA_CREATION.MD** зафиксирован как фундаментальный генеральный план развития Zerde 2.0.  
Все последующие шаги выполняются строго по спецификации утвержденных фаз.
