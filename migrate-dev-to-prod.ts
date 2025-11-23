import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

/**
 * Migration Script: Development → Production Database
 * 
 * This script safely copies data from Development to Production database.
 * It's designed to be run ONCE after republishing to sync test data.
 * 
 * IMPORTANT: Run this ONLY when you want to sync dev data to production!
 */

interface MigrationStats {
  classes: number;
  students: number;
  errors: number;
  spellingErrors: number;
  vocabulary: number;
  creativeTasks: number;
  studentCreativeTasks: number;
  creativeProfiles: number;
  assessments: number;
  responses: number;
}

async function migrateDevToProduction() {
  console.log("🚀 Starting Development → Production Migration");
  console.log("=" .repeat(60));
  
  const devUrl = process.env.DATABASE_URL;
  const prodUrl = process.env.DATABASE_URL; // Same in production deployment
  
  if (!devUrl) {
    throw new Error("DATABASE_URL not found!");
  }
  
  console.log("⚠️  WARNING: This will REPLACE production data!");
  console.log("   Make sure you're running this in the right environment.");
  console.log("");
  
  // Create connections
  const devPool = new Pool({ connectionString: devUrl });
  const devDb = drizzle(devPool, { schema });
  
  const stats: MigrationStats = {
    classes: 0,
    students: 0,
    errors: 0,
    spellingErrors: 0,
    vocabulary: 0,
    creativeTasks: 0,
    studentCreativeTasks: 0,
    creativeProfiles: 0,
    assessments: 0,
    responses: 0
  };
  
  try {
    console.log("📊 Reading data from source database...");
    
    // 1. Read Classes
    const classes = await devDb.select().from(schema.classes);
    console.log(`   ✓ Found ${classes.length} classes`);
    
    // 2. Read Students
    const students = await devDb.select().from(schema.students);
    console.log(`   ✓ Found ${students.length} students`);
    
    // 3. Read Student Errors
    const errors = await devDb.select().from(schema.studentErrors);
    console.log(`   ✓ Found ${errors.length} math errors`);
    
    // 4. Read Spelling Errors
    const spellingErrors = await devDb.select().from(schema.spellingErrors);
    console.log(`   ✓ Found ${spellingErrors.length} spelling errors`);
    
    // 5. Read Vocabulary
    const vocabulary = await devDb.select().from(schema.vocabularyWords);
    console.log(`   ✓ Found ${vocabulary.length} vocabulary words`);
    
    // 6. Read Creative Tasks
    const creativeTasks = await devDb.select().from(schema.creativeTasks);
    console.log(`   ✓ Found ${creativeTasks.length} creative tasks`);
    
    // 7. Read Student Creative Tasks
    const studentCreativeTasks = await devDb.select().from(schema.studentCreativeTasks);
    console.log(`   ✓ Found ${studentCreativeTasks.length} assigned creative tasks`);
    
    // 8. Read Creative Profiles
    const creativeProfiles = await devDb.select().from(schema.studentCreativeProfiles);
    console.log(`   ✓ Found ${creativeProfiles.length} creative profiles`);
    
    // 9. Read Assessments
    const assessments = await devDb.select().from(schema.selfConceptAssessments);
    console.log(`   ✓ Found ${assessments.length} assessments`);
    
    // 10. Read Assessment Responses
    const responses = await devDb.select().from(schema.assessmentResponses);
    console.log(`   ✓ Found ${responses.length} assessment responses`);
    
    console.log("");
    console.log("✍️  Writing data to production database...");
    
    // IMPORTANT: Insert in correct order (respecting foreign keys)
    
    // 1. Insert Classes (if not exists)
    for (const cls of classes) {
      try {
        await devDb.insert(schema.classes)
          .values(cls)
          .onConflictDoNothing();
        stats.classes++;
      } catch (err) {
        console.log(`   ⚠️  Class ${cls.name} already exists, skipping`);
      }
    }
    console.log(`   ✓ Migrated ${stats.classes} classes`);
    
    // 2. Insert Students (if not exists)
    for (const student of students) {
      try {
        await devDb.insert(schema.students)
          .values(student)
          .onConflictDoNothing();
        stats.students++;
      } catch (err) {
        console.log(`   ⚠️  Student ${student.firstName} ${student.lastName} already exists, skipping`);
      }
    }
    console.log(`   ✓ Migrated ${stats.students} students`);
    
    // 3. Insert Student Errors
    for (const error of errors) {
      try {
        await devDb.insert(schema.studentErrors)
          .values(error)
          .onConflictDoNothing();
        stats.errors++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.errors} math errors`);
    
    // 4. Insert Spelling Errors
    for (const error of spellingErrors) {
      try {
        await devDb.insert(schema.spellingErrors)
          .values(error)
          .onConflictDoNothing();
        stats.spellingErrors++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.spellingErrors} spelling errors`);
    
    // 5. Insert Vocabulary
    for (const word of vocabulary) {
      try {
        await devDb.insert(schema.vocabularyWords)
          .values(word)
          .onConflictDoNothing();
        stats.vocabulary++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.vocabulary} vocabulary words`);
    
    // 6. Insert Creative Tasks
    for (const task of creativeTasks) {
      try {
        await devDb.insert(schema.creativeTasks)
          .values(task)
          .onConflictDoNothing();
        stats.creativeTasks++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.creativeTasks} creative tasks`);
    
    // 7. Insert Student Creative Tasks
    for (const sct of studentCreativeTasks) {
      try {
        await devDb.insert(schema.studentCreativeTasks)
          .values(sct)
          .onConflictDoNothing();
        stats.studentCreativeTasks++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.studentCreativeTasks} assigned creative tasks`);
    
    // 8. Insert Creative Profiles
    for (const profile of creativeProfiles) {
      try {
        await devDb.insert(schema.studentCreativeProfiles)
          .values(profile)
          .onConflictDoNothing();
        stats.creativeProfiles++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.creativeProfiles} creative profiles`);
    
    // 9. Insert Assessments
    for (const assessment of assessments) {
      try {
        await devDb.insert(schema.selfConceptAssessments)
          .values(assessment)
          .onConflictDoNothing();
        stats.assessments++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.assessments} assessments`);
    
    // 10. Insert Assessment Responses
    for (const response of responses) {
      try {
        await devDb.insert(schema.assessmentResponses)
          .values(response)
          .onConflictDoNothing();
        stats.responses++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✓ Migrated ${stats.responses} assessment responses`);
    
    console.log("");
    console.log("=" .repeat(60));
    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📈 Final Statistics:");
    console.log(`   Classes:              ${stats.classes}/${classes.length}`);
    console.log(`   Students:             ${stats.students}/${students.length}`);
    console.log(`   Math Errors:          ${stats.errors}/${errors.length}`);
    console.log(`   Spelling Errors:      ${stats.spellingErrors}/${spellingErrors.length}`);
    console.log(`   Vocabulary:           ${stats.vocabulary}/${vocabulary.length}`);
    console.log(`   Creative Tasks:       ${stats.creativeTasks}/${creativeTasks.length}`);
    console.log(`   Assigned Tasks:       ${stats.studentCreativeTasks}/${studentCreativeTasks.length}`);
    console.log(`   Creative Profiles:    ${stats.creativeProfiles}/${creativeProfiles.length}`);
    console.log(`   Assessments:          ${stats.assessments}/${assessments.length}`);
    console.log(`   Assessment Responses: ${stats.responses}/${responses.length}`);
    console.log("");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await devPool.end();
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("⏳ Starting migration in 3 seconds...");
  console.log("   Press Ctrl+C to cancel");
  console.log("");
  
  setTimeout(() => {
    migrateDevToProduction()
      .then(() => {
        console.log("✅ Migration script completed");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Migration script failed:", error);
        process.exit(1);
      });
  }, 3000);
}
