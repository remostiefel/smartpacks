/**
 * Living Life Task Generator
 * Generiert erlebnisbasierte Hausaufgaben für Primarschüler
 * Basiert auf 6+ Kategorien und 3 Schwierigkeitsstufen
 */

import type { LivingLifeTask, LivingLifeCategory } from "@shared/schema";

export type DifficultyLevel = "entdecken" | "erforschen" | "vertiefen";
export type AgeGroup = "klasse_1_2" | "klasse_3_4" | "klasse_5_6";

// ========================================
// KATEGORIEN & TASK-TEMPLATES
// ========================================

export const LIVING_LIFE_CATEGORIES = [
  {
    name: "naturerkundung",
    displayName: "Natur-erkundung",
    description: "Systematische Beobachtung und Erforschung der Natur über längere Zeiträume",
    icon: "TreePine",
    color: "#10B981", // Green
    orderIndex: 1,
  },
  {
    name: "gemeinschaftserkundung",
    displayName: "Gemeinschafts-erkundung",
    description: "Aktive Erkundung und Vernetzung mit der lokalen Gemeinde",
    icon: "Users",
    color: "#3B82F6", // Blue
    orderIndex: 2,
  },
  {
    name: "familieninteraktion",
    displayName: "Familien-interaktion",
    description: "Gemeinsame, bedeutungsvolle Aktivitäten innerhalb der Familie",
    icon: "Heart",
    color: "#EC4899", // Pink
    orderIndex: 3,
  },
  {
    name: "lebenskompetenzen",
    displayName: "Lebens-kompetenzen",
    description: "Alltagsfähigkeiten eigenständig üben und reflektieren",
    icon: "Wrench",
    color: "#F59E0B", // Orange
    orderIndex: 4,
  },
  {
    name: "bewegung",
    displayName: "Bewegung & Körper",
    description: "Neue physische Erfahrungen sammeln und Bewegungsfreude erleben",
    icon: "Activity",
    color: "#8B5CF6", // Purple
    orderIndex: 5,
  },
  {
    name: "kreativ",
    displayName: "Kreativ-Erfahrungen",
    description: "Kreative Ausdrucksformen mit Alltags- und Naturmaterialien erkunden",
    icon: "Palette",
    color: "#EF4444", // Red
    orderIndex: 6,
  },
];

// ========================================
// AUFGABEN-TEMPLATES (50+ Tasks)
// ========================================

interface TaskTemplate {
  title: string;
  description: string;
  instructions: string;
  categoryName: string;
  difficultyLevel: DifficultyLevel;
  ageGroup: AgeGroup;
  estimatedDuration: number;
  subjectConnections: string[];
  materials: string[];
  documentationFormats: string[];
  reflectionQuestions: string[];
  parentTips: string;
  keywords: string[];
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // ========== NATURERKUNDUNG ==========
  // Klasse 1-2, Entdecken
  {
    title: "Baum-Detektive: Vier Jahreszeiten beobachten",
    description: "Suche dir einen Baum in deiner Nähe aus und beobachte ihn über mehrere Monate hinweg. Wie verändert er sich?",
    instructions: "1. Wähle einen Baum in deiner Umgebung (Garten, Park, Schulweg)\n2. Mache jeden Monat ein Foto vom gleichen Baum\n3. Beobachte: Farben, Blätter, Früchte, Tiere\n4. Zeichne oder beschreibe die Veränderungen",
    categoryName: "naturerkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 30,
    subjectConnections: ["sachunterricht", "bildnerisches_gestalten"],
    materials: ["Keine (optional: Kamera/Handy, Papier, Stifte)"],
    documentationFormats: ["foto", "zeichnung"],
    reflectionQuestions: [
      "Was hast du heute am Baum entdeckt?",
      "Wie hat sich dein Baum verändert?",
      "Was war besonders schön oder interessant?"
    ],
    parentTips: "Gehen Sie jeden Monat gemeinsam zum selben Baum. Lassen Sie das Kind führen und selbst entdecken.",
    keywords: ["natur", "jahreszeiten", "beobachtung", "langzeitprojekt"]
  },
  {
    title: "Naturschatz-Sammlung",
    description: "Sammle interessante Dinge aus der Natur und erstelle deine eigene Sammlung.",
    instructions: "1. Gehe in den Garten, Park oder Wald\n2. Sammle verschiedene Naturmaterialien (Blätter, Steine, Zapfen)\n3. Sortiere sie nach Größe, Farbe oder Form\n4. Klebe deine Schätze auf und male drumherum",
    categoryName: "naturerkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 45,
    subjectConnections: ["sachunterricht", "mathematik"],
    materials: ["Sammeltasche", "Papier", "Kleber"],
    documentationFormats: ["foto", "collage"],
    reflectionQuestions: [
      "Welchen Schatz magst du am liebsten?",
      "Wo hast du ihn gefunden?",
      "Wie fühlt er sich an?"
    ],
    parentTips: "Lassen Sie Ihr Kind selbst entscheiden, was es sammeln möchte. Sprechen Sie über die Funde.",
    keywords: ["natur", "sammeln", "sortieren", "sinne"]
  },
  {
    title: "Wolken beobachten",
    description: "Schaue in den Himmel und entdecke verschiedene Wolkenformen.",
    instructions: "1. Suche dir einen gemütlichen Platz draußen\n2. Schaue 10 Minuten die Wolken an\n3. Male oder beschreibe, was du siehst (Tiere, Formen)\n4. Überlege: Wie bewegen sich die Wolken?",
    categoryName: "naturerkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 30,
    subjectConnections: ["sachunterricht", "deutsch"],
    materials: ["Keine"],
    documentationFormats: ["zeichnung", "text"],
    reflectionQuestions: [
      "Was hast du in den Wolken gesehen?",
      "Wie hat sich das angefühlt?",
      "Welche Form war am lustigsten?"
    ],
    parentTips: "Legen Sie sich gemeinsam ins Gras. Fantasie ist wichtiger als korrekte Wolkennamen.",
    keywords: ["natur", "beobachtung", "fantasie", "himmel"]
  },
  // Klasse 3-4, Entdecken - NATURERKUNDUNG
  {
    title: "Vögel beobachten am Futterplatz",
    description: "Richte einen Futterplatz ein und beobachte, welche Vögel kommen.",
    instructions: "1. Baue oder kaufe ein Vogelhäuschen\n2. Fülle es mit Vogelfutter\n3. Beobachte jeden Tag 15 Minuten\n4. Zeichne oder fotografiere die Vögel\n5. Zähle, wie viele verschiedene Arten kommen",
    categoryName: "naturerkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_3_4",
    estimatedDuration: 40,
    subjectConnections: ["sachunterricht", "mathematik"],
    materials: ["Vogelhäuschen", "Vogelfutter"],
    documentationFormats: ["foto", "zeichnung", "text"],
    reflectionQuestions: [
      "Welche Vögel hast du gesehen?",
      "Welches Futter mögen sie am liebsten?",
      "Wann kommen die meisten Vögel?"
    ],
    parentTips: "Installieren Sie das Futterhaus gemeinsam an einem guten Beobachtungsort.",
    keywords: ["vögel", "beobachtung", "natur", "tiere"]
  },
  {
    title: "Pflanzen-Tagebuch anlegen",
    description: "Pflanze einen Samen und beobachte, wie er wächst.",
    instructions: "1. Pflanze einen Samen (Bohne, Kresse, Sonnenblume)\n2. Gieße ihn regelmäßig\n3. Miss jeden Tag die Höhe\n4. Zeichne oder fotografiere das Wachstum\n5. Erstelle ein Wachstumsdiagramm",
    categoryName: "naturerkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_3_4",
    estimatedDuration: 30,
    subjectConnections: ["sachunterricht", "mathematik"],
    materials: ["Samen", "Erde", "Topf", "Lineal"],
    documentationFormats: ["foto", "diagramm", "zeichnung"],
    reflectionQuestions: [
      "Wie schnell wächst deine Pflanze?",
      "Was braucht sie zum Wachsen?",
      "Was hat dich überrascht?"
    ],
    parentTips: "Dieses Projekt lehrt Geduld und Verantwortung. Helfen Sie beim regelmäßigen Gießen.",
    keywords: ["pflanzen", "wachstum", "langzeitbeobachtung", "natur"]
  },

