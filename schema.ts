import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { randomUUID } from "crypto";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(), // unique username like "Ibra", "Jahi", "Stie" (nullable for OAuth users)
  password: varchar("password"), // hashed password (nullable for OAuth users)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("teacher"), // 'admin' or 'teacher'
  classId: varchar("class_id"), // null for admin, class ID for teachers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = {
  id?: string;
  username?: string | null;
  password?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
  classId?: string | null;
};
export type User = typeof users.$inferSelect;

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // '4a', '4b', '4c', '4d', '4e'
  teacherId: varchar("teacher_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  gender: varchar("gender").notNull().default("male"), // 'male' or 'female'
  classId: varchar("class_id").notNull().references(() => classes.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Admin schemas for creating teachers
export const createTeacherSchema = z.object({
  username: z.string().min(2, "Username muss mindestens 2 Zeichen lang sein"),
  password: z.string().min(4, "Passwort muss mindestens 4 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  role: z.enum(["teacher", "admin"]).default("teacher"),
  classId: z.string().optional().nullable(),
});

export type CreateTeacher = z.infer<typeof createTeacherSchema>;

// Admin schema for updating teachers
export const updateTeacherSchema = z.object({
  username: z.string().min(2).optional(),
  password: z.string().min(4).optional(),
  email: z.string().email().optional().nullable(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["teacher", "admin"]).optional(),
  classId: z.string().optional().nullable(),
});

export type UpdateTeacher = z.infer<typeof updateTeacherSchema>;

// Admin schema for bulk student import
export const bulkStudentImportSchema = z.object({
  students: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    gender: z.enum(["male", "female", "other"]),
    classId: z.string(),
  })),
});

export type BulkStudentImport = z.infer<typeof bulkStudentImportSchema>;

// Admin schema for updating classes
export const updateClassSchema = insertClassSchema.partial();
export type UpdateClass = z.infer<typeof updateClassSchema>;

// User activity tracking tables
// User sessions table for login/logout tracking
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  loginAt: timestamp("login_at").notNull().defaultNow(),
  logoutAt: timestamp("logout_at"),
  sessionDuration: integer("session_duration"), // in seconds, calculated on logout
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
});

export type UserSession = typeof userSessions.$inferSelect;

// Page views table for tracking page visits and time spent
export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").references(() => userSessions.id, { onDelete: 'cascade' }),
  pagePath: varchar("page_path").notNull(), // e.g., "/", "/student/123", "/admin"
  pageTitle: varchar("page_title"), // e.g., "Dashboard", "Admin Panel"
  enteredAt: timestamp("entered_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
  duration: integer("duration"), // in seconds, calculated when leaving page
});

export type PageView = typeof pageViews.$inferSelect;

// Student errors/mistakes table
export const studentErrors = pgTable("student_errors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  errorText: varchar("error_text").notNull(), // e.g., "5+8=12", "13-9=3"
  operation: varchar("operation").notNull(), // 'addition' or 'subtraction'
  num1: integer("num1").notNull(), // first number
  num2: integer("num2").notNull(), // second number
  incorrectAnswer: integer("incorrect_answer").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  errorType: varchar("error_type"), // 'zehnuebergang', 'basic', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentErrorSchema = createInsertSchema(studentErrors).omit({
  id: true,
  createdAt: true,
});

export type InsertStudentError = z.infer<typeof insertStudentErrorSchema>;
export type StudentError = typeof studentErrors.$inferSelect;

