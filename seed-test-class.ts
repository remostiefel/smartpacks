
import { storage } from "./storage";

const swissFirstNames = [
  "Luca", "Mia", "Noah", "Emma", "Leon", "Lara", "Nico", "Sophie",
  "Tim", "Anna", "Jan", "Lea", "Finn", "Laura", "Ben", "Marie",
  "Matteo", "Elena", "Jonas", "Julia", "Andrin", "Chiara", "Fabio", "Nora",
  "Marco", "Sara", "David", "Lisa", "Pascal", "Nina"
];

const swissLastNames = [
  "Müller", "Meier", "Schmid", "Keller", "Weber", "Huber",
  "Schneider", "Meyer", "Steiner", "Fischer", "Gerber", "Brunner",
  "Baumann", "Frei", "Zimmermann", "Widmer", "Moser", "Graf",
  "Wyss", "Roth", "Küng", "Bühler", "Hofmann", "Lehmann",
  "Tanner", "Suter", "Egger", "Baumgartner", "Furrer", "Hess"
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomError() {
  const operations = ['addition', 'subtraction'];
  const operation = getRandomItem(operations);
  
  if (operation === 'addition') {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    
    const offset = Math.floor(Math.random() * 3) + 1;
    const incorrectAnswer = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
    
    return {
      operation: 'addition' as const,
      num1,
      num2,
      correctAnswer,
      incorrectAnswer,
      errorText: `${num1}+${num2}=${incorrectAnswer}`,
      errorType: getRandomItem(['zehnuebergang_addition', 'calculation_facts', 'complementary_pairs', null])
    };
  } else {
    const num1 = Math.floor(Math.random() * 11) + 10;
    const num2 = Math.floor(Math.random() * num1) + 1;
    const correctAnswer = num1 - num2;
    
    const offset = Math.floor(Math.random() * 3) + 1;
    const incorrectAnswer = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
    
    return {
      operation: 'subtraction' as const,
      num1,
      num2,
      correctAnswer,
      incorrectAnswer,
      errorText: `${num1}-${num2}=${incorrectAnswer}`,
      errorType: getRandomItem(['zehnuebergang_subtraction', 'calculation_facts', 'number_reversal', null])
    };
  }
}

function generateSpellingError() {
  const errors = [
    { incorrect: 'haus', correct: 'Haus', category: 'grammatical', subtype: 'gross_kleinschreibung' },
    { incorrect: 'fer', correct: 'wer', category: 'phonological', subtype: 'konsonanten_verwechslung' },
    { incorrect: 'fater', correct: 'Vater', category: 'phonological', subtype: 'konsonanten_verwechslung' },
    { incorrect: 'muter', correct: 'Mutter', category: 'orthographic', subtype: 'doppelkonsonant' },
    { incorrect: 'schön', correct: 'schön', category: 'orthographic', subtype: 'umlaut' },
    { incorrect: 'broot', correct: 'Brot', category: 'orthographic', subtype: 'doppelvokale' },
    { incorrect: 'schtule', correct: 'Schule', category: 'phonological', subtype: 'verschriftung' },
    { incorrect: 'freunt', correct: 'Freund', category: 'orthographic', subtype: 'eu_äu' },
    { incorrect: 'hant', correct: 'Hand', category: 'phonological', subtype: 'auslautverhärtung' },
    { incorrect: 'faren', correct: 'fahren', category: 'orthographic', subtype: 'dehnungs_h' }
  ];
  
  return getRandomItem(errors);
}

function generateVocabulary() {
  const words = [
    { english: 'house', german: 'Haus', category: 'Zuhause' },
    { english: 'school', german: 'Schule', category: 'Bildung' },
    { english: 'friend', german: 'Freund', category: 'Soziales' },
    { english: 'book', german: 'Buch', category: 'Bildung' },
    { english: 'tree', german: 'Baum', category: 'Natur' },
    { english: 'sun', german: 'Sonne', category: 'Natur' },
    { english: 'water', german: 'Wasser', category: 'Natur' },
    { english: 'family', german: 'Familie', category: 'Soziales' },
    { english: 'dog', german: 'Hund', category: 'Tiere' },
    { english: 'cat', german: 'Katze', category: 'Tiere' }
  ];
  
  return getRandomItem(words);
}

export async function seedTestClass() {
  console.log("🌱 Seeding Test class with comprehensive Swiss student data...");
  
  try {
    const allClasses = await storage.getAllClasses();
    let testClass = allClasses.find(c => c.name === "Test");
    
    if (!testClass) {
      testClass = await storage.createClass({
        name: "Test",
        teacherId: null
      });
      console.log(`✅ Created Test class (ID: ${testClass.id})`);
    } else {
      // Clear existing data for Test class
      const existingStudents = await storage.getStudentsByClass(testClass.id);
      for (const student of existingStudents) {
        await storage.deleteStudent(student.id);
      }
      console.log(`✅ Cleared existing Test class data (ID: ${testClass.id})`);
    }
    
    // Generate 15 diverse students
    const numStudents = 15;
    const usedNames = new Set<string>();
    const students = [];
    
    for (let i = 0; i < numStudents; i++) {
      let firstName: string;
      let lastName: string;
      let fullName: string;
      
      do {
        firstName = getRandomItem(swissFirstNames);
        lastName = getRandomItem(swissLastNames);
        fullName = `${firstName} ${lastName}`;
      } while (usedNames.has(fullName));
      
      usedNames.add(fullName);
      
      // Alternate gender for diversity
      const gender = i % 2 === 0 ? 'male' : 'female';
      
      const student = await storage.createStudent({
        firstName,
        lastName,
        classId: testClass.id,
        gender
      });
      
      students.push(student);
      console.log(`  ✓ Created student: ${firstName} ${lastName} (${gender})`);
    }
    
    // Generate comprehensive test data for each student
    let totalErrors = 0;
    let totalSpellingErrors = 0;
    let totalVocabulary = 0;
    let totalCreativeTasks = 0;
    let totalAssessments = 0;
    let totalProfiles = 0;
    
    // Get available creative tasks
    const creativeTasks = await storage.getAllCreativeTasks();
    
    // Get assessment dimensions and items
    const dimensions = await storage.getAllDimensions();
    const allItems = await storage.getAllItems();
    
    for (const student of students) {
      console.log(`  📝 Generating data for ${student.firstName}...`);
      
      // Math errors: 8-15 per student (comprehensive)
      const numMathErrors = randomInt(8, 15);
      for (let i = 0; i < numMathErrors; i++) {
        const errorData = generateRandomError();
        await storage.createStudentError({
          studentId: student.id,
          errorText: errorData.errorText,
          operation: errorData.operation,
          num1: errorData.num1,
          num2: errorData.num2,
          incorrectAnswer: errorData.incorrectAnswer,
          correctAnswer: errorData.correctAnswer,
          errorType: errorData.errorType
        });
        totalErrors++;
      }
      
      // Spelling errors: 5-12 per student
      const numSpellingErrors = randomInt(5, 12);
      for (let i = 0; i < numSpellingErrors; i++) {
        const spellingError = generateSpellingError();
        await storage.createSpellingError({
          studentId: student.id,
          incorrectWord: spellingError.incorrect,
          correctWord: spellingError.correct,
          context: Math.random() > 0.5 ? `Das Wort kam im Satz vor: "Ich sehe ein ${spellingError.incorrect}."` : null,
          errorCategory: spellingError.category,
          errorSubtype: spellingError.subtype,
          isDaz: Math.random() > 0.7 ? 1 : 0,
          nativeLanguage: Math.random() > 0.7 ? getRandomItem(['Albanisch', 'Türkisch', 'Arabisch', 'Portugiesisch']) : null
        });
        totalSpellingErrors++;
      }
      
      // Vocabulary: 8-15 words per student
      const numVocab = randomInt(8, 15);
      for (let i = 0; i < numVocab; i++) {
        const vocab = generateVocabulary();
        await storage.createVocabularyWord({
          studentId: student.id,
          englishWord: vocab.english,
          germanTranslation: vocab.german,
          category: vocab.category,
          notes: Math.random() > 0.6 ? 'Schwierig für Schüler' : null
        });
        totalVocabulary++;
      }
      
      // Creative tasks: 3-6 per student
      if (creativeTasks.length > 0) {
        const numCreative = randomInt(3, 6);
        const shuffledTasks = [...creativeTasks].sort(() => Math.random() - 0.5);
        for (let i = 0; i < numCreative && i < shuffledTasks.length; i++) {
          const task = shuffledTasks[i];
          await storage.assignCreativeTask({
            studentId: student.id,
            taskId: task.id,
            notes: getRandomItem([
              'Individuell angepasst',
              'Mit Unterstützung',
              'Selbstständig bearbeiten',
              'In Partnerarbeit',
              null
            ])
          });
          totalCreativeTasks++;
        }
      }
      
      // Complete assessment for ALL students
      if (dimensions.length > 0 && allItems.length > 0) {
        const assessment = await storage.createAssessment({
          studentId: student.id,
          conductedBy: null,
          assessmentType: Math.random() > 0.5 ? 'interview' : 'self_report',
          status: 'in_progress'
        });
        
        // Answer all 16 questions
        const responses = [];
        for (const item of allItems) {
          // Generate realistic responses (slightly varied, not all extremes)
          let responseValue;
          if (Math.random() > 0.8) {
            responseValue = randomInt(1, 4); // 20% completely random
          } else {
            // 80% clustered around 2-3 (more realistic)
            responseValue = randomInt(2, 3);
          }
          
          responses.push({
            assessmentId: assessment.id,
            itemId: item.id,
            responseValue
          });
        }
        
        await storage.createBulkResponses(responses);
        
        // Mark assessment as completed
        await storage.updateAssessment(assessment.id, {
          status: 'completed',
          completedAt: new Date()
        });
        
        totalAssessments++;
      }
      
      // Creative profile for ALL students
      const interests = getRandomItem([
        ['Geschichten', 'Tiere', 'Bücher'],
        ['Technik', 'Natur', 'Experimente'],
        ['Kunst', 'Musik', 'Malen'],
        ['Sport', 'Freunde', 'Spiele'],
        ['Bücher', 'Fantasie', 'Schreiben'],
        ['Mathe', 'Rätsel', 'Logik'],
        ['Bauen', 'Konstruieren', 'Lego'],
        ['Theater', 'Tanz', 'Performance']
      ]);
      
      const strengths = getRandomItem([
        ['Kreativität', 'Vorstellungskraft'],
        ['Logisches Denken', 'Problemlösen'],
        ['Empathie', 'Soziale Kompetenz'],
        ['Detailgenauigkeit', 'Gründlichkeit'],
        ['Schnelle Auffassungsgabe', 'Flexibilität'],
        ['Ausdauer', 'Durchhaltevermögen']
      ]);
      
      await storage.upsertStudentCreativeProfile({
        studentId: student.id,
        interests: interests,
        strengths: strengths,
        creativityType: {
          visualVerbal: (Math.random() * 2 - 1), // -1 to 1
          practicalFantasy: (Math.random() * 2 - 1),
          structuredExperimental: (Math.random() * 2 - 1),
          soloCollaborative: (Math.random() * 2 - 1),
          detailOverview: (Math.random() * 2 - 1)
        },
        notes: getRandomItem([
          'Arbeitet gerne selbstständig',
          'Braucht klare Anweisungen',
          'Sehr kreativ und originell',
          'Bevorzugt strukturierte Aufgaben',
          'Liebt Gruppenarbeit',
          null
        ]),
        updatedBy: null
      });
      
      totalProfiles++;
    }
    
    console.log(`\n🎉 Test class comprehensive seeding complete!`);
    console.log(`   - Class: Test (ID: ${testClass.id})`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Math Errors: ${totalErrors}`);
    console.log(`   - Spelling Errors: ${totalSpellingErrors}`);
    console.log(`   - Vocabulary Words: ${totalVocabulary}`);
    console.log(`   - Creative Tasks: ${totalCreativeTasks}`);
    console.log(`   - Assessments: ${totalAssessments}`);
    console.log(`   - Creative Profiles: ${totalProfiles}`);
    
    return {
      class: testClass,
      students,
      mathErrors: totalErrors,
      spellingErrors: totalSpellingErrors,
      vocabulary: totalVocabulary,
      creativeTasks: totalCreativeTasks,
      assessments: totalAssessments,
      profiles: totalProfiles
    };
    
  } catch (error) {
    console.error("❌ Error seeding test class:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestClass()
    .then(() => {
      console.log("✓ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("✗ Seeding failed:", error);
      process.exit(1);
    });
}
