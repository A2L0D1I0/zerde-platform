import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export type SqliteDatabase = Database.Database;

const DB_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../zerde.db');
const SCHEMA_PATH = fs.existsSync(path.resolve(__dirname, 'schema.sql'))
  ? path.resolve(__dirname, 'schema.sql')
  : path.resolve(__dirname, '../../src/db/schema.sql');

let dbInstance: Database.Database | null = null;

function applySafeMigrations(database: Database.Database): void {
  try {
    // Check and add columns to course_enrollments
    const enrollCols = database.prepare("PRAGMA table_info(course_enrollments)").all() as any[];
    const enrollColNames = new Set(enrollCols.map(c => c.name));
    if (enrollCols.length > 0) {
      if (!enrollColNames.has('assigned_classroom_id')) {
        database.exec('ALTER TABLE course_enrollments ADD COLUMN assigned_classroom_id INTEGER NULL REFERENCES classrooms(id)');
      }
      if (!enrollColNames.has('motivation_text')) {
        database.exec("ALTER TABLE course_enrollments ADD COLUMN motivation_text TEXT NOT NULL DEFAULT ''");
      }
      if (!enrollColNames.has('rejection_reason')) {
        database.exec("ALTER TABLE course_enrollments ADD COLUMN rejection_reason TEXT NULL");
      }
    }

    // Check and add columns to question_bank
    const qCols = database.prepare("PRAGMA table_info(question_bank)").all() as any[];
    const qColNames = new Set(qCols.map(c => c.name));
    if (qCols.length > 0) {
      if (!qColNames.has('solution_model')) {
        database.exec('ALTER TABLE question_bank ADD COLUMN solution_model TEXT NULL');
      }
      if (!qColNames.has('topic_tag')) {
        database.exec('ALTER TABLE question_bank ADD COLUMN topic_tag TEXT');
      }
      if (!qColNames.has('target_tier')) {
        database.exec("ALTER TABLE question_bank ADD COLUMN target_tier TEXT DEFAULT 'INTERMEDIATE'");
      }
      if (!qColNames.has('quarter_index')) {
        database.exec('ALTER TABLE question_bank ADD COLUMN quarter_index INTEGER DEFAULT 1');
      }
    }
  } catch (err) {
    // ignore if table doesn't exist yet
  }
}

/**
 * Get or initialize SQLite Database instance
 */
export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    // Auto-apply schema if tables don't exist
    initDatabase(dbInstance);
  }
  return dbInstance;
}

/**
 * Execute schema.sql to initialize tables and indexes
 */
export function initDatabase(database: Database.Database = getDb()): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at: ${SCHEMA_PATH}`);
  }

  applySafeMigrations(database);
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  database.exec(schemaSql);
}

/**
 * Reset database (drop all custom tables and re-apply schema.sql)
 */
export function resetDatabase(): Database.Database {
  if (!dbInstance) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
  }

  const database = dbInstance;
  database.pragma('foreign_keys = OFF');
  
  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  for (const { name } of tables) {
    database.exec(`DROP TABLE IF EXISTS "${name}"`);
  }

  database.pragma('foreign_keys = ON');
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  database.exec(schemaSql);
  return database;
}

/**
 * Atomic transaction helper to safely update student course subpassport
 */
export function updatePassportTransaction<T = any>(
  studentId: number,
  courseId: number,
  updateFn: (current: {
    skills: Record<string, any>;
    teacher_daily_notes: any[];
    raw_recent_attempts: any[];
    subject_elo: number;
    rank_tier: string;
  }) => {
    skills?: Record<string, any>;
    teacher_daily_notes?: any[];
    raw_recent_attempts?: any[];
    subject_elo?: number;
    rank_tier?: string;
  }
): T {
  const database = getDb();
  
  const tx = database.transaction(() => {
    // 1. Fetch current row or initialize
    const row = database
      .prepare('SELECT id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json FROM student_course_passports WHERE student_id = ? AND course_id = ?')
      .get(studentId, courseId) as any;

    let skills: Record<string, any> = {};
    let teacher_daily_notes: any[] = [];
    let raw_recent_attempts: any[] = [];
    let subject_elo = row?.subject_elo || 1000;
    let rank_tier = row?.rank_tier || 'OSKIN';

    if (row) {
      try {
        skills = JSON.parse(row.skills_progress_json || '{}');
      } catch (e) {
        skills = {};
      }
      try {
        teacher_daily_notes = JSON.parse(row.teacher_daily_notes_json || '[]');
      } catch (e) {
        teacher_daily_notes = [];
      }
    }

    // 2. Execute updater
    const updated = updateFn({
      skills,
      teacher_daily_notes,
      raw_recent_attempts,
      subject_elo,
      rank_tier
    });

    const newSkills = updated.skills !== undefined ? updated.skills : skills;
    const newNotes = updated.teacher_daily_notes !== undefined ? updated.teacher_daily_notes : teacher_daily_notes;
    const newElo = updated.subject_elo !== undefined ? updated.subject_elo : subject_elo;
    const newTier = updated.rank_tier !== undefined ? updated.rank_tier : rank_tier;

    if (row) {
      database
        .prepare(`
          UPDATE student_course_passports
          SET subject_elo = ?, rank_tier = ?, skills_progress_json = ?, teacher_daily_notes_json = ?, updated_at = CURRENT_TIMESTAMP
          WHERE student_id = ? AND course_id = ?
        `)
        .run(newElo, newTier, JSON.stringify(newSkills), JSON.stringify(newNotes), studentId, courseId);
    } else {
      database
        .prepare(`
          INSERT INTO student_course_passports (student_id, course_id, subject_elo, rank_tier, skills_progress_json, teacher_daily_notes_json)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(studentId, courseId, newElo, newTier, JSON.stringify(newSkills), JSON.stringify(newNotes));
    }

    return {
      student_id: studentId,
      course_id: courseId,
      subject_elo: newElo,
      rank_tier: newTier,
      skills: newSkills,
      teacher_daily_notes: newNotes
    };
  });

  return tx() as T;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export const db: Database.Database = getDb();
export default db;
