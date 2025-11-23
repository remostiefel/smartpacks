import { readFileSync } from 'fs';
import { storage } from './storage';

/**
 * Import Data to Production
 * 
 * This script imports data from an exported JSON file into production.
 * 
 * Usage:
 *   tsx server/import-prod-data.ts <filename.json>
 */

interface ImportData {
  exportDate: string;
  environment: string;
  data: {
    classes: any[];
    students: any[];
    mathErrors: any[];
    spellingErrors: any[];
    vocabulary: any[];
    creativeTasks: any[];
    studentCreativeTasks: any[];
    creativeProfiles: any[];
    assessments: any[];
  };
}

async function importProdData(filename: string) {
  console.log("📥 Importing Data to Production...");
  console.log("=" .repeat(60));
  
  try {
    // Read file
    console.log(`📂 Reading file: ${filename}`);
    const fileContent = readFileSync(filename, 'utf-8');
    const importData: ImportData = JSON.parse(fileContent);
    
    console.log(`   ✓ Export date: ${importData.exportDate}`);
    console.log(`   ✓ Source environment: ${importData.environment}`);
    console.log("");
    
    const stats = {
      classes: 0,
      students: 0,
      mathErrors: 0,
      spellingErrors: 0,
      vocabulary: 0,
      creativeTasks: 0,
      studentCreativeTasks: 0,
      creativeProfiles: 0,
      assessments: 0
    };
    
    // Map old IDs to new IDs
    const classIdMap = new Map<number, number>();
    const studentIdMap = new Map<number, number>();
    const taskIdMap = new Map<number, number>();
    
    // 1. Import Classes
    console.log("📋 Importing classes...");
    for (const cls of importData.data.classes) {
      const existing = await storage.getAllClasses();
      const found = existing.find(c => c.name === cls.name);
      
      if (found) {
        console.log(`   ⏭️  Class "${cls.name}" already exists, using existing ID`);
        classIdMap.set(cls.id, found.id);
      } else {
        const newClass = await storage.createClass({
          name: cls.name,
          teacherId: cls.teacherId
        });
        classIdMap.set(cls.id, newClass.id);
        stats.classes++;
        console.log(`   ✓ Created class: ${cls.name}`);
      }
    }
    
    // 2. Import Students
    console.log("👥 Importing students...");
    for (const student of importData.data.students) {
      const newClassId = classIdMap.get(student.classId);
      if (!newClassId) {
        console.log(`   ⚠️  Skipping student ${student.firstName} ${student.lastName} - class not found`);
        continue;
      }
      
      const existing = await storage.getStudentsByClass(newClassId);
      const found = existing.find(s => 
        s.firstName === student.firstName && 
        s.lastName === student.lastName
      );
      
      if (found) {
        console.log(`   ⏭️  Student "${student.firstName} ${student.lastName}" already exists`);
        studentIdMap.set(student.id, found.id);
      } else {
        const newStudent = await storage.createStudent({
          firstName: student.firstName,
          lastName: student.lastName,
          classId: newClassId,
          gender: student.gender
        });
        studentIdMap.set(student.id, newStudent.id);
        stats.students++;
        console.log(`   ✓ Created student: ${student.firstName} ${student.lastName}`);
      }
    }
    
    // 3. Import Math Errors
    console.log("🔢 Importing math errors...");
    for (const error of importData.data.mathErrors) {
      const newStudentId = studentIdMap.get(error.studentId);
      if (!newStudentId) continue;
      
      await storage.createStudentError({
        studentId: newStudentId,
        errorText: error.errorText,
        operation: error.operation,
        num1: error.num1,
        num2: error.num2,
        incorrectAnswer: error.incorrectAnswer,
        correctAnswer: error.correctAnswer,
        errorType: error.errorType
      });
      stats.mathErrors++;
    }
    console.log(`   ✓ Imported ${stats.mathErrors} math errors`);
    
    // 4. Import Spelling Errors
    console.log("📝 Importing spelling errors...");
    for (const error of importData.data.spellingErrors) {
      const newStudentId = studentIdMap.get(error.studentId);
      if (!newStudentId) continue;
      
      await storage.createSpellingError({
        studentId: newStudentId,
        incorrectWord: error.incorrectWord,
        correctWord: error.correctWord,
        context: error.context,
        errorCategory: error.errorCategory,
        errorSubtype: error.errorSubtype,
        isDaz: error.isDaz,
        nativeLanguage: error.nativeLanguage
      });
      stats.spellingErrors++;
    }
    console.log(`   ✓ Imported ${stats.spellingErrors} spelling errors`);
    
    // 5. Import Vocabulary
    console.log("📚 Importing vocabulary...");
    for (const word of importData.data.vocabulary) {
      const newStudentId = studentIdMap.get(word.studentId);
      if (!newStudentId) continue;
      
      await storage.createVocabularyWord({
        studentId: newStudentId,
        englishWord: word.englishWord,
        germanTranslation: word.germanTranslation,
        category: word.category,
        notes: word.notes
      });
      stats.vocabulary++;
    }
    console.log(`   ✓ Imported ${stats.vocabulary} vocabulary words`);
    
    // 6. Import Creative Tasks
    console.log("🎨 Importing creative tasks...");
    for (const task of importData.data.creativeTasks) {
      const existing = await storage.getAllCreativeTasks();
      const found = existing.find(t => t.title === task.title);
      
      if (found) {
        taskIdMap.set(task.id, found.id);
      } else {
        const newTask = await storage.createCreativeTask({
          title: task.title,
          description: task.description,
          category: task.category,
          difficulty: task.difficulty,
          estimatedMinutes: task.estimatedMinutes,
          materialsNeeded: task.materialsNeeded,
          tags: task.tags
        });
        taskIdMap.set(task.id, newTask.id);
        stats.creativeTasks++;
      }
    }
    console.log(`   ✓ Imported ${stats.creativeTasks} creative tasks`);
    
    // 7. Import Student Creative Tasks
    console.log("📌 Importing assigned creative tasks...");
    for (const sct of importData.data.studentCreativeTasks) {
      const newStudentId = studentIdMap.get(sct.studentId);
      const newTaskId = taskIdMap.get(sct.taskId);
      if (!newStudentId || !newTaskId) continue;
      
      await storage.assignCreativeTask({
        studentId: newStudentId,
        taskId: newTaskId,
        notes: sct.notes
      });
      stats.studentCreativeTasks++;
    }
    console.log(`   ✓ Imported ${stats.studentCreativeTasks} assigned tasks`);
    
    // 8. Import Creative Profiles
    console.log("🎭 Importing creative profiles...");
    for (const profile of importData.data.creativeProfiles) {
      const newStudentId = studentIdMap.get(profile.studentId);
      if (!newStudentId) continue;
      
      await storage.upsertStudentCreativeProfile({
        studentId: newStudentId,
        interests: profile.interests,
        strengths: profile.strengths,
        creativityType: profile.creativityType,
        notes: profile.notes,
        updatedBy: profile.updatedBy
      });
      stats.creativeProfiles++;
    }
    console.log(`   ✓ Imported ${stats.creativeProfiles} creative profiles`);
    
    // 9. Import Assessments (basic, without responses)
    console.log("📊 Importing assessments...");
    for (const assessment of importData.data.assessments) {
      const newStudentId = studentIdMap.get(assessment.studentId);
      if (!newStudentId) continue;
      
      await storage.createAssessment({
        studentId: newStudentId,
        conductedBy: assessment.conductedBy,
        assessmentType: assessment.assessmentType,
        status: assessment.status
      });
      stats.assessments++;
    }
    console.log(`   ✓ Imported ${stats.assessments} assessments`);
    
    console.log("");
    console.log("=" .repeat(60));
    console.log("✅ Import completed successfully!");
    console.log("");
    console.log("📊 Final Statistics:");
    console.log(`   Classes:          ${stats.classes}`);
    console.log(`   Students:         ${stats.students}`);
    console.log(`   Math Errors:      ${stats.mathErrors}`);
    console.log(`   Spelling Errors:  ${stats.spellingErrors}`);
    console.log(`   Vocabulary:       ${stats.vocabulary}`);
    console.log(`   Creative Tasks:   ${stats.creativeTasks}`);
    console.log(`   Assigned Tasks:   ${stats.studentCreativeTasks}`);
    console.log(`   Profiles:         ${stats.creativeProfiles}`);
    console.log(`   Assessments:      ${stats.assessments}`);
    console.log("");
    
  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  }
}

// Run import
if (import.meta.url === `file://${process.argv[1]}`) {
  const filename = process.argv[2];
  
  if (!filename) {
    console.error("❌ Please provide a filename:");
    console.error("   tsx server/import-prod-data.ts <filename.json>");
    process.exit(1);
  }
  
  importProdData(filename)
    .then(() => {
      console.log("✅ Import completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Import failed:", error);
      process.exit(1);
    });
}

export { importProdData };
