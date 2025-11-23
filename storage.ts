// Referenced from javascript_log_in_with_replit and javascript_database blueprints
import {
  users,
  classes,
  students,
  studentErrors,
  spellingErrors,
  vocabularyWords,
  homeworks,
  creativeTasks,
  studentCreativeTasks,
  studentCreativeProfiles,
  trainingSessions,
  packageVariants,
  trainingSelections,
  preferenceNetworks,
  packageEffectiveness,
  feedbackTickets,
  feedbackComments,
  assessmentDimensions,
  assessmentItems,
  studentAssessments,
  assessmentResponses,
  assessmentNorms,
  generatedReports,
  userSessions,
  pageViews,
  livingLifeCategories,
  livingLifeTasks,
  livingLifeAssignments,
  livingLifeSubmissions,
  livingLifeReflections,
  livingLifeFeedback,
  livingLifeBadges,
  livingLifeStudentBadges,
  type User,
  type UpsertUser,
  type Class,
  type InsertClass,
  type Student,
  type InsertStudent,
  type StudentError,
  type InsertStudentError,
  type SpellingError,
  type InsertSpellingError,
  type VocabularyWord,
  type InsertVocabularyWord,
  type Homework,
  type InsertHomework,
  type CreativeTask,
  type InsertCreativeTask,
  type StudentCreativeTask,
  type InsertStudentCreativeTask,
  type StudentCreativeProfile,
  type InsertStudentCreativeProfile,
  type TrainingSession,
  type InsertTrainingSession,
  type PackageVariant,
  type InsertPackageVariant,
  type TrainingSelection,
  type InsertTrainingSelection,
  type PreferenceNetwork,
  type InsertPreferenceNetwork,
  type PackageEffectiveness,
  type InsertPackageEffectiveness,
  type AssessmentDimension,
  type InsertAssessmentDimension,
  type AssessmentItem,
  type InsertAssessmentItem,
  type StudentAssessment,
  type InsertStudentAssessment,
  type AssessmentResponse,
  type InsertAssessmentResponse,
  type AssessmentNorm,
  type InsertAssessmentNorm,
  type GeneratedReport,
  type InsertGeneratedReport,
  type UserSession,
  type PageView,
  type LivingLifeCategory,
  type InsertLivingLifeCategory,
  type LivingLifeTask,
  type InsertLivingLifeTask,
  type LivingLifeAssignment,
  type InsertLivingLifeAssignment,
  type LivingLifeSubmission,
  type InsertLivingLifeSubmission,
  type LivingLifeReflection,
  type InsertLivingLifeReflection,
  type LivingLifeFeedback,
  type InsertLivingLifeFeedback,
  type LivingLifeBadge,
  type InsertLivingLifeBadge,
  type LivingLifeStudentBadge,
  type InsertLivingLifeStudentBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm"; // Added desc

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Class operations
  getClasses(): Promise<Class[]>;
  getAllClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;

  // Student operations
  getStudentsByClass(classId: string): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;

  // Student error operations
  getStudentErrors(studentId: string): Promise<StudentError[]>;
  createStudentError(error: InsertStudentError): Promise<StudentError>;
  deleteStudentError(id: string): Promise<void>;

  // Spelling error operations
  getSpellingErrors(studentId: string): Promise<SpellingError[]>;
  createSpellingError(error: InsertSpellingError): Promise<SpellingError>;
  deleteSpellingError(id: string): Promise<void>;

  // Vocabulary operations
  getVocabularyWords(studentId: string): Promise<VocabularyWord[]>;
  createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;
  deleteVocabularyWord(id: string): Promise<void>;

  // Homework operations
  getHomework(id: string): Promise<Homework | undefined>;
  getStudentHomeworks(studentId: string): Promise<Homework[]>;
  createHomework(homework: InsertHomework): Promise<Homework>;

  // Creative task operations
  getAllCreativeTasks(): Promise<CreativeTask[]>;
  getCreativeTask(id: string): Promise<CreativeTask | undefined>;
  getCreativeTasksByCategory(category: string): Promise<CreativeTask[]>;
  createCreativeTask(data: {
    title: string;
    description: string;
    category: string;
    ageGroup?: string;
  }): Promise<CreativeTask>;

  // Student creative task operations
  getStudentCreativeTasks(studentId: string): Promise<(StudentCreativeTask & { task: CreativeTask })[]>;
  assignCreativeTask(assignment: InsertStudentCreativeTask): Promise<StudentCreativeTask>;
  deleteStudentCreativeTask(id: string): Promise<void>;

  // Student creative profile operations
  getStudentCreativeProfile(studentId: string): Promise<StudentCreativeProfile | undefined>;
  upsertStudentCreativeProfile(profile: InsertStudentCreativeProfile): Promise<StudentCreativeProfile>;

  // Training session operations
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  getTrainingSession(id: string): Promise<TrainingSession | undefined>;
  getTeacherTrainingSessions(teacherId: string): Promise<TrainingSession[]>;
  completeTrainingSession(id: string): Promise<TrainingSession>;

  // Package variant operations
  createPackageVariant(variant: InsertPackageVariant): Promise<PackageVariant>;
  getSessionVariants(sessionId: string): Promise<PackageVariant[]>;
  getPackageVariant(id: string): Promise<PackageVariant | undefined>;

  // Training selection operations
  createTrainingSelection(selection: InsertTrainingSelection): Promise<TrainingSelection>;
  getSessionSelections(sessionId: string): Promise<TrainingSelection[]>;
  createBulkSelections(selections: InsertTrainingSelection[]): Promise<TrainingSelection[]>;

  // Preference network operations
  getPreferenceNetwork(teacherId: string): Promise<PreferenceNetwork | undefined>;
  upsertPreferenceNetwork(network: InsertPreferenceNetwork): Promise<PreferenceNetwork>;
  updateNetworkWeights(teacherId: string, patterns: any, weights: any): Promise<PreferenceNetwork>;
  deletePreferenceNetwork(teacherId: string): Promise<void>; // Assuming this method should exist based on context

  // Package effectiveness operations
  createPackageEffectiveness(effectiveness: InsertPackageEffectiveness): Promise<PackageEffectiveness>;
  getVariantEffectiveness(variantId: string): Promise<PackageEffectiveness | undefined>;

  // Feedback Ticket operations
  createFeedbackTicket(data: typeof feedbackTickets.$inferInsert): Promise<typeof feedbackTickets.$inferSelect>;
  getFeedbackTicket(id: string): Promise<typeof feedbackTickets.$inferSelect | undefined>;
  getAllFeedbackTickets(): Promise<(typeof feedbackTickets.$inferSelect & { user: { id: string; username: string; role: string | null } })[]>;
  getUserFeedbackTickets(userId: string): Promise<typeof feedbackTickets.$inferSelect[]>;
  updateFeedbackTicket(id: string, data: Partial<typeof feedbackTickets.$inferInsert>): Promise<typeof feedbackTickets.$inferSelect>;
  deleteFeedbackTicket(id: string): Promise<void>;

  // Feedback Comment operations
  createFeedbackComment(data: typeof feedbackComments.$inferInsert): Promise<typeof feedbackComments.$inferSelect>;
  getTicketComments(ticketId: string): Promise<(typeof feedbackComments.$inferSelect & { user: { id: string; username: string; role: string | null } })[]>;
  deleteComment(id: string): Promise<void>;

  // Assessment Dimension operations
  getAllDimensions(): Promise<AssessmentDimension[]>;
  getDimension(id: string): Promise<AssessmentDimension | undefined>;
  createDimension(dimension: InsertAssessmentDimension): Promise<AssessmentDimension>;

  // Assessment Item operations
  getAllItems(): Promise<AssessmentItem[]>;
  getItemsByDimension(dimensionId: string): Promise<AssessmentItem[]>;
  getItem(id: string): Promise<AssessmentItem | undefined>;
  createItem(item: InsertAssessmentItem): Promise<AssessmentItem>;

  // Student Assessment operations
  getStudentAssessments(studentId: string): Promise<StudentAssessment[]>;
  getAssessment(id: string): Promise<StudentAssessment | undefined>;
  createAssessment(assessment: InsertStudentAssessment): Promise<StudentAssessment>;
  updateAssessment(id: string, data: Partial<InsertStudentAssessment>): Promise<StudentAssessment>;
  deleteAssessment(id: string): Promise<void>;

  // Assessment Response operations
  getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]>;
  createResponse(response: InsertAssessmentResponse): Promise<AssessmentResponse>;
  createBulkResponses(responses: InsertAssessmentResponse[]): Promise<AssessmentResponse[]>;

  // Assessment Norm operations
  getAllNorms(): Promise<AssessmentNorm[]>;
  getNormsByDimension(dimensionId: string): Promise<AssessmentNorm[]>;
  getNormByDimensionAndGrade(dimensionId: string, gradeLevel: string): Promise<AssessmentNorm | undefined>;
  createNorm(norm: InsertAssessmentNorm): Promise<AssessmentNorm>;

  // Report operations
  getStudentFullReport(studentId: string): Promise<StudentFullReportData>;
  getClassOverview(classId: string): Promise<ClassOverviewData>;
  getSubjectReport(studentId: string, subject: 'math' | 'german' | 'english' | 'creative'): Promise<SubjectReportData>;
  getProgressReport(studentId: string, fromDate?: Date, toDate?: Date): Promise<ProgressReportData>;
  getSelfConceptReport(studentId: string): Promise<SelfConceptReportData>;
  createGeneratedReport(report: InsertGeneratedReport): Promise<GeneratedReport>;
  getGeneratedReports(userId: string): Promise<GeneratedReport[]>;
  getGeneratedReport(reportId: string): Promise<GeneratedReport | undefined>;

  // Admin operations - Teacher management
  getAllTeachers(): Promise<User[]>;
  getTeacher(id: string): Promise<User | undefined>;
  createTeacher(data: { username: string; password: string; email?: string; firstName: string; lastName: string; role?: string; classId?: string | null }): Promise<User>;
  updateTeacher(id: string, data: Partial<{ username: string; password?: string; email?: string; firstName: string; lastName: string; role?: string; classId?: string | null }>): Promise<User>;
  deleteTeacher(id: string): Promise<void>;

  // Admin operations - Class management
  updateClass(id: string, data: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Admin operations - Bulk student import
  bulkCreateStudents(students: InsertStudent[]): Promise<Student[]>;
  deleteStudent(id: string): Promise<void>;

  // Living Life Category operations
  getAllLivingLifeCategories(): Promise<LivingLifeCategory[]>;
  getLivingLifeCategory(id: string): Promise<LivingLifeCategory | undefined>;
  createLivingLifeCategory(category: InsertLivingLifeCategory): Promise<LivingLifeCategory>;

  // Living Life Task operations
  getAllLivingLifeTasks(): Promise<LivingLifeTask[]>;
  getLivingLifeTask(id: string): Promise<LivingLifeTask | undefined>;
  getLivingLifeTasksByCategory(categoryId: string): Promise<LivingLifeTask[]>;
  getLivingLifeTasksByFilters(filters: {
    categoryName?: string;
    difficultyLevel?: string;
    ageGroup?: string;
  }): Promise<LivingLifeTask[]>;
  createLivingLifeTask(task: InsertLivingLifeTask): Promise<LivingLifeTask>;

  // Living Life Assignment operations  
  getStudentLivingLifeAssignments(studentId: string): Promise<(LivingLifeAssignment & { task: LivingLifeTask })[]>;
  getLivingLifeAssignment(id: string): Promise<LivingLifeAssignment | undefined>;
  createLivingLifeAssignment(assignment: InsertLivingLifeAssignment): Promise<LivingLifeAssignment>;
  updateLivingLifeAssignment(id: string, data: Partial<InsertLivingLifeAssignment>): Promise<LivingLifeAssignment>;
  deleteLivingLifeAssignment(id: string): Promise<void>;

  // Living Life Submission operations (vorbereitet für zukünftige Schüler-App)
  getAssignmentSubmissions(assignmentId: string): Promise<LivingLifeSubmission[]>;
  createLivingLifeSubmission(submission: InsertLivingLifeSubmission): Promise<LivingLifeSubmission>;

  // Living Life Reflection operations
  getAssignmentReflections(assignmentId: string): Promise<LivingLifeReflection[]>;
  createLivingLifeReflection(reflection: InsertLivingLifeReflection): Promise<LivingLifeReflection>;

  // Living Life Feedback operations
  getAssignmentFeedback(assignmentId: string): Promise<LivingLifeFeedback[]>;
  createLivingLifeFeedback(feedback: InsertLivingLifeFeedback): Promise<LivingLifeFeedback>;

  // Living Life Badge operations
  getAllLivingLifeBadges(): Promise<LivingLifeBadge[]>;
  getStudentLivingLifeBadges(studentId: string): Promise<(LivingLifeStudentBadge & { badge: LivingLifeBadge })[]>;
  awardLivingLifeBadge(award: InsertLivingLifeStudentBadge): Promise<LivingLifeStudentBadge>;

  // Activity tracking operations
  createUserSession(userId: string, ipAddress?: string, userAgent?: string): Promise<UserSession>;
  endUserSession(sessionId: string): Promise<UserSession>;
  getUserSessions(userId: string, limit?: number): Promise<UserSession[]>;
  getAllUserSessions(limit?: number): Promise<UserSession[]>;

  createPageView(userId: string, sessionId: string | null, pagePath: string, pageTitle?: string): Promise<PageView>;
  endPageView(pageViewId: string): Promise<PageView>;
  getUserPageViews(userId: string, limit?: number): Promise<PageView[]>;

  // Admin statistics
  getUserActivityStats(userId: string): Promise<{
    totalSessions: number;
    totalPageViews: number;
    totalDuration: number;
    lastLogin: Date | null;
    feedbackCount: number;
    topPages: Array<{ path: string; count: number }>;
  }>;
  getAllUsersActivityStats(): Promise<Array<{
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    totalSessions: number;
    totalPageViews: number;
    totalDuration: number;
    lastLogin: Date | null;
    feedbackCount: number;
  }>>;
}

