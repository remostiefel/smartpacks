
import { 
  PaeckchenType, 
  GeneratedPaeckchen, 
  Facette, 
  ClusterWorksheet,
  generateConstantSumPaeckchen,
  generateInverseTasksPaeckchen,
  generateDecompositionPaeckchen,
  generateOperationContrastPaeckchen,
  generateDigitDetectivePaeckchen,
  generateErrorResearchPaeckchen
} from './paeckchen-library';
import type { ErrorCategory } from './math-pedagogy';

// Cluster A: Zerlegungskompetenz
function generateZerlegungsCluster(targetNumbers: number[]): ClusterWorksheet {
  // FACETTE 1: Basis - Partnerzahlen zur 10
  const basisPaeckchen: GeneratedPaeckchen = {
    title: 'Partnerzahlen zur 10',
    instructions: 'Finde die Partnerzahlen - sie ergeben zusammen immer 10.',
    problems: [
      '7 + 3 = ___',
      '8 + 2 = ___',
      '6 + 4 = ___',
      '9 + 1 = ___'
    ],
    reflectionQuestions: ['Welche Partnerzahlen kennst du?'],
    sentenceStems: ['___ und ___ ergeben 10.']
  };

  // FACETTE 2: Anwenden - Zehnerübergang mit Zerlegung
  const num1 = targetNumbers[0] || 7;
  const anwendenPaeckchen: GeneratedPaeckchen = {
    title: `Über den Zehner mit ${num1}`,
    instructions: 'Nutze die Partnerzahlen aus Facette 1.',
    problems: [
      `${num1} + ${10 - num1} = ___`,
      `${num1} + ${10 - num1 + 1} = ___`,
      `${num1} + ${10 - num1 + 2} = ___`,
      `${num1} + ${10 - num1 + 3} = ___`
    ],
    patternHint: `Erst bis zur 10 (${num1}+${10-num1}), dann weiter`,
    reflectionQuestions: [`Wie hilft dir ${num1}+${10-num1}=10 bei ${num1}+${10-num1+2}?`],
    sentenceStems: ['Ich rechne erst bis zur 10, dann ___.']
  };

  // FACETTE 3: Verknüpfen - Addition UND Subtraktion
  const sum = num1 + 5;
  const verknuepfenPaeckchen: GeneratedPaeckchen = {
    title: 'Addition und Subtraktion verknüpfen',
    instructions: 'Nutze die Umkehrung zur Kontrolle.',
    problems: [
      `${num1} + 5 = ___`,
      `${sum} - 5 = ___`,
      `${sum} - ${num1} = ___`
    ],
    decompositionSteps: [
      `${sum} - 5: Erst -${10-num1} zur 10, dann -${5-(10-num1)}`
    ],
    reflectionQuestions: ['Warum kannst du mit derselben Zerlegung addieren UND subtrahieren?'],
    sentenceStems: ['Addition und Subtraktion sind Umkehroperationen, weil ___.']
  };

  return {
    clusterName: 'Cluster A: Zerlegungskompetenz',
    errorType: 'zehnuebergang_addition',
    facetten: [
      { level: 'basis', numberVariants: [7, 3, 8, 2, 6, 4], cognitiveLoad: 'same', paeckchenType: 'constant_sum', generatedPaeckchen: basisPaeckchen },
      { level: 'anwenden', numberVariants: [num1, 10-num1], cognitiveLoad: 'same', paeckchenType: 'crossing_tens', generatedPaeckchen: anwendenPaeckchen },
      { level: 'verknuepfen', numberVariants: [num1, 5, sum], cognitiveLoad: 'same', paeckchenType: 'inverse_tasks', generatedPaeckchen: verknuepfenPaeckchen }
    ],
    reflexionFragen: {
      nachBasis: 'Welche Partnerzahlen kennst du?',
      nachAnwenden: 'Wie hast du das Wissen aus Facette 1 genutzt?',
      nachVerknuepfen: 'Wie hängen Addition und Subtraktion zusammen?'
    }
  };
}

