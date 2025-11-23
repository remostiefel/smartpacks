import PDFDocument from "pdfkit";
import type { Student, StudentError, SpellingError, VocabularyWord, LivingLifeAssignment, LivingLifeTask } from "@shared/schema";
import { generateMathWorksheet, generateSpellingWorksheet, generateVocabularyWorksheet, PDFTemplateOptions } from "./pdf-generators";
import { PassThrough } from "stream";

interface BatchStudent {
  student: Student;
  errors?: StudentError[];
  spellingErrors?: SpellingError[];
  vocabularyWords?: VocabularyWord[];
  livingLifeAssignments?: (LivingLifeAssignment & { task?: LivingLifeTask })[];
}

export type WorksheetType = 'math' | 'spelling' | 'vocabulary' | 'living-life';

/**
 * Generates a combined PDF with worksheets for multiple students
 */
export function generateBatchWorksheets(
  students: BatchStudent[],
  type: WorksheetType,
  options: PDFTemplateOptions = {}
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  let pageCount = 0;
  
  students.forEach((studentData) => {
    const studentName = `${studentData.student.firstName} ${studentData.student.lastName}`;
    
    // Check if student has data for this worksheet type
    let hasData = false;
    if (type === 'math' && studentData.errors && studentData.errors.length > 0) {
      hasData = true;
    } else if (type === 'spelling' && studentData.spellingErrors && studentData.spellingErrors.length > 0) {
      hasData = true;
    } else if (type === 'vocabulary' && studentData.vocabularyWords && studentData.vocabularyWords.length > 0) {
      hasData = true;
    } else if (type === 'living-life' && studentData.livingLifeAssignments && studentData.livingLifeAssignments.length > 0) {
      hasData = true;
    }
    
    // Skip students without data
    if (!hasData) {
      return;
    }
    
    // Add page break between students (except for first page)
    if (pageCount > 0) {
      doc.addPage();
    }
    
    // Generate worksheet content based on type
    switch (type) {
      case 'math':
        addMathWorksheetContent(doc, studentName, studentData.errors!, options);
        break;
      case 'spelling':
        addSpellingWorksheetContent(doc, studentName, studentData.spellingErrors!, options);
        break;
      case 'vocabulary':
        addVocabularyWorksheetContent(doc, studentName, studentData.vocabularyWords!, options);
        break;
      case 'living-life':
        addLivingLifeWorksheetContent(doc, studentName, studentData.livingLifeAssignments!, options);
        break;
    }
    
    pageCount++;
  });
  
  return doc;
}

/**
 * Helper function to add math worksheet content to existing PDF document
 */
