# GitHub Primer Design Tokens & Theme Specification

Полная спецификация дизайн-токенов GitHub Primer (primer.style) для веб- и мобильных интерфейсов, включая Dark & Light палитры, типографику, сетку отступов, скругления, тени и готовую конфигурацию для **Tailwind CSS** и **shadcn/ui**.

---

## 1. Цветовая палитра (Color Tokens)

GitHub Primer использует семантическую структуру токенов, разделяя цвета на **Functional/Semantic** (роль элемента) и **Scale** (шкала оттенков).

### 1.1. Dark Mode (Default Dark / Dimmed)

| Семантический токен Primer | HEX / RGBA | Использование в UI |
|---|---|---|
| `canvas.default` | `#0d1117` | Основной фон приложения/страницы |
| `canvas.subtle` | `#161b22` | Вторичный фон (карточки, сайдбар, списки) |
| `canvas.inset` | `#010409` | Вдавленный фон (поля ввода, кодовые блоки) |
| `canvas.overlay` | `#1f242c` | Всплывающие окна, модалки, меню (Popovers/Dialogs) |
| `border.default` | `#30363d` | Основные разделители и границы карточек |
| `border.muted` | `#21262d` | Тонкие/второстепенные границы |
| `border.subtle` | `rgba(240, 246, 252, 0.1)` | Прозрачные границы |
| `fg.default` | `#f0f6fc` | Основной текст и иконки |
| `fg.muted` | `#8b949e` | Второстепенный текст, метаданные, счетчики |
| `fg.subtle` | `#6e7681` | Плейсхолдеры, отключенные элементы |
| `fg.onEmphasis` | `#ffffff` | Текст на контрастных плашках |
| `accent.fg` | `#58a6ff` | Акцентный синий (ссылки, активные вкладки, фокус) |
| `accent.emphasis` | `#1f6feb` | Кнопки действия (Accent buttons), бейджи |
| `accent.subtle` | `rgba(56, 139, 253, 0.15)` | Подсветка строк, выбранные элементы |
| `success.fg` | `#3fb950` | Зеленый статус (Open Issue, Success checks) |
| `success.emphasis` | `#238636` | Основная зеленая кнопка (Primary Action button) |
| `success.subtle` | `rgba(46, 160, 67, 0.15)` | Фоновая подложка успешных статусов |
| `attention.fg` | `#d29922` | Желто-оранжевый (Внимание, PR Review required, Draft) |
| `attention.emphasis` | `#9e6a03` | Заливка предупреждений |
| `attention.subtle` | `rgba(187, 128, 9, 0.15)` | Фон плашек внимания |
| `danger.fg` | `#f85149` | Красный статус (Closed Issue, Failed CI) |
| `danger.emphasis` | `#da3633` | Кнопка удаления/опасного действия |
| `danger.subtle` | `rgba(248, 81, 73, 0.15)` | Фон сообщений об ошибках |
| `done.fg` | `#a371f7` | Фиолетовый (Merged PR, Completed Issue) |
| `done.emphasis` | `#8957e5` | Заливка для объединенных PR |
| `done.subtle` | `rgba(163, 113, 247, 0.15)` | Фон статуса Merged |
| `sponsors.fg` | `#db61a2` | Розовый (GitHub Sponsors, спонсорство) |

---

### 1.2. Light Mode (Default Light)

