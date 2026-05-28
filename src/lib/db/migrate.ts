/**
 * Standalone migration runner.
 * Usage: npx tsx src/lib/db/migrate.ts
 *
 * Applies all pending Drizzle migrations and exits.
 */
import { db, sqlite, initializeDatabase } from "./index";

async function main() {
  console.log("[migrate] Applying pending migrations...");
  await initializeDatabase();
  console.log("[migrate] Done.");
}

main()
  .catch((err) => {
    console.error("[migrate] Migration failed:", err);
    process.exit(1);
  })
  .finally(() => {
    sqlite.close();
  });
