# 🏛️ 01. Архитектура и Потоки Данных Экосистемы «Zerde»

## 1. Концепция Монорепозитория
Проект организован как автономный full-stack монорепозиторий в папке `zerde-app/`:
* `zerde-app/server/` — REST API сервер на Node.js (Express, TypeScript, Better-SQLite3, JWT, bcryptjs, Zod).
* `zerde-app/client/` — Клиентское SPA веб-приложение на React 18 (Vite, TypeScript, Tailwind CSS, shadcn/ui, KaTeX, Lucide).
* `zerde-app/package.json` — Единый оркестратор с пакетом `concurrently`, запускающий оба сервиса параллельно.

---

## 2. Потоки данных (Data Flow)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT (PORT 3000)                           │
│  React 18 SPA • AuthContext • LanguageContext (KZ/RU/EN) • ThemeContext  │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │ HTTP / JSON API (Bearer JWT)
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             SERVER (PORT 5000)                           │
│  Express 4 • Auth Guard (RBAC) • Error Middleware • Rate Limits          │
├──────────────────┬───────────────────────┬───────────────────────────────┤
│  AI Orchestrator │  Math Engine (0 toks) │  Database & Seed Layer        │
│  • 5 Prompts     │  • CDM DINA           │  • Better-SQLite3             │
│  • Gemini / Fall │  • ELO 4 Ranks        │  • 14 Tables (WAL mode)       │
│  • Anti-Jailbreak│  • SM-2 SuperMemo     │  • Cascade Deletes & Indexes  │
└──────────────────┴───────────────────────┴───────────────────────────────┘
```

---

## 3. Управление Состоянием (State Management)
* **AuthContext (`client/src/context/AuthContext.tsx`):**
  - Хранит JWT токен в `localStorage` и `httpOnly`-совместимом заголовке.
  - Управляет активным пользователем (`user: User | null`), ролью (`role: 'student' | 'teacher' | 'admin'`), функцией `login()`, `logout()`, `switchRole()`.
* **LanguageContext (`client/src/context/LanguageContext.tsx`):**
  - Хранит текущий язык (`KZ`, `RU`, `EN`) с авто-сохранением в `localStorage`.
  - Предоставляет функцию `t(key, params)` с типизированным поиском по словарям и умным fallback-механизмом.
* **ThemeContext (`client/src/context/ThemeContext.tsx`):**
  - Поддерживает `light`, `dark` и `system` режимы с переключением класса `dark` на теге `<html>`.

---

## 4. Офлайн-Фоллбэк (Offline First & High Availability)
* Если сервер `http://localhost:5000` временно недоступен или выключен, клиентские сервисы (`studentService.ts`, `teacherApi.ts`, `courseService.ts`) автоматически переключаются на встроенное локальное мок-хранилище.
* Пользовательский интерфейс никогда не показывает белый экран или критическую ошибку 500.
