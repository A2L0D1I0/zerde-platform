# GitHub Primer: Библиотека Компонентов (React + Tailwind CSS)

Готовые спецификации и код компонентов в стиле **GitHub Primer / shadcn/ui**, сверстанные с использованием React, Lucide Icons (или Octicons) и Tailwind CSS.

---

## 1. Button (Кнопки)

GitHub Primer имеет 4 основных типа кнопок и поддержку счетчиков (CounterBadge).

```tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium text-sm transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        // Стандартная кнопка (Secondary / Default)
        default:
          "bg-gh-canvas-subtle dark:bg-[#21262d] text-gh-fg-default border border-gh-border-default hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] active:bg-[#ebecf0] dark:active:bg-[#282e33] shadow-sm",
        // Зеленая основная кнопка (Primary Action)
        primary:
          "bg-[#1f883d] dark:bg-[#238636] text-white border border-[rgba(27,31,36,0.15)] dark:border-[rgba(240,246,252,0.1)] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] active:bg-[#187733] shadow-sm font-semibold",
        // Опасное действие (Danger / Red)
        danger:
          "bg-gh-canvas-subtle dark:bg-[#21262d] text-[#cf222e] dark:text-[#f85149] border border-gh-border-default hover:bg-[#cf222e] hover:text-white dark:hover:bg-[#da3633] dark:hover:text-white active:opacity-90 shadow-sm",
        // Призрачная кнопка (Invisible / Ghost)
        invisible:
          "bg-transparent text-gh-fg-default hover:bg-gh-canvas-subtle dark:hover:bg-[#21262d] active:bg-gh-border-default",
        // Акцентная синяя кнопка (Accent)
        accent:
          "bg-[#0969da] dark:bg-[#1f6feb] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] shadow-sm",
      },
      size: {
        sm: "h-7 px-2.5 text-xs rounded-[6px]",
        md: "h-8 px-3 text-sm rounded-[6px]",
        lg: "h-10 px-4 text-base rounded-[6px]",
        icon: "h-8 w-8 p-0 rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  count?: number;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  children,
  count,
  ...props
}) => {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
      {typeof count === "number" && (
        <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-gh-border-default/40 text-gh-fg-muted dark:bg-[#30363d] dark:text-[#8b949e]">
          {count}
        </span>
      )}
    </button>
  );
};
```

---

## 2. Badges & Labels (Бейджи статусов и метки)

```tsx
import React from "react";

// Бейдж статуса Issue / Pull Request
interface StatusBadgeProps {
  status: "open" | "closed" | "merged" | "draft";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    open: {
      label: "Open",
      bg: "bg-[#1f883d] dark:bg-[#238636]",
      text: "text-white",
      dot: "🟢",
    },
    closed: {
      label: "Closed",
      bg: "bg-[#8250df] dark:bg-[#8957e5]",
      text: "text-white",
      dot: "🔴",
    },
    merged: {
      label: "Merged",
      bg: "bg-[#8250df] dark:bg-[#8957e5]",
      text: "text-white",
      dot: "🟣",
    },
    draft: {
      label: "Draft",
      bg: "bg-[#656d76] dark:bg-[#6e7681]",
      text: "text-white",
      dot: "⚪",
    },
  };

  const current = configs[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${current.bg} ${current.text}`}
    >
      <span>{current.dot}</span>
      {current.label}
    </span>
  );
};

// Цветная метка репозитория (Repository Label)
interface IssueLabelProps {
  name: string;
  colorHex: string; // например: "d73a4a" или "a2eeef"
  description?: string;
}

