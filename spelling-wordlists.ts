import type { ErrorStrategy, ErrorSubtype } from "./spelling-pedagogy";

/**
 * Rechtschreib-Übungsvorlagen analog zu Mathe-Päckchen
 * Strukturierte Wortlisten und Übungstypen für jede Fehlerkategorie
 */

export type SpellingExerciseType =
  | 'lueckentext'              // Lückentexte mit fehlenden Buchstaben
  | 'wortfamilien'             // Wortfamilien bilden/verlängern
  | 'sortieraufgabe'           // Wörter nach Regeln sortieren
  | 'diktat_vorbereitung'      // Diktatvorbereitung mit Merkwörtern
  | 'regelentdeckung'          // Regeln selbst entdecken
  | 'fehlerdetektiv'           // Fehler finden und korrigieren
  | 'silbenschwingen'          // Silben klatschen/schwingen
  | 'verlängerungstrick'       // Wörter verlängern (morphematisch)
  | 'artikelprobe'             // Nomen mit Artikel finden
  | 'zusammensetzung';         // Komposita bilden

export interface SpellingWordlist {
  category: ErrorStrategy;
  subtype: ErrorSubtype;
  targetWords: string[];         // Wörter zum Üben
  commonMistakes: string[];      // Typische Fehlschreibungen
  wordFamilies?: string[][];     // Gruppierte Wortfamilien
  rules?: string[];              // Regeln zum Entdecken
}

export interface SpellingExerciseTemplate {
  type: SpellingExerciseType;
  name: string;
  description: string;
  targetSubtypes: ErrorSubtype[];
  didacticGoal: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isDazFriendly: boolean;        // Geeignet für DaZ-Lernende
}

/**
 * Wortlisten für alle 12 Fehlertypen
 */
