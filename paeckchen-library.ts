import type { StudentError } from "@shared/schema";

export type PaeckchenType = 
  | 'constant_sum'           // Konstanz der Summe (gegensinnige Veränderung)
  | 'opposing_change'        // Gegensinnige Veränderung (Subtraktion)
  | 'same_direction'         // Gleichsinnige Veränderung
  | 'crossing_tens'          // Zehnerübergang
  | 'error_research'         // Fehlerforschungs-Päckchen (absichtlicher Fehler)
  | 'decomposition_steps'    // Zerlegungspäckchen (mehrstufig)
  | 'pattern_analysis'       // Muster-Analyse (Ja/Nein?)
  | 'inverse_tasks'          // Umkehraufgaben
  | 'exchange_tasks'         // Tauschaufgaben
  | 'number_reversal_demo'   // Reihenfolge beachten
  | 'digit_detective'        // NEU: Zahlendreher-Detektivpäckchen
  | 'continuation_challenge' // NEU: Fortsetzungs-Päckchen
  | 'operation_contrast';    // NEU: Addition vs. Subtraktion verdeutlichen

export type FacettenLevel = 'basis' | 'anwenden' | 'verknuepfen';

export interface Facette {
  level: FacettenLevel;
  numberVariants: number[];
  cognitiveLoad: 'same';
  paeckchenType: PaeckchenType;
  generatedPaeckchen: GeneratedPaeckchen;
}

export interface ClusterWorksheet {
  clusterName: string;
  errorType: string;
  facetten: [Facette, Facette, Facette];
  reflexionFragen: {
    nachBasis: string;
    nachAnwenden: string;
    nachVerknuepfen: string;
  };
}

