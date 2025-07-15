import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

// Remove the "file:" prefix if present for SQLite
const dbPath = databaseUrl.replace(/^file:/, '');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
