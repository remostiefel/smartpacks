import type { SpellingError } from "@shared/schema";

/**
 * Rechtschreibfehler-Kategorien basierend auf dem Stufenmodell der Rechtschreibentwicklung
 * (Hamburger Schreibprobe - HSP)
 */

export type ErrorStrategy = 'alphabetic' | 'orthographic' | 'morphematic' | 'grammatical';

export type ErrorSubtype = 
  // Alphabetische Strategie (Lautprinzip)
  | 'vokal_auslassung'           // Skelettschreibweise: FRT statt Fahrrad
  | 'konsonantenhaeufung'        // Bot statt Brot
  | 'stimmhaft_stimmlos'         // Tante statt Kante
  
  // Orthografische Strategie (Regelhaftigkeit)
  | 'dehnung'                    // Stul statt Stuhl, fehlende Markierung langer Vokale
  | 'schaerfung'                 // Somer statt Sommer, fehlende Konsonantenverdopplung
  | 'besondere_grapheme'         // Vater statt Wasser (v/w), ks statt x
  
  // Morphematische Strategie (Stammprinzip)
  | 'auslautverhaertung'         // hunt statt Hund
  | 'vokalische_ableitung'       // leuft statt läuft
  | 'morphemkonstanz'            // -er, -el, -en Endungen falsch
  
  // Grammatische/Wortübergreifende Strategie
  | 'gross_kleinschreibung'      // nomen klein geschrieben
  | 'komposita'                  // Haus Tür statt Haustür
  | 'getrennt_zusammenschreibung'; // zusammen schreiben statt zusammenschreiben

// Note: 'regionale_aussprache' und 'satzbau_syntax' werden in zukünftigen Versionen implementiert
// und erfordern erweiterte NLP/linguistische Datenbanken

export interface ClassifiedSpellingError {
  category: ErrorStrategy;
  subtype: ErrorSubtype;
  description: string;
  errors: SpellingError[];
  targetWords: string[];
  pedagogicalHints: string[];
  exerciseTypes: string[];
}

export interface AnalysisResult {
  category: ErrorStrategy;
  subtype: ErrorSubtype;
  confidence: number; // 0-1
  evidence: string;
  isDazRelevant: boolean;
}

/**
 * Phonem-Graphem-Analyse: Prüft ob ein Fehler lautgetreu ist
 */
function isPhoneticError(incorrect: string, correct: string): boolean {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  // Skelettschreibweise: fehlende Vokale
  const vokale = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
  const incorrectVokale = lower_incorrect.split('').filter(c => vokale.includes(c)).length;
  const correctVokale = lower_correct.split('').filter(c => vokale.includes(c)).length;
  
  if (incorrectVokale < correctVokale) {
    return true; // Skelettschreibweise
  }
  
  return false;
}

/**
 * Analysiert besondere Grapheme (v/f, w/v, ß, qu, x, y)
 */