export interface PaeckchenTemplate {
  type: PaeckchenType;
  name: string;
  description: string;
  targetErrorTypes: string[];
  didacticGoal: string;
  visualizationHints: string[];
  languagePatterns: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GeneratedPaeckchen {
  title: string;
  instructions: string;
  problems: string[];
  patternHint?: string;
  visualizationInstructions?: string;
  reflectionQuestions: string[];
  sentenceStems: string[];
  errorSpottingTask?: string;
  decompositionSteps?: string[];
}

// Päckchen-Bibliothek: Alle verfügbaren Vorlagen
export const PAECKCHEN_TEMPLATES: Record<PaeckchenType, PaeckchenTemplate> = {
  constant_sum: {
    type: 'constant_sum',
    name: 'Konstanz der Summe',
    description: 'Die Summe bleibt gleich, wenn ein Summand um denselben Wert größer und der andere kleiner wird (gegensinnige Veränderung)',
    targetErrorTypes: ['zehnuebergang_addition', 'complementary_pairs'],
    didacticGoal: 'Einsicht in Zahlbeziehungen und flexible Zerlegungsstrategien entwickeln',
    visualizationHints: ['Plättchen umdrehen zeigt: Gesamtanzahl bleibt gleich', 'Pfeile: ↑+1 bei erster Zahl, ↓-1 bei zweiter Zahl, = bei Ergebnis'],
    languagePatterns: [
      'Die erste Zahl wird immer um ___ größer.',
      'Die zweite Zahl wird immer um ___ kleiner.',
      'Das Ergebnis bleibt gleich bei ___.'
    ],
    difficulty: 'easy'
  },
  
  opposing_change: {
    type: 'opposing_change',
    name: 'Gegensinnige Veränderung (Subtraktion)',
    description: 'Bei konstanter erster Zahl: Subtrahend wird kleiner → Ergebnis wird größer',
    targetErrorTypes: ['zehnuebergang_subtraction', 'subtraction_borrowing'],
    didacticGoal: 'Zusammenhang zwischen Subtrahend und Differenz verstehen',
    visualizationHints: ['Subtrahend-Veränderung mit Pfeilen markieren', 'Ergebnis-Veränderung gegenläufig zeigen'],
    languagePatterns: [
      'Die erste Zahl bleibt bei ___.',
      'Die zweite Zahl wird um ___ kleiner/größer.',
      'Das Ergebnis wird um ___ größer/kleiner.'
    ],
    difficulty: 'medium'
  },

  same_direction: {
    type: 'same_direction',
    name: 'Gleichsinnige Veränderung',
    description: 'Beide Zahlen verändern sich in dieselbe Richtung',
    targetErrorTypes: ['calculation_facts'],
    didacticGoal: 'Erkennen, wie sich das Ergebnis verändert, wenn beide Summanden wachsen',
    visualizationHints: ['Beide Pfeile zeigen nach oben: ↑+1, ↑+1 → ↑+2'],
    languagePatterns: [
      'Die erste Zahl wird um ___ größer.',
      'Die zweite Zahl wird um ___ größer.',
      'Das Ergebnis wird um ___ größer.'
    ],
    difficulty: 'easy'
  },

  crossing_tens: {
    type: 'crossing_tens',
    name: 'Zehnerübergang meistern',
    description: 'Systematisches Üben des Zehnerübergangs mit steigendem zweiten Summanden',
    targetErrorTypes: ['zehnuebergang_addition'],
    didacticGoal: 'Sicheres Rechnen über den Zehner durch Mustererkennung',
    visualizationHints: ['Zehner markieren', 'Zerlegung zur 10 visualisieren'],
    languagePatterns: [
      'Die erste Zahl bleibt bei ___.',
      'Die zweite Zahl wird um ___ größer.',
      'Das Ergebnis springt über die ___.'
    ],
    difficulty: 'medium'
  },

  error_research: {
    type: 'error_research',
    name: 'Fehlerforschungs-Päckchen',
    description: 'Ein Päckchen mit einem absichtlichen Fehler - Kinder müssen ihn finden und korrigieren',
    targetErrorTypes: ['all'],
    didacticGoal: 'Musterverständnis durch Fehleranalyse vertiefen',
    visualizationHints: ['Alle Aufgaben prüfen', 'Muster mit Pfeilen markieren', 'Fehler einkreisen'],
    languagePatterns: [
      'Diese Aufgabe passt nicht, weil ___.',
      'Die Regel lautet: ___.',
      'Die richtige Aufgabe müsste sein: ___.'
    ],
    difficulty: 'hard'
  },

  decomposition_steps: {
    type: 'decomposition_steps',
    name: 'Zerlegungspäckchen',
    description: 'Mehrstufige Rechenwege explizit darstellen (z.B. 13-9 in Schritten)',
    targetErrorTypes: ['zehnuebergang_subtraction', 'subtraction_borrowing'],
    didacticGoal: 'Zerlegungsstrategien verstehen und anwenden',
    visualizationHints: ['Jeder Schritt mit Plättchen zeigen', 'Erst zur 10, dann weiter'],
    languagePatterns: [
      'Zuerst rechne ich bis zur 10: ___.',
      'Dann rechne ich den Rest: ___.',
      'Vom Zehner nehme ich weg: ___.'
    ],
    difficulty: 'hard'
  },

  pattern_analysis: {
    type: 'pattern_analysis',
    name: 'Muster-Analyse',
    description: 'Ist das ein schönes Päckchen? Kinder überprüfen und begründen',
    targetErrorTypes: ['all'],
    didacticGoal: 'Kritisches Denken und Mustererkennung fördern',
    visualizationHints: ['Jede Aufgabe einzeln prüfen', 'Veränderungen markieren'],
    languagePatterns: [
      'Das ist ein schönes Päckchen, weil ___.',
      'Das ist kein schönes Päckchen, weil ___.',
      'Die Regel ist: ___.'
    ],
    difficulty: 'hard'
  },

  inverse_tasks: {
    type: 'inverse_tasks',
    name: 'Umkehraufgaben',
    description: 'Addition und Subtraktion als Umkehroperationen verstehen',
    targetErrorTypes: ['zehnuebergang_addition', 'zehnuebergang_subtraction'],
    didacticGoal: 'Operationsverständnis durch Umkehrbeziehungen stärken',
    visualizationHints: ['Gleiche Zahlen, verschiedene Operationen', 'Plättchen hinzufügen/wegnehmen'],
    languagePatterns: [
      'Wenn ___ + ___ = ___, dann ist ___ - ___ = ___.',
      'Addition und Subtraktion sind Umkehroperationen.',
      'Das Ergebnis der Addition ist der Minuend der Subtraktion.'
    ],
    difficulty: 'medium'
  },

  exchange_tasks: {
    type: 'exchange_tasks',
    name: 'Tauschaufgaben',
    description: 'Kommutativgesetz der Addition: a+b = b+a',
    targetErrorTypes: ['calculation_facts', 'complementary_pairs'],
    didacticGoal: 'Tauschgesetz verstehen und nutzen',
    visualizationHints: ['Plättchen in anderer Reihenfolge', 'Farben tauschen'],
    languagePatterns: [
      'Bei der Addition kann man die Zahlen tauschen.',
      'Das Ergebnis bleibt gleich: ___ + ___ = ___ + ___.',
      'Bei der Subtraktion geht das nicht!'
    ],
    difficulty: 'easy'
  },

  number_reversal_demo: {
    type: 'number_reversal_demo',
    name: 'Reihenfolge beachten',
    description: 'Bei Subtraktion ist die Reihenfolge wichtig',
    targetErrorTypes: ['number_reversal'],
    didacticGoal: 'Verstehen, dass bei Subtraktion die Reihenfolge entscheidend ist',
    visualizationHints: ['Minuend muss größer sein', 'Zahlen nicht vertauschen'],
    languagePatterns: [
      'Bei der Subtraktion ist die Reihenfolge wichtig.',
      '___ - ___ ist nicht dasselbe wie ___ - ___.',
      'Die erste Zahl muss größer sein als die zweite.'
    ],
    difficulty: 'medium'
  },

  digit_detective: {
    type: 'digit_detective',
    name: 'Zahlendreher-Detektiv',
    description: 'Ziffern richtig lesen und schreiben - Detektivaufgaben gegen Zahlendreher',
    targetErrorTypes: ['digit_reversal'],
    didacticGoal: 'Sichere Ziffernfolge und Stellenwertverständnis entwickeln',
    visualizationHints: ['Zehner und Einer markieren', 'Farben für Stellenwerte nutzen'],
    languagePatterns: [
      'Die Zehnerstelle ist ___, die Einerstelle ist ___.',
      '12 ist nicht dasselbe wie 21.',
      'Ich prüfe: Zehner zuerst, dann Einer.'
    ],
    difficulty: 'medium'
  },

  continuation_challenge: {
    type: 'continuation_challenge',
    name: 'Fortsetzungs-Challenge',
    description: 'Kinder setzen das Muster selbstständig fort - kreatives Denken',
    targetErrorTypes: ['all'],
    didacticGoal: 'Mustererkennung aktiv anwenden und transferieren',
    visualizationHints: ['Regel mit Pfeilen zeigen', 'Eigene Aufgaben erfinden'],
    languagePatterns: [
      'Das Muster lautet: ___.',
      'Die nächsten Aufgaben müssen sein: ___.',
      'Ich kann das Muster fortsetzen, weil ___.'
    ],
    difficulty: 'hard'
  },

  operation_contrast: {
    type: 'operation_contrast',
    name: 'Addition oder Subtraktion?',
    description: 'Beide Operationen mit denselben Zahlen vergleichen',
    targetErrorTypes: ['operation_confusion'],
    didacticGoal: 'Operationsverständnis durch direkten Vergleich schärfen',
    visualizationHints: ['Plättchen dazulegen vs. wegnehmen', 'Pfeile: → dazu, ← weg'],
    languagePatterns: [
      'Bei + wird das Ergebnis größer.',
      'Bei - wird das Ergebnis kleiner.',
      '___ + ___ = ___, aber ___ - ___ = ___.'
    ],
    difficulty: 'easy'
  }
};

// Generator-Funktionen für jeden Päckchen-Typ

export function generateConstantSumPaeckchen(
  targetSum: number, 
  startNum: number, 
  operator: '+' | '-' = '+'
): GeneratedPaeckchen {
  const problems: string[] = [];
  
  if (operator === '+') {
    // Addition: Konstante Summe
    for (let i = 0; i < 5; i++) {
      const num1 = startNum + i;
      const num2 = targetSum - num1;
      if (num1 >= 0 && num2 >= 0 && num2 <= 20) {
        problems.push(`${num1} + ${num2} = ___`);
      }
    }
    
    return {
      title: 'Die Summe bleibt gleich!',
      instructions: 'Rechne die Aufgaben und entdecke das Muster.',
      problems,
      patternHint: '↑+1 (erste Zahl), ↓-1 (zweite Zahl), = (Ergebnis bleibt gleich)',
      visualizationInstructions: 'Zeichne Plättchen: Ein Plättchen wandert von rechts nach links.',
      reflectionQuestions: [
        'Warum bleibt das Ergebnis gleich?',
        'Was passiert mit den beiden Zahlen?'
      ],
      sentenceStems: PAECKCHEN_TEMPLATES.constant_sum.languagePatterns
    };
  } else {
    // Subtraktion: Konstanter Minuend, variabler Subtrahend
    const minuend = targetSum;
    for (let i = 0; i < 5; i++) {
      const subtrahend = Math.max(1, startNum + i);
      if (subtrahend <= minuend && minuend - subtrahend >= 0) {
        problems.push(`${minuend} - ${subtrahend} = ___`);
      }
    }
    
    return {
      title: 'Vom selben Minuend abziehen',
      instructions: 'Rechne die Aufgaben und entdecke das Muster.',
      problems,
      patternHint: '= (Minuend bleibt), ↑+1 (Subtrahend wächst), ↓-1 (Differenz sinkt)',
      visualizationInstructions: 'Zeige: Je mehr ich wegnehme, desto weniger bleibt übrig.',
      reflectionQuestions: [
        'Was passiert mit dem Ergebnis, wenn ich mehr wegnehme?',
        'Warum wird das Ergebnis immer kleiner?'
      ],
      sentenceStems: PAECKCHEN_TEMPLATES.opposing_change.languagePatterns
    };
  }
}

export function generateErrorResearchPaeckchen(basePattern: string[], correctAnswer: number): GeneratedPaeckchen {
  const problems = [...basePattern];
  const errorIndex = Math.floor(problems.length / 2);
  const wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1);
  