  // Klasse 3-4, Erforschen - NATURERKUNDUNG
  {
    title: "Insekten-Forscherin: Krabbeltiere entdecken",
    description: "Werde zur Insekten-Forscherin! Finde verschiedene Insekten und dokumentiere sie.",
    instructions: "1. Suche im Garten, Park oder Wald nach Insekten\n2. Beobachte sie aus der Nähe (nicht anfassen!)\n3. Mache Fotos oder zeichne sie\n4. Versuche herauszufinden, wie sie heißen\n5. Notiere: Wo leben sie? Was fressen sie?",
    categoryName: "naturerkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 60,
    subjectConnections: ["sachunterricht", "deutsch"],
    materials: ["Lupe (optional)", "Bestimmungsbuch oder App"],
    documentationFormats: ["foto", "zeichnung", "text"],
    reflectionQuestions: [
      "Welche Insekten hast du gefunden?",
      "Was hat dich am meisten überrascht?",
      "Welches Insekt war am interessantesten und warum?"
    ],
    parentTips: "Eine Lupe macht die Beobachtung spannender. Apps wie 'iNaturalist' helfen beim Bestimmen.",
    keywords: ["insekten", "natur", "forschung", "artenvielfalt"]
  },
  {
    title: "Wasser-Experimente: Bach oder Teich erforschen",
    description: "Untersuche ein Gewässer und seine Bewohner.",
    instructions: "1. Finde einen Bach, Teich oder See\n2. Beobachte das Wasser: Klar oder trüb? Fließend oder still?\n3. Suche nach Tieren (Frösche, Libellen, Wasserläufer)\n4. Sammle Wasser in einem Glas und untersuche es\n5. Dokumentiere deine Funde",
    categoryName: "naturerkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 70,
    subjectConnections: ["sachunterricht", "biologie"],
    materials: ["Glas", "Lupe", "Notizbuch"],
    documentationFormats: ["foto", "text", "zeichnung"],
    reflectionQuestions: [
      "Was lebt im Wasser?",
      "Wie unterscheidet sich das Wasser von Leitungswasser?",
      "Warum ist sauberes Wasser wichtig?"
    ],
    parentTips: "Sicherheit am Wasser beachten! Begleiten Sie Ihr Kind und achten Sie auf Uferbefestigung.",
    keywords: ["wasser", "gewässer", "ökosystem", "forschung"]
  },
  {
    title: "Boden-Detektive: Was lebt unter uns?",
    description: "Grabe ein Loch und untersuche die verschiedenen Bodenschichten.",
    instructions: "1. Suche einen geeigneten Platz (Garten, Wald)\n2. Grabe ein 30cm tiefes Loch\n3. Beobachte die Schichten: Farbe, Feuchtigkeit, Tiere\n4. Finde Lebewesen (Würmer, Käfer, Wurzeln)\n5. Fotografiere und beschreibe deine Funde",
    categoryName: "naturerkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 65,
    subjectConnections: ["sachunterricht", "biologie"],
    materials: ["Schaufel", "Handschuhe", "Lupe"],
    documentationFormats: ["foto", "text", "zeichnung"],
    reflectionQuestions: [
      "Welche Tiere leben im Boden?",
      "Wie sehen die verschiedenen Schichten aus?",
      "Warum ist der Boden wichtig?"
    ],
    parentTips: "Zeigen Sie, wie wichtig Bodenlebewesen für die Natur sind. Füllen Sie das Loch danach wieder.",
    keywords: ["boden", "ökosystem", "tiere", "schichten"]
  },

  // Klasse 3-4, Vertiefen - NATURERKUNDUNG
  {
    title: "Biodiversitäts-Inventar: Arten zählen",
    description: "Erstelle ein vollständiges Inventar aller Lebewesen in einem kleinen Bereich.",
    instructions: "1. Wähle einen 2x2 Meter Bereich (Garten, Wiese)\n2. Untersuche ihn systematisch über 2 Wochen\n3. Dokumentiere alle Pflanzen, Insekten, Vögel, andere Tiere\n4. Recherchiere ihre Namen und Lebensweise\n5. Erstelle eine illustrierte Artenliste",
    categoryName: "naturerkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 90,
    subjectConnections: ["sachunterricht", "biologie", "mathematik"],
    materials: ["Bestimmungsbücher/Apps", "Notizbuch", "Kamera"],
    documentationFormats: ["text", "foto", "diagramm"],
    reflectionQuestions: [
      "Wie viele verschiedene Arten hast du gefunden?",
      "Welche Zusammenhänge gibt es zwischen den Arten?",
      "Was würde passieren, wenn eine Art verschwindet?"
    ],
    parentTips: "Dieses Projekt lehrt wissenschaftliches Arbeiten. Unterstützen Sie bei der Recherche.",
    keywords: ["biodiversität", "artenschutz", "wissenschaft", "ökologie"]
  },

