import { classifyErrors, type ErrorCategory } from './math-pedagogy';
import { 
  selectPaeckchenTypeForError, 
  PAECKCHEN_TEMPLATES,
  generateConstantSumPaeckchen,
  generateErrorResearchPaeckchen,
  generateDecompositionPaeckchen,
  generatePatternAnalysisPaeckchen,
  generateInverseTasksPaeckchen,
  generateExchangeTasksPaeckchen,
  generateDigitDetectivePaeckchen,
  generateContinuationChallengePaeckchen,
  generateOperationContrastPaeckchen,
  type PaeckchenType,
  type GeneratedPaeckchen,
  type PaeckchenTemplate
} from './paeckchen-library';

export interface DemonstrationInput {
  task: string;          // z.B. "8 + 5"
  userResult: number;    // z.B. 12 (falsch)
  correctResult: number; // z.B. 13
}

export interface ErrorAnalysis {
  errorType: string;
  errorDescription: string;
  didacticExplanation: string;
  commonCause: string;
  learningGap: string;
}

export interface PaeckchenRecommendation {
  paeckchenType: PaeckchenType;
  template: PaeckchenTemplate;
  example: GeneratedPaeckchen;
  whyThisHelps: string;
}

export interface DemonstrationResult {
  input: DemonstrationInput;
  errorAnalysis: ErrorAnalysis;
  recommendedPaeckchen: PaeckchenRecommendation[];
  visualizationSuggestions: string[];
  teacherGuidance: string;
}

// Hilfsfunktion: Einzelnen Fehler klassifizieren
function classifySingleError(num1: number, operator: string, num2: number, userResult: number, correctResult: number): ErrorCategory {
  // Temporäres Error-Objekt für Klassifikation
  const tempError = {
    id: 'temp',
    studentId: 'temp',
    errorText: `${num1} ${operator} ${num2} = ${userResult}`,
    num1,
    num2,
    operation: operator === '+' ? 'addition' : 'subtraction',
    incorrectAnswer: userResult,
    correctAnswer: correctResult,
    errorType: null,
    createdAt: new Date()
  };

  const classified = classifyErrors([tempError]);
  
  if (classified.length > 0) {
    return classified[0].category;
  }

  // Fallback-Klassifikation
  if (operator === '+' && num1 + num2 > 10) return 'zehnuebergang_addition';
  if (operator === '-' && num1 > 10 && (num1 % 10) < num2) return 'zehnuebergang_subtraction';
  return 'calculation_facts';
}

// Hilfsfunktion: Task-String robust parsen
function parseTask(task: string): { num1: number; operator: string; num2: number } | null {
  // Entferne alle Leerzeichen und parse verschiedene Formate
  const cleaned = task.trim().replace(/\s+/g, '');
  
  // Versuche verschiedene Operatoren zu finden
  let operator = '';
  let splitIndex = -1;
  
  if (cleaned.includes('+')) {
    operator = '+';
    splitIndex = cleaned.indexOf('+');
  } else if (cleaned.includes('-')) {
    operator = '-';
    splitIndex = cleaned.indexOf('-');
  }
  
  if (splitIndex === -1 || operator === '') {
    return null;
  }
  
  const num1 = parseInt(cleaned.substring(0, splitIndex));
  const num2 = parseInt(cleaned.substring(splitIndex + 1));
  
  if (isNaN(num1) || isNaN(num2)) {
    return null;
  }
  
  return { num1, operator, num2 };
}

