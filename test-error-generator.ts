/**
 * Test-Fehler-Generator für Qualitätssicherung und Demo-Modus
 * 
 * Generiert realistische Rechenfehler basierend auf typischen Fehlermustern
 * von Primarschülern im Zahlenraum bis 20
 */

import type { StudentError } from "@shared/schema";

export type ErrorCategory = 
  | 'zehnuebergang_addition'
  | 'zehnuebergang_subtraction'
  | 'complementary_pairs'
  | 'calculation_facts'
  | 'subtraction_borrowing'
  | 'number_reversal'
  | 'digit_reversal'
  | 'operation_confusion'
  | 'pattern_break';

interface ErrorPattern {
  category: ErrorCategory;
  description: string;
  generator: () => StudentError;
}

// Hilfsfunktion: Zufällige Auswahl aus Array
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Hilfsfunktion: Zufallszahl im Bereich
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generatoren für verschiedene Fehlertypen
const ERROR_PATTERNS: ErrorPattern[] = [
  {
    category: 'zehnuebergang_addition',
    description: 'Zehnerübergang Addition - vergisst den Übertrag',
    generator: () => {
      const num1 = randomInt(6, 9);
      const num2 = randomInt(3, 9);
      const correctAnswer = num1 + num2;
      
      // Typischer Fehler: Vergisst Zehnerübertrag, rechnet nur im Einer-Bereich
      const incorrectAnswer = (num1 + num2) - 10;
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}+${num2}=${incorrectAnswer}`,
        operation: 'addition',
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: 'zehnuebergang_addition',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'zehnuebergang_subtraction',
    description: 'Zehnerübergang Subtraktion - Schwierigkeiten beim Zurückgehen über 10',
    generator: () => {
      const num1 = randomInt(11, 18);
      const num2 = randomInt(3, 9);
      const correctAnswer = num1 - num2;
      
      // Typischer Fehler: Subtrahiert nur im Einer-Bereich
      const ones1 = num1 % 10;
      const incorrectAnswer = ones1 - num2 + 10; // Rechnet falsch über den Zehner
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}-${num2}=${incorrectAnswer}`,
        operation: 'subtraction',
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: 'zehnuebergang_subtraction',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'complementary_pairs',
    description: 'Ergänzungsaufgaben - Kennt Partnerzahlen zu 10 nicht',
    generator: () => {
      const num1 = randomInt(3, 7);
      const num2 = 10 - num1;
      const correctAnswer = 10;
      
      // Typischer Fehler: Rechnet normal statt Partnerzahl zu erkennen
      const incorrectAnswer = randomInt(8, 12); // Nahe an 10 aber falsch
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}+${num2}=${incorrectAnswer}`,
        operation: 'addition',
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: 'complementary_pairs',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'calculation_facts',
    description: 'Grundlegende Rechenfakten - Kleine Additions-/Subtraktionsfehler',
    generator: () => {
      const num1 = randomInt(2, 8);
      const num2 = randomInt(2, 8);
      const operation = randomChoice(['addition', 'subtraction'] as const);
      
      const correctAnswer = operation === 'addition' 
        ? num1 + num2 
        : Math.max(num1, num2) - Math.min(num1, num2);
      
      // Typischer Fehler: Um 1 oder 2 daneben
      const incorrectAnswer = correctAnswer + randomChoice([-2, -1, 1, 2]);
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}${operation === 'addition' ? '+' : '-'}${num2}=${incorrectAnswer}`,
        operation,
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: 'calculation_facts',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'digit_reversal',
    description: 'Zahlendreher - Vertauscht Einer und Zehner',
    generator: () => {
      const num1 = randomInt(11, 19);
      const num2 = randomInt(1, 5);
      const correctAnswer = num1 + num2;
      
      // Typischer Fehler: Vertauscht Ziffern im Ergebnis
      const correctStr = correctAnswer.toString();
      const incorrectAnswer = parseInt(correctStr.split('').reverse().join(''));
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}+${num2}=${incorrectAnswer}`,
        operation: 'addition',
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: 'digit_reversal',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'operation_confusion',
    description: 'Operationsverwechslung - Verwechselt + und -',
    generator: () => {
      const num1 = randomInt(8, 15);
      const num2 = randomInt(3, 7);
      const operation = randomChoice(['addition', 'subtraction'] as const);
      
      const correctAnswer = operation === 'addition' ? num1 + num2 : num1 - num2;
      // Falsche Operation verwenden
      const incorrectAnswer = operation === 'addition' ? num1 - num2 : num1 + num2;
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}${operation === 'addition' ? '+' : '-'}${num2}=${incorrectAnswer}`,
        operation,
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: 'operation_confusion',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'number_reversal',
    description: 'Zahlenreihenfolge - Denkt Subtraktion ist kommutativ',
    generator: () => {
      const larger = randomInt(10, 18);
      const smaller = randomInt(3, 8);
      const correctAnswer = larger - smaller;
      
      // Typischer Fehler: Kehrt die Zahlen um (denkt a-b = b-a)
      const incorrectAnswer = smaller - larger + 20; // Muss positiv bleiben
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${larger}-${smaller}=${incorrectAnswer}`,
        operation: 'subtraction',
        num1: larger,
        num2: smaller,
        incorrectAnswer,
        correctAnswer,
        errorType: 'number_reversal',
        createdAt: new Date()
      };
    }
  },
  
  {
    category: 'pattern_break',
    description: 'Musterbruch - Keine erkennbare Systematik',
    generator: () => {
      const num1 = randomInt(3, 15);
      const num2 = randomInt(2, 10);
      const operation = randomChoice(['addition', 'subtraction'] as const);
      
      const correctAnswer = operation === 'addition' 
        ? num1 + num2 
        : Math.max(num1, num2) - Math.min(num1, num2);
      
      // Willkürlicher Fehler - keine Systematik
      const incorrectAnswer = randomInt(0, 20);
      
      return {
        id: `test-${Date.now()}-${Math.random()}`,
        studentId: 'test-student',
        errorText: `${num1}${operation === 'addition' ? '+' : '-'}${num2}=${incorrectAnswer}`,
        operation,
        num1,
        num2,
        incorrectAnswer,
        correctAnswer,
        errorType: null,
        createdAt: new Date()
      };
    }
  }
];

/**
 * Generiert N zufällige Fehler
 */
export function generateRandomErrors(count: number): StudentError[] {
  const errors: StudentError[] = [];
  
  for (let i = 0; i < count; i++) {
    const pattern = randomChoice(ERROR_PATTERNS);
    errors.push(pattern.generator());
  }
  
  return errors;
}

/**
 * Generiert Fehler für einen spezifischen Fehlertyp
 */
export function generateErrorsOfType(
  category: ErrorCategory, 
  count: number
): StudentError[] {
  const pattern = ERROR_PATTERNS.find(p => p.category === category);
  if (!pattern) {
    throw new Error(`Unknown error category: ${category}`);
  }
  
  const errors: StudentError[] = [];
  for (let i = 0; i < count; i++) {
    errors.push(pattern.generator());
  }
  
  return errors;
}

/**
 * Generiert einen ausgewogenen Mix aller Fehlertypen
 */
export function generateBalancedErrorSet(
  errorsPerType: number = 3
): StudentError[] {
  const errors: StudentError[] = [];
  
  for (const pattern of ERROR_PATTERNS) {
    for (let i = 0; i < errorsPerType; i++) {
      errors.push(pattern.generator());
    }
  }
  
  // Mischen für realistische Verteilung
  return errors.sort(() => Math.random() - 0.5);
}

/**
 * Gibt verfügbare Fehlertypen zurück
 */
export function getAvailableErrorTypes(): ErrorPattern[] {
  return ERROR_PATTERNS.map(p => ({
    category: p.category,
    description: p.description,
    generator: p.generator
  }));
}