// Spelling errors table (German module)
export const spellingErrors = pgTable("spelling_errors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  incorrectWord: varchar("incorrect_word").notNull(), // e.g., "Feler"
  correctWord: varchar("correct_word").notNull(), // e.g., "Fehler"
  context: text("context"), // optional: sentence or text where the error occurred
  errorCategory: varchar("error_category"), // 'alphabetic', 'orthographic', 'morphematic', 'grammatical'
  errorSubtype: varchar("error_subtype"), // specific error type e.g. 'vokal_auslassung', 'dehnungs_h', 'auslautverhaertung'
  analysisDetails: jsonb("analysis_details"), // detailed analysis results from AI
  isDaz: integer("is_daz").default(0), // 0 = native speaker, 1 = DaZ learner
  nativeLanguage: varchar("native_language"), // optional: student's first language
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpellingErrorSchema = createInsertSchema(spellingErrors).omit({
  id: true,
  createdAt: true,
});

export type InsertSpellingError = z.infer<typeof insertSpellingErrorSchema>;
export type SpellingError = typeof spellingErrors.$inferSelect;

// Vocabulary words table (English module)
export const vocabularyWords = pgTable("vocabulary_words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  englishWord: text("english_word").notNull(), // e.g., "apple" or "How are you?"
  germanTranslation: text("german_translation").notNull(), // e.g., "Apfel" or "Wie geht es dir?"
  category: varchar("category"), // optional: "noun", "verb", "phrase", etc.
  notes: text("notes"), // optional teacher notes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVocabularyWordSchema = createInsertSchema(vocabularyWords).omit({
  id: true,
  createdAt: true,
});

export type InsertVocabularyWord = z.infer<typeof insertVocabularyWordSchema>;
export type VocabularyWord = typeof vocabularyWords.$inferSelect;

// Homework/worksheets table
export const homeworks = pgTable("homeworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  title: varchar("title").notNull(),
  content: jsonb("content").notNull(), // structured content for PDF generation
  pdfUrl: varchar("pdf_url"), // URL to generated PDF
  targetErrors: jsonb("target_errors").notNull(), // array of error IDs this homework addresses
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHomeworkSchema = createInsertSchema(homeworks).omit({
  id: true,
  createdAt: true,
});

export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Homework = typeof homeworks.$inferSelect;

// Creative tasks library (pre-defined task templates)
export const creativeTasks = pgTable("creative_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(), // e.g., "Was wäre wenn... Geschichten"
  category: varchar("category").notNull(), // e.g., "Geschichten", "Erfindungen", "Perspektiven"
  description: text("description").notNull(), // Full task description/prompt
  ageGroup: varchar("age_group"), // e.g., "6-8 Jahre", "9-11 Jahre"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCreativeTaskSchema = createInsertSchema(creativeTasks).omit({
  id: true,
  createdAt: true,
});

export type InsertCreativeTask = z.infer<typeof insertCreativeTaskSchema>;
export type CreativeTask = typeof creativeTasks.$inferSelect;

