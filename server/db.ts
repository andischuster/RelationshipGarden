import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

// Remove the "file:" prefix if present for SQLite
const dbPath = databaseUrl.replace(/^file:/, '');

console.log('📁 Using SQLite database at:', dbPath);

const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Export for compatibility
export const pool = {
  query: (sql: string) => sqlite.prepare(sql).all(),
  end: () => sqlite.close(),
};
