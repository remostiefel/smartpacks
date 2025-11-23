/**
 * Test-Pipeline für Qualitätssicherung des Mathematik-Moduls
 * 
 * Flow: Zufalls-Fehler → Analysator → Power-Pack Generator → Validierung → PDF
 */

import type { StudentError } from "@shared/schema";
import { 
  generateRandomErrors, 
  generateErrorsOfType, 
  generateBalancedErrorSet,
  type ErrorCategory 
} from "./test-error-generator";
import { classifyErrors } from "./math-pedagogy";
import { generateHomeworkExercises } from "./math-pedagogy";
import { generateHomeworkWorksheet } from "./pdf-generators";
import { selectPaeckchenTypeForError } from "./paeckchen-library";

export interface TestResult {
  success: boolean;
  errors: StudentError[];
  classification: {
    category: string;
    description: string;
    errorCount: number;
    detectedCorrectly: boolean;
  }[];
  generatedPaeckchen: {
    category: string;
    paeckchenTypes: string[];
    exerciseCount: number;
  }[];
  validation: {
    totalErrors: number;
    classifiedErrors: number;
    unclassifiedErrors: number;
    coveragePercentage: number;
    paeckchenGenerated: number;
  };
  report: string;
}

/**
 * Validiert ob Fehler korrekt klassifiziert wurden
 */
function validateClassification(
  generatedErrors: StudentError[],
  classified: ReturnType<typeof classifyErrors>
): { valid: boolean; misclassifications: Array<{ error: StudentError; expected: string; actual: string }> } {
  const misclassifications: Array<{ error: StudentError; expected: string; actual: string }> = [];
  
  // Erstelle Mapping: Error ID → Klassifizierte Kategorie
  const errorToCategory = new Map<string, string>();
  for (const cat of classified) {
    for (const err of cat.errors) {
      errorToCategory.set(err.id, cat.category);
    }
  }
  
  // Prüfe jeden generierten Fehler
  for (const error of generatedErrors) {
    const expectedType = error.errorType;
    const actualCategory = errorToCategory.get(error.id);
    
    if (!actualCategory) {
      // Fehler wurde nicht klassifiziert
      misclassifications.push({
        error,
        expected: expectedType || 'unknown',
        actual: 'NOT_CLASSIFIED'
      });
      continue;
    }
    
    // Prüfe ob Kategorie zum erwarteten Typ passt
    // Mapping zwischen errorType (Generator) und category (Analysator)
    const expectedCategories = getExpectedCategories(expectedType);
    
    if (!expectedCategories.includes(actualCategory)) {
      misclassifications.push({
        error,
        expected: expectedType || 'unknown',
        actual: actualCategory
      });
    }
  }
  
  return {
    valid: misclassifications.length === 0,
    misclassifications
  };
}

/**
 * Mapping zwischen Generator-Fehlertypen und Analysator-Kategorien
 */
function getExpectedCategories(errorType: string | null): string[] {
  const mapping: Record<string, string[]> = {
    'zehnuebergang_addition': ['zehnuebergang_addition'],
    'zehnuebergang_subtraction': ['zehnuebergang_subtraction'],
    'complementary_pairs': ['complementary_pairs'],
    'calculation_facts': ['calculation_facts'],
    'subtraction_borrowing': ['subtraction_borrowing'],
    'number_reversal': ['number_reversal'],
    'digit_reversal': ['digit_reversal'],
    'operation_confusion': ['operation_confusion'],
    'pattern_break': ['pattern_break'],
    'null': ['pattern_break'] // Unklassifizierte Fehler landen in pattern_break
  };
  
  return mapping[errorType || 'null'] || ['pattern_break'];
}

/**
 * Prüft ob generierte Päckchen zu Fehlertypen passen
 */