// Student creative task assignments
export const studentCreativeTasks = pgTable("student_creative_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  taskId: varchar("task_id").notNull().references(() => creativeTasks.id),
  assignedBy: varchar("assigned_by").references(() => users.id), // teacher who assigned it
  notes: text("notes"), // teacher's additional notes for this specific assignment
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentCreativeTaskSchema = createInsertSchema(studentCreativeTasks).omit({
  id: true,
  createdAt: true,
});

export type InsertStudentCreativeTask = z.infer<typeof insertStudentCreativeTaskSchema>;
export type StudentCreativeTask = typeof studentCreativeTasks.$inferSelect;

// Student creative profiles (interests, strengths, preferences)
export const studentCreativeProfiles = pgTable("student_creative_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().unique().references(() => students.id),
  interests: text("interests").array(), // e.g., ["Dinosaurier", "Weltraum", "Fußball"]
  strengths: text("strengths").array(), // e.g., ["Zeichnen", "Geschichten erfinden", "Logisches Denken"]
  creativityType: jsonb("creativity_type"), // { visualVerbal: -0.3, practicalFantasy: 0.5 }
  previousTaskIds: text("previous_task_ids").array(), // Track assigned tasks to avoid repetition
  notes: text("notes"), // Free-form teacher notes
  updatedBy: varchar("updated_by").references(() => users.id), // Last teacher who updated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStudentCreativeProfileSchema = createInsertSchema(studentCreativeProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudentCreativeProfile = z.infer<typeof insertStudentCreativeProfileSchema>;
export type StudentCreativeProfile = typeof studentCreativeProfiles.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  class: one(classes, {
    fields: [users.classId],
    references: [classes.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  errors: many(studentErrors),
  spellingErrors: many(spellingErrors),
  vocabularyWords: many(vocabularyWords),
  homeworks: many(homeworks),
  creativeTasks: many(studentCreativeTasks),
  creativeProfile: one(studentCreativeProfiles, {
    fields: [students.id],
    references: [studentCreativeProfiles.studentId],
  }),
  assessments: many(studentAssessments),
}));

export const studentErrorsRelations = relations(studentErrors, ({ one }) => ({
  student: one(students, {
    fields: [studentErrors.studentId],
    references: [students.id],
  }),
}));

export const spellingErrorsRelations = relations(spellingErrors, ({ one }) => ({
  student: one(students, {
    fields: [spellingErrors.studentId],
    references: [students.id],
  }),
}));

export const vocabularyWordsRelations = relations(vocabularyWords, ({ one }) => ({
  student: one(students, {
    fields: [vocabularyWords.studentId],
    references: [students.id],
  }),
}));

export const homeworksRelations = relations(homeworks, ({ one }) => ({
  student: one(students, {
    fields: [homeworks.studentId],
    references: [students.id],
  }),
}));

export const creativeTasksRelations = relations(creativeTasks, ({ many }) => ({
  studentAssignments: many(studentCreativeTasks),
}));

export const studentCreativeTasksRelations = relations(studentCreativeTasks, ({ one }) => ({
  student: one(students, {
    fields: [studentCreativeTasks.studentId],
    references: [students.id],
  }),
  task: one(creativeTasks, {
    fields: [studentCreativeTasks.taskId],
    references: [creativeTasks.id],
  }),
  assignedByUser: one(users, {
    fields: [studentCreativeTasks.assignedBy],
    references: [users.id],
  }),
}));

export const studentCreativeProfilesRelations = relations(studentCreativeProfiles, ({ one }) => ({
  student: one(students, {
    fields: [studentCreativeProfiles.studentId],
    references: [students.id],
  }),
  updatedByUser: one(users, {
    fields: [studentCreativeProfiles.updatedBy],
    references: [users.id],
  }),
}));

// ========================================
// GENERATOR TRAINING SYSTEM
// ========================================

// Training sessions - tracks when a teacher trains the generator
export const trainingSessions = pgTable("training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  errorContext: jsonb("error_context").notNull(), // { errorType, targetNumbers, studentContext }
  status: varchar("status").notNull().default("active"), // 'active' or 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;

// Package variants - different generated packages for selection
export const packageVariants = pgTable("package_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => trainingSessions.id),
  paeckchenType: varchar("paeckchen_type").notNull(), // e.g., 'constant_sum', 'crossing_tens'
  generatedContent: jsonb("generated_content").notNull(), // { problems, instructions, pattern, etc. }
  generationParams: jsonb("generation_params").notNull(), // { numbers, strategy, variations }
  difficulty: varchar("difficulty").notNull(), // 'easy', 'medium', 'hard'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPackageVariantSchema = createInsertSchema(packageVariants).omit({
  id: true,
  createdAt: true,
});

export type InsertPackageVariant = z.infer<typeof insertPackageVariantSchema>;
export type PackageVariant = typeof packageVariants.$inferSelect;

// Training selections - tracks teacher's choices
export const trainingSelections = pgTable("training_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => trainingSessions.id),
  variantId: varchar("variant_id").notNull().references(() => packageVariants.id),
  selected: integer("selected").notNull(), // 1 = selected, 0 = not selected
  rating: integer("rating"), // optional 1-5 star rating
  feedback: text("feedback"), // optional teacher comment
  selectionContext: jsonb("selection_context"), // { presentedWith: [], selectionOrder }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainingSelectionSchema = createInsertSchema(trainingSelections).omit({
  id: true,
  createdAt: true,
});

export type InsertTrainingSelection = z.infer<typeof insertTrainingSelectionSchema>;
export type TrainingSelection = typeof trainingSelections.$inferSelect;

// Preference networks - learned patterns and weights
export const preferenceNetworks = pgTable("preference_networks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().unique().references(() => users.id),
  patterns: jsonb("patterns").notNull(), // { errorType: {...}, numberRanges: {...}, combinations: {...} }
  weights: jsonb("weights").notNull(), // { paeckchenTypeWeights: {...}, numberPatternWeights: {...} }
  trainingCount: integer("training_count").notNull().default(0),
  lastTrainedAt: timestamp("last_trained_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPreferenceNetworkSchema = createInsertSchema(preferenceNetworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPreferenceNetwork = z.infer<typeof insertPreferenceNetworkSchema>;
export type PreferenceNetwork = typeof preferenceNetworks.$inferSelect;

// Package effectiveness tracking (optional - for later validation)
export const packageEffectiveness = pgTable("package_effectiveness", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  variantId: varchar("variant_id").notNull().references(() => packageVariants.id),
  wasSelected: integer("was_selected").notNull(), // 1 or 0
  wasUsedInHomework: integer("was_used_in_homework").default(0),
  studentImprovement: jsonb("student_improvement"), // { beforeScore, afterScore }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPackageEffectivenessSchema = createInsertSchema(packageEffectiveness).omit({
  id: true,
  createdAt: true,
});

export type InsertPackageEffectiveness = z.infer<typeof insertPackageEffectivenessSchema>;
export type PackageEffectiveness = typeof packageEffectiveness.$inferSelect;

// Training system relations
export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  teacher: one(users, {
    fields: [trainingSessions.teacherId],
    references: [users.id],
  }),
  variants: many(packageVariants),
  selections: many(trainingSelections),
}));

