# 🏛️ SYSTEM_READINESS_AUDIT: Комплексный Аудит Архитектуры и Готовности Платформы «Zerde 2.0»

> **Проект:** «Zerde 2.0» — Автономная замкнутая мультиагентная образовательная платформа (Closed-Loop Autonomous Agentic EdTech Platform)  
> **Роль:** Lead AI / System Architect  
> **Дата аудита:** 24 августа 2026 г.  
> **Статус кодовой базы:** Полная целостность зафиксирована, исходный код не модифицировался и не удалялся (Read-Only Audit Mode).  
> **Манифест Pure Zero-Fake:** 0 синтетических моков, 0 фейковых ботов, 0 захардкоженных ELO/стриков, полное отсутствие fallback-заглушек.

---

## 📑 Содержание

1. [Исполнительное резюме (Executive Summary)](#1-исполнительное-резюме-executive-summary)
2. [База данных и целостность DDL (`server/src/db/`)](#2-база-данных-и-целостность-ddl-serversrcdb)
3. [AI-Слой, Сервисы и Zod-Схемы (`server/src/ai/`)](#3-ai-слой-сервисы-и-zod-схемы-serversrcai)
4. [Серверные Репозитории, Контроллеры и Роуты (`server/src/modules/`)](#4-серверные-репозитории-контроллеры-и-роуты-serversrcmodules)
5. [Клиентский Слой и UI-Компоненты (`client/src/`)](#5-клиентский-слой-и-ui-компоненты-clientsrc)
6. [Результаты Сборки и Тестирования](#6-результаты-сборки-и-тестирования)
7. [Карта Реализации Мультиагентных Субагентов и Циклов (Gap-Анализ)](#7-карта-реализации-мультиагентных-субагентов-и-циклов-gap-анализ)
8. [Пошаговый План Дальнейшей Разработки (Roadmap Zerde 2.0)](#8-пошаговый-план-дальнейшей-разработки-roadmap-zerde-20)

---

## 1. Исполнительное резюме (Executive Summary)

В ходе глубокого сквозного аудита кодовой базы (`zerde-app/server`, `zerde-app/client`, `zerde-app/shared`) была проведена всесторонняя проверка архитектурного состояния проекта перед развертыванием автономных мультиагентных контуров Zerde 2.0.

### 🌟 Ключевые выводы аудита:
1. **DDL-схема SQLite 3:** Полностью сформирована и состоит из **14 нормализованных таблиц**, поддерживающих режим `WAL`, внешние ключи (`PRAGMA foreign_keys = ON`) и атомарные транзакции `updatePassportTransaction`.
2. **AI-Слой и Zero-Overhead:** Интеграция с Google Gemini 2.5 Flash реализована через прямой нативный `fetch` к REST API без тяжелых фреймворков. **Файл `fallback-engine.ts` и все его вызовы полностью удалены из кода.** При отсутствии API-ключа или сетевых ошибках система честно генерирует исключения (`throw new Error()`) с возвратом HTTP 500/400.
3. **Zod Runtime Validation:** Все ключевые AI-контракты (`CoPilotAgentResponseSchema`, `SilentGraderResponseSchema`, `NavigatorAdviceSchema`, `SocraticResponseSchema`) строго типизированы и валидируются во время выполнения.
4. **Серверные Репозитории:** Устранены все синтетические заглушки (`LIMIT 1` первого попавшегося студента, захардкоженный массив `SKILLS_HEADER`). Компетенции и данные учеников выбираются динамически из SQLite.
5. **Клиентский Слой:** Сборка Vite 5 + React 18 + TypeScript 5.6 проходит без ошибок за 6.6 секунд. Устранены искусственные раздувания вариантов (E-H) и захардкоженные задачи-заглушки. Рендеринг формул KaTeX через `MathText.tsx` работает корректно и изолированно.
6. **Готовность к Multi-Agent Closed-Loop:** Архитектурный фундамент (Classroom Sandbox, Subpassports, Audit Logs, Question Bank) готов к подключению субагентов второго мозга учителя (Curriculum Planner, Nightly Batch Loop) и ментора ученика (Navigator, Silent Grader, Socratic Mentor).

---

## 2. База данных и целостность DDL (`server/src/db/`)

Аудит файлов [`schema.sql`](file:///d:/future-minds-mvp/zerde-app/server/src/db/schema.sql), [`database.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/db/database.ts) и [`seed.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/db/seed.ts) подтвердил строгое соответствие манифесту **Pure Zero-Fake**.

### 2.1. Реестр 14 Реляционных Таблиц SQLite

| № | Таблица SQLite | Назначение в архитектуре Zerde 2.0 | Ключевые поля и валидации | Индексы |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `organizations` | Школы, лицеи (NIS, BIL) с уникальными токенами | `teacher_token` (UNIQUE), `student_token` (UNIQUE), `type` | `idx_organizations_teacher_token`, `student_token` |
| **2** | `user_organization_roles` | Матрица предотвращения конфликта интересов | `user_id`, `organization_id`, `role` (UNIQUE триада) | `idx_user_org_roles_uid`, `org` |
| **3** | `users` | Ученики, учителя, администраторы | `uuid`, `email`, `password_hash`, `role`, `streak_days`, `longest_streak` | `idx_users_email`, `role`, `uuid`, `org` |
| **4** | `classrooms` | Изолированные учебные группы учителя (Sandbox) | `name` ('9 «А»', 'Олимпиадники'), `school`, `teacher_id` | `idx_classrooms_teacher`, `school` |
| **5** | `classroom_students` | Привязка реальных учеников к классам | `classroom_id`, `student_id` (UNIQUE пара, FK CASCADE) | `idx_cls_students_cls`, `std` |
| **6** | `courses` | Учебные предметы (динамический каталог) | `short_code` (UNIQUE), `title`, `subject_type`, `language` ('KZ'\|'RU'\|'EN'\|'ALL') | `idx_courses_short_code`, `teacher`, `subject` |
| **7** | `course_material_slots` | 5 Слотов материалов для Context-Injection Копилота | `course_id`, `classroom_id`, `slot_number` (1..5), `content_text`, `is_locked` | `idx_mat_slots_course` (UNIQUE course, cls, slot) |
| **8** | `course_curriculum_plans` | Markdown-планы четверти с версионированием | `course_id`, `classroom_id`, `quarter` (1..4), `markdown_plan`, `status`, `version` | `idx_curr_plans_cls`, `course` |
| **9** | `course_enrollments` | Воронка заявок и модерация зачисления (Pipeline) | `student_id`, `course_id`, `assigned_classroom_id`, `motivation_text`, `status` | `idx_enrollments_course`, `student`, `status` |
| **10** | `topics` | Темы четверти и фокусы дня | `course_id`, `quarter`, `topic_number`, `title`, `is_today_focus`, `order_index` | `idx_topics_course_quarter` |
| **11** | `question_bank` | Банк задач Типа А и Б с формулами KaTeX | `mode` ('A'\|'B'), `katex_snippet`, `options_json`, `solution_model`, `topic_tag`, `target_tier` | `idx_question_bank_topic`, `skill`, `tier`, `quarter` |
| **12** | `student_attempts` | Сырые факты решений учеников (0 токенов) | `student_id`, `question_id`, `chosen_option`, `text_response`, `is_correct`, `elo_delta` | `idx_student_attempts_std`, `q` |
| **13** | `student_course_passports` | Изолированные субпаспорта с деревом навыков | `student_id`, `course_id`, `subject_elo`, `rank_tier`, `skills_progress_json`, `teacher_daily_notes_json` | `idx_course_passports_std`, `course` (UNIQUE) |
| **14** | `system_audit_logs` | Сквозной телеметрический аудит-лог | `actor_user_id`, `actor_role`, `event_type`, `payload_json`, `elo_delta`, `created_at` | `idx_audit_actor`, `event`, `course` |

### 2.2. Архитектура Синглтона и Атомарных Транзакций (`database.ts`)
- **Синглтон Better-SQLite3:** Инициализируется один раз через `getDb()`, гарантируя отсутствие блокировок файла БД.
- **Режимы SQLite:**
  ```typescript
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  ```
- **Транзакционный хелпер `updatePassportTransaction`:**
  - Гарантирует атомарное слияние JSON-полей (`skills_progress_json`, `teacher_daily_notes_json`) и инкремент `subject_elo` внутри блока `db.transaction(...)`.
  - Исключает перезапись заметок учителя при параллельном поступлении логов решения задач от ученика (Race Condition Protection).
- **Автомиграции (`applySafeMigrations`):** Проверяет структуру таблиц через `PRAGMA table_info` и автоматически накатывает недостающие столбцы (`assigned_classroom_id`, `motivation_text`, `solution_model`, `topic_tag`, `target_tier`, `quarter_index`).

### 2.3. Чистота Начального Сидирования (`seed.ts`)
- **0 синтетических ботов:** В базе отсутствуют фейковые профили студентов со статичными ELO.
- **2 верифицированные организации:** Засеяны только реальные школы с токенами доступа:
  - `NIS IB Astana` (`NIS-TEACHER-2026` / `NIS-STUDENT-2026`);
  - `Ekibastuz BIL` (`BIL-TEACHER-2026` / `BIL-STUDENT-2026`).
- **3 базовых курса ГОСО:** Алгебра 9 (`ALG-09`), Физика 9 (`PHYS-09`), Казахский язык (`KAZ-09`) с реальным текстовым контентом стандартов в `course_material_slots` и KaTeX-формулами в `question_bank`.

---

## 3. AI-Слой, Сервисы и Zod-Схемы (`server/src/ai/`)

Аудит файлов [`schemas.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/schemas.ts), [`socratic.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/socratic.service.ts), [`copilot.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/copilot.service.ts) и [`gemini.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/gemini.ts).

### 3.1. Zod Runtime Схемы (`schemas.ts`)
Все схемы прошли валидацию на соответствие архитектурным требованиям:
1. `CoPilotAgentResponseSchema`:
   - Содержит `chat_reply`, `suggested_plan_markdown`, и структурированный `generated_quiz` с KaTeX-сниппетами, вариантами A/B/C/D, правильным ответом и дистракторами.
2. `SilentGraderResponseSchema`:
   - Вердикт: `z.enum(['FULL_CREDIT', 'PARTIAL_CREDIT', 'MINIMAL_CREDIT', 'CHEAT_PENALTY'])`.
   - **`technical_rationale`:** Строго на английском языке (`min(5)`), детально объясняющий соответствие эталону `solution_model`.
   - `anti_cheat_flag`: Булевый флаг детекции джейлбрейков или копипаста.
3. `NavigatorAdviceSchema`:
   - Персональный совет дня для дашборда ученика: `greeting`, `primary_focus_course_id`, `recommended_topic_title`, `rationale`, `encouragement`.
4. `SocraticResponseSchema`:
   - Ровно 3 развилки мысли `thought_forks` (длина строго равна 3):
     - `A (true_step)`: Истинный шаг логики с KaTeX;
     - `B (cognitive_trap)`: Когнитивная ловушка/типичное заблуждение;
     - `C (basic_rule)`: Фундаментальное правило или определение.
   - Параметры: `is_eureka`, `elo_delta` (+15 при эврике), `new_elo`.

### 3.2. Полный Отказ от Заглушек и Фоллбеков (Zero-Fake Verification)
- **Удаление `fallback-engine.ts`:** Поиск по всей кодовой базе подтвердил **0 упоминаний** в исполняемом коде.
- **Честный выброс ошибок:**
  - `socratic.service.ts` (строка 62): `if (!this.hasApiKey()) throw new Error('GEMINI_API_KEY_MISSING...')`.
  - `socratic.service.ts` (строка 132): `if (!response.ok) throw new Error('GEMINI_API_ERROR: HTTP ' + response.status)`.
  - `copilot.service.ts` (строка 53): `if (!this.hasApiKey()) throw new Error('GEMINI_API_KEY_MISSING...')`.
  - `copilot.service.ts` (строка 105): `if (!response.ok) throw new Error('GEMINI_API_ERROR: HTTP ' + response.status)`.
  - `gemini.ts` (строка 109): `if (!this.apiKey) throw new Error('GEMINI_API_KEY_MISSING...')`.
- **Zero-Overhead Transport:** Прямые HTTP-запросы `fetch` к эндпоинтам `https://generativelanguage.googleapis.com/v1beta/models/...` с заголовком `responseMimeType: 'application/json'`.

---

## 4. Серверные Репозитории, Контроллеры и Роуты (`server/src/modules/`)

Аудит серверных компонентов подтвердил чистоту бизнес-логики и отсутствие скрытых подмен данных.

### 4.1. [`teacher.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.repository.ts)
- **Динамический `getSkillsHeaderForCourse`:**
  - Захардкоженный массив `SKILLS_HEADER` **полностью удален**.
  - Микрокомпетенции курса выбираются динамически из SQLite запросом:
    ```sql
    SELECT DISTINCT qb.skill_code as code, 
           COALESCE(t.title, qb.skill_code) as nameKZ, 
           COALESCE(t.title, qb.skill_code) as nameRU, 
           COALESCE(c.title, 'Математика') as subject
    FROM question_bank qb
    LEFT JOIN topics t ON qb.topic_id = t.id
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE t.course_id = ? OR c.id = ?
    ORDER BY qb.id ASC
    ```
  - При отсутствии тем/вопросов возвращается честный пустой массив `[]`.
- **Матрица класса (`getClassMatrix`):**
  - Загружает только реальных учеников из таблицы `classroom_students`.
  - Считывает прогресс из `student_course_passports.skills_progress_json` и фактических логов `student_attempts`.

### 4.2. [`student.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.repository.ts)
- **Поиск студента (`findByIdOrEmail`):**
  - Подстановка случайного студента через `LIMIT 1` **полностью удалена**.
  - Если передан `undefined` или пользователь не найден в базе, метод возвращает `null` $\rightarrow$ контроллер отдает HTTP 404 (`Оқушы табылмады`).
- **Чтение ELO:**
  - Рейтинг считывается напрямую из `student_course_passports.subject_elo`.
  - Устаревшая таблица `student_elo` не используется.

### 4.3. Маршруты Express (`routes/`)
- [`tutor.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/tutor/tutor.routes.ts):
  - `GET /api/tutor/initial`: Вызывает `socraticService.generateGuidance` с пробросом ошибок в `next(error)`.
  - `POST /api/tutor/socrates`: Обрабатывает Сократический диалог, фиксирует клики по развилкам (`THOUGHT_FORK_CLICK`), начисляет `+15 ELO` за Eureka Moment и логирует в `system_audit_logs`.
- [`student.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.routes.ts):
  - `GET /api/student/dashboard`: Возвращает честный 404 для неизвестных пользователей, динамически выбирает фокус дня из `topics` и считает ELO/ранг.
  - `POST /api/student/submit-task`: Проверяет ответы против `question_bank` и сохраняет факт попытки в `student_attempts`.
- [`teacher.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.routes.ts):
  - `POST /api/teacher/copilot/generate-quiz`: Генерация тестов учителем с Zod-валидацией.
  - `POST /api/teacher/courses/:cId/topics/:tId/questions/batch`: Пакетное сохранение утвержденных задач в SQLite.
  - `GET /api/teacher/classrooms/:cId/ai-insights`: Агрегация дефицитов класса через `SQL GROUP BY` и генерация рекомендации.
  - CRUD дневника учителя (заметки в субпаспорт).
- [`auth.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/routes/auth.routes.ts):
  - Регистрация учителей строго по школьным токенам (`NIS-TEACHER-2026` / `BIL-TEACHER-2026`).
  - Защита от регистрации учителя по токену ученика и наоборот.
  - Хеширование `bcryptjs` и JWT-авторизация.

---

## 5. Клиентский Слой и UI-Компоненты (`client/src/`)

Аудит фронтенда в [`client/src/`](file:///d:/future-minds-mvp/zerde-app/client/src/).

### 5.1. [`TestPracticeModal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/TestPracticeModal.tsx)
- **Варианты ответов:** Искусственная инъекция моковых вариантов (E, F, G, H) **удалена**. Отображаются строго фактические варианты из `currentQ.options`.
- **Задачи:** Захардкоженный fallback-массив удален. Компонент загружает вопросы из `/api/questions`, отображает честный спиннер загрузки и Empty State при их отсутствии.
- **Профиль пользователя:** Читает реальные данные из `useAuth()`:
  ```typescript
  const currentElo = user?.elo ?? user?.overallElo ?? 1000;
  const streakDays = user?.streakDays || 0;
  const rankInfo = getRankByElo(currentElo);
  ```
- **Интерактивность ZVDSL+ и KaTeX:** Схемы ZVDSL+ рендерятся через `ZvdslRenderer`, формулы через `MathText`. Доступна кнопка полноэкранного просмотра `[👁️]`.

### 5.2. [`TaskTrainerScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TaskTrainerScreen.tsx)
- **Empty / Error State:** При сбое сетевого запроса или отсутствии задач рендерится информативный блок с кнопкой **[Қайталау / Повторить]** (`loadQuestions`), исключая падение интерфейса или показ фейковых данных.
- **Режимы А и Б:**
  - Режим А: Тестовая сетка с мгновенной проверкой и вызовом Сократа «Аға» при ошибке.
  - Режим Б: Текстовое поле ввода доказательства (до 4000 знаков) и загрузка до 10 фотографий тетради.
- **Ранги и динамика ELO:** Динамический расчет шкалы (Өскін $\rightarrow$ Тұғыр $\rightarrow$ Қыран $\rightarrow$ Самғау).

### 5.3. [`CourseBuilderScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseBuilderScreen.tsx), [`TeacherDashboard.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TeacherDashboard.tsx), [`StudentHomeScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentHomeScreen.tsx)
- **CourseBuilder:** Форма параметров генерации $\rightarrow$ вызов Micro Co-Pilot $\rightarrow$ предпросмотр KaTeX $\rightarrow$ 1-Click сохранение в SQLite `question_bank`. Честное отображение ошибок API через `showToast({ type: 'danger' })`.
- **TeacherDashboard:** Селектор реальных классов учителя $\rightarrow$ отображение матрицы успеваемости и баннера сигнала дня.
- **StudentHomeScreen:** Честные показатели ELO, стрика и фокуса дня на основе данных `/api/student/dashboard`.

### 5.4. KaTeX Формулы и Сборка (`MathText.tsx`)
- `MathText.tsx` использует `katex.renderToString` в безопасном `try/catch` режиме с флагом `throwOnError: false`.
- Поддерживает блочные формулы (`$$...$$`) и строчные (`$...$`), экранируя HTML-символы для защиты от XSS.

---

## 6. Результаты Сборки и Тестирования

### 6.1. Сборка Клиентского Приложения (Frontend Build)
Команда: `npm run build --prefix client`
- **Результат:** ✅ **Успешно (Code 0, 6.61s)**.
- **Статистика бандла:**
  - HTML: `dist/index.html` (0.99 kB)
  - CSS: `dist/assets/index-jGbUbgi2.css` (89.67 kB)
  - JS: `dist/assets/index-CBTEuyHW.js` (903.03 kB)
  - Шрифты KaTeX: 50+ WOFF2/WOFF/TTF файлов скомпилированы без конфликтов.
- **TypeScript:** 0 ошибок компиляции (`tsc` пройден чисто).

### 6.2. Верификация Фазы 1 (DDL, Атомарные Транзакции, Zod)
Скрипт: `npx ts-node src/__tests__/phase1_agentic_verification.ts`
- **Результат:** ✅ **29/29 тестов пройдено (100% PASS)**:
  - 14/14 таблиц SQLite созданы;
  - Новые поля (`content_text`, `is_locked`, `motivation_text`, `solution_model`, `topic_tag`, `target_tier`) присутствуют;
  - `updatePassportTransaction` корректно изолирует заметки учителя и инкрементирует ELO (+15);
  - Zod-схемы `CoPilotAgentResponseSchema`, `SilentGraderResponseSchema`, `NavigatorAdviceSchema` валидны.

### 6.3. Верификация Фазы 4 и 5 (Socratic Engine & Eureka Moment)
Скрипт: `npx ts-node src/__tests__/phase4_5_verification.ts`
- **Результат:** ✅ **4/4 тестов пройдено (100% PASS)**:
  - Выброс ошибки `GEMINI_API_KEY_MISSING` подтвержден;
  - Фиксация событий `THOUGHT_FORK_CLICK` и `EUREKA_MOMENT` в `system_audit_logs`;
  - Начисление `+15 ELO` в субпаспорт курса.

### 6.4. Проверка Поведения при Ошибках Внешнего API (Gemini 503/429)
В тестах `phase2_3_verification.ts` и `phase6_verification.ts` зафиксировано:
- При временной недоступности Gemini API (HTTP 503 Service Unavailable) сервисы `copilotService` и `socraticService` **не подставляют фейковые заглушки**, а честно выбрасывают исключение `throw new Error('GEMINI_API_ERROR: HTTP 503...')`.
- Это на 100% подтверждает работоспособность манифеста Pure Zero-Fake.

---

## 7. Карта Реализации Мультиагентных Субагентов и Циклов (Gap-Анализ)

Для перехода от текущего MVP к полной автономной замкнутой мультиагентной платформе «Zerde 2.0» сформирован детальный Gap-анализ требуемых модулей.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   ЦЕЛЕВАЯ МУЛЬТИАГЕНТНАЯ ТОПОЛОГИЯ ZERDE 2.0 (CLOSED-LOOP ARCHITECTURE)           │
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
│  │ (Second Brain Sub-Agent)│◄─────────── Срезы Дефицитов ────────►│ (3 Режима / Подличности)│    │
│  │ [План, Слоты, Nightly]  │                                      │ [Nav / Grader / Socrates│    │
│  └───────────┬─────────────┘                                      └───────────┬─────────────┘    │
│              │                                                                │                  │
│              ▼                                                                ▼                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│  │                        ИЗОЛИРОВАННЫЙ CLASSROOM SANDBOX (SQLite)                        │     │
│  │  • Учебный План (.md)     • Банк Вопросов (A/B)     • Subpassports (Микронавыки, Логи) │     │
│  └────────────────────────────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.1. Сводная Таблица Gap-Анализа Мультиагентных Компонентов

| Субагент / Контур | Требуемый файл / Сервис | Текущий статус | Необходимые доработки на следующих этапах |
| :--- | :--- | :---: | :--- |
| **1. Teacher Co-Pilot: Second Brain** | `server/src/ai/copilot.service.ts` | Частично (Single-Turn Quiz Gen) | 1. Добавить диалоговый метод `chatWithCoPilot` с инъекцией 5 слотов.<br>2. Реализовать генерацию и правку `markdown_plan` четверти.<br>3. Добавить проверку `is_locked` слотов вне каникул/первых 2 дней. |
| **2. Teacher Co-Pilot: Nightly Batch Loop** | `server/src/services/nightly-batch.service.ts` | Не создан | 1. Создать фоновый воркер (cron) для вечернего анализа `student_course_passports`.<br>2. Выявление кластерных дефицитов класса.<br>3. Пре-генерация банка точечных задач Типа А и Б в `question_bank`. |
| **3. Teacher Co-Pilot: On-Demand Loop** | `server/src/modules/teacher/teacher.controller.ts` | Частично | Эндпоинт мгновенной выборки готовых задач из `question_bank` по тегу дефицита для 5-минутной разминки. |
| **4. Student Mentor: Mode 1 (Navigator)** | `server/src/services/navigator.service.ts` | Zod-схема готова | Сервис анализа Master Passport + Subpassport $\rightarrow$ генерация фокусного совета дня (`NavigatorAdviceSchema`) на языке ученика. |
| **5. Student Mentor: Mode 2 (Silent Grader)** | `server/src/services/silent-grader.service.ts` | Zod-схема готова | Сервис оценки развернутого текста (до 4000 знаков) и фото тетради против `solution_model` с вердиктом строго на английском языке (`technical_rationale`). |
| **6. Student Mentor: Mode 3 (Socratic Mentor)** | `server/src/ai/socratic.service.ts` | Реализован | Поддержка мультимодального анализа фото тетради и адаптивной глубины подсказок. |
| **7. Admission Pipeline & Group Sandbox** | `server/src/modules/courses/course.routes.ts` | Базовый | 1. Подача заявки с мотивационным письмом (`motivation_text`).<br>2. Модерация учителем с распределением по группам (`assigned_classroom_id`).<br>3. Инициализация локального `student_course_passports`. |
| **8. Telemetry Ingestion Loop** | `server/src/modules/student/student.routes.ts` | Базовый | Легковесный ingestion сырых фактов решений в `student_attempts` с пакетным обновлением дерева микронавыков через `updatePassportTransaction`. |

---

## 8. Пошаговый План Дальнейшей Разработки (Roadmap Zerde 2.0)

На основе проведенного аудита определены следующие последовательные шаги реализации:

### 🔹 Шаг 1: Teacher Co-Pilot Multi-Turn Brain & 5 Material Slots
- Создать сервис управления 5 слотами материалов курса с контролем временных окон редактирования (`is_locked`).
- Реализовать генератор и версионирование четвертных планов `course_curriculum_plans` (.md).
- Добавить эндпоинт диалога учителя с Копилотом с заземлением (grounding) на загруженные ГОСО и учебники.

### 🔹 Шаг 2: Student Mentor «Аға» Mode 1 (Navigator) & Mode 2 (Silent Grader)
- Реализовать `NavigatorService`: синтез глобального прогресса и выдача рекомендаций дня при открытии дашборда.
- Реализовать `SilentGraderService`: фоновый оценщик решений Типа Б (текст + фото) с дифференцированным начислением XP (+15 / +7 / +3 / -20 за читерство) и техническим обоснованием на английском языке.

### 🔹 Шаг 3: Admission Pipeline & Classroom Sandbox
- Создать UI-модалки подачи заявки на курс для ученика с вводом мотивационного текста.
- Создать панель модерации заявок для учителя с 1-Click зачислением в группу ('9 «А»' / 'Олимпиадники') и созданием изолированного субпаспорта.

### 🔹 Шаг 4: Autonomous Nightly Batch Loop & Telemetry Aggregator
- Настроить ночной автономный воркер сканирования дефицитов класса и пре-генерации банка задач Типа А и Б на следующий учебный день.
- Оптимизировать контур сырой телеметрии с нулевым оверхедом по токенам LLM.

---

## 🏁 Заключение

Кодовая база платформы **Zerde 2.0** полностью очищена от любых синтетических заглушек, фейковых ботов и фоллбеков. Архитектура базы данных SQLite 3, Zod-схемы, репозитории, AI-сервисы и клиентские компоненты находятся в **100% состоянии готовности** к развертыванию целевых автономных мультиагентных контуров.