  // Klasse 5-6, Entdecken - NATURERKUNDUNG
  {
    title: "Sternenhimmel beobachten",
    description: "Entdecke Sternbilder und lerne den Nachthimmel kennen.",
    instructions: "1. Wähle eine klare Nacht ohne Vollmond\n2. Gehe an einen dunklen Ort\n3. Beobachte 30 Minuten den Himmel\n4. Finde 3-5 Sternbilder (mit App oder Sternkarte)\n5. Zeichne, was du siehst",
    categoryName: "naturerkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_5_6",
    estimatedDuration: 50,
    subjectConnections: ["sachunterricht", "physik"],
    materials: ["Sternkarte oder App", "Taschenlampe"],
    documentationFormats: ["zeichnung", "foto", "text"],
    reflectionQuestions: [
      "Welche Sternbilder hast du gefunden?",
      "Wie orientiert man sich am Himmel?",
      "Was ist der Unterschied zwischen Stern und Planet?"
    ],
    parentTips: "Begleiten Sie Ihr Kind. Warme Kleidung mitbringen! Nutzen Sie Astronomie-Apps.",
    keywords: ["astronomie", "sterne", "nacht", "wissenschaft"]
  },

  // Klasse 5-6, Erforschen - NATURERKUNDUNG
  {
    title: "Mikroskopie: Winzige Welten entdecken",
    description: "Untersuche Wasser, Pflanzen oder Insekten unter dem Mikroskop.",
    instructions: "1. Besorge ein einfaches Mikroskop (oder nutze eines in der Schule)\n2. Sammle Proben (Teichwasser, Blütenstaub, Zwiebelhaut)\n3. Präpariere Objektträger\n4. Beobachte und zeichne, was du siehst\n5. Recherchiere: Was sind das für Strukturen?",
    categoryName: "naturerkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 80,
    subjectConnections: ["biologie", "sachunterricht"],
    materials: ["Mikroskop", "Objektträger", "Proben"],
    documentationFormats: ["zeichnung", "foto", "text"],
    reflectionQuestions: [
      "Was hast du unter dem Mikroskop entdeckt?",
      "Wie unterscheiden sich die Proben?",
      "Warum ist Mikroskopie wichtig für die Wissenschaft?"
    ],
    parentTips: "Mikroskopie eröffnet faszinierende Einblicke. Helfen Sie beim sicheren Umgang mit dem Gerät.",
    keywords: ["mikroskopie", "biologie", "wissenschaft", "forschung"]
  },

  // Klasse 5-6, Vertiefen - NATURERKUNDUNG
  {
    title: "Wetter-Tagebuch: Meteorologie verstehen",
    description: "Führe über 4 Wochen ein Wettertagebuch und erkenne Muster im Wettergeschehen.",
    instructions: "1. Miss jeden Tag zur gleichen Zeit die Temperatur\n2. Beobachte Wolkentypen (Cumulus, Stratus, Cirrus)\n3. Notiere: Regen, Wind, Sonnenschein\n4. Erstelle Diagramme deiner Beobachtungen\n5. Vergleiche: Gibt es Muster oder Zusammenhänge?",
    categoryName: "naturerkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 90,
    subjectConnections: ["sachunterricht", "mathematik", "geografie"],
    materials: ["Thermometer", "Notizbuch"],
    documentationFormats: ["text", "foto", "diagramm"],
    reflectionQuestions: [
      "Welche Wettermuster hast du erkannt?",
      "Wie hängen Temperatur und Wolken zusammen?",
      "Kannst du das Wetter für morgen vorhersagen?"
    ],
    parentTips: "Zeigen Sie Ihrem Kind Wettervorhersagen und vergleichen Sie diese mit den eigenen Beobachtungen.",
    keywords: ["wetter", "meteorologie", "datenerfassung", "wissenschaft"]
  },
  {
    title: "Wetter-Tagebuch: Meteorologie verstehen",
    description: "Führe über 4 Wochen ein Wettertagebuch und erkenne Muster im Wettergeschehen.",
    instructions: "1. Miss jeden Tag zur gleichen Zeit die Temperatur\n2. Beobachte Wolkentypen (Cumulus, Stratus, Cirrus)\n3. Notiere: Regen, Wind, Sonnenschein\n4. Erstelle Diagramme deiner Beobachtungen\n5. Vergleiche: Gibt es Muster oder Zusammenhänge?",
    categoryName: "naturerkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 90,
    subjectConnections: ["sachunterricht", "mathematik", "geografie"],
    materials: ["Thermometer", "Notizbuch"],
    documentationFormats: ["text", "foto", "diagramm"],
    reflectionQuestions: [
      "Welche Wettermuster hast du erkannt?",
      "Wie hängen Temperatur und Wolken zusammen?",
      "Kannst du das Wetter für morgen vorhersagen?"
    ],
    parentTips: "Zeigen Sie Ihrem Kind Wettervorhersagen und vergleichen Sie diese mit den eigenen Beobachtungen.",
    keywords: ["wetter", "meteorologie", "datenerfassung", "wissenschaft"]
  },