// Cluster B: Stellenwert-Sicherheit
function generateStellenwertCluster(targetNumbers: number[]): ClusterWorksheet {
  const nums = [[12, 21], [14, 41], [16, 61]];
  
  // FACETTE 1: Basis - Zahlen richtig lesen
  const basisPaeckchen: GeneratedPaeckchen = {
    title: 'Zehner und Einer erkennen',
    instructions: 'Bestimme die Stellenwerte.',
    problems: nums.map(([n1, n2]) => `${n1}: ___ Zehner, ___ Einer`),
    reflectionQuestions: ['Was ist der Unterschied zwischen Zehnern und Einern?'],
    sentenceStems: ['Die Zehnerstelle steht ___, die Einerstelle steht ___.']
  };

  // FACETTE 2: Anwenden - Größenvergleich
  const anwendenPaeckchen: GeneratedPaeckchen = {
    title: 'Welche Zahl ist größer?',
    instructions: 'Nutze dein Stellenwert-Wissen.',
    problems: nums.map(([n1, n2]) => `${n1} ___ ${n2}  (< oder >?)`),
    reflectionQuestions: ['Wie entscheidest du, welche Zahl größer ist?'],
    sentenceStems: ['Ich schaue zuerst auf die ___, dann auf die ___.']
  };

  // FACETTE 3: Verknüpfen - Reihenfolge bei Subtraktion
  const verknuepfenPaeckchen: GeneratedPaeckchen = {
    title: 'Reihenfolge entscheidet',
    instructions: 'Bei Subtraktion muss die erste Zahl größer sein.',
    problems: [
      '12 - 5 = ___  ✓',
      '5 - 12 = ___  ✗ (geht nicht!)',
      '14 - 7 = ___  ✓',
      '7 - 14 = ___  ✗ (geht nicht!)'
    ],
    reflectionQuestions: ['Warum ist die Reihenfolge bei Subtraktion wichtig?'],
    sentenceStems: ['Bei Subtraktion muss ___ größer sein als ___.']
  };

  return {
    clusterName: 'Cluster B: Stellenwert-Sicherheit',
    errorType: 'digit_reversal',
    facetten: [
      { level: 'basis', numberVariants: nums.flat(), cognitiveLoad: 'same', paeckchenType: 'digit_detective', generatedPaeckchen: basisPaeckchen },
      { level: 'anwenden', numberVariants: nums.flat(), cognitiveLoad: 'same', paeckchenType: 'pattern_analysis', generatedPaeckchen: anwendenPaeckchen },
      { level: 'verknuepfen', numberVariants: [12, 5, 14, 7], cognitiveLoad: 'same', paeckchenType: 'number_reversal_demo', generatedPaeckchen: verknuepfenPaeckchen }
    ],
    reflexionFragen: {
      nachBasis: 'Was ist der Unterschied zwischen 12 und 21?',
      nachAnwenden: 'Wie nutzt du Stellenwerte zum Vergleichen?',
      nachVerknuepfen: 'Warum bestimmt der Stellenwert die Rechenbarkeit?'
    }
  };
}

// Cluster C: Operationsverständnis
function generateOperationsCluster(targetNumbers: number[]): ClusterWorksheet {
  const pairs = [[9, 4], [12, 5], [8, 7]];
  
  // FACETTE 1: Basis - Operation erkennen
  const basisPaeckchen: GeneratedPaeckchen = {
    title: 'Plus oder Minus?',
    instructions: 'Welches Zeichen fehlt?',
    problems: pairs.flatMap(([a, b]) => [
      `${a} ___ ${b} = ${a + b}  (+ oder -?)`,
      `${a} ___ ${b} = ${a - b}  (+ oder -?)`
    ]),
    reflectionQuestions: ['Woran erkennst du, welche Operation gemeint ist?'],
    sentenceStems: ['Bei + wird das Ergebnis ___, bei - wird es ___.']
  };

  // FACETTE 2: Anwenden - Direkt vergleichen
  const anwendenPaeckchen: GeneratedPaeckchen = {
    title: 'Addition vs. Subtraktion',
    instructions: 'Dieselben Zahlen, unterschiedliche Operationen.',
    problems: pairs.flatMap(([a, b]) => [
      `${a} + ${b} = ___`,
      `${a} - ${b} = ___`
    ]),
    reflectionQuestions: ['Was ist bei + anders als bei -?'],
    sentenceStems: ['${a} + ${b} = ___, aber ${a} - ${b} = ___.']
  };

  // FACETTE 3: Verknüpfen - Umkehr-Kontrolle
  const verknuepfenPaeckchen: GeneratedPaeckchen = {
    title: 'Rechnen und kontrollieren',
    instructions: 'Nutze die Umkehraufgabe zur Kontrolle.',
    problems: pairs.map(([a, b]) => `${a} + ${b} = ___  →  Kontrolle: ${a + b} - ${b} = ___`),
    reflectionQuestions: ['Wie hilft dir die Umkehraufgabe?'],
    sentenceStems: ['Wenn ich bei Addition unsicher bin, kann ich ___.']
  };

  return {
    clusterName: 'Cluster C: Operationsverständnis',
    errorType: 'operation_confusion',
    facetten: [
      { level: 'basis', numberVariants: pairs.flat(), cognitiveLoad: 'same', paeckchenType: 'operation_contrast', generatedPaeckchen: basisPaeckchen },
      { level: 'anwenden', numberVariants: pairs.flat(), cognitiveLoad: 'same', paeckchenType: 'operation_contrast', generatedPaeckchen: anwendenPaeckchen },
      { level: 'verknuepfen', numberVariants: pairs.flat(), cognitiveLoad: 'same', paeckchenType: 'inverse_tasks', generatedPaeckchen: verknuepfenPaeckchen }
    ],
    reflexionFragen: {
      nachBasis: 'Was ist der Unterschied zwischen + und -?',
      nachAnwenden: 'Wie ändern sich die Ergebnisse?',
      nachVerknuepfen: 'Warum funktioniert die Umkehr-Kontrolle?'
    }
  };
}

