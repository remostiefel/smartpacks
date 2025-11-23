import { Router } from 'express';
import { seedTestClass } from './seed-test-class';
import { seedNewCreativeTasks } from './seed-creative-tasks';

const router = Router();

/**
 * Admin Seeding Endpoint
 * 
 * This endpoint allows admins to seed the production database via HTTP request.
 * Only accessible to admin users for security.
 * 
 * Usage: GET /api/admin/seed-production
 */
router.get('/seed-production', async (req, res) => {
  try {
    // Security: Only allow admin users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Only admin users can seed the database' 
      });
    }

    console.log(`🌱 Admin ${req.user.username} initiated production seeding`);

    // Execute seeding
    const results: any = {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      seedingResults: {}
    };

    // 1. Seed Creative Tasks
    console.log('1️⃣ Seeding Creative Tasks...');
    const creativeResult = await seedNewCreativeTasks(true); // Force production
    results.seedingResults.creativeTasks = creativeResult;

    // 2. Seed Test Class
    console.log('2️⃣ Seeding Test Class...');
    const testClassResult = await seedTestClass();
    results.seedingResults.testClass = {
      students: testClassResult.students.length,
      mathErrors: testClassResult.mathErrors,
      spellingErrors: testClassResult.spellingErrors,
      vocabulary: testClassResult.vocabulary,
      creativeTasks: testClassResult.creativeTasks,
      assessments: testClassResult.assessments,
      profiles: testClassResult.profiles
    };

    console.log('✅ Production seeding completed via admin endpoint');

    return res.json({
      success: true,
      message: 'Production database seeded successfully',
      results
    });

  } catch (error: any) {
    console.error('❌ Admin seeding failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Seeding failed',
      message: error.message,
      details: error.stack
    });
  }
});

/**
 * Check Seeding Status
 * 
 * Returns current database statistics
 */
router.get('/seed-status', async (req, res) => {
  try {
    // Security: Only allow admin users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Only admin users can check seed status' 
      });
    }

    const { storage } = await import('./storage');

    // Get statistics
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

    return res.json(stats);

  } catch (error: any) {
    return res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

export default router;
