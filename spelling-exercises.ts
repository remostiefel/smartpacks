import type { SpellingError } from "@shared/schema";
import type { ErrorStrategy, ErrorSubtype, ClassifiedSpellingError } from "./spelling-pedagogy";
import { 
  SPELLING_WORDLISTS, 
  SPELLING_EXERCISE_TEMPLATES,
  getExerciseTypesForSubtype,
  getWordlistForError,
  type SpellingExerciseType
} from "./spelling-wordlists";

/**
 * Rechtschreib-Übungsgenerator analog zum Mathe-Päckchen-Generator
 * Erstellt personalisierte Arbeitsblatt-Übungen basierend auf Fehleranalyse
 */

export interface GeneratedSpellingExercise {
  title: string;
  exerciseType: SpellingExerciseType;
  instructions: string;
  tasks: SpellingTask[];
  difficulty: 'easy' | 'medium' | 'hard';
  didacticGoal: string;
  isDazFriendly: boolean;
  hints?: string[];
  rules?: string[];
}

export interface SpellingTask {
  taskNumber: number;
  content: string;
  solution?: string;
  explanation?: string;
}

export interface SpellingWorksheetPlan {
  studentName: string;
  errorFocus: {
    category: ErrorStrategy;
    subtype: ErrorSubtype;
    errorCount: number;
  };
  exercises: GeneratedSpellingExercise[];
  pedagogicalNotes: string[];
  isDazStudent: boolean;
}

/**
 * Hauptfunktion: Generiert Übungen basierend auf klassifizierten Fehlern
 */
export function generateSpellingExercises(
  classifiedErrors: ClassifiedSpellingError[],
  isDazStudent: boolean = false,
  exerciseCount: number = 3
): GeneratedSpellingExercise[] {
  const exercises: GeneratedSpellingExercise[] = [];
  
  // Für jede Fehlerkategorie passende Übungen generieren
  for (const errorGroup of classifiedErrors) {
    const wordlist = getWordlistForError(errorGroup.category, errorGroup.subtype);
    if (!wordlist) continue;
    
    // Passende Übungstypen für diesen Fehlertyp finden
    const exerciseTypes = getExerciseTypesForSubtype(errorGroup.subtype);
    
    // DaZ-Filter: Nur DaZ-freundliche Übungen bei DaZ-Schülern
    const availableTypes = isDazStudent 
      ? exerciseTypes.filter(type => SPELLING_EXERCISE_TEMPLATES[type].isDazFriendly)
      : exerciseTypes;
    
    // Top 2-3 Übungstypen auswählen
    const selectedTypes = availableTypes.slice(0, Math.min(exerciseCount, availableTypes.length));
    
    for (const type of selectedTypes) {
      const exercise = generateExerciseByType(
        type,
        errorGroup,
        wordlist.targetWords,
        wordlist.commonMistakes || [],
        wordlist.wordFamilies,
        wordlist.rules,
        isDazStudent
      );
      
      if (exercise) {
        exercises.push(exercise);
      }
    }
  }
  
  return exercises;
}

/**
 * Generiert eine spezifische Übung basierend auf dem Typ
 */
function generateExerciseByType(
  type: SpellingExerciseType,
  errorGroup: ClassifiedSpellingError,
  targetWords: string[],
  commonMistakes: string[],
  wordFamilies?: string[][],
  rules?: string[],
  isDazStudent: boolean = false
): GeneratedSpellingExercise | null {
  const template = SPELLING_EXERCISE_TEMPLATES[type];
  
  switch (type) {
    case 'lueckentext':
      return generateLueckentext(errorGroup, targetWords, template, isDazStudent);
    
    case 'wortfamilien':
      return generateWortfamilien(errorGroup, targetWords, wordFamilies, template);
    
    case 'sortieraufgabe':
      return generateSortieraufgabe(errorGroup, targetWords, template, rules);
    
    case 'verlängerungstrick':
      return generateVerlaengerungstrick(errorGroup, targetWords, wordFamilies, template);
    
    case 'fehlerdetektiv':
      return generateFehlerdetektiv(errorGroup, targetWords, commonMistakes, template);
    
    case 'artikelprobe':
      return generateArtikelprobe(errorGroup, targetWords, template);
    
    case 'silbenschwingen':
      return generateSilbenschwingen(errorGroup, targetWords, template, isDazStudent);
    
    case 'diktat_vorbereitung':
      return generateDiktatVorbereitung(errorGroup, targetWords, template);
    
    case 'zusammensetzung':
      return generateZusammensetzung(errorGroup, targetWords, wordFamilies, template);
    
    case 'regelentdeckung':
      return generateRegelentdeckung(errorGroup, targetWords, template, rules);
    
    default:
      return null;
  }
}