  // ========== GEMEINSCHAFTSERKUNDUNG ==========
  {
    title: "Gemeinde-Karte: Meine Umgebung kartieren",
    description: "Erstelle deine eigene Karte der Gemeinde mit wichtigen und interessanten Orten.",
    instructions: "1. Zeichne eine einfache Karte deiner Gemeinde\n2. Markiere: Schule, Läden, Parks, dein Zuhause\n3. Male Symbole für verschiedene Orte\n4. Ergänze besondere Plätze, die dir wichtig sind",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 45,
    subjectConnections: ["sachunterricht", "bildnerisches_gestalten"],
    materials: ["Papier", "Stifte"],
    documentationFormats: ["zeichnung", "foto"],
    reflectionQuestions: [
      "Welche Orte sind dir besonders wichtig?",
      "Was gibt es alles in deiner Gemeinde?",
      "Welchen Ort möchtest du noch genauer erkunden?"
    ],
    parentTips: "Gehen Sie gemeinsam die Orte ab. Lassen Sie Ihr Kind die wichtigsten Orte selbst bestimmen.",
    keywords: ["gemeinde", "orientierung", "kartografie", "heimat"]
  },
  {
    title: "Berufe-Reporter: Interviews mit Handwerkern",
    description: "Werde Reporter und interviewe Menschen aus deiner Gemeinde über ihre Berufe.",
    instructions: "1. Wähle 2-3 Berufe aus (Bäcker, Busfahrer, Bibliothekar, Handwerker)\n2. Überlege dir 5 Fragen\n3. Führe die Interviews (mit Eltern-Begleitung)\n4. Notiere oder filme die Antworten\n5. Erstelle einen kleinen Bericht",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 75,
    subjectConnections: ["sachunterricht", "deutsch"],
    materials: ["Fragen-Liste", "Handy für Fotos/Videos (optional)"],
    documentationFormats: ["text", "audio", "foto", "video"],
    reflectionQuestions: [
      "Was macht der Beruf besonders interessant?",
      "Was hat dich überrascht?",
      "Könntest du dir diesen Beruf auch vorstellen?"
    ],
    parentTips: "Helfen Sie beim Kontaktieren der Personen. Begleiten Sie Ihr Kind bei den Interviews.",
    keywords: ["berufe", "interview", "gemeinde", "soziales_lernen"]
  },
  {
    title: "Gemeinde-Geschichte: Spurensuche in der Vergangenheit",
    description: "Erforsche die Geschichte deiner Gemeinde und entdecke, wie Menschen früher hier gelebt haben.",
    instructions: "1. Besuche das Gemeindearchiv oder Museum\n2. Interviewe ältere Menschen (Großeltern, Nachbarn)\n3. Finde historische Fotos und Dokumente\n4. Erstelle eine Timeline der wichtigsten Ereignisse\n5. Vergleiche: Früher vs. Heute",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 90,
    subjectConnections: ["sachunterricht", "geschichte", "deutsch"],
    materials: ["Notizbuch", "Kamera"],
    documentationFormats: ["text", "foto", "timeline", "audio"],
    reflectionQuestions: [
      "Was hat sich in deiner Gemeinde verändert?",
      "Welche Geschichten haben dich bewegt?",
      "Was möchtest du für die Zukunft bewahren?"
    ],
    parentTips: "Begleiten Sie Ihr Kind bei Archiv-Besuchen. Teilen Sie eigene Erinnerungen.",
    keywords: ["geschichte", "gemeinde", "zeitzeuge", "forschung"]
  },

  // ========== FAMILIENINTERAKTION ==========
  {
    title: "Gemeinsam Kochen: Familien-Rezept",
    description: "Kocht gemeinsam ein Lieblingsrezept und dokumentiert den Prozess.",
    instructions: "1. Wählt zusammen ein Rezept aus\n2. Kauft gemeinsam die Zutaten ein\n3. Kocht Schritt für Schritt zusammen\n4. Macht Fotos vom Prozess\n5. Schreibt das Rezept auf",
    categoryName: "familieninteraktion",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 60,
    subjectConnections: ["sachunterricht", "mathematik"],
    materials: ["Lebensmittel laut Rezept", "Küchenutensilien"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Was hat am meisten Spaß gemacht?",
      "Wie hat es geschmeckt?",
      "Was hast du gelernt?"
    ],
    parentTips: "Lassen Sie Ihr Kind möglichst viel selbst machen. Sicherheit geht vor!",
    keywords: ["kochen", "familie", "mathematik", "alltagskompetenz"]
  },
  {
    title: "Familiengeschichte: Stammbaum erstellen",
    description: "Erforsche deine Familiengeschichte und erstelle einen Stammbaum.",
    instructions: "1. Interviewe Großeltern und Eltern\n2. Sammle alte Fotos\n3. Zeichne einen Stammbaum mit allen Familienmitgliedern\n4. Notiere besondere Geschichten\n5. Gestalte den Stammbaum kreativ",
    categoryName: "familieninteraktion",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 75,
    subjectConnections: ["sachunterricht", "deutsch", "bildnerisches_gestalten"],
    materials: ["Papier", "Stifte", "alte Fotos"],
    documentationFormats: ["zeichnung", "text", "foto"],
    reflectionQuestions: [
      "Welche Geschichten haben dich beeindruckt?",
      "Was verbindet deine Familie?",
      "Welche Traditionen gibt es in deiner Familie?"
    ],
    parentTips: "Erzählen Sie Geschichten aus Ihrer Kindheit. Zeigen Sie alte Fotoalben.",
    keywords: ["familie", "geschichte", "identität", "generationen"]
  },
  {
    title: "Familien-Projekt: Gemeinsam etwas bauen",
    description: "Plant und realisiert zusammen ein Handwerks- oder Bauprojekt.",
    instructions: "1. Überlegt gemeinsam: Was wollen wir bauen? (Vogelhaus, Regal, Baumhaus)\n2. Plant das Projekt: Material, Werkzeug, Schritte\n3. Führt das Projekt gemeinsam durch\n4. Dokumentiert den Prozess mit Fotos\n5. Reflektiert: Was lief gut? Was war schwierig?",
    categoryName: "familieninteraktion",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 120,
    subjectConnections: ["werken", "mathematik", "sachunterricht"],
    materials: ["Je nach Projekt: Holz, Werkzeug, Nägel, etc."],
    documentationFormats: ["foto", "text", "bauplan"],
    reflectionQuestions: [
      "Was war die größte Herausforderung?",
      "Wie habt ihr Probleme gelöst?",
      "Was habt ihr über Teamarbeit gelernt?"
    ],
    parentTips: "Planen Sie das Projekt gemeinsam. Lassen Sie Ihr Kind eigene Ideen einbringen.",
    keywords: ["handwerk", "familie", "projekt", "zusammenarbeit"]
  },