export const SPELLING_WORDLISTS: Record<string, SpellingWordlist> = {
  
  // ALPHABETISCHE STRATEGIE
  'alphabetic_vokal_auslassung': {
    category: 'alphabetic',
    subtype: 'vokal_auslassung',
    targetWords: [
      'Fahrrad', 'Garten', 'Himmel', 'Fenster', 'Bücher', 
      'Wasser', 'Computer', 'Roller', 'Mutter', 'Vater',
      'Telefon', 'Regenbogen', 'Schokolade', 'Tomate', 'Banane',
      'Elefant', 'Karotte', 'Maschine', 'Rakete', 'Spinne'
    ],
    commonMistakes: [
      'Fhrrd', 'Grtn', 'Hmml', 'Fnstr', 'Bchr',
      'Wssr', 'Cmptr', 'Rllr', 'Mttr', 'Vtr'
    ]
  },

  'alphabetic_konsonantenhaeufung': {
    category: 'alphabetic',
    subtype: 'konsonantenhaeufung',
    targetWords: [
      'Brot', 'groß', 'Kreis', 'drei', 'Flasche',
      'Blume', 'grün', 'Prinz', 'Strand', 'Straße',
      'Schwester', 'Sprache', 'schreiben', 'Schrank', 'Pflanze',
      'Klasse', 'Plastik', 'kratzen', 'tragen', 'Frosch'
    ],
    commonMistakes: [
      'Bot', 'goß', 'Keis', 'dei', 'Fasche',
      'Bume', 'gün', 'Pinz', 'Stand', 'Staße'
    ]
  },

  'alphabetic_stimmhaft_stimmlos': {
    category: 'alphabetic',
    subtype: 'stimmhaft_stimmlos',
    targetWords: [
      'Dose', 'Gabel', 'baden', 'Tiger', 'Regen',
      'Boden', 'Tage', 'Käfig', 'wagen', 'Deckel',
      'Becher', 'Küche', 'Garten', 'tanken', 'danken'
    ],
    commonMistakes: [
      'Tose', 'Kabel', 'paden', 'Diger', 'Reken',
      'Poten', 'Dage', 'Kävik', 'waken', 'Teckel'
    ]
  },

  // ORTHOGRAFISCHE STRATEGIE
  'orthographic_dehnung': {
    category: 'orthographic',
    subtype: 'dehnung',
    targetWords: [
      // Dehnungs-h
      'Stuhl', 'Zahl', 'Wahl', 'Mehl', 'Höhle',
      'Bahnen', 'Fühlen', 'Mühle', 'Kehle', 'Sohle',
      // ie-Schreibung
      'Biene', 'Liebe', 'Dieb', 'Sieb', 'Tier',
      'Fliege', 'Wiese', 'Knie', 'Stiefel', 'Spiegel',
      // Doppelvokal
      'Boot', 'Haar', 'Meer', 'Paar', 'See'
    ],
    commonMistakes: [
      'Stul', 'Zal', 'Wal', 'Mel', 'Höle',
      'Bine', 'Libe', 'Dib', 'Sib', 'Tier',
      'Bot', 'Har', 'Mer', 'Par', 'Se'
    ],
    wordFamilies: [
      ['Zahl', 'zählen', 'Zahlen', 'bezahlen'],
      ['Stuhl', 'Stühle', 'bestuhl'],
      ['Biene', 'Bienen', 'Bienenstock']
    ]
  },

  'orthographic_schaerfung': {
    category: 'orthographic',
    subtype: 'schaerfung',
    targetWords: [
      // Doppelkonsonanten
      'Sommer', 'kommen', 'Hammer', 'schwimmen', 'rennen',
      'Teller', 'bellen', 'füllen', 'alle', 'Mutter',
      'Butter', 'Zimmer', 'immer', 'Sonne', 'können',
      // ck und tz
      'Ecke', 'Brücke', 'Stück', 'Zucker', 'backen',
      'Katze', 'Satz', 'Platz', 'sitzen', 'Blitz'
    ],
    commonMistakes: [
      'Somer', 'komen', 'Hamer', 'schwimen', 'renen',
      'Teler', 'belen', 'fülen', 'ale', 'Muter',
      'Eke', 'Brüke', 'Stük', 'Zuker', 'baken',
      'Katse', 'Sats', 'Plats', 'sitzen', 'Blits'
    ],
    rules: [
      'Nach kurzem Vokal folgt oft ein Doppelkonsonant',
      'ck statt kk, tz statt zz'
    ]
  },

  'orthographic_besondere_grapheme': {
    category: 'orthographic',
    subtype: 'besondere_grapheme',
    targetWords: [
      // v/f
      'Vogel', 'viel', 'vier', 'Vater', 'vergessen',
      // w/v
      'Wasser', 'Winter', 'wohnen', 'Welt', 'Wetter',
      // ß
      'Straße', 'groß', 'Füße', 'grüßen', 'beißen',
      // qu
      'Quelle', 'quer', 'Quark', 'bequem', 'Aquarium',
      // x und y
      'Taxi', 'Hexe', 'boxen', 'Typ', 'Handy'
    ],
    commonMistakes: [
      'Fogel', 'fiel', 'fier', 'Fater', 'fergessen',
      'Vasser', 'Vinter', 'vohnen', 'Velt', 'Vetter',
      'Strasse', 'gross', 'Füsse', 'grüssen', 'beissen',
      'Kwelle', 'kwer', 'Kwark', 'bekwem', 'Akwarium'
    ]
  },

  // MORPHEMATISCHE STRATEGIE
  'morphematic_auslautverhaertung': {
    category: 'morphematic',
    subtype: 'auslautverhaertung',
    targetWords: [
      'Hund', 'Kind', 'Wald', 'Bild', 'Land',
      'Tag', 'Weg', 'Berg', 'Zug', 'Teig',
      'gelb', 'halb', 'Kalb', 'Dieb', 'Verb'
    ],
    commonMistakes: [
      'Hunt', 'Kint', 'Walt', 'Bilt', 'Lant',
      'Tak', 'Wek', 'Berk', 'Zuk', 'Teik',
      'gelp', 'halp', 'Kalp', 'Diep', 'Verp'
    ],
    wordFamilies: [
      ['Hund', 'Hunde', 'Hündchen'],
      ['Kind', 'Kinder', 'Kindheit'],
      ['Tag', 'Tage', 'täglich'],
      ['Weg', 'Wege', 'Wegweiser']
    ],
    rules: [
      'Verlängere das Wort, um den richtigen Buchstaben zu finden',
      'd am Ende klingt wie t → Hund (Hunde)',
      'g am Ende klingt wie k → Tag (Tage)',
      'b am Ende klingt wie p → gelb (gelbe)'
    ]
  },

  'morphematic_vokalische_ableitung': {
    category: 'morphematic',
    subtype: 'vokalische_ableitung',
    targetWords: [
      // ä von a
      'fährt', 'läuft', 'schläft', 'fällt', 'hält',
      'Bäcker', 'Gläser', 'Räder', 'Väter', 'Bäume',
      // äu von au
      'Häuser', 'Mäuse', 'Träume', 'Zäune', 'Bäume',
      // ö von o, ü von u
      'Vögel', 'Töpfe', 'Köpfe', 'Brüder', 'Mütter'
    ],
    commonMistakes: [
      'fehrt', 'leuft', 'schleft', 'fellt', 'helt',
      'Becker', 'Gleser', 'Reder', 'Feter', 'Beume',
      'Heuser', 'Meuse', 'Treume', 'Zeune'
    ],
    wordFamilies: [
      ['fahren', 'fährt', 'Fahrt'],
      ['laufen', 'läuft', 'Lauf'],
      ['Haus', 'Häuser', 'Häuschen'],
      ['Maus', 'Mäuse', 'Mäuschen']
    ],
    rules: [
      'ä kommt von a → Vater - Väter',
      'äu kommt von au → Haus - Häuser'
    ]
  },

  'morphematic_morphemkonstanz': {
    category: 'morphematic',
    subtype: 'morphemkonstanz',
    targetWords: [
      // -er Endungen
      'Lehrer', 'Fahrer', 'Spieler', 'Maler', 'Tänzer',
      'Fenster', 'Messer', 'Wasser', 'Donner', 'Winter',
      // -el Endungen
      'Löffel', 'Schlüssel', 'Vogel', 'Engel', 'Mantel',
      // -en Endungen
      'laufen', 'schlafen', 'essen', 'geben', 'leben'
    ],
    commonMistakes: [
      'Lehra', 'Fahra', 'Spiela', 'Mala', 'Tänza',
      'Fensta', 'Messa', 'Wassa', 'Donna', 'Winta',
      'Löffl', 'Schlüssl', 'Vogl', 'Engl', 'Mantl'
    ]
  },

  // GRAMMATISCHE STRATEGIE
  'grammatical_gross_kleinschreibung': {
    category: 'grammatical',
    subtype: 'Groß_Kleinschreibung',
    targetWords: [
      // Nomen (großgeschrieben)
      'Haus', 'Auto', 'Tisch', 'Freude', 'Liebe',
      'Sonne', 'Mond', 'Baum', 'Schule', 'Lehrer',
      'Kind', 'Mutter', 'Vater', 'Tier', 'Vogel',
      'Berg', 'Fluss', 'Stadt', 'Land', 'Meer',
      // Nach Artikel erkennbar
      'der Hund', 'die Katze', 'das Pferd', 'ein Apfel', 'eine Blume'
    ],
    commonMistakes: [
      'haus', 'auto', 'tisch', 'freude', 'liebe',
      'sonne', 'mond', 'baum', 'schule', 'lehrer'
    ],
    rules: [
      'Nomen werden großgeschrieben',
      'Probe: Kann ich der/die/das davor setzen?',
      'Satzanfänge werden großgeschrieben'
    ]
  },

  'grammatical_komposita': {
    category: 'grammatical',
    subtype: 'komposita',
    targetWords: [
      'Haustür', 'Schulhof', 'Gartenzaun', 'Blumentopf', 'Fußball',
      'Regenmantel', 'Sonnenschein', 'Handschuh', 'Tischlampe', 'Autobahn',
      'Apfelbaum', 'Schneemann', 'Kinderzimmer', 'Wasserfall', 'Traumhaus'
    ],
    commonMistakes: [
      'Haus Tür', 'Schul Hof', 'Garten Zaun', 'Blumen Topf', 'Fuß Ball',
      'Regen Mantel', 'Sonnen Schein', 'Hand Schuh'
    ],
    wordFamilies: [
      ['Haus', 'Tür', 'Haustür'],
      ['Schule', 'Hof', 'Schulhof'],
      ['Garten', 'Zaun', 'Gartenzaun']
    ],
    rules: [
      'Zusammengesetzte Nomen schreibt man zusammen',
      'Das letzte Wort bestimmt den Artikel: der Garten + der Zaun = der Gartenzaun'
    ]
  },

  'grammatical_getrennt_zusammenschreibung': {
    category: 'grammatical',
    subtype: 'getrennt_zusammenschreibung',
    targetWords: [
      // Zusammenschreibung
      'zusammenschreiben', 'kennenlernen', 'spazierengehen', 'radfahren', 'fernsehen',
      'aufstehen', 'zurückkommen', 'weitermachen', 'hochspringen', 'hinausgehen',
      // Getrenntschreibung
      'Rad fahren', 'Gitarre spielen', 'Auto fahren', 'Fußball spielen'
    ],
    commonMistakes: [
      'zusammen schreiben', 'kennen lernen', 'spazieren gehen', 'rad fahren', 'fern sehen',
      'Radfahren', 'Gitarrespielen', 'Autofahren'
    ],
    rules: [
      'Verb + Verb = zusammen (kennenlernen)',
      'Nomen + Verb = getrennt (Rad fahren)',
      'Bei Zweifel: Kann ich das Nomen mit einem Artikel versehen? → getrennt'
    ]
  }
};

