import { writeFileSync } from 'fs';
import { storage } from './storage';

/**
 * Export Development Data to JSON
 * 
 * This script exports all development data to a JSON file
 * that can be imported into production.
 * 
 * Usage:
 *   tsx server/export-dev-data.ts
 */

async function exportDevData() {
  console.log("📤 Exporting Development Data...");
  console.log("=" .repeat(60));
  
  try {
    const exportData: any = {
      exportDate: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      data: {}
    };
    
    // 1. Export Classes
    console.log("📋 Exporting classes...");
    const classes = await storage.getAllClasses();
    exportData.data.classes = classes;
    console.log(`   ✓ Exported ${classes.length} classes`);
    
    // 2. Export Students
    console.log("👥 Exporting students...");
    const allStudents = [];
    for (const cls of classes) {
      const students = await storage.getStudentsByClass(cls.id);
      allStudents.push(...students);
    }
    exportData.data.students = allStudents;
    console.log(`   ✓ Exported ${allStudents.length} students`);
    
    // 3. Export Math Errors
    console.log("🔢 Exporting math errors...");
    const allErrors = [];
    for (const student of allStudents) {
      const errors = await storage.getStudentErrors(student.id);
      allErrors.push(...errors);
    }
    exportData.data.mathErrors = allErrors;
    console.log(`   ✓ Exported ${allErrors.length} math errors`);
    
    // 4. Export Spelling Errors
    console.log("📝 Exporting spelling errors...");
    const allSpellingErrors = [];
    for (const student of allStudents) {
      const errors = await storage.getSpellingErrors(student.id);
      allSpellingErrors.push(...errors);
    }
    exportData.data.spellingErrors = allSpellingErrors;
    console.log(`   ✓ Exported ${allSpellingErrors.length} spelling errors`);
    
    // 5. Export Vocabulary
    console.log("📚 Exporting vocabulary...");
    const allVocabulary = [];
    for (const student of allStudents) {
      const words = await storage.getVocabularyWords(student.id);
      allVocabulary.push(...words);
    }
    exportData.data.vocabulary = allVocabulary;
    console.log(`   ✓ Exported ${allVocabulary.length} vocabulary words`);
    
    // 6. Export Creative Tasks
    console.log("🎨 Exporting creative tasks...");
    const creativeTasks = await storage.getAllCreativeTasks();
    exportData.data.creativeTasks = creativeTasks;
    console.log(`   ✓ Exported ${creativeTasks.length} creative tasks`);
    
    // 7. Export Student Creative Tasks
    console.log("📌 Exporting assigned creative tasks...");
    const allStudentTasks = [];
    for (const student of allStudents) {
      const tasks = await storage.getStudentCreativeTasks(student.id);
      allStudentTasks.push(...tasks);
    }
    exportData.data.studentCreativeTasks = allStudentTasks;
    console.log(`   ✓ Exported ${allStudentTasks.length} assigned tasks`);
    
    // 8. Export Creative Profiles
    console.log("🎭 Exporting creative profiles...");
    const allProfiles = [];
    for (const student of allStudents) {
      const profile = await storage.getStudentCreativeProfile(student.id);
      if (profile) {
        allProfiles.push(profile);
      }
    }
    exportData.data.creativeProfiles = allProfiles;
    console.log(`   ✓ Exported ${allProfiles.length} creative profiles`);
    
    // 9. Export Assessments (without responses for now - they're complex)
    console.log("📊 Exporting assessments...");
    const allAssessments = [];
    for (const student of allStudents) {
      const assessments = await storage.getStudentAssessments(student.id);
      allAssessments.push(...assessments);
    }
    exportData.data.assessments = allAssessments;
    console.log(`   ✓ Exported ${allAssessments.length} assessments`);
    
    // Write to file
    const filename = `dev-data-export-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log("");
    console.log("=" .repeat(60));
    console.log("✅ Export completed successfully!");
    console.log(`📁 File: ${filename}`);
    console.log("");
    console.log("📊 Summary:");
    console.log(`   Classes:          ${classes.length}`);
    console.log(`   Students:         ${allStudents.length}`);
    console.log(`   Math Errors:      ${allErrors.length}`);
    console.log(`   Spelling Errors:  ${allSpellingErrors.length}`);
    console.log(`   Vocabulary:       ${allVocabulary.length}`);
    console.log(`   Creative Tasks:   ${creativeTasks.length}`);
    console.log(`   Assigned Tasks:   ${allStudentTasks.length}`);
    console.log(`   Profiles:         ${allProfiles.length}`);
    console.log(`   Assessments:      ${allAssessments.length}`);
    console.log("");
    console.log("📤 Next steps:");
    console.log("   1. Download this file");
    console.log("   2. Upload to production environment");
    console.log("   3. Run: tsx server/import-prod-data.ts <filename>");
    console.log("");
    
    return filename;
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// Run export
if (import.meta.url === `file://${process.argv[1]}`) {
  exportDevData()
    .then((filename) => {
      console.log(`✅ Export saved to: ${filename}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Export failed:", error);
      process.exit(1);
    });
}

export { exportDevData };