/**
 * Lückentext-Übungen
 */
function generateLueckentext(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  template: any,
  isDazStudent: boolean
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  const selectedWords = words.slice(0, 10);
  
  selectedWords.forEach((word, index) => {
    let blanked = '';
    
    // Je nach Fehlertyp andere Lücken
    switch (errorGroup.subtype) {
      case 'vokal_auslassung':
        // Vokale als Lücken
        blanked = word.split('').map(char => 
          ['a','e','i','o','u','ä','ö','ü'].includes(char.toLowerCase()) ? '_' : char
        ).join('');
        break;
      
      case 'dehnung':
        // h oder ie als Lücke
        if (word.includes('h')) {
          blanked = word.replace(/h/g, '_');
        } else if (word.toLowerCase().includes('ie')) {
          blanked = word.replace(/ie/gi, '__');
        } else {
          blanked = word.split('').map((c, i) => i % 3 === 0 ? '_' : c).join('');
        }
        break;
      
      case 'schaerfung':
        // Doppelkonsonanten als Lücke
        blanked = word.replace(/([bcdfghjklmnpqrstvwxyz])\1/gi, '_$1');
        break;
      
      default:
        // Jeder dritte Buchstabe
        blanked = word.split('').map((c, i) => i % 3 === 0 ? '_' : c).join('');
    }
    
    tasks.push({
      taskNumber: index + 1,
      content: `${blanked} → ________________`,
      solution: word,
      explanation: isDazStudent ? `Lösung: ${word}` : undefined
    });
  });
  
  return {
    title: template.name,
    exerciseType: 'lueckentext',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: template.isDazFriendly,
    hints: isDazStudent ? ['Spreche das Wort laut und deutlich aus', 'Schwinge die Silben mit'] : undefined
  };
}

/**
 * Wortfamilien-Übungen
 */
function generateWortfamilien(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  wordFamilies?: string[][],
  template?: any
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  
  if (wordFamilies && wordFamilies.length > 0) {
    // Verwende vorgegebene Wortfamilien
    wordFamilies.slice(0, 6).forEach((family, index) => {
      const baseWord = family[0];
      const relatedWords = family.slice(1).join(', ');
      
      tasks.push({
        taskNumber: index + 1,
        content: `${baseWord} → ${relatedWords}`,
        explanation: `Markiere den gemeinsamen Wortstamm in allen Wörtern!`
      });
    });
  } else {
    // Erstelle einfache Wortfamilien-Aufgaben
    words.slice(0, 8).forEach((word, index) => {
      tasks.push({
        taskNumber: index + 1,
        content: `${word} → Finde 2-3 verwandte Wörter: ________________`,
        explanation: 'Denke an: Mehrzahl, Verkleinerung, verwandte Verben/Adjektive'
      });
    });
  }
  
  return {
    title: template?.name || 'Wortfamilien',
    exerciseType: 'wortfamilien',
    instructions: template?.instructions || 'Bilde Wortfamilien und markiere den Wortstamm',
    tasks,
    difficulty: template?.difficulty || 'medium',
    didacticGoal: template?.didacticGoal || 'Morphematisches Prinzip verstehen',
    isDazFriendly: false
  };
}

/**
 * Sortieraufgaben
 */
function generateSortieraufgabe(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  template: any,
  rules?: string[]
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  const selectedWords = words.slice(0, 12);
  
  let categories: string[] = [];
  let sortingCriteria = '';
  
  switch (errorGroup.subtype) {
    case 'dehnung':
      categories = ['mit Dehnungs-h', 'mit ie', 'ohne Längenzeichen'];
      sortingCriteria = 'nach Dehnungszeichen';
      break;
    
    case 'schaerfung':
      categories = ['Doppelkonsonant', 'ck', 'tz', 'einfacher Konsonant'];
      sortingCriteria = 'nach Schärfungszeichen';
      break;
    
    case 'gross_kleinschreibung':
      categories = ['Nomen (groß)', 'Verben (klein)', 'Adjektive (klein)'];
      sortingCriteria = 'nach Wortart und Großschreibung';
      break;
    
    default:
      categories = ['Kategorie A', 'Kategorie B'];
      sortingCriteria = 'nach Rechtschreibmuster';
  }
  
  tasks.push({
    taskNumber: 1,
    content: `Sortiere diese Wörter ${sortingCriteria}:\n${selectedWords.join(', ')}`,
    explanation: `Kategorien: ${categories.join(' | ')}`
  });
  
  categories.forEach((category, index) => {
    tasks.push({
      taskNumber: index + 2,
      content: `${category}: ________________`,
      explanation: 'Trage die passenden Wörter ein'
    });
  });
  
  return {
    title: template.name,
    exerciseType: 'sortieraufgabe',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: template.isDazFriendly,
    rules: rules
  };
}

