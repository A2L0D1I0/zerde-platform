# 🗄️ 02. Схема Базы Данных и Модели Данных (SQLite)

## 1. Конфигурация Базы Данных
* **Движок:** `better-sqlite3` (быстрый синхронный C++ драйвер для Node.js).
* **Файл:** `zerde-app/server/zerde.db`.
* **Режим:** `WAL (Write-Ahead Logging)` с включенными внешними ключами `PRAGMA foreign_keys = ON;`.

---

## 2. Структура 14 Таблиц Базы Данных

```sql
-- 1. Пользователи системы (Ученики, Учителя, Админы)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK(role IN ('student', 'teacher', 'admin')) NOT NULL,
  grade INTEGER,
  school TEXT,
  curator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  parent_contact TEXT,
  notify_on_risk INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Классы
CREATE TABLE classrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- e.g. '9 «А»'
  school TEXT NOT NULL,
  teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Привязка учеников к классам
CREATE TABLE classroom_students (
  classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (classroom_id, student_id)
);

-- 4. Курсы и дисциплины (Динамические)
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  subject_type TEXT NOT NULL, -- 'math', 'physics', 'language', 'chemistry', etc.
  language TEXT CHECK(language IN ('KZ', 'RU', 'EN', 'ANY')) DEFAULT 'ANY',
  icon TEXT,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Жизненный цикл записи на курсы (Enrollment Lifecycle)
CREATE TABLE course_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('pending_approval', 'enrolled', 'completed', 'expelled')) DEFAULT 'pending_approval',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  UNIQUE(course_id, student_id)
);

-- 6. Темы курсов
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  quarter INTEGER CHECK(quarter IN (1, 2, 3, 4)) DEFAULT 1,
  topic_number TEXT NOT NULL, -- e.g. '1.1'
  title TEXT NOT NULL,
  description TEXT,
  is_today_focus INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0
);

-- 7. Двухфакторный статус темы для ученика
CREATE TABLE student_topic_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('queued', 'in_progress', 'pending_teacher', 'mastered')) DEFAULT 'queued',
  success_streak INTEGER DEFAULT 0,
  mastered_at DATETIME,
  UNIQUE(student_id, topic_id)
);

-- 8. Банк вопросов (Вопросы Режимов А и Б)
CREATE TABLE question_bank (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  mode TEXT CHECK(mode IN ('A', 'B')) NOT NULL,
  question_kz TEXT NOT NULL,
  question_ru TEXT NOT NULL,
  question_en TEXT NOT NULL,
  zvdsl_canvas_json TEXT, -- Схема ZVDSL+ (JSON)
  desmos_state TEXT,       -- Графическое состояние Desmos (JSON)
  options_json TEXT,       -- Варианты ответов для Режима А (JSON)
  correct_answer TEXT NOT NULL,
  explanation_kz TEXT,
  explanation_ru TEXT,
  explanation_en TEXT,
  difficulty INTEGER CHECK(difficulty IN (1, 2, 3, 4, 5)) DEFAULT 2,
  micro_skills_json TEXT   -- Q-Matrix микронавыки (JSON Array)
);

-- 9. Логи попыток решения
CREATE TABLE student_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
  chosen_option TEXT,
  text_response TEXT,
  photo_urls_json TEXT,
  is_correct INTEGER NOT NULL,
  elo_delta INTEGER NOT NULL,
  socratic_dialogue_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Рейтинг ELO по курсам
CREATE TABLE student_elo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  current_elo INTEGER DEFAULT 1200,
  rank TEXT CHECK(rank IN ('OSKIN', 'TUGYR', 'QYRAN', 'SAMGAU')) DEFAULT 'TUGYR',
  highest_elo INTEGER DEFAULT 1200,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- 11. Аудируемый лог дельт ELO
CREATE TABLE student_elo_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT CHECK(reason IN ('EUREKA', 'FULL_STEP', 'SHORT_STEP', 'DIRECT_ANSWER', 'JAILBREAK_PENALTY', 'PRACTICE')) NOT NULL,
  current_elo INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Тепловая карта активности (Heatmap)
CREATE TABLE student_heatmap (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  activity_count INTEGER DEFAULT 0,
  level INTEGER CHECK(level IN (0, 1, 2, 3, 4)) DEFAULT 0,
  UNIQUE(student_id, date)
);

-- 13. Карточки интервального повторения SM-2
CREATE TABLE spaced_repetition_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  card_title TEXT NOT NULL,
  card_content TEXT NOT NULL,
  easiness_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date TEXT NOT NULL, -- YYYY-MM-DD
  last_reviewed_at DATETIME
);

-- 14. Уведомления и триггеры удержания (Retention)
CREATE TABLE retention_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('STREAK_SAVER', 'AGA_REMINDER', 'MEMORY_BURN', 'WEEKLY_DIGEST')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
