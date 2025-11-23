import type { Express } from "express";
import { createServer, type Server } from "http";
import { PassThrough } from "stream";
import { storage } from "./storage";
import { isAuthenticated } from "./authProvider";
import { generateHomeworkContent } from "./openai";
import { z } from "zod";
import { generateMathWorksheet, generateSpellingWorksheet, generateVocabularyWorksheet, generateCreativeTaskWorksheet, generateHomeworkWorksheet, generateLivingLifeWorksheet } from "./pdf-generators";
import { LIVING_LIFE_CATEGORIES, generateTasks, createTaskFromTemplate, generateWeeklyPlan } from "./living-life-generator";
import { demonstratePaeckchenGeneration, getPaeckchenCatalog } from "./paeckchen-demonstrator";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { HELP_ARTICLES, searchHelpArticles, HELP_CATEGORIES } from "./help-content";
import { isFeatureEnabled } from "./feature-flags";

// Helper to convert PDF to base64
async function pdfToBase64(doc: PDFKit.PDFDocument): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString('base64'));
    });
    doc.on('error', reject);
    doc.end();
  });
}

// Helper to parse template options from query params
function parseTemplateOptions(query: any) {
  return {
    layout: query.layout === 'compact' ? 'compact' as const : 'spacious' as const,
    images: query.images === 'true',
    color: query.color !== 'false'  // default true
  };
}