  problems[errorIndex] = problems[errorIndex].replace('___', wrongAnswer.toString());

  return {
    title: 'Fehlerforschung: Finde den Fehler!',
    instructions: 'Eine Aufgabe passt nicht ins Päckchen. Finde sie und erkläre, warum.',
    problems,
    errorSpottingTask: 'Markiere die falsche Aufgabe und schreibe die richtige Lösung auf.',
    reflectionQuestions: [
      'Welche Aufgabe passt nicht?',
      'Warum passt sie nicht zum Muster?',
      'Wie müsste die richtige Aufgabe lauten?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.error_research.languagePatterns
  };
}

export function generateDecompositionPaeckchen(minuend: number, subtrahend: number): GeneratedPaeckchen {
  const onesDigit = minuend % 10;
  const step1Subtrahend = Math.min(onesDigit, subtrahend);
  const step1Result = minuend - step1Subtrahend;
  const step2Subtrahend = subtrahend - step1Subtrahend;
  const finalResult = step1Result - step2Subtrahend;

  return {
    title: `Rechnen in Schritten: ${minuend} - ${subtrahend}`,
    instructions: 'Wir zerlegen die Aufgabe in einfache Schritte.',
    problems: [
      `Aufgabe: ${minuend} - ${subtrahend} = ___`
    ],
    decompositionSteps: [
      `Schritt 1: Erst zur 10 rechnen: ${minuend} - ${step1Subtrahend} = ${step1Result}`,
      `Schritt 2: Wie viel bleibt von ${subtrahend} übrig? ${subtrahend} - ${step1Subtrahend} = ${step2Subtrahend}`,
      `Schritt 3: Vom Zehner wegnehmen: ${step1Result} - ${step2Subtrahend} = ${finalResult}`
    ],
    visualizationInstructions: 'Zeichne Plättchen: Zeige jeden Schritt mit Plättchen.',
    reflectionQuestions: [
      'Warum zerlegen wir die zweite Zahl?',
      'Warum rechnen wir erst bis zur 10?',
      'Wie hilft dir diese Strategie?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.decomposition_steps.languagePatterns
  };
}

export function generatePatternAnalysisPaeckchen(problems: string[], isCorrect: boolean): GeneratedPaeckchen {
  return {
    title: 'Ist das ein schönes Päckchen?',
    instructions: 'Prüfe: Folgen diese Aufgaben einer Regel? Begründe deine Antwort.',
    problems,
    reflectionQuestions: [
      'Ist das ein schönes Päckchen? Ja oder Nein?',
      'Welche Regel erkennst du (oder sollte gelten)?',
      'Wenn nein: Was müsste geändert werden?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.pattern_analysis.languagePatterns
  };
}

export function generateInverseTasksPaeckchen(num1: number, num2: number): GeneratedPaeckchen {
  const sum = num1 + num2;
  
  return {
    title: 'Addition und Subtraktion - Umkehraufgaben',
    instructions: 'Entdecke den Zusammenhang zwischen Addition und Subtraktion.',
    problems: [
      `${num1} + ${num2} = ___`,
      `${sum} - ${num2} = ___`,
      `${sum} - ${num1} = ___`,
      `${num2} + ${num1} = ___`
    ],
    patternHint: 'Addition und Subtraktion sind Umkehroperationen',
    visualizationInstructions: 'Zeige mit Plättchen: Hinzufügen und Wegnehmen',
    reflectionQuestions: [
      'Wie hängen Addition und Subtraktion zusammen?',
      'Wie hilft dir die Addition bei der Subtraktion?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.inverse_tasks.languagePatterns
  };
}

export function generateExchangeTasksPaeckchen(pairs: [number, number][]): GeneratedPaeckchen {
  const problems: string[] = [];
  
  pairs.forEach(([a, b]) => {
    problems.push(`${a} + ${b} = ___`);
    problems.push(`${b} + ${a} = ___`);
  });

  return {
    title: 'Tauschaufgaben - Die Reihenfolge ist egal',
    instructions: 'Bei der Addition kannst du die Zahlen tauschen!',
    problems,
    patternHint: 'a + b = b + a (Kommutativgesetz)',
    visualizationInstructions: 'Zeige mit Plättchen: Die Gesamtanzahl bleibt gleich.',
    reflectionQuestions: [
      'Was passiert, wenn du die Zahlen tauschst?',
      'Gilt das auch für Minus-Aufgaben?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.exchange_tasks.languagePatterns
  };
}

// NEU: Generator-Funktionen für kreative Päckchen-Typen

export function generateDigitDetectivePaeckchen(correctNumber: number): GeneratedPaeckchen {
  const reversed = parseInt(correctNumber.toString().split('').reverse().join(''));
  const tens = Math.floor(correctNumber / 10);
  const ones = correctNumber % 10;

  return {
    title: 'Zahlendreher-Detektiv',
    instructions: 'Achte auf die Reihenfolge der Ziffern! Welche Zahl ist richtig?',
    problems: [
      `Welche Zahl ist richtig? ${correctNumber} oder ${reversed}?`,
      `Zehnerstelle: ___, Einerstelle: ___`,
      `${correctNumber} hat ___ Zehner und ___ Einer`,
      `${reversed} hat ___ Zehner und ___ Einer`
    ],
    patternHint: `${tens} Zehner und ${ones} Einer = ${correctNumber}`,
    visualizationInstructions: 'Zeichne Zehnerstangen und Einerwürfel für beide Zahlen.',
    reflectionQuestions: [
      'Warum sind 12 und 21 unterschiedlich?',
      'Welche Zahl ist größer?',
      'Wie kannst du Zahlendreher vermeiden?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.digit_detective.languagePatterns
  };
}

export function generateContinuationChallengePaeckchen(baseProblems: string[]): GeneratedPaeckchen {
  return {
    title: 'Fortsetzungs-Challenge',
    instructions: 'Du bist dran! Entdecke das Muster und setze es fort.',
    problems: [
      ...baseProblems.slice(0, 3),
      'Jetzt du: ___ ___ ___ = ___',
      'Und noch eine: ___ ___ ___ = ___'
    ],
    patternHint: 'Achte auf die Veränderungen: Was wird größer? Was wird kleiner?',
    visualizationInstructions: 'Markiere mit Pfeilen: ↑ wird größer, ↓ wird kleiner, = bleibt gleich',
    reflectionQuestions: [
      'Welche Regel hast du entdeckt?',
      'Wie hast du die nächsten Aufgaben gefunden?',
      'Kannst du noch mehr Aufgaben erfinden?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.continuation_challenge.languagePatterns
  };
}

export function generateOperationContrastPaeckchen(num1: number, num2: number): GeneratedPaeckchen {
  // Always use consistent ordering: larger first for clarity
  const larger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);
  
  const addResult = larger + smaller;
  const subResult = larger - smaller;

  return {
    title: 'Addition oder Subtraktion?',
    instructions: 'Vergleiche dieselben Zahlen: Was passiert bei + und was bei -?',
    problems: [
      `${larger} + ${smaller} = ___`,
      `${larger} - ${smaller} = ___`,
      `Welches Ergebnis ist größer?`,
      `Bei + wird ${larger} ___ (größer/kleiner)`,
      `Bei - wird ${larger} ___ (größer/kleiner)`
    ],
    patternHint: `${larger} + ${smaller} = ${addResult}, aber ${larger} - ${smaller} = ${subResult}`,
    visualizationInstructions: `Zeige mit Plättchen: Bei ${larger} + ${smaller} legst du ${smaller} dazu (→). Bei ${larger} - ${smaller} nimmst du ${smaller} weg (←).`,
    reflectionQuestions: [
      'Warum sind die Ergebnisse unterschiedlich?',
      'Wann wird eine Zahl größer?',
      'Wann wird eine Zahl kleiner?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.operation_contrast.languagePatterns
  };
}

// Hilfsfunktion: Passenden Päckchen-Typ für Fehler finden
export function selectPaeckchenTypeForError(errorType: string): PaeckchenType[] {
  const mapping: Record<string, PaeckchenType[]> = {
    'zehnuebergang_addition': ['crossing_tens', 'constant_sum', 'decomposition_steps'],
    'zehnuebergang_subtraction': ['opposing_change', 'decomposition_steps'],
    'complementary_pairs': ['constant_sum', 'exchange_tasks'],
    'calculation_facts': ['same_direction', 'exchange_tasks'],
    'subtraction_borrowing': ['opposing_change', 'decomposition_steps'],
    'number_reversal': ['number_reversal_demo', 'inverse_tasks'],
    'digit_reversal': ['digit_detective', 'pattern_analysis'],
    'operation_confusion': ['operation_contrast', 'inverse_tasks'],
    'pattern_break': ['error_research', 'continuation_challenge']
  };

  return mapping[errorType] || ['same_direction'];
}