// Report data types
export interface StudentFullReportData {
  student: Student;
  class: Class;
  mathErrors: StudentError[];
  spellingErrors: SpellingError[];
  vocabularyWords: VocabularyWord[];
  creativeTasks: (StudentCreativeTask & { task: CreativeTask })[];
  creativeProfile: StudentCreativeProfile | null;
  assessments: StudentAssessment[];
  homeworks: Homework[];
}

export interface ClassOverviewData {
  class: Class;
  students: Array<{
    student: Student;
    mathErrorCount: number;
    spellingErrorCount: number;
    vocabularyWordCount: number;
    lastAssessment: StudentAssessment | null;
    latestActivity: Date | null;
  }>;
}

export interface SubjectReportData {
  student: Student;
  subject: 'math' | 'german' | 'english' | 'creative';
  errors?: StudentError[] | SpellingError[];
  vocabularyWords?: VocabularyWord[];
  creativeTasks?: (StudentCreativeTask & { task: CreativeTask })[];
  creativeProfile?: StudentCreativeProfile | null;
  homeworks: Homework[];
  stats: {
    totalItems: number;
    recentActivity: Date | null;
    errorTypes?: Record<string, number>;
  };
}

export interface ProgressReportData {
  student: Student;
  dateRange: { from: Date; to: Date };
  mathProgress: {
    errorsBefore: number;
    errorsAfter: number;
    errorTypes: Record<string, { before: number; after: number }>;
  };
  spellingProgress: {
    errorsBefore: number;
    errorsAfter: number;
    categories: Record<string, { before: number; after: number }>;
  };
  vocabularyProgress: {
    wordsBefore: number;
    wordsAfter: number;
  };
  assessmentProgress: {
    assessments: StudentAssessment[];
  };
}

