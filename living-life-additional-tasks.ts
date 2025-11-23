// Zusätzliche Living Life Aufgaben für vollständige Kategorie-Abdeckung
// Diese werden in living-life-generator.ts importiert

import type { TaskTemplate } from "./living-life-generator";

export const ADDITIONAL_TASK_TEMPLATES: TaskTemplate[] = [
  // ========== GEMEINSCHAFTSERKUNDUNG - Alle Kombinationen ==========
  // Klasse 1-2, Entdecken
  {
    title: "Nachbarschafts-Spaziergang",
    description: "Erkunde deine direkte Nachbarschaft und lerne neue Menschen kennen.",
    instructions: "1. Gehe mit deiner Familie spazieren\n2. Grüße mindestens 3 Nachbarn\n3. Entdecke interessante Orte (Spielplatz, Laden, Park)\n4. Male eine Karte deiner Straße",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 40,
    subjectConnections: ["sachunterricht"],
    materials: ["Papier", "Stifte"],
    documentationFormats: ["zeichnung"],
    reflectionQuestions: [
      "Wen hast du getroffen?",
      "Was hast du Neues entdeckt?",
      "Magst du deine Nachbarschaft?"
    ],
    parentTips: "Ermutigen Sie Ihr Kind, freundlich zu grüßen. Zeigen Sie Interesse an der Umgebung.",
    keywords: ["nachbarschaft", "gemeinschaft", "orientierung"]
  },
  {
    title: "Spielplatz-Forscher",
    description: "Besuche einen Spielplatz und beobachte, was dort passiert.",
    instructions: "1. Gehe zu einem Spielplatz\n2. Zähle, wie viele Kinder dort sind\n3. Welche Spielgeräte gibt es?\n4. Zeichne deinen Lieblings-Spielplatz\n5. Spiele mit einem neuen Kind",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_1_2",
    estimatedDuration: 45,
    subjectConnections: ["sachunterricht", "bewegung_sport"],
    materials: ["Keine"],
    documentationFormats: ["zeichnung", "foto"],
    reflectionQuestions: [
      "Was hat am meisten Spaß gemacht?",
      "Hast du neue Freunde gefunden?",
      "Welches Spielgerät magst du am liebsten?"
    ],
    parentTips: "Soziale Interaktion ist wichtig. Ermutigen Sie zum Kontakt mit anderen Kindern.",
    keywords: ["spielplatz", "sozial", "bewegung", "gemeinschaft"]
  },

  // Klasse 1-2, Erforschen
  {
    title: "Laden-Entdecker: Verschiedene Geschäfte besuchen",
    description: "Besuche 3 verschiedene Geschäfte und finde heraus, was sie verkaufen.",
    instructions: "1. Wähle 3 Läden in der Nähe (Bäcker, Supermarkt, Buchladen)\n2. Gehe hinein und schaue dich um\n3. Zeichne oder fotografiere, was sie verkaufen\n4. Frage höflich: Was ist das Besondere an diesem Laden?\n5. Erstelle eine kleine Übersicht",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_1_2",
    estimatedDuration: 60,
    subjectConnections: ["sachunterricht", "mathematik"],
    materials: ["Kamera/Handy", "Notizbuch"],
    documentationFormats: ["foto", "zeichnung", "text"],
    reflectionQuestions: [
      "Welcher Laden war am interessantesten?",
      "Was kauft man wo?",
      "Welchen Beruf möchtest du später mal haben?"
    ],
    parentTips: "Bereiten Sie Ihr Kind auf höfliches Verhalten vor. Üben Sie Fragen im Voraus.",
    keywords: ["läden", "berufe", "wirtschaft", "gemeinde"]
  },

  // Klasse 1-2, Vertiefen
  {
    title: "Gemeinde-Helfer: Müll sammeln",
    description: "Organisiere eine kleine Müllsammel-Aktion in deiner Umgebung.",
    instructions: "1. Nimm Handschuhe und eine Tüte\n2. Sammle 30 Minuten Müll in einem Park oder auf deiner Straße\n3. Sortiere den Müll (Papier, Plastik, Rest)\n4. Fotografiere, was du gefunden hast\n5. Überlege: Wie kann man Müll vermeiden?",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_1_2",
    estimatedDuration: 50,
    subjectConnections: ["sachunterricht", "umweltbildung"],
    materials: ["Handschuhe", "Müllbeutel"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "Wie viel Müll hast du gefunden?",
      "Warum ist Müll ein Problem?",
      "Wie fühlst du dich jetzt?"
    ],
    parentTips: "Begleiten Sie Ihr Kind. Achten Sie auf Sicherheit (keine scharfen/gefährlichen Gegenstände).",
    keywords: ["umwelt", "engagement", "gemeinschaft", "nachhaltigkeit"]
  },

  // Klasse 3-4, Entdecken
  {
    title: "Gemeinde-Karte: Meine Umgebung kartieren",
    description: "Erstelle deine eigene Karte der Gemeinde mit wichtigen und interessanten Orten.",
    instructions: "1. Zeichne eine einfache Karte deiner Gemeinde\n2. Markiere: Schule, Läden, Parks, dein Zuhause\n3. Male Symbole für verschiedene Orte\n4. Ergänze besondere Plätze, die dir wichtig sind",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_3_4",
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

  // Klasse 3-4, Erforschen
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

  // Klasse 3-4, Vertiefen
  {
    title: "Gemeinde-Geschichte: Spurensuche in der Vergangenheit",
    description: "Erforsche die Geschichte deiner Gemeinde und entdecke, wie Menschen früher hier gelebt haben.",
    instructions: "1. Besuche das Gemeindearchiv oder Museum\n2. Interviewe ältere Menschen (Großeltern, Nachbarn)\n3. Finde historische Fotos und Dokumente\n4. Erstelle eine Timeline der wichtigsten Ereignisse\n5. Vergleiche: Früher vs. Heute",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_3_4",
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

  // Klasse 5-6, Entdecken
  {
    title: "Öffentliche Verkehrsmittel erkunden",
    description: "Plane und unternimm eine Fahrt mit Bus oder Bahn.",
    instructions: "1. Wähle ein Ziel in deiner Stadt\n2. Plane die Route mit öffentlichen Verkehrsmitteln\n3. Kaufe ein Ticket\n4. Fahre dorthin (mit Begleitung)\n5. Dokumentiere deine Reise",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "entdecken",
    ageGroup: "klasse_5_6",
    estimatedDuration: 60,
    subjectConnections: ["sachunterricht", "mathematik"],
    materials: ["Fahrplan", "Geld für Ticket"],
    documentationFormats: ["foto", "text"],
    reflectionQuestions: [
      "War es einfach, die Route zu planen?",
      "Was hast du auf der Fahrt beobachtet?",
      "Würdest du öfter öffentliche Verkehrsmittel nutzen?"
    ],
    parentTips: "Begleiten Sie beim ersten Mal. Zeigen Sie, wie man Fahrpläne liest.",
    keywords: ["verkehr", "mobilität", "selbstständigkeit", "orientierung"]
  },

  // Klasse 5-6, Erforschen
  {
    title: "Gemeinde-Dienste: Wer hilft uns?",
    description: "Erforsche, welche Dienste es in deiner Gemeinde gibt und wie sie funktionieren.",
    instructions: "1. Finde heraus: Polizei, Feuerwehr, Krankenhaus, Bibliothek, Rathaus\n2. Besuche mindestens 2 Einrichtungen\n3. Frage: Was machen Sie? Wie kann man helfen?\n4. Dokumentiere deine Erkenntnisse\n5. Präsentiere in der Klasse",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "erforschen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 80,
    subjectConnections: ["sachunterricht", "deutsch", "politische_bildung"],
    materials: ["Notizbuch", "Kamera"],
    documentationFormats: ["text", "foto", "präsentation"],
    reflectionQuestions: [
      "Welche Dienste sind besonders wichtig?",
      "Wie arbeiten diese Menschen?",
      "Könntest du dir vorstellen, dort zu helfen?"
    ],
    parentTips: "Vereinbaren Sie Termine im Voraus. Viele Dienste bieten Führungen für Kinder an.",
    keywords: ["dienste", "gemeinschaft", "helfen", "gesellschaft"]
  },

  // Klasse 5-6, Vertiefen
  {
    title: "Gemeinde-Projekt: Verbesserungsvorschlag entwickeln",
    description: "Identifiziere ein Problem in deiner Gemeinde und entwickle einen Lösungsvorschlag.",
    instructions: "1. Finde ein Problem (kaputte Spielgeräte, fehlende Radwege, Müll)\n2. Recherchiere: Warum ist das so?\n3. Entwickle einen Lösungsvorschlag\n4. Präsentiere ihn (Eltern, Lehrer, Gemeinderat)\n5. Dokumentiere den Prozess",
    categoryName: "gemeinschaftserkundung",
    difficultyLevel: "vertiefen",
    ageGroup: "klasse_5_6",
    estimatedDuration: 120,
    subjectConnections: ["sachunterricht", "politische_bildung", "deutsch"],
    materials: ["Notizbuch", "Kamera", "Präsentationsmaterial"],
    documentationFormats: ["text", "präsentation", "foto"],
    reflectionQuestions: [
      "Welches Problem hast du identifiziert?",
      "Wie könnte man es lösen?",
      "Was hast du über Bürgerbeteiligung gelernt?"
    ],
    parentTips: "Unterstützen Sie bei der Recherche. Zeigen Sie, dass Engagement etwas bewirken kann.",
    keywords: ["engagement", "politik", "problemlösung", "gemeinschaft"]
  },

  // ========== FAMILIENINTERAKTION - Alle Kombinationen ==========
  // Weitere Templates für alle anderen Kategorien folgen...
  // (Diese würden analog hinzugefügt werden)
];