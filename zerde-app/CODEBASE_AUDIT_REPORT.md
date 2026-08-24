# 📋 CODEBASE_AUDIT_REPORT: Исчерпывающий Технический Аудит Платформы «Zerde»

**Дата аудита:** 24 августа 2026 г.  
**Объект аудита:** Репозиторий `d:/future-minds-mvp/zerde-app` (`server/`, `client/`, `shared/`).  
**Статус:** Аналитический срез текущего состояния архитектуры перед расширением AI-функционала.  
**Правило:** Исходный код не модифицировался.

---

## 📑 Содержание

1. [База Данных и Хранилище (SQLite / DDL / Migrations)](#1-база-данных-и-хранилище-sqlite--ddl--migrations)
2. [Бэкенд и API Слой (Express / TypeScript / RBAC)](#2-бэкенд-и-api-слой-express--typescript--rbac)
3. [AI Инфраструктура и Промпты (Gemini API / Zod / Fallback)](#3-ai-инфраструктура-и-промпты-gemini-api--zod--fallback)
4. [Фронтенд, Компоненты и UI-Состояние (React / Tailwind / KaTeX)](#4-фронтенд-компоненты-и-ui-состояние-react--tailwind--katex)
5. [Точки Риска и Архитектурные Узкие Места (Risk Assessment)](#5-точки-риска-и-архитектурные-узкие-места-risk-assessment)

---

## 1. База Данных и Хранилище (SQLite / DDL / Migrations)

### 1.1. Реестр Таблиц, Первичных/Внешних Ключей и Индексов
База данных построена на **SQLite 3** (`better-sqlite3` v13.0.3) в режиме `PRAGMA journal_mode = WAL;` с включенными внешними ключами `PRAGMA foreign_keys = ON;`. 

В текущей схеме [`schema.sql`](file:///d:/future-minds-mvp/zerde-app/server/src/db/schema.sql) присутствуют ровно **13 реляционных таблиц ядра**:

| № | Таблица | Первичный ключ (PK) | Внешние ключи (FK) и Cascade | Уникальные ключи (UNIQUE) | Созданные Индексы |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | `organizations` | `id (INTEGER AUTO)` | — | `teacher_token`, `student_token` | `idx_organizations_teacher_token`, `idx_organizations_student_token` |
| **2** | `user_organization_roles` | `id (INTEGER AUTO)` | `user_id` $\rightarrow$ `users(id)` ON DELETE CASCADE<br>`organization_id` $\rightarrow$ `organizations(id)` ON DELETE CASCADE | `(user_id, organization_id, role)` | `idx_user_org_roles_uid`, `idx_user_org_roles_org` |
| **3** | `users` | `id (INTEGER AUTO)` | `organization_id` $\rightarrow$ `organizations(id)` ON DELETE SET NULL | `uuid`, `email` | `idx_users_email`, `idx_users_role`, `idx_users_uuid`, `idx_users_org` |
| **4** | `classrooms` | `id (INTEGER AUTO)` | `teacher_id` $\rightarrow$ `users(id)` ON DELETE CASCADE | — | `idx_classrooms_teacher`, `idx_classrooms_school` |
| **5** | `classroom_students` | `id (INTEGER AUTO)` | `classroom_id` $\rightarrow$ `classrooms(id)` ON DELETE CASCADE<br>`student_id` $\rightarrow$ `users(id)` ON DELETE CASCADE | `(classroom_id, student_id)` | `idx_cls_students_cls`, `idx_cls_students_std` |
| **6** | `courses` | `id (INTEGER AUTO)` | `teacher_id` $\rightarrow$ `users(id)` ON DELETE SET NULL<br>`organization_id` $\rightarrow$ `organizations(id)` ON DELETE SET NULL | `short_code` | `idx_courses_short_code`, `idx_courses_teacher`, `idx_courses_subject` |
| **7** | `course_slots` | `id (INTEGER AUTO)` | `course_id` $\rightarrow$ `courses(id)` ON DELETE CASCADE | `(course_id, slot_number)` | `idx_course_slots_course` |
| **8** | `course_enrollments` | `id (INTEGER AUTO)` | `course_id` $\rightarrow$ `courses(id)` ON DELETE CASCADE<br>`student_id` $\rightarrow$ `users(id)` ON DELETE CASCADE | `(course_id, student_id)` | `idx_enrollments_course`, `idx_enrollments_student`, `idx_enrollments_status` |
| **9** | `topics` | `id (INTEGER AUTO)` | `course_id` $\rightarrow$ `courses(id)` ON DELETE CASCADE | — | `idx_topics_course_quarter` |
| **10** | `question_bank` | `id (INTEGER AUTO)` | `topic_id` $\rightarrow$ `topics(id)` ON DELETE CASCADE | — | `idx_question_bank_topic`, `idx_question_bank_skill` |
| **11** | `student_attempts` | `id (INTEGER AUTO)` | `student_id` $\rightarrow$ `users(id)` ON DELETE CASCADE<br>`question_id` $\rightarrow$ `question_bank(id)` ON DELETE CASCADE | — | `idx_student_attempts_std`, `idx_student_attempts_q` |
| **12** | `student_course_passports` | `id (INTEGER AUTO)` | `student_id` $\rightarrow$ `users(id)` ON DELETE CASCADE<br>`course_id` $\rightarrow$ `courses(id)` ON DELETE CASCADE | `(student_id, course_id)` | `idx_course_passports_std`, `idx_course_passports_course` |
| **13** | `system_audit_logs` | `id (INTEGER AUTO)` | `actor_user_id` $\rightarrow$ `users(id)`<br>`target_user_id` $\rightarrow$ `users(id)`<br>`course_id` $\rightarrow$ `courses(id)` | — | `idx_audit_actor`, `idx_audit_event`, `idx_audit_course` |

### 1.2. Механизм Инициализации и Миграций БД
* **Инициализация:** Файл [`database.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/db/database.ts) реализует синглтон-подключение `getDb()`. При старте сервера или вызове `initDatabase()` выполняется `schemaSql = fs.readFileSync('schema.sql')` через `database.exec()`.
* **Сброс и Сид:** Скрипт [`seed.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/db/seed.ts) вызывает `resetDatabase()` (отключает foreign keys, удаляет таблицы и накатывает чистую схему), после чего сидит 2 верифицированные организации (`NIS IB Astana` и `Ekibastuz BIL`) с нулевым количеством фейковых ботов.
* **Миграции:** Внешней системы автомиграций (например, Prisma/Knex/Umzug) нет; все изменения схемы фиксируются декларативно в `schema.sql` с `CREATE TABLE IF NOT EXISTS` и `CREATE INDEX IF NOT EXISTS`.

### 1.3. Готовность Таблиц к Изоляции Групп и Расширению
* ✅ **Готовы на 100%:** `classrooms`, `classroom_students`, `student_course_passports` (изоляция учеников по группам и предметам), `system_audit_logs`.
* ⚠️ **Требуют DDL-расширений под новый план:**
  1. `course_slots`: текущие поля (`file_name`, `file_url`, `file_size`, `summary`, `slot_number`). Для Context-Injection необходимо добавить поле `content_text TEXT` (хранение извлеченного текста ГОСО/учебника) и `is_locked INTEGER DEFAULT 0` (окно редактирования).
  2. `course_enrollments`: текущие статусы `('pending_approval', 'enrolled', 'completed', 'expelled')`. Для воронки заявок (Admission Pipeline) необходимо поле `motivation_text TEXT` и `assigned_classroom_id INTEGER REFERENCES classrooms(id)`.
  3. `topics` / `curriculum_plans`: добавить таблицу `course_curriculum_plans (course_id, classroom_id, markdown_plan, status, version)` для хранения сгенерированного Копилотом плана четверти в формате Markdown.

---

## 2. Бэкенд и API Слой (Express / TypeScript / RBAC)

### 2.1. Реестр API Эндпоинтов по Модулям

```
server/src/
├── routes/auth.routes.ts
└── modules/
    ├── teacher/teacher.routes.ts
    ├── student/student.routes.ts
    ├── tutor/tutor.routes.ts
    ├── courses/course.routes.ts
    ├── questions/question.routes.ts
    ├── calendar/calendar.routes.ts
    └── notifications/notification.routes.ts
```

| Модуль | HTTP Метод | Путь эндпоинта | Авторизация / RBAC | Назначение |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Регистрация учителя (с токеном школы) или ученика. |
| **Auth** | `POST` | `/api/auth/login` | Public | Вход по email/паролю, генерация JWT на 7 дней. |
| **Auth** | `GET` | `/api/auth/me` | JWT (`authenticate`) | Возврат активного профиля из SQLite. |
| **Teacher** | `GET` | `/api/teacher/classrooms` | Teacher | Список учебных групп учителя с подсчетом реальных учеников. |
| **Teacher** | `GET` | `/api/teacher/class-matrix` | Teacher | Честная 2D-матрица (Ученики $\times$ Микрокомпетенции) со светофором. |
| **Teacher** | `GET` | `/api/teacher/lesson-signal` | Teacher | «AI Сигнал Дня» на основе SQL `GROUP BY skill_code`. |
| **Teacher** | `POST` | `/api/teacher/copilot/generate-quiz` | Teacher | Single-Turn генератор тестов (Gemini 2.5 Flash + Zod + Fallback). |
| **Teacher** | `POST` | `/api/teacher/courses/:id/topics/:id/questions/batch` | Teacher | Транзакционное сохранение пакета задач в `question_bank`. |
| **Teacher** | `GET/POST/DELETE`| `/api/teacher/courses/:id/students/:id/notes` | Teacher | Чистый CRUD дневник заметок учителя (без NLP). |
| **Teacher** | `GET` | `/api/teacher/classrooms/:id/ai-insights` | Teacher | Аналитическая карточка рекомендаций для урока. |
| **Student** | `GET` | `/api/student/dashboard` | Student | Личный кабинет ученика, ELO, ранг, фокус дня, стрик. |
| **Student** | `GET` | `/api/student/enrolled-courses` | Student | Список активных зачислений ученика. |
| **Student** | `POST` | `/api/student/enroll-course` | Student | Зачисление на курс. |
| **Student** | `GET` | `/api/student/heatmap` | Student | 365-дневная матрица активности (GitHub-style). |
| **Student** | `GET` | `/api/student/leaderboard` | Public | Лидерборд по ELO среди реальных учеников. |
| **Student** | `POST` | `/api/student/submit-task` | Student | Фиксация ответа, обновление ELO и расчет интервального повторения. |
| **Tutor** | `POST` | `/api/tutor/socrates` | Student | Сократический наставник «Аға» (3 развилки Thought-Forks, Eureka +15 ELO). |
| **Tutor** | `GET` | `/api/tutor/initial` | Student | Стартовое сократическое приветствие при входе в тему. |
| **Courses** | `GET` | `/api/courses` | Public | Каталог курсов школы. |
| **Courses** | `GET` | `/api/courses/:id/topics` | Public | Список тем курса по четвертям. |
| **Questions** | `GET` | `/api/questions` | Public | Выборка задач из `question_bank` с фильтром по `topic_id`. |
| **Calendar** | `GET` | `/api/calendar/roadmap` | Public | Роадмап учебной четверти. |

### 2.2. Авторизация, Токены Организаций и JWT
* **Токены Школ:** Организации хранят `teacher_token` (например, `NIS-TEACHER-2026`) и `student_token` (например, `NIS-STUDENT-2026`).
  - Учитель обязан ввести валидный токен школы; регистрация без токена запрещена.
  - Ученик может ввести токен школы (привязка к организации) либо остаться независимым (`organization_id = null`).
  - Система защищена от конфликта интересов: токен учителя блокируется при попытке регистрации в роли ученика.
* **JWT:** Токены подписываются через `jsonwebtoken` с секретом `JWT_SECRET` (срок жизни 7 дней). Мидлвар [`auth.middleware.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/middleware/auth.middleware.ts) валидирует заголовок `Authorization: Bearer <token>`, извлекает пользователя и проверяет права через `requireRole('teacher' | 'student')`.

---

## 3. AI Инфраструктура и Промпты (Gemini API / Zod / Fallback)

### 3.1. Модели, SDK и Транспорт
* **Транспорт:** Для исключения лишних абстракций и тяжелых зависимостей (типа LangChain/LlamaIndex) сервер использует **прямые асинхронные HTTP/REST-вызовы** через нативный `fetch` к Google Gemini API:
  `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`.
* **Модель:** По умолчанию везде зафиксирована **`gemini-2.5-flash`** (с поддержкой переопределения через `process.env.GEMINI_MODEL`).
* **Конфигурация ключей:** Сервисы динамически запрашивают ключ через `process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY`.

### 3.2. Архитектура AI Сервисов и Zod Валидация
1. **[`socratic.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/socratic.service.ts) (Наставник «Аға»):**
   - Промпт требует чистый литературный казахский язык (без машинных калек) и строгий JSON с 1 наводящей строкой и ровно 3 развилками мысли (`true_step`, `cognitive_trap`, `basic_rule`).
   - Ответ валидируется через `SocraticResponseSchema` из [`schemas.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/schemas.ts).
2. **[`copilot.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/copilot.service.ts) (Teacher Co-Pilot):**
   - Генерирует структурированные задачи с KaTeX-формулами, вариантами ответов и кодами микрокомпетенций (`skill_code`).
   - Валидируется через `CoPilotQuestionGenSchema`.
3. **[`fallback-engine.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/fallback-engine.ts) (Zero-Crash Fallback):**
   - Содержит детерминированные калиброванные ответы на казахском, русском и английском языках.
   - Если API Gemini возвращает ошибку 429 (Rate Limit), 403 (Invalid Key), сетевой таймаут или Zod Schema Validation Error — сервис мгновенно возвращает валидный fallback, **гарантируя 0 падений сервера**.

### 3.3. Системные Промпты и Anti-Prompt Injection
* В [`prompts.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/prompts.ts) и [`gemini.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/gemini.ts) встроены жесткие системные правила:
  - *«Никогда не выдавать готовый ответ ученику»*.
  - Встроенный фильтр попыток джейлбрейка: при фразах типа *"дай ответ"*, *"жауабын айт"*, *"tell me the answer"* активируется ветка `is_jailbreak: true` со штрафом к ELO и напоминанием о ценности самостоятельного мышления.

---

## 4. Фронтенд, Компоненты и UI-Состояние (React / Tailwind / KaTeX)

### 4.1. Архитектура и Структура Экранов
Фронтенд построен на **React 18 + Vite 5 + TypeScript 5.6 + Tailwind CSS 3.4**. Навигация реализована по **Portal/Tab-based архитектуре** без `react-router-dom`, что предотвращает рассинхронизацию стейта.

#### Экраны Учителя (`TeacherPortal.tsx`):
1. **[`TeacherDashboard.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TeacherDashboard.tsx):** Селектор реальных классов, панель «AI Сигнал Дня», 2D-матрица успеваемости.
2. **[`MasteryMatrix.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/gradebook/MasteryMatrix.tsx):** Таблица с честной светофорной индикацией (🟢 $\ge 80\%$, 🟡 $50\dots 79\%$, 🔴 $< 50\%$, ⚪ нет данных) и Zero-Fake Empty State.
3. **[`DailySignalBanner.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/gradebook/DailySignalBanner.tsx):** Баннер дефицита класса с кнопкой перехода в полноэкранный режим `F11`.
4. **[`CourseBuilderScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseBuilderScreen.tsx):** Студия Single-Turn Micro Co-Pilot с KaTeX-предпросмотром и транзакционным сохранением в базу.
5. **[`TeacherCalendarScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TeacherCalendarScreen.tsx):** Календарный роадмап четверти.

#### Экраны Ученика (`StudentPortal.tsx`):
1. **[`StudentHomeScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentHomeScreen.tsx):** Дашборд, карточка «Фокус дня», стрик активности, переход в тренажер.
2. **[`CourseCatalogScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseCatalogScreen.tsx):** Каталог доступных курсов школы.
3. **[`TaskTrainerScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TaskTrainerScreen.tsx):** 3-блочный экран тренажера:
   - *Блок 1 (Шторка):* Профиль, ELO, ранг, стрик, вызов Сократа «Аға» с развилками [`ThoughtForkTriad.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/socratic-tutor/ThoughtForkTriad.tsx).
   - *Блок 2 (Холст):* Условие с KaTeX и нативным SVG-примитивом «Сан түзуі» [`NumberLinePrimitive.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/NumberLinePrimitive.tsx).
   - *Блок 3 (Ответы):* Режим А (автоскролл вариантов) и Режим Б (развернутое решение до 4000 символов + фото тетради).
4. **[`StudentProfileScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentProfileScreen.tsx):** Master-профиль, статистика, 365-дневный Heatmap.
5. **[`RoadmapScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/RoadmapScreen.tsx):** Интерактивная карта тем четверти.

### 4.2. Рендеринг KaTeX и Математических Примитивов
* Рендеринг формул реализован в компоненте [`MathText.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/MathText.tsx) через `katex.renderToString()`. Поддерживаются как строчные (`$...$`), так и блочные (`$$...$$`) формулы.
* Полный отказ от сторонних тяжелых библиотек (типа Desmos): все геометрические и числовые графики рендерятся на нативном SVG (`NumberLinePrimitive.tsx`).

### 4.3. Управление Состоянием и Сетевой Слой
* **Сетевой клиент:** Единый инстанс Axios в [`client.ts`](file:///d:/future-minds-mvp/zerde-app/client/src/api/client.ts) с перехватчиками `Authorization: Bearer <token>` и обработкой 401 событий (`zerde:unauthorized`).
* **Контексты:**
  - `AuthContext`: управление сессией, сохранение токена в `localStorage`, проверка `/api/auth/me`.
  - `LanguageContext`: мультиязычность (`KZ`, `RU`, `EN`) с мгновенным переключением.
  - `ThemeContext`: переключение темы (Dark/Light).

---

## 5. Точки Риска и Архитектурные Узкие Места (Risk Assessment)

### ⚠️ Риск 1: Обновление JSON-паспортов учеников при пакетной обработке
* **Суть риска:** В таблице `student_course_passports` поле `skills_progress_json` хранится в виде сериализованной JSON-строки. При одновременном обновлении логов нескольких учеников возможна перезапись данных без сохранения предыдущих дефицитов.
* **Решение:** Выполнять десериализацию, мердж новых оценок и запись строго внутри SQLite-транзакции `db.transaction(() => { ... })`.

### ⚠️ Риск 2: Утечка контекста между изолированными группами (Classroom Sandbox)
* **Суть риска:** В текущей схеме `course_slots` (5 слотов материалов) привязаны к `course_id`, а не к `classroom_id`. Если у учителя две разные группы (`9 «А»` базовый и `Олимпиадники` продвинутый), загруженные материалы курса могут смешиваться.
* **Решение:** Либо создавать отдельные курсы под каждую специфику программы, либо добавить `classroom_id INTEGER NULL` в `course_slots` и `curriculum_plans`, чтобы позволить группе иметь кастомный оверрайд материалов.

### ⚠️ Риск 3: Мультимодальная отправка фотографий для Типа Б
* **Суть риска:** Загрузка до 10 фотографий высокого разрешения в Base64 может приводить к превышению лимита `express.json({ limit: '50mb' })` и таймаутам запросов.
* **Решение:** Ограничить размер загружаемых фото на клиенте (сжатие на canvas до $\le 1200\text{px}$) и передавать в Gemini только оптимизированные JPEG, либо фокусироваться на текстовом решении с мгновенной проверкой через Silent Grader.

### ⚠️ Риск 4: Анализ зависимостей (Dependencies Status)
* **Проверка пакетов:** Все критические зависимости (`better-sqlite3`, `express`, `jsonwebtoken`, `bcryptjs`, `zod`, `katex`, `canvas-confetti`, `lucide-react`) установлены и согласованы по типам TypeScript.
* **Статус сборки:**
  - `server`: `npm run typecheck` $\rightarrow$ **0 ошибок**.
  - `client`: `npm run build` $\rightarrow$ **0 ошибок (Vite бандлинг успешен)**.

---

## 🏁 Итоговое Заключение Аудита

Кодовая база **Zerde** находится в **чистом, высокостабильном и проверенном состоянии**. 
Архитектура готова к поэтапному внедрению расширенного AI-функционала (5 слотов Context-Injection, генерация Markdown-плана четверти, воронка заявок с мотивацией и 3 режима ментора «Аға») без риска регрессии или поломки существующей логики.
