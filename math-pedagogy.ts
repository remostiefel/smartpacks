import { StudentError } from "@shared/schema";

export type ErrorCategory = 
  | 'zehnuebergang_addition'
  | 'zehnuebergang_subtraction'
  | 'complementary_pairs'
  | 'calculation_facts'
  | 'subtraction_borrowing'
  | 'number_reversal'
  | 'digit_reversal'           // NEU: Zahlendreher (z.B. 92 statt 29)
  | 'operation_confusion'      // NEU: Operationsvertauschung (+ statt -)
  | 'pattern_break';           // NEU: Musterbruch

export interface ClassifiedError {
  category: ErrorCategory;
  description: string;
  errors: StudentError[];
  targetNumbers: number[];
}

export interface PaeckchenExercise {
  type: 'calculation' | 'pattern_description' | 'continuation' | 'error_spotting' | 'reflection';
  title: string;
  instructions: string;
  problems?: string[];
  patternHint?: string;
  fillInBlanks?: string[];
  explanation?: string;
  sentenceStems?: string[];
}

// Hilfsfunktion: Erstellt Aufgabe mit Platzhalter an variabler Position
// WICHTIG: Nur positive Zahlen werden verwendet!
function createProblemWithPlaceholder(num1: number, num2: number, operation: '+' | '-', position: 'result' | 'first' | 'second'): string | null {
  const result = operation === '+' ? num1 + num2 : num1 - num2;
  
  // Sicherheitscheck: Nur positive Zahlen erlaubt
  // Prüfe alle drei möglichen Zahlen je nach Position
  if (position === 'first') {
    const first = operation === '+' ? result - num2 : result + num2;
    if (first < 0 || num2 < 0 || result < 0) return null;
    return `___ ${operation} ${num2} = ${result}`;
  }
  
  if (position === 'second') {
    const second = operation === '+' ? result - num1 : num1 - result;
    if (num1 < 0 || second < 0 || result < 0) return null;
    return `${num1} ${operation} ___ = ${result}`;
  }
  
  // position === 'result'
  if (num1 < 0 || num2 < 0 || result < 0) return null;
  return `${num1} ${operation} ${num2} = ___`;
}

export interface HomeworkExercise {
  title: string;
  instructions: string;
  exercises: PaeckchenExercise[];
}

const COMPLEMENTARY_PAIRS_10 = [
  [0, 10], [1, 9], [2, 8], [3, 7], [4, 6], [5, 5],
  [6, 4], [7, 3], [8, 2], [9, 1], [10, 0]
];

const COMPLEMENTARY_PAIRS_20 = [
  [10, 10], [11, 9], [12, 8], [13, 7], [14, 6], [15, 5],
  [16, 4], [17, 3], [18, 2], [19, 1], [20, 0]
];

// Classify a single error into its category
export function classifySingleError(error: StudentError): ErrorCategory | null {
  // First, check for cross-operation error patterns
  
  // Check for Digit Reversal (both operations) - HIGHEST PRIORITY
  const correctStr = error.correctAnswer.toString();
  const incorrectStr = error.incorrectAnswer.toString();
  if (correctStr.length === 2 && incorrectStr.length === 2) {
    const correctReversed = correctStr.split('').reverse().join('');
    if (incorrectStr === correctReversed) {
      return 'digit_reversal';
    }
  }
  
  // Check for Operation Confusion - SECOND PRIORITY
  const additionResult = error.num1 + error.num2;
  const subtractionResult = Math.abs(error.num1 - error.num2);
  if (error.operation === 'addition' && error.incorrectAnswer === subtractionResult) {
    return 'operation_confusion';
  }
  if (error.operation === 'subtraction' && error.incorrectAnswer === additionResult) {
    return 'operation_confusion';
  }
  
  // Then check operation-specific patterns
  if (error.operation === 'addition') {
    // Check for Zehnerübergang Addition
    if ((error.num1 + error.num2 > 10 && error.num1 <= 10 && error.num2 <= 10) ||
        (error.num1 > 10 && error.num2 > 0 && error.num1 + error.num2 > 20)) {
      return 'zehnuebergang_addition';
    }
    
    // Check for Complementary Pairs
    const sum = error.num1 + error.num2;
    if ((sum === 10 || sum === 20) && error.incorrectAnswer !== error.correctAnswer) {
      return 'complementary_pairs';
    }
    
    // Default to calculation facts for other addition errors
    return 'calculation_facts';
  }
  
  if (error.operation === 'subtraction') {
    // Check for Number Reversal
    const reversedResult = error.num2 - error.num1;
    if (error.incorrectAnswer === reversedResult || error.incorrectAnswer === Math.abs(reversedResult)) {
      return 'number_reversal';
    }
    
    // Check for Zehnerübergang Subtraction
    if ((error.num1 <= 20 && error.num2 <= 10 && error.num1 - error.num2 < 10 && error.num1 > 10) ||
        (error.num1 > 10 && (error.num1 % 10) < error.num2)) {
      return 'zehnuebergang_subtraction';
    }
    
    // Default to subtraction borrowing
    return 'subtraction_borrowing';
  }
  
  return null;
}