/**
 * Übungsvorlagen für verschiedene Übungstypen
 */
export const SPELLING_EXERCISE_TEMPLATES: Record<SpellingExerciseType, SpellingExerciseTemplate> = {
  lueckentext: {
    type: 'lueckentext',
    name: 'Lückentexte',
    description: 'Fehlende Buchstaben oder Wortteile einsetzen',
    targetSubtypes: [
      'vokal_auslassung', 'konsonantenhaeufung', 'dehnung', 'schaerfung', 'besondere_grapheme'
    ],
    didacticGoal: 'Rechtschreibmuster bewusst machen und automatisieren',
    instructions: 'Setze die fehlenden Buchstaben ein. Achte auf die richtige Schreibweise!',
    difficulty: 'easy',
    isDazFriendly: true
  },

  wortfamilien: {
    type: 'wortfamilien',
    name: 'Wortfamilien bilden',
    description: 'Verwandte Wörter finden und Wortstamm erkennen',
    targetSubtypes: ['auslautverhaertung', 'vokalische_ableitung', 'morphemkonstanz'],
    didacticGoal: 'Morphematisches Prinzip verstehen - Wortstamm bleibt gleich',
    instructions: 'Bilde Wortfamilien. Markiere den gemeinsamen Wortstamm.',
    difficulty: 'medium',
    isDazFriendly: false
  },

  sortieraufgabe: {
    type: 'sortieraufgabe',
    name: 'Wörter sortieren',
    description: 'Wörter nach Rechtschreibregeln oder Mustern sortieren',
    targetSubtypes: ['dehnung', 'schaerfung', 'besondere_grapheme', 'gross_kleinschreibung'],
    didacticGoal: 'Rechtschreibregeln entdecken und anwenden',
    instructions: 'Sortiere die Wörter in die richtige Spalte. Finde das Muster!',
    difficulty: 'medium',
    isDazFriendly: true
  },

  diktat_vorbereitung: {
    type: 'diktat_vorbereitung',
    name: 'Diktat-Vorbereitung',
    description: 'Merkwörter üben mit Abschreibstrategie',
    targetSubtypes: ['dehnung', 'besondere_grapheme', 'morphemkonstanz'],
    didacticGoal: 'Rechtschreibsicherheit durch systematisches Üben',
    instructions: 'Lesen → Markieren → Abdecken → Schreiben → Vergleichen',
    difficulty: 'medium',
    isDazFriendly: true
  },

  regelentdeckung: {
    type: 'regelentdeckung',
    name: 'Rechtschreibregeln entdecken',
    description: 'Schüler entdecken selbst Rechtschreibmuster',
    targetSubtypes: ['schaerfung', 'dehnung', 'gross_kleinschreibung', 'komposita'],
    didacticGoal: 'Eigenständiges Entdecken von Rechtschreibregeln',
    instructions: 'Untersuche die Wörter. Welche Regel kannst du entdecken?',
    difficulty: 'hard',
    isDazFriendly: false
  },

  fehlerdetektiv: {
    type: 'fehlerdetektiv',
    name: 'Fehler-Detektiv',
    description: 'Rechtschreibfehler finden und korrigieren',
    targetSubtypes: [
      'gross_kleinschreibung', 'komposita', 'getrennt_zusammenschreibung', 
      'auslautverhaertung', 'vokalische_ableitung'
    ],
    didacticGoal: 'Rechtschreibbewusstsein schärfen durch Fehleranalyse',
    instructions: 'Finde die Rechtschreibfehler und korrigiere sie. Erkläre die Regel!',
    difficulty: 'hard',
    isDazFriendly: false
  },

  silbenschwingen: {
    type: 'silbenschwingen',
    name: 'Silben schwingen',
    description: 'Silben klatschen/schwingen zur Rechtschreibhilfe',
    targetSubtypes: ['vokal_auslassung', 'konsonantenhaeufung', 'schaerfung'],
    didacticGoal: 'Lautstruktur bewusst machen - Phonologische Bewusstheit',
    instructions: 'Schwinge die Silben mit. Schreibe das Wort richtig auf.',
    difficulty: 'easy',
    isDazFriendly: true
  },

  verlängerungstrick: {
    type: 'verlängerungstrick',
    name: 'Verlängerungs-Trick',
    description: 'Wörter verlängern um richtige Schreibweise zu finden',
    targetSubtypes: ['auslautverhaertung', 'vokalische_ableitung'],
    didacticGoal: 'Morphematische Strategie nutzen - Ableitung verwandter Wörter',
    instructions: 'Verlängere das Wort, um den richtigen Buchstaben herauszufinden!',
    difficulty: 'medium',
    isDazFriendly: true
  },

  artikelprobe: {
    type: 'artikelprobe',
    name: 'Artikel-Probe',
    description: 'Nomen mit Artikel finden (Großschreibung)',
    targetSubtypes: ['gross_kleinschreibung'],
    didacticGoal: 'Nomen sicher erkennen und großschreiben',
    instructions: 'Setze der/die/das davor. Ist es ein Nomen? → Großschreiben!',
    difficulty: 'easy',
    isDazFriendly: true
  },

  zusammensetzung: {
    type: 'zusammensetzung',
    name: 'Zusammensetzungen bilden',
    description: 'Komposita richtig bilden und schreiben',
    targetSubtypes: ['komposita', 'getrennt_zusammenschreibung'],
    didacticGoal: 'Komposita-Bildung verstehen',
    instructions: 'Bilde zusammengesetzte Nomen. Welches Wort bestimmt den Artikel?',
    difficulty: 'medium',
    isDazFriendly: false
  }
};

/**
 * Hilfsfunktion: Gibt passende Übungstypen für einen Fehlersubtyp zurück
 */
export function getExerciseTypesForSubtype(subtype: ErrorSubtype): SpellingExerciseType[] {
  const matchingTypes: SpellingExerciseType[] = [];
  
  for (const [type, template] of Object.entries(SPELLING_EXERCISE_TEMPLATES)) {
    if (template.targetSubtypes.includes(subtype)) {
      matchingTypes.push(type as SpellingExerciseType);
    }
  }
  
  return matchingTypes;
}

/**
 * Hilfsfunktion: Gibt Wortliste für einen spezifischen Fehlertyp zurück
 */
export function getWordlistForError(category: ErrorStrategy, subtype: ErrorSubtype): SpellingWordlist | null {
  const key = `${category}_${subtype}`;
  return SPELLING_WORDLISTS[key] || null;
}
