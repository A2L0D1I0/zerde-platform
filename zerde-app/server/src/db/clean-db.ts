import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

function cleanDb(dbPath: string) {
  console.log(`Cleaning DB at: ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    console.log(`DB file does not exist, creating directory if needed...`);
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = OFF');

  const schemaPath = fs.existsSync(path.resolve(__dirname, 'schema.sql'))
    ? path.resolve(__dirname, 'schema.sql')
    : path.resolve(__dirname, '../../src/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // Drop all existing tables
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  for (const { name } of tables) {
    db.exec(`DROP TABLE IF EXISTS "${name}"`);
  }

  // Recreate all tables from schema
  db.exec(schemaSql);

  // Insert only organization tokens
  const insertOrg = db.prepare(`
    INSERT INTO organizations (name, org_token, type, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const orgs = [
    { name: 'NIS IB Astana', token: 'ORG-8F3K9A', type: 'school' }
  ];

  for (const org of orgs) {
    insertOrg.run(org.name, org.token, org.type, now);
  }

  db.pragma('foreign_keys = ON');

  console.log('✅ Organizations tokens saved in DB:');
  const savedOrgs = db.prepare('SELECT id, name, org_token, type FROM organizations').all();
  console.table(savedOrgs);

  // Show counts of other tables
  const remainingTables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  console.log('📊 Table summary:');
  for (const { name } of remainingTables) {
    const row = db.prepare(`SELECT COUNT(*) as cnt FROM "${name}"`).get() as { cnt: number };
    console.log(`  - ${name}: ${row.cnt} rows`);
  }

  db.close();
}

const targetDbs = [
  path.resolve(__dirname, '../../zerde.db'),
  path.resolve(__dirname, '../../../../CLONE/server/zerde.db')
];

for (const p of targetDbs) {
  try {
    cleanDb(p);
  } catch (err) {
    console.error(`Error cleaning ${p}:`, err);
  }
}
