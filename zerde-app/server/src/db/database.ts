import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export type SqliteDatabase = Database.Database;

const DB_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../zerde.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

let dbInstance: Database.Database | null = null;

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
export function initDatabase(db: Database.Database = getDb()): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at: ${SCHEMA_PATH}`);
  }

  // Safe column migration for existing database instances
  try {
    const courseCols = db.prepare("PRAGMA table_info(courses)").all() as any[];
    if (courseCols.length > 0 && !courseCols.some(c => c.name === 'short_code')) {
      db.exec("ALTER TABLE courses ADD COLUMN short_code TEXT DEFAULT ''");
    }
    if (courseCols.length > 0 && !courseCols.some(c => c.name === 'organization_id')) {
      db.exec("ALTER TABLE courses ADD COLUMN organization_id INTEGER");
    }
  } catch (e) {
    // Ignore if table does not exist
  }

  try {
    const userCols = db.prepare("PRAGMA table_info(users)").all() as any[];
    if (userCols.length > 0 && !userCols.some(c => c.name === 'bio')) {
      db.exec("ALTER TABLE users ADD COLUMN bio TEXT");
    }
    if (userCols.length > 0 && !userCols.some(c => c.name === 'organization_id')) {
      db.exec("ALTER TABLE users ADD COLUMN organization_id INTEGER");
    }
  } catch (e) {
    // Ignore if table does not exist
  }

  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);
}


/**
 * Reset database (drop and re-create)
 */
export function resetDatabase(): Database.Database {
  const db = getDb();
  db.pragma('foreign_keys = OFF');
  
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  for (const { name } of tables) {
    db.exec(`DROP TABLE IF EXISTS "${name}"`);
  }

  db.pragma('foreign_keys = ON');
  initDatabase(db);
  return db;
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
