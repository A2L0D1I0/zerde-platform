# 🧠 FP_KNOW: База Инженерных Знаний Экосистемы «Zerde»

> **ВНИМАНИЕ ВСЕМ БУДУЩИМ АГЕНТАМ И РАЗРАБОТЧИКАМ:**  
> Этот документ и папка `fp_know/` — единственный источник абсолютной истины об архитектуре, алгоритмах, контрактах и кодовой базе «Zerde». Прежде чем делать изменения, **прочитайте соответствующий раздел**. После внесения любых изменений — **обязательно обновите соответствующий файл в `fp_know/`**!

---

## 🗺️ Навигатор по Базе Знаний `fp_know/`

| Файл | Содержание раздела | Ключевые концепции |
| :--- | :--- | :--- |
| [**`01_architecture_overview.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/01_architecture_overview.md) | Общая архитектура full-stack монорепозитория | Client-Server контракт, Contexts, State, Offline Fallback |
| [**`02_database_and_models.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/02_database_and_models.md) | Схема базы данных SQLite и DDL | 14 таблиц, внешние ключи, каскады, индексы, сид |
| [**`03_ai_engine_and_prompts.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/03_ai_engine_and_prompts.md) | ИИ-ядро и 5 системных промптов | «Аға», Thought-Forks, Anti-Jailbreak, Co-Pilot, File Parser |
| [**`04_cdm_elo_and_math.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/04_cdm_elo_and_math.md) | Математика CDM DINA, ELO и SM-2 | $P(\alpha_k=1)$, Q-Matrix, 4 ранга ELO, SuperMemo-2, 0 токенов |
| [**`05_zvdsl_and_canvas_spec.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/05_zvdsl_and_canvas_spec.md) | Визуальный движок ZVDSL+ и Desmos | Сан түзуі, морфемы, синтаксис, химия, цепи, параболы |
| [**`06_i18n_and_localization.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/06_i18n_and_localization.md) | Триязычие (KZ / RU / EN) | Словари `kz.ts`, `ru.ts`, `en.ts`, непереводимые термины |
| [**`07_portals_and_screens.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/07_portals_and_screens.md) | Разбор всех экранов ученика и учителя | Mobile & Desktop layout, F11 Смарт-доска, Kundelik экспорт |
| [**`08_agent_contribution_guide.md`**](file:///d:/future-minds-mvp/zerde-app/fp_know/08_agent_contribution_guide.md) | Регламент работы и чек-лист для AI-агентов | Правила правок, тестирование `npm run test:e2e`, версионирование |

---

## ⚡ Ключевые Принципы Системы «Zerde»

1. **Никакого хардкода предметов:** Все курсы, темы, навыки и задачи динамически берутся из SQLite базы данных.
2. **0 токенов ИИ на рутину:** Расчет ELO, когнитивная диагностика CDM DINA, интервальное повторение SM-2 и выборка нерешенных задач работают на 100% локально и бесплатно.
3. **Сократический наставник «Аға»:** Никогда не дает готового ответа. Ответ всегда: 1 строка вопроса + 3 развилки мысли (*Thought-Forks*). При попытке взлома — штраф `-20 ELO`.
4. **Active Canvas & Desmos:** В каждом вопросе и варианте ответа есть интерактивный холст для визуализации.
5. **Триязычие (KZ / RU / EN):** Полная поддержка 3 языков с сохранением непереводимых брендов (`ELO`, `Aga`, `Zerde`, `ZVDSL+`, `Thought-Forks`, `Eureka`, `Q-Matrix`, `CDM`).
