/**
 * Express server for development
 * This file is used by nodemon for local development
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { performanceMonitor } from './utils/performanceMonitor';

// Load environment variables
dotenv.config();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Server restart - updated

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Performance monitoring middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    performanceMonitor.recordRequest({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
  });
  
  next();
});

// Import and use API routes
import loginHandler from './auth/login';
import registerHandler from './auth/register';
import logoutHandler from './auth/logout';
import meHandler from './auth/me';
import testRouter from './test/endpoints';
import { getStudentPackages } from './student/packages';
import { getStudentLessons } from './student/lessons';
// import { getAvailablePackages } from './packages/available'; // Module not found
// import { initializePayment, checkPaymentStatus, paymentCallback, paymentWebhook, checkInstallments, payInstallment } from './payment/payment'; // Module not found
import { mockInitializePayment, mockCheckPaymentStatus } from './payment/mock-initialize';
import { mockProcessPayment } from './payment/mock-process';
// import { getDashboardStats, getCategoryAnalytics } from './reports/analytics'; // Module not found
import teacherRouter from './teacher/index';
import adminRouter from './admin/index';
import { authenticateToken, requireAdmin } from './middleware/auth';

// Import additional handlers
import testHandler from './test';
import { 
  getPackageDetail, 
  purchasePackage,
  updateStudentPackage,
  cancelStudentPackage,
  getPackageCategories,
  addPackageReview
} from './student/packages';
import { getAllPackages, getPackageById } from './packages';
import { getDashboardStats, getMonthlyRevenueStats } from './reports/dashboard-stats';
import {
  getStudentPackageReport,
  getPackageSalesReport
} from './reports/package-reports';

// Convert Vercel handlers to Express routes
app.post('/api/auth/login', async (req, res) => {
  try {
    // Convert Express req/res to Vercel format
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await loginHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Login handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await registerHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Register handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await logoutHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Logout handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('Express headers:', req.headers);
    console.log('Authorization header:', req.headers.authorization);
    
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await meHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Me handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/test', async (req, res) => {
  try {
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await testHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Test handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student packages endpoints
app.get('/api/student/packages', authenticateToken, async (req, res) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  try {
    // Create a modified request object with studentId in params
    const modifiedReq = {
      ...req,
      params: { studentId: userId },
      user: (req as any).user
    };
    
    await getStudentPackages(modifiedReq as any, res as any);
  } catch (error) {
    console.error('Student packages handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/student/:studentId/packages', getStudentPackages);
app.get('/api/student/packages/:studentId', getStudentPackages); // Alternative endpoint format
app.get('/api/packages', getAllPackages);
app.get('/api/packages/:packageId', getPackageDetail);
app.post('/api/student/:studentId/packages/:packageId/purchase', purchasePackage);
app.put('/api/student/packages/:studentPackageId', updateStudentPackage);
app.delete('/api/student/packages/:studentPackageId', cancelStudentPackage);
app.get('/api/package-categories', getPackageCategories);
app.post('/api/packages/:packageId/reviews', addPackageReview);

// Student lessons endpoint
app.get('/api/student/lessons', authenticateToken, getStudentLessons);

// Package reporting endpoints
app.get('/api/reports/student/:studentId/packages', getStudentPackageReport);
app.get('/api/reports/package/:packageId/sales', getPackageSalesReport);
// Reports endpoints
app.get('/api/reports/dashboard/stats', getDashboardStats);
app.get('/api/reports/monthly-revenue', getMonthlyRevenueStats);
// app.get('/api/reports/categories/analytics', getCategoryAnalytics);

// Payment endpoints - commented out due to missing modules
// app.post('/api/payment/initialize', authenticateToken, initializePayment);
// app.get('/api/payment/:paymentId/status', authenticateToken, checkPaymentStatus);
// app.post('/api/payment/callback', paymentCallback);
// app.post('/api/payment/webhook', paymentWebhook);
// app.get('/api/payment/installments', authenticateToken, checkInstallments);
// app.post('/api/payment/installments/:installmentId/pay', authenticateToken, payInstallment);

// Mock payment endpoints for development
app.post('/api/payment/mock-initialize', authenticateToken, mockInitializePayment);
app.get('/api/payment/mock/:paymentId/status', authenticateToken, mockCheckPaymentStatus);
app.post('/api/payment/mock-process', authenticateToken, mockProcessPayment);

// Teacher module endpoints
app.use('/api/teacher', authenticateToken, teacherRouter);

// Admin module endpoints
app.use('/api/admin', authenticateToken, requireAdmin, adminRouter);

// Additional endpoints for teachers and students lists
app.get('/api/teachers', authenticateToken, async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: teachers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching teachers:', error);
      return res.status(500).json({ error: 'Failed to fetch teachers' });
    }
    
    // Filter only teacher role users
    const teacherUsers = teachers.users.filter(user => 
      user.user_metadata?.role === 'teacher'
    ).map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      role: user.user_metadata?.role,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));
    
    res.json({ teachers: teacherUsers });
  } catch (error) {
    console.error('Teachers endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student search teachers endpoint
app.get('/api/student/search-teachers', authenticateToken, async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get search query parameter
    const searchQuery = req.query.search as string || '';
    
    // Fetch teachers from database with their profiles
    const { data: teachers, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        is_active,
        created_at,
        profiles!inner(
          first_name,
          last_name,
          avatar_url
        ),
        teachers(
          bio,
          experience_years,
          hourly_rate,
          rating,
          education,
          is_verified,
          availability_status
        )
      `)
      .eq('role', 'teacher')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching teachers for student search:', error);
      return res.status(500).json({ error: 'Failed to fetch teachers' });
    }
    
    // Format teachers data for frontend
    const formattedTeachers = teachers?.map(teacher => ({
      id: teacher.id,
      email: teacher.email,
      user: {
        full_name: teacher.profiles ? `${teacher.profiles.first_name} ${teacher.profiles.last_name}` : teacher.email,
        avatar_url: teacher.profiles?.avatar_url
      },
      subjects: ['Genel'], // Default subject for now
      experience: teacher.teachers?.experience_years ? `${teacher.teachers.experience_years}+ yıl` : '1+ yıl',
      hourly_rate: teacher.teachers?.hourly_rate || 50,
      rating: teacher.teachers?.rating || 4.5,
      bio: teacher.teachers?.bio || 'Deneyimli öğretmen',
      qualifications: teacher.teachers?.education ? [teacher.teachers.education] : [],
      is_verified: teacher.teachers?.is_verified || false,
      availability_status: teacher.teachers?.availability_status || 'available',
      created_at: teacher.created_at
    })) || [];
    
    // Filter by search query if provided
    let filteredTeachers = formattedTeachers;
    if (searchQuery) {
      filteredTeachers = formattedTeachers.filter(teacher => 
        teacher.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    res.json({ teachers: filteredTeachers });
  } catch (error) {
    console.error('Student search teachers endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: students, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    
    // Filter only student role users
    const studentUsers = students.users.filter(user => 
      user.user_metadata?.role === 'student'
    ).map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      role: user.user_metadata?.role,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));
    
    res.json({ students: studentUsers });
  } catch (error) {
    console.error('Students endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoints
app.use('/api/test', testRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
  console.log(`✅ Authentication middleware updated`);
  console.log(`🔧 Student lessons endpoint configured`);
});

export default app;