export function classifyErrors(errors: StudentError[]): ClassifiedError[] {
  const classified: ClassifiedError[] = [];

  const additionErrors = errors.filter(e => e.operation === 'addition');
  const subtractionErrors = errors.filter(e => e.operation === 'subtraction');

  const zehnerAddition = additionErrors.filter(e => 
    (e.num1 + e.num2 > 10 && e.num1 <= 10 && e.num2 <= 10) ||
    (e.num1 > 10 && e.num2 > 0 && e.num1 + e.num2 > 20)
  );
  
  if (zehnerAddition.length > 0) {
    classified.push({
      category: 'zehnuebergang_addition',
      description: 'Schwierigkeiten beim Zehnerübergang bei Addition',
      errors: zehnerAddition,
      targetNumbers: Array.from(new Set(zehnerAddition.flatMap(e => [e.num1, e.num2])))
    });
  }

  const zehnerSubtraction = subtractionErrors.filter(e => 
    (e.num1 <= 20 && e.num2 <= 10 && e.num1 - e.num2 < 10 && e.num1 > 10) ||
    (e.num1 > 10 && (e.num1 % 10) < e.num2)
  );

  if (zehnerSubtraction.length > 0) {
    classified.push({
      category: 'zehnuebergang_subtraction',
      description: 'Schwierigkeiten beim Zehnerübergang bei Subtraktion',
      errors: zehnerSubtraction,
      targetNumbers: Array.from(new Set(zehnerSubtraction.flatMap(e => [e.num1, e.num2])))
    });
  }

  const complementaryErrors = additionErrors.filter(e => {
    const sum = e.num1 + e.num2;
    return (sum === 10 || sum === 20) && e.incorrectAnswer !== e.correctAnswer;
  });

  if (complementaryErrors.length > 0) {
    classified.push({
      category: 'complementary_pairs',
      description: 'Unsicherheit bei Ergänzungsaufgaben (Partnerzahlen)',
      errors: complementaryErrors,
      targetNumbers: Array.from(new Set(complementaryErrors.flatMap(e => [e.num1, e.num2])))
    });
  }

  const factsErrors = additionErrors.filter(e => 
    !zehnerAddition.includes(e) && !complementaryErrors.includes(e)
  );

  if (factsErrors.length > 0) {
    classified.push({
      category: 'calculation_facts',
      description: 'Lücken bei Einmaleins/Grundrechenarten',
      errors: factsErrors,
      targetNumbers: Array.from(new Set(factsErrors.flatMap(e => [e.num1, e.num2])))
    });
  }

  const reversalErrors = errors.filter(e => {
    if (e.operation === 'subtraction') {
      const reversedResult = e.num2 - e.num1;
      return e.incorrectAnswer === reversedResult || e.incorrectAnswer === Math.abs(reversedResult);
    }
    return false;
  });

  if (reversalErrors.length > 0) {
    classified.push({
      category: 'number_reversal',
      description: 'Vertauschen von Zahlen bei der Subtraktion',
      errors: reversalErrors,
      targetNumbers: Array.from(new Set(reversalErrors.flatMap(e => [e.num1, e.num2])))
    });
  }

  const borrowingErrors = subtractionErrors.filter(e => 
    !zehnerSubtraction.includes(e) && !reversalErrors.includes(e)
  );

  if (borrowingErrors.length > 0) {
    classified.push({
      category: 'subtraction_borrowing',
      description: 'Schwierigkeiten bei Subtraktionsaufgaben',
      errors: borrowingErrors,
      targetNumbers: Array.from(new Set(borrowingErrors.flatMap(e => [e.num1, e.num2])))
    });
  }

  // NEU: Zahlendreher-Erkennung (Ziffern vertauscht)
  const digitReversalErrors = errors.filter(e => {
    const correctStr = e.correctAnswer.toString();
    const incorrectStr = e.incorrectAnswer.toString();
    
    // Prüfe ob beide Zahlen 2-stellig sind und Ziffern vertauscht wurden
    if (correctStr.length === 2 && incorrectStr.length === 2) {
      const correctReversed = correctStr.split('').reverse().join('');
      return incorrectStr === correctReversed;
    }
    return false;
  });

  if (digitReversalErrors.length > 0) {
    classified.push({
      category: 'digit_reversal',
      description: 'Ziffern werden vertauscht (Zahlendreher)',
      errors: digitReversalErrors,
      targetNumbers: Array.from(new Set(digitReversalErrors.flatMap(e => [e.num1, e.num2])))
    });
  }

  // NEU: Operationsvertauschung (+ statt - oder umgekehrt)
  const operationConfusionErrors = errors.filter(e => {
    // Prüfe ob das falsche Ergebnis zur anderen Operation passt
    if (e.operation === 'addition') {
      const wrongResult = e.num1 - e.num2;
      return e.incorrectAnswer === wrongResult || e.incorrectAnswer === Math.abs(wrongResult);
    } else if (e.operation === 'subtraction') {
      const wrongResult = e.num1 + e.num2;
      return e.incorrectAnswer === wrongResult;
    }
    return false;
  });

  if (operationConfusionErrors.length > 0) {
    classified.push({
      category: 'operation_confusion',
      description: 'Verwechslung von Addition und Subtraktion',
      errors: operationConfusionErrors,
      targetNumbers: Array.from(new Set(operationConfusionErrors.flatMap(e => [e.num1, e.num2])))
    });
  }

  // NEU: Musterbruch-Erkennung (inkonsistente Fehler ohne erkennbares Muster)
  // Wird erkannt wenn mindestens 3 Fehler vorliegen, die zu keiner anderen Kategorie gehören
  const alreadyClassifiedIds = new Set(
    classified.flatMap(c => c.errors.map(e => e.id))
  );
  
  const unclassifiedErrors = errors.filter(e => !alreadyClassifiedIds.has(e.id));
  
  // Prüfe ob die unklassifizierten Fehler ein inkonsistentes Muster zeigen
  if (unclassifiedErrors.length >= 3) {
    // Berechne ob Fehler systematisch sind (immer gleiche Abweichung)
    const deviations = unclassifiedErrors.map(e => e.incorrectAnswer - e.correctAnswer);
    const uniqueDeviations = new Set(deviations);
    
    // Wenn verschiedene Abweichungen → kein systematischer Fehler → Musterbruch
    if (uniqueDeviations.size >= 3) {
      classified.push({
        category: 'pattern_break',
        description: 'Keine systematische Mustererkennung - willkürliches Rechnen',
        errors: unclassifiedErrors,
        targetNumbers: Array.from(new Set(unclassifiedErrors.flatMap(e => [e.num1, e.num2])))
      });
    }
  }

  return classified;
}