// Admin-only middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur für Administratoren zugänglich' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {

  // Health check endpoint to verify database connectivity
  app.get("/api/health", async (req, res) => {
    try {
      // Use Drizzle ORM for database health check
      await db.execute(sql`SELECT 1`); 
      const sessionCheck = await db.execute(sql`SELECT COUNT(*) FROM sessions`);
      res.json({ 
        status: "ok", 
        database: "connected",
        sessions_table: "exists", // This is a simplification, a real check would be more robust
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error: any) {
      console.error("Health check failed:", error); // Added error logging for health check
      res.status(500).json({ 
        status: "error", 
        database: "disconnected",
        error: error.message 
      });
    }
  });

  // Admin-only endpoint to hash all plaintext passwords in the database
  app.post("/api/admin/hash-passwords", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      // Only admins can run this
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized - Admin access required" });
      }

      console.log("🔐 Starting password hashing migration...");

      // Import bcrypt
      const bcrypt = await import('bcryptjs');

      // Get all users
      const allUsers = await db.execute(sql`SELECT id, username, password FROM users WHERE password IS NOT NULL`);

      let hashedCount = 0;
      let skippedCount = 0;

      for (const userRow of allUsers.rows as any[]) {
        const password = userRow.password;

        // Check if password is already hashed (bcrypt format: $2a$, $2b$, or $2y$)
        if (/^\$2[aby]\$/.test(password)) {
          console.log(`⏭️  Skipping user ${userRow.username} - already hashed`);
          skippedCount++;
          continue;
        }

        // Hash the plaintext password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        await db.execute(sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userRow.id}`);

        console.log(`✅ Hashed password for user: ${userRow.username}`);
        hashedCount++;
      }

      console.log(`🔐 Password hashing complete. Hashed: ${hashedCount}, Skipped: ${skippedCount}`);

      res.json({ 
        success: true, 
        message: "Password hashing completed",
        hashedCount,
        skippedCount,
        totalUsers: allUsers.rows.length
      });
    } catch (error: any) {
      console.error("Password hashing failed:", error);
      res.status(500).json({ 
        success: false,
        message: "Password hashing failed",
        error: error.message 
      });
    }
  });

  // Admin-only endpoint to seed production database with correct student data
  app.post("/api/admin/seed-students", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      // Only admins can run this
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized - Admin access required" });
      }

      console.log("🌱 Starting student data seeding...");

      // Step 1: Clear existing student-related data
      await db.execute(sql`DELETE FROM student_assessments`);
      await db.execute(sql`DELETE FROM student_creative_tasks`);
      await db.execute(sql`DELETE FROM student_creative_profiles`);
      await db.execute(sql`DELETE FROM homeworks`);
      await db.execute(sql`DELETE FROM vocabulary_words`);
      await db.execute(sql`DELETE FROM spelling_errors`);
      await db.execute(sql`DELETE FROM student_errors`);
      await db.execute(sql`DELETE FROM students`);

      // Step 2: Insert students for each class
      const studentsByClass: Record<string, Array<{ name: string; gender: string }>> = {
        "4a": [
          { name: "Alisja", gender: "female" }, { name: "Andrin", gender: "male" },
          { name: "Asmin", gender: "male" }, { name: "Bilal", gender: "male" },
          { name: "Celina", gender: "female" }, { name: "Chayenne", gender: "female" },
          { name: "Davide", gender: "male" }, { name: "Devin", gender: "male" },
          { name: "Elon", gender: "male" }, { name: "Galana", gender: "female" },
          { name: "Gjin", gender: "male" }, { name: "Laurent", gender: "male" },
          { name: "Lucien", gender: "male" }, { name: "Luka", gender: "male" },
          { name: "Mira", gender: "female" }, { name: "Muhammad", gender: "male" },
          { name: "Rayan", gender: "male" }, { name: "Ronja", gender: "female" },
          { name: "Samuel", gender: "male" }, { name: "Sophia", gender: "female" },
          { name: "Stella", gender: "female" }, { name: "Tiara", gender: "female" }
        ],
        "4b": [
          { name: "Azia", gender: "female" }, { name: "Carina", gender: "female" },
          { name: "Delia", gender: "female" }, { name: "Dias", gender: "male" },
          { name: "Elias", gender: "male" }, { name: "Fatima", gender: "female" },
          { name: "Fynn", gender: "male" }, { name: "Gabriel", gender: "male" },
          { name: "John", gender: "male" }, { name: "Leandro", gender: "male" },
          { name: "Lorian", gender: "male" }, { name: "Maya", gender: "female" },
          { name: "Melissa", gender: "female" }, { name: "Miki", gender: "male" },
          { name: "Niharika", gender: "female" }, { name: "Santiago", gender: "male" },
          { name: "Sascha", gender: "male" }, { name: "Sebastian", gender: "male" },
          { name: "Severina", gender: "female" }, { name: "Soraya", gender: "female" },
          { name: "Summer", gender: "female" }
        ],
        "4c": [
          { name: "Ahana", gender: "female" }, { name: "Anika", gender: "female" },
          { name: "Anisa", gender: "female" }, { name: "Carlos", gender: "male" },
          { name: "Davi", gender: "male" }, { name: "David", gender: "male" },
          { name: "Erin", gender: "female" }, { name: "Etika", gender: "female" },
          { name: "Ishanika", gender: "female" }, { name: "Jahir", gender: "male" },
          { name: "Kaynan", gender: "male" }, { name: "Koray", gender: "male" },
          { name: "Lian", gender: "male" }, { name: "Mariana", gender: "female" },
          { name: "Naila", gender: "female" }, { name: "Naya", gender: "female" },
          { name: "Renas", gender: "male" }, { name: "Shriya", gender: "female" },
          { name: "Sydney", gender: "female" }, { name: "Vida", gender: "female" },
          { name: "Yasin", gender: "male" }, { name: "Yuliano", gender: "male" }
        ],
        "4d": [
          { name: "Andi", gender: "male" }, { name: "Anna", gender: "female" },
          { name: "Blendi", gender: "male" }, { name: "Ela", gender: "female" },
          { name: "Erblina", gender: "female" }, { name: "Erijon", gender: "male" },
          { name: "Eris", gender: "male" }, { name: "Hazar", gender: "male" },
          { name: "Jamina", gender: "female" }, { name: "Kian", gender: "male" },
          { name: "Leana", gender: "female" }, { name: "Leandros", gender: "male" },
          { name: "Leonard", gender: "male" }, { name: "Luesa", gender: "female" },
          { name: "Marc", gender: "male" }, { name: "Marlon", gender: "male" },
          { name: "Medina", gender: "female" }, { name: "Simon", gender: "male" },
          { name: "Sureja", gender: "female" }, { name: "Tiana", gender: "female" },
          { name: "Valentina", gender: "female" }
        ],
        "4e": [
          { name: "Aaron", gender: "male" }, { name: "Adam", gender: "male" },
          { name: "Alina", gender: "female" }, { name: "Anastasija", gender: "female" },
          { name: "Berzan", gender: "male" }, { name: "Blerona", gender: "female" },
          { name: "Carolina", gender: "female" }, { name: "Chanel", gender: "female" },
          { name: "David", gender: "male" }, { name: "Edijon", gender: "male" },
          { name: "Elona", gender: "female" }, { name: "Emilja", gender: "female" },
          { name: "Joshua", gender: "male" }, { name: "Leandra", gender: "female" },
          { name: "Leonardo", gender: "male" }, { name: "Melisa", gender: "female" },
          { name: "Mila", gender: "female" }, { name: "Mohammed", gender: "male" },
          { name: "Nick", gender: "male" }, { name: "Sofia", gender: "female" },
          { name: "Suara", gender: "female" }
        ],
        "6a": [
          { name: "Alisha", gender: "female" }, { name: "Antonia", gender: "female" },
          { name: "Blendi", gender: "male" }, { name: "Danilo", gender: "male" },
          { name: "Denis", gender: "male" }, { name: "Devin", gender: "male" },
          { name: "Dominic", gender: "male" }, { name: "Eduard", gender: "male" },
          { name: "Eliza", gender: "female" }, { name: "Hakan", gender: "male" },
          { name: "Ibrahim", gender: "male" }, { name: "Kerlin", gender: "male" },
          { name: "Lena", gender: "female" }, { name: "Matej", gender: "male" },
          { name: "Mattia", gender: "male" }, { name: "Nicholas", gender: "male" },
          { name: "Ramun", gender: "male" }, { name: "Rina", gender: "female" },
          { name: "Salih", gender: "male" }, { name: "Shaiel", gender: "male" },
          { name: "Sofia", gender: "female" }, { name: "Sona", gender: "female" },
          { name: "Stela", gender: "female" }, { name: "Wael", gender: "male" }
        ],
        "Test": [
          { name: "TestSchüler1", gender: "male" }, { name: "TestSchüler2", gender: "female" },
          { name: "TestSchüler3", gender: "male" }, { name: "TestSchüler4", gender: "female" },
          { name: "TestSchüler5", gender: "male" }, { name: "TestSchüler6", gender: "female" },
          { name: "TestSchüler7", gender: "male" }, { name: "TestSchüler8", gender: "female" },
          { name: "TestSchüler9", gender: "male" }, { name: "TestSchüler10", gender: "female" },
          { name: "TestSchüler11", gender: "male" }, { name: "TestSchüler12", gender: "female" }
        ]
      };

      let totalStudents = 0;

      for (const [className, students] of Object.entries(studentsByClass)) {
        const classResult = await db.execute(sql`SELECT id FROM classes WHERE name = ${className}`);
        const classId = (classResult.rows[0] as any).id;

        for (const student of students) {
          const lastName = className === "Test" ? "Demo" : "";
          await db.execute(sql`
            INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
            VALUES (gen_random_uuid(), ${student.name}, ${lastName}, ${classId}, ${student.gender}, NOW(), NOW())
          `);
          totalStudents++;
        }
      }

      // Verify
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM students`);
      const count = (countResult.rows[0] as any).count;

      console.log(`✅ Successfully seeded ${totalStudents} students`);

      res.json({ 
        success: true, 
        message: `Successfully seeded ${totalStudents} students`,
        studentsInDatabase: count
      });
    } catch (error: any) {
      console.error("❌ Error seeding students:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to seed students", 
        error: error.message 
      });
    }
  });

  // ========== ADMIN ROUTES - Teacher Management ==========

  // Get all teachers
  app.get('/api/admin/teachers', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Fehler beim Laden der Lehrpersonen", error: error.message });
    }
  });

  // Create a new teacher
  app.post('/api/admin/teachers', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { createTeacherSchema } = await import('@shared/schema');
      const teacherData = createTeacherSchema.parse(req.body);

      const teacher = await storage.createTeacher(teacherData);

      // Remove password from response
      const { password, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error: any) {
      console.error("Error creating teacher:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validierungsfehler", errors: error.errors });
      }
      res.status(500).json({ message: "Fehler beim Erstellen der Lehrperson", error: error.message });
    }
  });

  // Update a teacher
  app.put('/api/admin/teachers/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { updateTeacherSchema } = await import('@shared/schema');
      const teacherData = updateTeacherSchema.parse(req.body);

      const teacher = await storage.updateTeacher(req.params.id, teacherData);

      // Remove password from response
      const { password, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error: any) {
      console.error("Error updating teacher:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validierungsfehler", errors: error.errors });
      }
      res.status(500).json({ message: "Fehler beim Aktualisieren der Lehrperson", error: error.message });
    }
  });

  // Delete a teacher
  app.delete('/api/admin/teachers/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteTeacher(req.params.id);
      res.json({ success: true, message: 'Lehrperson erfolgreich gelöscht' });
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: error.message || "Fehler beim Löschen der Lehrperson" });
    }
  });

  // ========== ADMIN ROUTES - Class Management ==========

  // Create a new class
  app.post('/api/admin/classes', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { insertClassSchema } = await import('@shared/schema');
      const classData = insertClassSchema.parse(req.body);

      const newClass = await storage.createClass(classData);
      res.json(newClass);
    } catch (error: any) {
      console.error("Error creating class:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validierungsfehler", errors: error.errors });
      }
      res.status(500).json({ message: "Fehler beim Erstellen der Klasse", error: error.message });
    }
  });

  // Update a class
  app.put('/api/admin/classes/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { updateClassSchema } = await import('@shared/schema');
      const classData = updateClassSchema.parse(req.body);

      const updatedClass = await storage.updateClass(req.params.id, classData);
      res.json(updatedClass);
    } catch (error: any) {
      console.error("Error updating class:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validierungsfehler", errors: error.errors });
      }
      res.status(500).json({ message: "Fehler beim Aktualisieren der Klasse", error: error.message });
    }
  });

  // Delete a class
  app.delete('/api/admin/classes/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.json({ success: true, message: 'Klasse erfolgreich gelöscht' });
    } catch (error: any) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: error.message || "Fehler beim Löschen der Klasse" });
    }
  });

  // ========== ADMIN ROUTES - Student Bulk Import ==========

  // Bulk import students
  app.post('/api/admin/students/bulk', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { bulkStudentImportSchema } = await import('@shared/schema');
      const { students } = bulkStudentImportSchema.parse(req.body);

      const createdStudents = await storage.bulkCreateStudents(students);
      res.json({ 
        success: true, 
        message: `${createdStudents.length} Schüler erfolgreich importiert`,
        students: createdStudents 
      });
    } catch (error: any) {
      console.error("Error bulk importing students:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validierungsfehler", errors: error.errors });
      }
      res.status(500).json({ message: "Fehler beim Importieren der Schüler", error: error.message });
    }
  });

  // Delete a student
  app.delete('/api/admin/students/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.json({ success: true, message: 'Schüler erfolgreich gelöscht' });
    } catch (error: any) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: error.message || "Fehler beim Löschen des Schülers" });
    }
  });

  // ========== ADMIN ROUTES - Activity Tracking & Statistics ==========

  // Get all users' activity statistics
  app.get('/api/admin/activity/stats', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAllUsersActivityStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching activity stats:", error);
      res.status(500).json({ message: "Fehler beim Laden der Aktivitätsstatistiken", error: error.message });
    }
  });

  // Get specific user's activity statistics
  app.get('/api/admin/activity/stats/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserActivityStats(req.params.userId);
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching user activity stats:", error);
      res.status(500).json({ message: "Fehler beim Laden der Benutzeraktivität", error: error.message });
    }
  });

  // Get user's session history
  app.get('/api/admin/activity/sessions/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const sessions = await storage.getUserSessions(req.params.userId, limit);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Fehler beim Laden der Sitzungen", error: error.message });
    }
  });

  // Get user's page view history
  app.get('/api/admin/activity/pageviews/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const pageViews = await storage.getUserPageViews(req.params.userId, limit);
      res.json(pageViews);
    } catch (error: any) {
      console.error("Error fetching user page views:", error);
      res.status(500).json({ message: "Fehler beim Laden der Seitenaufrufe", error: error.message });
    }
  });

  // Admin Production Seeding - DIRECT SQL VERSION (Creative Tasks)
  app.get('/api/admin/seed-creative', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const user = req.user!;
      console.log(`🌱 Admin ${user.username} initiated direct creative tasks seeding`);

      const { creativeTasks } = await import('@shared/schema');
      
      const TASKS = [
        { title: "Schritt-für-Schritt: Erfinde eine Maschine", category: "Erfindungen", description: "Plan eine Maschine in 5 Schritten", ageGroup: "8-11 Jahre" },
        { title: "Anleitung schreiben: Wie man...", category: "Geschichten", description: "Schreibe eine genaue Anleitung für etwas Verrücktes", ageGroup: "8-11 Jahre" },
        { title: "Freies Experiment: Was passiert wenn...", category: "Erfindungen", description: "Wähle 3 zufällige Dinge und kombiniere sie", ageGroup: "7-11 Jahre" },
        { title: "Entdeckungsreise ohne Karte", category: "Geschichten", description: "Beginne eine Geschichte mit 'Ich öffnete die Tür und...'", ageGroup: "7-11 Jahre" },
        { title: "Mein geheimes Tagebuch", category: "Geschichten", description: "Schreibe ein geheimes Tagebuch von einem Tag als Superheld", ageGroup: "7-11 Jahre" },
        { title: "Deine persönliche Erfindung", category: "Erfindungen", description: "Erfinde etwas, das NUR DIR helfen würde", ageGroup: "8-11 Jahre" },
        { title: "Gruppen-Geschichte im Kreis", category: "Geschichten", description: "Jeder schreibt einen Satz, dann gibt er das Blatt weiter", ageGroup: "7-11 Jahre" },
        { title: "Partner-Erfindung: Gemeinsam kreativ", category: "Erfindungen", description: "Erfinde mit einem Partner eine Maschine", ageGroup: "8-11 Jahre" },
        { title: "Detektiv-Beschreibung: Alles genau beobachten", category: "Perspektiven", description: "Beschreibe einen Raum SO genau, dass jemand ihn zeichnen könnte", ageGroup: "8-11 Jahre" },
        { title: "Präzise Anleitung: Sandwich bauen", category: "Geschichten", description: "Erkläre jemandem jeden einzelnen Schritt", ageGroup: "7-10 Jahre" },
        { title: "Die große Idee: Wie hängt alles zusammen?", category: "Perspektiven", description: "Zeichne eine Mind-Map", ageGroup: "9-11 Jahre" },
        { title: "System verstehen: Erfinde ein Ökosystem", category: "Erfindungen", description: "Erfinde eine neue Welt", ageGroup: "9-11 Jahre" },
        { title: "Wenn ich in der Römerzeit leben würde...", category: "Zeit-Reisen", description: "Stell dir vor, du lebst in der Römerzeit", ageGroup: "8-11 Jahre" },
        { title: "Ein Tag im Jahr 2100", category: "Zeit-Reisen", description: "Wie sieht dein Schulweg in der Zukunft aus?", ageGroup: "9-11 Jahre" },
      ];

      let inserted = 0;
      let errors = [];

      for (const task of TASKS) {
        try {
          await db.insert(creativeTasks).values(task);
          inserted++;
        } catch (err: any) {
          errors.push({ task: task.title, error: err.message });
        }
      }

      res.json({
        success: true,
        message: `Inserted ${inserted} creative tasks`,
        environment: process.env.NODE_ENV || 'development',
        initiatedBy: user.username,
        inserted,
        attempted: TASKS.length,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error: any) {
      console.error('❌ Creative tasks seeding failed:', error);
      res.status(500).json({
        success: false,
        error: 'Seeding failed',
        message: error.message,
        stack: error.stack
      });
    }
  });

  // Admin Create Test Users (for Production testing) - With secret key fallback
  app.get('/api/admin/seed-test-users', async (req, res) => {
    try {
      // Check authentication OR admin secret
      const adminSecret = req.query.secret as string;
      const isAuthorized = req.isAuthenticated() && req.user?.role === 'admin';
      const hasValidSecret = adminSecret === 'smartpacks2025';
      
      if (!isAuthorized && !hasValidSecret) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Admin authentication or valid secret required'
        });
      }

      const username = req.user?.username || 'secret-key';
      console.log(`🔑 Admin ${username} creating test users`);

      // All test users from Development (seed.ts)
      const testUsers = [
        { username: 'Ibra', password: '2021', email: 'ibra@example.com', firstName: 'Ibra', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Rast', password: '2022', email: 'rast@example.com', firstName: 'Rast', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Arid', password: '2023', email: 'arid@example.com', firstName: 'Arid', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Pulv', password: '2024', email: 'pulv@example.com', firstName: 'Pulv', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Jahi', password: '2025', email: 'jahi@example.com', firstName: 'Jahi', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Meie', password: '2020', email: 'meie@example.com', firstName: 'Meie', lastName: 'Admin', role: 'admin' as const },
        { username: 'Test', password: 'password2025', email: 'test@example.com', firstName: 'Test', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Bobo', password: '2021', email: 'bobo@example.com', firstName: 'Bobo', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Muep', password: '2021', email: 'muep@example.com', firstName: 'Muep', lastName: 'Lehrer', role: 'teacher' as const },
        { username: 'Casu', password: '2025', email: 'casu@example.com', firstName: 'Casu', lastName: 'Lehrer', role: 'teacher' as const },
      ];

      const createdUsers = [];
      const skippedUsers = [];

      for (const userData of testUsers) {
        // Check if user exists
        const existingUser = await storage.getUserByUsername(userData.username);
        
        if (existingUser) {
          // User exists - UPDATE password to ensure it's hashed correctly
          const updatedUser = await storage.upsertUser({
            id: existingUser.id,
            username: userData.username,
            password: userData.password, // Will be hashed by upsertUser
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            classId: existingUser.classId
          });
          skippedUsers.push(userData.username);
          continue;
        }

        // Create new user with hashed password
        const newUser = await storage.upsertUser({
          username: userData.username,
          password: userData.password, // Will be hashed by upsertUser
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          classId: null
        });

        createdUsers.push(newUser.username);
      }

      res.json({
        success: true,
        message: `Test users processed`,
        created: createdUsers,
        skipped: skippedUsers,
        environment: process.env.NODE_ENV || 'development'
      });

    } catch (error: any) {
      console.error('❌ Test user creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Test user creation failed',
        message: error.message,
        stack: error.stack
      });
    }
  });

  // Admin Fix User Passwords - Direct SQL update with bcrypt hashing
  app.get('/api/admin/fix-user-passwords', async (req, res) => {
    try {
      // Check authentication OR admin secret
      const adminSecret = req.query.secret as string;
      const isAuthorized = req.isAuthenticated() && req.user?.role === 'admin';
      const hasValidSecret = adminSecret === 'smartpacks2025';
      
      if (!isAuthorized && !hasValidSecret) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const bcrypt = await import('bcryptjs');
      const username = req.user?.username || 'secret-key';
      console.log(`🔧 Admin ${username} fixing user passwords`);

      // Users that need password fixes
      const passwordFixes = [
        { username: 'Meie', password: '2020' },
        { username: 'Test', password: 'password2025' },
        { username: 'Bobo', password: '2021' },
        { username: 'Muep', password: '2021' },
        { username: 'Casu', password: '2025' }
      ];

      const fixed = [];
      for (const fix of passwordFixes) {
        const hashedPassword = await bcrypt.hash(fix.password, 10);
        const email = `${fix.username.toLowerCase()}@example.com`;
        const lastName = fix.username === 'Meie' ? 'Admin' : fix.username === 'Test' ? 'Teacher' : 'Lehrer';
        
        await db.execute(sql`
          UPDATE users 
          SET password = ${hashedPassword},
              email = ${email},
              first_name = ${fix.username},
              last_name = ${lastName}
          WHERE username = ${fix.username}
        `);
        
        fixed.push(fix.username);
        console.log(`✅ Fixed password for ${fix.username}`);
      }

      res.json({
        success: true,
        message: `Fixed passwords for ${fixed.length} users`,
        fixed,
        environment: process.env.NODE_ENV || 'development'
      });

    } catch (error: any) {
      console.error('❌ Password fix failed:', error);
      res.status(500).json({
        success: false,
        error: 'Fix failed',
        message: error.message
      });
    }
  });

  // Admin Clear Test Class (remove all students) - With secret key fallback
  app.get('/api/admin/clear-test-class', async (req, res) => {
    try {
      // Check authentication OR admin secret
      const adminSecret = req.query.secret as string;
      const isAuthorized = req.isAuthenticated() && req.user?.role === 'admin';
      const hasValidSecret = adminSecret === 'smartpacks2025';
      
      if (!isAuthorized && !hasValidSecret) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Admin authentication or valid secret required'
        });
      }

      const username = req.user?.username || 'secret-key';
      console.log(`🧹 Admin ${username} clearing Test class`);

      // Use direct SQL for reliability
      const result = await db.execute(sql`
        DELETE FROM students 
        WHERE class_id IN (
          SELECT id FROM classes WHERE name = 'Test'
        )
        RETURNING id
      `);

      const deletedCount = result.rows.length;

      console.log(`✅ Deleted ${deletedCount} students from Test class`);

      res.json({
        success: true,
        message: `Deleted ${deletedCount} students from Test class`,
        deletedCount,
        environment: process.env.NODE_ENV || 'development',
        deletedBy: username
      });

    } catch (error: any) {
      console.error('❌ Clear test class failed:', error);
      res.status(500).json({
        success: false,
        error: 'Clear failed',
        message: error.message,
        stack: error.stack
      });
    }
  });

  // Admin Production Seeding - FAST VERSION (Students only, minimal data) - With secret key fallback
  app.get('/api/admin/seed-production-fast', async (req, res) => {
    try {
      // Check authentication OR admin secret
      const adminSecret = req.query.secret as string;
      const isAuthorized = req.isAuthenticated() && req.user?.role === 'admin';
      const hasValidSecret = adminSecret === 'smartpacks2025';
      
      if (!isAuthorized && !hasValidSecret) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Admin authentication or valid secret required'
        });
      }

      const username = req.user?.username || 'secret-key';
      console.log(`🌱 Admin ${username} initiated fast student seeding`);

      const swissFirstNames = ["Luca", "Mia", "Noah", "Emma", "Leon", "Lara", "Nico", "Sophie", "Tim", "Anna", "Jan", "Lea", "Finn", "Laura", "Ben"];
      const swissLastNames = ["Müller", "Meier", "Schmid", "Keller", "Weber", "Huber", "Schneider", "Meyer", "Steiner", "Fischer", "Gerber", "Brunner", "Baumann", "Frei", "Zimmermann"];
      
      // Get or create Test class
      const allClasses = await storage.getAllClasses();
      let testClass = allClasses.find(c => c.name === "Test");
      
      if (!testClass) {
        testClass = await storage.createClass({ name: "Test", teacherId: null });
      }

      // Clear existing students
      const existingStudents = await storage.getStudentsByClass(testClass.id);
      for (const student of existingStudents) {
        await storage.deleteStudent(student.id);
      }

      // Create 15 students
      const students = [];
      for (let i = 0; i < 15; i++) {
        const firstName = swissFirstNames[i % swissFirstNames.length];
        const lastName = swissLastNames[i % swissLastNames.length];
        const gender = i % 2 === 0 ? 'male' : 'female';
        
        const student = await storage.createStudent({
          firstName,
          lastName,
          classId: testClass.id,
          gender,
          dateOfBirth: new Date(2015 + (i % 3), i % 12, (i % 28) + 1)
        });
        students.push(student);
      }

      res.json({
        success: true,
        message: `Created ${students.length} students in Test class`,
        environment: process.env.NODE_ENV || 'development',
        initiatedBy: user.username,
        students: students.length,
        studentNames: students.slice(0, 5).map(s => `${s.firstName} ${s.lastName}`)
      });

    } catch (error: any) {
      console.error('❌ Fast seeding failed:', error);
      res.status(500).json({
        success: false,
        error: 'Seeding failed',
        message: error.message,
        stack: error.stack
      });
    }
  });

  // Admin Production Seeding - FULL VERSION (Test Class with all data)
  app.get('/api/admin/seed-production', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const user = req.user!;
      console.log(`🌱 Admin ${user.username} initiated full test class seeding`);

      const { seedTestClass } = await import('./seed-test-class');

      console.log('Starting test class seeding...');
      const result = await seedTestClass();
      console.log('Test class seeding completed');

      res.json({
        success: true,
        message: 'Test class seeded successfully',
        environment: process.env.NODE_ENV || 'development',
        initiatedBy: user.username,
        result: {
          students: result.students.length,
          studentNames: result.students.slice(0, 5).map(s => `${s.firstName} ${s.lastName}`),
          mathErrors: result.mathErrors,
          spellingErrors: result.spellingErrors,
          vocabulary: result.vocabulary,
          creativeTasks: result.creativeTasks,
          assessments: result.assessments,
          profiles: result.profiles
        }
      });

    } catch (error: any) {
      console.error('❌ Test class seeding failed:', error);
      res.status(500).json({
        success: false,
        error: 'Seeding failed',
        message: error.message,
        stack: error.stack
      });
    }
  });

  // Check seeding status
  app.get('/api/admin/seed-status', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const classes = await storage.getAllClasses();
      const testClass = classes.find(c => c.name === 'Test');
      
      let stats: any = {
        environment: process.env.NODE_ENV || 'development',
        databaseUrl: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
        classes: classes.length
      };

      if (testClass) {
        const students = await storage.getStudentsByClass(testClass.id);
        const creativeTasks = await storage.getAllCreativeTasks();
        
        stats.testClass = {
          found: true,
          id: testClass.id,
          students: students.length,
          studentNames: students.slice(0, 5).map(s => `${s.firstName} ${s.lastName}`)
        };
        stats.creativeTasks = creativeTasks.length;
      } else {
        stats.testClass = {
          found: false,
          message: 'Test class not found - database may need seeding'
        };
      }

      res.json(stats);

    } catch (error: any) {
      res.status(500).json({
        error: 'Status check failed',
        message: error.message,
        stack: error.stack
      });
    }
  });

  // Simple test endpoint to verify admin access
  app.get('/api/admin/test', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Admin access verified',
        user: req.user?.username,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Class routes
  app.get("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;

      // Admins see all classes
      if (user.role === "admin") {
        const allClasses = await storage.getClasses();
        res.json(allClasses);
      } else {
        // Teachers see their own class + Test class
        // If no class assigned (OAuth users), show all classes
        const classes = await storage.getClasses();

        if (!user.classId) {
          // No class assigned - show all classes so teacher can select one
          res.json(classes);
        } else {
          // Class assigned - show only their class + Test class
          const teacherClasses = classes.filter(c => 
            c.id === user.classId || c.name === "Test"
          );
          res.json(teacherClasses);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  // Student routes
  app.get("/api/students", isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { classId } = req.query;

      if (!classId || typeof classId !== 'string') {
        return res.status(400).json({ message: "classId is required" });
      }

      // Admins can access any class
      // Teachers with no assigned class can access any class
      // Teachers with assigned class can only access their class or Test class
      if (user.role !== "admin" && user.classId) {
        const allowedClasses = await storage.getClasses();
        const isAllowed = allowedClasses.some(c => 
          c.id === classId && (c.id === user.classId || c.name === "Test")
        );
        if (!isAllowed) {
          return res.status(403).json({ message: "Access denied to this class" });
        }
      }

      const students = await storage.getStudentsByClass(classId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req, res) => {
    try {
      const studentData = z.object({
        firstName: z.string(),
        lastName: z.string(),
        classId: z.string(),
        gender: z.enum(['male', 'female', 'other']).optional(),
      }).parse(req.body);

      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const studentData = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        classId: z.string().optional(),
      }).parse(req.body);

      const student = await storage.updateStudent(req.params.id, studentData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Student error routes
  app.get("/api/students/:id/errors", isAuthenticated, async (req, res) => {
    try {
      const errors = await storage.getStudentErrors(req.params.id);
      res.json(errors);
    } catch (error) {
      console.error("Error fetching student errors:", error);
      res.status(500).json({ message: "Failed to fetch errors" });
    }
  });

  app.post("/api/students/:id/errors", isAuthenticated, async (req, res) => {
    try {
      const errorData = z.object({
        studentId: z.string(),
        errorText: z.string(),
        operation: z.enum(['addition', 'subtraction']),
        num1: z.number(),
        num2: z.number(),
        incorrectAnswer: z.number(),
        correctAnswer: z.number(),
        errorType: z.string().optional(),
      }).parse(req.body);

      // Automatically classify the error if not already classified
      if (!errorData.errorType) {
        const { classifySingleError } = await import('./math-pedagogy');
        const classification = classifySingleError({
          id: '', // temporary, will be set by storage
          ...errorData,
          createdAt: new Date()
        });
        errorData.errorType = classification || null;
      }

      const error = await storage.createStudentError(errorData);
      res.json(error);
    } catch (error) {
      console.error("Error creating student error:", error);
      res.status(500).json({ message: "Failed to create error" });
    }
  });

  app.delete("/api/errors/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudentError(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting error:", error);
      res.status(500).json({ message: "Failed to delete error" });
    }
  });

  // Spelling error routes
  app.get("/api/students/:id/spelling-errors", isAuthenticated, async (req, res) => {
    try {
      const spellingErrors = await storage.getSpellingErrors(req.params.id);
      res.json(spellingErrors);
    } catch (error) {
      console.error("Error fetching spelling errors:", error);
      res.status(500).json({ message: "Failed to fetch spelling errors" });
    }
  });

  app.post("/api/students/:id/spelling-errors", isAuthenticated, async (req, res) => {
    try {
      const { analyzeSpellingError } = await import("./spelling-pedagogy");

      const errorData = z.object({
        studentId: z.string(),
        incorrectWord: z.string(),
        correctWord: z.string(),
        context: z.string().optional(),
        isDaz: z.number().optional().default(0),
        nativeLanguage: z.string().optional(),
      }).parse(req.body);

      // Validate studentId matches route parameter
      if (errorData.studentId !== req.params.id) {
        return res.status(400).json({ message: "Student ID mismatch" });
      }

      // Analyse durchführen
      const analyses = analyzeSpellingError(
        errorData.incorrectWord,
        errorData.correctWord,
        errorData.context,
        errorData.isDaz === 1
      );

      // Hauptkategorie verwenden (höchste Confidence)
      const mainAnalysis = analyses.sort((a, b) => b.confidence - a.confidence)[0];

      // Fehler mit Analyse-Ergebnissen speichern
      const spellingError = await storage.createSpellingError({
        ...errorData,
        errorCategory: mainAnalysis.category,
        errorSubtype: mainAnalysis.subtype,
        analysisDetails: analyses as any,
      });

      res.json(spellingError);
    } catch (error) {
      console.error("Error creating spelling error:", error);
      res.status(500).json({ message: "Failed to create spelling error" });
    }
  });

  app.delete("/api/spelling-errors/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSpellingError(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting spelling error:", error);
      res.status(500).json({ message: "Failed to delete spelling error" });
    }
  });

  // Spelling analytics route (classified errors for a student)
  app.get("/api/students/:id/spelling-analytics", isAuthenticated, async (req, res) => {
    try {
      const { classifySpellingErrors } = await import("./spelling-pedagogy");

      const spellingErrors = await storage.getSpellingErrors(req.params.id);

      if (spellingErrors.length === 0) {
        return res.json({ classified: [], totalErrors: 0 });
      }

      // Klassifiziere die Fehler nach Strategien
      const classified = classifySpellingErrors(spellingErrors);

      res.json({
        classified,
        totalErrors: spellingErrors.length,
        strategies: {
          alphabetic: classified.filter(c => c.category === 'alphabetic').reduce((sum, c) => sum + c.errors.length, 0),
          orthographic: classified.filter(c => c.category === 'orthographic').reduce((sum, c) => sum + c.errors.length, 0),
          morphematic: classified.filter(c => c.category === 'morphematic').reduce((sum, c) => sum + c.errors.length, 0),
          grammatical: classified.filter(c => c.category === 'grammatical').reduce((sum, c) => sum + c.errors.length, 0),
        }
      });
    } catch (error) {
      console.error("Error analyzing spelling errors:", error);
      res.status(500).json({ message: "Failed to analyze spelling errors" });
    }
  });

  // Vocabulary routes
  app.get("/api/students/:id/vocabulary", isAuthenticated, async (req, res) => {
    try {
      const words = await storage.getVocabularyWords(req.params.id);
      res.json(words);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch vocabulary" });
    }
  });

  app.post("/api/students/:id/vocabulary", isAuthenticated, async (req, res) => {
    try {
      const wordData = z.object({
        studentId: z.string(),
        englishWord: z.string(),
        germanTranslation: z.string(),
        category: z.string().optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const word = await storage.createVocabularyWord(wordData);
      res.json(word);
    } catch (error) {
      console.error("Error creating vocabulary word:", error);
      res.status(500).json({ message: "Failed to create vocabulary word" });
    }
  });

  app.delete("/api/vocabulary/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteVocabularyWord(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vocabulary word:", error);
      res.status(500).json({ message: "Failed to delete vocabulary word" });
    }
  });

  // Creative Tasks routes
  // Get all creative tasks
  app.get("/api/creative-tasks", async (req, res) => {
    try {
      const tasks = await db.query.creativeTasks.findMany({
        orderBy: (creativeTasks, { asc }) => [asc(creativeTasks.category), asc(creativeTasks.title)],
      });

      return res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching creative tasks:", error);
      return res.status(500).send(error.message);
    }
  });

  // Create a new creative task
  app.post("/api/creative-tasks", isAuthenticated, async (req, res) => {
    try {
      const taskData = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.string(),
        ageGroup: z.string().optional(),
      }).parse(req.body);

      const newTask = await storage.createCreativeTask(taskData);
      console.log("Created new creative task:", newTask.id);

      res.json(newTask);
    } catch (error: any) {
      console.error("Error creating creative task:", error);
      res.status(500).json({ message: "Failed to create creative task", error: error.message });
    }
  });

  app.get("/api/creative-tasks/category/:category", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getCreativeTasksByCategory(req.params.category);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching creative tasks by category:", error);
      res.status(500).json({ message: "Failed to fetch creative tasks" });
    }
  });

  app.get("/api/students/:id/creative-tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getStudentCreativeTasks(req.params.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching student creative tasks:", error);
      res.status(500).json({ message: "Failed to fetch student creative tasks" });
    }
  });

  app.get("/api/students/:id/creative-recommendations", isAuthenticated, async (req, res) => {
    try {
      const studentId = req.params.id;

      // Validate student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const profile = await storage.getStudentCreativeProfile(studentId);
      const allTasks = await storage.getAllCreativeTasks();
      const assignedTasks = await storage.getStudentCreativeTasks(studentId);

      // Handle case where no tasks exist
      if (!allTasks || allTasks.length === 0) {
        console.log("No creative tasks available in database");
        return res.json([]);
      }

      const assignedTaskIds = assignedTasks?.map(t => t.taskId) || [];

      const { matchTasksToStudent } = await import('./creative-matching');
      const recommendations = matchTasksToStudent(allTasks, profile, assignedTaskIds);

      console.log(`Generated ${recommendations.length} recommendations for student ${studentId}`);
      res.json(recommendations || []);
    } catch (error) {
      console.error("Error fetching creative recommendations:", error);
      res.status(500).json({ message: "Failed to fetch creative recommendations", error: String(error) });
    }
  });

  app.post("/api/students/:id/creative-tasks", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const assignmentData = z.object({
        taskId: z.string(),
        notes: z.string().optional(),
      }).parse(req.body);

      const assignment = await storage.assignCreativeTask({
        studentId: req.params.id,
        taskId: assignmentData.taskId,
        assignedBy: user.id,
        notes: assignmentData.notes,
      });
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning creative task:", error);
      res.status(500).json({ message: "Failed to assign creative task" });
    }
  });

  app.delete("/api/creative-tasks/assignment/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudentCreativeTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting creative task assignment:", error);
      res.status(500).json({ message: "Failed to delete creative task assignment" });
    }
  });

  // Student creative profile routes
  app.get("/api/students/:id/creative-profile", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getStudentCreativeProfile(req.params.id);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching creative profile:", error);
      res.status(500).json({ message: "Failed to fetch creative profile" });
    }
  });

  app.post("/api/students/:id/creative-profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const profileData = z.object({
        studentId: z.string(),
        interests: z.array(z.string()).optional(),
        strengths: z.array(z.string()).optional(),
        creativityType: z.object({
          visualVerbal: z.number().min(-1).max(1).optional(),
          practicalFantasy: z.number().min(-1).max(1).optional(),
          structuredExperimental: z.number().min(-1).max(1).optional(),
          soloCollaborative: z.number().min(-1).max(1).optional(),
          detailOverview: z.number().min(-1).max(1).optional(),
        }).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      // Validate studentId matches route parameter
      if (profileData.studentId !== req.params.id) {
        return res.status(400).json({ message: "Student ID mismatch" });
      }

      const profile = await storage.upsertStudentCreativeProfile({
        ...profileData,
        updatedBy: user.id,
      });

      res.json(profile);
    } catch (error) {
      console.error("Error saving creative profile:", error);
      res.status(500).json({ message: "Failed to save creative profile" });
    }
  });

  // Creative task recommendations
  app.get("/api/students/:id/creative-recommendations", isAuthenticated, async (req, res) => {
    try {
      const { matchTasksToStudent } = await import("./creative-matching");

      const studentId = req.params.id;

      // Validate student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const profile = await storage.getStudentCreativeProfile(studentId);
      const allTasks = await storage.getAllCreativeTasks();
      const assignedTasks = await storage.getStudentCreativeTasks(studentId);

      // Handle case where no tasks exist
      if (!allTasks || allTasks.length === 0) {
        return res.json([]);
      }

      const assignedTaskIds = assignedTasks?.map(t => t.taskId) || [];
      const recommendations = matchTasksToStudent(allTasks, profile, assignedTaskIds);

      res.json(recommendations || []);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations", error: String(error) });
    }
  });

  // Creativity Dice - Random task generator
  app.get("/api/creativity-dice/roll", isAuthenticated, async (req, res) => {
    try {
      const { rollCreativityDice } = await import('./creativity-dice');
      const result = rollCreativityDice();
      res.json(result);
    } catch (error) {
      console.error("Error rolling creativity dice:", error);
      res.status(500).json({ message: "Failed to roll creativity dice" });
    }
  });

  app.get("/api/creativity-dice/options", isAuthenticated, async (req, res) => {
    try {
      const { getDiceOptions } = await import('./creativity-dice');
      const options = getDiceOptions();
      res.json(options);
    } catch (error) {
      console.error("Error getting dice options:", error);
      res.status(500).json({ message: "Failed to get dice options" });
    }
  });

  app.post("/api/creativity-dice/roll-custom", isAuthenticated, async (req, res) => {
    try {
      const { rollWithConstraints } = await import('./creativity-dice');

      // Validate constraints
      const constraintsSchema = z.object({
        who: z.array(z.string()).optional(),
        what: z.array(z.string()).optional(),
        where: z.array(z.string()).optional(),
        when: z.array(z.string()).optional(),
        why: z.array(z.string()).optional(),
      });

      const parseResult = constraintsSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid constraints format",
          errors: parseResult.error.errors
        });
      }

      const result = rollWithConstraints(parseResult.data);
      res.json(result);
    } catch (error) {
      console.error("Error rolling with constraints:", error);
      res.status(500).json({ message: "Failed to roll with constraints" });
    }
  });

  // ========================================
  // LIVING LIFE ROUTES
  // ========================================

  // Initialize categories (run once to populate database)
  app.post("/api/living-life/categories/init", isAuthenticated, async (req, res) => {
    try {
      const existingCategories = await storage.getAllLivingLifeCategories();

      if (existingCategories.length > 0) {
        return res.json({ 
          message: "Categories already initialized", 
          count: existingCategories.length 
        });
      }

      const created = [];
      for (const category of LIVING_LIFE_CATEGORIES) {
        const newCategory = await storage.createLivingLifeCategory({
          name: category.name,
          displayName: category.displayName,
          description: category.description,
          icon: category.icon,
          color: category.color,
          orderIndex: category.orderIndex,
        });
        created.push(newCategory);
      }

      res.json({ 
        message: "Categories initialized successfully", 
        count: created.length,
        categories: created 
      });
    } catch (error) {
      console.error("Error initializing Living Life categories:", error);
      res.status(500).json({ message: "Failed to initialize categories" });
    }
  });

  // Get all Living Life categories (auto-initializes if empty)
  app.get("/api/living-life/categories", isAuthenticated, async (req, res) => {
    try {
      let categories = await storage.getAllLivingLifeCategories();

      // Auto-initialize categories if empty (with race-condition protection)
      if (categories.length === 0) {
        console.log("Living Life categories not found. Auto-initializing...");
        for (const category of LIVING_LIFE_CATEGORIES) {
          try {
            await storage.createLivingLifeCategory({
              name: category.name,
              displayName: category.displayName,
              description: category.description,
              icon: category.icon,
              color: category.color,
              orderIndex: category.orderIndex,
            });
          } catch (error: any) {
            // Ignore duplicate key errors (race condition protection)
            if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) {
              throw error;
            }
          }
        }
        categories = await storage.getAllLivingLifeCategories();
        console.log(`Living Life categories initialized: ${categories.length} categories`);
      }

      res.json(categories);
    } catch (error) {
      console.error("Error fetching Living Life categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all Living Life tasks
  app.get("/api/living-life/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getAllLivingLifeTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching Living Life tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Generate Living Life tasks based on criteria (creates task in DB and returns it)
  app.post("/api/living-life/generate", isAuthenticated, async (req, res) => {
    try {
      const generateParams = z.object({
        categoryName: z.string().optional(),
        difficultyLevel: z.enum(["entdecken", "erforschen", "vertiefen"]).optional(),
        ageGroup: z.enum(["klasse_1_2", "klasse_3_4", "klasse_5_6"]).optional(),
        keywords: z.array(z.string()).optional(),
        count: z.number().min(1).max(10).optional(),
      }).parse(req.body);

      // Get categories and auto-initialize if empty (with race-condition protection)
      let categories = await storage.getAllLivingLifeCategories();

      if (categories.length === 0) {
        console.log("Living Life categories not found during generate. Auto-initializing...");
        for (const category of LIVING_LIFE_CATEGORIES) {
          try {
            await storage.createLivingLifeCategory({
              name: category.name,
              displayName: category.displayName,
              description: category.description,
              icon: category.icon,
              color: category.color,
              orderIndex: category.orderIndex,
            });
          } catch (error: any) {
            // Ignore duplicate key errors (race condition protection)
            if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) {
              throw error;
            }
          }
        }
        categories = await storage.getAllLivingLifeCategories();
        console.log(`Living Life categories initialized during generate: ${categories.length} categories`);
      }

      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      }, {} as Record<string, string>);

      // Generate task templates
      const taskTemplates = generateTasks(generateParams);

      if (taskTemplates.length === 0) {
        return res.status(400).json({ message: "No tasks found matching criteria" });
      }

      // Pick first template and create task in DB
      const template = taskTemplates[0];

      const createdTask = await storage.createLivingLifeTask({
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
      });

      res.json({ task: createdTask });
    } catch (error) {
      console.error("Error generating Living Life tasks:", error);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });

  // Get weekly plan for a student
  app.get("/api/living-life/weekly-plan/:ageGroup", isAuthenticated, async (req, res) => {
    try {
      const ageGroup = req.params.ageGroup as "klasse_1_2" | "klasse_3_4" | "klasse_5_6";
      const weekPlan = generateWeeklyPlan(ageGroup);
      res.json(weekPlan);
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      res.status(500).json({ message: "Failed to generate weekly plan" });
    }
  });

  // Get student's Living Life assignments
  app.get("/api/students/:id/living-life-assignments", isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getStudentLivingLifeAssignments(req.params.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching Living Life assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Assign Living Life task to student (accepts taskId or template data)
  app.post("/api/students/:id/living-life-assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const assignmentData = z.object({
        taskId: z.string().optional(),
        template: z.object({
          categoryName: z.string(),
          title: z.string(),
          description: z.string(),
          instructions: z.string(),
          difficultyLevel: z.string(),
          ageGroup: z.string(),
          estimatedDuration: z.number(),
          subjectConnections: z.array(z.string()),
          materials: z.array(z.string()),
          documentationFormats: z.array(z.string()),
          reflectionQuestions: z.array(z.string()),
          parentTips: z.string(),
          keywords: z.array(z.string()),
        }).optional(),
        dueDate: z.string().optional(),
        teacherNotes: z.string().optional(),
      }).parse(req.body);

      let taskId = assignmentData.taskId;

      // If template provided, create task in DB first
      if (assignmentData.template && !taskId) {
        const newTask = await storage.createLivingLifeTask({
          category_name: assignmentData.template.categoryName,
          title: assignmentData.template.title,
          description: assignmentData.template.description,
          instructions: assignmentData.template.instructions,
          difficultyLevel: assignmentData.template.difficultyLevel,
          ageGroup: assignmentData.template.ageGroup,
          estimatedDuration: assignmentData.template.estimatedDuration,
          subjectConnections: assignmentData.template.subjectConnections,
          materials: assignmentData.template.materials,
          documentationFormats: assignmentData.template.documentationFormats,
          reflectionQuestions: assignmentData.template.reflectionQuestions,
          parentTips: assignmentData.template.parentTips,
          variations: null,
          keywords: assignmentData.template.keywords,
          isActive: 1,
        });
        taskId = newTask.id;
      }

      if (!taskId) {
        return res.status(400).json({ message: "Either taskId or template must be provided" });
      }

      const assignment = await storage.createLivingLifeAssignment({
        studentId: req.params.id,
        taskId: taskId,
        assignedBy: user.id,
        dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate) : null,
        status: "zugewiesen",
        teacherNotes: assignmentData.teacherNotes || null,
      });

      res.json(assignment);
    } catch (error) {
      console.error("Error assigning Living Life task:", error);
      res.status(500).json({ message: "Failed to assign task" });
    }
  });

  // Update Living Life assignment
  app.patch("/api/living-life/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const updateData = z.object({
        status: z.enum(["zugewiesen", "in_bearbeitung", "abgeschlossen"]).optional(),
        dueDate: z.string().optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const data: any = {};
      if (updateData.status) data.status = updateData.status;
      if (updateData.dueDate) data.dueDate = new Date(updateData.dueDate);
      if (updateData.notes !== undefined) data.notes = updateData.notes;

      const updated = await storage.updateLivingLifeAssignment(req.params.id, data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating Living Life assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  // Delete Living Life assignment
  app.delete("/api/living-life/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLivingLifeAssignment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting Living Life assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Generate Living Life PDF for a task (preview before assignment)
  app.get("/api/living-life/tasks/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getLivingLifeTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const category = await storage.getLivingLifeCategory(task.categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const studentName = "Vorschau";
      const doc = generateLivingLifeWorksheet(
        studentName,
        task,
        category.displayName,
        category.color,
        null,
        null
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="LivingLife_${task.title.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating Living Life task PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Generate Living Life assignment PDF
  app.get("/api/living-life/assignments/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      const assignment = await storage.getLivingLifeAssignment(req.params.id);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const student = await storage.getStudent(assignment.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const task = await storage.getLivingLifeTask(assignment.taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const categories = await storage.getAllLivingLifeCategories();
      const category = categories.find(cat => cat.name === task.category_name);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateLivingLifeWorksheet(
        studentName,
        task,
        category.displayName,
        category.color,
        assignment.dueDate,
        assignment.teacherNotes
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="LivingLife_${studentName.replace(' ', '_')}_${task.title.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating Living Life PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Get student's Living Life badges
  app.get("/api/students/:id/living-life-badges", isAuthenticated, async (req, res) => {
    try {
      const badges = await storage.getStudentLivingLifeBadges(req.params.id);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching Living Life badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Award Living Life badge to student
  app.post("/api/students/:id/living-life-badges", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const badgeData = z.object({
        badgeId: z.string(),
      }).parse(req.body);

      const award = await storage.awardLivingLifeBadge({
        studentId: req.params.id,
        badgeId: badgeData.badgeId,
        awardedBy: user.id,
      });

      res.json(award);
    } catch (error) {
      console.error("Error awarding Living Life badge:", error);
      res.status(500).json({ message: "Failed to award badge" });
    }
  });

  // Self-Concept Assessment routes
  // Get all dimensions
  app.get("/api/assessments/dimensions", isAuthenticated, async (req, res) => {
    try {
      const dimensions = await storage.getAllDimensions();
      res.json(dimensions);
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      res.status(500).json({ message: "Failed to fetch dimensions" });
    }
  });

  // Get all items
  app.get("/api/assessments/items", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Get student assessments
  app.get("/api/students/:id/assessments", isAuthenticated, async (req: any, res) => {
    try {
      // Authorization: Verify teacher can access this student
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = req.user!;
      const isAdmin = user.role === "admin" && (user.username === "Stie" || user.username === "Meie");
      if (!isAdmin && student.classId !== user.classId) {
        return res.status(403).json({ message: "Unauthorized to access this student's assessments" });
      }

      const assessments = await storage.getStudentAssessments(req.params.id);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching student assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Create new assessment
  app.post("/api/students/:id/assessments", isAuthenticated, async (req: any, res) => {
    try {
      const assessmentData = z.object({
        assessmentType: z.enum(['interview', 'self_report']).default('interview'),
        responses: z.array(z.object({
          itemId: z.string(),
          responseValue: z.number().min(1).max(4),
        })).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      // Authorization: Verify teacher can access this student
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = req.user!;
      const isAdmin = user.role === "admin" && (user.username === "Stie" || user.username === "Meie");
      if (!isAdmin && student.classId !== user.classId) {
        return res.status(403).json({ message: "Unauthorized to assess this student" });
      }

      // Create the assessment using authenticated user and URL param studentId for security
      const assessment = await storage.createAssessment({
        studentId: req.params.id,
        conductedBy: req.user!.id,
        assessmentType: assessmentData.assessmentType,
        status: 'in_progress',
        notes: assessmentData.notes,
      });

      // Create responses if provided and mark as completed
      if (assessmentData.responses && assessmentData.responses.length > 0) {
        const responsesData = assessmentData.responses.map(r => ({
          assessmentId: assessment.id,
          itemId: r.itemId,
          responseValue: r.responseValue,
        }));
        await storage.createBulkResponses(responsesData);

        // Mark as completed when responses are submitted
        await storage.updateAssessment(assessment.id, {
          status: 'completed',
          completedAt: new Date(),
        });

        const updatedAssessment = await storage.getAssessment(assessment.id);
        res.json(updatedAssessment);
      } else {
        res.json(assessment);
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  // Get assessment details with responses
  app.get("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Authorization: Verify teacher can access this assessment
      const student = await storage.getStudent(assessment.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = req.user!;
      const isAdmin = user.role === "admin" && (user.username === "Stie" || user.username === "Meie");
      if (!isAdmin && student.classId !== user.classId) {
        return res.status(403).json({ message: "Unauthorized to access this assessment" });
      }

      const responses = await storage.getAssessmentResponses(req.params.id);
      res.json({ ...assessment, responses });
    } catch (error) {
      console.error("Error fetching assessment details:", error);
      res.status(500).json({ message: "Failed to fetch assessment details" });
    }
  });

  // Update assessment (e.g., mark as completed)
  app.patch("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const updateData = z.object({
        status: z.enum(['in_progress', 'completed']).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Authorization: Verify teacher can update this assessment
      const student = await storage.getStudent(assessment.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = req.user!;
      const isAdmin = user.role === "admin" && (user.username === "Stie" || user.username === "Meie");
      if (!isAdmin && student.classId !== user.classId) {
        return res.status(403).json({ message: "Unauthorized to update this assessment" });
      }

      const data: any = { ...updateData };
      if (updateData.status === 'completed') {
        data.completedAt = new Date();
      }

      const updatedAssessment = await storage.updateAssessment(req.params.id, data);
      res.json(updatedAssessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  // Delete assessment
  app.delete("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Authorization: Verify teacher can delete this assessment
      const student = await storage.getStudent(assessment.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = req.user!;
      const isAdmin = user.role === "admin" && (user.username === "Stie" || user.username === "Meie");
      if (!isAdmin && student.classId !== user.classId) {
        return res.status(403).json({ message: "Unauthorized to delete this assessment" });
      }

      await storage.deleteAssessment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // Get assessment results with calculated scores and percentiles
  app.get("/api/assessments/:id/results", isAuthenticated, async (req: any, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Authorization: Verify teacher can access this assessment
      const student = await storage.getStudent(assessment.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = req.user!;
      const isAdmin = user.role === "admin" && (user.username === "Stie" || user.username === "Meie");
      if (!isAdmin && student.classId !== user.classId) {
        return res.status(403).json({ message: "Unauthorized to access this assessment" });
      }

      const responses = await storage.getAssessmentResponses(req.params.id);
      const dimensions = await storage.getAllDimensions();
      const items = await storage.getAllItems();

      // Calculate dimension scores
      const dimensionScores = dimensions.map(dimension => {
        const dimensionItems = items.filter(item => item.dimensionId === dimension.id);
        const dimensionResponses = responses.filter(r => 
          dimensionItems.some(item => item.id === r.itemId)
        );

        // Calculate average score for this dimension (accounting for polarity)
        let totalScore = 0;
        dimensionResponses.forEach(response => {
          const item = dimensionItems.find(i => i.id === response.itemId);
          if (item?.polarity === 'negative') {
            totalScore += (5 - response.responseValue); // Reverse scoring
          } else {
            totalScore += response.responseValue;
          }
        });

        const averageScore = dimensionResponses.length > 0 
          ? totalScore / dimensionResponses.length 
          : 0;

        return {
          dimensionId: dimension.id,
          dimensionName: dimension.displayName,
          score: averageScore,
          itemCount: dimensionItems.length,
          responseCount: dimensionResponses.length,
        };
      });

      // TODO: Calculate percentiles based on norm values (requires norm data)

      res.json({
        assessment,
        student,
        dimensionScores,
        totalItems: items.length,
        completedItems: responses.length,
      });
    } catch (error) {
      console.error("Error calculating assessment results:", error);
      res.status(500).json({ message: "Failed to calculate results" });
    }
  });

  // Class-level analytics routes
  app.get("/api/class/:classId/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const classId = req.params.classId;
      const students = await storage.getStudentsByClass(classId);
      const studentIds = students.map(s => s.id);

      // Fetch all errors in parallel
      const [mathErrors, spellingErrors, vocabularyWords, creativeTasks] = await Promise.all([
        Promise.all(studentIds.map(id => storage.getStudentErrors(id))).then(arrays => arrays.flat()),
        Promise.all(studentIds.map(id => storage.getSpellingErrors(id))).then(arrays => arrays.flat()),
        Promise.all(studentIds.map(id => storage.getVocabularyWords(id))).then(arrays => arrays.flat()),
        Promise.all(studentIds.map(id => storage.getStudentCreativeTasks(id))).then(arrays => arrays.flat()),
      ]);

      // Import analytics module
      const {
        generateErrorTimeline,
        generateNumberHeatmap,
        analyzeCognitiveLead
      } = await import('./analytics');

      // Calculate analytics
      const analytics = {
        mathErrors: {
          total: mathErrors.length,
          addition: mathErrors.filter(e => e.operation === 'addition').length,
          subtraction: mathErrors.filter(e => e.operation === 'subtraction').length,
          studentsAffected: new Set(mathErrors.map(e => e.studentId)).size,
          timeline: generateErrorTimeline(mathErrors),
          heatmap: generateNumberHeatmap(mathErrors),
        },
        spellingErrors: {
          total: spellingErrors.length,
          studentsAffected: new Set(spellingErrors.map(e => e.studentId)).size,
          topErrors: Object.entries(
            spellingErrors.reduce((acc, err) => {
              const key = `${err.incorrectWord}→${err.correctWord}`;
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([pair, count]) => {
              const [incorrect, correct] = pair.split('→');
              return { incorrect, correct, count };
            }),
        },
        vocabulary: {
          total: vocabularyWords.length,
          studentsLearning: new Set(vocabularyWords.map(v => v.studentId)).size,
        },
        creativeTasks: {
          total: creativeTasks.length,
          studentsWithTasks: new Set(creativeTasks.map(ct => ct.studentId)).size,
          topCategories: Object.entries(
            creativeTasks.reduce((acc, task) => {
              const category = task.task.category;
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count })),
        },
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching class analytics:", error);
      res.status(500).json({ message: "Failed to fetch class analytics" });
    }
  });

  // PDF Worksheet Generation routes
  app.get("/api/students/:id/worksheet/math", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const errors = await storage.getStudentErrors(req.params.id);
      if (errors.length === 0) {
        return res.status(400).json({ message: "No math errors found for student" });
      }

      const options = parseTemplateOptions(req.query);
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateMathWorksheet(studentName, errors, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Mathe_${studentName.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating math worksheet:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate math worksheet" });
      }
    }
  });

  app.get("/api/students/:id/worksheet/spelling", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const errors = await storage.getSpellingErrors(req.params.id);
      if (errors.length === 0) {
        return res.status(400).json({ message: "No spelling errors found for student" });
      }

      const options = parseTemplateOptions(req.query);
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateSpellingWorksheet(studentName, errors, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Rechtschreibung_${studentName.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating spelling worksheet:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate spelling worksheet" });
      }
    }
  });

  app.get("/api/students/:id/worksheet/vocabulary", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const words = await storage.getVocabularyWords(req.params.id);
      if (words.length === 0) {
        return res.status(400).json({ message: "No vocabulary words found for student" });
      }

      const options = parseTemplateOptions(req.query);
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateVocabularyWorksheet(studentName, words, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Vokabeln_${studentName.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating vocabulary worksheet:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate vocabulary worksheet" });
      }
    }
  });

  app.get("/api/students/:id/worksheet/creative", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const tasks = await storage.getStudentCreativeTasks(req.params.id);
      if (tasks.length === 0) {
        return res.status(400).json({ message: "No creative tasks assigned to student" });
      }

      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateCreativeTaskWorksheet(studentName, tasks);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Kreativ_${studentName.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating creative task worksheet:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate creative task worksheet" });
      }
    }
  });

  // Generate Facetten worksheet PDF
  app.get('/api/students/:id/worksheet/facetten', isAuthenticated, async (req, res) => {
    try {
      const studentId = req.params.id;
      const student = await storage.getStudent(studentId);

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const errors = await storage.getStudentErrors(studentId);

      if (errors.length === 0) {
        return res.status(400).json({ message: 'No errors found for this student' });
      }

      // Import facetten generator
      const { generateFacettenWorksheet } = await import('./facetten-generator');
      const { classifyErrors } = await import('./math-pedagogy');

      const classified = classifyErrors(errors);

      if (classified.length === 0) {
        return res.status(400).json({ message: 'No classifiable errors' });
      }

      // Generate facetten worksheet for primary error
      const primaryError = classified[0];
      const clusterWorksheet = generateFacettenWorksheet(
        primaryError.category,
        primaryError.targetNumbers
      );

      const { generateFacettenWorksheet: generatePDF } = await import('./pdf-generators');
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generatePDF(studentName, clusterWorksheet);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${studentName.replace(/\s+/g, '_')}_Facetten.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating facetten worksheet:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate facetten worksheet" });
      }
    }
  });

  app.get("/api/homework/:homeworkId/pdf", isAuthenticated, async (req, res) => {
    try {
      const homework = await storage.getHomework(req.params.homeworkId);
      if (!homework) {
        return res.status(404).json({ message: "Homework not found" });
      }

      const student = await storage.getStudent(homework.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateHomeworkWorksheet(studentName, homework.content as any);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Hausaufgabe_${studentName.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating homework PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate homework PDF" });
      }
    }
  });

  // Homework routes
  app.post("/api/homework/generate", isAuthenticated, async (req, res) => {
    try {
      console.log("📥 Homework generation request:", req.body);
      
      const { studentId, pageCount, errorIds, settings } = z.object({
        studentId: z.string(),
        pageCount: z.number().min(1).max(4),
        errorIds: z.array(z.string()).optional(),
        settings: z.object({
          includeVisualization: z.boolean().optional(),
          includeReflection: z.boolean().optional(),
          difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
        }).optional(),
      }).parse(req.body);

      const student = await storage.getStudent(studentId);
      if (!student) {
        console.error("❌ Student not found:", studentId);
        return res.status(404).json({ message: "Student not found" });
      }

      const allErrors = await storage.getStudentErrors(studentId);
      console.log(`📊 Total errors for student: ${allErrors.length}`);
      
      // Filter errors if errorIds provided
      const errors = errorIds && errorIds.length > 0
        ? allErrors.filter(e => errorIds.includes(e.id))
        : allErrors;
      
      console.log(`📊 Filtered errors: ${errors.length}`);
      
      if (errors.length === 0) {
        console.error("❌ No errors found for selected criteria");
        return res.status(400).json({ message: "No errors found for selected criteria" });
      }

      const studentName = `${student.firstName} ${student.lastName}`;
      console.log(`🎯 Generating homework for: ${studentName}, Pages: ${pageCount}, Errors: ${errors.length}`);
      
      const content = await generateHomeworkContent(
        studentName, 
        errors, 
        pageCount,
        settings
      );

      console.log("✅ Homework content generated successfully");

      const homework = await storage.createHomework({
        studentId,
        title: content.title,
        content: content as any,
        pdfUrl: null,
        targetErrors: errors.map(e => e.id) as any,
      });

      console.log("✅ Homework created with ID:", homework.id);

      // Return homework with PDF download URL
      const response = {
        id: homework.id,
        studentId: homework.studentId,
        title: homework.title,
        content: homework.content,
        pdfUrl: `/api/homework/${homework.id}/pdf`,
        createdAt: homework.createdAt,
      };

      console.log("📤 Sending homework response with ID:", response.id);
      res.json(response);
    } catch (error: any) {
      console.error("❌ Error generating homework:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ 
        message: error.message || "Failed to generate homework",
        error: error.toString()
      });
    }
  });

  app.get("/api/students/:id/homeworks", isAuthenticated, async (req, res) => {
    try {
      const homeworks = await storage.getStudentHomeworks(req.params.id);
      res.json(homeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      res.status(500).json({ message: "Failed to fetch homeworks" });
    }
  });

  // PDF Preview endpoints (return base64 for preview)
  app.get("/api/students/:studentId/worksheet/math/preview", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const errors = await storage.getStudentErrors(req.params.studentId);
      if (errors.length === 0) {
        return res.status(400).json({ message: "No math errors found for student" });
      }

      const options = parseTemplateOptions(req.query);
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateMathWorksheet(studentName, errors, options);

      // Convert PDF to base64 properly
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        res.json({
          base64,
          filename: `${studentName.replace(' ', '_')}_Mathe.pdf`
        });
      });
      doc.on('error', (err: Error) => {
        console.error("PDF generation error:", err);
        res.status(500).json({ message: "PDF generation failed" });
      });
      doc.end();
    } catch (error) {
      console.error("Error previewing math worksheet:", error);
      res.status(500).json({ message: "Failed to preview math worksheet" });
    }
  });

  app.get("/api/students/:studentId/worksheet/spelling/preview", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const errors = await storage.getSpellingErrors(req.params.studentId);
      if (errors.length === 0) {
        return res.status(400).json({ message: "No spelling errors found for student" });
      }

      const options = parseTemplateOptions(req.query);
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateSpellingWorksheet(studentName, errors, options);
      const base64 = await pdfToBase64(doc);

      res.json({
        base64,
        filename: `Rechtschreibung_${studentName.replace(' ', '_')}.pdf`
      });
    } catch (error) {
      console.error("Error previewing spelling worksheet:", error);
      res.status(500).json({ message: "Failed to preview spelling worksheet" });
    }
  });

  // NEUE ROUTE: Erweiterte Rechtschreib-Arbeitsblätter mit personalisierten Übungen
  app.get("/api/students/:id/worksheet/spelling-advanced/pdf", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const spellingErrors = await storage.getSpellingErrors(req.params.id);
      if (spellingErrors.length === 0) {
        return res.status(400).json({ message: "No spelling errors found for student" });
      }

      // Importiere benötigte Funktionen
      const { classifySpellingErrors } = await import("./spelling-pedagogy");
      const { createSpellingWorksheetPlan } = await import("./spelling-exercises");
      const { generateAdvancedSpellingWorksheet } = await import("./pdf-generators");

      // 1. Klassifiziere Fehler
      const classifiedErrors = classifySpellingErrors(spellingErrors);

      // 2. Erstelle Übungsplan
      const isDazStudent = spellingErrors.some(e => e.isDaz === 1);
      const studentName = `${student.firstName} ${student.lastName}`;
      const worksheetPlan = createSpellingWorksheetPlan(studentName, classifiedErrors, isDazStudent);

      // 3. Generiere PDF
      const options = parseTemplateOptions(req.query);
      const doc = generateAdvancedSpellingWorksheet(worksheetPlan, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Rechtschreibung_Erweitert_${studentName.replace(/\s+/g, '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating advanced spelling worksheet:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate advanced spelling worksheet" });
      }
    }
  });

  app.get("/api/students/:id/worksheet/spelling-advanced/preview", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const spellingErrors = await storage.getSpellingErrors(req.params.id);
      if (spellingErrors.length === 0) {
        return res.status(400).json({ message: "No spelling errors found for student" });
      }

      // Importiere benötigte Funktionen
      const { classifySpellingErrors } = await import("./spelling-pedagogy");
      const { createSpellingWorksheetPlan } = await import("./spelling-exercises");
      const { generateAdvancedSpellingWorksheet } = await import("./pdf-generators");

      // 1. Klassifiziere Fehler
      const classifiedErrors = classifySpellingErrors(spellingErrors);

      // 2. Erstelle Übungsplan
      const isDazStudent = spellingErrors.some(e => e.isDaz === 1);
      const studentName = `${student.firstName} ${student.lastName}`;
      const worksheetPlan = createSpellingWorksheetPlan(studentName, classifiedErrors, isDazStudent);

      // 3. Generiere PDF
      const options = parseTemplateOptions(req.query);
      const doc = generateAdvancedSpellingWorksheet(worksheetPlan, options);
      const base64 = await pdfToBase64(doc);

      res.json({
        base64,
        filename: `Rechtschreibung_Erweitert_${studentName.replace(' ', '_')}.pdf`,
        worksheetInfo: {
          errorFocus: worksheetPlan.errorFocus,
          exerciseCount: worksheetPlan.exercises.length,
          isDazStudent: worksheetPlan.isDazStudent
        }
      });
    } catch (error) {
      console.error("Error previewing advanced spelling worksheet:", error);
      res.status(500).json({ message: "Failed to preview advanced spelling worksheet" });
    }
  });

  app.get("/api/students/:studentId/worksheet/vocabulary/preview", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const words = await storage.getVocabularyWords(req.params.studentId);
      if (words.length === 0) {
        return res.status(400).json({ message: "No vocabulary words found for student" });
      }

      const options = parseTemplateOptions(req.query);
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateVocabularyWorksheet(studentName, words, options);

      // Convert PDF to base64 properly
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        res.json({
          base64,
          filename: `${studentName.replace(' ', '_')}_Vokabeln.pdf`
        });
      });
      doc.on('error', (err: Error) => {
        console.error("PDF generation error:", err);
        res.status(500).json({ message: "PDF generation failed" });
      });
      doc.end();
    } catch (error) {
      console.error("Error previewing vocabulary worksheet:", error);
      res.status(500).json({ message: "Failed to preview vocabulary worksheet" });
    }
  });

  app.get("/api/students/:id/worksheet/creative/preview", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const tasks = await storage.getStudentCreativeTasks(req.params.id);
      if (tasks.length === 0) {
        return res.status(400).json({ message: "No creative tasks assigned to student" });
      }

      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generateCreativeTaskWorksheet(studentName, tasks);
      const base64 = await pdfToBase64(doc);

      res.json({
        base64,
        filename: `Kreativ_${studentName.replace(' ', '_')}.pdf`
      });
    } catch (error) {
      console.error("Error previewing creative task worksheet:", error);
      res.status(500).json({ message: "Failed to preview creative task worksheet" });
    }
  });

  app.get('/api/students/:studentId/worksheet/facetten/preview', isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const errors = await storage.getStudentErrors(req.params.studentId);

      if (errors.length === 0) {
        return res.status(400).json({ message: "No errors found for this student" });
      }

      const { generateFacettenWorksheet } = await import('./facetten-generator');
      const { classifyErrors } = await import('./math-pedagogy');

      const classified = classifyErrors(errors);

      if (classified.length === 0) {
        return res.status(400).json({ message: 'No classifiable errors' });
      }

      const primaryError = classified[0];
      const clusterWorksheet = generateFacettenWorksheet(
        primaryError.category,
        primaryError.targetNumbers
      );

      const { generateFacettenWorksheet: generatePDF } = await import('./pdf-generators');
      const studentName = `${student.firstName} ${student.lastName}`;
      const doc = generatePDF(studentName, clusterWorksheet);

      // Convert PDF to base64 properly
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        res.json({
          base64,
          filename: `${studentName.replace(' ', '_')}_Facetten.pdf`
        });
      });
      doc.on('error', (err: Error) => {
        console.error("PDF generation error:", err);
        res.status(500).json({ message: "PDF generation failed" });
      });
      doc.end();
    } catch (error) {
      console.error("Error previewing facetten worksheet:", error);
      res.status(500).json({ message: "Failed to preview facetten worksheet" });
    }
  });

  app.get("/api/homework/:homeworkId/pdf/preview", isAuthenticated, async (req, res) => {
    try {
      const homework = await storage.getHomework(req.params.homeworkId);
      if (!homework) {
        console.error("Homework not found:", req.params.homeworkId);
        return res.status(404).json({ message: "Homework not found" });
      }

      const student = await storage.getStudent(homework.studentId);
      if (!student) {
        console.error("Student not found:", homework.studentId);
        return res.status(404).json({ message: "Student not found" });
      }

      const studentName = `${student.firstName} ${student.lastName}`;
      console.log("📄 Generating homework preview for:", studentName);

      const doc = generateHomeworkWorksheet(studentName, homework.content as any);

      // Convert PDF to base64 properly (same as math/vocabulary previews)
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          const base64 = pdfBuffer.toString('base64');
          console.log("✅ Homework PDF preview generated successfully, size:", base64.length);
          res.json({
            base64,
            filename: `Hausaufgabe_${studentName.replace(/\s+/g, '_')}.pdf`
          });
        } catch (err) {
          console.error("Error converting PDF to base64:", err);
          res.status(500).json({ message: "PDF conversion failed" });
        }
      });

      doc.on('error', (err: Error) => {
        console.error("❌ PDF generation error:", err);
        res.status(500).json({ message: "PDF generation failed" });
      });

      doc.end();
    } catch (error) {
      console.error("❌ Error previewing homework PDF:", error);
      res.status(500).json({ message: "Failed to preview homework PDF" });
    }
  });

  // Päckchen-Demonstrator routes (für Lehrpersonen)
  app.post("/api/paeckchen/demonstrate", isAuthenticated, async (req, res) => {
    try {
      const input = z.object({
        task: z.string(),
        userResult: z.number(),
        correctResult: z.number(),
      }).parse(req.body);

      const demonstration = demonstratePaeckchenGeneration(input);
      res.json(demonstration);
    } catch (error) {
      console.error("Error demonstrating päckchen:", error);
      res.status(500).json({ message: "Failed to demonstrate päckchen generation" });
    }
  });

  app.get("/api/paeckchen/catalog", isAuthenticated, async (req, res) => {
    try {
      const catalog = getPaeckchenCatalog();
      res.json(catalog);
    } catch (error) {
      console.error("Error fetching päckchen catalog:", error);
      res.status(500).json({ message: "Failed to fetch päckchen catalog" });
    }
  });

  // Help & Documentation routes
  app.get("/api/help/articles", async (req, res) => {
    try {
      const { category, search } = req.query;

      let articles = HELP_ARTICLES;

      // Apply search if provided
      if (search && typeof search === 'string') {
        articles = searchHelpArticles(search, category as string | undefined);
      } else if (category && typeof category === 'string' && category !== 'all') {
        articles = HELP_ARTICLES.filter(a => a.category === category);
      }

      res.json(articles);
    } catch (error) {
      console.error("Error fetching help articles:", error);
      res.status(500).json({ message: "Failed to fetch help articles" });
    }
  });

  app.get("/api/help/articles/:id", async (req, res) => {
    try {
      const article = HELP_ARTICLES.find(a => a.id === req.params.id);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching help article:", error);
      res.status(500).json({ message: "Failed to fetch help article" });
    }
  });

  app.get("/api/help/categories", async (req, res) => {
    try {
      res.json(HELP_CATEGORIES);
    } catch (error) {
      console.error("Error fetching help categories:", error);
      res.status(500).json({ message: "Failed to fetch help categories" });
    }
  });

  // Test & Demo routes
  app.post("/api/demo/test-pipeline", isAuthenticated, async (req, res) => {
    try {
      const { runTestPipeline } = await import('./test-pipeline');

      const { errorCount = 15, mode = 'balanced' } = req.body;
      const result = await runTestPipeline(errorCount, mode);

      res.json(result);
    } catch (error) {
      console.error("Error running test pipeline:", error);
      res.status(500).json({ message: "Failed to run test pipeline" });
    }
  });

  app.post("/api/demo/stress-test", isAuthenticated, async (req, res) => {
    try {
      const { runStressTest } = await import('./test-pipeline');

      const { iterations = 10 } = req.body;
      const result = await runStressTest(iterations);

      res.json(result);
    } catch (error) {
      console.error("Error running stress test:", error);
      res.status(500).json({ message: "Failed to run stress test" });
    }
  });

  app.get("/api/demo/generate-pdf", isAuthenticated, async (req, res) => {
    try {
      const { generateDemoPDF } = await import('./test-pipeline');

      const studentName = (req.query.studentName as string) || 'Demo-Schüler';
      const doc = generateDemoPDF(studentName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Demo_Hausaufgabe_${studentName.replace(' ', '_')}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating demo PDF:", error);
      res.status(500).json({ message: "Failed to generate demo PDF" });
    }
  });

  app.get("/api/demo/error-types", isAuthenticated, async (req, res) => {
    try {
      const { getAvailableErrorTypes } = await import('./test-error-generator');

      const errorTypes = getAvailableErrorTypes();
      res.json(errorTypes.map(et => ({
        category: et.category,
        description: et.description
      })));
    } catch (error) {
      console.error("Error fetching error types:", error);
      res.status(500).json({ message: "Failed to fetch error types" });
    }
  });

  // System Architecture routes
  app.get("/api/system/architecture", isAuthenticated, async (req, res) => {
    try {
      const { getSystemArchitecture } = await import('./system-architecture');
      const architecture = getSystemArchitecture();
      res.json(architecture);
    } catch (error) {
      console.error("Error fetching system architecture:", error);
      res.status(500).json({ message: "Failed to fetch system architecture" });
    }
  });

  app.get("/api/system/stats", isAuthenticated, async (req, res) => {
    try {
      const { getArchitectureStats } = await import('./system-architecture');
      const stats = getArchitectureStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching architecture stats:", error);
      res.status(500).json({ message: "Failed to fetch architecture stats" });
    }
  });

  // Batch PDF Export
  app.post("/api/worksheets/batch", isAuthenticated, async (req, res) => {
    try {
      const { studentIds, type } = req.body;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: "studentIds array is required" });
      }

      if (!type || !['math', 'spelling', 'vocabulary', 'living-life'].includes(type)) {
        return res.status(400).json({ message: "type must be 'math', 'spelling', 'vocabulary', or 'living-life'" });
      }

      const { generateBatchWorksheets } = await import('./batch-pdf');
      const options = parseTemplateOptions(req.query);

      // Fetch all student data
      const batchStudents = await Promise.all(
        studentIds.map(async (id: string) => {
          const student = await storage.getStudent(id);
          if (!student) return null;

          const data: any = { student };

          if (type === 'math') {
            data.errors = await storage.getStudentErrors(id);
          } else if (type === 'spelling') {
            data.spellingErrors = await storage.getSpellingErrors(id);
          } else if (type === 'vocabulary') {
            data.vocabularyWords = await storage.getVocabularyWords(id);
          } else if (type === 'living-life') {
            data.livingLifeAssignments = await storage.getStudentLivingLifeAssignments(id);
          }

          return data;
        })
      );

      // Filter out null entries (students not found)
      const validStudents = batchStudents.filter(s => s !== null);

      if (validStudents.length === 0) {
        return res.status(404).json({ message: "No valid students found" });
      }

      // Filter students with actual data for the worksheet type
      const studentsWithData = validStudents.filter(s => {
        if (type === 'math') return s.errors && s.errors.length > 0;
        if (type === 'spelling') return s.spellingErrors && s.spellingErrors.length > 0;
        if (type === 'vocabulary') return s.vocabularyWords && s.vocabularyWords.length > 0;
        if (type === 'living-life') return s.livingLifeAssignments && s.livingLifeAssignments.length > 0;
        return false;
      });

      if (studentsWithData.length === 0) {
        return res.status(400).json({ 
          message: `No students have ${type} data. Please select students with ${type} errors/words.` 
        });
      }

      // Generate combined PDF
      const doc = generateBatchWorksheets(studentsWithData, type as any, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="batch_${type}_worksheets.pdf"`);
      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating batch worksheets:", error);
      res.status(500).json({ message: "Failed to generate batch worksheets" });
    }
  });

  app.post("/api/worksheets/batch/preview", isAuthenticated, async (req, res) => {
    try {
      const { studentIds, type } = req.body;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: "studentIds array is required" });
      }

      if (!type || !['math', 'spelling', 'vocabulary', 'living-life'].includes(type)) {
        return res.status(400).json({ message: "type must be 'math', 'spelling', 'vocabulary', or 'living-life'" });
      }

      const { generateBatchWorksheets, pdfToBase64 } = await import('./batch-pdf');
      const options = parseTemplateOptions(req.query);

      // Fetch all student data
      const batchStudents = await Promise.all(
        studentIds.map(async (id: string) => {
          const student = await storage.getStudent(id);
          if (!student) return null;

          const data: any = { student };

          if (type === 'math') {
            data.errors = await storage.getStudentErrors(id);
          } else if (type === 'spelling') {
            data.spellingErrors = await storage.getSpellingErrors(id);
          } else if (type === 'vocabulary') {
            data.vocabularyWords = await storage.getVocabularyWords(id);
          } else if (type === 'living-life') {
            data.livingLifeAssignments = await storage.getStudentLivingLifeAssignments(id);
          }

          return data;
        })
      );

      // Filter out null entries
      const validStudents = batchStudents.filter(s => s !== null);

      if (validStudents.length === 0) {
        return res.status(404).json({ message: "No valid students found" });
      }

      // Filter students with actual data for the worksheet type
      const studentsWithData = validStudents.filter(s => {
        if (type === 'math') return s.errors && s.errors.length > 0;
        if (type === 'spelling') return s.spellingErrors && s.spellingErrors.length > 0;
        if (type === 'vocabulary') return s.vocabularyWords && s.vocabularyWords.length > 0;
        if (type === 'living-life') return s.livingLifeAssignments && s.livingLifeAssignments.length > 0;
        return false;
      });

      if (studentsWithData.length === 0) {
        return res.status(400).json({ 
          message: `No students have ${type} data. Please select students with ${type} errors/words.` 
        });
      }

      // Generate combined PDF
      const doc = generateBatchWorksheets(studentsWithData, type as any, options);
      const base64 = await pdfToBase64(doc);

      res.json({
        base64,
        filename: `batch_${type}_worksheets.pdf`,
        studentCount: studentsWithData.length
      });
    } catch (error) {
      console.error("Error previewing batch worksheets:", error);
      res.status(500).json({ message: "Failed to preview batch worksheets" });
    }
  });

  // ========================================
  // GENERATOR TRAINING ROUTES (ADMIN ONLY)
  // ========================================

  // Start a new training session and generate variants (Admin only)
  app.post("/api/training/start", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { errorContext } = req.body;

      if (!errorContext || !errorContext.errorType || !errorContext.targetNumbers) {
        return res.status(400).json({ message: "errorContext with errorType and targetNumbers is required" });
      }

      console.log("🎓 Admin starting training session:", req.user.username);

      // Import variant generator
      const { generatePackageVariants } = await import('./variant-generator');

      // Create training session
      const session = await storage.createTrainingSession({
        teacherId: req.user.id,
        errorContext,
        status: 'active',
      });

      console.log("✅ Training session created:", session.id);

      // Generate package variants
      const variantDataList = generatePackageVariants(errorContext);

      // Store variants in database
      const variants = await Promise.all(
        variantDataList.map(vData =>
          storage.createPackageVariant({
            sessionId: session.id,
            paeckchenType: vData.paeckchenType,
            generatedContent: vData.generatedContent,
            generationParams: vData.generationParams,
            difficulty: vData.difficulty,
          })
        )
      );

      console.log(`📦 Generated and stored ${variants.length} variants`);

      res.json({
        session,
        variants,
      });
    } catch (error) {
      console.error("❌ Error starting training session:", error);
      res.status(500).json({ message: "Failed to start training session" });
    }
  });

  // Get training session with variants (Admin only)
  app.get("/api/training/sessions/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const session = await storage.getTrainingSession(req.params.id);

      if (!session) {
        console.error("❌ Session not found:", req.params.id);
        return res.status(404).json({ message: "Training session not found" });
      }

      // Validate session belongs to requesting admin
      if (session.teacherId !== req.user.id) {
        console.error("❌ Unauthorized: Session belongs to different user");
        return res.status(403).json({ message: "Unauthorized: This session belongs to another user" });
      }

      const variants = await storage.getSessionVariants(session.id);
      const selections = await storage.getSessionSelections(session.id);

      console.log(`📦 Retrieved session ${session.id}: ${variants.length} variants, ${selections.length} selections`);

      res.json({
        session,
        variants,
        selections,
      });
    } catch (error) {
      console.error("❌ Error fetching training session:", error);
      res.status(500).json({ message: "Failed to fetch training session" });
    }
  });

  // Submit training selections (Admin only)
  app.post("/api/training/selections", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { sessionId, selections } = req.body;

      if (!sessionId || !Array.isArray(selections)) {
        return res.status(400).json({ message: "sessionId and selections array are required" });
      }

      console.log(`📝 Admin ${req.user.username} submitting ${selections.length} selections for session ${sessionId}`);

      // Validate session belongs to user
      const session = await storage.getTrainingSession(sessionId);
      if (!session) {
        console.error("❌ Session not found:", sessionId);
        return res.status(404).json({ message: "Training session not found" });
      }

      if (session.teacherId !== req.user.id) {
        console.error("❌ Unauthorized: Session belongs to different user");
        return res.status(403).json({ message: "Unauthorized: This session belongs to another user" });
      }

      // Validate all variant IDs exist
      const variants = await storage.getSessionVariants(sessionId);
      const variantIds = new Set(variants.map(v => v.id));

      for (const sel of selections) {
        if (!variantIds.has(sel.variantId)) {
          console.error("❌ Invalid variant ID:", sel.variantId);
          return res.status(400).json({ message: `Invalid variant ID: ${sel.variantId}` });
        }
      }

      // Create selections
      const createdSelections = await storage.createBulkSelections(
        selections.map((sel: any) => ({
          sessionId,
          variantId: sel.variantId,
          selected: sel.selected ? 1 : 0,
          rating: sel.rating || null,
          feedback: sel.feedback || null,
          selectionContext: sel.selectionContext || null,
        }))
      );

      console.log(`✅ Created ${createdSelections.length} selections in database`);

      // Update learning algorithm
      const { updatePreferenceNetwork } = await import('./learning-algorithm');
      await updatePreferenceNetwork(req.user.id, sessionId, selections);

      console.log("🧠 Preference network updated successfully");

      res.json(createdSelections);
    } catch (error) {
      console.error("❌ Error creating selections:", error);
      res.status(500).json({ message: "Failed to create selections" });
    }
  });

  // Complete training session (Admin only)
  app.post("/api/training/sessions/:id/complete", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const session = await storage.getTrainingSession(req.params.id);

      if (!session) {
        console.error("❌ Session not found:", req.params.id);
        return res.status(404).json({ message: "Training session not found" });
      }

      if (session.teacherId !== req.user.id) {
        console.error("❌ Unauthorized: Session belongs to different user");
        return res.status(403).json({ message: "Unauthorized: This session belongs to another user" });
      }

      console.log(`✅ Admin ${req.user.username} completing training session ${session.id}`);

      const completedSession = await storage.completeTrainingSession(session.id);

      console.log("🎉 Training session completed successfully");

      res.json(completedSession);
    } catch (error) {
      console.error("❌ Error completing training session:", error);
      res.status(500).json({ message: "Failed to complete training session" });
    }
  });

  // Get teacher's preference network (Admin only)
  app.get("/api/training/network", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const network = await storage.getPreferenceNetwork(req.user.id);

      if (!network) {
        // Return empty network if none exists yet
        console.log("📊 No preference network found for admin, returning empty network");
        return res.json({
          patterns: { errorType: {}, numberRanges: {}, combinations: { rules: [] } },
          weights: { paeckchenTypeWeights: {}, numberPatternWeights: {}, difficultyPreferences: {} },
          trainingCount: 0,
        });
      }

      console.log(`📊 Retrieved preference network for admin ${req.user.username}: ${network.trainingCount} trainings`);
      res.json(network);
    } catch (error) {
      console.error("❌ Error fetching preference network:", error);
      res.status(500).json({ message: "Failed to fetch preference network" });
    }
  });

  // Get teacher's training history (Admin only)
  app.get("/api/training/history", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const sessions = await storage.getTeacherTrainingSessions(req.user.id);
      console.log(`📚 Retrieved ${sessions.length} training sessions for admin ${req.user.username}`);
      res.json(sessions);
    } catch (error) {
      console.error("❌ Error fetching training history:", error);
      res.status(500).json({ message: "Failed to fetch training history" });
    }
  });

  // ========================================
  // FEEDBACK & BUG REPORTROUTES
  // ========================================

  // Create feedback ticket
  app.post("/api/feedback/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const ticketData = z.object({
        type: z.enum(['bug', 'feature', 'feedback', 'other']),
        category: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        title: z.string().min(5),
        description: z.string().min(10),
        stepsToReproduce: z.string().optional(),
        expectedBehavior: z.string().optional(),
        actualBehavior: z.string().optional(),
        browserInfo: z.string().optional(),
        screenshots: z.string().optional(),
        pageUrl: z.string().optional(),
      }).parse(req.body);

      const ticket = await storage.createFeedbackTicket({
        ...ticketData,
        userId: req.user.id,
      });

      res.json(ticket);
    } catch (error) {
      console.error("Error creating feedback ticket:", error);
      res.status(500).json({ message: "Failed to create feedback ticket" });
    }
  });

  // Get all tickets (admin only)
  app.get("/api/feedback/tickets", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        // Regular users only see their own tickets
        const tickets = await storage.getUserFeedbackTickets(req.user.id);
        return res.json(tickets);
      }

      const tickets = await storage.getAllFeedbackTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching feedback tickets:", error);
      res.status(500).json({ message: "Failed to fetch feedback tickets" });
    }
  });

  // Get single ticket
  app.get("/api/feedback/tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const ticket = await storage.getFeedbackTicket(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check permission
      if (req.user.role !== 'admin' && ticket.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const comments = await storage.getTicketComments(ticket.id);
      res.json({ ticket, comments });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  // Update ticket (admin only for status/assignment)
  app.patch("/api/feedback/tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const ticket = await storage.getFeedbackTicket(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Only admin can change status, assignment, priority
      const isAdmin = req.user.role === 'admin';
      const isOwner = ticket.userId === req.user.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const allowedFields = isAdmin 
        ? ['status', 'priority', 'assignedTo', 'resolution', 'resolvedAt', 'resolvedBy', 'title', 'description', 'stepsToReproduce', 'expectedBehavior', 'actualBehavior']
        : ['description', 'stepsToReproduce'];

      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});

      const updated = await storage.updateFeedbackTicket(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Add comment to ticket
  app.post("/api/feedback/tickets/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const ticket = await storage.getFeedbackTicket(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const commentData = z.object({
        comment: z.string().min(1),
        isInternal: z.number().optional(),
      }).parse(req.body);

      // Only admins can add internal comments
      if (commentData.isInternal === 1 && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can add internal comments" });
      }

      const comment = await storage.createFeedbackComment({
        ticketId: req.params.id,
        userId: req.user.id,
        ...commentData,
      });

      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Delete ticket (admin only)
  app.delete("/api/feedback/tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can delete tickets" });
      }

      await storage.deleteFeedbackTicket(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // ========================================
  // REPORT ROUTES
  // ========================================

  // Get report data (preview mode - no PDF, just JSON data)
  app.get("/api/reports/data/:type", isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.params;
      const { studentId, classId, subject, fromDate, toDate } = req.query;

      if (type === 'student_full' && studentId) {
        const reportData = await storage.getStudentFullReport(studentId);
        return res.json(reportData);
      }

      if (type === 'class_overview' && classId) {
        const reportData = await storage.getClassOverview(classId);
        return res.json(reportData);
      }

      if (type === 'subject_report' && studentId && subject) {
        const reportData = await storage.getSubjectReport(studentId, subject as 'math' | 'german' | 'english' | 'creative');
        return res.json(reportData);
      }

      if (type === 'progress_report' && studentId) {
        const from = fromDate ? new Date(fromDate as string) : undefined;
        const to = toDate ? new Date(toDate as string) : undefined;
        const reportData = await storage.getProgressReport(studentId, from, to);
        return res.json(reportData);
      }

      if (type === 'selfconcept_report' && studentId) {
        const reportData = await storage.getSelfConceptReport(studentId);
        return res.json(reportData);
      }

      res.status(400).json({ message: "Invalid report type or missing parameters" });
    } catch (error) {
      console.error("Error fetching report data:", error);
      res.status(500).json({ message: "Failed to fetch report data" });
    }
  });

  // Generate and save report (with optional PDF generation)
  app.post("/api/reports/generate", isAuthenticated, async (req: any, res) => {
    try {
      const reportParams = z.object({
        reportType: z.enum(['student_full', 'class_overview', 'subject_report', 'progress_report', 'selfconcept_report']),
        reportSubject: z.enum(['math', 'german', 'english', 'creative', 'all']).optional(),
        targetIds: z.object({
          studentIds: z.array(z.string()).optional(),
          classIds: z.array(z.string()).optional(),
        }),
        dateRange: z.object({
          from: z.string().optional(),
          to: z.string().optional(),
        }).optional(),
        reportSettings: z.object({
          template: z.enum(['formal', 'informal']).optional(),
          includeCharts: z.boolean().optional(),
        }).optional(),
      }).parse(req.body);

      // Fetch report data based on type
      let reportData: any;

      if (reportParams.reportType === 'student_full' && reportParams.targetIds.studentIds?.[0]) {
        reportData = await storage.getStudentFullReport(reportParams.targetIds.studentIds[0]);
      } else if (reportParams.reportType === 'class_overview' && reportParams.targetIds.classIds?.[0]) {
        reportData = await storage.getClassOverview(reportParams.targetIds.classIds[0]);
      } else if (reportParams.reportType === 'subject_report' && reportParams.targetIds.studentIds?.[0] && reportParams.reportSubject) {
        reportData = await storage.getSubjectReport(
          reportParams.targetIds.studentIds[0], 
          reportParams.reportSubject as 'math' | 'german' | 'english' | 'creative'
        );
      } else if (reportParams.reportType === 'progress_report' && reportParams.targetIds.studentIds?.[0]) {
        const from = reportParams.dateRange?.from ? new Date(reportParams.dateRange.from) : undefined;
        const to = reportParams.dateRange?.to ? new Date(reportParams.dateRange.to) : undefined;
        reportData = await storage.getProgressReport(reportParams.targetIds.studentIds[0], from, to);
      } else if (reportParams.reportType === 'selfconcept_report' && reportParams.targetIds.studentIds?.[0]) {
        reportData = await storage.getSelfConceptReport(reportParams.targetIds.studentIds[0]);
      }

      // Save report (PDF generation will be added in next step)
      const savedReport = await storage.createGeneratedReport({
        reportType: reportParams.reportType,
        reportSubject: reportParams.reportSubject,
        generatedBy: req.user.id,
        targetIds: reportParams.targetIds,
        dateRange: reportParams.dateRange,
        pdfUrl: null, // Will be generated later
        reportData: reportData,
        reportSettings: reportParams.reportSettings || {},
      });

      res.json(savedReport);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Get user's report history
  app.get("/api/reports/history", isAuthenticated, async (req: any, res) => {
    try {
      const reports = await storage.getGeneratedReports(req.user.id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching report history:", error);
      res.status(500).json({ message: "Failed to fetch report history" });
    }
  });

  // Generate PDF for report
  app.get("/api/reports/:reportId/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const report = await storage.getGeneratedReport(req.params.reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Verify user has access to this report
      if (report.generatedBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { generateStudentReportPDF } = await import('./pdf-generators');
      
      // Generate PDF based on report type
      const doc = generateStudentReportPDF(
        report.reportData,
        report.reportType,
        report.reportSubject || undefined
      );

      // Set headers for PDF download
      const filename = `Bericht_${report.reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Error generating report PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate PDF" });
      }
    }
  });

  // Get report templates/types info
  app.get("/api/reports/templates", isAuthenticated, async (req: any, res) => {
    try {
      const templates = [
        {
          id: 'student_full',
          name: 'Schüler-Gesamtbericht',
          description: 'Vollständiger Bericht über alle Bereiche eines Schülers',
          subjects: ['all'],
          requiresStudent: true,
          requiresClass: false,
        },
        {
          id: 'class_overview',
          name: 'Klassenübersicht',
          description: 'Überblick über alle Schüler einer Klasse',
          subjects: ['all'],
          requiresStudent: false,
          requiresClass: true,
        },
        {
          id: 'subject_report',
          name: 'Fachbericht',
          description: 'Detaillierter Bericht für ein einzelnes Fach',
          subjects: ['math', 'german', 'english', 'creative'],
          requiresStudent: true,
          requiresClass: false,
        },
        {
          id: 'progress_report',
          name: 'Fortschrittsbericht',
          description: 'Entwicklung über einen Zeitraum',
          subjects: ['all'],
          requiresStudent: true,
          requiresClass: false,
          requiresDateRange: true,
        },
        {
          id: 'selfconcept_report',
          name: 'Selbstkonzept-Bericht',
          description: 'Assessment-Ergebnisse und Empfehlungen',
          subjects: ['all'],
          requiresStudent: true,
          requiresClass: false,
        },
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching report templates:", error);
      res.status(500).json({ message: "Failed to fetch report templates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}