  // ========== LEBENSKOMPETENZEN ==========
  {
    title: "Wäsche-Experte: Kleidung pflegen",
    description: "Lerne, wie man Wäsche richtig wäscht und pflegt.",
    instructions: "1. Sortiere Wäsche nach Farben\n2. Wasche eine Ladung (mit Hilfe)\n3. Hänge die Wäsche auf\n4. Falte sie zusammen\n5. Erkläre: Was hast du gelernt?",
    categoryName: "lebenskompetenzen",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 45,
    subjectConnections: ["sachunterricht"],
    materials: ["Schmutzige Wäsche", "Waschmaschine"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Warum sortiert man Wäsche?",
      "Was war einfach, was war schwierig?",
      "Möchtest du das öfter machen?"
    ],
    parentTips: "Erklären Sie die Waschmaschine. Lassen Sie Ihr Kind die Wäsche selbst sortieren.",
    keywords: ["haushalt", "selbstständigkeit", "alltagskompetenz"]
  },
  {
    title: "Einkaufs-Profi: Preise vergleichen und budgetieren",
    description: "Gehe einkaufen und lerne, Preise zu vergleichen und mit einem Budget umzugehen.",
    instructions: "1. Erstelle eine Einkaufsliste (5 Produkte)\n2. Setze ein Budget (z.B. 20 CHF)\n3. Vergleiche Preise im Laden\n4. Kaufe innerhalb des Budgets ein\n5. Rechne aus: Wie viel hast du gespart?",
    categoryName: "lebenskompetenzen",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 60,
    subjectConnections: ["mathematik", "sachunterricht"],
    materials: ["Einkaufsliste", "Geld/Karte"],
    documentationFormats: ["foto", "text", "rechnung"],
    reflectionQuestions: [
      "Welche Produkte waren teuer, welche günstig?",
      "Wie hast du entschieden, was du kaufst?",
      "Was hast du über Geld gelernt?"
    ],
    parentTips: "Begleiten Sie Ihr Kind beim Einkaufen. Lassen Sie es Entscheidungen treffen.",
    keywords: ["mathematik", "geld", "einkaufen", "budgetierung"]
  },
  {
    title: "Reparatur-Werkstatt: Dinge reparieren statt wegwerfen",
    description: "Finde kaputte Dinge und repariere sie oder lerne, wie man sie repariert.",
    instructions: "1. Finde 2-3 kaputte Gegenstände (Spielzeug, Kleidung, etc.)\n2. Analysiere: Was ist kaputt?\n3. Recherchiere: Wie kann man es reparieren?\n4. Führe die Reparatur durch (mit Hilfe)\n5. Dokumentiere vorher/nachher",
    categoryName: "lebenskompetenzen",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 90,
    subjectConnections: ["werken", "sachunterricht", "nachhaltigkeit"],
    materials: ["Kaputte Gegenstände", "Werkzeug", "Nähzeug"],
    documentationFormats: ["foto", "text", "video"],
    reflectionQuestions: [
      "Was hast du über Reparieren gelernt?",
      "Warum ist Reparieren besser als Wegwerfen?",
      "Welche Fähigkeiten hast du entwickelt?"
    ],
    parentTips: "Unterstützen Sie beim Reparieren. Erklären Sie, warum Reparieren wichtig ist.",
    keywords: ["reparatur", "nachhaltigkeit", "werken", "problemlösung"]
  },

  // ========== BEWEGUNG & KÖRPERERFAHRUNG ==========
  {
    title: "Neue Sportart ausprobieren",
    description: "Probiere eine Sportart aus, die du noch nie gemacht hast.",
    instructions: "1. Wähle eine neue Sportart (Skateboard, Klettern, Yoga, Tanzen)\n2. Probiere sie mindestens 2x aus\n3. Dokumentiere: Wie fühlst du dich?\n4. Was ist schwierig? Was macht Spaß?\n5. Würdest du weitermachen?",
    categoryName: "bewegung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 60,
    subjectConnections: ["bewegung_sport"],
    materials: ["Sportausrüstung je nach Sportart"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Wie hat sich dein Körper angefühlt?",
      "Was war neu für dich?",
      "Hat es Spaß gemacht?"
    ],
    parentTips: "Begleiten Sie Ihr Kind bei neuen Aktivitäten. Sicherheit beachten!",
    keywords: ["sport", "bewegung", "gesundheit", "körpererfahrung"]
  },
  {
    title: "Bewegungs-Tagebuch: Eine Woche aktiv",
    description: "Führe eine Woche lang ein Bewegungstagebuch.",
    instructions: "1. Notiere jeden Tag: Welche Bewegung hast du gemacht?\n2. Wie lange? Wie hat es sich angefühlt?\n3. Probiere jeden Tag etwas anderes\n4. Erstelle ein Diagramm deiner Aktivitäten\n5. Reflektiere: Wie wirkt Bewegung auf dich?",
    categoryName: "bewegung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 45,
    subjectConnections: ["bewegung_sport", "sachunterricht"],
    materials: ["Notizbuch"],
    documentationFormats: ["text", "diagramm"],
    reflectionQuestions: [
      "Welche Bewegung hat am meisten Spaß gemacht?",
      "Wie fühlst du dich nach Bewegung?",
      "Wie viel bewegst du dich pro Tag?"
    ],
    parentTips: "Motivieren Sie Ihr Kind zu verschiedenen Aktivitäten. Machen Sie mit!",
    keywords: ["bewegung", "gesundheit", "selbstreflexion", "fitness"]
  },
  {
    title: "Natur-Orientierungslauf: Draußen navigieren",
    description: "Erstelle einen Orientierungslauf in der Natur und lerne, dich zu orientieren.",
    instructions: "1. Wähle ein Gelände (Wald, Park)\n2. Erstelle eine Karte mit 5-10 Stationen\n3. Verstecke an jeder Station ein Rätsel oder Aufgabe\n4. Lade Freunde/Familie ein\n5. Führe den Orientierungslauf durch",
    categoryName: "bewegung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 120,
    subjectConnections: ["bewegung_sport", "sachunterricht", "mathematik"],
    materials: ["Karte", "Kompass (optional)", "Stift"],
    documentationFormats: ["karte", "foto", "text"],
    reflectionQuestions: [
      "Wie hast du dich orientiert?",
      "Was war die größte Herausforderung?",
      "Was hast du über Navigation gelernt?"
    ],
    parentTips: "Helfen Sie beim Erstellen der Karte. Begleiten Sie beim ersten Durchlauf.",
    keywords: ["orientierung", "natur", "bewegung", "navigation"]
  },