| Семантический токен Primer | HEX / HSL | Использование в UI |
|---|---|---|
| `canvas.default` | `#ffffff` | Основной фон страницы |
| `canvas.subtle` | `#f6f8fa` | Сайдбар, заголовки таблиц, подложка карточек |
| `canvas.inset` | `#eff2f5` | Поля поиска, кодовые вставки |
| `canvas.overlay` | `#ffffff` | Модальные окна, выпадающие списки |
| `border.default` | `#d0d7de` | Основные границы элементов |
| `border.muted` | `hsla(210, 18%, 87%, 1)` | Второстепенные разделители |
| `border.subtle` | `rgba(31, 35, 40, 0.08)` | Легкие внутренние границы |
| `fg.default` | `#1f2328` | Основной темный текст |
| `fg.muted` | `#656d76` | Второстепенный серый текст |
| `fg.subtle` | `#8c959f` | Неактивный текст и иконки |
| `fg.onEmphasis` | `#ffffff` | Белый текст на залитых кнопках |
| `accent.fg` | `#0969da` | Акцентные ссылки и иконки |
| `accent.emphasis` | `#0969da` | Акцентные кнопки |
| `accent.subtle` | `#ddf4ff` | Подложка активных элементов |
| `success.fg` | `#1a7f37` | Зеленый текст статусов |
| `success.emphasis` | `#1f883d` | Основная зеленая кнопка создания/отправки |
| `success.subtle` | `#dafbe1` | Фон статуса Open Issue |
| `attention.fg` | `#9a6700` | Текст предупреждения |
| `attention.emphasis` | `#9a6700` | Акцент внимания |
| `attention.subtle` | `#fff8c5` | Фон предупреждающих баннеров |
| `danger.fg` | `#d1242f` | Ошибки и закрытые тикеты |
| `danger.emphasis` | `#cf222e` | Опасные кнопки |
| `danger.subtle` | `#ffebe9` | Фон ошибок и удалений |
| `done.fg` | `#8250df` | Текст статуса Merged |
| `done.emphasis` | `#8250df` | Заливка Merged PR |
| `done.subtle` | `#fbefff` | Фон объединенного PR |

---

### 1.3. Contribution Activity Heatmap Colors (5-Level Matrix)

#### Dark Mode
- **Level 0 (No activity):** `#161b22` (сетка/ячейка по умолчанию `#161b22`, граница `#30363d`)
- **Level 1 (Low):** `#0e4429`
- **Level 2 (Medium-Low):** `#006d32`
- **Level 3 (Medium-High):** `#26a641`
- **Level 4 (High):** `#39d353`

#### Light Mode
- **Level 0 (No activity):** `#ebedf0`
- **Level 1 (Low):** `#9be9a8`
- **Level 2 (Medium-Low):** `#40c463`
- **Level 3 (Medium-High):** `#30a14e`
- **Level 4 (High):** `#216e39`

---

## 2. Типографика (Typography Scale)

GitHub Primer использует нативный системный стек шрифтов для максимальной скорости рендеринга и органичного вида на каждой ОС.

### 2.1. Font Families
- **UI Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
- **Monospace / Code Stack:** `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`

### 2.2. Type Scale & Weights

| Уровень | Размер (px / rem) | Line-Height | Font-Weight | Применение |
|---|---|---|---|---|
| **Title / Hero** | `32px` / `2rem` | `1.25` (40px) | `600` (Semi-bold) | Заголовки лендингов, спец-страниц |
| **H1 (Display)** | `24px` / `1.5rem` | `1.25` (30px) | `600` (Semi-bold) | Название репозитория, заголовок Issue/PR |
| **H2** | `20px` / `1.25rem` | `1.3` (26px) | `600` (Semi-bold) | Заголовки секций профиля, сайдбаров |
| **H3** | `16px` / `1rem` | `1.375` (22px) | `600` (Semi-bold) | Заголовки карточек, групп списков |
| **Body (Default)** | `14px` / `0.875rem` | `1.428` (20px) | `400` / `500` / `600` | Основной интерфейсный текст, комментарии, кнопки |
| **Small / Caption**| `12px` / `0.75rem` | `1.333` (16px) | `400` / `500` | Временные метки, бейджи, счетчики, хинты |
| **Code Inline** | `12px` - `13px` | `1.4` | `400` (Mono) | Инлайн фрагменты кода, SHA коммитов |

---

## 3. Скругления (Border Radius)