// Cluster D: Mustererkennung
function generateMusterCluster(targetNumbers: number[]): ClusterWorksheet {
  // FACETTE 1: Basis - Muster entdecken
  const basisPaeckchen: GeneratedPaeckchen = {
    title: 'Was bleibt gleich?',
    instructions: 'Finde das Muster.',
    problems: [
      '5 + 8 = ___',
      '6 + 7 = ___',
      '7 + 6 = ___',
      '8 + 5 = ___'
    ],
    patternHint: '↑+1, ↓-1, = (Summe bleibt 13)',
    reflectionQuestions: ['Welches Muster siehst du?'],
    sentenceStems: ['Die erste Zahl ___, die zweite Zahl ___, das Ergebnis ___.']
  };

  // FACETTE 2: Anwenden - Muster fortsetzen
  const anwendenPaeckchen: GeneratedPaeckchen = {
    title: 'Setze das Muster fort',
    instructions: 'Nutze die Regel aus Facette 1.',
    problems: [
      '4 + 9 = ___',
      '5 + 8 = ___',
      '6 + ___ = ___',
      '___ + 6 = ___'
    ],
    reflectionQuestions: ['Wie hast du die fehlenden Zahlen gefunden?'],
    sentenceStems: ['Das Muster lautet: ___.']
  };

  // FACETTE 3: Verknüpfen - Fehler im Muster finden
  const verknuepfenPaeckchen: GeneratedPaeckchen = {
    title: 'Fehlerforschung',
    instructions: 'Eine Aufgabe passt nicht. Welche?',
    problems: [
      '3 + 10 = 13',
      '4 + 9 = 13',
      '5 + 8 = 14',  // Fehler!
      '6 + 7 = 13'
    ],
    errorSpottingTask: 'Markiere den Fehler und erkläre, warum er nicht passt.',
    reflectionQuestions: ['Wie erkennst du, was nicht zum Muster passt?'],
    sentenceStems: ['Diese Aufgabe passt nicht, weil ___.']
  };

  return {
    clusterName: 'Cluster D: Mustererkennung',
    errorType: 'pattern_break',
    facetten: [
      { level: 'basis', numberVariants: [5, 8, 6, 7], cognitiveLoad: 'same', paeckchenType: 'constant_sum', generatedPaeckchen: basisPaeckchen },
      { level: 'anwenden', numberVariants: [4, 9, 5, 8], cognitiveLoad: 'same', paeckchenType: 'continuation_challenge', generatedPaeckchen: anwendenPaeckchen },
      { level: 'verknuepfen', numberVariants: [3, 10, 4, 9], cognitiveLoad: 'same', paeckchenType: 'error_research', generatedPaeckchen: verknuepfenPaeckchen }
    ],
    reflexionFragen: {
      nachBasis: 'Welches Muster hast du entdeckt?',
      nachAnwenden: 'Wie hast du das Muster angewendet?',
      nachVerknuepfen: 'Was verrät dir ein Fehler über das Muster?'
    }
  };
}

// Hauptfunktion: Wähle Cluster basierend auf Fehlertyp
export function generateFacettenWorksheet(errorType: ErrorCategory, targetNumbers: number[]): ClusterWorksheet {
  switch (errorType) {
    case 'zehnuebergang_addition':
    case 'complementary_pairs':
      return generateZerlegungsCluster(targetNumbers);
    
    case 'digit_reversal':
    case 'number_reversal':
      return generateStellenwertCluster(targetNumbers);
    
    case 'operation_confusion':
      return generateOperationsCluster(targetNumbers);
    
    case 'pattern_break':
      return generateMusterCluster(targetNumbers);
    
    default:
      // Fallback auf Zerlegung
      return generateZerlegungsCluster(targetNumbers);
  }
}
