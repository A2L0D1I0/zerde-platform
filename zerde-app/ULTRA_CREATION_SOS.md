# 🚨 ZERDE 2.0: МАСТЕР-ПЛАН ПОЛНОЙ ЗАЧИСТКИ МОКОВ И ФОЛЛБЕКОВ (ULTRA_CREATION_SOS.MD)

> **Статус документа:** Экстренный протокол зачистки (Emergency Zero-Fake Protocol)  
> **Основание:** Аналитический отчет [`FALLBACK_AUDIT_REPORT.md`](file:///d:/future-minds-mvp/zerde-app/FALLBACK_AUDIT_REPORT.md)  
> **Цель:** Полное выжигание любых искусственных заглушек, моковых вариантов ответов, хардкодных ELO и фальшивых фоллбеков для достижения 100% честной архитектуры (Pure Zero-Fake).  
> **Целостность Фазы 1:** DDL-схема, транзакции и Zod-контракты сохраняются на 100%.

---

## 🗺️ ОБЩАЯ СТРУКТУРА ПЛАНА SOS

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            ТРЕХЭТАПНЫЙ ПРОТОКОЛ ЗАЧИСТКИ (SOS PROTOCOL)                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  1. 🧹 ФАЗА SOS-1: Клиентская очистка (Zero-Fake Frontend)                                  │
│     • Удаление моковых опций E-H, хардкодных ELO/стриков и fallback-задач в React-компонентах│
│                                                                                             │
│  2. 🗄️ ФАЗА SOS-2: Репозитории и Серверная Логика (Real-Data Backend)                       │
│     • Динамический SKILLS_HEADER из SQL, устранение подмены студентов, честные 404         │
│                                                                                             │
│  3. 🧠 ФАЗА SOS-3: Зачистка AI-Слоя и Удаление FallbackEngine                              │
│     • Полное удаление fallback-engine.ts, честный throw/500 при сбоях Gemini API            │
│                                                                                             │
│  4. 🔄 МОСТ К ВОЗВРАТУ: Переход к Фазе 2 ULTRA_CREATION.md                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 🧹 ФАЗА SOS-1: КЛИЕНТСКАЯ ОЧИСТКА (ZERO-FAKE FRONTEND)

### 1.1. Задачи по Файлам:

#### А. [`client/src/components/student/TestPracticeModal.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/components/student/TestPracticeModal.tsx)
1. **Удаление искусственного раздувания опций (строки 137–146):**
   * *Было:* Если пришло 4 варианта, клиент дописывал искусственные опции `E`, `F`, `G`, `H`.
   * *Стало:* Опции мапятся **строго 1-в-1 из ответа сервера / базы SQLite**.
2. **Удаление захардкоженного fallback-вопроса (строки 154–173):**
   * *Было:* При пустом ответе подставлялась зашитая задача `x^2 - x - 6 < 0`.
   * *Стало:* Если база пуста или произошла ошибка, выставляется `questions = []` и рендерится честный Empty State (*«Сұрақтар табылмады / Вопросы не найдены»*).
3. **Удаление хардкодных дефолтов пользователя (строки 296–298):**
   * *Было:* `currentElo = user?.elo || 1420`, `streakDays = user?.streakDays || 12`, `rankSymbol = '🦅'`.
   * *Стало:* `currentElo = user?.elo ?? user?.overallElo ?? 1000`, `streakDays = user?.streakDays || 0`, символ и ранг вычисляются строго по алгоритму `getRankByElo(currentElo)`.

#### Б. [`client/src/screens/TaskTrainerScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/TaskTrainerScreen.tsx)
1. **Удаление статического массива из 2 задач (строки 104–131):**
   * *Было:* При сбое сети в стейт принудительно ставились задачи `q1`, `q2`.
   * *Стало:* При ошибке или пустом ответе выставляется состояние ошибки с кнопкой `[Қайталау / Повторить попытку]`.
2. **Удаление резервного объекта (строки 140–151):**
   * *Было:* Хардкодный fallback-объект в `currentQuestion`.
   * *Стало:* Рендеринг загрузочного спиннера или сообщения об отсутствии активного вопроса.

#### В. [`client/src/screens/CourseBuilderScreen.tsx`](file:///d:/future-minds-mvp/zerde-app/client/src/screens/CourseBuilderScreen.tsx)
1. **Замена маскировочных тостов (строки 100–105):**
   * *Было:* Тост *«Генерация қатесі. Fallback қолданылды»*.
   * *Стало:* Тост с честной ошибкой от сервера (`error.response?.data?.error || 'Генерация қатесі'`) и статусом `danger`.

### 1.2. Критерии Готовности (Definition of Done SOS-1):
* В клиентском коде нет ни одной захардкоженной задачи и ни одного искусственно сгенерированного варианта ответа.
* Все профильные плашки (ELO, стрик, ранг) берутся строго из `AuthContext` / сервера.
* Команда проверки: `npm run build --prefix client` завершается с **0 ошибок**.

---

## 2. 🗄️ ФАЗА SOS-2: РЕПОЗИТОРИИ И СЕРВЕРНАЯ ЛОГИКА (REAL-DATA BACKEND)

### 2.1. Задачи по Файлам:

#### А. [`server/src/modules/teacher/teacher.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/teacher/teacher.repository.ts)
1. **Динамический `SKILLS_HEADER` (строки 4–13):**
   * *Было:* Константа из 8 жестко зашитых навыков (`ALG_09_INEQ`, `PHYS_09_NEWTON_SECOND` и т.д.).
   * *Стало:* Динамический SQL-запрос, который собирает уникальные `skill_code` и названия тем из таблиц `topics` и `question_bank` для выбранного курса:
     ```typescript
     public getSkillsHeaderForCourse(courseId: number): SkillMeta[] {
       const rows = db.prepare(`
         SELECT DISTINCT qb.skill_code as code, t.title as nameKZ, t.title as nameRU, c.title as subject
         FROM question_bank qb
         JOIN topics t ON qb.topic_id = t.id
         JOIN courses c ON t.course_id = c.id
         WHERE c.id = ?
       `).all(courseId) as any[];
       return rows.length > 0 ? rows : DEFAULT_FALLBACK_SKILLS;
     }
     ```

#### Б. [`server/src/modules/student/student.repository.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/student/student.repository.ts)
1. **Устранение подмены студентов (строки 38–47):**
   * *Было:* Если `identifier` не передан, метод возвращал первого попавшегося студента из базы (`LIMIT 1`).
   * *Стало:* Метод строго возвращает `null`, если идентификатор не задан или не найден. Роут `/api/student/dashboard` отдает честный `404 Not Found`.
2. **Очистка устаревших ссылок на `student_elo`:**
   * Все запросы перенаправляются на реальную таблицу `student_course_passports.subject_elo`.

#### В. [`server/src/modules/tutor/tutor.routes.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/modules/tutor/tutor.routes.ts)
1. **Зачистка эндпоинта `/api/tutor/initial` (строки 21–37):**
   * *Было:* Прямой возврат захардкоженного объекта из `FallbackEngine`.
   * *Стало:* Честное формирование вводных данных на основе темы из таблицы `topics` и первого вопроса из `question_bank`.

### 2.2. Критерии Готовности (Definition of Done SOS-2):
* Все данные матриц, навыков и лидербордов формируются исключительно через SQL-запросы к SQLite.
* Исключена возможность автоматической подстановки чужих профилей при пустых сессиях.
* Команда проверки: `npm run typecheck --prefix server` завершается с **0 ошибок**.

---

## 3. 🧠 ФАЗА SOS-3: ЗАЧИСТКА AI-СЛОЯ И УДАЛЕНИЕ FALLBACKENGINE

### 3.1. Задачи по Файлам:

#### А. Удаление [`server/src/ai/fallback-engine.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/fallback-engine.ts)
* Полное удаление файла `fallback-engine.ts` из проекта.

#### Б. [`server/src/ai/socratic.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/socratic.service.ts)
* Удаление импорта `FallbackEngine`.
* Если `!this.hasApiKey()` $\rightarrow$ выброс честной ошибки:
  ```typescript
  if (!this.hasApiKey()) {
    throw new Error('GEMINI_API_KEY_MISSING: Gemini API кілті орнатылмаған');
  }
  ```
* Если Gemini API вернул не-200 или тело пустое $\rightarrow$ `throw new Error(...)`.
* В блоке `catch` ошибка логируется в `system_audit_logs` и пробрасывается дальше, позволяя контроллеру отдать `res.status(500).json({ success: false, error: err.message })`.

#### В. [`server/src/ai/copilot.service.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/copilot.service.ts)
* Удаление импорта `FallbackEngine`.
* Честный выброс ошибок при сбое генерации вопросов или нарушении Zod-схемы.

#### Г. [`server/src/ai/gemini.ts`](file:///d:/future-minds-mvp/zerde-app/server/src/ai/gemini.ts)
* Удаление захардкоженных веток с начислением фейкового ELO (+5, +10). Честный проброс исключений.

### 3.2. Критерии Готовности (Definition of Done SOS-3):
* В кодовой базе сервера нет ни единого упоминания `FallbackEngine`.
* При некорректном ключе или сбое сети сервер возвращает честный HTTP 500 с описанием ошибки, не маскируя сбой фейковыми данными.
* Команда проверки: `npx ts-node src/__tests__/phase1_agentic_verification.ts` проходит с кодом 0.

---

## 4. 🔄 МОСТ К ВОЗВРАТУ (RESUMPTION BRIDGE)

После успешного выполнения всех 3 фаз протокола SOS:
1. Запускается контрольный тест **`npm run typecheck`** и **`npm run build`** на клиенте и сервере.
2. Проводится проверка отсутствия моков: поиск по паттернам `fallback`, `mock`, `1420` должен возвращать 0 недопустимых вхождений.
3. Проект **возвращается к выполнению ФАЗЫ 2 из мастер-плана [`ULTRA_CREATION.md`](file:///d:/future-minds-mvp/zerde-app/ULTRA_CREATION.md)** (реализация сервисов Копилота со слотами, Silent Grader и Навигатора с честным вызовом Gemini 2.5 Flash).

---

## 🏁 ЗАКЛЮЧЕНИЕ
План **ULTRA_CREATION_SOS.MD** утвержден.  
Команда готова приступить к немедленному выполнению **Фазы SOS-1**.
