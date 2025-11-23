/**
 * Kreativitäts-Würfel - Template-Generator für spontane kreative Aufgaben
 * 
 * Kombiniert verschiedene Dimensionen zu einzigartigen Aufgaben:
 * - WHO (Perspektive)
 * - WHAT (Aktion)
 * - WHERE (Kontext)
 * - WHEN (Zeit)
 * - WHY (Thema)
 */

interface CreativityDiceResult {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  generatedTask: {
    title: string;
    description: string;
    category: string;
  };
}

// Würfel-Optionen
const WHO_OPTIONS = [
  "Du bist ein winziger Käfer",
  "Du bist ein mutiger Superheld",
  "Du bist ein weiser alter Baum",
  "Du bist ein neugieriger Roboter",
  "Du bist ein königlicher Vogel",
  "Du bist ein magisches Wesen",
  "Du bist ein berühmter Erfinder",
  "Du bist ein freundliches Monster",
  "Du bist eine kluge Detektivin",
  "Du bist ein sprechender Stein",
  "Du bist ein Zeit-Reisender",
  "Du bist eine kreative Künstlerin"
];

const WHAT_OPTIONS = [
  "erfinde eine Lösung",
  "zeichne eine Karte",
  "schreibe eine Geschichte",
  "erkläre anderen Menschen",
  "baue ein Modell",
  "komponiere ein Lied",
  "entwerfe ein Plakat",
  "führe ein Experiment durch",
  "stelle ein Interview zusammen",
  "male ein Bild",
  "plane ein Abenteuer",
  "entwickle ein Spiel"
];

const WHERE_OPTIONS = [
  "in deinem Zimmer",
  "auf einem fremden Planeten",
  "im dichtesten Dschungel",
  "unter dem Meer",
  "in der Schweizer Bergwelt",
  "in einer geheimen Bibliothek",
  "auf einem Marktplatz",
  "in einer Traumwelt",
  "in einem Labor",
  "in der Wolkenstadt",
  "in einem verwunschenen Garten",
  "in der Zukunfts-Schule"
];

const WHEN_OPTIONS = [
  "heute",
  "vor 1000 Jahren",
  "im Jahr 2100",
  "letzte Nacht im Traum",
  "in einer Stunde",
  "zur Zeit der Dinosaurier",
  "wenn du erwachsen bist",
  "an deinem Geburtstag",
  "in den Sommerferien",
  "während eines Gewitters",
  "beim Sonnenaufgang",
  "mitten in der Nacht"
];

const WHY_OPTIONS = [
  "für mehr Freundschaft",
  "um die Umwelt zu schützen",
  "wegen eines Geheimnisses",
  "für ein großes Abenteuer",
  "um anderen zu helfen",
  "weil du neugierig bist",
  "für mehr Mut",
  "um Langeweile zu vertreiben",
  "für eine bessere Welt",
  "wegen einer magischen Entdeckung",
  "für wissenschaftliche Forschung",
  "um Angst zu überwinden"
];

// Kategorie-Mapping basierend auf Kombination
function determineCategory(who: string, what: string, where: string, when: string, why: string): string {
  // Zeit-basiert
  if (when.includes("Jahr") || when.includes("Dinosaurier") || when.includes("erwachsen") || when.includes("1000 Jahren")) {
    return "Zeit-Reisen";
  }
  
  // Größen-Perspektive
  if (who.includes("Käfer") || who.includes("Stein") || where.includes("Planeten")) {
    return "Mikro-Makro";
  }
  
  // Emotionen
  if (why.includes("Mut") || why.includes("Angst") || why.includes("Freundschaft")) {
    return "Emotionale Landkarten";
  }
  
  // Perspektive
  if (who.includes("Baum") || who.includes("Vogel") || who.includes("Roboter")) {
    return "Perspektiven";
  }
  
  // Erfindungen
  if (what.includes("erfinde") || what.includes("baue") || what.includes("entwickle")) {
    return "Erfindungen";
  }
  
  // Geschichten
  if (what.includes("schreibe") || what.includes("erzähl")) {
    return "Geschichten";
  }
  
  // Soziale Kompetenzen
  if (why.includes("helfen") || why.includes("Freundschaft")) {
    return "Soziale Kompetenzen";
  }
  
  // Default: Kreativität & Kunst
  return "Kreativität & Kunst";
}

// Generiere Titel und Beschreibung
function generateTask(who: string, what: string, where: string, when: string, why: string): { title: string; description: string } {
  // Aufgaben-Titel erstellen
  const title = `${who.split(' ').slice(2).join(' ')} ${where}`;
  
  // Beschreibung erstellen
  const description = `${who} und befindest dich ${where}. ${when.charAt(0).toUpperCase() + when.slice(1)} sollst du ${what}, ${why}. Was erlebst du? Was machst du? Erzähle, zeichne oder erkläre deine Idee!`;
  
  return { title, description };
}

/**
 * Würfelt eine zufällige kreative Aufgabe
 */
export function rollCreativityDice(): CreativityDiceResult {
  const who = WHO_OPTIONS[Math.floor(Math.random() * WHO_OPTIONS.length)];
  const what = WHAT_OPTIONS[Math.floor(Math.random() * WHAT_OPTIONS.length)];
  const where = WHERE_OPTIONS[Math.floor(Math.random() * WHERE_OPTIONS.length)];
  const when = WHEN_OPTIONS[Math.floor(Math.random() * WHEN_OPTIONS.length)];
  const why = WHY_OPTIONS[Math.floor(Math.random() * WHY_OPTIONS.length)];
  
  const category = determineCategory(who, what, where, when, why);
  const { title, description } = generateTask(who, what, where, when, why);
  
  return {
    who,
    what,
    where,
    when,
    why,
    generatedTask: {
      title,
      description,
      category,
    },
  };
}

/**
 * Würfelt mit benutzerdefinierten Einschränkungen
 */
export function rollWithConstraints(constraints?: {
  who?: string[];
  what?: string[];
  where?: string[];
  when?: string[];
  why?: string[];
}): CreativityDiceResult {
  const whoPool = constraints?.who && constraints.who.length > 0 ? constraints.who : WHO_OPTIONS;
  const whatPool = constraints?.what && constraints.what.length > 0 ? constraints.what : WHAT_OPTIONS;
  const wherePool = constraints?.where && constraints.where.length > 0 ? constraints.where : WHERE_OPTIONS;
  const whenPool = constraints?.when && constraints.when.length > 0 ? constraints.when : WHEN_OPTIONS;
  const whyPool = constraints?.why && constraints.why.length > 0 ? constraints.why : WHY_OPTIONS;
  
  const who = whoPool[Math.floor(Math.random() * whoPool.length)];
  const what = whatPool[Math.floor(Math.random() * whatPool.length)];
  const where = wherePool[Math.floor(Math.random() * wherePool.length)];
  const when = whenPool[Math.floor(Math.random() * whenPool.length)];
  const why = whyPool[Math.floor(Math.random() * whyPool.length)];
  
  const category = determineCategory(who, what, where, when, why);
  const { title, description } = generateTask(who, what, where, when, why);
  
  return {
    who,
    what,
    where,
    when,
    why,
    generatedTask: {
      title,
      description,
      category,
    },
  };
}

/**
 * Gibt alle verfügbaren Würfel-Optionen zurück
 */
export function getDiceOptions() {
  return {
    who: WHO_OPTIONS,
    what: WHAT_OPTIONS,
    where: WHERE_OPTIONS,
    when: WHEN_OPTIONS,
    why: WHY_OPTIONS,
  };
}