  // ========== KREATIV ==========
  // Klasse 1-2, Entdecken
  {
    title: "Land-Art: Kunstwerke aus Naturmaterialien",
    description: "Erschaffe vergängliche Kunstwerke in und mit der Natur.",
    instructions: "1. Sammle Naturmaterialien (Steine, Blätter, Äste)\n2. Gestalte ein Kunstwerk im Freien\n3. Fotografiere dein Werk\n4. Lass es der Natur zurück\n5. Erkläre deine Idee",
    categoryName: "kreativ",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 45,
    subjectConnections: ["bildnerisches_gestalten", "sachunterricht"],
    materials: ["Naturmaterialien"],
    documentationFormats: ["foto"],
    reflectionQuestions: [
      "Was hast du erschaffen?",
      "Warum hast du diese Materialien gewählt?",
      "Wie fühlst du dich, wenn du dein Kunstwerk ansiehst?"
    ],
    parentTips: "Gehen Sie gemeinsam in die Natur. Lassen Sie Ihr Kind frei gestalten.",
    keywords: ["kunst", "natur", "kreativität", "vergänglichkeit"]
  },
  {
    title: "Fingerfarben-Experiment",
    description: "Entdecke Farben und Muster mit deinen Händen.",
    instructions: "1. Bereite einen Platz mit Fingerfarben vor\n2. Male ohne Pinsel, nur mit deinen Fingern\n3. Probiere Muster, Kreise, Linien aus\n4. Mache ein Foto von deinem Kunstwerk",
    categoryName: "kreativ",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 40,
    subjectConnections: ["bildnerisches_gestalten"],
    materials: ["Fingerfarben", "Papier"],
    documentationFormats: ["foto"],
    reflectionQuestions: [
      "Welche Farbe magst du am liebsten?",
      "Wie hat es sich angefühlt?",
      "Was hast du gemalt?"
    ],
    parentTips: "Lassen Sie das Kind frei experimentieren. Es geht um den Prozess, nicht das Ergebnis.",
    keywords: ["kunst", "farben", "sinne", "kreativität"]
  },
  {
    title: "Musik aus Alltagsgegenständen",
    description: "Mache Musik mit Dingen aus deinem Zuhause.",
    instructions: "1. Finde 5 Gegenstände, die Geräusche machen (Töpfe, Dosen, Flaschen)\n2. Probiere verschiedene Töne aus\n3. Erfinde einen kurzen Rhythmus\n4. Spiele ihn deiner Familie vor",
    categoryName: "kreativ",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 35,
    subjectConnections: ["musik"],
    materials: ["Haushaltsgegenstände"],
    documentationFormats: ["audio", "foto"],
    reflectionQuestions: [
      "Welcher Gegenstand klingt am besten?",
      "Hat dir das Musikmachen Spaß gemacht?",
      "Was war schwierig?"
    ],
    parentTips: "Seien Sie geduldig mit Lärm. Musik fördert Kreativität und Rhythmusgefühl.",
    keywords: ["musik", "kreativität", "rhythmus", "experiment"]
  },

  // Klasse 1-2, Erforschen
  {
    title: "Schattenspiel-Theater",
    description: "Erstelle ein Schattentheater und erzähle eine Geschichte.",
    instructions: "1. Baue eine Leinwand (weißes Tuch + Lampe)\n2. Schneide Figuren aus Pappe aus\n3. Übe eine kurze Geschichte (2-3 Minuten)\n4. Führe sie deiner Familie vor\n5. Fotografiere oder filme deine Vorstellung",
    categoryName: "kreativ",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_1_2",
    estimatedDuration: 60,
    subjectConnections: ["bildnerisches_gestalten", "deutsch"],
    materials: ["Pappe", "Lampe", "weißes Tuch"],
    documentationFormats: ["foto", "video"],
    reflectionQuestions: [
      "Welche Geschichte hast du erzählt?",
      "Was war beim Schattenspiel schwierig?",
      "Hat dir das Aufführen Spaß gemacht?"
    ],
    parentTips: "Helfen Sie beim Aufbau. Lassen Sie das Kind die Geschichte selbst entwickeln.",
    keywords: ["theater", "schatten", "storytelling", "kreativität"]
  },
  {
    title: "Recycling-Kunst: Aus Alt mach Neu",
    description: "Verwandle Verpackungsmaterial in Kunstwerke.",
    instructions: "1. Sammle Verpackungen (Kartons, Joghurtbecher, Zeitungen)\n2. Überlege, was du bauen möchtest (Roboter, Tier, Fahrzeug)\n3. Klebe, male und gestalte\n4. Präsentiere dein Werk\n5. Erkläre, was du verwendet hast",
    categoryName: "kreativ",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_1_2",
    estimatedDuration: 55,
    subjectConnections: ["bildnerisches_gestalten", "sachunterricht"],
    materials: ["Verpackungsmaterial", "Kleber", "Farben"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Was hast du gebaut?",
      "Welche Materialien hast du benutzt?",
      "Würdest du wieder etwas aus Müll bauen?"
    ],
    parentTips: "Recycling-Kunst verbindet Kreativität mit Umweltbewusstsein.",
    keywords: ["recycling", "kunst", "nachhaltigkeit", "basteln"]
  },

  // Klasse 1-2, Vertiefen
  {
    title: "Stop-Motion-Film erstellen",
    description: "Erstelle einen kurzen Trickfilm mit Fotos.",
    instructions: "1. Überlege dir eine kurze Geschichte\n2. Baue deine Szene mit Spielzeug oder Figuren\n3. Mache viele Fotos, bewege die Figuren nur ein kleines Stück\n4. Füge die Fotos zu einem Film zusammen (mit App)\n5. Zeige deinen Film",
    categoryName: "kreativ",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_1_2",
    estimatedDuration: 90,
    subjectConnections: ["bildnerisches_gestalten", "medienbildung"],
    materials: ["Spielzeug/Figuren", "Kamera/Handy", "Stop-Motion-App"],
    documentationFormats: ["video"],
    reflectionQuestions: [
      "Wie hast du deinen Film gemacht?",
      "Was war am schwierigsten?",
      "Was würdest du beim nächsten Mal anders machen?"
    ],
    parentTips: "Helfen Sie beim technischen Setup. Der Prozess ist wichtiger als ein perfektes Ergebnis.",
    keywords: ["film", "animation", "storytelling", "medien"]
  },

