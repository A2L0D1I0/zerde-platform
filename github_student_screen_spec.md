# 🐙 Спецификация Главного Экрана Ученика (GitHub Primer Edition)

> **Документ:** `github_student_screen_spec.md`  
> **Дизайн-код:** GitHub Primer Mobile & Web Design System (Dark Canvas `#0d1117`, Cards `#161b22`, Borders `#30363d`, Accent `#58a6ff`, Success `#238636`/`#3fb950`, Attention `#d29922`, Done `#a371f7`).  
> **Основа:** Официальный мастер-план `MASTER_PLAN.md` (Двухфакторный цикл тем, 4 уровня ELO, Сократический «Аға», 3-минутный фокус, казахский/русский/английский языки).  
> **Файл оригинала:** `student.md` сохранён без изменений.

---

## 📱 1. Визуальный Вайрфрейм Экрана (Mobile Primer Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. GLOBAL APP HEADER (Canvas Default: #0d1117, Border Bottom: #30363d)      │
│    [ 👤 Азамат Қ. (9 «А») ]  [ 🦅 Қыран: 1420 ELO ]  [ 🔥 12 ]  [ 🇰🇿 KZ ▾ ]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. GITHUB ACTIVITY HEATMAP (Сетка учебной активности за четверть):          │
│    Оқу белсенділігі (12 күн қатарынан • 84 микро-жаттығу):                   │
│    [■][■][■][■][■][■][■][■][■][■][■][■]  ■ Бастауыш ➔ ■ Қарқынды (5 деңгей)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PINNED FOCUS CARD (Карточка предмета в стиле Pinned Repository):         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📐 Алгебра 9 сынып            [ 1435 ELO ]  [ Болжам: 38/40 балл ⭐ ]   │ │
│ │                                                                         │ │
│ │ 🎯 Бүгінгі 3 минуттық фокус:                                            │ │
│ │ Квадраттық теңсіздіктер (Интервалдар әдісі)                             │ │
│ │ ℹ️ Кеше таңбаларды анықтаудан қателестің. Осы 1 ережені бекітсек      │ │
│ │    емтихан болжамың 39-ға өседі.                                        │ │
│ │                                                                         │ │
│ │ [ ▶️ Жаттығуды бастау (3 мин) ]  (Primary Green Button: #238636)       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│    Пагинация предметов:  ●  ○  ○  ○  ○  ○  (6 пән)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ТОҚСАН ТАҚЫРЫПТАРЫ (Список тем в стиле GitHub Issues / Pull Requests):   │
│    1-тоқсан бағдарламасы (СОР/СОЧ-қа дейін сақталады):                      │
│                                                                             │
│    🟣 [✓ Усвоено]   #01 Сызықтық теңдеулер            (Мұғалім бекітті ✓)   │
│    🟡 [⏳ Тексеруде] #02 Виет теоремасы                (ИИ қабылдады 🤖)     │
│    🟢 [● Орындауда] #03 Квадраттық теңсіздіктер        (Бүгінгі сабақ 🎯)    │
│    ⚪ [○ Кезекте]   #04 Бөлшек-рационал теңсіздіктер   (1-тоқсан)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. GITHUB MARKDOWN CALLOUT (Блок интервального повторения формул):          │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ > [!NOTE] 🎴 Жадты бекіту (Spaced Repetition)                           │ │
│ │ 1-тоқсанның 3 формуласы қайталауды күтуде (1 минут) ➔ [ Қайталау ]      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. BOTTOM NAVIGATION (GitHub Mobile 56px Bar, 4 Tab Items):                 │
│    [ 🏠 Басты ]      [ 📚 Пәндер ]      [ 🎯 Тапсырма ]      [ 📊 Прогресс ]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 2. Привязка к Дизайн-Токенам GitHub Primer

| Элемент UI | GitHub Token | Hex / Значение | Роль в интерфейсе |
| :--- | :--- | :--- | :--- |
| **Фон страницы** | `canvas.default` | `#0d1117` | Глубокий, строгий темный фон |
| **Фон карточек** | `canvas.subtle` / `overlay` | `#161b22` | Контрастные блоки без эффекта мыла |
| **Границы блоков** | `border.default` | `#30363d` | Тонкие 1px рамки |
| **Главная кнопка действия** | `btn.primary` | `#238636` (Hover `#2ea043`) | Зеленая кнопка «Начать тренировку (3 мин)» |
| **Основной текст** | `fg.default` | `#f0f6fc` | Максимальная контрастность и читаемость |
| **Второстепенный текст** | `fg.muted` | `#8b949e` | Подписи, тайминги, пояснения |
| **Бейдж «Усвоено»** | `done.fg` / `done.subtle` | `#a371f7` (Текст) / `#271052` (Фон) | Тема принята и закрыта учителем |
| **Бейдж «Ожидает зачета»** | `attention.fg` | `#d29922` (Текст) / `#3b2300` (Фон) | ИИ зафиксировал, ждет подтверждения |
| **Бейдж «В работе»** | `success.fg` | `#3fb950` (Текст) / `#0f351d` (Фон) | Текущий активный фокус |
| **Акцентные ссылки** | `accent.fg` | `#58a6ff` | Кликабельные заголовки и ссылки |

---

## 🧩 3. Детальный Разбор Зон Экрана

### Зона 1: Профиль и Хедер (Header Bar)
* **Аватар и Имя:** Аватар с 2px рамкой `#30363d`, имя `Азамат Қалиев`, класс `9 «А»`.
* **ELO-Бейдж:** Индикатор ранга по системе 4 уровней:
  * 🌱 `ӨСКІН` (1000–1199)
  * 🌿 `ТҰҒЫР` (1200–1399)
  * 🦅 **`ҚЫРАН: 1420 ELO`** (1400–1599) — статус текущего ученика.
  * ⭐ `САМҒАУ` (1600+)
* **Стрик 🔥:** Капсула `🔥 12 күн` (оранжево-янтарный бейдж GitHub Attention).
* **Языковой переключатель:** Селектор `[ 🇰🇿 KZ | 🇷🇺 RU | 🇬🇧 EN ]` с сохранением состояния.

### Зона 2: Сетка активности (GitHub Contribution Heatmap)
* **Назначение:** Наглядная геймификация и визуализация непрерывности обучения.
* **Формат:** Горизонтальная матрица дней текущей четверти.
* **Шкала 5 уровней зелёного цвета:**
  * Уровень 0 (нет занятий): `#161b22`
  * Уровень 1 (1 мини-урок): `#0e4429`
  * Уровень 2 (2 мини-урока): `#006d32`
  * Уровень 3 (3-4 урока / СОР): `#26a641`
  * Уровень 4 (5+ уроков / Закрыта тема): `#39d353`

### Зона 3: Карточка Фокуса Дня (Pinned Subject Focus)
* Оформлена по стандарту **Pinned Repository** в GitHub.
* **Заголовок:** Иконка предмета `📐`, название `Алгебра 9`, теги `1435 ELO` и `Болжам: 38/40 балл`.
* **Фокусная микро-цель:** `Квадраттық теңсіздіктер (Интервалдар әдісі)`.
* **Сократическое обоснование от «Аға»:** Короткое объяснение в 2 строки, почему именно эта тема выбрана сегодня (анализ ошибок вчерашнего дня).
* **Главный CTA:** Большая зеленая кнопка `▶️ Жаттығуды бастау (3 минут)` (`bg-[#238636]`).
* **Карусель:** Свайп влево-вправо переключает предметы (Физика, Химия, Қазақ тілі, Геометрия, Биология).

### Зона 4: Жизненный цикл тем четверти (Quarter Issues List)
* Оформлен по стандарту **GitHub Issues List**:
* Каждая тема имеет свой порядковый номер (`#01`, `#02`...) и двухфакторный статус:
  1. 🟣 **`[✓ Усвоено]`** — тема сдана, учитель подтвердил понимание.
  2. 🟡 **`[⏳ Ожидает зачета]`** — ученик прошел тренажер ИИ, ждет финального клика учителя.
  3. 🟢 **`[● В работе]`** — тема изучается прямо сейчас (открывается 3-минутный тренажер).
  4. ⚪ **`[○ В очереди]`** — тема программы 1-й четверти, запланированная на следующие недели.
* Все темы хранятся до конца четверти для комфортного повторения перед СОР и СОЧ.

### Зона 5: Блок повторения (Spaced Repetition Alert)
* Оформлен в виде официального **GitHub Primer Markdown Callout**:
  ```markdown
  > [!NOTE]
  > **Жадты бекіту (Интервалды қайталау):** 3 өткен формула қайталауға дайын.
  ```
* Занимает ровно 1 минуту, обновляет кратковременную память.

### Зона 6: Нижняя навигация (GitHub Mobile Bottom Bar)
* Фиксированная высота `56px`, фон `#161b22`, граница top `#30363d`.
* 4 раздела:
  1. `🏠 Басты` (Home)
  2. `📚 Пәндер` (Subjects & Curricula)
  3. `🎯 Тапсырма` (Tasks / Socratic Trainer)
  4. `📊 Прогресс` (Analytics & ELO Matrix)

---

## 💻 4. React / Tailwind Код Макет Экрана

```tsx
import React from 'react';
import { 
  Flame, 
  Award, 
  Play, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Circle, 
  ChevronRight, 
  BookOpen, 
  Home, 
  Target, 
  BarChart2, 
  Layers 
} from 'lucide-react';

export default function GitHubStudentHomeScreen() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans antialiased pb-20">
      
      {/* 1. GLOBAL HEADER */}
      <header className="sticky top-0 z-30 bg-[#0d1117]/95 backdrop-blur border-b border-[#30363d] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center font-semibold text-sm text-[#58a6ff]">
              АҚ
            </div>
            <div>
              <div className="text-sm font-semibold text-[#f0f6fc] leading-tight">Азамат Қалиев</div>
              <div className="text-xs text-[#8b949e]">9 «А» сынып • NIS IB</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* ELO Rank Badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-medium text-[#f0f6fc]">
              <span>🦅</span>
              <span className="text-[#3fb950] font-semibold">1420</span>
              <span className="text-[#8b949e]">ELO</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#271052] border border-[#a371f7]/40 text-xs font-semibold text-[#d2a8ff]">
              <Flame className="w-3.5 h-3.5 text-[#f0883e]" fill="#f0883e" />
              <span>12</span>
            </div>

            {/* Lang Switcher */}
            <button className="px-2 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-medium text-[#c9d1d9] transition">
              KZ
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* 2. GITHUB CONTRIBUTION HEATMAP */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-semibold text-[#c9d1d9] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
              Оқу белсенділігі (1-тоқсан)
            </span>
            <span className="text-[#8b949e]">12 күн қатарынан 🔥</span>
          </div>

          {/* Heatmap Grid Demo */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {[3, 4, 2, 4, 3, 4, 4, 2, 3, 4, 4, 4, 0, 0].map((level, idx) => {
              const bgColors = [
                'bg-[#21262d]',
                'bg-[#0e4429]',
                'bg-[#006d32]',
                'bg-[#26a641]',
                'bg-[#39d353]'
              ];
              return (
                <div 
                  key={idx} 
                  className={`w-4 h-4 rounded-sm ${bgColors[level]} border border-[#30363d]/50 flex-shrink-0`}
                  title={`Күн ${idx + 1}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8b949e] mt-2">
            <span>84 микро-тапсырма орындалды</span>
            <span className="flex items-center gap-1">
              Аз <span className="w-2 h-2 rounded-xs bg-[#21262d] inline-block" />
              <span className="w-2 h-2 rounded-xs bg-[#39d353] inline-block" /> Көп
            </span>
          </div>
        </section>

        {/* 3. PINNED FOCUS CARD (ALGEBRA 9) */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📐</span>
              <div>
                <h2 className="text-sm font-semibold text-[#58a6ff] hover:underline cursor-pointer">
                  Алгебра 9 сынып
                </h2>
                <div className="text-[11px] text-[#8b949e]">1-тоқсан • 1435 ELO</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#1f2937] border border-[#374151] text-[#3fb950]">
              Болжам: 38/40 ⭐
            </span>
          </div>

          <div className="mt-3 bg-[#0d1117] border border-[#30363d] rounded-md p-3">
            <div className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
              Бүгінгі 3 минуттық фокус:
            </div>
            <p className="text-xs text-[#c9d1d9] font-medium">
              Квадраттық теңсіздіктер (Интервалдар әдісі)
            </p>
            <p className="text-[11px] text-[#8b949e] mt-1.5 leading-relaxed">
              💡 Кеше таңбаларды анықтаудан қателестің. Осы 1 ережені бекітсек емтихан болжамың 39-ға өседі.
            </p>
          </div>

          {/* Primary Action Button */}
          <button className="mt-3 w-full py-2.5 px-4 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-sm">
            <Play className="w-4 h-4 fill-white" />
            <span>Жаттығуды бастау (3 минут)</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-1.5 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#30363d]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#30363d]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#30363d]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#30363d]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#30363d]" />
          </div>
        </section>

        {/* 4. QUARTER TOPICS LIST (GITHUB ISSUES STYLE) */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg divide-y divide-[#30363d]">
          <div className="p-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#f0f6fc]">1-тоқсан тақырыптары</span>
            <span className="text-[#8b949e]">Барлығы 4 тақырып</span>
          </div>

          {/* Topic 1: Mastered */}
          <div className="p-3 flex items-start justify-between hover:bg-[#1c2128] transition cursor-pointer">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#a371f7] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#f0f6fc]">
                  #01 Сызықтық теңдеулер мен теңсіздіктер
                </div>
                <div className="text-[11px] text-[#8b949e] mt-0.5">
                  Мұғалім бекітті • СОР-ға дайын
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#271052] text-[#a371f7] border border-[#a371f7]/40 flex-shrink-0">
              Усвоено
            </span>
          </div>

          {/* Topic 2: Pending Teacher Approval */}
          <div className="p-3 flex items-start justify-between hover:bg-[#1c2128] transition cursor-pointer">
            <div className="flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-[#d29922] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#f0f6fc]">
                  #02 Виет теоремасы және квадрат үшмүше
                </div>
                <div className="text-[11px] text-[#8b949e] mt-0.5">
                  ИИ қабылдады • Мұғалім растауын күтуде
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3b2300] text-[#d29922] border border-[#d29922]/40 flex-shrink-0">
              Ожидает
            </span>
          </div>

          {/* Topic 3: In Progress (Today's Focus) */}
          <div className="p-3 flex items-start justify-between bg-[#0d1117]/40 hover:bg-[#1c2128] transition cursor-pointer">
            <div className="flex items-start space-x-2.5">
              <CircleDot className="w-4 h-4 text-[#3fb950] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#58a6ff]">
                  #03 Квадраттық теңсіздіктер (Интервалдар)
                </div>
                <div className="text-[11px] text-[#3fb950] mt-0.5 font-medium">
                  ● Бүгінгі сабақ • 3 мин жаттығу
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0f351d] text-[#3fb950] border border-[#3fb950]/40 flex-shrink-0">
              В работе
            </span>
          </div>

          {/* Topic 4: Queued */}
          <div className="p-3 flex items-start justify-between hover:bg-[#1c2128] transition cursor-pointer opacity-75">
            <div className="flex items-start space-x-2.5">
              <Circle className="w-4 h-4 text-[#8b949e] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#8b949e]">
                  #04 Бөлшек-рационал теңсіздіктер
                </div>
                <div className="text-[11px] text-[#484f58] mt-0.5">
                  1-тоқсан жоспарында
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#21262d] text-[#8b949e] border border-[#30363d] flex-shrink-0">
              Кезекте
            </span>
          </div>
        </section>

        {/* 5. GITHUB MARKDOWN CALLOUT (SPACED REPETITION) */}
        <section className="bg-[#161b22] border-l-4 border-l-[#58a6ff] border border-[#30363d] rounded-r-lg p-3 flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <div className="text-xs font-semibold text-[#58a6ff] flex items-center gap-1.5">
              <span>🎴</span> Жадты бекіту (Spaced Repetition)
            </div>
            <p className="text-[11px] text-[#8b949e]">
              1-тоқсанның 3 формуласы қайталауды күтуде (1 мин)
            </p>
          </div>
          <button className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-medium text-[#f0f6fc] flex items-center gap-1 transition flex-shrink-0">
            <span>Қайталау</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8b949e]" />
          </button>
        </section>

      </main>

      {/* 6. GITHUB MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#161b22] border-t border-[#30363d] px-4 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          <button className="flex flex-col items-center justify-center py-1 text-[#58a6ff]">
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Басты</span>
          </button>

          <button className="flex flex-col items-center justify-center py-1 text-[#8b949e] hover:text-[#f0f6fc]">
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Пәндер</span>
          </button>

          <button className="flex flex-col items-center justify-center py-1 text-[#8b949e] hover:text-[#f0f6fc]">
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Тапсырма</span>
          </button>

          <button className="flex flex-col items-center justify-center py-1 text-[#8b949e] hover:text-[#f0f6fc]">
            <BarChart2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Прогресс</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
```

---

## 📦 5. Строгий JSON-Контракт API (Backend Data Contract)

```json
{
  "student": {
    "id": "ST_KZ_09_042",
    "name": "Азамат Қалиев",
    "grade": "9 «А»",
    "school": "NIS IB Astana",
    "selected_language": "KZ",
    "overall_elo": 1420,
    "elo_rank": {
      "level": "Қыран",
      "symbol": "🦅",
      "min_elo": 1400,
      "max_elo": 1599
    },
    "streak": {
      "days": 12,
      "is_active_today": true
    },
    "quarter": {
      "number": 1,
      "is_vacation": false
    }
  },
  "activity_heatmap": {
    "total_actions": 84,
    "streak_days": 12,
    "history": [3, 4, 2, 4, 3, 4, 4, 2, 3, 4, 4, 4, 0, 0]
  },
  "pinned_focus_card": {
    "subject_id": "algebra_9",
    "title": "Алгебра 9 сынып",
    "icon": "📐",
    "subject_elo": 1435,
    "predicted_score": "38/40",
    "focus_topic": "Квадраттық теңсіздіктер (Интервалдар әдісі)",
    "focus_reason": "💡 Кеше таңбаларды анықтаудан қателестің. Осы 1 ережені бекітсек емтихан болжамың 39-ға өседі.",
    "duration_minutes": 3,
    "cta_label": "Жаттығуды бастау (3 минут)"
  },
  "quarter_topics": [
    {
      "topic_number": "#01",
      "title": "Сызықтық теңдеулер мен теңсіздіктер",
      "status": "mastered",
      "status_label": "Усвоено",
      "status_color": "purple",
      "sub_text": "Мұғалім бекітті • СОР-ға дайын"
    },
    {
      "topic_number": "#02",
      "title": "Виет теоремасы және квадрат үшмүше",
      "status": "pending",
      "status_label": "Ожидает",
      "status_color": "yellow",
      "sub_text": "ИИ қабылдады • Мұғалім растауын күтуде"
    },
    {
      "topic_number": "#03",
      "title": "Квадраттық теңсіздіктер (Интервалдар)",
      "status": "in_progress",
      "status_label": "В работе",
      "status_color": "green",
      "sub_text": "● Бүгінгі сабақ • 3 мин жаттығу"
    },
    {
      "topic_number": "#04",
      "title": "Бөлшек-рационал теңсіздіктер",
      "status": "queued",
      "status_label": "Кезекте",
      "status_color": "gray",
      "sub_text": "1-тоқсан жоспарында"
    }
  ],
  "spaced_repetition": {
    "available": true,
    "cards_count": 3,
    "time_estimate": "1 мин",
    "title": "Жадты бекіту (Spaced Repetition)",
    "description": "1-тоқсанның 3 формуласы қайталауды күтуде"
  }
}
```