function validatePaeckchenMatch(
  classified: ReturnType<typeof classifyErrors>,
  homeworkPages: ReturnType<typeof generateHomeworkExercises>
): { valid: boolean; issues: string[]; categoryCoverage: Map<string, number> } {
  const issues: string[] = [];
  const categoryCoverage = new Map<string, number>();
  
  for (const category of classified) {
    const expectedPaeckchen = selectPaeckchenTypeForError(category.category);
    
    if (expectedPaeckchen.length === 0) {
      issues.push(`Keine Päckchen-Vorlagen für Fehlertyp: ${category.category}`);
      categoryCoverage.set(category.category, 0);
      continue;
    }
    
    // Zähle Übungen die zu dieser Kategorie gehören könnten
    // Prüfe auf Schlüsselwörter aus der Kategorie-Beschreibung in Titel/Instruktionen
    const categoryKeywords = getCategoryKeywords(category.category);
    
    let exerciseCount = 0;
    for (const page of homeworkPages) {
      for (const exercise of page.exercises) {
        const exerciseText = `${exercise.title} ${exercise.instructions}`.toLowerCase();
        
        // Prüfe ob Übung relevante Keywords enthält
        const hasRelevantKeyword = categoryKeywords.some(keyword => 
          exerciseText.includes(keyword.toLowerCase())
        );
        
        if (hasRelevantKeyword) {
          exerciseCount++;
        }
      }
    }
    
    categoryCoverage.set(category.category, exerciseCount);
    
    if (exerciseCount === 0) {
      issues.push(
        `Keine passenden Übungen für ${category.category} (${category.errors.length} Fehler). ` +
        `Erwartet: ${expectedPaeckchen.join(', ')}`
      );
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    categoryCoverage
  };
}

/**
 * Keywords für Päckchen-Kategorien
 */
function getCategoryKeywords(category: string): string[] {
  const keywords: Record<string, string[]> = {
    'zehnuebergang_addition': ['zehner', 'über', '10', 'zerleg'],
    'zehnuebergang_subtraction': ['zehner', 'zurück', 'unter', '10'],
    'complementary_pairs': ['partner', 'ergänz', '10', '20', 'summe'],
    'calculation_facts': ['rechen', 'kopf', 'fakten', 'automatisier'],
    'subtraction_borrowing': ['abzieh', 'minus', 'wegnehm'],
    'number_reversal': ['reihenfolg', 'umkehr', 'tausch'],
    'digit_reversal': ['ziffer', 'zehner', 'einer', 'stell'],
    'operation_confusion': ['plus', 'minus', 'operation', 'rechenart', 'vergleich'],
    'pattern_break': ['muster', 'regel', 'strategi', 'entdeck', 'fortsetz']
  };
  
  return keywords[category] || ['übung', 'aufgabe'];
}

/**
 * Führt vollständige Test-Pipeline durch
 */
export async function runTestPipeline(
  errorCount: number = 15,
  mode: 'random' | 'balanced' | ErrorCategory = 'random'
): Promise<TestResult> {
  console.log(`\n🧪 Starte Test-Pipeline (${errorCount} Fehler, Modus: ${mode})`);
  
  // Schritt 1: Fehler generieren
  let errors: StudentError[];
  
  if (mode === 'random') {
    errors = generateRandomErrors(errorCount);
  } else if (mode === 'balanced') {
    errors = generateBalancedErrorSet(Math.ceil(errorCount / 8));
  } else {
    errors = generateErrorsOfType(mode, errorCount);
  }
  
  console.log(`✅ ${errors.length} Test-Fehler generiert`);
  
  // Schritt 2: Analysator durchlaufen
  const classified = classifyErrors(errors);
  console.log(`✅ Fehler klassifiziert: ${classified.length} Kategorien gefunden`);
  
  // Schritt 3: Päckchen generieren
  const homework = generateHomeworkExercises(errors, 2);
  console.log(`✅ ${homework.length} Päckchen-Seiten generiert`);
  
  // Schritt 4: Validierung
  const classifiedErrorIds = new Set(
    classified.flatMap(c => c.errors.map(e => e.id))
  );
  
  const classifiedCount = classifiedErrorIds.size;
  const unclassifiedCount = errors.length - classifiedCount;
  const coveragePercentage = (classifiedCount / errors.length) * 100;
  
  const classificationResult = validateClassification(errors, classified);
  const paeckchenResult = validatePaeckchenMatch(classified, homework);
  
  const success = classificationResult.valid && paeckchenResult.valid && coveragePercentage >= 80;
  
  // Schritt 5: Report generieren
  const classificationResults = classified.map(cat => {
    // Prüfe ob es Fehlklassifikationen in dieser Kategorie gibt
    const catMisclassifications = classificationResult.misclassifications.filter(
      m => m.actual === cat.category
    );
    
    return {
      category: cat.category,
      description: cat.description,
      errorCount: cat.errors.length,
      detectedCorrectly: catMisclassifications.length === 0
    };
  });
  
  const paeckchenResults = classified.map(cat => ({
    category: cat.category,
    paeckchenTypes: selectPaeckchenTypeForError(cat.category),
    exerciseCount: homework.filter(hw => 
      hw.exercises.some(ex => ex.title.includes(cat.description))
    ).length
  }));
  
  const misclassificationReport = classificationResult.misclassifications.length > 0
    ? `\n❌ FEHLKLASSIFIKATIONEN (${classificationResult.misclassifications.length}):\n` +
      classificationResult.misclassifications.map(m => 
        `   - ${m.error.errorText}: Erwartet ${m.expected}, erkannt als ${m.actual}`
      ).join('\n')
    : '';
  
  const paeckchenIssuesReport = paeckchenResult.issues.length > 0
    ? `\n⚠️  PÄCKCHEN-PROBLEME:\n` + paeckchenResult.issues.map(i => `   - ${i}`).join('\n')
    : '';
  
  const coverageReport = `\n📊 ÜBUNGS-ABDECKUNG PRO KATEGORIE:\n` +
    Array.from(paeckchenResult.categoryCoverage.entries())
      .map(([cat, count]) => `   - ${cat}: ${count} Übungen`)
      .join('\n');

  const report = `
📊 TEST-PIPELINE REPORT
${'='.repeat(50)}

🎲 FEHLER-GENERIERUNG:
   - Modus: ${mode}
   - Generierte Fehler: ${errors.length}
   - Fehlertypen: ${new Set(errors.map(e => e.errorType)).size}

🔍 ANALYSE:
   - Klassifizierte Kategorien: ${classified.length}
   - Klassifizierte Fehler: ${classifiedCount}
   - Nicht klassifiziert: ${unclassifiedCount}
   - Abdeckung: ${coveragePercentage.toFixed(1)}%

📦 PÄCKCHEN-GENERIERUNG:
   - Generierte Seiten: ${homework.length}
   - Übungen gesamt: ${homework.reduce((sum, hw) => sum + hw.exercises.length, 0)}

✅ VALIDIERUNG:
   - Klassifikation korrekt: ${classificationResult.valid ? '✅' : '❌'}
   - Päckchen passend: ${paeckchenResult.valid ? '✅' : '❌'}
   - Gesamtergebnis: ${success ? '✅ BESTANDEN' : '❌ FEHLER'}
${misclassificationReport}${paeckchenIssuesReport}${coverageReport}

📋 FEHLER-KATEGORIEN:
${classified.map(cat => `   - ${cat.category}: ${cat.errors.length} Fehler`).join('\n')}

🎯 PÄCKCHEN-ZUORDNUNG:
${classified.map(cat => `   - ${cat.category} → ${selectPaeckchenTypeForError(cat.category).join(', ')}`).join('\n')}
  `.trim();
  
  console.log(report);
  
  return {
    success,
    errors,
    classification: classificationResults,
    generatedPaeckchen: paeckchenResults,
    validation: {
      totalErrors: errors.length,
      classifiedErrors: classifiedCount,
      unclassifiedErrors: unclassifiedCount,
      coveragePercentage,
      paeckchenGenerated: homework.length
    },
    report
  };
}

/**
 * Stress-Test: Viele Durchläufe mit verschiedenen Konfigurationen
 */
export async function runStressTest(iterations: number = 10): Promise<{
  totalRuns: number;
  successful: number;
  failed: number;
  averageCoverage: number;
  results: TestResult[];
}> {
  console.log(`\n🔥 Starte Stress-Test (${iterations} Durchläufe)`);
  
  const results: TestResult[] = [];
  let successCount = 0;
  let totalCoverage = 0;
  
  const modes: Array<'random' | 'balanced'> = ['random', 'balanced'];
  
  for (let i = 0; i < iterations; i++) {
    const mode = modes[i % modes.length];
    const errorCount = Math.floor(Math.random() * 20) + 5; // 5-25 Fehler
    
    const result = await runTestPipeline(errorCount, mode);
    results.push(result);
    
    if (result.success) successCount++;
    totalCoverage += result.validation.coveragePercentage;
  }
  
  const avgCoverage = totalCoverage / iterations;
  
  console.log(`\n📊 STRESS-TEST ERGEBNIS:`);
  console.log(`   Durchläufe: ${iterations}`);
  console.log(`   Erfolgreich: ${successCount}/${iterations} (${(successCount/iterations*100).toFixed(1)}%)`);
  console.log(`   Durchschn. Abdeckung: ${avgCoverage.toFixed(1)}%`);
  
  return {
    totalRuns: iterations,
    successful: successCount,
    failed: iterations - successCount,
    averageCoverage: avgCoverage,
    results
  };
}

/**
 * Generiert Demo-PDF für Lehrer
 */
export function generateDemoPDF(studentName: string = 'Test-Schüler'): PDFKit.PDFDocument {
  // Generiere ausgewogenen Fehler-Mix
  const errors = generateBalancedErrorSet(2);
  
  // Generiere Homework-Worksheet
  const homework = generateHomeworkExercises(errors, 2);
  
  // Konvertiere zu Homework-Content Format
  const homeworkContent = {
    title: `Power-Packs für ${studentName}`,
    exercises: homework.flatMap(hw => hw.exercises)
  };
  
  return generateHomeworkWorksheet(studentName, homeworkContent as any);
}