export const packageVariantsRelations = relations(packageVariants, ({ one, many }) => ({
  session: one(trainingSessions, {
    fields: [packageVariants.sessionId],
    references: [trainingSessions.id],
  }),
  selections: many(trainingSelections),
  effectiveness: many(packageEffectiveness),
}));

export const trainingSelectionsRelations = relations(trainingSelections, ({ one }) => ({
  session: one(trainingSessions, {
    fields: [trainingSelections.sessionId],
    references: [trainingSessions.id],
  }),
  variant: one(packageVariants, {
    fields: [trainingSelections.variantId],
    references: [packageVariants.id],
  }),
}));

export const preferenceNetworksRelations = relations(preferenceNetworks, ({ one }) => ({
  teacher: one(users, {
    fields: [preferenceNetworks.teacherId],
    references: [users.id],
  }),
}));

export const packageEffectivenessRelations = relations(packageEffectiveness, ({ one }) => ({
  variant: one(packageVariants, {
    fields: [packageEffectiveness.variantId],
    references: [packageVariants.id],
  }),
}));

// ========================================
// FEEDBACK & BUG REPORT SYSTEM
// ========================================

// Feedback tickets schema
export const feedbackTickets = pgTable('feedback_tickets', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'bug', 'feature', 'feedback', 'other'
  category: text('category'), // 'math', 'spelling', 'vocabulary', 'creative', 'ui', 'performance', 'other'
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'critical'
  status: text('status').default('open'), // 'open', 'in_progress', 'resolved', 'closed', 'wont_fix'
  title: text('title').notNull(),
  description: text('description').notNull(),
  stepsToReproduce: text('steps_to_reproduce'),
  expectedBehavior: text('expected_behavior'),
  actualBehavior: text('actual_behavior'),
  browserInfo: text('browser_info'),
  screenshots: text('screenshots'), // JSON array of base64 images
  pageUrl: text('page_url'),
  assignedTo: text('assigned_to').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by').references(() => users.id),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertFeedbackTicketSchema = createInsertSchema(feedbackTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFeedbackTicket = z.infer<typeof insertFeedbackTicketSchema>;
export type FeedbackTicket = typeof feedbackTickets.$inferSelect;

// Feedback comments schema
export const feedbackComments = pgTable('feedback_comments', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  ticketId: text('ticket_id').notNull().references(() => feedbackTickets.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  comment: text('comment').notNull(),
  isInternal: integer('is_internal').default(0), // 0 = public, 1 = admin-only
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertFeedbackCommentSchema = createInsertSchema(feedbackComments).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;
export type FeedbackComment = typeof feedbackComments.$inferSelect;

// Feedback ticket relations
export const feedbackTicketsRelations = relations(feedbackTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [feedbackTickets.userId],
    references: [users.id],
  }),
  assignedUser: one(users, {
    fields: [feedbackTickets.assignedTo],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [feedbackTickets.resolvedBy],
    references: [users.id],
  }),
  comments: many(feedbackComments),
}));

