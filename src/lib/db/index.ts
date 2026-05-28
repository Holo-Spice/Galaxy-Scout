import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const DB_PATH = process.env.DATABASE_PATH || "./galaxy-scout.db";

// globalThis prevents duplicate connections across Next.js HMR reloads
const globalForDb = globalThis as unknown as {
  db: BetterSQLite3Database | undefined;
  sqlite: Database.Database | undefined;
};

const sqlite = globalForDb.sqlite ?? new Database(DB_PATH);
const db: BetterSQLite3Database = globalForDb.db ?? drizzle(sqlite);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
  globalForDb.db = db;
}

export { db, sqlite };

/** Apply pending Drizzle migrations. Call once at app startup. */
export async function initializeDatabase(): Promise<void> {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("no such file") ||
        err.message.includes("ENOENT") ||
        err.message.includes("no migration"))
    ) {
      console.warn(
        "[db] Migrations folder not found or empty – skipping. Run `npx drizzle-kit generate` first."
      );
      return;
    }
    throw err;
  }
}
