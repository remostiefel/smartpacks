
import { db } from "./db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  try {
    console.log("Running feedback tables migration...");
    
    const migrationSQL = fs.readFileSync(
      path.join(process.cwd(), "db/migrations/create_feedback_tables.sql"),
      "utf-8"
    );
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log("✅ Feedback tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