function analyzeBesondereGrapheme(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  const specialGraphemes = [
    { pattern: 'v', alternatives: ['f', 'w'], name: 'v' },
    { pattern: 'f', alternatives: ['v', 'ph'], name: 'f/v' },
    { pattern: 'ß', alternatives: ['ss', 's'], name: 'ß' },
    { pattern: 'qu', alternatives: ['kw', 'ku'], name: 'qu' },
    { pattern: 'x', alternatives: ['ks', 'cks'], name: 'x' },
    { pattern: 'y', alternatives: ['i', 'ü'], name: 'y' },
  ];
  
  for (const grapheme of specialGraphemes) {
    if (lower_correct.includes(grapheme.pattern)) {
      for (const alt of grapheme.alternatives) {
        if (lower_incorrect.includes(alt) && !lower_incorrect.includes(grapheme.pattern)) {
          return {
            category: 'orthographic',
            subtype: 'besondere_grapheme',
            confidence: 0.85,
            evidence: `Besonderes Graphem "${grapheme.name}": "${incorrect}" statt "${correct}"`,
            isDazRelevant: true
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Erkennt Konsonantenhäufungen/Clusterreduktion
 */
function analyzeKonsonantenhaeufung(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  // Typische Konsonantencluster im Deutschen
  const clusters = ['br', 'kr', 'gr', 'tr', 'dr', 'pr', 'fr', 'schr', 'spr', 'str', 'bl', 'kl', 'gl', 'pl', 'fl', 'schw', 'zw', 'pf', 'st', 'sp'];
  
  for (const cluster of clusters) {
    if (lower_correct.includes(cluster)) {
      // Reduzierte Form im falschen Wort (z.B. "Bot" statt "Brot")
      const reduced = cluster.slice(0, 1) + cluster.slice(-1);
      if (lower_incorrect.includes(reduced) || 
          lower_incorrect.includes(cluster.slice(0, 1)) ||
          lower_incorrect.includes(cluster.slice(-1))) {
        return {
          category: 'alphabetic',
          subtype: 'konsonantenhaeufung',
          confidence: 0.85,
          evidence: `Konsonantencluster "${cluster}" reduziert: "${incorrect}" statt "${correct}"`,
          isDazRelevant: true
        };
      }
    }
  }
  
  return null;
}

/**
 * Erkennt stimmhaft/stimmlos Verwechslungen
 */
function analyzeStimmhaftStimmlos(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  const voicePairs = [
    { voiced: 'b', voiceless: 'p' },
    { voiced: 'd', voiceless: 't' },
    { voiced: 'g', voiceless: 'k' },
  ];
  
  for (const pair of voicePairs) {
    // Nicht am Wortende (das wäre Auslautverhärtung)
    for (let i = 0; i < Math.min(lower_incorrect.length, lower_correct.length) - 1; i++) {
      if ((lower_incorrect[i] === pair.voiceless && lower_correct[i] === pair.voiced) ||
          (lower_incorrect[i] === pair.voiced && lower_correct[i] === pair.voiceless)) {
        return {
          category: 'alphabetic',
          subtype: 'stimmhaft_stimmlos',
          confidence: 0.8,
          evidence: `Stimmhaft/Stimmlos-Verwechslung: "${incorrect}" statt "${correct}" (${pair.voiced}/${pair.voiceless})`,
          isDazRelevant: true
        };
      }
    }
  }
  
  return null;
}

/**
 * Erkennt vokalische Ableitung (Umlaute)
 */
function analyzeVokalischeAbleitung(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  const umlautPairs = [
    { umlaut: 'ä', base: 'a' },
    { umlaut: 'ö', base: 'o' },
    { umlaut: 'ü', base: 'u' },
    { umlaut: 'äu', base: 'au' },
    { umlaut: 'eu', base: 'au' },
  ];
  
  for (const pair of umlautPairs) {
    if (lower_correct.includes(pair.umlaut) && lower_incorrect.includes(pair.base) && !lower_incorrect.includes(pair.umlaut)) {
      return {
        category: 'morphematic',
        subtype: 'vokalische_ableitung',
        confidence: 0.85,
        evidence: `Fehlende Umlautung: "${incorrect}" statt "${correct}" (${pair.base} → ${pair.umlaut})`,
        isDazRelevant: false
      };
    }
  }
  
  return null;
}

/**
 * Erkennt Morphemkonstanz-Fehler (Endungen)
 */
function analyzeMorphemkonstanz(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  const commonEndings = ['-er', '-el', '-en', '-chen', '-lein', '-ung', '-heit', '-keit', '-schaft', '-ig', '-lich'];
  
  for (const ending of commonEndings) {
    if (lower_correct.endsWith(ending)) {
      // Fehlerhafte Endung im falschen Wort
      const variations = [
        ending.replace('er', 'a'), ending.replace('el', 'al'), ending.replace('en', 'an'),
        ending.replace('e', 'a'), ending.replace('i', 'ie')
      ];
      
      for (const variant of variations) {
        if (lower_incorrect.endsWith(variant)) {
          return {
            category: 'morphematic',
            subtype: 'morphemkonstanz',
            confidence: 0.8,
            evidence: `Endungsfehler: "${incorrect}" statt "${correct}" (${ending})`,
            isDazRelevant: true
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Erkennt Komposita-Fehler
 */
function analyzeKomposita(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  // Zusammenschreibung: Leerzeichen im falschen Wort
  if (incorrect.includes(' ') && !correct.includes(' ')) {
    return {
      category: 'grammatical',
      subtype: 'komposita',
      confidence: 0.9,
      evidence: `Kompositum getrennt geschrieben: "${incorrect}" statt "${correct}"`,
      isDazRelevant: false
    };
  }
  
  // Getrenntschreibung: Fehlendes Leerzeichen
  if (!incorrect.includes(' ') && correct.includes(' ')) {
    return {
      category: 'grammatical',
      subtype: 'getrennt_zusammenschreibung',
      confidence: 0.9,
      evidence: `Getrenntschreibung nicht beachtet: "${incorrect}" statt "${correct}"`,
      isDazRelevant: false
    };
  }
  
  return null;
}

/**
 * Erkennt fehlende oder übermäßige Dehnungsmarkierung
 */
function analyzeVowelLength(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  // Dehnungs-h Fehler
  if (lower_correct.includes('h') && !lower_incorrect.includes('h') && 
      /[aeiouäöü]h/.test(lower_correct)) {
    return {
      category: 'orthographic',
      subtype: 'dehnung',
      confidence: 0.9,
      evidence: `Fehlendes Dehnungs-h: "${incorrect}" statt "${correct}"`,
      isDazRelevant: true
    };
  }
  
  // Übermässiges Dehnungs-h
  if (lower_incorrect.includes('h') && !lower_correct.includes('h')) {
    return {
      category: 'orthographic',
      subtype: 'dehnung',
      confidence: 0.85,
      evidence: `Übermässiges Dehnungs-h: "${incorrect}" statt "${correct}"`,
      isDazRelevant: true
    };
  }
  
  // ie-Schreibung
  if (lower_correct.includes('ie') && !lower_incorrect.includes('ie')) {
    return {
      category: 'orthographic',
      subtype: 'dehnung',
      confidence: 0.9,
      evidence: `Fehlende ie-Schreibung: "${incorrect}" statt "${correct}"`,
      isDazRelevant: true
    };
  }
  
  return null;
}

/**
 * Erkennt fehlende Konsonantenverdopplung (Schärfung)
 */
function analyzeConsonantDoubling(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  // Doppelkonsonanten im korrekten Wort
  const doubleConsonants = /([bcdfghjklmnpqrstvwxyz])\1/g;
  const correctDoubles = lower_correct.match(doubleConsonants);
  
  if (correctDoubles && correctDoubles.length > 0) {
    for (const double of correctDoubles) {
      const single = double[0];
      if (!lower_incorrect.includes(double) && lower_incorrect.includes(single)) {
        return {
          category: 'orthographic',
          subtype: 'schaerfung',
          confidence: 0.9,
          evidence: `Fehlende Konsonantenverdopplung: "${incorrect}" statt "${correct}" (${double})`,
          isDazRelevant: true
        };
      }
    }
  }
  
  // ck/tz Schreibung
  if ((lower_correct.includes('ck') && !lower_incorrect.includes('ck')) ||
      (lower_correct.includes('tz') && !lower_incorrect.includes('tz'))) {
    return {
      category: 'orthographic',
      subtype: 'schaerfung',
      confidence: 0.85,
      evidence: `Fehlende ck/tz-Schreibung: "${incorrect}" statt "${correct}"`,
      isDazRelevant: true
    };
  }
  
  return null;
}

/**
 * Erkennt Auslautverhärtung (morphematische Strategie)
 */
function analyzeAuslautverhaertung(incorrect: string, correct: string): AnalysisResult | null {
  const lower_incorrect = incorrect.toLowerCase();
  const lower_correct = correct.toLowerCase();
  
  // Typische Auslautverhärtungen: d→t, g→k, b→p am Wortende
  const auslautPatterns = [
    { wrong: 't', right: 'd' },
    { wrong: 'k', right: 'g' },
    { wrong: 'p', right: 'b' },
  ];
  
  for (const pattern of auslautPatterns) {
    if (lower_incorrect.endsWith(pattern.wrong) && lower_correct.endsWith(pattern.right)) {
      return {
        category: 'morphematic',
        subtype: 'auslautverhaertung',
        confidence: 0.95,
        evidence: `Auslautverhärtung: "${incorrect}" statt "${correct}" (${pattern.wrong} statt ${pattern.right})`,
        isDazRelevant: false
      };
    }
  }
  
  return null;
}

/**
 * Erkennt Gross-/Kleinschreibungsfehler
 */
function analyzeCapitalization(incorrect: string, correct: string, context?: string): AnalysisResult | null {
  // Erstes Zeichen ist unterschiedlich in Gross-/Kleinschreibung
  if (incorrect.length > 0 && correct.length > 0) {
    const firstIncorrect = incorrect[0];
    const firstCorrect = correct[0];
    const restSame = incorrect.slice(1).toLowerCase() === correct.slice(1).toLowerCase();
    
    if (restSame && firstIncorrect !== firstCorrect) {
      // Nomen werden gross geschrieben
      if (firstCorrect === firstCorrect.toUpperCase() && firstIncorrect === firstIncorrect.toLowerCase()) {
        return {
          category: 'grammatical',
          subtype: 'gross_kleinschreibung',
          confidence: 0.9,
          evidence: `Nomen kleingeschrieben: "${incorrect}" statt "${correct}"`,
          isDazRelevant: true
        };
      }
    }
  }
  
  return null;
}

/**
 * Hauptanalyse-Funktion: Klassifiziert einen Rechtschreibfehler
 */
export function analyzeSpellingError(
  incorrect: string, 
  correct: string, 
  context?: string,
  isDaz: boolean = false
): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  
  // 1. Alphabetische Strategie prüfen
  if (isPhoneticError(incorrect, correct)) {
    const vokale = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
    const incorrectVokale = incorrect.toLowerCase().split('').filter(c => vokale.includes(c)).length;
    const correctVokale = correct.toLowerCase().split('').filter(c => vokale.includes(c)).length;
    
    if (incorrectVokale < correctVokale) {
      results.push({
        category: 'alphabetic',
        subtype: 'vokal_auslassung',
        confidence: 0.9,
        evidence: `Skelettschreibweise/Vokalauslassung: "${incorrect}" statt "${correct}"`,
        isDazRelevant: isDaz
      });
    }
  }
  
  // Konsonantenhäufung prüfen
  const clusterResult = analyzeKonsonantenhaeufung(incorrect, correct);
  if (clusterResult) {
    results.push(clusterResult);
  }
  
  // Stimmhaft/Stimmlos prüfen
  const voiceResult = analyzeStimmhaftStimmlos(incorrect, correct);
  if (voiceResult) {
    results.push(voiceResult);
  }
  
  // 2. Orthografische Strategie prüfen
  const vowelLengthResult = analyzeVowelLength(incorrect, correct);
  if (vowelLengthResult) {
    results.push(vowelLengthResult);
  }
  
  const doublingResult = analyzeConsonantDoubling(incorrect, correct);
  if (doublingResult) {
    results.push(doublingResult);
  }
  
  // Besondere Grapheme prüfen
  const graphemeResult = analyzeBesondereGrapheme(incorrect, correct);
  if (graphemeResult) {
    results.push(graphemeResult);
  }
  
  // 3. Morphematische Strategie prüfen
  const auslautResult = analyzeAuslautverhaertung(incorrect, correct);
  if (auslautResult) {
    results.push(auslautResult);
  }
  
  // Vokalische Ableitung prüfen
  const umlautResult = analyzeVokalischeAbleitung(incorrect, correct);
  if (umlautResult) {
    results.push(umlautResult);
  }
  
  // Morphemkonstanz prüfen
  const morphemResult = analyzeMorphemkonstanz(incorrect, correct);
  if (morphemResult) {
    results.push(morphemResult);
  }
  
  // 4. Grammatische Strategie prüfen
  const capResult = analyzeCapitalization(incorrect, correct, context);
  if (capResult) {
    results.push(capResult);
  }
  
  // Komposita prüfen
  const kompositaResult = analyzeKomposita(incorrect, correct);
  if (kompositaResult) {
    results.push(kompositaResult);
  }
  
  // Wenn keine spezifische Kategorie gefunden, generische Zuordnung
  if (results.length === 0) {
    results.push({
      category: 'orthographic',
      subtype: 'besondere_grapheme',
      confidence: 0.5,
      evidence: `Allgemeiner Rechtschreibfehler: "${incorrect}" statt "${correct}"`,
      isDazRelevant: isDaz
    });
  }
  
  return results;
}

/**
 * Klassifiziert mehrere Rechtschreibfehler und gruppiert sie
 */
export function classifySpellingErrors(errors: SpellingError[]): ClassifiedSpellingError[] {
  const classified: Map<string, ClassifiedSpellingError> = new Map();
  
  for (const error of errors) {
    const analyses = analyzeSpellingError(
      error.incorrectWord,
      error.correctWord,
      error.context || undefined,
      error.isDaz === 1
    );
    
    // Hauptkategorie verwenden (höchste Confidence)
    const mainAnalysis = analyses.sort((a, b) => b.confidence - a.confidence)[0];
    
    const key = `${mainAnalysis.category}_${mainAnalysis.subtype}`;
    
    if (!classified.has(key)) {
      classified.set(key, {
        category: mainAnalysis.category,
        subtype: mainAnalysis.subtype,
        description: getErrorDescription(mainAnalysis.category, mainAnalysis.subtype),
        errors: [],
        targetWords: [],
        pedagogicalHints: getPedagogicalHints(mainAnalysis.category, mainAnalysis.subtype, mainAnalysis.isDazRelevant),
        exerciseTypes: getExerciseTypes(mainAnalysis.category, mainAnalysis.subtype)
      });
    }
    
    const classifiedError = classified.get(key)!;
    classifiedError.errors.push(error);
    classifiedError.targetWords.push(error.correctWord);
  }
  
  return Array.from(classified.values());
}

/**
 * Gibt eine beschreibende Erklärung für eine Fehlerkategorie zurück
 */
function getErrorDescription(category: ErrorStrategy, subtype: ErrorSubtype): string {
  const descriptions: Record<string, string> = {
    // Alphabetisch
    'alphabetic_vokal_auslassung': 'Vokale werden ausgelassen (Skelettschreibweise)',
    'alphabetic_konsonantenhaeufung': 'Schwierigkeiten bei Konsonantenhäufungen',
    'alphabetic_stimmhaft_stimmlos': 'Verwechslung stimmhafter/stimmloser Laute',
    'alphabetic_regionale_aussprache': 'Schreibung orientiert sich an Dialekt/Umgangssprache',
    
    // Orthografisch
    'orthographic_dehnung': 'Unsicherheit bei Dehnungsmarkierung (h, ie)',
    'orthographic_schaerfung': 'Fehlende Konsonantenverdopplung nach kurzem Vokal',
    'orthographic_besondere_grapheme': 'Schwierigkeiten mit besonderen Buchstaben (v, ß, qu)',
    
    // Morphematisch
    'morphematic_auslautverhaertung': 'Stammprinzip nicht beachtet (Auslautverhärtung)',
    'morphematic_vokalische_ableitung': 'Fehler bei Umlautschreibungen',
    'morphematic_morphemkonstanz': 'Unstimmigkeiten bei Affixen und Endungen',
    
    // Grammatisch
    'grammatical_gross_kleinschreibung': 'Groß-/Kleinschreibung (besonders Nomen)',
    'grammatical_satzbau_syntax': 'Fehlerhafte Satzstellung oder fehlende Funktionswörter',
    'grammatical_komposita': 'Probleme bei zusammengesetzten Wörtern',
    'grammatical_getrennt_zusammenschreibung': 'Getrennt- vs. Zusammenschreibung',
  };
  
  return descriptions[`${category}_${subtype}`] || 'Rechtschreibfehler';
}

/**
 * Gibt pädagogische Hinweise für eine Fehlerkategorie zurück
 */
function getPedagogicalHints(category: ErrorStrategy, subtype: ErrorSubtype, isDaz: boolean): string[] {
  const hints: Record<string, string[]> = {
    // Alphabetisch
    'alphabetic_vokal_auslassung': [
      'Silbenschwingen/Silbenklatschen üben',
      'Dehnsprechen: Wort langsam und deutlich aussprechen',
      'Anlauttabelle nutzen',
      'Lotto oder Memory zum Einsetzen fehlender Vokale'
    ],
    'alphabetic_konsonantenhaeufung': [
      'Konsonantenverbindungen gezielt üben (br, kr, tr, etc.)',
      'Mundbilder und Artikulation bewusst machen',
      'Wortbausteine isoliert sprechen und schreiben'
    ],
    
    // Orthografisch
    'orthographic_dehnung': [
      'Faustregeln entdecken: Langer Vokal wird meist nicht markiert',
      'Merkwörter sammeln (Dehnungs-h, ie)',
      'Vier-Schritte-Verfahren: lesen → markieren → abdecken/schreiben → vergleichen'
    ],
    'orthographic_schaerfung': [
      'Regel: Nach kurzem Vokal folgt oft Doppelkonsonant',
      'Wörter nach Mustern sortieren (tt, mm, ck, tz)',
      'Sprechrhythmus nutzen: kurzer Vokal = schneller gesprochen'
    ],
    
    // Morphematisch
    'morphematic_auslautverhaertung': [
      'Trick mit der Verlängerung: Hund → Hunde',
      'Wortfamilien sammeln und Stamm markieren',
      'Dominos/Paarkarten zur Ableitung verwandter Wörter'
    ],
    
    // Grammatisch
    'grammatical_gross_kleinschreibung': [
      'Nomen-Probe: Artikel davor setzen ("der/die/das")',
      'Satzanfänge markieren',
      'Rechtschreibgespräche über Wortarten führen'
    ],
  };
  
  const baseHints = hints[`${category}_${subtype}`] || ['Wort gezielt üben und wiederholen'];
  
  if (isDaz) {
    baseHints.push('DaZ: Strukturierter Input mit gehäufter Zielstruktur');
    baseHints.push('DaZ: Korrektives Feedback durch Modellierung (nicht Fehler tadeln)');
  }
  
  return baseHints;
}

/**
 * Gibt passende Übungsformen für eine Fehlerkategorie zurück
 */
function getExerciseTypes(category: ErrorStrategy, subtype: ErrorSubtype): string[] {
  const exercises: Record<string, string[]> = {
    'alphabetic_vokal_auslassung': [
      'Lückenwörter (fehlende Vokale einsetzen)',
      'Silbenrätsel',
      'Wort-Bild-Zuordnung mit Sprechübung'
    ],
    'orthographic_dehnung': [
      'Merkwörter-Kartei (Lernbox)',
      'Wörter-Sortier-Spiel (mit/ohne Dehnungs-h)',
      'Forscheraufgabe: Muster in Wortsammlung finden'
    ],
    'orthographic_schaerfung': [
      'Doppel-Konsonanten-Lotto',
      'Wörter nach Regeln sortieren',
      'Silben zusammensetzen'
    ],
    'morphematic_auslautverhaertung': [
      'Verlängerungs-Domino',
      'Wortfamilien-Plakat erstellen',
      'Stamm-Detektiv: Verwandte Wörter finden'
    ],
    'grammatical_gross_kleinschreibung': [
      'Nomen-Suchspiel im Text',
      'Artikel-Zuordnung',
      'Satzanfänge markieren und korrigieren'
    ],
  };
  
  return exercises[`${category}_${subtype}`] || ['Gezieltes Wortschatztraining'];
}