// Fehler-Analyse mit didaktischen Erklärungen
export function analyzeMathError(input: DemonstrationInput): ErrorAnalysis {
  const { task, userResult, correctResult } = input;
  
  const parsed = parseTask(task);
  if (!parsed) {
    return {
      errorType: 'unknown',
      errorDescription: 'Aufgabe konnte nicht erkannt werden',
      didacticExplanation: 'Bitte Aufgabe im Format "8+7" oder "13-5" eingeben.',
      commonCause: 'Ungültiges Format',
      learningGap: 'N/A'
    };
  }
  
  const { num1, operator, num2 } = parsed;
  const errorType = classifySingleError(num1, operator, num2, userResult, correctResult);

  const explanations: Record<string, Omit<ErrorAnalysis, 'errorType'>> = {
    zehnuebergang_addition: {
      errorDescription: 'Fehler beim Zehnerübergang (Addition)',
      didacticExplanation: 'Das Kind hat Schwierigkeiten, die 10 als Hilfszahl zu nutzen. Es rechnet möglicherweise zählend und verliert dabei den Überblick.',
      commonCause: 'Fehlende Zerlegungsstrategien, kein inneres Bild vom Zehnerübergang',
      learningGap: 'Das Kind muss verstehen, dass man Zahlen geschickt zerlegen kann (z.B. 8+5 = 8+2+3)'
    },
    zehnuebergang_subtraction: {
      errorDescription: 'Fehler beim Zehnerübergang (Subtraktion)',
      didacticExplanation: 'Bei der Subtraktion über den Zehner fehlt die Strategie der Zerlegung. Das Kind rechnet oft fehlerhaft zählend zurück.',
      commonCause: 'Keine tragfähige Strategie für Zehnerunterschreitung',
      learningGap: 'Das Kind muss lernen, den Subtrahenden zu zerlegen (z.B. 13-9: erst -3 zur 10, dann -6)'
    },
    complementary_pairs: {
      errorDescription: 'Partnerzahlen nicht erkannt',
      didacticExplanation: 'Das Kind kennt die Partnerzahlen zu 10 oder 20 nicht automatisiert.',
      commonCause: 'Fehlende Automatisierung der Ergänzungsaufgaben',
      learningGap: 'Partnerzahlen müssen verinnerlicht werden (3+7=10, 4+6=10, etc.)'
    },
    calculation_facts: {
      errorDescription: 'Lücke bei Rechenfertigkeiten',
      didacticExplanation: 'Grundlegende Rechenfertigkeiten sind noch nicht gefestigt.',
      commonCause: 'Zählendes Rechnen statt strategisches Vorgehen',
      learningGap: 'Zahlbeziehungen und Muster müssen erkannt werden'
    },
    subtraction_borrowing: {
      errorDescription: 'Allgemeine Schwierigkeiten bei Subtraktion',
      didacticExplanation: 'Das Operationsverständnis für Subtraktion ist noch nicht gefestigt.',
      commonCause: 'Subtraktion wird nicht als Umkehrung der Addition verstanden',
      learningGap: 'Beziehung zwischen Addition und Subtraktion muss verstanden werden'
    },
    number_reversal: {
      errorDescription: 'Zahlenreihenfolge vertauscht',
      didacticExplanation: 'Das Kind vertauscht Minuend und Subtrahend, weil es die Bedeutung der Reihenfolge nicht versteht.',
      commonCause: 'Fehlendes Verständnis, dass bei Subtraktion die Reihenfolge wichtig ist',
      learningGap: 'Kind muss verstehen: 13-5 ≠ 5-13'
    },
    digit_reversal: {
      errorDescription: 'Ziffern vertauscht (Zahlendreher)',
      didacticExplanation: 'Das Kind verwechselt die Reihenfolge der Ziffern beim Lesen oder Schreiben (z.B. 12 statt 21).',
      commonCause: 'Unsicheres Stellenwertverständnis, visuelle oder räumliche Orientierungsschwierigkeiten',
      learningGap: 'Stellenwertverständnis: Zehner links, Einer rechts - Reihenfolge ist wichtig!'
    },
    operation_confusion: {
      errorDescription: 'Addition und Subtraktion verwechselt',
      didacticExplanation: 'Das Kind verwendet die falsche Rechenoperation - rechnet plus statt minus (oder umgekehrt).',
      commonCause: 'Operationsverständnis nicht gefestigt, Zeichen werden übersehen',
      learningGap: 'Unterschied zwischen + (wird größer) und - (wird kleiner) verstehen'
    },
    pattern_break: {
      errorDescription: 'Muster nicht erkannt',
      didacticExplanation: 'Das Kind erkennt kein Muster in Aufgabenreihen und rechnet willkürlich.',
      commonCause: 'Fehlende Mustererkennung, kein strategisches Vorgehen',
      learningGap: 'Rechnen mit System: Muster entdecken und nutzen'
    },
    unknown: {
      errorDescription: 'Nicht klassifizierter Fehler',
      didacticExplanation: 'Der Fehler folgt keinem typischen Muster.',
      commonCause: 'Möglicherweise Flüchtigkeitsfehler oder individuelles Missverständnis',
      learningGap: 'Genauere Beobachtung nötig'
    }
  };

  return {
    errorType,
    ...(explanations[errorType] || explanations.unknown)
  };
}

