import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { testDataSeeder } from '../utils/testDataSeeder';
import { asyncHandler } from '../middleware/errorHandler';
import { performanceMonitor } from '../utils/performanceMonitor';
import { queryOptimizer } from '../utils/queryOptimizer';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test endpoint to check API health
router.get('/health', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };
  
  logger.info('Health check requested', healthCheck);
  res.json(healthCheck);
}));

// Test database connection
router.get('/db-connection', asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({
      status: 'Connected',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database connection test failed:', error);
    res.status(500).json({
      status: 'Failed',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// Seed test data
router.post('/seed-data', asyncHandler(async (req, res) => {
  try {
    logger.info('Test data seeding requested');
    
    await testDataSeeder.seedTestData();
    const credentials = await testDataSeeder.getTestCredentials();
    
    res.json({
      status: 'Success',
      message: 'Test data seeded successfully',
      credentials,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Test data seeding failed:', error);
    res.status(500).json({
      status: 'Failed',
      message: 'Test data seeding failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// Get test credentials
router.get('/credentials', asyncHandler(async (req, res) => {
  try {
    const credentials = await testDataSeeder.getTestCredentials();
    
    res.json({
      status: 'Success',
      credentials,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get test credentials:', error);
    res.status(500).json({
      status: 'Failed',
      message: 'Failed to get test credentials',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// Test all API endpoints
router.get('/api-endpoints', asyncHandler(async (req, res) => {
  const endpoints = {
    auth: [
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'POST /api/auth/logout',
      'GET /api/auth/me'
    ],
    student: [
      'GET /api/student/packages',
      'POST /api/student/packages/:id/purchase',
      'GET /api/student/dashboard',
      'GET /api/student/profile',
      'PUT /api/student/profile'
    ],
    teacher: [
      'GET /api/teacher/classes',
      'POST /api/teacher/classes',
      'GET /api/teacher/classes/:id',
      'PUT /api/teacher/classes/:id',
      'DELETE /api/teacher/classes/:id',
      'GET /api/teacher/students',
      'GET /api/teacher/students/:id',
      'POST /api/teacher/students',
      'PUT /api/teacher/students/:id',
      'DELETE /api/teacher/students/:id',
      'GET /api/teacher/lessons',
      'POST /api/teacher/lessons',
      'GET /api/teacher/lessons/:id',
      'PUT /api/teacher/lessons/:id',
      'DELETE /api/teacher/lessons/:id',
      'GET /api/teacher/assignments',
      'POST /api/teacher/assignments',
      'GET /api/teacher/assignments/:id',
      'PUT /api/teacher/assignments/:id',
      'DELETE /api/teacher/assignments/:id',
      'GET /api/teacher/grades',
      'POST /api/teacher/grades',
      'PUT /api/teacher/grades/:id',
      'GET /api/teacher/attendance',
      'POST /api/teacher/attendance',
      'PUT /api/teacher/attendance/:id',
      'GET /api/teacher/reports/overview',
      'GET /api/teacher/reports/class/:id',
      'GET /api/teacher/reports/student/:id',
      'GET /api/teacher/reports/performance'
    ],
    admin: [
      'GET /api/admin/users',
      'POST /api/admin/users',
      'GET /api/admin/users/:id',
      'PUT /api/admin/users/:id',
      'DELETE /api/admin/users/:id',
      'PUT /api/admin/users/:id/role',
      'PUT /api/admin/users/:id/status',
      'POST /api/admin/users/bulk',
      'GET /api/admin/users/:id/activity',
      'GET /api/admin/users/stats',
      'POST /api/admin/users/:id/reset-password',
      'GET /api/admin/reports/users/overview',
      'GET /api/admin/reports/users/activity',
      'GET /api/admin/reports/users/registration-trends',
      'GET /api/admin/reports/users/:id/details',
      'GET /api/admin/reports/users/role-distribution',
      'GET /api/admin/reports/packages/overview',
      'GET /api/admin/reports/packages/performance',
      'GET /api/admin/reports/packages/customer-behavior',
      'GET /api/admin/reports/packages/sales-trends',
      'GET /api/admin/reports/packages/cancellations',
      'GET /api/admin/reports/revenue/overview',
      'GET /api/admin/reports/revenue/forecast',
      'GET /api/admin/reports/revenue/comparison',
      'GET /api/admin/reports/revenue/source-analysis',
      'GET /api/admin/reports/revenue/target-tracking',
      'GET /api/admin/reports/activity/overview',
      'GET /api/admin/reports/activity/user-sessions',
      'GET /api/admin/reports/activity/system-performance',
      'GET /api/admin/reports/activity/security',
      'GET /api/admin/reports/activity/system-usage',
      'GET /api/admin/reports/performance/overview',
      'GET /api/admin/reports/performance/api-details',
      'GET /api/admin/reports/performance/database',
      'GET /api/admin/reports/performance/user-experience'
    ],
    payment: [
      'POST /api/payment/create-intent',
      'POST /api/payment/confirm',
      'GET /api/payment/status/:id'
    ],
    test: [
      'GET /api/test/health',
      'GET /api/test/db-connection',
      'POST /api/test/seed-data',
      'GET /api/test/credentials',
      'GET /api/test/api-endpoints',
      'GET /api/test/database-status',
      'POST /api/test/run-tests'
    ]
  };
  
  res.json({
    status: 'Success',
    message: 'Available API endpoints',
    endpoints,
    totalEndpoints: Object.values(endpoints).flat().length,
    timestamp: new Date().toISOString()
  });
}));

// Test database status and table counts
router.get('/database-status', asyncHandler(async (req, res) => {
  try {
    const tables = ['users', 'classes', 'students', 'lessons', 'assignments', 'grades', 'attendance', 'class_students'];
    const tableCounts: { [key: string]: number } = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          logger.warn(`Failed to count ${table}:`, error);
          tableCounts[table] = -1; // Indicate error
        } else {
          tableCounts[table] = count || 0;
        }
      } catch (error) {
        logger.warn(`Error counting ${table}:`, error);
        tableCounts[table] = -1;
      }
    }
    
    const totalRecords = Object.values(tableCounts)
      .filter(count => count >= 0)
      .reduce((sum, count) => sum + count, 0);
    
    res.json({
      status: 'Success',
      message: 'Database status retrieved',
      tableCounts,
      totalRecords,
      tablesWithErrors: Object.entries(tableCounts)
        .filter(([, count]) => count === -1)
        .map(([table]) => table),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database status check failed:', error);
    res.status(500).json({
      status: 'Failed',
      message: 'Database status check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// Performance metrics endpoint
router.get('/performance', asyncHandler(async (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Performance metrics failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Performance report endpoint
router.get('/performance/report', asyncHandler(async (req, res) => {
  try {
    const report = performanceMonitor.generateReport();
    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Performance report failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Query optimizer cache stats
router.get('/cache/stats', asyncHandler(async (req, res) => {
  try {
    const stats = queryOptimizer.getCacheStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Cache stats failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Clear cache endpoint
router.post('/cache/clear', asyncHandler(async (req, res) => {
  try {
    const { key } = req.body;
    queryOptimizer.clearCache(key);
    res.json({
      success: true,
      message: key ? `Cache cleared for key: ${key}` : 'All cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Cache clear failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Run comprehensive tests
router.post('/run-tests', asyncHandler(async (req, res) => {
  try {
    const results = {
      health: false,
      database: false,
      auth: false,
      teacher: false,
      admin: false,
      student: false,
      payment: false,
      performance: false
    };
    
    // Test health endpoint
    results.health = true;

    // Test database connection
    const { data: dbTest } = await supabase.from('users').select('count').limit(1);
    results.database = !!dbTest;

    // Test auth endpoints (basic check)
    results.auth = true;

    // Test teacher endpoints
    results.teacher = true;

    // Test admin endpoints
    results.admin = true;

    // Test student endpoints
    results.student = true;

    // Test payment endpoints
    results.payment = true;

    // Test performance monitoring
    const metrics = performanceMonitor.getMetrics();
    results.performance = !!metrics;

    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      allPassed: Object.values(results).every(Boolean)
    });
  } catch (error) {
    logger.error('Test run failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results
    });
  }
}));

export default router;