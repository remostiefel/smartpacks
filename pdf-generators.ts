import PDFDocument from "pdfkit";
import type { StudentError, SpellingError, VocabularyWord, StudentCreativeTask, CreativeTask, LivingLifeTask } from "@shared/schema";
import type { HomeworkContent } from "./openai";
import type { GeneratedSpellingExercise, SpellingWorksheetPlan } from "./spelling-exercises";

// PDF Template Options
export interface PDFTemplateOptions {
  layout?: 'compact' | 'spacious';  // compact = mehr Aufgaben, spacious = mehr Platz zum Schreiben
  images?: boolean;                   // true = mit Illustrationen, false = text-only
  color?: boolean;                    // true = farbig, false = schwarz-weiß (drucker-freundlich)
}

// Default template options
const DEFAULT_OPTIONS: PDFTemplateOptions = {
  layout: 'spacious',
  images: false,
  color: true
};

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper to scramble word
function scrambleWord(word: string): string {
  return word.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate Math Worksheet PDF
export function generateMathWorksheet(
  studentName: string,
  errors: StudentError[],
  options: PDFTemplateOptions = DEFAULT_OPTIONS
): PDFKit.PDFDocument {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const doc = new PDFDocument({ size: 'A4', margin: opts.layout === 'compact' ? 40 : 50 });

  // Color scheme
  const primaryColor = opts.color ? '#FF6B35' : '#000000';  // Orange for math or black
  const secondaryColor = opts.color ? '#004E89' : '#000000';

  // Title
  doc.fillColor(primaryColor).fontSize(20).text('Mathematik Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // Generate similar problems based on errors
  doc.fillColor(secondaryColor).fontSize(14).text('Übungsaufgaben:', { underline: true });
  doc.fillColor('#000000');
  doc.moveDown();

  const exercises: string[] = [];
  const exercisesPerError = opts.layout === 'compact' ? 5 : 3;

  errors.forEach((error, index) => {
    // Generate exercises per error (more in compact mode)
    for (let i = 0; i < exercisesPerError; i++) {
      const num1 = Math.max(1, error.num1 + Math.floor(Math.random() * 10) - 5);
      const num2 = Math.max(1, error.num2 + Math.floor(Math.random() * 10) - 5);
      const operator = error.operation === 'addition' ? '+' : '-';
      exercises.push(`${num1} ${operator} ${num2} = _______`);
    }
  });

  // Optional: Add decorative math graphics (when images=true)
  if (opts.images) {
    const iconColor = opts.color ? primaryColor : '#999999';
    // Draw simple geometric math symbols
    doc.save();
    doc.strokeColor(iconColor).lineWidth(2);
    // Plus symbol
    doc.moveTo(505, 55).lineTo(515, 55).stroke();
    doc.moveTo(510, 50).lineTo(510, 60).stroke();
    // Minus symbol
    doc.moveTo(505, 75).lineTo(515, 75).stroke();
    doc.restore();
  }

  // Display exercises
  const shuffled = shuffleArray(exercises);
  const spacing = opts.layout === 'compact' ? 0.3 : 0.8;

  shuffled.forEach((exercise, index) => {
    doc.fontSize(12).text(`${index + 1}. ${exercise}`, { continued: false });
    if ((index + 1) % 5 === 0) {
      doc.moveDown(spacing);
    }
  });

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}

// Generate German Spelling Worksheet PDF
export function generateSpellingWorksheet(
  studentName: string,
  errors: SpellingError[],
  options: PDFTemplateOptions = DEFAULT_OPTIONS
): PDFKit.PDFDocument {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const doc = new PDFDocument({ size: 'A4', margin: opts.layout === 'compact' ? 40 : 50 });

  // Color scheme (blue for German)
  const primaryColor = opts.color ? '#4A90E2' : '#000000';
  const secondaryColor = opts.color ? '#004E89' : '#000000';

  // Title
  doc.fillColor(primaryColor).fontSize(20).text('Rechtschreibung Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // Optional: Add decorative spelling graphics (when images=true)
  if (opts.images) {
    const iconColor = opts.color ? primaryColor : '#999999';
    // Draw pencil shape
    doc.save();
    doc.strokeColor(iconColor).lineWidth(2);
    doc.moveTo(500, 55).lineTo(510, 65).stroke();
    doc.circle(512, 67, 3).stroke();
    // Draw letter shapes
    doc.fontSize(8).fillColor(iconColor).text('ABC', 500, 75);
    doc.restore();
  }

  // Section 1: Letter by Letter
  doc.fillColor(secondaryColor).fontSize(14).text('Übung 1: Buchstabieren', { underline: true });
  doc.fillColor('#000000');
  doc.moveDown();

  const wordsToShow = opts.layout === 'compact' ? 5 : 3;
  errors.slice(0, wordsToShow).forEach((error) => {
    doc.fontSize(12).text(`Wort: ${error.correctWord}`);
    const word = error.correctWord;
    for (let i = 1; i <= word.length; i++) {
      doc.fontSize(10).text(`  ${word.substring(0, i)}`);
    }
    doc.moveDown(opts.layout === 'compact' ? 0.3 : 0.8);
  });

  doc.addPage();

  // Section 2: Fill in the blanks
  doc.fontSize(14).text('Übung 2: Lückentexte', { underline: true });
  doc.moveDown();
  errors.forEach((error, index) => {
    const word = error.correctWord;
    const blanked = word.split('').map((char, i) => i % 2 === 0 ? '_' : char).join('');
    doc.fontSize(12).text(`${index + 1}. ${blanked} → _______________`);
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Section 3: Word pairs
  doc.fontSize(14).text('Übung 3: Wortpaare zuordnen', { underline: true });
  doc.moveDown();
  doc.fontSize(10).text('Verbinde das falsch geschriebene Wort mit der richtigen Schreibweise:');
  doc.moveDown();

  const leftColumn = errors.map(e => e.incorrectWord);
  const rightColumn = shuffleArray(errors.map(e => e.correctWord));

  leftColumn.forEach((incorrect, index) => {
    doc.fontSize(11).text(`${index + 1}. ${incorrect}     _____     ${String.fromCharCode(65 + index)}. ${rightColumn[index]}`);
    doc.moveDown(0.5);
  });

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}

/**
 * NEUE VERSION: Generiert professionelle Rechtschreib-Arbeitsblätter
 * basierend auf strukturierten Übungen aus dem Übungsgenerator
 */
export function generateAdvancedSpellingWorksheet(
  worksheetPlan: SpellingWorksheetPlan,
  options: PDFTemplateOptions = DEFAULT_OPTIONS
): PDFKit.PDFDocument {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const doc = new PDFDocument({ size: 'A4', margin: opts.layout === 'compact' ? 40 : 50 });

  // Color scheme (blue for German)
  const primaryColor = opts.color ? '#4A90E2' : '#000000';
  const secondaryColor = opts.color ? '#004E89' : '#000000';
  const hintColor = opts.color ? '#10B981' : '#666666';

  // ===== TITELSEITE =====
  doc.fillColor(primaryColor).fontSize(22).text('Rechtschreibung Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${worksheetPlan.studentName}`, { align: 'left' });
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown();

  // Fehlerschwerpunkt anzeigen
  doc.fillColor(secondaryColor).fontSize(11).text(`Schwerpunkt: ${worksheetPlan.errorFocus.subtype}`, { align: 'left' });
  doc.fillColor('#000000').fontSize(10).text(`(${worksheetPlan.errorFocus.errorCount} Fehler gefunden)`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 1.5);

  // DaZ-Hinweis falls relevant
  if (worksheetPlan.isDazStudent) {
    doc.fillColor(hintColor).fontSize(10)
      .text('📝 DaZ-Schüler: Übungen mit zusätzlichen Hinweisen', { align: 'left' });
    doc.fillColor('#000000');
    doc.moveDown();
  }

  // Pädagogische Hinweise für Lehrperson (optional in Fußzeile)
  if (opts.layout === 'spacious') {
    doc.fontSize(8).fillColor('#999999')
      .text(`Förderhinweis: ${worksheetPlan.pedagogicalNotes[0]}`, { align: 'left' });
    doc.fillColor('#000000');
  }

  doc.moveDown(opts.layout === 'compact' ? 0.5 : 1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // ===== ÜBUNGEN =====
  worksheetPlan.exercises.forEach((exercise, exerciseIndex) => {
    // Neue Seite für jede Übung (außer die erste)
    if (exerciseIndex > 0) {
      doc.addPage();
    }

    // Übungstitel
    doc.fillColor(secondaryColor).fontSize(16)
      .text(`Übung ${exerciseIndex + 1}: ${exercise.title}`, { underline: true });
    doc.fillColor('#000000');
    doc.moveDown(0.5);

    // Anweisungen
    doc.fontSize(10).fillColor('#444444')
      .text(exercise.instructions, { align: 'left' });
    doc.fillColor('#000000');
    doc.moveDown(opts.layout === 'compact' ? 0.5 : 1);

    // Didaktisches Ziel (nur bei spacious layout)
    if (opts.layout === 'spacious') {
      doc.fontSize(9).fillColor('#666666')
        .text(`Ziel: ${exercise.didacticGoal}`, { align: 'left' });
      doc.fillColor('#000000');
      doc.moveDown(0.3);
    }

    // Regeln/Hinweise anzeigen (falls vorhanden)
    if (exercise.rules && exercise.rules.length > 0) {
      doc.fillColor(hintColor).fontSize(10).text('💡 Merke:', { continued: false });
      exercise.rules.forEach(rule => {
        doc.fillColor('#000000').fontSize(9).text(`  • ${rule}`, { align: 'left' });
      });
      doc.moveDown(0.5);
    }

    // Hinweise (falls vorhanden, z.B. bei DaZ)
    if (exercise.hints && exercise.hints.length > 0) {
      doc.fillColor(hintColor).fontSize(9).text('Tipp:', { continued: false });
      exercise.hints.forEach(hint => {
        doc.fillColor('#666666').fontSize(8).text(`  → ${hint}`, { align: 'left' });
      });
      doc.fillColor('#000000');
      doc.moveDown(0.5);
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ===== AUFGABEN =====
    const spacing = opts.layout === 'compact' ? 0.5 : 1;
    const maxTasksPerPage = opts.layout === 'compact' ? 15 : 10;

    exercise.tasks.forEach((task, taskIndex) => {
      // Seitenumbruch wenn nötig
      if (taskIndex > 0 && taskIndex % maxTasksPerPage === 0) {
        doc.addPage();
        doc.fillColor(secondaryColor).fontSize(14)
          .text(`${exercise.title} (Fortsetzung)`, { underline: true });
        doc.fillColor('#000000');
        doc.moveDown();
      }

      // Aufgabennummer
      doc.fontSize(11).fillColor('#000000')
        .text(`${task.taskNumber}. ${task.content}`, { align: 'left' });

      // Erklärung/Zusatzinfo (falls vorhanden)
      if (task.explanation) {
        doc.fontSize(9).fillColor('#666666')
          .text(`   ${task.explanation}`, { align: 'left' });
        doc.fillColor('#000000');
      }

      doc.moveDown(spacing);
    });

    // Leerzeile am Ende der Übung
    doc.moveDown(opts.layout === 'compact' ? 0.5 : 1);
  });

  // ===== LÖSUNGSSEITE (optional) =====
  if (opts.layout === 'spacious') {
    doc.addPage();
    doc.fillColor(secondaryColor).fontSize(18).text('Lösungen (für Lehrperson)', { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown();

    worksheetPlan.exercises.forEach((exercise, exerciseIndex) => {
      doc.fontSize(12).fillColor(secondaryColor)
        .text(`Übung ${exerciseIndex + 1}: ${exercise.title}`);
      doc.fillColor('#000000');
      doc.moveDown(0.3);

      exercise.tasks.forEach((task) => {
        if (task.solution) {
          doc.fontSize(9).text(`${task.taskNumber}. ${task.solution}`);
        }
      });

      doc.moveDown(0.8);
    });
  }

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}

// Generate English Vocabulary Worksheet PDF
export function generateVocabularyWorksheet(
  studentName: string,
  words: VocabularyWord[],
  options: PDFTemplateOptions = DEFAULT_OPTIONS
): PDFKit.PDFDocument {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const doc = new PDFDocument({ size: 'A4', margin: opts.layout === 'compact' ? 40 : 50 });

  // Color scheme (violet for English)
  const primaryColor = opts.color ? '#8B5CF6' : '#000000';
  const secondaryColor = opts.color ? '#5B21B6' : '#000000';

  // Title
  doc.fillColor(primaryColor).fontSize(20).text('English Vocabulary Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // Optional: Add decorative vocabulary graphics (when images=true)
  if (opts.images) {
    const iconColor = opts.color ? primaryColor : '#999999';
    // Draw language symbols (flags represented as simple rectangles)
    doc.save();
    doc.strokeColor(iconColor).lineWidth(1);
    // English flag placeholder
    doc.rect(500, 50, 20, 12).stroke();
    // German flag placeholder
    doc.rect(500, 70, 20, 12).stroke();
    doc.restore();
  }

  // Section 1: Flashcards
  doc.fillColor(secondaryColor).fontSize(14).text('Übung 1: Karteikarten (zum Ausschneiden)', { underline: true });
  doc.fillColor('#000000');
  doc.moveDown();

  const flashcardCount = opts.layout === 'compact' ? 8 : 6;
  const cardHeight = opts.layout === 'compact' ? 80 : 100;
  const startY = doc.y;  // Fix baseline before loop

  words.slice(0, flashcardCount).forEach((word, index) => {
    const x = (index % 2) * 250 + 50;
    const row = Math.floor(index / 2);
    const y = startY + row * (cardHeight + 10);  // +10 for spacing

    doc.rect(x, y, 200, cardHeight).stroke();
    doc.fontSize(12).text(word.englishWord, x + 10, y + cardHeight/2 - 5, { width: 180, align: 'center', continued: false });
  });

  // Move cursor past all cards
  const totalRows = Math.ceil(flashcardCount / 2);
  doc.y = startY + totalRows * (cardHeight + 10) + 20;

  doc.addPage();

  // Section 2: Word Scramble
  doc.fontSize(14).text('Übung 2: Buchstabensalat', { underline: true });
  doc.moveDown();
  doc.fontSize(10).text('Ordne die Buchstaben und schreibe das richtige Wort:');
  doc.moveDown();

  words.forEach((word, index) => {
    const scrambled = scrambleWord(word.englishWord);
    doc.fontSize(11).text(`${index + 1}. ${word.germanTranslation}: ${scrambled} → _______________`);
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Section 3: Matching Exercise
  doc.fontSize(14).text('Übung 3: Zuordnen', { underline: true });
  doc.moveDown();
  doc.fontSize(10).text('Verbinde das englische Wort mit der deutschen Übersetzung:');
  doc.moveDown();

  const englishWords = words.map(w => w.englishWord);
  const germanWords = shuffleArray(words.map(w => w.germanTranslation));

  englishWords.forEach((english, index) => {
    doc.fontSize(11).text(`${index + 1}. ${english}     _____     ${String.fromCharCode(65 + index)}. ${germanWords[index]}`);
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Section 4: Spelling Practice
  doc.fontSize(14).text('Übung 4: Buchstabieren', { underline: true });
  doc.moveDown();
  words.slice(0, 5).forEach((word) => {
    doc.fontSize(12).text(`Deutsch: ${word.germanTranslation}`);
    doc.fontSize(11).text(`English: ${word.englishWord}`);
    const english = word.englishWord;
    for (let i = 1; i <= english.length; i++) {
      doc.fontSize(10).text(`  ${english.substring(0, i)}`);
    }
    doc.moveDown();
  });

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}

// Generate Creative Task Worksheet PDF
export function generateCreativeTaskWorksheet(
  studentName: string,
  tasks: Array<StudentCreativeTask & { task: CreativeTask }>
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Title
  doc.fontSize(22).text('Kreative Hausaufgaben', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(2);

  // Instructions
  doc.fontSize(10).fillColor('#666666')
    .text('Hinweis: Wähle eine oder mehrere Aufgaben aus und bearbeite sie auf einem separaten Blatt oder im Heft.', { align: 'left' });
  doc.fillColor('#000000').moveDown(2);

  // Generate tasks
  tasks.forEach((assignment, index) => {
    if (index > 0 && index % 2 === 0) {
      doc.addPage();
    }

    // Task number and title
    doc.fontSize(16).fillColor('#2563eb')
      .text(`Aufgabe ${index + 1}: ${assignment.task.title}`, { underline: true });
    doc.fillColor('#000000').moveDown(0.5);

    // Category badge
    doc.fontSize(10).fillColor('#666666')
      .text(`Kategorie: ${assignment.task.category}`, { align: 'left' });
    doc.fillColor('#000000').moveDown(0.5);

    // Age group if available
    if (assignment.task.ageGroup) {
      doc.fontSize(10).fillColor('#666666')
        .text(`Altersgruppe: ${assignment.task.ageGroup}`, { align: 'left' });
      doc.fillColor('#000000').moveDown(0.5);
    }

    // Task description
    doc.fontSize(11).text(assignment.task.description, {
      align: 'justify',
      lineGap: 4
    });
    doc.moveDown();

    // Teacher's notes if available
    if (assignment.notes) {
      doc.fontSize(10).fillColor('#059669')
        .text(`📝 Hinweis von deinem Lehrer: ${assignment.notes}`, {
          align: 'left',
          lineGap: 3
        });
      doc.fillColor('#000000');
    }

    doc.moveDown(1.5);

    // Workspace area
    doc.fontSize(9).fillColor('#888888')
      .text('Platz für Notizen und erste Ideen:', { align: 'left' });
    doc.fillColor('#000000').moveDown(0.5);

    // Draw lines for writing
    const startY = doc.y;
    for (let i = 0; i < 4; i++) {
      const lineY = startY + (i * 20);
      doc.moveTo(50, lineY)
        .lineTo(545, lineY)
        .strokeColor('#cccccc')
        .stroke();
    }
    doc.strokeColor('#000000');
    doc.moveDown(5);
  });

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}

// Generate Facetten Worksheet PDF
export function generateFacettenWorksheet(
  studentName: string,
  clusterWorksheet: any // ClusterWorksheet from facetten-generator
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Title
  doc.fontSize(22).fillColor('#2563eb').text(clusterWorksheet.clusterName, { align: 'center' });
  doc.fillColor('#000000').moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(2);

  // Instruction
  doc.fontSize(10).fillColor('#666666')
    .text('💡 Hinweis: Alle drei Facetten haben die gleiche Schwierigkeit - nur die Zahlen ändern sich!', { align: 'center' });
  doc.fillColor('#000000').moveDown(2);

  // Render 3 Facetten
  clusterWorksheet.facetten.forEach((facette: any, index: number) => {
    const levelNames: Record<string, string> = { basis: 'BASIS SCHAFFEN', anwenden: 'ANWENDEN', verknuepfen: 'VERKNÜPFEN' };
    const colors: Record<string, string> = { basis: '#059669', anwenden: '#2563eb', verknuepfen: '#9333ea' };

    // Facette Header
    doc.fontSize(16).fillColor(colors[facette.level] || '#000000')
      .text(`FACETTE ${index + 1}: ${levelNames[facette.level] || facette.level}`, { underline: true });
    doc.fillColor('#000000').moveDown(0.5);

    const paeckchen = facette.generatedPaeckchen;

    // Title and Instructions
    doc.fontSize(14).text(paeckchen.title);
    doc.fontSize(11).text(paeckchen.instructions, { lineGap: 3 });
    doc.moveDown(0.5);

    // Pattern hint
    if (paeckchen.patternHint) {
      doc.fontSize(10).fillColor('#666666').text(`🔍 ${paeckchen.patternHint}`);
      doc.fillColor('#000000').moveDown(0.5);
    }

    // Problems
    if (paeckchen.problems) {
      paeckchen.problems.forEach((problem: string, pIndex: number) => {
        doc.fontSize(12).text(`${pIndex + 1}. ${problem}`);
        doc.moveDown(0.3);
      });
    }

    // Decomposition steps
    if (paeckchen.decompositionSteps) {
      doc.fontSize(11).fillColor('#059669').text('📝 Schritte:');
      paeckchen.decompositionSteps.forEach((step: string) => {
        doc.fontSize(10).text(`   ${step}`);
      });
      doc.fillColor('#000000').moveDown(0.5);
    }

    // Reflection area
    const reflexionKey = index === 0 ? 'nachBasis' : index === 1 ? 'nachAnwenden' : 'nachVerknuepfen';
    doc.fontSize(11).fillColor('#9333ea')
      .text(`🤔 ${clusterWorksheet.reflexionFragen[reflexionKey]}`);
    doc.fillColor('#000000').moveDown(0.5);

    // Lines for answer
    const startY = doc.y;
    for (let i = 0; i < 3; i++) {
      const lineY = startY + (i * 18);
      if (lineY < 750) {
        doc.moveTo(50, lineY).lineTo(545, lineY).strokeColor('#cccccc').stroke();
      }
    }
    doc.strokeColor('#000000');
    doc.moveDown(4);

    // Page break between facetten if needed
    if (index < 2 && doc.y > 600) {
      doc.addPage();
    }
  });

  return doc;
}

// Generate Homework Worksheet PDF
export function generateHomeworkWorksheet(
  studentName: string,
  homeworkContent: HomeworkContent
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Cover page with title
  doc.fontSize(22).text(homeworkContent.title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(2);

  // Instructions header
  doc.fontSize(10).fillColor('#666666')
    .text('Hinweis: Diese Hausaufgaben wurden speziell für dich erstellt, basierend auf den Themen, die du üben solltest.', { align: 'left' });
  doc.fillColor('#000000').moveDown(2);

  // Render exercises
  homeworkContent.exercises.forEach((exercise, index) => {
    // Check if we need a new page (if Y position is too low)
    if (doc.y > 650) {
      doc.addPage();
    }

    // Exercise number and title
    doc.fontSize(16).fillColor('#2563eb')
      .text(`Aufgabe ${index + 1}: ${exercise.title}`, { underline: true });
    doc.fillColor('#000000').moveDown(0.5);

    // Exercise type badge
    if (exercise.type) {
      doc.fontSize(10).fillColor('#666666')
        .text(`Typ: ${exercise.type}`, { align: 'left' });
      doc.fillColor('#000000').moveDown(0.5);
    }

    // Instructions
    if (exercise.instructions) {
      doc.fontSize(11).text(exercise.instructions, {
        align: 'justify',
        lineGap: 3
      });
      doc.moveDown();
    }

    // Pattern hint (visual arrows and indicators)
    if (exercise.patternHint) {
      doc.fontSize(10).fillColor('#2563eb')
        .text(`🔍 Muster-Hinweis: ${exercise.patternHint}`, {
          align: 'left',
          lineGap: 3
        });
      doc.fillColor('#000000').moveDown(0.5);
    }

    // Problems/tasks
    if (exercise.problems && exercise.problems.length > 0) {
      doc.fontSize(12).text('Aufgaben:', { underline: true });
      doc.moveDown(0.5);

      exercise.problems.forEach((problem, pIndex) => {
        doc.fontSize(11).text(`${pIndex + 1}. ${problem}`, {
          lineGap: 2
        });
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Sentence stems for pattern description
    if (exercise.sentenceStems && exercise.sentenceStems.length > 0) {
      doc.fontSize(12).text('Beschreibe das Muster:', { underline: true });
      doc.moveDown(0.5);

      exercise.sentenceStems.forEach((stem, sIndex) => {
        doc.fontSize(11).text(stem, {
          lineGap: 4
        });

        // Add lines for student to write on
        const startY = doc.y + 5;
        for (let i = 0; i < 2; i++) {
          const lineY = startY + (i * 15);
          if (lineY < 750) {
            doc.moveTo(50, lineY)
              .lineTo(545, lineY)
              .strokeColor('#cccccc')
              .stroke();
          }
        }
        doc.strokeColor('#000000');
        doc.moveDown(2.5);
      });
    }

    // Fill-in-the-blanks section
    if (exercise.fillInBlanks && exercise.fillInBlanks.length > 0) {
      doc.fontSize(12).text('Setze fort:', { underline: true });
      doc.moveDown(0.5);

      exercise.fillInBlanks.forEach((blank, bIndex) => {
        doc.fontSize(11).text(`${bIndex + 1}. ${blank}`, {
          lineGap: 2
        });
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Explanation/reflection section
    if (exercise.explanation) {
      doc.fontSize(11).fillColor('#059669')
        .text(`💡 Zum Nachdenken: ${exercise.explanation}`, {
          align: 'left',
          lineGap: 3
        });
      doc.fillColor('#000000');
      doc.moveDown(0.5);

      // Add reflection area with lines
      const reflectionStartY = doc.y;
      for (let i = 0; i < 3; i++) {
        const lineY = reflectionStartY + (i * 18);
        if (lineY < 750) {
          doc.moveTo(50, lineY)
            .lineTo(545, lineY)
            .strokeColor('#cccccc')
            .stroke();
        }
      }
      doc.strokeColor('#000000');
      doc.moveDown(3.5);
    }

    // Add workspace area for student responses
    doc.fontSize(9).fillColor('#888888')
      .text('Platz für deine Antworten und Notizen:', { align: 'left' });
    doc.fillColor('#000000').moveDown(0.5);

    // Draw lines for writing
    const startY = doc.y;
    const lineCount = Math.min(4, Math.floor((700 - startY) / 20));
    for (let i = 0; i < lineCount; i++) {
      const lineY = startY + (i * 20);
      doc.moveTo(50, lineY)
        .lineTo(545, lineY)
        .strokeColor('#cccccc')
        .stroke();
    }
    doc.strokeColor('#000000');
    doc.moveDown(lineCount + 1);
  });

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}

// Generate Comprehensive Student Report PDF
export function generateStudentReportPDF(
  reportData: any,
  reportType: string,
  reportSubject?: string
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Title page
  doc.fontSize(24).fillColor('#2563eb').text('Schüler-Bericht', { align: 'center' });
  doc.fillColor('#000000').moveDown();
  
  doc.fontSize(14).text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, { align: 'center' });
  doc.moveDown(2);

  // Student info
  if (reportData.student) {
    const student = reportData.student;
    doc.fontSize(16).fillColor('#059669').text('Schülerinformation', { underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    doc.fontSize(12).text(`Name: ${student.firstName} ${student.lastName}`);
    if (reportData.class) {
      doc.text(`Klasse: ${reportData.class.name}`);
    }
    doc.moveDown(1.5);
  }

  // Math section
  if (reportData.mathErrors && reportData.mathErrors.length > 0) {
    doc.fontSize(16).fillColor('#FF6B35').text('Mathematik', { underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    doc.fontSize(11).text(`Erfasste Fehler: ${reportData.mathErrors.length}`);
    
    const errorTypes = reportData.mathErrors.reduce((acc: any, err: any) => {
      const type = err.errorType || 'Sonstiges';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    doc.moveDown(0.5);
    Object.entries(errorTypes).forEach(([type, count]) => {
      doc.fontSize(10).text(`  • ${type}: ${count}`);
    });
    doc.moveDown(1.5);
  }

  // Spelling section
  if (reportData.spellingErrors && reportData.spellingErrors.length > 0) {
    doc.fontSize(16).fillColor('#4A90E2').text('Rechtschreibung', { underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    doc.fontSize(11).text(`Erfasste Fehler: ${reportData.spellingErrors.length}`);
    
    const categories = reportData.spellingErrors.reduce((acc: any, err: any) => {
      const cat = err.errorCategory || 'Sonstiges';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    doc.moveDown(0.5);
    Object.entries(categories).forEach(([cat, count]) => {
      doc.fontSize(10).text(`  • ${cat}: ${count}`);
    });
    doc.moveDown(1.5);
  }

  // Vocabulary section
  if (reportData.vocabularyWords && reportData.vocabularyWords.length > 0) {
    doc.fontSize(16).fillColor('#8B5CF6').text('Vokabeln (Englisch)', { underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    doc.fontSize(11).text(`Gelernte Wörter: ${reportData.vocabularyWords.length}`);
    doc.moveDown(1.5);
  }

  // Creative tasks section
  if (reportData.creativeTasks && reportData.creativeTasks.length > 0) {
    doc.fontSize(16).fillColor('#059669').text('Kreative Aufgaben', { underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    doc.fontSize(11).text(`Zugewiesene Aufgaben: ${reportData.creativeTasks.length}`);
    
    const categories = reportData.creativeTasks.reduce((acc: any, task: any) => {
      const cat = task.task?.category || 'Sonstiges';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    doc.moveDown(0.5);
    Object.entries(categories).forEach(([cat, count]) => {
      doc.fontSize(10).text(`  • ${cat}: ${count}`);
    });
    doc.moveDown(1.5);
  }

  // Class overview section
  if (reportData.students && reportType === 'class_overview') {
    doc.addPage();
    doc.fontSize(18).fillColor('#2563eb').text('Klassenübersicht', { underline: true });
    doc.fillColor('#000000').moveDown(1);
    
    reportData.students.slice(0, 20).forEach((studentData: any, index: number) => {
      if (index > 0 && index % 10 === 0) {
        doc.addPage();
      }
      
      doc.fontSize(12).fillColor('#059669').text(`${studentData.student.firstName} ${studentData.student.lastName}`);
      doc.fillColor('#000000').fontSize(10);
      doc.text(`  Mathe-Fehler: ${studentData.mathErrorCount} | Rechtschreibung: ${studentData.spellingErrorCount} | Vokabeln: ${studentData.vocabularyWordCount}`);
      doc.moveDown(0.8);
    });
  }

  // Assessment section
  if (reportData.assessments && reportData.assessments.length > 0) {
    doc.addPage();
    doc.fontSize(16).fillColor('#9333ea').text('Selbstkonzept-Assessments', { underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    doc.fontSize(11).text(`Durchgeführte Assessments: ${reportData.assessments.length}`);
    
    reportData.assessments.forEach((assessment: any, index: number) => {
      doc.moveDown(0.5);
      doc.fontSize(10).text(`${index + 1}. ${new Date(assessment.createdAt).toLocaleDateString('de-DE')} - Status: ${assessment.status}`);
    });
  }

  return doc;
}

// Generate Living Life Worksheet PDF
export function generateLivingLifeWorksheet(
  studentName: string,
  task: LivingLifeTask,
  categoryDisplayName: string,
  categoryColor: string,
  dueDate?: Date | null,
  teacherNotes?: string | null
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Color scheme (green tones for life/nature)
  const primaryColor = '#059669';  // Green-600
  const secondaryColor = '#10b981';  // Green-500
  const accentColor = '#047857';  // Green-700
  const categoryColorHex = categoryColor || primaryColor;

  // Header with title
  doc.fontSize(22).fillColor(primaryColor)
    .text('Living Life – Leben lernen', { align: 'center' });
  doc.fillColor('#000000').moveDown();
  
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown(0.3);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  
  if (dueDate) {
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#666666')
      .text(`Abgabe bis: ${new Date(dueDate).toLocaleDateString('de-DE')}`, { align: 'left' });
    doc.fillColor('#000000');
  }
  
  doc.moveDown(1.5);

  // Category badge
  doc.fontSize(14).fillColor(categoryColorHex)
    .text(`Kategorie: ${categoryDisplayName}`, { align: 'left' });
  doc.fillColor('#000000').moveDown(1);

  // Task title and details
  doc.fontSize(18).fillColor(accentColor)
    .text(task.title, { align: 'left', underline: true });
  doc.fillColor('#000000').moveDown(0.5);

  // Difficulty and duration badges
  const difficultyLabels: Record<string, string> = {
    entdecken: 'Entdecken',
    erforschen: 'Erforschen',
    vertiefen: 'Vertiefen'
  };
  doc.fontSize(10).fillColor('#666666')
    .text(`Schwierigkeit: ${difficultyLabels[task.difficultyLevel] || task.difficultyLevel} • Dauer: ca. ${task.estimatedDuration} Min.`, { align: 'left' });
  doc.fillColor('#000000').moveDown(1);

  // Task description
  doc.fontSize(12).text('AUFGABENBESCHREIBUNG:', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(11).text(task.description, { align: 'justify', lineGap: 4 });
  doc.moveDown(1);

  // Instructions
  doc.fontSize(12).fillColor(secondaryColor)
    .text('SO GEHST DU VOR:', { underline: true });
  doc.fillColor('#000000').moveDown(0.5);
  doc.fontSize(11).text(task.instructions, { align: 'justify', lineGap: 4 });
  doc.moveDown(1);

  // Materials needed
  if (task.materials && task.materials.length > 0) {
    doc.fontSize(12).fillColor(accentColor)
      .text('DAS BRAUCHST DU:', { underline: true });
    doc.fillColor('#000000').moveDown(0.3);
    task.materials.forEach(material => {
      doc.fontSize(10).text(`  • ${material}`, { lineGap: 2 });
    });
    doc.moveDown(1);
  }

  // Documentation formats
  if (task.documentationFormats && task.documentationFormats.length > 0) {
    doc.fontSize(12).fillColor(primaryColor)
      .text('SO KANNST DU DOKUMENTIEREN:', { underline: true });
    doc.fillColor('#000000').moveDown(0.3);
    task.documentationFormats.forEach(format => {
      doc.fontSize(10).text(`  • ${format}`, { lineGap: 2 });
    });
    doc.moveDown(1);
  }

  // Add new page for reflection questions
  doc.addPage();

  // Reflection questions
  if (task.reflectionQuestions && task.reflectionQuestions.length > 0) {
    doc.fontSize(14).fillColor(secondaryColor)
      .text('REFLEXIONSFRAGEN', { align: 'center', underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    
    doc.fontSize(10).fillColor('#666666')
      .text('Beantworte diese Fragen nach deiner Aktivität:', { align: 'center' });
    doc.fillColor('#000000').moveDown(1);

    task.reflectionQuestions.forEach((question, index) => {
      doc.fontSize(11).fillColor(accentColor).text(`${index + 1}. ${question}`);
      doc.fillColor('#000000').moveDown(0.5);
      
      // Draw lines for answers
      const startY = doc.y;
      for (let i = 0; i < 4; i++) {
        const lineY = startY + (i * 18);
        if (lineY < 700) {
          doc.moveTo(50, lineY).lineTo(545, lineY).strokeColor('#cccccc').stroke();
        }
      }
      doc.strokeColor('#000000');
      doc.moveDown(4.5);
    });
  }

  // Parent tips section
  if (task.parentTips) {
    if (doc.y > 600) {
      doc.addPage();
    }
    
    doc.fontSize(14).fillColor(primaryColor)
      .text('TIPPS FÜR ELTERN', { align: 'center', underline: true });
    doc.fillColor('#000000').moveDown(0.5);
    
    doc.fontSize(10).fillColor('#444444').text(task.parentTips, { 
      align: 'justify', 
      lineGap: 4
    });
    doc.fillColor('#000000').moveDown(1);
  }

  // Teacher notes if available
  if (teacherNotes) {
    if (doc.y > 650) {
      doc.addPage();
    }
    
    doc.fontSize(12).fillColor('#2563eb')
      .text('HINWEIS VON DEINEM LEHRER:', { underline: true });
    doc.fillColor('#000000').moveDown(0.3);
    doc.fontSize(11).text(teacherNotes, { 
      align: 'justify', 
      lineGap: 4 
    });
    doc.moveDown(1);
  }

  // Additional notes workspace
  if (doc.y > 650) {
    doc.addPage();
  }
  
  doc.fontSize(11).fillColor('#888888')
    .text('PLATZ FÜR DEINE NOTIZEN:', { align: 'left' });
  doc.fillColor('#000000').moveDown(0.5);

  // Draw lines for writing
  const notesStartY = doc.y;
  const maxLines = Math.min(10, Math.floor((750 - notesStartY) / 20));
  for (let i = 0; i < maxLines; i++) {
    const lineY = notesStartY + (i * 20);
    doc.moveTo(50, lineY).lineTo(545, lineY).strokeColor('#cccccc').stroke();
  }
  doc.strokeColor('#000000');

  // Don't call doc.end() here - let the caller pipe first
  return doc;
}