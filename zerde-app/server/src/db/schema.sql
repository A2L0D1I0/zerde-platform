-- 0. Организации и Токены Доступа (Школы, ВУЗы, Центры)
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    org_token TEXT UNIQUE NOT NULL,              -- e.g. 'ORG-8F3K9A', 'ZK-7492-X'
    type TEXT NOT NULL DEFAULT 'school',        -- 'school', 'university', 'college', 'academy'
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_token ON organizations(org_token);

-- 1. Пользователи (Ученики, Учителя, Администраторы)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
    bio TEXT,                                    -- 'О себе / Научные интересы'
    grade INTEGER,                                -- 1..12 или курс
    school TEXT,                                 -- Название организации
    organization_id INTEGER,                     -- ID организации
    curator_id INTEGER,                          -- куратор / наставник
    parent_contact TEXT,                         -- телефон / контакт
    notify_on_risk INTEGER NOT NULL DEFAULT 1,   -- 1 = вкл, 0 = выкл
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (curator_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);

-- 2. Классы и Учебные Группы
CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                          -- 'Группа A-101', 'IT-2026'
    school TEXT NOT NULL,
    teacher_id INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_school ON classrooms(school);

-- Связь учеников с учебными группами
CREATE TABLE IF NOT EXISTS classroom_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_students_cls ON classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_students_std ON classroom_students(student_id);

-- 3. Курсы (Предметы)
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,             -- Автоматический случайный токен, e.g. '7X9K2M', 'K8F42A'
    title TEXT NOT NULL,                         -- 'Алгебра және анализ бастамалары'
    description TEXT,
    subject_type TEXT NOT NULL,                  -- 'algebra', 'physics', 'kazakh_lang'
    language TEXT NOT NULL CHECK(language IN ('KZ', 'RU', 'EN', 'ANY')) DEFAULT 'KZ',
    icon TEXT DEFAULT '📐',
    teacher_id INTEGER,
    organization_id INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_courses_short_code ON courses(short_code);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject_type);

-- 3.1. Приглашения студентов в курс (Инвайты от преподавателя)
CREATE TABLE IF NOT EXISTS course_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON course_invitations(student_email);
CREATE INDEX IF NOT EXISTS idx_invitations_course ON course_invitations(course_id);

-- 4. Запись на курс (Enrollments)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending_approval', 'enrolled', 'completed', 'expelled')) DEFAULT 'enrolled',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);


-- 5. Темы курса (Разбивка по четвертям)
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK(quarter BETWEEN 1 AND 4) DEFAULT 1,
    topic_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_today_focus INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_topics_course_quarter ON topics(course_id, quarter, order_index);

-- 6. Статус освоения темы учеником
CREATE TABLE IF NOT EXISTS student_topic_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('queued', 'in_progress', 'pending_teacher', 'mastered')) DEFAULT 'queued',
    success_streak INTEGER NOT NULL DEFAULT 0,
    mastered_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(student_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_student_topic_status ON student_topic_status(student_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_status_val ON student_topic_status(status);

-- 7. Банк вопросов (Active Canvas ZVDSL+ и Desmos)
CREATE TABLE IF NOT EXISTS question_bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('A', 'B')) DEFAULT 'A',
    question_kz TEXT NOT NULL,
    question_ru TEXT NOT NULL,
    question_en TEXT NOT NULL,
    zvdsl_canvas_json TEXT,                      -- Схема микро-чертежа ZVDSL+
    desmos_state TEXT,                           -- Состояние графика Desmos
    options_json TEXT,                           -- JSON массив вариантов для Режима A
    correct_answer TEXT NOT NULL,                -- Идентификатор ответа или значение
    explanation_kz TEXT,
    explanation_ru TEXT,
    explanation_en TEXT,
    difficulty INTEGER NOT NULL DEFAULT 1,       -- 1..5
    micro_skills_json TEXT,                      -- JSON массив кодов микро-навыков (Q-matrix)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(topic_id, mode);
CREATE INDEX IF NOT EXISTS idx_question_bank_diff ON question_bank(difficulty);

-- 8. Попытки решений учеников (Тренажер «Аға»)
CREATE TABLE IF NOT EXISTS student_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    chosen_option TEXT,
    text_response TEXT,
    photo_urls_json TEXT,                        -- JSON массив фото тетради
    is_correct INTEGER NOT NULL DEFAULT 0,
    elo_delta INTEGER NOT NULL DEFAULT 0,
    socratic_dialogue_json TEXT,                 -- История Сократического диалога
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_attempts_std ON student_attempts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_attempts_q ON student_attempts(question_id);

-- 9. Рейтинг ELO ученика по предметам
CREATE TABLE IF NOT EXISTS student_elo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    current_elo INTEGER NOT NULL DEFAULT 1000,
    rank TEXT NOT NULL CHECK(rank IN ('OSKIN', 'TUGYR', 'QYRAN', 'SAMGAU')) DEFAULT 'OSKIN',
    highest_elo INTEGER NOT NULL DEFAULT 1000,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_student_elo_std ON student_elo(student_id);
CREATE INDEX IF NOT EXISTS idx_student_elo_rank ON student_elo(rank);

-- 10. Аудируемый Ledger истории изменений ELO
CREATE TABLE IF NOT EXISTS student_elo_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK(reason IN ('EUREKA', 'FULL_STEP', 'SHORT_STEP', 'DIRECT_ANSWER', 'JAILBREAK_PENALTY')),
    current_elo INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_elo_history_std ON student_elo_history(student_id, created_at DESC);

-- 11. Матрица учебной активности (Heatmap)
CREATE TABLE IF NOT EXISTS student_heatmap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,                          -- YYYY-MM-DD
    activity_count INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL CHECK(level BETWEEN 0 AND 4) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_heatmap_std_date ON student_heatmap(student_id, date);

-- 12. Карточки интервального повторения (Spaced Repetition SM-2)
CREATE TABLE IF NOT EXISTS spaced_repetition_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    card_title TEXT NOT NULL,
    card_content TEXT NOT NULL,
    easiness_factor REAL NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_date TEXT NOT NULL,              -- YYYY-MM-DD
    last_reviewed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spaced_rep_review ON spaced_repetition_cards(student_id, next_review_date);

-- 13. Уведомления системы Retention (Duolingo-style)
CREATE TABLE IF NOT EXISTS retention_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('STREAK_SAVER', 'AGA_REMINDER', 'MEMORY_BURN', 'WEEKLY_DIGEST')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_retention_std_unread ON retention_notifications(student_id, is_read, created_at DESC);