function generateConstantSumPaeckchen(targetSum: number, baseNum: number): PaeckchenExercise[] {
  const problems: string[] = [];
  const start = Math.max(0, baseNum - 2);
  const end = Math.min(targetSum, baseNum + 2);

  const positions: ('result' | 'first' | 'second')[] = ['result', 'second', 'result', 'first', 'result'];
  let positionIndex = 0;

  for (let i = start; i <= end && problems.length < 5; i++) {
    const complement = targetSum - i;
    if (complement >= 0 && complement <= 20) {
      const position = positions[positionIndex % positions.length];
      const problem = createProblemWithPlaceholder(i, complement, '+', position);
      if (problem) {  // Nur hinzufügen, wenn gültig (nicht null)
        problems.push(problem);
        positionIndex++;
      }
    }
  }

  return [
    {
      type: 'calculation',
      title: 'Rechne die Aufgaben',
      instructions: 'Löse die Aufgaben und achte auf das Muster.',
      problems,
      patternHint: '↑+1, ↓-1, = (bleibt gleich)'
    },
    {
      type: 'pattern_description',
      title: 'Was fällt dir auf?',
      instructions: 'Beschreibe das Muster, das du entdeckst.',
      sentenceStems: [
        'Die erste Zahl wird immer ___.',
        'Die zweite Zahl wird immer ___.',
        'Das Ergebnis ___.'
      ]
    },
    {
      type: 'continuation',
      title: 'Setze das Päckchen fort',
      instructions: 'Schreibe zwei weitere Aufgaben, die zum Muster passen.',
      fillInBlanks: ['___ + ___ = ___', '___ + ___ = ___']
    },
    {
      type: 'reflection',
      title: 'Erkläre',
      instructions: 'Warum bleibt die Summe immer gleich?',
      explanation: 'Wenn eine Zahl um 1 größer wird und die andere um 1 kleiner, bleibt die Summe konstant.'
    }
  ];
}