export const feedbackCommentsRelations = relations(feedbackComments, ({ one }) => ({
  ticket: one(feedbackTickets, {
    fields: [feedbackComments.ticketId],
    references: [feedbackTickets.id],
  }),
  user: one(users, {
    fields: [feedbackComments.userId],
    references: [users.id],
  }),
}));

// ========================================
// SELBSTKONZEPT ASSESSMENT SYSTEM (Flow-Facetten)
// ========================================

// Assessment dimensions - 8 core dimensions for motivation and self-concept
export const assessmentDimensions = pgTable("assessment_dimensions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // e.g., "zielorientierung", "faehigkeitsselbstkonzept"
  displayName: varchar("display_name").notNull(), // e.g., "Zielorientierung"
  description: text("description").notNull(), // Full description of what it measures
  interpretation: text("interpretation"), // How to interpret the results
  orderIndex: integer("order_index").notNull(), // Display order
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentDimensionSchema = createInsertSchema(assessmentDimensions).omit({
  id: true,
  createdAt: true,
});

export type InsertAssessmentDimension = z.infer<typeof insertAssessmentDimensionSchema>;
export type AssessmentDimension = typeof assessmentDimensions.$inferSelect;

// Assessment items - 16 questions (2 per dimension)
export const assessmentItems = pgTable("assessment_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dimensionId: varchar("dimension_id").notNull().references(() => assessmentDimensions.id),
  questionText: text("question_text").notNull(), // The question shown to students
  itemNumber: integer("item_number").notNull(), // 1-16
  polarity: varchar("polarity").notNull(), // 'positive' or 'negative' (for reverse scoring)
  audioUrl: varchar("audio_url"), // Optional audio file URL for question
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentItemSchema = createInsertSchema(assessmentItems).omit({
  id: true,
  createdAt: true,
});

export type InsertAssessmentItem = z.infer<typeof insertAssessmentItemSchema>;
export type AssessmentItem = typeof assessmentItems.$inferSelect;

// Student assessments - tracks when a student completes an assessment
export const studentAssessments = pgTable("student_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  conductedBy: varchar("conducted_by").references(() => users.id), // teacher who conducted it
  assessmentType: varchar("assessment_type").notNull().default("interview"), // 'interview' or 'self_report'
  status: varchar("status").notNull().default("in_progress"), // 'in_progress', 'completed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"), // Optional teacher notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStudentAssessmentSchema = createInsertSchema(studentAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudentAssessment = z.infer<typeof insertStudentAssessmentSchema>;
export type StudentAssessment = typeof studentAssessments.$inferSelect;

// Assessment responses - individual answers to each question
export const assessmentResponses = pgTable("assessment_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => studentAssessments.id, { onDelete: 'cascade' }),
  itemId: varchar("item_id").notNull().references(() => assessmentItems.id),
  responseValue: integer("response_value").notNull(), // 1-4 scale value
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentResponseSchema = createInsertSchema(assessmentResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertAssessmentResponse = z.infer<typeof insertAssessmentResponseSchema>;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;

// Norm values - for percentile calculation and interpretation
export const assessmentNorms = pgTable("assessment_norms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dimensionId: varchar("dimension_id").notNull().references(() => assessmentDimensions.id),
  ageGroup: varchar("age_group").notNull(), // e.g., "9-10", "10-11"
  gradeLevel: varchar("grade_level").notNull(), // e.g., "4", "5"
  meanValue: varchar("mean_value").notNull(), // Mean score for this dimension/age group (stored as string for precision)
  standardDeviation: varchar("standard_deviation").notNull(), // SD (stored as string)
  percentiles: jsonb("percentiles"), // { p10: 2.0, p25: 2.5, p50: 3.0, p75: 3.5, p90: 4.0 }
  sampleSize: integer("sample_size"), // Number of students in norm sample
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAssessmentNormSchema = createInsertSchema(assessmentNorms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAssessmentNorm = z.infer<typeof insertAssessmentNormSchema>;
export type AssessmentNorm = typeof assessmentNorms.$inferSelect;

// Assessment system relations
export const assessmentDimensionsRelations = relations(assessmentDimensions, ({ many }) => ({
  items: many(assessmentItems),
  norms: many(assessmentNorms),
}));

export const assessmentItemsRelations = relations(assessmentItems, ({ one, many }) => ({
  dimension: one(assessmentDimensions, {
    fields: [assessmentItems.dimensionId],
    references: [assessmentDimensions.id],
  }),
  responses: many(assessmentResponses),
}));

export const studentAssessmentsRelations = relations(studentAssessments, ({ one, many }) => ({
  student: one(students, {
    fields: [studentAssessments.studentId],
    references: [students.id],
  }),
  conductedByUser: one(users, {
    fields: [studentAssessments.conductedBy],
    references: [users.id],
  }),
  responses: many(assessmentResponses),
}));

export const assessmentResponsesRelations = relations(assessmentResponses, ({ one }) => ({
  assessment: one(studentAssessments, {
    fields: [assessmentResponses.assessmentId],
    references: [studentAssessments.id],
  }),
  item: one(assessmentItems, {
    fields: [assessmentResponses.itemId],
    references: [assessmentItems.id],
  }),
}));

export const assessmentNormsRelations = relations(assessmentNorms, ({ one }) => ({
  dimension: one(assessmentDimensions, {
    fields: [assessmentNorms.dimensionId],
    references: [assessmentDimensions.id],
  }),
}));

// ========================================
// BERICHTE & DRUCK SYSTEM
// ========================================

// Generated reports - optional storage of generated reports for history
export const generatedReports = pgTable("generated_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportType: varchar("report_type").notNull(), // 'student_full', 'class_overview', 'subject_report', 'progress_report', 'selfconcept_report'
  reportSubject: varchar("report_subject"), // 'math', 'german', 'english', 'creative', 'all'
  generatedBy: varchar("generated_by").notNull().references(() => users.id),
  targetIds: jsonb("target_ids").notNull(), // { studentIds: [], classIds: [] } - flexible for different report types
  dateRange: jsonb("date_range"), // { from: date, to: date } - for progress reports
  pdfUrl: varchar("pdf_url"), // URL to generated PDF
  reportData: jsonb("report_data").notNull(), // Snapshot of data used to generate report
  reportSettings: jsonb("report_settings"), // { template: 'formal'/'informal', includeCharts: true, etc. }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGeneratedReportSchema = createInsertSchema(generatedReports).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedReport = z.infer<typeof insertGeneratedReportSchema>;
export type GeneratedReport = typeof generatedReports.$inferSelect;

// Generated reports relations
export const generatedReportsRelations = relations(generatedReports, ({ one }) => ({
  generatedByUser: one(users, {
    fields: [generatedReports.generatedBy],
    references: [users.id],
  }),
}));

// ========================================
// LIVING LIFE MODULE
// ========================================

// Living Life task categories (6+ Hauptkategorien)
export const livingLifeCategories = pgTable("living_life_categories", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name").notNull().unique(), // 'naturerkundung', 'gemeinschaftserkundung', etc.
  displayName: varchar("display_name").notNull(), // 'Naturerkundung'
  description: text("description").notNull(),
  icon: varchar("icon"), // Icon name for UI
  color: varchar("color"), // Color theme
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLivingLifeCategorySchema = createInsertSchema(livingLifeCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertLivingLifeCategory = z.infer<typeof insertLivingLifeCategorySchema>;
export type LivingLifeCategory = typeof livingLifeCategories.$inferSelect;

// Living Life task templates (Aufgaben-Katalog)
export const livingLifeTasks = pgTable("living_life_tasks", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  category_name: text("category_name").notNull().references(() => livingLifeCategories.name),
  title: varchar("title").notNull(),
  description: text("description").notNull(), // Detailed task description
  instructions: text("instructions").notNull(), // Step-by-step instructions
  difficultyLevel: varchar("difficulty_level").notNull(), // 'entdecken', 'erforschen', 'vertiefen'
  ageGroup: varchar("age_group").notNull(), // 'klasse_1_2', 'klasse_3_4', 'klasse_5_6'
  estimatedDuration: integer("estimated_duration"), // in minutes (30-90)
  subjectConnections: text("subject_connections").array(), // ['sachunterricht', 'deutsch', 'mathematik']
  materials: text("materials").array(), // Required materials (usually minimal)
  documentationFormats: text("documentation_formats").array(), // ['foto', 'audio', 'text', 'zeichnung']
  reflectionQuestions: text("reflection_questions").array(), // Age-appropriate reflection questions
  parentTips: text("parent_tips"), // Tips for parents
  variations: jsonb("variations"), // Task variations/extensions
  keywords: text("keywords").array(), // For search/filtering
  isActive: integer("is_active").default(1), // 1 = active, 0 = archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLivingLifeTaskSchema = createInsertSchema(livingLifeTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLivingLifeTask = z.infer<typeof insertLivingLifeTaskSchema>;
export type LivingLifeTask = typeof livingLifeTasks.$inferSelect;

// Living Life assignments (Zuweisungen für Schüler)
export const livingLifeAssignments = pgTable("living_life_assignments", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  studentId: varchar("student_id").notNull().references(() => students.id),
  taskId: text("task_id").notNull().references(() => livingLifeTasks.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  dueDate: timestamp("due_date"), // Optional deadline
  status: varchar("status").default("assigned"), // 'assigned', 'in_progress', 'submitted', 'reviewed'
  teacherNotes: text("teacher_notes"), // Additional notes from teacher
  customInstructions: text("custom_instructions"), // Modified instructions for this student
  pdfUrl: varchar("pdf_url"), // Generated PDF URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLivingLifeAssignmentSchema = createInsertSchema(livingLifeAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLivingLifeAssignment = z.infer<typeof insertLivingLifeAssignmentSchema>;
export type LivingLifeAssignment = typeof livingLifeAssignments.$inferSelect;

// Living Life submissions (Schüler-Dokumentationen - vorbereitet für zukünftige Schüler-App)
export const livingLifeSubmissions = pgTable("living_life_submissions", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  assignmentId: text("assignment_id").notNull().references(() => livingLifeAssignments.id, { onDelete: 'cascade' }),
  submissionType: varchar("submission_type").notNull(), // 'photo', 'audio', 'text', 'drawing'
  content: text("content"), // Text content or base64 data
  fileUrl: varchar("file_url"), // URL to uploaded file
  caption: text("caption"), // Optional description
  metadata: jsonb("metadata"), // { location, timestamp, etc. }
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const insertLivingLifeSubmissionSchema = createInsertSchema(livingLifeSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertLivingLifeSubmission = z.infer<typeof insertLivingLifeSubmissionSchema>;
export type LivingLifeSubmission = typeof livingLifeSubmissions.$inferSelect;

// Living Life reflections (Reflexions-Antworten - vorbereitet für zukünftige Schüler-App)
export const livingLifeReflections = pgTable("living_life_reflections", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  assignmentId: text("assignment_id").notNull().references(() => livingLifeAssignments.id, { onDelete: 'cascade' }),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text"),
  answerAudioUrl: varchar("answer_audio_url"), // Optional audio response
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLivingLifeReflectionSchema = createInsertSchema(livingLifeReflections).omit({
  id: true,
  createdAt: true,
});

export type InsertLivingLifeReflection = z.infer<typeof insertLivingLifeReflectionSchema>;
export type LivingLifeReflection = typeof livingLifeReflections.$inferSelect;

// Living Life teacher feedback (Lehrer-Rückmeldungen)
export const livingLifeFeedback = pgTable("living_life_feedback", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  assignmentId: text("assignment_id").notNull().references(() => livingLifeAssignments.id, { onDelete: 'cascade' }),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  feedbackType: varchar("feedback_type").notNull(), // 'emoji', 'text', 'audio', 'badge'
  feedbackContent: text("feedback_content"), // Text, emoji code, or badge ID
  isPublic: integer("is_public").default(1), // 1 = visible to student/parents, 0 = teacher notes only
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLivingLifeFeedbackSchema = createInsertSchema(livingLifeFeedback).omit({
  id: true,
  createdAt: true,
});

export type InsertLivingLifeFeedback = z.infer<typeof insertLivingLifeFeedbackSchema>;
export type LivingLifeFeedback = typeof livingLifeFeedback.$inferSelect;

// Living Life badges (Gamification - Badge-System)
export const livingLifeBadges = pgTable("living_life_badges", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description").notNull(),
  badgeType: varchar("badge_type").notNull(), // 'category', 'milestone', 'special'
  categoryId: text("category_id").references(() => livingLifeCategories.id), // For category badges
  requirement: jsonb("requirement"), // { tasksCompleted: 3, categoryId: 'xyz' }
  iconUrl: varchar("icon_url"),
  rarity: varchar("rarity").default("common"), // 'common', 'rare', 'epic', 'legendary'
  orderIndex: integer("order_index"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLivingLifeBadgeSchema = createInsertSchema(livingLifeBadges).omit({
  id: true,
  createdAt: true,
});

export type InsertLivingLifeBadge = z.infer<typeof insertLivingLifeBadgeSchema>;
export type LivingLifeBadge = typeof livingLifeBadges.$inferSelect;

// Living Life student badges (Verliehene Badges)
export const livingLifeStudentBadges = pgTable("living_life_student_badges", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  studentId: varchar("student_id").notNull().references(() => students.id),
  badgeId: text("badge_id").notNull().references(() => livingLifeBadges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  awardedBy: varchar("awarded_by").references(() => users.id), // Teacher who awarded (if manual)
});

export const insertLivingLifeStudentBadgeSchema = createInsertSchema(livingLifeStudentBadges).omit({
  id: true,
  earnedAt: true,
});

export type InsertLivingLifeStudentBadge = z.infer<typeof insertLivingLifeStudentBadgeSchema>;
export type LivingLifeStudentBadge = typeof livingLifeStudentBadges.$inferSelect;

// Living Life Relations
export const livingLifeCategoriesRelations = relations(livingLifeCategories, ({ many }) => ({
  tasks: many(livingLifeTasks),
  badges: many(livingLifeBadges),
}));

export const livingLifeTasksRelations = relations(livingLifeTasks, ({ one, many }) => ({
  category: one(livingLifeCategories, {
    fields: [livingLifeTasks.category_name],
    references: [livingLifeCategories.name],
  }),
  assignments: many(livingLifeAssignments),
}));

export const livingLifeAssignmentsRelations = relations(livingLifeAssignments, ({ one, many }) => ({
  student: one(students, {
    fields: [livingLifeAssignments.studentId],
    references: [students.id],
  }),
  task: one(livingLifeTasks, {
    fields: [livingLifeAssignments.taskId],
    references: [livingLifeTasks.id],
  }),
  assignedByUser: one(users, {
    fields: [livingLifeAssignments.assignedBy],
    references: [users.id],
  }),
  submissions: many(livingLifeSubmissions),
  reflections: many(livingLifeReflections),
  feedback: many(livingLifeFeedback),
}));

export const livingLifeSubmissionsRelations = relations(livingLifeSubmissions, ({ one }) => ({
  assignment: one(livingLifeAssignments, {
    fields: [livingLifeSubmissions.assignmentId],
    references: [livingLifeAssignments.id],
  }),
}));

export const livingLifeReflectionsRelations = relations(livingLifeReflections, ({ one }) => ({
  assignment: one(livingLifeAssignments, {
    fields: [livingLifeReflections.assignmentId],
    references: [livingLifeAssignments.id],
  }),
}));

export const livingLifeFeedbackRelations = relations(livingLifeFeedback, ({ one }) => ({
  assignment: one(livingLifeAssignments, {
    fields: [livingLifeFeedback.assignmentId],
    references: [livingLifeAssignments.id],
  }),
  teacher: one(users, {
    fields: [livingLifeFeedback.teacherId],
    references: [users.id],
  }),
}));

export const livingLifeBadgesRelations = relations(livingLifeBadges, ({ one, many }) => ({
  category: one(livingLifeCategories, {
    fields: [livingLifeBadges.categoryId],
    references: [livingLifeCategories.id],
  }),
  studentBadges: many(livingLifeStudentBadges),
}));

export const livingLifeStudentBadgesRelations = relations(livingLifeStudentBadges, ({ one }) => ({
  student: one(students, {
    fields: [livingLifeStudentBadges.studentId],
    references: [students.id],
  }),
  badge: one(livingLifeBadges, {
    fields: [livingLifeStudentBadges.badgeId],
    references: [livingLifeBadges.id],
  }),
  awardedByUser: one(users, {
    fields: [livingLifeStudentBadges.awardedBy],
    references: [users.id],
  }),
}));