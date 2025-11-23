
import { db } from "./db";
import { students, classes } from "@shared/schema";
import { eq } from "drizzle-orm";

const STUDENTS_6A = [
  { firstName: "Alisha", lastName: "" },
  { firstName: "Antonia", lastName: "" },
  { firstName: "Blendi", lastName: "" },
  { firstName: "Danilo", lastName: "" },
  { firstName: "Denis", lastName: "" },
  { firstName: "Devin", lastName: "" },
  { firstName: "Dominic", lastName: "" },
  { firstName: "Eduard", lastName: "" },
  { firstName: "Eliza", lastName: "" },
  { firstName: "Hakan", lastName: "" },
  { firstName: "Ibrahim", lastName: "" },
  { firstName: "Kerlin", lastName: "" },
  { firstName: "Lena", lastName: "" },
  { firstName: "Matej", lastName: "" },
  { firstName: "Mattia", lastName: "" },
  { firstName: "Nicholas", lastName: "" },
  { firstName: "Ramun", lastName: "" },
  { firstName: "Rina", lastName: "" },
  { firstName: "Salih", lastName: "" },
  { firstName: "Shaiel", lastName: "" },
  { firstName: "Sofia", lastName: "" },
  { firstName: "Sona", lastName: "" },
  { firstName: "Stela", lastName: "" },
  { firstName: "Wael", lastName: "" },
];

async function seed6a() {
  // Safety: Only run seeds in development
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Seeding skipped in production environment');
    process.exit(0);
  }

  console.log("Seeding class 6a with students (development mode)...");

  try {
    // Find class 6a
    const class6a = await db.query.classes.findFirst({
      where: eq(classes.name, "6a"),
    });

    if (!class6a) {
      console.error("Class 6a not found. Please run the main seed first.");
      return;
    }

    console.log(`Found class 6a with ID: ${class6a.id}`);

    // Delete all existing students in 6a first
    await db.delete(students).where(eq(students.classId, class6a.id));
    console.log("✅ Cleared existing students from 6a");

    // Create students
    for (const student of STUDENTS_6A) {
      try {
        await db.insert(students).values({
          firstName: student.firstName,
          lastName: student.lastName,
          classId: class6a.id,
          gender: 'male', // Default, kann später angepasst werden
        });
        
        console.log(`✅ Created student: ${student.firstName}`);
      } catch (error) {
        console.log(`Error creating student ${student.firstName}:`, error);
      }
    }

    console.log(`\n🎉 Class 6a seeding complete!`);
    console.log(`   - Total students: ${STUDENTS_6A.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding class 6a:", error);
    throw error;
  }
}

seed6a().catch(console.error);
