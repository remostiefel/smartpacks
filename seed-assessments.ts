
import { db } from "./db";
import { assessmentDimensions, assessmentItems } from "../shared/schema";

async function seedAssessments() {
  // SAFETY: Only run seeds in development
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Assessment seeding skipped in production environment');
    process.exit(0);
  }

  console.log("🌱 Seeding Assessment Dimensions and Items (development mode)...");

  // 1. Dimensionen einfügen
  const dimensions = await db.insert(assessmentDimensions).values([
    {
      name: "zielorientierung",
      displayName: "Zielorientierung",
      description: "Mastery- vs. Performance-Ziele: Lernfreude vs. Vergleichsorientierung",
      interpretation: "Hohe Werte zeigen intrinsische Lernmotivation, niedrige Werte deuten auf Vergleichsorientierung hin",
      orderIndex: 1,
    },
    {
      name: "faehigkeitsselbstkonzept",
      displayName: "Fähigkeitsselbstkonzept",
      description: "Allgemeine Fähigkeitseinschätzung und Zutrauen bei schwierigen Aufgaben",
      interpretation: "Positives Selbstkonzept fördert Leistungsbereitschaft und Resilienz",
      orderIndex: 2,
    },
    {
      name: "selbstwirksamkeit",
      displayName: "Selbstwirksamkeit",
      description: "Anstrengungs-Erfolg-Überzeugung und Fehlerkorrektur-Zuversicht",
      interpretation: "Hohe Selbstwirksamkeit führt zu aktivem Problemlöseverhalten",
      orderIndex: 3,
    },
    {
      name: "engagement",
      displayName: "Engagement",
      description: "Durchhaltevermögen und Pflichtbewusstsein im Lernprozess",
      interpretation: "Behavioral Engagement als Indikator für Lernbereitschaft",
      orderIndex: 4,
    },
    {
      name: "lernstrategien",
      displayName: "Lernstrategien",
      description: "Planung und flexible Strategienutzung beim Lernen",
      interpretation: "Metakognitive Kompetenzen als Schlüssel zum selbstgesteuerten Lernen",
      orderIndex: 5,
    },
    {
      name: "pruefungsangst",
      displayName: "Prüfungsangst",
      description: "Notenangst und Blackout-Erleben in Testsituationen",
      interpretation: "Hohe Werte beeinträchtigen Leistung und Wohlbefinden",
      orderIndex: 6,
    },
    {
      name: "soziale_einbettung",
      displayName: "Soziale Einbettung",
      description: "Klassenzugehörigkeit und Peer-Unterstützung",
      interpretation: "Social Belonging als Basis für Lernmotivation",
      orderIndex: 7,
    },
    {
      name: "arbeitsvermeidung",
      displayName: "Arbeitsvermeidung",
      description: "Schnell-fertig-werden vs. Gründlichkeit bei Aufgaben",
      interpretation: "Niedrige Werte deuten auf oberflächliches Arbeitsverhalten hin",
      orderIndex: 8,
    },
  ]).returning();

  console.log(`✅ ${dimensions.length} Dimensionen eingefügt`);

  // 2. Items (Fragen) einfügen - 2 pro Dimension
  const items = await db.insert(assessmentItems).values([
    // Zielorientierung
    {
      dimensionId: dimensions[0].id,
      questionText: "Ich lerne gerne neue Dinge, auch wenn sie schwierig sind",
      itemNumber: 1,
      polarity: "positive",
    },
    {
      dimensionId: dimensions[0].id,
      questionText: "Mir ist es wichtig, besser zu sein als andere Kinder",
      itemNumber: 2,
      polarity: "negative",
    },
    // Fähigkeitsselbstkonzept
    {
      dimensionId: dimensions[1].id,
      questionText: "Ich bin gut im Lernen",
      itemNumber: 3,
      polarity: "positive",
    },
    {
      dimensionId: dimensions[1].id,
      questionText: "Bei schwierigen Aufgaben denke ich oft, dass ich es nicht schaffe",
      itemNumber: 4,
      polarity: "negative",
    },
    // Selbstwirksamkeit
    {
      dimensionId: dimensions[2].id,
      questionText: "Wenn ich mich anstrenge, kann ich die meisten Aufgaben lösen",
      itemNumber: 5,
      polarity: "positive",
    },
    {
      dimensionId: dimensions[2].id,
      questionText: "Wenn ich einen Fehler mache, bin ich sicher, dass ich ihn korrigieren kann",
      itemNumber: 6,
      polarity: "positive",
    },
    // Engagement
    {
      dimensionId: dimensions[3].id,
      questionText: "Ich gebe nicht schnell auf, auch wenn etwas schwer ist",
      itemNumber: 7,
      polarity: "positive",
    },
    {
      dimensionId: dimensions[3].id,
      questionText: "Ich mache meine Aufgaben auch dann, wenn ich keine Lust habe",
      itemNumber: 8,
      polarity: "positive",
    },
    // Lernstrategien
    {
      dimensionId: dimensions[4].id,
      questionText: "Bevor ich anfange zu lernen, überlege ich mir, wie ich vorgehen will",
      itemNumber: 9,
      polarity: "positive",
    },
    {
      dimensionId: dimensions[4].id,
      questionText: "Wenn eine Strategie nicht funktioniert, probiere ich eine andere aus",
      itemNumber: 10,
      polarity: "positive",
    },
    // Prüfungsangst
    {
      dimensionId: dimensions[5].id,
      questionText: "Ich habe Angst vor schlechten Noten",
      itemNumber: 11,
      polarity: "negative",
    },
    {
      dimensionId: dimensions[5].id,
      questionText: "Bei Tests vergesse ich manchmal Dinge, die ich eigentlich weiß",
      itemNumber: 12,
      polarity: "negative",
    },
    // Soziale Einbettung
    {
      dimensionId: dimensions[6].id,
      questionText: "Ich fühle mich in meiner Klasse wohl",
      itemNumber: 13,
      polarity: "positive",
    },
    {
      dimensionId: dimensions[6].id,
      questionText: "Meine Mitschüler helfen mir, wenn ich etwas nicht verstehe",
      itemNumber: 14,
      polarity: "positive",
    },
    // Arbeitsvermeidung
    {
      dimensionId: dimensions[7].id,
      questionText: "Ich versuche, Aufgaben möglichst schnell zu erledigen",
      itemNumber: 15,
      polarity: "negative",
    },
    {
      dimensionId: dimensions[7].id,
      questionText: "Ich arbeite sorgfältig, auch wenn es länger dauert",
      itemNumber: 16,
      polarity: "positive",
    },
  ]).returning();

  console.log(`✅ ${items.length} Items eingefügt`);
  console.log("🎉 Assessment Seeding abgeschlossen!");
}

seedAssessments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fehler beim Seeding:", error);
    process.exit(1);
  });
