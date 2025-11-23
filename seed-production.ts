import { seedTestClass } from "./seed-test-class";
import { seedNewCreativeTasks } from "./seed-creative-tasks";

/**
 * Production Seeding Script
 * 
 * This script seeds the production database with test data.
 * Run this ONCE after deploying to production to populate the database.
 * 
 * Usage (in Production Replit):
 *   tsx server/seed-production.ts
 */

async function seedProduction() {
  console.log("🚀 SmartPacks Production Database Seeding");
  console.log("=" .repeat(70));
  console.log("");
  console.log("⚠️  WARNING: This will populate the production database!");
  console.log("   Only run this if the database is empty or you want to reset test data.");
  console.log("");
  console.log("Starting in 5 seconds... Press Ctrl+C to cancel");
  console.log("");
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log("1️⃣  Seeding Creative Tasks Library...");
    console.log("-" .repeat(70));
    await seedNewCreativeTasks(true); // Force in production
    console.log("");
    
    console.log("2️⃣  Seeding Test Class (15 students with comprehensive data)...");
    console.log("-" .repeat(70));
    const testResult = await seedTestClass();
    console.log("");
    
    console.log("=" .repeat(70));
    console.log("🎉 PRODUCTION SEEDING COMPLETE!");
    console.log("");
    console.log("📊 Summary:");
    console.log(`   Test Class Students:  ${testResult.students.length}`);
    console.log(`   Test Class Errors:    ${testResult.mathErrors}`);
    console.log(`   Spelling Errors:      ${testResult.spellingErrors}`);
    console.log(`   Vocabulary Words:     ${testResult.vocabulary}`);
    console.log(`   Creative Tasks:       ${testResult.creativeTasks}`);
    console.log(`   Assessments:          ${testResult.assessments}`);
    console.log("");
    console.log("✅ Your production database is now ready to use!");
    console.log("");
    console.log("🔗 Next steps:");
    console.log("   1. Log in as 'Test' user (password: password2025)");
    console.log("   2. Verify data is visible in the dashboard");
    console.log("   3. Test all features (Math, German, English, Creative, etc.)");
    console.log("");
    
  } catch (error) {
    console.error("");
    console.error("=" .repeat(70));
    console.error("❌ SEEDING FAILED!");
    console.error("");
    console.error("Error:", error);
    console.error("");
    console.error("💡 Troubleshooting:");
    console.error("   1. Check DATABASE_URL is set correctly");
    console.error("   2. Ensure database migrations are up to date (npm run db:push)");
    console.error("   3. Check that required tables exist");
    console.error("");
    throw error;
  }
}

// Run seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProduction()
    .then(() => {
      console.log("✅ Production seeding script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Production seeding script failed");
      process.exit(1);
    });
}

export { seedProduction };
