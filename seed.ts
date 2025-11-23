import { db } from "./db";
import { classes, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const TEACHERS = [
  { username: "Ibra", password: "2021", role: "teacher" as const },
  { username: "Rast", password: "2022", role: "teacher" as const },
  { username: "Arid", password: "2023", role: "teacher" as const },
  { username: "Pulv", password: "2024", role: "teacher" as const },
  { username: "Jahi", password: "2025", role: "teacher" as const },
  { username: "Stie", password: "2020", role: "admin" as const },
  { username: "Meie", password: "2020", role: "admin" as const },
  { username: "Test", password: "password2025", role: "teacher" as const },
  { username: "Bobo", password: "2021", role: "teacher" as const },
  { username: "Muep", password: "2021", role: "teacher" as const },
  { username: "Casu", password: "2025", role: "teacher" as const },
];

async function seed() {
  // Safety: Only run seeds in development
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Seeding skipped in production environment');
    console.log('   Production databases should be initialized manually or through deployment scripts');
    process.exit(0);
  }

  console.log("Seeding database (development mode)...");

  // Create classes first
  console.log("Creating classes...");
  const classNames = ['4a', '4b', '4c', '4d', '4e', '6a', 'Test'];

  for (const name of classNames) {
    try {
      await db.insert(classes).values({
        name,
        teacherId: null,
      }).onConflictDoNothing();
      console.log(`Created class ${name}`);
    } catch (error) {
      console.log(`Class ${name} already exists or error:`, error);
    }
  }

  // Define teacher-to-class mapping
  const teacherClassMap: Record<string, string> = {
    "Ibra": "4a",
    "Rast": "4b",
    "Arid": "4c",
    "Pulv": "4d",
    "Jahi": "4e",
    "Bobo": "6a",
    "Muep": "6a",
    "Meie": "6a",
    "Stie": "6a",
    "Test": "Test",
    "Casu": "Test",
  };

  // Create teacher users with proper class assignments
  console.log("Creating teacher users...");
  for (const teacher of TEACHERS) {
    try {
      // Get the class for this teacher
      const className = teacherClassMap[teacher.username];
      const cls = className ? await db.query.classes.findFirst({
        where: (classes, { eq }) => eq(classes.name, className),
      }) : null;

      const userRecord = {
        username: teacher.username,
        password: teacher.password,
        role: teacher.role,
        classId: cls?.id || null,
      };

      console.log(`🔐 Seeding user ${teacher.username}:`, {
        password_raw: teacher.password,
        password_type: typeof teacher.password,
        password_length: teacher.password.length,
        password_charCodes: Array.from(teacher.password).map((c, i) => `[${i}]='${c}'(${c.charCodeAt(0)})`).join(' ')
      });

      await db.insert(users).values(userRecord).onConflictDoUpdate({
        target: users.username,
        set: {
          password: teacher.password,
          role: teacher.role,
          classId: cls?.id || null,
        },
      });

      console.log(`✅ Created/Updated user ${teacher.username}${cls ? ` (assigned to ${className})` : ''}`);
    } catch (error) {
      console.log(`Error with user ${teacher.username}:`, error);
    }
  }

  // Set teachers as class owners
  console.log("Setting class owners...");
  for (const [username, className] of Object.entries(teacherClassMap)) {
    const teacher = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });

    const cls = await db.query.classes.findFirst({
      where: (classes, { eq }) => eq(classes.name, className),
    });

    if (teacher && cls) {
      // Set teacher as class owner (only one teacher per class)
      // Bobo is the main teacher for 6a, not Muep or Stie or Meie
      if (!["Muep", "Stie", "Meie"].includes(username)) {
        await db.update(classes)
          .set({ teacherId: teacher.id })
          .where(eq(classes.id, cls.id));
        console.log(`Set ${username} as owner of class ${className}`);
      }
    }
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);