// Päckchen-Empfehlungen mit Begründungen
export function generatePaeckchenRecommendations(
  errorAnalysis: ErrorAnalysis, 
  input: DemonstrationInput
): PaeckchenRecommendation[] {
  const { task } = input;
  
  const parsed = parseTask(task);
  if (!parsed) {
    return []; // Keine Empfehlungen bei ungültigem Task
  }
  
  const { num1, operator, num2 } = parsed;
  
  // Für Addition: verwende Summe, für Subtraktion: verwende Minuend
  const isAddition = operator === '+';
  const targetNumber = isAddition ? num1 + num2 : num1; // Summe oder Minuend
  const sum = num1 + num2; // Nur für Addition relevant

  const paeckchenTypes = selectPaeckchenTypeForError(errorAnalysis.errorType);
  const recommendations: PaeckchenRecommendation[] = [];

  for (const type of paeckchenTypes) {
    const template = PAECKCHEN_TEMPLATES[type];
    let example: GeneratedPaeckchen;
    let whyThisHelps = '';

    switch (type) {
      case 'constant_sum':
        example = generateConstantSumPaeckchen(targetNumber, Math.max(1, num1 - 2), operator as '+' | '-');
        if (isAddition) {
          whyThisHelps = `Dieses Päckchen zeigt, dass die Summe ${targetNumber} auf verschiedene Arten erreicht werden kann. Das Kind erkennt: Wenn ich einen Summanden vergrößere, muss ich den anderen verkleinern - eine wichtige Einsicht für flexible Zerlegungsstrategien beim Zehnerübergang.`;
        } else {
          whyThisHelps = `Dieses Päckchen zeigt verschiedene Wege, von ${targetNumber} abzuziehen. Das Kind erkennt Muster und entwickelt Flexibilität im Subtrahieren.`;
        }
        break;

      case 'crossing_tens':
        example = generateConstantSumPaeckchen(targetNumber, 8, operator as '+' | '-');
        example.title = isAddition ? 'Über den Zehner springen' : 'Vom Zehner zurück';
        whyThisHelps = isAddition 
          ? `Das Päckchen übt systematisch den Zehnerübergang. Die erste Zahl bleibt bei 8 (oder 9), die zweite Zahl wächst - so muss das Kind immer über die 10 springen. Das schafft Routine und Sicherheit.`
          : `Das Päckchen übt systematisch das Zurückrechnen vom Zehner. Der Subtrahend wächst - das Kind muss sicher über die 10 zurückrechnen.`;
        break;

      case 'decomposition_steps':
        if (isAddition) {
          example = generateDecompositionPaeckchen(targetNumber, num2);
          whyThisHelps = `Die Aufgabe wird in kleine, überschaubare Schritte zerlegt. Das Kind lernt: Zuerst zur 10 rechnen, dann den Rest. Diese Strategie ist tragfähig für alle Zehnerübergänge.`;
        } else {
          example = generateDecompositionPaeckchen(targetNumber, num2);
          whyThisHelps = `Die Subtraktion wird schrittweise durchgeführt. Das Kind lernt: Erst zur 10 zurück, dann den Rest. Diese Strategie hilft beim Zehnerunterschreiten.`;
        }
        break;

      case 'opposing_change':
        // Für Subtraktion: Verwende den tatsächlichen Minuend (num1), nicht sum!
        const startMinuend = isAddition ? Math.max(11, sum) : num1;
        const problems = [];
        for (let i = 0; i < 5; i++) {
          problems.push(`${startMinuend} - ${Math.max(1, num2 - 2 + i)} = ___`);
        }
        example = {
          title: 'Gegensinnige Veränderung bei Subtraktion',
          instructions: 'Beobachte: Was passiert mit dem Ergebnis?',
          problems,
          patternHint: '= (Minuend), ↑+1 (Subtrahend), ↓-1 (Ergebnis)',
          reflectionQuestions: ['Was passiert mit dem Ergebnis, wenn der Subtrahend größer wird?'],
          sentenceStems: template.languagePatterns
        };
        whyThisHelps = `Das Kind sieht: Je mehr ich wegnehme (größerer Subtrahend), desto weniger bleibt übrig (kleineres Ergebnis). Dieser Zusammenhang ist fundamental für das Subtraktionsverständnis.`;
        break;

      case 'inverse_tasks':
        example = generateInverseTasksPaeckchen(num1, num2);
        whyThisHelps = `Dieses Päckchen zeigt die Umkehrbeziehung: Addition und Subtraktion gehören zusammen. Wenn ${num1} + ${num2} = ${sum}, dann ist ${sum} - ${num1} = ${num2}. Das stärkt das Operationsverständnis.`;
        break;

      case 'exchange_tasks':
        example = generateExchangeTasksPaeckchen([[num1, num2], [3, 7], [4, 6]]);
        whyThisHelps = `Das Tauschgesetz zu verstehen ist wichtig: ${num1} + ${num2} = ${num2} + ${num1}. Das Kind lernt: Bei Addition ist die Reihenfolge egal - ich kann die einfachere Aufgabe wählen!`;
        break;

      case 'error_research':
        const baseProblems = [`${num1} + ${num2} = ___`];
        for (let i = 1; i < 4; i++) {
          baseProblems.push(`${num1 + i} + ${Math.max(0, num2 - i)} = ___`);
        }
        example = generateErrorResearchPaeckchen(baseProblems, sum);
        whyThisHelps = `Fehler zu finden schärft den Blick fürs Muster. Das Kind muss genau hinschauen und die Regel verstehen, bevor es den Fehler erkennen kann. Das vertieft das Verständnis.`;
        break;

      case 'pattern_analysis':
        example = generatePatternAnalysisPaeckchen([
          `${num1} + ${num2} = ___`,
          `${num1 + 1} + ${Math.max(0, num2 - 1)} = ___`,
          `${num1 + 2} + ${Math.max(0, num2 - 2)} = ___`
        ], true);
        whyThisHelps = `Das Kind wird zum Forscher: Ist das ein schönes Päckchen? Es muss das Muster erkennen und begründen - das fördert mathematisches Argumentieren.`;
        break;

      case 'number_reversal_demo':
        example = {
          title: 'Achtung: Reihenfolge wichtig!',
          instructions: 'Bei Subtraktion ist die Reihenfolge entscheidend!',
          problems: [
            `${sum} - ${num1} = ___`,
            `${num1} - ${sum} = ??? (geht nicht im ZR 20!)`,
            `${sum} - ${num2} = ___`,
            `${num2} - ${sum} = ??? (geht nicht!)`
          ],
          reflectionQuestions: [
            'Warum kann man die Zahlen nicht tauschen?',
            'Was ist bei Addition anders?'
          ],
          sentenceStems: template.languagePatterns
        };
        whyThisHelps = `Das Kind lernt: Bei Subtraktion ist die erste Zahl (Minuend) immer größer. Man kann nicht einfach tauschen wie bei Addition. Das verhindert Zahlendreher.`;
        break;

      case 'digit_detective':
        example = generateDigitDetectivePaeckchen(input.correctResult);
        whyThisHelps = `Dieses Detektivpäckchen schärft den Blick für Stellenwerte. Das Kind lernt systematisch: Zehner links, Einer rechts. Die bewusste Unterscheidung verhindert Zahlendreher wie ${input.correctResult} ↔ ${input.userResult}.`;
        break;

      case 'continuation_challenge':
        const challengeProblems = [`${num1} + ${num2} = ___`];
        for (let i = 1; i < 4; i++) {
          challengeProblems.push(`${num1 + i} + ${num2 + i} = ___`);
        }
        example = generateContinuationChallengePaeckchen(challengeProblems);
        whyThisHelps = `Hier wird das Kind zum Muster-Erfinder! Statt nur nachzurechnen, muss es selbst denken: "Wie geht das Muster weiter?" Das fördert aktives, strategisches Denken und mathematische Kreativität.`;
        break;

      case 'operation_contrast':
        example = generateOperationContrastPaeckchen(num1, num2);
        whyThisHelps = `Der direkte Vergleich zeigt: ${num1} + ${num2} macht größer, ${num1} - ${num2} macht kleiner. Durch das Gegenüberstellen mit denselben Zahlen wird der Unterschied zwischen + und - kristallklar.`;
        break;

      default:
        example = generateConstantSumPaeckchen(sum, num1);
        whyThisHelps = 'Grundlegendes Päckchen zur Mustererkennung.';
    }

    recommendations.push({
      paeckchenType: type,
      template,
      example,
      whyThisHelps
    });
  }

  return recommendations;
}

