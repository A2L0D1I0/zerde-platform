# GitHub Mobile: Экраны, Паттерны и Анатомия Компонентов

Комплексный разбор архитектуры мобильного приложения GitHub (iOS & Android) на базе спецификаций **Primer Mobile**. Включает разбор ключевых экранов, навигации, карточек задач, списков, штор (Bottom Sheets) и тепловой карты активности.

---

## 1. Ключевые экраны GitHub Mobile

### 1.1. Home (Главный экран / Feed)
- **Структура:**
  - **Верхняя панель:** Заголовок "Home" (Large Title на iOS), кнопка поиска (Search) и иконка быстрого создания (+ Floating/Header Action: New Issue, New Repo, New Discussion).
  - **Секция "My Work" (Группированный список):**
    - Issues (Назначенные, созданные, упомянутые).
    - Pull Requests (Требующие ревью, назначенные).
    - Discussions.
    - Repositories (Избранные / Recent).
    - Organizations.
  - **Секция "Favorites" / "Pinned":** Закрепленные репозитории в виде компактных карточек с иконкой языка программирования и звездочками.
  - **Лента активности (Activity Feed):** Карточки событий подписок (Starred, Forked, Released).

### 1.2. Notifications / Inbox
- **Структура:**
  - **Header с фильтрацией:** Вкладки "Inbox", "Saved", "Done".
  - **Quick Filters (горизонтальный скролл чипсов):** Unread, Assigned, Mentioned, Review Requested.
  - **Группировка по репозиториям:**
    - Секция `owner/repo-name` со значком репозитория.
    - Элементы уведомлений: Свайп-действия (Swipe to Save, Swipe to Done/Read).
    - Иконка статуса сущности: Фиолетовый PR, Зеленый Issue, Синий коммит.

### 1.3. Repositories & Issues List (Списки сущностей)
- **Структура:**
  - **Sub-header с поисковой строкой:** Поле поиска с иконкой лупы и кнопкой "Filters".
  - **Row фильтров (Pill Chips):** `Open / Closed`, `Author: @me`, `Label: bug`, `Milestone: v1.0`, `Sort: Newest`.
  - **Счетчик результатов:** Например, `14 Open, 128 Closed`.
  - **Бесконечный список карточек (Card Stream):** Без боковых отступов на всю ширину (Edge-to-Edge) или Inset Grouped с скруглением 8-12px.

### 1.4. Issue & Pull Request Detail Screen (Детальный просмотр)
- **Структура:**
  - **Top Bar:** Back button, статус бейдж (Open/Closed), кнопка действий `...` (Subscribe, Copy Link, Edit).
  - **Header блок:**
    - Крупный заголовок (`H1` 20-22px bold).
    - Бейдж статуса: Pill с иконкой (`Issue Opened` зеленый или `Merged` фиолетовый).
    - Мета-строка: `username opened this 3 hours ago · 12 comments`.
  - **Labels row:** Горизонтальная прокрутка цветных бейджей меток.
  - **Description Body:** Рендеринг Markdown с поддержкой таблиц, картинок, чек-листов и Callout-блоков (`[!NOTE]`).
  - **Метаданные (Sidebar в виде аккордеона / Bottom Sheet):**
    - Assignees (аватары + никнеймы).
    - Reviewers (статусы: Approved, Changes Requested).
    - Labels, Milestone, Projects.
  - **Timeline событий:** Комментарии, коммиты, смена статуса с вертикальной линией-коннектором (`border.default`).
  - **Sticky Bottom Action Bar:** Поле быстрого ответа `Leave a comment...` с кнопкой форматирования, добавления картинки и кнопкой отправки.

### 1.5. Profile Screen (Профиль пользователя)
- **Структура:**
  - **Аватар и идентификация:** Крупный круглый аватар (72x72px), Full Name (bold), @username (muted), Bio, Company, Location, Website.
  - **Social stats:** Followers / Following, Starred repos.
  - **Pinned Repositories:** Горизонтальная карусель или вертикальная сетка 2-up.
  - **Contribution Activity:** Интерактивная тепловая матрица (Heatmap) + статистика (Current streak, Longest streak, Total contributions in year).
  - **Organizations:** Список кружков-логотипов организаций.

---

## 2. Анатомия мобильных компонентов Primer

```
┌────────────────────────────────────────────────────────────┐
│ [≡] Search or jump to...                              [@]  │ ← Header Bar
├────────────────────────────────────────────────────────────┤
│ (• Open 24)  (✓ Closed 112)  [Labels ▾]  [Milestones ▾]    │ ← Filter Chips Bar
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🟢  Fix hydration mismatch on initial load           │  │ ← Status Icon + Title
│  │     [bug]  [frontend]  [p1]                          │  │ ← Labels Badges
│  │     #402 opened 2h ago by alex · 💬 4 · 🎯 v2.4      │  │ ← Metadata Footer
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🟣  Add support for dark mode Primer tokens          │  │
│  │     [enhancement]                                    │  │
│  │     #401 merged yesterday by sarah · 💬 12           │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  [ 🏠 Home ]   [ 🔔 Inbox ]   [ 🧭 Explore ]   [ 👤 Profile ]│ ← Bottom Navigation
└────────────────────────────────────────────────────────────┘
```

---

### 2.1. Navigation & Header Bar

