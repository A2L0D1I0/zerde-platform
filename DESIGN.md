# 🐙 ZERDE DESIGN SYSTEM (GITHUB PRIMER EDITION)

> **Документ:** `DESIGN.md`  
> **Официальная дизайн-система проекта Zerde** для хакатона Future Minds Hackathon 2026 (NIS IB Astana).  
> **Фундамент:** 100% GitHub Primer Design System (Mobile & Web) + Anti-Slop Guidelines.  
> **Концепция:** Превращение процесса школьного обучения в строгий, мотивирующий, инженерно выверенный опыт (как в GitHub для разработчиков).

---

## 🏛️ 1. Философия и Метафоры Дизайна Zerde $\leftrightarrow$ GitHub

| Концепция GitHub | Образовательный эквивалент в Zerde |
| :--- | :--- |
| **Pinned Repositories (Закрепленные репозитории)** | **Карточки предметов (Алгебра, Физика, Химия)** с рейтингом ELO и 3-минутным фокусом дня. |
| **Contribution Activity Heatmap (Сетка коммитов)** | **Сетка учебной активности (Heatmap):** 5 уровней зелёного цвета, отображающих непрерывные дни занятий и количество решенных микро-задач. |
| **Issues & Milestones (Задачи и майлстоуны)** | **Темы четверти (Topics Lifecycle):** Двухфакторная проверка (`[Усвоено]`, `[Ожидает зачета]`, `[В работе]`, `[В очереди]`), хранящаяся до конца четверти. |
| **Pull Request & Code Review (Ревью кода)** | **Сократический «Аға» & Развилки мысли:** Интерактивное пошаговое рассуждение без подсказок в лоб. |
| **Markdown Callouts (`> [!NOTE]`)** | **Spaced Repetition (Интервальное повторение):** Экспресс-карточки формул и определений на 1 минуту. |
| **Status Labels & Pills (Цветные капсулы)** | **Теги предметов и сложности:** Аккуратные плашки со скруглением `rounded-full` и тонкими рамками 1px. |
| **Octicons (Системные иконки)** | **Строгие монохромные иконки (16/24px)** без навязчивого 3D-пластика и кислотных свечений. |

---

## 🎨 2. Цветовая Палитра (GitHub Dark Canvas Tokens)

Все цвета взяты строго из спецификации GitHub Primer Dark Theme:

```css
:root {
  /* Canvas / Backgrounds */
  --color-canvas-default: #0d1117;   /* Главный фон приложения */
  --color-canvas-subtle:  #161b22;   /* Фон карточек, блоков и сайдбаров */
  --color-canvas-inset:   #010409;   /* Фон вложенных полей и терминалов */
  --color-canvas-overlay: #1f242c;   /* Фон выпадающих списков и модалок */

  /* Borders / Dividers */
  --color-border-default: #30363d;   /* Основная 1px граница всех карточек */
  --color-border-muted:   #21262d;   /* Внутренние тонкие разделители */

  /* Foreground / Typography */
  --color-fg-default:     #f0f6fc;   /* Основной высококонтрастный текст */
  --color-fg-muted:       #8b949e;   /* Второстепенный текст, метаданные, тайминги */
  --color-fg-subtle:      #6e7681;   /* Неактивные подписи и плейсхолдеры */

  /* Semantic Accents */
  --color-accent-fg:      #58a6ff;   /* Синий: активные ссылки, фокус, навигация */
  --color-accent-subtle:  #1f6feb;   /* Синяя плашка / подсветка */

  --color-success-fg:     #3fb950;   /* Зеленый: правильный ответ, статус «В работе» */
  --color-success-btn:    #238636;   /* Фирменная зелёная кнопка GitHub Primary */
  --color-success-hover:  #2ea043;   /* Наведение на зелёную кнопку */

  --color-attention-fg:   #d29922;   /* Янтарный: статус «Ожидает зачета учителя», стрик */
  --color-attention-bg:   #3b2300;   /* Фон янтарного бейджа */

  --color-done-fg:        #a371f7;   /* Фиолетовый: статус «Усвоено / Зачтено» */
  --color-done-bg:        #271052;   /* Фон фиолетового бейджа */

  --color-danger-fg:      #f85149;   /* Красный: критическая ошибка / сброс */
  --color-danger-bg:      #490202;   /* Фон предупреждения */
}
```

### 🟩 5-уровневая шкала Activity Heatmap:
* **Уровень 0 (0 задач):** `#161b22` (фон карточки)
* **Уровень 1 (1–2 задачи):** `#0e4429` (темно-зеленый)
* **Уровень 2 (3–4 задачи):** `#006d32` (зеленый средней насыщенности)
* **Уровень 3 (5–7 задач):** `#26a641` (яркий зеленый)
* **Уровень 4 (8+ задач / СОР):** `#39d353` (неоново-изумрудный триумф)