function generateOpposingChangePaeckchen(minuend: number, startSubtrahend: number): PaeckchenExercise[] {
  const problems: string[] = [];
  const positions: ('result' | 'first' | 'second')[] = ['result', 'second', 'result', 'first', 'result'];
  
  for (let i = 0; i < 5; i++) {
    const subtrahend = startSubtrahend - i;
    if (subtrahend >= 0 && minuend >= subtrahend) {  // Sicherheitscheck: keine negativen Ergebnisse
      const position = positions[i % positions.length];
      const problem = createProblemWithPlaceholder(minuend, subtrahend, '-', position);
      if (problem) {  // Nur hinzufügen, wenn gültig (nicht null)
        problems.push(problem);
      }
    }
  }

  return [
    {
      type: 'calculation',
      title: 'Rechne die Aufgaben',
      instructions: 'Löse die Aufgaben und achte auf das Muster.',
      problems,
      patternHint: '= (bleibt gleich), ↓-1, ↑+1'
    },
    {
      type: 'pattern_description',
      title: 'Was fällt dir auf?',
      instructions: 'Beschreibe das Muster in eigenen Worten.',
      sentenceStems: [
        'Die erste Zahl ___.',
        'Die zweite Zahl wird um 1 ___.',
        'Das Ergebnis wird um 1 ___.'
      ]
    },
    {
      type: 'continuation',
      title: 'Setze fort',
      instructions: 'Schreibe die nächsten zwei Aufgaben.',
      fillInBlanks: ['___ - ___ = ___', '___ - ___ = ___']
    }
  ];
}