/**
 * Verlängerungstrick (Morphematische Strategie)
 */
function generateVerlaengerungstrick(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  wordFamilies?: string[][],
  template?: any
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  
  words.slice(0, 10).forEach((word, index) => {
    tasks.push({
      taskNumber: index + 1,
      content: `${word} → verlängern: ________________`,
      explanation: 'Finde die Mehrzahl oder ein verwandtes Wort!',
      solution: wordFamilies?.[index]?.[1] // Falls vorhanden
    });
  });
  
  return {
    title: template?.name || 'Verlängerungs-Trick',
    exerciseType: 'verlängerungstrick',
    instructions: 'Verlängere das Wort, um den richtigen Buchstaben zu finden (d/t, g/k, b/p)',
    tasks,
    difficulty: 'medium',
    didacticGoal: 'Morphematische Strategie - Ableitung nutzen',
    isDazFriendly: true,
    hints: ['Beispiel: Hund → Hunde (d nicht t!)']
  };
}

/**
 * Fehler-Detektiv
 */
function generateFehlerdetektiv(
  errorGroup: ClassifiedSpellingError,
  correctWords: string[],
  commonMistakes: string[],
  template: any
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  
  // Mische richtige und falsche Wörter
  const mixedWords: Array<{word: string, isCorrect: boolean}> = [];
  
  correctWords.slice(0, 5).forEach(word => {
    mixedWords.push({ word, isCorrect: true });
  });
  
  commonMistakes.slice(0, 5).forEach(word => {
    mixedWords.push({ word, isCorrect: false });
  });
  
  // Shuffle
  mixedWords.sort(() => Math.random() - 0.5);
  
  mixedWords.forEach((item, index) => {
    tasks.push({
      taskNumber: index + 1,
      content: `${item.word}  ☐ richtig  ☐ falsch`,
      solution: item.isCorrect ? 'richtig' : 'falsch',
      explanation: !item.isCorrect ? 'Korrektur: ________________' : undefined
    });
  });
  
  return {
    title: template.name,
    exerciseType: 'fehlerdetektiv',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: false
  };
}

/**
 * Artikel-Probe (Nomen erkennen)
 */
function generateArtikelprobe(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  template: any
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  
  words.slice(0, 10).forEach((word, index) => {
    tasks.push({
      taskNumber: index + 1,
      content: `_____ ${word.toLowerCase()}  → Ist es ein Nomen?  ☐ ja  ☐ nein`,
      explanation: 'Wenn ja: Schreibe es groß! Welcher Artikel passt?',
      solution: word // Großgeschrieben
    });
  });
  
  return {
    title: template.name,
    exerciseType: 'artikelprobe',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: true,
    hints: ['Kann ich der, die oder das davor setzen? → Es ist ein Nomen!']
  };
}

/**
 * Silben schwingen
 */
function generateSilbenschwingen(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  template: any,
  isDazStudent: boolean
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  
  words.slice(0, 8).forEach((word, index) => {
    // Silben markieren (vereinfacht)
    const syllables = word.match(/.{1,3}/g)?.join('·') || word;
    
    tasks.push({
      taskNumber: index + 1,
      content: `${syllables} → ________________`,
      explanation: 'Schwinge die Silben mit und schreibe das Wort auf!',
      solution: word
    });
  });
  
  return {
    title: template.name,
    exerciseType: 'silbenschwingen',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: true,
    hints: isDazStudent 
      ? ['Klatsche bei jeder Silbe in die Hände', 'Jede Silbe braucht einen Vokal (a, e, i, o, u)']
      : undefined
  };
}

/**
 * Diktat-Vorbereitung
 */
function generateDiktatVorbereitung(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  template: any
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  const selectedWords = words.slice(0, 10);
  
  tasks.push({
    taskNumber: 1,
    content: 'Schritt 1: Lese jedes Wort genau durch',
    explanation: selectedWords.join(' • ')
  });
  
  tasks.push({
    taskNumber: 2,
    content: 'Schritt 2: Markiere die Stellen, die du dir merken musst',
    explanation: '(z.B. Doppelkonsonanten, Dehnungs-h, besondere Buchstaben)'
  });
  
  tasks.push({
    taskNumber: 3,
    content: 'Schritt 3: Decke die Wörter ab und schreibe sie auswendig auf',
    explanation: '________________'
  });
  
  tasks.push({
    taskNumber: 4,
    content: 'Schritt 4: Vergleiche mit der Vorlage',
    explanation: 'Hast du alle richtig? Übe die schwierigen Wörter noch einmal!'
  });
  
  return {
    title: template.name,
    exerciseType: 'diktat_vorbereitung',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: true,
    hints: ['Methode: Lesen → Markieren → Abdecken → Schreiben → Vergleichen']
  };
}