// Visualisierungs-Vorschläge basierend auf Fehlertyp
export function getVisualizationSuggestions(errorType: string): string[] {
  const suggestions: Record<string, string[]> = {
    zehnuebergang_addition: [
      '🎨 Plättchen-Darstellung: Zeige mit 2 Farben, wie man zur 10 ergänzt',
      '➡️ Pfeile: Markiere die Zerlegung (z.B. 8+5: 8→10 braucht 2, bleiben 3)',
      '🔢 Zahlenstrahl: Visualisiere den Sprung über die 10'
    ],
    zehnuebergang_subtraction: [
      '🎨 Plättchen wegnehmen: Erst die Einer, dann vom Zehner',
      '➡️ Zweistufige Pfeile: 1. Schritt zur 10, 2. Schritt weiter',
      '📊 Zerlegungsbaum: Zeige, wie der Subtrahend zerlegt wird'
    ],
    complementary_pairs: [
      '🎨 Plättchen in 2 Farben: 3+7=10 sichtbar machen',
      '🔄 Tausch-Visualisierung: 3+7 und 7+3 mit Plättchen',
      '🎯 Zielscheibe zur 10: Alle Wege zur 10 zeigen'
    ],
    number_reversal: [
      '⚠️ Minuend-Subtrahend markieren: Zeige, welche Zahl größer sein muss',
      '🔀 Vergleich: Addition (tauschen OK) vs. Subtraktion (nicht tauschen!)',
      '📏 Größenvergleich: Visualisiere, dass Minuend > Subtrahend'
    ],
    digit_reversal: [
      '🎯 Stellenwerttafel nutzen: Zehner links (blau), Einer rechts (rot)',
      '🔢 Zehnerstangen und Einerwürfel: Zeige 12 vs. 21 mit Material',
      '✏️ Ziffern markieren: Erst Zehner, dann Einer - Leserichtung beachten'
    ],
    operation_confusion: [
      '➕➖ Operationszeichen groß markieren: + macht größer, - macht kleiner',
      '🔄 Plättchen dazulegen (→) vs. wegnehmen (←) zeigen',
      '📊 Direkt vergleichen: Dieselben Zahlen, unterschiedliche Ergebnisse'
    ],
    pattern_break: [
      '🔍 Jede Aufgabe einzeln prüfen und Veränderungen mit Pfeilen markieren',
      '⚡ Regel aufschreiben: Was verändert sich? Was bleibt gleich?',
      '🎯 Fehler einkreisen und korrigieren: Was müsste stattdessen stehen?'
    ]
  };

  return suggestions[errorType] || [
    '🎨 Plättchen nutzen zur Veranschaulichung',
    '➡️ Pfeile für Veränderungen zeichnen',
    '💭 Innere Bilder durch Skizzen aufbauen'
  ];
}