function generateCrossingTensPaeckchen(baseNum: number, startAddend: number): PaeckchenExercise[] {
  const problems: string[] = [];
  const positions: ('result' | 'first' | 'second')[] = ['result', 'second', 'result', 'first', 'result'];
  
  for (let i = 0; i < 5; i++) {
    const addend = startAddend + i;
    if (addend <= 10) {
      const position = positions[i % positions.length];
      const problem = createProblemWithPlaceholder(baseNum, addend, '+', position);
      if (problem) {  // Nur hinzufügen, wenn gültig (nicht null)
        problems.push(problem);
      }
    }
  }

  return [
    {
      type: 'calculation',
      title: 'Über den Zehner',
      instructions: 'Rechne die Aufgaben. Nutze die 10 als Hilfe.',
      problems,
      patternHint: '= (bleibt gleich), ↑+1, ↑+1'
    },
    {
      type: 'pattern_description',
      title: 'Entdecke das Muster',
      instructions: 'Was verändert sich von Zeile zu Zeile?',
      sentenceStems: [
        'Die erste Zahl ___.',
        'Die zweite Zahl wird um ___ größer.',
        'Das Ergebnis wird um ___ größer.'
      ]
    },
    {
      type: 'error_spotting',
      title: 'Finde den Fehler',
      instructions: 'Eine Aufgabe passt nicht ins Päckchen. Welche?',
      problems: [
        `${baseNum} + ${startAddend} = ${baseNum + startAddend}`,
        `${baseNum} + ${startAddend + 1} = ${baseNum + startAddend + 1}`,
        `${baseNum} + ${startAddend + 2} = ${baseNum + startAddend + 1}`,
        `${baseNum} + ${startAddend + 3} = ${baseNum + startAddend + 3}`
      ]
    },
    {
      type: 'reflection',
      title: 'Erkläre deine Strategie',
      instructions: 'Wie rechnest du über den Zehner? Erkläre am Beispiel.',
      explanation: `Beispiel: ${baseNum} + ${startAddend + 2} = ... \nIch rechne erst bis zur 10, dann weiter.`
    }
  ];
}

function generateSameDirectionPaeckchen(startNum1: number, startNum2: number): PaeckchenExercise[] {
  const problems: string[] = [];
  const positions: ('result' | 'first' | 'second')[] = ['result', 'second', 'result', 'first', 'result'];
  
  for (let i = 0; i < 5; i++) {
    const num1 = startNum1 + i;
    const num2 = startNum2 + i;
    if (num1 + num2 <= 20) {
      const position = positions[i % positions.length];
      const problem = createProblemWithPlaceholder(num1, num2, '+', position);
      if (problem) {  // Nur hinzufügen, wenn gültig (nicht null)
        problems.push(problem);
      }
    }
  }

  return [
    {
      type: 'calculation',
      title: 'Rechne die Aufgaben',
      instructions: 'Löse alle Aufgaben.',
      problems,
      patternHint: '↑+1, ↑+1, ↑+2'
    },
    {
      type: 'pattern_description',
      title: 'Beschreibe das Muster',
      instructions: 'Was passiert mit den Zahlen?',
      sentenceStems: [
        'Die erste Zahl wird um ___ größer.',
        'Die zweite Zahl wird um ___ größer.',
        'Das Ergebnis wird um ___ größer.'
      ]
    },
    {
      type: 'continuation',
      title: 'Erfinde ein eigenes Päckchen',
      instructions: 'Schreibe 3 Aufgaben, bei denen beide Zahlen größer werden.',
      fillInBlanks: ['___ + ___ = ___', '___ + ___ = ___', '___ + ___ = ___']
    }
  ];
}