export const IssueLabel: React.FC<IssueLabelProps> = ({ name, colorHex, description }) => {
  return (
    <span
      title={description}
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border"
      style={{
        backgroundColor: `#${colorHex}25`, // 15% прозрачности
        borderColor: `#${colorHex}66`,
        color: `#${colorHex}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full mr-1.5"
        style={{ backgroundColor: `#${colorHex}` }}
      />
      {name}
    </span>
  );
};
```

---

## 3. Input & Search Bar (Поле поиска с шорткатом)

```tsx
import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string; // e.g. "/" or "⌘K"
}

export const SearchInput: React.FC<SearchInputProps> = ({
  shortcut = "/",
  placeholder = "Search or jump to...",
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full max-w-sm">
      <Search className="absolute left-2.5 w-4 h-4 text-gh-fg-muted pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-8 pl-8 pr-8 text-xs sm:text-sm bg-gh-canvas-inset dark:bg-[#010409] text-gh-fg-default border border-gh-border-default dark:border-[#30363d] rounded-md placeholder:text-gh-fg-subtle focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] transition-all"
        {...props}
      />
      {shortcut && (
        <span className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-gh-fg-muted bg-gh-canvas-subtle dark:bg-[#161b22] border border-gh-border-default dark:border-[#30363d] rounded shadow-sm pointer-events-none">
          {shortcut}
        </span>
      )}
    </div>
  );
};
```

---

## 4. Activity Calendar / Heatmap (Тепловая карта активности)

```tsx
import React from "react";

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface HeatmapProps {
  data: HeatmapDay[]; // массив дней за период (например, 52 недели x 7 дней)
  year?: number;
}

const colorLevelsDark = {
  0: "bg-[#161b22] border border-[#30363d]/40",
  1: "bg-[#0e4429] border border-transparent",
  2: "bg-[#006d32] border border-transparent",
  3: "bg-[#26a641] border border-transparent",
  4: "bg-[#39d353] border border-transparent",
};

export const ActivityHeatmap: React.FC<HeatmapProps> = ({ data, year = 2026 }) => {
  return (
    <div className="p-4 bg-gh-canvas-subtle dark:bg-[#161b22] border border-gh-border-default dark:border-[#30363d] rounded-lg">
      <div className="flex items-center justify-between mb-3 text-xs text-gh-fg-muted">
        <span className="font-semibold text-gh-fg-default">
          {data.reduce((acc, curr) => acc + curr.count, 0)} contributions in {year}
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <span
              key={lvl}
              className={`w-2.5 h-2.5 rounded-[2px] ${colorLevelsDark[lvl]}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Горизонтально скроллируемая сетка */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {data.map((day) => (
            <div
              key={day.date}
              title={`${day.count} contributions on ${day.date}`}
              className={`w-3 h-3 rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${colorLevelsDark[day.level]}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 5. Navigation Tabs (UnderlineNav)

```tsx
import React from "react";

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  active?: boolean;
}

interface UnderlineNavProps {
  tabs: TabItem[];
  onSelectTab: (id: string) => void;
}

export const UnderlineNav: React.FC<UnderlineNavProps> = ({ tabs, onSelectTab }) => {
  return (
    <nav className="flex items-center gap-2 border-b border-gh-border-default dark:border-[#30363d] overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            tab.active
              ? "text-gh-fg-default font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#fd8c73] dark:after:bg-[#f78166]"
              : "text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle/50 dark:hover:bg-[#21262d]/50 rounded-t-md"
          }`}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span>{tab.label}</span>
          {typeof tab.count === "number" && (
            <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-gh-canvas-subtle dark:bg-[#30363d] text-gh-fg-muted">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};
```

---

## 6. Markdown Callout / Alert Blocks

```tsx
import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";

type AlertType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

const alertStyles: Record<
  AlertType,
  { border: string; text: string; icon: React.ReactNode; title: string }
> = {
  NOTE: {
    border: "border-l-[#0969da] dark:border-l-[#58a6ff]",
    text: "text-[#0969da] dark:text-[#58a6ff]",
    icon: <Info className="w-4 h-4" />,
    title: "Note",
  },
  TIP: {
    border: "border-l-[#1a7f37] dark:border-l-[#3fb950]",
    text: "text-[#1a7f37] dark:text-[#3fb950]",
    icon: <Lightbulb className="w-4 h-4" />,
    title: "Tip",
  },
  IMPORTANT: {
    border: "border-l-[#8250df] dark:border-l-[#a371f7]",
    text: "text-[#8250df] dark:text-[#a371f7]",
    icon: <AlertCircle className="w-4 h-4" />,
    title: "Important",
  },
  WARNING: {
    border: "border-l-[#9a6700] dark:border-l-[#d29922]",
    text: "text-[#9a6700] dark:text-[#d29922]",
    icon: <AlertTriangle className="w-4 h-4" />,
    title: "Warning",
  },
  CAUTION: {
    border: "border-l-[#cf222e] dark:border-l-[#f85149]",
    text: "text-[#cf222e] dark:text-[#f85149]",
    icon: <ShieldAlert className="w-4 h-4" />,
    title: "Caution",
  },
};

export const MarkdownAlert: React.FC<{
  type: AlertType;
  children: React.ReactNode;
}> = ({ type, children }) => {
  const config = alertStyles[type];

  return (
    <div
      className={`my-4 p-4 pl-4 border-l-[3.5px] bg-gh-canvas-subtle/50 dark:bg-[#161b22]/50 ${config.border} rounded-r-md`}
    >
      <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${config.text}`}>
        {config.icon}
        <span>{config.title}</span>
      </div>
      <div className="text-sm text-gh-fg-default leading-relaxed">{children}</div>
    </div>
  );
};
```