  // Klasse 3-4, Entdecken
  {
    title: "Foto-Rallye: Die Welt durch die Linse",
    description: "Gehe auf Foto-Rallye und entdecke deine Umgebung mit der Kamera.",
    instructions: "1. Wähle ein Thema (Farben, Formen, Emotionen)\n2. Mache 10-15 Fotos zu diesem Thema\n3. Wähle die 5 besten aus\n4. Erstelle eine kleine Ausstellung\n5. Erkläre: Warum diese Fotos?",
    categoryName: "kreativ",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_3_4",
    estimatedDuration: 60,
    subjectConnections: ["bildnerisches_gestalten", "deutsch"],
    materials: ["Kamera oder Handy"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Was wolltest du mit deinen Fotos zeigen?",
      "Welches Foto magst du am liebsten?",
      "Was hast du über Fotografie gelernt?"
    ],
    parentTips: "Geben Sie Ihrem Kind Zeit zum Experimentieren. Besprechen Sie die Fotos gemeinsam.",
    keywords: ["fotografie", "kreativität", "perspektive", "kunst"]
  },
  {
    title: "Naturfarben selbst herstellen",
    description: "Stelle eigene Farben aus natürlichen Materialien her.",
    instructions: "1. Sammle färbende Naturmaterialien (Beeren, Rote Bete, Spinat, Kurkuma)\n2. Zerdrücke oder koche sie\n3. Teste die Farben auf Papier\n4. Male ein Bild mit deinen selbstgemachten Farben\n5. Dokumentiere dein Rezept",
    categoryName: "kreativ",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 70,
    subjectConnections: ["bildnerisches_gestalten", "sachunterricht"],
    materials: ["Naturmaterialien", "Mörser oder Topf", "Papier"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Welche Farben hast du hergestellt?",
      "Welches Material ergab die schönste Farbe?",
      "Was hast du über Naturfarben gelernt?"
    ],
    parentTips: "Experimentieren Sie gemeinsam. Zeigen Sie, dass Kunst früher immer so gemacht wurde.",
    keywords: ["kunst", "natur", "farben", "experiment"]
  },

  // Klasse 3-4, Vertiefen
  {
    title: "Podcast-Projekt: Deine eigene Sendung",
    description: "Erstelle eine kurze Podcast-Episode über ein Thema deiner Wahl.",
    instructions: "1. Wähle ein Thema, das dich interessiert\n2. Recherchiere Informationen\n3. Schreibe ein Skript (3-5 Minuten)\n4. Nimm deinen Podcast auf\n5. Spiele ihn deiner Klasse vor",
    categoryName: "kreativ",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_3_4",
    estimatedDuration: 90,
    subjectConnections: ["deutsch", "medienbildung"],
    materials: ["Aufnahmegerät/Handy", "Notizen"],
    documentationFormats: ["audio", "text"],
    reflectionQuestions: [
      "Worüber hast du gesprochen?",
      "Was war beim Aufnehmen schwierig?",
      "Wie hat es sich angefühlt, deine Stimme zu hören?"
    ],
    parentTips: "Helfen Sie bei der Aufnahmetechnik. Inhalt und Präsentation sind wichtiger als Perfektion.",
    keywords: ["medien", "podcast", "kommunikation", "präsentation"]
  },

  // Klasse 5-6, Entdecken
  {
    title: "Comic-Story: Erlebnisse als Geschichte",
    description: "Verwandle ein Erlebnis in eine Comic-Geschichte.",
    instructions: "1. Wähle ein besonderes Erlebnis aus\n2. Überlege: Anfang, Mitte, Ende\n3. Zeichne 6-8 Panels\n4. Füge Sprechblasen hinzu\n5. Gestalte ein Cover",
    categoryName: "kreativ",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_5_6",
    estimatedDuration: 90,
    subjectConnections: ["bildnerisches_gestalten", "deutsch"],
    materials: ["Papier", "Stifte"],
    documentationFormats: ["zeichnung", "text"],
    reflectionQuestions: [
      "Warum hast du dieses Erlebnis gewählt?",
      "Was war beim Zeichnen schwierig?",
      "Wie hast du die Geschichte strukturiert?"
    ],
    parentTips: "Zeigen Sie Comics als Inspiration. Ermutigen Sie zum Experimentieren.",
    keywords: ["comic", "storytelling", "kreativität", "illustration"]
  },
  {
    title: "Digitale Kunst: Grafikdesign-Projekt",
    description: "Erstelle ein digitales Kunstwerk oder Poster.",
    instructions: "1. Wähle ein Thema (Event, Umweltschutz, Motivation)\n2. Nutze eine Design-App (Canva, Procreate, GIMP)\n3. Experimentiere mit Farben, Schriften, Formen\n4. Erstelle ein finales Design\n5. Teile und erkläre deine Entscheidungen",
    categoryName: "kreativ",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 75,
    subjectConnections: ["bildnerisches_gestalten", "medienbildung"],
    materials: ["Computer/Tablet", "Design-App"],
    documentationFormats: ["foto", "digital"],
    reflectionQuestions: [
      "Was wolltest du mit deinem Design ausdrücken?",
      "Welche Tools hast du verwendet?",
      "Was hast du über digitale Kunst gelernt?"
    ],
    parentTips: "Ermutigen Sie Kreativität mit digitalen Tools. Zeigen Sie professionelle Designs als Inspiration.",
    keywords: ["digitale_kunst", "design", "medien", "kreativität"]
  },

  // Klasse 5-6, Vertiefen
  {
    title: "Video-Dokumentation erstellen",
    description: "Erstelle eine professionelle Mini-Dokumentation über ein Thema.",
    instructions: "1. Wähle ein Thema (Natur, Geschichte, Person)\n2. Recherchiere und plane deine Szenen\n3. Filme verschiedene Einstellungen (Interviews, B-Roll)\n4. Schneide deinen Film (3-5 Minuten)\n5. Füge Musik und Titel hinzu",
    categoryName: "kreativ",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 120,
    subjectConnections: ["medienbildung", "deutsch", "bildnerisches_gestalten"],
    materials: ["Kamera/Handy", "Videoschnittprogramm"],
    documentationFormats: ["video"],
    reflectionQuestions: [
      "Was war deine größte Herausforderung?",
      "Wie hast du deine Szenen geplant?",
      "Was würdest du beim nächsten Projekt anders machen?"
    ],
    parentTips: "Unterstützen Sie bei Technik und Planung. Kreativität und Lernprozess sind wichtiger als Hollywood-Qualität.",
    keywords: ["video", "dokumentation", "medien", "storytelling"]
  },
];

// ========================================
// REFLEXIONSFRAGEN PRO ALTERSGRUPPE
// ========================================