export interface SelfConceptReportData {
  student: Student;
  assessments: StudentAssessment[];
  dimensions: AssessmentDimension[];
  responses: Array<AssessmentResponse & { item: AssessmentItem }>;
  norms: AssessmentNorm[];
  analysis: {
    dimensionScores: Record<string, { score: number; percentile: number; interpretation: string }>;
    overallSelfConcept: 'low' | 'medium' | 'high';
    strengths: string[];
    areasForGrowth: string[];
  };
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const bcrypt = await import('bcryptjs');

    const updateData: any = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      updatedAt: new Date(),
    };

    // Only update role and classId if provided
    if (userData.role !== undefined) {
      updateData.role = userData.role;
    }
    if (userData.classId !== undefined) {
      updateData.classId = userData.classId;
    }

    // Hash password if it's provided and not already hashed
    const insertData = { ...userData };
    if (userData.password && !/^\$2[aby]\$/.test(userData.password)) {
      insertData.password = await bcrypt.hash(userData.password, 10);
    }

    const [result] = await db
      .insert(users)
      .values({
        ...insertData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: updateData,
      })
      .returning();
    return result;
  }

  // Class operations
  async getClasses(): Promise<Class[]> {
    return db.select().from(classes);
  }

  async getAllClasses(): Promise<Class[]> {
    return db.select().from(classes);
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [cls] = await db.insert(classes).values(classData).returning();
    return cls;
  }

  // Student operations
  async getStudentsByClass(classId: string): Promise<Student[]> {
    return db.select().from(students).where(eq(students.classId, classId));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: string, studentData: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({
        ...studentData,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  // Student error operations
  async getStudentErrors(studentId: string): Promise<StudentError[]> {
    return db.select().from(studentErrors).where(eq(studentErrors.studentId, studentId));
  }

  async createStudentError(error: InsertStudentError): Promise<StudentError> {
    const [newError] = await db.insert(studentErrors).values(error).returning();
    return newError;
  }

  async deleteStudentError(id: string): Promise<void> {
    await db.delete(studentErrors).where(eq(studentErrors.id, id));
  }

  // Spelling error operations
  async getSpellingErrors(studentId: string): Promise<SpellingError[]> {
    return db.select().from(spellingErrors).where(eq(spellingErrors.studentId, studentId));
  }

  async createSpellingError(error: InsertSpellingError): Promise<SpellingError> {
    const [newError] = await db.insert(spellingErrors).values(error).returning();
    return newError;
  }

  async deleteSpellingError(id: string): Promise<void> {
    await db.delete(spellingErrors).where(eq(spellingErrors.id, id));
  }

  // Vocabulary operations
  async getVocabularyWords(studentId: string): Promise<VocabularyWord[]> {
    return db.select().from(vocabularyWords).where(eq(vocabularyWords.studentId, studentId));
  }

  async createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord> {
    const [newWord] = await db.insert(vocabularyWords).values(word).returning();
    return newWord;
  }

  async deleteVocabularyWord(id: string): Promise<void> {
    await db.delete(vocabularyWords).where(eq(vocabularyWords.id, id));
  }

  // Homework operations
  async getHomework(id: string): Promise<Homework | undefined> {
    const [homework] = await db.select().from(homeworks).where(eq(homeworks.id, id));
    return homework;
  }

  async getStudentHomeworks(studentId: string): Promise<Homework[]> {
    return db.select().from(homeworks).where(eq(homeworks.studentId, studentId));
  }

  async createHomework(homework: InsertHomework): Promise<Homework> {
    const [newHomework] = await db.insert(homeworks).values(homework).returning();
    return newHomework;
  }

  // Creative task operations
  async getAllCreativeTasks(): Promise<CreativeTask[]> {
    return db.query.creativeTasks.findMany({
      orderBy: (creativeTasks, { asc }) => [asc(creativeTasks.category)],
    });
  }

  async getCreativeTask(id: string): Promise<CreativeTask | undefined> {
    const [task] = await db.select().from(creativeTasks).where(eq(creativeTasks.id, id));
    return task;
  }

  async getCreativeTasksByCategory(category: string): Promise<CreativeTask[]> {
    return db.select().from(creativeTasks).where(eq(creativeTasks.category, category));
  }

  async createCreativeTask(data: {
    title: string;
    description: string;
    category: string;
    ageGroup?: string;
  }): Promise<CreativeTask> {
    const [task] = await db.insert(creativeTasks).values({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      category: data.category,
      ageGroup: data.ageGroup || "7-11 Jahre",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return task;
  }

  // Student creative task operations
  async getStudentCreativeTasks(studentId: string): Promise<(StudentCreativeTask & { task: CreativeTask })[]> {
    const assignments = await db
      .select()
      .from(studentCreativeTasks)
      .leftJoin(creativeTasks, eq(studentCreativeTasks.taskId, creativeTasks.id))
      .where(eq(studentCreativeTasks.studentId, studentId));

    return assignments.map(a => ({
      ...a.student_creative_tasks,
      task: a.creative_tasks!
    }));
  }

  async assignCreativeTask(assignment: InsertStudentCreativeTask): Promise<StudentCreativeTask> {
    const [newAssignment] = await db.insert(studentCreativeTasks).values(assignment).returning();
    return newAssignment;
  }

  async deleteStudentCreativeTask(id: string): Promise<void> {
    await db.delete(studentCreativeTasks).where(eq(studentCreativeTasks.id, id));
  }

  // Student creative profile operations
  async getStudentCreativeProfile(studentId: string): Promise<StudentCreativeProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentCreativeProfiles)
      .where(eq(studentCreativeProfiles.studentId, studentId));
    return profile;
  }

  async upsertStudentCreativeProfile(profileData: InsertStudentCreativeProfile): Promise<StudentCreativeProfile> {
    const [profile] = await db
      .insert(studentCreativeProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: studentCreativeProfiles.studentId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // Training session operations
  async createTrainingSession(sessionData: InsertTrainingSession): Promise<TrainingSession> {
    const [session] = await db.insert(trainingSessions).values(sessionData).returning();
    return session;
  }

  async getTrainingSession(id: string): Promise<TrainingSession | undefined> {
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session;
  }

  async getTeacherTrainingSessions(teacherId: string): Promise<TrainingSession[]> {
    return db.select().from(trainingSessions).where(eq(trainingSessions.teacherId, teacherId));
  }

  async completeTrainingSession(id: string): Promise<TrainingSession> {
    const [session] = await db
      .update(trainingSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(trainingSessions.id, id))
      .returning();
    return session;
  }

  // Package variant operations
  async createPackageVariant(variantData: InsertPackageVariant): Promise<PackageVariant> {
    const [variant] = await db.insert(packageVariants).values(variantData).returning();
    return variant;
  }

  async getSessionVariants(sessionId: string): Promise<PackageVariant[]> {
    return db.select().from(packageVariants).where(eq(packageVariants.sessionId, sessionId));
  }

  async getPackageVariant(id: string): Promise<PackageVariant | undefined> {
    const [variant] = await db.select().from(packageVariants).where(eq(packageVariants.id, id));
    return variant;
  }

  // Training selection operations
  async createTrainingSelection(selectionData: InsertTrainingSelection): Promise<TrainingSelection> {
    const [selection] = await db.insert(trainingSelections).values(selectionData).returning();
    return selection;
  }

  async getSessionSelections(sessionId: string): Promise<TrainingSelection[]> {
    return db.select().from(trainingSelections).where(eq(trainingSelections.sessionId, sessionId));
  }

  async createBulkSelections(selectionsData: InsertTrainingSelection[]): Promise<TrainingSelection[]> {
    const selections = await db.insert(trainingSelections).values(selectionsData).returning();
    return selections;
  }

  // Preference network operations
  async getPreferenceNetwork(teacherId: string): Promise<PreferenceNetwork | undefined> {
    const [network] = await db
      .select()
      .from(preferenceNetworks)
      .where(eq(preferenceNetworks.teacherId, teacherId));
    return network;
  }

  async upsertPreferenceNetwork(networkData: InsertPreferenceNetwork): Promise<PreferenceNetwork> {
    const [network] = await db
      .insert(preferenceNetworks)
      .values(networkData)
      .onConflictDoUpdate({
        target: preferenceNetworks.teacherId,
        set: {
          ...networkData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return network;
  }

  async updateNetworkWeights(teacherId: string, patterns: any, weights: any): Promise<PreferenceNetwork> {
    const [network] = await db
      .update(preferenceNetworks)
      .set({
        patterns,
        weights,
        trainingCount: sql`training_count + 1`,
        lastTrainedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(preferenceNetworks.teacherId, teacherId))
      .returning();
    return network;
  }

  async deletePreferenceNetwork(teacherId: string): Promise<void> {
    await db.delete(preferenceNetworks) // Corrected table name from teacherPreferenceNetwork
      .where(eq(preferenceNetworks.teacherId, teacherId));
  }

  // Package effectiveness operations
  async createPackageEffectiveness(effectivenessData: InsertPackageEffectiveness): Promise<PackageEffectiveness> {
    const [effectiveness] = await db.insert(packageEffectiveness).values(effectivenessData).returning();
    return effectiveness;
  }

  async getVariantEffectiveness(variantId: string): Promise<PackageEffectiveness | undefined> {
    const [effectiveness] = await db
      .select()
      .from(packageEffectiveness)
      .where(eq(packageEffectiveness.variantId, variantId));
    return effectiveness;
  }

  // Feedback Tickets
  async createFeedbackTicket(data: typeof feedbackTickets.$inferInsert): Promise<typeof feedbackTickets.$inferSelect> {
    const [ticket] = await db.insert(feedbackTickets).values(data).returning();
    return ticket;
  }

  async getFeedbackTicket(id: string): Promise<typeof feedbackTickets.$inferSelect | undefined> {
    const [ticket] = await db.select().from(feedbackTickets).where(eq(feedbackTickets.id, id));
    return ticket;
  }

  async getAllFeedbackTickets(): Promise<{ ticket: typeof feedbackTickets.$inferSelect; user: { id: string; username: string; role: string | null } | null }[]> {
    return await db.select({
      ticket: feedbackTickets,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      }
    })
    .from(feedbackTickets)
    .leftJoin(users, eq(feedbackTickets.userId, users.id))
    .orderBy(desc(feedbackTickets.createdAt)) as any;
  }

  async getUserFeedbackTickets(userId: string): Promise<typeof feedbackTickets.$inferSelect[]> {
    return await db.select().from(feedbackTickets)
      .where(eq(feedbackTickets.userId, userId))
      .orderBy(desc(feedbackTickets.createdAt));
  }

  async updateFeedbackTicket(id: string, data: Partial<typeof feedbackTickets.$inferInsert>): Promise<typeof feedbackTickets.$inferSelect> {
    const [ticket] = await db.update(feedbackTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(feedbackTickets.id, id))
      .returning();
    return ticket;
  }

  async deleteFeedbackTicket(id: string): Promise<void> {
    await db.delete(feedbackTickets).where(eq(feedbackTickets.id, id));
  }

  // Feedback Comments
  async createFeedbackComment(data: typeof feedbackComments.$inferInsert): Promise<typeof feedbackComments.$inferSelect> {
    const [comment] = await db.insert(feedbackComments).values(data).returning();
    return comment;
  }

  async getTicketComments(ticketId: string): Promise<{ comment: typeof feedbackComments.$inferSelect; user: { id: string; username: string; role: string | null } | null }[]> {
    return await db.select({
      comment: feedbackComments,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      }
    })
    .from(feedbackComments)
    .leftJoin(users, eq(feedbackComments.userId, users.id))
    .where(eq(feedbackComments.ticketId, ticketId))
    .orderBy(feedbackComments.createdAt) as any;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(feedbackComments).where(eq(feedbackComments.id, id));
  }

  // Assessment Dimension operations
  async getAllDimensions(): Promise<AssessmentDimension[]> {
    return db.select().from(assessmentDimensions).orderBy(assessmentDimensions.orderIndex);
  }

  async getDimension(id: string): Promise<AssessmentDimension | undefined> {
    const [dimension] = await db.select().from(assessmentDimensions).where(eq(assessmentDimensions.id, id));
    return dimension;
  }

  async createDimension(dimensionData: InsertAssessmentDimension): Promise<AssessmentDimension> {
    const [dimension] = await db.insert(assessmentDimensions).values(dimensionData).returning();
    return dimension;
  }

  // Assessment Item operations
  async getAllItems(): Promise<AssessmentItem[]> {
    return db.select().from(assessmentItems).orderBy(assessmentItems.itemNumber);
  }

  async getItemsByDimension(dimensionId: string): Promise<AssessmentItem[]> {
    return db.select().from(assessmentItems)
      .where(eq(assessmentItems.dimensionId, dimensionId))
      .orderBy(assessmentItems.itemNumber);
  }

  async getItem(id: string): Promise<AssessmentItem | undefined> {
    const [item] = await db.select().from(assessmentItems).where(eq(assessmentItems.id, id));
    return item;
  }

  async createItem(itemData: InsertAssessmentItem): Promise<AssessmentItem> {
    const [item] = await db.insert(assessmentItems).values(itemData).returning();
    return item;
  }

  // Student Assessment operations
  async getStudentAssessments(studentId: string): Promise<StudentAssessment[]> {
    return db.select().from(studentAssessments)
      .where(eq(studentAssessments.studentId, studentId))
      .orderBy(desc(studentAssessments.createdAt));
  }

  async getAssessment(id: string): Promise<StudentAssessment | undefined> {
    const [assessment] = await db.select().from(studentAssessments).where(eq(studentAssessments.id, id));
    return assessment;
  }

  async createAssessment(assessmentData: InsertStudentAssessment): Promise<StudentAssessment> {
    const [assessment] = await db.insert(studentAssessments).values(assessmentData).returning();
    return assessment;
  }

  async updateAssessment(id: string, data: Partial<InsertStudentAssessment>): Promise<StudentAssessment> {
    const [assessment] = await db
      .update(studentAssessments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(studentAssessments.id, id))
      .returning();
    return assessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(studentAssessments).where(eq(studentAssessments.id, id));
  }

  // Assessment Response operations
  async getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
    return db.select().from(assessmentResponses)
      .where(eq(assessmentResponses.assessmentId, assessmentId));
  }

  async createResponse(responseData: InsertAssessmentResponse): Promise<AssessmentResponse> {
    const [response] = await db.insert(assessmentResponses).values(responseData).returning();
    return response;
  }

  async createBulkResponses(responsesData: InsertAssessmentResponse[]): Promise<AssessmentResponse[]> {
    if (responsesData.length === 0) return [];
    const responses = await db.insert(assessmentResponses).values(responsesData).returning();
    return responses;
  }

  // Assessment Norm operations
  async getAllNorms(): Promise<AssessmentNorm[]> {
    return db.select().from(assessmentNorms);
  }

  async getNormsByDimension(dimensionId: string): Promise<AssessmentNorm[]> {
    return db.select().from(assessmentNorms).where(eq(assessmentNorms.dimensionId, dimensionId));
  }

  async getNormByDimensionAndGrade(dimensionId: string, gradeLevel: string): Promise<AssessmentNorm | undefined> {
    const [norm] = await db.select().from(assessmentNorms)
      .where(and(
        eq(assessmentNorms.dimensionId, dimensionId),
        eq(assessmentNorms.gradeLevel, gradeLevel)
      ));
    return norm;
  }

  async createNorm(normData: InsertAssessmentNorm): Promise<AssessmentNorm> {
    const [norm] = await db.insert(assessmentNorms).values(normData).returning();
    return norm;
  }

  // Report operations
  async getStudentFullReport(studentId: string): Promise<StudentFullReportData> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const classData = await this.getClass(student.classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    const [
      mathErrors,
      spellingErrors,
      vocabularyWords,
      creativeTasks,
      creativeProfile,
      assessments,
      homeworks
    ] = await Promise.all([
      this.getStudentErrors(studentId),
      this.getSpellingErrors(studentId),
      this.getVocabularyWords(studentId),
      this.getStudentCreativeTasks(studentId),
      this.getStudentCreativeProfile(studentId),
      this.getStudentAssessments(studentId),
      this.getStudentHomeworks(studentId)
    ]);

    return {
      student,
      class: classData,
      mathErrors,
      spellingErrors,
      vocabularyWords,
      creativeTasks,
      creativeProfile: creativeProfile || null,
      assessments,
      homeworks
    };
  }

  async getClassOverview(classId: string): Promise<ClassOverviewData> {
    const classData = await this.getClass(classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    const students = await this.getStudentsByClass(classId);

    const studentsData = await Promise.all(
      students.map(async (student) => {
        const [mathErrors, spellingErrors, vocabularyWords, assessments] = await Promise.all([
          this.getStudentErrors(student.id),
          this.getSpellingErrors(student.id),
          this.getVocabularyWords(student.id),
          this.getStudentAssessments(student.id)
        ]);

        const latestActivity = [
          ...mathErrors.map(e => e.createdAt),
          ...spellingErrors.map(e => e.createdAt),
          ...vocabularyWords.map(v => v.createdAt),
          ...assessments.map(a => a.createdAt)
        ].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

        return {
          student,
          mathErrorCount: mathErrors.length,
          spellingErrorCount: spellingErrors.length,
          vocabularyWordCount: vocabularyWords.length,
          lastAssessment: assessments[0] || null,
          latestActivity
        };
      })
    );

    return {
      class: classData,
      students: studentsData
    };
  }

  async getSubjectReport(studentId: string, subject: 'math' | 'german' | 'english' | 'creative'): Promise<SubjectReportData> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const homeworks = await this.getStudentHomeworks(studentId);

    let errors: StudentError[] | SpellingError[] | undefined;
    let vocabularyWords: VocabularyWord[] | undefined;
    let creativeTasks: (StudentCreativeTask & { task: CreativeTask })[] | undefined;
    let creativeProfile: StudentCreativeProfile | null | undefined;
    let totalItems = 0;
    let recentActivity: Date | null = null;
    let errorTypes: Record<string, number> = {};

    if (subject === 'math') {
      errors = await this.getStudentErrors(studentId);
      totalItems = errors.length;
      recentActivity = errors.length > 0 ? errors.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())[0].createdAt! : null;
      errorTypes = errors.reduce((acc, error) => {
        const type = error.errorType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    } else if (subject === 'german') {
      errors = await this.getSpellingErrors(studentId);
      totalItems = errors.length;
      recentActivity = errors.length > 0 ? errors.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())[0].createdAt! : null;
      errorTypes = errors.reduce((acc, error) => {
        const type = error.errorCategory || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    } else if (subject === 'english') {
      vocabularyWords = await this.getVocabularyWords(studentId);
      totalItems = vocabularyWords.length;
      recentActivity = vocabularyWords.length > 0 ? vocabularyWords.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())[0].createdAt! : null;
    } else if (subject === 'creative') {
      creativeTasks = await this.getStudentCreativeTasks(studentId);
      creativeProfile = await this.getStudentCreativeProfile(studentId);
      totalItems = creativeTasks.length;
      recentActivity = creativeTasks.length > 0 ? creativeTasks.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())[0].createdAt! : null;
    }

    return {
      student,
      subject,
      errors,
      vocabularyWords,
      creativeTasks,
      creativeProfile,
      homeworks,
      stats: {
        totalItems,
        recentActivity,
        errorTypes: Object.keys(errorTypes).length > 0 ? errorTypes : undefined
      }
    };
  }

  async getProgressReport(studentId: string, fromDate?: Date, toDate?: Date): Promise<ProgressReportData> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const now = new Date();
    const from = fromDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const to = toDate || now;

    const [mathErrors, spellingErrors, vocabularyWords, assessments] = await Promise.all([
      this.getStudentErrors(studentId),
      this.getSpellingErrors(studentId),
      this.getVocabularyWords(studentId),
      this.getStudentAssessments(studentId)
    ]);

    // Math progress
    const mathErrorsBefore = mathErrors.filter(e => e.createdAt && e.createdAt < from).length;
    const mathErrorsAfter = mathErrors.filter(e => e.createdAt && e.createdAt >= from && e.createdAt <= to).length;
    const mathErrorTypesBefore: Record<string, number> = {};
    const mathErrorTypesAfter: Record<string, number> = {};

    mathErrors.forEach(error => {
      const type = error.errorType || 'unknown';
      if (error.createdAt && error.createdAt < from) {
        mathErrorTypesBefore[type] = (mathErrorTypesBefore[type] || 0) + 1;
      } else if (error.createdAt && error.createdAt >= from && error.createdAt <= to) {
        mathErrorTypesAfter[type] = (mathErrorTypesAfter[type] || 0) + 1;
      }
    });

    // Spelling progress
    const spellingErrorsBefore = spellingErrors.filter(e => e.createdAt && e.createdAt < from).length;
    const spellingErrorsAfter = spellingErrors.filter(e => e.createdAt && e.createdAt >= from && e.createdAt <= to).length;
    const spellingCategoriesBefore: Record<string, number> = {};
    const spellingCategoriesAfter: Record<string, number> = {};

    spellingErrors.forEach(error => {
      const category = error.errorCategory || 'unknown';
      if (error.createdAt && error.createdAt < from) {
        spellingCategoriesBefore[category] = (spellingCategoriesBefore[category] || 0) + 1;
      } else if (error.createdAt && error.createdAt >= from && error.createdAt <= to) {
        spellingCategoriesAfter[category] = (spellingCategoriesAfter[category] || 0) + 1;
      }
    });

    // Vocabulary progress
    const vocabularyBefore = vocabularyWords.filter(v => v.createdAt && v.createdAt < from).length;
    const vocabularyAfter = vocabularyWords.filter(v => v.createdAt && v.createdAt >= from && v.createdAt <= to).length;

    // Assessment progress
    const relevantAssessments = assessments.filter(a =>
      a.createdAt && a.createdAt >= from && a.createdAt <= to
    );

    const errorTypesProgress: Record<string, { before: number; after: number }> = {};
    [...new Set([...Object.keys(mathErrorTypesBefore), ...Object.keys(mathErrorTypesAfter)])].forEach(type => {
      errorTypesProgress[type] = {
        before: mathErrorTypesBefore[type] || 0,
        after: mathErrorTypesAfter[type] || 0
      };
    });

    const categoriesProgress: Record<string, { before: number; after: number }> = {};
    [...new Set([...Object.keys(spellingCategoriesBefore), ...Object.keys(spellingCategoriesAfter)])].forEach(category => {
      categoriesProgress[category] = {
        before: spellingCategoriesBefore[category] || 0,
        after: spellingCategoriesAfter[category] || 0
      };
    });

    return {
      student,
      dateRange: { from, to },
      mathProgress: {
        errorsBefore: mathErrorsBefore,
        errorsAfter: mathErrorsAfter,
        errorTypes: errorTypesProgress
      },
      spellingProgress: {
        errorsBefore: spellingErrorsBefore,
        errorsAfter: spellingErrorsAfter,
        categories: categoriesProgress
      },
      vocabularyProgress: {
        wordsBefore: vocabularyBefore,
        wordsAfter: vocabularyAfter
      },
      assessmentProgress: {
        assessments: relevantAssessments
      }
    };
  }

  async getSelfConceptReport(studentId: string): Promise<SelfConceptReportData> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const [assessments, dimensions, norms] = await Promise.all([
      this.getStudentAssessments(studentId),
      this.getAllDimensions(),
      this.getAllNorms()
    ]);

    const completedAssessment = assessments.find(a => a.status === 'completed');
    const responses: Array<AssessmentResponse & { item: AssessmentItem }> = [];

    if (completedAssessment) {
      const assessmentResponses = await this.getAssessmentResponses(completedAssessment.id);
      for (const response of assessmentResponses) {
        const item = await this.getItem(response.itemId);
        if (item) {
          responses.push({ ...response, item });
        }
      }
    }

    const dimensionScores: Record<string, { score: number; percentile: number; interpretation: string }> = {};
    const strengths: string[] = [];
    const areasForGrowth: string[] = [];

    dimensions.forEach(dimension => {
      const dimensionResponses = responses.filter(r => r.item.dimensionId === dimension.id);
      const score = dimensionResponses.reduce((sum, r) => sum + (r.value || 0), 0);
      const avgScore = dimensionResponses.length > 0 ? score / dimensionResponses.length : 0;

      const norm = norms.find(n => n.dimensionId === dimension.id);
      const percentile = norm ? Math.min(100, Math.max(0, ((avgScore - norm.mean) / norm.stdDev) * 15 + 50)) : 50;

      let interpretation = 'durchschnittlich';
      if (percentile >= 70) {
        interpretation = 'überdurchschnittlich';
        strengths.push(dimension.name);
      } else if (percentile <= 30) {
        interpretation = 'unterdurchschnittlich';
        areasForGrowth.push(dimension.name);
      }

      dimensionScores[dimension.id] = { score: avgScore, percentile, interpretation };
    });

    const avgPercentile = Object.values(dimensionScores).reduce((sum, d) => sum + d.percentile, 0) / Object.values(dimensionScores).length;
    const overallSelfConcept = avgPercentile >= 60 ? 'high' : avgPercentile <= 40 ? 'low' : 'medium';

    return {
      student,
      assessments,
      dimensions,
      responses,
      norms,
      analysis: {
        dimensionScores,
        overallSelfConcept,
        strengths,
        areasForGrowth
      }
    };
  }

  async createGeneratedReport(reportData: InsertGeneratedReport): Promise<GeneratedReport> {
    const [report] = await db.insert(generatedReports).values(reportData).returning();
    return report;
  }

  async getGeneratedReports(userId: string): Promise<GeneratedReport[]> {
    return db.query.generatedReports.findMany({
      where: eq(generatedReports.generatedBy, userId),
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });
  }

  async getGeneratedReport(reportId: string): Promise<GeneratedReport | undefined> {
    return db.query.generatedReports.findFirst({
      where: eq(generatedReports.id, reportId),
    });
  }

  // Admin operations - Teacher management
  async getAllTeachers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.username);
  }

  async getTeacher(id: string): Promise<User | undefined> {
    const [teacher] = await db.select().from(users).where(eq(users.id, id));
    return teacher;
  }

  async createTeacher(data: { 
    username: string; 
    password: string; 
    email?: string; 
    firstName: string; 
    lastName: string; 
    role?: string; 
    classId?: string | null 
  }): Promise<User> {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [teacher] = await db.insert(users).values({
      username: data.username,
      password: hashedPassword,
      email: data.email || null,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'teacher',
      classId: data.classId || null,
    }).returning();

    return teacher;
  }

  async updateTeacher(id: string, data: Partial<{ 
    username: string; 
    password?: string; 
    email?: string; 
    firstName: string; 
    lastName: string; 
    role?: string; 
    classId?: string | null 
  }>): Promise<User> {
    const updateData: any = { ...data };

    if (data.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    updateData.updatedAt = new Date();

    const [teacher] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    return teacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    const teacher = await this.getTeacher(id);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Check if teacher has an assigned class
    if (teacher.classId) {
      throw new Error('Cannot delete teacher with assigned class. Remove class assignment first.');
    }

    // Check if teacher is teaching any class
    const teachingClasses = await db.select().from(classes).where(eq(classes.teacherId, id));
    if (teachingClasses.length > 0) {
      throw new Error('Cannot delete teacher who is assigned to classes. Reassign classes first.');
    }

    await db.delete(users).where(eq(users.id, id));
  }

  // Admin operations - Class management
  async updateClass(id: string, data: Partial<InsertClass>): Promise<Class> {
    const updateData: any = { ...data, updatedAt: new Date() };

    const [updatedClass] = await db.update(classes)
      .set(updateData)
      .where(eq(classes.id, id))
      .returning();

    if (!updatedClass) {
      throw new Error('Class not found');
    }

    return updatedClass;
  }

  async deleteClass(id: string): Promise<void> {
    // Check if class has students
    const classStudents = await this.getStudentsByClass(id);
    if (classStudents.length > 0) {
      throw new Error('Cannot delete class with students. Remove or reassign students first.');
    }

    await db.delete(classes).where(eq(classes.id, id));
  }

  // Admin operations - Bulk student import
  async bulkCreateStudents(students: InsertStudent[]): Promise<Student[]> {
    if (students.length === 0) {
      return [];
    }

    const createdStudents = await db.insert(this.students).values(students).returning();
    return createdStudents;
  }

  async deleteStudent(id: string): Promise<void> {
    const student = await this.getStudent(id);
    if (!student) {
      throw new Error('Student not found');
    }

    // Delete all related data in a transaction
    await db.transaction(async (tx) => {
      // Delete student assessments and responses
      const assessments = await tx.select().from(studentAssessments).where(eq(studentAssessments.studentId, id));
      for (const assessment of assessments) {
        await tx.delete(assessmentResponses).where(eq(assessmentResponses.assessmentId, assessment.id));
      }
      await tx.delete(studentAssessments).where(eq(studentAssessments.studentId, id));

      // Delete student creative tasks and profiles
      await tx.delete(studentCreativeTasks).where(eq(studentCreativeTasks.studentId, id));
      await tx.delete(studentCreativeProfiles).where(eq(studentCreativeProfiles.studentId, id));

      // Delete homeworks
      await tx.delete(homeworks).where(eq(homeworks.studentId, id));

      // Delete vocabulary words
      await tx.delete(vocabularyWords).where(eq(vocabularyWords.studentId, id));

      // Delete spelling errors
      await tx.delete(spellingErrors).where(eq(spellingErrors.studentId, id));

      // Delete student errors
      await tx.delete(studentErrors).where(eq(studentErrors.studentId, id));

      // Finally, delete the student
      await tx.delete(students).where(eq(students.id, id));
    });
  }

  // Activity tracking operations
  async createUserSession(userId: string, ipAddress?: string, userAgent?: string): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values({
      userId,
      ipAddress,
      userAgent,
    }).returning();
    return session;
  }

  async endUserSession(sessionId: string): Promise<UserSession> {
    const session = await db.select().from(userSessions).where(eq(userSessions.id, sessionId)).limit(1);
    if (!session || session.length === 0) {
      throw new Error('Session not found');
    }

    const loginAt = session[0].loginAt;
    const logoutAt = new Date();
    const sessionDuration = Math.floor((logoutAt.getTime() - loginAt.getTime()) / 1000);

    const [updated] = await db.update(userSessions)
      .set({ logoutAt, sessionDuration })
      .where(eq(userSessions.id, sessionId))
      .returning();
    return updated;
  }

  async getUserSessions(userId: string, limit: number = 50): Promise<UserSession[]> {
    return await db.select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.loginAt))
      .limit(limit);
  }

  async getAllUserSessions(limit: number = 100): Promise<UserSession[]> {
    return await db.select()
      .from(userSessions)
      .orderBy(desc(userSessions.loginAt))
      .limit(limit);
  }

  async createPageView(userId: string, sessionId: string | null, pagePath: string, pageTitle?: string): Promise<PageView> {
    const [pageView] = await db.insert(pageViews).values({
      userId,
      sessionId,
      pagePath,
      pageTitle,
    }).returning();
    return pageView;
  }

  async endPageView(pageViewId: string): Promise<PageView> {
    const view = await db.select().from(pageViews).where(eq(pageViews.id, pageViewId)).limit(1);
    if (!view || view.length === 0) {
      throw new Error('Page view not found');
    }

    const enteredAt = view[0].enteredAt;
    const leftAt = new Date();
    const duration = Math.floor((leftAt.getTime() - enteredAt.getTime()) / 1000);

    const [updated] = await db.update(pageViews)
      .set({ leftAt, duration })
      .where(eq(pageViews.id, pageViewId))
      .returning();
    return updated;
  }

  async getUserPageViews(userId: string, limit: number = 100): Promise<PageView[]> {
    return await db.select()
      .from(pageViews)
      .where(eq(pageViews.userId, userId))
      .orderBy(desc(pageViews.enteredAt))
      .limit(limit);
  }

  // Admin statistics
  async getUserActivityStats(userId: string): Promise<{
    totalSessions: number;
    totalPageViews: number;
    totalDuration: number;
    lastLogin: Date | null;
    feedbackCount: number;
    topPages: Array<{ path: string; count: number }>;
  }> {
    // Get session stats
    const sessions = await db.select().from(userSessions).where(eq(userSessions.userId, userId));
    const totalSessions = sessions.length;
    const lastLogin = sessions.length > 0 
      ? sessions.sort((a, b) => b.loginAt.getTime() - a.loginAt.getTime())[0].loginAt 
      : null;

    // Calculate total session duration
    const totalDuration = sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0);

    // Get page view stats
    const views = await db.select().from(pageViews).where(eq(pageViews.userId, userId));
    const totalPageViews = views.length;

    // Get top pages
    const pageCount = views.reduce((acc, view) => {
      acc[view.pagePath] = (acc[view.pagePath] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pageCount)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get feedback count
    const feedbacks = await db.select().from(feedbackTickets).where(eq(feedbackTickets.userId, userId));
    const feedbackCount = feedbacks.length;

    return {
      totalSessions,
      totalPageViews,
      totalDuration,
      lastLogin,
      feedbackCount,
      topPages,
    };
  }

  async getAllUsersActivityStats(): Promise<Array<{
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    totalSessions: number;
    totalPageViews: number;
    totalDuration: number;
    lastLogin: Date | null;
    feedbackCount: number;
  }>> {
    // Get all users who are teachers or admins
    const allUsers = await db.select().from(users);

    const stats = await Promise.all(
      allUsers.map(async (user) => {
        const userStats = await this.getUserActivityStats(user.id);
        return {
          userId: user.id,
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          totalSessions: userStats.totalSessions,
          totalPageViews: userStats.totalPageViews,
          totalDuration: userStats.totalDuration,
          lastLogin: userStats.lastLogin,
          feedbackCount: userStats.feedbackCount,
        };
      })
    );

    return stats.sort((a, b) => {
      if (!a.lastLogin) return 1;
      if (!b.lastLogin) return -1;
      return b.lastLogin.getTime() - a.lastLogin.getTime();
    });
  }

  // ========================================
  // LIVING LIFE OPERATIONS
  // ========================================

  // Living Life Category operations
  async getAllLivingLifeCategories(): Promise<LivingLifeCategory[]> {
    return await db.select().from(livingLifeCategories).orderBy(livingLifeCategories.orderIndex);
  }

  async getLivingLifeCategory(id: string): Promise<LivingLifeCategory | undefined> {
    const result = await db.select().from(livingLifeCategories).where(eq(livingLifeCategories.id, id)).limit(1);
    return result[0];
  }

  async createLivingLifeCategory(category: InsertLivingLifeCategory): Promise<LivingLifeCategory> {
    const [created] = await db.insert(livingLifeCategories).values(category).returning();
    return created;
  }

  // Living Life Task operations
  async getAllLivingLifeTasks(): Promise<LivingLifeTask[]> {
    return await db.select().from(livingLifeTasks).where(eq(livingLifeTasks.isActive, 1));
  }

  async getLivingLifeTask(id: string): Promise<LivingLifeTask | undefined> {
    const result = await db.select().from(livingLifeTasks).where(eq(livingLifeTasks.id, id)).limit(1);
    return result[0];
  }

  async getLivingLifeTasksByCategory(categoryName: string): Promise<LivingLifeTask[]> {
    return await db.select()
      .from(livingLifeTasks)
      .where(and(
        eq(livingLifeTasks.categoryName, categoryName),
        eq(livingLifeTasks.isActive, 1)
      ));
  }

  async getLivingLifeTasksByFilters(filters: {
    categoryName?: string;
    difficultyLevel?: string;
    ageGroup?: string;
  }): Promise<LivingLifeTask[]> {
    let query = db.select().from(livingLifeTasks).where(eq(livingLifeTasks.isActive, 1));

    const conditions = [eq(livingLifeTasks.isActive, 1)];

    if (filters.difficultyLevel) {
      conditions.push(eq(livingLifeTasks.difficultyLevel, filters.difficultyLevel));
    }

    if (filters.ageGroup) {
      conditions.push(eq(livingLifeTasks.ageGroup, filters.ageGroup));
    }

    if (conditions.length > 1) {
      return await db.select().from(livingLifeTasks).where(and(...conditions));
    }

    return await db.select().from(livingLifeTasks).where(conditions[0]);
  }

  async createLivingLifeTask(task: InsertLivingLifeTask): Promise<LivingLifeTask> {
    const [created] = await db.insert(livingLifeTasks).values(task).returning();
    return created;
  }

  // Living Life Assignment operations
  async getStudentLivingLifeAssignments(studentId: string): Promise<(LivingLifeAssignment & { task: LivingLifeTask })[]> {
    const assignments = await db.select()
      .from(livingLifeAssignments)
      .where(eq(livingLifeAssignments.studentId, studentId))
      .orderBy(desc(livingLifeAssignments.createdAt));

    const assignmentsWithTasks = await Promise.all(
      assignments.map(async (assignment) => {
        const task = await this.getLivingLifeTask(assignment.taskId);
        return {
          ...assignment,
          task: task!
        };
      })
    );

    return assignmentsWithTasks;
  }

  async getLivingLifeAssignment(id: string): Promise<LivingLifeAssignment | undefined> {
    const result = await db.select().from(livingLifeAssignments).where(eq(livingLifeAssignments.id, id)).limit(1);
    return result[0];
  }

  async createLivingLifeAssignment(assignment: InsertLivingLifeAssignment): Promise<LivingLifeAssignment> {
    const [created] = await db.insert(livingLifeAssignments).values(assignment).returning();
    return created;
  }

  async updateLivingLifeAssignment(id: string, data: Partial<InsertLivingLifeAssignment>): Promise<LivingLifeAssignment> {
    const [updated] = await db.update(livingLifeAssignments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(livingLifeAssignments.id, id))
      .returning();
    return updated;
  }

  async deleteLivingLifeAssignment(id: string): Promise<void> {
    await db.delete(livingLifeAssignments).where(eq(livingLifeAssignments.id, id));
  }

  // Living Life Submission operations (vorbereitet für zukünftige Schüler-App)
  async getAssignmentSubmissions(assignmentId: string): Promise<LivingLifeSubmission[]> {
    return await db.select()
      .from(livingLifeSubmissions)
      .where(eq(livingLifeSubmissions.assignmentId, assignmentId))
      .orderBy(desc(livingLifeSubmissions.createdAt));
  }

  async createLivingLifeSubmission(submission: InsertLivingLifeSubmission): Promise<LivingLifeSubmission> {
    const [created] = await db.insert(livingLifeSubmissions).values(submission).returning();
    return created;
  }

  // Living Life Reflection operations
  async getAssignmentReflections(assignmentId: string): Promise<LivingLifeReflection[]> {
    return await db.select()
      .from(livingLifeReflections)
      .where(eq(livingLifeReflections.assignmentId, assignmentId))
      .orderBy(desc(livingLifeReflections.createdAt));
  }

  async createLivingLifeReflection(reflection: InsertLivingLifeReflection): Promise<LivingLifeReflection> {
    const [created] = await db.insert(livingLifeReflections).values(reflection).returning();
    return created;
  }

  // Living Life Feedback operations
  async getAssignmentFeedback(assignmentId: string): Promise<LivingLifeFeedback[]> {
    return await db.select()
      .from(livingLifeFeedback)
      .where(eq(livingLifeFeedback.assignmentId, assignmentId))
      .orderBy(desc(livingLifeFeedback.createdAt));
  }

  async createLivingLifeFeedback(feedback: InsertLivingLifeFeedback): Promise<LivingLifeFeedback> {
    const [created] = await db.insert(livingLifeFeedback).values(feedback).returning();
    return created;
  }

  // Living Life Badge operations
  async getAllLivingLifeBadges(): Promise<LivingLifeBadge[]> {
    return await db.select().from(livingLifeBadges).where(eq(livingLifeBadges.isActive, 1));
  }

  async getStudentLivingLifeBadges(studentId: string): Promise<(LivingLifeStudentBadge & { badge: LivingLifeBadge })[]> {
    const studentBadges = await db.select()
      .from(livingLifeStudentBadges)
      .where(eq(livingLifeStudentBadges.studentId, studentId))
      .orderBy(desc(livingLifeStudentBadges.earnedAt));

    const badgesWithDetails = await Promise.all(
      studentBadges.map(async (sb) => {
        const badge = await db.select().from(livingLifeBadges).where(eq(livingLifeBadges.id, sb.badgeId)).limit(1);
        return {
          ...sb,
          badge: badge[0]
        };
      })
    );

    return badgesWithDetails;
  }

  async awardLivingLifeBadge(award: InsertLivingLifeStudentBadge): Promise<LivingLifeStudentBadge> {
    const [created] = await db.insert(livingLifeStudentBadges).values(award).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();