function addMathWorksheetContent(
  doc: PDFKit.PDFDocument,
  studentName: string,
  errors: StudentError[],
  options: PDFTemplateOptions
) {
  const opts = { layout: 'spacious', images: false, color: true, ...options };
  const primaryColor = opts.color ? '#FF6B35' : '#000000';
  const secondaryColor = opts.color ? '#004E89' : '#000000';
  
  // Title
  doc.fillColor(primaryColor).fontSize(20).text('Mathematik Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // Images (optional)
  if (opts.images) {
    const iconColor = opts.color ? primaryColor : '#666666';
    doc.save();
    doc.strokeColor(iconColor).lineWidth(2);
    doc.moveTo(500, 70).lineTo(520, 70).stroke();
    doc.moveTo(510, 60).lineTo(510, 80).stroke();
    doc.restore();
  }

  // Exercises
  doc.fillColor(secondaryColor).fontSize(14).text('Übungsaufgaben:', { underline: true });
  doc.fillColor('#000000');
  doc.moveDown();

  const exercisesPerError = opts.layout === 'compact' ? 5 : 3;
  const exercises: string[] = [];
  
  errors.forEach((error) => {
    for (let i = 0; i < exercisesPerError; i++) {
      const num1 = Math.max(1, error.num1 + Math.floor(Math.random() * 10) - 5);
      const num2 = Math.max(1, error.num2 + Math.floor(Math.random() * 10) - 5);
      const operator = error.operation === 'addition' ? '+' : '-';
      exercises.push(`${num1} ${operator} ${num2} = _______`);
    }
  });

  exercises.forEach((exercise, i) => {
    doc.fontSize(11).text(`${i + 1}. ${exercise}`);
    doc.moveDown(opts.layout === 'compact' ? 0.3 : 0.5);
  });
}

/**
 * Helper function to add spelling worksheet content to existing PDF document
 */
function addSpellingWorksheetContent(
  doc: PDFKit.PDFDocument,
  studentName: string,
  errors: SpellingError[],
  options: PDFTemplateOptions
) {
  const opts = { layout: 'spacious', images: false, color: true, ...options };
  const primaryColor = opts.color ? '#4A90E2' : '#000000';
  const secondaryColor = opts.color ? '#2E5A8A' : '#000000';
  
  // Title
  doc.fillColor(primaryColor).fontSize(20).text('Rechtschreibung Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // Images (optional)
  if (opts.images) {
    const iconColor = opts.color ? primaryColor : '#666666';
    doc.save();
    doc.strokeColor(iconColor).lineWidth(2);
    doc.moveTo(490, 75).lineTo(510, 85).stroke();
    doc.circle(512, 72, 3).fill(iconColor);
    doc.fillColor('#000000').fontSize(8).text('ABC', 500, 75);
    doc.restore();
  }

  // Letter by letter
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
}

/**
 * Helper function to add vocabulary worksheet content to existing PDF document
 */
function addVocabularyWorksheetContent(
  doc: PDFKit.PDFDocument,
  studentName: string,
  words: VocabularyWord[],
  options: PDFTemplateOptions
) {
  const opts = { layout: 'spacious', images: false, color: true, ...options };
  const primaryColor = opts.color ? '#8B5CF6' : '#000000';
  const secondaryColor = opts.color ? '#6D28D9' : '#000000';
  
  // Title
  doc.fillColor(primaryColor).fontSize(20).text('Englisch Vokabeln Arbeitsblatt', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // Images (optional)
  if (opts.images) {
    const iconColor = opts.color ? primaryColor : '#666666';
    doc.save();
    doc.strokeColor(iconColor).lineWidth(1);
    doc.rect(495, 70, 15, 10).stroke();
    doc.rect(500, 70, 20, 12).stroke();
    doc.restore();
  }

  // Flashcards
  doc.fillColor(secondaryColor).fontSize(14).text('Übung 1: Karteikarten', { underline: true });
  doc.fillColor('#000000');
  doc.moveDown();
  
  const flashcardCount = opts.layout === 'compact' ? 8 : 6;
  const cardHeight = opts.layout === 'compact' ? 80 : 100;
  const startY = doc.y;
  
  words.slice(0, flashcardCount).forEach((word, index) => {
    const x = (index % 2) * 250 + 50;
    const row = Math.floor(index / 2);
    const y = startY + row * (cardHeight + 10);
    
    doc.rect(x, y, 200, cardHeight).stroke();
    doc.fontSize(12).text(word.englishWord, x + 10, y + cardHeight/2 - 5, { width: 180, align: 'center', continued: false });
  });
  
  const totalRows = Math.ceil(flashcardCount / 2);
  doc.y = startY + totalRows * (cardHeight + 10) + 20;
}

/**
 * Helper function to add Living Life worksheet content to existing PDF document
 */
function addLivingLifeWorksheetContent(
  doc: PDFKit.PDFDocument,
  studentName: string,
  assignments: (LivingLifeAssignment & { task?: LivingLifeTask })[],
  options: PDFTemplateOptions
) {
  const opts = { layout: 'spacious', images: false, color: true, ...options };
  const primaryColor = opts.color ? '#10B981' : '#000000';  // Emerald/teal
  const secondaryColor = opts.color ? '#059669' : '#000000';
  
  // Title
  doc.fillColor(primaryColor).fontSize(20).text('Living Life Aufgaben', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  doc.fontSize(12).text(`Schüler: ${studentName}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'left' });
  doc.moveDown(opts.layout === 'compact' ? 1 : 2);

  // List each assignment
  assignments.forEach((assignment, index) => {
    if (!assignment.task) return;

    const task = assignment.task;
    
    // Task number and title
    doc.fillColor(primaryColor).fontSize(14).text(`${index + 1}. ${task.title}`, { underline: true });
    doc.fillColor('#000000');
    doc.moveDown(0.5);
    
    // Description
    doc.fontSize(11).text(task.description, { align: 'left' });
    doc.moveDown(0.5);
    
    // Instructions
    doc.fillColor(secondaryColor).fontSize(12).text('Anleitung:', { underline: false });
    doc.fillColor('#000000');
    doc.fontSize(10).text(task.instructions, { align: 'left' });
    doc.moveDown(0.5);
    
    // Materials (if any)
    if (task.materials && task.materials.length > 0) {
      doc.fillColor(secondaryColor).fontSize(11).text('Materialien:', { underline: false });
      doc.fillColor('#000000');
      doc.fontSize(10).text(task.materials.join(', '), { align: 'left' });
      doc.moveDown(0.5);
    }
    
    // Documentation formats
    if (task.documentationFormats && task.documentationFormats.length > 0) {
      doc.fillColor(secondaryColor).fontSize(11).text('Dokumentiere mit:', { underline: false });
      doc.fillColor('#000000');
      doc.fontSize(10).text(task.documentationFormats.join(', '), { align: 'left' });
      doc.moveDown(0.5);
    }
    
    // Teacher notes (if any)
    if (assignment.teacherNotes) {
      doc.fillColor(secondaryColor).fontSize(11).text('Hinweis:', { underline: false });
      doc.fillColor('#000000');
      doc.fontSize(10).text(assignment.teacherNotes, { align: 'left' });
      doc.moveDown(0.5);
    }
    
    // Reflection space
    doc.fillColor(secondaryColor).fontSize(11).text('Reflexion:', { underline: false });
    doc.fillColor('#000000');
    doc.moveDown(0.3);
    
    // Draw lines for reflection writing
    const lineCount = opts.layout === 'compact' ? 3 : 5;
    for (let i = 0; i < lineCount; i++) {
      const y = doc.y + i * 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
    }
    doc.y += lineCount * 20;
    
    doc.moveDown(opts.layout === 'compact' ? 1 : 1.5);
  });
}

/**
 * Convert PDF document to base64 string (for preview)
 */
export async function pdfToBase64(doc: PDFKit.PDFDocument): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = new PassThrough();
    
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString('base64'));
    });
    stream.on('error', reject);
    
    doc.pipe(stream);
    doc.end();
  });
}
