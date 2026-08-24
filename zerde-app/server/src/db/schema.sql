-- ============================================================================
-- ZERDE PRODUCTION SQLITE 3 DDL SCHEMA (PHASE 1 CORE MVP + AGENTIC SYSTEM)
-- Strictly 14 tables without external dependencies, no mock data, no Desmos/Kundelik.
-- File: d:/future-minds-mvp/zerde-app/server/src/db/schema.sql
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Организации и Токены Доступа (Школы, Лицеи)
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    teacher_token TEXT UNIQUE NOT NULL,          -- e.g. 'NIS-TEACHER-2026'
    student_token TEXT UNIQUE NOT NULL,          -- e.g. 'NIS-STUDENT-2026'
    type TEXT NOT NULL DEFAULT 'school',        -- 'school', 'university', 'college'
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_teacher_token ON organizations(teacher_token);
CREATE INDEX IF NOT EXISTS idx_organizations_student_token ON organizations(student_token);

-- 2. Роли пользователя в организациях (Anti-Conflict of Interest Matrix)
CREATE TABLE IF NOT EXISTS user_organization_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    organization_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(user_id, organization_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_org_roles_uid ON user_organization_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_roles_org ON user_organization_roles(organization_id);

-- 3. Пользователи (Ученики, Учителя, Администраторы)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
    grade INTEGER,                               -- 1..12
    school TEXT,                                -- Название организации
    organization_id INTEGER,                    -- ID организации
    streak_days INTEGER NOT NULL DEFAULT 0,     -- Реальный стрик дней
    longest_streak INTEGER NOT NULL DEFAULT 0,  -- Рекорд стрика
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);

-- 4. Классы и Учебные Группы Учителя (Classroom Sandbox)
CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                         -- '9 «А»', '10 «Б»', 'Олимпиадники'
    school TEXT NOT NULL,
    teacher_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_school ON classrooms(school);

-- 5. Связь Реальных Учеников с Группами
CREATE TABLE IF NOT EXISTS classroom_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_cls_students_cls ON classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cls_students_std ON classroom_students(student_id);

-- 6. Курсы (Предметы)
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,            -- e.g. 'ZR-7K9M2', 'MATH-9A'
    title TEXT NOT NULL,                        -- 'Алгебра 9 сынып'
    description TEXT,
    subject_type TEXT NOT NULL,                 -- 'algebra', 'physics', 'kazakh_lang'
    language TEXT NOT NULL CHECK(language IN ('KZ', 'RU', 'EN', 'ALL')) DEFAULT 'KZ',
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