// Hauptfunktion: Vollständige Demonstration
export function demonstratePaeckchenGeneration(input: DemonstrationInput): DemonstrationResult {
  const errorAnalysis = analyzeMathError(input);
  const recommendedPaeckchen = generatePaeckchenRecommendations(errorAnalysis, input);
  const visualizationSuggestions = getVisualizationSuggestions(errorAnalysis.errorType);

  const teacherGuidance = generateTeacherGuidance(errorAnalysis, recommendedPaeckchen);

  return {
    input,
    errorAnalysis,
    recommendedPaeckchen,
    visualizationSuggestions,
    teacherGuidance
  };
}

function generateTeacherGuidance(
  errorAnalysis: ErrorAnalysis, 
  recommendations: PaeckchenRecommendation[]
): string {
  const { errorDescription, learningGap } = errorAnalysis;
  
  let guidance = `📋 **Didaktische Einordnung:**\n`;
  guidance += `Der Fehler zeigt: ${errorDescription}.\n`;
  guidance += `Lernlücke: ${learningGap}\n\n`;
  
  guidance += `🎯 **Empfohlenes Vorgehen:**\n`;
  guidance += `1. Beginnen Sie mit dem ersten Päckchen (${recommendations[0]?.template.name})\n`;
  guidance += `2. Nutzen Sie Plättchen, Pfeile oder Zeichnungen zur Visualisierung\n`;
  guidance += `3. Lassen Sie das Kind das Muster mit eigenen Worten beschreiben\n`;
  guidance += `4. Wichtig: Nicht nur rechnen, sondern begründen lassen!\n\n`;
  
  guidance += `💡 **Differenzierung:**\n`;
  if (recommendations.length > 1) {
    guidance += `- Einfacher Start: ${recommendations[0]?.template.name}\n`;
    guidance += `- Vertiefung: ${recommendations[1]?.template.name}\n`;
    if (recommendations[2]) {
      guidance += `- Herausforderung: ${recommendations[2]?.template.name}\n`;
    }
  }

  return guidance;
}