---

## 🔤 3. Типографика и Текстовая Иерархия

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

* **Заголовки экранов (H1):** `16px` / `20px` font-bold (никаких гигантских баннеров, забирающих полезное место).
* **Названия карточек / тем (H2):** `14px` font-semibold text-[#f0f6fc].
* **Основной текст и условия задач:** `13px` / `14px` leading-relaxed text-[#c9d1d9].
* **Метаданные, номера тем, тайминги:** `11px` / `12px` font-medium text-[#8b949e].
* **Формулы и формулировки теорем:** Monospace / KaTeX с идеальным контрастом.

---

## 📐 4. Геометрия, Сетки и Отступы (4px Base Grid)

* **Скругления (Radius):**
  * Карточки и блоки: `rounded-lg` (8px)
  * Кнопки и поля ввода: `rounded-md` (6px)
  * Ячейки Heatmap: `rounded-xs` (2px)
  * Статусные бейджи и чипсы: `rounded-full` (9999px капсулы)
* **Границы (Borders):**
  * Всегда строго `1px solid #30363d` (без размытых теней и грязи).
* **Мобильный Bottom Nav:**
  * Фиксированная высота `56px`, 4 кнопки, `backdrop-blur-md bg-[#161b22]/95 border-t border-[#30363d]`.

---

## 🧩 5. Анатомия Ключевых Компонентов Zerde

### 1. Кнопка Primary Action (GitHub Green)
```html
<button class="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold py-2.5 px-4 rounded-md border border-[rgba(240,246,252,0.1)] shadow-xs transition active:scale-98">
  ▶️ Жаттығуды бастау (3 минут)
</button>
```

### 2. Карточка темы в стиле GitHub Issues
```html
<div class="p-3.5 flex items-start justify-between bg-[#161b22] hover:bg-[#1c2128] border-b border-[#30363d] cursor-pointer transition">
  <div class="flex items-start space-x-3">
    <!-- Иконка статуса -->
    <svg class="w-4 h-4 text-[#a371f7] mt-0.5" ... />
    <div>
      <div class="text-xs font-semibold text-[#f0f6fc]">
        <span class="text-[#8b949e] font-mono mr-1.5">#01</span>
        Сызықтық теңдеулер жүйесі
      </div>
      <div class="text-[11px] text-[#8b949e] mt-1">Мұғалім бекітті • СОР-ға дайын</div>
    </div>
  </div>
  <!-- Капсульный бейдж -->
  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#271052] text-[#d2a8ff] border border-[#a371f7]/40">
    Усвоено
  </span>
</div>
```

### 3. Блок Сократического «Аға» (GitHub PR Review style)
```html
<div class="bg-[#161b22] border-l-4 border-l-[#58a6ff] border border-[#30363d] rounded-r-lg p-3.5 space-y-2">
  <div class="text-xs font-bold text-[#58a6ff] flex items-center gap-1.5">
    <span>💡</span> Сократикалық «Аға» сұрағы:
  </div>
  <p class="text-xs text-[#f0f6fc]">
    Теңсіздік таңбасы қатаң ба, әлде қатаң емес пе?
  </p>
  <!-- 3 развилки мысли -->
  <div class="grid grid-cols-3 gap-2 pt-1">
    <button class="p-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] font-medium text-[#c9d1d9]">
      Қатаң (нүкте ашық ○)
    </button>
    <button class="p-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] font-medium text-[#c9d1d9]">
      Қатаң емес (нүкте боялған ●)
    </button>
    <button class="p-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] font-medium text-[#c9d1d9]">
      Нөлге теңдестіру
    </button>
  </div>
</div>
```

---

## 🚫 6. Строгие Запреты (Anti-Slop Protection)

1. ❌ **Никаких радужных градиентов:** Запрещены фиолетово-розовые градиенты на кнопках и заголовках.
2. ❌ **Никакого 3D-мусора:** Запрещены парящие стеклянные шары, 3D-руки и летающие монеты.
3. ❌ **Никакого бессмысленного Glassmorphism:** Текст всегда на контрастном сплошном фоне `#161b22` или `#0d1117`.
4. ❌ **Никаких микро-кнопок:** Клик-зоны строго от 40×40px для уверенного нажатия пальцем.
5. ❌ **Никакого красного стресса:** При ошибке используются нейтральные янтарно-песочные тона `#d29922` с конструктивным пояснением от «Аға».
