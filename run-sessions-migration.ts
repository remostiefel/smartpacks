
import { db } from "./db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runSessionsMigration() {
  console.log("Running sessions table migration...");

  const migrationSQL = fs.readFileSync(
    path.join(process.cwd(), "db/migrations/create_sessions_table.sql"),
    "utf-8"
  );

  try {
    await db.execute(sql.raw(migrationSQL));
    console.log("✅ Sessions table created successfully");
  } catch (error) {
    console.error("❌ Error creating sessions table:", error);
    throw error;
  }
}

runSessionsMigration()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
