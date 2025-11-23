import { db } from "./db";
import { creativeTasks } from "@shared/schema";

const NEW_CREATIVE_TASKS = [
  // Strukturierte Kreativität
  {
    title: "Schritt-für-Schritt: Erfinde eine Maschine",
    category: "Erfindungen",
    description: "Plan eine Maschine in 5 Schritten: 1. Was macht sie? 2. Welche Teile braucht sie? 3. Zeichne jeden Teil. 4. Nummeriere die Reihenfolge. 5. Beschreibe, wie sie funktioniert.",
    ageGroup: "8-11 Jahre"
  },
  {
    title: "Anleitung schreiben: Wie man...",
    category: "Geschichten",
    description: "Schreibe eine genaue Anleitung für etwas Verrücktes: Wie man einen Drachen zähmt, wie man auf dem Mond spaziert, wie man Wolken fängt. Mit Schritt 1, 2, 3...",
    ageGroup: "8-11 Jahre"
  },

  // Experimentelle Kreativität
  {
    title: "Freies Experiment: Was passiert wenn...",
    category: "Erfindungen",
    description: "Wähle 3 zufällige Dinge (z.B. Schere, Wolke, Musik). Was passiert, wenn du sie kombinierst? Erfinde ohne Plan, probiere Ideen aus!",
    ageGroup: "7-11 Jahre"
  },
  {
    title: "Entdeckungsreise ohne Karte",
    category: "Geschichten",
    description: "Beginne eine Geschichte mit 'Ich öffnete die Tür und...' - dann schreib einfach drauflos. Wohin führt dich deine Fantasie?",
    ageGroup: "7-11 Jahre"
  },

  // Solo-Kreativität
  {
    title: "Mein geheimes Tagebuch",
    category: "Geschichten",
    description: "Schreibe ein geheimes Tagebuch von einem Tag als Superheld, Tier oder Zeitreisender. Nur für dich - niemand muss es lesen!",
    ageGroup: "7-11 Jahre"
  },
  {
    title: "Deine persönliche Erfindung",
    category: "Erfindungen",
    description: "Erfinde etwas, das NUR DIR helfen würde. Was brauchst du? Was würde dein Leben einfacher machen? Zeichne und beschreibe es.",
    ageGroup: "8-11 Jahre"
  },

  // Kollaborative Kreativität
  {
    title: "Gruppen-Geschichte im Kreis",
    category: "Geschichten",
    description: "Jeder schreibt einen Satz, dann gibt er das Blatt weiter. Was entsteht zusammen? (Oder stelle dir vor, wie es wäre - beschreibe die Idee)",
    ageGroup: "7-11 Jahre"
  },
  {
    title: "Partner-Erfindung: Gemeinsam kreativ",
    category: "Erfindungen",
    description: "Erfinde mit einem Partner eine Maschine. Einer zeichnet links, einer rechts. Was entsteht in der Mitte? (Oder: stelle dir 2 Erfinder vor, die zusammenarbeiten)",
    ageGroup: "8-11 Jahre"
  },

  // Detail-orientierte Kreativität
  {
    title: "Detektiv-Beschreibung: Alles genau beobachten",
    category: "Perspektiven",
    description: "Beschreibe einen Raum SO genau, dass jemand ihn zeichnen könnte: Wie viele Fenster? Welche Farben? Was steht wo? Jedes Detail zählt!",
    ageGroup: "8-11 Jahre"
  },
  {
    title: "Präzise Anleitung: Sandwich bauen",
    category: "Geschichten",
    description: "Erkläre jemandem, der noch NIE ein Sandwich gemacht hat, jeden einzelnen Schritt. Nichts vergessen - jede Bewegung beschreiben!",
    ageGroup: "7-10 Jahre"
  },

  // Überblicks-orientierte Kreativität
  {
    title: "Die große Idee: Wie hängt alles zusammen?",
    category: "Perspektiven",
    description: "Zeichne eine Mind-Map: Wie hängen Tiere, Wetter, Pflanzen und Menschen zusammen? Zeige das große Gante!",
    ageGroup: "9-11 Jahre"
  },
  {
    title: "System verstehen: Erfinde ein Ökosystem",
    category: "Erfindungen",
    description: "Erfinde eine neue Welt: Welche Lebewesen gibt es? Wer frisst wen? Wie funktioniert der Kreislauf? Zeige die Zusammenhänge!",
    ageGroup: "9-11 Jahre"
  },
  // Zeit-Reisen (Historical Perspectives)
  {
    title: "Wenn ich in der Römerzeit leben würde...",
    category: "Zeit-Reisen",
    description: "Kinder stellen sich vor, sie leben in der Römerzeit in der Schweiz. Was würden sie essen? Wie würden sie zur Schule gehen? Was wären ihre Lieblingsspiele?",
    ageGroup: "8-11 Jahre"
  },
  {
    title: "Ein Tag im Jahr 2100",
    category: "Zeit-Reisen",
    description: "Wie sieht dein Schulweg in der Zukunft aus? Welche Technologie gibt es? Was isst man zum Frühstück? Schreibe oder zeichne einen Tag in deiner Zukunft.",
    ageGroup: "9-11 Jahre"
  },
  {
    title: "Brief an mein Ur-Ur-Enkel",
    category: "Zeit-Reisen",
    description: "Schreibe einen Brief an dein Ur-Ur-Enkel im Jahr 2125. Erkläre, wie die Welt heute aussieht und was du dir für die Zukunft wünschst.",
    ageGroup: "9-11 Jahre"
  },
  {
    title: "Zeitkapsel erstellen",
    category: "Zeit-Reisen",
    description: "Was würdest du in eine Zeitkapsel packen, die in 100 Jahren geöffnet wird? Zeichne oder liste 10 Dinge auf, die zeigen, wie wir heute leben.",
    ageGroup: "7-11 Jahre"
  },

  // Mikro-Makro (Size Perspectives)
  {
    title: "Die Reise eines Wassertropfens",
    category: "Mikro-Makro",
    description: "Stell dir vor, du bist ein winziger Wassertropfen. Erzähle deine Reise von der Wolke, durch den Regen, in den Bach und wieder zurück zum Himmel.",
    ageGroup: "7-10 Jahre"
  },
  {
    title: "Ein Riese in meiner Stadt",
    category: "Mikro-Makro",
    description: "Was würde ein 20-Meter-Riese in deinem Quartier sehen? Was wäre für ihn winzig klein? Was würde er überhaupt nicht bemerken? Zeichne oder beschreibe seine Perspektive.",
    ageGroup: "8-11 Jahre"
  },
  {
    title: "Schrumpf-Abenteuer im Klassenzimmer",
    category: "Mikro-Makro",
    description: "Du bist auf Ameisengröße geschrumpft und steckst im Klassenzimmer fest. Was wird jetzt gefährlich? Wie kommst du nach Hause? Schreibe eine Abenteuer-Geschichte.",
    ageGroup: "8-11 Jahre"
  },
  {
    title: "Die Welt aus Satelliten-Sicht",
    category: "Mikro-Makro",
    description: "Stell dir vor, du bist ein Satellit im Weltraum und schaust auf die Erde. Was siehst du von deinem Zuhause? Zeichne und beschreibe diese Makro-Perspektive.",
    ageGroup: "9-11 Jahre"
  },
  {
    title: "Im Körper eines Bakteriums",
    category: "Mikro-Makro",
    description: "Du bist ein Bakterium auf einer Zahnbürste. Was erlebst du im Mund? Wie sieht deine mikroskopische Welt aus? Erzähle deine Geschichte.",
    ageGroup: "9-11 Jahre"
  },

  // Emotionale Landkarten (Visualizing Feelings)
  {
    title: "Meine Gefühls-Landkarte",
    category: "Emotionale Landkarten",
    description: "Zeichne eine Landkarte deiner Gefühle: Wo ist das Land der Freude? Der Fluss der Traurigkeit? Die Berge des Mutes? Male deine eigene emotionale Welt.",
    ageGroup: "7-11 Jahre"
  },
  {
    title: "Das Wetter meiner Laune",
    category: "Emotionale Landkarten",
    description: "Wenn deine Gefühle Wetter wären: Welches Wetter ist Wut? Welches ist Angst? Welches ist Glück? Zeichne ein Wettersymbol für jedes Gefühl und erkläre, warum.",
    ageGroup: "6-10 Jahre"
  },
  {
    title: "Farben meiner Woche",
    category: "Emotionale Landkarten",
    description: "Male jeden Tag dieser Woche in einer Farbe, die zu deinem Gefühl passt. Erkläre, warum Montag blau war oder Freitag gelb. Was bedeuten die Farben für dich?",
    ageGroup: "7-11 Jahre"
  },
  {
    title: "Der Gefühls-Atlas",
    category: "Emotionale Landkarten",
    description: "Erstelle einen Atlas mit verschiedenen Gefühls-Ländern. Wie sieht das Land der Angst aus? Wie kommt man ins Land der Zufriedenheit? Zeichne eine Karte mit Wegen dazwischen.",
    ageGroup: "9-11 Jahre"
  },
  {
    title: "Meine emotionale Reise heute",
    category: "Emotionale Landkarten",
    description: "Zeichne deinen Tag als Reise durch verschiedene Gefühls-Orte. Wo warst du heute Morgen? Wo warst du in der Pause? Wie hat sich deine Reise angefühlt?",
    ageGroup: "7-11 Jahre"
  },
];

export async function seedNewCreativeTasks(forceProduction = false) {
  // Safety: Only run seeds in development (unless forced for production seeding)
  if (process.env.NODE_ENV === 'production' && !forceProduction) {
    console.log('⚠️  Creative task seeding skipped in production environment');
    return { count: 0, skipped: true };
  }

  try {
    console.log("🌱 Seeding new creative tasks (development mode)...");

    for (const task of NEW_CREATIVE_TASKS) {
      await db.insert(creativeTasks).values({
        title: task.title,
        category: task.category,
        description: task.description,
        ageGroup: task.ageGroup,
      });
    }

    console.log(`✅ Created ${NEW_CREATIVE_TASKS.length} new creative tasks`);
    console.log("   - Zeit-Reisen: 4 tasks");
    console.log("   - Mikro-Makro: 5 tasks");
    console.log("   - Emotionale Landkarten: 5 tasks");

    return { count: NEW_CREATIVE_TASKS.length };

  } catch (error) {
    console.error("❌ Error seeding creative tasks:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNewCreativeTasks()
    .then(() => {
      console.log("✓ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("✗ Seeding failed:", error);
      process.exit(1);
    });
}