// Katalog-Funktion: Alle Päckchen-Typen mit Beispielen zeigen
export function getPaeckchenCatalog() {
  const catalog = Object.values(PAECKCHEN_TEMPLATES).map(template => {
    let examplePaeckchen: GeneratedPaeckchen;

    switch (template.type) {
      case 'constant_sum':
        examplePaeckchen = generateConstantSumPaeckchen(13, 5);
        break;
      case 'crossing_tens':
        examplePaeckchen = generateConstantSumPaeckchen(15, 8);
        examplePaeckchen.title = 'Zehnerübergang meistern';
        break;
      case 'decomposition_steps':
        examplePaeckchen = generateDecompositionPaeckchen(13, 9);
        break;
      case 'inverse_tasks':
        examplePaeckchen = generateInverseTasksPaeckchen(8, 5);
        break;
      case 'exchange_tasks':
        examplePaeckchen = generateExchangeTasksPaeckchen([[3, 7], [4, 6], [5, 5]]);
        break;
      case 'error_research':
        examplePaeckchen = generateErrorResearchPaeckchen(['8+5=___', '9+4=___', '10+3=___'], 13);
        break;
      case 'pattern_analysis':
        examplePaeckchen = generatePatternAnalysisPaeckchen(['6+7=13', '7+6=13', '8+5=13'], true);
        break;
      case 'number_reversal_demo':
        examplePaeckchen = {
          title: 'Achtung: Reihenfolge wichtig!',
          instructions: 'Bei Subtraktion ist die Reihenfolge entscheidend!',
          problems: ['15 - 8 = ___', '8 - 15 = ??? (geht nicht!)', '12 - 5 = ___', '5 - 12 = ???'],
          reflectionQuestions: ['Warum kann man bei Subtraktion nicht tauschen?', 'Was ist bei Addition anders?'],
          sentenceStems: template.languagePatterns
        };
        break;
      case 'digit_detective':
        examplePaeckchen = generateDigitDetectivePaeckchen(14);
        break;
      case 'continuation_challenge':
        examplePaeckchen = generateContinuationChallengePaeckchen(['5+3=___', '6+4=___', '7+5=___']);
        break;
      case 'operation_contrast':
        examplePaeckchen = generateOperationContrastPaeckchen(12, 7);
        break;
      default:
        examplePaeckchen = generateConstantSumPaeckchen(10, 3);
    }

    return {
      ...template,
      example: examplePaeckchen
    };
  });

  return catalog;
}