| Токен Primer | Значение (px) | Назначение |
|---|---|---|
| `borderRadius-small` | `3px` | Маленькие бейджи, теги статуса CI, метки коммитов |
| `borderRadius-medium` | `6px` | **Базовый стандарт GitHub:** Кнопки, инпуты, селекты, карточки |
| `borderRadius-large` | `8px` | Выпадающие меню (ActionMenu), диалоги настроек |
| `borderRadius-xlarge` | `12px` | Модальные окна, Bottom Sheets в мобильном интерфейсе |
| `borderRadius-full` | `9999px` (Pill) | Фильтр-чипсы, круглые счетчики, аватары пользователей |

---

## 4. Отступы и сетка (4px Base Grid)

GitHub Primer строго придерживается 4-пиксельной сетки:

| Токен | px | rem | Применение |
|---|---|---|---|
| `space-1` | `4px` | `0.25rem` | Зазор между иконкой и текстом, паддинг компактных бейджей |
| `space-2` | `8px` | `0.5rem` | Внутренний вертикальный отступ кнопок, зазор между чипсами |
| `space-3` | `12px` | `0.75rem` | Горизонтальный отступ инпутов и кнопок |
| `space-4` | `16px` | `1.0rem` | Стандартный внутренний паддинг карточек, списков, панелей |
| `space-5` | `24px` | `1.5rem` | Отступ между секциями страницы |
| `space-6` | `32px` | `2.0rem` | Отступ основных колонок десктопного макета |
| `space-7` | `40px` | `2.5rem` | Большие отступы разделов |
| `space-8` | `48px` | `3.0rem` | Отступ подвала/шапки |

---

## 5. Тени и Elevation

GitHub использует сдержанные тени с четкой контурной обводкой:

```css
/* Dark Mode Elevation */
--shadow-sm: 0 0 0 1px #30363d;
--shadow-md: 0 3px 6px rgba(1, 4, 9, 0.4), 0 0 0 1px #30363d;
--shadow-lg: 0 8px 24px rgba(1, 4, 9, 0.6), 0 0 0 1px #30363d;
--shadow-inset: inset 0 1px 0 rgba(1, 4, 9, 0.2);

/* Light Mode Elevation */
--shadow-sm: 0 1px 0 rgba(31, 35, 40, 0.04);
--shadow-md: 0 3px 6px rgba(140, 149, 159, 0.15), 0 0 0 1px #d0d7de;
--shadow-lg: 0 8px 24px rgba(140, 149, 159, 0.2), 0 0 0 1px #d0d7de;
--shadow-inset: inset 0 1px 2px rgba(31, 35, 40, 0.075);
```

---

## 6. Конфигурация Tailwind CSS + CSS Variables (shadcn/ui ready)