/**
 * Zusammensetzungen (Komposita)
 */
function generateZusammensetzung(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  wordFamilies?: string[][],
  template?: any
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  
  if (wordFamilies && wordFamilies.length > 0) {
    wordFamilies.slice(0, 8).forEach((family, index) => {
      const parts = family.slice(0, 2);
      const compound = family[2] || parts.join('');
      
      tasks.push({
        taskNumber: index + 1,
        content: `${parts[0]} + ${parts[1]} = ________________`,
        solution: compound,
        explanation: `Welcher Artikel? _____ ${compound}`
      });
    });
  } else {
    // Einfache Komposita-Bildung
    const simplePairs = [
      ['Haus', 'Tür', 'Haustür'],
      ['Schule', 'Hof', 'Schulhof'],
      ['Fuß', 'Ball', 'Fußball']
    ];
    
    simplePairs.forEach((pair, index) => {
      tasks.push({
        taskNumber: index + 1,
        content: `${pair[0]} + ${pair[1]} = ________________`,
        solution: pair[2]
      });
    });
  }
  
  return {
    title: template?.name || 'Zusammensetzungen',
    exerciseType: 'zusammensetzung',
    instructions: 'Bilde zusammengesetzte Nomen. Achte auf die Schreibweise!',
    tasks,
    difficulty: 'medium',
    didacticGoal: 'Komposita-Bildung verstehen',
    isDazFriendly: false,
    hints: ['Das letzte Wort bestimmt den Artikel']
  };
}

/**
 * Regelentdeckung - Schüler entdecken selbst Rechtschreibmuster
 */
function generateRegelentdeckung(
  errorGroup: ClassifiedSpellingError,
  words: string[],
  template: any,
  rules?: string[]
): GeneratedSpellingExercise {
  const tasks: SpellingTask[] = [];
  const selectedWords = words.slice(0, 12);
  
  // Aufgabe 1: Wörter untersuchen
  tasks.push({
    taskNumber: 1,
    content: 'Untersuche diese Wörter genau:',
    explanation: selectedWords.join(' • ')
  });
  
  // Aufgabe 2: Gemeinsamkeiten finden
  tasks.push({
    taskNumber: 2,
    content: 'Was haben alle diese Wörter gemeinsam?',
    explanation: 'Achte auf: Buchstaben, Silben, Endungen, Schreibweise...',
    solution: rules?.[0] // Erste Regel als Lösung
  });
  
  // Aufgabe 3: Regel formulieren
  tasks.push({
    taskNumber: 3,
    content: 'Formuliere die Rechtschreibregel mit eigenen Worten:',
    explanation: '________________',
    solution: rules?.join(' / ')
  });
  
  // Aufgabe 4: Weitere Beispiele
  tasks.push({
    taskNumber: 4,
    content: 'Finde 3 weitere Wörter, die dieser Regel folgen:',
    explanation: '1. ____________  2. ____________  3. ____________'
  });
  
  return {
    title: template.name,
    exerciseType: 'regelentdeckung',
    instructions: template.instructions,
    tasks,
    difficulty: template.difficulty,
    didacticGoal: template.didacticGoal,
    isDazFriendly: false,
    rules: rules,
    hints: ['Vergleiche die Wörter: Wo ist die Schreibweise ähnlich?']
  };
}

/**
 * Erstellt einen vollständigen Arbeitsblatt-Plan für einen Schüler
 */
export function createSpellingWorksheetPlan(
  studentName: string,
  classifiedErrors: ClassifiedSpellingError[],
  isDazStudent: boolean = false
): SpellingWorksheetPlan {
  // Finde den häufigsten Fehlertyp
  const mainError = classifiedErrors.reduce((prev, current) => 
    current.errors.length > prev.errors.length ? current : prev
  );
  
  // Generiere Übungen
  const exercises = generateSpellingExercises(classifiedErrors, isDazStudent, 3);
  
  // Pädagogische Hinweise
  const pedagogicalNotes = [
    ...mainError.pedagogicalHints,
    `Schwerpunkt: ${mainError.description}`,
    `Anzahl Fehler: ${mainError.errors.length}`
  ];
  
  if (isDazStudent) {
    pedagogicalNotes.push('DaZ-Hinweis: Korrektives Feedback durch Modellierung, nicht durch Fehlerkorrektur');
  }
  
  return {
    studentName,
    errorFocus: {
      category: mainError.category,
      subtype: mainError.subtype,
      errorCount: mainError.errors.length
    },
    exercises,
    pedagogicalNotes,
    isDazStudent
  };
}
