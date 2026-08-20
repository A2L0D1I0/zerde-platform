# GitHub Primer: Ресурсы, Ссылки и Набор Иконок Octicons

Справочник официальных библиотек, репозиториев, Figma UI-китов и готовых SVG-ассетов системы **GitHub Primer & Octicons**.

---

## 1. Официальные ссылки и репозитории

### 1.1. Дизайн-система и документация
- **Главный портал Primer:** [https://primer.style/](https://primer.style/)
- **Primer Design Tokens:** [https://primer.style/primitives/](https://primer.style/primitives/) (палитры, переменные, типографика)
- **Primer React Components:** [https://primer.style/react/](https://primer.style/react/)
- **Primer ViewComponents (Rails):** [https://primer.style/view-components/](https://primer.style/view-components/)
- **Primer Brand (Маркетинговый стиль):** [https://primer.style/brand/](https://primer.style/brand/)
- **GitHub Octicons Каталог:** [https://primer.style/octicons/](https://primer.style/octicons/)

### 1.2. Figma Community UI Kits
- **Primer Web UI Kit (Official Figma):** [Figma Community — Primer Web](https://www.figma.com/@primer)
- **Primer Mobile UI Kit (iOS & Android):** [Figma Community — Primer Mobile](https://www.figma.com/community/file/1151608678241473664)
- **Octicons Icon Library (Figma):** [Figma Community — Octicons](https://www.figma.com/community/file/848972535949514781)

### 1.3. NPM Пакеты для установки
```bash
# Токены и примитивы
npm install @primer/primitives

# React компоненты
npm install @primer/react @primer/octicons-react

# CSS стили
npm install @primer/css
```

---

## 2. Ключевые SVG Иконки Octicons (Raw SVG Specs)

Все иконки приведены в формате 16x16px (стандартный инлайн-размер Primer).

### 2.1. `issue-opened` (Открытая задача / Issue)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
</svg>
```

### 2.2. `issue-closed` / `check-circle` (Закрытая задача / Успех)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"></path>
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"></path>
</svg>
```

### 2.3. `git-pull-request` (Pull Request)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
</svg>
```

### 2.4. `repo` (Репозиторий)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h7a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-7a.25.25 0 0 1-.25-.25Z"></path>
</svg>
```

### 2.5. `bell` (Уведомления / Notifications)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.637 2.532A1.157 1.157 0 0 1 13.71 12.5H2.29a1.157 1.157 0 0 1-.969-1.882l1.637-2.532a.25.25 0 0 0 .042-.139V5Zm1.5 0v3.25c0 .324-.099.638-.283.903l-1.39 2.15c-.068.106-.013.297.163.297h9.98c.176 0 .231-.191.163-.297l-1.39-2.15a1.642 1.642 0 0 1-.283-.903V5a3.5 3.5 0 1 0-7 0Z"></path>
</svg>
```

### 2.6. `search` (Поиск)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path>
</svg>
```

### 2.7. `flame` (Стрик активности / Горящие задачи)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M7.747 1.055a.75.75 0 0 1 .506.902c-.378 1.488-.17 2.37.195 2.873.342.472.91.808 1.63 1.077.585.22 1.189.474 1.733.864.55.394.989.94 1.222 1.65.485 1.478.188 3.125-.795 4.385C11.258 14.067 9.71 15 8 15c-1.71 0-3.258-.933-4.238-2.194-.983-1.26-1.28-2.907-.795-4.385.233-.71.672-1.256 1.222-1.65.544-.39 1.148-.644 1.733-.864.72-.27 1.288-.605 1.63-1.077.365-.503.573-1.385.195-2.873a.75.75 0 0 1 .9-.502h.1Z"></path>
</svg>
```

### 2.8. `trophy` (Достижения / Ачивки)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M3.75 2h8.5a.75.75 0 0 1 .75.75v1.5a4.25 4.25 0 0 1-3.5 4.18V10.5h1.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75H6.5V8.43A4.25 4.25 0 0 1 3 4.25v-1.5A.75.75 0 0 1 3.75 2Zm7.75 2.25V3.5h-7v.75a2.75 2.75 0 0 0 5.5 0h1.5Zm-4 6.75H6.5v1.5h3v-1.5Z"></path>
</svg>
```

### 2.9. `chevron-right`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
</svg>
```

### 2.10. `dot-fill` (Индикатор статуса)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"></path>
</svg>
```