export const REFLECTION_QUESTIONS = {
  klasse_1_2: [
    "Was habe ich heute gemacht?",
    "Wie habe ich mich gefühlt?",
    "Was war lustig?",
    "Was hat mir gefallen?",
    "Möchte ich das nochmal machen?"
  ],
  klasse_3_4: [
    "Was habe ich gelernt?",
    "Wen bin ich begegnet?",
    "Was war überraschend?",
    "Was war schwierig?",
    "Würde ich das gerne nochmal machen?",
    "Was würde ich anders machen?"
  ],
  klasse_5_6: [
    "Was habe ich heute gelernt?",
    "Welche Muster oder Verbindungen sehe ich?",
    "Wie hat sich mein Verständnis verändert?",
    "Was möchte ich nächstes Mal anders machen?",
    "Wie kann ich dieses Wissen nutzen?",
    "Was bedeutet diese Erfahrung für mich?"
  ]
};

// ========================================
// GENERATOR-FUNKTIONEN
// ========================================

export interface TaskGeneratorParams {
  categoryName?: string;
  difficultyLevel?: DifficultyLevel;
  ageGroup?: AgeGroup;
  keywords?: string[];
  count?: number;
}

/**
 * Generiert Aufgaben basierend auf Parametern
 */
export function generateTasks(params: TaskGeneratorParams): TaskTemplate[] {
  let filteredTasks = [...TASK_TEMPLATES];

  console.log('🔍 Generate tasks params:', params);
  console.log('📚 Total available tasks:', TASK_TEMPLATES.length);

  // Filter by category
  if (params.categoryName) {
    filteredTasks = filteredTasks.filter(t => t.categoryName === params.categoryName);
    console.log(`📦 After category filter (${params.categoryName}):`, filteredTasks.length);
  }

  // Filter by difficulty
  if (params.difficultyLevel) {
    filteredTasks = filteredTasks.filter(t => t.difficultyLevel === params.difficultyLevel);
    console.log(`⚡ After difficulty filter (${params.difficultyLevel}):`, filteredTasks.length);
  }

  // Filter by age group
  if (params.ageGroup) {
    filteredTasks = filteredTasks.filter(t => t.ageGroup === params.ageGroup);
    console.log(`👶 After age group filter (${params.ageGroup}):`, filteredTasks.length);
  }

  // Filter by keywords
  if (params.keywords && params.keywords.length > 0) {
    filteredTasks = filteredTasks.filter(t =>
      params.keywords!.some(kw => t.keywords.includes(kw.toLowerCase()))
    );
    console.log(`🏷️ After keywords filter:`, filteredTasks.length);
  }

  // FALLBACK: If no tasks match exact criteria, relax filters progressively
  if (filteredTasks.length === 0) {
    console.warn('⚠️ No exact matches, relaxing filters...');

    // Try without keywords
    filteredTasks = [...TASK_TEMPLATES].filter(t => {
      const categoryMatch = !params.categoryName || t.categoryName === params.categoryName;
      const difficultyMatch = !params.difficultyLevel || t.difficultyLevel === params.difficultyLevel;
      const ageMatch = !params.ageGroup || t.ageGroup === params.ageGroup;
      return categoryMatch && difficultyMatch && ageMatch;
    });

    console.log('🔄 After relaxing keywords filter:', filteredTasks.length);

    // If still no match, try without difficulty
    if (filteredTasks.length === 0 && params.categoryName && params.ageGroup) {
      filteredTasks = TASK_TEMPLATES.filter(t => 
        t.categoryName === params.categoryName && t.ageGroup === params.ageGroup
      );
      console.log('🔄 After relaxing difficulty filter:', filteredTasks.length);
    }

    // If STILL no match, just use category
    if (filteredTasks.length === 0 && params.categoryName) {
      filteredTasks = TASK_TEMPLATES.filter(t => t.categoryName === params.categoryName);
      console.log('🔄 After using only category filter:', filteredTasks.length);
    }

    // Last resort: return any tasks
    if (filteredTasks.length === 0) {
      console.error('❌ No tasks found even with relaxed filters, returning first 3 tasks');
      filteredTasks = TASK_TEMPLATES.slice(0, 3);
    }
  }

  // Shuffle and limit
  const shuffled = filteredTasks.sort(() => Math.random() - 0.5);
  const count = params.count || 3;

  const result = shuffled.slice(0, count);
  console.log('✅ Returning', result.length, 'tasks');

  return result;
}

/**
 * Holt passende Reflexionsfragen für Altersgruppe
 */
export function getReflectionQuestions(ageGroup: AgeGroup, count: number = 3): string[] {
  const questions = REFLECTION_QUESTIONS[ageGroup] || REFLECTION_QUESTIONS.klasse_3_4;
  return questions.slice(0, count);
}

/**
 * Erstellt eine vollständige Aufgabe aus einem Template
 */
export function createTaskFromTemplate(template: TaskTemplate): Omit<LivingLifeTask, 'id' | 'categoryId' | 'createdAt' | 'updatedAt'> {
  return {
    category_name: template.categoryName,
    title: template.title,
    description: template.description,
    instructions: template.instructions,
    difficultyLevel: template.difficultyLevel,
    ageGroup: template.ageGroup,
    estimatedDuration: template.estimatedDuration,
    subjectConnections: template.subjectConnections,
    materials: template.materials,
    documentationFormats: template.documentationFormats,
    reflectionQuestions: template.reflectionQuestions,
    parentTips: template.parentTips,
    variations: null,
    keywords: template.keywords,
    isActive: 1,
  };
}

/**
 * Generiert automatisch eine Wochenplanung mit ausgewogenen Aufgaben
 */
export function generateWeeklyPlan(ageGroup: AgeGroup): TaskTemplate[] {
  const categories = LIVING_LIFE_CATEGORIES.map(c => c.name);
  const weekPlan: TaskTemplate[] = [];

  // Wähle aus jeder Kategorie eine Aufgabe
  for (const category of categories.slice(0, 5)) { // 5 Tage Woche
    const categoryTasks = TASK_TEMPLATES.filter(t =>
      t.categoryName === category && t.ageGroup === ageGroup
    );

    if (categoryTasks.length > 0) {
      const randomTask = categoryTasks[Math.floor(Math.random() * categoryTasks.length)];
      weekPlan.push(randomTask);
    }
  }

  return weekPlan;
}