/**
 * Consolidated Reports API handler for Vercel
 * Combines dashboard-stats and package-reports endpoints into a single serverless function
 */
import type { Request, Response } from 'express';
import { supabase } from './config/supabase';
import { authenticateToken } from './middleware/auth';

// Set CORS headers helper
const setCorsHeaders = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Dashboard stats handler
const handleDashboardStats = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole === 'admin') {
      // Admin dashboard stats
      const [usersResult, packagesResult, paymentsResult, lessonsResult] = await Promise.all([
        supabase.from('users').select('id, role, created_at'),
        supabase.from('packages').select('id, price, is_active'),
        supabase.from('payments').select('id, amount, status, created_at'),
        supabase.from('lessons').select('id, created_at')
      ]);

      const users = usersResult.data || [];
      const packages = packagesResult.data || [];
      const payments = paymentsResult.data || [];
      const lessons = lessonsResult.data || [];

      // Calculate stats
      const totalUsers = users.length;
      const totalTeachers = users.filter(u => u.role === 'teacher').length;
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalPackages = packages.length;
      const activePackages = packages.filter(p => p.is_active).length;
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalLessons = lessons.length;

      // Monthly stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyUsers = users.filter(u => {
        const createdDate = new Date(u.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;

      const monthlyRevenue = payments
        .filter(p => {
          const createdDate = new Date(p.created_at);
          return p.status === 'completed' && 
                 createdDate.getMonth() === currentMonth && 
                 createdDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const monthlyLessons = lessons.filter(l => {
        const createdDate = new Date(l.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;

      res.json({
        totalUsers,
        totalTeachers,
        totalStudents,
        totalPackages,
        activePackages,
        totalRevenue,
        totalLessons,
        monthlyStats: {
          users: monthlyUsers,
          revenue: monthlyRevenue,
          lessons: monthlyLessons
        }
      });
    } else if (userRole === 'teacher') {
      // Teacher dashboard stats
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!teacher) {
        return res.status(404).json({ error: 'Öğretmen bulunamadı' });
      }

      const [classesResult, studentsResult, lessonsResult] = await Promise.all([
        supabase.from('classes').select('id').eq('teacher_id', teacher.id),
        supabase.from('class_students').select('student_id').in('class_id', 
          (await supabase.from('classes').select('id').eq('teacher_id', teacher.id)).data?.map(c => c.id) || []
        ),
        supabase.from('lessons').select('id, created_at').eq('teacher_id', teacher.id)
      ]);

      const classes = classesResult.data || [];
      const students = studentsResult.data || [];
      const lessons = lessonsResult.data || [];

      // Monthly lessons
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyLessons = lessons.filter(l => {
        const createdDate = new Date(l.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;

      res.json({
        totalClasses: classes.length,
        totalStudents: students.length,
        totalLessons: lessons.length,
        monthlyLessons
      });
    } else if (userRole === 'student') {
      // Student dashboard stats
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!student) {
        return res.status(404).json({ error: 'Öğrenci bulunamadı' });
      }

      const [packagesResult, lessonsResult, gradesResult] = await Promise.all([
        supabase.from('student_packages').select('id, status').eq('student_id', student.id),
        supabase.from('lesson_students').select('lesson_id').eq('student_id', student.id),
        supabase.from('grades').select('id, grade').eq('student_id', student.id)
      ]);

      const packages = packagesResult.data || [];
      const lessons = lessonsResult.data || [];
      const grades = gradesResult.data || [];

      const activePackages = packages.filter(p => p.status === 'active').length;
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length 
        : 0;

      res.json({
        totalPackages: packages.length,
        activePackages,
        totalLessons: lessons.length,
        totalGrades: grades.length,
        averageGrade: Math.round(averageGrade * 100) / 100
      });
    } else {
      res.status(403).json({ error: 'Yetkisiz erişim' });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Package reports handler
const handlePackageReports = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
    }

    const { startDate, endDate, packageId, status } = req.query;

    let query = supabase
      .from('student_packages')
      .select(`
        id,
        purchase_date,
        status,
        payment_status,
        total_amount,
        activation_date,
        expiry_date,
        packages (id, name, subject, grade_level, price),
        students (id, user_id, users (full_name, email))
      `);

    // Apply filters
    if (startDate) {
      query = query.gte('purchase_date', startDate);
    }
    if (endDate) {
      query = query.lte('purchase_date', endDate);
    }
    if (packageId) {
      query = query.eq('package_id', packageId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: studentPackages, error } = await query.order('purchase_date', { ascending: false });

    if (error) {
      console.error('Package reports error:', error);
      return res.status(500).json({ error: 'Paket raporları alınamadı' });
    }

    // Calculate summary statistics
    const totalPackages = studentPackages?.length || 0;
    const activePackages = studentPackages?.filter(sp => sp.status === 'active').length || 0;
    const completedPayments = studentPackages?.filter(sp => sp.payment_status === 'completed').length || 0;
    const totalRevenue = studentPackages
      ?.filter(sp => sp.payment_status === 'completed')
      .reduce((sum, sp) => sum + (sp.total_amount || 0), 0) || 0;

    // Group by package
    const packageStats = studentPackages?.reduce((acc: any, sp: any) => {
      const packageName = sp.packages?.name || 'Bilinmeyen Paket';
      if (!acc[packageName]) {
        acc[packageName] = {
          name: packageName,
          totalSales: 0,
          revenue: 0,
          activeCount: 0
        };
      }
      acc[packageName].totalSales += 1;
      if (sp.payment_status === 'completed') {
        acc[packageName].revenue += sp.total_amount || 0;
      }
      if (sp.status === 'active') {
        acc[packageName].activeCount += 1;
      }
      return acc;
    }, {}) || {};

    // Group by month
    const monthlyStats = studentPackages?.reduce((acc: any, sp: any) => {
      const month = new Date(sp.purchase_date).toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = {
          month,
          sales: 0,
          revenue: 0
        };
      }
      acc[month].sales += 1;
      if (sp.payment_status === 'completed') {
        acc[month].revenue += sp.total_amount || 0;
      }
      return acc;
    }, {}) || {};

    res.json({
      summary: {
        totalPackages,
        activePackages,
        completedPayments,
        totalRevenue
      },
      packageStats: Object.values(packageStats),
      monthlyStats: Object.values(monthlyStats).sort((a: any, b: any) => b.month.localeCompare(a.month)),
      details: studentPackages
    });
  } catch (error) {
    console.error('Package reports error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Main handler function
export default async function handler(req: Request, res: Response) {
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authenticate user for all endpoints
  try {
    await authenticateToken(req, res, () => {});
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Route based on URL path
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    // Dashboard stats
    if (path.includes('/dashboard-stats') && req.method === 'GET') {
      await handleDashboardStats(req, res);
    }
    // Package reports
    else if (path.includes('/package-reports') && req.method === 'GET') {
      await handlePackageReports(req, res);
    } else {
      res.status(404).json({ error: 'Reports endpoint not found' });
    }
  } catch (error) {
    console.error('Reports handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}