### 6.1. `globals.css` (CSS Variables)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* GitHub Light Mode */
    --background: 0 0% 100%;             /* #ffffff */
    --foreground: 213 13% 14%;           /* #1f2328 */

    --card: 0 0% 100%;                   /* #ffffff */
    --card-foreground: 213 13% 14%;      /* #1f2328 */

    --popover: 0 0% 100%;
    --popover-foreground: 213 13% 14%;

    --muted: 210 24% 97%;                /* #f6f8fa (canvas.subtle) */
    --muted-foreground: 210 8% 43%;      /* #656d76 (fg.muted) */

    --border: 210 18% 87%;               /* #d0d7de */
    --input: 210 18% 87%;

    --primary: 137 63% 33%;              /* #1f883d (GitHub Green) */
    --primary-foreground: 0 0% 100%;

    --secondary: 210 24% 97%;            /* #f6f8fa */
    --secondary-foreground: 213 13% 14%;

    --accent: 212 92% 45%;               /* #0969da (GitHub Blue) */
    --accent-foreground: 0 0% 100%;

    --destructive: 356 72% 47%;          /* #cf222e */
    --destructive-foreground: 0 0% 100%;

    --ring: 212 92% 45%;
    --radius: 0.375rem;                  /* 6px */

    /* Custom Primer Tokens */
    --canvas-default: #ffffff;
    --canvas-subtle: #f6f8fa;
    --canvas-inset: #eff2f5;
    --canvas-overlay: #ffffff;
    --fg-default: #1f2328;
    --fg-muted: #656d76;
    --fg-subtle: #8c959f;
    --border-default: #d0d7de;
    --border-muted: #e1e4e8;
    --success-fg: #1a7f37;
    --success-bg: #dafbe1;
    --danger-fg: #d1242f;
    --danger-bg: #ffebe9;
    --attention-fg: #9a6700;
    --attention-bg: #fff8c5;
    --done-fg: #8250df;
    --done-bg: #fbefff;
  }

  .dark {
    /* GitHub Dark Mode (Default) */
    --background: 216 28% 7%;            /* #0d1117 */
    --foreground: 210 50% 96%;           /* #f0f6fc */

    --card: 215 21% 11%;                 /* #161b22 */
    --card-foreground: 210 50% 96%;

    --popover: 216 18% 15%;              /* #1f242c */
    --popover-foreground: 210 50% 96%;

    --muted: 215 21% 11%;                /* #161b22 */
    --muted-foreground: 214 9% 58%;      /* #8b949e */

    --border: 214 12% 21%;               /* #30363d */
    --input: 214 12% 21%;

    --primary: 134 59% 33%;              /* #238636 (GitHub Green Button) */
    --primary-foreground: 0 0% 100%;

    --secondary: 215 21% 11%;            /* #161b22 */
    --secondary-foreground: 210 50% 96%;

    --accent: 213 100% 67%;              /* #58a6ff */
    --accent-foreground: 0 0% 100%;

    --destructive: 357 74% 53%;          /* #da3633 */
    --destructive-foreground: 0 0% 100%;

    --ring: 213 100% 67%;
    --radius: 0.375rem;

    /* Custom Primer Tokens */
    --canvas-default: #0d1117;
    --canvas-subtle: #161b22;
    --canvas-inset: #010409;
    --canvas-overlay: #1f242c;
    --fg-default: #f0f6fc;
    --fg-muted: #8b949e;
    --fg-subtle: #6e7681;
    --border-default: #30363d;
    --border-muted: #21262d;
    --success-fg: #3fb950;
    --success-bg: rgba(46, 160, 67, 0.15);
    --danger-fg: #f85149;
    --danger-bg: rgba(248, 81, 73, 0.15);
    --attention-fg: #d29922;
    --attention-bg: rgba(187, 128, 9, 0.15);
    --done-fg: #a371f7;
    --done-bg: rgba(163, 113, 247, 0.15);
  }
}
```

### 6.2. `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Прямой доступ к Primer Tokens
        gh: {
          canvas: {
            default: "var(--canvas-default)",
            subtle: "var(--canvas-subtle)",
            inset: "var(--canvas-inset)",
            overlay: "var(--canvas-overlay)",
          },
          fg: {
            default: "var(--fg-default)",
            muted: "var(--fg-muted)",
            subtle: "var(--fg-subtle)",
          },
          border: {
            default: "var(--border-default)",
            muted: "var(--border-muted)",
          },
          success: {
            fg: "var(--success-fg)",
            bg: "var(--success-bg)",
          },
          danger: {
            fg: "var(--danger-fg)",
            bg: "var(--danger-bg)",
          },
          attention: {
            fg: "var(--attention-fg)",
            bg: "var(--attention-bg)",
          },
          done: {
            fg: "var(--done-fg)",
            bg: "var(--done-bg)",
          },
          heatmap: {
            0: "#161b22",
            1: "#0e4429",
            2: "#006d32",
            3: "#26a641",
            4: "#39d353",
          }
        },
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Noto Sans"',
          "Helvetica",
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          '"SF Mono"',
          "Menlo",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      boxShadow: {
        "gh-sm": "var(--shadow-sm)",
        "gh-md": "var(--shadow-md)",
        "gh-lg": "var(--shadow-lg)",
      },
      screens: {
        sm: "544px",
        md: "768px",
        lg: "1012px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```
