# 🌟 Zerde (Зерде) — Интеллектуалды Білім Беру Платформасы (Production-Ready SaaS)

> **Zerde** — инновационная национальная образовательная платформа для 7–11 классов (Казахстан, трек Social Impact), созданная для преодоления образовательного разрыва между городскими и сельскими школами. Платформа сочетает доказательную когнитивную диагностику (CDM DINA), Сократического ИИ-наставника «Аға» с развилками мысли (*Thought-Forks*), визуальный движок микро-схем **ZVDSL+**, интерактивный калькулятор **Desmos**, систему удержания в стиле Duolingo и 1-Click экспорт дескрипторов в **Kundelik.kz**.

---

## 📑 Содержание

1. [Быстрый запуск](#-быстрый-запуск-на-ноутбуке)
2. [Демо-учетные записи](#-демо-учетные-записи)
3. [Архитектура монорепозитория](#-архитектура-монорепозитория)
4. [Ключевые модули и технологии](#-ключевые-модули-и-технологии)
5. [База данных и Схема](#-база-данных-sqlite)
6. [ИИ-Ядро и 5 Системных Промптов](#-ии-ядро-и-5-системных-промптов)
7. [Когнитивная диагностика (CDM DINA) и ELO](#-когнитивная-диагностика-cdm-dina-и-elo)
8. [Визуальный движок ZVDSL+ и Desmos](#-визуальный-движок-zvdsl-и-desmos)
9. [Локализация и Триязычие (KZ / RU / EN)](#-локализация-и-триязычие)
10. [База знаний для разработчиков и агентов (FP_KNOW)](#-база-знаний-fp_know)
11. [Тестирование и верификация](#-тестирование)

---

## ⚡ Быстрый запуск на ноутбуке

### Предварительные требования:
* **Node.js**: v18.0.0 или новее
* **npm**: v9.0.0 или новее

### Запуск одной командой:
```bash
# 1. Перейти в папку проекта
cd d:/future-minds-mvp/zerde-app

# 2. Установить зависимости (если не установлены)
npm run install:all

# 3. Запустить и бэкенд, и фронтенд параллельно
npm run dev
```

После запуска откройте в браузере:
* 💻 **Клиентское веб-приложение (Frontend):** [http://localhost:3000](http://localhost:3000)
* ⚙️ **Серверный REST API (Backend):** [http://localhost:5000](http://localhost:5000)
* 🩺 **Health Check API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Демо-учетные записи

Для мгновенного входа на экране авторизации доступны кнопки **1-Click Demo Login**:

| Роль | ФИО / Персона | Email | Пароль | Описание профиля |
| :--- | :--- | :--- | :--- | :--- |
| **Оқушы (Ученик)** | Азамат Темірханов | `azamat@zerde.kz` | `password123` | 🦅 **Қыран** (`1420 ELO`), стрик 🔥 **12 дней**, 9 «А» сыныбы |
| **Мұғалім (Учитель)** | Гульнара Сериковна Алимжанова | `teacher@zerde.kz` | `password123` | Учитель 9 «А» (24 ученика), 3 курса, куратор |
| **Әкімші (Админ)** | Бас Әкімші | `admin@zerde.kz` | `password123` | Полный доступ ко всем модулям платформы |

---

## 🏗️ Архитектура монорепозитория

```
d:/future-minds-mvp/zerde-app/
├── package.json                     # Корневой скрипт запуска (concurrently)
├── README.md                        # Главная документация проекта
├── FP_KNOW.md                       # Главный индекс базы знаний для AI-агентов
├── fp_know/                         # Исчерпывающая инженерная база знаний
│   ├── 01_architecture_overview.md # Архитектура, потоки данных, стейт
│   ├── 02_database_and_models.md   # DDL схема SQLite, связи, 14 таблиц
│   ├── 03_ai_engine_and_prompts.md # 5 системных промптов, Thought-Forks, Anti-Jailbreak
│   ├── 04_cdm_elo_and_math.md      # DINA модель, Q-Matrix, ELO 4 рангов, SM-2
│   ├── 05_zvdsl_and_canvas_spec.md # Спецификация ZVDSL+ схем и Desmos
│   ├── 06_i18n_and_localization.md # Триязычие KZ/RU/EN, правила терминов
│   ├── 07_portals_and_screens.md   # Разбор всех экранов ученика и учителя
│   └── 08_agent_contribution_guide.md # Регламент доработки для будущих агентов
│
├── server/                          # Бэкенд на Node.js + Express + TypeScript + SQLite
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts          # Обертка Better-SQLite3 с авто-миграциями
│   │   │   ├── schema.sql           # DDL схема 14 таблиц
│   │   │   ├── seed.ts              # Сид 24 учеников, 3 курсов, 16 задач
│   │   │   └── store.ts             # Интеллектуальное хранилище данных
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT верификация и RBAC role guard
│   │   │   └── error.middleware.ts  # Унифицированная обработка ошибок
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Регистрация, логин, профиль
│   │   │   ├── course.routes.ts     # CRUD курсов, заявки, темы
│   │   │   ├── student.routes.ts    # Дашборд, стрик, ELO, темы четверти
│   │   │   ├── teacher.routes.ts    # Журнал 24x16, сигналы, Kundelik экспорт
│   │   │   ├── ai.routes.ts         # Сократический диалог, парсер PDF, генератор тестов
│   │   │   ├── analytics.routes.ts  # CDM DINA матрица, SM-2 карточки
│   │   │   ├── notifications.routes.ts # Duolingo триггеры, дайджест
│   │   │   └── tts.routes.ts        # Edge Neural TTS синтез речи
│   │   ├── services/
│   │   │   ├── ai-orchestrator.ts   # Маршрутизация 5 системных промптов (Gemini/Fallback)
│   │   │   ├── cdm-qmatrix.ts       # Математическая DINA модель (0 токенов)
│   │   │   ├── elo-engine.ts        # Расчет 4 рангов ELO и дельт
│   │   │   ├── spaced-repetition.ts # SuperMemo-2 интервалы
│   │   │   ├── question-cache.ts    # Умный кэш банка вопросов
│   │   │   ├── retention.service.ts # Duolingo push/email генератор
│   │   │   └── tts-service.ts       # Microsoft Edge Neural голоса
│   │   ├── types/index.ts           # Серверные TypeScript типы
│   │   └── server.ts                # Express сервер (порт 5000)
│   └── package.json
│
└── client/                          # Фронтенд на React 18 + Vite + Tailwind + shadcn/ui
    ├── src/
    │   ├── api/                     # Typed API клиент
    │   ├── components/
    │   │   ├── ui/                  # shadcn/ui компоненты
    │   │   ├── canvas/              # Active Canvas Inspector + Desmos координатная плоскость
    │   │   ├── zvdsl/               # Рендереры микро-схем ZVDSL+ (Registry Pattern)
    │   │   ├── student/             # Виджеты ученика (Heatmap, Pinned Card, Issues List)
    │   │   ├── teacher/             # Виджеты учителя (24x16 матрица, AI Studio, Смарт-доска F11)
    │   │   ├── notifications/       # Центр уведомлений, StreakSaverModal, Toast
    │   │   ├── trainer/             # OptionGrid (Режим А), NotebookUploader (Режим Б)
    │   │   └── common/              # Header, BottomNav, CommandPalette, AudioPlayerButton
    │   ├── context/
    │   │   ├── AuthContext.tsx      # Сессия, роли, демо-вход
    │   │   ├── LanguageContext.tsx  # Триязычный словарь i18n (KZ/RU/EN)
    │   │   └── ThemeContext.tsx     # Светлая / Темная тема GitHub Primer
    │   ├── i18n/                    # Модульные словари локализации (kz.ts, ru.ts, en.ts)
    │   ├── screens/                 # Все экраны приложения
    │   │   ├── AuthScreen.tsx       # Вход / Регистрация
    │   │   ├── StudentHomeScreen.tsx# Главный дашборд ученика (Mobile & Desktop)
    │   │   ├── TrainerScreen.tsx    # Тренажер Сократа «Аға» с Active Canvas
    │   │   ├── RoadmapScreen.tsx    # Дорожная карта ЕНТ 2026 с таймером
    │   │   ├── CourseCatalogScreen.tsx # Каталог курсов и подача заявок
    │   │   ├── TeacherDashboard.tsx # Журнал 24 учеников и сигнал дня
    │   │   ├── CourseBuilderScreen.tsx # AI Co-Pilot Split-view конструктор
    │   │   └── SmartboardScreen.tsx # Проекторный режим F11
    │   └── App.tsx                  # Главный роутер
    └── package.json
```

---

## 🧠 ИИ-Ядро и 5 Системных Промптов

Платформа использует 5 специализированных промптов:
1. **Сократический «Аға» (`socratic`):** 1 строка вопроса + 3 визуальные развилки мысли `Thought-Forks` (A: истинный шаг, B: ловушка, C: правило) + Anti-Jailbreak Guard (-20 ELO) + Eureka Moment (+15 ELO).
2. **Teacher Co-Pilot (`teacher_copilot`):** Разбор загруженных PDF/DOCX, создание структуры курса и дескрипторов.
3. **File Parser & Knowledge Graph (`file_parser`):** Извлечение формул, Q-Matrix микронавыков и графа связей.
4. **Assessment Generator (`assessment_generator`):** Генерация тестов Режима А с когнитивными ловушками и Режима Б.
5. **Class Telemetry Diagnostics (`class_telemetry`):** Анализ кластерных дефицитов 24 учеников и 5-минутная разминка.

---

## 🌐 Локализация и Триязычие

Поддерживаются 3 равноправных языка:
* 🇰🇿 **Қазақша (KZ):** Нативный литературный казахский язык.
* 🇷🇺 **Русский (RU):** Академический русский язык.
* 🇬🇧 **English (EN):** Международный стиль Кремниевой долины.

*Непереводимые термины:* `ELO`, `Aga` (Аға), `Zerde`, `ZVDSL+`, `Thought-Forks`, `Eureka`, `Q-Matrix`, `CDM`.

---

## 📚 База Знаний `FP_KNOW`

Для любого разработчика или AI-агента, продолжающего работу над проектом, создана подробная база знаний в папке [**`fp_know/`**](file:///d:/future-minds-mvp/zerde-app/fp_know) и файле [**`FP_KNOW.md`**](file:///d:/future-minds-mvp/zerde-app/FP_KNOW.md).

---

## 🧪 Тестирование

```bash
# Запуск сквозного E2E тестирования (23/23 тестов)
cd d:/future-minds-mvp/zerde-app/server
npm run test:e2e

# Проверка сборки клиента и сервера
npm run build --prefix d:/future-minds-mvp/zerde-app
```