export function generatePaeckchenForError(classified: ClassifiedError): HomeworkExercise[] {
  const exercises: HomeworkExercise[] = [];

  switch (classified.category) {
    case 'zehnuebergang_addition': {
      const baseNums = classified.targetNumbers.filter(n => n >= 6 && n <= 9);
      const baseNum = baseNums[0] || 8;
      
      exercises.push({
        title: 'Über den Zehner - Addieren',
        instructions: 'Diese Aufgaben helfen dir, sicher über den Zehner zu rechnen.',
        exercises: generateCrossingTensPaeckchen(baseNum, 2)
      });

      const complementarySum = 10;
      exercises.push({
        title: 'Partnerzahlen zur 10',
        instructions: 'Ergänze zur 10. Das hilft beim Zehnerübergang!',
        exercises: generateConstantSumPaeckchen(complementarySum, 5)
      });
      break;
    }

    case 'zehnuebergang_subtraction': {
      const minuends = classified.targetNumbers.filter(n => n > 10 && n <= 20);
      const minuend = minuends[0] || 15;
      
      exercises.push({
        title: 'Über den Zehner - Subtrahieren',
        instructions: 'Übe das Zurückrechnen über den Zehner.',
        exercises: generateOpposingChangePaeckchen(minuend, 8)
      });
      break;
    }

    case 'complementary_pairs': {
      exercises.push({
        title: 'Partnerzahlen entdecken',
        instructions: 'Finde die Muster bei den Partnerzahlen.',
        exercises: generateConstantSumPaeckchen(10, 5)
      });

      exercises.push({
        title: 'Partnerzahlen zur 20',
        instructions: 'Auch bei 20 gibt es Partnerzahlen!',
        exercises: generateConstantSumPaeckchen(20, 10)
      });
      break;
    }

    case 'calculation_facts': {
      const nums = classified.targetNumbers.slice(0, 2);
      if (nums.length >= 2) {
        exercises.push({
          title: 'Rechenmuster üben',
          instructions: 'Entdecke das Muster und nutze es zum Rechnen.',
          exercises: generateSameDirectionPaeckchen(nums[0], nums[1])
        });
      }
      break;
    }

    case 'subtraction_borrowing': {
      const minuends = classified.targetNumbers.filter(n => n >= 10);
      const minuend = minuends[0] || 15;
      
      exercises.push({
        title: 'Subtrahieren mit System',
        instructions: 'Entdecke, wie Subtraktionsaufgaben zusammenhängen.',
        exercises: generateOpposingChangePaeckchen(minuend, 7)
      });
      break;
    }

    case 'number_reversal': {
      const nums = classified.targetNumbers.slice(0, 2);
      const minuend = nums.find(n => n >= 10) || 15;
      const subtrahend = nums.find(n => n < 10) || 5;
      
      exercises.push({
        title: 'Reihenfolge beachten!',
        instructions: 'Bei der Subtraktion ist die Reihenfolge wichtig. Achte genau auf die Zahlen.',
        exercises: [
          {
            type: 'calculation',
            title: 'Rechne genau',
            instructions: 'Achte bei jeder Aufgabe darauf, welche Zahl vorne steht.',
            problems: [
              `${minuend} - ${subtrahend} = ___`,
              `___ - ${subtrahend} = ${minuend - subtrahend}`,
              `${minuend + 1} - ${subtrahend} = ___`,
              `${minuend} - ___ = ${minuend - subtrahend}`
            ],
            patternHint: 'Die erste Zahl muss größer oder gleich der zweiten sein!'
          },
          {
            type: 'reflection',
            title: 'Was ist der Unterschied?',
            instructions: `Erkläre: Warum vertauschen wir bei ${minuend} - ${subtrahend} nicht die Zahlen?`,
            explanation: 'Bei der Subtraktion ist die Reihenfolge wichtig. Wir können nur von einer größeren Zahl eine kleinere abziehen.'
          }
        ]
      });
      break;
    }

    default:
      exercises.push({
        title: 'Rechenmuster entdecken',
        instructions: 'Finde die Muster in diesen Aufgaben.',
        exercises: generateSameDirectionPaeckchen(3, 4)
      });
  }

  return exercises;
}

export function generateHomeworkExercises(errors: StudentError[], pageCount: number): HomeworkExercise[] {
  const classified = classifyErrors(errors);
  
  if (classified.length === 0) {
    return [{
      title: 'Rechenmuster üben',
      instructions: 'Übe mit diesen Aufgaben.',
      exercises: generateSameDirectionPaeckchen(5, 3)
    }];
  }

  const allExercises: HomeworkExercise[] = [];
  
  classified.sort((a, b) => {
    const priority = {
      'zehnuebergang_addition': 1,
      'zehnuebergang_subtraction': 2,
      'complementary_pairs': 3,
      'subtraction_borrowing': 4,
      'calculation_facts': 5,
      'number_reversal': 6,
      'digit_reversal': 7,
      'operation_confusion': 8,
      'pattern_break': 9
    };
    return (priority[a.category] || 999) - (priority[b.category] || 999);
  });

  for (const classifiedError of classified) {
    const exercises = generatePaeckchenForError(classifiedError);
    allExercises.push(...exercises);
  }

  return allExercises.slice(0, pageCount);
}