-- 7. Слоты Учебных Материалов Курса (до 5 слотов для Context-Injection)
CREATE TABLE IF NOT EXISTS course_material_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    classroom_id INTEGER,                               -- NULL = общий для курса, либо для конкретной группы
    slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
    title TEXT NOT NULL,                                -- 'ГОСО Алгебра 9', 'Учебник Часть 1'
    file_type TEXT NOT NULL DEFAULT 'text',             -- 'text', 'pdf', 'docx'
    content_text TEXT NOT NULL DEFAULT '',              -- Извлеченный текстовый контент для Context-Injection
    file_size INTEGER DEFAULT 0,
    is_locked INTEGER NOT NULL DEFAULT 0,               -- 1 = заблокирован вне окна каникул/первых 2 дней
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    UNIQUE(course_id, classroom_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_mat_slots_course ON course_material_slots(course_id, classroom_id);

-- Алиас таблица course_slots для обратной совместимости
CREATE TABLE IF NOT EXISTS course_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_size INTEGER DEFAULT 0,
    summary TEXT,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(course_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_course_slots_course ON course_slots(course_id);

-- 8. Учебные Планы Четверти (Markdown Curriculum Plans)
CREATE TABLE IF NOT EXISTS course_curriculum_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK(quarter BETWEEN 1 AND 4) DEFAULT 1,
    markdown_plan TEXT NOT NULL,                        -- Полный Markdown-план с дескрипторами и неделями
    status TEXT NOT NULL CHECK(status IN ('DRAFT_QUESTIONNAIRE', 'APPROVED', 'ARCHIVED')) DEFAULT 'DRAFT_QUESTIONNAIRE',
    version INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    UNIQUE(course_id, classroom_id, quarter, version)
);

CREATE INDEX IF NOT EXISTS idx_curr_plans_cls ON course_curriculum_plans(classroom_id, quarter);
CREATE INDEX IF NOT EXISTS idx_curr_plans_course ON course_curriculum_plans(course_id);

-- 9. Воронка Заявок и Зачисление на Курс (Admission Pipeline)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    assigned_classroom_id INTEGER,                      -- Назначенная учителем группа ('9 «А»', 'Олимпиадники')
    status TEXT NOT NULL CHECK(status IN ('applied', 'pending_approval', 'enrolled', 'rejected', 'completed', 'expelled')) DEFAULT 'applied',
    motivation_text TEXT NOT NULL DEFAULT '',           -- Мотивационное письмо ученика
    rejection_reason TEXT,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
    UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_assigned_cls ON course_enrollments(assigned_classroom_id);

-- 10. Темы Курса по Четвертям
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

-- 11. Банк Вопросов (Режимы А и Б с формулами KaTeX и Solution Models)
CREATE TABLE IF NOT EXISTS question_bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('A', 'B')) DEFAULT 'A',
    question_kz TEXT NOT NULL,
    question_ru TEXT NOT NULL,
    question_en TEXT NOT NULL,
    katex_snippet TEXT,                         -- Формула или сан түзуі в KaTeX
    options_json TEXT,                          -- JSON массив вариантов для Режима A
    correct_answer TEXT NOT NULL,               -- Правильный ответ или ключ
    solution_model TEXT,                        -- Эталон решения для Silent Grader (Тип Б)
    explanation_kz TEXT,
    explanation_ru TEXT,
    explanation_en TEXT,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
    skill_code TEXT NOT NULL DEFAULT 'GENERAL', -- Код микронавыка
    topic_tag TEXT,                             -- e.g. 'inequalities_quadratic'
    target_tier TEXT DEFAULT 'INTERMEDIATE',    -- 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'OLYMPIAD'
    quarter_index INTEGER DEFAULT 1,            -- 1..4
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(topic_id, mode);
CREATE INDEX IF NOT EXISTS idx_question_bank_skill ON question_bank(skill_code);
CREATE INDEX IF NOT EXISTS idx_question_bank_tier ON question_bank(target_tier);
CREATE INDEX IF NOT EXISTS idx_question_bank_quarter ON question_bank(quarter_index);

-- 12. Попытки Решений и Диалоги Сократа
CREATE TABLE IF NOT EXISTS student_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    chosen_option TEXT,
    text_response TEXT,
    photo_urls_json TEXT,                       -- Фото тетради до 10 шт
    is_correct INTEGER NOT NULL DEFAULT 0,
    elo_delta INTEGER NOT NULL DEFAULT 0,
    socratic_dialogue_json TEXT,                -- История подсказок Сократа «Аға»
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_attempts_std ON student_attempts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_attempts_q ON student_attempts(question_id);

-- 13. Изолированный Паспорт Ученика по Курсам (Subpassport с логами попыток)
CREATE TABLE IF NOT EXISTS student_course_passports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    subject_elo INTEGER NOT NULL DEFAULT 1000,
    rank_tier TEXT NOT NULL CHECK(rank_tier IN ('OSKIN', 'TUGYR', 'KYRAN', 'SAMGHAU')) DEFAULT 'OSKIN',
    skills_progress_json TEXT NOT NULL DEFAULT '{}',     -- { [skill_code]: { total_attempts, correct_answers, mastery_percent, status } }
    teacher_daily_notes_json TEXT NOT NULL DEFAULT '[]', -- [ { date, note } ]
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_passports_std ON student_course_passports(student_id);
CREATE INDEX IF NOT EXISTS idx_course_passports_course ON student_course_passports(course_id);

-- 14. Сквозной Журнал Аудита и Телеметрии (Стандартные академические события)
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER,
    actor_role TEXT CHECK(actor_role IN ('student', 'teacher', 'admin', 'system', 'ai')),
    target_user_id INTEGER,
    course_id INTEGER,
    event_type TEXT NOT NULL CHECK(event_type IN (
        'TEST_ATTEMPT', 'THOUGHT_FORK_CLICK', 'EUREKA_MOMENT', 
        'COURSE_CREATED', 'SLOT_UPLOADED', 'COPILOT_GENERATION', 
        'ENROLLMENT_CHANGE', 'NOTE_ADDED', 'SILENT_GRADER_EVAL'
    )),
    payload_json TEXT NOT NULL,
    elo_delta INTEGER DEFAULT 0,
    ip_address TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON system_audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event ON system_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_course ON system_audit_logs(course_id);
