# 📚 Реестр Файловой Архитектуры Zerde 2.0 (`PROJECT_FILE_REGISTRY.md`)

> **Версия:** 2.0 (Pure Zero-Fake Architecture)  
> **Статус:** 100% Real-Data SQLite & Google Gemini Multimodal  
> **Дата инвентаризации:** 2026-08-24  

---

## 📑 Оглавление

1. [Server — Database & Schemas (`server/src/db/`)](#1-server--database--schemas-serversrcdb)
2. [Server — AI Layer (`server/src/ai/`)](#2-server--ai-layer-serversrcai)
3. [Server — Modules & Routes (`server/src/modules/`, `server/src/routes/`)](#3-server--modules--routes-serversrcmodules-serversrcroutes)
4. [Server — Middleware & Core (`server/src/middleware/`, `server/src/server.ts`, `server/src/types/`)](#4-server--middleware--core-serversrcmiddleware-serversrcserverts-serversrctypes)
5. [Server — Test Suites (`server/src/__tests__/`)](#5-server--test-suites-serversrc__tests__)
6. [Client — Screens & Portals (`client/src/screens/`)](#6-client--screens--portals-clientsrcscreens)
7. [Client — Components & Features (`client/src/components/`, `client/src/features/`)](#7-client--components--features-clientsrccomponents-clientsrcfeatures)
8. [Client — State, API & Context (`client/src/api/`, `client/src/context/`, `client/src/i18n/`, `client/src/lib/`)](#8-client--state-api--context-clientsrcapi-clientsrccontext-clientsrci18n)
9. [Shared Core Package (`shared/`)](#9-shared-core-package-shared)
10. [Root & Configurations](#10-root--configurations)

---

## 1. Server — Database & Schemas (`server/src/db/`)

| Файл | Зона ответственности | Ключевые экспорты / Структуры | Связанные таблицы БД / Зависимости |
| :--- | :--- | :--- | :--- |
| [`server/src/db/schema.sql`](file:///d:/future-minds-mvp/zerde-app/server/src/db/schema.sql) | DDL-схема базы данных SQLite с 14 таблицами, внешними ключами и индексами. | Таблицы `organizations`, `users`, `classrooms`, `courses`, `course_material_slots`, `course_curriculum_plans`, `course_enrollments`, `topics`, `question_bank`, `student_attempts`, `student_course_passports`, `system_audit_logs`. | SQLite 3 |
| [`server/src/db/database.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/db/database.ts) | Менеджер подключения SQLite (`better-sqlite3`) и набор атомарных транзакций для паспорта курса. | `getDb()`, `closeDb()`, `initDb()`, `initStudentPassport()`, `recordSkillAttempt()`, `incrementEloAtomic()`, `mergeSkillProgress()`, `saveTeacherNotes()`. | `better-sqlite3`, `student_course_passports`, `system_audit_logs` |
| [`server/src/db/seed.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/db/seed.ts) | Первичная инициализация базы данных: 2 школы (NIS IB Astana, Ekibastuz BIL), базовые курсы, слоты материалов и банк задач. | `seed()`. | `organizations`, `users`, `courses`, `course_material_slots`, `topics`, `question_bank` |

---

## 2. Server — AI Layer (`server/src/ai/`)

| Файл | Зона ответственности | Ключевые экспорты / Структуры | Внешние зависимости / LLM |
| :--- | :--- | :--- | :--- |
| [`server/src/ai/schemas.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/schemas.ts) | Строгие Zod-контракты валидации для всех AI-агентов (CoPilot, Socratic Aga, SilentGrader, Navigator). | `SocraticResponseSchema`, `CoPilotQuestionGenSchema`, `SilentGraderResponseSchema`, `NavigatorAdviceSchema`, `CoPilotAgentResponseSchema`. | `zod` |
| [`server/src/ai/socratic.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/socratic.service.ts) | Сократический диалоговый сервис «Аға»: формирует 3 развилки мысли (Thought-Forks) на чистом литературном KZ/RU. | `SocraticService`, `socraticService`. | `gemini-2.5-flash`, `SocraticResponseSchema` |
| [`server/src/ai/copilot.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/copilot.service.ts) | Копилот учителя: генерация тестов по ГОСО и расчет аналитических инсайтов по дефицитам класса. | `CoPilotService`, `copilotService`. | `gemini-2.5-flash`, `CoPilotQuestionGenSchema` |
| [`server/src/ai/gemini.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/gemini.ts) | Базовый клиент Gemini API: генерация приветствий, защита от джейлбрейков (Anti-Jailbreak) и штрафы ELO. | `GeminiClient`, `geminiClient`. | `gemini-2.5-flash` |
| [`server/src/ai/prompts.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/prompts.ts) | Системные мета-промпты для Сократа «Аға» и Учительского Копилота. | `SOCRATIC_AGA_SYSTEM_PROMPT`, `TEACHER_COPILOT_SYSTEM_PROMPT`. | Текстовые шаблоны |

---

## 3. Server — Modules & Routes (`server/src/modules/`, `server/src/routes/`)

| Файл | Зона ответственности | Ключевые экспорты / Эндпоинты | Связанные сущности |
| :--- | :--- | :--- | :--- |
| [`server/src/modules/teacher/teacher.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.repository.ts) | Репозиторий учителя: динамическая выборка микрокомпетенций курса и 2D-матрицы успеваемости. | `TeacherRepository`, `teacherRepository`, `getSkillsHeaderForCourse()`, `getClassMatrix()`, `getClassrooms()`. | `question_bank`, `topics`, `courses`, `student_course_passports` |
| [`server/src/modules/teacher/teacher.controller.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.controller.ts) | HTTP-контроллер учителя: генерация тестов, пакетное сохранение задач, заметки об учениках. | `TeacherController`, `teacherController`, `generateQuiz`, `batchSaveQuestions`, `getClassAiInsights`, `addStudentNote`. | `copilotService`, `student_course_passports` |
| [`server/src/modules/teacher/teacher.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.routes.ts) | Маршруты учителя: AI-генерация, 2D-матрица успеваемости, сигнал дня, заметки. | `POST /api/teacher/copilot/generate-quiz`, `GET /api/teacher/class-matrix`, `GET /api/teacher/lesson-signal`, `POST /api/teacher/courses/:id/students/:id/notes`. | `auth.middleware` (`requireRole('teacher')`) |
| [`server/src/modules/student/student.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.repository.ts) | Репозиторий ученика: поиск студента, расчет лидерборда, обновление ELO в паспорте курса. | `StudentRepository`, `studentRepository`, `findByIdOrEmail()`, `getLeaderboard()`, `updateEloAndStreak()`. | `users`, `student_course_passports`, `student_heatmap` |
| [`server/src/modules/student/student.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.routes.ts) | Маршруты ученика: дашборд, курсы, запись на курс, отправка решения задачи, телеметрия. | `GET /api/student/dashboard`, `GET /api/student/enrolled-courses`, `POST /api/student/enroll-course`, `POST /api/student/submit-task`. | `auth.middleware`, `studentRepository` |
| [`server/src/modules/tutor/tutor.controller.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/tutor/tutor.controller.ts) | Контроллер диалога с Сократом: обработка ответов ученика, кликов по развилкам и Eureka (+15 ELO). | `TutorController`, `tutorController`, `handleSocraticSession`. | `socraticService`, `system_audit_logs` |
| [`server/src/modules/tutor/tutor.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/tutor/tutor.routes.ts) | Маршруты репетитора: инициализация темы и отправка хода в сократический диалог. | `POST /api/tutor/socrates`, `GET /api/tutor/initial`. | `tutorController`, `socraticService` |
| [`server/src/modules/courses/course.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/courses/course.routes.ts) | Маршруты каталога курсов и тем. | `GET /api/courses`, `GET /api/courses/:id/topics`. | `courses`, `topics` |
| [`server/src/modules/questions/question.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/questions/question.routes.ts) | Маршруты чтения банка тестовых вопросов. | `GET /api/questions/:id`, `GET /api/questions/by-topic/:topicId`. | `question_bank` |
| [`server/src/modules/calendar/calendar.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/calendar/calendar.routes.ts) | Маршруты расписания и календарных событий. | `GET /api/calendar/events`. | Календарные события |
| [`server/src/modules/notifications/notification.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/notifications/notification.routes.ts) | Маршруты уведомлений и статуса стрика (Streak Saver). | `GET /api/notifications`, `GET /api/notifications/streak-status`. | `users`, уведомления |
| [`server/src/routes/auth.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/routes/auth.routes.ts) | Маршруты авторизации: вход по школьному токену/паролю и чтение профиля. | `POST /api/auth/login`, `GET /api/auth/me`. | `users`, `organizations`, `jsonwebtoken` |

---

## 4. Server — Middleware & Core (`server/src/middleware/`, `server/src/server.ts`, `server/src/types/`)

| Файл | Зона ответственности | Ключевые экспорты / Описание |
| :--- | :--- | :--- |
| [`server/src/middleware/auth.middleware.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/middleware/auth.middleware.ts) | JWT аутентификация и проверка ролей пользователя (`student`, `teacher`, `admin`). | `authenticate`, `requireRole`, `AuthRequest`. |
| [`server/src/middleware/error.middleware.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/middleware/error.middleware.ts) | Глобальный обработчик ошибок Express и форматирование Zod-ошибок. | `errorHandler`. |
| [`server/src/server.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/server.ts) | Главная точка входа бэкенда: подключение middlewares, монтирование API роутов и запуск HTTP сервера. | `app`, запуск `listen(PORT)`. |
| [`server/src/types/database.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/types/database.ts) | TypeScript-типы, маппящиеся на таблицы SQLite. | `UserRow`, `CourseRow`, `StudentPassportRow` и др. |
| [`server/src/types/index.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/types/index.ts) | Общие типы сервера и HTTP-ответов. | `ApiResponse<T>`, `JwtPayload`. |

---

## 5. Server — Test Suites (`server/src/__tests__/`)

| Файл | Зона ответственности | Ключевой проверяемый функционал |
| :--- | :--- | :--- |
| [`server/src/__tests__/phase1_agentic_verification.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/phase1_agentic_verification.ts) | Верификация Фазы 1: проверка 14 DDL таблиц, колонок, транзакций и Zod-контрактов. | 29 assertions: DDL, Schema, Transactions, Zod. |
| [`server/src/__tests__/phase1_verification.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/phase1_verification.ts) | Базовая проверка таблиц и внешних ключей SQLite. | DDL Integrity. |
| [`server/src/__tests__/phase2_3_verification.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/phase2_3_verification.ts) | Проверка генерации тестов Копилотом и CRUD заметок учителя. | CoPilot & Diary Notes. |
| [`server/src/__tests__/phase4_5_verification.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/phase4_5_verification.ts) | Проверка честной обработки ошибок Сократа и регистрации Eureka Moment (+15 ELO). | Socratic Service & Eureka Moment. |
| [`server/src/__tests__/phase6_verification.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/phase6_verification.ts) | Проверка динамической 2D-матрицы успеваемости и сигнала дня. | 2D Mastery Matrix. |
| [`server/src/__tests__/test-ai.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-ai.ts) | Интеграционный тест вызова Google Gemini API. | Gemini connectivity. |
| [`server/src/__tests__/test-api.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-api.ts) | Сквозной интеграционный тест всех REST эндпоинтов сервера. | Full API Coverage. |
| [`server/src/__tests__/test-e2e.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-e2e.ts) | Эмуляция полного пользовательского сценария (вход $\rightarrow$ решение $\rightarrow$ ELO). | E2E Scenario. |
| [`server/src/__tests__/test-i18n-coverage.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-i18n-coverage.ts) | Проверка полноты переводов на 3 языка (KZ, RU, EN). | i18n Dictionary Parity. |
| [`server/src/__tests__/test-math-engine.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-math-engine.ts) | Тестирование рендеринга математических формул и KaTeX. | Math Engine & LaTeX. |
| [`server/src/__tests__/test-socratic-smartmix.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-socratic-smartmix.ts) | Тестирование адаптивного распределения сложности вопросов Сократа. | Pedagogical SmartMix. |
| [`server/src/__tests__/test-teacher-slots.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/__tests__/test-teacher-slots.ts) | Проверка загрузки и блокировки 5 слотов учебных материалов. | 5 Material Slots. |

---

## 6. Client — Screens & Portals (`client/src/screens/`)

| Файл | Зона ответственности | Ключевые компоненты / Логика |
| :--- | :--- | :--- |
| [`client/src/screens/AuthScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/AuthScreen.tsx) | Экран авторизации: выбор школы (NIS IB / Ekibastuz BIL), ввод токена или быстрый вход по демо-профилям. | `AuthScreen`. |
| [`client/src/screens/StudentPortal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentPortal.tsx) | Каркас ученика: верхний Header, нижняя навигация `BottomNav` и роутер вкладок. | `StudentPortal`. |
| [`client/src/screens/StudentHomeScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentHomeScreen.tsx) | Главный дашборд ученика: текущий ELO-ранг, стрик, фокус-тема дня и карточки курсов. | `StudentHomeScreen`. |
| [`client/src/screens/StudentProfileScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentProfileScreen.tsx) | Профиль ученика: тепловая карта активности (Heatmap), достижения и контактные данные. | `StudentProfileScreen`. |
| [`client/src/screens/TaskTrainerScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TaskTrainerScreen.tsx) | Интерактивный тренажер задач: рендеринг KaTeX, выбор вариантов, честное состояние ошибки с кнопкой повтора. | `TaskTrainerScreen`. |
| [`client/src/screens/RoadmapScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/RoadmapScreen.tsx) | Интерактивная карта знаний (Skill Tree / Roadmap) по предметам. | `RoadmapScreen`. |
| [`client/src/screens/CourseCatalogScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseCatalogScreen.tsx) | Каталог доступных курсов с возможностью подачи заявки на зачисление. | `CourseCatalogScreen`. |
| [`client/src/screens/TeacherPortal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TeacherPortal.tsx) | Главный каркас кабинета учителя с боковой панелью и переключателем разделов. | `TeacherPortal`. |
| [`client/src/screens/TeacherDashboard.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TeacherDashboard.tsx) | Панель управления учителя: 2D-матрица успеваемости, сигнал дня от AI и журнал заметок. | `TeacherDashboard`. |
| [`client/src/screens/CourseBuilderScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseBuilderScreen.tsx) | Конструктор курса: управление 5 слотами материалов, AI-генератор тестов и сохранение в базу. | `CourseBuilderScreen`. |
| [`client/src/screens/TeacherCalendarScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TeacherCalendarScreen.tsx) | Календарно-тематическое планирование (КТП) и расписание уроков учителя. | `TeacherCalendarScreen`. |
| [`client/src/screens/SmartboardScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/SmartboardScreen.tsx) | Режим интерактивной школьной доски (Smartboard) для демонстрации задач классу. | `SmartboardScreen`. |

---

## 7. Client — Components & Features (`client/src/components/`, `client/src/features/`)

### А. UI Primitives (`client/src/components/ui/`)
- [`badge.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/badge.tsx): Бейджи статусов и рангов.
- [`button.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/button.tsx): Кнопки различных вариантов и размеров.
- [`card.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/card.tsx): Базовый контейнер карточки.
- [`dialog.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/dialog.tsx): Модальные диалоговые окна (Radix UI).
- [`dropdown-menu.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/dropdown-menu.tsx): Выпадающие меню.
- [`input.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/input.tsx): Поля текстового ввода.
- [`tabs.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/tabs.tsx): Вкладки переключения контента.
- [`toast.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/toast.tsx): Всплывающие уведомления.
- [`MathText.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/MathText.tsx): Рендерер KaTeX формул в тексте.
- [`NumberLinePrimitive.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/ui/NumberLinePrimitive.tsx): SVG-компонент числовой прямой для интервалов.

### Б. Student & Trainer Components (`client/src/components/student/`, `client/src/components/trainer/`)
- [`ActivityHeatmap.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/ActivityHeatmap.tsx): 365-дневная сетка учебной активности (GitHub-style).
- [`ClassLeaderboardCard.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/ClassLeaderboardCard.tsx): Таблица лидеров по ELO рейтингу.
- [`StudentPassportCard.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/StudentPassportCard.tsx): Цифровой паспорт ученика с радар-чартом навыков.
- [`TestPracticeModal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/TestPracticeModal.tsx): Модалка быстрого тестирования без искусственного раздувания вариантов.
- [`WeekdayStudyCarousel.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/WeekdayStudyCarousel.tsx): Карусель учебных дней недели.
- [`NotebookUploader.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/trainer/NotebookUploader.tsx): Загрузчик фото рукописных тетрадей для OCR.
- [`OptionGrid.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/trainer/OptionGrid.tsx): Сетка вариантов ответов задачи.

### В. ZVDSL Visual Renderers (`client/src/components/zvdsl/`)
- [`ZvdslRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/ZvdslRenderer.tsx): Главный роутер визуальных предметных DSL.
- [`NumberLineRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/NumberLineRenderer.tsx): Числовые интервалы.
- [`ForcesRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/ForcesRenderer.tsx): Векторы сил в физике.
- [`CircuitRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/CircuitRenderer.tsx): Электрические цепи.
- [`ChemistryRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/ChemistryRenderer.tsx): Химические уравнения.
- [`OrbitalsRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/OrbitalsRenderer.tsx): Электронные орбитали.
- [`SyntaxRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/SyntaxRenderer.tsx): Синтаксический разбор предложений.
- [`MorphemeRenderer.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/zvdsl/MorphemeRenderer.tsx): Морфемный разбор слов.

### Г. Features & Gradebook (`client/src/features/`)
- [`MasteryMatrix.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/gradebook/MasteryMatrix.tsx): 2D-матрица владения навыками класса.
- [`DailySignalBanner.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/gradebook/DailySignalBanner.tsx): Баннер рекомендации AI по дефициту дня.
- [`StudentSkillModal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/gradebook/StudentSkillModal.tsx): Детальная карточка навыка ученика.
- [`CalendarRoadmap.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/roadmap/CalendarRoadmap.tsx): Календарный вид дорожной карты.
- [`SmartboardView.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/features/smartboard/SmartboardView.tsx): Компонент доски для класса.

---

## 8. Client — State, API & Context (`client/src/api/`, `client/src/context/`, `client/src/i18n/`)

| Файл | Зона ответственности | Ключевые экспорты / Описание |
| :--- | :--- | :--- |
| [`client/src/api/client.ts`](file:///d:/future-minds-mvp/zerde-app/client/src/api/client.ts) | Конфигурация Axios: базовый URL `/api` и автоматическая подстановка JWT Bearer токена. | `apiClient`. |
| [`client/src/context/AuthContext.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/context/AuthContext.tsx) | Контекст авторизации: хранение токена, данных пользователя, роли и функций входа/выхода. | `AuthContext`, `AuthProvider`, `useAuth`. |
| [`client/src/context/LanguageContext.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/context/LanguageContext.tsx) | Контекст интернационализации: переключение языков KZ, RU, EN и сохранение в LocalStorage. | `LanguageContext`, `LanguageProvider`, `useLanguage`. |
| [`client/src/context/ThemeContext.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/context/ThemeContext.tsx) | Контекст темы оформления (Light/Dark mode). | `ThemeContext`, `ThemeProvider`, `useTheme`. |
| [`client/src/i18n/kz.ts`](file:///d:/future-minds-mvp/zerde-app/client/src/i18n/kz.ts) | Словарь переводов на казахский язык. | `kzTranslations`. |
| [`client/src/i18n/ru.ts`](file:///d:/future-minds-mvp/zerde-app/client/src/i18n/ru.ts) | Словарь переводов на русский язык. | `ruTranslations`. |
| [`client/src/i18n/en.ts`](file:///d:/future-minds-mvp/zerde-app/client/src/i18n/en.ts) | Словарь переводов на английский язык. | `enTranslations`. |
| [`client/src/lib/utils.ts`](file:///d:/future-minds-mvp/zerde-app/client/src/lib/utils.ts) | Утилита объединения CSS классов через `clsx` и `twMerge`. | `cn()`. |
| [`client/src/App.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/App.tsx) | Корневой React-компонент с маршрутизацией по ролям (`StudentPortal` / `TeacherPortal`). | `App`. |
| [`client/src/main.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/main.tsx) | Точка входа Vite React приложения. | DOM Mount. |

---

## 9. Shared Core Package (`shared/`)

| Файл | Зона ответственности | Ключевые экспорты / Описание |
| :--- | :--- | :--- |
| [`shared/src/algorithms/elo.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/algorithms/elo.ts) | Математический движок ELO: расчет дельты рейтинга, коэффициенты сложности и грейды рангов (400–2400). | `calculateEloDelta()`, `getRankByElo()`, `RANKS`. |
| [`shared/src/algorithms/dina.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/algorithms/dina.ts) | Психометрическая модель DINA (Deterministic Inputs, Noisy "And" gate) для оценки вероятности владения навыком. | `estimateSkillMasteryDina()`. |
| [`shared/src/algorithms/sm2.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/algorithms/sm2.ts) | Алгоритм интервальных повторений SuperMemo SM-2. | `calculateSm2Interval()`. |
| [`shared/src/schemas/ai.schema.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/schemas/ai.schema.ts) | Общие Zod-схемы ответов AI-агентов. | `SocraticResponseSchema` и др. |
| [`shared/src/schemas/student.schema.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/schemas/student.schema.ts) | Схемы данных ученика и ответов на задачи. | `TaskSubmissionSchema`. |
| [`shared/src/schemas/teacher.schema.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/schemas/teacher.schema.ts) | Схемы данных учителя и матрицы класса. | `ClassMatrixSchema`. |
| [`shared/src/index.ts`](file:///d:/future-minds-mvp/zerde-app/shared/src/index.ts) | Главный barrel-экспорт пакета `@zerde/shared`. | Экспорт всех алгоритмов и схем. |

---

## 10. Root & Configurations

| Файл | Назначение |
| :--- | :--- |
| [`ULTRA_CREATION.md`](file:///d:/future-minds-mvp/zerde-app/ULTRA_CREATION.md) | Генеральный мастер-план архитектуры Zerde 2.0 (6 изолированных фаз реализации). |
| [`ULTRA_CREATION_SOS.md`](file:///d:/future-minds-mvp/zerde-app/ULTRA_CREATION_SOS.md) | План экстренной зачистки проекта от заглушек и моков (SOS-1, SOS-2, SOS-3). |
| [`CODEBASE_AUDIT_REPORT.md`](file:///d:/future-minds-mvp/zerde-app/CODEBASE_AUDIT_REPORT.md) | Исчерпывающий аудит кодовой базы по 5 направлениям до начала разработки. |
| [`FALLBACK_AUDIT_REPORT.md`](file:///d:/future-minds-mvp/zerde-app/FALLBACK_AUDIT_REPORT.md) | Аналитический отчет сопоставления всех заглушек перед чисткой. |
| [`FP_KNOW.md`](file:///d:/future-minds-mvp/zerde-app/FP_KNOW.md) & [`README.md`](file:///d:/future-minds-mvp/zerde-app/README.md) | База знаний проекта и руководство по запуску серверов и тестированию. |
| [`package.json`](file:///d:/future-minds-mvp/zerde-app/package.json) | Корневой манипулятор скриптов запуска, сборки и тестирования всего монорепозитория. |
