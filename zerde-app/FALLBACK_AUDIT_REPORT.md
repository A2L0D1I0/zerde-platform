# 🔍 FALLBACK_AUDIT_REPORT: Исчерпывающий Аудит Фоллбеков, Моков и Заглушек

**Дата аудита:** 24 августа 2026 г.  
**Цель:** Выявление всех мест в кодовой базе, где реальные данные или ошибки API перехватываются, подменяются заготовленными ответами, моками или симуляторами.  
**Статус исходного кода:** Не изменялся (зафиксирован Git-коммитом `887c6f3`).

---

## 📑 Содержание

1. [AI-Слой и Сервисы (server/src/ai/)](#1-ai-слой-и-сервисы-serversrcai)
2. [Серверные Контроллеры и Репозитории (server/src/modules/ и server/src/routes/)](#2-серверные-контроллеры-и-репозитории-serversrcmodules-и-serversrcroutes)
3. [Клиентский Слой и Компоненты (client/src/)](#3-клиентский-слой-и-компоненты-clientsrc)
4. [Сводная Таблица Рисков и Рекомендации по Зачистке](#4-сводная-таблица-рисков-и-рекомендации-по-зачистке)

---

## 1. AI-Слой и Сервисы (`server/src/ai/`)

В AI-слое обнаружено широкое использование паттерна **Zero-Crash Fallback**. Все ошибки внешнего API Google Gemini (отсутствие ключа, ошибки 429 Rate Limit, 403, 500, таймауты и ошибки схемы Zod) перехватываются через `try/catch` и подменяются статическими шаблонами из `FallbackEngine`.

### 1.1. [`fallback-engine.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/fallback-engine.ts)
* **Назначение файла:** Полностью детерминированный движок заготовленных ответов.
* **Захардкоженные структуры:**
  - **Строки 11–148 (`getQuestions`):** Статичные массивы задач по теме «Квадраттық теңсіздіктер» для казахского (KZ), русского (RU) и английского (EN) языков. Формулы KaTeX, варианты A/B/C/D и пояснения зашиты прямо в код.
  - **Строки 153–164 (`getClassInsight`):** Статичные шаблоны текста аналитики класса для учителя по кодам ошибок.
  - **Строки 169–296 (`getSocraticResponse`):** Полностью заготовленные развилки мысли Thought-Forks (`true_step`, `cognitive_trap`, `basic_rule`) для Сократа «Аға» на 3 языках.

### 1.2. [`socratic.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/socratic.service.ts)
* **Строки 59–62:** Если API-ключ не задан (`!this.hasApiKey()`), сервис мгновенно возвращает `FallbackEngine.getSocraticResponse(...)` без вызова внешней сети.
* **Строки 129–132:** При получении не-200 HTTP ответа от Gemini API (например, статус 429 или 503) ошибка не пробрасывается наружу, а логируется через `console.warn` с возвратом `FallbackEngine`.
* **Строки 137–139:** При пустом текстовом теле ответа активируется `FallbackEngine`.
* **Строки 151–154:** Блок `catch (err)` перехватывает любые сетевые исключения и ошибки валидации `SocraticResponseSchema.parse`, возвращая `FallbackEngine`.

### 1.3. [`copilot.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/copilot.service.ts)
* **Строки 50–53:** При отсутствии API-ключа сразу возвращается `FallbackEngine.getQuestions(...)`.
* **Строки 102–105:** При HTTP ошибке от Gemini API возвращается `FallbackEngine.getQuestions(...)`.
* **Строки 110–112:** При пустом `textResponse` возвращается `FallbackEngine.getQuestions(...)`.
* **Строки 120–123:** Любое исключение парсинга или Zod-валидации маскируется через `FallbackEngine.getQuestions(...)`.
* **Строки 150–159 (`generateClassInsight`):** Текст рекомендации для учителя генерируется через статичный шаблон `FallbackEngine.getClassInsight(...)`.

### 1.4. [`gemini.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/gemini.ts)
* **Строки 29–74 (`getInitialGreeting`):** Возвращает полностью захардкоженные развилки мысли Thought-Forks без обращения к LLM.
* **Строки 108–129:** При отсутствии ключа возвращает жестко зашитый объект с развилками и фейковым начислением `+10 ELO`.
* **Строки 157–178:** При ошибке API ловит исключение и возвращает заготовленный ответ с фейковым начислением `+5 ELO`.

---

## 2. Серверные Контроллеры и Репозитории (`server/src/modules/` и `server/src/routes/`)

### 2.1. [`tutor.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/tutor/tutor.routes.ts)
* **Строки 21–37 (`GET /api/tutor/initial`):** Эндпоинт напрямую вызывает `FallbackEngine.getSocraticResponse(topicTitle, language, currentElo, false)` и отдает клиенту заготовленный JSON без обращения к Gemini API.

### 2.2. [`student.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.repository.ts)
* **Строки 38–47 (`findByIdOrEmail`):** Если передан `undefined` или идентификатор не найден, метод выполняет fallback-запрос `SELECT u.* FROM users WHERE u.role = 'student' ORDER BY u.id ASC LIMIT 1`, подставляя первого попавшегося студента из базы.
* **Строки 24, 41, 69, 91:** Использование `COALESCE(se.current_elo, 1000)` к устаревшей таблице `student_elo` вместо чтения `student_course_passports.subject_elo`.

### 2.3. [`teacher.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.repository.ts)
* **Строки 4–13 (`SKILLS_HEADER`):** В коде зашит массив из 8 фиксированных компетенций:
  ```typescript
  export const SKILLS_HEADER: SkillMeta[] = [
    { code: 'ALG_09_INEQ', nameKZ: 'Квадраттық теңсіздіктер', ... },
    { code: 'ALG_09_INTERVAL_METHOD', nameKZ: 'Интервалдар әдісі', ... },
    ...
  ];
  ```
  Колонки матрицы берутся из этого статичного массива констант, а не динамически из таблицы `topics` или `question_bank`.

### 2.4. [`student.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.routes.ts)
* **Строки 258–264:** Эвристическая заглушка для открытого ввода (сравнение подстрок вместо вызова Silent Grader):
  ```typescript
  // Fallback heuristic for open input
  const isCorrect = userText.trim().toLowerCase().includes(expected.toLowerCase());
  ```

---

## 3. Клиентский Слой и Компоненты (`client/src/`)

### 3.1. [`TestPracticeModal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/TestPracticeModal.tsx)
* **Строки 137–146 (Искусственное обогащение вариантов):**
  Если с бэкенда пришло 4 варианта ответа, клиент искусственно дописывает еще 4 моковых варианта (`E`, `F`, `G`, `H`):
  ```typescript
  opts = [
    ...opts,
    { id: 'E', text: 'x > 3 немесе x < -2', latex: 'x \\in (-\\infty; -2) \\cup (3; +\\infty)', isCorrect: false },
    { id: 'F', text: 'Барлық нақты сандар', latex: 'x \\in \\mathbb{R}', isCorrect: false },
    { id: 'G', text: 'Шешімі жоқ', latex: '\\varnothing', isCorrect: false },
    { id: 'H', text: 'Тек x = 0 нүктесі', latex: 'x = 0', isCorrect: false },
  ];
  ```
* **Строки 154–173 (Моковый fallback вопроса):**
  Если `/api/questions` вернул ошибку или пустой массив, компонент подставляет жестко зашитую в TSX задачу по теме `x^2 - x - 6 < 0` с 8 вариантами.
* **Строки 296–298 (Фейковые дефолты пользователя):**
  ```typescript
  const currentElo = user?.elo || 1420;   // Хардкодный fallback 1420 ELO
  const streakDays = user?.streakDays || 12; // Хардкодный fallback 12 дней
  const rankSymbol = '🦅';               // Хардкодный символ ранга
  ```

### 3.2. [`TaskTrainerScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TaskTrainerScreen.tsx)
* **Строки 104–131 (Захардкоженный fallback задач):**
  Если сетевой запрос к `/questions` не вернул данных, в стейт выставляется статичный массив из 2 задач (`q1`, `q2`) по теме «Квадраттық теңсіздіктер».
* **Строки 140–151:** Если `questions[currentIndex]` недоступен, рендерится резервный захардкоженный объект.

### 3.3. [`CourseBuilderScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseBuilderScreen.tsx)
* **Строки 100–105:** При ошибке запроса к `/teacher/copilot/generate-quiz` показывается тост *«Генерация қатесі. Fallback қолданылды»*, скрывая реальную причину ошибки API от пользователя.

### 3.4. [`StudentHomeScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/StudentHomeScreen.tsx)
* **Строки 78–82:** Дефолтные строковые заглушки для неавторизованных пользователей: `schoolName = 'Өз бетінше оқу'`, `rankLabel = 'Өскін'`.

---

## 4. Сводная Таблица Рисков и Рекомендации по Зачистке

| Файл | Строки | Тип заглушки / Мока | Текущее поведение | Рекомендация для Zero-Fake |
| :--- | :---: | :--- | :--- | :--- |
| `server/src/ai/fallback-engine.ts` | 11–296 | Статические шаблоны генерации | Возвращает готовые вопросы и развилки мысли при падении API. | Сохранить только для экстренного режима (Zero-Crash), но снабдить флагом `is_fallback: true`. |
| `server/src/ai/socratic.service.ts` | 59, 131, 153 | Перехват ошибок API | Маскирует ошибки Gemini дефолтным JSON. | Логировать реальную ошибку в `system_audit_logs`. |
| `server/src/modules/tutor/tutor.routes.ts` | 27 | Вызов Fallback напрямую | `/api/tutor/initial` всегда отдает статический JSON. | Заменить на честный вызов `socraticService.generateGuidance` или выборку из `question_bank`. |
| `server/src/modules/teacher/teacher.repository.ts` | 4–13 | Хардкодный `SKILLS_HEADER` | Колонки матрицы зашиты в константу. | Динамически вытягивать микрокомпетенции из `topics` и `question_bank` для выбранного курса. |
| `client/src/components/student/TestPracticeModal.tsx` | 137–146 | Инъекция опций E-H | Искусственно раздувает 4 варианта до 8. | **УДАЛИТЬ ПОЛНОСТЬЮ.** Отображать только реальные варианты из БД. |
| `client/src/components/student/TestPracticeModal.tsx` | 296–298 | Хардкодные 1420 ELO и 12 дней | Подменяет стрик и ELO новичка на высокие числа. | **УДАЛИТЬ ПОЛНОСТЬЮ.** Использовать честные `user.elo || 1000` и `user.streak_days || 0`. |
| `client/src/screens/TaskTrainerScreen.tsx` | 104–131 | Хардкодный fallback задач | Показывает фейковые задачи при ошибке сети. | Показывать честный Empty/Error State с кнопкой [Қайталау / Повторить]. |

---

## 🏁 Заключение
Аудит зафиксировал точные координаты всех заглушек. Кодовая база готова к планомерной очистке в соответствии со строгим манифестом **Zero-Fake** и переходу к выполнению последующих фаз.