#### Mobile Navigation Bar
- **Высота:** 56px (Android) / 44-52px + Safe Area Top (iOS).
- **Цвет фона:** `canvas.default` (`#0d1117` Dark / `#ffffff` Light).
- **Нижняя граница:** 1px `border.default` (`#30363d` Dark / `#d0d7de` Light).
- **Элементы:**
  - Левая часть: Back Chevron или Логотип/Аватар.
  - Центральная часть: Заголовок экрана (17px Semibold) или компактное поле поиска.
  - Правая часть: Action Icons (Фильтр, Поделиться, `...` меню) с размером кликабельной зоны не менее 44x44px.

---

### 2.2. Bottom Navigation Bar

- **Высота:** 56px + Safe Area Bottom (всего ~84px на iPhone).
- **Сетка:** 4 или 5 вкладок с равномерным распределением (`flex: 1`).
- **Стили состояний:**
  - **Active Tab:** Иконка залита цветом `accent.fg` (`#58a6ff` Dark / `#0969da` Light), подпись 11px Medium.
  - **Inactive Tab:** Иконка контурная `fg.muted` (`#8b949e` Dark / `#656d76` Light), подпись 11px Regular.
  - **Бейдж уведомлений:** Красная точка или числовой бейдж 16x16px с белым текстом на `danger.emphasis` (`#da3633`).

---

### 2.3. Filter Chips & Pills

- **Высота:** 32px.
- **Скругление:** `borderRadius-full` (`9999px`).
- **Отступы:** `padding: 6px 12px`, зазор между чипсами `8px`.
- **Состояния:**
  - **Selected / Active:**
    - Dark: Фон `accent.subtle` (`rgba(56, 139, 253, 0.15)`), граница `accent.emphasis` (`#1f6feb`), текст `accent.fg` (`#58a6ff`).
    - Light: Фон `accent.subtle` (`#ddf4ff`), граница `accent.emphasis` (`#0969da`), текст `accent.fg` (`#0969da`).
  - **Inactive:**
    - Dark: Фон `canvas.subtle` (`#161b22`), граница `border.default` (`#30363d`), текст `fg.default` (`#f0f6fc`).
    - Light: Фон `canvas.subtle` (`#f6f8fa`), граница `border.default` (`#d0d7de`), текст `fg.default` (`#1f2328`).
  - **Drop-down Pill:** Имеет справа стрелку `chevron-down` (12px).

---

### 2.4. Issue / Task Card (Анатомия карточки)

Карточка задачи — центральный элемент GitHub Mobile:

1. **Контейнер:**
   - Фон: `canvas.default` (`#0d1117`) или `canvas.subtle` (`#161b22`).
   - Граница: 1px `border.default` снизу или по периметру с `border-radius: 8px`.
   - Внутренний паддинг: `12px 16px`.
2. **Левая иконка статуса (Leading Icon):**
   - 16x16px Octicon (`issue-opened`, `issue-closed`, `git-pull-request`, `git-merge`).
   - Цвет:
     - Open Issue: `success.fg` (`#3fb950`).
     - Closed Issue: `done.fg` (`#a371f7`) или `danger.fg` (`#f85149`).
     - Open PR: `success.fg` (`#3fb950`).
     - Merged PR: `done.fg` (`#a371f7`).
     - Draft: `fg.muted` (`#8b949e`).
3. **Заголовок (Title):**
   - Размер: 15px, Font-weight: 600 (Semibold), `fg.default`.
   - Поддерживает перенос на 2 строки с эллипсисом (`line-clamp-2`).
4. **Бейджи меток (Labels Row):**
   - Размер бейджа: высота 20px, текст 11px, скругление `9999px` или `3px`.
   - Индивидуальный цвет фона с динамической контрастностью текста (темный/светлый).
5. **Подвал метаданных (Footer):**
   - Текст 12px `fg.muted`.
   - Формат: `#124 · opened 2h ago by username`.
   - Справа: Счетчик комментариев (иконка `comment` + число) и Milestone (иконка `milestone` + название).

---

### 2.5. Contribution Activity Heatmap (Мобильная матрица активности)

- **Отображение на мобильном:**
  - Горизонтальный скролл последних 20-52 недель с фиксацией на текущем дне.
  - Размер ячейки: 10x10px или 12x12px с зазором `3px`.
  - Скругление ячейки: `2px`.
  - 7 строк (дни недели: Sun-Sat или Mon-Sun).
- **Цветовые уровни (Dark Mode):**
  - Level 0 (0): `#161b22` (с тонкой границей `#30363d`).
  - Level 1 (1-3): `#0e4429`.
  - Level 2 (4-6): `#006d32`.
  - Level 3 (7-9): `#26a641`.
  - Level 4 (10+): `#39d353`.
- **Интерактивность:** Тап по ячейке открывает тултип или компактную плашку: `3 contributions on Aug 14, 2026`.

---

### 2.6. Bottom Sheets & Action Drawers (Шторки действий)

- **Фон шторки:** `canvas.overlay` (`#1f242c` Dark / `#ffffff` Light).
- **Скругление верхних углов:** `borderRadius-xlarge` (`12px` или `16px`).
- **Drag Handle (индикатор перетаскивания):**
  - Размер: 36px шириной, 4px высотой, скругление `9999px`.
  - Цвет: `border.default` или `fg.subtle`.
  - Отступ сверху: 8px.
- **Пункты меню (List Items):**
  - Высота строки: 48px.
  - Иконка слева (20px), текстовый заголовок (15px), индикатор выбора (чекбокс/радио) справа.
  - Разделители: 1px `border.muted`.
